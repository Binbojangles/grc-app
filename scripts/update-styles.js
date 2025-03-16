/**
 * This script updates the style files in the dist directory
 * to ensure the latest styles are being used
 */

const fs = require('fs');
const path = require('path');

// Path to the dist directory
const distDir = path.join(__dirname, '../client/dist/grc-cmmc-client');

async function updateStyles() {
  try {
    console.log('Looking for styles in:', distDir);
    
    // Check if the directory exists
    if (!fs.existsSync(distDir)) {
      console.error('Dist directory does not exist:', distDir);
      return false;
    }
    
    // Read the directory
    const files = fs.readdirSync(distDir);
    
    // Find style files
    const styleFiles = files.filter(file => file.startsWith('styles.') && file.endsWith('.css'));
    console.log('Found style files:', styleFiles);
    
    // Find JavaScript files
    const jsFiles = files.filter(file => file.startsWith('main.') && file.endsWith('.js'));
    console.log('Found JS files:', jsFiles);
    
    // Read index.html to find referenced files
    const indexHtmlPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.error('index.html not found');
      return false;
    }
    
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Find referenced style file
    const styleMatch = indexHtml.match(/href="(styles\.[a-z0-9]+\.css)"/);
    if (!styleMatch) {
      console.error('No style reference found in index.html');
      return false;
    }
    
    const referencedStyle = styleMatch[1];
    console.log('Referenced style file:', referencedStyle);
    
    // Find referenced JS file
    const jsMatch = indexHtml.match(/src="(main\.[a-z0-9]+\.js)"/);
    if (!jsMatch) {
      console.error('No main.js reference found in index.html');
      return false;
    }
    
    const referencedJs = jsMatch[1];
    console.log('Referenced JS file:', referencedJs);
    
    // Find the newest style file
    let newestStyleFile = null;
    let newestStyleTime = 0;
    
    for (const file of styleFiles) {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs > newestStyleTime) {
        newestStyleTime = stats.mtimeMs;
        newestStyleFile = file;
      }
    }
    
    // Find the newest JS file
    let newestJsFile = null;
    let newestJsTime = 0;
    
    for (const file of jsFiles) {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs > newestJsTime) {
        newestJsTime = stats.mtimeMs;
        newestJsFile = file;
      }
    }
    
    // Update style file if needed
    if (newestStyleFile && newestStyleFile !== referencedStyle) {
      console.log(`Copying from ${newestStyleFile} to ${referencedStyle}`);
      
      fs.copyFileSync(
        path.join(distDir, newestStyleFile),
        path.join(distDir, referencedStyle)
      );
      
      console.log('Style file updated successfully!');
    } else {
      console.log('No style update needed');
    }
    
    // Update JS file if needed
    if (newestJsFile && newestJsFile !== referencedJs) {
      console.log(`Copying from ${newestJsFile} to ${referencedJs}`);
      
      fs.copyFileSync(
        path.join(distDir, newestJsFile),
        path.join(distDir, referencedJs)
      );
      
      console.log('JS file updated successfully!');
    } else {
      console.log('No JS update needed');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating styles:', error);
    return false;
  }
}

// Run the update function
updateStyles()
  .then(result => {
    console.log('Update completed successfully:', result);
  })
  .catch(error => {
    console.error('Update failed:', error);
  }); 