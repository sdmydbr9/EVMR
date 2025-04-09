# VetSphere Branding Guide

This document outlines the branding implementation for VetSphere, including logos, colors, typography, email templates, and application icons.

## Brand Assets

All brand assets are organized in the following locations:

- **Frontend Logo Files**: `frontend/public/assets/images/logos/`
- **Backend Logo Files**: `backend/assets/images/`
- **Application Icons**: `frontend/public/assets/images/logos/icons/`
- **Email Templates**: `backend/templates/emails/`

## Logo Variations

VetSphere uses several logo variations for different contexts:

1. **Black Text with Transparent Background** (`black_transparent.png`)
   - Use on light backgrounds
   - Path: `frontend/public/assets/images/logos/black_transparent.png`

2. **White Text with Transparent Background** (`white_transparent.png`)
   - Use on dark backgrounds
   - Path: `frontend/public/assets/images/logos/white_transparent.png`

3. **Black Text with White Background** (`non_transparent_blackText_whiteBackground.png`)
   - Use when transparency isn't supported
   - Path: `frontend/public/assets/images/logos/non_transparent_blackText_whiteBackground.png`

## Brand Colors

The primary brand colors for VetSphere are:

- **Primary Blue**: `#3a4f9a` - Used for buttons, links, and primary UI elements
- **Secondary Colors**:
  - **Orange**: `#FF9500` - Used for warnings and secondary elements
  - **Red**: `#FF2D55` - Used for errors and alerts
  - **Green**: `#34C759` - Used for success states
  - **Purple**: `#5856D6` - Used for special features

## Typography

VetSphere uses the Roboto font family (imported from Google Fonts) with various weights:

- **Light (300)**: Used for large headings
- **Regular (400)**: Used for body text and general content
- **Medium (500)**: Used for sub-headings and emphasis
- **Bold (700)**: Used for strong emphasis and CTAs

## Email Templates

Email templates follow a consistent design pattern:

1. **Header**: Blue background (`#3a4f9a`) with the VetSphere logo
2. **Content**: White background with styled content
3. **Footer**: Light gray background with copyright information

Logo usage in emails is determined by the `theme` parameter:
- `dark` theme (default): Uses black logo on light background
- `light` theme: Uses white logo on dark background

See `backend/templates/emails/README.md` for detailed usage instructions.

## Application Icons

The application uses a set of icons generated from the VetSphere logo:

- **Favicon**: `favicon.ico` - Used in browser tabs
- **PWA Icons**: 
  - `logo192.png` - Used for PWA home screen icons on small screens
  - `logo512.png` - Used for PWA home screen icons on larger screens
- **Various Sizes**: Multiple sizes (16px to 512px) available in `icons/` directory

## Tagline

The official VetSphere tagline is:

> "Beyond Records, Beyond Care"

This should be displayed alongside the logo in prominent places such as the login screen, landing page, and about page.

## Implementation Guidelines

### Frontend Implementation

1. **App Layout**: The main application uses the black transparent logo in the sidebar
2. **Login/Landing Page**: Uses the black transparent logo with the tagline beneath it
3. **Dark Mode** (if implemented): Should switch to white transparent logo

### Email Implementation

1. **Email Headers**: Use the white transparent logo on the blue header background
2. **Email Templates**: All emails should use the base template structure

## Generating Icons

Icons are generated using the `generate-icons.js` script located in the `scripts/` directory. 

To regenerate icons (if the logo changes):

1. Update the source logo file
2. Run `npm install sharp` (if not already installed)
3. Run `node scripts/generate-icons.js`

This will generate all necessary icon sizes and place them in the appropriate directories.

## Manifest File

The Progressive Web App manifest file (`frontend/public/manifest.json`) contains:

1. App name and short name
2. Icon references for various sizes
3. Theme color (`#3a4f9a`)
4. Background color (`#ffffff`)
5. Display mode settings

---

For additional information about specific implementations, see the README files in the respective directories. 