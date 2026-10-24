import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from './api';
import { keys } from '../../api/queryKeys';

export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: keys.transactions.list(filters),
    queryFn: () => transactionsApi.getTransactions(filters).then((res) => res.data),
    placeholderData: (previous) => previous,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.transactions.all });
      queryClient.invalidateQueries({ queryKey: keys.summaryAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionsApi.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.transactions.all });
      queryClient.invalidateQueries({ queryKey: keys.summaryAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.transactions.all });
      queryClient.invalidateQueries({ queryKey: keys.summaryAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}
