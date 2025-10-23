import { chromium } from '@playwright/test';

async function getHTMLContent() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Navigating to page...');
  await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Wait longer for data to load
  console.log('Waiting for flight data...');
  await page.waitForTimeout(10000);

  // Get all console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Take another screenshot after waiting
  await page.screenshot({ path: 'after-wait.png', fullPage: false });
  console.log('Screenshot after 10s wait: after-wait.png');

  // Get HTML
  const html = await page.content();
  const fs = await import('fs');
  fs.writeFileSync('page-html.html', html);
  console.log('HTML saved to: page-html.html');

  // Check for specific elements
  console.log('\n=== CHECKING FOR ELEMENTS ===');

  const flightCards = await page.$$('[data-testid*="flight"], [class*="FlightCard"], article, [class*="flight-card"]');
  console.log(`Flight cards found: ${flightCards.length}`);

  const loadingStates = await page.$$('[class*="skeleton"], [class*="Skeleton"], [class*="loading"]');
  console.log(`Loading states found: ${loadingStates.length}`);

  const errorMessages = await page.$$('[class*="error"], [class*="Error"]');
  console.log(`Error messages found: ${errorMessages.length}`);

  // Check for any text content
  const bodyText = await page.$eval('body', el => el.innerText).catch(() => 'Could not get body text');
  console.log('\n=== VISIBLE TEXT (first 500 chars) ===');
  console.log(bodyText.substring(0, 500));

  // Get network requests
  console.log('\n=== CHECKING NETWORK ===');
  const apiCalls = [];
  page.on('response', response => {
    if (response.url().includes('api')) {
      apiCalls.push(`${response.status()} - ${response.url()}`);
    }
  });

  // Wait a bit more to catch API calls
  await page.waitForTimeout(3000);

  if (apiCalls.length > 0) {
    console.log('API Calls detected:');
    apiCalls.forEach(call => console.log(`  ${call}`));
  } else {
    console.log('No API calls detected!');
  }

  console.log('\n=== CONSOLE LOGS ===');
  if (consoleLogs.length > 0) {
    consoleLogs.forEach(log => console.log(log));
  } else {
    console.log('No console logs');
  }

  await browser.close();
}

getHTMLContent();
