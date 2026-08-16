import { z } from 'zod';
import {
  QUIZ_STATUS_VALUES,
  QUESTION_TYPE_VALUES,
} from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const optionSchema = z.object({
  optionText: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  questionText: z.string().trim().min(1, 'Question text is required').max(2000),
  questionType: z.enum(QUESTION_TYPE_VALUES),
  marks: z.coerce.number().min(1, 'Marks must be at least 1'),
  options: z.array(optionSchema).optional().default([]),
  explanation: z.string().trim().max(1000).optional().nullable(),
}).refine(
  (data) => {
    if (data.questionType === 'MCQ' || data.questionType === 'TRUE_FALSE') {
      return data.options && data.options.length >= 2 && data.options.some((o) => o.isCorrect === true);
    }
    return true;
  },
  {
    message: 'MCQ and TRUE_FALSE questions must have at least 2 options and at least one marked correct',
    path: ['options'],
  }
);

export const createQuizSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  subjectId: objectIdSchema,
  teacherId: objectIdSchema.optional(),
  title: z.string().trim().min(1, 'Quiz title is required').max(200),
  instructions: z.string().trim().max(2000).optional().default(''),
  durationMinutes: z.coerce.number().int().min(1).max(300),
  totalMarks: z.coerce.number().min(1),
  passingMarks: z.coerce.number().min(0),
  dueDate: z.coerce.date().optional().nullable(),
  maxAttempts: z.coerce.number().int().min(1).max(10).optional().default(1),
  shuffleQuestions: z.boolean().optional().default(false),
  questions: z.array(questionSchema).min(1, 'Quiz must have at least one question'),
}).refine(
  (data) => data.passingMarks <= data.totalMarks,
  {
    message: 'Passing marks cannot exceed total marks',
    path: ['passingMarks'],
  }
);

export const updateQuizSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  instructions: z.string().trim().max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(1).max(300).optional(),
  totalMarks: z.coerce.number().min(1).optional(),
  passingMarks: z.coerce.number().min(0).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
  shuffleQuestions: z.boolean().optional(),
  status: z.enum(QUIZ_STATUS_VALUES).optional(),
  questions: z.array(questionSchema).min(1).optional(),
});

export const queryQuizSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  status: z.enum(QUIZ_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const submitQuizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: objectIdSchema,
      selectedOptionIndex: z.number().int().min(0).optional().nullable(),
      textAnswer: z.string().trim().max(2000).optional().nullable(),
    })
  ).min(1, 'At least one answer must be submitted'),
});

export const gradeQuizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: objectIdSchema,
      marksAwarded: z.coerce.number().min(0),
      isCorrect: z.boolean().optional(),
    })
  ),
  feedback: z.string().trim().max(2000).optional().nullable(),
});
