import { describe, it, expect } from 'vitest';
import {
  startConversationSchema,
  sendMessageSchema,
} from '../schemas/message.schema';

describe('Messaging Schemas', () => {
  it('should validate startConversationSchema', () => {
    const valid = {
      recipientUserId: '507f1f77bcf86cd799439011',
      title: 'Math Project',
      initialMessage: 'Can we discuss the schedule?',
    };
    expect(startConversationSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      recipientUserId: '',
      initialMessage: '',
    };
    expect(startConversationSchema.safeParse(invalid).success).toBe(false);
  });

  it('should validate sendMessageSchema', () => {
    expect(sendMessageSchema.safeParse({ content: 'Hello teacher' }).success).toBe(true);
    expect(sendMessageSchema.safeParse({ content: '   ' }).success).toBe(false);
  });
});
