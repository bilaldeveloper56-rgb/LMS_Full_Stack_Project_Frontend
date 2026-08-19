import api from '@/config/api';

/**
 * Create a new quiz.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function createQuiz(payload) {
  const response = await api.post('/quizzes', payload);
  return response.data?.data?.quiz;
}

/**
 * Fetch quizzes with filters and pagination.
 * @param {object} params
 * @returns {Promise<{ quizzes: Array, pagination: object }>}
 */
export async function fetchQuizzes(params = {}) {
  const response = await api.get('/quizzes', { params });
  return {
    quizzes: response.data?.data?.quizzes || [],
    pagination: response.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Fetch quiz by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function fetchQuizById(id) {
  const response = await api.get(`/quizzes/${id}`);
  return response.data?.data?.quiz;
}

/**
 * Update an existing quiz.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function updateQuiz(id, payload) {
  const response = await api.patch(`/quizzes/${id}`, payload);
  return response.data?.data?.quiz;
}

/**
 * Soft delete a quiz.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function deleteQuiz(id) {
  const response = await api.delete(`/quizzes/${id}`);
  return response.data;
}

/**
 * Publish a quiz to students.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function publishQuiz(id) {
  const response = await api.post(`/quizzes/${id}/publish`);
  return response.data?.data?.quiz;
}

/**
 * Start a new quiz attempt (Student).
 * @param {string} quizId
 * @returns {Promise<object>}
 */
export async function startQuizAttempt(quizId) {
  const response = await api.post(`/quizzes/${quizId}/start`);
  return response.data?.data?.attempt;
}

/**
 * Submit answers for an ongoing quiz attempt (Student).
 * @param {string} attemptId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function submitQuizAttempt(attemptId, payload) {
  const response = await api.post(`/quizzes/attempts/${attemptId}/submit`, payload);
  return response.data?.data?.attempt;
}

/**
 * Grade a student's quiz attempt (Teacher/Admin).
 * @param {string} attemptId
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function gradeQuizAttempt(attemptId, payload) {
  const response = await api.patch(`/quizzes/attempts/${attemptId}/grade`, payload);
  return response.data?.data?.attempt;
}
