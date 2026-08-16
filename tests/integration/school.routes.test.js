import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';
import { env } from '../../src/config/env.js';

const makeRequest = async (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const fetchHeaders = {
          'Content-Type': 'application/json',
          ...headers,
        };

        const res = await fetch(`http://localhost:${port}${path}`, {
          method,
          headers: fetchHeaders,
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

describe('School API HTTP Routes Integration Tests', () => {
  const superAdminToken = jwt.sign(
    { sub: '507f1f77bcf86cd799439001', role: ROLES.SUPER_ADMIN, schoolId: null, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const schoolAdminToken = jwt.sign(
    { sub: '507f1f77bcf86cd799439002', role: ROLES.SCHOOL_ADMIN, schoolId: '507f1f77bcf86cd799439099', type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const teacherToken = jwt.sign(
    { sub: '507f1f77bcf86cd799439003', role: ROLES.TEACHER, schoolId: '507f1f77bcf86cd799439099', type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const mockUserDoc = (id, role, schoolId = null) => ({
    _id: id,
    role,
    schoolId,
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id, role, schoolId }),
  });

  const mockSchoolDoc = {
    _id: '507f1f77bcf86cd799439099',
    name: 'Springfield High',
    schoolCode: 'SPH-01',
    status: SCHOOL_STATUS.ACTIVE,
    isDeleted: false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439099', name: 'Springfield High', schoolCode: 'SPH-01' }),
  };

  it('POST /api/v1/schools allowed for SUPER_ADMIN with 201 Created (Requirements 7 & 11)', async () => {
    const originalFindByIdUser = User.findById;
    const originalFindOneSchool = School.findOne;
    const originalFindOneUser = User.findOne;
    const originalSchoolSave = School.prototype.save;
    const originalUserSave = User.prototype.save;

    User.findById = (id) => ({
      select: () => Promise.resolve(mockUserDoc(id, ROLES.SUPER_ADMIN, null)),
    });
    School.findOne = () => Promise.resolve(null);
    User.findOne = () => Promise.resolve(null);
    School.prototype.save = function () {
      this._id = 'new-school-id';
      return Promise.resolve(this);
    };
    User.prototype.save = function () {
      this._id = 'new-admin-id';
      return Promise.resolve(this);
    };

    const res = await makeRequest(
      'POST',
      '/api/v1/schools',
      {
        school: {
          name: 'Greenwood High',
          schoolCode: 'GWH-01',
          email: 'admin@greenwood.edu',
        },
        admin: {
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'sarah@greenwood.edu',
        },
      },
      { Authorization: `Bearer ${superAdminToken}` }
    );

    User.findById = originalFindByIdUser;
    School.findOne = originalFindOneSchool;
    User.findOne = originalFindOneUser;
    School.prototype.save = originalSchoolSave;
    User.prototype.save = originalUserSave;

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
  });

  it('POST /api/v1/schools rejected for School Admin (Requirement 9: School Admin cannot create schools)', async () => {
    const originalFindByIdUser = User.findById;
    const originalFindByIdSchool = School.findById;

    User.findById = (id) => ({
      select: () => Promise.resolve(mockUserDoc(id, ROLES.SCHOOL_ADMIN, '507f1f77bcf86cd799439099')),
    });
    School.findById = () => Promise.resolve(mockSchoolDoc);

    const res = await makeRequest(
      'POST',
      '/api/v1/schools',
      {
        school: { name: 'Attempt', schoolCode: 'ATT-01', email: 'att@s.edu' },
        admin: { firstName: 'A', lastName: 'B', email: 'ab@s.edu' },
      },
      { Authorization: `Bearer ${schoolAdminToken}` }
    );

    User.findById = originalFindByIdUser;
    School.findById = originalFindByIdSchool;

    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  it('POST /api/v1/schools rejected for Teacher (Requirement 8: Normal users cannot create schools)', async () => {
    const originalFindByIdUser = User.findById;
    const originalFindByIdSchool = School.findById;

    User.findById = (id) => ({
      select: () => Promise.resolve(mockUserDoc(id, ROLES.TEACHER, '507f1f77bcf86cd799439099')),
    });
    School.findById = () => Promise.resolve(mockSchoolDoc);

    const res = await makeRequest(
      'POST',
      '/api/v1/schools',
      {
        school: { name: 'Attempt', schoolCode: 'ATT-01', email: 'att@s.edu' },
        admin: { firstName: 'A', lastName: 'B', email: 'ab@s.edu' },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );

    User.findById = originalFindByIdUser;
    School.findById = originalFindByIdSchool;

    assert.equal(res.status, 403);
  });

  it('GET /api/v1/schools allowed for SUPER_ADMIN with pagination', async () => {
    const originalFindByIdUser = User.findById;
    const originalFind = School.find;
    const originalCount = School.countDocuments;

    User.findById = (id) => ({
      select: () => Promise.resolve(mockUserDoc(id, ROLES.SUPER_ADMIN, null)),
    });
    School.find = () => ({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve([mockSchoolDoc]),
        }),
      }),
    });
    School.countDocuments = () => Promise.resolve(1);

    const res = await makeRequest('GET', '/api/v1/schools', null, {
      Authorization: `Bearer ${superAdminToken}`
    });

    User.findById = originalFindByIdUser;
    School.find = originalFind;
    School.countDocuments = originalCount;

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.pagination.total, 1);
  });

  it('GET /api/v1/schools/:id rejects cross-school access for other school users (Requirement 24)', async () => {
    const originalFindByIdUser = User.findById;
    const originalFindByIdSchool = School.findById;

    // School admin belongs to 507f1f77bcf86cd799439099
    User.findById = (id) => ({
      select: () => Promise.resolve(mockUserDoc(id, ROLES.SCHOOL_ADMIN, '507f1f77bcf86cd799439099')),
    });
    School.findById = () => Promise.resolve(mockSchoolDoc);

    // Attempting to access another school ID
    const res = await makeRequest('GET', '/api/v1/schools/507f1f77bcf86cd799439999', null, {
      Authorization: `Bearer ${schoolAdminToken}`,
    });

    User.findById = originalFindByIdUser;
    School.findById = originalFindByIdSchool;

    assert.equal(res.status, 403);
    assert.ok(res.data.message.includes('Access denied'));
  });

  it('POST /api/v1/schools/accept-invitation allows activation without bearer token', async () => {
    const originalFindOneUser = User.findOne;
    const originalUserSave = User.prototype.save;

    const mockInvitedUser = {
      _id: 'invited-admin-id',
      email: 'invited@school.edu',
      status: USER_STATUS.INVITED,
      save: () => Promise.resolve(),
      toJSON: () => ({ id: 'invited-admin-id', email: 'invited@school.edu', status: USER_STATUS.ACTIVE }),
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockInvitedUser),
    });

    const res = await makeRequest('POST', '/api/v1/schools/accept-invitation', {
      token: 'sample-invitation-token',
      password: 'SecureAdminPass123!',
      confirmPassword: 'SecureAdminPass123!',
    });

    User.findOne = originalFindOneUser;

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
  });
});
