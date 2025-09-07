import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * CSRF Token Monitoring and Validation Tests
 * Specifically focuses on detecting and analyzing CSRF-related issues
 */

test.describe('CSRF Token Monitoring', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test.describe('CSRF Error Detection', () => {
    test('should detect MissingCSRF errors in authentication flow', async ({ page }) => {
      console.log('🛡️ [CSRF-TEST] Starting MissingCSRF error detection test');

      // Set up comprehensive error monitoring
      const errors: any[] = [];
      const networkEvents: any[] = [];
      const consoleMessages: any[] = [];

      // Monitor all network responses for CSRF-related errors
      page.on('response', response => {
        const responseData = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timestamp: new Date(),
          isAuthEndpoint: response.url().includes('/api/auth/')
        };
        
        networkEvents.push(responseData);

        // Specifically look for CSRF-related error responses
        if (responseData.isAuthEndpoint) {
          // Check for redirect responses (302) which might indicate CSRF failure
          if (response.status() === 302) {
            console.log('🚨 [CSRF-TEST] 302 redirect detected on auth endpoint:', response.url());
            errors.push({
              type: 'auth_redirect',
              url: response.url(),
              status: response.status(),
              timestamp: new Date(),
              suspectedCause: 'Possible CSRF token validation failure'
            });
          }

          // Check for other error status codes
          if (response.status() >= 400) {
            console.log('🚨 [CSRF-TEST] Error response on auth endpoint:', response.status(), response.url());
            errors.push({
              type: 'auth_error',
              url: response.url(),
              status: response.status(),
              statusText: response.statusText(),
              timestamp: new Date()
            });
          }
        }
      });

      // Monitor console for CSRF-related messages
      page.on('console', msg => {
        const message = {
          type: msg.type(),
          text: msg.text(),
          timestamp: new Date()
        };
        consoleMessages.push(message);

        const text = msg.text().toLowerCase();
        if (text.includes('csrf') || text.includes('missing') || text.includes('token')) {
          console.log('🚨 [CSRF-TEST] CSRF-related console message:', msg.text());
          errors.push({
            type: 'console_csrf',
            message: msg.text(),
            level: msg.type(),
            timestamp: new Date()
          });
        }
      });

      // Monitor page errors
      page.on('pageerror', error => {
        console.log('🚨 [CSRF-TEST] Page error:', error.message);
        errors.push({
          type: 'page_error',
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        });
      });

      // Navigate to login and attempt authentication
      await authHelper.navigateToLogin();
      
      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 20000,
          captureScreenshots: true
        });
        
        console.log('✅ [CSRF-TEST] Authentication completed, analyzing for CSRF issues...');
      } catch (error) {
        console.log('⚠️ [CSRF-TEST] Authentication failed, analyzing error patterns...');
        console.log('Error details:', error.message);
        
        errors.push({
          type: 'authentication_failure',
          message: error.message,
          timestamp: new Date()
        });
      }

      // Analysis and reporting
      console.log(`📊 [CSRF-TEST] Analysis Results:`);
      console.log(`  Total network events: ${networkEvents.length}`);
      console.log(`  Auth endpoint calls: ${networkEvents.filter(e => e.isAuthEndpoint).length}`);
      console.log(`  Console messages: ${consoleMessages.length}`);
      console.log(`  Detected issues: ${errors.length}`);

      // Look for specific CSRF patterns
      const authRedirects = errors.filter(e => e.type === 'auth_redirect');
      const csrfConsoleMessages = errors.filter(e => e.type === 'console_csrf');
      
      if (authRedirects.length > 0) {
        console.log('🚨 [CSRF-TEST] AUTH REDIRECTS DETECTED (possible CSRF failures):');
        authRedirects.forEach(redirect => {
          console.log(`  - ${redirect.url} (${redirect.status}) at ${redirect.timestamp}`);
        });
      }

      if (csrfConsoleMessages.length > 0) {
        console.log('🚨 [CSRF-TEST] CSRF-RELATED CONSOLE MESSAGES:');
        csrfConsoleMessages.forEach(msg => {
          console.log(`  - [${msg.level}] ${msg.message}`);
        });
      }

      // Generate detailed report
      const csrfReport = {
        testTimestamp: new Date(),
        authenticationAttempted: true,
        networkEvents: networkEvents.filter(e => e.isAuthEndpoint),
        detectedIssues: errors,
        possibleCSRFFailures: authRedirects.length + csrfConsoleMessages.length,
        recommendations: []
      };

      if (authRedirects.length > 0) {
        csrfReport.recommendations.push('Investigate 302 redirects on authentication endpoints - may indicate CSRF token validation failures');
      }

      if (errors.length === 0) {
        csrfReport.recommendations.push('No CSRF-related issues detected in current test run');
      }

      console.log('📋 [CSRF-TEST] Full CSRF Analysis Report:', JSON.stringify(csrfReport, null, 2));

      console.log('✅ [CSRF-TEST] CSRF error detection test completed');
    });

    test('should analyze CSRF token flow in authentication requests', async ({ page }) => {
      console.log('🛡️ [CSRF-TEST] Starting CSRF token flow analysis');

      const authRequestDetails: any[] = [];
      
      // Capture all authentication-related requests with full details
      page.on('request', request => {
        if (request.url().includes('/api/auth/')) {
          const requestDetails = {
            method: request.method(),
            url: request.url(),
            headers: request.headers(),
            postData: request.postData(),
            timestamp: new Date(),
            type: 'request'
          };
          
          authRequestDetails.push(requestDetails);
          console.log('🌐 [CSRF-TEST] Auth request captured:', request.method(), request.url());
        }
      });

      page.on('response', async response => {
        if (response.url().includes('/api/auth/')) {
          const responseDetails = {
            method: response.request().method(),
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            timestamp: new Date(),
            type: 'response'
          };
          
          authRequestDetails.push(responseDetails);
          console.log('🌐 [CSRF-TEST] Auth response captured:', response.status(), response.url());
        }
      });

      await authHelper.navigateToLogin();

      // Extract any CSRF tokens before authentication
      const csrfTokenInfo = await authHelper.extractCSRFToken();
      console.log('🛡️ [CSRF-TEST] Pre-auth CSRF token info:', csrfTokenInfo);

      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          validateCSRF: true,
          monitorNetworkRequests: true,
          timeout: 20000
        });
      } catch (error) {
        console.log('⚠️ [CSRF-TEST] Authentication failed during CSRF analysis:', error.message);
      }

      // Analyze the captured authentication flow
      console.log(`📊 [CSRF-TEST] Captured ${authRequestDetails.length} auth-related network events`);

      // Group by request/response pairs
      const requests = authRequestDetails.filter(item => item.type === 'request');
      const responses = authRequestDetails.filter(item => item.type === 'response');

      console.log(`  - Requests: ${requests.length}`);
      console.log(`  - Responses: ${responses.length}`);

      // Analyze each request for CSRF-related data
      requests.forEach((request, index) => {
        console.log(`\n🔍 [CSRF-TEST] Request ${index + 1} Analysis:`);
        console.log(`  URL: ${request.url}`);
        console.log(`  Method: ${request.method}`);
        
        // Check headers for CSRF tokens
        const headers = request.headers || {};
        const csrfHeaders = Object.keys(headers).filter(key => 
          key.toLowerCase().includes('csrf') || key.toLowerCase().includes('xsrf')
        );
        
        if (csrfHeaders.length > 0) {
          console.log(`  ✅ CSRF headers found:`, csrfHeaders.map(h => `${h}: ${headers[h]}`));
        } else {
          console.log(`  ⚠️  No CSRF headers detected`);
        }

        // Check POST data for CSRF tokens
        if (request.postData) {
          const postData = request.postData.toString();
          if (postData.includes('csrf') || postData.includes('_token')) {
            console.log(`  ✅ CSRF data found in POST body`);
          } else {
            console.log(`  ⚠️  No CSRF data in POST body`);
          }
        }
      });

      // Analyze responses for CSRF-related issues
      const errorResponses = responses.filter(r => r.status >= 400);
      const redirectResponses = responses.filter(r => r.status >= 300 && r.status < 400);

      if (errorResponses.length > 0) {
        console.log(`\n🚨 [CSRF-TEST] Error responses detected: ${errorResponses.length}`);
        errorResponses.forEach((response, index) => {
          console.log(`  Error ${index + 1}: ${response.status} ${response.statusText} - ${response.url}`);
        });
      }

      if (redirectResponses.length > 0) {
        console.log(`\n🔄 [CSRF-TEST] Redirect responses detected: ${redirectResponses.length}`);
        redirectResponses.forEach((response, index) => {
          console.log(`  Redirect ${index + 1}: ${response.status} ${response.statusText} - ${response.url}`);
          
          // 302 redirects on auth endpoints might indicate CSRF failures
          if (response.status === 302 && response.url.includes('/callback/credentials')) {
            console.log(`  🚨 POTENTIAL CSRF FAILURE: 302 redirect on credentials callback`);
          }
        });
      }

      console.log('✅ [CSRF-TEST] CSRF token flow analysis completed');
    });

    test('should test CSRF token persistence across requests', async ({ page }) => {
      console.log('🛡️ [CSRF-TEST] Starting CSRF token persistence test');

      await authHelper.navigateToLogin();

      // Extract initial CSRF token
      const initialCSRF = await authHelper.extractCSRFToken();
      console.log('🛡️ [CSRF-TEST] Initial CSRF token:', initialCSRF);

      // Perform a page reload and check if CSRF token changes
      await page.reload();
      await page.waitForSelector('form.admin-login-form');

      const afterReloadCSRF = await authHelper.extractCSRFToken();
      console.log('🛡️ [CSRF-TEST] CSRF after reload:', afterReloadCSRF);

      // Compare tokens
      if (initialCSRF?.token && afterReloadCSRF?.token) {
        const tokensMatch = initialCSRF.token === afterReloadCSRF.token;
        console.log(`🔍 [CSRF-TEST] CSRF tokens match after reload: ${tokensMatch}`);
        
        if (!tokensMatch) {
          console.log('✅ [CSRF-TEST] CSRF tokens rotate correctly (security best practice)');
        } else {
          console.log('⚠️ [CSRF-TEST] CSRF tokens remain the same (potential security concern)');
        }
      } else {
        console.log('❌ [CSRF-TEST] Could not compare CSRF tokens (tokens not found)');
      }

      // Test multiple form submissions to see CSRF handling
      const csrfTokens: any[] = [];
      
      for (let i = 0; i < 3; i++) {
        const token = await authHelper.extractCSRFToken();
        csrfTokens.push({
          attempt: i + 1,
          token: token?.token,
          source: token?.source,
          timestamp: new Date()
        });
        
        // Try to submit form (will fail but we want to see CSRF behavior)
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'wrong-password');
        
        try {
          await page.click('button[type="submit"]');
          await page.waitForTimeout(2000); // Wait for response
        } catch (error) {
          // Expected to fail, continue
        }
        
        await page.reload();
        await page.waitForSelector('form.admin-login-form');
      }

      console.log('🛡️ [CSRF-TEST] CSRF token tracking across submissions:', csrfTokens);

      console.log('✅ [CSRF-TEST] CSRF token persistence test completed');
    });
  });

  test.describe('NextAuth CSRF Integration', () => {
    test('should validate NextAuth internal CSRF handling', async ({ page }) => {
      console.log('🛡️ [CSRF-TEST] Starting NextAuth CSRF integration test');

      // Monitor all NextAuth-specific requests
      const nextAuthRequests: any[] = [];

      page.on('request', request => {
        if (request.url().includes('/api/auth/')) {
          const requestData = {
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            timestamp: new Date()
          };
          
          nextAuthRequests.push(requestData);
          
          // Check for NextAuth-specific endpoints
          if (request.url().includes('/csrf')) {
            console.log('🛡️ [CSRF-TEST] NextAuth CSRF endpoint called:', request.url());
          }
          if (request.url().includes('/session')) {
            console.log('🔍 [CSRF-TEST] NextAuth session endpoint called:', request.url());
          }
          if (request.url().includes('/signin')) {
            console.log('🔐 [CSRF-TEST] NextAuth signin endpoint called:', request.url());
          }
          if (request.url().includes('/callback')) {
            console.log('🔄 [CSRF-TEST] NextAuth callback endpoint called:', request.url());
          }
        }
      });

      await authHelper.navigateToLogin();

      // Check if NextAuth CSRF endpoint is accessible
      try {
        await page.goto('/api/auth/csrf', { timeout: 5000 });
        console.log('✅ [CSRF-TEST] NextAuth CSRF endpoint is accessible');
        
        // Check the response
        const csrfResponse = await page.textContent('body');
        if (csrfResponse && csrfResponse.includes('csrfToken')) {
          console.log('✅ [CSRF-TEST] NextAuth CSRF endpoint returns token');
        }
        
        // Go back to login
        await authHelper.navigateToLogin();
      } catch (error) {
        console.log('⚠️ [CSRF-TEST] NextAuth CSRF endpoint not accessible:', error.message);
        await authHelper.navigateToLogin();
      }

      // Attempt authentication and monitor NextAuth flow
      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 20000
        });
        console.log('✅ [CSRF-TEST] Authentication completed via NextAuth');
      } catch (error) {
        console.log('⚠️ [CSRF-TEST] NextAuth authentication failed:', error.message);
      }

      // Analyze NextAuth request patterns
      console.log(`📊 [CSRF-TEST] NextAuth request analysis:`);
      console.log(`  Total NextAuth requests: ${nextAuthRequests.length}`);

      const requestsByEndpoint = {
        csrf: nextAuthRequests.filter(r => r.url.includes('/csrf')),
        signin: nextAuthRequests.filter(r => r.url.includes('/signin')),
        callback: nextAuthRequests.filter(r => r.url.includes('/callback')),
        session: nextAuthRequests.filter(r => r.url.includes('/session'))
      };

      Object.entries(requestsByEndpoint).forEach(([endpoint, requests]) => {
        console.log(`  ${endpoint}: ${requests.length} requests`);
        if (requests.length > 0) {
          requests.forEach((req, idx) => {
            console.log(`    ${idx + 1}. ${req.method} ${req.url}`);
          });
        }
      });

      console.log('✅ [CSRF-TEST] NextAuth CSRF integration test completed');
    });
  });
});