import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { socketAuthMiddleware, emitToUser, emitToSchool } from '../../src/providers/socket.provider.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import { env } from '../../src/config/env.js';
import { USER_STATUS, SCHOOL_STATUS, ROLES } from '../../src/constants/index.js';

describe('Socket.io Provider Unit Tests', () => {
  const userId = '507f1f77bcf86cd799439011';
  const schoolId = '507f1f77bcf86cd799439022';

  const validToken = jwt.sign(
    { sub: userId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  it('should authenticate socket with valid token in handshake auth', async () => {
    const origUserFindById = User.findById;
    const origSchoolFindById = School.findById;

    User.findById = () => ({
      select: () =>
        Promise.resolve({
          _id: userId,
          role: ROLES.STUDENT,
          status: USER_STATUS.ACTIVE,
          schoolId,
          changedPasswordAfter: () => false,
        }),
    });

    School.findById = () =>
      Promise.resolve({
        _id: schoolId,
        status: SCHOOL_STATUS.ACTIVE,
        isDeleted: false,
      });

    const mockSocket = {
      handshake: {
        auth: { token: `Bearer ${validToken}` },
        headers: {},
      },
    };

    let nextErr = null;
    await socketAuthMiddleware(mockSocket, (err) => {
      nextErr = err;
    });

    User.findById = origUserFindById;
    School.findById = origSchoolFindById;

    assert.equal(nextErr, undefined);
    assert.equal(mockSocket.user.id, userId);
    assert.equal(mockSocket.user.role, ROLES.STUDENT);
    assert.equal(mockSocket.user.schoolId, schoolId);
  });

  it('should reject socket connection when token is missing', async () => {
    const mockSocket = {
      handshake: {
        auth: {},
        headers: {},
      },
    };

    let nextErr = null;
    await socketAuthMiddleware(mockSocket, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.ok(nextErr.message.includes('Authentication required'));
  });

  it('should reject socket connection when token is invalid or expired', async () => {
    const mockSocket = {
      handshake: {
        auth: { token: 'invalid.jwt.token' },
        headers: {},
      },
    };

    let nextErr = null;
    await socketAuthMiddleware(mockSocket, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.ok(nextErr.message.includes('Authentication failed'));
  });

  it('should safely execute emitToUser and emitToSchool when IO is null', () => {
    // Should not throw
    emitToUser(userId, 'test:event', { data: 123 });
    emitToSchool(schoolId, 'test:event', { data: 456 });
    assert.ok(true);
  });
});
