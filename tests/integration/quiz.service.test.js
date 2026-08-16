import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Quiz from '../../src/modules/quizzes/quiz.model.js';
import QuizAttempt from '../../src/modules/quizzes/quizAttempt.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import Student from '../../src/modules/students/student.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as quizService from '../../src/modules/quizzes/quiz.service.js';
import {
  ROLES,
  QUIZ_STATUS,
  QUIZ_ATTEMPT_STATUS,
  QUESTION_TYPE,
} from '../../src/constants/index.js';

describe('Quiz Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const subjectId = '507f1f77bcf86cd799439055';
  const teacherId = '507f1f77bcf86cd799439066';
  const teacherUserId = '507f1f77bcf86cd799439067';
  const studentId = '507f1f77bcf86cd799439077';
  const studentUserId = '507f1f77bcf86cd799439078';
  const question1Id = '507f1f77bcf86cd799439081';
  const question2Id = '507f1f77bcf86cd799439082';

  const teacherUser = { id: teacherUserId, role: ROLES.TEACHER, schoolId };
  const studentUser = { id: studentUserId, role: ROLES.STUDENT, schoolId };

  it('should mask answer keys and explanations when student views quiz', async () => {
    const origQuizFindOne = Quiz.findOne;

    const mockQuiz = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      status: QUIZ_STATUS.PUBLISHED,
      title: 'General Science Quiz',
      questions: [
        {
          _id: question1Id,
          questionText: 'Is the earth round?',
          questionType: QUESTION_TYPE.TRUE_FALSE,
          marks: 5,
          options: [
            { optionText: 'True', isCorrect: true },
            { optionText: 'False', isCorrect: false },
          ],
          explanation: 'Satellite imagery confirms earth is an oblate spheroid.',
        },
      ],
      toJSON() {
        return {
          id: this._id,
          title: this.title,
          status: this.status,
          questions: this.questions,
        };
      },
    };

    const q = {
      populate: () => q,
      then: (resolve) => Promise.resolve(mockQuiz).then(resolve),
    };
    Quiz.findOne = () => q;

    const result = await quizService.getQuizById('507f1f77bcf86cd799439099', studentUser);

    Quiz.findOne = origQuizFindOne;

    assert.equal(result.questions[0].options[0].isCorrect, undefined);
    assert.equal(result.questions[0].explanation, undefined);
    assert.equal(result.questions[0].options[0].optionText, 'True');
  });

  it('should reject start attempt when maximum attempts limit is reached', async () => {
    const origQuizFindOne = Quiz.findOne;
    const origStudentFindOne = Student.findOne;
    const origAttemptCount = QuizAttempt.countDocuments;

    Quiz.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        sectionId,
        status: QUIZ_STATUS.PUBLISHED,
        maxAttempts: 1,
      });

    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        userId: studentUserId,
        sectionId,
        schoolId,
      });

    QuizAttempt.countDocuments = () => Promise.resolve(1); // Already 1 attempt!

    await assert.rejects(
      () => quizService.startQuizAttempt('507f1f77bcf86cd799439099', studentUser),
      (err) => err.statusCode === 400 && err.message.includes('Maximum attempt limit')
    );

    Quiz.findOne = origQuizFindOne;
    Student.findOne = origStudentFindOne;
    QuizAttempt.countDocuments = origAttemptCount;
  });

  it('should automatically evaluate objective MCQ answers on submit', async () => {
    const origStudentFindOne = Student.findOne;
    const origAttemptFindOne = QuizAttempt.findOne;
    const origQuizFindOne = Quiz.findOne;

    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        userId: studentUserId,
        schoolId,
      });

    const mockAttempt = {
      _id: '507f1f77bcf86cd799439088',
      schoolId,
      quizId: '507f1f77bcf86cd799439099',
      studentId,
      status: QUIZ_ATTEMPT_STATUS.IN_PROGRESS,
      answers: [],
      save: () => Promise.resolve(mockAttempt),
      toJSON: () => ({
        id: '507f1f77bcf86cd799439088',
        status: mockAttempt.status,
        totalScore: mockAttempt.totalScore,
        isPassed: mockAttempt.isPassed,
      }),
    };

    QuizAttempt.findOne = () => Promise.resolve(mockAttempt);

    Quiz.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        totalMarks: 10,
        passingMarks: 5,
        questions: [
          {
            _id: question1Id,
            questionType: QUESTION_TYPE.MCQ,
            marks: 5,
            options: [
              { optionText: 'Paris', isCorrect: true },
              { optionText: 'London', isCorrect: false },
            ],
          },
          {
            _id: question2Id,
            questionType: QUESTION_TYPE.TRUE_FALSE,
            marks: 5,
            options: [
              { optionText: 'True', isCorrect: true },
              { optionText: 'False', isCorrect: false },
            ],
          },
        ],
      });

    // Student selects correct option 0 for Q1 (Paris) and incorrect option 1 for Q2 (False)
    const result = await quizService.submitQuizAttempt(
      '507f1f77bcf86cd799439088',
      {
        answers: [
          { questionId: question1Id, selectedOptionIndex: 0 },
          { questionId: question2Id, selectedOptionIndex: 1 },
        ],
      },
      studentUser
    );

    Student.findOne = origStudentFindOne;
    QuizAttempt.findOne = origAttemptFindOne;
    Quiz.findOne = origQuizFindOne;

    // Total score should be 5 (Q1 passed, Q2 failed). Passing marks was 5 -> isPassed: true
    assert.equal(result.totalScore, 5);
    assert.equal(result.status, QUIZ_ATTEMPT_STATUS.EVALUATED);
    assert.equal(result.isPassed, true);
  });

  it('should set SUBMITTED status when quiz contains subjective short answer question', async () => {
    const origStudentFindOne = Student.findOne;
    const origAttemptFindOne = QuizAttempt.findOne;
    const origQuizFindOne = Quiz.findOne;

    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        userId: studentUserId,
        schoolId,
      });

    const mockAttempt = {
      _id: '507f1f77bcf86cd799439088',
      schoolId,
      quizId: '507f1f77bcf86cd799439099',
      studentId,
      status: QUIZ_ATTEMPT_STATUS.IN_PROGRESS,
      answers: [],
      save: () => Promise.resolve(mockAttempt),
      toJSON: () => ({
        id: '507f1f77bcf86cd799439088',
        status: mockAttempt.status,
        totalScore: mockAttempt.totalScore,
      }),
    };

    QuizAttempt.findOne = () => Promise.resolve(mockAttempt);

    Quiz.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        totalMarks: 10,
        passingMarks: 5,
        questions: [
          {
            _id: question1Id,
            questionType: QUESTION_TYPE.SHORT_ANSWER,
            marks: 10,
          },
        ],
      });

    const result = await quizService.submitQuizAttempt(
      '507f1f77bcf86cd799439088',
      {
        answers: [{ questionId: question1Id, textAnswer: 'Photosynthesis is the process...' }],
      },
      studentUser
    );

    Student.findOne = origStudentFindOne;
    QuizAttempt.findOne = origAttemptFindOne;
    Quiz.findOne = origQuizFindOne;

    assert.equal(result.status, QUIZ_ATTEMPT_STATUS.SUBMITTED);
  });

  it('should allow teacher to grade subjective question and evaluate attempt', async () => {
    const origAttemptFindOne = QuizAttempt.findOne;
    const origQuizFindOne = Quiz.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    const mockAttempt = {
      _id: '507f1f77bcf86cd799439088',
      schoolId,
      quizId: '507f1f77bcf86cd799439099',
      studentId,
      status: QUIZ_ATTEMPT_STATUS.SUBMITTED,
      answers: [
        {
          questionId: question1Id,
          textAnswer: 'Photosynthesis is the process...',
          marksAwarded: 0,
          isCorrect: null,
        },
      ],
      totalScore: 0,
      save: () => Promise.resolve(mockAttempt),
      toJSON: () => ({
        id: '507f1f77bcf86cd799439088',
        status: mockAttempt.status,
        totalScore: mockAttempt.totalScore,
        isPassed: mockAttempt.isPassed,
      }),
    };

    QuizAttempt.findOne = () => Promise.resolve(mockAttempt);
    Quiz.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        classId,
        sectionId,
        subjectId,
        totalMarks: 10,
        passingMarks: 6,
      });

    Teacher.findOne = () => Promise.resolve({ _id: teacherId, userId: teacherUserId, schoolId });
    TeacherAssignment.findOne = () => Promise.resolve({ _id: 'assign-1', status: 'ACTIVE' });

    const result = await quizService.gradeQuizAttempt(
      '507f1f77bcf86cd799439088',
      {
        answers: [{ questionId: question1Id, marksAwarded: 8, isCorrect: true }],
        feedback: 'Good work',
      },
      teacherUser
    );

    QuizAttempt.findOne = origAttemptFindOne;
    Quiz.findOne = origQuizFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;

    assert.equal(result.totalScore, 8);
    assert.equal(result.status, QUIZ_ATTEMPT_STATUS.EVALUATED);
    assert.equal(result.isPassed, true);
  });
});
