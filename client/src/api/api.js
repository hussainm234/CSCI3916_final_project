const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const auth = {
  signup: (email, password, homeCurrency) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, homeCurrency }) }),
  signin: (email, password) =>
    request('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  updateCurrency: (homeCurrency) =>
    request('/auth/me', { method: 'PUT', body: JSON.stringify({ homeCurrency }) }),
};

export const expenses = {
  list: () => request('/expenses'),
  create: (data) => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  report: () => request('/expenses/report'),
  convert: (amount, from) => request(`/expenses/convert?amount=${amount}&from=${from}`),
};

export const categories = {
  list: () => request('/categories'),
  create: (name, monthlyBudget) =>
    request('/categories', { method: 'POST', body: JSON.stringify({ name, monthlyBudget }) }),
  update: (id, name, monthlyBudget) =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name, monthlyBudget }) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};
