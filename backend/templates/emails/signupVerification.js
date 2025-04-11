const newBaseTemplate = require('./newBaseTemplate');
const fallbackTemplate = require('./fallbackTemplate');

/**
 * Generate a signup verification email template
 * @param {Object} user - User data
 * @param {string} user.fullName - User full name
 * @param {string} user.clinicName - Clinic name
 * @param {string} user.theme - 'light' or 'dark' theme for the email
 * @returns {Object} - Email template with text and HTML versions
 */
const signupVerificationTemplate = (user) => {
  const title = 'Registration Successful';
  const { theme = 'light' } = user;

  // Plain text version
  const text = `
    Dear ${user.fullName},

    Thank you for joining PetSphere!

    We're pleased to confirm that we've received your application for ${user.clinicName}. Our team is currently reviewing your details to ensure everything is in order before granting full access to the PetSphere platform.

    You will receive a follow-up email once your account has been approved. If we need any additional information, we will contact you at this email address.

    If you have any questions in the meantime, please don't hesitate to contact our support team.

    Best regards,
    The PetSphere Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${user.fullName}</strong>,</p>

    <p>We're pleased to confirm that we've received your application for <strong>${user.clinicName}</strong>. Our team is currently reviewing your details to ensure everything is in order before granting full access to the PetSphere platform.</p>

    <div class="highlight-box">
      <p class="highlight-title">What happens next:</p>
      <p class="highlight-item">Our team will carefully review your application details</p>
      <p class="highlight-item">You will receive a confirmation email within 24-48 hours</p>
      <p class="highlight-item">Once approved, you'll gain full access to all PetSphere features</p>
    </div>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.BASE_URL || 'https://petsphere.com'}/account" class="button">Check Application Status</a>
    </div>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>

    <p>If you have any questions in the meantime, please don't hesitate to contact our support team at <a href="mailto:${process.env.EMAIL_FROM || 'petsphere.contact@gmail.com'}">${process.env.EMAIL_FROM || 'petsphere.contact@gmail.com'}</a>.</p>

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

module.exports = signupVerificationTemplate;