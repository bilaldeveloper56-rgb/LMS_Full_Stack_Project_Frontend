import { useQuery } from '@tanstack/react-query';
import { fetchSchoolAnalytics, fetchPlatformAnalytics } from '../api/analytics.api';

/**
 * Filter out empty string properties before passing to API query params.
 */
function cleanParams(params = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function useSchoolAnalytics(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['analytics', 'school', cleaned],
    queryFn: () => fetchSchoolAnalytics(cleaned),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function usePlatformAnalytics(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['analytics', 'platform', cleaned],
    queryFn: () => fetchPlatformAnalytics(cleaned),
    staleTime: 60 * 1000,
    ...options,
  });
}
