const baseTemplate = require('./baseTemplate');

/**
 * Generate a password reset email template
 * @param {Object} data - Password reset data
 * @param {string} data.fullName - User's full name
 * @param {string} data.resetToken - Password reset token
 * @param {string} data.resetUrl - Complete password reset URL
 * @param {number} data.expiryHours - Token expiry time in hours
 * @returns {Object} - Email template with text and HTML versions
 */
const passwordResetTemplate = (data) => {
  const title = 'Reset Your PetSphere Password';

  // Plain text version
  const text = `
    Dear ${data.fullName},

    We received a request to reset your password for your PetSphere account.

    To reset your password, please click on the link below or copy and paste it into your browser:
    ${data.resetUrl}

    This link will expire in ${data.expiryHours} hours.

    If you did not request a password reset, please ignore this email or contact our support team if you have concerns about your account security.

    Best regards,
    The PetSphere Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${data.fullName}</strong>,</p>

    <p>We received a request to reset your password for your PetSphere account.</p>

    <div class="highlight-box">
      <p class="highlight-title">Security Notice</p>
      <p class="highlight-item">To reset your password, please click the button below</p>
      <p class="highlight-item">This link will expire in ${data.expiryHours} hours</p>
      <p class="highlight-item">If you didn't request this, please contact support immediately</p>
    </div>

    <a href="${data.resetUrl}" class="button">Reset Password</a>

    <p style="margin-top: 20px; font-size: 13px;">Or copy and paste this URL into your browser: <br>
    <span style="font-family: monospace; word-break: break-all;">${data.resetUrl}</span></p>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>

    <p>If you did not request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>

    <p>Best regards,<br>The PetSphere Team</p>
  `;

  return {
    text,
    html: baseTemplate({
      title,
      content,
      footerText: 'This is an automated security email. Please do not reply to this message.'
    })
  };
};

module.exports = passwordResetTemplate;