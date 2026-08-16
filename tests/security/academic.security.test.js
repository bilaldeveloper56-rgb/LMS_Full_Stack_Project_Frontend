import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import requirePermission from '../../src/middlewares/requirePermission.js';
import { enforceTenant, requireSchoolMembership, buildTenantQuery } from '../../src/middlewares/tenantIsolation.js';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';
import * as studentService from '../../src/modules/students/student.service.js';
import * as teacherService from '../../src/modules/teachers/teacher.service.js';
import * as classService from '../../src/modules/academics/class.service.js';
import * as subjectService from '../../src/modules/academics/subject.service.js';
import * as studentParentService from '../../src/modules/parents/studentParent.service.js';
import * as assignmentService from '../../src/modules/academics/teacherAssignment.service.js';
import * as enrollmentService from '../../src/modules/students/enrollment.service.js';
import School from '../../src/modules/schools/school.model.js';
import Student from '../../src/modules/students/student.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
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

describe('Phase 5 — Academic & User Management Multi-Tenant Security Tests', () => {
  const schoolAId = '507f1f77bcf86cd799439001';
  const schoolBId = '507f1f77bcf86cd799439002';

  const schoolAAdmin = { id: 'admin-a', role: ROLES.SCHOOL_ADMIN, schoolId: schoolAId };
  const teacherA = { id: 'teacher-a', role: ROLES.TEACHER, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER };
  const studentA = { id: 'student-a', role: ROLES.STUDENT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.STUDENT };
  const parentA = { id: 'parent-a', role: ROLES.PARENT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.PARENT };
  const accountantA = { id: 'accountant-a', role: ROLES.ACCOUNTANT, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT };
  const librarianA = { id: 'librarian-a', role: ROLES.LIBRARIAN, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.LIBRARIAN };
  const staffA = { id: 'staff-a', role: ROLES.STAFF, schoolId: schoolAId, permissions: DEFAULT_ROLE_PERMISSIONS.STAFF };
  const superAdmin = { id: 'super-1', role: ROLES.SUPER_ADMIN, schoolId: null, permissions: [] };

  // ─── 1. School A cannot access School B students ───
  it('should prevent School A user from retrieving School B student', async () => {
    const origStudentFindOne = Student.findOne;
    Student.findOne = (query) => {
      const mockResult = (query.schoolId === schoolAId) ? null : { _id: 'student-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => studentService.getStudentById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Student.findOne = origStudentFindOne;
  });

  // ─── 2. School A cannot update School B teachers ───
  it('should prevent School A user from updating School B teacher', async () => {
    const origTeacherFindOne = Teacher.findOne;
    Teacher.findOne = (query) => {
      if (query.schoolId === schoolAId) return Promise.resolve(null);
      return Promise.resolve({ _id: 'teacher-in-b', schoolId: schoolBId });
    };

    await assert.rejects(
      () => teacherService.updateTeacher('507f1f77bcf86cd799439099', { firstName: 'Hacked' }, schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Teacher.findOne = origTeacherFindOne;
  });

  // ─── 3. School A cannot access School B classes ───
  it('should prevent School A user from accessing School B class', async () => {
    const origClassFindOne = Class.findOne;
    Class.findOne = (query) => {
      const mockResult = (query.schoolId === schoolAId) ? null : { _id: 'class-in-b', schoolId: schoolBId };
      const q = {
        populate: () => q,
        then: (resolve, reject) => Promise.resolve(mockResult).then(resolve, reject),
      };
      return q;
    };

    await assert.rejects(
      () => classService.getClassById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Class.findOne = origClassFindOne;
  });

  // ─── 4. School A cannot access School B subjects ───
  it('should prevent School A user from accessing School B subject', async () => {
    const origSubjectFindOne = Subject.findOne;
    Subject.findOne = (query) => {
      if (query.schoolId === schoolAId) return Promise.resolve(null);
      return Promise.resolve({ _id: 'subject-in-b', schoolId: schoolBId });
    };

    await assert.rejects(
      () => subjectService.getSubjectById('507f1f77bcf86cd799439099', schoolAAdmin),
      (err) => err.statusCode === 404
    );

    Subject.findOne = origSubjectFindOne;
  });

  // ─── 5. Cross-school parent/student relationship fails ───
  it('should reject parent-student link if parent belongs to another school', async () => {
    const origSchoolFindById = School.findById;
    const origStudentFindOne = Student.findOne;
    const origParentFindOne = Parent.findOne;

    School.findById = () => Promise.resolve({ _id: schoolAId, isDeleted: false });
    Student.findOne = () => Promise.resolve({ _id: 'student-in-a', schoolId: schoolAId });
    Parent.findOne = () => Promise.resolve(null); // Parent not in School A

    await assert.rejects(
      () =>
        studentParentService.createStudentParentLink(
          {
            studentId: 'student-in-a',
            parentId: 'parent-in-b',
          },
          schoolAAdmin
        ),
      (err) => err.statusCode === 404 && err.message.includes('Parent not found in this school')
    );

    School.findById = origSchoolFindById;
    Student.findOne = origStudentFindOne;
    Parent.findOne = origParentFindOne;
  });

  // ─── 6. Cross-school teacher assignment fails ───
  it('should reject teacher assignment if teacher belongs to another school', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origTeacherFindOne = Teacher.findOne;

    School.findById = () => Promise.resolve({ _id: schoolAId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: 'session-a', schoolId: schoolAId });
    Teacher.findOne = () => Promise.resolve(null); // Teacher not in School A

    await assert.rejects(
      () =>
        assignmentService.createTeacherAssignment(
          {
            academicSessionId: 'session-a',
            teacherId: 'teacher-in-b',
            classId: 'class-a',
            sectionId: 'section-a',
            subjectId: 'subject-a',
          },
          schoolAAdmin
        ),
      (err) => err.statusCode === 404 && err.message.includes('Teacher not found in this school')
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Teacher.findOne = origTeacherFindOne;
  });

  // ─── 7. Cross-school enrollment fails ───
  it('should reject enrollment if class belongs to another school', async () => {
    const origSchoolFindById = School.findById;
    const origStudentFindOne = Student.findOne;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;

    School.findById = () => Promise.resolve({ _id: schoolAId, isDeleted: false });
    Student.findOne = () => Promise.resolve({ _id: 'student-a', schoolId: schoolAId });
    AcademicSession.findOne = () => Promise.resolve({ _id: 'session-a', schoolId: schoolAId });
    Class.findOne = () => Promise.resolve(null); // Class not in School A

    await assert.rejects(
      () =>
        enrollmentService.createEnrollment(
          {
            studentId: 'student-a',
            academicSessionId: 'session-a',
            classId: 'class-in-b',
            sectionId: 'section-a',
          },
          schoolAAdmin
        ),
      (err) => err.statusCode === 404 && err.message.includes('Class not found in this school')
    );

    School.findById = origSchoolFindById;
    Student.findOne = origStudentFindOne;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
  });

  // ─── 8. Frontend schoolId cannot bypass tenant isolation ───
  it('should override frontend schoolId in body and query via enforceTenant middleware', async () => {
    const req = {
      user: schoolAAdmin,
      body: { schoolId: schoolBId, name: 'Attacker Class' },
      query: { schoolId: schoolBId },
    };

    const err = await runMiddleware(enforceTenant, req);
    assert.equal(err, null);
    assert.equal(req.body.schoolId, schoolAId);
    assert.equal(req.query.schoolId, schoolAId);
    assert.equal(req.tenantId, schoolAId);
  });

  // ─── 9. Student cannot modify another student's record ───
  it('should deny STUDENT access to students:update permission', async () => {
    const mw = requirePermission(PERMISSIONS.STUDENTS_UPDATE);
    const err = await runMiddleware(mw, { user: studentA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes('students:update'));
  });

  // ─── 10. Parent cannot create or delete academic classes ───
  it('should deny PARENT access to classes:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.CLASSES_CREATE);
    const err = await runMiddleware(mw, { user: parentA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 11. Teacher cannot delete school or manage academic sessions ───
  it('should deny TEACHER access to academic_sessions:manage permission', async () => {
    const mw = requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_MANAGE);
    const err = await runMiddleware(mw, { user: teacherA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 12. User cannot modify schoolId or role via mass assignment ───
  it('should strip role, schoolId, permissions, status from body via sanitizeBody', async () => {
    const mw = sanitizeBody(...PROTECTED_FIELDS);
    const req = {
      body: {
        firstName: 'John',
        role: 'SUPER_ADMIN',
        schoolId: schoolBId,
        permissions: ['*'],
        status: 'ACTIVE',
        isDeleted: true,
      },
    };

    const err = await runMiddleware(mw, req);
    assert.equal(err, null);
    assert.equal(req.body.firstName, 'John');
    assert.equal(req.body.role, undefined);
    assert.equal(req.body.schoolId, undefined);
    assert.equal(req.body.permissions, undefined);
    assert.equal(req.body.status, undefined);
    assert.equal(req.body.isDeleted, undefined);
  });

  // ─── 13. Accountant cannot mutate academic subjects ───
  it('should deny ACCOUNTANT access to subjects:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.SUBJECTS_CREATE);
    const err = await runMiddleware(mw, { user: accountantA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 14. Librarian cannot mutate teacher records ───
  it('should deny LIBRARIAN access to teachers:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.TEACHERS_CREATE);
    const err = await runMiddleware(mw, { user: librarianA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 15. Staff cannot create students ───
  it('should deny STAFF access to students:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.STUDENTS_CREATE);
    const err = await runMiddleware(mw, { user: staffA });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 16. SUPER_ADMIN can operate across schools ───
  it('should allow SUPER_ADMIN to pass requirePermission checks for all academic domains', async () => {
    const mw = requirePermission(
      PERMISSIONS.ACADEMIC_SESSIONS_MANAGE,
      PERMISSIONS.CLASSES_CREATE,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.TEACHERS_MANAGE
    );
    const err = await runMiddleware(mw, { user: superAdmin });
    assert.equal(err, null);
  });

  // ─── 17. buildTenantQuery scopes queries strictly by user school ───
  it('should build query scoped to schoolId for School Admin and unscoped for Super Admin', () => {
    const adminQuery = buildTenantQuery({ user: schoolAAdmin }, { isActive: true });
    assert.deepStrictEqual(adminQuery, { isActive: true, schoolId: schoolAId });

    const superQuery = buildTenantQuery({ user: superAdmin }, { isActive: true });
    assert.deepStrictEqual(superQuery, { isActive: true });
  });
});
