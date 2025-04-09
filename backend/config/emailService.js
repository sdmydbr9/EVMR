const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import email templates
const {
  signupVerificationTemplate,
  adminNotificationTemplate,
  accountApprovedTemplate,
  appointmentReminderTemplate,
  passwordResetTemplate
} = require('../templates/emails');

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
 * Get logo attachment based on theme (light or dark)
 * @param {string} theme - 'light' for white logo, 'dark' for black logo
 * @returns {Object} - Logo attachment configuration for nodemailer
 */
const getLogoAttachment = (theme = 'dark') => {
  // Default to dark theme (black logo)
  let logoPath = path.join(__dirname, '../assets/images/black_transparent.png');
  
  // Use white logo for dark-themed emails
  if (theme === 'light') {
    logoPath = path.join(__dirname, '../assets/images/white_transparent.png');
  }
  
  // Fallback to non-transparent logo if neither exists
  if (!fs.existsSync(logoPath)) {
    logoPath = path.join(__dirname, '../assets/images/non_transparent_blackText_whiteBackground.png');
  }
  
  return {
    filename: 'vetsphere-logo.png',
    path: logoPath,
    cid: 'logo' // Same cid value as in the IMG src in the templates
  };
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email
 * @param {string} options.theme - Optional theme for logo ('light' or 'dark')
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendEmail = async (options) => {
  const { theme, ...emailOptions } = options;
  
  const emailDefaults = {
    from: process.env.EMAIL_FROM || 'VetSphere <notifications@vetsphere.com>',
    attachments: [
      getLogoAttachment(theme)
    ]
  };

  try {
    // Verify that the SMTP connection works
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      ...emailDefaults,
      ...emailOptions,
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
  const { text, html } = signupVerificationTemplate(user);
  const subject = 'Your VetSphere Application is Being Processed';

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

  const { text, html } = adminNotificationTemplate(user);
  const subject = 'New VetSphere Application Received';

  return sendEmail({
    to: adminEmail,
    subject,
    text,
    html,
  });
};

/**
 * Send account approval email
 * @param {Object} user - User data
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendAccountApprovedEmail = async (user) => {
  const { text, html } = accountApprovedTemplate(user);
  const subject = 'Your VetSphere Account has been Approved';

  return sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * Send appointment reminder email
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendAppointmentReminder = async (appointmentData) => {
  const { text, html } = appointmentReminderTemplate(appointmentData);
  const subject = 'Upcoming Appointment Reminder';

  return sendEmail({
    to: appointmentData.ownerEmail,
    subject,
    text,
    html,
  });
};

/**
 * Send password reset email
 * @param {Object} data - Password reset data
 * @returns {Promise} - Promise that resolves with the email sending result
 */
const sendPasswordResetEmail = async (data) => {
  const { text, html } = passwordResetTemplate(data);
  const subject = 'Reset Your VetSphere Password';

  return sendEmail({
    to: data.email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendSignupVerificationEmail,
  sendAdminNotificationEmail,
  sendAccountApprovedEmail,
  sendAppointmentReminder,
  sendPasswordResetEmail
};