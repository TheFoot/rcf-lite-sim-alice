/**
 * Dashboard aggregation route.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), 'data');

async function loadBugs() {
  try {
    const raw = await readFile(join(DATA_DIR, 'bugs.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function getDashboard(req, res) {
  const bugs = await loadBugs();

  const byStatus = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  const byPriority = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const bug of bugs) {
    // Status counts
    if (bug.status === 'open') byStatus.open++;
    else if (bug.status === 'in-progress') byStatus.inProgress++;
    else if (bug.status === 'resolved') byStatus.resolved++;
    else if (bug.status === 'closed') byStatus.closed++;

    // Priority counts
    if (bug.priority === 'critical') byPriority.critical++;
    else if (bug.priority === 'high') byPriority.high++;
    else if (bug.priority === 'medium') byPriority.medium++;
    else if (bug.priority === 'low') byPriority.low++;
  }

  // Recent bugs -- sort by createdAt descending, take 5
  const recentBugs = [...bugs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((bug) => ({
      id: bug.id,
      title: bug.title,
      status: bug.status,
      priority: bug.priority,
      createdAt: bug.createdAt,
    }));

  res.json({
    total: bugs.length,
    byStatus,
    byPriority,
    recentBugs,
  });
}

export function registerDashboardRoutes(router) {
  router.get('/dashboard', getDashboard);
}
