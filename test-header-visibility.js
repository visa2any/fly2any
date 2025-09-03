const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

async function testHeader() {
  let server;
  let browser;
  
  try {
    // Start dev server
    console.log('🚀 Starting development server...');
    server = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '3000' },
      stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise(resolve => {
      server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Server:', output);
        if (output.includes('ready') || output.includes('started') || output.includes('compiled')) {
          resolve();
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(resolve, 30000);
    });
    
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Navigate to homepage
    console.log('📍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for any component to load
    await page.waitForTimeout(3000);
    
    // Check for ResponsiveHeader or any header element
    console.log('🔍 Checking for header components...');
    
    // Check various possible header selectors
    const headerSelectors = [
      'header',
      '[role="banner"]',
      'nav',
      '[class*="header"]',
      '[class*="Header"]',
      '[id*="header"]',
      '[id*="Header"]',
      'div:has(> nav)',
      // Check for logo which is typically in header
      'img[alt*="logo"]',
      'img[alt*="Logo"]',
      'img[alt*="Fly2Any"]',
      'a[href="/"]',
      // Check for navigation items
      'a[href*="voos"]',
      'a[href*="hotels"]',
      'a[href*="about"]',
      'button:has-text("Menu")'
    ];
    
    let headerFound = false;
    const foundElements = [];
    
    for (const selector of headerSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            foundElements.push(selector);
            headerFound = true;
            console.log(`✅ Found header element: ${selector}`);
          }
        }
      } catch (e) {
        // Selector might be invalid, skip
      }
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'header-test-screenshot.png',
      fullPage: false 
    });
    console.log('📸 Screenshot saved as header-test-screenshot.png');
    
    // Get page HTML structure (top portion)
    const htmlStructure = await page.evaluate(() => {
      const body = document.body;
      const firstChildren = Array.from(body.children).slice(0, 5);
      return firstChildren.map(child => ({
        tagName: child.tagName,
        className: child.className,
        id: child.id,
        innerHTML: child.innerHTML.substring(0, 200) + '...'
      }));
    });
    
    console.log('\n📄 Page structure (first 5 elements):');
    console.log(JSON.stringify(htmlStructure, null, 2));
    
    // Check specifically for ResponsiveHeader component
    const hasResponsiveHeader = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.className && el.className.toString().includes('responsive')) {
          return true;
        }
      }
      return false;
    });
    
    console.log(`\n🔎 ResponsiveHeader component present: ${hasResponsiveHeader}`);
    
    if (headerFound) {
      console.log('\n✅ SUCCESS: Header is now visible on the page!');
      console.log('Found these header-related elements:', foundElements);
    } else {
      console.log('\n⚠️  WARNING: No header elements found on the page');
      console.log('The ResponsiveHeader component might need debugging');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
    if (server) {
      server.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 1000));
      server.kill('SIGKILL');
    }
  }
}

testHeader().catch(console.error);