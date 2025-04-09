/**
 * Base email template with VetSphere branding
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.footerText - Optional footer text
 * @returns {string} - Compiled HTML template
 */
const baseTemplate = (options) => {
  const { title, content, footerText = 'This is an automated message, please do not reply to this email.' } = options;
  
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
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
        }
        .header {
          background: #3a4f9a;
          padding: 20px;
          text-align: center;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .tagline {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-style: italic;
          margin-top: 5px;
        }
        .content {
          padding: 30px 20px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-top: none;
        }
        .footer {
          background: #f5f5f5;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e5e5;
        }
        .highlight-box {
          background-color: #f7f9ff;
          border-left: 4px solid #3a4f9a;
          padding: 15px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #3a4f9a;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          margin: 20px 0;
          border-radius: 4px;
          font-weight: bold;
        }
        h1, h2, h3 {
          color: #3a4f9a;
        }
        a {
          color: #3a4f9a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="VetSphere" class="logo" />
          <div class="tagline">Beyond Records, Beyond Care</div>
        </div>
        <div class="content">
          <h1>${title}</h1>
          ${content}
        </div>
        <div class="footer">
          <p>${footerText}</p>
          <p>&copy; ${new Date().getFullYear()} VetSphere. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = baseTemplate; 