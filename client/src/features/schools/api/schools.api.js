import api from '@/config/api';

/**
 * Fetch paginated list of schools with optional search/status filters.
 * @param {object} [params]
 * @returns {Promise<{ schools: Array, pagination: object }>}
 */
export async function fetchSchools(params = {}) {
  const response = await api.get('/schools', { params });
  return {
    schools: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch global school statistics (Super Admin).
 * @returns {Promise<object>}
 */
export async function fetchSchoolStats() {
  const response = await api.get('/schools/stats');
  return response.data?.data || {};
}

/**
 * Fetch a single school by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchSchoolById(id) {
  const response = await api.get(`/schools/${id}`);
  return response.data?.data?.school;
}

/**
 * Fetch current authenticated user's school profile.
 * @returns {Promise<object>}
 */
export async function fetchMySchool() {
  const response = await api.get('/schools/my-school');
  return response.data?.data?.school;
}

/**
 * Provision a new school with initial admin.
 * @param {object} payload - { school: object, admin: object }
 * @returns {Promise<object>}
 */
export async function createSchool(payload) {
  const response = await api.post('/schools', payload);
  return response.data?.data;
}

/**
 * Update an existing school profile.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateSchool(id, payload) {
  const response = await api.patch(`/schools/${id}`, payload);
  return response.data?.data?.school;
}

/**
 * Change school lifecycle status.
 * @param {string} id
 * @param {object} payload - { status: string, reason?: string }
 * @returns {Promise<object>}
 */
export async function changeSchoolStatus(id, payload) {
  const response = await api.patch(`/schools/${id}/status`, payload);
  return response.data?.data?.school;
}

/**
 * Resend invitation to initial School Admin.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function resendAdminInvitation(id) {
  const response = await api.post(`/schools/${id}/resend-admin-invitation`);
  return response.data;
}

/**
 * Complete School Admin account activation with invitation token.
 * @param {object} payload - { token: string, password: string, confirmPassword: string }
 * @returns {Promise<object>}
 */
export async function acceptInvitation(payload) {
  const response = await api.post('/schools/accept-invitation', payload);
  return response.data;
}
