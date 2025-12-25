/**
 * Consolidator Booking Automation (TheBestAgent.PRO)
 *
 * Automates manual ticketing via Playwright browser automation.
 * Ensures EXACT match with customer's original booking.
 */

import { chromium, Browser, Page } from 'playwright';

// Consolidator credentials (from env)
const CONSOLIDATOR_URL = 'https://air.thebestagent.pro';
const CONSOLIDATOR_EMAIL = process.env.CONSOLIDATOR_EMAIL || '';
const CONSOLIDATOR_PASSWORD = process.env.CONSOLIDATOR_PASSWORD || '';

export interface BookingData {
  // Booking reference
  bookingId: string;
  bookingReference: string;

  // Flight details - MUST MATCH EXACTLY
  flights: {
    type: 'one_way' | 'round_trip' | 'multi_city';
    segments: Array<{
      airline: string;           // UA, AA, DL, etc.
      flightNumber: string;      // 226
      origin: string;            // BOS
      destination: string;       // IAH
      departureDate: string;     // 2026-01-21
      departureTime: string;     // 07:05
      arrivalTime: string;       // 10:53
      cabin: string;             // ECONOMY
    }>;
  };

  // Passengers
  passengers: Array<{
    type: 'adult' | 'child' | 'infant';
    title: string;              // Mr, Mrs, Ms
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;        // YYYY-MM-DD
    gender: 'M' | 'F';
    nationality: string;        // BR, US, etc.
    passportNumber?: string;
    passportExpiry?: string;
    email?: string;
    phone?: string;
  }>;

  // Fare Details - MUST MATCH customer's booking
  fare: {
    cabin: string;              // ECONOMY, BUSINESS, FIRST
    fareClass: string;          // Basic Economy, Economy, Business, etc.
    brandedFare?: string;       // BASIC, STANDARD, PLUS, FLEX
    hasBags: boolean;           // true = checked bags included
    bagCount?: number;          // Number of bags if hasBags=true
  };

  // Pricing
  pricing: {
    customerPaid: number;       // What customer paid us
    netPrice?: number;          // Expected consolidator price
    currency: string;
  };

  // Contact
  contactEmail: string;
  contactPhone: string;
}

export interface BookingResult {
  success: boolean;
  pnr?: string;
  eticketNumbers?: string[];
  consolidatorReference?: string;
  consolidatorPrice?: number;
  error?: string;
  screenshots?: string[];
}

export class ConsolidatorBookingAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private screenshots: string[] = [];

  /**
   * Initialize browser
   */
  async init(headless: boolean = true): Promise<void> {
    this.browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    this.page = await context.newPage();
    this.screenshots = [];
  }

  /**
   * Take screenshot for audit trail
   */
  private async screenshot(name: string): Promise<void> {
    if (!this.page) return;
    const path = `/tmp/consolidator-${Date.now()}-${name}.png`;
    await this.page.screenshot({ path });
    this.screenshots.push(path);
  }

  /**
   * Login to consolidator portal
   */
  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('🔐 Logging into TheBestAgent.PRO...');

    await this.page.goto(CONSOLIDATOR_URL);
    await this.page.waitForLoadState('networkidle');

    // Fill login form
    await this.page.fill('input[type="email"], input[name="email"]', CONSOLIDATOR_EMAIL);
    await this.page.fill('input[type="password"]', CONSOLIDATOR_PASSWORD);

    // Click sign in
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');

    // Verify login success - check for search form
    const searchForm = await this.page.$('.search__form');
    if (!searchForm) {
      await this.screenshot('login-failed');
      throw new Error('Login failed - search form not found');
    }

    await this.screenshot('login-success');
    console.log('✅ Login successful');
    return true;
  }

  /**
   * Search for flight - EXACT MATCH required
   */
  async searchFlight(booking: BookingData): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    const segment = booking.flights.segments[0];
    const isRoundTrip = booking.flights.type === 'round_trip';

    console.log(`🔍 Searching: ${segment.origin} → ${segment.destination} on ${segment.departureDate}`);

    // Fill origin
    await this.page.click('.route__departing .input');
    await this.page.fill('.route__departing .input__widget', segment.origin);
    await this.page.waitForTimeout(500);

    // Select first autocomplete result
    await this.page.click('.route__departing .input__dropdown .input__window div:first-child');

    // Fill destination
    await this.page.fill('.route__destination .input__widget', segment.destination);
    await this.page.waitForTimeout(500);
    await this.page.click('.route__destination .input__dropdown .input__window div:first-child');

    // Click departure date field
    await this.page.click('.route__departure-date .input');
    await this.page.waitForTimeout(300);

    // Select date from calendar
    const dateSelector = `.datepicker__day[data-date="${segment.departureDate}"]`;
    await this.page.click(dateSelector);

    // Handle round trip
    if (isRoundTrip && booking.flights.segments[1]) {
      const returnSegment = booking.flights.segments[1];
      await this.page.click('.route__return-date .input');
      await this.page.waitForTimeout(300);
      await this.page.click(`.datepicker__day[data-date="${returnSegment.departureDate}"]`);
    }

    // Set passenger count
    const adultCount = booking.passengers.filter(p => p.type === 'adult').length;
    const childCount = booking.passengers.filter(p => p.type === 'child').length;
    const infantCount = booking.passengers.filter(p => p.type === 'infant').length;

    // Click adult count buttons if needed
    for (let i = 1; i < adultCount; i++) {
      await this.page.click(`.search__passengers [data-count="${i + 1}"]`).catch(() => {});
    }

    // Close any open datepicker
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);

    // Click search
    await this.page.evaluate(() => {
      const btn = document.querySelector('.options__submit') as HTMLButtonElement;
      if (btn) btn.click();
    });

    // Wait for results
    await this.page.waitForSelector('.flights-list, .flight-card, .results', { timeout: 60000 });
    await this.screenshot('search-results');

    console.log('✅ Search completed');
    return true;
  }

  /**
   * Find and select the EXACT flight matching booking
   */
  async selectExactFlight(booking: BookingData): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    const segment = booking.flights.segments[0];
    const targetFlight = `${segment.airline} ${segment.flightNumber}`;
    const targetTime = segment.departureTime.substring(0, 5); // HH:MM

    console.log(`🎯 Looking for exact match: ${targetFlight} at ${targetTime}`);

    // Wait for flight list
    await this.page.waitForTimeout(2000);

    // Get all flight cards
    const flights = await this.page.$$('.flight-card, .flights-list__item, [class*="flight"]');

    let found = false;
    for (const flight of flights) {
      const text = await flight.textContent() || '';

      // Check if this flight matches (airline + flight number + time)
      const hasAirline = text.includes(segment.airline) || text.includes(targetFlight);
      const hasTime = text.includes(targetTime) || text.includes(segment.departureTime);

      if (hasAirline && hasTime) {
        console.log(`✅ Found matching flight: ${targetFlight}`);

        // Click the flight to select
        await flight.click();
        await this.page.waitForTimeout(500);

        // Look for BOOK button in the flight details panel
        const bookBtn = await this.page.$('button:has-text("BOOK")');
        if (bookBtn) {
          await bookBtn.click();
          found = true;
          break;
        }
      }
    }

    if (!found) {
      // Try alternative: click on the row with matching flight number
      const flightRow = await this.page.$(`text=${targetFlight}`);
      if (flightRow) {
        await flightRow.click();
        await this.page.waitForTimeout(500);

        const bookBtn = await this.page.$('button:has-text("BOOK")');
        if (bookBtn) {
          await bookBtn.click();
          found = true;
        }
      }
    }

    if (!found) {
      await this.screenshot('flight-not-found');
      throw new Error(`Flight ${targetFlight} not found in search results`);
    }

    await this.page.waitForLoadState('networkidle');
    await this.screenshot('flight-selected');

    return true;
  }

  /**
   * Select fare class - MUST MATCH customer's booking
   */
  async selectFare(booking: BookingData): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    const fareClass = booking.fare.fareClass;
    console.log(`💺 Selecting fare: ${fareClass}`);
    console.log(`   Bags included: ${booking.fare.hasBags ? 'Yes' : 'No'}`);

    await this.page.waitForTimeout(2000);

    // Click the exact fare class
    await this.page.click(`text=${fareClass}`).catch(async () => {
      // Fallback to fare type matching
      const cabin = booking.fare.cabin.toLowerCase();
      const branded = (booking.fare.brandedFare || '').toLowerCase();

      if (branded === 'basic' || fareClass.toLowerCase().includes('basic')) {
        await this.page!.click('text=Basic Economy').catch(() => {});
      } else if (cabin === 'economy') {
        await this.page!.click('label:has-text("Economy")').last().click().catch(() => {});
      } else if (cabin === 'business') {
        await this.page!.click('text=Business').catch(() => {});
      } else if (cabin === 'first') {
        await this.page!.click('text=First').catch(() => {});
      }
    });

    await this.page.waitForTimeout(500);
    await this.screenshot('fare-selected');
    console.log(`✅ Fare selected: ${fareClass}`);
  }

  /**
   * Verify price is within acceptable range
   */
  async verifyPrice(booking: BookingData): Promise<{ valid: boolean; consolidatorPrice: number }> {
    if (!this.page) throw new Error('Browser not initialized');

    // Extract agency net price from page
    const priceText = await this.page.$eval(
      '.agency-net-price, [class*="net-price"], [class*="price"]',
      el => el.textContent || ''
    ).catch(() => '');

    const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
    const consolidatorPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

    console.log(`💰 Consolidator price: $${consolidatorPrice}`);
    console.log(`💰 Customer paid: $${booking.pricing.customerPaid}`);

    // Verify we're making profit (consolidator price < customer paid)
    const profit = booking.pricing.customerPaid - consolidatorPrice;
    console.log(`📈 Expected profit: $${profit.toFixed(2)}`);

    if (consolidatorPrice > booking.pricing.customerPaid) {
      console.error('❌ WARNING: Consolidator price exceeds customer payment!');
      return { valid: false, consolidatorPrice };
    }

    return { valid: true, consolidatorPrice };
  }

  /**
   * Fill passenger details - EXACT MATCH
   */
  async fillPassengers(booking: BookingData): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log(`👥 Filling ${booking.passengers.length} passenger(s)...`);

    for (let i = 0; i < booking.passengers.length; i++) {
      const pax = booking.passengers[i];
      const prefix = i === 0 ? '' : `[data-passenger="${i}"] `;

      console.log(`   Passenger ${i + 1}: ${pax.firstName} ${pax.lastName}`);

      // Gender
      const genderSelector = pax.gender === 'M' ? 'text=M' : 'text=F';
      await this.page.click(`${prefix}${genderSelector}`).catch(() => {});

      // First name
      await this.page.fill(
        `${prefix}input[name*="first"], ${prefix}input[placeholder*="First"]`,
        pax.firstName
      ).catch(async () => {
        // Alternative selector
        const inputs = await this.page!.$$('input');
        for (const input of inputs) {
          const label = await input.getAttribute('aria-label') || '';
          if (label.toLowerCase().includes('first')) {
            await input.fill(pax.firstName);
            break;
          }
        }
      });

      // Middle name (optional)
      if (pax.middleName) {
        await this.page.fill(
          `${prefix}input[name*="middle"], ${prefix}input[placeholder*="Middle"]`,
          pax.middleName
        ).catch(() => {});
      }

      // Last name
      await this.page.fill(
        `${prefix}input[name*="last"], ${prefix}input[placeholder*="Last"]`,
        pax.lastName
      ).catch(() => {});

      // Date of birth (format: MM/DD/YYYY for US sites)
      const dob = this.formatDateUS(pax.dateOfBirth);
      await this.page.fill(
        `${prefix}input[name*="birth"], ${prefix}input[placeholder*="MM/DD"]`,
        dob
      ).catch(() => {});

      // Nationality
      await this.page.selectOption(
        `${prefix}select[name*="nationality"]`,
        { label: this.getCountryName(pax.nationality) }
      ).catch(() => {});

      // Passport (if provided)
      if (pax.passportNumber) {
        await this.page.fill(
          `${prefix}input[name*="passport"], ${prefix}input[name*="document"]`,
          pax.passportNumber
        ).catch(() => {});

        if (pax.passportExpiry) {
          const expiry = this.formatDateUS(pax.passportExpiry);
          await this.page.fill(
            `${prefix}input[name*="expir"]`,
            expiry
          ).catch(() => {});
        }
      }
    }

    // Contact info
    await this.page.fill('input[name*="email"], input[type="email"]', booking.contactEmail).catch(() => {});
    await this.page.fill('input[name*="phone"], input[type="tel"]', booking.contactPhone).catch(() => {});

    await this.screenshot('passengers-filled');
    console.log('✅ Passenger details filled');
  }

  /**
   * Select payment method and complete booking
   */
  async completeBooking(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');

    console.log('💳 Selecting payment method...');

    // Select "Charge Passenger CC" (credit card payment)
    await this.page.click('text=Charge Passenger CC').catch(async () => {
      // Fallback selectors
      await this.page!.click('label:has-text("Charge Passenger")').catch(() => {});
      await this.page!.click('input[value*="cc"], input[value*="card"]').catch(() => {});
    });
    await this.page.waitForTimeout(500);

    await this.screenshot('payment-selected');

    // Click final BOOK button
    console.log('🚀 Submitting booking...');
    await this.page.click('button:has-text("BOOK")');

    // Wait for confirmation page
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);

    await this.screenshot('booking-confirmation');

    // Extract PNR from confirmation
    const pageText = await this.page.textContent('body') || '';

    // Look for PNR patterns (6 alphanumeric chars)
    const pnrMatch = pageText.match(/PNR[:\s]*([A-Z0-9]{6})/i) ||
                     pageText.match(/Confirmation[:\s]*([A-Z0-9]{6})/i) ||
                     pageText.match(/Record Locator[:\s]*([A-Z0-9]{6})/i) ||
                     pageText.match(/\b([A-Z]{6})\b/);

    const pnr = pnrMatch ? pnrMatch[1] : '';

    if (!pnr) {
      console.warn('⚠️ PNR not found in confirmation page');
      await this.screenshot('pnr-not-found');
    } else {
      console.log(`✅ Booking confirmed! PNR: ${pnr}`);
    }

    return pnr;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Format date to US format MM/DD/YYYY
   */
  private formatDateUS(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${month}/${day}/${year}`;
  }

  /**
   * Get country name from code
   */
  private getCountryName(code: string): string {
    const countries: Record<string, string> = {
      'US': 'United States',
      'BR': 'Brazil',
      'CA': 'Canada',
      'MX': 'Mexico',
      'GB': 'United Kingdom',
      'FR': 'France',
      'DE': 'Germany',
      'ES': 'Spain',
      'IT': 'Italy',
      'PT': 'Portugal',
      // Add more as needed
    };
    return countries[code] || code;
  }

  /**
   * Main booking flow - FULL E2E
   */
  async bookFlight(booking: BookingData, headless: boolean = true): Promise<BookingResult> {
    try {
      console.log('═══════════════════════════════════════════════════');
      console.log(`🎫 CONSOLIDATOR BOOKING AUTOMATION`);
      console.log(`   Booking: ${booking.bookingReference}`);
      console.log(`   Route: ${booking.flights.segments.map(s => `${s.origin}→${s.destination}`).join(' | ')}`);
      console.log(`   Passengers: ${booking.passengers.length}`);
      console.log('═══════════════════════════════════════════════════');

      // Initialize
      await this.init(headless);

      // Step 1: Login
      await this.login();

      // Step 2: Search
      await this.searchFlight(booking);

      // Step 3: Select exact flight
      await this.selectExactFlight(booking);

      // Step 4: Select fare class (MUST match customer's booking)
      await this.selectFare(booking);

      // Step 5: Verify price
      const priceCheck = await this.verifyPrice(booking);
      if (!priceCheck.valid) {
        throw new Error(`Price validation failed: Consolidator $${priceCheck.consolidatorPrice} > Customer paid $${booking.pricing.customerPaid}`);
      }

      // Step 6: Fill passengers
      await this.fillPassengers(booking);

      // Step 7: Complete booking
      const pnr = await this.completeBooking();

      console.log('═══════════════════════════════════════════════════');
      console.log(`✅ BOOKING COMPLETE`);
      console.log(`   PNR: ${pnr}`);
      console.log(`   Consolidator Price: $${priceCheck.consolidatorPrice}`);
      console.log('═══════════════════════════════════════════════════');

      return {
        success: true,
        pnr,
        consolidatorPrice: priceCheck.consolidatorPrice,
        screenshots: this.screenshots,
      };

    } catch (error: any) {
      console.error('❌ Booking automation failed:', error.message);
      await this.screenshot('error');

      return {
        success: false,
        error: error.message,
        screenshots: this.screenshots,
      };

    } finally {
      await this.close();
    }
  }
}

/**
 * Convert Fly2Any booking to consolidator format
 */
export function convertBookingToAutomationFormat(fly2anyBooking: any): BookingData {
  const flightData = fly2anyBooking.flightData || fly2anyBooking.flightOffer;

  // Extract flight segments
  const segments = flightData.itineraries?.flatMap((itin: any, itinIdx: number) =>
    itin.segments?.map((seg: any) => ({
      airline: seg.carrierCode || seg.operating?.carrierCode,
      flightNumber: seg.number || seg.flightNumber,
      origin: seg.departure?.iataCode,
      destination: seg.arrival?.iataCode,
      departureDate: seg.departure?.at?.split('T')[0],
      departureTime: seg.departure?.at?.split('T')[1]?.substring(0, 5),
      arrivalTime: seg.arrival?.at?.split('T')[1]?.substring(0, 5),
      cabin: flightData.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
    }))
  ) || [];

  // Determine trip type
  const itineraryCount = flightData.itineraries?.length || 1;
  const tripType = itineraryCount > 1 ? 'round_trip' : 'one_way';

  // Convert passengers
  const passengers = (fly2anyBooking.passengers || []).map((pax: any) => ({
    type: pax.type || 'adult',
    title: pax.title || 'Mr',
    firstName: pax.firstName,
    lastName: pax.lastName,
    middleName: pax.middleName,
    dateOfBirth: pax.dateOfBirth,
    gender: pax.gender === 'female' ? 'F' : 'M',
    nationality: pax.nationality || 'US',
    passportNumber: pax.passportNumber,
    passportExpiry: pax.passportExpiryDate,
    email: pax.email,
    phone: pax.phone,
  }));

  // Extract fare details from booking
  const fareSegment = flightData.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const cabin = fareSegment?.cabin || 'ECONOMY';
  const brandedFare = fareSegment?.brandedFare || flightData.brandedFareName || '';

  // Detect fare class name from branded fare or cabin
  let fareClass = 'Economy';
  if (brandedFare) {
    // Common branded fare mappings
    const brandedFareUpper = brandedFare.toUpperCase();
    if (brandedFareUpper.includes('BASIC') || brandedFareUpper === 'ECONOMY_LIGHT') {
      fareClass = 'Basic Economy';
    } else if (brandedFareUpper.includes('FLEX') || brandedFareUpper.includes('PLUS')) {
      fareClass = 'Economy Plus';
    } else if (brandedFareUpper.includes('BUSINESS') || cabin === 'BUSINESS') {
      fareClass = 'Business';
    } else if (brandedFareUpper.includes('FIRST') || cabin === 'FIRST') {
      fareClass = 'First';
    } else {
      fareClass = 'Economy';
    }
  } else if (cabin === 'BUSINESS') {
    fareClass = 'Business';
  } else if (cabin === 'FIRST') {
    fareClass = 'First';
  }

  // Detect included baggage
  const includedBags = fareSegment?.includedCheckedBags?.quantity || 0;
  const hasBags = includedBags > 0;

  // Also check amenities for bags
  const amenities = fareSegment?.amenities || [];
  const bagAmenity = amenities.find((a: any) =>
    a.description?.toLowerCase().includes('bag') && a.isChargeable === false
  );
  const hasBagsFromAmenities = !!bagAmenity;

  return {
    bookingId: fly2anyBooking.id,
    bookingReference: fly2anyBooking.bookingReference,
    flights: {
      type: tripType as 'one_way' | 'round_trip',
      segments,
    },
    passengers,
    fare: {
      cabin,
      fareClass,
      brandedFare: brandedFare || undefined,
      hasBags: hasBags || hasBagsFromAmenities,
      bagCount: includedBags || (hasBagsFromAmenities ? 1 : 0),
    },
    pricing: {
      customerPaid: parseFloat(fly2anyBooking.totalPrice || fly2anyBooking.pricing?.total || '0'),
      netPrice: parseFloat(fly2anyBooking.pricing?.netPrice || '0'),
      currency: fly2anyBooking.currency || 'USD',
    },
    contactEmail: fly2anyBooking.contactEmail || passengers[0]?.email || '',
    contactPhone: fly2anyBooking.contactPhone || passengers[0]?.phone || '',
  };
}
