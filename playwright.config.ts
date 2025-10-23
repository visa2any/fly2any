import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

/**
 * Playwright configuration for fly2any-fresh Next.js project
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Global timeout for each test
  timeout: 30 * 1000,

  // Directory where tests are located
  testDir: path.join(__dirname, 'e2e'),

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Output directory for test results
  outputDir: 'test-results/',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Configure reporters
  reporter: [
    ['html'],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for page.goto('/')
    baseURL,

    // Collect trace when retrying failed tests
    trace: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording on first retry
    video: 'retain-on-failure',
  },

  // Configure webServer to start Next.js automatically
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  // Configure browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to enable Firefox and WebKit
    // Install with: npx playwright install firefox webkit --with-deps

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
