const API_BASE = 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function logout() {
  localStorage.removeItem('token');
}

export async function apiFetch(url, options = {}) {
  const token = getToken();

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
}