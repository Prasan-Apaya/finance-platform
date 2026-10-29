import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, getBudgetStatus, createBudget, updateBudget, deleteBudget } from './api';
import { keys } from '../../api/queryKeys';

// 1. Get raw budgets list
export function useBudgets(month) {
  return useQuery({
    queryKey: keys.budgets(month),
    queryFn: () => getBudgets(month).then((res) => res.data),
    placeholderData: (previous) => previous,
  });
}

// 2. Get budget status WITH frontend transformations built-in
export function useBudgetStatus(month, options = {}) {
  return useQuery({
    queryKey: keys.budgetStatus(month),
    queryFn: () => getBudgetStatus(month).then((res) => {
      const data = res.data;
      if (!data) return { items: [], totalLimit: 0, totalSpent: 0, totalRemaining: 0, percentUsed: 0 };

      const items = (data.categories || []).map((cat) => {
        const limit = Number(cat.limitAmount);
        const spent = Number(cat.spentAmount);
        const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
        
        let status = 'OK';
        if (percentUsed >= 100) status = 'EXCEEDED';
        else if (percentUsed >= 80) status = 'WARNING';

        return {
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          limit,
          spent,
          remaining: Number(cat.remainingAmount),
          percentUsed,
          status,
        };
      });

      const totalLimit = Number(data.totalLimit || 0);
      const totalSpent = Number(data.totalSpent || 0);
      const totalRemaining = Number(data.totalRemaining || 0);
      const overallPercentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

      return {
        items,
        totalLimit,
        totalSpent,
        totalRemaining,
        percentUsed: overallPercentUsed,
      };
    }),
    placeholderData: (previous) => previous,
    ...options,
  });
}

// export function useBudgetStatus(month) {
//   return useQuery({
//     queryKey: keys.budgetStatus(month),
//     queryFn: () => getBudgetStatus(month).then((res) => res.data),
//     placeholderData: (previous) => previous,
//   });
// }

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.budgetsAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.budgetsAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.budgetsAll });
      queryClient.invalidateQueries({ queryKey: keys.budgetStatusAll });
    },
  });
}