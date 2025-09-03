const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/ux',
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Test configuration
  expect: {
    // Visual comparisons timeout
    timeout: 10000,
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/ux-reports' }],
    ['json', { outputFile: 'test-results/ux-results.json' }],
    ['junit', { outputFile: 'test-results/ux-junit.xml' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Collect screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Viewport settings for consistent testing
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Permissions
    permissions: [],
    
    // Geolocation (optional)
    geolocation: { longitude: -74.006, latitude: 40.7128 }, // New York
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Configure projects for major browsers and devices
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--enable-gpu-rasterization',
            '--enable-oop-rasterization',
            '--enable-zero-copy'
          ]
        }
      },
    },
    
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true
      },
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        isMobile: true,
        hasTouch: true
      },
    },

    // Tablet testing
    {
      name: 'Tablet iPad',
      use: { 
        ...devices['iPad Pro'],
        isMobile: true,
        hasTouch: true
      },
    },

    // Performance testing setup
    {
      name: 'Performance Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--enable-gpu-benchmarking',
            '--enable-logging',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ]
        }
      },
      testMatch: '**/*performance*.spec.js'
    },

    // Accessibility testing
    {
      name: 'Accessibility Testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // High contrast mode simulation
        colorScheme: 'dark'
      },
      testMatch: '**/*accessibility*.spec.js'
    }
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/ux/global-setup.js'),
  globalTeardown: require.resolve('./tests/ux/global-teardown.js'),
});