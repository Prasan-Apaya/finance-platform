import apiClient from './apiClient';

function getUserId() {
  const stored = localStorage.getItem('userId');
  return stored ? Number(stored) : 1;
}

export function getSummary(month) {
  return apiClient.get('/summary', { params: { userId: getUserId(), month } });
}

export function getBudgetStatus(month) {
  return apiClient.get('/budgets/status', { params: { userId: getUserId(), month } });
}

export function getRecentTransactions({ page = 0, size = 5, sort = 'date,desc' } = {}) {
  return apiClient.get('/transactions', { params: { userId: getUserId() } });
}
