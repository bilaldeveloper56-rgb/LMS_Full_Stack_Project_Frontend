import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createNoticeSchema,
  updateNoticeSchema,
  queryNoticeSchema,
} from '../../src/modules/notices/notice.validator.js';
import {
  startConversationSchema,
  sendMessageSchema,
} from '../../src/modules/messages/message.validator.js';

describe('Phase 8 Communication Validators Unit Tests', () => {
  const validObjectId = '507f1f77bcf86cd799439011';

  describe('createNoticeSchema', () => {
    it('should validate notice creation payload with attachments', () => {
      const parsed = createNoticeSchema.parse({
        title: 'Science Fair 2026',
        content: 'Registration is now open for Science Fair.',
        priority: 'NORMAL',
        targetAudience: 'STUDENTS',
        attachments: [
          {
            name: 'fair_guidelines.pdf',
            url: 'https://cdn.schoolerp.com/docs/guidelines.pdf',
            fileType: 'application/pdf',
            sizeBytes: 102400,
          },
        ],
      });
      assert.equal(parsed.title, 'Science Fair 2026');
      assert.equal(parsed.attachments.length, 1);
    });

    it('should reject invalid attachment url in notice', () => {
      assert.throws(() => {
        createNoticeSchema.parse({
          title: 'Notice',
          content: 'Content',
          attachments: [{ name: 'file.pdf', url: 'not-a-valid-url' }],
        });
      });
    });
  });

  describe('updateNoticeSchema', () => {
    it('should validate partial notice update payload', () => {
      const parsed = updateNoticeSchema.parse({
        priority: 'URGENT',
        isPinned: true,
      });
      assert.equal(parsed.priority, 'URGENT');
      assert.equal(parsed.isPinned, true);
    });
  });

  describe('startConversationSchema', () => {
    it('should validate start conversation payload', () => {
      const parsed = startConversationSchema.parse({
        recipientUserId: validObjectId,
        initialMessage: 'Good afternoon, when is the next parent-teacher meeting?',
      });
      assert.equal(parsed.recipientUserId, validObjectId);
      assert.equal(parsed.initialMessage, 'Good afternoon, when is the next parent-teacher meeting?');
    });

    it('should reject empty initial message in conversation', () => {
      assert.throws(() => {
        startConversationSchema.parse({
          recipientUserId: validObjectId,
          initialMessage: '',
        });
      });
    });
  });

  describe('sendMessageSchema', () => {
    it('should validate send message payload', () => {
      const parsed = sendMessageSchema.parse({
        content: 'The meeting is scheduled for this Friday at 3 PM.',
      });
      assert.equal(parsed.content, 'The meeting is scheduled for this Friday at 3 PM.');
    });
  });

  describe('queryNoticeSchema', () => {
    it('should validate query filters for notices', () => {
      const parsed = queryNoticeSchema.parse({
        targetAudience: 'TEACHERS',
        priority: 'URGENT',
        isPinned: 'true',
      });
      assert.equal(parsed.targetAudience, 'TEACHERS');
      assert.equal(parsed.priority, 'URGENT');
      assert.equal(parsed.isPinned, true);
    });
  });

  describe('queryConversationSchema & queryMessagesSchema', () => {
    it('should validate conversation list pagination query', () => {
      const parsed = queryNoticeSchema.parse({
        page: '2',
        limit: '10',
      });
      assert.equal(parsed.page, 2);
      assert.equal(parsed.limit, 10);
    });
  });
});
