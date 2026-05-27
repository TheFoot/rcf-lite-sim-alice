import { initRouter, registerRoute, navigate } from './router.mjs';
import { fetchBugs, fetchBug, createBug, updateBug, deleteBug, transitionBugStatus } from './services/bugs-api.mjs';
import { createBugCard } from './components/bug-card.mjs';
import { createBugForm } from './components/bug-form.mjs';
import { createBugDetail } from './components/bug-detail.mjs';
import { createDashboardView } from './components/dashboard-view.mjs';
import { createBugFilters } from './components/bug-filters.mjs';

// ---------------------------------------------------------------------------
// Route: Dashboard (/)
// ---------------------------------------------------------------------------

registerRoute('/', async (container) => {
  const loading = document.createElement('section');
  loading.className = 'card';
  loading.innerHTML = '<h2>Dashboard</h2><p class="text-muted">Loading dashboard data...</p>';
  container.append(loading);

  try {
    const res = await fetch('/api/v1/dashboard');
    if (!res.ok) throw new Error(`Dashboard API error: ${res.status}`);
    const data = await res.json();

    container.innerHTML = '';
    const dashboardView = createDashboardView(data, {
      onBugClick: (id) => navigate(`/bugs/${id}`),
    });
    container.append(dashboardView);
  } catch (err) {
    container.innerHTML = `<section class="card"><h2>Dashboard</h2><p style="color: var(--color-error);">Failed to load: ${err.message}</p></section>`;
  }
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

  // Bug list container (will be re-rendered on filter change)
  const listContainer = document.createElement('div');
  listContainer.className = 'bug-list';
  let allBugs = [];

  function renderBugList(bugs) {
    listContainer.innerHTML = '';
    if (bugs.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-muted';
      empty.textContent = 'No bugs match the current filters.';
      listContainer.append(empty);
    } else {
      for (const bug of bugs) {
        const card = createBugCard(bug);
        card.addEventListener('click', () => navigate(`/bugs/${bug.id}`));
        listContainer.append(card);
      }
    }
  }

  try {
    allBugs = await fetchBugs();

    // Extract unique assignees for the filter dropdown
    const assignees = [...new Set(allBugs.map((b) => b.assignee).filter(Boolean))].sort();

    const filters = createBugFilters({
      assignees,
      onFilterChange: (filterState) => {
        let filtered = allBugs;
        if (filterState.status) {
          filtered = filtered.filter((b) => b.status === filterState.status);
        }
        if (filterState.priority) {
          filtered = filtered.filter((b) => b.priority === filterState.priority);
        }
        if (filterState.assignee) {
          filtered = filtered.filter((b) => b.assignee === filterState.assignee);
        }
        renderBugList(filtered);
      },
    });
    section.append(filters);

    renderBugList(allBugs);
    section.append(listContainer);
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
      onStatusChange: async (newStatus) => {
        try {
          await transitionBugStatus(bug.id, newStatus);
          navigate(`/bugs/${bug.id}`);
        } catch (err) {
          alert(`Status transition failed: ${err.message}`);
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
