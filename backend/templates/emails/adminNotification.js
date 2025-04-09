const baseTemplate = require('./baseTemplate');

/**
 * Generate an admin notification email template for new signups
 * @param {Object} user - User data
 * @returns {Object} - Email template with text and HTML versions
 */
const adminNotificationTemplate = (user) => {
  const title = 'New VetSphere Application Received';
  
  // Plain text version
  const text = `
    A new application for VetSphere has been received.

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

  // HTML content for the email
  const content = `
    <p>A new application for VetSphere has been received.</p>

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

    <div class="highlight-box">
      <p style="margin: 0;"><strong>Action required:</strong> Please review this application within the next 24-48 hours.</p>
    </div>

    <a href="https://admin.vetsphere.com/applications" class="button">Review Application</a>
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