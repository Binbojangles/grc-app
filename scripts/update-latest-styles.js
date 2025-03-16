const fs = require('fs');
const path = require('path');

// Path to the dist directory
const distDir = path.join(__dirname, '../client/dist/grc-cmmc-client');

async function findLatestStylesheet() {
  try {
    // Read all files in the dist directory
    const files = await fs.promises.readdir(distDir);
    
    // Filter for style files
    const styleFiles = files.filter(file => file.startsWith('styles.') && file.endsWith('.css'));
    
    // Sort by modification time (newest first)
    const sortedFiles = styleFiles.sort(async (a, b) => {
      const statA = await fs.promises.stat(path.join(distDir, a));
      const statB = await fs.promises.stat(path.join(distDir, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    
    console.log('Found style files:', styleFiles);
    
    // Find the file referenced in index.html
    const indexHtmlPath = path.join(distDir, 'index.html');
    const indexHtml = await fs.promises.readFile(indexHtmlPath, 'utf8');
    
    // Extract the style filename using regex
    const styleMatch = indexHtml.match(/href="(styles\.[a-z0-9]+\.css)"/);
    if (!styleMatch) {
      throw new Error('Could not find style reference in index.html');
    }
    
    const referencedStyleFile = styleMatch[1];
    console.log(`Referenced style file in index.html: ${referencedStyleFile}`);
    
    // Get the newest style file based on create/modified date
    let newestStyleFile = null;
    let newestTime = 0;
    
    for (const file of styleFiles) {
      if (file === referencedStyleFile) continue; // Skip the file already referenced
      
      const stat = await fs.promises.stat(path.join(distDir, file));
      if (stat.mtime.getTime() > newestTime) {
        newestTime = stat.mtime.getTime();
        newestStyleFile = file;
      }
    }
    
    if (newestStyleFile && newestStyleFile !== referencedStyleFile) {
      console.log(`Found newer style file: ${newestStyleFile}`);
      
      // Copy the content of the newest file to the referenced file
      const newestContent = await fs.promises.readFile(path.join(distDir, newestStyleFile), 'utf8');
      await fs.promises.writeFile(path.join(distDir, referencedStyleFile), newestContent, 'utf8');
      
      console.log(`Successfully copied styles from ${newestStyleFile} to ${referencedStyleFile}`);
      return true;
    } else {
      console.log('No newer style file found or referenced file is already the newest.');
      return false;
    }
  } catch (error) {
    console.error('Error updating styles:', error);
    return false;
  }
}

findLatestStylesheet(); 