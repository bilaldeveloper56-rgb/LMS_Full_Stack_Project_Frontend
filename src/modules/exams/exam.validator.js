import { z } from 'zod';
import {
  EXAM_TYPE_VALUES,
  EXAM_STATUS_VALUES,
} from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createExamSchema = z.object({
  academicSessionId: objectIdSchema,
  name: z.string().trim().min(1, 'Exam name is required').max(150),
  examType: z.enum(EXAM_TYPE_VALUES).default('MID_TERM'),
  startDate: z.coerce.date().refine((d) => !isNaN(d.getTime()), 'Invalid start date'),
  endDate: z.coerce.date().refine((d) => !isNaN(d.getTime()), 'Invalid end date'),
  description: z.string().trim().max(1000).optional().default(''),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const updateExamSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  examType: z.enum(EXAM_TYPE_VALUES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(EXAM_STATUS_VALUES).optional(),
  description: z.string().trim().max(1000).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const createExamPaperSchema = z.object({
  classId: objectIdSchema,
  subjectId: objectIdSchema,
  date: z.coerce.date().refine((d) => !isNaN(d.getTime()), 'Invalid exam date'),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
  room: z.string().trim().max(50).optional().nullable(),
  totalMarks: z.coerce.number().min(1).default(100),
  passingMarks: z.coerce.number().min(0).default(40),
  invigilatorTeacherId: objectIdSchema.optional().nullable(),
}).refine(
  (data) => data.passingMarks <= data.totalMarks,
  {
    message: 'Passing marks cannot exceed total marks',
    path: ['passingMarks'],
  }
).refine(
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

export const updateExamPaperSchema = z.object({
  date: z.coerce.date().optional(),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format').optional(),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format').optional(),
  room: z.string().trim().max(50).optional().nullable(),
  totalMarks: z.coerce.number().min(1).optional(),
  passingMarks: z.coerce.number().min(0).optional(),
  invigilatorTeacherId: objectIdSchema.optional().nullable(),
  status: z.enum(EXAM_STATUS_VALUES).optional(),
});

export const queryExamSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  examType: z.enum(EXAM_TYPE_VALUES).optional(),
  status: z.enum(EXAM_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
