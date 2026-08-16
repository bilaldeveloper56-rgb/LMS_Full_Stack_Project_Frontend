import { z } from 'zod';
import { DAY_OF_WEEK_VALUES } from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createTimetableSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  subjectId: objectIdSchema,
  teacherId: objectIdSchema,
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES, {
    errorMap: () => ({ message: `Day must be one of: ${DAY_OF_WEEK_VALUES.join(', ')}` }),
  }),
  periodNumber: z.number().int().min(1).max(12),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
  room: z.string().trim().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    return endH * 60 + endM > startH * 60 + startM;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const updateTimetableSchema = z.object({
  subjectId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES).optional(),
  periodNumber: z.number().int().min(1).max(12).optional(),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format').optional(),
  room: z.string().trim().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const queryTimetableSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES).optional(),
  room: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
