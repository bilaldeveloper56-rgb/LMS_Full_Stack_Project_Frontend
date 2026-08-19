import api from '@/config/api';

/**
 * Create a new grading scale.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createGradingScale(payload) {
  const response = await api.post('/results/grading-scales', payload);
  return response.data?.data?.scale;
}

/**
 * Fetch grading scales configured for the school.
 * @returns {Promise<Array>}
 */
export async function fetchGradingScales() {
  const response = await api.get('/results/grading-scales');
  return response.data?.data?.scales || [];
}

/**
 * Record marks for a single student.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function recordMarks(payload) {
  const response = await api.post('/results/marks', payload);
  return response.data?.data?.result;
}

/**
 * Bulk record marks for multiple students.
 * @param {object} payload
 * @param {string} payload.examId
 * @param {string} payload.examPaperId
 * @param {Array<{ studentId: string, marksObtained: number, remarks?: string }>} payload.records
 * @returns {Promise<Array>}
 */
export async function bulkRecordMarks(payload) {
  const response = await api.post('/results/marks/bulk', payload);
  return response.data?.data?.results || [];
}

/**
 * Fetch student report card for an exam or academic session.
 * @param {string} studentId
 * @param {object} [params]
 * @param {string} [params.examId]
 * @returns {Promise<object>}
 */
export async function fetchStudentReportCard(studentId, params = {}) {
  const response = await api.get(`/results/student/${studentId}`, { params });
  return response.data?.data || response.data;
}

/**
 * Fetch results roster for an exam and class section.
 * @param {string} examId
 * @param {string} sectionId
 * @param {object} [params]
 * @returns {Promise<Array>}
 */
export async function fetchSectionResults(examId, sectionId, params = {}) {
  const response = await api.get(`/results/exam/${examId}/section/${sectionId}`, { params });
  return response.data?.data?.results || [];
}

/**
 * Lock section results to prevent further edits.
 * @param {string} examId
 * @param {string} sectionId
 * @returns {Promise<object>}
 */
export async function lockSectionResults(examId, sectionId) {
  const response = await api.post(`/results/exam/${examId}/section/${sectionId}/lock`);
  return response.data;
}

/**
 * Unlock section results for re-evaluation.
 * @param {string} examId
 * @param {string} sectionId
 * @returns {Promise<object>}
 */
export async function unlockSectionResults(examId, sectionId) {
  const response = await api.post(`/results/exam/${examId}/section/${sectionId}/unlock`);
  return response.data;
}

/**
 * Publish section results to students and parents.
 * @param {string} examId
 * @param {string} sectionId
 * @returns {Promise<object>}
 */
export async function publishSectionResults(examId, sectionId) {
  const response = await api.post(`/results/exam/${examId}/section/${sectionId}/publish`);
  return response.data;
}
