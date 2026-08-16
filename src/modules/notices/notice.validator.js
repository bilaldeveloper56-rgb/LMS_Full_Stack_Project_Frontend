import { z } from 'zod';
import {
  NOTICE_PRIORITY_VALUES,
  TARGET_AUDIENCE_VALUES,
} from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const attachmentSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().url('Invalid attachment URL'),
  fileType: z.string().trim().optional().default(''),
  sizeBytes: z.coerce.number().min(0).optional().default(0),
});

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().trim().min(1, 'Content is required'),
  priority: z.enum(NOTICE_PRIORITY_VALUES).optional().default('NORMAL'),
  targetAudience: z.enum(TARGET_AUDIENCE_VALUES).optional().default('ALL'),
  targetClassIds: z.array(objectIdSchema).optional().default([]),
  targetSectionIds: z.array(objectIdSchema).optional().default([]),
  attachments: z.array(attachmentSchema).optional().default([]),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().or(z.string().date()).optional(),
});

export const updateNoticeSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).optional(),
  priority: z.enum(NOTICE_PRIORITY_VALUES).optional(),
  targetAudience: z.enum(TARGET_AUDIENCE_VALUES).optional(),
  targetClassIds: z.array(objectIdSchema).optional(),
  targetSectionIds: z.array(objectIdSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().datetime().or(z.string().date()).optional(),
});

export const queryNoticeSchema = z.object({
  targetAudience: z.enum(TARGET_AUDIENCE_VALUES).optional(),
  priority: z.enum(NOTICE_PRIORITY_VALUES).optional(),
  isPinned: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
