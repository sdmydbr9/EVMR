/**
 * Modern dark-themed email template with PetSphere branding
 * Inspired by React Email components for elegant, iOS/Mac-inspired design
 * @param {Object} options - Template options
 * @param {string} options.title - Email title
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.footerText - Optional footer text
 * @returns {string} - Compiled HTML template
 */
const { getBase64Logo, getBase64FullLogo } = require('../../utils/logoUtils');
const newBaseTemplate = require('./newBaseTemplate');

const darkTemplate = (options) => {
  // Always use the dark theme for this template
  return newBaseTemplate({
    ...options,
    theme: 'dark'
  });
};

module.exports = darkTemplate; 