// build-frontend.js - Build script for TaxSyncQC frontend
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, copyFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

async function build() {
  try {
    console.log('Building TaxSyncQC frontend...');
    
    // Create dist directory
    await mkdir(join(__dirname, 'dist'), { recursive: true });
    
    // Copy static files
    await copyFile(join(__dirname, 'index.html'), join(__dirname, 'dist', 'index.html'));
    
    console.log('Build completed successfully!');
    console.log('Files are available in the /dist folder');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();