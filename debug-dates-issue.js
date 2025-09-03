const { chromium } = require('playwright');

console.log('🔍 DEBUGGING DATES DISPLAY ISSUE');
console.log('================================\n');

async function debugDatesIssue() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Loading optimized flight wizard...');
    await page.goto('http://localhost:3000', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Open flight form
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight wizard opened');
    }

    // Check for Step 1 elements
    console.log('\n🔍 STEP 1 DEBUGGING');
    console.log('===================');
    
    // Check if we're on Step 1
    const step1 = await page.$('[data-step="1"], [key*="step1"], div:has-text("Tipo de viagem")');
    console.log(`Step 1 container: ${step1 ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check for trip type section
    const tripTypeSection = await page.$('text=/Tipo de viagem/');
    console.log(`Trip type section: ${tripTypeSection ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check for airports section  
    const airportsSection = await page.$('text=/Origem/, text=/aeroporto/');
    console.log(`Airports section: ${airportsSection ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check for dates section specifically
    const datesHeader = await page.$('text=/Quando você viaja/');
    console.log(`Dates header: ${datesHeader ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check for date inputs
    const dateInputs = await page.$$('input[type="date"]');
    console.log(`Date inputs found: ${dateInputs.length}`);
    
    // Check for date labels
    const dateLabels = await page.$$('text=/Ida/, text=/Volta/');
    console.log(`Date labels found: ${dateLabels.length}`);
    
    // Check console errors
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => logs.push(`ERROR: ${error.message}`));
    
    await page.waitForTimeout(2000);
    
    console.log('\n📋 CONSOLE LOGS:');
    console.log('================');
    logs.forEach(log => console.log(log));
    
    // Check computed styles of dates section
    if (datesHeader) {
      const isVisible = await datesHeader.isVisible();
      console.log(`\nDates header visible: ${isVisible}`);
      
      const styles = await datesHeader.evaluate(el => {
        const computed = getComputedStyle(el.closest('div'));
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          height: computed.height
        };
      });
      console.log('Dates section styles:', styles);
    }
    
    // Take screenshot for visual inspection
    await page.screenshot({ 
      path: 'debug-dates-step1.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved: debug-dates-step1.png');
    
    // Check trip type selection state
    const selectedTripType = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tripButtons = buttons.filter(btn => 
        btn.textContent?.includes('Ida e volta') || 
        btn.textContent?.includes('Somente ida') || 
        btn.textContent?.includes('Múltiplas cidades')
      );
      const selected = tripButtons.find(btn => 
        btn.classList.contains('border-primary-500') || 
        btn.style.borderColor?.includes('primary')
      );
      return selected ? selected.textContent.trim() : 'None selected';
    });
    console.log(`\nSelected trip type: ${selectedTripType}`);
    
  } catch (error) {
    console.log('❌ Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
}

debugDatesIssue().catch(console.error);