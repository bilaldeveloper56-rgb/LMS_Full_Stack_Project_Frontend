import api from '@/config/api';

/**
 * Fetch paginated list of notices with optional filters.
 * @param {object} [params]
 * @returns {Promise<{ notices: Array, pagination: object }>}
 */
export async function fetchNotices(params = {}) {
  const response = await api.get('/notices', { params });
  return {
    notices: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch a single notice by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchNoticeById(id) {
  const response = await api.get(`/notices/${id}`);
  return response.data?.data?.notice;
}

/**
 * Create a new notice.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createNotice(payload) {
  const response = await api.post('/notices', payload);
  return response.data?.data?.notice;
}

/**
 * Update an existing notice.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateNotice(id, payload) {
  const response = await api.patch(`/notices/${id}`, payload);
  return response.data?.data?.notice;
}

/**
 * Delete (soft delete) a notice.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteNotice(id) {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
}

/**
 * Publish a draft notice.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function publishNotice(id) {
  const response = await api.post(`/notices/${id}/publish`);
  return response.data?.data?.notice;
}
