const signupVerificationTemplate = require('./signupVerification');
const adminNotificationTemplate = require('./adminNotification');
const accountApprovedTemplate = require('./accountApproved');
const appointmentReminderTemplate = require('./appointmentReminder');
const passwordResetTemplate = require('./passwordReset');
const baseTemplate = require('./baseTemplate');
const newBaseTemplate = require('./newBaseTemplate');

/**
 * Email templates with PetSphere branding
 * Using the new black and white theme with elegant design
 */
module.exports = {
  signupVerificationTemplate,
  adminNotificationTemplate,
  accountApprovedTemplate,
  appointmentReminderTemplate,
  passwordResetTemplate,
  baseTemplate: newBaseTemplate // Replace the old template with the new one
};