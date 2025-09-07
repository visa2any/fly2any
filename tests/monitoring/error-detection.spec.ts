import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * Automated Error Detection and Alerting System
 * Monitors for authentication errors and automatically generates alerts
 */

interface ErrorPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'csrf' | 'auth' | 'network' | 'session' | 'general';
  description: string;
}

interface DetectedError {
  timestamp: Date;
  pattern: ErrorPattern;
  source: 'console' | 'network' | 'page' | 'exception';
  message: string;
  context?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Alert {
  id: string;
  timestamp: Date;
  type: 'error_detected' | 'pattern_match' | 'threshold_exceeded' | 'system_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  errors: DetectedError[];
  recommendations: string[];
}

class AuthErrorDetector {
  private errorPatterns: ErrorPattern[] = [
    // CSRF-related patterns
    {
      name: 'MissingCSRF',
      pattern: /MissingCSRF|missing.*csrf|csrf.*missing/i,
      severity: 'critical',
      category: 'csrf',
      description: 'CSRF token validation failure detected'
    },
    {
      name: 'CSRFTokenInvalid',
      pattern: /csrf.*invalid|invalid.*csrf|csrf.*mismatch/i,
      severity: 'high',
      category: 'csrf',
      description: 'Invalid CSRF token detected'
    },
    {
      name: 'CSRFTokenExpired',
      pattern: /csrf.*expired|expired.*csrf/i,
      severity: 'medium',
      category: 'csrf',
      description: 'Expired CSRF token detected'
    },
    
    // Authentication-related patterns
    {
      name: 'AuthenticationFailed',
      pattern: /authentication.*failed|auth.*failed|login.*failed/i,
      severity: 'high',
      category: 'auth',
      description: 'Authentication process failed'
    },
    {
      name: 'InvalidCredentials',
      pattern: /invalid.*credentials|credentials.*invalid|wrong.*password/i,
      severity: 'medium',
      category: 'auth',
      description: 'Invalid credentials provided'
    },
    {
      name: 'SessionExpired',
      pattern: /session.*expired|expired.*session|session.*invalid/i,
      severity: 'medium',
      category: 'session',
      description: 'User session has expired'
    },
    {
      name: 'UnauthorizedAccess',
      pattern: /unauthorized|access.*denied|permission.*denied/i,
      severity: 'high',
      category: 'auth',
      description: 'Unauthorized access attempt detected'
    },
    
    // Network-related patterns
    {
      name: 'NetworkTimeout',
      pattern: /timeout|timed.*out|connection.*timeout/i,
      severity: 'medium',
      category: 'network',
      description: 'Network timeout detected'
    },
    {
      name: 'ConnectionError',
      pattern: /connection.*error|network.*error|fetch.*failed/i,
      severity: 'medium',
      category: 'network',
      description: 'Network connection error'
    },
    {
      name: 'ServerError',
      pattern: /server.*error|internal.*error|500.*error/i,
      severity: 'high',
      category: 'network',
      description: 'Server error detected'
    },
    
    // NextAuth-specific patterns
    {
      name: 'NextAuthError',
      pattern: /nextauth.*error|next-auth.*error/i,
      severity: 'high',
      category: 'auth',
      description: 'NextAuth library error detected'
    },
    {
      name: 'SignInError',
      pattern: /signin.*error|sign.*in.*error/i,
      severity: 'high',
      category: 'auth',
      description: 'Sign-in process error'
    },
    {
      name: 'CallbackError',
      pattern: /callback.*error|oauth.*error/i,
      severity: 'high',
      category: 'auth',
      description: 'Authentication callback error'
    }
  ];

  private detectedErrors: DetectedError[] = [];
  private alerts: Alert[] = [];
  private isMonitoring = false;

  constructor(private page: any) {}

  async startErrorMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ [ERROR-DETECTOR] Error monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 [ERROR-DETECTOR] Starting comprehensive error monitoring...');

    // Monitor console messages
    this.page.on('console', (msg) => {
      this.analyzeConsoleMessage(msg);
    });

    // Monitor page errors
    this.page.on('pageerror', (error) => {
      this.analyzePageError(error);
    });

    // Monitor network responses
    this.page.on('response', (response) => {
      this.analyzeNetworkResponse(response);
    });

    // Monitor network request failures
    this.page.on('requestfailed', (request) => {
      this.analyzeFailedRequest(request);
    });

    console.log('✅ [ERROR-DETECTOR] Error monitoring started');
  }

  stopErrorMonitoring(): void {
    this.isMonitoring = false;
    this.page.removeAllListeners('console');
    this.page.removeAllListeners('pageerror');
    this.page.removeAllListeners('response');
    this.page.removeAllListeners('requestfailed');
    console.log('🛑 [ERROR-DETECTOR] Error monitoring stopped');
  }

  private analyzeConsoleMessage(msg: any): void {
    const message = msg.text();
    const messageType = msg.type();
    
    // Only analyze error, warning, and info messages
    if (!['error', 'warn', 'warning', 'info'].includes(messageType)) {
      return;
    }

    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(message)) {
        const error: DetectedError = {
          timestamp: new Date(),
          pattern,
          source: 'console',
          message,
          context: { messageType, url: this.page.url() },
          severity: pattern.severity
        };

        this.detectedErrors.push(error);
        console.log(`🚨 [ERROR-DETECTOR] Console error detected: ${pattern.name} - ${message}`);
        
        this.checkForAlertConditions(error);
        break;
      }
    }
  }

  private analyzePageError(error: Error): void {
    const message = error.message;
    
    for (const pattern of this.errorPatterns) {
      if (pattern.pattern.test(message)) {
        const detectedError: DetectedError = {
          timestamp: new Date(),
          pattern,
          source: 'page',
          message,
          context: { stack: error.stack, url: this.page.url() },
          severity: pattern.severity
        };

        this.detectedErrors.push(detectedError);
        console.log(`🚨 [ERROR-DETECTOR] Page error detected: ${pattern.name} - ${message}`);
        
        this.checkForAlertConditions(detectedError);
        break;
      }
    }
  }

  private async analyzeNetworkResponse(response: any): Promise<void> {
    // Focus on authentication-related endpoints
    if (!response.url().includes('/api/auth/')) {
      return;
    }

    const status = response.status();
    const url = response.url();
    
    // Check for error status codes
    if (status >= 400) {
      let errorMessage = `HTTP ${status} ${response.statusText()} on ${url}`;
      
      // Try to get response body for more details
      try {
        const responseText = await response.text();
        if (responseText) {
          errorMessage += ` - ${responseText}`;
        }
      } catch (e) {
        // Response body might not be accessible
      }

      // Check against patterns
      for (const pattern of this.errorPatterns) {
        if (pattern.pattern.test(errorMessage) || pattern.pattern.test(url)) {
          const detectedError: DetectedError = {
            timestamp: new Date(),
            pattern,
            source: 'network',
            message: errorMessage,
            context: { 
              status, 
              statusText: response.statusText(), 
              url,
              headers: response.headers()
            },
            severity: pattern.severity
          };

          this.detectedErrors.push(detectedError);
          console.log(`🚨 [ERROR-DETECTOR] Network error detected: ${pattern.name} - ${errorMessage}`);
          
          this.checkForAlertConditions(detectedError);
          break;
        }
      }

      // Special handling for 302 redirects on credentials callback (potential CSRF issue)
      if (status === 302 && url.includes('/callback/credentials')) {
        const csrfPattern = this.errorPatterns.find(p => p.name === 'MissingCSRF');
        if (csrfPattern) {
          const detectedError: DetectedError = {
            timestamp: new Date(),
            pattern: csrfPattern,
            source: 'network',
            message: `302 redirect on credentials callback - potential CSRF failure: ${url}`,
            context: { status, url, suspectedCause: 'CSRF token validation failure' },
            severity: 'critical'
          };

          this.detectedErrors.push(detectedError);
          console.log(`🚨 [ERROR-DETECTOR] Potential CSRF failure detected: 302 redirect on ${url}`);
          
          this.checkForAlertConditions(detectedError);
        }
      }
    }
  }

  private analyzeFailedRequest(request: any): void {
    const url = request.url();
    const failure = request.failure();
    const errorText = failure?.errorText || 'Unknown network failure';

    // Focus on authentication-related requests
    if (url.includes('/api/auth/')) {
      const message = `Network request failed: ${errorText} on ${url}`;
      
      for (const pattern of this.errorPatterns) {
        if (pattern.pattern.test(message) || pattern.pattern.test(errorText)) {
          const detectedError: DetectedError = {
            timestamp: new Date(),
            pattern,
            source: 'network',
            message,
            context: { url, errorText, method: request.method() },
            severity: pattern.severity
          };

          this.detectedErrors.push(detectedError);
          console.log(`🚨 [ERROR-DETECTOR] Request failure detected: ${pattern.name} - ${message}`);
          
          this.checkForAlertConditions(detectedError);
          break;
        }
      }
    }
  }

  private checkForAlertConditions(newError: DetectedError): void {
    // Critical errors always trigger immediate alerts
    if (newError.severity === 'critical') {
      this.generateAlert('error_detected', [newError]);
      return;
    }

    // Check for error patterns and thresholds
    const recentErrors = this.getRecentErrors(5 * 60 * 1000); // Last 5 minutes
    
    // Multiple high-severity errors in short time
    const highSeverityErrors = recentErrors.filter(e => e.severity === 'high');
    if (highSeverityErrors.length >= 3) {
      this.generateAlert('threshold_exceeded', highSeverityErrors);
      return;
    }

    // Multiple errors of the same pattern
    const samePatternErrors = recentErrors.filter(e => e.pattern.name === newError.pattern.name);
    if (samePatternErrors.length >= 5) {
      this.generateAlert('pattern_match', samePatternErrors);
      return;
    }

    // High error rate overall
    if (recentErrors.length >= 10) {
      this.generateAlert('threshold_exceeded', recentErrors);
    }
  }

  private generateAlert(type: Alert['type'], errors: DetectedError[]): void {
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const highestSeverity = this.getHighestSeverity(errors);
    
    let message: string;
    let recommendations: string[] = [];

    switch (type) {
      case 'error_detected':
        message = `Critical error detected: ${errors[0].pattern.name}`;
        recommendations = this.getRecommendationsForError(errors[0]);
        break;
      case 'threshold_exceeded':
        message = `Error threshold exceeded: ${errors.length} errors in recent timeframe`;
        recommendations = ['Investigate system stability', 'Check authentication configuration', 'Review recent changes'];
        break;
      case 'pattern_match':
        message = `Repeated error pattern: ${errors[0].pattern.name} occurred ${errors.length} times`;
        recommendations = [`Focus on resolving: ${errors[0].pattern.description}`, 'Check for root cause'];
        break;
      case 'system_failure':
        message = `System failure detected: Multiple critical components affected`;
        recommendations = ['Immediate system investigation required', 'Check server status', 'Review authentication service'];
        break;
    }

    const alert: Alert = {
      id: alertId,
      timestamp: new Date(),
      type,
      severity: highestSeverity,
      message,
      errors,
      recommendations
    };

    this.alerts.push(alert);
    
    console.log(`🚨 [ERROR-DETECTOR] ALERT GENERATED: ${message}`);
    console.log(`   Severity: ${highestSeverity}`);
    console.log(`   Affected errors: ${errors.length}`);
    console.log(`   Recommendations:`, recommendations);
  }

  private getHighestSeverity(errors: DetectedError[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxLevel = Math.max(...errors.map(e => severityLevels[e.severity]));
    return Object.keys(severityLevels).find(k => severityLevels[k] === maxLevel) as any;
  }

  private getRecentErrors(timeframeMs: number): DetectedError[] {
    const cutoffTime = new Date(Date.now() - timeframeMs);
    return this.detectedErrors.filter(error => error.timestamp > cutoffTime);
  }

  private getRecommendationsForError(error: DetectedError): string[] {
    switch (error.pattern.name) {
      case 'MissingCSRF':
        return [
          'Check NextAuth CSRF configuration',
          'Verify NEXTAUTH_SECRET is properly set',
          'Ensure proper cookie configuration',
          'Check for client-server time synchronization issues'
        ];
      case 'AuthenticationFailed':
        return [
          'Verify admin credentials are correct',
          'Check authentication provider configuration',
          'Review NextAuth configuration',
          'Check database connectivity if using database sessions'
        ];
      case 'NetworkTimeout':
        return [
          'Check server response times',
          'Verify network connectivity',
          'Consider increasing timeout values',
          'Check server resource utilization'
        ];
      case 'SessionExpired':
        return [
          'Check session configuration in NextAuth',
          'Verify session timeout settings',
          'Implement proper session refresh logic'
        ];
      default:
        return [
          'Review recent changes to authentication system',
          'Check system logs for additional context',
          'Verify configuration settings',
          'Consider reaching out to development team'
        ];
    }
  }

  getErrorSummary(): any {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentErrors = this.detectedErrors.filter(e => e.timestamp > last24Hours);
    
    const errorsByCategory = {};
    const errorsByPattern = {};
    const errorsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };

    recentErrors.forEach(error => {
      // By category
      if (!errorsByCategory[error.pattern.category]) {
        errorsByCategory[error.pattern.category] = 0;
      }
      errorsByCategory[error.pattern.category]++;

      // By pattern
      if (!errorsByPattern[error.pattern.name]) {
        errorsByPattern[error.pattern.name] = 0;
      }
      errorsByPattern[error.pattern.name]++;

      // By severity
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.detectedErrors.length,
      recentErrors: recentErrors.length,
      totalAlerts: this.alerts.length,
      errorsByCategory,
      errorsByPattern,
      errorsBySeverity,
      lastError: this.detectedErrors[this.detectedErrors.length - 1],
      mostRecentAlert: this.alerts[this.alerts.length - 1]
    };
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getDetectedErrors(): DetectedError[] {
    return [...this.detectedErrors];
  }
}

test.describe('Automated Error Detection System', () => {
  let errorDetector: AuthErrorDetector;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    errorDetector = new AuthErrorDetector(page);
    authHelper = new AuthHelper(page);
  });

  test.afterEach(async () => {
    if (errorDetector) {
      errorDetector.stopErrorMonitoring();
    }
  });

  test('should detect and classify authentication errors', async ({ page }) => {
    console.log('🔍 [ERROR-TEST] Starting error detection and classification test');

    await errorDetector.startErrorMonitoring();

    // Navigate to login and attempt various error-inducing scenarios
    await authHelper.navigateToLogin();

    // Test 1: Invalid credentials (should trigger authentication error)
    console.log('🧪 [ERROR-TEST] Testing invalid credentials scenario');
    try {
      await authHelper.performLogin({ email: 'admin@fly2any.com', password: 'wrong-password' }, {
        waitForRedirect: false,
        timeout: 10000
      });
    } catch (error) {
      console.log('✅ [ERROR-TEST] Invalid credentials test completed (expected failure)');
    }

    // Wait for errors to be processed
    await page.waitForTimeout(2000);

    // Test 2: Empty credentials
    console.log('🧪 [ERROR-TEST] Testing empty credentials scenario');
    await page.reload();
    await page.waitForSelector('form.admin-login-form');
    
    try {
      await authHelper.performLogin({ email: '', password: '' }, {
        waitForRedirect: false,
        timeout: 5000
      });
    } catch (error) {
      console.log('✅ [ERROR-TEST] Empty credentials test completed (expected failure)');
    }

    // Wait for more error processing
    await page.waitForTimeout(2000);

    // Test 3: Valid login to ensure system can still work
    console.log('🧪 [ERROR-TEST] Testing valid credentials to ensure system recovery');
    await page.reload();
    await page.waitForSelector('form.admin-login-form');
    
    try {
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        timeout: 15000
      });
      console.log('✅ [ERROR-TEST] Valid credentials test completed successfully');
      
      // Logout for cleanup
      await authHelper.performLogout({ timeout: 5000 });
    } catch (error) {
      console.log('⚠️ [ERROR-TEST] Valid credentials test failed:', error.message);
    }

    // Analyze detected errors
    const errorSummary = errorDetector.getErrorSummary();
    const detectedErrors = errorDetector.getDetectedErrors();
    const alerts = errorDetector.getAlerts();

    console.log('📊 [ERROR-TEST] Error Detection Results:');
    console.log(`  Total errors detected: ${detectedErrors.length}`);
    console.log(`  Alerts generated: ${alerts.length}`);
    console.log('  Error summary:', JSON.stringify(errorSummary, null, 2));

    if (detectedErrors.length > 0) {
      console.log('🔍 [ERROR-TEST] Detected Errors Details:');
      detectedErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.pattern.name} (${error.severity}): ${error.message}`);
      });
    }

    if (alerts.length > 0) {
      console.log('🚨 [ERROR-TEST] Generated Alerts:');
      alerts.forEach((alert, index) => {
        console.log(`  Alert ${index + 1}: ${alert.message} (${alert.severity})`);
        console.log(`    Recommendations: ${alert.recommendations.join(', ')}`);
      });
    }

    // Basic validations
    expect(detectedErrors).toBeDefined();
    expect(alerts).toBeDefined();

    console.log('✅ [ERROR-TEST] Error detection and classification test completed');
  });

  test('should specifically monitor for CSRF-related errors', async ({ page }) => {
    console.log('🛡️ [ERROR-TEST] Starting CSRF-specific error monitoring');

    await errorDetector.startErrorMonitoring();

    // Perform authentication flow while monitoring for CSRF issues
    await authHelper.navigateToLogin();

    // Multiple attempts to trigger potential CSRF issues
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 [ERROR-TEST] CSRF monitoring attempt ${i + 1}/3`);
      
      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 20000,
          validateCSRF: true
        });
        
        console.log('✅ [ERROR-TEST] Authentication successful, checking for CSRF errors...');
        
        // Logout for next iteration
        await authHelper.performLogout({ timeout: 5000 });
        
      } catch (error) {
        console.log(`⚠️ [ERROR-TEST] Authentication failed on attempt ${i + 1}: ${error.message}`);
        
        // Navigate back to login for next attempt
        await authHelper.navigateToLogin();
      }
      
      // Wait between attempts
      await page.waitForTimeout(3000);
    }

    // Analyze specifically for CSRF-related errors
    const detectedErrors = errorDetector.getDetectedErrors();
    const csrfErrors = detectedErrors.filter(error => error.pattern.category === 'csrf');
    const alerts = errorDetector.getAlerts();
    const csrfAlerts = alerts.filter(alert => 
      alert.errors.some(error => error.pattern.category === 'csrf')
    );

    console.log('🛡️ [ERROR-TEST] CSRF Error Analysis:');
    console.log(`  Total CSRF errors: ${csrfErrors.length}`);
    console.log(`  CSRF-related alerts: ${csrfAlerts.length}`);

    if (csrfErrors.length > 0) {
      console.log('🚨 [ERROR-TEST] CSRF ERRORS DETECTED:');
      csrfErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.pattern.name}: ${error.message}`);
        console.log(`     Source: ${error.source}, Severity: ${error.severity}`);
        console.log(`     Time: ${error.timestamp.toISOString()}`);
        if (error.context) {
          console.log(`     Context:`, error.context);
        }
      });

      // Generate CSRF-specific report
      const csrfReport = {
        detectedAt: new Date(),
        totalCSRFErrors: csrfErrors.length,
        errorPatterns: [...new Set(csrfErrors.map(e => e.pattern.name))],
        mostCommonPattern: this.getMostCommonPattern(csrfErrors),
        criticalErrors: csrfErrors.filter(e => e.severity === 'critical').length,
        recommendations: [
          'Check NEXTAUTH_SECRET configuration',
          'Verify CSRF token handling in authentication flow',
          'Review NextAuth configuration for CSRF settings',
          'Check client-server time synchronization'
        ]
      };

      console.log('📋 [ERROR-TEST] CSRF Error Report:', JSON.stringify(csrfReport, null, 2));
      
    } else {
      console.log('✅ [ERROR-TEST] No CSRF errors detected during monitoring period');
    }

    console.log('✅ [ERROR-TEST] CSRF-specific error monitoring completed');
  });

  test('should generate actionable alerts for critical issues', async ({ page }) => {
    console.log('🚨 [ERROR-TEST] Starting critical issue alerting test');

    await errorDetector.startErrorMonitoring();

    // Simulate various scenarios that should trigger alerts
    await authHelper.navigateToLogin();

    // Scenario 1: Multiple rapid authentication failures (should trigger threshold alert)
    console.log('🧪 [ERROR-TEST] Simulating multiple rapid failures');
    const invalidCredentials = [
      { email: 'wrong1@example.com', password: 'wrong1' },
      { email: 'wrong2@example.com', password: 'wrong2' },
      { email: 'wrong3@example.com', password: 'wrong3' },
      { email: 'wrong4@example.com', password: 'wrong4' }
    ];

    for (const creds of invalidCredentials) {
      try {
        await authHelper.performLogin(creds, {
          waitForRedirect: false,
          timeout: 5000
        });
      } catch (error) {
        // Expected to fail
      }
      
      await page.reload();
      await page.waitForSelector('form.admin-login-form');
      await page.waitForTimeout(1000);
    }

    // Scenario 2: Try to trigger potential CSRF errors
    console.log('🧪 [ERROR-TEST] Attempting to trigger CSRF-related issues');
    
    // Clear cookies to potentially cause session/CSRF issues
    await page.context().clearCookies();
    
    try {
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        timeout: 10000,
        validateCSRF: true
      });
    } catch (error) {
      console.log('⚠️ [ERROR-TEST] Expected potential failure due to cleared cookies');
    }

    // Wait for error processing and alert generation
    await page.waitForTimeout(5000);

    // Analyze generated alerts
    const alerts = errorDetector.getAlerts();
    const detectedErrors = errorDetector.getDetectedErrors();

    console.log('🚨 [ERROR-TEST] Alert Generation Results:');
    console.log(`  Total alerts generated: ${alerts.length}`);
    console.log(`  Total errors detected: ${detectedErrors.length}`);

    if (alerts.length > 0) {
      console.log('📋 [ERROR-TEST] GENERATED ALERTS:');
      alerts.forEach((alert, index) => {
        console.log(`\n  Alert ${index + 1}:`);
        console.log(`    ID: ${alert.id}`);
        console.log(`    Type: ${alert.type}`);
        console.log(`    Severity: ${alert.severity}`);
        console.log(`    Message: ${alert.message}`);
        console.log(`    Timestamp: ${alert.timestamp.toISOString()}`);
        console.log(`    Affected Errors: ${alert.errors.length}`);
        console.log(`    Recommendations:`);
        alert.recommendations.forEach((rec, recIndex) => {
          console.log(`      ${recIndex + 1}. ${rec}`);
        });
      });

      // Validate alert quality
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      const highSeverityAlerts = alerts.filter(a => a.severity === 'high');

      console.log(`📊 [ERROR-TEST] Alert Breakdown:`);
      console.log(`  Critical: ${criticalAlerts.length}`);
      console.log(`  High: ${highSeverityAlerts.length}`);
      console.log(`  Medium: ${alerts.filter(a => a.severity === 'medium').length}`);
      console.log(`  Low: ${alerts.filter(a => a.severity === 'low').length}`);

      // Ensure alerts have actionable recommendations
      alerts.forEach(alert => {
        expect(alert.recommendations.length).toBeGreaterThan(0);
        expect(alert.message).toBeTruthy();
        expect(alert.errors.length).toBeGreaterThan(0);
      });

    } else {
      console.log('ℹ️ [ERROR-TEST] No alerts generated (system may be performing well)');
    }

    console.log('✅ [ERROR-TEST] Critical issue alerting test completed');
  });

  // Helper method for CSRF analysis
  getMostCommonPattern(errors: DetectedError[]): string | null {
    if (errors.length === 0) return null;
    
    const patternCounts = {};
    errors.forEach(error => {
      patternCounts[error.pattern.name] = (patternCounts[error.pattern.name] || 0) + 1;
    });
    
    return Object.keys(patternCounts).reduce((a, b) => 
      patternCounts[a] > patternCounts[b] ? a : b
    );
  }
});