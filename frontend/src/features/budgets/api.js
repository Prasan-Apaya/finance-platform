import apiClient from '../../api/apiClient';

export function getBudgets(month) {
  return apiClient.get('/budgets', { params: { month } });
}

export function getBudgetStatus(month) {
  return apiClient.get('/budgets/status', { params: { month } });
}

export function createBudget(data) {
  return apiClient.post('/budgets', { ...data });
}

export function updateBudget(id, data) {
  return apiClient.put(`/budgets/${id}`, { ...data});
}

export function deleteBudget(id) {
  return apiClient.delete(`/budgets/${id}`);
}