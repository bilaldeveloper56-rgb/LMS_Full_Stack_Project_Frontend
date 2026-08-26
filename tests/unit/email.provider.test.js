import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendEmail,
  getResendClient,
  setResendClient,
  resetResendClient,
} from '../../src/providers/email.provider.js';

describe('Email Provider Unit & Security Tests (Resend HTTP API)', () => {
  beforeEach(() => {
    resetResendClient();
  });

  afterEach(() => {
    resetResendClient();
  });

  it('should return error when Resend API is not configured', async () => {
    setResendClient(false); // Explicitly simulate unconfigured Resend
    const result = await sendEmail({
      to: 'teacher@school.edu',
      subject: 'Welcome to School ERP',
      html: '<p>Welcome!</p>',
      text: 'Welcome!',
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'Resend API is not configured');
  });

  it('should abort safely when recipient or subject is missing', async () => {
    const resultNoTo = await sendEmail({
      to: '',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });
    assert.equal(resultNoTo.success, false);
    assert.equal(resultNoTo.error, 'Missing recipient or subject');

    const resultNoSubj = await sendEmail({
      to: 'admin@school.edu',
      subject: '',
      html: '<p>Hello</p>',
    });
    assert.equal(resultNoSubj.success, false);
    assert.equal(resultNoSubj.error, 'Missing recipient or subject');
  });

  it('should send email via configured Resend client', async () => {
    let sentOptions = null;

    const mockResend = {
      emails: {
        send: async (options) => {
          sentOptions = options;
          return { data: { id: 'resend-msg-12345' }, error: null };
        },
      },
    };

    setResendClient(mockResend);

    const result = await sendEmail({
      to: 'parent@domain.com',
      subject: 'Fee Challan Generated',
      html: '<h1>Invoice</h1>',
      text: 'Invoice text',
    });

    assert.equal(result.success, true);
    assert.equal(result.messageId, 'resend-msg-12345');
    assert.deepEqual(sentOptions.to, ['parent@domain.com']);
    assert.equal(sentOptions.subject, 'Fee Challan Generated');
    assert.equal(sentOptions.html, '<h1>Invoice</h1>');
    assert.equal(sentOptions.text, 'Invoice text');
  });

  it('should handle Resend API error response gracefully', async () => {
    const mockFailingResend = {
      emails: {
        send: async () => ({
          data: null,
          error: { message: 'Domain lmsprime.online is not verified' },
        }),
      },
    };

    setResendClient(mockFailingResend);

    const result = await sendEmail({
      to: 'student@domain.com',
      subject: 'Quiz Notification',
      html: '<p>Quiz ready</p>',
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'Domain lmsprime.online is not verified');
  });

  it('should handle unexpected thrown exceptions gracefully without crashing', async () => {
    const mockExceptionResend = {
      emails: {
        send: async () => {
          throw new Error('Resend HTTP Connection Timeout');
        },
      },
    };

    setResendClient(mockExceptionResend);

    const result = await sendEmail({
      to: 'student@domain.com',
      subject: 'Quiz Notification',
      html: '<p>Quiz ready</p>',
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'Resend HTTP Connection Timeout');
  });

  it('should ensure sensitive reset token is not logged in error messages', async () => {
    const sensitiveToken = 'super-secret-token-abcdef1234567890';
    const mockFailingResend = {
      emails: {
        send: async () => ({
          data: null,
          error: { message: 'API key invalid' },
        }),
      },
    };

    setResendClient(mockFailingResend);

    const result = await sendEmail({
      to: 'user@school.edu',
      subject: 'Password Reset',
      html: `<p>Token: ${sensitiveToken}</p>`,
    });

    assert.equal(result.success, false);
    assert.equal(result.error, 'API key invalid');
    // Error message must not contain token
    assert.ok(!result.error.includes(sensitiveToken));
  });

  it('should pass configured sender address in from field', async () => {
    let capturedFrom = null;

    const mockResend = {
      emails: {
        send: async (options) => {
          capturedFrom = options.from;
          return { data: { id: 'msg-sandbox-123' }, error: null };
        },
      },
    };

    setResendClient(mockResend);

    const result = await sendEmail({
      to: 'developer@example.com',
      subject: 'Development Sandbox Test',
      html: '<p>Test email</p>',
    });

    assert.equal(result.success, true);
    assert.ok(capturedFrom && capturedFrom.includes('@'));
  });
});
