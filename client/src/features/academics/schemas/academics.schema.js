import { z } from 'zod';

export const SESSION_STATUS_OPTIONS = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const SUBJECT_TYPE_OPTIONS = [
  { value: 'CORE', label: 'Core Subject' },
  { value: 'ELECTIVE', label: 'Elective Subject' },
  { value: 'VOCATIONAL', label: 'Vocational Subject' },
  { value: 'EXTRA_CURRICULAR', label: 'Extra-Curricular' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/* ── Academic Session Schema ── */
export const sessionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Session name is required')
      .max(100, 'Session name cannot exceed 100 characters'),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }),
    endDate: z
      .string({ required_error: 'End date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).default('UPCOMING'),
    isCurrent: z.boolean().default(false),
  })
  .refine(
    (data) => new Date(data.startDate) < new Date(data.endDate),
    {
      message: 'Start date must precede end date',
      path: ['endDate'],
    }
  );

/* ── Class Schema ── */
export const classFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Class name is required')
    .max(100, 'Class name cannot exceed 100 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Class code is required')
    .max(50, 'Class code cannot exceed 50 characters'),
  academicSessionId: z
    .string({ required_error: 'Academic session is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  description: z.string().trim().max(500).optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

/* ── Section Schema ── */
export const sectionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Section name is required')
    .max(100, 'Section name cannot exceed 100 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Section code is required')
    .max(50, 'Section code cannot exceed 50 characters'),
  classId: z
    .string({ required_error: 'Class is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid session ID').optional().or(z.literal('')),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer').default(40),
  room: z.string().trim().max(50).optional(),
  classTeacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

/* ── Subject Schema ── */
export const subjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name cannot exceed 100 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Subject code is required')
    .max(50, 'Subject code cannot exceed 50 characters'),
  description: z.string().trim().max(500).optional(),
  subjectType: z.enum(['CORE', 'ELECTIVE', 'VOCATIONAL', 'EXTRA_CURRICULAR']).default('CORE'),
  isOptional: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/* ── Teacher Assignment Schema ── */
export const teacherAssignmentSchema = z.object({
  academicSessionId: z
    .string({ required_error: 'Academic session is required' })
    .regex(objectIdRegex, 'Invalid session ID format'),
  teacherId: z
    .string({ required_error: 'Teacher is required' })
    .regex(objectIdRegex, 'Invalid teacher ID format'),
  classId: z
    .string({ required_error: 'Class is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z
    .string({ required_error: 'Section is required' })
    .regex(objectIdRegex, 'Invalid section ID format'),
  subjectId: z
    .string({ required_error: 'Subject is required' })
    .regex(objectIdRegex, 'Invalid subject ID format'),
});
