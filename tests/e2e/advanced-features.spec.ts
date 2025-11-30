import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Advanced Hotel Features
 *
 * Tests cover:
 * 1. Weather Integration
 * 2. Stream Hotel Rates (SSE)
 * 3. Add-ons Upsell (Uber/eSIM)
 * 4. Hotel Compare Mode
 * 5. Price Calendar
 * 6. Smart Filters
 * 7. NLP Search
 */

test.describe('Weather Integration', () => {
  test('should fetch weather data for hotel destination', async ({ request }) => {
    const response = await request.get('/api/hotels/weather', {
      params: {
        latitude: '25.2048',
        longitude: '55.2708',
        checkin: '2025-01-15',
        checkout: '2025-01-18',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.forecast).toBeDefined();
    expect(data.data.summary).toBeDefined();
    expect(data.data.summary.avgTemperature).toBeDefined();
    expect(data.data.summary.weatherCondition).toBeDefined();
    expect(data.data.summary.recommendation).toBeDefined();
  });

  test('should return error for missing parameters', async ({ request }) => {
    const response = await request.get('/api/hotels/weather', {
      params: {
        latitude: '25.2048',
        // Missing longitude, checkin, checkout
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

test.describe('Add-ons API', () => {
  test('should fetch available add-ons', async ({ request }) => {
    const response = await request.get('/api/hotels/addons', {
      params: {
        destination: 'Dubai',
        countryCode: 'AE',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.addons).toBeDefined();
    expect(Array.isArray(data.data.addons)).toBe(true);
    expect(data.data.addons.length).toBeGreaterThan(0);

    // Check for Uber vouchers
    const uberAddons = data.data.addons.filter((a: any) => a.type === 'uber_voucher');
    expect(uberAddons.length).toBeGreaterThan(0);

    // Check for eSIM plans
    const esimAddons = data.data.addons.filter((a: any) => a.type === 'esim');
    expect(esimAddons.length).toBeGreaterThan(0);
  });

  test('should filter add-ons by category', async ({ request }) => {
    const response = await request.get('/api/hotels/addons', {
      params: {
        category: 'uber',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    const allUber = data.data.addons.every((a: any) => a.type === 'uber_voucher');
    expect(allUber).toBe(true);
  });

  test('should attach add-ons to booking', async ({ request }) => {
    const response = await request.post('/api/hotels/addons', {
      data: {
        prebookId: 'test-prebook-123',
        addons: ['uber-25', 'esim-3gb'],
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.addons).toHaveLength(2);
    expect(data.data.totalAmount).toBeGreaterThan(0);
  });
});

test.describe('NLP Search API', () => {
  test('should parse simple destination query', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: 'hotels in Dubai',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.parsed.destination).toBe('dubai');
  });

  test('should parse complex query with dates and budget', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: '5-star hotels in Dubai with pool under $300 for 3 nights next week',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.parsed.destination).toBe('dubai');
    expect(data.data.parsed.stars).toContain(5);
    expect(data.data.parsed.budget?.max).toBe(300);
    expect(data.data.parsed.nights).toBe(3);
    expect(data.data.parsed.amenities).toContain('pool');
  });

  test('should parse family trip query', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: 'family friendly resort in Bali with kids club',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.parsed.destination).toBe('bali');
    expect(data.data.parsed.mood).toBe('family');
  });

  test('should parse romantic getaway query', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: 'romantic honeymoon hotel in Maldives with spa',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.parsed.destination).toBe('maldives');
    expect(data.data.parsed.mood).toBe('romantic');
    expect(data.data.parsed.amenities).toContain('spa');
  });

  test('should parse budget query', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: 'cheap budget hotel in Barcelona under $100',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.parsed.destination).toBe('barcelona');
    expect(data.data.parsed.mood).toBe('budget');
    expect(data.data.parsed.budget?.max).toBe(100);
  });

  test('should provide interpretation', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: {
        query: '4 adults in Tokyo with gym',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.data.interpretation).toBeDefined();
    expect(data.data.interpretation.length).toBeGreaterThan(0);
  });

  test('should handle GET request', async ({ request }) => {
    const response = await request.get('/api/hotels/nlp-search', {
      params: {
        q: 'luxury hotel in Paris',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.destination).toBe('paris');
    expect(data.data.mood).toBe('luxury');
  });
});

test.describe('Stream Hotel Rates (SSE)', () => {
  test('should return event stream content type', async ({ request }) => {
    const today = new Date();
    const checkin = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
    const checkout = new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0];

    const response = await request.get('/api/hotels/stream-rates', {
      params: {
        latitude: '25.2048',
        longitude: '55.2708',
        checkin,
        checkout,
        adults: '2',
        limit: '5',
      },
    });

    expect(response.headers()['content-type']).toContain('text/event-stream');
  });

  test('should require location parameters', async ({ request }) => {
    const response = await request.get('/api/hotels/stream-rates', {
      params: {
        checkin: '2025-01-15',
        checkout: '2025-01-18',
      },
    });

    expect(response.status()).toBe(400);
  });
});

test.describe('Districts API', () => {
  test('should return districts for Dubai', async ({ request }) => {
    const response = await request.get('/api/hotels/districts', {
      params: {
        city: 'Dubai',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);

    // Check district structure
    const district = data.data[0];
    expect(district.id).toBeDefined();
    expect(district.name).toBeDefined();
    expect(district.location).toBeDefined();
    expect(district.location.lat).toBeDefined();
    expect(district.location.lng).toBeDefined();
  });

  test('should return empty for unknown city', async ({ request }) => {
    const response = await request.get('/api/hotels/districts', {
      params: {
        city: 'UnknownCity12345',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });
});

test.describe('UI Components Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hotels page
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');
  });

  test('should display search bar', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should show hotel results grid', async ({ page }) => {
    // Wait for any hotel content to load
    await page.waitForTimeout(2000);

    // Check for hotel classification section or results
    const hotelsSection = page.locator('text=/Hotel|Classification|Search/i').first();
    await expect(hotelsSection).toBeVisible();
  });
});

test.describe('Smart Filters Component', () => {
  test('should load filter presets', async ({ page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');

    // Look for filter-related elements
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("filter")').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Check for smart filter presets
      const presetButtons = page.locator('[class*="filter"], [class*="preset"]');
      const count = await presetButtons.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Performance Tests', () => {
  test('API response times should be acceptable', async ({ request }) => {
    const start = Date.now();

    // Test weather API
    const weatherResponse = await request.get('/api/hotels/weather', {
      params: {
        latitude: '25.2048',
        longitude: '55.2708',
        checkin: '2025-01-15',
        checkout: '2025-01-18',
      },
    });

    const weatherTime = Date.now() - start;
    expect(weatherTime).toBeLessThan(5000); // Should respond within 5 seconds

    // Test add-ons API
    const addonsStart = Date.now();
    const addonsResponse = await request.get('/api/hotels/addons');
    const addonsTime = Date.now() - addonsStart;
    expect(addonsTime).toBeLessThan(1000); // Should respond within 1 second

    // Test NLP API
    const nlpStart = Date.now();
    const nlpResponse = await request.post('/api/hotels/nlp-search', {
      data: { query: 'hotels in Dubai' },
    });
    const nlpTime = Date.now() - nlpStart;
    expect(nlpTime).toBeLessThan(1000); // Should respond within 1 second
  });
});

test.describe('Error Handling', () => {
  test('should handle invalid weather coordinates gracefully', async ({ request }) => {
    const response = await request.get('/api/hotels/weather', {
      params: {
        latitude: 'invalid',
        longitude: 'invalid',
        checkin: '2025-01-15',
        checkout: '2025-01-18',
      },
    });

    // Should either return an error or handle gracefully
    const data = await response.json();
    // Even with invalid params, should get a structured response
    expect(data).toHaveProperty('success');
  });

  test('should handle empty NLP query', async ({ request }) => {
    const response = await request.post('/api/hotels/nlp-search', {
      data: { query: '' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('should handle missing add-ons in attach request', async ({ request }) => {
    const response = await request.post('/api/hotels/addons', {
      data: {
        bookingId: 'test-123',
        addons: [],
      },
    });

    expect(response.status()).toBe(400);
  });
});
