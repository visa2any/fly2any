const { chromium } = require('playwright');

// Test credentials
const VALID_CREDENTIALS = {
  email: 'admin@fly2any.com',
  password: 'fly2any2024!'
};

const INVALID_CREDENTIALS = {
  email: 'wrong@example.com',
  password: 'wrongpassword'
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const icons = {
    info: '📌',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪',
    check: '🔍'
  };
  
  const icon = icons[type] || '📌';
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red :
                type === 'warning' ? colors.yellow :
                type === 'test' ? colors.cyan : colors.blue;
  
  console.log(`${color}[${timestamp}] ${icon} ${message}${colors.reset}`);
}

async function testLoginFlow() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  let testResults = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    log('STARTING COMPREHENSIVE LOGIN FLOW TEST', 'test');
    console.log('═'.repeat(60));

    // Test 1: Access login page
    log('Test 1: Accessing login page...', 'check');
    await page.goto('http://localhost:3000/admin/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loginFormVisible = await page.isVisible('.admin-login-form');
    if (loginFormVisible) {
      testResults.passed.push('Login page loads successfully');
      log('Login page loaded successfully', 'success');
    } else {
      testResults.failed.push('Login page failed to load');
      log('Login page failed to load', 'error');
    }

    // Test 2: UI Elements Check
    log('Test 2: Checking UI elements...', 'check');
    const elements = {
      'Email input': 'input[name="email"]',
      'Password input': 'input[name="password"]',
      'Submit button': 'button[type="submit"]',
      'Logo': '.admin-login-logo-icon',
      'Title': '.admin-login-title'
    };

    for (const [name, selector] of Object.entries(elements)) {
      const isVisible = await page.isVisible(selector);
      if (isVisible) {
        testResults.passed.push(`${name} is visible`);
      } else {
        testResults.failed.push(`${name} is missing`);
        log(`${name} is missing`, 'error');
      }
    }
    log('UI elements check completed', 'success');

    // Test 3: Invalid credentials
    log('Test 3: Testing invalid credentials...', 'check');
    await page.fill('input[name="email"]', INVALID_CREDENTIALS.email);
    await page.fill('input[name="password"]', INVALID_CREDENTIALS.password);
    
    // Click submit and wait for response
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForTimeout(2000) // Wait for error message
    ]);

    const errorVisible = await page.isVisible('.admin-login-error');
    if (errorVisible) {
      const errorText = await page.textContent('.admin-login-error');
      testResults.passed.push('Invalid credentials show error message');
      log(`Error message displayed: ${errorText}`, 'success');
    } else {
      testResults.warnings.push('No error message for invalid credentials');
      log('No error message shown for invalid credentials', 'warning');
    }

    // Check we're still on login page
    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      testResults.passed.push('Stays on login page with invalid credentials');
      log('Correctly stayed on login page', 'success');
    } else {
      testResults.failed.push('Incorrectly redirected with invalid credentials');
      log('Incorrectly redirected with invalid credentials', 'error');
    }

    // Test 4: Empty form submission
    log('Test 4: Testing empty form submission...', 'check');
    await page.reload();
    await page.waitForSelector('.admin-login-form');
    
    const submitButton = await page.$('button[type="submit"]');
    const isDisabled = await submitButton.evaluate(el => el.disabled);
    
    if (isDisabled) {
      testResults.passed.push('Submit button disabled when form is empty');
      log('Submit button correctly disabled for empty form', 'success');
    } else {
      testResults.warnings.push('Submit button not disabled for empty form');
      log('Submit button should be disabled for empty form', 'warning');
    }

    // Test 5: Valid credentials
    log('Test 5: Testing valid credentials...', 'check');
    await page.fill('input[name="email"]', VALID_CREDENTIALS.email);
    await page.fill('input[name="password"]', VALID_CREDENTIALS.password);
    
    // Take screenshot before login
    await page.screenshot({ 
      path: 'login-before-submit.png',
      fullPage: true 
    });

    // Click submit and wait for navigation
    log('Submitting login form...', 'info');
    
    try {
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ 
          timeout: 10000,
          waitUntil: 'networkidle' 
        }).catch(() => {
          // Fallback: just wait for URL change
          return page.waitForTimeout(3000);
        })
      ]);
    } catch (navError) {
      log('Navigation timeout, checking current state...', 'warning');
    }

    await page.waitForTimeout(2000); // Additional wait for any redirects

    const afterLoginUrl = page.url();
    log(`Current URL after login: ${afterLoginUrl}`, 'info');

    if (!afterLoginUrl.includes('/admin/login')) {
      testResults.passed.push('Successfully redirected after valid login');
      log('Login successful - redirected to admin area', 'success');
      
      // Take screenshot of admin page
      await page.screenshot({ 
        path: 'admin-dashboard-after-login.png',
        fullPage: true 
      });
      
      // Test 6: Check for session/auth elements
      log('Test 6: Checking for authenticated state...', 'check');
      
      // Check for common admin dashboard elements
      const adminElements = [
        '.admin-header',
        '.admin-sidebar',
        '[href*="logout"]',
        '[href*="signout"]',
        'button:has-text("Logout")',
        'button:has-text("Sign Out")'
      ];
      
      let foundAdminElement = false;
      for (const selector of adminElements) {
        try {
          const exists = await page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
          if (exists) {
            foundAdminElement = true;
            testResults.passed.push(`Found admin element: ${selector}`);
            log(`Found admin element: ${selector}`, 'success');
            break;
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }
      
      if (!foundAdminElement) {
        testResults.warnings.push('No admin dashboard elements found');
        log('Could not find typical admin dashboard elements', 'warning');
      }

      // Test 7: Protected route access
      log('Test 7: Testing protected route access...', 'check');
      await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
      
      const onAdminPage = !page.url().includes('/login');
      if (onAdminPage) {
        testResults.passed.push('Can access protected admin routes when logged in');
        log('Protected route access working', 'success');
      } else {
        testResults.failed.push('Cannot access protected routes after login');
        log('Protected route access failed', 'error');
      }

      // Test 8: Session persistence
      log('Test 8: Testing session persistence...', 'check');
      
      // Create new page in same context (shares cookies/session)
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
      
      const stillLoggedIn = !newPage.url().includes('/login');
      if (stillLoggedIn) {
        testResults.passed.push('Session persists across page loads');
        log('Session persistence working', 'success');
      } else {
        testResults.failed.push('Session not persisting');
        log('Session not persisting properly', 'error');
      }
      await newPage.close();

      // Test 9: Logout functionality
      log('Test 9: Testing logout functionality...', 'check');
      
      // Try to find and click logout
      const logoutSelectors = [
        'button:has-text("Logout")',
        'button:has-text("Sign Out")',
        'a:has-text("Logout")',
        'a:has-text("Sign Out")',
        '[href*="logout"]',
        '[href*="signout"]'
      ];
      
      let logoutFound = false;
      for (const selector of logoutSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            logoutFound = true;
            log(`Clicked logout: ${selector}`, 'info');
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continue trying other selectors
        }
      }
      
      if (logoutFound) {
        const afterLogoutUrl = page.url();
        if (afterLogoutUrl.includes('/login') || afterLogoutUrl === 'http://localhost:3000/') {
          testResults.passed.push('Logout functionality works');
          log('Successfully logged out', 'success');
        } else {
          testResults.warnings.push('Logout clicked but redirect unclear');
          log(`After logout URL: ${afterLogoutUrl}`, 'warning');
        }
      } else {
        testResults.warnings.push('Could not find logout button');
        log('Logout button not found', 'warning');
      }
      
    } else {
      testResults.failed.push('Login with valid credentials failed');
      log('Failed to login with valid credentials', 'error');
      
      // Check for any error messages
      const errorVisible = await page.isVisible('.admin-login-error');
      if (errorVisible) {
        const errorText = await page.textContent('.admin-login-error');
        log(`Error shown: ${errorText}`, 'error');
      }
    }

    // Test 10: Unauthorized access attempt
    log('Test 10: Testing unauthorized access...', 'check');
    
    // Clear cookies to simulate logged out state
    await context.clearCookies();
    
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    const redirectedToLogin = page.url().includes('/login');
    
    if (redirectedToLogin) {
      testResults.passed.push('Unauthorized access redirects to login');
      log('Unauthorized access correctly redirected to login', 'success');
    } else {
      testResults.failed.push('Unauthorized access not redirecting to login');
      log('Unauthorized access should redirect to login', 'error');
    }

  } catch (error) {
    testResults.failed.push(`Test execution error: ${error.message}`);
    log(`Test execution error: ${error.message}`, 'error');
    console.error(error);
  } finally {
    // Generate final report
    console.log('\n' + '═'.repeat(60));
    log('LOGIN FLOW TEST RESULTS', 'test');
    console.log('═'.repeat(60));
    
    // Summary
    const totalTests = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
    const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`\n${colors.bright}📊 TEST SUMMARY${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${testResults.passed.length}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${testResults.failed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings.length}${colors.reset}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);
    
    // Detailed results
    if (testResults.passed.length > 0) {
      console.log(`${colors.green}${colors.bright}PASSED TESTS:${colors.reset}`);
      testResults.passed.forEach(test => console.log(`  ${colors.green}✓${colors.reset} ${test}`));
    }
    
    if (testResults.failed.length > 0) {
      console.log(`\n${colors.red}${colors.bright}FAILED TESTS:${colors.reset}`);
      testResults.failed.forEach(test => console.log(`  ${colors.red}✗${colors.reset} ${test}`));
    }
    
    if (testResults.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bright}WARNINGS:${colors.reset}`);
      testResults.warnings.forEach(test => console.log(`  ${colors.yellow}⚠${colors.reset} ${test}`));
    }
    
    // Overall status
    console.log('\n' + '═'.repeat(60));
    if (testResults.failed.length === 0 && testResults.warnings.length <= 2) {
      console.log(`${colors.green}${colors.bright}🎉 LOGIN FLOW IS WORKING PROPERLY!${colors.reset}`);
    } else if (testResults.failed.length === 0) {
      console.log(`${colors.yellow}${colors.bright}⚠️  LOGIN FLOW WORKS WITH SOME WARNINGS${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bright}❌ LOGIN FLOW HAS ISSUES THAT NEED FIXING${colors.reset}`);
    }
    console.log('═'.repeat(60));
    
    await browser.close();
    
    // Exit with appropriate code
    process.exit(testResults.failed.length > 0 ? 1 : 0);
  }
}

// Run the test
testLoginFlow().catch(console.error);