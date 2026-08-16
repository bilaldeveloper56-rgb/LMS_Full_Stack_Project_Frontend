import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import requirePermission from '../../src/middlewares/requirePermission.js';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';
import * as assignmentService from '../../src/modules/assignments/assignment.service.js';
import * as quizService from '../../src/modules/quizzes/quiz.service.js';
import * as resultService from '../../src/modules/results/result.service.js';
import * as timetableService from '../../src/modules/timetable/timetable.service.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import Timetable from '../../src/modules/timetable/timetable.model.js';
import Assignment from '../../src/modules/assignments/assignment.model.js';
import Quiz from '../../src/modules/quizzes/quiz.model.js';
import Exam from '../../src/modules/exams/exam.model.js';
import Result from '../../src/modules/results/result.model.js';
import {
  ROLES,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PROTECTED_FIELDS,
} from '../../src/constants/index.js';

function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    const res = {};
    middleware(req, res, (err) => {
      resolve(err || null);
    });
  });
}

describe('Phase 7 — LMS Multi-Tenant & RBAC Security Tests', () => {
  const schoolAId = '507f1f77bcf86cd799439001';
  const schoolBId = '507f1f77bcf86cd799439002';

  const schoolAAdmin = { id: 'admin-a', role: ROLES.SCHOOL_ADMIN, schoolId: schoolAId };
  const teacherA = { id: 'teacher-a-user', role: ROLES.TEACHER, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER };
  const studentA = { id: 'student-a-user', role: ROLES.STUDENT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.STUDENT };
  const parentA = { id: 'parent-a-user', role: ROLES.PARENT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.PARENT };
  const accountantA = { id: 'accountant-a', role: ROLES.ACCOUNTANT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT };
  const librarianA = { id: 'librarian-a', role: ROLES.LIBRARIAN, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.LIBRARIAN };
  const staffA = { id: 'staff-a', role: ROLES.STAFF, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.STAFF };
  const superAdmin = { id: 'super-1', role: ROLES.SUPER_ADMIN, schoolId: null, permissions: [] };

  // 1. School A cannot delete School B timetable
  it('should prevent School A user from deleting School B timetable entry', async () => {
    const origTimetableFindOne = Timetable.findOne;
    Timetable.findOne = (query) => {
      if (query.schoolId === schoolAId) return Promise.resolve(null);
      return Promise.resolve({ _id: 'tt-in-b', schoolId: schoolBId });
    };

    await assert.rejects(
      () => timetableService.deleteTimetableEntry('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Timetable.findOne = origTimetableFindOne;
  });

  // 2. School A cannot read School B assignment
  it('should prevent School A user from viewing School B assignment', async () => {
    const origAssignmentFindOne = Assignment.findOne;
    Assignment.findOne = (query) => {
      const mockResult = query.schoolId === schoolAId ? null : { _id: 'assign-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => assignmentService.getAssignmentById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Assignment.findOne = origAssignmentFindOne;
  });

  // 3. School A cannot read School B quiz
  it('should prevent School A user from viewing School B quiz', async () => {
    const origQuizFindOne = Quiz.findOne;
    Quiz.findOne = (query) => {
      const mockResult = query.schoolId === schoolAId ? null : { _id: 'quiz-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => quizService.getQuizById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Quiz.findOne = origQuizFindOne;
  });

  // 4. Teacher cannot create assignment for unassigned class/section/subject
  it('should reject teacher from creating assignment for unassigned subject', async () => {
    const origTeacherFindOne = Teacher.findOne;
    const origAssignmentFindOne = TeacherAssignment.findOne;

    Teacher.findOne = () => Promise.resolve({ _id: 'teacher-doc-1', userId: teacherA.id, schoolId: schoolAId });
    TeacherAssignment.findOne = () => Promise.resolve(null); // Not assigned!

    await assert.rejects(
      () =>
        assignmentService.verifyTeacherSubjectAssignment(teacherA, {
          schoolId: schoolAId,
          classId: '507f1f77bcf86cd799439033',
          sectionId: '507f1f77bcf86cd799439044',
          subjectId: '507f1f77bcf86cd799439055',
        }),
      (err) => err.statusCode === 403 && err.message.includes('only manage assignments for their assigned')
    );

    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origAssignmentFindOne;
  });

  // 5. Teacher cannot create quiz for unassigned class/section/subject
  it('should reject teacher from creating quiz for unassigned subject', async () => {
    const origTeacherFindOne = Teacher.findOne;
    const origAssignmentFindOne = TeacherAssignment.findOne;

    Teacher.findOne = () => Promise.resolve({ _id: 'teacher-doc-1', userId: teacherA.id, schoolId: schoolAId });
    TeacherAssignment.findOne = () => Promise.resolve(null); // Not assigned!

    await assert.rejects(
      () =>
        quizService.verifyTeacherSubjectAssignment(teacherA, {
          schoolId: schoolAId,
          classId: '507f1f77bcf86cd799439033',
          sectionId: '507f1f77bcf86cd799439044',
          subjectId: '507f1f77bcf86cd799439055',
        }),
      (err) => err.statusCode === 403 && err.message.includes('only manage quizzes for their assigned')
    );

    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origAssignmentFindOne;
  });

  // 6. Parent cannot access report card of unlinked student
  it('should reject parent from viewing report card of unlinked student', async () => {
    const origStudentFindOne = Student.findOne;
    const origParentFindOne = Parent.findOne;
    const origLinkFindOne = StudentParent.findOne;

    Student.findOne = () => {
      const q = {
        populate: () => q,
        then: (resolve) =>
          Promise.resolve({
            _id: 'student-doc-1',
            schoolId: schoolAId,
            toJSON: () => ({ id: 'student-doc-1' }),
          }).then(resolve),
      };
      return q;
    };

    Parent.findOne = () => Promise.resolve({ _id: 'parent-doc-1', userId: parentA.id, schoolId: schoolAId });
    StudentParent.findOne = () => Promise.resolve(null); // No link!

    await assert.rejects(
      () => resultService.getStudentReportCard('507f1f77bcf86cd799439055', null, parentA),
      (err) => err.statusCode === 403 && err.message.includes('linked children')
    );

    Student.findOne = origStudentFindOne;
    Parent.findOne = origParentFindOne;
    StudentParent.findOne = origLinkFindOne;
  });

  // 7. Student cannot lock or publish results
  it('should deny STUDENT access to results:lock and results:publish', async () => {
    const lockMw = requirePermission(PERMISSIONS.RESULTS_LOCK);
    const publishMw = requirePermission(PERMISSIONS.RESULTS_PUBLISH);

    const lockErr = await runMiddleware(lockMw, { user: studentA });
    assert.ok(lockErr);
    assert.equal(lockErr.statusCode, 403);

    const pubErr = await runMiddleware(publishMw, { user: studentA });
    assert.ok(pubErr);
    assert.equal(pubErr.statusCode, 403);
  });

  // 8. Accountant and Librarian cannot mutate LMS content
  it('should deny ACCOUNTANT and LIBRARIAN access to assignments:create', async () => {
    const mw = requirePermission(PERMISSIONS.ASSIGNMENTS_CREATE);
    const accErr = await runMiddleware(mw, { user: accountantA });
    assert.ok(accErr);
    assert.equal(accErr.statusCode, 403);

    const libErr = await runMiddleware(mw, { user: librarianA });
    assert.ok(libErr);
    assert.equal(libErr.statusCode, 403);
  });

  // 9. Staff cannot access results:create
  it('should deny STAFF access to results:create', async () => {
    const mw = requirePermission(PERMISSIONS.RESULTS_CREATE);
    const staffErr = await runMiddleware(mw, { user: staffA });
    assert.ok(staffErr);
    assert.equal(staffErr.statusCode, 403);
  });

  // 10. Mass assignment defense: strip LMS protected fields
  it('should sanitize LMS protected fields from client request body', async () => {
    const mw = sanitizeBody(...PROTECTED_FIELDS);
    const req = {
      body: {
        title: 'Valid Homework',
        score: 100,
        gradedBy: 'hacker-id',
        gradedAt: new Date(),
        isLocked: true,
        lockedBy: 'hacker-id',
        isPublished: true,
        publishedBy: 'hacker-id',
        isCorrect: true,
        marksAwarded: 50,
        totalScore: 100,
        isPassed: true,
        schoolId: schoolBId,
      },
    };

    const err = await runMiddleware(mw, req);
    assert.equal(err, null);
    assert.equal(req.body.title, 'Valid Homework');
    assert.equal(req.body.score, undefined);
    assert.equal(req.body.gradedBy, undefined);
    assert.equal(req.body.isLocked, undefined);
    assert.equal(req.body.isPublished, undefined);
    assert.equal(req.body.isCorrect, undefined);
    assert.equal(req.body.totalScore, undefined);
    assert.equal(req.body.isPassed, undefined);
    assert.equal(req.body.schoolId, undefined);
  });

  // 11. SUPER_ADMIN bypass
  it('should allow SUPER_ADMIN to access all LMS operations', async () => {
    const mw = requirePermission(PERMISSIONS.RESULTS_LOCK, PERMISSIONS.EXAMS_PUBLISH, PERMISSIONS.TIMETABLE_CREATE);
    const err = await runMiddleware(mw, { user: superAdmin });
    assert.equal(err, null);
  });
});
