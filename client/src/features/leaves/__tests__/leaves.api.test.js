import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  createLeave,
  fetchLeaves,
  fetchMyLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
} from '../api/leaves.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Leaves API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createLeave should call POST /leaves', async () => {
    const payload = { leaveType: 'SICK', reason: 'Flu' };
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'l1', ...payload } } });

    const result = await createLeave(payload);
    expect(api.post).toHaveBeenCalledWith('/leaves', payload);
    expect(result.id).toBe('l1');
  });

  it('fetchLeaves and fetchMyLeaves should call proper endpoints', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [{ id: 'l1' }], pagination: { page: 1, total: 1 } },
    });
    const result1 = await fetchLeaves({ status: 'PENDING' });
    expect(api.get).toHaveBeenCalledWith('/leaves', { params: { status: 'PENDING' } });
    expect(result1.leaves).toHaveLength(1);

    api.get.mockResolvedValueOnce({
      data: { success: true, data: [{ id: 'l2' }], pagination: { page: 1, total: 1 } },
    });
    const result2 = await fetchMyLeaves();
    expect(api.get).toHaveBeenCalledWith('/leaves/my', { params: {} });
    expect(result2.leaves).toHaveLength(1);
  });

  it('approveLeave and rejectLeave should call approval endpoints', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'l1', status: 'APPROVED' } } });
    const resultApprove = await approveLeave('l1');
    expect(api.post).toHaveBeenCalledWith('/leaves/l1/approve');
    expect(resultApprove.status).toBe('APPROVED');

    api.post.mockResolvedValueOnce({ data: { success: true, data: { id: 'l1', status: 'REJECTED' } } });
    const resultReject = await rejectLeave('l1', { rejectionReason: 'Exam scheduled' });
    expect(api.post).toHaveBeenCalledWith('/leaves/l1/reject', { rejectionReason: 'Exam scheduled' });
    expect(resultReject.status).toBe('REJECTED');
  });

  it('cancelLeave and deleteLeave should call proper endpoints', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });
    await cancelLeave('l1');
    expect(api.post).toHaveBeenCalledWith('/leaves/l1/cancel');

    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await deleteLeave('l1');
    expect(api.delete).toHaveBeenCalledWith('/leaves/l1');
  });
});
