import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * Visual Testing and Screenshot-based Authentication Monitoring
 * Captures visual evidence of authentication states and detects UI issues
 */

interface VisualTestResult {
  testName: string;
  timestamp: Date;
  screenshotPath: string;
  status: 'passed' | 'failed' | 'warning';
  observations: string[];
  metadata?: any;
}

class VisualAuthTester {
  private visualResults: VisualTestResult[] = [];
  private screenshotCounter = 0;

  constructor(private page: any) {}

  async captureAuthenticationState(
    stateName: string, 
    options: {
      fullPage?: boolean;
      timeout?: number;
      quality?: number;
      observations?: string[];
      metadata?: any;
    } = {}
  ): Promise<VisualTestResult> {
    const {
      fullPage = true,
      timeout = 10000,
      quality = 90,
      observations = [],
      metadata = {}
    } = options;

    this.screenshotCounter++;
    const timestamp = new Date();
    const filename = `auth-state-${stateName.toLowerCase().replace(/\s+/g, '-')}-${timestamp.getTime()}-${this.screenshotCounter}.png`;
    const screenshotPath = `tests/reports/artifacts/${filename}`;

    console.log(`📸 [VISUAL-TEST] Capturing ${stateName} state...`);

    try {
      await this.page.screenshot({
        path: screenshotPath,
        fullPage,
        quality,
        timeout
      });

      // Perform visual analysis
      const visualAnalysis = await this.analyzeCurrentPage();
      
      const result: VisualTestResult = {
        testName: stateName,
        timestamp,
        screenshotPath,
        status: visualAnalysis.hasErrors ? 'failed' : 'passed',
        observations: [...observations, ...visualAnalysis.observations],
        metadata: {
          ...metadata,
          pageUrl: this.page.url(),
          pageTitle: await this.page.title().catch(() => 'Unable to get title'),
          viewportSize: await this.page.viewportSize(),
          userAgent: await this.page.evaluate(() => navigator.userAgent),
          ...visualAnalysis.metadata
        }
      };

      this.visualResults.push(result);

      console.log(`✅ [VISUAL-TEST] ${stateName} captured: ${screenshotPath}`);
      if (visualAnalysis.observations.length > 0) {
        console.log(`📝 [VISUAL-TEST] Observations: ${visualAnalysis.observations.join(', ')}`);
      }

      return result;
    } catch (error) {
      console.log(`❌ [VISUAL-TEST] Failed to capture ${stateName}: ${error.message}`);
      
      const result: VisualTestResult = {
        testName: stateName,
        timestamp,
        screenshotPath: '',
        status: 'failed',
        observations: [`Screenshot capture failed: ${error.message}`, ...observations],
        metadata: { ...metadata, error: error.message }
      };

      this.visualResults.push(result);
      return result;
    }
  }

  private async analyzeCurrentPage(): Promise<{
    hasErrors: boolean;
    observations: string[];
    metadata: any;
  }> {
    const observations: string[] = [];
    let hasErrors = false;

    try {
      const url = this.page.url();
      const title = await this.page.title();

      // Check for error indicators in the page
      const errorSelectors = [
        '.admin-login-error',
        '.error-message',
        '.alert-error',
        '[data-testid="error"]',
        '.text-red-500', // Tailwind error text
        '.bg-red-100'    // Tailwind error background
      ];

      for (const selector of errorSelectors) {
        try {
          const errorElement = await this.page.locator(selector).first();
          if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            observations.push(`Error displayed: ${errorText?.trim() || 'Unknown error'}`);
            hasErrors = true;
          }
        } catch (e) {
          // Element not found, continue
        }
      }

      // Check for authentication state indicators
      if (url.includes('/admin/login')) {
        observations.push('User is on login page');
        
        // Check if login form is present and functional
        try {
          const loginForm = this.page.locator('form.admin-login-form');
          if (await loginForm.isVisible()) {
            observations.push('Login form is visible');
            
            // Check form elements
            const emailInput = this.page.locator('input[name="email"]');
            const passwordInput = this.page.locator('input[name="password"]');
            const submitButton = this.page.locator('button[type="submit"]');
            
            if (await emailInput.isVisible()) observations.push('Email input is available');
            if (await passwordInput.isVisible()) observations.push('Password input is available');
            if (await submitButton.isVisible()) {
              const isEnabled = await submitButton.isEnabled();
              observations.push(`Submit button is ${isEnabled ? 'enabled' : 'disabled'}`);
            }
          } else {
            observations.push('Login form is not visible');
            hasErrors = true;
          }
        } catch (e) {
          observations.push('Error checking login form elements');
          hasErrors = true;
        }
      } else if (url.includes('/admin') && !url.includes('/login')) {
        observations.push('User appears to be in admin area');
        
        // Check for admin interface elements
        try {
          const adminElements = await this.page.locator('body').innerHTML();
          if (adminElements.includes('admin') || adminElements.includes('dashboard')) {
            observations.push('Admin interface content detected');
          }
        } catch (e) {
          // Could not analyze page content
        }
      }

      // Check for loading indicators
      const loadingSelectors = [
        '.admin-loading',
        '.admin-spinner',
        '.loading',
        '.spinner',
        '[data-testid="loading"]'
      ];

      for (const selector of loadingSelectors) {
        try {
          const loadingElement = await this.page.locator(selector).first();
          if (await loadingElement.isVisible()) {
            observations.push('Loading indicator is visible');
            break;
          }
        } catch (e) {
          // Element not found, continue
        }
      }

      // Check page responsiveness
      const viewport = await this.page.viewportSize();
      if (viewport) {
        observations.push(`Page rendered at ${viewport.width}x${viewport.height}`);
      }

      return {
        hasErrors,
        observations,
        metadata: {
          url,
          title,
          hasLoginForm: url.includes('/admin/login'),
          isAdminArea: url.includes('/admin') && !url.includes('/login'),
          pageLoadTime: await this.page.evaluate(() => {
            return performance.timing.loadEventEnd - performance.timing.navigationStart;
          }).catch(() => null)
        }
      };
    } catch (error) {
      return {
        hasErrors: true,
        observations: [`Page analysis failed: ${error.message}`],
        metadata: { error: error.message }
      };
    }
  }

  async captureAuthenticationFlow(): Promise<VisualTestResult[]> {
    console.log('📸 [VISUAL-TEST] Starting complete authentication flow capture');
    
    const flowResults: VisualTestResult[] = [];

    // 1. Initial login page
    const loginPageResult = await this.captureAuthenticationState('Login Page Initial', {
      observations: ['Starting authentication flow']
    });
    flowResults.push(loginPageResult);

    // 2. Login form filled
    try {
      await this.page.fill('input[name="email"]', AuthHelper.ADMIN_CREDENTIALS.email);
      await this.page.fill('input[name="password"]', AuthHelper.ADMIN_CREDENTIALS.password);
      
      const filledFormResult = await this.captureAuthenticationState('Login Form Filled', {
        observations: ['Credentials entered in form']
      });
      flowResults.push(filledFormResult);
    } catch (error) {
      console.log('⚠️ [VISUAL-TEST] Could not fill login form for visual capture');
    }

    // 3. Form submission (capture loading state if possible)
    try {
      const submitButton = this.page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Try to capture loading state quickly
      await this.page.waitForTimeout(500);
      const loadingResult = await this.captureAuthenticationState('Authentication Processing', {
        timeout: 5000,
        observations: ['Form submitted, processing authentication']
      });
      flowResults.push(loadingResult);
      
      // Wait for authentication to complete
      await this.page.waitForURL('/admin', { timeout: 15000 });
      
      // 4. Successful authentication (admin page)
      const successResult = await this.captureAuthenticationState('Authentication Success', {
        observations: ['Successfully authenticated and redirected to admin area']
      });
      flowResults.push(successResult);
      
    } catch (error) {
      // 4. Authentication error (if occurred)
      const errorResult = await this.captureAuthenticationState('Authentication Error', {
        observations: [`Authentication failed: ${error.message}`]
      });
      flowResults.push(errorResult);
    }

    console.log(`✅ [VISUAL-TEST] Authentication flow capture completed: ${flowResults.length} states captured`);
    return flowResults;
  }

  async captureResponsiveViews(stateName: string): Promise<VisualTestResult[]> {
    console.log(`📱 [VISUAL-TEST] Capturing responsive views for ${stateName}`);
    
    const responsiveResults: VisualTestResult[] = [];
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await this.page.waitForTimeout(1000); // Allow layout to settle
        
        const result = await this.captureAuthenticationState(
          `${stateName} - ${viewport.name}`,
          {
            observations: [`Responsive test on ${viewport.name} (${viewport.width}x${viewport.height})`],
            metadata: { viewport: viewport, responsiveTest: true }
          }
        );
        
        responsiveResults.push(result);
      } catch (error) {
        console.log(`❌ [VISUAL-TEST] Failed to capture ${viewport.name} view: ${error.message}`);
      }
    }

    return responsiveResults;
  }

  async captureErrorStates(): Promise<VisualTestResult[]> {
    console.log('🚨 [VISUAL-TEST] Capturing authentication error states');
    
    const errorResults: VisualTestResult[] = [];

    // Error scenario 1: Invalid credentials
    try {
      await this.page.fill('input[name="email"]', 'wrong@email.com');
      await this.page.fill('input[name="password"]', 'wrongpassword');
      
      const beforeSubmitResult = await this.captureAuthenticationState('Invalid Credentials Form', {
        observations: ['Form filled with invalid credentials']
      });
      errorResults.push(beforeSubmitResult);
      
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(3000); // Wait for error to appear
      
      const errorStateResult = await this.captureAuthenticationState('Invalid Credentials Error', {
        observations: ['Error state after submitting invalid credentials']
      });
      errorResults.push(errorStateResult);
      
    } catch (error) {
      console.log('⚠️ [VISUAL-TEST] Could not capture invalid credentials error state');
    }

    return errorResults;
  }

  getVisualTestReport(): any {
    const totalTests = this.visualResults.length;
    const passedTests = this.visualResults.filter(r => r.status === 'passed').length;
    const failedTests = this.visualResults.filter(r => r.status === 'failed').length;
    const warningTests = this.visualResults.filter(r => r.status === 'warning').length;

    // Group by test type
    const testsByType = {
      static: this.visualResults.filter(r => !r.metadata?.responsiveTest).length,
      responsive: this.visualResults.filter(r => r.metadata?.responsiveTest).length
    };

    // Collect all observations
    const allObservations = this.visualResults.reduce((all, result) => {
      return all.concat(result.observations.map(obs => ({
        test: result.testName,
        observation: obs,
        timestamp: result.timestamp,
        status: result.status
      })));
    }, [] as any[]);

    return {
      generatedAt: new Date(),
      summary: {
        totalTests,
        passedTests,
        failedTests,
        warningTests,
        successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) + '%' : '0%'
      },
      testsByType,
      visualResults: this.visualResults,
      observations: allObservations,
      screenshots: this.visualResults.filter(r => r.screenshotPath).map(r => ({
        testName: r.testName,
        path: r.screenshotPath,
        timestamp: r.timestamp,
        status: r.status
      })),
      recommendations: this.generateVisualRecommendations()
    };
  }

  private generateVisualRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const failedTests = this.visualResults.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} visual tests failed - review screenshots for issues`);
    }

    // Check for common issues in observations
    const allObservations = this.visualResults.flatMap(r => r.observations);
    
    if (allObservations.some(obs => obs.includes('Error displayed'))) {
      recommendations.push('Error states detected - investigate authentication error handling');
    }
    
    if (allObservations.some(obs => obs.includes('Login form is not visible'))) {
      recommendations.push('Login form visibility issues detected - check UI rendering');
    }
    
    if (allObservations.some(obs => obs.includes('disabled'))) {
      recommendations.push('Form submission issues detected - verify form validation logic');
    }

    const responsiveTests = this.visualResults.filter(r => r.metadata?.responsiveTest);
    if (responsiveTests.length > 0) {
      const responsiveFailures = responsiveTests.filter(r => r.status === 'failed');
      if (responsiveFailures.length > 0) {
        recommendations.push('Responsive design issues detected - check mobile/tablet layouts');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All visual tests passed - authentication UI is rendering correctly');
    }

    return recommendations;
  }
}

test.describe('Visual Authentication Testing', () => {
  let visualTester: VisualAuthTester;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    visualTester = new VisualAuthTester(page);
    authHelper = new AuthHelper(page);
  });

  test('should capture complete authentication flow visually', async ({ page }) => {
    console.log('📸 [VISUAL-TEST] Starting complete authentication flow visual capture');

    await authHelper.navigateToLogin();

    const flowResults = await visualTester.captureAuthenticationFlow();
    
    console.log(`📊 [VISUAL-TEST] Flow capture results: ${flowResults.length} states captured`);
    
    // Validate that we captured key states
    const stateNames = flowResults.map(r => r.testName);
    expect(stateNames).toContain('Login Page Initial');
    
    // Check for successful states vs error states
    const successStates = flowResults.filter(r => r.observations.some(obs => obs.includes('Success')));
    const errorStates = flowResults.filter(r => r.observations.some(obs => obs.includes('Error')));
    
    console.log(`✅ [VISUAL-TEST] Success states: ${successStates.length}, Error states: ${errorStates.length}`);
    
    // Generate visual report
    const visualReport = visualTester.getVisualTestReport();
    console.log('📋 [VISUAL-TEST] Visual Test Report:', JSON.stringify(visualReport, null, 2));

    expect(flowResults.length).toBeGreaterThan(0);
    console.log('✅ [VISUAL-TEST] Authentication flow visual capture completed');
  });

  test('should test responsive authentication design', async ({ page }) => {
    console.log('📱 [VISUAL-TEST] Starting responsive authentication design testing');

    await authHelper.navigateToLogin();

    // Test login page responsiveness
    const loginResponsiveResults = await visualTester.captureResponsiveViews('Login Page');
    
    console.log(`📊 [VISUAL-TEST] Login page responsive tests: ${loginResponsiveResults.length} viewports captured`);

    // Test with filled form
    await page.fill('input[name="email"]', AuthHelper.ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', AuthHelper.ADMIN_CREDENTIALS.password);
    
    const filledFormResponsiveResults = await visualTester.captureResponsiveViews('Filled Login Form');
    
    console.log(`📊 [VISUAL-TEST] Filled form responsive tests: ${filledFormResponsiveResults.length} viewports captured`);

    // Analyze responsive test results
    const allResponsiveResults = [...loginResponsiveResults, ...filledFormResponsiveResults];
    const responsiveFailures = allResponsiveResults.filter(r => r.status === 'failed');
    
    if (responsiveFailures.length > 0) {
      console.log('⚠️ [VISUAL-TEST] Responsive design issues detected:');
      responsiveFailures.forEach(failure => {
        console.log(`  - ${failure.testName}: ${failure.observations.join(', ')}`);
      });
    } else {
      console.log('✅ [VISUAL-TEST] All responsive tests passed');
    }

    expect(allResponsiveResults.length).toBeGreaterThan(0);
    console.log('✅ [VISUAL-TEST] Responsive authentication design testing completed');
  });

  test('should capture and analyze authentication error states', async ({ page }) => {
    console.log('🚨 [VISUAL-TEST] Starting authentication error state capture');

    await authHelper.navigateToLogin();

    // Capture various error states
    const errorResults = await visualTester.captureErrorStates();
    
    console.log(`📊 [VISUAL-TEST] Error state tests: ${errorResults.length} states captured`);

    // Test empty form submission
    await page.reload();
    await page.waitForSelector('form.admin-login-form');
    
    await visualTester.captureAuthenticationState('Empty Form State', {
      observations: ['Form with empty fields']
    });

    // Test network error simulation (if possible)
    try {
      // Block network requests temporarily
      await page.route('**/api/auth/**', route => route.abort());
      
      await page.fill('input[name="email"]', AuthHelper.ADMIN_CREDENTIALS.email);
      await page.fill('input[name="password"]', AuthHelper.ADMIN_CREDENTIALS.password);
      
      await visualTester.captureAuthenticationState('Before Network Error Test', {
        observations: ['Form filled, network requests will be blocked']
      });
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      await visualTester.captureAuthenticationState('Network Error State', {
        observations: ['Network requests blocked, testing error handling']
      });
      
      // Unblock network requests
      await page.unroute('**/api/auth/**');
      
    } catch (error) {
      console.log('⚠️ [VISUAL-TEST] Network error simulation failed:', error.message);
    }

    // Generate error analysis report
    const visualReport = visualTester.getVisualTestReport();
    const errorObservations = visualReport.observations.filter(obs => 
      obs.observation.toLowerCase().includes('error') || 
      obs.status === 'failed'
    );

    console.log('🚨 [VISUAL-TEST] Error Analysis:');
    console.log(`  Error observations: ${errorObservations.length}`);
    if (errorObservations.length > 0) {
      errorObservations.forEach(obs => {
        console.log(`  - ${obs.test}: ${obs.observation}`);
      });
    }

    expect(visualReport.screenshots.length).toBeGreaterThan(0);
    console.log('✅ [VISUAL-TEST] Authentication error state capture completed');
  });

  test('should perform comprehensive visual audit of authentication system', async ({ page }) => {
    console.log('🔍 [VISUAL-TEST] Starting comprehensive visual audit');

    // 1. Initial page states
    await authHelper.navigateToLogin();
    await visualTester.captureAuthenticationState('Audit - Initial Login Page');

    // 2. Form interaction states
    await visualTester.captureAuthenticationState('Audit - Empty Form Focus', {
      observations: ['Form in initial state']
    });

    await page.focus('input[name="email"]');
    await visualTester.captureAuthenticationState('Audit - Email Field Focused');

    await page.fill('input[name="email"]', AuthHelper.ADMIN_CREDENTIALS.email);
    await visualTester.captureAuthenticationState('Audit - Email Filled');

    await page.focus('input[name="password"]');
    await visualTester.captureAuthenticationState('Audit - Password Field Focused');

    await page.fill('input[name="password"]', AuthHelper.ADMIN_CREDENTIALS.password);
    await visualTester.captureAuthenticationState('Audit - Both Fields Filled');

    // 3. Button states
    const submitButton = page.locator('button[type="submit"]');
    const isEnabled = await submitButton.isEnabled();
    await visualTester.captureAuthenticationState(`Audit - Submit Button ${isEnabled ? 'Enabled' : 'Disabled'}`, {
      observations: [`Submit button is ${isEnabled ? 'enabled' : 'disabled'}`]
    });

    // 4. Development info (if visible)
    try {
      const devInfo = page.locator('.admin-login-dev-info');
      if (await devInfo.isVisible()) {
        await visualTester.captureAuthenticationState('Audit - Development Info Visible', {
          observations: ['Development credentials are visible']
        });
      }
    } catch (e) {
      // Dev info not visible
    }

    // 5. Complete authentication for success state
    try {
      await submitButton.click();
      await page.waitForURL('/admin', { timeout: 15000 });
      await visualTester.captureAuthenticationState('Audit - Authentication Success');
      
      // 6. Admin interface
      await visualTester.captureAuthenticationState('Audit - Admin Dashboard');
      
    } catch (error) {
      await visualTester.captureAuthenticationState('Audit - Authentication Failed', {
        observations: [`Authentication failed: ${error.message}`]
      });
    }

    // Generate comprehensive audit report
    const auditReport = visualTester.getVisualTestReport();
    
    console.log('🔍 [VISUAL-TEST] Comprehensive Audit Results:');
    console.log(`  Total visual captures: ${auditReport.summary.totalTests}`);
    console.log(`  Success rate: ${auditReport.summary.successRate}`);
    console.log(`  Screenshots generated: ${auditReport.screenshots.length}`);
    
    // Audit-specific analysis
    const auditScreenshots = auditReport.screenshots.filter(s => s.testName.startsWith('Audit'));
    console.log(`  Audit screenshots: ${auditScreenshots.length}`);
    
    auditScreenshots.forEach(screenshot => {
      console.log(`    - ${screenshot.testName}: ${screenshot.path} (${screenshot.status})`);
    });

    if (auditReport.recommendations.length > 0) {
      console.log('📝 [VISUAL-TEST] Audit Recommendations:');
      auditReport.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    expect(auditReport.summary.totalTests).toBeGreaterThan(5);
    console.log('✅ [VISUAL-TEST] Comprehensive visual audit completed');
  });
});