import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { passwordResetEmail } from '../../src/templates/emails/passwordReset.js';
import { emailVerificationEmail } from '../../src/templates/emails/emailVerification.js';
import { welcomeEmail } from '../../src/templates/emails/welcome.js';

describe('Email Templates Unit Tests', () => {
  it('should generate password reset email with correct links and expiry', () => {
    const email = passwordResetEmail({
      firstName: 'Alice',
      resetUrl: 'https://app.schoolerp.com/reset-password?token=sampletoken123',
      expiresIn: '10 minutes',
    });

    assert.ok(email.subject.includes('Password Reset Request'));
    assert.ok(email.html.includes('Alice'));
    assert.ok(email.html.includes('sampletoken123'));
    assert.ok(email.html.includes('10 minutes'));
    assert.ok(email.text.includes('sampletoken123'));
  });

  it('should generate email verification email with correct link', () => {
    const email = emailVerificationEmail({
      firstName: 'Bob',
      verificationUrl: 'https://app.schoolerp.com/verify-email?token=veriftoken456',
      expiresIn: '24 hours',
    });

    assert.ok(email.subject.includes('Verify Your Email'));
    assert.ok(email.html.includes('Bob'));
    assert.ok(email.html.includes('veriftoken456'));
  });

  it('should generate welcome email', () => {
    const email = welcomeEmail({
      firstName: 'Charlie',
      loginUrl: 'https://app.schoolerp.com/login',
    });

    assert.ok(email.subject.includes('Welcome'));
    assert.ok(email.html.includes('Charlie'));
    assert.ok(email.html.includes('/login'));
  });
});
