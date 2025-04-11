/**
 * Script to update all documentation pages with the new black and white theme
 * 
 * This script can be run using Node.js to update all the HTML files in the docs/website directory
 * with consistent styling based on the templates we've created.
 * 
 * Usage: node update-pages-styling.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Get the absolute path to the docs/website directory
const websiteDir = path.resolve(__dirname, '..');

/**
 * Updates HTML files recursively in a directory
 */
async function updateFilesInDirectory(dir) {
  try {
    const files = await readdirAsync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await statAsync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await updateFilesInDirectory(filePath);
      } else if (file.endsWith('.html')) {
        // Process HTML files
        await updateHtmlFile(filePath);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dir}:`, err);
  }
}

/**
 * Updates a single HTML file with the new styling
 */
async function updateHtmlFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    let content = await readFileAsync(filePath, 'utf8');
    
    // Add theme-toggle.js script reference if not present
    if (!content.includes('theme-toggle.js')) {
      content = content.replace(
        /<\/head>/,
        '    <script defer src="' + getRelativePath(filePath, 'js/theme-toggle.js') + '"></script>\n</head>'
      );
    }
    
    // Add body class for dark mode support
    if (!content.includes('class="bg-white dark:bg-gray-900')) {
      content = content.replace(
        /<body([^>]*)>/,
        '<body$1 class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">'
      );
    }
    
    // Update container div
    content = content.replace(
      /<div class="docs-container">/,
      '<div class="docs-container max-w-[1600px] mx-auto flex flex-col md:flex-row min-h-screen">'
    );
    
    // Update sidebar styling
    content = content.replace(
      /<aside class="sidebar">/,
      '<aside class="sidebar w-full md:w-72 flex-shrink-0 h-auto md:h-screen overflow-y-auto bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200">'
    );
    
    // Update sidebar header
    content = content.replace(
      /<div class="sidebar-header">/,
      '<div class="sidebar-header p-6 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">'
    );
    
    // Update logo class
    content = content.replace(
      /class="logo"/,
      'class="logo w-10 h-10"'
    );
    
    // Update search box
    content = content.replace(
      /<div class="sidebar-search">([\s\S]*?)<\/div>/,
      '<div class="sidebar-search p-4">\n                <div class="relative">\n                    <input type="text" id="search-input" placeholder="Search documentation..." class="w-full px-4 py-2 pl-10 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">\n                    <i class="fas fa-search search-icon absolute left-3 top-3 text-gray-400"></i>\n                </div>\n            </div>'
    );
    
    // Update sidebar nav
    content = content.replace(
      /<nav class="sidebar-nav">/,
      '<nav class="sidebar-nav p-4">'
    );
    
    // Update the content header
    content = content.replace(
      /<div class="content-header">/,
      '<div class="content-header sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">'
    );
    
    // Update sidebar toggle button
    content = content.replace(
      /<button id="sidebar-toggle" class="sidebar-toggle">/,
      '<button id="sidebar-toggle" class="sidebar-toggle md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">'
    );
    
    // Update header links
    content = content.replace(
      /<div class="header-links">/,
      '<div class="header-links flex items-center space-x-4">'
    );
    
    // Replace theme toggle with button that shows sun/moon icons
    content = content.replace(
      /<a href="#" id="theme-toggle">[\s\S]*?<\/a>/,
      '<button id="theme-toggle" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">\n                        <i class="fas fa-moon dark:hidden"></i>\n                        <i class="fas fa-sun hidden dark:block"></i>\n                    </button>'
    );
    
    // Update content body
    content = content.replace(
      /<div class="content-body">/,
      '<div class="content-body max-w-4xl mx-auto px-6 py-10">'
    );
    
    // Update main heading
    content = content.replace(
      /<h1>(.*?)<\/h1>/,
      '<h1 class="text-4xl font-bold mb-6 tracking-tight">$1</h1>'
    );
    
    // Update footer
    content = content.replace(
      /<footer class="content-footer">[\s\S]*?<\/footer>/,
      '<footer class="border-t border-gray-200 dark:border-gray-700 mt-12 py-8 px-6">\n                <div class="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">\n                    <div class="mb-4 md:mb-0">\n                        <p class="text-sm text-gray-500 dark:text-gray-400">© 2023 PetSphere. All rights reserved.</p>\n                    </div>\n                    <div class="flex space-x-6">\n                        <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Privacy Policy</a>\n                        <a href="#" class="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Terms of Service</a>\n                        <a href="https://github.com/yourusername/PetSphere" class="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">GitHub</a>\n                    </div>\n                </div>\n            </footer>'
    );
    
    // Replace main.js script with inline sidebar toggle script
    content = content.replace(
      /<script src="(.*?)main.js"><\/script>/,
      '<script>\n        // Toggle sidebar\n        const sidebarToggle = document.getElementById(\'sidebar-toggle\');\n        const sidebar = document.querySelector(\'.sidebar\');\n        sidebarToggle.addEventListener(\'click\', () => {\n            sidebar.classList.toggle(\'hidden\');\n        });\n    </script>'
    );
    
    // Write the updated content back to the file
    await writeFileAsync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    
  } catch (err) {
    console.error(`Error updating file ${filePath}:`, err);
  }
}

/**
 * Gets the relative path from a file to the target file
 */
function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, websiteDir);
  return path.join(relativePath, toFile).replace(/\\/g, '/');
}

// Main function to run the script
async function main() {
  console.log('Updating documentation pages with black and white theme...');
  
  // Process all files
  await updateFilesInDirectory(websiteDir);
  
  console.log('Finished updating documentation pages!');
}

// Execute the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 