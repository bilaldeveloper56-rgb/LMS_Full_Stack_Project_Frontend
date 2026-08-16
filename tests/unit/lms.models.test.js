import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Timetable from '../../src/modules/timetable/timetable.model.js';
import Assignment from '../../src/modules/assignments/assignment.model.js';
import AssignmentSubmission from '../../src/modules/assignments/assignmentSubmission.model.js';
import Quiz from '../../src/modules/quizzes/quiz.model.js';
import QuizAttempt from '../../src/modules/quizzes/quizAttempt.model.js';
import Exam from '../../src/modules/exams/exam.model.js';
import ExamPaper from '../../src/modules/exams/examPaper.model.js';
import GradingScale from '../../src/modules/results/gradingScale.model.js';
import Result from '../../src/modules/results/result.model.js';
import {
  DAY_OF_WEEK,
  ASSIGNMENT_STATUS,
  SUBMISSION_STATUS,
  QUIZ_STATUS,
  QUESTION_TYPE,
  QUIZ_ATTEMPT_STATUS,
  EXAM_TYPE,
  EXAM_STATUS,
} from '../../src/constants/index.js';

describe('Phase 7 LMS Models Unit Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const subjectId = '507f1f77bcf86cd799439055';
  const teacherId = '507f1f77bcf86cd799439066';
  const studentId = '507f1f77bcf86cd799439077';

  describe('Timetable Model', () => {
    it('should instantiate timetable with valid fields and defaults', () => {
      const doc = new Timetable({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek: DAY_OF_WEEK.MONDAY,
        periodNumber: 1,
        startTime: '08:30',
        endTime: '09:15',
        room: 'Lab-1',
      });

      assert.equal(doc.dayOfWeek, DAY_OF_WEEK.MONDAY);
      assert.equal(doc.periodNumber, 1);
      assert.equal(doc.isActive, true);
      assert.equal(doc.isDeleted, false);
    });

    it('should reject invalid day of week', () => {
      const doc = new Timetable({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek: 'INVALID_DAY',
        periodNumber: 1,
        startTime: '08:30',
        endTime: '09:15',
      });
      const err = doc.validateSync();
      assert.ok(err && err.errors.dayOfWeek);
    });

    it('should strip isDeleted and __v in toJSON', () => {
      const doc = new Timetable({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek: DAY_OF_WEEK.TUESDAY,
        periodNumber: 2,
        startTime: '09:15',
        endTime: '10:00',
      });
      const json = doc.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });

  describe('Assignment & Submission Models', () => {
    it('should instantiate assignment with defaults and soft delete', () => {
      const assignment = new Assignment({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title: 'Math Homework 1',
        description: 'Complete questions 1 to 10',
        dueDate: new Date('2026-09-10'),
        maxScore: 100,
      });

      assert.equal(assignment.status, ASSIGNMENT_STATUS.DRAFT);
      assert.equal(assignment.allowLateSubmission, true);
      assert.equal(assignment.lateSubmissionPenaltyPercentage, 0);
      assert.equal(assignment.isDeleted, false);
    });

    it('should instantiate submission with default SUBMITTED status', () => {
      const submission = new AssignmentSubmission({
        schoolId,
        assignmentId: '507f1f77bcf86cd799439088',
        studentId,
        submissionContent: 'Here is my solution',
      });

      assert.equal(submission.status, SUBMISSION_STATUS.SUBMITTED);
      assert.equal(submission.score, null);
    });

    it('should reject invalid assignment status', () => {
      const assignment = new Assignment({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title: 'Invalid',
        description: 'Desc',
        dueDate: new Date(),
        status: 'NON_EXISTENT_STATUS',
      });
      const err = assignment.validateSync();
      assert.ok(err && err.errors.status);
    });
  });

  describe('Quiz & QuizAttempt Models', () => {
    it('should instantiate quiz with questions and defaults', () => {
      const quiz = new Quiz({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title: 'Science Quiz 1',
        durationMinutes: 30,
        totalMarks: 20,
        passingMarks: 10,
        questions: [
          {
            questionText: 'What is the speed of light?',
            questionType: QUESTION_TYPE.MCQ,
            marks: 5,
            options: [
              { optionText: '300,000 km/s', isCorrect: true },
              { optionText: '150,000 km/s', isCorrect: false },
            ],
          },
        ],
      });

      assert.equal(quiz.status, QUIZ_STATUS.DRAFT);
      assert.equal(quiz.questions.length, 1);
      assert.equal(quiz.maxAttempts, 1);
    });

    it('should instantiate quiz attempt with default IN_PROGRESS status', () => {
      const attempt = new QuizAttempt({
        schoolId,
        quizId: '507f1f77bcf86cd799439088',
        studentId,
        attemptNumber: 1,
      });

      assert.equal(attempt.status, QUIZ_ATTEMPT_STATUS.IN_PROGRESS);
      assert.equal(attempt.totalScore, 0);
      assert.equal(attempt.isPassed, false);
    });

    it('should reject invalid question type in quiz', () => {
      const quiz = new Quiz({
        schoolId,
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        title: 'Invalid Question Quiz',
        durationMinutes: 30,
        totalMarks: 10,
        passingMarks: 5,
        questions: [
          {
            questionText: 'Some question',
            questionType: 'UNSUPPORTED_TYPE',
            marks: 5,
          },
        ],
      });
      const err = quiz.validateSync();
      assert.ok(err && err.errors['questions.0.questionType']);
    });
  });

  describe('Exam & ExamPaper Models', () => {
    it('should instantiate exam term with defaults', () => {
      const exam = new Exam({
        schoolId,
        academicSessionId: sessionId,
        name: 'Mid-Term Examinations 2026',
        examType: EXAM_TYPE.MID_TERM,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-15'),
      });

      assert.equal(exam.status, EXAM_STATUS.SCHEDULED);
      assert.equal(exam.isPublished, false);
    });

    it('should instantiate exam paper with default marks and schedule', () => {
      const paper = new ExamPaper({
        schoolId,
        examId: '507f1f77bcf86cd799439088',
        classId,
        subjectId,
        date: new Date('2026-10-05'),
        startTime: '09:00',
        endTime: '12:00',
        totalMarks: 100,
        passingMarks: 40,
      });

      assert.equal(paper.totalMarks, 100);
      assert.equal(paper.passingMarks, 40);
      assert.equal(paper.status, EXAM_STATUS.SCHEDULED);
    });

    it('should reject invalid exam type', () => {
      const exam = new Exam({
        schoolId,
        academicSessionId: sessionId,
        name: 'Invalid Type Exam',
        examType: 'INVALID_EXAM_TYPE',
        startDate: new Date(),
        endDate: new Date(),
      });
      const err = exam.validateSync();
      assert.ok(err && err.errors.examType);
    });
  });

  describe('GradingScale & Result Models', () => {
    it('should instantiate grading scale with default grade intervals', () => {
      const scale = new GradingScale({
        schoolId,
        name: 'Standard CBSE Scale',
        isDefault: true,
      });

      assert.equal(scale.isDefault, true);
      assert.equal(scale.grades.length, 6);
      assert.equal(scale.grades[0].grade, 'A+');
    });

    it('should instantiate student result record with lock & publish defaults', () => {
      const result = new Result({
        schoolId,
        academicSessionId: sessionId,
        examId: '507f1f77bcf86cd799439088',
        examPaperId: '507f1f77bcf86cd799439089',
        studentId,
        classId,
        sectionId,
        subjectId,
        marksObtained: 85,
        maxMarks: 100,
        percentage: 85,
        grade: 'A',
        gradePoint: 3.7,
      });

      assert.equal(result.percentage, 85);
      assert.equal(result.grade, 'A');
      assert.equal(result.isLocked, false);
      assert.equal(result.isPublished, false);
    });

    it('should strip isDeleted and __v in Result toJSON', () => {
      const result = new Result({
        schoolId,
        academicSessionId: sessionId,
        examId: '507f1f77bcf86cd799439088',
        examPaperId: '507f1f77bcf86cd799439089',
        studentId,
        classId,
        sectionId,
        subjectId,
        marksObtained: 90,
        maxMarks: 100,
        percentage: 90,
        grade: 'A+',
      });
      const json = result.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });
});
