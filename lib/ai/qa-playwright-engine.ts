/**
 * AI QA & Playwright E2E Engine — Fly2Any
 * Guardian of quality and trust.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type TestSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';
export type TestCategory = 'e2e_journey' | 'ui_ux' | 'data_api' | 'ai_specific';

export interface TestResult {
  test_id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  severity: TestSeverity;
  duration_ms: number;
  timestamp: number;
  error?: string;
  root_cause?: string;
  suggested_fix?: string;
  screenshot_url?: string;
  video_url?: string;
  confidence: number;
}

export interface TestSuite {
  suite_id: string;
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  total_duration_ms: number;
  run_at: number;
}

export interface E2EFlowValidation {
  flow_name: string;
  steps: FlowStep[];
  overall_status: TestStatus;
  drop_off_step?: string;
  confidence: number;
}

export interface FlowStep {
  step: number;
  name: string;
  status: TestStatus;
  duration_ms: number;
  screenshot?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
export const E2E_TESTS = {
  // User Journey E2E
  BOOKING_FLOW: {
    name: 'Complete Booking Flow',
    category: 'e2e_journey' as TestCategory,
    severity: 'critical' as TestSeverity,
    steps: [
      'landing_page_load',
      'search_form_fill',
      'search_submit',
      'results_display',
      'fare_select',
      'extras_page',
      'passenger_details',
      'payment_page',
      'payment_submit',
      'confirmation_display',
    ],
  },
  SEAT_MAP: {
    name: 'Seat Map Interaction',
    category: 'e2e_journey' as TestCategory,
    severity: 'high' as TestSeverity,
    steps: ['open_seat_map', 'seats_visible', 'seat_select', 'seat_confirm'],
  },
  AUTH_FLOW: {
    name: 'Authentication Flow',
    category: 'e2e_journey' as TestCategory,
    severity: 'high' as TestSeverity,
    steps: ['login_page', 'credentials_enter', 'submit', 'dashboard_redirect'],
  },

  // UI/UX Validation
  MOBILE_RESPONSIVE: {
    name: 'Mobile Responsiveness',
    category: 'ui_ux' as TestCategory,
    severity: 'high' as TestSeverity,
    viewports: [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 14' },
      { width: 412, height: 915, name: 'Pixel 7' },
    ],
  },
  MODAL_BEHAVIOR: {
    name: 'Modal Stability',
    category: 'ui_ux' as TestCategory,
    severity: 'medium' as TestSeverity,
    checks: ['no_unexpected_close', 'backdrop_click', 'escape_key', 'focus_trap'],
  },
  APPLE_CLASS_UX: {
    name: 'Apple-Class UX Standards',
    category: 'ui_ux' as TestCategory,
    severity: 'medium' as TestSeverity,
    checks: ['spacing_8pt_grid', 'alignment', 'motion_smooth', 'touch_targets_44px'],
  },

  // Data & API Sync
  PRICE_CONSISTENCY: {
    name: 'Price API Consistency',
    category: 'data_api' as TestCategory,
    severity: 'critical' as TestSeverity,
    checks: ['search_price_match', 'extras_price_match', 'total_calculation', 'currency_format'],
  },
  AVAILABILITY_SYNC: {
    name: 'Availability Sync',
    category: 'data_api' as TestCategory,
    severity: 'high' as TestSeverity,
    checks: ['seat_availability', 'fare_availability', 'real_time_update'],
  },

  // AI-Specific Tests
  AGENT_ROUTING: {
    name: 'AI Agent Routing',
    category: 'ai_specific' as TestCategory,
    severity: 'high' as TestSeverity,
    scenarios: ['booking_intent', 'support_intent', 'complaint_intent', 'vip_detection'],
  },
  HALLUCINATION_CHECK: {
    name: 'AI Hallucination Prevention',
    category: 'ai_specific' as TestCategory,
    severity: 'critical' as TestSeverity,
    checks: ['price_accuracy', 'policy_accuracy', 'no_invented_features'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  suites: [] as TestSuite[],
  lastRun: 0,
  failurePatterns: new Map<string, number>(),
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record test result
 */
export function recordTestResult(result: Omit<TestResult, 'test_id' | 'timestamp'>): TestResult {
  const fullResult: TestResult = {
    ...result,
    test_id: generateEventId(),
    timestamp: Date.now(),
  };

  // Track failure patterns
  if (result.status === 'failed') {
    const key = `${result.category}:${result.name}`;
    state.failurePatterns.set(key, (state.failurePatterns.get(key) || 0) + 1);
  }

  return fullResult;
}

/**
 * Create test suite from results
 */
export function createTestSuite(name: string, tests: TestResult[]): TestSuite {
  const suite: TestSuite = {
    suite_id: generateEventId(),
    name,
    tests,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    skipped: tests.filter(t => t.status === 'skipped').length,
    total_duration_ms: tests.reduce((sum, t) => sum + t.duration_ms, 0),
    run_at: Date.now(),
  };

  state.suites.unshift(suite);
  if (state.suites.length > 50) state.suites = state.suites.slice(0, 50);
  state.lastRun = Date.now();

  return suite;
}

/**
 * Validate E2E flow
 */
export function validateE2EFlow(
  flowName: string,
  stepResults: { name: string; passed: boolean; duration_ms: number }[]
): E2EFlowValidation {
  const steps: FlowStep[] = stepResults.map((s, i) => ({
    step: i + 1,
    name: s.name,
    status: s.passed ? 'passed' : 'failed',
    duration_ms: s.duration_ms,
  }));

  const firstFailure = steps.find(s => s.status === 'failed');
  const allPassed = steps.every(s => s.status === 'passed');

  return {
    flow_name: flowName,
    steps,
    overall_status: allPassed ? 'passed' : 'failed',
    drop_off_step: firstFailure?.name,
    confidence: allPassed ? 1 : steps.filter(s => s.status === 'passed').length / steps.length,
  };
}

/**
 * Generate test report
 */
export function generateTestReport(suite: TestSuite): {
  summary: string;
  critical_failures: TestResult[];
  recommendations: string[];
  health_score: number;
} {
  const criticalFailures = suite.tests.filter(
    t => t.status === 'failed' && t.severity === 'critical'
  );

  const healthScore = suite.passed / (suite.passed + suite.failed) || 0;

  const recommendations: string[] = [];
  if (criticalFailures.length > 0) {
    recommendations.push('URGENT: Fix critical test failures before deployment');
  }
  if (healthScore < 0.9) {
    recommendations.push('Test health below 90% - review failing tests');
  }

  // Check for flaky tests
  state.failurePatterns.forEach((count, key) => {
    if (count >= 3) {
      recommendations.push(`Flaky test detected: ${key} (failed ${count} times)`);
    }
  });

  return {
    summary: `${suite.passed}/${suite.tests.length} passed (${(healthScore * 100).toFixed(0)}%)`,
    critical_failures: criticalFailures,
    recommendations,
    health_score: healthScore,
  };
}

/**
 * Get recent test suites
 */
export function getRecentSuites(limit = 10): TestSuite[] {
  return state.suites.slice(0, limit);
}

/**
 * Get failure trends
 */
export function getFailureTrends(): { test: string; failures: number }[] {
  return Array.from(state.failurePatterns.entries())
    .map(([test, failures]) => ({ test, failures }))
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYWRIGHT CONFIG GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Playwright test config
 */
export function getPlaywrightConfig() {
  return {
    testDir: './tests/e2e',
    timeout: 30000,
    retries: 2,
    workers: 4,
    reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
    use: {
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'on-first-retry',
    },
    projects: [
      { name: 'chromium', use: { browserName: 'chromium' } },
      { name: 'webkit', use: { browserName: 'webkit' } },
      { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    ],
  };
}
