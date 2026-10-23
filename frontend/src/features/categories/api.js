import api from '@/api/apiClient';

export const categoryApi = {
  getAll: async () => {
    const { data } = await api.get('/categories');
    return data;
  },
  create: async (categoryData) => {
    const { data } = await api.post('/categories', categoryData);
    return data;
  },
  update: async ({ id, ...categoryData }) => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};