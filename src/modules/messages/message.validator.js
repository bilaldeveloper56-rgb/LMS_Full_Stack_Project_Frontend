import { z } from 'zod';
import { CONVERSATION_TYPE_VALUES } from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const attachmentSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().url('Invalid attachment URL'),
  fileType: z.string().trim().optional().default(''),
  sizeBytes: z.coerce.number().min(0).optional().default(0),
});

export const startConversationSchema = z.object({
  recipientUserId: objectIdSchema,
  type: z.enum(CONVERSATION_TYPE_VALUES).optional().default('DIRECT'),
  title: z.string().trim().max(100).optional().default(''),
  initialMessage: z.string().trim().min(1, 'Initial message content is required').max(4000),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content is required').max(4000),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export const queryConversationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const queryMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
