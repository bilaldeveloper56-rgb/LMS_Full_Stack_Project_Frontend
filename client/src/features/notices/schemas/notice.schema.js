import { z } from 'zod';

export const NOTICE_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENT', label: 'Urgent' },
];

export const TARGET_AUDIENCES = [
  { value: 'ALL', label: 'Entire School (Everyone)' },
  { value: 'TEACHERS', label: 'Teachers / Faculty Only' },
  { value: 'STUDENTS', label: 'Students Only' },
  { value: 'PARENTS', label: 'Parents / Guardians Only' },
  { value: 'CLASS_SPECIFIC', label: 'Specific Classes' },
];

export const noticeAttachmentSchema = z.object({
  name: z.string().trim().min(1, 'File name is required'),
  url: z.string().url('Invalid attachment URL'),
  fileType: z.string().trim().optional().default(''),
  sizeBytes: z.coerce.number().min(0).optional().default(0),
});

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Notice title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().trim().min(1, 'Notice content is required'),
  priority: z.enum(['LOW', 'NORMAL', 'URGENT']).default('NORMAL'),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS_SPECIFIC']).default('ALL'),
  targetClassIds: z.array(z.string()).optional().default([]),
  targetSectionIds: z.array(z.string()).optional().default([]),
  attachments: z.array(noticeAttachmentSchema).optional().default([]),
  isPinned: z.boolean().optional().default(false),
  expiresAt: z.string().optional().default(''),
});

export const updateNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Notice title is required').max(200, 'Title cannot exceed 200 characters').optional(),
  content: z.string().trim().min(1, 'Notice content is required').optional(),
  priority: z.enum(['LOW', 'NORMAL', 'URGENT']).optional(),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS_SPECIFIC']).optional(),
  targetClassIds: z.array(z.string()).optional(),
  targetSectionIds: z.array(z.string()).optional(),
  attachments: z.array(noticeAttachmentSchema).optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().optional(),
});
