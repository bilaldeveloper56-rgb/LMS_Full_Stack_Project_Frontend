import mongoose from 'mongoose';
import Notification from './notification.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS } from '../../constants/index.js';

export async function createNotification(data, meta = {}) {
  if (!data.schoolId || !data.recipientUserId || !data.title || !data.message) {
    throw AppError.badRequest('Missing required fields for notification');
  }

  const notification = new Notification({
    schoolId: data.schoolId,
    recipientUserId: data.recipientUserId,
    title: data.title,
    message: data.message,
    type: data.type || 'SYSTEM',
    severity: data.severity || 'INFO',
    linkUrl: data.linkUrl || '',
    metadata: data.metadata || {},
  });

  await notification.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTIFICATION_SENT,
    userId: data.recipientUserId,
    schoolId: data.schoolId,
    entityType: 'Notification',
    entityId: notification._id,
    details: { title: data.title, type: data.type },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return notification.toJSON();
}

export async function getUserNotifications(filters, user) {
  const query = {
    recipientUserId: user.id,
  };
  if (user.schoolId) query.schoolId = user.schoolId;

  if (filters.isRead !== undefined) query.isRead = filters.isRead;
  if (filters.type) query.type = filters.type;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({
      recipientUserId: user.id,
      isRead: false,
      ...(user.schoolId ? { schoolId: user.schoolId } : {}),
    }),
  ]);

  return {
    notifications: notifications.map((n) => n.toJSON()),
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function markNotificationAsRead(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid notification ID format');

  const query = {
    _id: id,
    recipientUserId: user.id,
  };
  if (user.schoolId) query.schoolId = user.schoolId;

  const notification = await Notification.findOne(query);
  if (!notification) throw AppError.notFound('Notification not found');

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTIFICATION_READ,
    userId: user.id,
    schoolId: notification.schoolId,
    entityType: 'Notification',
    entityId: notification._id,
    details: { readAt: notification.readAt },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return notification.toJSON();
}

export async function markAllNotificationsAsRead(user, meta = {}) {
  const query = {
    recipientUserId: user.id,
    isRead: false,
  };
  if (user.schoolId) query.schoolId = user.schoolId;

  const result = await Notification.updateMany(query, {
    isRead: true,
    readAt: new Date(),
  });

  await logAuditEvent({
    event: AUTH_EVENTS.NOTIFICATION_READ,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'Notification',
    details: { markedCount: result.modifiedCount },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: `Marked ${result.modifiedCount} notifications as read` };
}
