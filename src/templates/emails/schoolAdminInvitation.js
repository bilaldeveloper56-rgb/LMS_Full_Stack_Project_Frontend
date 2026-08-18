/**
 * Generate School Admin invitation email HTML.
 * @param {Object} params
 * @param {string} params.firstName - Admin's first name
 * @param {string} params.schoolName - Name of the school
 * @param {string} [params.adminEmail] - Admin's email address
 * @param {string} params.invitationUrl - Account setup URL with secure token
 * @param {string} [params.expiresIn] - Human-readable expiry duration (e.g. '7 days')
 * @returns {{ subject: string, html: string, text: string }}
 */
export const schoolAdminInvitationEmail = ({
  firstName,
  schoolName,
  adminEmail,
  invitationUrl,
  expiresIn = '7 days',
}) => ({
  subject: `You have been invited as a School Administrator for ${schoolName} — EduManager`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">EduManager</h1>
        <p style="color: #6b7280; font-size: 13px; margin-top: 4px; font-weight: 500;">Multi-Tenant School Management Platform</p>
      </div>

      <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 12px;">You have been invited as a School Administrator</h2>

      <p style="font-size: 15px; line-height: 1.5; color: #374151;">Hi ${firstName || 'Administrator'},</p>
      <p style="font-size: 15px; line-height: 1.5; color: #374151;">You have been appointed as the <strong>School Administrator</strong> on EduManager.</p>

      <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0; font-size: 14px; color: #1f2937;"><strong>School Name:</strong> ${schoolName}</p>
        ${adminEmail ? `<p style="margin: 4px 0; font-size: 14px; color: #1f2937;"><strong>Email:</strong> ${adminEmail}</p>` : ''}
      </div>

      <p style="font-size: 15px; line-height: 1.5; color: #374151;">Click below to activate your account:</p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${invitationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block; font-size: 15px;">Accept Invitation</a>
      </div>

      <p style="color: #4b5563; font-size: 14px; margin-top: 20px;">This invitation expires in <strong>${expiresIn}</strong>.</p>
      <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">If you did not expect this invitation, you can ignore this email.</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 16px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">EduManager SaaS Platform</p>
    </div>
  `,
  text: `EduManager\n\nYou have been invited as a School Administrator\n\nSchool Name: ${schoolName}\n${adminEmail ? `Email: ${adminEmail}\n` : ''}\nClick below to activate your account:\n\n${invitationUrl}\n\nThis invitation expires in ${expiresIn}.\n\nIf you did not expect this invitation, you can ignore this email.`,
});
