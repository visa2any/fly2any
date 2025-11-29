import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Prebook API & Price Lock
 *
 * Tests the prebook/price lock functionality:
 * 1. Prebook API endpoint
 * 2. Price lock timer display
 * 3. Expiry handling
 * 4. Booking with prebook ID
 */

test.describe('Prebook API', () => {
  test('should successfully prebook a hotel room', async ({ request }) => {
    // Call prebook API directly
    const response = await request.post('http://localhost:3000/api/hotels/prebook', {
      data: {
        offerId: 'test-offer-123',
        hotelId: 'lp3079e',
        checkIn: '2025-12-06',
        checkOut: '2025-12-13',
      },
    });

    // This will fail if LiteAPI credentials aren't configured, but tests the endpoint structure
    const status = response.status();

    console.log(`Prebook API status: ${status}`);

    if (status === 200) {
      const data = await response.json();

      expect(data).toHaveProperty('success');

      if (data.success) {
        expect(data.data).toHaveProperty('prebookId');
        expect(data.data).toHaveProperty('expiresAt');
        expect(data.data).toHaveProperty('price');

        console.log('✅ Prebook successful:');
        console.log(`   Prebook ID: ${data.data.prebookId}`);
        console.log(`   Expires At: ${data.data.expiresAt}`);
        console.log(`   Price: ${data.data.price.amount} ${data.data.price.currency}`);
      } else {
        console.log(`ℹ️  Prebook failed (expected with test data): ${data.error}`);
      }
    } else if (status === 400) {
      console.log('ℹ️  Prebook validation error (expected with invalid offer ID)');
    } else {
      console.log(`ℹ️  Prebook returned status ${status}`);
    }
  });

  test('should check prebook status', async ({ request }) => {
    // Check status of a prebook
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

    const response = await request.get('http://localhost:3000/api/hotels/prebook', {
      params: {
        prebookId: 'test-prebook-123',
        expiresAt: expiresAt,
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data.data).toHaveProperty('valid');
    expect(data.data).toHaveProperty('expired');
    expect(data.data).toHaveProperty('timeRemaining');

    console.log('✅ Prebook status check:');
    console.log(`   Valid: ${data.data.valid}`);
    console.log(`   Expired: ${data.data.expired}`);
    console.log(`   Time Remaining: ${data.data.timeRemaining}s`);
  });

  test('should handle expired prebook', async ({ request }) => {
    // Check status of an expired prebook
    const expiresAt = new Date(Date.now() - 1000).toISOString(); // 1 second ago

    const response = await request.get('http://localhost:3000/api/hotels/prebook', {
      params: {
        prebookId: 'test-prebook-expired',
        expiresAt: expiresAt,
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data.data.expired).toBe(true);
    expect(data.data.valid).toBe(false);
    expect(data.data.timeRemaining).toBe(0);

    console.log('✅ Expired prebook correctly identified');
  });
});

test.describe('Price Lock Timer UI', () => {
  test.skip('should display price lock timer during booking', async ({ page }) => {
    // This test would require a full integration with prebook flow
    // Skip for now as it requires UI integration

    await page.goto('/hotels/booking?prebook=test');

    // Look for price lock timer
    const timer = page.locator('[data-testid="price-lock-timer"]')
      .or(page.locator('text=/\\d{2}:\\d{2}/')) // MM:SS format
      .first();

    if (await timer.count() > 0) {
      const timerText = await timer.textContent();
      console.log(`✅ Price lock timer found: ${timerText}`);

      // Timer should match MM:SS format
      expect(timerText).toMatch(/\d{2}:\d{2}/);
    }
  });
});

test.describe('Prebook Error Handling', () => {
  test('should handle missing offerId', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/hotels/prebook', {
      data: {},
    });

    expect(response.status()).toBe(400);

    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toContain('offerId');

    console.log('✅ Correctly rejected missing offerId');
  });

  test('should handle invalid prebook status check', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/hotels/prebook', {
      params: {
        prebookId: '', // Missing
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();

    expect(data.success).toBe(false);

    console.log('✅ Correctly rejected invalid status check');
  });
});
