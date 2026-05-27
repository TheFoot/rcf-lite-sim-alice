/**
 * Detail component for a single bug.
 */

const TRANSITION_MAP = {
  'open': { next: 'in-progress', label: 'Start Work', className: 'btn btn-warning' },
  'in-progress': { next: 'resolved', label: 'Resolve', className: 'btn btn-success' },
  'resolved': { next: 'closed', label: 'Close', className: 'btn btn-secondary' },
};

export function createBugDetail({ item, onEdit, onDelete, onStatusChange } = {}) {
  const container = document.createElement('section');
  container.className = 'bug-detail';

  // Breadcrumb navigation
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  const bugsLink = document.createElement('a');
  bugsLink.href = '/bugs';
  bugsLink.setAttribute('data-link', '');
  bugsLink.textContent = 'Bugs';
  const separator = document.createElement('span');
  separator.className = 'breadcrumb__separator';
  separator.textContent = ' / ';
  const current = document.createElement('span');
  current.className = 'breadcrumb__current';
  current.textContent = item.title;
  breadcrumb.append(bugsLink, separator, current);

  const heading = document.createElement('h2');
  heading.textContent = item.title;

  // Status and priority badges
  const badgeRow = document.createElement('div');
  badgeRow.className = 'bug-detail__badges';
  const statusBadge = document.createElement('span');
  statusBadge.className = `badge badge--${item.status}`;
  statusBadge.textContent = item.status;
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge badge--priority-${item.priority}`;
  priorityBadge.textContent = item.priority;
  badgeRow.append(statusBadge, priorityBadge);

  // Status transition button
  const transitionRow = document.createElement('div');
  transitionRow.className = 'bug-detail__workflow';
  const transition = TRANSITION_MAP[item.status];
  if (transition) {
    const transitionBtn = document.createElement('button');
    transitionBtn.className = transition.className;
    transitionBtn.textContent = transition.label;
    transitionBtn.addEventListener('click', () => {
      if (onStatusChange) onStatusChange(transition.next);
    });
    transitionRow.append(transitionBtn);
  } else {
    const closedMsg = document.createElement('span');
    closedMsg.className = 'text-muted';
    closedMsg.textContent = 'This bug is closed.';
    transitionRow.append(closedMsg);
  }

  // Description
  const descRow = document.createElement('div');
  descRow.className = 'bug-detail__row';
  const descLabel = document.createElement('strong');
  descLabel.textContent = 'Description: ';
  const descValue = document.createElement('span');
  descValue.textContent = item.description || 'No description provided.';
  descRow.append(descLabel, descValue);

  // Assignee
  const assigneeRow = document.createElement('div');
  assigneeRow.className = 'bug-detail__row';
  const assigneeLabel = document.createElement('strong');
  assigneeLabel.textContent = 'Assignee: ';
  const assigneeValue = document.createElement('span');
  assigneeValue.textContent = item.assignee || 'Unassigned';
  assigneeRow.append(assigneeLabel, assigneeValue);

  // Created at
  const createdRow = document.createElement('div');
  createdRow.className = 'bug-detail__row';
  const createdLabel = document.createElement('strong');
  createdLabel.textContent = 'Created: ';
  const createdValue = document.createElement('span');
  createdValue.textContent = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown';
  createdRow.append(createdLabel, createdValue);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'bug-detail__actions';

  const editButton = document.createElement('button');
  editButton.className = 'btn btn-primary';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => { if (onEdit) onEdit(item); });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this bug?')) {
      if (onDelete) onDelete(item);
    }
  });

  actions.append(editButton, deleteButton);

  container.append(breadcrumb, heading, badgeRow, transitionRow, descRow, assigneeRow, createdRow, actions);
  return container;
}
