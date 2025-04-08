const nodemailer = require('nodemailer');
require('dotenv').config();

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
    from: process.env.EMAIL_FROM || 'EVMR System <noreply@example.com>',
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
 * Send signup verification email
 * @param {Object} user - User data
 * @param {string} user.email - User email address
 * @param {string} user.fullName - User full name
 * @param {string} user.clinicName - Clinic name
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendSignupVerificationEmail = async (user) => {
  const subject = 'Your EVMR Application is Being Processed';

  const text = `
    Dear ${user.fullName},

    Thank you for your interest in the EVMR System!

    We have received your application for ${user.clinicName}. Our team will review your information and verify your details within the next 24-48 hours.

    You will receive a follow-up email once your account has been approved. If we need any additional information, we will contact you at this email address.

    If you have any questions in the meantime, please don't hesitate to contact our support team.

    Best regards,
    The EVMR Team
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007AFF; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">EVMR System</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Dear <strong>${user.fullName}</strong>,</p>

        <p>Thank you for your interest in the EVMR System!</p>

        <p>We have received your application for <strong>${user.clinicName}</strong>. Our team will review your information and verify your details within the next <strong>24-48 hours</strong>.</p>

        <div style="background-color: #f5f5f5; border-left: 4px solid #007AFF; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">You will receive a follow-up email once your account has been approved. If we need any additional information, we will contact you at this email address.</p>
        </div>

        <p>If you have any questions in the meantime, please don't hesitate to contact our support team.</p>

        <p>Best regards,<br>The EVMR Team</p>
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
 * Send admin notification about new signup
 * @param {Object} user - User data
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendAdminNotificationEmail = async (user) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('Admin email not found in environment variables, skipping notification');
    return;
  }

  const subject = 'New EVMR Application Received';

  const text = `
    A new application for EVMR System has been received.

    User Information:
    - Name: ${user.fullName}
    - Email: ${user.email}
    - Phone: ${user.phone}
    - Role: ${user.role}

    Clinic Information:
    - Name: ${user.clinicName}
    - Address: ${user.clinicAddress}
    - Country: ${user.country}
    - Phone: ${user.clinicPhone}
    - Email: ${user.clinicEmail}
    - Team Size: ${user.teamSize}

    Please review this application within the next 24-48 hours.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #007AFF; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">New EVMR Application</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <p>A new application for EVMR System has been received.</p>

        <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">User Information</h2>
        <ul>
          <li><strong>Name:</strong> ${user.fullName}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Phone:</strong> ${user.phone}</li>
          <li><strong>Role:</strong> ${user.role}</li>
        </ul>

        <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Clinic Information</h2>
        <ul>
          <li><strong>Name:</strong> ${user.clinicName}</li>
          <li><strong>Address:</strong> ${user.clinicAddress}</li>
          <li><strong>Country:</strong> ${user.country}</li>
          <li><strong>Phone:</strong> ${user.clinicPhone}</li>
          <li><strong>Email:</strong> ${user.clinicEmail}</li>
          <li><strong>Team Size:</strong> ${user.teamSize}</li>
        </ul>

        <div style="background-color: #f5f5f5; border-left: 4px solid #FF9500; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Action required:</strong> Please review this application within the next 24-48 hours.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendSignupVerificationEmail,
  sendAdminNotificationEmail,
};