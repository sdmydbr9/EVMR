const signupVerificationTemplate = require('./signupVerification');
const adminNotificationTemplate = require('./adminNotification');
const accountApprovedTemplate = require('./accountApproved');
const appointmentReminderTemplate = require('./appointmentReminder');
const passwordResetTemplate = require('./passwordReset');
const baseTemplate = require('./baseTemplate');
const newBaseTemplate = require('./newBaseTemplate');
const darkTemplate = require('./darkTemplate');
const fallbackTemplate = require('./fallbackTemplate');

/**
 * Email templates with PetSphere branding
 * Using the elegant black and white theme with iOS/Mac-inspired design
 * Now with support for light and dark themes with embedded logo images
 * Includes fallback template for cases where logo loading fails
 */
module.exports = {
  signupVerificationTemplate,
  adminNotificationTemplate,
  accountApprovedTemplate,
  appointmentReminderTemplate,
  passwordResetTemplate,
  baseTemplate: newBaseTemplate, // Use the new template as the default
  newBaseTemplate,
  darkTemplate,
  fallbackTemplate
};