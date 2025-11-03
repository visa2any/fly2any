import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Flight Search Page
 * Provides reusable methods for searching flights
 */
export class FlightsSearchPage {
  readonly page: Page;

  // Locators
  readonly logo: Locator;
  readonly originInput: Locator;
  readonly destinationInput: Locator;
  readonly departureDateInput: Locator;
  readonly returnDateInput: Locator;
  readonly roundTripButton: Locator;
  readonly oneWayButton: Locator;
  readonly adultsInput: Locator;
  readonly childrenInput: Locator;
  readonly infantsInput: Locator;
  readonly classSelect: Locator;
  readonly directFlightsCheckbox: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.logo = page.locator('img[alt*="Fly2Any"]');
    this.originInput = page.locator('input[placeholder*="JFK"]').first();
    this.destinationInput = page.locator('input[placeholder*="LAX"]').first();
    this.departureDateInput = page.locator('input[type="date"]').first();
    this.returnDateInput = page.locator('input[type="date"]').nth(1);
    this.roundTripButton = page.locator('button:has-text("Round Trip"), button:has-text("Ida e Volta")');
    this.oneWayButton = page.locator('button:has-text("One Way"), button:has-text("Somente Ida")');
    this.adultsInput = page.locator('input[type="number"]').first();
    this.childrenInput = page.locator('input[type="number"]').nth(1);
    this.infantsInput = page.locator('input[type="number"]').nth(2);
    this.classSelect = page.locator('select').first();
    this.directFlightsCheckbox = page.locator('input[type="checkbox"]');
    this.searchButton = page.locator('button:has-text("Search"), button:has-text("Buscar")');
  }

  /**
   * Navigate to flights search page
   */
  async goto() {
    await this.page.goto('/flights');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /**
   * Fill origin airport
   */
  async fillOrigin(airportCode: string) {
    await this.originInput.click();
    await this.originInput.fill(airportCode);
    await this.page.waitForTimeout(500); // Wait for autocomplete
  }

  /**
   * Fill destination airport
   */
  async fillDestination(airportCode: string) {
    await this.destinationInput.click();
    await this.destinationInput.fill(airportCode);
    await this.page.waitForTimeout(500); // Wait for autocomplete
  }

  /**
   * Fill departure date
   */
  async fillDepartureDate(date: string) {
    await this.departureDateInput.fill(date);
  }

  /**
   * Fill return date
   */
  async fillReturnDate(date: string) {
    await this.returnDateInput.fill(date);
  }

  /**
   * Select trip type
   */
  async selectTripType(type: 'roundtrip' | 'oneway') {
    if (type === 'roundtrip') {
      await this.roundTripButton.click();
    } else {
      await this.oneWayButton.click();
    }
  }

  /**
   * Set number of passengers
   */
  async setPassengers(adults: number, children: number = 0, infants: number = 0) {
    await this.adultsInput.fill(adults.toString());
    await this.childrenInput.fill(children.toString());
    await this.infantsInput.fill(infants.toString());
  }

  /**
   * Select cabin class
   */
  async selectClass(className: 'economy' | 'premium' | 'business' | 'first') {
    const classMap = {
      'economy': 'ECONOMY',
      'premium': 'PREMIUM_ECONOMY',
      'business': 'BUSINESS',
      'first': 'FIRST'
    };
    await this.classSelect.selectOption(classMap[className]);
  }

  /**
   * Toggle direct flights only
   */
  async toggleDirectFlights(enable: boolean) {
    const isChecked = await this.directFlightsCheckbox.isChecked();
    if (isChecked !== enable) {
      await this.directFlightsCheckbox.click();
    }
  }

  /**
   * Click search button
   */
  async clickSearch() {
    await this.searchButton.click();
  }

  /**
   * Complete flight search (all fields)
   */
  async searchFlight(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    tripType?: 'roundtrip' | 'oneway';
    adults?: number;
    children?: number;
    infants?: number;
    className?: 'economy' | 'premium' | 'business' | 'first';
    directOnly?: boolean;
  }) {
    // Select trip type
    if (params.tripType) {
      await this.selectTripType(params.tripType);
    }

    // Fill airports
    await this.fillOrigin(params.origin);
    await this.fillDestination(params.destination);

    // Fill dates
    await this.fillDepartureDate(params.departureDate);
    if (params.returnDate) {
      await this.fillReturnDate(params.returnDate);
    }

    // Set passengers
    await this.setPassengers(
      params.adults || 1,
      params.children || 0,
      params.infants || 0
    );

    // Set class
    if (params.className) {
      await this.selectClass(params.className);
    }

    // Direct flights
    if (params.directOnly !== undefined) {
      await this.toggleDirectFlights(params.directOnly);
    }

    // Search
    await this.clickSearch();

    // Wait for navigation to results page
    await this.page.waitForURL('**/results*', { timeout: 30000 });
  }
}
