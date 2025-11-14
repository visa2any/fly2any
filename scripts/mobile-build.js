#!/usr/bin/env node

/**
 * Mobile Build Script - PROPER IMPLEMENTATION
 *
 * Builds the Next.js app for mobile (static export) by temporarily excluding API routes.
 * This is the CORRECT architectural approach for Capacitor apps.
 *
 * How it works:
 * - Temporarily renames app/api to app/_api_temp (excludes from Next.js routing)
 * - Uses MOBILE_BUILD=true environment variable
 * - next.config.mjs applies mobile-specific config (static export)
 * - Renames app/_api_temp back to app/api after build
 * - Mobile apps call the production API at fly2any-fresh.vercel.app
 *
 * Architecture:
 * - Web: SSR with API routes hosted on Vercel
 * - Mobile: Static export that calls web API over HTTPS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const apiDir = path.join(projectRoot, 'app', 'api');
const tempApiDir = path.join(projectRoot, 'app', '_api_temp');
const adminDir = path.join(projectRoot, 'app', 'admin');
const tempAdminDir = path.join(projectRoot, 'app', '_admin_temp');
const accountDir = path.join(projectRoot, 'app', 'account');
const tempAccountDir = path.join(projectRoot, 'app', '_account_temp');

console.log('📱 Fly2Any Mobile Build - Production Architecture\n');

console.log('🏗️  Building mobile app with static export...');
console.log('   • API routes: Temporarily excluded (renamed to _api_temp)');
console.log('   • Admin pages: Temporarily excluded (renamed to _admin_temp)');
console.log('   • Account pages: Temporarily excluded (renamed to _account_temp)');
console.log('   • API calls: Will target production web API');
console.log('   • Build type: Static HTML/CSS/JS for Capacitor\n');

let apiDirRenamed = false;
let adminDirRenamed = false;
let accountDirRenamed = false;

try {
  // Step 1: Temporarily rename API and Admin directories to exclude them from Next.js routing
  if (fs.existsSync(apiDir)) {
    console.log('   [1/4] Temporarily excluding API routes from build...');
    fs.renameSync(apiDir, tempApiDir);
    apiDirRenamed = true;
    console.log('   ✓ API routes excluded\n');
  }

  if (fs.existsSync(adminDir)) {
    console.log('   [2/5] Temporarily excluding Admin pages from build...');
    fs.renameSync(adminDir, tempAdminDir);
    adminDirRenamed = true;
    console.log('   ✓ Admin pages excluded\n');
  }

  if (fs.existsSync(accountDir)) {
    console.log('   [3/5] Temporarily excluding Account pages from build...');
    fs.renameSync(accountDir, tempAccountDir);
    accountDirRenamed = true;
    console.log('   ✓ Account pages excluded\n');
  }

  // Step 2: Build for mobile using environment variable
  console.log('   [4/5] Building Next.js app with static export...');
  execSync('cross-env MOBILE_BUILD=true next build', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      MOBILE_BUILD: 'true',
    },
  });
  console.log('   ✓ Build complete\n');

  // Step 3: Restore API and Admin directories
  if (apiDirRenamed) {
    console.log('   [4/4] Restoring API routes...');
    fs.renameSync(tempApiDir, apiDir);
    apiDirRenamed = false;
    console.log('   ✓ API routes restored');
  }

  if (adminDirRenamed) {
    console.log('   [5/5] Restoring Admin pages...');
    fs.renameSync(tempAdminDir, adminDir);
    adminDirRenamed = false;
    console.log('   ✓ Admin pages restored');
  }

  if (accountDirRenamed) {
    console.log('   [5/5] Restoring Account pages...');
    fs.renameSync(tempAccountDir, accountDir);
    accountDirRenamed = false;
    console.log('   ✓ Account pages restored\n');
  }

  console.log('✅ Mobile build complete!');
  console.log('📂 Output directory: out/\n');
  console.log('📊 Build Summary:');
  console.log('   ✓ Static HTML pages generated');
  console.log('   ✓ Assets optimized for mobile');
  console.log('   ✓ API routes excluded (calls web API)');
  console.log('   ✓ Admin pages excluded (web-only feature)');
  console.log('   ✓ Account pages excluded (auth handled client-side)');
  console.log('   ✓ Ready for Capacitor sync\n');
  console.log('💡 Next steps:');
  console.log('   - Run "npm run mobile:sync" to sync with native projects');
  console.log('   - Or run "npm run mobile:ios" to open in Xcode');
  console.log('   - Or run "npm run mobile:android" to open in Android Studio\n');
} catch (error) {
  // Restore API directory if build failed
  if (apiDirRenamed && fs.existsSync(tempApiDir)) {
    console.error('\n⚠️  Restoring API routes after build failure...');
    try {
      fs.renameSync(tempApiDir, apiDir);
      console.error('   ✓ API routes restored');
    } catch (restoreError) {
      console.error('   ❌ Failed to restore API routes!');
      console.error('   Manual action required: Rename app/_api_temp back to app/api');
    }
  }

  // Restore Admin directory if build failed
  if (adminDirRenamed && fs.existsSync(tempAdminDir)) {
    console.error('⚠️  Restoring Admin pages after build failure...');
    try {
      fs.renameSync(tempAdminDir, adminDir);
      console.error('   ✓ Admin pages restored');
    } catch (restoreError) {
      console.error('   ❌ Failed to restore Admin pages!');
      console.error('   Manual action required: Rename app/_admin_temp back to app/admin');
    }
  }

  // Restore Account directory if build failed
  if (accountDirRenamed && fs.existsSync(tempAccountDir)) {
    console.error('⚠️  Restoring Account pages after build failure...');
    try {
      fs.renameSync(tempAccountDir, accountDir);
      console.error('   ✓ Account pages restored\n');
    } catch (restoreError) {
      console.error('   ❌ Failed to restore Account pages!');
      console.error('   Manual action required: Rename app/_account_temp back to app/account\n');
    }
  }

  console.error('❌ Build failed!');
  console.error('Error:', error.message);
  console.error('\nTroubleshooting:');
  console.error('   1. Check that all components import types from @/lib/types');
  console.error('   2. Ensure no direct API route imports in components');
  console.error('   3. Verify MOBILE_BUILD=true is set');
  console.error('   4. Check next.config.mjs mobile build configuration');
  console.error('   5. Ensure app/api directory was restored (should not be _api_temp)');
  console.error('   6. Ensure app/admin directory was restored (should not be _admin_temp)');
  console.error('   7. Ensure app/account directory was restored (should not be _account_temp)\n');
  process.exit(1);
}
