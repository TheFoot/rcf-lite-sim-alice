/**
 * Filter controls component for the bugs list.
 */

const STATUSES = ['all', 'open', 'in-progress', 'resolved', 'closed'];
const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'];

export function createBugFilters({ assignees = [], onFilterChange } = {}) {
  const container = document.createElement('div');
  container.className = 'bug-filters';

  // Status dropdown
  const statusGroup = document.createElement('div');
  statusGroup.className = 'filter-group';
  const statusLabel = document.createElement('label');
  statusLabel.textContent = 'Status';
  statusLabel.setAttribute('for', 'filter-status');
  const statusSelect = document.createElement('select');
  statusSelect.id = 'filter-status';
  statusSelect.name = 'status';
  for (const s of STATUSES) {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s === 'all' ? 'All Statuses' : s;
    statusSelect.append(opt);
  }
  statusGroup.append(statusLabel, statusSelect);

  // Priority dropdown
  const priorityGroup = document.createElement('div');
  priorityGroup.className = 'filter-group';
  const priorityLabel = document.createElement('label');
  priorityLabel.textContent = 'Priority';
  priorityLabel.setAttribute('for', 'filter-priority');
  const prioritySelect = document.createElement('select');
  prioritySelect.id = 'filter-priority';
  prioritySelect.name = 'priority';
  for (const p of PRIORITIES) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1);
    prioritySelect.append(opt);
  }
  priorityGroup.append(priorityLabel, prioritySelect);

  // Assignee dropdown (dynamic)
  const assigneeGroup = document.createElement('div');
  assigneeGroup.className = 'filter-group';
  const assigneeLabel = document.createElement('label');
  assigneeLabel.textContent = 'Assignee';
  assigneeLabel.setAttribute('for', 'filter-assignee');
  const assigneeSelect = document.createElement('select');
  assigneeSelect.id = 'filter-assignee';
  assigneeSelect.name = 'assignee';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All Assignees';
  assigneeSelect.append(allOpt);
  for (const a of assignees) {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    assigneeSelect.append(opt);
  }
  assigneeGroup.append(assigneeLabel, assigneeSelect);

  // Clear Filters button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn btn-secondary';
  clearBtn.textContent = 'Clear Filters';
  clearBtn.type = 'button';
  clearBtn.addEventListener('click', () => {
    statusSelect.value = 'all';
    prioritySelect.value = 'all';
    assigneeSelect.value = 'all';
    emitChange();
  });

  function emitChange() {
    if (onFilterChange) {
      onFilterChange({
        status: statusSelect.value === 'all' ? null : statusSelect.value,
        priority: prioritySelect.value === 'all' ? null : prioritySelect.value,
        assignee: assigneeSelect.value === 'all' ? null : assigneeSelect.value,
      });
    }
  }

  statusSelect.addEventListener('change', emitChange);
  prioritySelect.addEventListener('change', emitChange);
  assigneeSelect.addEventListener('change', emitChange);

  container.append(statusGroup, priorityGroup, assigneeGroup, clearBtn);
  return container;
}
