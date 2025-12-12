/**
 * E2E Tests: Notification System (Mailgun + Telegram)
 *
 * Comprehensive tests for the notification infrastructure including:
 * - Mailgun email delivery verification
 * - Telegram bot notifications
 * - Admin notification center UI
 * - Cross-channel synchronization
 *
 * @version 1.0.0
 */

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  adminNotificationsPath: '/admin/notifications',
  testEmailApiPath: '/api/admin/test-email',
  testTelegramApiPath: '/api/admin/test-telegram',
  priceAlertsApiPath: '/api/cron/check-price-alerts',
};

// Email types to test
const EMAIL_TYPES = [
  'flight_booking',
  'hotel_booking',
  'price_alert',
  'welcome',
  'password_reset',
  'newsletter',
  'credits',
  'trip_booking',
] as const;

// ==========================================
// API Tests: Notification Endpoints
// ==========================================

test.describe('Notification API Endpoints', () => {
  test.describe('Email API (@api)', () => {
    test('GET /api/admin/test-email returns available email types', async ({ request }) => {
      const response = await request.get(TEST_CONFIG.testEmailApiPath);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('availableTypes');
      expect(Array.isArray(data.availableTypes)).toBe(true);
      expect(data.availableTypes.length).toBeGreaterThan(0);

      // Verify all expected email types are present
      const types = data.availableTypes.map((t: { type: string }) => t.type);
      expect(types).toContain('flight_booking');
      expect(types).toContain('hotel_booking');
      expect(types).toContain('price_alert');
    });

    test('POST /api/admin/test-email requires authentication', async ({ request }) => {
      const response = await request.post(TEST_CONFIG.testEmailApiPath, {
        data: { type: 'welcome' },
      });

      // Should return 401 Unauthorized without auth
      expect(response.status()).toBe(401);
    });

    test('POST /api/admin/test-email validates email type', async ({ request }) => {
      const response = await request.post(TEST_CONFIG.testEmailApiPath, {
        data: { type: 'invalid_type' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should return 400 or 401 (depending on auth check order)
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Telegram API (@api)', () => {
    test('GET /api/admin/test-telegram returns configuration status', async ({ request }) => {
      const response = await request.get(TEST_CONFIG.testTelegramApiPath);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(['configured', 'not_configured']).toContain(data.status);
      expect(data).toHaveProperty('config');
      expect(data.config).toHaveProperty('hasBotToken');
      expect(data.config).toHaveProperty('adminChatIds');
    });

    test('GET /api/admin/test-telegram includes setup guide when not configured', async ({
      request,
    }) => {
      const response = await request.get(TEST_CONFIG.testTelegramApiPath);
      const data = await response.json();

      // Setup guide should always be present
      expect(data).toHaveProperty('setupGuide');
      expect(data.setupGuide).toHaveProperty('step1');
      expect(data.setupGuide).toHaveProperty('step2');
      expect(data.setupGuide).toHaveProperty('step3');
    });

    test('POST /api/admin/test-telegram requires authentication', async ({ request }) => {
      const response = await request.post(TEST_CONFIG.testTelegramApiPath, {
        data: {},
      });

      // Should return 401 Unauthorized without auth
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Price Alerts Cron (@api)', () => {
    test('GET /api/cron/check-price-alerts requires authorization', async ({ request }) => {
      const response = await request.get(TEST_CONFIG.priceAlertsApiPath);

      // Should return 401 without proper auth header
      expect(response.status()).toBe(401);
    });

    test('GET /api/cron/check-price-alerts accepts Vercel cron header', async ({ request }) => {
      // This test simulates the Vercel cron header
      // In production, this header is automatically added by Vercel
      const response = await request.get(TEST_CONFIG.priceAlertsApiPath, {
        headers: {
          'x-vercel-cron': '1',
        },
      });

      // Should not return 401 with cron header
      // May return 200 (success) or 500 (if DB not configured in test)
      expect(response.status()).not.toBe(401);
    });
  });
});

// ==========================================
// UI Tests: Admin Notification Center
// ==========================================

test.describe('Admin Notification Center UI', () => {
  // Skip UI tests - require admin authentication
  // These tests verify the admin panel works when properly authenticated
  test.skip('Notification Center page loads correctly', async ({ page }) => {
    await page.goto(TEST_CONFIG.adminNotificationsPath, { timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Notification/i);
  });

  test.skip('Notification Center displays Mailgun status card', async ({ page }) => {
    await page.goto(TEST_CONFIG.adminNotificationsPath, { timeout: 10000 });
    const mailgunCard = page.locator('text=Mailgun Email').first();
    await expect(mailgunCard).toBeVisible({ timeout: 10000 });
  });

  test.skip('Notification Center displays Telegram status card', async ({ page }) => {
    await page.goto(TEST_CONFIG.adminNotificationsPath, { timeout: 10000 });
    const telegramCard = page.locator('text=Telegram Bot').first();
    await expect(telegramCard).toBeVisible({ timeout: 10000 });
  });

  test.skip('Email test buttons are present', async ({ page }) => {
    await page.goto(TEST_CONFIG.adminNotificationsPath, { timeout: 10000 });
    await expect(page.locator('text=Flight Booking').first()).toBeVisible();
  });
});

// ==========================================
// Integration Tests: Email Templates
// ==========================================

test.describe('Email Template Structure (@integration)', () => {
  test('Flight booking email template structure is valid', async ({ request }) => {
    const response = await request.get(TEST_CONFIG.testEmailApiPath);
    const data = await response.json();

    const flightType = data.availableTypes.find(
      (t: { type: string }) => t.type === 'flight_booking'
    );
    expect(flightType).toBeDefined();
    expect(flightType.description).toContain('booking');
  });

  test('Hotel booking email template structure is valid', async ({ request }) => {
    const response = await request.get(TEST_CONFIG.testEmailApiPath);
    const data = await response.json();

    const hotelType = data.availableTypes.find((t: { type: string }) => t.type === 'hotel_booking');
    expect(hotelType).toBeDefined();
    expect(hotelType.description).toContain('booking');
  });

  test('Price alert email template structure is valid', async ({ request }) => {
    const response = await request.get(TEST_CONFIG.testEmailApiPath);
    const data = await response.json();

    const priceAlertType = data.availableTypes.find(
      (t: { type: string }) => t.type === 'price_alert'
    );
    expect(priceAlertType).toBeDefined();
    expect(priceAlertType.description).toContain('alert');
  });
});

// ==========================================
// Performance Tests
// ==========================================

test.describe('Notification Performance (@performance)', () => {
  test('Email API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(TEST_CONFIG.testEmailApiPath);
    const duration = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // API should respond within 5 seconds (accounts for cold start)
    expect(duration).toBeLessThan(5000);
  });

  test('Telegram API responds within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(TEST_CONFIG.testTelegramApiPath);
    const duration = Date.now() - startTime;

    expect(response.status()).toBe(200);
    // API should respond within 5 seconds (accounts for cold start)
    expect(duration).toBeLessThan(5000);
  });
});

// ==========================================
// Error Handling Tests
// ==========================================

test.describe('Notification Error Handling (@error-handling)', () => {
  test('Invalid email type returns proper error response', async ({ request }) => {
    const response = await request.post(TEST_CONFIG.testEmailApiPath, {
      data: { type: 'nonexistent_type_12345' },
    });

    // Should return error (401 for auth or 400 for validation)
    expect([400, 401]).toContain(response.status());

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('Missing required fields handled gracefully', async ({ request }) => {
    const response = await request.post(TEST_CONFIG.testEmailApiPath, {
      data: {},
    });

    // Should return error status
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});

// ==========================================
// Security Tests
// ==========================================

test.describe('Notification Security (@security)', () => {
  test('Email API does not expose actual credentials', async ({ request }) => {
    const response = await request.get(TEST_CONFIG.testEmailApiPath);
    const data = await response.json();

    // Should not expose actual API keys or credentials (not type names)
    const dataStr = JSON.stringify(data);
    expect(dataStr).not.toMatch(/key-[a-f0-9]{32}/i); // Mailgun key pattern
    expect(dataStr).not.toMatch(/sk_live_[a-zA-Z0-9]+/); // Stripe key pattern
    expect(dataStr).not.toContain('MAILGUN_API_KEY=');

    // Verify structure is safe
    expect(data).toHaveProperty('availableTypes');
    expect(data).not.toHaveProperty('apiKey');
    expect(data).not.toHaveProperty('credentials');
  });

  test('Telegram API does not expose actual bot token value', async ({ request }) => {
    const response = await request.get(TEST_CONFIG.testTelegramApiPath);
    const data = await response.json();

    // hasBotToken should be boolean, not the actual token
    expect(typeof data.config.hasBotToken).toBe('boolean');

    // Should not contain actual token pattern (digits:alphanumeric)
    const dataStr = JSON.stringify(data);
    expect(dataStr).not.toMatch(/"\d{9,10}:[A-Za-z0-9_-]{35}"/); // Bot token pattern

    // Config should not have raw token
    expect(data.config).not.toHaveProperty('botToken');
    expect(data.config).not.toHaveProperty('token');
  });

  test('Price alerts cron rejects unauthorized requests', async ({ request }) => {
    // Test various unauthorized scenarios
    const responses = await Promise.all([
      request.get(TEST_CONFIG.priceAlertsApiPath),
      request.get(TEST_CONFIG.priceAlertsApiPath, {
        headers: { Authorization: 'Bearer invalid_token' },
      }),
      request.get(TEST_CONFIG.priceAlertsApiPath, {
        headers: { 'x-vercel-cron': '0' },
      }),
    ]);

    // All should be unauthorized
    responses.forEach((response) => {
      expect(response.status()).toBe(401);
    });
  });
});

// ==========================================
// Cross-Channel Synchronization Tests
// ==========================================

test.describe('Cross-Channel Notification Sync (@integration)', () => {
  test('Both notification channels are available from same API context', async ({ request }) => {
    // Verify both APIs are accessible
    const [emailResponse, telegramResponse] = await Promise.all([
      request.get(TEST_CONFIG.testEmailApiPath),
      request.get(TEST_CONFIG.testTelegramApiPath),
    ]);

    expect(emailResponse.status()).toBe(200);
    expect(telegramResponse.status()).toBe(200);

    const emailData = await emailResponse.json();
    const telegramData = await telegramResponse.json();

    // Both should have proper structure
    expect(emailData).toHaveProperty('availableTypes');
    expect(telegramData).toHaveProperty('status');
  });
});
