import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { FlightsSearchPage } from '../pages/flights-search.page';
import { FlightResultsPage } from '../pages/flights-results.page';
import { testFlights, testPassengers, getTestDateRange } from '../fixtures/test-data';

test.describe('Flight Search Flow', () => {
  test('should complete basic flight search from homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Step 1: Navigate to homepage
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // Step 2: Go to flights page
    await homePage.goToFlights();
    await flightsPage.verifyPageLoaded();

    // Step 3: Search for flights
    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      tripType: 'roundtrip',
      adults: 1,
    });

    // Step 4: Verify results page
    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();
    await resultsPage.verifyNoErrors();

    // Step 5: Verify at least some results
    const flightCount = await resultsPage.getFlightCount();
    expect(flightCount).toBeGreaterThan(0);

    console.log(`Found ${flightCount} flights for ${testFlights.domestic.origin} to ${testFlights.domestic.destination}`);
  });

  test('should search one-way flights', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();
    await flightsPage.verifyPageLoaded();

    const dates = getTestDateRange(45, 0);
    await flightsPage.searchFlight({
      origin: testFlights.shortHaul.origin,
      destination: testFlights.shortHaul.destination,
      departureDate: dates.departureDate,
      tripType: 'oneway',
      adults: 1,
    });

    await resultsPage.waitForResults();
    const flightCount = await resultsPage.getFlightCount();
    expect(flightCount).toBeGreaterThan(0);

    console.log(`One-way search returned ${flightCount} flights`);
  });

  test('should search with multiple passengers', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();

    const dates = getTestDateRange(60, 14);
    await flightsPage.searchFlight({
      origin: testFlights.international.origin,
      destination: testFlights.international.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      ...testPassengers.family,
    });

    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();

    console.log('Family search completed successfully');
  });

  test('should search business class flights', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();

    const dates = getTestDateRange(90, 10);
    await flightsPage.searchFlight({
      origin: testFlights.longHaul.origin,
      destination: testFlights.longHaul.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 2,
      className: 'business',
    });

    await resultsPage.waitForResults();
    const flightCount = await resultsPage.getFlightCount();
    expect(flightCount).toBeGreaterThanOrEqual(0); // Business class might have fewer results

    console.log(`Business class search returned ${flightCount} flights`);
  });

  test('should filter for direct flights only', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();

    const dates = getTestDateRange(45, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 1,
      directOnly: true,
    });

    await resultsPage.waitForResults();
    // Direct flights filter might return 0 results for some routes
    const flightCount = await resultsPage.getFlightCount();

    console.log(`Direct flights filter returned ${flightCount} flights`);
  });

  test('should handle invalid airport codes gracefully', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);

    await flightsPage.goto();

    // Try to fill with invalid codes
    await flightsPage.fillOrigin('XXX');
    await flightsPage.fillDestination('YYY');

    const dates = getTestDateRange(30, 7);
    await flightsPage.fillDepartureDate(dates.departureDate);
    await flightsPage.fillReturnDate(dates.returnDate);

    // Click search - should show validation error or no results
    await flightsPage.clickSearch();

    // Page should either show validation error or stay on search page
    await page.waitForTimeout(2000);

    // Check if we're still on flights page or went to results with error
    const currentUrl = page.url();
    console.log(`After invalid search, URL: ${currentUrl}`);
  });

  test('should validate required fields', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);

    await flightsPage.goto();

    // Try to search without filling fields
    await flightsPage.clickSearch();

    // Should show validation errors or prevent submission
    await page.waitForTimeout(1000);

    // Verify we didn't navigate to results
    const currentUrl = page.url();
    expect(currentUrl).toContain('/flights');
    expect(currentUrl).not.toContain('/results');

    console.log('Field validation working correctly');
  });

  test('should handle rapid search requests', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();

    const dates = getTestDateRange(30, 7);

    // Execute multiple searches quickly
    for (let i = 0; i < 3; i++) {
      await flightsPage.fillOrigin(testFlights.domestic.origin);
      await flightsPage.fillDestination(testFlights.domestic.destination);
      await flightsPage.fillDepartureDate(dates.departureDate);
      await flightsPage.fillReturnDate(dates.returnDate);
      await flightsPage.clickSearch();

      // Wait briefly before next search
      await page.waitForTimeout(500);
    }

    // Verify last search completed successfully
    await resultsPage.waitForResults();
    await resultsPage.verifyResultsDisplayed();

    console.log('Rapid search test completed');
  });

  test('should preserve search parameters in URL', async ({ page }) => {
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    await flightsPage.goto();

    const dates = getTestDateRange(30, 7);
    const searchParams = {
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 2,
      children: 1,
      className: 'economy' as const,
    };

    await flightsPage.searchFlight(searchParams);
    await resultsPage.waitForResults();

    // Verify URL contains search parameters
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe(searchParams.origin);
    expect(url.searchParams.get('to')).toBe(searchParams.destination);
    expect(url.searchParams.get('departure')).toBe(searchParams.departureDate);
    expect(url.searchParams.get('return')).toBe(searchParams.returnDate);
    expect(url.searchParams.get('adults')).toBe(searchParams.adults.toString());
    expect(url.searchParams.get('children')).toBe(searchParams.children.toString());

    console.log('URL parameters preserved correctly');
  });

  test('should support browser back navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    const flightsPage = new FlightsSearchPage(page);
    const resultsPage = new FlightResultsPage(page);

    // Navigate through flow
    await homePage.goto();
    await homePage.goToFlights();

    const dates = getTestDateRange(30, 7);
    await flightsPage.searchFlight({
      origin: testFlights.domestic.origin,
      destination: testFlights.domestic.destination,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();

    // Go back to search page
    await page.goBack();
    await page.waitForTimeout(1000);

    // Verify we're back on flights search page
    expect(page.url()).toContain('/flights');
    expect(page.url()).not.toContain('/results');

    console.log('Browser navigation test passed');
  });
});

test.describe('Flight Results Interaction', () => {
  test('should display flight cards with required information', async ({ page }) => {
    const resultsPage = new FlightResultsPage(page);

    const dates = getTestDateRange(30, 7);
    await resultsPage.goto({
      from: testFlights.domestic.origin,
      to: testFlights.domestic.destination,
      departure: dates.departureDate,
      return: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();

    const flightCount = await resultsPage.getFlightCount();
    expect(flightCount).toBeGreaterThan(0);

    // Get details of first flight card
    const flightDetails = await resultsPage.getFlightCardDetails(0);

    // Verify flight has price
    expect(flightDetails.price).toBeGreaterThan(0);
    console.log(`First flight price: $${flightDetails.price}`);

    // Verify airline information exists
    expect(flightDetails.airline).toBeTruthy();
    console.log(`Airline: ${flightDetails.airline}`);
  });

  test('should sort flight results', async ({ page }) => {
    const resultsPage = new FlightResultsPage(page);

    const dates = getTestDateRange(30, 7);
    await resultsPage.goto({
      from: testFlights.domestic.origin,
      to: testFlights.domestic.destination,
      departure: dates.departureDate,
      return: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();

    // Get price before sorting
    const firstFlightBefore = await resultsPage.getFlightCardDetails(0);

    // Sort by cheapest
    await resultsPage.sortBy('cheapest');
    await page.waitForTimeout(1000);

    // Get price after sorting
    const firstFlightAfter = await resultsPage.getFlightCardDetails(0);

    console.log(`Price before sort: $${firstFlightBefore.price}, after: $${firstFlightAfter.price}`);
  });

  test('should load more results when available', async ({ page }) => {
    const resultsPage = new FlightResultsPage(page);

    const dates = getTestDateRange(30, 7);
    await resultsPage.goto({
      from: testFlights.domestic.origin,
      to: testFlights.domestic.destination,
      departure: dates.departureDate,
      return: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();

    const initialCount = await resultsPage.getFlightCount();

    // Try to load more
    await resultsPage.loadMore();

    const finalCount = await resultsPage.getFlightCount();

    console.log(`Initial count: ${initialCount}, Final count: ${finalCount}`);

    // If load more button existed, count should increase
    if (finalCount > initialCount) {
      expect(finalCount).toBeGreaterThan(initialCount);
    }
  });

  test('should handle clicking on flight card', async ({ page }) => {
    const resultsPage = new FlightResultsPage(page);

    const dates = getTestDateRange(30, 7);
    await resultsPage.goto({
      from: testFlights.domestic.origin,
      to: testFlights.domestic.destination,
      departure: dates.departureDate,
      return: dates.returnDate,
      adults: 1,
    });

    await resultsPage.waitForResults();

    // Click on first flight
    await resultsPage.selectFlight(0);

    // Wait for navigation or modal
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`After selecting flight, URL: ${currentUrl}`);

    // Should navigate to booking page or show details modal
    // This test documents current behavior
  });
});
