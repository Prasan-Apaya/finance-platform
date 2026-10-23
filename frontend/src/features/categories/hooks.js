import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from './api';
import { keys } from '@/api/queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: keys.categories,
    queryFn: categoryApi.getAll,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.categories });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.categories });
    },
  });
}
