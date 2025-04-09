const baseTemplate = require('./baseTemplate');

/**
 * Generate a signup verification email template
 * @param {Object} user - User data
 * @param {string} user.fullName - User full name
 * @param {string} user.clinicName - Clinic name
 * @returns {Object} - Email template with text and HTML versions
 */
const signupVerificationTemplate = (user) => {
  const title = 'Your VetSphere Application is Being Processed';
  
  // Plain text version
  const text = `
    Dear ${user.fullName},

    Thank you for your interest in VetSphere!

    We have received your application for ${user.clinicName}. Our team will review your information and verify your details within the next 24-48 hours.

    You will receive a follow-up email once your account has been approved. If we need any additional information, we will contact you at this email address.

    If you have any questions in the meantime, please don't hesitate to contact our support team.

    Best regards,
    The VetSphere Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${user.fullName}</strong>,</p>

    <p>Thank you for your interest in VetSphere!</p>

    <p>We have received your application for <strong>${user.clinicName}</strong>. Our team will review your information and verify your details within the next <strong>24-48 hours</strong>.</p>

    <div class="highlight-box">
      <p style="margin: 0;">You will receive a follow-up email once your account has been approved. If we need any additional information, we will contact you at this email address.</p>
    </div>

    <p>If you have any questions in the meantime, please don't hesitate to contact our support team.</p>

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

module.exports = signupVerificationTemplate; 