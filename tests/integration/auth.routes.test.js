import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import User from '../../src/modules/users/user.model.js';
import RefreshToken from '../../src/modules/auth/refreshToken.model.js';
import { ROLES, USER_STATUS } from '../../src/constants/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';

// Helper to make test requests directly to express app instance without needing network port
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
        server.close(() => resolve({ status, data, headers: res.headers }));
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
};

describe('Auth API HTTP Route Integration Tests', () => {
  const dummyUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@school.com',
    role: ROLES.SCHOOL_ADMIN,
    status: USER_STATUS.ACTIVE,
    passwordHash: bcrypt.hashSync('AdminPass123!', 10),
    comparePassword: async function (plain) {
      return bcrypt.compare(plain, this.passwordHash);
    },
    save: async () => {},
    toJSON: function () {
      return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        role: this.role,
        status: this.status,
      };
    },
  };

  it('POST /api/v1/auth/login with valid body should return 200 and safe user data', async () => {
    const originalFindOne = User.findOne;
    const originalCreate = RefreshToken.create;

    User.findOne = () => ({
      select: () => Promise.resolve(dummyUser),
    });
    RefreshToken.create = () =>
      Promise.resolve({ _id: 'dummy-token-id', expiresAt: new Date() });

    const res = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@school.com',
      password: 'AdminPass123!',
    });

    User.findOne = originalFindOne;
    RefreshToken.create = originalCreate;

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.user.email, 'admin@school.com');
    assert.ok(res.data.data.accessToken);
    assert.equal(res.data.data.user.passwordHash, undefined, 'passwordHash must never be returned');
  });

  it('POST /api/v1/auth/login with invalid payload should return 422 validation error', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'not-an-email',
      password: '',
    });

    assert.equal(res.status, 422);
    assert.equal(res.data.success, false);
    assert.ok(res.data.errors.length > 0);
  });

  it('GET /api/v1/auth/me without token should return 401 Unauthorized', async () => {
    const res = await makeRequest('GET', '/api/v1/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  it('GET /api/v1/auth/me with valid Bearer token should return 200 and user profile (Requirement 15)', async () => {
    const originalFindById = User.findById;

    const mockUserDoc = {
      _id: dummyUser._id,
      role: ROLES.SCHOOL_ADMIN,
      schoolId: null,
      status: USER_STATUS.ACTIVE,
      changedPasswordAfter: () => false,
      toJSON: () => ({
        id: dummyUser._id,
        firstName: 'Admin',
        email: 'admin@school.com',
        role: ROLES.SCHOOL_ADMIN,
      }),
    };

    User.findById = (id) => {
      const query = {
        select: () => Promise.resolve(mockUserDoc),
        then: (resolve, reject) => Promise.resolve(mockUserDoc).then(resolve, reject),
      };
      return query;
    };

    const token = jwt.sign(
      { sub: dummyUser._id, role: ROLES.SCHOOL_ADMIN, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const res = await makeRequest('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${token}`,
    });

    User.findById = originalFindById;

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.user.email, 'admin@school.com');
  });

  it('POST /api/v1/auth/logout should return 200', async () => {
    const originalFindOne = RefreshToken.findOne;
    RefreshToken.findOne = () => Promise.resolve(null);

    const res = await makeRequest('POST', '/api/v1/auth/logout', {
      refreshToken: 'sample-token',
    });

    RefreshToken.findOne = originalFindOne;

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
  });
});
