import { z } from 'zod';

export const QUIZ_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const QUESTION_TYPE_OPTIONS = [
  { value: 'MCQ', label: 'Multiple Choice (MCQ)' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
];

export const QUIZ_ATTEMPT_STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted (Pending Review)' },
  { value: 'EVALUATED', label: 'Evaluated' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ID format');

export const optionSchema = z.object({
  optionText: z.string().trim().min(1, 'Option text cannot be empty'),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z
  .object({
    id: z.string().optional(),
    questionText: z
      .string({ required_error: 'Question text is required' })
      .trim()
      .min(1, 'Question text cannot be empty')
      .max(2000, 'Question text cannot exceed 2000 characters'),
    questionType: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER']),
    marks: z.coerce.number().min(1, 'Question marks must be at least 1').default(1),
    options: z.array(optionSchema).optional().default([]),
    explanation: z.string().trim().max(1000, 'Explanation cannot exceed 1000 characters').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.questionType === 'MCQ') {
        return (
          Array.isArray(data.options) &&
          data.options.length >= 2 &&
          data.options.some((opt) => opt.isCorrect === true)
        );
      }
      if (data.questionType === 'TRUE_FALSE') {
        return (
          Array.isArray(data.options) &&
          data.options.length === 2 &&
          data.options.filter((opt) => opt.isCorrect === true).length === 1
        );
      }
      return true;
    },
    {
      message: 'MCQ questions require at least 2 options and 1 correct answer. True/False requires exactly 2 options and 1 correct answer.',
      path: ['options'],
    }
  );

export const createQuizSchema = z
  .object({
    academicSessionId: objectIdSchema,
    classId: objectIdSchema,
    sectionId: objectIdSchema,
    subjectId: objectIdSchema,
    teacherId: objectIdSchema.optional().or(z.literal('')),
    title: z
      .string({ required_error: 'Quiz title is required' })
      .trim()
      .min(1, 'Quiz title cannot be empty')
      .max(200, 'Title cannot exceed 200 characters'),
    instructions: z
      .string()
      .trim()
      .max(2000, 'Instructions cannot exceed 2000 characters')
      .optional()
      .default(''),
    durationMinutes: z.coerce
      .number({ required_error: 'Duration in minutes is required' })
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 minute')
      .max(300, 'Duration cannot exceed 300 minutes')
      .default(30),
    totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1').default(10),
    passingMarks: z.coerce.number().min(0, 'Passing marks cannot be negative').default(5),
    dueDate: z
      .string()
      .optional()
      .nullable()
      .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Invalid due date' }),
    maxAttempts: z.coerce
      .number()
      .int()
      .min(1, 'Max attempts must be at least 1')
      .max(10, 'Max attempts cannot exceed 10')
      .default(1),
    shuffleQuestions: z.boolean().default(false),
    questions: z.array(questionSchema).min(1, 'Quiz must have at least one question'),
  })
  .refine((data) => data.passingMarks <= data.totalMarks, {
    message: 'Passing marks cannot exceed total marks',
    path: ['passingMarks'],
  });

export const updateQuizSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    instructions: z.string().trim().max(2000).optional(),
    durationMinutes: z.coerce.number().int().min(1).max(300).optional(),
    totalMarks: z.coerce.number().min(1).optional(),
    passingMarks: z.coerce.number().min(0).optional(),
    dueDate: z
      .string()
      .optional()
      .nullable()
      .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Invalid due date' }),
    maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
    shuffleQuestions: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
    questions: z.array(questionSchema).min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.passingMarks !== undefined && data.totalMarks !== undefined) {
        return data.passingMarks <= data.totalMarks;
      }
      return true;
    },
    {
      message: 'Passing marks cannot exceed total marks',
      path: ['passingMarks'],
    }
  );

export const submitQuizAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: objectIdSchema,
        selectedOptionIndex: z.number().int().min(0).optional().nullable(),
        textAnswer: z.string().trim().max(2000).optional().nullable(),
      })
    )
    .min(1, 'At least one answer must be submitted'),
});

export const gradeQuizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: objectIdSchema,
      marksAwarded: z.coerce.number().min(0, 'Marks awarded cannot be negative'),
      isCorrect: z.boolean().optional(),
    })
  ),
  feedback: z.string().trim().max(2000, 'Feedback cannot exceed 2000 characters').optional().nullable(),
});
