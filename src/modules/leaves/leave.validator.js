import { z } from 'zod';
import {
  LEAVE_TYPE_VALUES,
  LEAVE_DAY_TYPE_VALUES,
  LEAVE_STATUS_VALUES,
} from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createLeaveSchema = z
  .object({
    studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
    teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
    leaveType: z.enum(LEAVE_TYPE_VALUES, {
      errorMap: () => ({ message: 'Invalid leave type' }),
    }),
    dayType: z.enum(LEAVE_DAY_TYPE_VALUES).default('FULL_DAY'),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }),
    endDate: z
      .string({ required_error: 'End date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }),
    reason: z
      .string({ required_error: 'Reason is required' })
      .trim()
      .min(3, 'Reason must be at least 3 characters')
      .max(500, 'Reason cannot exceed 500 characters'),
    attachmentUrl: z.string().url().nullable().optional(),
    schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  });

export const updateLeaveSchema = z
  .object({
    leaveType: z.enum(LEAVE_TYPE_VALUES).optional(),
    dayType: z.enum(LEAVE_DAY_TYPE_VALUES).optional(),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }).optional(),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }).optional(),
    reason: z.string().trim().min(3).max(500).optional(),
    attachmentUrl: z.string().url().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

export const rejectLeaveSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(250, 'Rejection reason cannot exceed 250 characters'),
});

export const queryLeavesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(LEAVE_STATUS_VALUES).optional(),
  leaveType: z.enum(LEAVE_TYPE_VALUES).optional(),
  dayType: z.enum(LEAVE_DAY_TYPE_VALUES).optional(),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
  applicantUserId: z.string().regex(objectIdRegex, 'Invalid applicant user ID format').optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }).optional(),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }).optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['startDate', 'endDate', 'status', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

function createValidator(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(AppError.validationError('Validation failed', errors));
      }
      next(error);
    }
  };
}

export const validateCreateLeave = createValidator(createLeaveSchema, 'body');
export const validateUpdateLeave = createValidator(updateLeaveSchema, 'body');
export const validateRejectLeave = createValidator(rejectLeaveSchema, 'body');
export const validateQueryLeaves = createValidator(queryLeavesSchema, 'query');
