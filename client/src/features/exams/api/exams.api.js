import api from '@/config/api';

/**
 * Create a new examination term.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createExam(payload) {
  const response = await api.post('/exams', payload);
  return response.data?.data?.exam;
}

/**
 * Fetch paginated list of examinations.
 * @param {object} [params]
 * @returns {Promise<{ exams: Array, pagination: object }>}
 */
export async function fetchExams(params = {}) {
  const response = await api.get('/exams', { params });
  return {
    exams: response.data?.data?.exams || response.data?.data || [],
    pagination: response.data?.data?.pagination || response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch single exam details with scheduled papers.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchExamById(id) {
  const response = await api.get(`/exams/${id}`);
  return response.data?.data?.exam;
}

/**
 * Update an existing examination.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateExam(id, payload) {
  const response = await api.patch(`/exams/${id}`, payload);
  return response.data?.data?.exam;
}

/**
 * Delete / soft-delete an examination.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteExam(id) {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
}

/**
 * Publish exam schedule for teachers, students, and parents.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function publishExam(id) {
  const response = await api.post(`/exams/${id}/publish`);
  return response.data?.data?.exam;
}

/**
 * Schedule a paper for class and subject within an exam term.
 * @param {string} examId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function scheduleExamPaper(examId, payload) {
  const response = await api.post(`/exams/${examId}/papers`, payload);
  return response.data?.data?.paper;
}
