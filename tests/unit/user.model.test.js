import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import User from '../../src/modules/users/user.model.js';
import { ROLES, USER_STATUS } from '../../src/constants/index.js';

describe('User Model Unit Tests', () => {
  it('should hash a password correctly with static hashPassword', async () => {
    const plain = 'SecurePassword123!';
    const hash = await User.hashPassword(plain);

    assert.ok(hash);
    assert.notEqual(hash, plain);
    assert.ok(await bcrypt.compare(plain, hash));
  });

  it('should verify password with comparePassword instance method', async () => {
    const plain = 'Admin@123456';
    const hash = await bcrypt.hash(plain, 10);

    const user = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@school.com',
      passwordHash: hash,
      role: ROLES.SUPER_ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    assert.equal(await user.comparePassword(plain), true);
    assert.equal(await user.comparePassword('WrongPassword'), false);
  });

  it('should detect if password was changed after token was issued', () => {
    const passwordChangedDate = new Date('2026-08-14T12:00:00Z');
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@school.com',
      passwordHash: 'dummy',
      role: ROLES.TEACHER,
      passwordChangedAt: passwordChangedDate,
    });

    // Token issued before password change (timestamp 11:00:00Z)
    const tokenIatBefore = Math.floor(new Date('2026-08-14T11:00:00Z').getTime() / 1000);
    assert.equal(user.changedPasswordAfter(tokenIatBefore), true);

    // Token issued after password change (timestamp 13:00:00Z)
    const tokenIatAfter = Math.floor(new Date('2026-08-14T13:00:00Z').getTime() / 1000);
    assert.equal(user.changedPasswordAfter(tokenIatAfter), false);
  });

  it('should strip sensitive fields in toJSON (Requirement 25: Sensitive fields are never returned)', () => {
    const user = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@school.com',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz',
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
      emailVerificationToken: 'secret-verify-token',
      emailVerificationExpires: new Date(),
      passwordResetToken: 'secret-reset-token',
      passwordResetExpires: new Date(),
      isDeleted: false,
    });

    const json = user.toJSON();

    assert.equal(json.firstName, 'Jane');
    assert.equal(json.email, 'jane@school.com');
    assert.equal(json.passwordHash, undefined, 'passwordHash must be stripped');
    assert.equal(json.emailVerificationToken, undefined, 'emailVerificationToken must be stripped');
    assert.equal(json.emailVerificationExpires, undefined, 'emailVerificationExpires must be stripped');
    assert.equal(json.passwordResetToken, undefined, 'passwordResetToken must be stripped');
    assert.equal(json.passwordResetExpires, undefined, 'passwordResetExpires must be stripped');
    assert.equal(json.isDeleted, undefined, 'isDeleted must be stripped');
    assert.equal(json.__v, undefined, '__v must be stripped');
  });

  it('should support Super Admin with null schoolId', () => {
    const superAdmin = new User({
      firstName: 'Global',
      lastName: 'Admin',
      email: 'superadmin@platform.com',
      passwordHash: 'dummy',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
      status: USER_STATUS.ACTIVE,
    });

    assert.equal(superAdmin.role, ROLES.SUPER_ADMIN);
    assert.equal(superAdmin.schoolId, null);
  });
});
