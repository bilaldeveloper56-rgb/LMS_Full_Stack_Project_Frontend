import { z } from 'zod';
import {
  ATTENDANCE_STATUS_VALUES,
  ATTENDANCE_SOURCE_VALUES,
} from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createAttendanceSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  academicSessionId: z
    .string({ required_error: 'Academic session ID is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  classId: z
    .string({ required_error: 'Class ID is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z
    .string({ required_error: 'Section ID is required' })
    .regex(objectIdRegex, 'Invalid section ID format'),
  date: z
    .string({ required_error: 'Date is required' })
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid attendance date' }),
  status: z.enum(ATTENDANCE_STATUS_VALUES, {
    errorMap: () => ({ message: 'Invalid attendance status' }),
  }),
  checkInTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-in time' }).optional(),
  checkOutTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-out time' }).optional(),
  remarks: z.string().trim().max(250).nullable().optional(),
  source: z.enum(ATTENDANCE_SOURCE_VALUES).default('MANUAL'),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateAttendanceSchema = z.object({
  status: z.enum(ATTENDANCE_STATUS_VALUES).optional(),
  checkInTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-in time' }).nullable().optional(),
  checkOutTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-out time' }).nullable().optional(),
  remarks: z.string().trim().max(250).nullable().optional(),
  source: z.enum(ATTENDANCE_SOURCE_VALUES).optional(),
});

export const correctAttendanceSchema = z.object({
  status: z.enum(ATTENDANCE_STATUS_VALUES, {
    errorMap: () => ({ message: 'Invalid attendance status' }),
  }),
  correctionReason: z
    .string({ required_error: 'Correction reason is required' })
    .trim()
    .min(3, 'Correction reason must be at least 3 characters')
    .max(250, 'Correction reason cannot exceed 250 characters'),
  remarks: z.string().trim().max(250).nullable().optional(),
  checkInTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-in time' }).nullable().optional(),
  checkOutTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-out time' }).nullable().optional(),
});

export const singleStudentAttendanceRecordSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  status: z.enum(ATTENDANCE_STATUS_VALUES, {
    errorMap: () => ({ message: 'Invalid attendance status' }),
  }),
  remarks: z.string().trim().max(250).nullable().optional(),
  checkInTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-in time' }).optional(),
  checkOutTime: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid check-out time' }).optional(),
});

export const bulkAttendanceSchema = z.object({
  academicSessionId: z
    .string({ required_error: 'Academic session ID is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  classId: z
    .string({ required_error: 'Class ID is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z
    .string({ required_error: 'Section ID is required' })
    .regex(objectIdRegex, 'Invalid section ID format'),
  date: z
    .string({ required_error: 'Date is required' })
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid attendance date' }),
  records: z
    .array(singleStudentAttendanceRecordSchema)
    .min(1, 'At least one student attendance record is required'),
  source: z.enum(ATTENDANCE_SOURCE_VALUES).default('MANUAL'),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const queryAttendanceSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  status: z.enum(ATTENDANCE_STATUS_VALUES).optional(),
  source: z.enum(ATTENDANCE_SOURCE_VALUES).optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }).optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }).optional(),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }).optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['date', 'status', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const queryAttendanceReportSchema = z.object({
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }).optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }).optional(),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }).optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
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

export const validateCreateAttendance = createValidator(createAttendanceSchema, 'body');
export const validateUpdateAttendance = createValidator(updateAttendanceSchema, 'body');
export const validateCorrectAttendance = createValidator(correctAttendanceSchema, 'body');
export const validateBulkAttendance = createValidator(bulkAttendanceSchema, 'body');
export const validateQueryAttendance = createValidator(queryAttendanceSchema, 'query');
export const validateQueryAttendanceReport = createValidator(queryAttendanceReportSchema, 'query');
