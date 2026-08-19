import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Notifications API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchNotifications should call GET /notifications with query params', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          notifications: [{ id: 'n1', title: 'New Homework' }],
        },
        unreadCount: 1,
        pagination: { page: 1, total: 1 },
      },
    });

    const result = await fetchNotifications({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/notifications', { params: { page: 1 } });
    expect(result.notifications).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
  });

  it('markNotificationAsRead should call PATCH /notifications/:id/read', async () => {
    api.patch.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          notification: { id: 'n1', isRead: true },
        },
      },
    });

    const result = await markNotificationAsRead('n1');
    expect(api.patch).toHaveBeenCalledWith('/notifications/n1/read');
    expect(result.isRead).toBe(true);
  });

  it('markAllNotificationsAsRead should call POST /notifications/read-all', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Marked 3 notifications as read',
      },
    });

    const result = await markAllNotificationsAsRead();
    expect(api.post).toHaveBeenCalledWith('/notifications/read-all');
    expect(result.success).toBe(true);
  });
});
