# VetSphere Utility Scripts

This directory contains utility scripts for the VetSphere application.

## Available Scripts

### Icon Generator

`generate-icons.js` - Generates favicon and app icons from the VetSphere logo.

#### Requirements

- Node.js
- Sharp package (`npm install sharp`)

#### Usage

Run the script from the project root:

```bash
npm install sharp
node scripts/generate-icons.js
```

#### What it does

1. Takes the non-transparent logo file as input
2. Generates icons in various sizes (16px to 512px)
3. Creates a favicon.ico file
4. Creates logo192.png and logo512.png for PWA support
5. Places all files in the appropriate directories

#### Output

The script outputs files to:
- `frontend/public/assets/images/logos/icons/` - All size variations
- `frontend/public/assets/images/logos/` - favicon.ico, logo192.png, and logo512.png

After running this script, the application will use the new VetSphere favicon and app icons.

## Adding New Scripts

When adding new utility scripts:

1. Place the script in this directory
2. Use descriptive naming that indicates the script's purpose
3. Include detailed comments in the script
4. Update this README with information about the script
5. Make the script executable if necessary (`chmod +x script.sh`) 