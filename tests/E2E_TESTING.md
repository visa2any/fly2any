# E2E Testing Guide - Fly2Any

## Overview

This guide covers the comprehensive End-to-End (E2E) testing suite for the Fly2Any booking platform, built with Playwright.

## Quick Start

### Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/flows/booking-flow.spec.ts

# Run tests on specific browser
npm run test:e2e:chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### View Test Reports

```bash
# View HTML report
npm run test:e2e:report

# Or
npx playwright show-report
```

## Test Structure

```
tests/e2e/
├── flows/                          # Test suites
│   ├── booking-flow.spec.ts        # Complete booking journey
│   ├── flight-search.spec.ts       # Search functionality
│   ├── filters.spec.ts             # Filter and sort tests
│   ├── seat-selection.spec.ts      # Seat map tests
│   ├── passenger-form.spec.ts      # Form validation
│   ├── payment.spec.ts             # Payment flow (mocked)
│   ├── accessibility.spec.ts       # WCAG compliance tests
│   ├── performance.spec.ts         # Performance metrics
│   └── mobile-responsive.spec.ts   # Mobile tests
├── pages/                          # Page Object Models
│   ├── home.page.ts
│   ├── flights-search.page.ts
│   └── flights-results.page.ts
├── fixtures/                       # Test data
│   ├── test-data.ts                # Reusable test data
│   └── mock-data.ts                # Mock API responses
└── helpers/                        # Utilities
    ├── test-helpers.ts             # Common functions
    └── selectors.ts                # CSS selectors
```

## Test Coverage

### 1. Booking Flow Tests (`booking-flow.spec.ts`)

**Complete E2E Journey:**
- ✅ Search → Results → Seat Selection → Passenger Details → Payment → Confirmation
- ✅ Multiple passengers booking
- ✅ Duplicate booking prevention
- ✅ API error handling
- ✅ Session persistence

**Edge Cases:**
- Session timeout handling
- Passenger age validation
- Payment card validation

### 2. Flight Search Tests (`flight-search.spec.ts`)

**Core Functionality:**
- ✅ Basic flight search (one-way, round-trip)
- ✅ Multiple passengers
- ✅ Business/First class
- ✅ Direct flights filter
- ✅ Invalid airport codes
- ✅ Required field validation
- ✅ Rapid search requests
- ✅ URL parameter preservation
- ✅ Browser navigation (back/forward)

### 3. Filter Tests (`filters.spec.ts`)

**Filter Types:**
- ✅ Price range filter
- ✅ Number of stops (Direct, 1-stop, 2+)
- ✅ Airline filter
- ✅ Reset all filters
- ✅ Combined filters
- ✅ Filter persistence with sorting
- ✅ No results message
- ✅ URL parameter updates

**UI Tests:**
- ✅ Filter counts
- ✅ Keyboard accessibility
- ✅ Mobile filter drawer

### 4. Seat Selection Tests (`seat-selection.spec.ts`)

**Seat Map Features:**
- ✅ Display seat map correctly
- ✅ Select available seats
- ✅ Prevent selecting occupied seats
- ✅ Premium/exit row pricing
- ✅ Skip seat selection
- ✅ Confirm and proceed
- ✅ Multiple passenger seat selection
- ✅ Seat legend display

**Edge Cases:**
- Seat map loading errors
- Insufficient seat selection validation

### 5. Passenger Form Tests (`passenger-form.spec.ts`)

**Validation:**
- ✅ Required fields validation
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Date of birth validation
- ✅ Passport number validation
- ✅ Name field validation (no special characters)
- ✅ Multiple passengers
- ✅ Form data preservation

**Accessibility:**
- ✅ Keyboard navigation
- ✅ Proper labels and ARIA attributes

### 6. Payment Tests (`payment.spec.ts`)

**Payment Flow:**
- ✅ Display payment form
- ✅ Show price breakdown
- ✅ Validate required fields
- ✅ Process successful payment (mocked)
- ✅ Handle declined payment
- ✅ Terms and conditions validation
- ✅ Processing state
- ✅ Calculate total price
- ✅ Handle payment timeout
- ✅ Multiple payment methods
- ✅ Preserve booking after failure

**Security:**
- ✅ Secure Stripe iframes
- ✅ No sensitive data in console

### 7. Accessibility Tests (`accessibility.spec.ts`)

**Automated WCAG Testing:**
- ✅ Homepage (WCAG 2.1 AA)
- ✅ Flights search page
- ✅ Flight results page
- ✅ Hotels page

**Manual Verification:**
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Color contrast
- ✅ Heading hierarchy
- ✅ ARIA labels
- ✅ Alt text
- ✅ Zoom support (200%)

### 8. Performance Tests (`performance.spec.ts`)

- Web vitals (LCP, FID, CLS)
- Page load times
- Bundle size monitoring

### 9. Mobile Tests (`mobile-responsive.spec.ts`)

- Touch interactions
- Viewport responsiveness
- Mobile-specific UI elements

## Test Data

### Mock Data (`fixtures/mock-data.ts`)

```typescript
// Passenger data
mockPassengerData.adult1
mockPassengerData.adult2
mockPassengerData.child1

// Payment data
mockPaymentData.validCard      // Test Stripe card
mockPaymentData.declinedCard   // Declined card
mockPaymentData.invalidCard    // Invalid card

// Flight results
mockFlightResults              // Array of sample flights

// Seat map
mockSeatMap.economy
mockSeatMap.business
```

### Test Routes (`fixtures/test-data.ts`)

```typescript
testFlights.domestic       // JFK → LAX
testFlights.international  // JFK → LHR
testFlights.shortHaul      // JFK → MIA
testFlights.longHaul       // JFK → NRT
```

## Helper Functions

### Common Operations

```typescript
// Fill search form
await fillFlightSearchForm(page, {
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2025-12-01',
  returnDate: '2025-12-07',
  adults: 1,
});

// Wait for results
await waitForSearchResults(page);

// Select first flight
await selectFirstFlight(page);

// Fill passenger form
await fillPassengerForm(page, mockPassengerData.adult1, 0);

// Mock payment
await mockStripePayment(page);
```

## Page Object Model

### Example: FlightsSearchPage

```typescript
const flightsPage = new FlightsSearchPage(page);

// Navigate
await flightsPage.goto();

// Verify loaded
await flightsPage.verifyPageLoaded();

// Search
await flightsPage.searchFlight({
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2025-12-01',
  returnDate: '2025-12-07',
  adults: 1,
});
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### GitHub Actions Workflow

Located at: `.github/workflows/e2e-tests.yml`

**Jobs:**
1. **test**: Runs E2E tests on Chromium, Firefox, and WebKit
2. **accessibility**: Runs WCAG compliance tests
3. **mobile**: Runs mobile-specific tests
4. **report**: Publishes test reports

### Viewing CI Test Results

1. Go to GitHub Actions tab
2. Select the E2E Tests workflow
3. Download artifacts:
   - `playwright-report-{browser}`: HTML test reports
   - `test-results-{browser}`: Screenshots and traces (on failure)
   - `accessibility-report`: Accessibility scan results

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to page, mock APIs, etc.
    await page.goto('/my-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator(selectors.myElement);

    // Act
    await element.click();

    // Assert
    await expect(element).toHaveClass(/active/);

    console.log('✅ Test passed!');
  });
});
```

### Best Practices

1. **Use Page Object Model**: Encapsulate page interactions
2. **Use Selectors Helper**: Centralize CSS selectors
3. **Mock External APIs**: Use `page.route()` for faster tests
4. **Wait Appropriately**: Use `waitForLoadState`, `waitForSelector`
5. **Add Console Logs**: Help with debugging test failures
6. **Test Edge Cases**: Don't just test happy paths
7. **Keep Tests Independent**: Each test should run standalone
8. **Use Test Data Fixtures**: Reuse common test data
9. **Add Accessibility Tests**: Use axe-core for automated checks
10. **Take Screenshots on Failure**: Automatic in CI

### Debugging Tips

```bash
# Run in debug mode
npm run test:e2e:debug

# Run with headed browser
npm run test:e2e:headed

# Run single test
npx playwright test -g "should complete booking"

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Test Configuration

Located at: `playwright.config.ts`

```typescript
{
  timeout: 60000,              // 60s per test
  retries: 2,                  // Retry failed tests (CI only)
  workers: undefined,          // Parallel workers
  reporter: [
    ['html'],                  // HTML report
    ['list'],                  // Console output
    ['json'],                  // JSON results
    ['junit'],                 // JUnit XML
  ],
}
```

### Browser Projects

- **Desktop**: chromium, firefox, webkit
- **Mobile**: Mobile Chrome, Mobile Safari
- **Tablet**: iPad Pro

## Common Issues

### 1. Test Timeouts

**Problem**: Test times out waiting for element

**Solution**:
```typescript
// Increase timeout for specific wait
await page.waitForSelector(selector, { timeout: 60000 });

// Or increase global timeout in config
timeout: 90000
```

### 2. Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solutions**:
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use `waitForSelector` instead of fixed timeouts
- Ensure test data is unique (use timestamps)
- Check for race conditions

### 3. Selector Not Found

**Problem**: Element not found error

**Solutions**:
- Verify selector in browser DevTools
- Wait for page to load: `await page.waitForLoadState('networkidle')`
- Check if element is in iframe
- Use more specific selectors

### 4. Tests Fail in CI but Pass Locally

**Solutions**:
- Check for timing issues (CI is slower)
- Verify environment variables are set
- Ensure database/API mocks are properly configured
- Check browser versions match

## Performance Metrics

Tests monitor:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Page Load Time**: < 3s

## Accessibility Standards

Tests check for WCAG 2.1 Level AA compliance:
- Keyboard navigation
- Screen reader support
- Color contrast (4.5:1 minimum)
- Touch target size (44x44px minimum)
- Proper heading hierarchy
- ARIA attributes
- Form labels
- Alt text for images

## Reporting Issues

When a test fails:

1. **Check the HTML report**: `npm run test:e2e:report`
2. **Review screenshots**: `test-results/`
3. **Check traces**: Available in test results
4. **Review console logs**: Errors and warnings
5. **Reproduce locally**: Run the specific test

Include in bug report:
- Test name
- Browser/device
- Error message
- Screenshot/trace
- Steps to reproduce

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [axe-core](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Support

For questions or issues:
- Check this documentation
- Review existing tests for examples
- Consult Playwright docs
- Ask the QA team

## Next Steps

1. Run the test suite: `npm run test:e2e`
2. Review test reports
3. Write additional tests for new features
4. Maintain test coverage above 80%
5. Keep tests fast and reliable
