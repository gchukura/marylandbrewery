#!/usr/bin/env node

/**
 * Ensures Tailwind CSS v4 native binaries are installed
 * Checks for both lightningcss and @tailwindcss/oxide native bindings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootPath = path.join(__dirname, '..');
const nodeModulesPath = path.join(rootPath, 'node_modules');

// Check for lightningcss binary
const lightningcssPath = path.join(nodeModulesPath, 'lightningcss');
const lightningcssBinaries = [
  'lightningcss.linux-x64-gnu.node',
  'lightningcss.darwin-x64.node',
  'lightningcss.darwin-arm64.node',
  'lightningcss.win32-x64-msvc.node',
];

// Check for @tailwindcss/oxide native binding
const oxidePath = path.join(nodeModulesPath, '@tailwindcss', 'oxide');
const oxideBinaries = [
  '@tailwindcss/oxide-linux-x64-gnu',
  '@tailwindcss/oxide-darwin-x64',
  '@tailwindcss/oxide-darwin-arm64',
  '@tailwindcss/oxide-win32-x64-msvc',
];

let lightningcssExists = false;
for (const binName of lightningcssBinaries) {
  const binPath = path.join(lightningcssPath, binName);
  if (fs.existsSync(binPath)) {
    lightningcssExists = true;
    console.log(`✓ Found lightningcss binary: ${binName}`);
    break;
  }
}

let oxideExists = false;
// Check if @tailwindcss/oxide package exists and has native bindings
if (fs.existsSync(oxidePath)) {
  // Check for platform-specific oxide packages
  for (const binName of oxideBinaries) {
    const binPackagePath = path.join(nodeModulesPath, binName);
    if (fs.existsSync(binPackagePath)) {
      oxideExists = true;
      console.log(`✓ Found @tailwindcss/oxide binary: ${binName}`);
      break;
    }
  }
}

let needsReinstall = false;

if (!lightningcssExists) {
  console.log('⚠ lightningcss binary missing');
  needsReinstall = true;
}

if (!oxideExists) {
  console.log('⚠ @tailwindcss/oxide native binding missing');
  needsReinstall = true;
}

if (needsReinstall) {
  console.log('⚠ Native binaries missing, forcing reinstall of Tailwind CSS packages...');
  try {
    // Force reinstall to ensure all native binaries are downloaded
    execSync('npm install @tailwindcss/postcss tailwindcss lightningcss --force', {
      stdio: 'inherit',
      cwd: rootPath,
    });
    console.log('✓ Force install completed');
  } catch (error) {
    console.log('⚠ Force install failed, trying rebuild...');
    try {
      execSync('npm rebuild @tailwindcss/oxide lightningcss --update-binary', {
        stdio: 'inherit',
        cwd: rootPath,
      });
      console.log('✓ Rebuild completed');
    } catch (rebuildError) {
      console.log('⚠ Rebuild also failed, but continuing...');
      // Don't fail the build - let it try to continue
    }
  }
} else {
  console.log('✓ All Tailwind CSS native binaries exist');
}

