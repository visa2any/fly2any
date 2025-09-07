import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * Network Request Monitoring and Analysis
 * Deep analysis of all network traffic during authentication
 */

interface NetworkRequest {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
  postData?: string;
  status?: number;
  statusText?: string;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  timing?: any;
  type: 'request' | 'response';
  isAuthRelated: boolean;
  error?: string;
}

interface NetworkPattern {
  name: string;
  description: string;
  pattern: RegExp | ((request: NetworkRequest) => boolean);
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'csrf' | 'auth' | 'performance' | 'security' | 'error';
}

class NetworkAnalyzer {
  private networkRequests: NetworkRequest[] = [];
  private requestIdCounter = 0;
  private isMonitoring = false;

  private patterns: NetworkPattern[] = [
    // CSRF-related patterns
    {
      name: 'MissingCSRFToken',
      description: 'Authentication request without CSRF token',
      pattern: (req) => req.isAuthRelated && req.type === 'request' && 
        !req.headers['x-csrf-token'] && !req.headers['x-xsrf-token'] && 
        !req.postData?.includes('csrf') && !req.postData?.includes('_token'),
      severity: 'critical',
      category: 'csrf'
    },
    {
      name: 'CSRFFailureRedirect',
      description: '302 redirect on credentials callback (potential CSRF failure)',
      pattern: (req) => req.type === 'response' && req.status === 302 && 
        req.url.includes('/callback/credentials'),
      severity: 'critical',
      category: 'csrf'
    },
    
    // Authentication patterns
    {
      name: 'AuthenticationFailure',
      description: 'Authentication endpoint returned error status',
      pattern: (req) => req.isAuthRelated && req.type === 'response' && 
        req.status && req.status >= 400,
      severity: 'error',
      category: 'auth'
    },
    {
      name: 'UnauthorizedAccess',
      description: 'Unauthorized access attempt detected',
      pattern: (req) => req.type === 'response' && req.status === 401,
      severity: 'warning',
      category: 'auth'
    },
    {
      name: 'SessionExpired',
      description: 'Session expired during authentication',
      pattern: (req) => req.type === 'response' && req.status === 403 && 
        req.url.includes('session'),
      severity: 'warning',
      category: 'auth'
    },
    
    // Performance patterns
    {
      name: 'SlowAuthRequest',
      description: 'Authentication request took longer than 5 seconds',
      pattern: (req) => req.isAuthRelated && req.timing && req.timing.total > 5000,
      severity: 'warning',
      category: 'performance'
    },
    {
      name: 'RequestTimeout',
      description: 'Request timed out',
      pattern: (req) => req.error && req.error.includes('timeout'),
      severity: 'error',
      category: 'performance'
    },
    
    // Security patterns
    {
      name: 'InsecureConnection',
      description: 'Authentication over insecure connection',
      pattern: (req) => req.isAuthRelated && req.url.startsWith('http://') && 
        !req.url.includes('localhost'),
      severity: 'critical',
      category: 'security'
    },
    {
      name: 'SensitiveDataInURL',
      description: 'Sensitive data exposed in URL parameters',
      pattern: (req) => req.url.includes('password=') || req.url.includes('token='),
      severity: 'critical',
      category: 'security'
    }
  ];

  constructor(private page: any) {}

  async startNetworkMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ [NETWORK-ANALYZER] Network monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🌐 [NETWORK-ANALYZER] Starting comprehensive network monitoring...');

    // Monitor all requests
    this.page.on('request', (request) => {
      this.recordRequest(request);
    });

    // Monitor all responses
    this.page.on('response', async (response) => {
      await this.recordResponse(response);
    });

    // Monitor failed requests
    this.page.on('requestfailed', (request) => {
      this.recordFailedRequest(request);
    });

    console.log('✅ [NETWORK-ANALYZER] Network monitoring started');
  }

  stopNetworkMonitoring(): void {
    this.isMonitoring = false;
    this.page.removeAllListeners('request');
    this.page.removeAllListeners('response');
    this.page.removeAllListeners('requestfailed');
    console.log('🛑 [NETWORK-ANALYZER] Network monitoring stopped');
  }

  private recordRequest(request: any): void {
    const requestId = `req-${++this.requestIdCounter}`;
    const isAuthRelated = this.isAuthenticationRelated(request.url());

    const networkRequest: NetworkRequest = {
      id: requestId,
      timestamp: new Date(),
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      postData: request.postData() || undefined,
      type: 'request',
      isAuthRelated
    };

    this.networkRequests.push(networkRequest);

    if (isAuthRelated) {
      console.log(`🌐 [NETWORK-ANALYZER] Auth request: ${networkRequest.method} ${networkRequest.url}`);
      
      // Log sensitive data for debugging (be careful with this in production)
      if (networkRequest.postData && process.env.NODE_ENV === 'development') {
        console.log(`📝 [NETWORK-ANALYZER] Request data preview: ${networkRequest.postData.substring(0, 100)}...`);
      }
    }

    // Analyze request against patterns
    this.analyzeRequestAgainstPatterns(networkRequest);
  }

  private async recordResponse(response: any): Promise<void> {
    const request = response.request();
    const requestId = `res-${this.requestIdCounter}`;
    const isAuthRelated = this.isAuthenticationRelated(response.url());

    let responseBody: string | undefined;
    try {
      // Only capture response body for auth-related requests and if it's not too large
      if (isAuthRelated && response.headers()['content-length'] && 
          parseInt(response.headers()['content-length']) < 10000) {
        responseBody = await response.text();
      }
    } catch (error) {
      // Response body might not be accessible
    }

    const networkResponse: NetworkRequest = {
      id: requestId,
      timestamp: new Date(),
      method: request.method(),
      url: response.url(),
      headers: request.headers(),
      postData: request.postData() || undefined,
      status: response.status(),
      statusText: response.statusText(),
      responseHeaders: response.headers(),
      responseBody,
      timing: request.timing(),
      type: 'response',
      isAuthRelated
    };

    this.networkRequests.push(networkResponse);

    if (isAuthRelated) {
      console.log(`🌐 [NETWORK-ANALYZER] Auth response: ${networkResponse.status} ${networkResponse.url}`);
      
      if (networkResponse.status && networkResponse.status >= 400) {
        console.log(`🚨 [NETWORK-ANALYZER] Auth error response: ${networkResponse.status} ${networkResponse.statusText}`);
      }
    }

    // Analyze response against patterns
    this.analyzeRequestAgainstPatterns(networkResponse);
  }

  private recordFailedRequest(request: any): void {
    const requestId = `fail-${++this.requestIdCounter}`;
    const isAuthRelated = this.isAuthenticationRelated(request.url());
    const failure = request.failure();

    const networkRequest: NetworkRequest = {
      id: requestId,
      timestamp: new Date(),
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      postData: request.postData() || undefined,
      type: 'request',
      isAuthRelated,
      error: failure?.errorText || 'Request failed'
    };

    this.networkRequests.push(networkRequest);

    if (isAuthRelated) {
      console.log(`❌ [NETWORK-ANALYZER] Auth request failed: ${networkRequest.url} - ${networkRequest.error}`);
    }

    // Analyze failed request
    this.analyzeRequestAgainstPatterns(networkRequest);
  }

  private isAuthenticationRelated(url: string): boolean {
    return url.includes('/api/auth/') || 
           url.includes('/admin/login') || 
           url.includes('/login') ||
           url.includes('/logout') ||
           url.includes('/signin') ||
           url.includes('/signout') ||
           url.includes('/callback');
  }

  private analyzeRequestAgainstPatterns(request: NetworkRequest): void {
    for (const pattern of this.patterns) {
      let matches = false;

      if (typeof pattern.pattern === 'function') {
        try {
          matches = pattern.pattern(request);
        } catch (error) {
          console.log(`⚠️ [NETWORK-ANALYZER] Pattern analysis error for ${pattern.name}: ${error.message}`);
          continue;
        }
      } else {
        matches = pattern.pattern.test(request.url) || 
                 pattern.pattern.test(request.error || '') ||
                 pattern.pattern.test(request.responseBody || '');
      }

      if (matches) {
        console.log(`🚨 [NETWORK-ANALYZER] Pattern detected: ${pattern.name} - ${pattern.description}`);
        console.log(`   Severity: ${pattern.severity}, Category: ${pattern.category}`);
        console.log(`   Request: ${request.method} ${request.url} (${request.type})`);
        
        if (pattern.severity === 'critical') {
          console.log(`🚨 CRITICAL NETWORK ISSUE: ${pattern.description}`);
        }
      }
    }
  }

  getNetworkAnalysis(): any {
    const authRequests = this.networkRequests.filter(r => r.isAuthRelated);
    const requests = this.networkRequests.filter(r => r.type === 'request');
    const responses = this.networkRequests.filter(r => r.type === 'response');
    const failures = this.networkRequests.filter(r => r.error);

    // Pattern analysis
    const detectedPatterns = [];
    for (const pattern of this.patterns) {
      const matchingRequests = this.networkRequests.filter(request => {
        if (typeof pattern.pattern === 'function') {
          try {
            return pattern.pattern(request);
          } catch (error) {
            return false;
          }
        } else {
          return pattern.pattern.test(request.url) || 
                 pattern.pattern.test(request.error || '') ||
                 pattern.pattern.test(request.responseBody || '');
        }
      });

      if (matchingRequests.length > 0) {
        detectedPatterns.push({
          pattern: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          category: pattern.category,
          count: matchingRequests.length,
          affectedRequests: matchingRequests.map(r => ({
            id: r.id,
            url: r.url,
            method: r.method,
            status: r.status,
            timestamp: r.timestamp
          }))
        });
      }
    }

    // Performance analysis
    const performanceMetrics = {
      averageAuthResponseTime: 0,
      slowAuthRequests: 0,
      fastestAuthRequest: null,
      slowestAuthRequest: null
    };

    const authResponsesWithTiming = authRequests.filter(r => r.type === 'response' && r.timing);
    if (authResponsesWithTiming.length > 0) {
      const responseTimes = authResponsesWithTiming.map(r => r.timing.total || 0);
      performanceMetrics.averageAuthResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      performanceMetrics.slowAuthRequests = responseTimes.filter(t => t > 2000).length;
      performanceMetrics.fastestAuthRequest = Math.min(...responseTimes);
      performanceMetrics.slowestAuthRequest = Math.max(...responseTimes);
    }

    // Error analysis
    const errorAnalysis = {
      totalErrors: failures.length,
      authErrors: failures.filter(r => r.isAuthRelated).length,
      errorsByStatus: {},
      commonErrors: []
    };

    responses.filter(r => r.status && r.status >= 400).forEach(response => {
      const status = response.status.toString();
      errorAnalysis.errorsByStatus[status] = (errorAnalysis.errorsByStatus[status] || 0) + 1;
    });

    return {
      generatedAt: new Date(),
      monitoringDuration: this.networkRequests.length > 0 ? 
        new Date().getTime() - this.networkRequests[0].timestamp.getTime() : 0,
      summary: {
        totalRequests: this.networkRequests.length,
        authRequests: authRequests.length,
        requests: requests.length,
        responses: responses.length,
        failures: failures.length,
        successRate: responses.length > 0 ? 
          ((responses.filter(r => r.status && r.status < 400).length / responses.length) * 100).toFixed(2) + '%' : '0%'
      },
      detectedPatterns,
      performanceMetrics,
      errorAnalysis,
      authFlowAnalysis: this.analyzeAuthenticationFlow(),
      csrfAnalysis: this.analyzeCSRFHandling(),
      recommendations: this.generateNetworkRecommendations(detectedPatterns, performanceMetrics, errorAnalysis)
    };
  }

  private analyzeAuthenticationFlow(): any {
    const authRequests = this.networkRequests.filter(r => r.isAuthRelated);
    
    // Group requests by authentication flow steps
    const flowSteps = {
      csrfToken: authRequests.filter(r => r.url.includes('/csrf')),
      signin: authRequests.filter(r => r.url.includes('/signin')),
      callback: authRequests.filter(r => r.url.includes('/callback')),
      session: authRequests.filter(r => r.url.includes('/session')),
      providers: authRequests.filter(r => r.url.includes('/providers'))
    };

    // Analyze flow sequence
    const flowSequence = authRequests
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(r => ({
        step: this.identifyFlowStep(r.url),
        method: r.method,
        status: r.status,
        timing: r.timing?.total || 0,
        timestamp: r.timestamp
      }));

    return {
      flowSteps,
      flowSequence,
      totalFlowTime: flowSequence.length > 1 ? 
        flowSequence[flowSequence.length - 1].timestamp.getTime() - flowSequence[0].timestamp.getTime() : 0,
      completedSuccessfully: flowSequence.some(s => s.status && s.status < 300),
      hasErrors: flowSequence.some(s => s.status && s.status >= 400)
    };
  }

  private identifyFlowStep(url: string): string {
    if (url.includes('/csrf')) return 'CSRF Token';
    if (url.includes('/signin')) return 'Sign In';
    if (url.includes('/callback')) return 'Callback';
    if (url.includes('/session')) return 'Session';
    if (url.includes('/providers')) return 'Providers';
    return 'Unknown';
  }

  private analyzeCSRFHandling(): any {
    const authRequests = this.networkRequests.filter(r => r.isAuthRelated);
    
    const csrfAnalysis = {
      csrfTokenRequests: authRequests.filter(r => r.url.includes('/csrf')),
      requestsWithCSRFHeaders: authRequests.filter(r => 
        r.headers['x-csrf-token'] || r.headers['x-xsrf-token']
      ),
      requestsWithCSRFData: authRequests.filter(r => 
        r.postData && (r.postData.includes('csrf') || r.postData.includes('_token'))
      ),
      potentialCSRFFailures: authRequests.filter(r => 
        r.type === 'response' && r.status === 302 && r.url.includes('/callback')
      )
    };

    return {
      ...csrfAnalysis,
      csrfTokenFound: csrfAnalysis.csrfTokenRequests.length > 0,
      csrfProtectionActive: csrfAnalysis.requestsWithCSRFHeaders.length > 0 || 
                           csrfAnalysis.requestsWithCSRFData.length > 0,
      suspectedCSRFIssues: csrfAnalysis.potentialCSRFFailures.length > 0
    };
  }

  private generateNetworkRecommendations(detectedPatterns: any[], performanceMetrics: any, errorAnalysis: any): string[] {
    const recommendations: string[] = [];

    // Pattern-based recommendations
    const criticalPatterns = detectedPatterns.filter(p => p.severity === 'critical');
    if (criticalPatterns.length > 0) {
      recommendations.push(`CRITICAL: ${criticalPatterns.length} critical network patterns detected`);
      criticalPatterns.forEach(pattern => {
        recommendations.push(`  - ${pattern.description} (${pattern.count} occurrences)`);
      });
    }

    // Performance recommendations
    if (performanceMetrics.slowAuthRequests > 0) {
      recommendations.push(`Performance: ${performanceMetrics.slowAuthRequests} slow authentication requests detected`);
      recommendations.push('Consider optimizing authentication endpoints');
    }

    if (performanceMetrics.averageAuthResponseTime > 3000) {
      recommendations.push(`Performance: Average auth response time is ${performanceMetrics.averageAuthResponseTime.toFixed(2)}ms (consider optimization)`);
    }

    // Error recommendations
    if (errorAnalysis.authErrors > 0) {
      recommendations.push(`Reliability: ${errorAnalysis.authErrors} authentication errors detected`);
      recommendations.push('Review authentication error handling');
    }

    // CSRF recommendations
    const csrfPattern = detectedPatterns.find(p => p.category === 'csrf');
    if (csrfPattern) {
      recommendations.push('Security: CSRF-related issues detected - review CSRF token handling');
    }

    if (recommendations.length === 0) {
      recommendations.push('Network analysis shows no critical issues with authentication flow');
    }

    return recommendations;
  }

  getNetworkRequests(): NetworkRequest[] {
    return [...this.networkRequests];
  }

  getAuthenticationRequests(): NetworkRequest[] {
    return this.networkRequests.filter(r => r.isAuthRelated);
  }
}

test.describe('Network Request Analysis', () => {
  let networkAnalyzer: NetworkAnalyzer;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    networkAnalyzer = new NetworkAnalyzer(page);
    authHelper = new AuthHelper(page);
  });

  test.afterEach(async () => {
    if (networkAnalyzer) {
      networkAnalyzer.stopNetworkMonitoring();
    }
  });

  test('should perform comprehensive network analysis of authentication flow', async ({ page }) => {
    console.log('🌐 [NETWORK-TEST] Starting comprehensive network analysis');

    await networkAnalyzer.startNetworkMonitoring();

    // Perform complete authentication flow while monitoring
    await authHelper.navigateToLogin();
    
    try {
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        timeout: 20000
      });
      console.log('✅ [NETWORK-TEST] Authentication completed successfully');
      
      // Logout to capture complete flow
      await authHelper.performLogout({ timeout: 10000 });
    } catch (error) {
      console.log(`⚠️ [NETWORK-TEST] Authentication flow failed: ${error.message}`);
    }

    // Allow time for all network requests to complete
    await page.waitForTimeout(3000);

    networkAnalyzer.stopNetworkMonitoring();

    // Generate comprehensive analysis
    const networkAnalysis = networkAnalyzer.getNetworkAnalysis();
    console.log('📋 [NETWORK-TEST] Network Analysis Report:', JSON.stringify(networkAnalysis, null, 2));

    // Validate analysis results
    expect(networkAnalysis.summary.totalRequests).toBeGreaterThan(0);
    expect(networkAnalysis.summary.authRequests).toBeGreaterThan(0);

    // Log key findings
    console.log(`📊 [NETWORK-TEST] Network Analysis Summary:`);
    console.log(`  Total requests: ${networkAnalysis.summary.totalRequests}`);
    console.log(`  Auth requests: ${networkAnalysis.summary.authRequests}`);
    console.log(`  Success rate: ${networkAnalysis.summary.successRate}`);
    console.log(`  Detected patterns: ${networkAnalysis.detectedPatterns.length}`);

    if (networkAnalysis.detectedPatterns.length > 0) {
      console.log('🚨 [NETWORK-TEST] Detected Network Patterns:');
      networkAnalysis.detectedPatterns.forEach(pattern => {
        console.log(`  - ${pattern.pattern} (${pattern.severity}): ${pattern.description}`);
        console.log(`    Occurrences: ${pattern.count}`);
      });
    }

    if (networkAnalysis.recommendations.length > 0) {
      console.log('💡 [NETWORK-TEST] Recommendations:');
      networkAnalysis.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    console.log('✅ [NETWORK-TEST] Comprehensive network analysis completed');
  });

  test('should analyze CSRF token handling in network requests', async ({ page }) => {
    console.log('🛡️ [NETWORK-TEST] Starting CSRF token network analysis');

    await networkAnalyzer.startNetworkMonitoring();

    await authHelper.navigateToLogin();
    
    // Attempt authentication while monitoring CSRF handling
    try {
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        validateCSRF: true,
        timeout: 20000
      });
    } catch (error) {
      console.log(`⚠️ [NETWORK-TEST] Authentication failed during CSRF analysis: ${error.message}`);
    }

    await page.waitForTimeout(2000);
    networkAnalyzer.stopNetworkMonitoring();

    // Analyze CSRF handling
    const networkAnalysis = networkAnalyzer.getNetworkAnalysis();
    const csrfAnalysis = networkAnalysis.csrfAnalysis;

    console.log('🛡️ [NETWORK-TEST] CSRF Analysis Results:');
    console.log(`  CSRF token requests: ${csrfAnalysis.csrfTokenRequests.length}`);
    console.log(`  Requests with CSRF headers: ${csrfAnalysis.requestsWithCSRFHeaders.length}`);
    console.log(`  Requests with CSRF data: ${csrfAnalysis.requestsWithCSRFData.length}`);
    console.log(`  CSRF token found: ${csrfAnalysis.csrfTokenFound}`);
    console.log(`  CSRF protection active: ${csrfAnalysis.csrfProtectionActive}`);
    console.log(`  Suspected CSRF issues: ${csrfAnalysis.suspectedCSRFIssues}`);

    if (csrfAnalysis.potentialCSRFFailures.length > 0) {
      console.log('🚨 [NETWORK-TEST] POTENTIAL CSRF FAILURES DETECTED:');
      csrfAnalysis.potentialCSRFFailures.forEach((failure, index) => {
        console.log(`  ${index + 1}. ${failure.method} ${failure.url} - Status: ${failure.status}`);
      });
    }

    // Check for CSRF-related patterns
    const csrfPatterns = networkAnalysis.detectedPatterns.filter(p => p.category === 'csrf');
    if (csrfPatterns.length > 0) {
      console.log('🚨 [NETWORK-TEST] CSRF-RELATED PATTERNS DETECTED:');
      csrfPatterns.forEach(pattern => {
        console.log(`  - ${pattern.pattern}: ${pattern.description} (${pattern.count} times)`);
      });
    } else {
      console.log('✅ [NETWORK-TEST] No CSRF-related issues detected in network traffic');
    }

    expect(networkAnalysis.csrfAnalysis).toBeTruthy();
    console.log('✅ [NETWORK-TEST] CSRF token network analysis completed');
  });

  test('should monitor authentication performance through network analysis', async ({ page }) => {
    console.log('⏱️ [NETWORK-TEST] Starting authentication performance network monitoring');

    await networkAnalyzer.startNetworkMonitoring();

    // Perform multiple authentication cycles to gather performance data
    for (let i = 0; i < 3; i++) {
      console.log(`🔄 [NETWORK-TEST] Performance cycle ${i + 1}/3`);
      
      await authHelper.navigateToLogin();
      
      try {
        await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 20000
        });
        
        await authHelper.performLogout({ timeout: 10000 });
      } catch (error) {
        console.log(`⚠️ [NETWORK-TEST] Cycle ${i + 1} failed: ${error.message}`);
      }
      
      // Brief pause between cycles
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(3000);
    networkAnalyzer.stopNetworkMonitoring();

    // Analyze performance metrics
    const networkAnalysis = networkAnalyzer.getNetworkAnalysis();
    const performanceMetrics = networkAnalysis.performanceMetrics;

    console.log('⏱️ [NETWORK-TEST] Performance Analysis Results:');
    console.log(`  Average auth response time: ${performanceMetrics.averageAuthResponseTime.toFixed(2)}ms`);
    console.log(`  Slow auth requests: ${performanceMetrics.slowAuthRequests}`);
    console.log(`  Fastest auth request: ${performanceMetrics.fastestAuthRequest}ms`);
    console.log(`  Slowest auth request: ${performanceMetrics.slowestAuthRequest}ms`);

    // Analyze auth flow performance
    const authFlowAnalysis = networkAnalysis.authFlowAnalysis;
    console.log(`  Total auth flow time: ${authFlowAnalysis.totalFlowTime}ms`);
    console.log(`  Flow completed successfully: ${authFlowAnalysis.completedSuccessfully}`);
    console.log(`  Flow has errors: ${authFlowAnalysis.hasErrors}`);

    if (authFlowAnalysis.flowSequence.length > 0) {
      console.log('📊 [NETWORK-TEST] Authentication Flow Sequence:');
      authFlowAnalysis.flowSequence.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.step}: ${step.method} (${step.timing}ms) - Status: ${step.status || 'N/A'}`);
      });
    }

    // Performance assertions
    if (performanceMetrics.averageAuthResponseTime > 0) {
      expect(performanceMetrics.averageAuthResponseTime).toBeLessThan(10000); // 10 seconds max average
    }

    console.log('✅ [NETWORK-TEST] Authentication performance network monitoring completed');
  });

  test('should detect and analyze network error patterns', async ({ page }) => {
    console.log('🚨 [NETWORK-TEST] Starting network error pattern detection');

    await networkAnalyzer.startNetworkMonitoring();

    // Scenario 1: Normal authentication
    await authHelper.navigateToLogin();
    try {
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS);
      await authHelper.performLogout();
    } catch (error) {
      console.log('⚠️ [NETWORK-TEST] Normal authentication failed (may indicate issues)');
    }

    // Scenario 2: Invalid credentials
    await authHelper.navigateToLogin();
    try {
      await authHelper.performLogin({ email: 'wrong@example.com', password: 'wrongpass' }, {
        waitForRedirect: false,
        timeout: 10000
      });
    } catch (error) {
      console.log('✅ [NETWORK-TEST] Invalid credentials correctly rejected');
    }

    // Scenario 3: Network interruption simulation
    await authHelper.navigateToLogin();
    try {
      // Block authentication requests temporarily
      await page.route('**/api/auth/callback/**', route => route.abort());
      
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        waitForRedirect: false,
        timeout: 10000
      });
      
      // Unblock requests
      await page.unroute('**/api/auth/callback/**');
    } catch (error) {
      console.log('✅ [NETWORK-TEST] Network interruption test completed');
    }

    await page.waitForTimeout(3000);
    networkAnalyzer.stopNetworkMonitoring();

    // Analyze detected error patterns
    const networkAnalysis = networkAnalyzer.getNetworkAnalysis();
    const errorAnalysis = networkAnalysis.errorAnalysis;
    const detectedPatterns = networkAnalysis.detectedPatterns;

    console.log('🚨 [NETWORK-TEST] Error Pattern Analysis:');
    console.log(`  Total network errors: ${errorAnalysis.totalErrors}`);
    console.log(`  Auth-related errors: ${errorAnalysis.authErrors}`);
    console.log(`  Detected patterns: ${detectedPatterns.length}`);

    if (Object.keys(errorAnalysis.errorsByStatus).length > 0) {
      console.log('📊 [NETWORK-TEST] Errors by HTTP Status:');
      Object.entries(errorAnalysis.errorsByStatus).forEach(([status, count]) => {
        console.log(`  - HTTP ${status}: ${count} occurrences`);
      });
    }

    if (detectedPatterns.length > 0) {
      console.log('🔍 [NETWORK-TEST] Detected Error Patterns:');
      detectedPatterns.forEach(pattern => {
        console.log(`  - ${pattern.pattern} (${pattern.severity}): ${pattern.count} occurrences`);
        console.log(`    Description: ${pattern.description}`);
      });
    }

    // Analyze specific authentication requests
    const authRequests = networkAnalyzer.getAuthenticationRequests();
    const failedAuthRequests = authRequests.filter(r => 
      (r.status && r.status >= 400) || r.error
    );

    if (failedAuthRequests.length > 0) {
      console.log('❌ [NETWORK-TEST] Failed Authentication Requests:');
      failedAuthRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
        console.log(`     Status: ${req.status || 'N/A'}, Error: ${req.error || 'N/A'}`);
      });
    }

    expect(networkAnalysis.errorAnalysis).toBeTruthy();
    console.log('✅ [NETWORK-TEST] Network error pattern detection completed');
  });
});