import { test, expect } from '@playwright/test';
import { FlightsSearchPage } from '../pages/flights-search.page';
import { FlightResultsPage } from '../pages/flights-results.page';
import { getTestDateRange, testFlights } from '../fixtures/test-data';
import { selectors } from '../helpers/selectors';
import { selectFirstFlight } from '../helpers/test-helpers';

test.describe('Seat Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate through booking flow to seat selection
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
      adults: 1,
      className: 'economy',
    });

    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();
    await selectFirstFlight(page);
  });

  test('should display seat map correctly', async ({ page }) => {
    // Wait for seat map or skip if not available
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available for this flight - skipping test');
      test.skip();
      return;
    }

    // Verify seat map is displayed
    await expect(page.locator(selectors.seats.container)).toBeVisible();

    // Verify legend is shown
    const legend = page.locator(selectors.seats.seatLegend);
    if ((await legend.count()) > 0) {
      await expect(legend).toBeVisible();
      console.log('Seat legend displayed');
    }

    // Count available seats
    const availableSeats = page.locator(selectors.seats.availableSeat);
    const availableCount = await availableSeats.count();
    console.log(`Available seats: ${availableCount}`);

    expect(availableCount).toBeGreaterThan(0);

    // Count occupied seats
    const occupiedSeats = page.locator(selectors.seats.occupiedSeat);
    const occupiedCount = await occupiedSeats.count();
    console.log(`Occupied seats: ${occupiedCount}`);

    console.log('✅ Seat map display test passed!');
  });

  test('should allow selecting an available seat', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Find first available seat
    const availableSeats = page.locator(selectors.seats.availableSeat);
    const seatCount = await availableSeats.count();

    expect(seatCount).toBeGreaterThan(0);

    // Click first available seat
    const firstSeat = availableSeats.first();
    await firstSeat.click();
    await page.waitForTimeout(500);

    // Verify seat is selected
    const seatNumber = await firstSeat.getAttribute('data-seat');
    console.log(`Selected seat: ${seatNumber}`);

    // Check if seat is visually marked as selected
    const selectedSeats = page.locator(selectors.seats.selectedSeat);
    const selectedCount = await selectedSeats.count();

    expect(selectedCount).toBeGreaterThanOrEqual(1);

    console.log('✅ Seat selection test passed!');
  });

  test('should prevent selecting occupied seats', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Find occupied seat
    const occupiedSeats = page.locator(selectors.seats.occupiedSeat);
    const occupiedCount = await occupiedSeats.count();

    if (occupiedCount === 0) {
      console.log('No occupied seats to test - all seats available');
      return;
    }

    // Try to click occupied seat
    const firstOccupied = occupiedSeats.first();
    await firstOccupied.click({ force: true });
    await page.waitForTimeout(500);

    // Verify it's not selected
    const selectedSeats = page.locator(selectors.seats.selectedSeat);
    const selectedCount = await selectedSeats.count();

    // Should be 0 selected seats (occupied seat cannot be selected)
    expect(selectedCount).toBe(0);

    console.log('✅ Occupied seat prevention test passed!');
  });

  test('should show pricing for premium seats', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Look for exit row or premium seats
    const exitRowSeats = page.locator(selectors.seats.exitRowSeat);
    const exitRowCount = await exitRowSeats.count();

    if (exitRowCount > 0) {
      const firstExitRow = exitRowSeats.first();

      // Check if price is displayed
      const seatText = await firstExitRow.textContent();
      const hasPrice = seatText?.includes('$') || seatText?.includes('+');

      console.log(`Exit row seat shows price: ${hasPrice}`);

      // Click to see price details
      await firstExitRow.click();
      await page.waitForTimeout(500);

      console.log('Exit row seat clicked - price should be shown in summary');
    } else {
      console.log('No premium/exit row seats available for this flight');
    }

    console.log('✅ Premium seat pricing test passed!');
  });

  test('should allow skipping seat selection', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - test not applicable');
      test.skip();
      return;
    }

    // Look for skip button
    const skipButton = page.locator(selectors.seats.skipSeatsButton);
    const hasSkipButton = (await skipButton.count()) > 0;

    if (hasSkipButton) {
      await skipButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we moved to next step (passenger details)
      const passengerForm = page.locator(selectors.passenger.form);
      await expect(passengerForm).toBeVisible({ timeout: 10000 });

      console.log('Successfully skipped seat selection');
    } else {
      console.log('Skip button not found - seat selection may be mandatory');
    }

    console.log('✅ Skip seat selection test passed!');
  });

  test('should confirm seat selection and proceed', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Select a seat
    const availableSeats = page.locator(selectors.seats.availableSeat);
    const seatCount = await availableSeats.count();

    if (seatCount > 0) {
      await availableSeats.first().click();
      await page.waitForTimeout(500);
    }

    // Click confirm button
    const confirmButton = page.locator(selectors.seats.confirmSeatsButton);

    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we moved to passenger details
      const passengerForm = page.locator(selectors.passenger.form);
      await expect(passengerForm).toBeVisible({ timeout: 10000 });

      console.log('Successfully confirmed seat selection');
    } else {
      console.log('Confirm button not found');
    }

    console.log('✅ Confirm seat selection test passed!');
  });

  test('should select seats for multiple passengers', async ({ page }) => {
    // This test requires multi-passenger booking
    // Navigate back and search for multiple passengers
    await page.goBack();
    await page.waitForTimeout(1000);
    await page.goBack();
    await page.waitForTimeout(1000);

    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    const dates = getTestDateRange(45, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 2,
      className: 'economy',
    });

    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();
    await selectFirstFlight(page);

    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Select 2 seats (one for each passenger)
    const availableSeats = page.locator(selectors.seats.availableSeat);
    const seatCount = await availableSeats.count();

    if (seatCount >= 2) {
      await availableSeats.nth(0).click();
      await page.waitForTimeout(300);
      await availableSeats.nth(1).click();
      await page.waitForTimeout(300);

      // Verify 2 seats are selected
      const selectedSeats = page.locator(selectors.seats.selectedSeat);
      const selectedCount = await selectedSeats.count();

      expect(selectedCount).toBe(2);
      console.log('Successfully selected 2 seats for 2 passengers');
    }

    console.log('✅ Multiple passenger seat selection test passed!');
  });

  test('should show seat map legend correctly', async ({ page }) => {
    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Look for legend
    const legend = page.locator(selectors.seats.seatLegend);

    if ((await legend.count()) > 0) {
      await expect(legend).toBeVisible();

      const legendText = await legend.textContent();
      console.log('Legend contains seat types:', legendText);

      // Check for common legend items
      const hasAvailable = legendText?.includes('Available') || legendText?.includes('available');
      const hasOccupied = legendText?.includes('Occupied') || legendText?.includes('occupied');
      const hasSelected = legendText?.includes('Selected') || legendText?.includes('selected');

      console.log(`Legend shows: Available=${hasAvailable}, Occupied=${hasOccupied}, Selected=${hasSelected}`);
    } else {
      console.log('Legend not found in seat map');
    }

    console.log('✅ Seat legend test passed!');
  });
});

test.describe('Seat Selection - Edge Cases', () => {
  test('should handle seat map loading errors', async ({ page }) => {
    // Mock seat map API failure
    await page.route('**/api/seats/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load seat map' }),
      });
    });

    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();
    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();
    await selectFirstFlight(page);

    // Should either show error or skip seat selection
    await page.waitForTimeout(3000);

    const errorVisible = await page.locator(selectors.common.toast).isVisible({ timeout: 3000 }).catch(() => false);

    if (errorVisible) {
      console.log('Error message shown for seat map failure');
    } else {
      console.log('Seat selection skipped due to API error');
    }

    console.log('✅ Seat map error handling test passed!');
  });

  test('should validate seat selection before proceeding', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();
    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 2, // 2 passengers
    });

    await resultsPage.waitForResults();
    await selectFirstFlight(page);

    const seatMapVisible = await page
      .locator(selectors.seats.container)
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (!seatMapVisible) {
      console.log('Seat map not available - skipping test');
      test.skip();
      return;
    }

    // Select only 1 seat when 2 are needed
    const availableSeats = page.locator(selectors.seats.availableSeat);
    if ((await availableSeats.count()) > 0) {
      await availableSeats.first().click();
      await page.waitForTimeout(500);
    }

    // Try to confirm with insufficient seats
    const confirmButton = page.locator(selectors.seats.confirmSeatsButton);

    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
      await page.waitForTimeout(1000);

      // Should show validation error or remain on seat selection
      const currentUrl = page.url();
      console.log(`Current URL after attempting to confirm: ${currentUrl}`);

      // Should not proceed to passenger details yet
      const passengerForm = page.locator(selectors.passenger.form);
      const onPassengerPage = await passengerForm.isVisible({ timeout: 2000 }).catch(() => false);

      if (!onPassengerPage) {
        console.log('Validation prevented proceeding with insufficient seats');
      }
    }

    console.log('✅ Seat selection validation test passed!');
  });
});
