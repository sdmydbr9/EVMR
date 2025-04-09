const baseTemplate = require('./baseTemplate');

/**
 * Generate an account approval email template
 * @param {Object} user - User data
 * @param {string} user.fullName - User full name
 * @param {string} user.uniqueId - User's unique ID (VET_ID or ORG_ID)
 * @param {string} user.role - User role
 * @returns {Object} - Email template with text and HTML versions
 */
const accountApprovedTemplate = (user) => {
  const title = 'Your VetSphere Account has been Approved';
  const idLabel = user.role === 'veterinarian' ? 'VET ID' : 'ORG ID';
  
  // Plain text version
  const text = `
    Dear ${user.fullName},

    Great news! Your VetSphere account has been approved and is now ready to use.

    Account Details:
    - Email: ${user.email}
    - ${idLabel}: ${user.uniqueId}

    Please keep your ${idLabel} safe as you will need it to log in to your account.

    To get started, visit https://app.vetsphere.com and log in with your email address, password, and ${idLabel}.

    If you have any questions or need assistance, please don't hesitate to contact our support team.

    Thank you for choosing VetSphere. We're excited to have you as part of our community!

    Best regards,
    The VetSphere Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${user.fullName}</strong>,</p>

    <p>Great news! Your VetSphere account has been approved and is now ready to use.</p>

    <div class="highlight-box">
      <h3 style="margin-top: 0;">Account Details</h3>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>${idLabel}:</strong> <span style="background: #f0f0f0; padding: 3px 8px; font-family: monospace; border-radius: 3px;">${user.uniqueId}</span></p>
    </div>

    <p>Please keep your ${idLabel} safe as you will need it to log in to your account.</p>

    <a href="https://app.vetsphere.com" class="button">Go to Login</a>

    <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

    <p>Thank you for choosing VetSphere. We're excited to have you as part of our community!</p>

    <p>Best regards,<br>The VetSphere Team</p>
  `;

  return {
    text,
    html: baseTemplate({
      title,
      content
    })
  };
};

module.exports = accountApprovedTemplate; 