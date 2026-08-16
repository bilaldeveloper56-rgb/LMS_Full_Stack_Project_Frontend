import { z } from 'zod';
import { ASSIGNMENT_STATUS_VALUES } from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const attachmentSchema = z.object({
  name: z.string().trim().min(1, 'Attachment name is required'),
  url: z.string().url('Invalid attachment URL'),
  fileType: z.string().trim().optional(),
});

export const createAssignmentSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  subjectId: objectIdSchema,
  teacherId: objectIdSchema.optional(), // If caller is teacher, inferred from teacher profile
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(3000),
  dueDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), 'Invalid due date'),
  maxScore: z.coerce.number().min(1).default(100),
  attachments: z.array(attachmentSchema).optional().default([]),
  allowLateSubmission: z.boolean().optional().default(true),
  lateSubmissionPenaltyPercentage: z.coerce.number().min(0).max(100).optional().default(0),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(3000).optional(),
  dueDate: z.coerce.date().optional(),
  maxScore: z.coerce.number().min(1).optional(),
  attachments: z.array(attachmentSchema).optional(),
  allowLateSubmission: z.boolean().optional(),
  lateSubmissionPenaltyPercentage: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(ASSIGNMENT_STATUS_VALUES).optional(),
});

export const queryAssignmentSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  status: z.enum(ASSIGNMENT_STATUS_VALUES).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const submitAssignmentSchema = z.object({
  submissionContent: z.string().trim().max(5000).optional().default(''),
  attachments: z.array(attachmentSchema).optional().default([]),
}).refine(
  (data) => (data.submissionContent && data.submissionContent.length > 0) || (data.attachments && data.attachments.length > 0),
  {
    message: 'Either submission text or at least one attachment must be provided',
    path: ['submissionContent'],
  }
);

export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().min(0, 'Score cannot be negative'),
  feedback: z.string().trim().max(2000).optional().nullable(),
});
