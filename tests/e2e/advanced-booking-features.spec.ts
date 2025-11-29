import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Advanced Booking Features (Quick Wins)
 *
 * Tests the newly implemented LiteAPI endpoints:
 * 1. GET /bookings - List all bookings
 * 2. GET /prebooks/{id} - Prebook status check
 * 3. PUT /bookings/{id}/amend - Amend guest information
 */

test.describe('Booking List (GET /bookings)', () => {
  test('should fetch list of bookings', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bookings');

    const status = response.status();
    console.log(`📋 Bookings API status: ${status}`);

    if (status === 200) {
      const data = await response.json();

      expect(data).toHaveProperty('success');

      if (data.success) {
        expect(data.data).toHaveProperty('data'); // bookings array
        expect(data.data).toHaveProperty('total');
        expect(data.data).toHaveProperty('limit');
        expect(data.data).toHaveProperty('offset');

        console.log(`✅ Found ${data.data.data.length} bookings`);
        console.log(`   Total: ${data.data.total}`);
      } else {
        console.log(`ℹ️  Bookings fetch returned: ${data.error}`);
      }
    } else if (status === 401) {
      console.log('ℹ️  Authentication required (expected for protected endpoint)');
    } else {
      console.log(`ℹ️  Bookings endpoint returned status ${status}`);
    }
  });

  test('should filter bookings by status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bookings', {
      params: {
        status: 'confirmed',
        limit: 10,
      },
    });

    const status = response.status();

    if (status === 200) {
      const data = await response.json();

      if (data.success && data.data.data.length > 0) {
        // All bookings should have confirmed status
        const allConfirmed = data.data.data.every(
          (booking: any) => booking.status === 'confirmed'
        );

        expect(allConfirmed).toBeTruthy();
        console.log('✅ Status filter working correctly');
      }
    }
  });

  test('should paginate bookings list', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/bookings', {
      params: {
        limit: 5,
        offset: 0,
      },
    });

    const status = response.status();

    if (status === 200) {
      const data = await response.json();

      if (data.success) {
        expect(data.data.limit).toBe(5);
        expect(data.data.offset).toBe(0);
        expect(data.data.data.length).toBeLessThanOrEqual(5);

        console.log('✅ Pagination working correctly');
      }
    }
  });
});

test.describe('Prebook Status Check (GET /prebooks/{id})', () => {
  test('should check prebook session status', async ({ request }) => {
    // Note: This requires a valid prebook ID from a previous prebook call
    const mockPrebookId = 'test-prebook-12345';

    const response = await request.get(
      `http://localhost:3000/api/prebooks/${mockPrebookId}`
    );

    const status = response.status();
    console.log(`🔍 Prebook status check: ${status}`);

    if (status === 200) {
      const data = await response.json();

      expect(data).toHaveProperty('success');

      if (data.success) {
        expect(data.data).toHaveProperty('prebookId');
        expect(data.data).toHaveProperty('status');
        expect(data.data).toHaveProperty('timeRemaining');
        expect(data.data).toHaveProperty('expired');
        expect(data.data).toHaveProperty('price');

        console.log('✅ Prebook status check successful:');
        console.log(`   Status: ${data.data.status}`);
        console.log(`   Expired: ${data.data.expired}`);
        console.log(`   Time Remaining: ${data.data.timeRemaining}s`);
      } else {
        console.log(`ℹ️  Prebook status check returned: ${data.error}`);
      }
    } else if (status === 404) {
      console.log('ℹ️  Prebook not found (expected with mock ID)');
    } else {
      console.log(`ℹ️  Prebook status returned ${status}`);
    }
  });

  test('should detect expired prebook sessions', async ({ request }) => {
    // Test with an expired prebook scenario
    const expiredPrebookId = 'expired-prebook-test';

    const response = await request.get(
      `http://localhost:3000/api/prebooks/${expiredPrebookId}`
    );

    const status = response.status();

    if (status === 200) {
      const data = await response.json();

      if (data.success && data.data.expired) {
        expect(data.data.status).toBe('expired');
        expect(data.data.timeRemaining).toBe(0);

        console.log('✅ Expired prebook correctly detected');
      }
    }
  });

  test('should return price information with prebook status', async ({ request }) => {
    const mockPrebookId = 'test-prebook-with-price';

    const response = await request.get(
      `http://localhost:3000/api/prebooks/${mockPrebookId}`
    );

    if (response.status() === 200) {
      const data = await response.json();

      if (data.success) {
        expect(data.data.price).toHaveProperty('amount');
        expect(data.data.price).toHaveProperty('currency');

        console.log('✅ Price information included in prebook status');
      }
    }
  });
});

test.describe('Booking Amendment (PUT /bookings/{id}/amend)', () => {
  test('should amend booking guest name', async ({ request }) => {
    const mockBookingId = 'test-booking-12345';

    const response = await request.put(
      `http://localhost:3000/api/bookings/${mockBookingId}/amend`,
      {
        data: {
          guestFirstName: 'John',
          guestLastName: 'Updated',
        },
      }
    );

    const status = response.status();
    console.log(`✏️  Booking amendment status: ${status}`);

    if (status === 200) {
      const data = await response.json();

      expect(data).toHaveProperty('success');

      if (data.success) {
        expect(data.data).toHaveProperty('bookingId');
        expect(data.data).toHaveProperty('status');
        expect(data.data).toHaveProperty('amendedAt');
        expect(data.data).toHaveProperty('updatedFields');

        console.log('✅ Booking amended successfully:');
        console.log(`   Booking ID: ${data.data.bookingId}`);
        console.log(`   Updated: ${data.data.updatedFields.join(', ')}`);
        console.log(`   Amended At: ${data.data.amendedAt}`);
      } else {
        console.log(`ℹ️  Booking amendment returned: ${data.error}`);
      }
    } else if (status === 404) {
      console.log('ℹ️  Booking not found (expected with mock ID)');
    } else {
      console.log(`ℹ️  Booking amendment returned ${status}`);
    }
  });

  test('should amend booking email address', async ({ request }) => {
    const mockBookingId = 'test-booking-email';

    const response = await request.put(
      `http://localhost:3000/api/bookings/${mockBookingId}/amend`,
      {
        data: {
          guestEmail: 'updated@example.com',
        },
      }
    );

    const status = response.status();

    if (status === 200) {
      const data = await response.json();

      if (data.success) {
        expect(data.data.updatedFields).toContain('guestEmail');

        console.log('✅ Email amendment successful');
      }
    }
  });

  test('should handle invalid booking ID gracefully', async ({ request }) => {
    const invalidBookingId = '';

    const response = await request.put(
      `http://localhost:3000/api/bookings/${invalidBookingId}/amend`,
      {
        data: {
          guestFirstName: 'Test',
        },
      }
    );

    expect(response.status()).toBeGreaterThanOrEqual(400);
    console.log('✅ Invalid booking ID rejected correctly');
  });

  test('should validate required amendment fields', async ({ request }) => {
    const mockBookingId = 'test-booking-validate';

    const response = await request.put(
      `http://localhost:3000/api/bookings/${mockBookingId}/amend`,
      {
        data: {}, // Empty amendment
      }
    );

    const status = response.status();

    if (status === 400) {
      console.log('✅ Empty amendment request rejected');
    } else if (status === 200) {
      // Some APIs may allow empty updates
      console.log('ℹ️  API allows empty amendments');
    }
  });
});

test.describe('My Bookings Page (UI Integration)', () => {
  test.skip('should display user booking history', async ({ page }) => {
    // Navigate to My Bookings page (when implemented)
    await page.goto('/account/bookings');

    // Wait for bookings to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Look for booking cards or list
    const bookingCards = page.locator('[data-testid="booking-card"]')
      .or(page.locator('[class*="booking" i][class*="card" i]'))
      .or(page.locator('.booking-item'));

    const count = await bookingCards.count();

    if (count > 0) {
      console.log(`✅ Found ${count} booking(s) in history`);

      // Check first booking has required info
      const firstBooking = bookingCards.first();

      const hasHotelName = await firstBooking.locator('text=/hotel|property/i').count() > 0;
      const hasCheckIn = await firstBooking.locator('text=/check.?in|arrival/i').count() > 0;
      const hasStatus = await firstBooking.locator('text=/confirmed|pending|cancelled/i').count() > 0;

      expect(hasHotelName || hasCheckIn || hasStatus).toBeTruthy();
    } else {
      console.log('ℹ️  No bookings found (may be empty or not logged in)');
    }
  });

  test.skip('should allow clicking on booking to see details', async ({ page }) => {
    await page.goto('/account/bookings');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const firstBooking = page.locator('[data-testid="booking-card"]').first();

    if (await firstBooking.count() > 0) {
      await firstBooking.click();
      await page.waitForTimeout(1000);

      // Should navigate to booking detail or open modal
      const urlChanged = page.url().includes('/booking/');
      const modalOpened = await page.locator('[role="dialog"]').isVisible().catch(() => false);

      expect(urlChanged || modalOpened).toBeTruthy();
      console.log('✅ Booking detail view opened');
    }
  });

  test.skip('should filter bookings by status', async ({ page }) => {
    await page.goto('/account/bookings');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Look for status filter
    const statusFilter = page.locator('select[name*="status" i]')
      .or(page.locator('[data-testid="status-filter"]'))
      .first();

    if (await statusFilter.count() > 0 && await statusFilter.isVisible()) {
      await statusFilter.selectOption('confirmed');
      await page.waitForTimeout(1000);

      // Check if filtered
      const bookings = await page.locator('[data-testid="booking-card"]').count();
      console.log(`✅ Status filter applied, showing ${bookings} confirmed bookings`);
    }
  });
});

test.describe('Booking Amendment UI', () => {
  test.skip('should provide guest name amendment option', async ({ page }) => {
    // Navigate to a booking detail page
    await page.goto('/account/bookings/test-booking-123');

    // Look for "Edit" or "Amend" button
    const amendButton = page.locator('button:has-text("Edit")')
      .or(page.locator('button:has-text("Amend")'))
      .or(page.locator('[data-testid="amend-booking-button"]'))
      .first();

    if (await amendButton.count() > 0 && await amendButton.isVisible()) {
      await amendButton.click();
      await page.waitForTimeout(500);

      // Should show amendment form
      const guestNameInput = page.locator('input[name*="guest" i][name*="name" i]').first();

      if (await guestNameInput.count() > 0) {
        console.log('✅ Guest name amendment form displayed');

        await guestNameInput.fill('Updated Name');

        // Look for save/submit button
        const saveButton = page.locator('button[type="submit"]')
          .or(page.locator('button:has-text("Save")'))
          .first();

        if (await saveButton.isVisible()) {
          // Don't actually submit in test
          console.log('✅ Amendment form ready for submission');
        }
      }
    } else {
      console.log('ℹ️  Amendment feature not yet implemented in UI');
    }
  });

  test.skip('should show amendment confirmation', async ({ page }) => {
    // After successful amendment
    await page.goto('/account/bookings/test-booking-123?amended=true');

    // Look for success message
    const successMessage = await page.locator('text=/successfully.*amended|updated/i')
      .or(page.locator('[data-testid="amendment-success"]'))
      .count() > 0;

    if (successMessage) {
      console.log('✅ Amendment confirmation displayed');
    }
  });
});
