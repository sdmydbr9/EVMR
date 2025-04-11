const baseTemplate = require('./baseTemplate');

/**
 * Generate an admin notification email template for new signups
 * @param {Object} user - User data
 * @returns {Object} - Email template with text and HTML versions
 */
const adminNotificationTemplate = (user) => {
  const title = 'New PetSphere Application Received';
  const adminUrl = process.env.ADMIN_URL || process.env.BASE_URL || 'https://petsphere.com';

  // Plain text version
  const text = `
    A new application for PetSphere has been received.

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
    To review the application, visit: ${adminUrl}/applications
  `;

  // HTML content for the email
  const content = `
    <p>A new application for PetSphere has been received.</p>

    <div class="highlight-box">
      <p class="highlight-title">User Information</p>
      <p class="highlight-item"><strong>Name:</strong> ${user.fullName}</p>
      <p class="highlight-item"><strong>Email:</strong> ${user.email}</p>
      <p class="highlight-item"><strong>Phone:</strong> ${user.phone}</p>
      <p class="highlight-item"><strong>Role:</strong> ${user.role}</p>
    </div>

    <div class="highlight-box">
      <p class="highlight-title">Clinic Information</p>
      <p class="highlight-item"><strong>Name:</strong> ${user.clinicName}</p>
      <p class="highlight-item"><strong>Address:</strong> ${user.clinicAddress}</p>
      <p class="highlight-item"><strong>Country:</strong> ${user.country}</p>
      <p class="highlight-item"><strong>Phone:</strong> ${user.clinicPhone}</p>
      <p class="highlight-item"><strong>Email:</strong> ${user.clinicEmail}</p>
      <p class="highlight-item"><strong>Team Size:</strong> ${user.teamSize}</p>
    </div>

    <div class="highlight-box">
      <p class="highlight-title">Action Required</p>
      <p class="highlight-item">Please review this application within the next 24-48 hours</p>
      <p class="highlight-item">Verify all provided information before approval</p>
      <p class="highlight-item">Contact the applicant if additional information is needed</p>
    </div>

    <a href="${adminUrl}/applications" class="button">Review Application</a>

    <div class="quote-box">
      <p class="quote-text">"Beyond Records, Beyond Care"</p>
    </div>
  `;

  return {
    text,
    html: baseTemplate({
      title,
      content
    })
  };
};

module.exports = adminNotificationTemplate;