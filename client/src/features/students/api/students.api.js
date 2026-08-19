import api from '@/config/api';

/**
 * Student & Enrollment API Service.
 * Connects directly to backend `/api/v1/students`, `/api/v1/uploads`, and `/api/v1/academics` routes.
 */

/**
 * Fetch paginated students with search and filters.
 * GET /api/v1/students
 *
 * @param {object} [params={}]
 * @returns {Promise<{ students: Array, pagination: object }>}
 */
export async function fetchStudents(params = {}) {
  const response = await api.get('/students', { params });
  return {
    students: response.data.data || [],
    pagination: response.data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  };
}

/**
 * Fetch a single student record by ID.
 * GET /api/v1/students/:id
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchStudentById(id) {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
}

/**
 * Fetch comprehensive student profile including linked parents.
 * GET /api/v1/students/:id/profile
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchStudentProfile(id) {
  const response = await api.get(`/students/${id}/profile`);
  return response.data.data;
}

/**
 * Fetch student academic record (enrollments and current subjects/teachers).
 * GET /api/v1/students/:id/academic
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchStudentAcademic(id) {
  const response = await api.get(`/students/${id}/academic`);
  return response.data.data;
}

/**
 * Register a new student.
 * POST /api/v1/students
 *
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createStudent(payload) {
  const response = await api.post('/students', payload);
  return response.data.data;
}

/**
 * Update an existing student record.
 * PATCH /api/v1/students/:id
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateStudent(id, payload) {
  const response = await api.patch(`/students/${id}`, payload);
  return response.data.data;
}

/**
 * Soft delete a student record.
 * DELETE /api/v1/students/:id
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteStudent(id) {
  const response = await api.delete(`/students/${id}`);
  return response.data;
}

/**
 * Upload student avatar image via backend multipart endpoint.
 * POST /api/v1/uploads/avatar
 *
 * @param {File} file
 * @returns {Promise<{ url: string, secureUrl: string, publicId: string }>}
 */
export async function uploadStudentAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/uploads/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

/**
 * Fetch academic classes for dropdown selects.
 * GET /api/v1/classes
 *
 * @param {object} [params={ limit: 100 }]
 * @returns {Promise<Array>}
 */
export async function fetchClasses(params = { limit: 100 }) {
  const response = await api.get('/classes', { params });
  return response.data.data || [];
}

/**
 * Fetch sections for dropdown selects.
 * GET /api/v1/sections
 *
 * @param {object} [params={ limit: 100 }]
 * @returns {Promise<Array>}
 */
export async function fetchSections(params = { limit: 100 }) {
  const response = await api.get('/sections', { params });
  return response.data.data || [];
}

/**
 * Fetch academic sessions for dropdown selects.
 * GET /api/v1/academic-sessions
 *
 * @param {object} [params={ limit: 100 }]
 * @returns {Promise<Array>}
 */
export async function fetchAcademicSessions(params = { limit: 100 }) {
  const response = await api.get('/academic-sessions', { params });
  return response.data.data || [];
}
