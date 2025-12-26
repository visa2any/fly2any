import express from 'express';
import cors from 'cors';
import { chromium, Browser, Page } from 'playwright';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fly2any-auto-ticket' });
});

// Auto-ticket endpoint
app.post('/auto-ticket', async (req, res) => {
  const { bookingId, bookingReference, automationData, consolidatorEmail, consolidatorPassword, dryRun = true } = req.body;

  if (!automationData || !consolidatorEmail || !consolidatorPassword) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`🤖 AUTO-TICKET: ${bookingReference}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════');

  let browser: Browser | null = null;
  const screenshots: string[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Login to consolidator
    console.log('📍 Step 1: Logging into TheBestAgent.PRO...');
    await page.goto('https://thebestagent.pro/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"], input[type="email"]', consolidatorEmail);
    await page.fill('input[name="password"], input[type="password"]', consolidatorPassword);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if login successful
    const isLoggedIn = await page.url().includes('dashboard') || await page.$('text=Dashboard');
    if (!isLoggedIn) {
      throw new Error('Login failed - check credentials');
    }
    console.log('✅ Logged in successfully');

    // 2. Navigate to flight booking
    console.log('📍 Step 2: Starting new booking...');
    await page.goto('https://thebestagent.pro/flights/search');
    await page.waitForLoadState('networkidle');

    const segment = automationData.flights.segments[0];

    // Fill search form
    await page.fill('input[name="origin"], input[placeholder*="From"]', segment.origin);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    await page.fill('input[name="destination"], input[placeholder*="To"]', segment.destination);
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Set date
    const dateInput = await page.$('input[name="departureDate"], input[type="date"]');
    if (dateInput) {
      await dateInput.fill(segment.departureDate);
    }

    // Search flights
    await page.click('button[type="submit"], button:has-text("Search")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✅ Search completed');

    // 3. Find matching flight
    console.log(`📍 Step 3: Finding flight ${segment.airline} ${segment.flightNumber}...`);

    const flightSelector = `text=${segment.airline}${segment.flightNumber}`;
    const flightCard = await page.$(flightSelector);

    if (!flightCard) {
      // Try alternative selectors
      const altFlight = await page.$(`text=${segment.flightNumber}`);
      if (!altFlight) {
        throw new Error(`Flight ${segment.airline} ${segment.flightNumber} not found in search results`);
      }
    }

    // Click on flight to select
    await page.click(flightSelector).catch(() => page.click(`text=${segment.flightNumber}`));
    await page.waitForTimeout(1000);

    // Get consolidator price
    const priceElement = await page.$('.price, [class*="price"], text=/\\$[0-9]+/');
    let consolidatorPrice = 0;
    if (priceElement) {
      const priceText = await priceElement.textContent();
      const priceMatch = priceText?.match(/\\$?([0-9,]+\\.?[0-9]*)/);
      if (priceMatch) {
        consolidatorPrice = parseFloat(priceMatch[1].replace(',', ''));
      }
    }

    console.log(`💰 Consolidator price: $${consolidatorPrice}`);

    // 4. Fill passenger details
    console.log('📍 Step 4: Filling passenger details...');

    for (const pax of automationData.passengers) {
      await page.fill('input[name="firstName"], input[placeholder*="First"]', pax.firstName);
      await page.fill('input[name="lastName"], input[placeholder*="Last"]', pax.lastName);

      if (pax.dateOfBirth) {
        const dobInput = await page.$('input[name="dateOfBirth"], input[name="dob"]');
        if (dobInput) await dobInput.fill(pax.dateOfBirth);
      }

      if (pax.email) {
        const emailInput = await page.$('input[name="email"], input[type="email"]');
        if (emailInput) await emailInput.fill(pax.email);
      }

      if (pax.phone) {
        const phoneInput = await page.$('input[name="phone"], input[type="tel"]');
        if (phoneInput) await phoneInput.fill(pax.phone);
      }
    }

    console.log('✅ Passenger details filled');

    // 5. Complete booking
    if (dryRun) {
      console.log('📝 DRY RUN - Stopping before final booking');

      // Take screenshot of final state
      const screenshotBuffer = await page.screenshot();
      screenshots.push(screenshotBuffer.toString('base64'));

      return res.json({
        success: true,
        dryRun: true,
        consolidatorPrice,
        message: 'Dry run complete - booking NOT submitted',
        screenshots,
      });
    }

    // LIVE MODE - Submit booking
    console.log('🚀 LIVE MODE - Submitting booking...');
    await page.click('button[type="submit"], button:has-text("Book"), button:has-text("Confirm")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Extract PNR from confirmation
    const pnrElement = await page.$('[class*="pnr"], [class*="confirmation"], text=/[A-Z]{6}/');
    let pnr = '';
    if (pnrElement) {
      const pnrText = await pnrElement.textContent();
      const pnrMatch = pnrText?.match(/[A-Z]{6}/);
      if (pnrMatch) {
        pnr = pnrMatch[0];
      }
    }

    if (!pnr) {
      throw new Error('Booking submitted but PNR not found in response');
    }

    console.log(`✅ BOOKING COMPLETE! PNR: ${pnr}`);

    return res.json({
      success: true,
      dryRun: false,
      pnr,
      consolidatorPrice,
      message: 'Flight booked successfully',
    });

  } catch (error: any) {
    console.error('❌ Auto-ticket error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      screenshots,
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auto-ticket API running on port ${PORT}`);
});
