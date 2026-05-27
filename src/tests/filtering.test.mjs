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

async function createTestBug(overrides = {}) {
  const res = await fetch(`${baseUrl}/api/v1/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test bug', priority: 'medium', ...overrides }),
  });
  return res.json();
}

describe('Filtering', () => {
  // TC-004-01: filter by status
  it('should return only open bugs when filtered by status (TC-004-01)', async () => {
    await createTestBug({ title: 'Open bug', status: 'open' });
    await createTestBug({ title: 'Closed bug', status: 'closed' });
    await createTestBug({ title: 'Another open', status: 'open' });

    const res = await fetch(`${baseUrl}/api/v1/bugs?status=open`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.length, 2);
    for (const bug of body) {
      assert.equal(bug.status, 'open');
    }
  });

  // TC-004-02: filter by priority
  it('should return only critical bugs when filtered by priority (TC-004-02)', async () => {
    await createTestBug({ title: 'Critical bug', priority: 'critical' });
    await createTestBug({ title: 'Low bug', priority: 'low' });
    await createTestBug({ title: 'Another critical', priority: 'critical' });

    const res = await fetch(`${baseUrl}/api/v1/bugs?priority=critical`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.length, 2);
    for (const bug of body) {
      assert.equal(bug.priority, 'critical');
    }
  });

  // TC-004-03: no filters returns all
  it('should return all bugs with no filters (TC-004-03)', async () => {
    await createTestBug({ title: 'Bug 1', status: 'open', priority: 'low' });
    await createTestBug({ title: 'Bug 2', status: 'closed', priority: 'high' });

    const res = await fetch(`${baseUrl}/api/v1/bugs`);
    const body = await res.json();
    assert.equal(body.length, 2);
  });

  // TC-004-04: combined filters
  it('should return bugs matching both status and priority filters (TC-004-04)', async () => {
    await createTestBug({ title: 'Open high', status: 'open', priority: 'high' });
    await createTestBug({ title: 'Open low', status: 'open', priority: 'low' });
    await createTestBug({ title: 'Closed high', status: 'closed', priority: 'high' });

    const res = await fetch(`${baseUrl}/api/v1/bugs?status=open&priority=high`);
    const body = await res.json();
    assert.equal(body.length, 1);
    assert.equal(body[0].title, 'Open high');
  });

  // TC-004-05: HTML page loads
  it('should serve the bugs list page (TC-004-05)', async () => {
    const res = await fetch(`${baseUrl}/bugs`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Bug Tracker'));
  });
});
