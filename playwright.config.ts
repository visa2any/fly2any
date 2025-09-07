import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration for Comprehensive Authentication Testing
 * - Supports multiple browsers and devices
 * - Captures screenshots and videos on failures
 * - Network request monitoring
 * - Performance metrics collection
 */

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Timeout configurations
  timeout: 30000,
  expect: { timeout: 10000 },
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporting configuration
  reporter: [
    ['html', { outputFolder: 'tests/reports/html' }],
    ['json', { outputFile: 'tests/reports/results.json' }],
    ['junit', { outputFile: 'tests/reports/junit.xml' }],
    ['line'],
    ['./tests/utils/custom-reporter.ts']
  ],
  
  // Global test options
  use: {
    // Base URL for testing
    baseURL: 'http://localhost:3000',
    
    // Trace collection
    trace: 'on-first-retry',
    
    // Screenshot settings
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Network monitoring
    launchOptions: {
      slowMo: process.env.DEBUG ? 100 : 0,
    },
    
    // Global timeout
    actionTimeout: 10000,
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // User agent
    userAgent: 'Playwright-Auth-Monitor/1.0',
  },
  
  // Output directories
  outputDir: 'tests/reports/artifacts',
  
  // Global setup and teardown
  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',
  
  // Projects for different browsers and scenarios
  projects: [
    // Setup project for authentication state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Chrome tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    
    // Firefox tests
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    
    // Safari tests (if on macOS)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    
    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    
    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
    
    // Authentication-specific tests with authenticated state
    {
      name: 'authenticated-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/fixtures/auth-state.json'
      },
      dependencies: ['setup'],
      testMatch: /.*\.authenticated\.spec\.ts/,
    },
    
    // Performance monitoring tests
    {
      name: 'performance-monitoring',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use Chrome DevTools
      },
      dependencies: ['setup'],
      testMatch: /.*\.performance\.spec\.ts/,
    },
    
    // API monitoring tests
    {
      name: 'api-monitoring',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
  
  // Local dev server setup
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'development',
    },
  },
});