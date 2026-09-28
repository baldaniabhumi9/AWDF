const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const AUTH_TOKEN_KEY = 'task-manager-token';

export const getAuthToken = () => window.localStorage.getItem(AUTH_TOKEN_KEY);

export const clearAuthToken = () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new Event('auth:changed'));
};

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== '/login' && path !== '/register') {
      clearAuthToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    const apiError = payload?.error;
    const details = payload?.details && Object.values(payload.details).join('. ');
    const message = typeof apiError === 'string'
      ? [apiError, details].filter(Boolean).join(': ')
      : apiError?.message || payload?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export const getTasks = () => request('/tasks');

export const registerUser = (credentials) => request('/register', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const loginUser = async (credentials) => {
  const result = await request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  window.localStorage.setItem(AUTH_TOKEN_KEY, result.token);
  window.dispatchEvent(new Event('auth:changed'));
  return result;
};

export const getMe = () => request('/me');

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