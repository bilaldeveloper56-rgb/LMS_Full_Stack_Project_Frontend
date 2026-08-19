import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchNotices,
  fetchNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
} from '../api/notices.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Notices API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchNotices should GET /notices with params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'n1', title: 'Winter Vacation' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });

    const result = await fetchNotices({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/notices', { params: { page: 1 } });
    expect(result.notices).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('fetchNoticeById should GET /notices/:id', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { notice: { id: 'n1', title: 'Winter Vacation' } },
      },
    });

    const notice = await fetchNoticeById('n1');
    expect(api.get).toHaveBeenCalledWith('/notices/n1');
    expect(notice.title).toBe('Winter Vacation');
  });

  it('createNotice, updateNotice, deleteNotice, and publishNotice should call respective endpoints', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, data: { notice: { id: 'n1' } } },
    });
    const created = await createNotice({ title: 'New Notice' });
    expect(api.post).toHaveBeenCalledWith('/notices', { title: 'New Notice' });
    expect(created.id).toBe('n1');

    api.patch.mockResolvedValueOnce({
      data: { success: true, data: { notice: { id: 'n1', title: 'Updated' } } },
    });
    const updated = await updateNotice('n1', { title: 'Updated' });
    expect(api.patch).toHaveBeenCalledWith('/notices/n1', { title: 'Updated' });
    expect(updated.title).toBe('Updated');

    api.post.mockResolvedValueOnce({
      data: { success: true, data: { notice: { id: 'n1', isPublished: true } } },
    });
    const published = await publishNotice('n1');
    expect(api.post).toHaveBeenCalledWith('/notices/n1/publish');
    expect(published.isPublished).toBe(true);

    api.delete.mockResolvedValueOnce({
      data: { success: true, message: 'Notice deleted successfully' },
    });
    const delRes = await deleteNotice('n1');
    expect(api.delete).toHaveBeenCalledWith('/notices/n1');
    expect(delRes.success).toBe(true);
  });
});
