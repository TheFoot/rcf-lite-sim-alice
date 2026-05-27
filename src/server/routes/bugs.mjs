/**
 * CRUD routes for bugs.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'bugs.json');

const VALID_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];
const VALID_PRIORITIES = ['critical', 'high', 'medium', 'low'];

async function loadAll() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveAll(records) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2) + '\n');
}

function validate(body, rules) {
  const errors = [];
  for (const [field, check] of Object.entries(rules)) {
    const value = body[field];
    if (check.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required.`);
    }
    if (check.type && value !== undefined && value !== null && typeof value !== check.type) {
      errors.push(`${field} must be a ${check.type}.`);
    }
    if (check.oneOf && value !== undefined && value !== null && value !== '' && !check.oneOf.includes(value)) {
      errors.push(`${field} must be one of: ${check.oneOf.join(', ')}.`);
    }
  }
  return errors;
}

async function listBugs(req, res) {
  let records = await loadAll();

  // Server-side filtering via query parameters
  if (req.query.status) {
    records = records.filter((r) => r.status === req.query.status);
  }
  if (req.query.priority) {
    records = records.filter((r) => r.priority === req.query.priority);
  }
  if (req.query.assignee) {
    records = records.filter((r) => r.assignee === req.query.assignee);
  }

  res.json(records);
}

async function getBug(req, res) {
  const records = await loadAll();
  const record = records.find((r) => r.id === req.params.id);
  if (!record) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bug not found.' } });
  }
  res.json(record);
}

async function createBug(req, res) {
  const body = req.body || {};
  const errors = validate(body, {
    title: { required: true, type: 'string' },
  });
  if (errors.length) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors[0] } });
  }

  // Validate enum values if provided
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}.` } });
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${VALID_STATUSES.join(', ')}.` } });
  }

  const record = {
    id: randomUUID(),
    title: body.title.trim(),
    description: (body.description || '').trim(),
    status: body.status || 'open',
    priority: body.priority || 'medium',
    assignee: (body.assignee || '').trim(),
    createdAt: new Date().toISOString(),
  };

  const records = await loadAll();
  records.push(record);
  await saveAll(records);
  res.status(201).json(record);
}

async function updateBug(req, res) {
  const records = await loadAll();
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bug not found.' } });
  }

  const body = req.body || {};
  const errors = validate(body, {
    title: { required: true, type: 'string' },
  });
  if (errors.length) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors[0] } });
  }

  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}.` } });
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${VALID_STATUSES.join(', ')}.` } });
  }

  const updated = {
    ...records[index],
    title: (body.title || records[index].title).trim(),
    description: body.description !== undefined ? body.description.trim() : records[index].description,
    status: body.status || records[index].status,
    priority: body.priority || records[index].priority,
    assignee: body.assignee !== undefined ? body.assignee.trim() : records[index].assignee,
  };
  records[index] = updated;
  await saveAll(records);
  res.json(updated);
}

async function deleteBug(req, res) {
  const records = await loadAll();
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bug not found.' } });
  }

  records.splice(index, 1);
  await saveAll(records);
  res.status(204).end();
}

// Valid status transitions
const TRANSITIONS = {
  'open': ['in-progress'],
  'in-progress': ['resolved'],
  'resolved': ['closed'],
  'closed': [],
};

async function transitionStatus(req, res) {
  const records = await loadAll();
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bug not found.' } });
  }

  const body = req.body || {};
  if (!body.status) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'status is required.' } });
  }

  const current = records[index].status;
  const allowed = TRANSITIONS[current] || [];
  if (!allowed.includes(body.status)) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: `Cannot transition from '${current}' to '${body.status}'. Allowed: ${allowed.join(', ') || 'none'}.`,
      },
    });
  }

  records[index].status = body.status;
  await saveAll(records);
  res.json(records[index]);
}

export function registerBugRoutes(router) {
  router.get('/bugs', listBugs);
  router.get('/bugs/:id', getBug);
  router.post('/bugs', createBug);
  router.put('/bugs/:id', updateBug);
  router.delete('/bugs/:id', deleteBug);
  router.patch('/bugs/:id/status', transitionStatus);
}
