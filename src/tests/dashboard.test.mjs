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

describe('Dashboard API', () => {
  // TC-003-01: returns total and status breakdown
  it('should return total count and status breakdown (TC-003-01)', async () => {
    await createTestBug({ title: 'Bug A', status: 'open' });
    await createTestBug({ title: 'Bug B', status: 'open' });
    await createTestBug({ title: 'Bug C', status: 'in-progress' });

    const res = await fetch(`${baseUrl}/api/v1/dashboard`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total, 3);
    assert.equal(body.byStatus.open, 2);
    assert.equal(body.byStatus.inProgress, 1);
    assert.equal(body.byStatus.resolved, 0);
    assert.equal(body.byStatus.closed, 0);
  });

  // TC-003-02: returns priority breakdown
  it('should return priority breakdown (TC-003-02)', async () => {
    await createTestBug({ title: 'Critical bug', priority: 'critical' });
    await createTestBug({ title: 'Low bug', priority: 'low' });
    await createTestBug({ title: 'Low bug 2', priority: 'low' });

    const res = await fetch(`${baseUrl}/api/v1/dashboard`);
    const body = await res.json();
    assert.equal(body.byPriority.critical, 1);
    assert.equal(body.byPriority.low, 2);
    assert.equal(body.byPriority.high, 0);
    assert.equal(body.byPriority.medium, 0);
  });

  // TC-003-03: returns at most 5 recent bugs
  it('should return at most 5 recent bugs (TC-003-03)', async () => {
    for (let i = 0; i < 8; i++) {
      await createTestBug({ title: `Bug ${i}` });
    }

    const res = await fetch(`${baseUrl}/api/v1/dashboard`);
    const body = await res.json();
    assert.equal(body.recentBugs.length, 5);
    assert.ok(body.recentBugs[0].id);
    assert.ok(body.recentBugs[0].title);
  });

  // TC-003-04: empty dataset
  it('should return correct counts for empty dataset (TC-003-04)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/dashboard`);
    const body = await res.json();
    assert.equal(body.total, 0);
    assert.equal(body.byStatus.open, 0);
    assert.equal(body.byPriority.critical, 0);
    assert.equal(body.recentBugs.length, 0);
  });

  // TC-003-05: Dashboard HTML includes status section
  it('should serve the app HTML for dashboard route (TC-003-05)', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Bug Tracker'));
    assert.ok(html.includes('id="app"'));
  });
});
