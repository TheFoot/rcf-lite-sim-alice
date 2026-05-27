/**
 * Card component for displaying a bug in list view.
 */

export function createBugCard(item) {
  const card = document.createElement('article');
  card.className = 'bug-card';
  card.dataset.id = item.id;
  card.style.cursor = 'pointer';

  const header = document.createElement('div');
  header.className = 'bug-card__header';

  const title = document.createElement('h3');
  title.className = 'bug-card__title';
  title.textContent = item.title;

  const badges = document.createElement('div');
  badges.className = 'bug-card__badges';

  const statusBadge = document.createElement('span');
  statusBadge.className = `badge badge--${item.status}`;
  statusBadge.textContent = item.status;

  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge badge--priority-${item.priority}`;
  priorityBadge.textContent = item.priority;

  badges.append(statusBadge, priorityBadge);
  header.append(title, badges);

  const meta = document.createElement('div');
  meta.className = 'bug-card__meta';

  if (item.assignee) {
    const assignee = document.createElement('span');
    assignee.className = 'text-muted';
    assignee.textContent = `Assigned: ${item.assignee}`;
    meta.append(assignee);
  }

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'bug-card__description text-muted';
    desc.textContent = item.description.length > 100
      ? item.description.slice(0, 100) + '...'
      : item.description;
    meta.append(desc);
  }

  card.append(header, meta);
  return card;
}
