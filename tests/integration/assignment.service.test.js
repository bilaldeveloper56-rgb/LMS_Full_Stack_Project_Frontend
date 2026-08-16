import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Assignment from '../../src/modules/assignments/assignment.model.js';
import AssignmentSubmission from '../../src/modules/assignments/assignmentSubmission.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import Student from '../../src/modules/students/student.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as assignmentService from '../../src/modules/assignments/assignment.service.js';
import { ROLES, ASSIGNMENT_STATUS, SUBMISSION_STATUS } from '../../src/constants/index.js';

describe('Assignment Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const subjectId = '507f1f77bcf86cd799439055';
  const teacherId = '507f1f77bcf86cd799439066';
  const teacherUserId = '507f1f77bcf86cd799439067';
  const studentId = '507f1f77bcf86cd799439077';
  const studentUserId = '507f1f77bcf86cd799439078';

  const teacherUser = { id: teacherUserId, role: ROLES.TEACHER, schoolId };
  const studentUser = { id: studentUserId, role: ROLES.STUDENT, schoolId };

  it('should create assignment in DRAFT status', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origSectionFindOne = Section.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;
    const origAssignmentSave = Assignment.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, userId: teacherUserId, schoolId });
    TeacherAssignment.findOne = () => Promise.resolve({ _id: 'assign-1', status: 'ACTIVE' });
    Assignment.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439099';
      return Promise.resolve(this);
    };

    const result = await assignmentService.createAssignment(
      {
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        title: 'Trigonometry Problem Set',
        description: 'Complete all exercises in Chapter 4',
        dueDate: '2026-10-15T23:59:59Z',
        maxScore: 100,
        lateSubmissionPenaltyPercentage: 10,
      },
      teacherUser
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    Section.findOne = origSectionFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;
    Assignment.prototype.save = origAssignmentSave;

    assert.equal(result.status, ASSIGNMENT_STATUS.DRAFT);
    assert.equal(result.title, 'Trigonometry Problem Set');
  });

  it('should publish assignment successfully', async () => {
    const origAssignmentFindOne = Assignment.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    const mockAssignment = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      classId,
      sectionId,
      subjectId,
      status: ASSIGNMENT_STATUS.DRAFT,
      save: () => Promise.resolve(mockAssignment),
      toJSON: () => ({ id: '507f1f77bcf86cd799439099', status: ASSIGNMENT_STATUS.PUBLISHED }),
    };

    Assignment.findOne = () => Promise.resolve(mockAssignment);
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, userId: teacherUserId, schoolId });
    TeacherAssignment.findOne = () => Promise.resolve({ _id: 'assign-1', status: 'ACTIVE' });

    const result = await assignmentService.publishAssignment('507f1f77bcf86cd799439099', teacherUser);

    Assignment.findOne = origAssignmentFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;

    assert.equal(result.status, ASSIGNMENT_STATUS.PUBLISHED);
  });

  it('should submit assignment and apply LATE status if past due date', async () => {
    const origAssignmentFindOne = Assignment.findOne;
    const origStudentFindOne = Student.findOne;
    const origSubmissionFindOne = AssignmentSubmission.findOne;
    const origSubmissionSave = AssignmentSubmission.prototype.save;

    Assignment.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        sectionId,
        status: ASSIGNMENT_STATUS.PUBLISHED,
        dueDate: new Date('2026-01-01'), // In the past!
        allowLateSubmission: true,
        lateSubmissionPenaltyPercentage: 15,
      });

    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        userId: studentUserId,
        sectionId,
        schoolId,
      });

    AssignmentSubmission.findOne = () => Promise.resolve(null); // First submission
    AssignmentSubmission.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439088';
      return Promise.resolve(this);
    };

    const result = await assignmentService.submitAssignment(
      '507f1f77bcf86cd799439099',
      { submissionContent: 'Late submission with solutions' },
      studentUser
    );

    Assignment.findOne = origAssignmentFindOne;
    Student.findOne = origStudentFindOne;
    AssignmentSubmission.findOne = origSubmissionFindOne;
    AssignmentSubmission.prototype.save = origSubmissionSave;

    assert.equal(result.status, SUBMISSION_STATUS.LATE);
  });

  it('should grade submission and apply late penalty percentage if submitted late', async () => {
    const origSubmissionFindOne = AssignmentSubmission.findOne;
    const origAssignmentFindOne = Assignment.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    const mockSubmission = {
      _id: '507f1f77bcf86cd799439088',
      schoolId,
      assignmentId: '507f1f77bcf86cd799439099',
      studentId,
      status: SUBMISSION_STATUS.LATE,
      score: null,
      save: () => Promise.resolve(mockSubmission),
      toJSON: () => ({ id: '507f1f77bcf86cd799439088', score: mockSubmission.score, status: mockSubmission.status }),
    };

    AssignmentSubmission.findOne = () => Promise.resolve(mockSubmission);
    Assignment.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        classId,
        sectionId,
        subjectId,
        maxScore: 100,
        lateSubmissionPenaltyPercentage: 20, // 20% penalty
      });

    Teacher.findOne = () => Promise.resolve({ _id: teacherId, userId: teacherUserId, schoolId });
    TeacherAssignment.findOne = () => Promise.resolve({ _id: 'assign-1', status: 'ACTIVE' });

    // Raw score is 90, with 20% penalty final score should be 72
    const result = await assignmentService.gradeSubmission(
      '507f1f77bcf86cd799439088',
      { score: 90, feedback: 'Well done, 20% deducted for late submission' },
      teacherUser
    );

    AssignmentSubmission.findOne = origSubmissionFindOne;
    Assignment.findOne = origAssignmentFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;

    assert.equal(result.score, 72);
    assert.equal(result.status, SUBMISSION_STATUS.GRADED);
  });

  it('should get assignments list with pagination', async () => {
    const origTeacherFindOne = Teacher.findOne;
    const origAssignmentFind = Assignment.find;
    const origAssignmentCount = Assignment.countDocuments;

    Teacher.findOne = () =>
      Promise.resolve({
        _id: teacherId,
        userId: teacherUserId,
        schoolId,
      });

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: '507f1f77bcf86cd799439099',
            title: 'Sample Assignment',
            toJSON: () => ({ id: '507f1f77bcf86cd799439099', title: 'Sample Assignment' }),
          },
        ]),
    };

    Assignment.find = () => mockQuery;
    Assignment.countDocuments = () => Promise.resolve(1);

    const result = await assignmentService.getAssignmentsList({}, teacherUser);

    Teacher.findOne = origTeacherFindOne;
    Assignment.find = origAssignmentFind;
    Assignment.countDocuments = origAssignmentCount;

    assert.equal(result.assignments.length, 1);
    assert.equal(result.pagination.total, 1);
  });

  it('should soft delete assignment', async () => {
    const origAssignmentFindOne = Assignment.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    const mockAssignment = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      classId,
      sectionId,
      subjectId,
      isDeleted: false,
      save: () => Promise.resolve(mockAssignment),
    };

    Assignment.findOne = () => Promise.resolve(mockAssignment);
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, userId: teacherUserId, schoolId });
    TeacherAssignment.findOne = () => Promise.resolve({ _id: 'assign-1', status: 'ACTIVE' });

    const result = await assignmentService.deleteAssignment('507f1f77bcf86cd799439099', teacherUser);

    Assignment.findOne = origAssignmentFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;

    assert.equal(result.success, true);
    assert.equal(mockAssignment.isDeleted, true);
  });
});
