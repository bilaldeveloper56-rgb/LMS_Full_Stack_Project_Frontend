import api from '@/config/api';

/**
 * Fetch institutional/school analytics metrics.
 * @param {object} [params]
 * @returns {Promise<object>}
 */
export async function fetchSchoolAnalytics(params = {}) {
  const response = await api.get('/analytics/school', { params });
  return response.data?.data || {};
}

/**
 * Fetch platform-wide multi-tenant analytics (Super Admin only).
 * @param {object} [params]
 * @returns {Promise<object>}
 */
export async function fetchPlatformAnalytics(params = {}) {
  const response = await api.get('/analytics/platform', { params });
  return response.data?.data || {};
}
