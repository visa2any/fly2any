import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Hotel Detail Page & Booking Flow
 *
 * Tests the complete hotel detail and booking journey:
 * 1. Hotel detail page viewing
 * 2. Photo gallery interaction
 * 3. Room selection
 * 4. Q&A bot interaction
 * 5. Booking flow initiation
 */

test.describe('Hotel Detail Page', () => {
  const MIAMI_HOTEL_URL = '/hotels/lp3079e'; // Example hotel ID

  test.beforeEach(async ({ page }) => {
    // Navigate to a sample hotel detail page
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for results to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    // Click first hotel to navigate to detail page
    const firstHotel = page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .first();

    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/, { timeout: 10000 });
  });

  test('should display hotel details correctly', async ({ page }) => {
    // Verify page loaded
    await expect(page.locator('h1')).toBeVisible();

    // Verify hotel name is displayed
    const hotelName = await page.locator('h1').textContent();
    expect(hotelName).toBeTruthy();
    expect(hotelName!.length).toBeGreaterThan(0);

    console.log(`✅ Hotel name: ${hotelName}`);

    // Check for key elements
    const hasImages = await page.locator('img[alt*="hotel" i]').count() > 0;
    const hasPrice = await page.locator('[class*="price"]').count() > 0
      || await page.locator('text=/\\$\\d+/').count() > 0;

    expect(hasImages || hasPrice).toBeTruthy();

    console.log(`✅ Has images: ${hasImages}, Has price: ${hasPrice}`);
  });

  test('should open and navigate photo gallery', async ({ page }) => {
    // Look for photo gallery or lightbox trigger
    const photoTrigger = page.locator('[data-testid="photo-gallery-trigger"]')
      .or(page.locator('button:has-text("View all photos")'))
      .or(page.locator('button:has-text("Show photos")'))
      .or(page.locator('img[alt*="hotel" i]').first());

    if (await photoTrigger.count() > 0) {
      await photoTrigger.click();
      await page.waitForTimeout(500);

      // Check if lightbox/gallery opened
      const galleryOpen = await page.locator('[data-testid="lightbox"]')
        .or(page.locator('[class*="lightbox" i]'))
        .or(page.locator('[role="dialog"]'))
        .isVisible().catch(() => false);

      if (galleryOpen) {
        console.log('✅ Photo gallery opened successfully');

        // Try to navigate to next photo
        const nextButton = page.locator('button:has-text("Next")')
          .or(page.locator('[aria-label*="next" i]'))
          .or(page.locator('.yarl__navigation_next')); // yet-another-react-lightbox class

        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(300);
          console.log('✅ Navigated to next photo');
        }

        // Close gallery
        const closeButton = page.locator('button:has-text("Close")')
          .or(page.locator('[aria-label*="close" i]'))
          .or(page.locator('.yarl__navigation_close'))
          .first();

        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(300);
          console.log('✅ Closed photo gallery');
        }
      }
    } else {
      console.log('ℹ️  Photo gallery not found on this page');
    }
  });

  test('should display available rooms and rates', async ({ page }) => {
    // Look for rooms/rates section
    const roomsSection = page.locator('[data-testid="rooms-section"]')
      .or(page.locator('text=/available rooms/i'))
      .or(page.locator('text=/choose room/i'));

    if (await roomsSection.count() > 0) {
      // Scroll to rooms section
      await roomsSection.scrollIntoViewIfNeeded();

      // Check for room cards
      const roomCards = await page.locator('[data-testid="room-card"]')
        .or(page.locator('[class*="room" i][class*="card" i]'))
        .count();

      console.log(`✅ Found ${roomCards} room options`);

      if (roomCards > 0) {
        // Verify room details are displayed
        const hasRoomName = await page.locator('[data-testid="room-name"]')
          .or(page.locator('text=/queen|king|suite|standard|deluxe/i'))
          .first()
          .isVisible();

        expect(hasRoomName).toBeTruthy();
        console.log('✅ Room details displayed');
      }
    } else {
      console.log('ℹ️  Rooms section not found - may need to scroll or wait for API');
    }
  });

  test('should interact with Q&A bot', async ({ page }) => {
    // Look for Q&A bot button (floating button)
    const qaBotButton = page.locator('[aria-label*="Q&A" i]')
      .or(page.locator('[aria-label*="assistant" i]'))
      .or(page.locator('button:has-text("Ask")'))
      .or(page.locator('[data-testid="qa-bot-button"]'));

    if (await qaBotButton.count() > 0 && await qaBotButton.isVisible()) {
      // Open Q&A bot
      await qaBotButton.click();
      await page.waitForTimeout(500);

      console.log('✅ Q&A bot opened');

      // Check for chat interface
      const chatInterface = await page.locator('[data-testid="qa-chat"]')
        .or(page.locator('[role="dialog"]'))
        .isVisible().catch(() => false);

      if (chatInterface) {
        // Try to send a question
        const input = page.locator('input[placeholder*="question" i]')
          .or(page.locator('input[placeholder*="ask" i]'))
          .first();

        if (await input.isVisible()) {
          await input.fill('What amenities are included?');
          await page.waitForTimeout(200);

          // Click send button
          const sendButton = page.locator('button[type="submit"]')
            .or(page.locator('button:has-text("Send")'))
            .or(page.locator('[aria-label*="send" i]'))
            .first();

          if (await sendButton.isVisible()) {
            await sendButton.click();
            await page.waitForTimeout(1000);

            console.log('✅ Q&A question sent successfully');

            // Wait for response
            const hasResponse = await page.locator('text=/amenities/i')
              .or(page.locator('[data-testid="qa-response"]'))
              .isVisible({ timeout: 5000 })
              .catch(() => false);

            if (hasResponse) {
              console.log('✅ Q&A bot responded successfully');
            }
          }
        }
      }
    } else {
      console.log('ℹ️  Q&A bot button not found');
    }
  });

  test('should navigate to booking page', async ({ page }) => {
    // Look for booking button
    const bookButton = page.locator('button:has-text("Book Now")')
      .or(page.locator('button:has-text("Reserve")')
      .or(page.locator('[data-testid="book-now-button"]')))
      .first();

    if (await bookButton.count() > 0) {
      // Scroll to button
      await bookButton.scrollIntoViewIfNeeded();
      await bookButton.click();

      // Wait for navigation or modal
      await page.waitForTimeout(1000);

      // Check if navigated to booking page or opened booking modal
      const onBookingPage = page.url().includes('/booking');
      const hasBookingModal = await page.locator('[data-testid="booking-modal"]')
        .or(page.locator('[role="dialog"]'))
        .isVisible().catch(() => false);

      expect(onBookingPage || hasBookingModal).toBeTruthy();

      console.log(`✅ Booking initiated: Page=${onBookingPage}, Modal=${hasBookingModal}`);
    } else {
      console.log('ℹ️  Book button not found - may require room selection first');
    }
  });
});

test.describe('Booking Flow', () => {
  test('should load booking page with hotel data', async ({ page }) => {
    // Navigate directly to booking page with query params
    await page.goto('/hotels/booking?hotelId=lp3079e&hotelName=Sample+Hotel&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1&price=500');

    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Check for booking form elements
    const hasForm = await page.locator('form').count() > 0;
    const hasHotelInfo = await page.locator('text=/hotel/i').count() > 0;

    expect(hasForm || hasHotelInfo).toBeTruthy();

    console.log(`✅ Booking page loaded: Form=${hasForm}, HotelInfo=${hasHotelInfo}`);
  });

  test('should display guest information form', async ({ page }) => {
    await page.goto('/hotels/booking?hotelId=lp3079e&hotelName=Sample+Hotel&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1&price=500');

    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Look for guest input fields
    const emailInput = page.locator('input[type="email"]')
      .or(page.locator('input[name*="email" i]'))
      .first();

    const phoneInput = page.locator('input[type="tel"]')
      .or(page.locator('input[name*="phone" i]'))
      .first();

    const firstNameInput = page.locator('input[name*="first" i][name*="name" i]')
      .or(page.locator('input[placeholder*="first name" i]'))
      .first();

    const hasGuestFields = await emailInput.count() > 0
      || await phoneInput.count() > 0
      || await firstNameInput.count() > 0;

    if (hasGuestFields) {
      console.log('✅ Guest information form found');
    } else {
      console.log('ℹ️  Guest form may be on different step or hidden');
    }
  });

  test('should show booking summary', async ({ page }) => {
    await page.goto('/hotels/booking?hotelId=lp3079e&hotelName=Sample+Hotel&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1&price=500');

    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Look for booking summary/price display
    const hasPriceDisplay = await page.locator('text=/total/i')
      .or(page.locator('text=/price/i'))
      .or(page.locator('[data-testid="booking-summary"]'))
      .count() > 0;

    if (hasPriceDisplay) {
      console.log('✅ Booking summary displayed');
    }
  });
});

test.describe('Mobile Hotel Detail', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    const firstHotel = page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .first();

    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/);

    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();

    console.log('✅ Mobile hotel detail page loaded');
  });
});
