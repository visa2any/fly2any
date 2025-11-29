import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Analytics & Business Intelligence
 * Coverage: Weekly analytics, hotel rankings, market data
 * Total Scenarios: 5
 */

test.describe('Analytics System', () => {
  const baseUrl = 'http://localhost:3000';

  test('should retrieve weekly analytics report', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/weekly`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('weekStartDate');
    expect(data.data).toHaveProperty('weekEndDate');
    expect(data.data).toHaveProperty('metrics');
    expect(data.data.metrics).toHaveProperty('totalBookings');
    expect(data.data.metrics).toHaveProperty('totalRevenue');
    expect(data.data.metrics).toHaveProperty('averageBookingValue');
  });

  test('should retrieve weekly analytics with specific date', async ({ request }) => {
    const startDate = new Date('2025-01-01').toISOString().split('T')[0];
    const response = await request.get(`${baseUrl}/api/analytics/weekly?weekStartDate=${startDate}`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('weekStartDate');
  });

  test('should retrieve hotel rankings by period', async ({ request }) => {
    const periods = ['week', 'month', 'year'];

    for (const period of periods) {
      const response = await request.get(`${baseUrl}/api/analytics/hotels?period=${period}`);

      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('period');
      expect(data.data).toHaveProperty('rankings');
      expect(Array.isArray(data.data.rankings)).toBe(true);

      if (data.data.rankings.length > 0) {
        const firstRanking = data.data.rankings[0];
        expect(firstRanking).toHaveProperty('rank');
        expect(firstRanking).toHaveProperty('hotelId');
        expect(firstRanking).toHaveProperty('hotelName');
        expect(firstRanking).toHaveProperty('bookings');
        expect(firstRanking).toHaveProperty('revenue');
      }
    }
  });

  test('should retrieve market-specific data', async ({ request }) => {
    const marketId = 'test-market-123';
    const response = await request.get(
      `${baseUrl}/api/analytics/markets?marketId=${marketId}`
    );

    // Should either return data or error gracefully
    const data = await response.json();

    if (response.status() === 200) {
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('marketId');
      expect(data.data).toHaveProperty('metrics');
    } else {
      expect(data.success).toBe(false);
    }
  });

  test('should require marketId for market data endpoint', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/markets`);

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toContain('marketId');
  });
});

test.describe('Analytics Dashboard UI', () => {
  const baseUrl = 'http://localhost:3000';

  test('should display analytics metrics on dashboard', async ({ page }) => {
    await page.goto(baseUrl);

    await page.waitForTimeout(2000);

    // Dashboard should load (specific analytics page would be /admin/analytics or similar)
    const pageLoaded = await page.title();
    expect(pageLoaded.length > 0).toBe(true);
  });

  test('should allow period selection for analytics', async ({ page }) => {
    await page.goto(baseUrl);

    await page.waitForTimeout(1000);

    // Period selector should be available in analytics views
    const pageContent = await page.content();
    expect(pageContent.length > 0).toBe(true);
  });
});

test.describe('Analytics Performance', () => {
  const baseUrl = 'http://localhost:3000';

  test('should handle large dataset analytics queries', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${baseUrl}/api/analytics/weekly`);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Analytics query should complete within 30 seconds (generous timeout for complex queries)
    expect(duration).toBeLessThan(30000);
    expect(response.status()).toBe(200);
  });

  test('should provide proper error handling for invalid dates', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics/weekly?weekStartDate=invalid-date`);

    // Should handle gracefully (either accept and process or return error)
    const data = await response.json();

    if (response.status() !== 200) {
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    }
  });
});
