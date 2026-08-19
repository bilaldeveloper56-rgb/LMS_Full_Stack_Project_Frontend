import api from '@/config/api';

/**
 * Fetch paginated list of parents with search.
 *
 * @param {object} [params={}] - Query parameters
 * @returns {Promise<{parents: Array, pagination: object}>}
 */
export async function fetchParents(params = {}) {
  const response = await api.get('/parents', { params });
  return {
    parents: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch single parent by ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchParentById(id) {
  const response = await api.get(`/parents/${id}`);
  return response.data?.data;
}

/**
 * Fetch linked student children for a parent.
 *
 * @param {string} id
 * @returns {Promise<Array>}
 */
export async function fetchParentChildren(id) {
  const response = await api.get(`/parents/${id}/children`);
  return response.data?.data || [];
}

/**
 * Create a new parent record.
 *
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createParent(payload) {
  const response = await api.post('/parents', payload);
  return response.data?.data;
}

/**
 * Update existing parent record.
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateParent(id, payload) {
  const response = await api.patch(`/parents/${id}`, payload);
  return response.data?.data;
}

/**
 * Soft delete parent record.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteParent(id) {
  const response = await api.delete(`/parents/${id}`);
  return response.data;
}

/**
 * Link a student child to a parent.
 *
 * @param {object} payload - { studentId, parentId, relationshipType, isPrimary, canPickup, emergencyContact }
 * @returns {Promise<object>}
 */
export async function linkStudentParent(payload) {
  const response = await api.post('/student-parent-links', payload);
  return response.data?.data;
}

/**
 * Unlink/remove student-parent relationship.
 *
 * @param {string} linkId
 * @returns {Promise<object>}
 */
export async function unlinkStudentParent(linkId) {
  const response = await api.delete(`/student-parent-links/${linkId}`);
  return response.data;
}
