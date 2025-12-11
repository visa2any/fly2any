/**
 * Fare Reconciliation Testing Module
 *
 * Comprehensive E2E testing framework for validating fare consistency
 * between UI display and API responses.
 *
 * ## Overview
 *
 * This module ensures that:
 * 1. UI-displayed prices match API prices after markup
 * 2. Fare families are correctly labeled
 * 3. Baggage allowances are accurately shown
 * 4. Change/refund policies match API data
 *
 * ## Markup Strategy
 *
 * Fly2Any applies markup to Duffel flights:
 * - Formula: MAX(7%, $22 minimum), capped at $200
 *
 * Examples:
 * | Base Price | Markup    | Customer Price |
 * |------------|-----------|----------------|
 * | $100       | $22 (min) | $122           |
 * | $200       | $22 (min) | $222           |
 * | $314       | $22 (min) | $336           |
 * | $500       | $35 (7%)  | $535           |
 * | $1000      | $70 (7%)  | $1070          |
 * | $3000      | $200 (cap)| $3200          |
 *
 * ## Test Suites
 *
 * ### 1. Playwright E2E Tests (fare-reconciliation.spec.ts)
 * - Full browser automation
 * - Captures UI DOM for price/fare comparison
 * - Takes screenshots on failure
 *
 * ### 2. API Tests (api-tests.spec.ts)
 * - Direct API validation (no browser)
 * - Faster execution for CI/CD
 * - Markup calculation verification
 *
 * ## Running Tests
 *
 * ```bash
 * # Run all fare reconciliation tests
 * npm run test:fares
 *
 * # Run API-only tests (faster)
 * npm run test:fares:api
 *
 * # Generate HTML report
 * npm run test:fares:report
 *
 * # Live monitoring (one-time)
 * npm run monitor:fares
 *
 * # Continuous monitoring
 * npm run monitor:fares:continuous
 * ```
 *
 * ## CI/CD Integration
 *
 * Tests run automatically via GitHub Actions:
 * - On schedule: Every 6 hours
 * - On PRs touching fare-related files
 * - On pushes to main branch
 *
 * See: .github/workflows/fare-reconciliation.yml
 *
 * ## Reports
 *
 * Reports are generated in: test-results/fare-reconciliation/
 * - latest.html - Human-readable HTML report
 * - latest.json - Machine-readable JSON data
 *
 * ## Monitoring
 *
 * For production monitoring:
 *
 * ```bash
 * # Set environment variables
 * export MONITOR_BASE_URL=https://www.fly2any.com
 * export SLACK_WEBHOOK_URL=https://hooks.slack.com/...
 *
 * # Run continuous monitoring
 * npm run monitor:fares:continuous
 * ```
 *
 * @module fare-reconciliation
 */

// Type exports
export * from './types';

// Report generator
export { generateReport, generateHTMLReport, saveReport } from './report-generator';

// Default export for convenience
export default {
  description: 'Fare Reconciliation Testing Module',
  tests: [
    'fare-reconciliation.spec.ts',
    'api-tests.spec.ts',
  ],
  scripts: {
    runTests: 'npm run test:fares',
    runApiTests: 'npm run test:fares:api',
    generateReport: 'npm run test:fares:report',
    monitor: 'npm run monitor:fares',
    monitorContinuous: 'npm run monitor:fares:continuous',
  },
};
