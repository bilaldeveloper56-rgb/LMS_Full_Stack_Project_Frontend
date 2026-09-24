import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
  validateResendVerification,
  validateUpdateProfile,
} from '../../src/modules/auth/auth.validator.js';

describe('Auth Validator Unit Tests', () => {
  const createMockReqRes = (body) => {
    const req = { body };
    const res = {};
    let nextError = null;
    const next = (err) => {
      nextError = err || null;
    };
    return { req, res, next: () => nextError, run: (middleware) => middleware(req, res, next) };
  };

  it('should pass valid login payload', () => {
    const mock = createMockReqRes({ email: 'user@school.com', password: 'Password123' });
    mock.run(validateLogin);
    assert.equal(mock.next(), null);
    assert.equal(mock.req.validatedBody.email, 'user@school.com');
  });

  it('should reject invalid email format in login', () => {
    const mock = createMockReqRes({ email: 'invalid-email', password: 'Password123' });
    mock.run(validateLogin);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
    assert.ok(err.errors.some((e) => e.includes('Invalid email format')));
  });

  it('should reject missing password in login', () => {
    const mock = createMockReqRes({ email: 'user@school.com' });
    mock.run(validateLogin);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
  });

  it('should validate change password with matching passwords and strong pattern', () => {
    const mock = createMockReqRes({
      currentPassword: 'OldPassword1',
      newPassword: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    });
    mock.run(validateChangePassword);
    assert.equal(mock.next(), null);
  });

  it('should reject change password when new passwords do not match', () => {
    const mock = createMockReqRes({
      currentPassword: 'OldPassword1',
      newPassword: 'NewPassword123',
      confirmPassword: 'MismatchPassword123',
    });
    mock.run(validateChangePassword);
    const err = mock.next();
    assert.ok(err);
    assert.ok(err.errors.some((e) => e.includes('Passwords do not match')));
  });

  it('should reject weak new password (< 8 chars or missing uppercase/digit)', () => {
    const mock = createMockReqRes({
      currentPassword: 'OldPassword1',
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    mock.run(validateChangePassword);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
  });

  it('should pass forgot password with valid email', () => {
    const mock = createMockReqRes({ email: 'user@domain.com' });
    mock.run(validateForgotPassword);
    assert.equal(mock.next(), null);
  });

  it('should pass reset password with valid token and strong matching passwords', () => {
    const mock = createMockReqRes({
      token: 'valid-reset-token-123',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123',
    });
    mock.run(validateResetPassword);
    assert.equal(mock.next(), null);
  });

  it('should pass verify email with token', () => {
    const mock = createMockReqRes({ token: 'sample-verification-token' });
    mock.run(validateVerifyEmail);
    assert.equal(mock.next(), null);
  });

  it('should pass valid updateProfile payload including avatar URL', () => {
    const mock = createMockReqRes({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567890',
      avatar: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
    });
    mock.run(validateUpdateProfile);
    assert.equal(mock.next(), null);
    assert.equal(mock.req.validatedBody.firstName, 'Jane');
    assert.equal(mock.req.validatedBody.avatar, 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg');
  });

  it('should allow null or empty avatar to remove photo in updateProfile', () => {
    const mockNull = createMockReqRes({ avatar: null });
    mockNull.run(validateUpdateProfile);
    assert.equal(mockNull.next(), null);

    const mockEmpty = createMockReqRes({ avatar: '' });
    mockEmpty.run(validateUpdateProfile);
    assert.equal(mockEmpty.next(), null);
  });

  it('should reject invalid avatar URL format in updateProfile', () => {
    const mock = createMockReqRes({ avatar: 'not-a-valid-url' });
    mock.run(validateUpdateProfile);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
    assert.ok(err.errors.some((e) => e.includes('Invalid avatar URL')));
  });
});
