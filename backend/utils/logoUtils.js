const fs = require('fs');
const path = require('path');

/**
 * Check multiple possible paths for a file
 * @param {string} fileName - Name of the file to find
 * @returns {string|null} - Path to the file if found, null otherwise
 */
const findFile = (fileName) => {
  // List of possible relative paths to check
  const possiblePaths = [
    path.join(__dirname, '../../new_logos', fileName),
    path.join(__dirname, '../../../new_logos', fileName),
    path.join(__dirname, '../assets/images', fileName),
    path.join(__dirname, '../../assets/images', fileName),
    path.join(process.cwd(), 'new_logos', fileName),
    path.join(process.cwd(), 'assets/images', fileName)
  ];

  // Try each path
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
};

/**
 * Get base64 encoded logo image for email templates
 * @param {string} theme - 'light' for black logo, 'dark' for white logo
 * @returns {string} - Base64 encoded image data with proper data URI
 */
const getBase64Logo = (theme = 'light') => {
  try {
    // Determine which logo to use based on theme
    const logoFileName = theme === 'dark' 
      ? 'logo_white_transparent.png' 
      : 'logo_black_transparent.png';
    
    // Find the logo file
    const logoPath = findFile(logoFileName);
    
    if (!logoPath) {
      console.warn(`Logo file not found: ${logoFileName}`);
      return ''; // Return empty string if file doesn't exist
    }
    
    // Read the logo file and convert to base64
    const logoData = fs.readFileSync(logoPath);
    const base64Logo = logoData.toString('base64');
    
    // Return the base64 data with proper data URI for PNG images
    return `data:image/png;base64,${base64Logo}`;
  } catch (error) {
    console.error(`Error loading logo: ${error.message}`);
    // Return an empty string if there's an error loading the logo
    return '';
  }
};

/**
 * Get base64 encoded full logo with tagline for email templates
 * @param {string} theme - 'light' for black logo, 'dark' for white logo
 * @returns {string} - Base64 encoded image data with proper data URI
 */
const getBase64FullLogo = (theme = 'light') => {
  try {
    // Determine which logo to use based on theme
    const logoFileName = theme === 'dark' 
      ? 'full_logo_with_brand_tagline_white_transparent.png' 
      : 'full_logo_with_brand_tagline_black_transparent.png';
    
    // Find the logo file
    const logoPath = findFile(logoFileName);
    
    if (!logoPath) {
      console.warn(`Full logo file not found: ${logoFileName}`);
      return ''; // Return empty string if file doesn't exist
    }
    
    // Read the logo file and convert to base64
    const logoData = fs.readFileSync(logoPath);
    const base64Logo = logoData.toString('base64');
    
    // Return the base64 data with proper data URI for PNG images
    return `data:image/png;base64,${base64Logo}`;
  } catch (error) {
    console.error(`Error loading full logo: ${error.message}`);
    // Return an empty string if there's an error loading the logo
    return '';
  }
};

module.exports = {
  getBase64Logo,
  getBase64FullLogo
}; 