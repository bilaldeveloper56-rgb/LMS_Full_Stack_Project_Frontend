import api from '@/config/api';

/**
 * Calculate promotion preview with candidate roster, status suggestions, and capacity metrics.
 *
 * @param {Object} payload - Source and destination session, class, and section IDs
 * @returns {Promise<Object>}
 */
export async function fetchPromotionPreview(payload) {
  const response = await api.post('/promotions/preview', payload);
  return response.data?.data;
}

/**
 * Execute atomic bulk promotion of students to destination session.
 *
 * @param {Object} payload - Bulk promotion payload
 * @returns {Promise<Object>} Execution summary receipt
 */
export async function executeBulkPromotion(payload) {
  const response = await api.post('/promotions/bulk', payload);
  return response.data?.data;
}

/**
 * Fetch paginated promotion audit history.
 *
 * @param {Object} params - Query filters & pagination
 * @returns {Promise<Object>} History array and pagination object
 */
export async function fetchPromotionHistory(params = {}) {
  const response = await api.get('/promotions/history', { params });
  return {
    history: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}
