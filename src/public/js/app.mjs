import { initRouter, registerRoute, navigate } from './router.mjs';
import { fetchBugs, fetchBug, createBug, updateBug, deleteBug } from './services/bugs-api.mjs';
import { createBugCard } from './components/bug-card.mjs';
import { createBugForm } from './components/bug-form.mjs';
import { createBugDetail } from './components/bug-detail.mjs';

// ---------------------------------------------------------------------------
// Route: Dashboard (/)
// ---------------------------------------------------------------------------

registerRoute('/', (container) => {
  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.textContent = 'Welcome to Bug Tracker';

  const description = document.createElement('p');
  description.className = 'text-muted';
  description.textContent = 'Track and manage software bugs with status workflows, priority levels, and assignment.';

  const nav = document.createElement('div');
  nav.style.marginTop = 'var(--space-lg)';
  const bugsLink = document.createElement('a');
  bugsLink.href = '/bugs';
  bugsLink.setAttribute('data-link', '');
  bugsLink.className = 'btn btn-primary';
  bugsLink.textContent = 'View All Bugs';
  nav.append(bugsLink);

  section.append(heading, description, nav);
  container.append(section);
});

// ---------------------------------------------------------------------------
// Route: Bugs list (/bugs)
// ---------------------------------------------------------------------------

registerRoute('/bugs', async (container) => {
  const section = document.createElement('section');
  section.className = 'card';
  container.append(section);

  const header = document.createElement('div');
  header.className = 'list-header';

  const heading = document.createElement('h2');
  heading.textContent = 'Bugs';

  const newBtn = document.createElement('a');
  newBtn.href = '/bugs/new';
  newBtn.setAttribute('data-link', '');
  newBtn.className = 'btn btn-primary';
  newBtn.textContent = '+ New Bug';

  header.append(heading, newBtn);
  section.append(header);

  try {
    const bugs = await fetchBugs();
    if (bugs.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-muted';
      empty.textContent = 'No bugs yet. Create your first bug to get started.';
      section.append(empty);
    } else {
      const grid = document.createElement('div');
      grid.className = 'bug-list';
      for (const bug of bugs) {
        const card = createBugCard(bug);
        card.addEventListener('click', () => navigate(`/bugs/${bug.id}`));
        grid.append(card);
      }
      section.append(grid);
    }
  } catch (err) {
    const errMsg = document.createElement('p');
    errMsg.style.color = 'var(--color-error)';
    errMsg.textContent = `Failed to load bugs: ${err.message}`;
    section.append(errMsg);
  }
});

// ---------------------------------------------------------------------------
// Route: New bug (/bugs/new)
// ---------------------------------------------------------------------------

registerRoute('/bugs/new', (container) => {
  const section = document.createElement('section');
  section.className = 'card';

  // Breadcrumb
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'breadcrumb';
  const bugsLink = document.createElement('a');
  bugsLink.href = '/bugs';
  bugsLink.setAttribute('data-link', '');
  bugsLink.textContent = 'Bugs';
  const sep = document.createElement('span');
  sep.className = 'breadcrumb__separator';
  sep.textContent = ' / ';
  const curr = document.createElement('span');
  curr.className = 'breadcrumb__current';
  curr.textContent = 'New Bug';
  breadcrumb.append(bugsLink, sep, curr);

  const heading = document.createElement('h2');
  heading.textContent = 'Create New Bug';

  const form = createBugForm({
    onSubmit: async (data) => {
      try {
        await createBug(data);
        navigate('/bugs');
      } catch (err) {
        alert(`Failed to create bug: ${err.message}`);
      }
    },
  });

  section.append(breadcrumb, heading, form);
  container.append(section);
});

// ---------------------------------------------------------------------------
// Route: Bug detail (/bugs/:id)
// ---------------------------------------------------------------------------

registerRoute('/bugs/:id', async (container, params) => {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = '<p class="text-muted">Loading bug...</p>';
  container.append(section);

  try {
    const bug = await fetchBug(params.id);
    section.innerHTML = '';

    const detail = createBugDetail({
      item: bug,
      onEdit: () => navigate(`/bugs/${bug.id}/edit`),
      onDelete: async () => {
        try {
          await deleteBug(bug.id);
          navigate('/bugs');
        } catch (err) {
          alert(`Failed to delete: ${err.message}`);
        }
      },
    });
    section.append(detail);
  } catch (err) {
    section.innerHTML = `<p style="color: var(--color-error);">Bug not found: ${err.message}</p>`;
  }
});

// ---------------------------------------------------------------------------
// Route: Edit bug (/bugs/:id/edit)
// ---------------------------------------------------------------------------

registerRoute('/bugs/:id/edit', async (container, params) => {
  const section = document.createElement('section');
  section.className = 'card';
  section.innerHTML = '<p class="text-muted">Loading...</p>';
  container.append(section);

  try {
    const bug = await fetchBug(params.id);
    section.innerHTML = '';

    // Breadcrumb
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    const bugsLink = document.createElement('a');
    bugsLink.href = '/bugs';
    bugsLink.setAttribute('data-link', '');
    bugsLink.textContent = 'Bugs';
    const sep1 = document.createElement('span');
    sep1.className = 'breadcrumb__separator';
    sep1.textContent = ' / ';
    const bugLink = document.createElement('a');
    bugLink.href = `/bugs/${bug.id}`;
    bugLink.setAttribute('data-link', '');
    bugLink.textContent = bug.title;
    const sep2 = document.createElement('span');
    sep2.className = 'breadcrumb__separator';
    sep2.textContent = ' / ';
    const curr = document.createElement('span');
    curr.className = 'breadcrumb__current';
    curr.textContent = 'Edit';
    breadcrumb.append(bugsLink, sep1, bugLink, sep2, curr);

    const heading = document.createElement('h2');
    heading.textContent = 'Edit Bug';

    const form = createBugForm({
      item: bug,
      onSubmit: async (data) => {
        try {
          await updateBug(bug.id, data);
          navigate(`/bugs/${bug.id}`);
        } catch (err) {
          alert(`Failed to update: ${err.message}`);
        }
      },
    });

    section.append(breadcrumb, heading, form);
  } catch (err) {
    section.innerHTML = `<p style="color: var(--color-error);">Bug not found: ${err.message}</p>`;
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  initRouter(appContainer);
});
