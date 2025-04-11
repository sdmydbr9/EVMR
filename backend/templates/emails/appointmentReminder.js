const baseTemplate = require('./baseTemplate');

/**
 * Generate an appointment reminder email template
 * @param {Object} data - Appointment data
 * @param {string} data.ownerName - Pet owner's name
 * @param {string} data.petName - Pet's name
 * @param {string} data.appointmentDate - Formatted appointment date
 * @param {string} data.appointmentTime - Formatted appointment time
 * @param {string} data.serviceType - Type of service/appointment
 * @param {string} data.clinicName - Clinic name
 * @param {string} data.clinicAddress - Clinic address
 * @param {string} data.clinicPhone - Clinic phone
 * @param {string} data.appointmentId - Unique appointment ID for reference
 * @returns {Object} - Email template with text and HTML versions
 */
const appointmentReminderTemplate = (data) => {
  const title = 'Upcoming Appointment Reminder';
  const appUrl = process.env.BASE_URL || 'https://petsphere.com';

  // Plain text version
  const text = `
    Dear ${data.ownerName},

    This is a friendly reminder about your upcoming appointment at ${data.clinicName}.

    Appointment Details:
    - Pet: ${data.petName}
    - Date: ${data.appointmentDate}
    - Time: ${data.appointmentTime}
    - Service: ${data.serviceType}
    - Appointment ID: ${data.appointmentId}

    Location:
    ${data.clinicName}
    ${data.clinicAddress}
    Phone: ${data.clinicPhone}

    If you need to reschedule or cancel, please contact us at least 24 hours in advance.

    To view or manage your appointment, visit: ${appUrl}/appointments/${data.appointmentId}

    Thank you for choosing PetSphere for your pet's healthcare needs.

    Best regards,
    The ${data.clinicName} Team
  `;

  // HTML content for the email
  const content = `
    <p>Dear <strong>${data.ownerName}</strong>,</p>

    <p>This is a friendly reminder about your upcoming appointment at <strong>${data.clinicName}</strong>.</p>

    <div class="highlight-box">
      <p class="highlight-title">Appointment Details</p>
      <p class="highlight-item"><strong>Pet:</strong> ${data.petName}</p>
      <p class="highlight-item"><strong>Date:</strong> ${data.appointmentDate}</p>
      <p class="highlight-item"><strong>Time:</strong> ${data.appointmentTime}</p>
      <p class="highlight-item"><strong>Service:</strong> ${data.serviceType}</p>
      <p class="highlight-item"><strong>Appointment ID:</strong> <span style="font-family: monospace;">${data.appointmentId}</span></p>
    </div>

    <h3>Location</h3>
    <p>
      ${data.clinicName}<br>
      ${data.clinicAddress}<br>
      Phone: <a href="tel:${data.clinicPhone.replace(/\D/g, '')}">${data.clinicPhone}</a>
    </p>

    <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>

    <a href="${appUrl}/appointments/${data.appointmentId}" class="button">View Appointment</a>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>

    <p>Thank you for choosing PetSphere for your pet's healthcare needs.</p>

    <p>Best regards,<br>The ${data.clinicName} Team</p>
  `;

  return {
    text,
    html: baseTemplate({
      title,
      content
    })
  };
};

module.exports = appointmentReminderTemplate;