import { Page, BrowserContext, expect } from '@playwright/test';

/**
 * Authentication Helper Utilities for Playwright Tests
 * Provides comprehensive authentication testing and monitoring functions
 */

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any;
  sessionData: any;
}

export interface CSRFTokenInfo {
  token: string | null;
  source: 'cookie' | 'meta' | 'header' | 'form';
  timestamp: Date;
}

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Default admin credentials for testing
   */
  static readonly ADMIN_CREDENTIALS: AuthCredentials = {
    email: 'admin@fly2any.com',
    password: 'fly2any2024!'
  };

  /**
   * Navigate to login page with comprehensive monitoring
   */
  async navigateToLogin(options: { 
    waitForLoad?: boolean;
    captureNetworkRequests?: boolean;
    timeout?: number;
  } = {}) {
    const { 
      waitForLoad = true, 
      captureNetworkRequests = true, 
      timeout = 10000 
    } = options;

    // Setup network monitoring if requested
    const networkRequests: any[] = [];
    if (captureNetworkRequests) {
      this.page.on('request', request => {
        networkRequests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          timestamp: new Date(),
          type: 'request'
        });
      });

      this.page.on('response', response => {
        networkRequests.push({
          method: response.request().method(),
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: new Date(),
          type: 'response'
        });
      });
    }

    // Navigate to login page
    console.log('🔄 [AUTH-HELPER] Navigating to login page...');
    await this.page.goto('/admin/login', { timeout });

    if (waitForLoad) {
      // Wait for login form to be visible
      await this.page.waitForSelector('form.admin-login-form', { timeout });
      await this.page.waitForSelector('input[name="email"]', { timeout });
      await this.page.waitForSelector('input[name="password"]', { timeout });
      await this.page.waitForSelector('button[type="submit"]', { timeout });
    }

    return { networkRequests };
  }

  /**
   * Perform login with comprehensive validation and monitoring
   */
  async performLogin(
    credentials: AuthCredentials = AuthHelper.ADMIN_CREDENTIALS,
    options: {
      validateCSRF?: boolean;
      captureScreenshots?: boolean;
      monitorNetworkRequests?: boolean;
      waitForRedirect?: boolean;
      timeout?: number;
    } = {}
  ) {
    const {
      validateCSRF = true,
      captureScreenshots = true,
      monitorNetworkRequests = true,
      waitForRedirect = true,
      timeout = 15000
    } = options;

    console.log('🔐 [AUTH-HELPER] Starting login process...', {
      email: credentials.email,
      timestamp: new Date().toISOString()
    });

    // Capture screenshot before login if requested
    if (captureScreenshots) {
      await this.page.screenshot({
        path: `tests/reports/artifacts/login-before-${Date.now()}.png`,
        fullPage: true
      });
    }

    // Setup network request monitoring
    const networkRequests: any[] = [];
    const authRequests: any[] = [];
    
    if (monitorNetworkRequests) {
      this.page.on('request', request => {
        const isAuthRequest = request.url().includes('/api/auth/');
        const requestData = {
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date(),
          type: 'request'
        };
        
        networkRequests.push(requestData);
        if (isAuthRequest) {
          authRequests.push(requestData);
          console.log('🌐 [AUTH-HELPER] Auth request:', requestData.method, requestData.url);
        }
      });

      this.page.on('response', response => {
        const isAuthResponse = response.url().includes('/api/auth/');
        const responseData = {
          method: response.request().method(),
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timestamp: new Date(),
          type: 'response'
        };
        
        networkRequests.push(responseData);
        if (isAuthResponse) {
          authRequests.push(responseData);
          console.log('🌐 [AUTH-HELPER] Auth response:', responseData.status, responseData.url);
        }
      });
    }

    // Extract CSRF token if validation is enabled
    let csrfTokenInfo: CSRFTokenInfo | null = null;
    if (validateCSRF) {
      csrfTokenInfo = await this.extractCSRFToken();
      console.log('🛡️ [AUTH-HELPER] CSRF token info:', csrfTokenInfo);
    }

    // Fill in credentials
    await this.page.fill('input[name="email"]', credentials.email);
    await this.page.fill('input[name="password"]', credentials.password);

    console.log('✅ [AUTH-HELPER] Credentials filled');

    // Capture screenshot before submission
    if (captureScreenshots) {
      await this.page.screenshot({
        path: `tests/reports/artifacts/login-filled-${Date.now()}.png`,
        fullPage: true
      });
    }

    // Submit form and monitor the process
    const submitButton = this.page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // Track form submission timing
    const submissionStart = performance.now();
    console.log('🚀 [AUTH-HELPER] Submitting login form...');
    
    await submitButton.click();

    // Wait for authentication to complete
    try {
      if (waitForRedirect) {
        // Wait for redirect to admin dashboard or handle authentication error
        await Promise.race([
          // Success: redirect to admin
          this.page.waitForURL('/admin', { timeout }),
          // Error: stay on login page with error message
          this.page.waitForSelector('.admin-login-error', { timeout: 5000 }).then(() => {
            throw new Error('Authentication failed - error message displayed');
          })
        ]);

        const submissionEnd = performance.now();
        const authTime = submissionEnd - submissionStart;
        console.log('✅ [AUTH-HELPER] Authentication completed in', authTime.toFixed(2), 'ms');
      }
    } catch (error) {
      console.error('❌ [AUTH-HELPER] Authentication failed:', error);
      
      // Capture error screenshot
      if (captureScreenshots) {
        await this.page.screenshot({
          path: `tests/reports/artifacts/login-error-${Date.now()}.png`,
          fullPage: true
        });
      }
      
      throw error;
    }

    // Final screenshot after login
    if (captureScreenshots) {
      await this.page.screenshot({
        path: `tests/reports/artifacts/login-after-${Date.now()}.png`,
        fullPage: true
      });
    }

    return {
      success: true,
      networkRequests,
      authRequests,
      csrfTokenInfo,
      authTime: performance.now() - submissionStart
    };
  }

  /**
   * Extract CSRF token from various sources
   */
  async extractCSRFToken(): Promise<CSRFTokenInfo | null> {
    console.log('🛡️ [AUTH-HELPER] Extracting CSRF token...');
    
    // Check for CSRF token in meta tag
    try {
      const metaCSRF = await this.page.getAttribute('meta[name="csrf-token"]', 'content');
      if (metaCSRF) {
        console.log('✅ [AUTH-HELPER] Found CSRF token in meta tag');
        return { token: metaCSRF, source: 'meta', timestamp: new Date() };
      }
    } catch (e) {
      console.log('⚠️ [AUTH-HELPER] No CSRF meta tag found');
    }

    // Check for CSRF token in form hidden input
    try {
      const formCSRF = await this.page.inputValue('input[name="_token"]');
      if (formCSRF) {
        console.log('✅ [AUTH-HELPER] Found CSRF token in form');
        return { token: formCSRF, source: 'form', timestamp: new Date() };
      }
    } catch (e) {
      console.log('⚠️ [AUTH-HELPER] No CSRF form field found');
    }

    // Check cookies for CSRF token
    try {
      const cookies = await this.page.context().cookies();
      const csrfCookie = cookies.find(cookie => 
        cookie.name.toLowerCase().includes('csrf') || 
        cookie.name.toLowerCase().includes('xsrf')
      );
      
      if (csrfCookie) {
        console.log('✅ [AUTH-HELPER] Found CSRF token in cookie:', csrfCookie.name);
        return { token: csrfCookie.value, source: 'cookie', timestamp: new Date() };
      }
    } catch (e) {
      console.log('⚠️ [AUTH-HELPER] No CSRF cookie found');
    }

    console.log('❌ [AUTH-HELPER] No CSRF token found');
    return { token: null, source: 'cookie', timestamp: new Date() };
  }

  /**
   * Validate authentication state
   */
  async validateAuthenticationState(): Promise<AuthState> {
    console.log('🔍 [AUTH-HELPER] Validating authentication state...');
    
    try {
      // Check if we're on the admin page (successful authentication)
      const currentUrl = this.page.url();
      const isOnAdminPage = currentUrl.includes('/admin') && !currentUrl.includes('/admin/login');
      
      if (isOnAdminPage) {
        console.log('✅ [AUTH-HELPER] User is authenticated (on admin page)');
        
        // Try to extract user info from the page
        let userInfo = null;
        try {
          // Look for user display elements
          await this.page.waitForSelector('[data-testid="user-info"], .admin-header, .admin-nav', { timeout: 5000 });
          userInfo = { isAdmin: true, authenticated: true };
        } catch (e) {
          console.log('⚠️ [AUTH-HELPER] Could not extract user info from page');
        }
        
        return {
          isAuthenticated: true,
          user: userInfo,
          sessionData: { currentUrl, timestamp: new Date() }
        };
      } else {
        console.log('❌ [AUTH-HELPER] User is not authenticated (not on admin page)');
        return {
          isAuthenticated: false,
          user: null,
          sessionData: { currentUrl, timestamp: new Date() }
        };
      }
    } catch (error) {
      console.error('❌ [AUTH-HELPER] Error validating authentication state:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        isAuthenticated: false,
        user: null,
        sessionData: { error: errorMessage, timestamp: new Date() }
      };
    }
  }

  /**
   * Monitor authentication-related network requests
   */
  async monitorAuthRequests(duration: number = 30000): Promise<any[]> {
    console.log('🌐 [AUTH-HELPER] Starting authentication request monitoring for', duration, 'ms');
    
    const authRequests: any[] = [];
    
    const requestHandler = (request) => {
      if (request.url().includes('/api/auth/')) {
        const requestInfo = {
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date(),
          type: 'auth-request'
        };
        authRequests.push(requestInfo);
        console.log('🌐 [AUTH-HELPER] Captured auth request:', requestInfo.method, requestInfo.url);
      }
    };

    const responseHandler = (response) => {
      if (response.url().includes('/api/auth/')) {
        const responseInfo = {
          method: response.request().method(),
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timestamp: new Date(),
          type: 'auth-response'
        };
        authRequests.push(responseInfo);
        console.log('🌐 [AUTH-HELPER] Captured auth response:', responseInfo.status, responseInfo.url);
      }
    };

    this.page.on('request', requestHandler);
    this.page.on('response', responseHandler);

    // Monitor for specified duration
    await this.page.waitForTimeout(duration);

    // Remove event handlers
    this.page.off('request', requestHandler);
    this.page.off('response', responseHandler);

    console.log('✅ [AUTH-HELPER] Authentication monitoring completed. Captured', authRequests.length, 'requests');
    return authRequests;
  }

  /**
   * Perform logout with validation
   */
  async performLogout(options: {
    validateRedirect?: boolean;
    captureScreenshots?: boolean;
    timeout?: number;
  } = {}) {
    const { validateRedirect = true, captureScreenshots = true, timeout = 10000 } = options;
    
    console.log('🚪 [AUTH-HELPER] Starting logout process...');
    
    if (captureScreenshots) {
      await this.page.screenshot({
        path: `tests/reports/artifacts/logout-before-${Date.now()}.png`,
        fullPage: true
      });
    }

    // Look for logout button or link
    try {
      // Try different selectors for logout
      const logoutSelectors = [
        'button[data-testid="logout"]',
        'a[data-testid="logout"]',
        'button:has-text("Logout")',
        'button:has-text("Sair")',
        'a:has-text("Logout")',
        'a:has-text("Sair")',
        '.logout-btn',
        '.admin-logout'
      ];

      let logoutElement = null;
      for (const selector of logoutSelectors) {
        try {
          logoutElement = await this.page.waitForSelector(selector, { timeout: 2000 });
          if (logoutElement) {
            console.log('✅ [AUTH-HELPER] Found logout element:', selector);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (logoutElement) {
        await logoutElement.click();
        console.log('✅ [AUTH-HELPER] Clicked logout');
      } else {
        // Fallback: navigate to NextAuth signout endpoint
        console.log('⚠️ [AUTH-HELPER] No logout button found, using NextAuth signout endpoint');
        await this.page.goto('/api/auth/signout', { timeout });
        // NextAuth signout page might have a confirmation form
        try {
          const signoutForm = await this.page.waitForSelector('form', { timeout: 5000 });
          if (signoutForm) {
            const submitButton = await this.page.waitForSelector('button[type="submit"]', { timeout: 2000 });
            if (submitButton) {
              await submitButton.click();
            }
          }
        } catch (e) {
          console.log('⚠️ [AUTH-HELPER] No signout confirmation form found');
        }
      }

      if (validateRedirect) {
        // Wait for redirect to login page or home page
        await Promise.race([
          this.page.waitForURL('/admin/login', { timeout }),
          this.page.waitForURL('/', { timeout }),
          this.page.waitForURL('/login', { timeout })
        ]);
        console.log('✅ [AUTH-HELPER] Logout redirect completed');
      }

    } catch (error) {
      console.error('❌ [AUTH-HELPER] Logout failed:', error);
      throw error;
    }

    if (captureScreenshots) {
      await this.page.screenshot({
        path: `tests/reports/artifacts/logout-after-${Date.now()}.png`,
        fullPage: true
      });
    }

    console.log('✅ [AUTH-HELPER] Logout completed');
  }

  /**
   * Wait for authentication to complete with timeout and error handling
   */
  async waitForAuthentication(timeout: number = 15000): Promise<boolean> {
    console.log('⏳ [AUTH-HELPER] Waiting for authentication to complete...');
    
    try {
      await Promise.race([
        // Success: redirected to admin
        this.page.waitForURL('/admin', { timeout }),
        // Error: authentication failed
        this.page.waitForSelector('.admin-login-error', { timeout: 5000 }).then(() => {
          throw new Error('Authentication failed - error displayed');
        })
      ]);
      
      console.log('✅ [AUTH-HELPER] Authentication successful');
      return true;
    } catch (error) {
      console.error('❌ [AUTH-HELPER] Authentication timeout or failed:', error.message);
      return false;
    }
  }
}

/**
 * Utility functions for authentication testing
 */
export const AuthUtils = {
  /**
   * Generate test credentials variations
   */
  generateTestCredentials(): AuthCredentials[] {
    return [
      AuthHelper.ADMIN_CREDENTIALS,
      { email: 'admin@fly2any.com', password: 'wrong_password' },
      { email: 'wrong@email.com', password: 'fly2any2024!' },
      { email: '', password: 'fly2any2024!' },
      { email: 'admin@fly2any.com', password: '' }
    ];
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Generate timestamp for test reporting
   */
  generateTimestamp(): string {
    return new Date().toISOString();
  },

  /**
   * Create test report data structure
   */
  createTestReport(testName: string, result: any, metadata: any = {}) {
    return {
      testName,
      result,
      timestamp: this.generateTimestamp(),
      metadata,
      success: !result.error
    };
  }
};