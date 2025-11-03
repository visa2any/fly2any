import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Homepage
 * Provides reusable methods for interacting with the homepage
 */
export class HomePage {
  readonly page: Page;

  // Locators
  readonly logo: Locator;
  readonly flightsCard: Locator;
  readonly hotelsCard: Locator;
  readonly languageEN: Locator;
  readonly languagePT: Locator;
  readonly languageES: Locator;
  readonly whatsappButton: Locator;
  readonly phoneButton: Locator;
  readonly emailLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.logo = page.locator('img[alt*="Fly2Any"]');
    this.flightsCard = page.locator('a[href="/flights"]');
    this.hotelsCard = page.locator('a[href="/hotels"]');
    this.languageEN = page.locator('button:has-text("EN")');
    this.languagePT = page.locator('button:has-text("PT")');
    this.languageES = page.locator('button:has-text("ES")');
    this.whatsappButton = page.locator('a[href*="wa.me"]');
    this.phoneButton = page.locator('a[href*="tel:"]');
    this.emailLink = page.locator('a[href*="mailto:"]');
  }

  /**
   * Navigate to homepage
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify homepage is loaded correctly
   */
  async verifyPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.page).toHaveTitle(/Fly2Any/i);
  }

  /**
   * Switch language
   */
  async switchLanguage(lang: 'EN' | 'PT' | 'ES') {
    const buttons = {
      'EN': this.languageEN,
      'PT': this.languagePT,
      'ES': this.languageES
    };
    await buttons[lang].click();
  }

  /**
   * Navigate to flights page
   */
  async goToFlights() {
    await this.flightsCard.click();
    await this.page.waitForURL('**/flights');
  }

  /**
   * Navigate to hotels page
   */
  async goToHotels() {
    await this.hotelsCard.click();
    await this.page.waitForURL('**/hotels');
  }

  /**
   * Verify contact buttons are visible
   */
  async verifyContactButtons() {
    await expect(this.whatsappButton).toBeVisible();
    await expect(this.phoneButton).toBeVisible();
    await expect(this.emailLink).toBeVisible();
  }
}
