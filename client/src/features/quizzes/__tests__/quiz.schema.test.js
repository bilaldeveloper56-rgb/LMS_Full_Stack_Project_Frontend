import { describe, it, expect } from 'vitest';
import {
  createQuizSchema,
  submitQuizAttemptSchema,
  gradeQuizAttemptSchema,
} from '../schemas/quiz.schema';

describe('Quiz Schemas Validation', () => {
  it('should validate valid quiz creation payload with MCQ, True/False, and Short Answer questions', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      title: 'Midterm Physics Assessment',
      instructions: 'Answer all questions thoroughly.',
      durationMinutes: 45,
      totalMarks: 20,
      passingMarks: 10,
      maxAttempts: 2,
      shuffleQuestions: true,
      questions: [
        {
          questionText: 'What is the SI unit of force?',
          questionType: 'MCQ',
          marks: 5,
          options: [
            { optionText: 'Newton', isCorrect: true },
            { optionText: 'Joule', isCorrect: false },
          ],
        },
        {
          questionText: 'Light travels faster than sound in air.',
          questionType: 'TRUE_FALSE',
          marks: 5,
          options: [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'Explain Newton’s Third Law of Motion.',
          questionType: 'SHORT_ANSWER',
          marks: 10,
          options: [],
        },
      ],
    };
    expect(createQuizSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject creation payload when passingMarks exceeds totalMarks', () => {
    const invalid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      title: 'Invalid Marks Quiz',
      durationMinutes: 30,
      totalMarks: 10,
      passingMarks: 15,
      questions: [
        {
          questionText: 'Q1',
          questionType: 'SHORT_ANSWER',
          marks: 10,
        },
      ],
    };
    expect(createQuizSchema.safeParse(invalid).success).toBe(false);
  });

  it('should reject MCQ without any correct option', () => {
    const invalidMCQ = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      title: 'MCQ Quiz',
      durationMinutes: 30,
      totalMarks: 5,
      passingMarks: 2,
      questions: [
        {
          questionText: 'Which planet is closest to the sun?',
          questionType: 'MCQ',
          marks: 5,
          options: [
            { optionText: 'Venus', isCorrect: false },
            { optionText: 'Mars', isCorrect: false },
          ],
        },
      ],
    };
    expect(createQuizSchema.safeParse(invalidMCQ).success).toBe(false);
  });

  it('should validate submit quiz attempt schema', () => {
    expect(
      submitQuizAttemptSchema.safeParse({
        answers: [
          { questionId: '507f1f77bcf86cd799439011', selectedOptionIndex: 0 },
          { questionId: '507f1f77bcf86cd799439012', textAnswer: 'Acceleration is...' },
        ],
      }).success
    ).toBe(true);

    expect(submitQuizAttemptSchema.safeParse({ answers: [] }).success).toBe(false);
  });

  it('should validate grade quiz attempt schema', () => {
    expect(
      gradeQuizAttemptSchema.safeParse({
        answers: [{ questionId: '507f1f77bcf86cd799439011', marksAwarded: 8, isCorrect: true }],
        feedback: 'Good answer',
      }).success
    ).toBe(true);
  });
});
