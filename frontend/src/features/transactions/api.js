import apiClient from '../../api/apiClient';

function getUserId() {
  const stored = localStorage.getItem('userId');
  return stored ? Number(stored) : 1;
}

export const transactionsApi = {
  getTransactions: ({ month, categoryId, type, page = 0, size = 10 } = {}) => {
    const params = { userId: getUserId() };
    if (month) params.month = month;
    return apiClient.get('/transactions', { params });
  },

  createTransaction: (data) => {
    return apiClient.post('/transactions', data, {
      params: { userId: getUserId() },
    });
  },

  updateTransaction: (id, data) => {
    return apiClient.put(`/transactions/${id}`, data, {
      params: { userId: getUserId() },
    });
  },

  deleteTransaction: (id) => {
    return apiClient.delete(`/transactions/${id}`, {
      params: { userId: getUserId() },
    });
  },
};
