import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../server/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

let server;
let baseUrl;
const dataDir = join(process.cwd(), 'data');

before(async () => {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, 'bugs.json'), '[]');
  server = await startServer({ port: 0 });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  writeFileSync(join(dataDir, 'bugs.json'), '[]');
});

async function createTestBug(status = 'open') {
  const res = await fetch(`${baseUrl}/api/v1/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test bug', priority: 'high', status }),
  });
  return res.json();
}

describe('Status Workflow', () => {
  // TC-002-01: open -> in-progress
  it('should transition from open to in-progress (TC-002-01)', async () => {
    const bug = await createTestBug('open');
    const res = await fetch(`${baseUrl}/api/v1/bugs/${bug.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'in-progress');
  });

  // TC-002-02: invalid transition open -> resolved
  it('should reject invalid transition from open to resolved (TC-002-02)', async () => {
    const bug = await createTestBug('open');
    const res = await fetch(`${baseUrl}/api/v1/bugs/${bug.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  // TC-002-03: in-progress -> resolved
  it('should transition from in-progress to resolved (TC-002-03)', async () => {
    const bug = await createTestBug('in-progress');
    const res = await fetch(`${baseUrl}/api/v1/bugs/${bug.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'resolved');
  });

  // TC-002-04: resolved -> closed
  it('should transition from resolved to closed (TC-002-04)', async () => {
    const bug = await createTestBug('resolved');
    const res = await fetch(`${baseUrl}/api/v1/bugs/${bug.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'closed');
  });

  // TC-002-05: 404 for non-existent bug
  it('should return 404 for non-existent bug (TC-002-05)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bugs/fake-id/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in-progress' }),
    });
    assert.equal(res.status, 404);
  });

  // TC-002-06: missing status field
  it('should return 400 when status field is missing (TC-002-06)', async () => {
    const bug = await createTestBug('open');
    const res = await fetch(`${baseUrl}/api/v1/bugs/${bug.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });
});
