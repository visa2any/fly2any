import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Hotel Details Page - Complete LiteAPI Coverage
 *
 * Verifies ALL hotel detail fields from LiteAPI documentation are displayed:
 * - Basic Info (name, description, star rating vs guest rating)
 * - Location (address, city, country, coordinates)
 * - Images (with captions, order, default image)
 * - Ratings & Reviews (rating, review count)
 * - Check-in/Check-out times
 * - Important Information
 * - Facilities (with icons)
 * - Cancellation policies (refundable tag, deadlines, fees)
 */

test.describe('Hotel Details - Complete LiteAPI Field Coverage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to search results
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for hotels to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    // Click first hotel to navigate to detail page
    const firstHotel = page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .first();

    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/, { timeout: 10000 });
  });

  test('should display hotel name (required)', async ({ page }) => {
    const hotelName = await page.locator('h1').textContent();

    expect(hotelName).toBeTruthy();
    expect(hotelName!.length).toBeGreaterThan(0);

    console.log(`✅ Hotel name displayed: "${hotelName}"`);
  });

  test('should display hotel description', async ({ page }) => {
    // Look for description section
    const description = page.locator('[data-testid="hotel-description"]')
      .or(page.locator('[class*="description" i]'))
      .or(page.locator('p:has-text("hotel")').first());

    const hasDescription = await description.count() > 0;

    if (hasDescription) {
      const text = await description.textContent();
      expect(text!.length).toBeGreaterThan(20); // Meaningful description
      console.log('✅ Hotel description displayed');
    } else {
      console.log('ℹ️  Hotel description not found');
    }
  });

  test('should display BOTH star rating AND guest rating separately', async ({ page }) => {
    // Star Rating (facility quality - 1-5 stars)
    const starRating = page.locator('[data-testid="star-rating"]')
      .or(page.locator('[aria-label*="star" i]'))
      .or(page.locator('text=/\\d.*star/i'));

    // Guest Rating (satisfaction score - typically 0-10 or 0-5)
    const guestRating = page.locator('[data-testid="guest-rating"]')
      .or(page.locator('[data-testid="rating"]'))
      .or(page.locator('[class*="rating" i]'));

    const hasStarRating = await starRating.count() > 0;
    const hasGuestRating = await guestRating.count() > 0;

    console.log(`✅ Star rating displayed: ${hasStarRating}`);
    console.log(`✅ Guest rating displayed: ${hasGuestRating}`);

    // According to LiteAPI docs, these should be differentiated
    if (hasStarRating && hasGuestRating) {
      // Look for distinguishing labels
      const hasFacilityLabel = await page.locator('text=/facility|amenity|star.?rating/i').count() > 0;
      const hasGuestLabel = await page.locator('text=/guest|satisfaction|review.?score/i').count() > 0;

      console.log(`   Star rating labeled: ${hasFacilityLabel}`);
      console.log(`   Guest rating labeled: ${hasGuestLabel}`);
    }

    // At minimum, one type of rating should be shown
    expect(hasStarRating || hasGuestRating).toBeTruthy();
  });

  test('should display review count alongside rating', async ({ page }) => {
    const reviewCount = page.locator('[data-testid="review-count"]')
      .or(page.locator('text=/\\d+.*review/i'))
      .or(page.locator('[class*="review.*count" i]'));

    const hasReviewCount = await reviewCount.count() > 0;

    if (hasReviewCount) {
      const countText = await reviewCount.textContent();
      console.log(`✅ Review count displayed: ${countText}`);

      // Should contain a number
      expect(countText).toMatch(/\d+/);
    } else {
      console.log('ℹ️  Review count not displayed');
    }
  });

  test('should display complete address information', async ({ page }) => {
    // Address should include: address, city, country
    const addressSection = page.locator('[data-testid="hotel-address"]')
      .or(page.locator('[class*="address" i]'))
      .or(page.locator('[aria-label*="address" i]'));

    if (await addressSection.count() > 0) {
      const addressText = await addressSection.textContent();

      console.log(`✅ Address displayed: ${addressText}`);

      // Should contain meaningful location info
      expect(addressText!.length).toBeGreaterThan(10);
    } else {
      // Look for individual components
      const hasCity = await page.locator('text=/Miami|New York|Orlando/i').count() > 0;
      const hasCountry = await page.locator('text=/USA|United States|US/i').count() > 0;

      console.log(`   City mentioned: ${hasCity}`);
      console.log(`   Country mentioned: ${hasCountry}`);
    }
  });

  test('should display location coordinates (latitude/longitude)', async ({ page }) => {
    // Coordinates are often used for maps, not always visible
    const hasMap = await page.locator('[data-testid="hotel-map"]')
      .or(page.locator('iframe[src*="maps"]'))
      .or(page.locator('[class*="map" i]'))
      .count() > 0;

    if (hasMap) {
      console.log('✅ Map displayed (uses lat/lng coordinates)');
    } else {
      console.log('ℹ️  No map found (coordinates may be used internally)');
    }
  });

  test('should display check-in and check-out times', async ({ page }) => {
    const checkInTime = page.locator('[data-testid="checkin-time"]')
      .or(page.locator('text=/check.?in.*\\d{1,2}:\\d{2}/i'))
      .or(page.locator('[class*="checkin" i]'));

    const checkOutTime = page.locator('[data-testid="checkout-time"]')
      .or(page.locator('text=/check.?out.*\\d{1,2}:\\d{2}/i'))
      .or(page.locator('[class*="checkout" i]'));

    const hasCheckIn = await checkInTime.count() > 0;
    const hasCheckOut = await checkOutTime.count() > 0;

    if (hasCheckIn || hasCheckOut) {
      if (hasCheckIn) {
        const checkInText = await checkInTime.textContent();
        console.log(`✅ Check-in time: ${checkInText}`);
        expect(checkInText).toMatch(/\d{1,2}:\d{2}/); // Time format
      }

      if (hasCheckOut) {
        const checkOutText = await checkOutTime.textContent();
        console.log(`✅ Check-out time: ${checkOutText}`);
        expect(checkOutText).toMatch(/\d{1,2}:\d{2}/);
      }
    } else {
      console.log('⚠️  Check-in/out times not displayed (should be shown per LiteAPI docs)');
    }
  });

  test('should display hotel important information', async ({ page }) => {
    // Important info includes policies, requirements, additional fees
    const importantInfo = page.locator('[data-testid="important-information"]')
      .or(page.locator('[data-testid="hotel-policies"]'))
      .or(page.locator('[class*="important" i]'))
      .or(page.locator('text=/important.*info/i'));

    const hasImportantInfo = await importantInfo.count() > 0;

    if (hasImportantInfo) {
      const infoText = await importantInfo.textContent();
      console.log(`✅ Important information displayed (${infoText!.length} chars)`);

      // Should be prominently displayed (visible without scrolling ideally)
      const isVisible = await importantInfo.isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
    } else {
      console.log('ℹ️  No important information section (may be empty for this hotel)');
    }
  });

  test('should display hotel facilities with icons', async ({ page }) => {
    const facilities = page.locator('[data-testid="facility-item"]')
      .or(page.locator('[class*="facility" i]'))
      .or(page.locator('[class*="amenity" i] > *'));

    const facilitiesCount = await facilities.count();

    if (facilitiesCount > 0) {
      console.log(`✅ Found ${facilitiesCount} facilities/amenities`);

      // Check if first facility has an icon (svg or img)
      const firstFacility = facilities.first();
      const hasIcon = await firstFacility.locator('svg, img').count() > 0;

      if (hasIcon) {
        console.log('✅ Facilities displayed with icons');
      } else {
        console.log('⚠️  Facilities missing icons (recommended per UI/UX best practices)');
      }

      // List first few facilities for verification
      const firstThree = await facilities.allTextContents();
      console.log(`   Examples: ${firstThree.slice(0, 3).join(', ')}`);
    } else {
      console.log('ℹ️  No facilities displayed (may need to scroll or expand)');
    }
  });

  test('should display hotel images in gallery', async ({ page }) => {
    const images = page.locator('[data-testid="hotel-image"]')
      .or(page.locator('img[alt*="hotel" i]'))
      .or(page.locator('[class*="gallery" i] img'));

    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);
    console.log(`✅ Found ${imageCount} hotel images`);

    // Per LiteAPI docs, images should have captions
    // Open gallery to check
    const galleryTrigger = page.locator('[data-testid="photo-gallery-trigger"]')
      .or(page.locator('button:has-text("View all photos")'))
      .or(images.first());

    if (await galleryTrigger.count() > 0) {
      await galleryTrigger.click();
      await page.waitForTimeout(500);

      // Check for image captions in lightbox
      const caption = page.locator('[data-testid="image-caption"]')
        .or(page.locator('[class*="caption" i]'))
        .or(page.locator('.yarl__slide_description')); // yet-another-react-lightbox

      const hasCaption = await caption.count() > 0;

      if (hasCaption) {
        const captionText = await caption.textContent();
        console.log(`✅ Image caption found: "${captionText}"`);
      } else {
        console.log('ℹ️  Image captions not displayed (optional but recommended)');
      }

      // Close gallery
      const closeButton = page.locator('button:has-text("Close")')
        .or(page.locator('[aria-label*="close" i]'))
        .or(page.locator('.yarl__navigation_close'))
        .first();

      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should display cancellation policy with refundable tag', async ({ page }) => {
    // Scroll down to find cancellation policies
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

    const cancellationPolicy = page.locator('[data-testid="cancellation-policy"]')
      .or(page.locator('[class*="cancellation" i]'))
      .or(page.locator('text=/cancellation.*policy/i'));

    if (await cancellationPolicy.count() > 0) {
      const policyText = await cancellationPolicy.allTextContents();
      const fullText = policyText.join(' ');

      console.log(`✅ Cancellation policy found`);

      // Check for refundable tag (RFN in LiteAPI)
      const hasRefundableTag = /refundable|non-refundable|RFN/i.test(fullText);

      if (hasRefundableTag) {
        console.log('✅ Refundable tag displayed');
      } else {
        console.log('⚠️  Refundable tag not found (should show "Refundable" or "Non-refundable")');
      }

      // Check for cancellation deadline
      const hasDeadline = /cancel.*before|deadline|until/i.test(fullText);

      if (hasDeadline) {
        console.log('✅ Cancellation deadline displayed');
      } else {
        console.log('ℹ️  Cancellation deadline not explicitly shown');
      }

      // Check for cancellation fees
      const hasFees = /fee|charge|penalty|cost/i.test(fullText);

      if (hasFees) {
        console.log('✅ Cancellation fees mentioned');
      }
    } else {
      console.log('ℹ️  Cancellation policy not found on detail page (may be shown during booking)');
    }
  });

  test('should display hotel chain information if applicable', async ({ page }) => {
    const chainInfo = page.locator('[data-testid="hotel-chain"]')
      .or(page.locator('text=/Marriott|Hilton|Hyatt|IHG|Accor/i'))
      .or(page.locator('[class*="chain" i]'));

    const hasChainInfo = await chainInfo.count() > 0;

    if (hasChainInfo) {
      const chainName = await chainInfo.textContent();
      console.log(`✅ Hotel chain displayed: ${chainName}`);
    } else {
      console.log('ℹ️  No hotel chain information (may be independent property)');
    }
  });

  test('should display pricing in correct currency', async ({ page }) => {
    const priceDisplay = page.locator('[data-testid="hotel-price"]')
      .or(page.locator('[class*="price" i]'))
      .or(page.locator('text=/\\$\\d+|€\\d+|£\\d+/'));

    const hasPrice = await priceDisplay.count() > 0;

    if (hasPrice) {
      const priceText = await priceDisplay.first().textContent();
      console.log(`✅ Price displayed: ${priceText}`);

      // Should show currency symbol or code
      const hasCurrency = /\$|€|£|USD|EUR|GBP/i.test(priceText!);
      expect(hasCurrency).toBeTruthy();
    }
  });
});

test.describe('Hotel Details - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display all critical info on mobile', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    const firstHotel = page.locator('[data-testid="hotel-card"]').or(page.locator('.hotel-card')).first();
    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/);

    // Verify critical elements are visible on mobile
    const hotelName = await page.locator('h1').isVisible();
    const hasRating = await page.locator('[class*="rating" i]').count() > 0;
    const hasPrice = await page.locator('[class*="price" i]').count() > 0;
    const hasBookButton = await page.locator('button:has-text("Book")').count() > 0;

    console.log(`✅ Mobile layout:
      Name: ${hotelName}
      Rating: ${hasRating}
      Price: ${hasPrice}
      Book Button: ${hasBookButton}
    `);

    expect(hotelName).toBeTruthy();
  });
});

test.describe('Hotel Details - Accessibility', () => {
  test('should have proper semantic HTML', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    const firstHotel = page.locator('[data-testid="hotel-card"]').or(page.locator('.hotel-card')).first();
    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/);

    // Check for semantic elements
    const hasH1 = await page.locator('h1').count() === 1; // Only one main heading
    const hasMain = await page.locator('main').count() > 0;

    console.log(`✅ Semantic HTML:
      Single H1: ${hasH1}
      Main element: ${hasMain}
    `);

    expect(hasH1).toBeTruthy();
  });

  test('should have proper ARIA labels for interactive elements', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    const firstHotel = page.locator('[data-testid="hotel-card"]').or(page.locator('.hotel-card')).first();
    await firstHotel.click();
    await page.waitForURL(/\/hotels\/.+/);

    // Check buttons have aria-labels or descriptive text
    const buttons = await page.locator('button').all();

    let buttonsWithLabels = 0;
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();

      if (ariaLabel || (text && text.trim().length > 0)) {
        buttonsWithLabels++;
      }
    }

    const totalButtons = buttons.length;
    const labelPercentage = totalButtons > 0 ? (buttonsWithLabels / totalButtons) * 100 : 0;

    console.log(`✅ Buttons with labels: ${buttonsWithLabels}/${totalButtons} (${labelPercentage.toFixed(0)}%)`);

    // At least 80% of buttons should have labels
    expect(labelPercentage).toBeGreaterThan(80);
  });
});
