import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../src/providers/email.provider.js';
import { passwordResetEmail } from '../src/templates/emails/passwordReset.js';
import { emailVerificationEmail } from '../src/templates/emails/emailVerification.js';
import { schoolAdminInvitationEmail } from '../src/templates/emails/schoolAdminInvitation.js';
import { env } from '../src/config/env.js';

async function testEmailFlows() {
  console.log('=== EMAIL CONFIGURATION STATUS ===');
  console.log('SMTP_HOST:', env.SMTP_HOST || '(not set)');
  console.log('SMTP_PORT:', env.SMTP_PORT);
  console.log('SMTP_USER:', env.SMTP_USER || '(not set)');
  console.log('SMTP_PASSWORD configured:', Boolean(env.SMTP_PASSWORD));
  console.log('SMTP_FROM:', env.SMTP_FROM || '(not set)');

  const targetEmail = process.argv[2] || env.SUPER_ADMIN_EMAIL;
  console.log('\nTesting with target recipient:', targetEmail);

  console.log('\n--- 1. Testing Forgot Password Flow ---');
  const resetContent = passwordResetEmail({
    firstName: 'Admin',
    resetUrl: 'http://localhost:5173/reset-password?token=test-token-12345',
    expiresIn: '10 minutes',
  });
  const resetResult = await sendEmail({ to: targetEmail, ...resetContent });
  console.log('Password Reset Email Result:', resetResult);

  console.log('\n--- 2. Testing Email Verification Flow ---');
  const verifContent = emailVerificationEmail({
    firstName: 'Admin',
    verificationUrl: 'http://localhost:5173/verify-email?token=test-verif-token-12345',
    expiresIn: '24 hours',
  });
  const verifResult = await sendEmail({ to: targetEmail, ...verifContent });
  console.log('Email Verification Result:', verifResult);

  console.log('\n--- 3. Testing School Admin Invitation Flow ---');
  const inviteContent = schoolAdminInvitationEmail({
    firstName: 'Principal',
    schoolName: 'Greenwood High',
    invitationUrl: 'http://localhost:5173/accept-invitation?token=test-invite-token-12345',
    expiresIn: '7 days',
  });
  const inviteResult = await sendEmail({ to: targetEmail, ...inviteContent });
  console.log('School Invitation Result:', inviteResult);
}

testEmailFlows().catch((err) => {
  console.error('Test execution error:', err.message);
});
