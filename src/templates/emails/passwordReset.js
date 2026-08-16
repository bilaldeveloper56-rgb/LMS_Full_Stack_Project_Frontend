/**
 * Generate password reset email HTML.
 * @param {Object} params
 * @param {string} params.firstName - User's first name
 * @param {string} params.resetUrl - Password reset URL with token
 * @param {string} params.expiresIn - Human-readable expiry (e.g. '10 minutes')
 * @returns {{ subject: string, html: string, text: string }}
 */
export const passwordResetEmail = ({ firstName, resetUrl, expiresIn }) => ({
  subject: 'Password Reset Request — School ERP',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in <strong>${expiresIn}</strong>.</p>
      <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">School ERP Platform</p>
    </div>
  `,
  text: `Hi ${firstName},\n\nWe received a request to reset your password.\n\nReset your password: ${resetUrl}\n\nThis link will expire in ${expiresIn}.\n\nIf you did not request a password reset, please ignore this email.`,
});
