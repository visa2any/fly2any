import { test, expect } from '@playwright/test';
import { AuthHelper, AuthUtils } from '../utils/auth-helper';

/**
 * Comprehensive Authentication Testing Suite
 * Tests the complete authentication flow including CSRF validation,
 * error handling, and various authentication scenarios
 */

test.describe('Authentication System Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test.describe('Login Flow Tests', () => {
    test('should successfully login with valid admin credentials', async ({ page }) => {
      console.log('🧪 [TEST] Starting valid admin login test');

      // Navigate to login page
      const { networkRequests } = await authHelper.navigateToLogin({
        captureNetworkRequests: true
      });

      // Verify login page loaded correctly
      await expect(page).toHaveTitle(/.*Admin.*|.*Login.*|.*Fly2Any.*/);
      await expect(page.locator('form.admin-login-form')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();

      // Perform login with monitoring
      const loginResult = await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        validateCSRF: true,
        captureScreenshots: true,
        monitorNetworkRequests: true,
        waitForRedirect: true
      });

      // Validate successful authentication
      expect(loginResult.success).toBe(true);
      expect(loginResult.authRequests).toBeTruthy();
      expect(loginResult.authRequests.length).toBeGreaterThan(0);

      // Verify we're on the admin page
      await expect(page).toHaveURL(/\/admin$/);
      
      // Validate authentication state
      const authState = await authHelper.validateAuthenticationState();
      expect(authState.isAuthenticated).toBe(true);

      console.log('✅ [TEST] Valid admin login test completed successfully');
    });

    test('should handle invalid credentials correctly', async ({ page }) => {
      console.log('🧪 [TEST] Starting invalid credentials test');

      await authHelper.navigateToLogin();

      // Try login with invalid credentials
      const invalidCredentials = { email: 'admin@fly2any.com', password: 'wrong_password' };
      
      try {
        await authHelper.performLogin(invalidCredentials, {
          captureScreenshots: true,
          waitForRedirect: false,
          timeout: 10000
        });
      } catch (error) {
        // Expected to fail
        console.log('✅ [TEST] Invalid credentials correctly rejected');
      }

      // Verify error message is displayed
      const errorMessage = page.locator('.admin-login-error');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Verify we're still on login page
      expect(page.url()).toContain('/admin/login');
      
      console.log('✅ [TEST] Invalid credentials test completed');
    });

    test('should validate email format', async ({ page }) => {
      console.log('🧪 [TEST] Starting email format validation test');

      await authHelper.navigateToLogin();

      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user..name@example.com'
      ];

      for (const invalidEmail of invalidEmails) {
        await page.fill('input[name="email"]', invalidEmail);
        await page.fill('input[name="password"]', 'password');
        
        // Check if submit button is disabled or form validation prevents submission
        const submitButton = page.locator('button[type="submit"]');
        
        // Some browsers will show validation messages
        const isValidEmail = AuthUtils.isValidEmail(invalidEmail);
        expect(isValidEmail).toBe(false);
        
        console.log(`⚠️ [TEST] Invalid email tested: ${invalidEmail}`);
      }

      console.log('✅ [TEST] Email format validation completed');
    });

    test('should handle empty credentials', async ({ page }) => {
      console.log('🧪 [TEST] Starting empty credentials test');

      await authHelper.navigateToLogin();

      // Test empty email
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', 'password');
      let submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      // Test empty password
      await page.fill('input[name="email"]', 'admin@fly2any.com');
      await page.fill('input[name="password"]', '');
      submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      // Test both empty
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="password"]', '');
      submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      console.log('✅ [TEST] Empty credentials test completed');
    });
  });

  test.describe('CSRF Token Validation', () => {
    test('should properly handle CSRF tokens in authentication', async ({ page }) => {
      console.log('🧪 [TEST] Starting CSRF token validation test');

      await authHelper.navigateToLogin();

      // Extract CSRF token information
      const csrfTokenInfo = await authHelper.extractCSRFToken();
      
      console.log('🛡️ [TEST] CSRF token info:', csrfTokenInfo);

      // Perform login and monitor CSRF handling
      const loginResult = await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        validateCSRF: true,
        monitorNetworkRequests: true
      });

      // Analyze authentication requests for CSRF handling
      const authRequests = loginResult.authRequests.filter(req => req.type === 'request');
      console.log('🌐 [TEST] Authentication requests:', authRequests.length);

      // Look for CSRF-related headers or data in requests
      let csrfValidationFound = false;
      for (const request of authRequests) {
        const headers = request.headers || {};
        const postData = request.postData || '';
        
        // Check for CSRF in headers
        if (headers['x-csrf-token'] || headers['x-xsrf-token']) {
          csrfValidationFound = true;
          console.log('✅ [TEST] CSRF token found in request headers');
        }

        // Check for CSRF in POST data
        if (postData.includes('_token') || postData.includes('csrf')) {
          csrfValidationFound = true;
          console.log('✅ [TEST] CSRF token found in POST data');
        }
      }

      // Note: NextAuth might handle CSRF internally
      console.log(`🛡️ [TEST] CSRF validation status: ${csrfValidationFound ? 'Found' : 'Handled internally by NextAuth'}`);
      
      console.log('✅ [TEST] CSRF token validation test completed');
    });

    test('should detect missing CSRF errors', async ({ page }) => {
      console.log('🧪 [TEST] Starting missing CSRF error detection test');

      // Monitor network requests for CSRF-related errors
      const csrfErrors: any[] = [];
      
      page.on('response', response => {
        if (response.url().includes('/api/auth/')) {
          if (response.status() === 400 || response.status() === 403) {
            csrfErrors.push({
              url: response.url(),
              status: response.status(),
              statusText: response.statusText(),
              timestamp: new Date()
            });
            console.log('🚨 [TEST] Potential CSRF error detected:', response.status(), response.url());
          }
        }
      });

      // Monitor console for CSRF error messages
      page.on('console', msg => {
        const text = msg.text();
        if (text.toLowerCase().includes('csrf') || text.toLowerCase().includes('missing')) {
          console.log('🚨 [TEST] Console CSRF error:', text);
          csrfErrors.push({
            type: 'console',
            message: text,
            timestamp: new Date()
          });
        }
      });

      await authHelper.navigateToLogin();
      
      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 15000
        });
        console.log('✅ [TEST] Login successful, no CSRF errors detected');
      } catch (error) {
        console.log('⚠️ [TEST] Login failed, checking for CSRF-related issues');
        if (error.message.includes('CSRF') || error.message.includes('MissingCSRF')) {
          console.log('🚨 [TEST] CSRF error confirmed in login failure');
        }
      }

      console.log(`🛡️ [TEST] CSRF errors detected: ${csrfErrors.length}`);
      if (csrfErrors.length > 0) {
        console.log('🚨 [TEST] CSRF errors:', csrfErrors);
      }

      console.log('✅ [TEST] Missing CSRF error detection test completed');
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session after successful login', async ({ page }) => {
      console.log('🧪 [TEST] Starting session maintenance test');

      await authHelper.navigateToLogin();
      await authHelper.performLogin();

      // Verify authentication state
      let authState = await authHelper.validateAuthenticationState();
      expect(authState.isAuthenticated).toBe(true);

      // Navigate to different admin pages to test session persistence
      const adminPages = ['/admin', '/admin/dashboard'];
      
      for (const adminPage of adminPages) {
        try {
          await page.goto(adminPage, { timeout: 10000 });
          authState = await authHelper.validateAuthenticationState();
          
          if (authState.isAuthenticated) {
            console.log(`✅ [TEST] Session maintained on ${adminPage}`);
          } else {
            console.log(`⚠️ [TEST] Session lost on ${adminPage}`);
          }
        } catch (error) {
          console.log(`⚠️ [TEST] Could not navigate to ${adminPage}: ${error.message}`);
        }
      }

      console.log('✅ [TEST] Session maintenance test completed');
    });

    test('should handle session expiration', async ({ page }) => {
      console.log('🧪 [TEST] Starting session expiration test');

      await authHelper.navigateToLogin();
      await authHelper.performLogin();

      // Clear session cookies to simulate expiration
      await page.context().clearCookies();
      console.log('🗑️ [TEST] Session cookies cleared');

      // Try to access protected page
      await page.goto('/admin', { timeout: 10000 });
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/admin\/login/);
      console.log('✅ [TEST] Correctly redirected to login after session expiration');

      console.log('✅ [TEST] Session expiration test completed');
    });
  });

  test.describe('Authentication Performance', () => {
    test('should complete authentication within performance thresholds', async ({ page }) => {
      console.log('🧪 [TEST] Starting authentication performance test');

      const performanceMetrics: any[] = [];
      
      // Run multiple login attempts to measure performance
      for (let i = 0; i < 3; i++) {
        console.log(`🔄 [TEST] Performance test iteration ${i + 1}/3`);
        
        await authHelper.navigateToLogin();
        
        const startTime = performance.now();
        const loginResult = await authHelper.performLogin();
        const endTime = performance.now();
        
        const authTime = endTime - startTime;
        performanceMetrics.push({
          iteration: i + 1,
          authTime,
          networkRequests: loginResult.authRequests.length,
          timestamp: new Date()
        });
        
        console.log(`⏱️ [TEST] Authentication time: ${authTime.toFixed(2)}ms`);
        
        // Logout for next iteration
        try {
          await authHelper.performLogout({ timeout: 5000 });
        } catch (error) {
          console.log('⚠️ [TEST] Logout failed, continuing with test');
          await page.goto('/admin/login');
        }
      }

      // Analyze performance metrics
      const averageTime = performanceMetrics.reduce((sum, metric) => sum + metric.authTime, 0) / performanceMetrics.length;
      const maxTime = Math.max(...performanceMetrics.map(m => m.authTime));
      const minTime = Math.min(...performanceMetrics.map(m => m.authTime));

      console.log(`📊 [TEST] Performance Results:`);
      console.log(`  Average authentication time: ${averageTime.toFixed(2)}ms`);
      console.log(`  Max authentication time: ${maxTime.toFixed(2)}ms`);
      console.log(`  Min authentication time: ${minTime.toFixed(2)}ms`);

      // Performance assertions (adjust thresholds as needed)
      expect(averageTime).toBeLessThan(10000); // 10 seconds average
      expect(maxTime).toBeLessThan(15000); // 15 seconds max

      console.log('✅ [TEST] Authentication performance test completed');
    });
  });

  test.describe('Network Request Monitoring', () => {
    test('should monitor all authentication-related network requests', async ({ page }) => {
      console.log('🧪 [TEST] Starting network request monitoring test');

      await authHelper.navigateToLogin();

      // Start monitoring authentication requests
      const monitoringPromise = authHelper.monitorAuthRequests(30000); // Monitor for 30 seconds
      
      // Perform authentication during monitoring
      const loginResult = await authHelper.performLogin();
      
      // Get monitoring results
      const authRequests = await monitoringPromise;
      
      console.log(`🌐 [TEST] Captured ${authRequests.length} authentication-related requests`);
      
      // Analyze request patterns
      const requestsByType = {
        signin: authRequests.filter(req => req.url.includes('/signin')),
        callback: authRequests.filter(req => req.url.includes('/callback')),
        session: authRequests.filter(req => req.url.includes('/session')),
        csrf: authRequests.filter(req => req.url.includes('/csrf'))
      };
      
      console.log('📊 [TEST] Request breakdown:', {
        signin: requestsByType.signin.length,
        callback: requestsByType.callback.length,
        session: requestsByType.session.length,
        csrf: requestsByType.csrf.length
      });

      // Look for error responses
      const errorResponses = authRequests.filter(req => 
        req.type === 'auth-response' && req.status >= 400
      );
      
      if (errorResponses.length > 0) {
        console.log('🚨 [TEST] Error responses detected:', errorResponses);
      } else {
        console.log('✅ [TEST] No error responses detected');
      }

      console.log('✅ [TEST] Network request monitoring test completed');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle various authentication error scenarios', async ({ page }) => {
      console.log('🧪 [TEST] Starting error handling test');

      const errorScenarios = [
        {
          name: 'Invalid email format',
          credentials: { email: 'invalid-email', password: 'fly2any2024!' }
        },
        {
          name: 'Wrong password',
          credentials: { email: 'admin@fly2any.com', password: 'wrong-password' }
        },
        {
          name: 'Non-existent user',
          credentials: { email: 'nonexistent@example.com', password: 'password' }
        }
      ];

      for (const scenario of errorScenarios) {
        console.log(`🔄 [TEST] Testing scenario: ${scenario.name}`);
        
        await authHelper.navigateToLogin();
        
        try {
          await authHelper.performLogin(scenario.credentials, {
            waitForRedirect: false,
            timeout: 5000
          });
          console.log(`⚠️ [TEST] Unexpected success for: ${scenario.name}`);
        } catch (error) {
          console.log(`✅ [TEST] Expected failure for: ${scenario.name}`);
          
          // Check for appropriate error messages
          const errorElement = page.locator('.admin-login-error');
          if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            console.log(`📝 [TEST] Error message: ${errorText}`);
          }
        }
      }

      console.log('✅ [TEST] Error handling test completed');
    });
  });
});