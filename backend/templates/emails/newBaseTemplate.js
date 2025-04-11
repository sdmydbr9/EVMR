/**
 * Modern black and white email template with PetSphere branding
 * Inspired by React Email components for elegant, professional design
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.footerText - Optional footer text
 * @returns {string} - Compiled HTML template
 */
const newBaseTemplate = (options) => {
  const {
    title,
    content,
    footerText = 'This is an automated message, please do not reply to this email.',
    tagline = 'Beyond Records, Beyond Care'
  } = options;

  // Get base URL from environment or use default
  const baseUrl = process.env.BASE_URL || 'https://petsphere.com';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body, html {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333333;
          background-color: #f5f5f7;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: #000000;
          padding: 32px;
          text-align: center;
        }
        .logo {
          max-width: 180px;
          height: auto;
        }
        .tagline {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-style: italic;
          margin-top: 8px;
        }
        .content {
          padding: 48px;
          background: #fff;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #000000;
          margin: 0 0 8px 0;
          text-align: center;
        }
        .subtitle {
          font-size: 16px;
          color: #666666;
          margin: 0 0 24px 0;
          text-align: center;
        }
        .divider {
          width: 60px;
          margin: 24px auto;
          border: 1px solid #000000;
        }
        .footer {
          background: #f5f5f7;
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #999999;
        }
        .highlight-box {
          background-color: #f8f8f8;
          border-left: 4px solid #000000;
          padding: 32px;
          margin: 32px 0;
          border-radius: 12px;
        }
        .highlight-title {
          font-size: 16px;
          font-weight: 500;
          color: #000000;
          margin: 0 0 16px 0;
        }
        .highlight-item {
          font-size: 15px;
          line-height: 24px;
          color: #444444;
          margin: 8px 0;
          padding-left: 16px;
          border-left: 2px solid #dddddd;
        }
        .button {
          display: inline-block;
          background: #000000;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          margin: 20px 0;
          border-radius: 8px;
          font-weight: 500;
          font-size: 15px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .button:hover {
          background-color: #333333;
        }
        .quote-box {
          background-color: #f5f5f7;
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          text-align: center;
        }
        .quote-text {
          font-size: 15px;
          line-height: 24px;
          color: #666666;
          font-style: italic;
          margin: 0;
        }
        .footer-links a {
          color: #666666;
          text-decoration: underline;
          margin: 0 8px;
        }
        .footer-links {
          margin-top: 16px;
        }
        h1, h2, h3 {
          color: #000000;
        }
        a {
          color: #000000;
          font-weight: 500;
          text-decoration: none;
        }
        p {
          margin: 16px 0;
          font-size: 16px;
          line-height: 26px;
          color: #333333;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="PetSphere" class="logo" />
          <div class="tagline">${tagline}</div>
        </div>
        <div class="content">
          <h1 class="title">${title}</h1>
          <hr class="divider" />
          ${content}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>&copy; ${new Date().getFullYear()} PetSphere. All rights reserved.</p>
          <p>Agartala, Tripura, India</p>
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
