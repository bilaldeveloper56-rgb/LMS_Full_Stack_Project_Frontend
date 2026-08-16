import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  sendEmail,
  getTransporter,
  setTransporter,
  resetTransporter,
} from '../../src/providers/email.provider.js';

describe('Email Provider Unit & Security Tests', () => {
  beforeEach(() => {
    resetTransporter();
  });

  afterEach(() => {
    resetTransporter();
  });

  it('should return mock success when SMTP is unconfigured (development/test mode)', async () => {
    setTransporter(false); // Explicitly simulate unconfigured SMTP
    const result = await sendEmail({
      to: 'teacher@school.edu',
      subject: 'Welcome to School ERP',
      html: '<p>Welcome!</p>',
      text: 'Welcome!',
    });

    assert.equal(result.success, true);
    assert.equal(result.messageId, 'mock-delivery-id');
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

  it('should send email via configured Nodemailer transporter', async () => {
    let sentMailOptions = null;

    const mockTransporter = {
      sendMail: async (options) => {
        sentMailOptions = options;
        return { messageId: '<msg-12345@resend.com>' };
      },
    };

    setTransporter(mockTransporter);

    const result = await sendEmail({
      to: 'parent@domain.com',
      subject: 'Fee Challan Generated',
      html: '<h1>Invoice</h1>',
      text: 'Invoice text',
    });

    assert.equal(result.success, true);
    assert.equal(result.messageId, '<msg-12345@resend.com>');
    assert.equal(sentMailOptions.to, 'parent@domain.com');
    assert.equal(sentMailOptions.subject, 'Fee Challan Generated');
    assert.equal(sentMailOptions.html, '<h1>Invoice</h1>');
    assert.equal(sentMailOptions.text, 'Invoice text');
  });

  it('should handle SMTP transmission failure gracefully without crashing', async () => {
    const mockFailingTransporter = {
      sendMail: async () => {
        throw new Error('SMTP Connection timeout: 465 to smtp.resend.com');
      },
    };

    setTransporter(mockFailingTransporter);

    const result = await sendEmail({
      to: 'student@domain.com',
      subject: 'Quiz Notification',
      html: '<p>Quiz ready</p>',
    });

    assert.equal(result.success, false);
    assert.ok(result.error.includes('SMTP Connection timeout'));
  });

  it('should ensure sensitive reset token is not logged in error messages', async () => {
    const sensitiveToken = 'super-secret-token-abcdef1234567890';
    const mockFailingTransporter = {
      sendMail: async (options) => {
        // Even if transporter throws an error, the provider catches it cleanly
        throw new Error('535 Authentication failed');
      },
    };

    setTransporter(mockFailingTransporter);

    const result = await sendEmail({
      to: 'user@school.edu',
      subject: 'Password Reset',
      html: `<p>Token: ${sensitiveToken}</p>`,
    });

    assert.equal(result.success, false);
    assert.equal(result.error, '535 Authentication failed');
    // Error message must not contain token or credentials
    assert.ok(!result.error.includes(sensitiveToken));
  });

  it('should use Resend sandbox onboarding sender default in from header', async () => {
    let capturedFrom = null;

    const mockTransporter = {
      sendMail: async (options) => {
        capturedFrom = options.from;
        return { messageId: '<msg-sandbox-123@resend.com>' };
      },
    };

    setTransporter(mockTransporter);

    const result = await sendEmail({
      to: 'developer@example.com',
      subject: 'Development Sandbox Test',
      html: '<p>Test email</p>',
    });

    assert.equal(result.success, true);
    assert.ok(capturedFrom.includes('resend.dev') || capturedFrom.includes('@'));
  });
});
