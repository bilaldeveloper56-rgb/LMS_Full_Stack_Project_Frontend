import api from '@/config/api';

/**
 * Mark attendance for a single student.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createAttendance(payload) {
  const response = await api.post('/attendance', payload);
  return response.data?.data;
}

/**
 * Bulk mark attendance for an entire class section.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function bulkMarkAttendance(payload) {
  const response = await api.post('/attendance/bulk', payload);
  return response.data?.data;
}

/**
 * List attendance records with pagination and filters.
 * @param {object} params
 * @returns {Promise<{ records: Array, pagination: object }>}
 */
export async function fetchAttendanceList(params = {}) {
  const response = await api.get('/attendance', { params });
  return {
    records: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch attendance record by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchAttendanceById(id) {
  const response = await api.get(`/attendance/${id}`);
  return response.data?.data;
}

/**
 * Fetch attendance records for a specific student.
 * @param {string} studentId
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchStudentAttendance(studentId, params = {}) {
  const response = await api.get(`/attendance/student/${studentId}`, { params });
  return {
    records: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch attendance records for a section.
 * @param {string} sectionId
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchSectionAttendance(sectionId, params = {}) {
  const response = await api.get(`/attendance/section/${sectionId}`, { params });
  return {
    records: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch attendance records for a class.
 * @param {string} classId
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchClassAttendance(classId, params = {}) {
  const response = await api.get(`/attendance/class/${classId}`, { params });
  return {
    records: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch overall school-wide attendance summary report.
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchAttendanceSummaryReport(params = {}) {
  const response = await api.get('/attendance/reports/summary', { params });
  return response.data?.data;
}

/**
 * Fetch student attendance statistics report.
 * @param {string} studentId
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchStudentAttendanceReport(studentId, params = {}) {
  const response = await api.get(`/attendance/reports/student/${studentId}`, { params });
  return response.data?.data;
}

/**
 * Fetch section attendance statistics report.
 * @param {string} sectionId
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchSectionAttendanceReport(sectionId, params = {}) {
  const response = await api.get(`/attendance/reports/section/${sectionId}`, { params });
  return response.data?.data;
}

/**
 * Update an existing attendance record.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateAttendance(id, payload) {
  const response = await api.patch(`/attendance/${id}`, payload);
  return response.data?.data;
}

/**
 * Submit an official correction with reason for an attendance record.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function correctAttendance(id, payload) {
  const response = await api.patch(`/attendance/${id}/correct`, payload);
  return response.data?.data;
}

/**
 * Soft delete an attendance record.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteAttendance(id) {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
}
