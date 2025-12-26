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

// ═══════════════════════════════════════════════════════════════════
// VIATOR TOURS/ACTIVITIES AUTOMATION
// ═══════════════════════════════════════════════════════════════════

app.post('/viator-book', async (req, res) => {
  const {
    bookingId,
    bookingReference,
    tourData,
    viatorEmail,
    viatorPassword,
    dryRun = true
  } = req.body;

  if (!tourData || !viatorEmail || !viatorPassword) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`🎫 VIATOR BOOKING: ${bookingReference}`);
  console.log(`   Tour: ${tourData.tourName}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════');

  let browser: Browser | null = null;
  const screenshots: string[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Login to Viator Travel Agent portal
    console.log('📍 Step 1: Logging into Viator Travel Agents...');
    await page.goto('https://travelagents.viator.com/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"], input[type="email"], #email', viatorEmail);
    await page.fill('input[name="password"], input[type="password"], #password', viatorPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check login
    const loginFailed = await page.$('text=Invalid, text=incorrect, .error');
    if (loginFailed) {
      throw new Error('Viator login failed - check credentials');
    }
    console.log('✅ Logged into Viator');

    // 2. Search for tour/activity
    console.log(`📍 Step 2: Searching for tour: ${tourData.tourName}...`);

    // Navigate to search or use direct product code if available
    if (tourData.productCode) {
      await page.goto(`https://travelagents.viator.com/product/${tourData.productCode}`);
    } else {
      await page.goto('https://travelagents.viator.com/search');
      await page.waitForLoadState('networkidle');

      const searchInput = await page.$('input[type="search"], input[name="search"], input[placeholder*="Search"]');
      if (searchInput) {
        await searchInput.fill(tourData.tourName);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    }

    // 3. Select date and time
    console.log(`📍 Step 3: Selecting date: ${tourData.date}...`);

    // Find date picker
    const dateInput = await page.$('input[type="date"], input[name="date"], [data-testid="date-picker"]');
    if (dateInput) {
      await dateInput.fill(tourData.date);
    } else {
      // Try clicking calendar and selecting date
      await page.click('button:has-text("Select date"), .date-picker-trigger').catch(() => {});
      await page.waitForTimeout(500);
    }

    // Select time slot if available
    if (tourData.timeSlot) {
      await page.click(`text=${tourData.timeSlot}`).catch(() => {
        console.log('⚠️ Time slot not found, using default');
      });
    }

    // 4. Set travelers count
    console.log(`📍 Step 4: Setting ${tourData.travelers} travelers...`);

    const travelersInput = await page.$('input[name="travelers"], input[name="adults"], select[name="travelers"]');
    if (travelersInput) {
      const tagName = await travelersInput.evaluate(el => el.tagName);
      if (tagName === 'SELECT') {
        await travelersInput.selectOption(tourData.travelers.toString());
      } else {
        await travelersInput.fill(tourData.travelers.toString());
      }
    }

    // Check availability
    await page.click('button:has-text("Check availability"), button:has-text("Check")').catch(() => {});
    await page.waitForTimeout(2000);

    // Get agent price
    const priceElement = await page.$('.agent-price, .net-price, [class*="price"]:not([class*="retail"])');
    let agentPrice = 0;
    if (priceElement) {
      const priceText = await priceElement.textContent();
      const priceMatch = priceText?.match(/\$?([0-9,]+\.?[0-9]*)/);
      if (priceMatch) {
        agentPrice = parseFloat(priceMatch[1].replace(',', ''));
      }
    }
    console.log(`💰 Agent price: $${agentPrice}`);

    // 5. Fill traveler details
    console.log('📍 Step 5: Filling traveler details...');

    for (let i = 0; i < tourData.passengers.length; i++) {
      const pax = tourData.passengers[i];
      const prefix = i === 0 ? '' : `[${i}]`;

      const firstNameInput = await page.$(`input[name="firstName${prefix}"], input[name="travelers[${i}].firstName"]`);
      if (firstNameInput) await firstNameInput.fill(pax.firstName);

      const lastNameInput = await page.$(`input[name="lastName${prefix}"], input[name="travelers[${i}].lastName"]`);
      if (lastNameInput) await lastNameInput.fill(pax.lastName);
    }

    // Lead traveler contact
    const leadEmail = await page.$('input[name="leadEmail"], input[name="email"], input[type="email"]:not([name="login"])');
    if (leadEmail && tourData.passengers[0]?.email) {
      await leadEmail.fill(tourData.passengers[0].email);
    }

    const leadPhone = await page.$('input[name="leadPhone"], input[name="phone"], input[type="tel"]');
    if (leadPhone && tourData.passengers[0]?.phone) {
      await leadPhone.fill(tourData.passengers[0].phone);
    }

    console.log('✅ Traveler details filled');

    // 6. Complete booking
    if (dryRun) {
      console.log('📝 DRY RUN - Stopping before payment');

      const screenshotBuffer = await page.screenshot({ fullPage: true });
      screenshots.push(screenshotBuffer.toString('base64'));

      return res.json({
        success: true,
        dryRun: true,
        agentPrice,
        message: 'Dry run complete - booking NOT submitted',
        screenshots,
      });
    }

    // LIVE MODE
    console.log('🚀 LIVE MODE - Completing booking...');
    await page.click('button:has-text("Book now"), button:has-text("Complete"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Extract confirmation/voucher number
    const confirmElement = await page.$('[class*="confirmation"], [class*="voucher"], [class*="booking-ref"]');
    let voucherNumber = '';
    if (confirmElement) {
      const confirmText = await confirmElement.textContent();
      const voucherMatch = confirmText?.match(/[A-Z0-9]{6,}/);
      if (voucherMatch) {
        voucherNumber = voucherMatch[0];
      }
    }

    console.log(`✅ VIATOR BOOKING COMPLETE! Voucher: ${voucherNumber}`);

    return res.json({
      success: true,
      dryRun: false,
      voucherNumber,
      agentPrice,
      message: 'Tour booked successfully via Viator',
    });

  } catch (error: any) {
    console.error('❌ Viator booking error:', error.message);
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
  console.log(`   Endpoints:`);
  console.log(`   - POST /auto-ticket (Flight consolidator)`);
  console.log(`   - POST /viator-book (Tours/Activities)`);
});
