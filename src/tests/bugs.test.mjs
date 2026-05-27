import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../server/index.mjs';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

let server;
let baseUrl;
const dataDir = join(process.cwd(), 'data');

before(async () => {
  // Ensure clean data directory
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, 'bugs.json'), '[]');
  server = await startServer({ port: 0 });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  // Reset data before each test
  writeFileSync(join(dataDir, 'bugs.json'), '[]');
});

describe('Bugs API', () => {
  // TC-001-01: POST creates a bug with valid data
  it('should create a bug with valid data (TC-001-01)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Login button broken', description: 'Cannot click login', priority: 'high', assignee: 'Alice' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.title, 'Login button broken');
    assert.equal(body.status, 'open');
    assert.equal(body.priority, 'high');
    assert.ok(body.id);
    assert.ok(body.createdAt);
  });

  // TC-001-02: POST returns 400 when title is missing
  it('should return 400 when title is missing (TC-001-02)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'No title provided' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  // TC-001-03: GET returns array of all bugs
  it('should return an array of all bugs (TC-001-03)', async () => {
    // Create two bugs
    await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bug one', priority: 'low' }),
    });
    await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bug two', priority: 'high' }),
    });

    const res = await fetch(`${baseUrl}/api/v1/bugs`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(Array.isArray(body), true);
    assert.equal(body.length, 2);
  });

  // TC-001-04: GET by ID returns single bug
  it('should return a single bug by ID (TC-001-04)', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Specific bug', priority: 'medium' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${baseUrl}/api/v1/bugs/${created.id}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, created.id);
    assert.equal(body.title, 'Specific bug');
  });

  // TC-001-05: GET by ID returns 404 for non-existent bug
  it('should return 404 for non-existent bug (TC-001-05)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bugs/non-existent-id`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  // TC-001-06: PUT updates an existing bug
  it('should update an existing bug (TC-001-06)', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Original title', priority: 'low' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${baseUrl}/api/v1/bugs/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated title', priority: 'high', description: 'Now with details' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.title, 'Updated title');
    assert.equal(body.priority, 'high');
    assert.equal(body.description, 'Now with details');
  });

  // TC-001-07: DELETE removes a bug
  it('should delete a bug and return 204 (TC-001-07)', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'To be deleted', priority: 'low' }),
    });
    const created = await createRes.json();

    const res = await fetch(`${baseUrl}/api/v1/bugs/${created.id}`, { method: 'DELETE' });
    assert.equal(res.status, 204);

    // Verify it's gone
    const getRes = await fetch(`${baseUrl}/api/v1/bugs/${created.id}`);
    assert.equal(getRes.status, 404);
  });

  // TC-001-08: DELETE returns 404 for non-existent bug
  it('should return 404 when deleting non-existent bug (TC-001-08)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bugs/non-existent-id`, { method: 'DELETE' });
    assert.equal(res.status, 404);
  });
});
