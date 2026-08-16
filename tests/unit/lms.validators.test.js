import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTimetableSchema,
  updateTimetableSchema,
  queryTimetableSchema,
} from '../../src/modules/timetable/timetable.validator.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from '../../src/modules/assignments/assignment.validator.js';
import {
  createQuizSchema,
  updateQuizSchema,
  submitQuizAttemptSchema,
  gradeQuizAttemptSchema,
} from '../../src/modules/quizzes/quiz.validator.js';
import {
  createExamSchema,
  updateExamSchema,
  createExamPaperSchema,
  updateExamPaperSchema,
} from '../../src/modules/exams/exam.validator.js';
import {
  createGradingScaleSchema,
  updateGradingScaleSchema,
  recordMarksSchema,
  bulkRecordMarksSchema,
} from '../../src/modules/results/result.validator.js';

describe('Phase 7 LMS Validators Unit Tests', () => {
  const validId = '507f1f77bcf86cd799439011';

  describe('Timetable Validators', () => {
    it('should validate valid timetable creation payload', () => {
      const res = createTimetableSchema.safeParse({
        academicSessionId: validId,
        classId: validId,
        sectionId: validId,
        subjectId: validId,
        teacherId: validId,
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '08:00',
        endTime: '08:45',
        room: '101',
      });
      assert.equal(res.success, true);
    });

    it('should reject timetable when end time is before start time', () => {
      const res = createTimetableSchema.safeParse({
        academicSessionId: validId,
        classId: validId,
        sectionId: validId,
        subjectId: validId,
        teacherId: validId,
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '10:00',
        endTime: '09:00',
      });
      assert.equal(res.success, false);
    });

    it('should validate partial update timetable payload', () => {
      const res = updateTimetableSchema.safeParse({
        room: 'Lab 2',
        periodNumber: 3,
        startTime: '10:00',
        endTime: '10:45',
      });
      assert.equal(res.success, true);
    });
  });

  describe('Assignment Validators', () => {
    it('should validate valid assignment creation payload', () => {
      const res = createAssignmentSchema.safeParse({
        academicSessionId: validId,
        classId: validId,
        sectionId: validId,
        subjectId: validId,
        title: 'Physics Lab Report',
        description: 'Submit observations from Experiment 3',
        dueDate: '2026-09-30T23:59:59Z',
        maxScore: 50,
      });
      assert.equal(res.success, true);
    });

    it('should validate update assignment payload with late penalty', () => {
      const res = updateAssignmentSchema.safeParse({
        title: 'Updated Title',
        lateSubmissionPenaltyPercentage: 25,
        status: 'PUBLISHED',
      });
      assert.equal(res.success, true);
    });

    it('should validate student submission with attachment', () => {
      const res = submitAssignmentSchema.safeParse({
        submissionContent: 'Attached the PDF report',
        attachments: [{ name: 'report.pdf', url: 'https://example.com/report.pdf' }],
      });
      assert.equal(res.success, true);
    });

    it('should validate teacher grading payload', () => {
      const res = gradeSubmissionSchema.safeParse({
        score: 45,
        feedback: 'Good analysis and graphs',
      });
      assert.equal(res.success, true);
    });
  });

  describe('Quiz Validators', () => {
    it('should validate valid quiz with MCQ question and passing marks', () => {
      const res = createQuizSchema.safeParse({
        academicSessionId: validId,
        classId: validId,
        sectionId: validId,
        subjectId: validId,
        title: 'Algebra Quiz',
        durationMinutes: 45,
        totalMarks: 20,
        passingMarks: 10,
        questions: [
          {
            questionText: 'Solve for x: 2x = 10',
            questionType: 'MCQ',
            marks: 5,
            options: [
              { optionText: '5', isCorrect: true },
              { optionText: '2', isCorrect: false },
            ],
          },
        ],
      });
      assert.equal(res.success, true);
    });

    it('should reject quiz if passingMarks > totalMarks', () => {
      const res = createQuizSchema.safeParse({
        academicSessionId: validId,
        classId: validId,
        sectionId: validId,
        subjectId: validId,
        title: 'Invalid Quiz',
        durationMinutes: 30,
        totalMarks: 10,
        passingMarks: 15,
        questions: [
          {
            questionText: 'Question 1',
            questionType: 'SHORT_ANSWER',
            marks: 10,
          },
        ],
      });
      assert.equal(res.success, false);
    });

    it('should validate update quiz schema', () => {
      const res = updateQuizSchema.safeParse({
        durationMinutes: 60,
        shuffleQuestions: true,
      });
      assert.equal(res.success, true);
    });

    it('should validate quiz attempt submission payload', () => {
      const res = submitQuizAttemptSchema.safeParse({
        answers: [
          { questionId: validId, selectedOptionIndex: 1 },
          { questionId: validId, textAnswer: 'Some descriptive response' },
        ],
      });
      assert.equal(res.success, true);
    });

    it('should validate teacher grade attempt payload', () => {
      const res = gradeQuizAttemptSchema.safeParse({
        answers: [
          { questionId: validId, marksAwarded: 8, isCorrect: true },
        ],
        feedback: 'Well articulated explanation',
      });
      assert.equal(res.success, true);
    });
  });

  describe('Exam & Result Validators', () => {
    it('should validate exam creation with valid date range', () => {
      const res = createExamSchema.safeParse({
        academicSessionId: validId,
        name: 'Final Term 2026',
        examType: 'FINAL',
        startDate: '2026-11-01',
        endDate: '2026-11-20',
      });
      assert.equal(res.success, true);
    });

    it('should reject exam if startDate is after endDate', () => {
      const res = createExamSchema.safeParse({
        academicSessionId: validId,
        name: 'Final Term 2026',
        examType: 'FINAL',
        startDate: '2026-11-25',
        endDate: '2026-11-20',
      });
      assert.equal(res.success, false);
    });

    it('should validate update exam paper schema', () => {
      const res = updateExamPaperSchema.safeParse({
        startTime: '10:00',
        endTime: '13:00',
        room: 'Hall B',
      });
      assert.equal(res.success, true);
    });

    it('should validate custom grading scale creation', () => {
      const res = createGradingScaleSchema.safeParse({
        name: 'Standard GPA Scale',
        isDefault: true,
        grades: [
          { grade: 'A', minPercentage: 85, maxPercentage: 100, gradePoint: 4.0, description: 'Excellent' },
          { grade: 'B', minPercentage: 70, maxPercentage: 84.99, gradePoint: 3.0, description: 'Good' },
          { grade: 'F', minPercentage: 0, maxPercentage: 69.99, gradePoint: 0.0, description: 'Fail' },
        ],
      });
      assert.equal(res.success, true);
    });

    it('should validate single student mark recording payload', () => {
      const res = recordMarksSchema.safeParse({
        examId: validId,
        examPaperId: validId,
        studentId: validId,
        marksObtained: 92.5,
        remarks: 'Outstanding work',
      });
      assert.equal(res.success, true);
    });

    it('should validate bulk marks entry payload', () => {
      const res = bulkRecordMarksSchema.safeParse({
        examId: validId,
        examPaperId: validId,
        records: [
          { studentId: validId, marksObtained: 88, remarks: 'Excellent performance' },
        ],
      });
      assert.equal(res.success, true);
    });
  });
});
