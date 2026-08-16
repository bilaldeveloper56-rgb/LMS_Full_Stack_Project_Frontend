import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import requirePermission from '../../src/middlewares/requirePermission.js';
import { enforceTenant } from '../../src/middlewares/tenantIsolation.js';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';
import * as attendanceService from '../../src/modules/attendance/attendance.service.js';
import * as leaveService from '../../src/modules/leaves/leave.service.js';
import Attendance from '../../src/modules/attendance/attendance.model.js';
import Leave from '../../src/modules/leaves/leave.model.js';
import Student from '../../src/modules/students/student.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import Section from '../../src/modules/academics/section.model.js';
import School from '../../src/modules/schools/school.model.js';
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

describe('Phase 6 — Attendance & Leave Multi-Tenant Security Tests', () => {
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

  // 1. School A cannot read School B attendance
  it('should prevent School A user from retrieving School B attendance record', async () => {
    const origAttendanceFindOne = Attendance.findOne;
    Attendance.findOne = (query) => {
      const mockResult = query.schoolId === schoolAId ? null : { _id: 'att-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => attendanceService.getAttendanceById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Attendance.findOne = origAttendanceFindOne;
  });

  // 2. School A cannot modify School B attendance
  it('should prevent School A user from updating School B attendance record', async () => {
    const origAttendanceFindOne = Attendance.findOne;
    Attendance.findOne = (query) => {
      if (query.schoolId === schoolAId) return Promise.resolve(null);
      return Promise.resolve({ _id: 'att-in-b', schoolId: schoolBId });
    };

    await assert.rejects(
      () => attendanceService.updateAttendance('507f1f77bcf86cd799439099', { status: 'ABSENT' }, schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Attendance.findOne = origAttendanceFindOne;
  });

  // 3. School A cannot read School B leaves
  it('should prevent School A user from retrieving School B leave record', async () => {
    const origLeaveFindOne = Leave.findOne;
    Leave.findOne = (query) => {
      const mockResult = query.schoolId === schoolAId ? null : { _id: 'leave-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => leaveService.getLeaveById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Leave.findOne = origLeaveFindOne;
  });

  // 4. School A cannot modify School B leaves
  it('should prevent School A user from updating School B leave record', async () => {
    const origLeaveFindOne = Leave.findOne;
    Leave.findOne = (query) => {
      if (query.schoolId === schoolAId) return Promise.resolve(null);
      return Promise.resolve({ _id: 'leave-in-b', schoolId: schoolBId, status: 'PENDING' });
    };

    await assert.rejects(
      () => leaveService.updateLeave('507f1f77bcf86cd799439099', { reason: 'Tampered' }, schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Leave.findOne = origLeaveFindOne;
  });

  // 5. Student cannot modify attendance
  it('should deny STUDENT access to attendance:update and attendance:create', async () => {
    const createMw = requirePermission(PERMISSIONS.ATTENDANCE_CREATE);
    const updateMw = requirePermission(PERMISSIONS.ATTENDANCE_UPDATE);

    const createErr = await runMiddleware(createMw, { user: studentA });
    assert.ok(createErr);
    assert.equal(createErr.statusCode, 403);

    const updateErr = await runMiddleware(updateMw, { user: studentA });
    assert.ok(updateErr);
    assert.equal(updateErr.statusCode, 403);
  });

  // 6. Student can only read own attendance
  it('should reject student from reading another students attendance profile', async () => {
    const origStudentFindOne = Student.findOne;
    Student.findOne = () =>
      Promise.resolve({
        _id: 'other-student-doc',
        userId: 'some-other-user',
        schoolId: schoolAId,
        toJSON: () => ({ id: 'other-student-doc' }),
      });

    await assert.rejects(
      () => attendanceService.getStudentAttendanceProfile('507f1f77bcf86cd799439099', {}, studentA),
      (err) => err.statusCode === 403 && err.message.includes('only access their own')
    );

    Student.findOne = origStudentFindOne;
  });

  // 7. Parent can only read linked child's attendance
  it('should reject parent from reading attendance of unlinked student', async () => {
    const origStudentFindOne = Student.findOne;
    const origParentFindOne = Parent.findOne;
    const origLinkFindOne = StudentParent.findOne;

    Student.findOne = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        schoolId: schoolAId,
        toJSON: () => ({ id: '507f1f77bcf86cd799439099' }),
      });
    Parent.findOne = () => Promise.resolve({ _id: 'parent-doc-1', schoolId: schoolAId });
    StudentParent.findOne = () => Promise.resolve(null); // No link!

    await assert.rejects(
      () => attendanceService.getStudentAttendanceProfile('507f1f77bcf86cd799439099', {}, parentA),
      (err) => err.statusCode === 403 && err.message.includes('linked children')
    );

    Student.findOne = origStudentFindOne;
    Parent.findOne = origParentFindOne;
    StudentParent.findOne = origLinkFindOne;
  });

  // 8. Teacher cannot modify another teacher's assigned section attendance
  it('should reject teacher from marking attendance in unassigned class/section', async () => {
    const origTeacherFindOne = Teacher.findOne;
    const origAssignmentFindOne = TeacherAssignment.findOne;
    const origSectionFindOne = Section.findOne;

    Teacher.findOne = () => Promise.resolve({ _id: 'teacher-doc-a', schoolId: schoolAId });
    TeacherAssignment.findOne = () => Promise.resolve(null); // Not assigned!
    Section.findOne = () => Promise.resolve(null); // Not class teacher!

    await assert.rejects(
      () =>
        attendanceService.verifyTeacherAssignment(teacherA, {
          schoolId: schoolAId,
          classId: 'class-unassigned',
          sectionId: 'section-unassigned',
        }),
      (err) => err.statusCode === 403 && err.message.includes('only for their assigned classes')
    );

    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origAssignmentFindOne;
    Section.findOne = origSectionFindOne;
  });

  // 9. Teacher cannot approve their own leave
  it('should prevent teacher from self-approving their own leave request', async () => {
    const origLeaveFindOne = Leave.findOne;
    Leave.findOne = () =>
      Promise.resolve({
        _id: 'leave-1',
        schoolId: schoolAId,
        applicantUserId: teacherA.id,
        teacherId: 'teacher-doc-a',
        status: 'PENDING',
      });

    await assert.rejects(
      () => leaveService.approveLeave('507f1f77bcf86cd799439099', teacherA),
      (err) => err.statusCode === 403 && err.message.includes('cannot approve their own')
    );

    Leave.findOne = origLeaveFindOne;
  });

  // 10. Student cannot approve or reject leave
  it('should prevent student from approving or rejecting leave', async () => {
    const approveMw = requirePermission(PERMISSIONS.LEAVES_APPROVE);
    const rejectMw = requirePermission(PERMISSIONS.LEAVES_REJECT);

    const approveErr = await runMiddleware(approveMw, { user: studentA });
    assert.ok(approveErr);
    assert.equal(approveErr.statusCode, 403);

    const rejectErr = await runMiddleware(rejectMw, { user: studentA });
    assert.ok(rejectErr);
    assert.equal(rejectErr.statusCode, 403);
  });

  // 11. Mass assignment defense: strip approvedBy, correctedBy, schoolId, applicantUserId
  it('should strip sensitive attendance & leave fields from request body', async () => {
    const mw = sanitizeBody(...PROTECTED_FIELDS);
    const req = {
      body: {
        reason: 'Valid reason',
        status: 'APPROVED',
        approvedBy: 'hacker-id',
        approvedAt: new Date(),
        correctedBy: 'hacker-id',
        correctedAt: new Date(),
        applicantUserId: 'victim-id',
        schoolId: schoolBId,
      },
    };

    const err = await runMiddleware(mw, req);
    assert.equal(err, null);
    assert.equal(req.body.reason, 'Valid reason');
    assert.equal(req.body.status, undefined);
    assert.equal(req.body.approvedBy, undefined);
    assert.equal(req.body.approvedAt, undefined);
    assert.equal(req.body.correctedBy, undefined);
    assert.equal(req.body.correctedAt, undefined);
    assert.equal(req.body.applicantUserId, undefined);
    assert.equal(req.body.schoolId, undefined);
  });

  // 12. Accountant / Librarian / Staff role boundaries
  it('should deny ACCOUNTANT and LIBRARIAN access to attendance:create', async () => {
    const mw = requirePermission(PERMISSIONS.ATTENDANCE_CREATE);
    const accountantErr = await runMiddleware(mw, { user: accountantA });
    assert.ok(accountantErr);
    assert.equal(accountantErr.statusCode, 403);

    const librarianErr = await runMiddleware(mw, { user: librarianA });
    assert.ok(librarianErr);
    assert.equal(librarianErr.statusCode, 403);
  });

  it('should deny STAFF access to leaves:approve', async () => {
    const mw = requirePermission(PERMISSIONS.LEAVES_APPROVE);
    const staffErr = await runMiddleware(mw, { user: staffA });
    assert.ok(staffErr);
    assert.equal(staffErr.statusCode, 403);
  });

  // 13. SUPER_ADMIN retains platform-wide access
  it('should allow SUPER_ADMIN to bypass permission and tenant checks', async () => {
    const mw = requirePermission(PERMISSIONS.ATTENDANCE_MANAGE, PERMISSIONS.LEAVES_APPROVE);
    const err = await runMiddleware(mw, { user: superAdmin });
    assert.equal(err, null);
  });
});
