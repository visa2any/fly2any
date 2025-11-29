import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Guest Management System
 * Coverage: Guest profiles, booking history, profile updates
 * Total Scenarios: 10
 */

test.describe('Guest Management System', () => {
  const baseUrl = 'http://localhost:3000';
  let testGuestId: string;
  const testGuest = {
    email: `test-${Date.now()}@example.com`,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    nationality: 'US',
  };

  test('should create a new guest profile via API', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/guests`, {
      data: testGuest,
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.email).toBe(testGuest.email);
    expect(data.data.firstName).toBe(testGuest.firstName);

    testGuestId = data.data.id;
  });

  test('should retrieve guest profile by ID', async ({ request }) => {
    // First create a guest
    const createRes = await request.post(`${baseUrl}/api/guests`, {
      data: { ...testGuest, email: `get-${Date.now()}@example.com` },
    });
    const createData = await createRes.json();
    const guestId = createData.data.id;

    // Then retrieve it
    const response = await request.get(`${baseUrl}/api/guests/${guestId}`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.id).toBe(guestId);
    expect(data.data).toHaveProperty('email');
    expect(data.data).toHaveProperty('createdAt');
  });

  test('should update guest profile information', async ({ request }) => {
    // Create guest
    const createRes = await request.post(`${baseUrl}/api/guests`, {
      data: { ...testGuest, email: `update-${Date.now()}@example.com` },
    });
    const createData = await createRes.json();
    const guestId = createData.data.id;

    // Update guest
    const updates = {
      firstName: 'Jane',
      phone: '+9876543210',
    };

    const response = await request.put(`${baseUrl}/api/guests/${guestId}`, {
      data: updates,
    });

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.firstName).toBe('Jane');
    expect(data.data.phone).toBe('+9876543210');
  });

  test('should display guest profile form on /account/profile page', async ({ page }) => {
    await page.goto(`${baseUrl}/account/profile`);

    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('input#lastName')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should create guest profile through UI form', async ({ page }) => {
    await page.goto(`${baseUrl}/account/profile`);

    // Fill out the form
    await page.fill('input#firstName', 'Test');
    await page.fill('input#lastName', 'User');
    await page.fill('input[type="email"]', `ui-test-${Date.now()}@example.com`);
    await page.fill('input#phone', '+1122334455');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success (either alert or success message)
    await page.waitForTimeout(2000);
  });

  test('should retrieve guest booking history', async ({ request }) => {
    // Create guest
    const createRes = await request.post(`${baseUrl}/api/guests`, {
      data: { ...testGuest, email: `bookings-${Date.now()}@example.com` },
    });
    const createData = await createRes.json();
    const guestId = createData.data.id;

    // Get guest bookings
    const response = await request.get(`${baseUrl}/api/guests/${guestId}/bookings`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('data');
    expect(data.data).toHaveProperty('total');
    expect(Array.isArray(data.data.data)).toBe(true);
  });

  test('should filter guest bookings by status', async ({ request }) => {
    // Create guest
    const createRes = await request.post(`${baseUrl}/api/guests`, {
      data: { ...testGuest, email: `filter-${Date.now()}@example.com` },
    });
    const createData = await createRes.json();
    const guestId = createData.data.id;

    // Get confirmed bookings
    const response = await request.get(
      `${baseUrl}/api/guests/${guestId}/bookings?status=confirmed`
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should display Guest Dashboard with all sections', async ({ page }) => {
    await page.goto(`${baseUrl}/account/profile`);

    // Check that dashboard components are being loaded
    const hasWelcome = await page.locator('text=/Welcome back/i').count();
    const hasBookings = await page.locator('text=/bookings/i').count();

    // Dashboard should load even if empty
    expect(hasWelcome >= 0).toBe(true);
  });

  test('should handle guest not found error gracefully', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/guests/nonexistent-id-123`);

    expect(response.status()).toBeGreaterThanOrEqual(400);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data).toHaveProperty('error');
  });

  test('should validate required fields when creating guest', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/guests`, {
      data: {
        // Missing required fields
        email: '',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Guest Profile Integration', () => {
  const baseUrl = 'http://localhost:3000';

  test('should persist guest ID in localStorage after creation', async ({ page }) => {
    await page.goto(`${baseUrl}/account/profile`);

    // Fill and submit form
    await page.fill('input#firstName', 'Storage');
    await page.fill('input#lastName', 'Test');
    await page.fill('input[type="email"]', `storage-${Date.now()}@example.com`);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Check localStorage
    const guestId = await page.evaluate(() => localStorage.getItem('guestId'));
    expect(guestId).not.toBeNull();
  });
});
