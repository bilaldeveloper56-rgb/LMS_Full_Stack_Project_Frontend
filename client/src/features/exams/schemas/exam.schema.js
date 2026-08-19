import { z } from 'zod';

export const EXAM_TYPES = [
  { value: 'UNIT_TEST', label: 'Unit Test' },
  { value: 'MID_TERM', label: 'Mid Term' },
  { value: 'FINAL', label: 'Final Exam' },
  { value: 'QUIZ', label: 'Quiz / Class Test' },
  { value: 'PRACTICAL', label: 'Practical Exam' },
  { value: 'OTHER', label: 'Other' },
];

export const createExamSchema = z
  .object({
    academicSessionId: z.string().min(1, 'Please select an academic session'),
    name: z.string().trim().min(1, 'Exam name is required').max(150),
    examType: z.enum(['UNIT_TEST', 'MID_TERM', 'FINAL', 'QUIZ', 'PRACTICAL', 'OTHER']).default('MID_TERM'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().trim().max(1000).optional().default(''),
  })
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

export const updateExamSchema = z
  .object({
    name: z.string().trim().min(1, 'Exam name cannot be empty').max(150).optional(),
    examType: z.enum(['UNIT_TEST', 'MID_TERM', 'FINAL', 'QUIZ', 'PRACTICAL', 'OTHER']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createExamPaperSchema = z
  .object({
    classId: z.string().min(1, 'Please select a class'),
    subjectId: z.string().min(1, 'Please select a subject'),
    date: z.string().min(1, 'Exam date is required'),
    startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format (e.g. 09:00)'),
    endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format (e.g. 12:00)'),
    room: z.string().trim().max(50).optional().default(''),
    totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1').default(100),
    passingMarks: z.coerce.number().min(0, 'Passing marks cannot be negative').default(40),
    invigilatorTeacherId: z.string().optional().default(''),
  })
  .refine(
    (data) => Number(data.passingMarks) <= Number(data.totalMarks),
    {
      message: 'Passing marks cannot exceed total marks',
      path: ['passingMarks'],
    }
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      return endH * 60 + endM > startH * 60 + startM;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );
