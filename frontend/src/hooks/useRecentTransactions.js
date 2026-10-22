import { useQuery } from '@tanstack/react-query';
import { getRecentTransactions } from '../api/dashboardApi';

export function useRecentTransactions(options = {}) {
  return useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => getRecentTransactions().then((res) => res.data),
    placeholderData: (previous) => previous,
    ...options,
  });
}