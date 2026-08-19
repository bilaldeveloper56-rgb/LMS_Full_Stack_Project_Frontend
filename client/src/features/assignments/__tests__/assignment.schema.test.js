import { describe, it, expect } from 'vitest';
import {
  createAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from '../schemas/assignment.schema';

describe('Assignment Schemas Validation', () => {
  it('should validate valid assignment creation payload', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      title: 'Chapter 2 Problem Set',
      description: 'Solve questions 1 through 10 on page 42.',
      dueDate: '2026-09-30T23:59:59.000Z',
      maxScore: 100,
      allowLateSubmission: true,
      lateSubmissionPenaltyPercentage: 10,
      attachments: [{ name: 'ProblemSet.pdf', url: 'https://example.com/ps.pdf' }],
    };
    expect(createAssignmentSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject creation payload with missing required title or description', () => {
    const invalid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      title: '',
      description: '',
      dueDate: '2026-09-30',
    };
    expect(createAssignmentSchema.safeParse(invalid).success).toBe(false);
  });

  it('should validate student submission schema with either text or attachments', () => {
    expect(
      submitAssignmentSchema.safeParse({
        submissionContent: 'Here is my solution.',
        attachments: [],
      }).success
    ).toBe(true);

    expect(
      submitAssignmentSchema.safeParse({
        submissionContent: '',
        attachments: [{ name: 'solution.pdf', url: 'https://example.com/sol.pdf' }],
      }).success
    ).toBe(true);

    expect(
      submitAssignmentSchema.safeParse({
        submissionContent: '',
        attachments: [],
      }).success
    ).toBe(false);
  });

  it('should validate grade submission payload', () => {
    expect(gradeSubmissionSchema.safeParse({ score: 95, feedback: 'Well done' }).success).toBe(true);
    expect(gradeSubmissionSchema.safeParse({ score: -5 }).success).toBe(false);
  });
});
