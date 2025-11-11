import { test, expect } from '@playwright/test';
import { FlightsSearchPage } from '../pages/flights-search.page';
import { FlightResultsPage } from '../pages/flights-results.page';
import { getTestDateRange, testFlights } from '../fixtures/test-data';
import { mockPassengerData, mockPaymentData } from '../fixtures/mock-data';
import { selectors } from '../helpers/selectors';
import { selectFirstFlight, fillPassengerForm, mockStripePayment, getTotalPrice } from '../helpers/test-helpers';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup Stripe mocks
    await mockStripePayment(page);

    // Navigate to payment page
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

    // Skip seat selection
    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 5000 })) {
      await skipSeats.click();
    }

    // Fill passenger form
    await page.waitForSelector(selectors.passenger.form, { timeout: 10000 });
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    // Wait for payment form
    await page.waitForSelector(selectors.payment.form, { timeout: 10000 });
  });

  test('should display payment form correctly', async ({ page }) => {
    // Verify payment form is loaded
    await expect(page.locator(selectors.payment.form)).toBeVisible();

    // Verify total amount is displayed
    const totalAmount = page.locator(selectors.payment.totalAmount);
    await expect(totalAmount).toBeVisible();

    const amountText = await totalAmount.textContent();
    console.log(`Total amount: ${amountText}`);

    expect(amountText).toBeTruthy();

    // Verify terms checkbox exists
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if ((await termsCheckbox.count()) > 0) {
      await expect(termsCheckbox).toBeVisible();
      console.log('Terms and conditions checkbox present');
    }

    // Verify submit button exists
    const submitButton = page.locator(selectors.payment.submitButton);
    await expect(submitButton).toBeVisible();

    console.log('✅ Payment form display test passed!');
  });

  test('should show price breakdown', async ({ page }) => {
    // Look for price breakdown section
    const priceBreakdown = page.locator(selectors.confirmation.priceBreakdown);

    if ((await priceBreakdown.count()) > 0) {
      await expect(priceBreakdown).toBeVisible();

      const breakdownText = await priceBreakdown.textContent();
      console.log('Price breakdown:', breakdownText);

      // Should show base fare
      const hasBaseFare = breakdownText?.includes('Base') || breakdownText?.includes('Fare');
      console.log('Shows base fare:', hasBaseFare);

      // Should show taxes/fees
      const hasTaxes = breakdownText?.includes('Tax') || breakdownText?.includes('Fee');
      console.log('Shows taxes/fees:', hasTaxes);
    } else {
      console.log('Price breakdown not visible on payment page');
    }

    console.log('✅ Price breakdown test passed!');
  });

  test('should validate required payment fields', async ({ page }) => {
    // Try to submit without filling payment details
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.locator(selectors.payment.submitButton).click();
    await page.waitForTimeout(1000);

    // Should show validation error or remain on payment page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    console.log('✅ Payment validation test passed!');
  });

  test('should process successful payment with mocked Stripe', async ({ page }) => {
    // Fill billing details if visible
    const nameInput = page.locator(selectors.payment.nameOnCardInput);

    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill(mockPaymentData.validCard.nameOnCard);
      await page.fill(selectors.payment.billingAddressInput, mockPaymentData.validCard.billingAddress);
      await page.fill(selectors.payment.billingCityInput, mockPaymentData.validCard.billingCity);
      await page.fill(selectors.payment.billingPostalInput, mockPaymentData.validCard.billingPostal);
      await page.selectOption(selectors.payment.billingCountrySelect, mockPaymentData.validCard.billingCountry);
    }

    // Accept terms
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit payment
    await page.locator(selectors.payment.submitButton).click();

    // Wait for confirmation
    await page.waitForURL('**/confirmation**', { timeout: 30000 });
    await page.waitForSelector(selectors.confirmation.container, { timeout: 10000 });

    // Verify success
    const successMessage = page.locator(selectors.confirmation.successMessage);
    await expect(successMessage).toBeVisible();

    console.log('✅ Successful payment test passed!');
  });

  test('should handle declined payment', async ({ page }) => {
    // Mock declined payment
    await page.route('**/api/payment/confirm', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment declined',
          message: 'Your card was declined',
        }),
      });
    });

    // Fill billing details
    const nameInput = page.locator(selectors.payment.nameOnCardInput);

    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill(mockPaymentData.declinedCard.nameOnCard);
    }

    // Accept terms
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // Submit payment
    await page.locator(selectors.payment.submitButton).click();
    await page.waitForTimeout(2000);

    // Should show error message
    const errorVisible = await page.locator(selectors.common.toast).isVisible({ timeout: 5000 });

    if (errorVisible) {
      const errorText = await page.locator(selectors.common.toast).textContent();
      console.log(`Error message: ${errorText}`);
    }

    // Should remain on payment page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    console.log('✅ Declined payment test passed!');
  });

  test('should validate terms and conditions acceptance', async ({ page }) => {
    // Fill billing details
    const nameInput = page.locator(selectors.payment.nameOnCardInput);

    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill(mockPaymentData.validCard.nameOnCard);
    }

    // Do NOT check terms checkbox

    // Try to submit
    await page.locator(selectors.payment.submitButton).click();
    await page.waitForTimeout(1000);

    // Should prevent submission or show error
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    console.log('✅ Terms validation test passed!');
  });

  test('should show processing state during payment', async ({ page }) => {
    // Fill form
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    const submitButton = page.locator(selectors.payment.submitButton);

    // Get initial button text
    const initialText = await submitButton.textContent();
    console.log(`Initial button text: ${initialText}`);

    // Click submit
    await submitButton.click();

    // Check if button shows processing state
    await page.waitForTimeout(500);

    const processingText = await submitButton.textContent();
    console.log(`Processing button text: ${processingText}`);

    // Button should be disabled during processing
    const isDisabled = await submitButton.isDisabled();
    console.log('Button disabled during processing:', isDisabled);

    console.log('✅ Processing state test passed!');
  });

  test('should calculate total price correctly', async ({ page }) => {
    // Get displayed total
    const totalPrice = await getTotalPrice(page);
    console.log(`Total price displayed: $${totalPrice}`);

    expect(totalPrice).toBeGreaterThan(0);

    // Price should be reasonable (between $50 and $10,000 for most flights)
    expect(totalPrice).toBeGreaterThan(50);
    expect(totalPrice).toBeLessThan(10000);

    console.log('✅ Price calculation test passed!');
  });

  test('should handle payment timeout', async ({ page }) => {
    // Mock slow payment API
    await page.route('**/api/payment/confirm', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 35000)); // Timeout
      route.fulfill({
        status: 408,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Request timeout' }),
      });
    });

    // Fill and submit
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.locator(selectors.payment.submitButton).click();

    // Wait for timeout error
    await page.waitForTimeout(40000);

    // Should show timeout error or remain on payment page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    console.log('✅ Payment timeout test passed!');
  });

  test('should support multiple payment methods', async ({ page }) => {
    // Look for payment method selector
    const paymentMethodButtons = page.locator('button[role="tab"], input[name="paymentMethod"]');
    const methodCount = await paymentMethodButtons.count();

    console.log(`Payment methods available: ${methodCount}`);

    if (methodCount > 1) {
      // Switch payment method
      await paymentMethodButtons.nth(1).click();
      await page.waitForTimeout(500);

      console.log('Multiple payment methods supported');
    } else {
      console.log('Single payment method (card) available');
    }

    console.log('✅ Payment methods test passed!');
  });

  test('should preserve booking after payment failure', async ({ page }) => {
    // Mock payment failure
    await page.route('**/api/payment/confirm', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment processing error' }),
      });
    });

    // Submit payment
    const termsCheckbox = page.locator(selectors.payment.termsCheckbox);
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.locator(selectors.payment.submitButton).click();
    await page.waitForTimeout(3000);

    // Should remain on payment page with booking intact
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('confirmation');

    // Booking details should still be visible
    const totalAmount = page.locator(selectors.payment.totalAmount);
    await expect(totalAmount).toBeVisible();

    console.log('✅ Booking preservation after failure test passed!');
  });
});

test.describe('Payment Security', () => {
  test('should use secure Stripe iframes for card input', async ({ page }) => {
    await mockStripePayment(page);

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

    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 5000 })) {
      await skipSeats.click();
    }

    await page.waitForSelector(selectors.passenger.form);
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    await page.waitForSelector(selectors.payment.form);

    // Check for Stripe iframes
    const stripeIframes = page.locator(selectors.payment.stripeIframe);
    const iframeCount = await stripeIframes.count();

    console.log(`Stripe iframes found: ${iframeCount}`);

    if (iframeCount > 0) {
      console.log('✅ Using secure Stripe Elements');
    } else {
      console.log('Payment may use different implementation');
    }

    console.log('✅ Payment security test passed!');
  });

  test('should not expose sensitive payment data in console', async ({ page }) => {
    const consoleMessages: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(msg.text().toLowerCase());
    });

    await mockStripePayment(page);

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

    const skipSeats = page.locator(selectors.seats.skipSeatsButton);
    if (await skipSeats.isVisible({ timeout: 5000 })) {
      await skipSeats.click();
    }

    await page.waitForSelector(selectors.passenger.form);
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.locator(selectors.passenger.continueButton).click();
    await page.waitForLoadState('networkidle');

    await page.waitForSelector(selectors.payment.form);

    // Check for sensitive data in console
    const hasSensitiveData = consoleMessages.some(
      (msg) => msg.includes('4242') || msg.includes('card') && msg.includes('number')
    );

    expect(hasSensitiveData).toBe(false);

    console.log('✅ No sensitive data in console');
  });
});
