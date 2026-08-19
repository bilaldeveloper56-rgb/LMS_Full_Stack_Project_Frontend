import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchAcademicSessions,
  createAcademicSession,
  setAcademicSessionCurrent,
  fetchClasses,
  createClass,
  fetchSections,
  createSection,
  fetchSubjects,
  createSubject,
  fetchTeacherAssignments,
  createTeacherAssignment,
  deleteTeacherAssignment,
} from '../api/academics.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Academics API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAcademicSessions should call GET /academic-sessions', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [{ id: 'ses1', name: '2026-2027' }], pagination: {} },
    });
    const result = await fetchAcademicSessions();
    expect(api.get).toHaveBeenCalledWith('/academic-sessions', { params: {} });
    expect(result.sessions).toHaveLength(1);
  });

  it('setAcademicSessionCurrent should call PATCH /academic-sessions/:id/set-current', async () => {
    api.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 'ses1', isCurrent: true } } });
    const result = await setAcademicSessionCurrent('ses1');
    expect(api.patch).toHaveBeenCalledWith('/academic-sessions/ses1/set-current');
    expect(result.isCurrent).toBe(true);
  });

  it('fetchClasses and createClass should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'c1' }] } });
    await fetchClasses();
    expect(api.get).toHaveBeenCalledWith('/classes', { params: {} });

    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'c2' } } });
    await createClass({ name: 'Grade 10' });
    expect(api.post).toHaveBeenCalledWith('/classes', { name: 'Grade 10' });
  });

  it('fetchSections and createSection should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'sec1' }] } });
    await fetchSections();
    expect(api.get).toHaveBeenCalledWith('/sections', { params: {} });

    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'sec2' } } });
    await createSection({ name: 'Section A' });
    expect(api.post).toHaveBeenCalledWith('/sections', { name: 'Section A' });
  });

  it('fetchSubjects and createSubject should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'sub1' }] } });
    await fetchSubjects();
    expect(api.get).toHaveBeenCalledWith('/subjects', { params: {} });

    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'sub2' } } });
    await createSubject({ name: 'Physics' });
    expect(api.post).toHaveBeenCalledWith('/subjects', { name: 'Physics' });
  });

  it('fetchTeacherAssignments, createTeacherAssignment, and deleteTeacherAssignment should work properly', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'a1' }] } });
    await fetchTeacherAssignments();
    expect(api.get).toHaveBeenCalledWith('/teacher-assignments', { params: {} });

    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'a2' } } });
    await createTeacherAssignment({ teacherId: 't1' });
    expect(api.post).toHaveBeenCalledWith('/teacher-assignments', { teacherId: 't1' });

    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await deleteTeacherAssignment('a2');
    expect(api.delete).toHaveBeenCalledWith('/teacher-assignments/a2');
  });
});
