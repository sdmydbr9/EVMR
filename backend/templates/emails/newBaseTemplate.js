/**
 * Modern black and white email template with PetSphere branding
 * Inspired by React Email components for elegant, iOS/Mac-inspired design
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.footerText - Optional footer text
 * @param {string} options.theme - 'light' or 'dark' theme for the email
 * @returns {string} - Compiled HTML template
 */
const { getBase64Logo, getBase64FullLogo } = require('../../utils/logoUtils');

const newBaseTemplate = (options) => {
  const {
    title,
    content,
    footerText = 'This is an automated message, please do not reply to this email.',
    tagline = 'Beyond Records, Beyond Care',
    theme = 'light' // 'light' (black logo) or 'dark' (white logo)
  } = options;

  // Get base URL from environment or use default
  const baseUrl = process.env.BASE_URL || 'https://petsphere.com';
  // Get company email from environment or use default
  const contactEmail = process.env.EMAIL_FROM || 'petsphere.contact@gmail.com';
  // Get company address from environment or use a default
  const companyAddress = process.env.COMPANY_ADDRESS || 'Agartala, Tripura, India';
  
  // Get the appropriate logo based on theme with error handling
  let logoBase64 = '';
  try {
    logoBase64 = getBase64Logo(theme) || '';
  } catch (error) {
    console.error('Error getting logo:', error.message);
    // Continue without logo if there's an error
  }
  
  // Set theme colors
  const isDarkTheme = theme === 'dark';
  
  const colors = {
    background: isDarkTheme ? '#1A1A1A' : '#f5f5f7',
    containerBg: isDarkTheme ? '#2A2A2A' : '#FFFFFF',
    text: isDarkTheme ? '#F5F5F7' : '#333333',
    textSecondary: isDarkTheme ? '#BBBBBB' : '#666666',
    textTertiary: isDarkTheme ? '#999999' : '#999999',
    divider: isDarkTheme ? '#444444' : '#000000',
    highlightBg: isDarkTheme ? '#333333' : '#f8f8f8',
    highlightBorder: isDarkTheme ? '#555555' : '#000000',
    highlightItemBorder: isDarkTheme ? '#444444' : '#dddddd',
    buttonBg: isDarkTheme ? '#FFFFFF' : '#000000',
    buttonText: isDarkTheme ? '#000000' : '#FFFFFF',
    buttonHover: isDarkTheme ? '#DDDDDD' : '#333333',
    footerBg: isDarkTheme ? '#1A1A1A' : '#f5f5f7',
    linkColor: isDarkTheme ? '#FFFFFF' : '#000000',
    logoContainerBg: isDarkTheme ? '#2A2A2A' : '#FFFFFF'
  };
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, html {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: ${colors.text};
          background-color: ${colors.background};
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: ${colors.containerBg};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        .logo-container {
          text-align: center;
          padding: 40px 0 20px 0;
          background-color: ${colors.logoContainerBg};
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 0 48px 48px;
          background: ${colors.containerBg};
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: ${colors.text};
          margin: 0 0 8px 0;
          text-align: center;
        }
        .subtitle {
          font-size: 16px;
          color: ${colors.textSecondary};
          margin: 0 0 24px 0;
          text-align: center;
        }
        .divider {
          width: 60px;
          margin: 24px auto;
          border: 1px solid ${colors.divider};
        }
        .footer {
          background: ${colors.footerBg};
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: ${colors.textTertiary};
        }
        .highlight-box {
          background-color: ${colors.highlightBg};
          border-left: 4px solid ${colors.highlightBorder};
          padding: 32px;
          margin: 32px 0;
          border-radius: 12px;
        }
        .highlight-title {
          font-size: 16px;
          font-weight: 500;
          color: ${colors.text};
          margin: 0 0 16px 0;
        }
        .highlight-item {
          font-size: 15px;
          line-height: 24px;
          color: ${colors.textSecondary};
          margin: 8px 0;
          padding-left: 16px;
          border-left: 2px solid ${colors.highlightItemBorder};
        }
        .button {
          display: inline-block;
          background: ${colors.buttonBg};
          color: ${colors.buttonText};
          text-decoration: none;
          padding: 14px 32px;
          margin: 20px 0;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .button:hover {
          background-color: ${colors.buttonHover};
        }
        .quote-box {
          background-color: ${colors.highlightBg};
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          text-align: center;
        }
        .quote-text {
          font-size: 15px;
          line-height: 24px;
          color: ${colors.textSecondary};
          font-style: italic;
          margin: 0;
        }
        .footer-links a {
          color: ${colors.textSecondary};
          text-decoration: underline;
          margin: 0 8px;
        }
        .footer-links {
          margin-top: 16px;
        }
        h1, h2, h3 {
          color: ${colors.text};
        }
        a {
          color: ${colors.linkColor};
          font-weight: 500;
          text-decoration: none;
        }
        p {
          margin: 16px 0;
          font-size: 16px;
          line-height: 26px;
          color: ${colors.text};
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${logoBase64 ? `
        <div class="logo-container">
          <img src="${logoBase64}" alt="PetSphere" class="logo" />
        </div>
        ` : ''}
        <div class="content">
          <h1 class="title">${title}</h1>
          <div class="subtitle">${tagline}</div>
          <hr class="divider" />
          ${content}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>&copy; ${new Date().getFullYear()} PetSphere. All rights reserved.</p>
          <p>${companyAddress}</p>
          <div class="footer-links">
            <a href="${baseUrl}/unsubscribe">Unsubscribe</a> • 
            <a href="${baseUrl}/privacy">Privacy Policy</a> • 
            <a href="${baseUrl}/terms">Terms</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = newBaseTemplate;
