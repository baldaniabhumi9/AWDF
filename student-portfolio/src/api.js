const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = payload?.error;
    const message = typeof apiError === 'string'
      ? apiError
      : apiError?.message || payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export const getTasks = () => request('/tasks');

export const createTask = (task) => request('/tasks', {
  method: 'POST',
  body: JSON.stringify(task),
});

export const updateTask = (id, updates) => request(`/tasks/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updates),
});

export const deleteTask = (id) => request(`/tasks/${id}`, {
  method: 'DELETE',
});