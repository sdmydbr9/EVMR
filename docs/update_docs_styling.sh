#!/bin/bash

# Script to update all documentation pages with the black and white theme
# This will run the Node.js script and process all HTML files

echo "Starting documentation styling update..."

# Change to the website directory
cd website

# Run the Node.js script
node js/update-pages-styling.js

echo "Documentation styling update complete!" 