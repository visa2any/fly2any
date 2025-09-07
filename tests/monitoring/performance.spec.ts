import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';

/**
 * Authentication Performance Monitoring and Benchmarking
 * Measures and analyzes authentication system performance metrics
 */

interface PerformanceMetric {
  timestamp: Date;
  metricType: 'auth_flow' | 'page_load' | 'network' | 'api_response';
  operation: string;
  duration: number;
  status: 'success' | 'failed' | 'timeout';
  details?: any;
}

interface PerformanceBenchmark {
  name: string;
  expectedMaxDuration: number;
  criticalThreshold: number;
  description: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private benchmarks: PerformanceBenchmark[] = [
    {
      name: 'Login Page Load',
      expectedMaxDuration: 3000,
      criticalThreshold: 5000,
      description: 'Time to load login page and render form'
    },
    {
      name: 'Authentication Flow',
      expectedMaxDuration: 8000,
      criticalThreshold: 15000,
      description: 'Complete login process from submission to redirect'
    },
    {
      name: 'Session Validation',
      expectedMaxDuration: 1000,
      criticalThreshold: 3000,
      description: 'Time to validate existing session'
    },
    {
      name: 'CSRF Token Fetch',
      expectedMaxDuration: 500,
      criticalThreshold: 2000,
      description: 'Time to retrieve CSRF token'
    },
    {
      name: 'Admin Dashboard Load',
      expectedMaxDuration: 4000,
      criticalThreshold: 8000,
      description: 'Time to load admin dashboard after authentication'
    }
  ];

  constructor(private page: any) {}

  async measureOperation<T>(
    operation: string,
    metricType: PerformanceMetric['metricType'],
    operationFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = new Date();
    
    console.log(`⏱️ [PERF-MONITOR] Starting measurement: ${operation}`);
    
    try {
      const result = await operationFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        timestamp,
        metricType,
        operation,
        duration,
        status: 'success',
        details: { completedAt: new Date() }
      };
      
      this.metrics.push(metric);
      
      console.log(`✅ [PERF-MONITOR] ${operation} completed in ${duration.toFixed(2)}ms`);
      
      // Check against benchmarks
      this.checkPerformanceBenchmark(operation, duration);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const metric: PerformanceMetric = {
        timestamp,
        metricType,
        operation,
        duration,
        status: 'failed',
        details: { error: error.message, failedAt: new Date() }
      };
      
      this.metrics.push(metric);
      
      console.log(`❌ [PERF-MONITOR] ${operation} failed after ${duration.toFixed(2)}ms: ${error.message}`);
      
      throw error;
    }
  }

  private checkPerformanceBenchmark(operation: string, duration: number): void {
    const benchmark = this.benchmarks.find(b => 
      operation.toLowerCase().includes(b.name.toLowerCase())
    );
    
    if (benchmark) {
      if (duration > benchmark.criticalThreshold) {
        console.log(`🚨 [PERF-MONITOR] CRITICAL: ${operation} exceeded critical threshold (${duration.toFixed(2)}ms > ${benchmark.criticalThreshold}ms)`);
      } else if (duration > benchmark.expectedMaxDuration) {
        console.log(`⚠️ [PERF-MONITOR] WARNING: ${operation} exceeded expected duration (${duration.toFixed(2)}ms > ${benchmark.expectedMaxDuration}ms)`);
      } else {
        console.log(`✅ [PERF-MONITOR] GOOD: ${operation} within expected performance (${duration.toFixed(2)}ms < ${benchmark.expectedMaxDuration}ms)`);
      }
    }
  }

  async measureNetworkRequests(): Promise<any[]> {
    const networkMetrics: any[] = [];
    
    this.page.on('response', (response) => {
      if (response.url().includes('/api/auth/')) {
        const timing = response.request().timing();
        
        if (timing) {
          const networkMetric = {
            timestamp: new Date(),
            url: response.url(),
            method: response.request().method(),
            status: response.status(),
            timing: {
              dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
              connecting: timing.connectEnd - timing.connectStart,
              tlsHandshake: timing.secureConnectionStart > 0 ? timing.connectEnd - timing.secureConnectionStart : 0,
              requesting: timing.requestStart - timing.connectEnd,
              waiting: timing.responseStart - timing.requestStart,
              receiving: timing.responseEnd - timing.responseStart,
              total: timing.responseEnd - timing.domainLookupStart
            }
          };
          
          networkMetrics.push(networkMetric);
          console.log(`🌐 [PERF-MONITOR] Network: ${response.request().method()} ${response.url()} - ${networkMetric.timing.total.toFixed(2)}ms`);
        }
      }
    });

    return networkMetrics;
  }

  async measurePagePerformance(): Promise<any> {
    // Get browser performance metrics
    const performanceEntries = await this.page.evaluate(() => {
      return JSON.parse(JSON.stringify(performance.getEntriesByType('navigation')));
    });

    const webVitals = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        // Measure Core Web Vitals
        const vitals = {
          fcp: null, // First Contentful Paint
          lcp: null, // Largest Contentful Paint
          cls: null, // Cumulative Layout Shift
          fid: null  // First Input Delay
        };

        // FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime;
        }

        // LCP
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP might not be supported
        }

        // CLS
        try {
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // CLS might not be supported
        }

        // Return vitals after a short delay
        setTimeout(() => resolve(vitals), 1000);
      });
    });

    return {
      navigationTiming: performanceEntries[0] || null,
      webVitals,
      timestamp: new Date()
    };
  }

  getPerformanceReport(): any {
    const now = new Date();
    const metrics = this.metrics;
    
    // Group metrics by type
    const metricsByType = {
      auth_flow: metrics.filter(m => m.metricType === 'auth_flow'),
      page_load: metrics.filter(m => m.metricType === 'page_load'),
      network: metrics.filter(m => m.metricType === 'network'),
      api_response: metrics.filter(m => m.metricType === 'api_response')
    };

    // Calculate statistics for each type
    const statistics = {};
    Object.entries(metricsByType).forEach(([type, typeMetrics]) => {
      if (typeMetrics.length > 0) {
        const durations = typeMetrics.map(m => m.duration);
        const successful = typeMetrics.filter(m => m.status === 'success');
        
        statistics[type] = {
          count: typeMetrics.length,
          successCount: successful.length,
          successRate: (successful.length / typeMetrics.length * 100).toFixed(2) + '%',
          averageDuration: (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2),
          minDuration: Math.min(...durations).toFixed(2),
          maxDuration: Math.max(...durations).toFixed(2),
          medianDuration: durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]?.toFixed(2) || '0'
        };
      }
    });

    // Performance benchmark analysis
    const benchmarkAnalysis = this.benchmarks.map(benchmark => {
      const relatedMetrics = metrics.filter(m => 
        m.operation.toLowerCase().includes(benchmark.name.toLowerCase())
      );
      
      if (relatedMetrics.length === 0) {
        return {
          benchmark: benchmark.name,
          status: 'not_measured',
          metrics: []
        };
      }

      const averageDuration = relatedMetrics.reduce((sum, m) => sum + m.duration, 0) / relatedMetrics.length;
      const exceedingExpected = relatedMetrics.filter(m => m.duration > benchmark.expectedMaxDuration).length;
      const exceedingCritical = relatedMetrics.filter(m => m.duration > benchmark.criticalThreshold).length;

      let status: string;
      if (exceedingCritical > 0) {
        status = 'critical';
      } else if (exceedingExpected > relatedMetrics.length / 2) {
        status = 'warning';
      } else {
        status = 'good';
      }

      return {
        benchmark: benchmark.name,
        status,
        averageDuration: averageDuration.toFixed(2),
        expectedMax: benchmark.expectedMaxDuration,
        criticalThreshold: benchmark.criticalThreshold,
        totalMeasurements: relatedMetrics.length,
        exceedingExpected,
        exceedingCritical,
        description: benchmark.description
      };
    });

    return {
      generatedAt: now,
      totalMetrics: metrics.length,
      measurementPeriod: metrics.length > 0 ? {
        start: metrics[0].timestamp,
        end: metrics[metrics.length - 1].timestamp,
        duration: now.getTime() - metrics[0].timestamp.getTime()
      } : null,
      metricsByType: statistics,
      benchmarkAnalysis,
      recommendations: this.generatePerformanceRecommendations(benchmarkAnalysis, statistics)
    };
  }

  private generatePerformanceRecommendations(benchmarks: any[], statistics: any): string[] {
    const recommendations: string[] = [];

    // Check for critical performance issues
    const criticalBenchmarks = benchmarks.filter(b => b.status === 'critical');
    if (criticalBenchmarks.length > 0) {
      recommendations.push(`CRITICAL: ${criticalBenchmarks.length} operations exceeded critical performance thresholds`);
      criticalBenchmarks.forEach(b => {
        recommendations.push(`  - ${b.benchmark}: averaging ${b.averageDuration}ms (critical threshold: ${b.criticalThreshold}ms)`);
      });
    }

    // Check for warning level issues
    const warningBenchmarks = benchmarks.filter(b => b.status === 'warning');
    if (warningBenchmarks.length > 0) {
      recommendations.push(`WARNING: ${warningBenchmarks.length} operations exceeded expected performance levels`);
    }

    // Check success rates
    Object.entries(statistics).forEach(([type, stats]: [string, any]) => {
      const successRate = parseFloat(stats.successRate.replace('%', ''));
      if (successRate < 95) {
        recommendations.push(`Low success rate for ${type}: ${stats.successRate}`);
      }
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('All authentication operations are performing within expected thresholds');
    } else {
      recommendations.push('Consider optimizing authentication flow performance');
      recommendations.push('Review server resources and network connectivity');
      recommendations.push('Implement performance monitoring alerts for production');
    }

    return recommendations;
  }
}

test.describe('Authentication Performance Monitoring', () => {
  let performanceMonitor: PerformanceMonitor;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new PerformanceMonitor(page);
    authHelper = new AuthHelper(page);
  });

  test('should benchmark authentication flow performance', async ({ page }) => {
    console.log('📊 [PERF-TEST] Starting authentication performance benchmarking');

    // Benchmark login page load
    await performanceMonitor.measureOperation(
      'Login Page Load',
      'page_load',
      async () => {
        await authHelper.navigateToLogin();
        await page.waitForSelector('form.admin-login-form');
        return 'loaded';
      }
    );

    // Get page performance metrics
    const pagePerformance = await performanceMonitor.measurePagePerformance();
    console.log('📊 [PERF-TEST] Page performance metrics:', JSON.stringify(pagePerformance, null, 2));

    // Benchmark authentication flow
    await performanceMonitor.measureOperation(
      'Authentication Flow',
      'auth_flow',
      async () => {
        return await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
          timeout: 20000
        });
      }
    );

    // Benchmark admin dashboard load
    await performanceMonitor.measureOperation(
      'Admin Dashboard Load',
      'page_load',
      async () => {
        await page.waitForSelector('body');
        return 'dashboard_loaded';
      }
    );

    // Benchmark session validation
    await performanceMonitor.measureOperation(
      'Session Validation',
      'api_response',
      async () => {
        const authState = await authHelper.validateAuthenticationState();
        return authState;
      }
    );

    // Generate performance report
    const performanceReport = performanceMonitor.getPerformanceReport();
    console.log('📋 [PERF-TEST] Performance Report:', JSON.stringify(performanceReport, null, 2));

    // Validate performance benchmarks
    const criticalIssues = performanceReport.benchmarkAnalysis.filter(b => b.status === 'critical');
    if (criticalIssues.length > 0) {
      console.log('🚨 [PERF-TEST] CRITICAL PERFORMANCE ISSUES DETECTED:');
      criticalIssues.forEach(issue => {
        console.log(`  - ${issue.benchmark}: ${issue.averageDuration}ms (threshold: ${issue.criticalThreshold}ms)`);
      });
    }

    // Basic performance assertions
    expect(performanceReport.totalMetrics).toBeGreaterThan(0);
    expect(performanceReport.benchmarkAnalysis).toBeTruthy();

    console.log('✅ [PERF-TEST] Authentication performance benchmarking completed');
  });

  test('should monitor network performance during authentication', async ({ page }) => {
    console.log('🌐 [PERF-TEST] Starting network performance monitoring');

    // Start network monitoring
    const networkMetricsPromise = performanceMonitor.measureNetworkRequests();

    await authHelper.navigateToLogin();

    // Perform authentication while monitoring network
    await performanceMonitor.measureOperation(
      'Network Monitored Authentication',
      'auth_flow',
      async () => {
        return await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS);
      }
    );

    // Let network monitoring capture all requests
    await page.waitForTimeout(2000);

    const networkMetrics = await networkMetricsPromise;
    console.log(`🌐 [PERF-TEST] Captured ${networkMetrics.length} network requests`);

    // Analyze network performance
    if (networkMetrics.length > 0) {
      const averageRequestTime = networkMetrics.reduce((sum, metric) => sum + metric.timing.total, 0) / networkMetrics.length;
      const slowRequests = networkMetrics.filter(metric => metric.timing.total > 2000);

      console.log('📊 [PERF-TEST] Network Performance Analysis:');
      console.log(`  Average request time: ${averageRequestTime.toFixed(2)}ms`);
      console.log(`  Slow requests (>2s): ${slowRequests.length}/${networkMetrics.length}`);

      networkMetrics.forEach((metric, index) => {
        console.log(`  ${index + 1}. ${metric.method} ${metric.url}: ${metric.timing.total.toFixed(2)}ms (${metric.status})`);
        if (metric.timing.total > 1000) {
          console.log(`     Breakdown: DNS: ${metric.timing.dnsLookup.toFixed(2)}ms, Connect: ${metric.timing.connecting.toFixed(2)}ms, Wait: ${metric.timing.waiting.toFixed(2)}ms`);
        }
      });

      if (slowRequests.length > 0) {
        console.log('⚠️ [PERF-TEST] Slow network requests detected - consider optimization');
      }
    }

    console.log('✅ [PERF-TEST] Network performance monitoring completed');
  });

  test('should perform stress testing on authentication system', async ({ page }) => {
    console.log('💪 [PERF-TEST] Starting authentication stress testing');

    const stressTestResults: any[] = [];
    const concurrentLogins = 3; // Reduced for single-browser testing

    // Perform multiple authentication cycles
    for (let cycle = 0; cycle < 5; cycle++) {
      console.log(`🔄 [PERF-TEST] Stress test cycle ${cycle + 1}/5`);

      const cycleStart = performance.now();

      try {
        // Navigate to login
        await performanceMonitor.measureOperation(
          `Stress Test Login Page Load (Cycle ${cycle + 1})`,
          'page_load',
          async () => {
            await authHelper.navigateToLogin();
            return 'loaded';
          }
        );

        // Perform authentication
        await performanceMonitor.measureOperation(
          `Stress Test Authentication (Cycle ${cycle + 1})`,
          'auth_flow',
          async () => {
            return await authHelper.performLogin(AuthHelper.ADMIN_CREDENTIALS, {
              timeout: 30000 // Extended timeout for stress conditions
            });
          }
        );

        // Validate session
        await performanceMonitor.measureOperation(
          `Stress Test Session Validation (Cycle ${cycle + 1})`,
          'api_response',
          async () => {
            return await authHelper.validateAuthenticationState();
          }
        );

        // Logout
        await performanceMonitor.measureOperation(
          `Stress Test Logout (Cycle ${cycle + 1})`,
          'auth_flow',
          async () => {
            await authHelper.performLogout({ timeout: 10000 });
            return 'logged_out';
          }
        );

        const cycleEnd = performance.now();
        const cycleDuration = cycleEnd - cycleStart;

        stressTestResults.push({
          cycle: cycle + 1,
          duration: cycleDuration,
          status: 'success',
          timestamp: new Date()
        });

        console.log(`✅ [PERF-TEST] Stress test cycle ${cycle + 1} completed in ${cycleDuration.toFixed(2)}ms`);

      } catch (error) {
        const cycleEnd = performance.now();
        const cycleDuration = cycleEnd - cycleStart;

        stressTestResults.push({
          cycle: cycle + 1,
          duration: cycleDuration,
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });

        console.log(`❌ [PERF-TEST] Stress test cycle ${cycle + 1} failed after ${cycleDuration.toFixed(2)}ms: ${error.message}`);
      }

      // Brief pause between cycles
      await page.waitForTimeout(2000);
    }

    // Analyze stress test results
    const successfulCycles = stressTestResults.filter(r => r.status === 'success');
    const failedCycles = stressTestResults.filter(r => r.status === 'failed');
    const averageCycleDuration = successfulCycles.length > 0 
      ? successfulCycles.reduce((sum, r) => sum + r.duration, 0) / successfulCycles.length
      : 0;

    console.log('💪 [PERF-TEST] Stress Test Results:');
    console.log(`  Total cycles: ${stressTestResults.length}`);
    console.log(`  Successful: ${successfulCycles.length}`);
    console.log(`  Failed: ${failedCycles.length}`);
    console.log(`  Success rate: ${(successfulCycles.length / stressTestResults.length * 100).toFixed(2)}%`);
    console.log(`  Average cycle duration: ${averageCycleDuration.toFixed(2)}ms`);

    if (failedCycles.length > 0) {
      console.log('❌ [PERF-TEST] Failed cycles:');
      failedCycles.forEach(cycle => {
        console.log(`  Cycle ${cycle.cycle}: ${cycle.error}`);
      });
    }

    // Generate final performance report
    const finalReport = performanceMonitor.getPerformanceReport();
    console.log('📋 [PERF-TEST] Final Performance Report:', JSON.stringify(finalReport, null, 2));

    // Stress test assertions
    const successRate = successfulCycles.length / stressTestResults.length;
    expect(successRate).toBeGreaterThan(0.7); // At least 70% success rate
    
    if (successfulCycles.length > 0) {
      expect(averageCycleDuration).toBeLessThan(60000); // Average cycle should be under 1 minute
    }

    console.log('✅ [PERF-TEST] Authentication stress testing completed');
  });
});