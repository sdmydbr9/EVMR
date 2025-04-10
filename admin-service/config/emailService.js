const nodemailer = require('nodemailer');

// Create a nodemailer transporter with SMTP settings from env variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendEmail = async (options) => {
  const emailDefaults = {
    from: process.env.EMAIL_FROM || 'PetSphere Admin System <noreply@example.com>',
  };

  try {
    // Verify that the SMTP connection works
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      ...emailDefaults,
      ...options,
    });

    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send approval notification email to user
 * @param {Object} user - User data
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendApprovalEmail = async (user) => {
  const subject = 'Your PetSphere Account Has Been Approved';

  // Prepare ID information based on user role
  let idInfo = '';

  if (user.role === 'veterinarian' && user.uniqueId) {
    idInfo = `
      Your unique Veterinarian ID is: <strong>${user.uniqueId}</strong>

      Please keep this ID secure. You will need it to log in to the system along with your email and password.
    `;
  } else if (user.role === 'admin' && user.organisationId) {
    idInfo = `
      Your Organisation ID is: <strong>${user.organisationId}</strong>

      Please keep this ID secure. You will need it to log in to the system along with your email and password.
    `;
  }

  const text = `
    Dear ${user.name},

    Great news! Your PetSphere System account${user.clinicName ? ` for ${user.clinicName}` : ''} has been approved.

    ${user.role === 'veterinarian' && user.uniqueId ?
      `Your unique Veterinarian ID is: ${user.uniqueId}

      Please keep this ID secure. You will need it to log in to the system along with your email and password.`
    : ''}
    ${user.role === 'admin' && user.organisationId ?
      `Your Organisation ID is: ${user.organisationId}

      Please keep this ID secure. You will need it to log in to the system along with your email and password.`
    : ''}

    You can now log in to the system at ${process.env.BASE_URL} with your credentials.

    If you have any questions, please don't hesitate to contact our support team.

    Best regards,
    The PetSphere Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007AFF; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">PetSphere System</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear <strong>${user.name}</strong>,</p>

        <p><strong>Great news!</strong> Your PetSphere System account${user.clinicName ? ` for <strong>${user.clinicName}</strong>` : ''} has been approved.</p>

        ${idInfo ? `
        <div style="background-color: #f8f9fa; border-left: 4px solid #007AFF; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">${idInfo}</p>
        </div>
        ` : ''}

        <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">You can now log in to the system at <a href="${process.env.BASE_URL}">${process.env.BASE_URL}</a> with your credentials.</p>
        </div>

        <p>If you have any questions, please don't hesitate to contact our support team.</p>

        <p>Best regards,<br>The PetSphere Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send rejection notification email to user
 * @param {Object} user - User data
 * @param {string} reason - Rejection reason
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendRejectionEmail = async (user, reason) => {
  const subject = 'Update on Your PetSphere Application';

  const text = `
    Dear ${user.name},

    Thank you for your interest in the PetSphere System.

    After reviewing your application, we regret to inform you that we are unable to approve your account at this time for the following reason:

    ${reason}

    If you believe this decision was made in error or if you would like to provide additional information, please reply to this email.

    Best regards,
    The PetSphere Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007AFF; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">PetSphere System</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear <strong>${user.name}</strong>,</p>

        <p>Thank you for your interest in the PetSphere System.</p>

        <p>After reviewing your application, we regret to inform you that we are unable to approve your account at this time for the following reason:</p>

        <div style="background-color: #f5f5f5; border-left: 4px solid #FF5722; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">${reason}</p>
        </div>

        <p>If you believe this decision was made in error or if you would like to provide additional information, please reply to this email.</p>

        <p>Best regards,<br>The PetSphere Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated message. For inquiries, please contact our support team.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendApprovalEmail,
  sendRejectionEmail,
};