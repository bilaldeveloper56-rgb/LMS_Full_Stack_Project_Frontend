import api from '@/config/api';

/**
 * Fetch paginated user notifications with unread count.
 * @param {object} [params]
 * @param {boolean} [params.isRead]
 * @param {string} [params.type]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @returns {Promise<{ notifications: Array, unreadCount: number, pagination: object }>}
 */
export async function fetchNotifications(params = {}) {
  const response = await api.get('/notifications', { params });
  return {
    notifications: response.data?.data?.notifications || [],
    unreadCount: response.data?.unreadCount ?? 0,
    pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

/**
 * Mark a single notification as read.
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function markNotificationAsRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data?.data?.notification;
}

/**
 * Mark all notifications as read for current user.
 * @returns {Promise<object>}
 */
export async function markAllNotificationsAsRead() {
  const response = await api.post('/notifications/read-all');
  return response.data;
}
