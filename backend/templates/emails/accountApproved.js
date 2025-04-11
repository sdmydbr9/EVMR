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
  const title = 'Your PetSphere Account has been Approved';
  const idLabel = user.role === 'veterinarian' ? 'VET ID' : 'ORG ID';
  const appUrl = process.env.BASE_URL || 'https://petsphere.com';

  // Plain text version
  const text = `
    Dear ${user.fullName},

    Great news! Your PetSphere account has been approved and is now ready to use.

    Account Details:
    - Email: ${user.email}
    - ${idLabel}: ${user.uniqueId}

    Please keep your ${idLabel} safe as you will need it to log in to your account.

    To get started, visit ${appUrl} and log in with your email address, password, and ${idLabel}.

    If you have any questions or need assistance, please don't hesitate to contact our support team.

    Thank you for choosing PetSphere. We're excited to have you as part of our community!

    Best regards,
    The PetSphere Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${user.fullName}</strong>,</p>

    <p>Great news! Your PetSphere account has been approved and is now ready to use.</p>

    <div class="highlight-box">
      <p class="highlight-title">Account Details</p>
      <p class="highlight-item"><strong>Email:</strong> ${user.email}</p>
      <p class="highlight-item"><strong>${idLabel}:</strong> <span style="background: #f0f0f0; padding: 3px 8px; font-family: monospace; border-radius: 3px;">${user.uniqueId}</span></p>
    </div>

    <p>Please keep your ${idLabel} safe as you will need it to log in to your account.</p>

    <a href="${appUrl}" class="button">Go to Login</a>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>

    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

    <p>Thank you for choosing PetSphere. We're excited to have you as part of our community!</p>

    <p>Best regards,<br>The PetSphere Team</p>
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