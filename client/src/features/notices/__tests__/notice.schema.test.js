import { describe, it, expect } from 'vitest';
import {
  createNoticeSchema,
  updateNoticeSchema,
} from '../schemas/notice.schema';

describe('Notices Zod Schemas', () => {
  it('should validate valid createNoticeSchema', () => {
    const valid = {
      title: 'Annual Sports Day',
      content: 'All classes will assemble at 9 AM.',
      priority: 'URGENT',
      targetAudience: 'ALL',
      attachments: [{ name: 'Rules.pdf', url: 'https://example.com/rules.pdf' }],
      isPinned: true,
    };
    expect(createNoticeSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject invalid createNoticeSchema with empty title or content', () => {
    expect(createNoticeSchema.safeParse({ title: '', content: 'Content' }).success).toBe(false);
    expect(createNoticeSchema.safeParse({ title: 'Title', content: '' }).success).toBe(false);
    expect(
      createNoticeSchema.safeParse({
        title: 'Title',
        content: 'Content',
        attachments: [{ name: 'Bad', url: 'not-a-url' }],
      }).success
    ).toBe(false);
  });

  it('should validate updateNoticeSchema with partial payload', () => {
    expect(updateNoticeSchema.safeParse({ title: 'New Title' }).success).toBe(true);
    expect(updateNoticeSchema.safeParse({ priority: 'LOW' }).success).toBe(true);
  });
});
