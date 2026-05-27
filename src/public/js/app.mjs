import { initRouter, registerRoute, navigate } from './router.mjs';

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

  section.append(heading, description);
  container.append(section);
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  initRouter(appContainer);
});
