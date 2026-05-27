/**
 * API client for bugs.
 */

const BASE = '/api/v1';

export async function fetchBugs() {
  const res = await fetch(`${BASE}/bugs`);
  if (!res.ok) throw new Error(`Failed to fetch bugs: ${res.status}`);
  return res.json();
}

export async function fetchBug(id) {
  const res = await fetch(`${BASE}/bugs/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch bug: ${res.status}`);
  return res.json();
}

export async function createBug(data) {
  const res = await fetch(`${BASE}/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create bug: ${res.status}`);
  return res.json();
}

export async function updateBug(id, data) {
  const res = await fetch(`${BASE}/bugs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update bug: ${res.status}`);
  return res.json();
}

export async function deleteBug(id) {
  const res = await fetch(`${BASE}/bugs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete bug: ${res.status}`);
}

export async function transitionBugStatus(id, status) {
  const res = await fetch(`${BASE}/bugs/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);
  return res.json();
}
