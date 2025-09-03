const { chromium } = require('playwright');

async function finalValidation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);
  
  const flightCard = await page.$('text=Voos');
  if (flightCard) await flightCard.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'mobile-ux-final-validation.png' });
  console.log('📱 Final mobile UX screenshot: mobile-ux-final-validation.png');
  
  await browser.close();
}

finalValidation();