/**
 * Dashboard view component showing bug summary statistics.
 */

export function createDashboardView(data, { onBugClick } = {}) {
  const container = document.createElement('div');
  container.className = 'dashboard';

  // Hero section
  const hero = document.createElement('section');
  hero.className = 'card dashboard__hero';
  const heroTitle = document.createElement('h2');
  heroTitle.textContent = 'Bug Tracker Dashboard';
  const heroDesc = document.createElement('p');
  heroDesc.className = 'text-muted';
  heroDesc.textContent = `Tracking ${data.total} bug${data.total !== 1 ? 's' : ''} across your project.`;
  hero.append(heroTitle, heroDesc);

  // Stats grid
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid--2 dashboard__stats';

  // Status breakdown card
  const statusCard = document.createElement('section');
  statusCard.className = 'card';
  const statusTitle = document.createElement('h3');
  statusTitle.textContent = 'By Status';
  statusTitle.style.marginBottom = 'var(--space-md)';
  statusCard.append(statusTitle);

  const statusItems = [
    { label: 'Open', value: data.byStatus.open, cls: 'badge--open' },
    { label: 'In Progress', value: data.byStatus.inProgress, cls: 'badge--in-progress' },
    { label: 'Resolved', value: data.byStatus.resolved, cls: 'badge--resolved' },
    { label: 'Closed', value: data.byStatus.closed, cls: 'badge--closed' },
  ];

  for (const s of statusItems) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    const badge = document.createElement('span');
    badge.className = `badge ${s.cls}`;
    badge.textContent = s.label;
    const count = document.createElement('span');
    count.className = 'stat-row__count';
    count.textContent = s.value;
    row.append(badge, count);
    statusCard.append(row);
  }

  // Priority breakdown card
  const priorityCard = document.createElement('section');
  priorityCard.className = 'card';
  const priorityTitle = document.createElement('h3');
  priorityTitle.textContent = 'By Priority';
  priorityTitle.style.marginBottom = 'var(--space-md)';
  priorityCard.append(priorityTitle);

  const priorityItems = [
    { label: 'Critical', value: data.byPriority.critical, cls: 'badge--priority-critical' },
    { label: 'High', value: data.byPriority.high, cls: 'badge--priority-high' },
    { label: 'Medium', value: data.byPriority.medium, cls: 'badge--priority-medium' },
    { label: 'Low', value: data.byPriority.low, cls: 'badge--priority-low' },
  ];

  for (const p of priorityItems) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    const badge = document.createElement('span');
    badge.className = `badge ${p.cls}`;
    badge.textContent = p.label;
    const count = document.createElement('span');
    count.className = 'stat-row__count';
    count.textContent = p.value;
    row.append(badge, count);
    priorityCard.append(row);
  }

  statsGrid.append(statusCard, priorityCard);

  // Recent bugs section
  const recentCard = document.createElement('section');
  recentCard.className = 'card';
  const recentTitle = document.createElement('h3');
  recentTitle.textContent = 'Recent Bugs';
  recentTitle.style.marginBottom = 'var(--space-md)';
  recentCard.append(recentTitle);

  if (data.recentBugs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-muted';
    empty.textContent = 'No bugs yet. Create your first bug to get started.';
    recentCard.append(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'recent-bugs-list';
    for (const bug of data.recentBugs) {
      const row = document.createElement('div');
      row.className = 'recent-bug-item';
      row.style.cursor = 'pointer';

      const link = document.createElement('a');
      link.href = `/bugs/${bug.id}`;
      link.setAttribute('data-link', '');
      link.className = 'recent-bug-item__title';
      link.textContent = bug.title;

      const badges = document.createElement('div');
      badges.className = 'recent-bug-item__badges';
      const statusBadge = document.createElement('span');
      statusBadge.className = `badge badge--${bug.status}`;
      statusBadge.textContent = bug.status;
      const priorityBadge = document.createElement('span');
      priorityBadge.className = `badge badge--priority-${bug.priority}`;
      priorityBadge.textContent = bug.priority;
      badges.append(statusBadge, priorityBadge);

      row.append(link, badges);
      row.addEventListener('click', () => {
        if (onBugClick) onBugClick(bug.id);
      });
      list.append(row);
    }
    recentCard.append(list);
  }

  // Quick nav
  const navCard = document.createElement('div');
  navCard.style.marginTop = 'var(--space-lg)';
  const viewAllBtn = document.createElement('a');
  viewAllBtn.href = '/bugs';
  viewAllBtn.setAttribute('data-link', '');
  viewAllBtn.className = 'btn btn-primary';
  viewAllBtn.textContent = 'View All Bugs';
  const newBugBtn = document.createElement('a');
  newBugBtn.href = '/bugs/new';
  newBugBtn.setAttribute('data-link', '');
  newBugBtn.className = 'btn btn-secondary';
  newBugBtn.textContent = '+ New Bug';
  newBugBtn.style.marginLeft = 'var(--space-md)';
  navCard.append(viewAllBtn, newBugBtn);

  container.append(hero, statsGrid, recentCard, navCard);
  return container;
}
