const { chromium } = require('@playwright/test');

async function testExtremeOptimization() {
  console.log('🔥 ULTRATHINK EXTREME Optimization Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--disable-cache']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();
  
  // Navigate with cache disabled
  await page.goto('http://localhost:3000', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  console.log('📱 Mobile Home Loaded');
  await page.waitForTimeout(2000);
  
  // Screenshot home
  await page.screenshot({ 
    path: 'ultrathink-extreme-home.png', 
    fullPage: false 
  });
  
  // Try to click Voos button
  try {
    const voosButton = await page.locator('button:has-text("Voos")').first();
    if (await voosButton.isVisible()) {
      console.log('✅ Clicking Voos...');
      await voosButton.click();
      await page.waitForTimeout(3000);
      
      // Screenshot flight form
      await page.screenshot({ 
        path: 'ultrathink-extreme-flight.png', 
        fullPage: false 
      });
      
      // Measure the actual form spacing
      const measurements = await page.evaluate(() => {
        const container = document.querySelector('.mobile-form-content');
        const forms = document.querySelectorAll('form');
        const divs = document.querySelectorAll('div[class*="space-y"]');
        const paddings = [];
        
        divs.forEach(div => {
          const classes = div.className;
          if (classes.includes('space-y-1')) paddings.push('space-y-1');
          if (classes.includes('space-y-2')) paddings.push('space-y-2');
          if (classes.includes('space-y-3')) paddings.push('space-y-3');
          if (classes.includes('space-y-4')) paddings.push('space-y-4');
        });
        
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input');
        
        return {
          containerExists: container !== null,
          formCount: forms.length,
          spaceClasses: paddings.slice(0, 5),
          buttonCount: buttons.length,
          inputCount: inputs.length,
          viewportHeight: window.innerHeight,
          formHeight: forms[0] ? forms[0].offsetHeight : 0
        };
      });
      
      console.log('\n📊 EXTREME OPTIMIZATION MEASUREMENTS:');
      console.log('  • Container exists:', measurements.containerExists);
      console.log('  • Form count:', measurements.formCount);
      console.log('  • Space classes found:', measurements.spaceClasses.join(', '));
      console.log('  • Form height:', measurements.formHeight, 'px');
      console.log('  • Viewport height:', measurements.viewportHeight, 'px');
      console.log('  • Form/Viewport ratio:', (measurements.formHeight/measurements.viewportHeight * 100).toFixed(1) + '%');
      
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  await browser.close();
  
  console.log('\n✅ EXTREME OPTIMIZATION APPLIED:');
  console.log('  • Padding: p-4→p-1 (75% reduction)');
  console.log('  • Spacing: space-y-4→space-y-1 (75% reduction)');
  console.log('  • Gaps: gap-4→gap-1 (75% reduction)');
  console.log('  • Margins: mb-4→mb-1 (75% reduction)');
  console.log('  • Text: text-2xl→text-lg, text-base→text-sm');
  console.log('  • Bottom padding: 88px→40px (54% reduction)');
  console.log('\n📸 Screenshots: ultrathink-extreme-*.png');
}

testExtremeOptimization().catch(console.error);