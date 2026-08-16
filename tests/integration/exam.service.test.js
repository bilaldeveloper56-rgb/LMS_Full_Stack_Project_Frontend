import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Exam from '../../src/modules/exams/exam.model.js';
import ExamPaper from '../../src/modules/exams/examPaper.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as examService from '../../src/modules/exams/exam.service.js';
import { ROLES, EXAM_TYPE, EXAM_STATUS } from '../../src/constants/index.js';

describe('Exam Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const subjectId = '507f1f77bcf86cd799439055';
  const teacherId = '507f1f77bcf86cd799439066';
  const adminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };
  const studentUser = { id: 'student-1', role: ROLES.STUDENT, schoolId };

  it('should create exam term successfully', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origExamFindOne = Exam.findOne;
    const origExamSave = Exam.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Exam.findOne = () => Promise.resolve(null);
    Exam.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439099';
      return Promise.resolve(this);
    };

    const result = await examService.createExam(
      {
        academicSessionId: sessionId,
        name: 'Annual Term Examination 2026',
        examType: EXAM_TYPE.FINAL,
        startDate: '2026-12-01',
        endDate: '2026-12-20',
      },
      adminUser
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Exam.findOne = origExamFindOne;
    Exam.prototype.save = origExamSave;

    assert.equal(result.name, 'Annual Term Examination 2026');
    assert.equal(result.isPublished, false);
  });

  it('should schedule exam paper for class and subject', async () => {
    const origExamFindOne = Exam.findOne;
    const origClassFindOne = Class.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origPaperFindOne = ExamPaper.findOne;
    const origPaperSave = ExamPaper.prototype.save;

    Exam.findOne = () => Promise.resolve({ _id: '507f1f77bcf86cd799439099', schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });
    ExamPaper.findOne = () => Promise.resolve(null); // No duplicate
    ExamPaper.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439088';
      return Promise.resolve(this);
    };

    const result = await examService.scheduleExamPaper(
      '507f1f77bcf86cd799439099',
      {
        classId,
        subjectId,
        date: '2026-12-05',
        startTime: '09:00',
        endTime: '12:00',
        totalMarks: 100,
        passingMarks: 40,
        invigilatorTeacherId: teacherId,
      },
      adminUser
    );

    Exam.findOne = origExamFindOne;
    Class.findOne = origClassFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    ExamPaper.findOne = origPaperFindOne;
    ExamPaper.prototype.save = origPaperSave;

    assert.equal(result.totalMarks, 100);
    assert.equal(result.passingMarks, 40);
  });

  it('should reject duplicate exam paper for same class and subject in exam', async () => {
    const origExamFindOne = Exam.findOne;
    const origClassFindOne = Class.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origPaperFindOne = ExamPaper.findOne;

    Exam.findOne = () => Promise.resolve({ _id: '507f1f77bcf86cd799439099', schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    ExamPaper.findOne = () => Promise.resolve({ _id: 'duplicate-paper-id' }); // Duplicate exists!

    await assert.rejects(
      () =>
        examService.scheduleExamPaper(
          '507f1f77bcf86cd799439099',
          {
            classId,
            subjectId,
            date: '2026-12-05',
            startTime: '09:00',
            endTime: '12:00',
          },
          adminUser
        ),
      (err) => err.statusCode === 409 && err.message.includes('already scheduled')
    );

    Exam.findOne = origExamFindOne;
    Class.findOne = origClassFindOne;
    Subject.findOne = origSubjectFindOne;
    ExamPaper.findOne = origPaperFindOne;
  });

  it('should publish exam schedule', async () => {
    const origExamFindOne = Exam.findOne;
    const mockExam = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      isPublished: false,
      save: () => Promise.resolve(mockExam),
      toJSON: () => ({ id: '507f1f77bcf86cd799439099', isPublished: true }),
    };

    Exam.findOne = () => Promise.resolve(mockExam);

    const result = await examService.publishExam('507f1f77bcf86cd799439099', adminUser);

    Exam.findOne = origExamFindOne;

    assert.equal(result.isPublished, true);
  });

  it('should get exams list with pagination', async () => {
    const origExamFind = Exam.find;
    const origExamCount = Exam.countDocuments;

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: '507f1f77bcf86cd799439099',
            name: 'Mid Term 2026',
            toJSON: () => ({ id: '507f1f77bcf86cd799439099', name: 'Mid Term 2026' }),
          },
        ]),
    };

    Exam.find = () => mockQuery;
    Exam.countDocuments = () => Promise.resolve(1);

    const result = await examService.getExamsList({}, adminUser);

    Exam.find = origExamFind;
    Exam.countDocuments = origExamCount;

    assert.equal(result.exams.length, 1);
    assert.equal(result.pagination.total, 1);
  });

  it('should soft delete exam term', async () => {
    const origExamFindOne = Exam.findOne;
    const mockExam = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      isDeleted: false,
      save: () => Promise.resolve(mockExam),
    };

    Exam.findOne = () => Promise.resolve(mockExam);

    const result = await examService.deleteExam('507f1f77bcf86cd799439099', adminUser);

    Exam.findOne = origExamFindOne;

    assert.equal(result.success, true);
    assert.equal(mockExam.isDeleted, true);
  });
});
