import api from '@/config/api';

/**
 * Fetch paginated audit trail logs with optional filters.
 * @param {object} [params]
 * @returns {Promise<{ logs: Array, pagination: object }>}
 */
export async function fetchAuditLogs(params = {}) {
  const response = await api.get('/audit-logs', { params });
  return {
    logs: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}
