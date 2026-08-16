import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS, DEFAULT_ROLE_PERMISSIONS } from '../../src/constants/index.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import Student from '../../src/modules/students/student.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Attendance from '../../src/modules/attendance/attendance.model.js';
import FeeInvoice from '../../src/modules/fees/feeInvoice.model.js';
import Assignment from '../../src/modules/assignments/assignment.model.js';
import AssignmentSubmission from '../../src/modules/assignments/assignmentSubmission.model.js';
import Result from '../../src/modules/results/result.model.js';
import AuditLog from '../../src/modules/audit/auditLog.model.js';

// Helper to make test HTTP requests
const makeRequest = async (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const res = await fetch(`http://localhost:${port}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : null,
        });

        const status = res.status;
        const data = await res.json().catch(() => null);
        server.close(() => resolve({ status, data }));
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
};

describe('Analytics API Routes Integration Tests', () => {
  const schoolAdminUser = {
    _id: '507f1f77bcf86cd799439011',
    role: ROLES.SCHOOL_ADMIN,
    schoolId: '507f1f77bcf86cd799439099',
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439011' }),
  };

  const superAdminUser = {
    _id: '507f1f77bcf86cd799439000',
    role: ROLES.SUPER_ADMIN,
    schoolId: null,
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439000' }),
  };

  const teacherUser = {
    _id: '507f1f77bcf86cd799439022',
    role: ROLES.TEACHER,
    schoolId: '507f1f77bcf86cd799439099',
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439022' }),
  };

  const schoolAdminToken = jwt.sign(
    { sub: schoolAdminUser._id, role: schoolAdminUser.role, schoolId: schoolAdminUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const superAdminToken = jwt.sign(
    { sub: superAdminUser._id, role: superAdminUser.role, schoolId: superAdminUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const teacherToken = jwt.sign(
    { sub: teacherUser._id, role: teacherUser.role, schoolId: teacherUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  let origUserFindById, origSchoolFindById;
  let origStudentAgg, origTeacherCount, origClassCount, origSectionCount;
  let origAttendanceAgg, origFeeInvoiceAgg, origAssignmentCount, origSubCount, origResultAgg;
  let origSchoolAgg, origUserAgg, origAuditCount;

  beforeEach(() => {
    origUserFindById = User.findById;
    origSchoolFindById = School.findById;
    origStudentAgg = Student.aggregate;
    origTeacherCount = Teacher.countDocuments;
    origClassCount = Class.countDocuments;
    origSectionCount = Section.countDocuments;
    origAttendanceAgg = Attendance.aggregate;
    origFeeInvoiceAgg = FeeInvoice.aggregate;
    origAssignmentCount = Assignment.countDocuments;
    origSubCount = AssignmentSubmission.countDocuments;
    origResultAgg = Result.aggregate;
    origSchoolAgg = School.aggregate;
    origUserAgg = User.aggregate;
    origAuditCount = AuditLog.countDocuments;

    User.findById = (id) => ({
      select: () => {
        if (id === superAdminUser._id) return Promise.resolve(superAdminUser);
        if (id === teacherUser._id) return Promise.resolve(teacherUser);
        return Promise.resolve(schoolAdminUser);
      },
    });

    School.findById = (id) =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        status: SCHOOL_STATUS.ACTIVE,
      });

    // Mock aggregation pipelines
    Student.aggregate = () =>
      Promise.resolve([
        {
          totalStudents: 150,
          activeStudents: 145,
          maleStudents: 80,
          femaleStudents: 65,
          otherStudents: 0,
        },
      ]);

    Teacher.countDocuments = () => Promise.resolve(10);
    Class.countDocuments = () => Promise.resolve(6);
    Section.countDocuments = () => Promise.resolve(12);

    Attendance.aggregate = () =>
      Promise.resolve([
        { _id: 'PRESENT', count: 1200 },
        { _id: 'ABSENT', count: 50 },
        { _id: 'LATE', count: 30 },
      ]);

    FeeInvoice.aggregate = () =>
      Promise.resolve([
        {
          totalInvoiced: 50000,
          totalPaid: 45000,
          totalBalance: 5000,
          totalDiscount: 1000,
          totalInvoices: 100,
          paidInvoices: 90,
          unpaidInvoices: 10,
          partiallyPaidInvoices: 0,
        },
      ]);

    Assignment.countDocuments = () => Promise.resolve(25);
    AssignmentSubmission.countDocuments = () => Promise.resolve(240);

    Result.aggregate = () =>
      Promise.resolve([
        {
          totalResults: 150,
          passedResults: 140,
          averagePercentage: 82.5,
          averageGpa: 3.45,
        },
      ]);

    School.aggregate = () =>
      Promise.resolve([
        { _id: 'ACTIVE', count: 15 },
        { _id: 'PENDING', count: 2 },
      ]);

    User.aggregate = () =>
      Promise.resolve([
        { _id: 'SUPER_ADMIN', count: 2 },
        { _id: 'SCHOOL_ADMIN', count: 15 },
        { _id: 'TEACHER', count: 120 },
        { _id: 'STUDENT', count: 2500 },
      ]);

    AuditLog.countDocuments = () => Promise.resolve(4500);
  });

  afterEach(() => {
    User.findById = origUserFindById;
    School.findById = origSchoolFindById;
    Student.aggregate = origStudentAgg;
    Teacher.countDocuments = origTeacherCount;
    Class.countDocuments = origClassCount;
    Section.countDocuments = origSectionCount;
    Attendance.aggregate = origAttendanceAgg;
    FeeInvoice.aggregate = origFeeInvoiceAgg;
    Assignment.countDocuments = origAssignmentCount;
    AssignmentSubmission.countDocuments = origSubCount;
    Result.aggregate = origResultAgg;
    School.aggregate = origSchoolAgg;
    User.aggregate = origUserAgg;
    AuditLog.countDocuments = origAuditCount;
  });

  it('GET /api/v1/analytics/school without token should return 401', async () => {
    const res = await makeRequest('GET', '/api/v1/analytics/school');
    assert.equal(res.status, 401);
  });

  it('GET /api/v1/analytics/school for School Admin should return 200 with complete KPI metrics', async () => {
    const res = await makeRequest('GET', '/api/v1/analytics/school', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.demographics.totalStudents, 150);
    assert.equal(res.data.data.academicStructure.totalTeachers, 10);
    assert.equal(res.data.data.academicStructure.studentTeacherRatio, 14.5);
    assert.ok(res.data.data.attendance.attendanceRatePercentage > 0);
    assert.equal(res.data.data.financials.totalInvoiced, 50000);
    assert.equal(res.data.data.financials.collectionRatePercentage, 90);
    assert.equal(res.data.data.academic.totalAssignments, 25);
  });

  it('GET /api/v1/analytics/platform for non-Super Admin should return 403 Forbidden', async () => {
    const res = await makeRequest('GET', '/api/v1/analytics/platform', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 403);
  });

  it('GET /api/v1/analytics/platform for Super Admin should return 200 with platform metrics', async () => {
    const res = await makeRequest('GET', '/api/v1/analytics/platform', null, {
      Authorization: `Bearer ${superAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.schools.ACTIVE, 15);
    assert.equal(res.data.data.users.STUDENT, 2500);
    assert.equal(res.data.data.systemActivity.totalAuditEvents, 4500);
  });
});
