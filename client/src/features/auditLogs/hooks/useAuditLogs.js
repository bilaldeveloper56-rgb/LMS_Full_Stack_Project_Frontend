import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/auditLogs.api';

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

export function useAuditLogs(filters = {}, options = {}) {
  const cleaned = cleanParams(filters);
  return useQuery({
    queryKey: ['audit-logs', cleaned],
    queryFn: () => fetchAuditLogs(cleaned),
    staleTime: 30 * 1000,
    ...options,
  });
}
