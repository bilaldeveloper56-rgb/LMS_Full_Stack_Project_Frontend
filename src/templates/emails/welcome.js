/**
 * Generate welcome email HTML.
 * @param {Object} params
 * @param {string} params.firstName - User's first name
 * @param {string} params.loginUrl - Login page URL
 * @returns {{ subject: string, html: string, text: string }}
 */
export const welcomeEmail = ({ firstName, loginUrl }) => ({
  subject: 'Welcome to School ERP',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Welcome to School ERP!</h2>
      <p>Hi ${firstName},</p>
      <p>Your account has been verified and is now active. You can log in using the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In</a>
      </div>
      <p>Thank you for joining the platform.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">School ERP Platform</p>
    </div>
  `,
  text: `Hi ${firstName},\n\nYour account has been verified and is now active.\n\nLog in: ${loginUrl}\n\nThank you for joining the platform.`,
});
