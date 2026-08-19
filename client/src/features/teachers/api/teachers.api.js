import api from '@/config/api';

/**
 * Fetch paginated list of teachers with filters.
 *
 * @param {object} [params={}] - Query parameters
 * @returns {Promise<{teachers: Array, pagination: object}>}
 */
export async function fetchTeachers(params = {}) {
  const response = await api.get('/teachers', { params });
  return {
    teachers: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch a single teacher by ID.
 *
 * @param {string} id - Teacher record ID
 * @returns {Promise<object>}
 */
export async function fetchTeacherById(id) {
  const response = await api.get(`/teachers/${id}`);
  return response.data?.data;
}

/**
 * Create a new teacher record.
 *
 * @param {object} payload - Teacher creation data
 * @returns {Promise<object>}
 */
export async function createTeacher(payload) {
  const response = await api.post('/teachers', payload);
  return response.data?.data;
}

/**
 * Update an existing teacher record.
 *
 * @param {string} id - Teacher record ID
 * @param {object} payload - Update fields
 * @returns {Promise<object>}
 */
export async function updateTeacher(id, payload) {
  const response = await api.patch(`/teachers/${id}`, payload);
  return response.data?.data;
}

/**
 * Soft delete/deactivate a teacher record.
 *
 * @param {string} id - Teacher record ID
 * @returns {Promise<object>}
 */
export async function deleteTeacher(id) {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
}

/**
 * Upload teacher avatar image.
 *
 * @param {File} file - Image file
 * @returns {Promise<object>} Upload response with secureUrl
 */
export async function uploadTeacherAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data;
}

/**
 * Fetch teacher assignments for a specific teacher.
 *
 * @param {string} teacherId
 * @returns {Promise<Array>}
 */
export async function fetchTeacherAssignments(teacherId) {
  const response = await api.get('/teacher-assignments', {
    params: { teacherId, limit: 100 },
  });
  return response.data?.data || [];
}
