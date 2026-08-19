import { useQuery } from '@tanstack/react-query';
import { fetchSchoolAnalytics, fetchPlatformAnalytics } from '../api/dashboard.api';

/**
 * TanStack React Query hook for fetching school-level analytics.
 *
 * @param {object} [filters={}] - Optional query filters (academicSessionId, classId, startDate, endDate)
 * @param {object} [options={}] - React Query options override
 */
export function useSchoolAnalytics(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['analytics', 'school', filters],
    queryFn: () => fetchSchoolAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * TanStack React Query hook for fetching platform-wide analytics for Super Admin.
 *
 * @param {object} [filters={}] - Optional query filters (startDate, endDate)
 * @param {object} [options={}] - React Query options override
 */
export function usePlatformAnalytics(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['analytics', 'platform', filters],
    queryFn: () => fetchPlatformAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}
