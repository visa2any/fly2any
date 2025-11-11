# Quick Start - E2E Testing

## 🚀 Run Tests in 30 Seconds

```bash
# 1. Install (first time only)
npm install
npx playwright install --with-deps

# 2. Run tests
npm run test:e2e

# 3. View report
npm run test:e2e:report
```

## 📋 Common Commands

```bash
# See tests run in browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui

# Debug mode with step-through
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/flows/booking-flow.spec.ts

# Run single test by name
npx playwright test -g "complete booking"

# Run on specific browser
npm run test:e2e:chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 📁 Test Files

```
tests/e2e/flows/
├── booking-flow.spec.ts       ← Complete booking journey
├── filters.spec.ts            ← Price, stops, airline filters
├── seat-selection.spec.ts     ← Seat map interactions
├── passenger-form.spec.ts     ← Form validation
├── payment.spec.ts            ← Payment processing
├── accessibility.spec.ts      ← WCAG compliance
├── flight-search.spec.ts      ← Search functionality
├── hotel-search.spec.ts       ← Hotel search
├── mobile-responsive.spec.ts  ← Mobile tests
└── performance.spec.ts        ← Performance metrics
```

## 🎯 Test Coverage

✅ **Complete Booking Flow** - Search to confirmation (11 tests)
✅ **Filters** - Price, stops, airlines (13 tests)
✅ **Seat Selection** - Seat map interactions (10 tests)
✅ **Passenger Form** - Validation (12 tests)
✅ **Payment** - Stripe integration (14 tests)
✅ **Accessibility** - WCAG 2.1 AA (18 tests)
✅ **Search** - Flight search (15+ tests)
✅ **Performance** - Web vitals monitoring
✅ **Mobile** - Touch and responsive

**Total**: 702 tests across 10 files

## 🔧 Debugging Failed Tests

### 1. Check HTML Report
```bash
npm run test:e2e:report
```

### 2. View Screenshots
```
test-results/screenshots/
```

### 3. View Trace
```bash
npx playwright show-trace test-results/trace.zip
```

### 4. Run in Debug Mode
```bash
npm run test:e2e:debug
```

### 5. Run Single Test
```bash
npx playwright test -g "test name"
```

## 📊 Understanding Test Results

### Green = Pass ✅
All assertions passed, test successful

### Red = Fail ❌
Check:
1. Screenshot in test-results/
2. Error message in report
3. Trace file
4. Console logs

### Yellow = Flaky ⚠️
Passed after retry
- Review for timing issues
- Add explicit waits
- Check for race conditions

## 🎨 Test Structure

### Page Object Model
```typescript
const flightsPage = new FlightsSearchPage(page);
await flightsPage.goto();
await flightsPage.searchFlight({...});
```

### Helpers
```typescript
import { fillFlightSearchForm, waitForSearchResults } from '../helpers/test-helpers';

await fillFlightSearchForm(page, {...});
await waitForSearchResults(page);
```

### Selectors
```typescript
import { selectors } from '../helpers/selectors';

await page.click(selectors.search.searchButton);
await page.fill(selectors.search.originInput, 'JFK');
```

## 📝 Writing a New Test

```typescript
import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/my-page');

    // Interact
    await page.click(selectors.myButton);

    // Assert
    await expect(page.locator(selectors.myElement)).toBeVisible();

    console.log('✅ Test passed!');
  });
});
```

## 🚨 Common Issues

### Test Timeout
```typescript
// Increase timeout
await page.waitForSelector(selector, { timeout: 60000 });
```

### Element Not Found
```typescript
// Wait for load
await page.waitForLoadState('networkidle');
```

### Flaky Test
```typescript
// Add explicit waits
await page.waitForSelector(selector);
```

### CI Failure (works locally)
- Check timing issues (CI is slower)
- Verify environment variables
- Review GitHub Actions logs

## 📖 Full Documentation

For complete guide: `tests/E2E_TESTING.md`
For implementation report: `E2E_IMPLEMENTATION_REPORT.md`

## 🎯 Next Steps

1. ✅ Run the test suite
2. ✅ Review the HTML report
3. ✅ Read the full documentation
4. ✅ Write tests for new features
5. ✅ Keep tests passing in CI

## 💡 Tips

- Use Page Object Model for new pages
- Add selectors to `selectors.ts`
- Add helpers to `test-helpers.ts`
- Mock APIs for faster tests
- Test happy path + edge cases
- Check accessibility
- Run mobile tests
- Review CI results

## 🆘 Need Help?

1. Check `tests/E2E_TESTING.md`
2. Look at existing tests for examples
3. Review Playwright docs: https://playwright.dev
4. Ask the QA team

---

**Quick Reference**: Keep this handy!
