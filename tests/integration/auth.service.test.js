import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import * as authService from '../../src/modules/auth/auth.service.js';
import User from '../../src/modules/users/user.model.js';
import RefreshToken from '../../src/modules/auth/refreshToken.model.js';
import { ROLES, USER_STATUS } from '../../src/constants/index.js';
import { env } from '../../src/config/env.js';

describe('Auth Service Business Logic Tests', () => {
  const dummyUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@school.com',
    role: ROLES.SCHOOL_ADMIN,
    status: USER_STATUS.ACTIVE,
    passwordHash: bcrypt.hashSync('Password123', 10),
    comparePassword: async function (plain) {
      return bcrypt.compare(plain, this.passwordHash);
    },
    save: async () => {},
    toJSON: function () {
      return { id: this._id, firstName: this.firstName, email: this.email, role: this.role };
    },
  };

  it('should successfully log in active user with valid credentials (Requirement 1: Successful login)', async () => {
    const originalFindOne = User.findOne;
    const originalCreate = RefreshToken.create;

    User.findOne = () => ({
      select: () => Promise.resolve(dummyUser),
    });

    let createdTokenRecord = null;
    RefreshToken.create = (data) => {
      createdTokenRecord = data;
      return Promise.resolve(data);
    };

    const result = await authService.login('test@school.com', 'Password123', {
      userAgent: 'test-agent',
      ipAddress: '127.0.0.1',
    });

    User.findOne = originalFindOne;
    RefreshToken.create = originalCreate;

    assert.ok(result.user);
    assert.equal(result.user.email, 'test@school.com');
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.ok(createdTokenRecord);
    assert.equal(createdTokenRecord.userId, dummyUser._id);
  });

  it('should reject login with invalid email (Requirement 2: Invalid email)', async () => {
    const originalFindOne = User.findOne;
    User.findOne = () => ({
      select: () => Promise.resolve(null),
    });

    await assert.rejects(
      async () => {
        await authService.login('nonexistent@school.com', 'Password123');
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.message, 'Invalid email or password');
        return true;
      }
    );

    User.findOne = originalFindOne;
  });

  it('should reject login with wrong password (Requirement 3: Invalid password)', async () => {
    const originalFindOne = User.findOne;
    User.findOne = () => ({
      select: () => Promise.resolve(dummyUser),
    });

    await assert.rejects(
      async () => {
        await authService.login('test@school.com', 'WrongPassword123');
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.message, 'Invalid email or password');
        return true;
      }
    );

    User.findOne = originalFindOne;
  });

  it('should reject suspended user login (Requirement 4: Suspended user login)', async () => {
    const suspendedUser = { ...dummyUser, status: USER_STATUS.SUSPENDED };
    const originalFindOne = User.findOne;
    User.findOne = () => ({
      select: () => Promise.resolve(suspendedUser),
    });

    await assert.rejects(
      async () => {
        await authService.login('test@school.com', 'Password123');
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.ok(err.message.includes('suspended'));
        return true;
      }
    );

    User.findOne = originalFindOne;
  });

  it('should rotate refresh token and issue new access & refresh tokens (Requirement 9: Refresh token rotation)', async () => {
    const rawToken = 'sample-refresh-token-123';
    const originalFindOneToken = RefreshToken.findOne;
    const originalCreateToken = RefreshToken.create;
    const originalFindByIdUser = User.findById;

    const mockTokenRecord = {
      _id: 'token-id-1',
      userId: dummyUser._id,
      familyId: 'family-1',
      isRevoked: () => false,
      isExpired: () => false,
      save: async () => {},
    };

    RefreshToken.findOne = () => Promise.resolve(mockTokenRecord);
    User.findById = () => Promise.resolve(dummyUser);

    let createdNewToken = null;
    RefreshToken.create = (data) => {
      createdNewToken = data;
      return Promise.resolve({ _id: 'new-token-id', ...data });
    };

    const result = await authService.refreshTokens(rawToken, {});

    RefreshToken.findOne = originalFindOneToken;
    RefreshToken.create = originalCreateToken;
    User.findById = originalFindByIdUser;

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.notEqual(result.refreshToken, rawToken, 'New refresh token must be rotated');
    assert.equal(mockTokenRecord.replacedByTokenId, 'new-token-id');
    assert.ok(mockTokenRecord.revokedAt, 'Old token must be marked revoked');
  });

  it('should detect reuse of revoked token and revoke entire token family (Requirement 12: Reuse detection)', async () => {
    const rawToken = 'stolen-revoked-token';
    const originalFindOneToken = RefreshToken.findOne;
    const originalUpdateMany = RefreshToken.updateMany;

    const mockRevokedRecord = {
      userId: dummyUser._id,
      familyId: 'family-compromised',
      isRevoked: () => true,
    };

    RefreshToken.findOne = () => Promise.resolve(mockRevokedRecord);

    let familyRevoked = false;
    RefreshToken.updateMany = (filter, update) => {
      if (filter.familyId === 'family-compromised' && update.revokedAt) {
        familyRevoked = true;
      }
      return Promise.resolve();
    };

    await assert.rejects(
      async () => {
        await authService.refreshTokens(rawToken, {});
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.ok(err.message.includes('Suspicious activity detected'));
        return true;
      }
    );

    RefreshToken.findOne = originalFindOneToken;
    RefreshToken.updateMany = originalUpdateMany;

    assert.equal(familyRevoked, true, 'Entire family must be revoked on reuse');
  });

  it('should invalidate token on logout (Requirement 13: Logout invalidates session)', async () => {
    const rawToken = 'active-token-to-logout';
    const originalFindOne = RefreshToken.findOne;

    const mockToken = {
      isRevoked: () => false,
      save: async () => {},
      revokedAt: null,
    };

    RefreshToken.findOne = () => Promise.resolve(mockToken);

    await authService.logout(rawToken);

    RefreshToken.findOne = originalFindOne;

    assert.ok(mockToken.revokedAt, 'Token must be marked as revoked on logout');
  });

  it('should handle password change and revoke existing sessions (Requirement 16 & 17)', async () => {
    const originalFindById = User.findById;
    const originalUpdateMany = RefreshToken.updateMany;

    let sessionsRevoked = false;
    RefreshToken.updateMany = () => {
      sessionsRevoked = true;
      return Promise.resolve();
    };

    User.findById = () => ({
      select: () => Promise.resolve(dummyUser),
    });

    // 1. Wrong current password
    await assert.rejects(
      async () => {
        await authService.changePassword(dummyUser._id, 'WrongOldPass', 'NewPassword123');
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, 'Current password is incorrect');
        return true;
      }
    );

    // 2. Correct current password
    await authService.changePassword(dummyUser._id, 'Password123', 'NewSecurePassword123');

    User.findById = originalFindById;
    RefreshToken.updateMany = originalUpdateMany;

    assert.equal(sessionsRevoked, true, 'All sessions must be revoked on password change');
  });

  it('should handle single-use password reset token (Requirement 18, 19, 20)', async () => {
    const originalFindOne = User.findOne;
    const originalUpdateMany = RefreshToken.updateMany;
    RefreshToken.updateMany = () => Promise.resolve();

    let userSaved = false;
    const mockResetUser = {
      _id: dummyUser._id,
      passwordResetToken: 'hashed-token',
      passwordResetExpires: new Date(Date.now() + 600000),
      save: async function () {
        userSaved = true;
      },
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockResetUser),
    });

    await authService.resetPassword('valid-raw-token', 'BrandNewPass123!');

    User.findOne = originalFindOne;
    RefreshToken.updateMany = originalUpdateMany;

    assert.equal(userSaved, true);
    assert.equal(mockResetUser.passwordResetToken, undefined, 'Reset token must be cleared (single-use)');
    assert.equal(mockResetUser.passwordResetExpires, undefined, 'Reset expiry must be cleared');
  });

  it('should verify email and activate pending account (Requirement 21 & 22)', async () => {
    const originalFindOne = User.findOne;

    const mockPendingUser = {
      _id: dummyUser._id,
      emailVerified: false,
      status: USER_STATUS.PENDING,
      emailVerificationToken: 'hash',
      emailVerificationExpires: new Date(Date.now() + 600000),
      save: async () => {},
      toJSON: () => ({ emailVerified: true, status: USER_STATUS.ACTIVE }),
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockPendingUser),
    });

    const result = await authService.verifyEmail('valid-verif-token');

    assert.equal(mockPendingUser.emailVerified, true);
    assert.equal(mockPendingUser.status, USER_STATUS.ACTIVE);
    assert.equal(mockPendingUser.emailVerificationToken, undefined);

    // Test with invalid / expired token
    User.findOne = () => ({
      select: () => Promise.resolve(null),
    });

    await assert.rejects(
      async () => {
        await authService.verifyEmail('invalid-token');
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, 'Invalid or expired verification token');
        return true;
      }
    );

    User.findOne = originalFindOne;
  });
});
