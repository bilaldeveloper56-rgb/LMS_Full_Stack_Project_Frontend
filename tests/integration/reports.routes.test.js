import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import Student from '../../src/modules/students/student.model.js';
import Enrollment from '../../src/modules/students/enrollment.model.js';
import Attendance from '../../src/modules/attendance/attendance.model.js';
import FeeInvoice from '../../src/modules/fees/feeInvoice.model.js';
import Result from '../../src/modules/results/result.model.js';

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

describe('Reports API Routes Integration Tests', () => {
  const schoolAdminUser = {
    _id: '507f1f77bcf86cd799439011',
    role: ROLES.SCHOOL_ADMIN,
    schoolId: '507f1f77bcf86cd799439099',
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439011' }),
  };

  const schoolAdminToken = jwt.sign(
    { sub: schoolAdminUser._id, role: schoolAdminUser.role, schoolId: schoolAdminUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  let origUserFindById, origSchoolFindById;
  let origStudentFind, origStudentCount, origStudentFindOne;
  let origEnrollmentFind, origAttendanceAgg;
  let origFeeInvoiceFind, origFeeInvoiceCount, origResultFind;

  beforeEach(() => {
    origUserFindById = User.findById;
    origSchoolFindById = School.findById;
    origStudentFind = Student.find;
    origStudentCount = Student.countDocuments;
    origStudentFindOne = Student.findOne;
    origEnrollmentFind = Enrollment.find;
    origAttendanceAgg = Attendance.aggregate;
    origFeeInvoiceFind = FeeInvoice.find;
    origFeeInvoiceCount = FeeInvoice.countDocuments;
    origResultFind = Result.find;

    User.findById = (id) => ({
      select: () => Promise.resolve(schoolAdminUser),
    });

    School.findById = (id) =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        status: SCHOOL_STATUS.ACTIVE,
      });

    // Mock student roster and student lookups
    Student.find = () => {
      const resultData = [
        {
          _id: '507f1f77bcf86cd799439077',
          admissionNumber: 'ADM-001',
          gender: 'FEMALE',
          bloodGroup: 'O+',
          enrollmentStatus: 'ACTIVE',
          userId: {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@student.com',
            phone: '555-0100',
          },
        },
      ];

      return {
        populate: () => ({
          lean: () => Promise.resolve(resultData),
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: () => Promise.resolve(resultData),
              }),
            }),
          }),
        }),
      };
    };
    Student.countDocuments = () => Promise.resolve(1);

    Enrollment.find = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            lean: () =>
              Promise.resolve([
                {
                  studentId: '507f1f77bcf86cd799439077',
                  rollNumber: '101',
                  classId: { _id: 'c1', name: 'Grade 10', code: 'G10' },
                  sectionId: { _id: 's1', name: 'Section A', code: 'A' },
                  academicSessionId: { name: '2026-2027' },
                },
              ]),
          }),
        }),
      }),
    });

    // Mock attendance report
    Attendance.aggregate = (pipeline) => {
      if (pipeline.some((stage) => stage.$count)) {
        return Promise.resolve([{ total: 1 }]);
      }
      return Promise.resolve([
        {
          _id: '507f1f77bcf86cd799439077',
          totalDays: 20,
          presentDays: 18,
          absentDays: 1,
          lateDays: 1,
          halfDays: 0,
          excusedDays: 0,
        },
      ]);
    };

    // Mock fee defaulters report
    FeeInvoice.find = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: () =>
                    Promise.resolve([
                      {
                        _id: 'inv-1',
                        invoiceNumber: 'INV-2026-001',
                        studentId: {
                          _id: '507f1f77bcf86cd799439077',
                          admissionNumber: 'ADM-001',
                          userId: {
                            firstName: 'Alice',
                            lastName: 'Smith',
                            phone: '555-0100',
                          },
                        },
                        classId: { name: 'Grade 10' },
                        sectionId: { name: 'Section A' },
                        totalAmount: 1500,
                        paidAmount: 500,
                        balanceAmount: 1000,
                        dueDate: new Date(Date.now() - 86400000 * 5), // 5 days overdue
                        status: 'PARTIALLY_PAID',
                      },
                    ]),
                }),
              }),
            }),
          }),
        }),
      }),
    });
    FeeInvoice.countDocuments = () => Promise.resolve(1);

    // Mock academic report card
    Student.findOne = () => ({
      populate: () => ({
        lean: () =>
          Promise.resolve({
            _id: '507f1f77bcf86cd799439077',
            admissionNumber: 'ADM-001',
            gender: 'FEMALE',
            userId: {
              firstName: 'Alice',
              lastName: 'Smith',
              email: 'alice@student.com',
            },
          }),
      }),
    });

    Result.find = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: () => ({
              lean: () =>
                Promise.resolve([
                  {
                    _id: 'res-1',
                    marksObtained: 88,
                    totalMarks: 100,
                    percentage: 88,
                    grade: 'A',
                    gpa: 3.8,
                    isPassed: true,
                    examId: { name: 'Midterm Examination 2026' },
                  },
                ]),
            }),
          }),
        }),
      }),
    });
  });

  afterEach(() => {
    User.findById = origUserFindById;
    School.findById = origSchoolFindById;
    Student.find = origStudentFind;
    Student.countDocuments = origStudentCount;
    Student.findOne = origStudentFindOne;
    Enrollment.find = origEnrollmentFind;
    Attendance.aggregate = origAttendanceAgg;
    FeeInvoice.find = origFeeInvoiceFind;
    FeeInvoice.countDocuments = origFeeInvoiceCount;
    Result.find = origResultFind;
  });

  it('GET /api/v1/reports/student-roster without token should return 401', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/student-roster');
    assert.equal(res.status, 401);
  });

  it('GET /api/v1/reports/student-roster should return 200 with student roster pagination', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/student-roster', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.length, 1);
    assert.equal(res.data.data[0].admissionNumber, 'ADM-001');
    assert.equal(res.data.data[0].firstName, 'Alice');
    assert.equal(res.data.data[0].rollNumber, '101');
  });

  it('GET /api/v1/reports/attendance should return 200 with attendance register summary', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/attendance', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.length, 1);
    assert.equal(res.data.data[0].presentDays, 18);
    assert.ok(res.data.data[0].attendancePercentage > 0);
  });

  it('GET /api/v1/reports/fee-defaulters should return 200 with overdue balance summary', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/fee-defaulters', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.length, 1);
    assert.equal(res.data.data[0].balanceAmount, 1000);
    assert.equal(res.data.data[0].isOverdue, true);
    assert.ok(res.data.data[0].daysOverdue >= 4);
  });

  it('GET /api/v1/reports/report-card missing studentId should return 422', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/report-card', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 422);
  });

  it('GET /api/v1/reports/report-card with valid studentId should return 200 with academic transcript', async () => {
    const res = await makeRequest('GET', '/api/v1/reports/report-card?studentId=507f1f77bcf86cd799439077', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.student.admissionNumber, 'ADM-001');
    assert.equal(res.data.data.performance.cumulativePercentage, 88);
    assert.equal(res.data.data.performance.overallStatus, 'PASSED');
    assert.equal(res.data.data.results.length, 1);
  });
});
