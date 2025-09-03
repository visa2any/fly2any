const { chromium } = require('playwright');

async function captureFlightGridScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1400, height: 900 });
  
  // Navigate to our test HTML file
  await page.goto('http://localhost:8080/test-grid.html');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot of the entire page
  await page.screenshot({ 
    path: 'flight-grid-screenshot.png',
    fullPage: true
  });
  
  // Take a focused screenshot of just the grid area
  const gridElement = await page.locator('.routes-grid');
  await gridElement.screenshot({
    path: 'flight-grid-focused.png'
  });
  
  await browser.close();
  
  console.log('Screenshots captured successfully!');
  console.log('- flight-grid-screenshot.png (full page)');
  console.log('- flight-grid-focused.png (grid only)');
}

captureFlightGridScreenshot().catch(console.error);