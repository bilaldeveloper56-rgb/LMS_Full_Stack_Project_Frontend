import api from '@/config/api';

/**
 * Create a new assignment.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createAssignment(payload) {
  const response = await api.post('/assignments', payload);
  return response.data?.data?.assignment;
}

/**
 * Fetch assignments with filters and pagination.
 * @param {object} params
 * @returns {Promise<{ assignments: Array, pagination: object }>}
 */
export async function fetchAssignments(params = {}) {
  const response = await api.get('/assignments', { params });
  return {
    assignments: response.data?.data?.assignments || [],
    pagination: response.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch assignment by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchAssignmentById(id) {
  const response = await api.get(`/assignments/${id}`);
  return response.data?.data?.assignment;
}

/**
 * Update an existing assignment.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateAssignment(id, payload) {
  const response = await api.patch(`/assignments/${id}`, payload);
  return response.data?.data?.assignment;
}

/**
 * Soft delete an assignment.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteAssignment(id) {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
}

/**
 * Publish an assignment.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function publishAssignment(id) {
  const response = await api.post(`/assignments/${id}/publish`);
  return response.data?.data?.assignment;
}

/**
 * Submit work for an assignment (Student).
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function submitAssignment(id, payload) {
  const response = await api.post(`/assignments/${id}/submit`, payload);
  return response.data?.data?.submission;
}

/**
 * Fetch all student submissions for an assignment (Teacher/Admin).
 * @param {string} id
 * @returns {Promise<Array>}
 */
export async function fetchAssignmentSubmissions(id) {
  const response = await api.get(`/assignments/${id}/submissions`);
  return response.data?.data?.submissions || [];
}

/**
 * Grade a student's submission.
 * @param {string} submissionId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function gradeSubmission(submissionId, payload) {
  const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, payload);
  return response.data?.data?.submission;
}
