/**
 * Script to generate favicon and app icons from the VetSphere logo
 * 
 * To use this script:
 * 1. Install Sharp: npm install sharp
 * 2. Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source logo file (non-transparent version works best for icons)
const SOURCE_LOGO = path.join(__dirname, '../frontend/public/assets/images/logos/non_transparent_blackText_whiteBackground.png');

// Output directory for icons
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/assets/images/logos/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define icon sizes to generate
const ICON_SIZES = [16, 32, 48, 64, 128, 192, 256, 512];

// Generate all icon sizes
async function generateIcons() {
  try {
    console.log(`Generating icons from: ${SOURCE_LOGO}`);
    
    // Generate standard icons
    for (const size of ICON_SIZES) {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}.png`);
      
      await sharp(SOURCE_LOGO)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toFile(outputFile);
      
      console.log(`Generated: ${outputFile}`);
    }
    
    // Generate favicon.ico (contains 16x16, 32x32, 48x48 sizes)
    const favicon16 = path.join(OUTPUT_DIR, 'icon-16.png');
    const favicon32 = path.join(OUTPUT_DIR, 'icon-32.png');
    const favicon48 = path.join(OUTPUT_DIR, 'icon-48.png');
    
    // Copy the smallest icon to serve as favicon.ico for now
    // In a production environment, you would use a library that can create .ico files 
    // with multiple sizes embedded
    fs.copyFileSync(favicon32, path.join(OUTPUT_DIR, '../favicon.ico'));
    
    // Copy logo192.png for PWA manifest
    fs.copyFileSync(
      path.join(OUTPUT_DIR, 'icon-192.png'), 
      path.join(OUTPUT_DIR, '../logo192.png')
    );
    
    // Copy logo512.png for PWA manifest
    fs.copyFileSync(
      path.join(OUTPUT_DIR, 'icon-512.png'), 
      path.join(OUTPUT_DIR, '../logo512.png')
    );
    
    console.log('Icon generation complete!');
    console.log('favicon.ico, logo192.png, and logo512.png have been created.');
    console.log('You may need to update the manifest.json file to reference these new icons.');
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons(); 