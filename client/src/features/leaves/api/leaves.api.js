import api from '@/config/api';

/**
 * Submit a leave application.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createLeave(payload) {
  const response = await api.post('/leaves', payload);
  return response.data?.data;
}

/**
 * Fetch all leave requests with filters and pagination.
 * @param {object} params
 * @returns {Promise<{ leaves: Array, pagination: object }>}
 */
export async function fetchLeaves(params = {}) {
  const response = await api.get('/leaves', { params });
  return {
    leaves: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch authenticated user's own submitted leaves.
 * @param {object} params
 * @returns {Promise<{ leaves: Array, pagination: object }>}
 */
export async function fetchMyLeaves(params = {}) {
  const response = await api.get('/leaves/my', { params });
  return {
    leaves: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch leaves for a student.
 * @param {string} studentId
 * @param {object} params
 * @returns {Promise<{ leaves: Array, pagination: object }>}
 */
export async function fetchStudentLeaves(studentId, params = {}) {
  const response = await api.get(`/leaves/student/${studentId}`, { params });
  return {
    leaves: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch leaves for a teacher.
 * @param {string} teacherId
 * @param {object} params
 * @returns {Promise<{ leaves: Array, pagination: object }>}
 */
export async function fetchTeacherLeaves(teacherId, params = {}) {
  const response = await api.get(`/leaves/teacher/${teacherId}`, { params });
  return {
    leaves: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch leave request by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchLeaveById(id) {
  const response = await api.get(`/leaves/${id}`);
  return response.data?.data;
}

/**
 * Update a pending leave request.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateLeave(id, payload) {
  const response = await api.patch(`/leaves/${id}`, payload);
  return response.data?.data;
}

/**
 * Cancel a pending leave request.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function cancelLeave(id) {
  const response = await api.post(`/leaves/${id}/cancel`);
  return response.data?.data;
}

/**
 * Approve a pending leave request.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function approveLeave(id) {
  const response = await api.post(`/leaves/${id}/approve`);
  return response.data?.data;
}

/**
 * Reject a pending leave request with a mandatory reason.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function rejectLeave(id, payload) {
  const response = await api.post(`/leaves/${id}/reject`, payload);
  return response.data?.data;
}

/**
 * Soft delete a leave request.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteLeave(id) {
  const response = await api.delete(`/leaves/${id}`);
  return response.data;
}
