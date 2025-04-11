/**
 * Fallback email template with no external dependencies
 * Simple black and white design that doesn't require loading logos
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.footerText - Optional footer text
 * @returns {string} - Compiled HTML template
 */
const fallbackTemplate = (options) => {
  const {
    title,
    content,
    footerText = 'This is an automated message, please do not reply to this email.',
    tagline = 'Beyond Records, Beyond Care',
    theme = 'light' // 'light' or 'dark' theme
  } = options;

  // Get base URL from environment or use default
  const baseUrl = process.env.BASE_URL || 'https://petsphere.com';
  // Get company address from environment or use a default
  const companyAddress = process.env.COMPANY_ADDRESS || 'Agartala, Tripura, India';
  
  // Set theme colors
  const isDarkTheme = theme === 'dark';
  
  const colors = {
    background: isDarkTheme ? '#1A1A1A' : '#f5f5f7',
    containerBg: isDarkTheme ? '#2A2A2A' : '#FFFFFF',
    text: isDarkTheme ? '#F5F5F7' : '#333333',
    textSecondary: isDarkTheme ? '#BBBBBB' : '#666666',
    buttonBg: isDarkTheme ? '#FFFFFF' : '#000000',
    buttonText: isDarkTheme ? '#000000' : '#FFFFFF',
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
        .header {
          padding: 32px 48px 0 48px;
          text-align: center;
          background: ${colors.containerBg};
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .tagline {
          font-size: 14px;
          font-style: italic;
          margin: 8px 0 24px 0;
          color: ${colors.textSecondary};
        }
        .content {
          padding: 0 48px 48px;
          background: ${colors.containerBg};
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: ${colors.text};
          margin: 0 0 24px 0;
          text-align: center;
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
        }
        a {
          color: ${colors.buttonBg};
          font-weight: 500;
          text-decoration: none;
        }
        p {
          margin: 16px 0;
          font-size: 16px;
          line-height: 26px;
          color: ${colors.text};
        }
        .footer {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: ${colors.textSecondary};
          border-top: 1px solid ${colors.textSecondary}40;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="company-name">PetSphere</h1>
          <div class="tagline">${tagline}</div>
        </div>
        <div class="content">
          <h1 class="title">${title}</h1>
          ${content}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>&copy; ${new Date().getFullYear()} PetSphere. All rights reserved.</p>
          <p>${companyAddress}</p>
          <p>
            <a href="${baseUrl}/unsubscribe">Unsubscribe</a> • 
            <a href="${baseUrl}/privacy">Privacy Policy</a> • 
            <a href="${baseUrl}/terms">Terms</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = fallbackTemplate; 