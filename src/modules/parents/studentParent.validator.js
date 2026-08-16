import { z } from 'zod';
import { RELATIONSHIP_TYPE_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createStudentParentSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  parentId: z
    .string({ required_error: 'Parent ID is required' })
    .regex(objectIdRegex, 'Invalid parent ID format'),
  relationshipType: z.enum(RELATIONSHIP_TYPE_VALUES).default('GUARDIAN'),
  isPrimary: z.boolean().default(false),
  canReceiveNotifications: z.boolean().default(true),
  canViewAcademicRecords: z.boolean().default(true),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateStudentParentSchema = z.object({
  relationshipType: z.enum(RELATIONSHIP_TYPE_VALUES).optional(),
  isPrimary: z.boolean().optional(),
  canReceiveNotifications: z.boolean().optional(),
  canViewAcademicRecords: z.boolean().optional(),
});

export const queryStudentParentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  parentId: z.string().regex(objectIdRegex, 'Invalid parent ID format').optional(),
  relationshipType: z.enum(RELATIONSHIP_TYPE_VALUES).optional(),
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

export const validateCreateStudentParent = createValidator(createStudentParentSchema, 'body');
export const validateUpdateStudentParent = createValidator(updateStudentParentSchema, 'body');
export const validateQueryStudentParents = createValidator(queryStudentParentsSchema, 'query');
