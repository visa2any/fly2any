import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for Playwright Authentication Testing
 * Prepares the test environment and ensures the application is running
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 [GLOBAL-SETUP] Starting Playwright authentication test environment setup...');
  
  const startTime = Date.now();
  
  try {
    // Check if application is accessible
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('🔍 [GLOBAL-SETUP] Checking application availability...');
    
    // Try to access the application
    try {
      await page.goto('http://localhost:3000', { timeout: 30000 });
      console.log('✅ [GLOBAL-SETUP] Application is accessible at http://localhost:3000');
    } catch (error) {
      console.error('❌ [GLOBAL-SETUP] Application not accessible:', error.message);
      throw new Error('Application is not running. Please start the development server with "npm run dev"');
    }
    
    // Verify login page is accessible
    try {
      await page.goto('http://localhost:3000/admin/login', { timeout: 15000 });
      await page.waitForSelector('form.admin-login-form', { timeout: 10000 });
      console.log('✅ [GLOBAL-SETUP] Login page is accessible and functional');
    } catch (error) {
      console.error('❌ [GLOBAL-SETUP] Login page not accessible:', error.message);
      throw new Error('Login page is not functioning properly');
    }
    
    // Test basic authentication endpoint
    try {
      const response = await page.request.get('http://localhost:3000/api/auth/csrf');
      console.log(`✅ [GLOBAL-SETUP] NextAuth CSRF endpoint responding: ${response.status()}`);
    } catch (error) {
      console.warn('⚠️ [GLOBAL-SETUP] NextAuth CSRF endpoint check failed (may not be critical):', error.message);
    }
    
    await browser.close();
    
    const setupTime = Date.now() - startTime;
    console.log(`✅ [GLOBAL-SETUP] Environment setup completed successfully in ${setupTime}ms`);
    
    // Create test artifacts directory
    const fs = require('fs');
    const path = require('path');
    
    const artifactsDir = path.join(__dirname, '../reports/artifacts');
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
      console.log('📁 [GLOBAL-SETUP] Created artifacts directory');
    }
    
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log('📁 [GLOBAL-SETUP] Created reports directory');
    }
    
    // Write setup info
    const setupInfo = {
      setupTime: new Date(),
      applicationUrl: 'http://localhost:3000',
      loginUrl: 'http://localhost:3000/admin/login',
      setupDuration: setupTime,
      playwrightVersion: require('@playwright/test/package.json').version,
      nodeVersion: process.version,
      testCredentials: {
        email: 'admin@fly2any.com',
        password: 'fly2any2024!'
      }
    };
    
    fs.writeFileSync(
      path.join(reportsDir, 'setup-info.json'),
      JSON.stringify(setupInfo, null, 2)
    );
    
    console.log('📝 [GLOBAL-SETUP] Setup information saved to reports/setup-info.json');
    
  } catch (error) {
    console.error('❌ [GLOBAL-SETUP] Setup failed:', error.message);
    throw error;
  }
}

export default globalSetup;