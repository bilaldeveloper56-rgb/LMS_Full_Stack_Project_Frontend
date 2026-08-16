import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/responseHelper.js';
import * as notificationService from './notification.service.js';

export const getUserNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.query, req.user);
  return sendPaginated(
    res,
    'Notifications retrieved successfully',
    result.notifications,
    result.pagination,
    { unreadCount: result.unreadCount }
  );
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const notification = await notificationService.markNotificationAsRead(req.params.id, req.user, meta);
  return sendSuccess(res, 200, 'Notification marked as read', { notification });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await notificationService.markAllNotificationsAsRead(req.user, meta);
  return sendSuccess(res, 200, result.message);
});
