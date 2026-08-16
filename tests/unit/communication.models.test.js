import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Notice from '../../src/modules/notices/notice.model.js';
import Notification from '../../src/modules/notifications/notification.model.js';
import Conversation from '../../src/modules/messages/conversation.model.js';
import Message from '../../src/modules/messages/message.model.js';
import {
  NOTICE_PRIORITY,
  TARGET_AUDIENCE,
  NOTIFICATION_TYPE,
  NOTIFICATION_SEVERITY,
  CONVERSATION_TYPE,
} from '../../src/constants/index.js';

describe('Phase 8 Communication Models Unit Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const userId1 = '507f1f77bcf86cd799439022';
  const userId2 = '507f1f77bcf86cd799439033';

  describe('Notice Model', () => {
    it('should instantiate notice with target audience and defaults', () => {
      const notice = new Notice({
        schoolId,
        title: 'Annual Sports Day 2026',
        content: 'Sports day will be held on Nov 25th at the school grounds.',
        priority: NOTICE_PRIORITY.URGENT,
        targetAudience: TARGET_AUDIENCE.ALL,
        isPinned: true,
      });

      assert.equal(notice.title, 'Annual Sports Day 2026');
      assert.equal(notice.priority, NOTICE_PRIORITY.URGENT);
      assert.equal(notice.targetAudience, TARGET_AUDIENCE.ALL);
      assert.equal(notice.isPinned, true);
      assert.equal(notice.isPublished, false);
      assert.equal(notice.isDeleted, false);
    });

    it('should reject invalid notice priority', () => {
      const notice = new Notice({
        schoolId,
        title: 'Notice',
        content: 'Content',
        priority: 'INVALID_PRIORITY',
      });
      const err = notice.validateSync();
      assert.ok(err && err.errors.priority);
    });
    it('should strip isDeleted and __v in Notice toJSON', () => {
      const notice = new Notice({
        schoolId,
        title: 'Sports Day Notice',
        content: 'Details here',
      });
      const json = notice.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });

  describe('Notification Model', () => {
    it('should instantiate notification with default unread state', () => {
      const notif = new Notification({
        schoolId,
        recipientUserId: userId1,
        title: 'Fee Invoice Generated',
        message: 'Your Q1 fee invoice INV-2026-0001 is ready for payment.',
        type: NOTIFICATION_TYPE.FEE,
        severity: NOTIFICATION_SEVERITY.INFO,
      });

      assert.equal(notif.type, NOTIFICATION_TYPE.FEE);
      assert.equal(notif.isRead, false);
      assert.equal(notif.readAt, null);
    });

    it('should strip isDeleted and __v in Notification toJSON', () => {
      const notif = new Notification({
        schoolId,
        recipientUserId: userId1,
        title: 'Notice Alert',
        message: 'A new notice has been published.',
      });
      const json = notif.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });

  describe('Conversation & Message Models', () => {
    it('should instantiate conversation with participants', () => {
      const conv = new Conversation({
        schoolId,
        type: CONVERSATION_TYPE.DIRECT,
        participants: [
          { userId: userId1, role: 'TEACHER', unreadCount: 0 },
          { userId: userId2, role: 'PARENT', unreadCount: 1 },
        ],
        lastMessage: {
          content: 'Hello, how is student progress?',
          senderId: userId1,
          sentAt: new Date(),
        },
      });

      assert.equal(conv.type, CONVERSATION_TYPE.DIRECT);
      assert.equal(conv.participants.length, 2);
      assert.equal(conv.participants[1].unreadCount, 1);
    });

    it('should strip isDeleted and __v in Conversation toJSON', () => {
      const conv = new Conversation({
        schoolId,
        type: CONVERSATION_TYPE.DIRECT,
        participants: [
          { userId: userId1, role: 'TEACHER', unreadCount: 0 },
          { userId: userId2, role: 'PARENT', unreadCount: 0 },
        ],
      });
      const json = conv.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });

    it('should instantiate message item with read tracking', () => {
      const msg = new Message({
        schoolId,
        conversationId: '507f1f77bcf86cd799439088',
        senderUserId: userId1,
        senderRole: 'TEACHER',
        content: 'Please submit the leave application before Monday.',
        isReadBy: [{ userId: userId1, readAt: new Date() }],
      });

      assert.equal(msg.senderRole, 'TEACHER');
      assert.equal(msg.content, 'Please submit the leave application before Monday.');
      assert.equal(msg.isReadBy.length, 1);
    });
  });
});
