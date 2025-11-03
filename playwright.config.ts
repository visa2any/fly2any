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
  // Global timeout for each test (increased for API calls)
  timeout: 60 * 1000,

  // Test match patterns - use both e2e and tests/e2e directories
  testDir: path.join(__dirname, 'tests/e2e'),
  testMatch: '**/*.spec.ts',

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Workers for parallel execution
  workers: process.env.CI ? 2 : undefined,

  // Output directory for test results
  outputDir: 'test-results/',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Configure reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
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

    // Maximum time each action can take
    actionTimeout: 15000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Accept downloads
    acceptDownloads: true,

    // Emulate media features
    colorScheme: 'light',

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // Configure webServer to start Next.js automatically
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Configure browser projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet viewport
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },
  ],
});
