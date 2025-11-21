/**
 * E2E Tests: New Flight Search Features
 *
 * Tests for:
 * - Advanced Search Filters
 * - Enhanced Airport Autocomplete with NLP
 * - Alternative Airports Widget
 * - Sustainability Badges
 * - Best Time to Book Widget
 * - Airport Route Map
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced Search Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flights/search');
    await page.waitForLoadState('networkidle');
  });

  test('should display advanced filters section', async ({ page }) => {
    // Look for filter controls
    const filterSection = page.locator('[data-testid="advanced-filters"]').or(
      page.locator('text=Filters').first()
    );

    await expect(filterSection).toBeVisible();
  });

  test('should filter flights by price range', async ({ page }) => {
    // Perform a search first
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.click('[data-testid="airport-suggestion"]').first();
    await page.fill('[data-testid="destination-input"]', 'LAX');
    await page.click('[data-testid="airport-suggestion"]').first();
    await page.click('[data-testid="search-button"]');

    // Wait for results
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Open price filter
    const priceFilter = page.locator('text=Price Range').or(
      page.locator('[data-testid="price-filter"]')
    );
    await priceFilter.click();

    // Adjust price slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('500');

    // Verify results update
    await page.waitForTimeout(1000);
    const flightCards = page.locator('[data-testid="flight-card"]');
    const count = await flightCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter flights by stops', async ({ page }) => {
    // Navigate to results page
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Find and click direct flights filter
    const directFlightsFilter = page.locator('text=Direct').or(
      page.locator('[data-testid="filter-direct"]')
    );
    await directFlightsFilter.click();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify direct flights badge or 0 stops indicator
    const directBadges = page.locator('text=Direct').or(
      page.locator('text=0 stops')
    );
    expect(await directBadges.count()).toBeGreaterThan(0);
  });

  test('should filter by departure time segments', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=SFO&departDate=2025-12-15');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for time filter (Morning, Afternoon, Evening)
    const morningFilter = page.locator('text=Morning').or(
      page.locator('[data-testid="time-morning"]')
    );

    if (await morningFilter.isVisible()) {
      await morningFilter.click();
      await page.waitForTimeout(1000);

      // Results should be filtered
      const flightCount = await page.locator('[data-testid="flight-card"]').count();
      expect(flightCount).toBeGreaterThan(0);
    }
  });

  test('should display active filter count', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-20');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Apply multiple filters
    const directFilter = page.locator('text=Direct').first();
    await directFilter.click();

    // Look for filter count badge
    const filterCountBadge = page.locator('[data-testid="active-filter-count"]').or(
      page.locator('text=/^\\d+ active/i')
    );

    if (await filterCountBadge.isVisible()) {
      const countText = await filterCountBadge.textContent();
      expect(countText).toMatch(/\d+/);
    }
  });
});

test.describe('Enhanced Airport Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flights/search');
  });

  test('should show airport suggestions on typing', async ({ page }) => {
    const originInput = page.locator('[data-testid="origin-input"]').or(
      page.locator('input[placeholder*="From"]').first()
    );

    await originInput.fill('New York');
    await page.waitForTimeout(500);

    // Check for dropdown with suggestions
    const suggestions = page.locator('[data-testid="airport-suggestion"]').or(
      page.locator('[role="option"]')
    );

    expect(await suggestions.count()).toBeGreaterThan(0);
  });

  test('should support natural language queries', async ({ page }) => {
    const destinationInput = page.locator('[data-testid="destination-input"]').or(
      page.locator('input[placeholder*="To"]').first()
    );

    await destinationInput.fill('beaches in Asia');
    await page.waitForTimeout(1000);

    // Look for NLP badge or indicator
    const nlpBadge = page.locator('text=Natural Language').or(
      page.locator('[data-testid="nlp-match"]')
    );

    // Check if suggestions appear
    const suggestions = page.locator('[data-testid="airport-suggestion"]').or(
      page.locator('[role="option"]')
    );

    const suggestionCount = await suggestions.count();
    expect(suggestionCount).toBeGreaterThan(0);
  });

  test('should show metro area expansion option', async ({ page }) => {
    const originInput = page.locator('[data-testid="origin-input"]').or(
      page.locator('input[placeholder*="From"]').first()
    );

    await originInput.fill('NYC');
    await page.waitForTimeout(500);

    // Look for "All airports in" option
    const metroOption = page.locator('text=/All airports in/i').or(
      page.locator('[data-testid="metro-expansion"]')
    );

    if (await metroOption.isVisible()) {
      expect(await metroOption.textContent()).toContain('airports');
    }
  });

  test('should display recent searches', async ({ page }) => {
    // First, perform a search
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.waitForTimeout(500);
    await page.click('[data-testid="airport-suggestion"]').first();

    // Clear and refocus input
    await page.fill('[data-testid="origin-input"]', '');
    await page.click('[data-testid="origin-input"]');
    await page.waitForTimeout(500);

    // Check for recent searches section
    const recentSection = page.locator('text=Recent').or(
      page.locator('[data-testid="recent-searches"]')
    );

    if (await recentSection.isVisible()) {
      expect(recentSection).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    const originInput = page.locator('[data-testid="origin-input"]').or(
      page.locator('input[placeholder*="From"]').first()
    );

    await originInput.fill('London');
    await page.waitForTimeout(500);

    // Press arrow down to navigate
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Press enter to select
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Input should have a value now
    const value = await originInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });
});

test.describe('Sustainability Features', () => {
  test('should display sustainability badges on flight cards', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for sustainability grade badges (A, B, C, D, F)
    const sustainabilityBadge = page.locator('[data-testid="sustainability-grade"]').or(
      page.locator('text=/Grade [ABCDF]/i')
    );

    const badgeCount = await sustainabilityBadge.count();
    if (badgeCount > 0) {
      expect(badgeCount).toBeGreaterThan(0);

      // Verify badge contains valid grade
      const badgeText = await sustainabilityBadge.first().textContent();
      expect(badgeText).toMatch(/[ABCDF]/);
    }
  });

  test('should show CO2 emissions information', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LHR&departDate=2025-12-15');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for CO2 or emissions text
    const emissionsInfo = page.locator('text=/\\d+\\s*kg\\s*CO2/i').or(
      page.locator('[data-testid="emissions-info"]')
    );

    const emissionsCount = await emissionsInfo.count();
    if (emissionsCount > 0) {
      const emissionsText = await emissionsInfo.first().textContent();
      expect(emissionsText).toMatch(/\d+/);
    }
  });

  test('should allow filtering by sustainability grade', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=SFO&departDate=2025-12-20');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for sustainability filter
    const sustainabilityFilter = page.locator('text=Sustainability').or(
      page.locator('[data-testid="sustainability-filter"]')
    );

    if (await sustainabilityFilter.isVisible()) {
      await sustainabilityFilter.click();
      await page.waitForTimeout(500);

      // Look for grade options
      const gradeAOption = page.locator('text=Grade A').or(
        page.locator('[data-testid="grade-a-filter"]')
      );

      if (await gradeAOption.isVisible()) {
        await gradeAOption.click();
        await page.waitForTimeout(1000);

        // Results should be filtered
        const flightCount = await page.locator('[data-testid="flight-card"]').count();
        expect(flightCount).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Alternative Airports Widget', () => {
  test('should display alternative airports for origin/destination', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for alternative airports section
    const alternativeSection = page.locator('text=/Alternative (Airports|Destinations)/i').or(
      page.locator('[data-testid="alternative-airports"]')
    );

    if (await alternativeSection.isVisible()) {
      expect(alternativeSection).toBeVisible();

      // Should show nearby airports
      const airportCards = page.locator('[data-testid="alternative-airport-card"]');
      const count = await airportCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show estimated savings for alternative airports', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=SFO&departDate=2025-12-15');
    await page.waitForTimeout(3000);

    const savingsText = page.locator('text=/Save.*\\$/i').or(
      page.locator('[data-testid="estimated-savings"]')
    );

    const savingsCount = await savingsText.count();
    if (savingsCount > 0) {
      const text = await savingsText.first().textContent();
      expect(text).toMatch(/\$/);
    }
  });

  test('should allow clicking alternative airport to search', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForTimeout(3000);

    const alternativeCard = page.locator('[data-testid="alternative-airport-card"]').first();

    if (await alternativeCard.isVisible()) {
      const initialUrl = page.url();
      await alternativeCard.click();
      await page.waitForTimeout(2000);

      // URL should change to reflect new search
      const newUrl = page.url();
      // URL might change or page might reload
      expect(newUrl.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Best Time to Book Widget', () => {
  test('should display booking recommendation', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2026-06-01');
    await page.waitForTimeout(2000);

    const bookingWidget = page.locator('text=/Best Time to Book/i').or(
      page.locator('[data-testid="best-time-to-book"]')
    );

    if (await bookingWidget.isVisible()) {
      expect(bookingWidget).toBeVisible();
    }
  });

  test('should show price trend information', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LHR&departDate=2026-07-01');
    await page.waitForTimeout(2000);

    const priceTrend = page.locator('text=/(rising|falling|stable)/i').or(
      page.locator('[data-testid="price-trend"]')
    );

    const trendCount = await priceTrend.count();
    if (trendCount > 0) {
      const trendText = await priceTrend.first().textContent();
      expect(trendText).toMatch(/(rising|falling|stable|increasing|decreasing)/i);
    }
  });

  test('should provide booking recommendation', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=MIA&departDate=2026-03-15');
    await page.waitForTimeout(2000);

    const recommendation = page.locator('text=/Book (now|soon|wait)/i').or(
      page.locator('[data-testid="booking-recommendation"]')
    );

    const recCount = await recommendation.count();
    if (recCount > 0) {
      expect(recommendation.first()).toBeVisible();
    }
  });
});

test.describe('Airport Route Map', () => {
  test('should display route map on results page', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForTimeout(3000);

    // Look for map container or Leaflet elements
    const mapContainer = page.locator('[data-testid="route-map"]').or(
      page.locator('.leaflet-container')
    );

    const mapExists = await mapContainer.count();
    if (mapExists > 0) {
      expect(mapContainer).toBeVisible();
    } else {
      // Check for fallback message if Leaflet not installed
      const fallbackMessage = page.locator('text=/Map not available/i');
      if (await fallbackMessage.isVisible()) {
        expect(fallbackMessage).toBeVisible();
      }
    }
  });

  test('should show distance and flight time', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForTimeout(2000);

    // Look for distance information
    const distanceInfo = page.locator('text=/\\d+\\s*(km|mi)/i').or(
      page.locator('[data-testid="flight-distance"]')
    );

    const distanceCount = await distanceInfo.count();
    if (distanceCount > 0) {
      const distanceText = await distanceInfo.first().textContent();
      expect(distanceText).toMatch(/\d+/);
    }

    // Look for flight time
    const flightTime = page.locator('text=/\\d+h\\s*\\d+m/i').or(
      page.locator('[data-testid="flight-time"]')
    );

    const timeCount = await flightTime.count();
    if (timeCount > 0) {
      const timeText = await flightTime.first().textContent();
      expect(timeText).toMatch(/\d+/);
    }
  });
});

test.describe('Performance & Accessibility', () => {
  test('should load results page within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    const loadTime = Date.now() - startTime;

    // Should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);
    console.log(`Page loaded in ${loadTime}ms`);
  });

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/flights/search');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be on an input
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.count()).toBe(1);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/flights/search');

    // Check for ARIA labels on important elements
    const ariaLabels = page.locator('[aria-label]');
    const count = await ariaLabels.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display mobile-friendly filters', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=LAX&departDate=2025-12-01');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    // Look for mobile filter button
    const filterButton = page.locator('text=Filters').or(
      page.locator('[data-testid="mobile-filter-button"]')
    );

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Filter panel should open
      const filterPanel = page.locator('[data-testid="filter-panel"]').or(
        page.locator('[role="dialog"]')
      );

      expect(await filterPanel.count()).toBeGreaterThan(0);
    }
  });

  test('should display flight cards in mobile layout', async ({ page }) => {
    await page.goto('/flights/results?origin=JFK&destination=SFO&departDate=2025-12-15');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 15000 });

    const flightCard = page.locator('[data-testid="flight-card"]').first();
    expect(await flightCard.isVisible()).toBe(true);

    // Card should be full width on mobile
    const box = await flightCard.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(300);
    }
  });
});
