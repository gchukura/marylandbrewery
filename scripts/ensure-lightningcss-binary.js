#!/usr/bin/env node

/**
 * Ensures lightningcss native binary is installed
 * This script checks for the binary and forces reinstall if missing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const lightningcssPath = path.join(__dirname, '..', 'node_modules', 'lightningcss');

// Check for Linux x64 binary (Vercel build environment)
const linuxBinPath = path.join(lightningcssPath, 'lightningcss.linux-x64-gnu.node');

// Also check for other common binaries
const possibleBinaries = [
  'lightningcss.linux-x64-gnu.node',
  'lightningcss.darwin-x64.node',
  'lightningcss.darwin-arm64.node',
  'lightningcss.win32-x64-msvc.node',
];

let binaryExists = false;
for (const binName of possibleBinaries) {
  const binPath = path.join(lightningcssPath, binName);
  if (fs.existsSync(binPath)) {
    binaryExists = true;
    console.log(`✓ Found binary: ${binName}`);
    break;
  }
}

if (!binaryExists) {
  console.log('⚠ Binary missing, forcing reinstall of lightningcss...');
  try {
    // Force reinstall to ensure binary is downloaded
    execSync('npm install lightningcss --force', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✓ Force install completed');
  } catch (error) {
    console.log('⚠ Force install failed, trying rebuild...');
    try {
      execSync('npm rebuild lightningcss --update-binary', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      });
      console.log('✓ Rebuild completed');
    } catch (rebuildError) {
      console.log('⚠ Rebuild also failed, but continuing...');
      // Don't fail the build - let it try to continue
    }
  }
} else {
  console.log('✓ lightningcss binary already exists');
}

