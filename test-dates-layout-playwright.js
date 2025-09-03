const { chromium } = require('playwright');

async function testDatesLayout() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  
  try {
    // Test mobile view (360px width)
    console.log('🔍 Testing mobile view (360px width)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 360, height: 640 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const mobilePage = await mobileContext.newPage();
    
    // Navigate to homepage
    console.log('📱 Navigating to homepage on mobile...');
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);
    
    // Take screenshot of homepage
    await mobilePage.screenshot({ 
      path: 'mobile-homepage-initial.png',
      fullPage: true 
    });
    console.log('✅ Mobile homepage screenshot saved');
    
    // Look for flight form trigger (could be a button or service selection)
    console.log('📱 Looking for flight form trigger...');
    
    // Try different possible selectors for opening flight form
    const possibleSelectors = [
      'button[data-service="flight"]',
      '[data-testid="flight-service"]',
      'button:has-text("Flight")',
      'button:has-text("Voo")',
      '.service-flight',
      '[data-service-type="flight"]'
    ];
    
    let flightTrigger = null;
    for (const selector of possibleSelectors) {
      try {
        const element = await mobilePage.locator(selector).first();
        if (await element.isVisible()) {
          flightTrigger = element;
          console.log(`📱 Found flight trigger: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // If no specific flight trigger found, try clicking on service selection areas
    if (!flightTrigger) {
      console.log('📱 Trying to find service selection area...');
      try {
        // Look for any clickable service elements
        const serviceElements = await mobilePage.locator('button, [role="button"], .cursor-pointer').all();
        for (const element of serviceElements) {
          const text = await element.textContent();
          if (text && (text.toLowerCase().includes('flight') || text.toLowerCase().includes('voo'))) {
            flightTrigger = element;
            console.log(`📱 Found flight service: ${text}`);
            break;
          }
        }
      } catch (e) {
        console.log('📱 No specific flight trigger found, will look for form elements');
      }
    }
    
    // Click on flight service if found
    if (flightTrigger) {
      await flightTrigger.click();
      await mobilePage.waitForTimeout(1500);
      console.log('✅ Flight service selected');
    }
    
    // Look for the dates section (accordion style)
    console.log('📱 Looking for dates section...');
    const datesSectionSelectors = [
      'button:has-text("Datas")',
      'button:has-text("Data")',
      '[data-section="dates"]',
      '[data-testid="dates-section"]',
      '.dates-section button',
      '.accordion-dates',
      'button[aria-controls*="date"]'
    ];
    
    let datesSection = null;
    for (const selector of datesSectionSelectors) {
      try {
        const element = await mobilePage.locator(selector).first();
        if (await element.isVisible()) {
          datesSection = element;
          console.log(`📱 Found dates section: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // If found dates section, click to expand
    if (datesSection) {
      console.log('📱 Expanding dates section...');
      await datesSection.click();
      await mobilePage.waitForTimeout(1500);
    } else {
      console.log('📱 Dates section not found as button, looking for expanded form...');
    }
    
    // Take screenshot after form interaction
    await mobilePage.screenshot({ 
      path: 'mobile-dates-form-expanded.png',
      fullPage: true 
    });
    console.log('✅ Mobile dates form screenshot saved');
    
    // Look for date inputs to verify side-by-side layout
    console.log('📱 Checking date inputs layout...');
    const dateInputs = await mobilePage.locator('input[type="date"], .date-input, [data-testid*="date"]').all();
    console.log(`📱 Found ${dateInputs.length} date inputs`);
    
    if (dateInputs.length >= 2) {
      // Get bounding boxes of first two date inputs
      const firstDateBox = await dateInputs[0].boundingBox();
      const secondDateBox = await dateInputs[1].boundingBox();
      
      if (firstDateBox && secondDateBox) {
        const areSideBySide = Math.abs(firstDateBox.y - secondDateBox.y) < 20; // Within 20px vertically
        console.log(`📱 Mobile dates side-by-side: ${areSideBySide}`);
        console.log(`📱 First date Y: ${firstDateBox.y}, Second date Y: ${secondDateBox.y}`);
      }
    }
    
    await mobileContext.close();
    
    // Test desktop view (1280px width)
    console.log('\n🖥️ Testing desktop view (1280px width)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const desktopPage = await desktopContext.newPage();
    
    // Navigate to homepage
    console.log('🖥️ Navigating to homepage on desktop...');
    await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);
    
    // Take screenshot of homepage
    await desktopPage.screenshot({ 
      path: 'desktop-homepage-initial.png',
      fullPage: true 
    });
    console.log('✅ Desktop homepage screenshot saved');
    
    // Look for flight form trigger on desktop
    console.log('🖥️ Looking for flight form trigger...');
    
    let desktopFlightTrigger = null;
    for (const selector of possibleSelectors) {
      try {
        const element = await desktopPage.locator(selector).first();
        if (await element.isVisible()) {
          desktopFlightTrigger = element;
          console.log(`🖥️ Found flight trigger: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // Click on flight service if found
    if (desktopFlightTrigger) {
      await desktopFlightTrigger.click();
      await desktopPage.waitForTimeout(1500);
      console.log('✅ Flight service selected on desktop');
    }
    
    // Look for the dates section on desktop
    console.log('🖥️ Looking for dates section...');
    let desktopDatesSection = null;
    for (const selector of datesSectionSelectors) {
      try {
        const element = await desktopPage.locator(selector).first();
        if (await element.isVisible()) {
          desktopDatesSection = element;
          console.log(`🖥️ Found dates section: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // If found dates section, click to expand
    if (desktopDatesSection) {
      console.log('🖥️ Expanding dates section...');
      await desktopDatesSection.click();
      await desktopPage.waitForTimeout(1500);
    }
    
    // Take screenshot after form interaction
    await desktopPage.screenshot({ 
      path: 'desktop-dates-form-expanded.png',
      fullPage: true 
    });
    console.log('✅ Desktop dates form screenshot saved');
    
    // Check date inputs layout on desktop
    console.log('🖥️ Checking date inputs layout...');
    const desktopDateInputs = await desktopPage.locator('input[type="date"], .date-input, [data-testid*="date"]').all();
    console.log(`🖥️ Found ${desktopDateInputs.length} date inputs`);
    
    if (desktopDateInputs.length >= 2) {
      // Get bounding boxes of first two date inputs
      const firstDateBox = await desktopDateInputs[0].boundingBox();
      const secondDateBox = await desktopDateInputs[1].boundingBox();
      
      if (firstDateBox && secondDateBox) {
        const areSideBySide = Math.abs(firstDateBox.y - secondDateBox.y) < 20; // Within 20px vertically
        console.log(`🖥️ Desktop dates side-by-side: ${areSideBySide}`);
        console.log(`🖥️ First date Y: ${firstDateBox.y}, Second date Y: ${secondDateBox.y}`);
      }
    }
    
    await desktopContext.close();
    
    console.log('\n✅ Test completed! Check the screenshots:');
    console.log('📱 Mobile screenshots: mobile-homepage-initial.png, mobile-dates-form-expanded.png');
    console.log('🖥️ Desktop screenshots: desktop-homepage-initial.png, desktop-dates-form-expanded.png');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testDatesLayout();