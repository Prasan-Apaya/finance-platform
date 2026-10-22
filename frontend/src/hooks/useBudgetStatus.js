import { useQuery } from '@tanstack/react-query';
import { getBudgetStatus } from '../api/dashboardApi';

export function useBudgetStatus(month, options = {}) {
  return useQuery({
    queryKey: ['budget-status', month],
    queryFn: () => getBudgetStatus(month).then((res) => res.data),
    placeholderData: (previous) => previous,
    ...options,
  });
}