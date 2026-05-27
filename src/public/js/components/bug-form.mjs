/**
 * Form component for creating/editing bugs.
 */

const PRIORITIES = ['critical', 'high', 'medium', 'low'];

export function createBugForm({ item, onSubmit, onCancel } = {}) {
  const form = document.createElement('form');
  form.className = 'bug-form';

  // Title
  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Title';
  titleLabel.setAttribute('for', 'title');
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = 'title';
  titleInput.id = 'title';
  titleInput.required = true;
  titleInput.placeholder = 'Brief bug summary';
  if (item && item.title) titleInput.value = item.title;
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';
  titleGroup.append(titleLabel, titleInput);

  // Description
  const descLabel = document.createElement('label');
  descLabel.textContent = 'Description';
  descLabel.setAttribute('for', 'description');
  const descInput = document.createElement('textarea');
  descInput.name = 'description';
  descInput.id = 'description';
  descInput.rows = 4;
  descInput.placeholder = 'Detailed description of the bug';
  if (item && item.description) descInput.value = item.description;
  const descGroup = document.createElement('div');
  descGroup.className = 'form-group';
  descGroup.append(descLabel, descInput);

  // Priority
  const priorityLabel = document.createElement('label');
  priorityLabel.textContent = 'Priority';
  priorityLabel.setAttribute('for', 'priority');
  const prioritySelect = document.createElement('select');
  prioritySelect.name = 'priority';
  prioritySelect.id = 'priority';
  for (const p of PRIORITIES) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p.charAt(0).toUpperCase() + p.slice(1);
    prioritySelect.append(opt);
  }
  if (item && item.priority) {
    prioritySelect.value = item.priority;
  } else {
    prioritySelect.value = 'medium';
  }
  const priorityGroup = document.createElement('div');
  priorityGroup.className = 'form-group';
  priorityGroup.append(priorityLabel, prioritySelect);

  // Assignee
  const assigneeLabel = document.createElement('label');
  assigneeLabel.textContent = 'Assignee';
  assigneeLabel.setAttribute('for', 'assignee');
  const assigneeInput = document.createElement('input');
  assigneeInput.type = 'text';
  assigneeInput.name = 'assignee';
  assigneeInput.id = 'assignee';
  assigneeInput.placeholder = 'Team member name';
  if (item && item.assignee) assigneeInput.value = item.assignee;
  const assigneeGroup = document.createElement('div');
  assigneeGroup.className = 'form-group';
  assigneeGroup.append(assigneeLabel, assigneeInput);

  // Buttons
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'button-group';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  submitButton.textContent = item ? 'Update Bug' : 'Create Bug';

  const cancelButton = document.createElement('a');
  cancelButton.className = 'btn btn-secondary';
  cancelButton.textContent = 'Cancel';
  cancelButton.href = item ? `/bugs/${item.id}` : '/bugs';
  cancelButton.setAttribute('data-link', '');

  buttonGroup.append(submitButton, cancelButton);

  form.append(titleGroup, descGroup, priorityGroup, assigneeGroup, buttonGroup);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      priority: prioritySelect.value,
      assignee: assigneeInput.value.trim(),
    };
    if (!data.title) {
      alert('Title is required.');
      return;
    }
    if (onSubmit) onSubmit(data);
  });

  return form;
}
