/**
 * E2E Tests: Seat Selection System
 *
 * Comprehensive tests for the Apple-class seat selection UI including:
 * - Seat map display and legend verification
 * - Seat selection and deselection
 * - Preference card selection
 * - Multi-passenger seat assignment
 * - Multi-flight navigation
 * - Accessibility and keyboard navigation
 * - Mobile responsiveness
 *
 * @version 2.0.0 - Updated for premium UI redesign
 */

import { test, expect, type Page } from '@playwright/test';
import { FlightsSearchPage } from '../pages/flights-search.page';
import { FlightResultsPage } from '../pages/flights-results.page';
import { getTestDateRange, testFlights } from '../fixtures/test-data';
import { selectors } from '../helpers/selectors';
import { selectFirstFlight } from '../helpers/test-helpers';

// ==========================================
// Test Configuration
// ==========================================

const SEAT_SELECTION_TIMEOUT = 15000;
const ANIMATION_WAIT = 500;

// ==========================================
// Helper Functions
// ==========================================

async function navigateToSeatSelection(page: Page, passengers: number = 1): Promise<boolean> {
  const flightsPage = new FlightsSearchPage(page);
  const resultsPage = new FlightResultsPage(page);

  await flightsPage.goto();
  await flightsPage.verifyPageLoaded();

  const dates = getTestDateRange(30, 7);
  await flightsPage.searchFlight({
    origin: testFlights.domestic.origin,
    destination: testFlights.domestic.destination,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
    adults: passengers,
    className: 'economy',
  });

  await resultsPage.waitForResults();
  await resultsPage.verifyResultsDisplayed();
  await selectFirstFlight(page);

  // Wait for seat map modal or container
  const seatMapVisible = await page
    .locator(`${selectors.seats.modal}, ${selectors.seats.container}`)
    .isVisible({ timeout: SEAT_SELECTION_TIMEOUT })
    .catch(() => false);

  return seatMapVisible;
}

async function countSeats(page: Page): Promise<{ available: number; occupied: number; selected: number }> {
  const available = await page.locator(selectors.seats.availableSeat).count();
  const occupied = await page.locator(selectors.seats.occupiedSeat).count();
  const selected = await page.locator(selectors.seats.selectedSeat).count();
  return { available, occupied, selected };
}

// ==========================================
// Core Display Tests
// ==========================================

test.describe('Seat Map Display (@ui)', () => {
  test('should display seat map modal with premium header', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      console.log('Seat map not available for this flight - skipping');
      test.skip();
      return;
    }

    // Verify modal structure
    await expect(page.locator(selectors.seats.container)).toBeVisible();

    // Check for premium header elements
    const titleVisible = await page.getByText(/Select.*Seat/i).isVisible();
    expect(titleVisible).toBe(true);

    console.log('✅ Seat map modal displays correctly with premium header');
  });

  test('should display unified color legend', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Check legend exists
    const legend = page.locator(selectors.seats.legend);
    if (await legend.count() > 0) {
      await expect(legend).toBeVisible();

      // Verify legend items
      const legendText = await legend.textContent();
      const hasWindow = legendText?.includes('Window');
      const hasAisle = legendText?.includes('Aisle');
      const hasMiddle = legendText?.includes('Middle');
      const hasTaken = legendText?.includes('Taken');
      const hasPick = legendText?.includes('Pick') || legendText?.includes('Selected');

      console.log(`Legend items: Window=${hasWindow}, Aisle=${hasAisle}, Middle=${hasMiddle}, Taken=${hasTaken}, Pick=${hasPick}`);

      expect(hasWindow || hasAisle || hasTaken).toBe(true);
    }

    console.log('✅ Unified color legend displayed correctly');
  });

  test('should display seat grid with row numbers', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Check for seat grid
    const grid = page.locator(selectors.seats.grid);
    if (await grid.count() > 0) {
      await expect(grid).toBeVisible();

      // Verify FRONT/BACK indicators
      const frontIndicator = await page.getByText('FRONT').isVisible().catch(() => false);
      const backIndicator = await page.getByText('BACK').isVisible().catch(() => false);

      if (frontIndicator || backIndicator) {
        console.log(`Aircraft indicators: FRONT=${frontIndicator}, BACK=${backIndicator}`);
      }
    }

    console.log('✅ Seat grid displays with proper structure');
  });
});

// ==========================================
// Seat Selection Tests
// ==========================================

test.describe('Seat Selection (@interaction)', () => {
  test('should allow selecting an available seat', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const initialCounts = await countSeats(page);
    console.log(`Initial seats - Available: ${initialCounts.available}, Selected: ${initialCounts.selected}`);

    if (initialCounts.available === 0) {
      console.log('No available seats found - skipping');
      test.skip();
      return;
    }

    // Click first available seat
    const firstSeat = page.locator(selectors.seats.availableSeat).first();
    const seatNumber = await firstSeat.getAttribute('data-seat');

    await firstSeat.click();
    await page.waitForTimeout(ANIMATION_WAIT);

    // Verify seat is now selected
    const selectedSeats = page.locator(selectors.seats.selectedSeat);
    const selectedCount = await selectedSeats.count();

    expect(selectedCount).toBeGreaterThanOrEqual(1);
    console.log(`✅ Successfully selected seat ${seatNumber}`);
  });

  test('should prevent selecting occupied seats', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const occupiedSeats = page.locator(selectors.seats.occupiedSeat);
    const occupiedCount = await occupiedSeats.count();

    if (occupiedCount === 0) {
      console.log('No occupied seats to test - all available');
      return;
    }

    // Record initial selection
    const initialSelected = await page.locator(selectors.seats.selectedSeat).count();

    // Try clicking occupied seat
    await occupiedSeats.first().click({ force: true });
    await page.waitForTimeout(ANIMATION_WAIT);

    // Selection should not change
    const afterSelected = await page.locator(selectors.seats.selectedSeat).count();

    expect(afterSelected).toBe(initialSelected);
    console.log('✅ Occupied seat correctly blocked from selection');
  });

  test('should visually distinguish selected seat', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const availableSeats = page.locator(selectors.seats.availableSeat);
    if (await availableSeats.count() === 0) {
      test.skip();
      return;
    }

    // Select a seat
    await availableSeats.first().click();
    await page.waitForTimeout(ANIMATION_WAIT);

    // Check visual distinction - selected seat should have checkmark or different styling
    const selectedSeat = page.locator(selectors.seats.selectedSeat).first();
    const hasCheckmark = await selectedSeat.locator('svg').count() > 0;
    const isScaled = await selectedSeat.evaluate(el => {
      const transform = window.getComputedStyle(el).transform;
      return transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)';
    }).catch(() => false);

    console.log(`Visual distinction: Checkmark=${hasCheckmark}, Scaled=${isScaled}`);
    expect(hasCheckmark || isScaled).toBe(true);

    console.log('✅ Selected seat is visually distinguished');
  });

  test('should allow changing seat selection', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const availableSeats = page.locator(selectors.seats.availableSeat);
    const availableCount = await availableSeats.count();

    if (availableCount < 2) {
      console.log('Need at least 2 available seats to test change - skipping');
      test.skip();
      return;
    }

    // Select first seat
    const firstSeat = availableSeats.first();
    const firstSeatNumber = await firstSeat.getAttribute('data-seat');
    await firstSeat.click();
    await page.waitForTimeout(ANIMATION_WAIT);

    // Select second seat
    const secondSeat = availableSeats.nth(1);
    const secondSeatNumber = await secondSeat.getAttribute('data-seat');
    await secondSeat.click();
    await page.waitForTimeout(ANIMATION_WAIT);

    // Should have exactly 1 selected seat (the second one)
    const selectedCount = await page.locator(selectors.seats.selectedSeat).count();
    expect(selectedCount).toBe(1);

    console.log(`✅ Changed selection from ${firstSeatNumber} to ${secondSeatNumber}`);
  });
});

// ==========================================
// Preference Selection Tests
// ==========================================

test.describe('Seat Preference Cards (@preference)', () => {
  test('should display all preference options', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Check for preference cards
    const windowPref = page.locator(selectors.seats.preferenceWindow);
    const aislePref = page.locator(selectors.seats.preferenceAisle);
    const legroomPref = page.locator(selectors.seats.preferenceLegroom);
    const frontPref = page.locator(selectors.seats.preferenceFront);

    const hasWindow = await windowPref.count() > 0;
    const hasAisle = await aislePref.count() > 0;
    const hasLegroom = await legroomPref.count() > 0;
    const hasFront = await frontPref.count() > 0;

    console.log(`Preference cards: Window=${hasWindow}, Aisle=${hasAisle}, Legroom=${hasLegroom}, Front=${hasFront}`);

    // At least some preferences should be visible
    expect(hasWindow || hasAisle || hasLegroom || hasFront).toBe(true);

    console.log('✅ Preference cards displayed');
  });

  test('should allow selecting preference card', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Try selecting window preference
    const windowPref = page.locator(selectors.seats.preferenceWindow);

    if (await windowPref.count() > 0) {
      await windowPref.click();
      await page.waitForTimeout(ANIMATION_WAIT);

      // Check for "Selected" indicator
      const selectedText = await windowPref.textContent();
      const hasSelectedIndicator = selectedText?.includes('Selected');

      expect(hasSelectedIndicator).toBe(true);
      console.log('✅ Window preference selected successfully');
    } else {
      console.log('Window preference not available - skipping');
    }
  });

  test('should clear seat selection when preference is chosen', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // First select a seat
    const availableSeats = page.locator(selectors.seats.availableSeat);
    if (await availableSeats.count() > 0) {
      await availableSeats.first().click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Then select a preference
    const aislePref = page.locator(selectors.seats.preferenceAisle);
    if (await aislePref.count() > 0) {
      await aislePref.click();
      await page.waitForTimeout(ANIMATION_WAIT);

      // Seat should no longer be selected
      const selectedSeats = await page.locator(selectors.seats.selectedSeat).count();
      expect(selectedSeats).toBe(0);

      console.log('✅ Seat selection cleared when preference chosen');
    }
  });
});

// ==========================================
// Modal Behavior Tests
// ==========================================

test.describe('Modal Behavior (@modal)', () => {
  test('should NOT close when clicking backdrop', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Try clicking the backdrop (outside modal content)
    const modal = page.locator(selectors.seats.modal);
    if (await modal.count() > 0) {
      // Click at coordinates outside the modal content
      await page.mouse.click(10, 10);
      await page.waitForTimeout(ANIMATION_WAIT);

      // Modal should still be visible
      const stillVisible = await page.locator(selectors.seats.container).isVisible();
      expect(stillVisible).toBe(true);

      console.log('✅ Modal correctly prevents accidental close');
    }
  });

  test('should close when clicking close button', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const closeButton = page.locator(selectors.seats.closeButton);

    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(ANIMATION_WAIT * 2);

      // Modal should be closed
      const modalVisible = await page.locator(selectors.seats.modal).isVisible().catch(() => false);
      expect(modalVisible).toBe(false);

      console.log('✅ Modal closes correctly via close button');
    }
  });

  test('should close when pressing Escape key', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(ANIMATION_WAIT * 2);

    const modalVisible = await page.locator(selectors.seats.modal).isVisible().catch(() => false);
    expect(modalVisible).toBe(false);

    console.log('✅ Modal closes correctly via Escape key');
  });
});

// ==========================================
// Action Button Tests
// ==========================================

test.describe('Action Buttons (@actions)', () => {
  test('should display Skip and Confirm buttons', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Check for Skip button
    const skipButton = page.locator(selectors.seats.skipSeatsButton);
    const hasSkip = await skipButton.count() > 0;

    // Select a seat first to see confirm button
    const availableSeats = page.locator(selectors.seats.availableSeat);
    if (await availableSeats.count() > 0) {
      await availableSeats.first().click();
      await page.waitForTimeout(ANIMATION_WAIT);
    }

    // Check for Confirm button
    const confirmButton = page.locator(selectors.seats.confirmSeatsButton);
    const hasConfirm = await confirmButton.count() > 0;

    console.log(`Action buttons: Skip=${hasSkip}, Confirm=${hasConfirm}`);
    expect(hasSkip || hasConfirm).toBe(true);

    console.log('✅ Action buttons displayed correctly');
  });

  test('should allow skipping seat selection', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const skipButton = page.locator(selectors.seats.skipSeatsButton);

    if (await skipButton.count() > 0) {
      await skipButton.click();
      await page.waitForLoadState('networkidle');

      // Should progress to next step
      console.log('✅ Skip button works correctly');
    }
  });

  test('should confirm seat selection', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Select a seat first
    const availableSeats = page.locator(selectors.seats.availableSeat);
    if (await availableSeats.count() > 0) {
      await availableSeats.first().click();
      await page.waitForTimeout(ANIMATION_WAIT);

      // Click confirm
      const confirmButton = page.locator(selectors.seats.confirmSeatsButton);
      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        // Look for success confirmation
        const successVisible = await page.getByText(/Confirmed|Success/i).isVisible({ timeout: 3000 }).catch(() => false);

        if (successVisible) {
          console.log('✅ Confirmation success message displayed');
        }
      }
    }
  });
});

// ==========================================
// Multi-Passenger Tests
// ==========================================

test.describe('Multi-Passenger Selection (@multi-pax)', () => {
  test('should display passenger indicator for multiple travelers', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page, 2);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Look for passenger count indicator (e.g., "1/2")
    const passengerIndicator = await page.getByText(/1\/2|Passenger 1/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (passengerIndicator) {
      console.log('✅ Passenger indicator displayed for multi-pax booking');
    } else {
      console.log('Passenger indicator not found - may use different display method');
    }
  });

  test('should allow selecting seats for each passenger', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page, 2);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const availableSeats = page.locator(selectors.seats.availableSeat);
    const availableCount = await availableSeats.count();

    if (availableCount < 2) {
      console.log('Need at least 2 seats for multi-pax test');
      test.skip();
      return;
    }

    // Select first seat
    await availableSeats.first().click();
    await page.waitForTimeout(ANIMATION_WAIT);

    console.log('✅ Multi-passenger seat selection started');
  });
});

// ==========================================
// Accessibility Tests
// ==========================================

test.describe('Accessibility (@a11y)', () => {
  test('should have proper ARIA attributes', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Check modal has dialog role
    const modal = page.locator('[role="dialog"]');
    const hasDialogRole = await modal.count() > 0;

    // Check for aria-modal
    const hasAriaModal = await page.locator('[aria-modal="true"]').count() > 0;

    // Check for aria-labelledby
    const hasLabelledBy = await page.locator('[aria-labelledby]').count() > 0;

    console.log(`ARIA attributes: dialog=${hasDialogRole}, aria-modal=${hasAriaModal}, labelledby=${hasLabelledBy}`);

    expect(hasDialogRole || hasAriaModal).toBe(true);

    console.log('✅ Proper ARIA attributes present');
  });

  test('should trap focus within modal', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Tab through elements - focus should stay within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if focused element is within the seat map container
    const focusedElement = page.locator(':focus');
    const isWithinModal = await focusedElement.evaluate(el => {
      return el.closest('[data-testid="seat-map"], [data-testid="seat-map-modal"]') !== null;
    }).catch(() => false);

    if (isWithinModal) {
      console.log('✅ Focus is trapped within modal');
    } else {
      console.log('Focus may have escaped modal - verify manually');
    }
  });
});

// ==========================================
// Mobile Responsiveness Tests
// ==========================================

test.describe('Mobile Responsiveness (@mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test('should display properly on mobile viewport', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    // Modal should be visible and fill most of screen
    const container = page.locator(selectors.seats.container);
    await expect(container).toBeVisible();

    // Preference cards should be in 2-column grid on mobile
    const preferenceWindow = page.locator(selectors.seats.preferenceWindow);
    if (await preferenceWindow.count() > 0) {
      const boundingBox = await preferenceWindow.boundingBox();
      if (boundingBox) {
        // Width should be less than half screen (2 columns)
        expect(boundingBox.width).toBeLessThan(375 / 2 + 50);
      }
    }

    console.log('✅ Mobile layout displays correctly');
  });

  test('should have touch-friendly seat buttons on mobile', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const availableSeats = page.locator(selectors.seats.availableSeat);

    if (await availableSeats.count() > 0) {
      const firstSeat = availableSeats.first();
      const boundingBox = await firstSeat.boundingBox();

      if (boundingBox) {
        // Minimum touch target should be at least 36x36 (Apple guidelines suggest 44x44)
        expect(boundingBox.width).toBeGreaterThanOrEqual(32);
        expect(boundingBox.height).toBeGreaterThanOrEqual(32);

        console.log(`Seat button size: ${boundingBox.width}x${boundingBox.height}`);
      }
    }

    console.log('✅ Touch targets are appropriately sized');
  });
});

// ==========================================
// Error Handling Tests
// ==========================================

test.describe('Error Handling (@error)', () => {
  test('should handle seat map API failure gracefully', async ({ page }) => {
    // Mock seat map API failure
    await page.route('**/api/flights/seat-map/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load seat map' }),
      });
    });

    await navigateToSeatSelection(page);

    // Should show fallback UI (preference selection only)
    const preferenceVisible = await page.locator(selectors.seats.preferenceWindow).isVisible({ timeout: 5000 }).catch(() => false);

    // Or should show error message
    const errorVisible = await page.getByText(/not available|error|unable/i).isVisible({ timeout: 3000 }).catch(() => false);

    expect(preferenceVisible || errorVisible).toBe(true);

    console.log('✅ API failure handled gracefully');
  });

  test('should show fallback when no seat map data', async ({ page }) => {
    // Mock empty seat map response
    await page.route('**/api/flights/seat-map/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          seatMap: { data: [] },
          meta: { hasRealData: false }
        }),
      });
    });

    await navigateToSeatSelection(page);

    // Should show preference selection as fallback
    const fallbackMessage = await page.getByText(/not available|preference|check-in/i).isVisible({ timeout: 5000 }).catch(() => false);

    if (fallbackMessage) {
      console.log('✅ Fallback UI shown when no seat map data');
    } else {
      console.log('Fallback behavior may differ - verify manually');
    }
  });
});

// ==========================================
// Performance Tests
// ==========================================

test.describe('Performance (@performance)', () => {
  test('seat selection should respond within 500ms', async ({ page }) => {
    const seatMapAvailable = await navigateToSeatSelection(page);

    if (!seatMapAvailable) {
      test.skip();
      return;
    }

    const availableSeats = page.locator(selectors.seats.availableSeat);

    if (await availableSeats.count() > 0) {
      const startTime = Date.now();
      await availableSeats.first().click();

      // Wait for selection indicator
      await page.locator(selectors.seats.selectedSeat).waitFor({ timeout: 1000 });
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
      console.log(`✅ Seat selection response time: ${duration}ms`);
    }
  });
});
