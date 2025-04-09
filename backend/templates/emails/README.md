# VetSphere Email Templates

This directory contains branded email templates for VetSphere. The templates use a consistent design and include the VetSphere logo.

## Email Template Structure

The email templates are designed with a modular approach:

- `baseTemplate.js` - The foundation template that all other templates extend
- Individual templates for specific email types
- `index.js` - Exports all templates for easy importing

## Available Templates

1. **Signup Verification** - Sent when a user signs up for a new account
2. **Admin Notification** - Sent to administrators when a new signup occurs
3. **Account Approved** - Sent when a user's account is approved
4. **Appointment Reminder** - Sent to remind users of upcoming appointments
5. **Password Reset** - Sent when a user requests a password reset

## Logo Usage

All email templates include the VetSphere logo as an embedded image (using the `cid:logo` reference). The appropriate logo is selected based on the theme:

- **Dark theme (default)**: Uses `black_transparent.png` for light backgrounds
- **Light theme**: Uses `white_transparent.png` for dark backgrounds
- **Fallback**: Uses `non_transparent_blackText_whiteBackground.png` if other logos aren't found

Logo files are stored in the `backend/assets/images/` directory.

## How to Use

1. Import the desired template:
   ```js
   const { signupVerificationTemplate } = require('../templates/emails');
   ```

2. Generate the email content by passing the required data:
   ```js
   const { text, html } = signupVerificationTemplate({
     fullName: 'John Doe',
     clinicName: 'Animal Care Clinic'
   });
   ```

3. Send the email using the email service:
   ```js
   await sendEmail({
     to: 'recipient@example.com',
     subject: 'Your VetSphere Application',
     text,
     html,
     theme: 'dark' // optional, defaults to 'dark'
   });
   ```

## Customization

To create a new email template:

1. Create a new file in the `emails` directory
2. Import the base template: `const baseTemplate = require('./baseTemplate');`
3. Create a function that returns both text and HTML versions of the email
4. Add the new template to `index.js` for exporting

## Best Practices

- Always include both text and HTML versions for maximum compatibility
- Use the styling defined in the base template for consistency
- For special styling needs, include additional CSS in the template
- Test emails in multiple email clients to ensure proper rendering 