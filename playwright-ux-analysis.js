const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzeFlightSearchFormUX() {
  console.log('🎭 Starting Playwright UX Analysis for Flight Search Form');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the flights page
    console.log('📍 Navigating to /flights page...');
    await page.goto('http://localhost:3000/flights', { waitUntil: 'networkidle' });
    
    // Wait for the form to be fully loaded
    await page.waitForSelector('[data-testid="flight-search-form"], .flight-search-form, form', { timeout: 10000 });
    
    // Take full page screenshot
    console.log('📸 Capturing full page screenshot...');
    await page.screenshot({ 
      path: 'flight-search-form-full.png',
      fullPage: true 
    });
    
    // Focus on the search form area
    const searchForm = await page.locator('form, [data-testid="flight-search-form"], .flight-search-form').first();
    if (await searchForm.count() > 0) {
      console.log('📸 Capturing search form screenshot...');
      await searchForm.screenshot({ path: 'flight-search-form-focused.png' });
    }
    
    // Take viewport screenshot
    console.log('📸 Capturing viewport screenshot...');
    await page.screenshot({ path: 'flight-search-form-viewport.png' });
    
    // Test mobile viewport
    console.log('📱 Testing mobile viewport...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'flight-search-form-mobile.png' });
    
    // Test tablet viewport
    console.log('📱 Testing tablet viewport...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'flight-search-form-tablet.png' });
    
    // Analyze form elements
    console.log('🔍 Analyzing form elements...');
    const formAnalysis = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, button'));
      const formElements = inputs.map(el => ({
        tag: el.tagName,
        type: el.type,
        placeholder: el.placeholder,
        id: el.id,
        className: el.className,
        ariaLabel: el.getAttribute('aria-label'),
        position: el.getBoundingClientRect(),
        visible: el.offsetWidth > 0 && el.offsetHeight > 0
      }));
      
      return {
        totalElements: formElements.length,
        visibleElements: formElements.filter(el => el.visible).length,
        elements: formElements,
        formStructure: {
          hasFromField: !!document.querySelector('[placeholder*="rom"], [placeholder*="Origin"], input[name*="from"]'),
          hasToField: !!document.querySelector('[placeholder*="o"], [placeholder*="Destination"], input[name*="to"]'),
          hasDateField: !!document.querySelector('[placeholder*="ate"], input[type="date"], input[name*="date"]'),
          hasPassengerField: !!document.querySelector('[placeholder*="assenger"], select[name*="passenger"]'),
          hasSearchButton: !!document.querySelector('button[type="submit"], button:contains("Search")')
        }
      };
    });
    
    // Save analysis to file
    fs.writeFileSync('flight-form-analysis.json', JSON.stringify(formAnalysis, null, 2));
    console.log('💾 Form analysis saved to flight-form-analysis.json');
    
    console.log('✅ UX Analysis Complete!');
    console.log(`📊 Found ${formAnalysis.totalElements} form elements, ${formAnalysis.visibleElements} visible`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

// Run the analysis
analyzeFlightSearchFormUX().catch(console.error);