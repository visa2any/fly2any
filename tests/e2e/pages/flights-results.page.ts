import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Flight Results Page
 * Provides reusable methods for interacting with flight results
 */
export class FlightResultsPage {
  readonly page: Page;

  // Locators
  readonly flightCards: Locator;
  readonly firstFlightCard: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;
  readonly noResultsMessage: Locator;
  readonly sortDropdown: Locator;
  readonly priceFilter: Locator;
  readonly stopsFilter: Locator;
  readonly airlinesFilter: Locator;
  readonly modifySearchButton: Locator;
  readonly loadMoreButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.flightCards = page.locator('[class*="FlightCard"], article').filter({ hasText: /\$|USD|EUR/ });
    this.firstFlightCard = this.flightCards.first();
    this.loadingIndicator = page.locator('[class*="loading"], [class*="spinner"]');
    this.errorMessage = page.locator('text=/error|failed/i');
    this.noResultsMessage = page.locator('text=/no flights|no results/i');
    this.sortDropdown = page.locator('select, [role="combobox"]').first();
    this.priceFilter = page.locator('[class*="price-filter"]');
    this.stopsFilter = page.locator('[class*="stops-filter"]');
    this.airlinesFilter = page.locator('[class*="airline-filter"]');
    this.modifySearchButton = page.locator('button:has-text("Modify"), button:has-text("Modificar")');
    this.loadMoreButton = page.locator('button:has-text("Load More"), button:has-text("Carregar Mais")');
  }

  /**
   * Navigate to results page with search params
   */
  async goto(params: {
    from: string;
    to: string;
    departure: string;
    return?: string;
    adults?: number;
    children?: number;
    infants?: number;
    class?: string;
  }) {
    const searchParams = new URLSearchParams({
      from: params.from,
      to: params.to,
      departure: params.departure,
      adults: (params.adults || 1).toString(),
      children: (params.children || 0).toString(),
      infants: (params.infants || 0).toString(),
      class: params.class || 'economy',
    });

    if (params.return) {
      searchParams.append('return', params.return);
    }

    await this.page.goto(`/flights/results?${searchParams.toString()}`);
  }

  /**
   * Wait for results to load
   */
  async waitForResults(timeout: number = 30000) {
    // Wait for either flight cards, no results message, or error
    await this.page.waitForSelector(
      '[class*="FlightCard"], text=/no flights/i, text=/error/i',
      { timeout }
    );
  }

  /**
   * Get number of flight cards displayed
   */
  async getFlightCount(): Promise<number> {
    return await this.flightCards.count();
  }

  /**
   * Verify results are displayed
   */
  async verifyResultsDisplayed() {
    const count = await this.getFlightCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Verify no errors occurred
   */
  async verifyNoErrors() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  /**
   * Get flight card by index
   */
  getFlightCard(index: number): Locator {
    return this.flightCards.nth(index);
  }

  /**
   * Get flight card details
   */
  async getFlightCardDetails(index: number = 0) {
    const card = this.getFlightCard(index);

    // Extract price
    const priceText = await card.locator('[class*="price"]').first().textContent();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;

    // Extract airline
    const airlineElement = card.locator('[class*="airline"]').first();
    const airline = await airlineElement.count() > 0 ? await airlineElement.textContent() : 'Unknown';

    // Extract departure time
    const timeElement = card.locator('[class*="time"], [class*="departure"]').first();
    const departureTime = await timeElement.count() > 0 ? await timeElement.textContent() : 'Unknown';

    return {
      price,
      airline: airline?.trim() || 'Unknown',
      departureTime: departureTime?.trim() || 'Unknown',
    };
  }

  /**
   * Click select/book button on a flight card
   */
  async selectFlight(index: number = 0) {
    const card = this.getFlightCard(index);
    const selectButton = card.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")').first();
    await selectButton.click();
  }

  /**
   * Sort results
   */
  async sortBy(option: 'best' | 'cheapest' | 'fastest' | 'earliest') {
    await this.sortDropdown.selectOption(option);
    await this.page.waitForTimeout(1000); // Wait for re-sort
  }

  /**
   * Apply price filter
   */
  async filterByPrice(min: number, max: number) {
    // This is a placeholder - actual implementation depends on filter UI
    console.log(`Filtering by price: $${min} - $${max}`);
  }

  /**
   * Filter by number of stops
   */
  async filterByStops(stops: 'direct' | '1-stop' | '2+-stops') {
    const stopOptions = {
      'direct': 'Direct',
      '1-stop': '1 Stop',
      '2+-stops': '2+ Stops'
    };
    // This is a placeholder - actual implementation depends on filter UI
    console.log(`Filtering by stops: ${stopOptions[stops]}`);
  }

  /**
   * Load more results
   */
  async loadMore() {
    if (await this.loadMoreButton.isVisible()) {
      await this.loadMoreButton.click();
      await this.page.waitForTimeout(1000); // Wait for new results
    }
  }

  /**
   * Take screenshot of results
   */
  async screenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Verify page performance metrics
   */
  async checkPerformanceMetrics() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      };
    });

    return performanceMetrics;
  }
}
