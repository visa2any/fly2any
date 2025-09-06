const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');
  
  const buttons = await page.$$('.page_serviceButton__kz94S.page_mobileServiceButton__6ez6W');
  const cards = ['voos', 'hoteis', 'carros', 'tours', 'seguro'];
  
  for (let i = 1; i < Math.min(buttons.length, cards.length); i++) { // Skip voos (index 0), already tested
    console.log(`Testing ${cards[i]}...`);
    
    const initialScroll = await page.evaluate(() => window.scrollY);
    await buttons[i].click();
    await page.waitForTimeout(2000);
    
    const afterScroll = await page.evaluate(() => window.scrollY);
    const scrolled = afterScroll > initialScroll;
    
    await page.screenshot({ path: `mobile-${cards[i]}-after-quick.png` });
    
    console.log(`${cards[i]}: scrolled=${scrolled}, scrollY=${afterScroll}`);
    
    // Try to close
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
  }
  
  await browser.close();
}

quickTest().catch(console.error);