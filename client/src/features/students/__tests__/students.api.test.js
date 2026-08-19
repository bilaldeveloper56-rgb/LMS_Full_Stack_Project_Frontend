import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchStudents,
  fetchStudentById,
  fetchStudentProfile,
  fetchStudentAcademic,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentAvatar,
  fetchClasses,
  fetchSections,
  fetchAcademicSessions,
} from '../api/students.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Students API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchStudents should call GET /students with query params', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [{ id: 's1', firstName: 'Alice' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };
    api.get.mockResolvedValueOnce(mockResponse);

    const params = { search: 'Alice', classId: 'c1' };
    const result = await fetchStudents(params);

    expect(api.get).toHaveBeenCalledWith('/students', { params });
    expect(result.students).toEqual(mockResponse.data.data);
    expect(result.pagination).toEqual(mockResponse.data.pagination);
  });

  it('fetchStudentById should call GET /students/:id', async () => {
    const mockStudent = { id: 's1', firstName: 'Bob' };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockStudent } });

    const result = await fetchStudentById('s1');

    expect(api.get).toHaveBeenCalledWith('/students/s1');
    expect(result).toEqual(mockStudent);
  });

  it('fetchStudentProfile should call GET /students/:id/profile', async () => {
    const mockProfile = { id: 's1', parents: [] };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockProfile } });

    const result = await fetchStudentProfile('s1');

    expect(api.get).toHaveBeenCalledWith('/students/s1/profile');
    expect(result).toEqual(mockProfile);
  });

  it('fetchStudentAcademic should call GET /students/:id/academic', async () => {
    const mockAcademic = { student: {}, enrollments: [], currentSubjects: [] };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockAcademic } });

    const result = await fetchStudentAcademic('s1');

    expect(api.get).toHaveBeenCalledWith('/students/s1/academic');
    expect(result).toEqual(mockAcademic);
  });

  it('createStudent should call POST /students with payload', async () => {
    const payload = { firstName: 'Charlie', admissionNumber: 'ADM-001' };
    const mockCreated = { id: 's2', ...payload };
    api.post.mockResolvedValueOnce({ data: { success: true, data: mockCreated } });

    const result = await createStudent(payload);

    expect(api.post).toHaveBeenCalledWith('/students', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateStudent should call PATCH /students/:id with payload', async () => {
    const payload = { firstName: 'Charlie Updated' };
    const mockUpdated = { id: 's2', ...payload };
    api.patch.mockResolvedValueOnce({ data: { success: true, data: mockUpdated } });

    const result = await updateStudent('s2', payload);

    expect(api.patch).toHaveBeenCalledWith('/students/s2', payload);
    expect(result).toEqual(mockUpdated);
  });

  it('deleteStudent should call DELETE /students/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });

    const result = await deleteStudent('s2');

    expect(api.delete).toHaveBeenCalledWith('/students/s2');
    expect(result.success).toBe(true);
  });

  it('uploadStudentAvatar should send FormData to POST /uploads/avatar', async () => {
    const mockFile = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const mockResult = { secureUrl: 'https://cdn.example.com/photo.png' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: mockResult } });

    const result = await uploadStudentAvatar(mockFile);

    expect(api.post).toHaveBeenCalledWith(
      '/uploads/avatar',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
    expect(result).toEqual(mockResult);
  });

  it('fetchClasses, fetchSections, fetchAcademicSessions should fetch options', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: [{ id: '1', name: 'Opt' }] } });

    const classes = await fetchClasses();
    const sections = await fetchSections();
    const sessions = await fetchAcademicSessions();

    expect(classes).toHaveLength(1);
    expect(sections).toHaveLength(1);
    expect(sessions).toHaveLength(1);
  });
});
