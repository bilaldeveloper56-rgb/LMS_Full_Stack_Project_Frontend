import api from '@/config/api';

/**
 * Dashboard & Analytics API Service.
 * Connects directly to backend `/api/v1/analytics` routes.
 */

/**
 * Fetch institutional & academic analytics for a school.
 * GET /api/v1/analytics/school
 *
 * @param {object} [filters={}]
 * @param {string} [filters.academicSessionId]
 * @param {string} [filters.classId]
 * @param {string} [filters.startDate] - YYYY-MM-DD or ISO string
 * @param {string} [filters.endDate] - YYYY-MM-DD or ISO string
 * @returns {Promise<object>}
 */
export async function fetchSchoolAnalytics(filters = {}) {
  const response = await api.get('/analytics/school', { params: filters });
  return response.data.data;
}

/**
 * Fetch platform-wide multi-tenant analytics for Super Admin.
 * GET /api/v1/analytics/platform
 *
 * @param {object} [filters={}]
 * @param {string} [filters.startDate] - YYYY-MM-DD or ISO string
 * @param {string} [filters.endDate] - YYYY-MM-DD or ISO string
 * @returns {Promise<object>}
 */
export async function fetchPlatformAnalytics(filters = {}) {
  const response = await api.get('/analytics/platform', { params: filters });
  return response.data.data;
}
