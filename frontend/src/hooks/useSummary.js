import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api/dashboardApi';

export function useSummary(month, options = {}) {
  return useQuery({
    queryKey: ['summary', month],
    queryFn: () => getSummary(month).then((res) => res.data),
    placeholderData: (previous) => previous,
    ...options,
  });
}