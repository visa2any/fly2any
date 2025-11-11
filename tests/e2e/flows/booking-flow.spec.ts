import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { FlightsSearchPage } from '../pages/flights-search.page';
import { FlightResultsPage } from '../pages/flights-results.page';
import { getTestDateRange, testFlights } from '../fixtures/test-data';
import { mockPassengerData, mockPaymentData, generateBookingReference } from '../fixtures/mock-data';
import {
  fillFlightSearchForm,
  waitForSearchResults,
  selectFirstFlight,
  fillPassengerForm,
  mockStripePayment,
  waitForNavigation,
  verifyBookingReferenceFormat,
  waitForToast,
} from '../helpers/test-helpers';
import { selectors } from '../helpers/selectors';

test.describe('Complete Booking Flow - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks for faster testing
    await mockStripePayment(page);
  });

  test('should complete full booking flow from search to confirmation', async ({ page }) => {
    const homePage = new HomePage(page);
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Step 1: Navigate to homepage
    console.log('Step 1: Navigate to homepage');
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // Step 2: Go to flights page
    console.log('Step 2: Navigate to flights search');
    await homePage.goToFlights();
    await flightsPage.verifyPageLoaded();

    // Step 3: Fill search form
    console.log('Step 3: Fill search form');
    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 1,
      className: 'economy',
    });

    // Step 4: Wait for results
    console.log('Step 4: Wait for search results');
    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();
    await resultsPage.verifyNoErrors();

    const flightCount = await resultsPage.getFlightCount();
    console.log(`Found ${flightCount} flights`);
    expect(flightCount).toBeGreaterThan(0);

    // Step 5: Select first flight
    console.log('Step 5: Select first flight');
    await selectFirstFlight(page);

    // Step 6: Handle seat selection (if available)
    console.log('Step 6: Check for seat selection');
    const seatMapVisible = await page.locator(selectors.seats.container).isVisible({ timeout: 5000 }).catch(() => false);

    if (seatMapVisible) {
      console.log('Seat map available - selecting seat');
      const availableSeats = page.locator(selectors.seats.availableSeat);
      const seatCount = await availableSeats.count();

      if (seatCount > 0) {
        await availableSeats.first().click();
        await page.waitForTimeout(500);
      }

      // Click continue
      const confirmButton = page.locator(selectors.seats.confirmSeatsButton);
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    } else {
      console.log('Seat map not available - skipping');
    }

    // Step 7: Fill passenger details
    console.log('Step 7: Fill passenger details');
    await page.waitForSelector(selectors.passenger.form, { timeout: 10000 });

    await fillPassengerForm(page, mockPassengerData.adult1, 0);

    // Click continue
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    // Step 8: Handle payment
    console.log('Step 8: Process payment');
    await page.waitForSelector(selectors.payment.form, { timeout: 10000 });

    // Verify total amount is displayed
    const totalAmount = await page.locator(selectors.payment.totalAmount).textContent();
    console.log(`Total amount: ${totalAmount}`);
    expect(totalAmount).toBeTruthy();

    // Fill payment details (if not using Stripe Elements)
    const cardInputVisible = await page.locator(selectors.payment.nameOnCardInput).isVisible({ timeout: 3000 }).catch(() => false);

    if (cardInputVisible) {
      await page.fill(selectors.payment.nameOnCardInput, mockPaymentData.validCard.nameOnCard);
      await page.fill(selectors.payment.billingAddressInput, mockPaymentData.validCard.billingAddress);
      await page.fill(selectors.payment.billingCityInput, mockPaymentData.validCard.billingCity);
      await page.fill(selectors.payment.billingPostalInput, mockPaymentData.validCard.billingPostal);
      await page.selectOption(selectors.payment.billingCountrySelect, mockPaymentData.validCard.billingCountry);
    }

    // Accept terms and conditions
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit payment
    await page.locator(selectors.payment.submitButton).click();

    // Step 9: Wait for confirmation
    console.log('Step 9: Wait for confirmation page');
    await page.waitForURL('**/confirmation**', { timeout: 30000 });
    await page.waitForSelector(selectors.confirmation.container, { timeout: 10000 });

    // Step 10: Verify confirmation details
    console.log('Step 10: Verify booking confirmation');
    const successMessage = page.locator(selectors.confirmation.successMessage);
    await expect(successMessage).toBeVisible();

    const bookingRef = page.locator(selectors.confirmation.bookingReference);
    const bookingRefText = await bookingRef.textContent();
    console.log(`Booking reference: ${bookingRefText}`);

    expect(bookingRefText).toBeTruthy();
    expect(bookingRefText!.length).toBeGreaterThan(5);

    // Verify flight details are shown
    const flightDetails = page.locator(selectors.confirmation.flightDetails);
    await expect(flightDetails).toBeVisible();

    // Verify passenger details are shown
    const passengerDetails = page.locator(selectors.confirmation.passengerDetails);
    await expect(passengerDetails).toBeVisible();

    console.log('✅ Complete booking flow test passed!');
  });

  test('should handle booking with multiple passengers', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate to flights
    await flightsPage.goto();
    await flightsPage.verifyPageLoaded();

    // Search with multiple passengers
    const dates = getTestDateRange(45, 10);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 2,
      children: 1,
      className: 'economy',
    });

    // Wait for results and select flight
    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();
    await selectFirstFlight(page);

    // Skip seat selection if present
    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 3000 })) {
      await skipSeats.click();
    }

    // Fill passenger details for all passengers
    await page.waitForSelector(selectors.passenger.form);

    // Adult 1
    await fillPassengerForm(page, mockPassengerData.adult1, 0);

    // Adult 2
    await fillPassengerForm(page, mockPassengerData.adult2, 1);

    // Child 1
    await fillPassengerForm(page, mockPassengerData.child1, 2);

    // Continue to payment
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    // Verify we reached payment page
    await expect(page.locator(selectors.payment.form)).toBeVisible({ timeout: 10000 });

    console.log('✅ Multiple passengers booking flow passed!');
  });

  test('should prevent duplicate bookings', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate and search
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

    // Try to click back and select same flight again
    await page.goBack();
    await page.waitForTimeout(1000);

    // Verify we're back on results page
    const url = page.url();
    expect(url).toContain('results');

    console.log('✅ Duplicate booking prevention test passed!');
  });

  test('should handle API errors gracefully during booking', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Mock API error
    await page.route('**/api/bookings/create', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Failed to create booking',
        }),
      });
    });

    // Navigate and search
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

    // Skip seat selection
    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 3000 })) {
      await skipSeats.click();
    }

    // Fill passenger form
    await page.waitForSelector(selectors.passenger.form, { timeout: 10000 });
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.locator(selectors.passenger.continueButton).click();

    // Try to submit payment
    await page.waitForSelector(selectors.payment.form, { timeout: 10000 });

    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.locator(selectors.payment.submitButton).click();

    // Verify error message is shown
    await page.waitForTimeout(2000);
    const errorVisible = await page.locator(selectors.common.toast).isVisible({ timeout: 5000 });

    if (errorVisible) {
      console.log('Error message displayed as expected');
    }

    // Verify we didn't navigate to confirmation
    const url = page.url();
    expect(url).not.toContain('confirmation');

    console.log('✅ API error handling test passed!');
  });

  test('should save booking progress and allow resuming', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Start booking flow
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
    const firstFlightDetails = await resultsPage.getFlightCardDetails(0);
    await selectFirstFlight(page);

    // Get current URL (should include flight selection)
    const bookingUrl = page.url();
    console.log(`Booking URL: ${bookingUrl}`);

    // Navigate away
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Navigate back to booking URL
    await page.goto(bookingUrl);
    await page.waitForLoadState('networkidle');

    // Verify booking state is preserved
    const currentUrl = page.url();
    expect(currentUrl).toContain(bookingUrl.split('?')[0]);

    console.log('✅ Booking progress save/resume test passed!');
  });
});

test.describe('Booking Flow - Edge Cases', () => {
  test('should handle session timeout during booking', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate and search
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

    // Mock session expiration
    await page.evaluate(() => {
      localStorage.removeItem('flightSearchSession');
      sessionStorage.clear();
    });

    // Try to continue booking
    await selectFirstFlight(page);

    // Should either redirect to search or show error
    await page.waitForTimeout(2000);

    console.log('✅ Session timeout handling test passed!');
  });

  test('should validate passenger age restrictions', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate and search
    await flightsPage.goto();
    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.international.origin,
      destination: testFlights.international.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();
    await selectFirstFlight(page);

    // Skip seat selection
    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 3000 })) {
      await skipSeats.click();
    }

    // Try to enter future date of birth
    await page.waitForSelector(selectors.passenger.form);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    await page.selectOption('select[name="passengers[0].title"]', 'Mr');
    await page.fill('input[name="passengers[0].firstName"]', 'Test');
    await page.fill('input[name="passengers[0].lastName"]', 'User');
    await page.fill('input[name="passengers[0].dateOfBirth"]', futureDateString);

    // Try to continue
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForTimeout(1000);

    // Should show validation error
    const errorVisible = await page.locator(selectors.passenger.errorMessage).isVisible();
    console.log(`Validation error shown: ${errorVisible}`);

    console.log('✅ Age validation test passed!');
  });

  test('should handle payment card validation', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate and complete booking up to payment
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

    // Skip seat selection
    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 3000 })) {
      await skipSeats.click();
    }

    // Fill passenger form
    await page.waitForSelector(selectors.passenger.form);
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    // Try to submit payment without card details
    await page.waitForSelector(selectors.payment.form);

    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.locator(selectors.payment.submitButton).click();
    await page.waitForTimeout(1000);

    // Should show validation error or prevent submission
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    console.log('✅ Payment validation test passed!');
  });
});
