const newBaseTemplate = require('./newBaseTemplate');
const fallbackTemplate = require('./fallbackTemplate');

/**
 * Generate an account approval email template
 * @param {Object} user - User data
 * @param {string} user.fullName - User full name
 * @param {string} user.uniqueId - User's unique ID (VET_ID or ORG_ID)
 * @param {string} user.role - User role
 * @param {string} user.theme - 'light' or 'dark' theme for the email
 * @returns {Object} - Email template with text and HTML versions
 */
const accountApprovedTemplate = (user) => {
  const title = 'Account Approved';
  const idLabel = user.role === 'veterinarian' ? 'VET ID' : 'ORG ID';
  const appUrl = process.env.BASE_URL || 'https://petsphere.com';
  const { theme = 'light' } = user;

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

    <div style="text-align: center; margin: 40px 0;">
      <a href="${appUrl}" class="button">Go to Login</a>
    </div>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>

    <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:${process.env.EMAIL_FROM || 'petsphere.contact@gmail.com'}">${process.env.EMAIL_FROM || 'petsphere.contact@gmail.com'}</a>.</p>

    <p>Thank you for choosing PetSphere. We're excited to have you as part of our community!</p>

    <p>Best regards,<br>The PetSphere Team</p>
  `;

  // Try to use the main template, fall back to basic template if it fails
  let html;
  try {
    html = newBaseTemplate({
      title,
      content,
      theme
    });
  } catch (error) {
    console.error('Error generating email with newBaseTemplate:', error.message);
    // Use fallback template instead
    html = fallbackTemplate({
      title,
      content,
      theme
    });
  }

  return {
    text,
    html
  };
};

module.exports = accountApprovedTemplate;