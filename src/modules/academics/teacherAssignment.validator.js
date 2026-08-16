import { z } from 'zod';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTeacherAssignmentSchema = z.object({
  academicSessionId: z
    .string({ required_error: 'Academic session ID is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  teacherId: z
    .string({ required_error: 'Teacher ID is required' })
    .regex(objectIdRegex, 'Invalid teacher ID format'),
  classId: z
    .string({ required_error: 'Class ID is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z
    .string({ required_error: 'Section ID is required' })
    .regex(objectIdRegex, 'Invalid section ID format'),
  subjectId: z
    .string({ required_error: 'Subject ID is required' })
    .regex(objectIdRegex, 'Invalid subject ID format'),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateTeacherAssignmentSchema = z.object({
  teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
  subjectId: z.string().regex(objectIdRegex, 'Invalid subject ID format').optional(),
});

export const queryTeacherAssignmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  subjectId: z.string().regex(objectIdRegex, 'Invalid subject ID format').optional(),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
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

export const validateCreateTeacherAssignment = createValidator(createTeacherAssignmentSchema, 'body');
export const validateUpdateTeacherAssignment = createValidator(updateTeacherAssignmentSchema, 'body');
export const validateQueryTeacherAssignments = createValidator(queryTeacherAssignmentsSchema, 'query');
