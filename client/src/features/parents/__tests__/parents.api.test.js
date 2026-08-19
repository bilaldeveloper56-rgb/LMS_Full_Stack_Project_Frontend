import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchParents,
  fetchParentById,
  fetchParentChildren,
  createParent,
  updateParent,
  deleteParent,
  linkStudentParent,
  unlinkStudentParent,
} from '../api/parents.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Parents API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchParents should call GET /parents', async () => {
    const mockData = {
      data: [{ id: 'p1', firstName: 'Martha', lastName: 'Wayne' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    api.get.mockResolvedValueOnce({ data: { success: true, ...mockData } });

    const result = await fetchParents({ search: 'Wayne' });
    expect(api.get).toHaveBeenCalledWith('/parents', { params: { search: 'Wayne' } });
    expect(result.parents).toEqual(mockData.data);
  });

  it('fetchParentById should call GET /parents/:id', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: { id: 'p1' } } });
    const result = await fetchParentById('p1');
    expect(api.get).toHaveBeenCalledWith('/parents/p1');
    expect(result.id).toBe('p1');
  });

  it('fetchParentChildren should call GET /parents/:id/children', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [{ student: { firstName: 'Bruce' } }] } });
    const result = await fetchParentChildren('p1');
    expect(api.get).toHaveBeenCalledWith('/parents/p1/children');
    expect(result).toHaveLength(1);
  });

  it('createParent should call POST /parents', async () => {
    const payload = { firstName: 'Thomas', lastName: 'Wayne', email: 't@wayne.com', phone: '555-000' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'p2', ...payload } } });

    const result = await createParent(payload);
    expect(api.post).toHaveBeenCalledWith('/parents', payload);
    expect(result.id).toBe('p2');
  });

  it('updateParent should call PATCH /parents/:id', async () => {
    const payload = { phone: '555-999' };
    api.patch.mockResolvedValueOnce({ data: { success: true, data: { id: 'p2', ...payload } } });

    const result = await updateParent('p2', payload);
    expect(api.patch).toHaveBeenCalledWith('/parents/p2', payload);
    expect(result.phone).toBe('555-999');
  });

  it('deleteParent should call DELETE /parents/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true, message: 'Deleted' } });
    const result = await deleteParent('p2');
    expect(api.delete).toHaveBeenCalledWith('/parents/p2');
    expect(result.success).toBe(true);
  });

  it('linkStudentParent should call POST /student-parent-links', async () => {
    const payload = { studentId: 's1', parentId: 'p1', relationshipType: 'MOTHER' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'l1', ...payload } } });

    const result = await linkStudentParent(payload);
    expect(api.post).toHaveBeenCalledWith('/student-parent-links', payload);
    expect(result.id).toBe('l1');
  });

  it('unlinkStudentParent should call DELETE /student-parent-links/:id', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    const result = await unlinkStudentParent('l1');
    expect(api.delete).toHaveBeenCalledWith('/student-parent-links/l1');
    expect(result.success).toBe(true);
  });
});
