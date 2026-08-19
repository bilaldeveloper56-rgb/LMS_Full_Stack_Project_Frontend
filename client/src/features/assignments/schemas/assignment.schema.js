import { z } from 'zod';

export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'LATE', label: 'Late Submission' },
  { value: 'GRADED', label: 'Graded' },
  { value: 'RESUBMITTED', label: 'Resubmitted' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ID format');

export const attachmentSchema = z.object({
  name: z.string().trim().min(1, 'Attachment name is required'),
  url: z.string().url('Invalid attachment URL'),
  fileType: z.string().trim().optional(),
});

export const createAssignmentSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  subjectId: objectIdSchema,
  teacherId: objectIdSchema.optional().or(z.literal('')),
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description is required')
    .max(3000, 'Description cannot exceed 3000 characters'),
  dueDate: z.string({ required_error: 'Due date is required' }).refine(
    (d) => !isNaN(Date.parse(d)),
    { message: 'Invalid due date' }
  ),
  maxScore: z.coerce.number().min(1, 'Max score must be at least 1').default(100),
  allowLateSubmission: z.boolean().default(true),
  lateSubmissionPenaltyPercentage: z.coerce.number().min(0).max(100).default(0),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(3000).optional(),
  dueDate: z
    .string()
    .optional()
    .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Invalid due date' }),
  maxScore: z.coerce.number().min(1).optional(),
  allowLateSubmission: z.boolean().optional(),
  lateSubmissionPenaltyPercentage: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export const submitAssignmentSchema = z
  .object({
    submissionContent: z.string().trim().max(5000, 'Submission text cannot exceed 5000 characters').optional().default(''),
    attachments: z.array(attachmentSchema).optional().default([]),
  })
  .refine(
    (data) => (data.submissionContent && data.submissionContent.trim().length > 0) || (data.attachments && data.attachments.length > 0),
    {
      message: 'Please provide either submission text or at least one file attachment',
      path: ['submissionContent'],
    }
  );

export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().min(0, 'Score cannot be negative'),
  feedback: z.string().trim().max(2000, 'Feedback cannot exceed 2000 characters').optional().or(z.literal('')),
});
