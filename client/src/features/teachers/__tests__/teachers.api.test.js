import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchTeachers,
  fetchTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadTeacherAvatar,
  fetchTeacherAssignments,
} from '../api/teachers.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Teachers API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchTeachers should call GET /teachers with query params', async () => {
    const mockData = {
      data: [{ id: 't1', firstName: 'Marie', lastName: 'Curie' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    api.get.mockResolvedValueOnce({ data: { success: true, ...mockData } });

    const result = await fetchTeachers({ search: 'Marie' });
    expect(api.get).toHaveBeenCalledWith('/teachers', { params: { search: 'Marie' } });
    expect(result.teachers).toEqual(mockData.data);
  });

  it('fetchTeacherById should call GET /teachers/:id', async () => {
    const mockTeacher = { id: 't1', firstName: 'Marie' };
    api.get.mockResolvedValueOnce({ data: { success: true, data: mockTeacher } });

    const result = await fetchTeacherById('t1');
    expect(api.get).toHaveBeenCalledWith('/teachers/t1');
    expect(result).toEqual(mockTeacher);
  });

  it('createTeacher should call POST /teachers', async () => {
    const payload = { employeeId: 'EMP-01', firstName: 'Marie', lastName: 'Curie', email: 'm@school.edu' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 't1', ...payload } } });

    const result = await createTeacher(payload);
    expect(api.post).toHaveBeenCalledWith('/teachers', payload);
    expect(result.id).toBe('t1');
  });

  it('updateTeacher should call PATCH /teachers/:id', async () => {
    const payload = { designation: 'Head of Physics' };
    api.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 't1', ...payload } } });

    const result = await updateTeacher('t1', payload);
    expect(api.patch).toHaveBeenCalledWith('/teachers/t1', payload);
    expect(result.designation).toBe('Head of Physics');
  });

  it('deleteTeacher should call DELETE /teachers/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });

    const result = await deleteTeacher('t1');
    expect(api.delete).toHaveBeenCalledWith('/teachers/t1');
    expect(result.success).toBe(true);
  });

  it('uploadTeacherAvatar should send FormData to /uploads/avatar', async () => {
    const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
    api.post.mockResolvedValueOnce({ data: { success: true, data: { secureUrl: 'https://cdn.example.com/img.jpg' } } });

    const result = await uploadTeacherAvatar(file);
    expect(api.post).toHaveBeenCalledWith(
      '/uploads/avatar',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(result.secureUrl).toBe('https://cdn.example.com/img.jpg');
  });

  it('fetchTeacherAssignments should call GET /teacher-assignments', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'a1' }] } });

    const result = await fetchTeacherAssignments('t1');
    expect(api.get).toHaveBeenCalledWith('/teacher-assignments', { params: { teacherId: 't1', limit: 100 } });
    expect(result).toHaveLength(1);
  });
});
