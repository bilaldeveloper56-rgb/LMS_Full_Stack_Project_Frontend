import api from '@/config/api';

/**
 * Fetch student roster report.
 * @param {object} [params]
 * @returns {Promise<{ roster: Array, pagination: object }>}
 */
export async function fetchStudentRosterReport(params = {}) {
  const response = await api.get('/reports/student-roster', { params });
  return {
    roster: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch attendance register report.
 * @param {object} [params]
 * @returns {Promise<{ reports: Array, pagination: object }>}
 */
export async function fetchAttendanceReport(params = {}) {
  const response = await api.get('/reports/attendance', { params });
  return {
    reports: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch fee defaulters report.
 * @param {object} [params]
 * @returns {Promise<{ defaulters: Array, pagination: object }>}
 */
export async function fetchFeeDefaultersReport(params = {}) {
  const response = await api.get('/reports/fee-defaulters', { params });
  return {
    defaulters: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch individual academic report card.
 * @param {object} params
 * @param {string} params.studentId
 * @param {string} [params.academicSessionId]
 * @param {string} [params.examId]
 * @returns {Promise<object>}
 */
export async function fetchAcademicReportCard(params) {
  const response = await api.get('/reports/report-card', { params });
  return response.data?.data;
}
