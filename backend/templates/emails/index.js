const signupVerificationTemplate = require('./signupVerification');
const adminNotificationTemplate = require('./adminNotification');
const accountApprovedTemplate = require('./accountApproved');
const appointmentReminderTemplate = require('./appointmentReminder');
const passwordResetTemplate = require('./passwordReset');
const baseTemplate = require('./baseTemplate');

/**
 * Email templates with VetSphere branding
 */
module.exports = {
  signupVerificationTemplate,
  adminNotificationTemplate,
  accountApprovedTemplate,
  appointmentReminderTemplate,
  passwordResetTemplate,
  baseTemplate
}; 