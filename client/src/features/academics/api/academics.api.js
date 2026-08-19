import api from '@/config/api';

/* ── Academic Sessions API ── */

export async function fetchAcademicSessions(params = {}) {
  const response = await api.get('/academic-sessions', { params });
  return {
    sessions: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchAcademicSessionById(id) {
  const response = await api.get(`/academic-sessions/${id}`);
  return response.data?.data;
}

export async function createAcademicSession(payload) {
  const response = await api.post('/academic-sessions', payload);
  return response.data?.data;
}

export async function updateAcademicSession(id, payload) {
  const response = await api.patch(`/academic-sessions/${id}`, payload);
  return response.data?.data;
}

export async function changeAcademicSessionStatus(id, status) {
  const response = await api.patch(`/academic-sessions/${id}/status`, { status });
  return response.data?.data;
}

export async function setAcademicSessionCurrent(id) {
  const response = await api.patch(`/academic-sessions/${id}/set-current`);
  return response.data?.data;
}

export async function deleteAcademicSession(id) {
  const response = await api.delete(`/academic-sessions/${id}`);
  return response.data;
}

/* ── Classes API ── */

export async function fetchClasses(params = {}) {
  const response = await api.get('/classes', { params });
  return {
    classes: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchClassById(id) {
  const response = await api.get(`/classes/${id}`);
  return response.data?.data;
}

export async function createClass(payload) {
  const response = await api.post('/classes', payload);
  return response.data?.data;
}

export async function updateClass(id, payload) {
  const response = await api.patch(`/classes/${id}`, payload);
  return response.data?.data;
}

export async function deleteClass(id) {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
}

/* ── Sections API ── */

export async function fetchSections(params = {}) {
  const response = await api.get('/sections', { params });
  return {
    sections: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchSectionById(id) {
  const response = await api.get(`/sections/${id}`);
  return response.data?.data;
}

export async function createSection(payload) {
  const response = await api.post('/sections', payload);
  return response.data?.data;
}

export async function updateSection(id, payload) {
  const response = await api.patch(`/sections/${id}`, payload);
  return response.data?.data;
}

export async function deleteSection(id) {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
}

/* ── Subjects API ── */

export async function fetchSubjects(params = {}) {
  const response = await api.get('/subjects', { params });
  return {
    subjects: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function fetchSubjectById(id) {
  const response = await api.get(`/subjects/${id}`);
  return response.data?.data;
}

export async function createSubject(payload) {
  const response = await api.post('/subjects', payload);
  return response.data?.data;
}

export async function updateSubject(id, payload) {
  const response = await api.patch(`/subjects/${id}`, payload);
  return response.data?.data;
}

export async function deleteSubject(id) {
  const response = await api.delete(`/subjects/${id}`);
  return response.data;
}

/* ── Teacher Assignments API ── */

export async function fetchTeacherAssignments(params = {}) {
  const response = await api.get('/teacher-assignments', { params });
  return {
    assignments: response.data?.data || [],
    pagination: response.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
  };
}

export async function createTeacherAssignment(payload) {
  const response = await api.post('/teacher-assignments', payload);
  return response.data?.data;
}

export async function updateTeacherAssignment(id, payload) {
  const response = await api.patch(`/teacher-assignments/${id}`, payload);
  return response.data?.data;
}

export async function deleteTeacherAssignment(id) {
  const response = await api.delete(`/teacher-assignments/${id}`);
  return response.data;
}
