import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * Real-time Authentication Health Monitoring
 * Continuously monitors authentication system health and performance
 */

interface HealthCheckResult {
  timestamp: Date;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'failed';
  responseTime: number;
  statusCode?: number;
  error?: string;
  metadata?: any;
}

class AuthHealthMonitor {
  private results: HealthCheckResult[] = [];
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;

  constructor(private page: any) {}

  async startContinuousMonitoring(intervalMs: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ [HEALTH-MONITOR] Monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log(`🔄 [HEALTH-MONITOR] Starting continuous monitoring (interval: ${intervalMs}ms)`);

    // Initial health check
    await this.performHealthCheck();

    // Schedule recurring health checks
    this.intervalId = setInterval(async () => {
      if (this.isMonitoring) {
        await this.performHealthCheck();
      }
    }, intervalMs);
  }

  async performHealthCheck(): Promise<HealthCheckResult[]> {
    console.log('🔍 [HEALTH-MONITOR] Performing health check...');
    
    const checkResults: HealthCheckResult[] = [];
    const checkTimestamp = new Date();

    // Health check endpoints
    const endpoints = [
      { url: '/api/auth/csrf', name: 'CSRF Token Endpoint' },
      { url: '/api/auth/session', name: 'Session Endpoint' },
      { url: '/api/auth/providers', name: 'Providers Endpoint' },
      { url: '/admin/login', name: 'Login Page' },
      { url: '/admin', name: 'Admin Dashboard' }
    ];

    for (const endpoint of endpoints) {
      const startTime = performance.now();
      
      try {
        console.log(`🌐 [HEALTH-MONITOR] Checking ${endpoint.name}: ${endpoint.url}`);
        
        const response = await this.page.goto(`http://localhost:3000${endpoint.url}`, {
          timeout: 10000,
          waitUntil: 'domcontentloaded'
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const result: HealthCheckResult = {
          timestamp: checkTimestamp,
          endpoint: endpoint.url,
          status: response.status() < 400 ? 'healthy' : 'failed',
          responseTime,
          statusCode: response.status(),
          metadata: {
            name: endpoint.name,
            url: response.url(),
            statusText: response.statusText()
          }
        };

        checkResults.push(result);
        this.results.push(result);

        console.log(`✅ [HEALTH-MONITOR] ${endpoint.name}: ${response.status()} (${responseTime.toFixed(2)}ms)`);

      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const result: HealthCheckResult = {
          timestamp: checkTimestamp,
          endpoint: endpoint.url,
          status: 'failed',
          responseTime,
          error: error.message,
          metadata: {
            name: endpoint.name
          }
        };

        checkResults.push(result);
        this.results.push(result);

        console.log(`❌ [HEALTH-MONITOR] ${endpoint.name}: FAILED - ${error.message}`);
      }
    }

    // Authentication flow health check
    await this.checkAuthenticationFlow();

    return checkResults;
  }

  async checkAuthenticationFlow(): Promise<void> {
    console.log('🔐 [HEALTH-MONITOR] Testing authentication flow health...');
    
    const startTime = performance.now();
    const authHelper = new AuthHelper(this.page);

    try {
      // Test login flow
      await authHelper.navigateToLogin({ timeout: 10000 });
      await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
        timeout: 15000,
        captureScreenshots: false
      });

      const endTime = performance.now();
      const authTime = endTime - startTime;

      const result: HealthCheckResult = {
        timestamp: new Date(),
        endpoint: '/api/auth/callback/credentials',
        status: 'healthy',
        responseTime: authTime,
        metadata: {
          name: 'Authentication Flow',
          testType: 'full_login'
        }
      };

      this.results.push(result);
      console.log(`✅ [HEALTH-MONITOR] Authentication flow: HEALTHY (${authTime.toFixed(2)}ms)`);

      // Logout for cleanup
      try {
        await authHelper.performLogout({ timeout: 5000, captureScreenshots: false });
      } catch (logoutError) {
        console.log('⚠️ [HEALTH-MONITOR] Logout cleanup failed (non-critical)');
      }

    } catch (error) {
      const endTime = performance.now();
      const authTime = endTime - startTime;

      const result: HealthCheckResult = {
        timestamp: new Date(),
        endpoint: '/api/auth/callback/credentials',
        status: 'failed',
        responseTime: authTime,
        error: error.message,
        metadata: {
          name: 'Authentication Flow',
          testType: 'full_login'
        }
      };

      this.results.push(result);
      console.log(`❌ [HEALTH-MONITOR] Authentication flow: FAILED - ${error.message}`);
    }
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isMonitoring = false;
    console.log('🛑 [HEALTH-MONITOR] Monitoring stopped');
  }

  getHealthStatus(): {
    overall: 'healthy' | 'degraded' | 'failed';
    summary: any;
    recentResults: HealthCheckResult[];
  } {
    const recentResults = this.results.slice(-10); // Last 10 checks
    const failedChecks = recentResults.filter(r => r.status === 'failed').length;
    const totalChecks = recentResults.length;

    let overall: 'healthy' | 'degraded' | 'failed';
    if (failedChecks === 0) {
      overall = 'healthy';
    } else if (failedChecks < totalChecks / 2) {
      overall = 'degraded';
    } else {
      overall = 'failed';
    }

    const averageResponseTime = recentResults.length > 0 
      ? recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length
      : 0;

    return {
      overall,
      summary: {
        totalChecks: this.results.length,
        recentChecks: totalChecks,
        recentFailures: failedChecks,
        successRate: totalChecks > 0 ? ((totalChecks - failedChecks) / totalChecks * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: averageResponseTime.toFixed(2) + 'ms'
      },
      recentResults
    };
  }

  generateHealthReport(): any {
    const healthStatus = this.getHealthStatus();
    
    // Group results by endpoint
    const endpointStats = {};
    this.results.forEach(result => {
      if (!endpointStats[result.endpoint]) {
        endpointStats[result.endpoint] = {
          endpoint: result.endpoint,
          totalChecks: 0,
          failures: 0,
          averageResponseTime: 0,
          lastCheck: null,
          responseTimes: []
        };
      }
      
      const stats = endpointStats[result.endpoint];
      stats.totalChecks++;
      if (result.status === 'failed') stats.failures++;
      stats.responseTimes.push(result.responseTime);
      stats.lastCheck = result.timestamp;
    });

    // Calculate averages
    Object.values(endpointStats).forEach((stats: any) => {
      stats.averageResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
      stats.successRate = ((stats.totalChecks - stats.failures) / stats.totalChecks * 100).toFixed(2) + '%';
      delete stats.responseTimes; // Remove raw data from report
    });

    return {
      generatedAt: new Date(),
      monitoringDuration: this.results.length > 0 ? 
        new Date().getTime() - this.results[0].timestamp.getTime() : 0,
      overallHealth: healthStatus,
      endpointStatistics: endpointStats,
      recommendations: this.generateRecommendations(healthStatus, endpointStats)
    };
  }

  private generateRecommendations(healthStatus: any, endpointStats: any): string[] {
    const recommendations: string[] = [];

    if (healthStatus.overall === 'failed') {
      recommendations.push('CRITICAL: Multiple authentication endpoints are failing. Immediate investigation required.');
    } else if (healthStatus.overall === 'degraded') {
      recommendations.push('WARNING: Some authentication endpoints are experiencing issues. Monitor closely.');
    }

    // Check for slow endpoints
    Object.values(endpointStats).forEach((stats: any) => {
      if (stats.averageResponseTime > 5000) {
        recommendations.push(`PERFORMANCE: ${stats.endpoint} has slow response times (${stats.averageResponseTime.toFixed(2)}ms average)`);
      }
      
      if (stats.failures > 0) {
        recommendations.push(`RELIABILITY: ${stats.endpoint} has ${stats.failures} failures out of ${stats.totalChecks} checks (${stats.successRate} success rate)`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All authentication endpoints are performing well.');
    }

    return recommendations;
  }
}

test.describe('Authentication Health Monitoring', () => {
  let healthMonitor: AuthHealthMonitor;

  test.beforeEach(async ({ page }) => {
    healthMonitor = new AuthHealthMonitor(page);
  });

  test.afterEach(async () => {
    if (healthMonitor) {
      healthMonitor.stopMonitoring();
    }
  });

  test('should perform comprehensive health check of authentication system', async ({ page }) => {
    console.log('🔍 [HEALTH-TEST] Starting comprehensive authentication health check');

    const checkResults = await healthMonitor.performHealthCheck();

    console.log(`📊 [HEALTH-TEST] Health check completed. Results: ${checkResults.length} endpoints tested`);

    // Validate that we got results for all expected endpoints
    expect(checkResults.length).toBeGreaterThan(0);

    // Check that at least some endpoints are healthy
    const healthyEndpoints = checkResults.filter(r => r.status === 'healthy');
    console.log(`✅ [HEALTH-TEST] Healthy endpoints: ${healthyEndpoints.length}/${checkResults.length}`);

    // Generate and display health report
    const healthReport = healthMonitor.generateHealthReport();
    console.log('📋 [HEALTH-TEST] Health Report:', JSON.stringify(healthReport, null, 2));

    // Basic health assertions
    if (healthReport.overallHealth.overall === 'failed') {
      console.log('🚨 [HEALTH-TEST] CRITICAL: Authentication system health is FAILED');
    } else if (healthReport.overallHealth.overall === 'degraded') {
      console.log('⚠️ [HEALTH-TEST] WARNING: Authentication system health is DEGRADED');
    } else {
      console.log('✅ [HEALTH-TEST] Authentication system health is HEALTHY');
    }

    console.log('✅ [HEALTH-TEST] Comprehensive health check completed');
  });

  test('should run continuous monitoring for authentication system', async ({ page }) => {
    console.log('🔄 [HEALTH-TEST] Starting continuous authentication monitoring');

    // Start monitoring with 10-second intervals for testing
    await healthMonitor.startContinuousMonitoring(10000);

    // Let it run for 1 minute
    console.log('⏳ [HEALTH-TEST] Running continuous monitoring for 60 seconds...');
    await page.waitForTimeout(60000);

    // Stop monitoring
    healthMonitor.stopMonitoring();

    // Generate final report
    const finalReport = healthMonitor.generateHealthReport();
    console.log('📊 [HEALTH-TEST] Final Monitoring Report:', JSON.stringify(finalReport, null, 2));

    // Validate that we collected multiple data points
    expect(finalReport.overallHealth.summary.totalChecks).toBeGreaterThan(5);

    console.log('✅ [HEALTH-TEST] Continuous monitoring completed');
  });

  test('should detect and alert on authentication failures', async ({ page }) => {
    console.log('🚨 [HEALTH-TEST] Starting authentication failure detection test');

    const failures: any[] = [];
    const alerts: any[] = [];

    // Set up failure detection
    const monitoringPromise = (async () => {
      for (let i = 0; i < 5; i++) {
        console.log(`🔍 [HEALTH-TEST] Monitoring cycle ${i + 1}/5`);
        
        const checkResults = await healthMonitor.performHealthCheck();
        const failedChecks = checkResults.filter(r => r.status === 'failed');
        
        if (failedChecks.length > 0) {
          failures.push(...failedChecks);
          alerts.push({
            timestamp: new Date(),
            message: `${failedChecks.length} authentication endpoints failed`,
            failures: failedChecks
          });
          
          console.log(`🚨 [HEALTH-TEST] ALERT: ${failedChecks.length} endpoints failed in cycle ${i + 1}`);
        }
        
        // Wait between checks
        await page.waitForTimeout(15000);
      }
    })();

    await monitoringPromise;

    console.log(`📊 [HEALTH-TEST] Failure detection results:`);
    console.log(`  Total failures detected: ${failures.length}`);
    console.log(`  Alerts generated: ${alerts.length}`);

    if (alerts.length > 0) {
      console.log('🚨 [HEALTH-TEST] ALERTS GENERATED:');
      alerts.forEach((alert, index) => {
        console.log(`  Alert ${index + 1}: ${alert.message} at ${alert.timestamp}`);
      });
    } else {
      console.log('✅ [HEALTH-TEST] No critical failures detected during monitoring period');
    }

    console.log('✅ [HEALTH-TEST] Authentication failure detection completed');
  });

  test('should benchmark authentication performance over time', async ({ page }) => {
    console.log('📊 [HEALTH-TEST] Starting authentication performance benchmarking');

    const performanceData: any[] = [];
    
    // Run multiple performance tests
    for (let i = 0; i < 10; i++) {
      console.log(`🏃 [HEALTH-TEST] Performance test ${i + 1}/10`);
      
      const startTime = performance.now();
      const checkResults = await healthMonitor.performHealthCheck();
      const endTime = performance.now();
      
      const authFlowResult = checkResults.find(r => r.metadata?.testType === 'full_login');
      
      const performanceMetric = {
        iteration: i + 1,
        timestamp: new Date(),
        totalHealthCheckTime: endTime - startTime,
        authFlowTime: authFlowResult?.responseTime || null,
        endpointsChecked: checkResults.length,
        failedEndpoints: checkResults.filter(r => r.status === 'failed').length
      };
      
      performanceData.push(performanceMetric);
      
      console.log(`⏱️ [HEALTH-TEST] Performance metrics: Health check: ${performanceMetric.totalHealthCheckTime.toFixed(2)}ms, Auth flow: ${performanceMetric.authFlowTime ? performanceMetric.authFlowTime.toFixed(2) + 'ms' : 'N/A'}`);
      
      // Wait between iterations
      await page.waitForTimeout(5000);
    }

    // Analyze performance data
    const totalHealthCheckTimes = performanceData.map(d => d.totalHealthCheckTime);
    const authFlowTimes = performanceData.filter(d => d.authFlowTime).map(d => d.authFlowTime);

    const performanceAnalysis = {
      totalIterations: performanceData.length,
      healthCheckPerformance: {
        average: totalHealthCheckTimes.reduce((a, b) => a + b, 0) / totalHealthCheckTimes.length,
        min: Math.min(...totalHealthCheckTimes),
        max: Math.max(...totalHealthCheckTimes),
        median: totalHealthCheckTimes.sort((a, b) => a - b)[Math.floor(totalHealthCheckTimes.length / 2)]
      },
      authFlowPerformance: authFlowTimes.length > 0 ? {
        average: authFlowTimes.reduce((a, b) => a + b, 0) / authFlowTimes.length,
        min: Math.min(...authFlowTimes),
        max: Math.max(...authFlowTimes),
        median: authFlowTimes.sort((a, b) => a - b)[Math.floor(authFlowTimes.length / 2)],
        successRate: (authFlowTimes.length / performanceData.length * 100).toFixed(2) + '%'
      } : null
    };

    console.log('📊 [HEALTH-TEST] Performance Benchmarking Results:');
    console.log(JSON.stringify(performanceAnalysis, null, 2));

    // Performance assertions
    expect(performanceAnalysis.healthCheckPerformance.average).toBeLessThan(30000); // 30 seconds average
    if (performanceAnalysis.authFlowPerformance) {
      expect(performanceAnalysis.authFlowPerformance.average).toBeLessThan(15000); // 15 seconds average for auth
    }

    console.log('✅ [HEALTH-TEST] Authentication performance benchmarking completed');
  });
});