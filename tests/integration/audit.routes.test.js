import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
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

describe('Audit Logs API Routes Integration Tests', () => {
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

  const studentUser = {
    _id: '507f1f77bcf86cd799439088',
    role: ROLES.STUDENT,
    schoolId: '507f1f77bcf86cd799439099',
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439088' }),
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

  const studentToken = jwt.sign(
    { sub: studentUser._id, role: studentUser.role, schoolId: studentUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  let origUserFindById, origSchoolFindById;
  let origAuditFind, origAuditCount;

  beforeEach(() => {
    origUserFindById = User.findById;
    origSchoolFindById = School.findById;
    origAuditFind = AuditLog.find;
    origAuditCount = AuditLog.countDocuments;

    User.findById = (id) => ({
      select: () => {
        if (id === superAdminUser._id) return Promise.resolve(superAdminUser);
        if (id === studentUser._id) return Promise.resolve(studentUser);
        return Promise.resolve(schoolAdminUser);
      },
    });

    School.findById = (id) =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        status: SCHOOL_STATUS.ACTIVE,
      });

    AuditLog.find = (query) => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            lean: () =>
              Promise.resolve([
                {
                  _id: 'log-1',
                  event: 'AUTH_LOGIN_SUCCESS',
                  userId: '507f1f77bcf86cd799439011',
                  schoolId: query.schoolId || '507f1f77bcf86cd799439099',
                  entityType: 'User',
                  entityId: '507f1f77bcf86cd799439011',
                  details: { ip: '127.0.0.1' },
                  createdAt: new Date(),
                },
              ]),
          }),
        }),
      }),
    });

    AuditLog.countDocuments = () => Promise.resolve(1);
  });

  afterEach(() => {
    User.findById = origUserFindById;
    School.findById = origSchoolFindById;
    AuditLog.find = origAuditFind;
    AuditLog.countDocuments = origAuditCount;
  });

  it('GET /api/v1/audit-logs without token should return 401', async () => {
    const res = await makeRequest('GET', '/api/v1/audit-logs');
    assert.equal(res.status, 401);
  });

  it('GET /api/v1/audit-logs for unauthorized role (STUDENT) should return 403 Forbidden', async () => {
    const res = await makeRequest('GET', '/api/v1/audit-logs', null, {
      Authorization: `Bearer ${studentToken}`,
    });

    assert.equal(res.status, 403);
  });

  it('GET /api/v1/audit-logs for School Admin should return 200 with school-scoped audit records', async () => {
    const res = await makeRequest('GET', '/api/v1/audit-logs', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.length, 1);
    assert.equal(res.data.data[0].event, 'AUTH_LOGIN_SUCCESS');
    assert.equal(res.data.pagination.total, 1);
  });

  it('GET /api/v1/audit-logs with filters should return filtered results', async () => {
    const res = await makeRequest('GET', '/api/v1/audit-logs?event=AUTH_LOGIN_SUCCESS&entityType=User&page=1&limit=10', null, {
      Authorization: `Bearer ${superAdminToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.length, 1);
    assert.equal(res.data.pagination.limit, 10);
  });
});
