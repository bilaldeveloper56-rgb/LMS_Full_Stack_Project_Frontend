/**
 * Generate School Admin invitation email HTML.
 * @param {Object} params
 * @param {string} params.firstName - Admin's first name
 * @param {string} params.schoolName - Name of the school
 * @param {string} params.invitationUrl - Account setup URL with secure token
 * @param {string} params.expiresIn - Human-readable expiry duration (e.g. '7 days')
 * @returns {{ subject: string, html: string, text: string }}
 */
export const schoolAdminInvitationEmail = ({
  firstName,
  schoolName,
  invitationUrl,
  expiresIn = '7 days',
}) => ({
  subject: `You're invited as School Administrator for ${schoolName} — School ERP`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1a1a2e;">Welcome to School ERP!</h2>
      <p>Hi ${firstName},</p>
      <p>You have been appointed as the <strong>School Administrator</strong> for <strong>${schoolName}</strong> on the School ERP SaaS platform.</p>
      <p>To activate your administrator account and set up your password, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationUrl}" style="background-color: #1a1a2e; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Administrator Account</a>
      </div>
      <p>This invitation link will expire in <strong>${expiresIn}</strong>.</p>
      <p>If you have any questions or were not expecting this invitation, please contact your platform administrator.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">School ERP Platform — Multi-Tenant SaaS</p>
    </div>
  `,
  text: `Hi ${firstName},\n\nYou have been appointed as School Administrator for ${schoolName}.\n\nActivate your account: ${invitationUrl}\n\nThis invitation link expires in ${expiresIn}.`,
});
