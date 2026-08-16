import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Notification from '../../src/modules/notifications/notification.model.js';
import * as notificationService from '../../src/modules/notifications/notification.service.js';
import { ROLES, NOTIFICATION_TYPE } from '../../src/constants/index.js';

describe('Notification Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const recipientUserId = '507f1f77bcf86cd799439022';
  const notifId = '507f1f77bcf86cd799439033';

  const user = { id: recipientUserId, role: ROLES.STUDENT, schoolId };

  it('should create notification item', async () => {
    const origNotifSave = Notification.prototype.save;
    Notification.prototype.save = function () {
      this._id = notifId;
      return Promise.resolve(this);
    };

    const notif = await notificationService.createNotification({
      schoolId,
      recipientUserId,
      title: 'Assignment Graded',
      message: 'Your Math Assignment 1 has been graded.',
      type: NOTIFICATION_TYPE.ASSIGNMENT,
    });

    Notification.prototype.save = origNotifSave;

    assert.equal(notif.title, 'Assignment Graded');
    assert.equal(notif.type, NOTIFICATION_TYPE.ASSIGNMENT);
  });

  it('should retrieve user notifications with unread count', async () => {
    const origNotifFind = Notification.find;
    const origNotifCount = Notification.countDocuments;

    const mockQuery = {
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: notifId,
            title: 'Assignment Graded',
            isRead: false,
            toJSON: () => ({ id: notifId, title: 'Assignment Graded', isRead: false }),
          },
        ]),
    };

    Notification.find = () => mockQuery;
    let countCall = 0;
    Notification.countDocuments = () => {
      countCall++;
      return Promise.resolve(1); // total = 1, unreadCount = 1
    };

    const result = await notificationService.getUserNotifications({}, user);

    Notification.find = origNotifFind;
    Notification.countDocuments = origNotifCount;

    assert.equal(result.notifications.length, 1);
    assert.equal(result.unreadCount, 1);
  });

  it('should mark single notification as read', async () => {
    const mockNotif = {
      _id: notifId,
      recipientUserId,
      schoolId,
      isRead: false,
      readAt: null,
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origNotifFindOne = Notification.findOne;
    Notification.findOne = () => Promise.resolve(mockNotif);

    const updated = await notificationService.markNotificationAsRead(notifId, user);

    Notification.findOne = origNotifFindOne;

    assert.equal(updated.isRead, true);
    assert.ok(updated.readAt);
  });

  it('should mark all notifications as read', async () => {
    const origNotifUpdateMany = Notification.updateMany;
    Notification.updateMany = () => Promise.resolve({ modifiedCount: 3 });

    const result = await notificationService.markAllNotificationsAsRead(user);

    Notification.updateMany = origNotifUpdateMany;

    assert.equal(result.success, true);
    assert.ok(result.message.includes('3'));
  });

  it('should reject notification creation if required fields are missing', async () => {
    await assert.rejects(
      () =>
        notificationService.createNotification({
          schoolId,
          recipientUserId: null,
          title: 'Missing Recipient',
        }),
      (err) => err.statusCode === 400 && err.message.includes('Missing required fields')
    );
  });

  it('should throw 404 when marking non-existent notification as read', async () => {
    const origNotifFindOne = Notification.findOne;
    Notification.findOne = () => Promise.resolve(null);

    await assert.rejects(
      () => notificationService.markNotificationAsRead(notifId, user),
      (err) => err.statusCode === 404 && err.message.includes('not found')
    );

    Notification.findOne = origNotifFindOne;
  });
});
