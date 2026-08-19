import { z } from 'zod';

export const startConversationSchema = z.object({
  recipientUserId: z.string().min(1, 'Please select a recipient'),
  title: z.string().trim().max(100).optional().default(''),
  initialMessage: z.string().trim().min(1, 'Message content cannot be empty').max(4000),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});
