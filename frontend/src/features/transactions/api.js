import apiClient from "../../api/apiClient";

export const transactionsApi = {
  getTransactions: ({ month, categoryId, type, page = 0, size = 10 } = {}) => {
    const params = Object.fromEntries(
      Object.entries({ month, categoryId, type, page, size }).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );

    return apiClient.get("/transactions", { params });
  },

  createTransaction: (data) => {
    return apiClient.post("/transactions", data);
  },

  updateTransaction: (id, data) => {
    return apiClient.put(`/transactions/${id}`, data);
  },

  deleteTransaction: (id) => {
    return apiClient.delete(`/transactions/${id}`);
  },
};
