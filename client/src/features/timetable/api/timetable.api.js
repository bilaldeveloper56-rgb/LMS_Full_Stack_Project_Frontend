import api from '@/config/api';

/**
 * Create a new timetable slot.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createTimetableSlot(payload) {
  const response = await api.post('/timetable', payload);
  return response.data?.data;
}

/**
 * Fetch timetable slots with optional filters.
 * @param {object} params
 * @returns {Promise<{ slots: Array, pagination: object }>}
 */
export async function fetchTimetableSlots(params = {}) {
  const response = await api.get('/timetable', { params });
  return {
    slots: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 100, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch full weekly timetable for a section.
 * @param {string} sectionId
 * @returns {Promise<Array>}
 */
export async function fetchSectionTimetable(sectionId) {
  const response = await api.get(`/timetable/section/${sectionId}`);
  return response.data?.data || [];
}

/**
 * Fetch full weekly timetable for a teacher.
 * @param {string} teacherId
 * @returns {Promise<Array>}
 */
export async function fetchTeacherTimetable(teacherId) {
  const response = await api.get(`/timetable/teacher/${teacherId}`);
  return response.data?.data || [];
}

/**
 * Fetch single timetable slot by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchTimetableById(id) {
  const response = await api.get(`/timetable/${id}`);
  return response.data?.data;
}

/**
 * Update an existing timetable slot.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateTimetableSlot(id, payload) {
  const response = await api.patch(`/timetable/${id}`, payload);
  return response.data?.data;
}

/**
 * Soft delete a timetable slot.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteTimetableSlot(id) {
  const response = await api.delete(`/timetable/${id}`);
  return response.data;
}
