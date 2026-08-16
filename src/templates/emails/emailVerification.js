/**
 * Generate email verification email HTML.
 * @param {Object} params
 * @param {string} params.firstName - User's first name
 * @param {string} params.verificationUrl - Email verification URL with token
 * @param {string} params.expiresIn - Human-readable expiry
 * @returns {{ subject: string, html: string, text: string }}
 */
export const emailVerificationEmail = ({ firstName, verificationUrl, expiresIn }) => ({
  subject: 'Verify Your Email — School ERP',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Verify Your Email Address</h2>
      <p>Hi ${firstName},</p>
      <p>Welcome to School ERP! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
      </div>
      <p>This link will expire in <strong>${expiresIn}</strong>.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">School ERP Platform</p>
    </div>
  `,
  text: `Hi ${firstName},\n\nWelcome to School ERP! Please verify your email address.\n\nVerify: ${verificationUrl}\n\nThis link will expire in ${expiresIn}.`,
});
