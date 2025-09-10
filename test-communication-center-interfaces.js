const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testCommunicationCenterInterfaces() {
  console.log('🚀 Starting Communication Center Interface Testing');
  console.log('Server URL: http://localhost:3001');
  console.log('Testing database connectivity and UI functionality\n');

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'communication-center-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slower for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  const interfaces = [
    {
      name: 'Modern Interface (Recommended)',
      url: 'http://localhost:3001/admin/omnichannel/modern',
      key: 'modern'
    },
    {
      name: 'Premium Interface',
      url: 'http://localhost:3001/admin/omnichannel/premium',
      key: 'premium'
    },
    {
      name: 'Styled Interface',
      url: 'http://localhost:3001/admin/omnichannel/styled',
      key: 'styled'
    },
    {
      name: 'Standard Interface',
      url: 'http://localhost:3001/admin/omnichannel',
      key: 'standard'
    },
    {
      name: 'Test Interface',
      url: 'http://localhost:3001/admin/omnichannel-test',
      key: 'test'
    },
    {
      name: 'Direct Access Interface',
      url: 'http://localhost:3001/omnichannel-direct',
      key: 'direct'
    }
  ];

  const testResults = [];

  for (const interface of interfaces) {
    console.log(`\n📋 Testing: ${interface.name}`);
    console.log(`URL: ${interface.url}`);
    
    const result = {
      name: interface.name,
      url: interface.url,
      key: interface.key,
      status: 'unknown',
      loadTime: 0,
      errors: [],
      databaseConnected: false,
      uiQuality: 'unknown',
      features: [],
      issues: [],
      screenshots: [],
      productionReady: false
    };

    try {
      const startTime = Date.now();
      
      // Navigate to interface
      console.log(`  ⏳ Loading interface...`);
      const response = await page.goto(interface.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      result.loadTime = Date.now() - startTime;
      result.status = response.status();
      
      if (response.status() !== 200) {
        result.errors.push(`HTTP ${response.status()}`);
        console.log(`  ❌ HTTP Error: ${response.status()}`);
        continue;
      }

      // Wait for page to fully load
      await page.waitForTimeout(3000);
      
      // Take initial screenshot
      const screenshotPath = path.join(screenshotsDir, `${interface.key}_initial.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      result.screenshots.push(`${interface.key}_initial.png`);
      console.log(`  📸 Screenshot saved: ${interface.key}_initial.png`);

      // Check for database connection errors
      console.log(`  🔍 Checking database connectivity...`);
      const bodyText = await page.textContent('body');
      const hasRelationError = bodyText.includes('relation') && bodyText.includes('does not exist');
      const hasConnectionError = bodyText.includes('connection') && bodyText.includes('error');
      const hasError = bodyText.includes('Error:') || bodyText.includes('error');
      
      result.databaseConnected = !hasRelationError && !hasConnectionError;
      
      if (hasRelationError) {
        result.errors.push('Database relation does not exist error');
        console.log(`  ❌ Database Error: Relation does not exist`);
      } else if (hasConnectionError) {
        result.errors.push('Database connection error');
        console.log(`  ❌ Database Error: Connection issue`);
      } else if (hasError) {
        result.errors.push('Generic error detected');
        console.log(`  ⚠️  Error detected in page content`);
      } else {
        console.log(`  ✅ Database appears to be connected`);
      }

      // Check for specific UI elements and features
      console.log(`  🎨 Analyzing UI elements...`);
      
      // Check for conversations list
      const conversationsContainer = await page.locator('[data-testid="conversations-list"], .conversations-list, .conversation-item').first().isVisible().catch(() => false);
      if (conversationsContainer) {
        result.features.push('Conversations list container');
      }

      // Check for message input
      const messageInput = await page.locator('textarea, input[placeholder*="message"], input[placeholder*="Message"]').first().isVisible().catch(() => false);
      if (messageInput) {
        result.features.push('Message input field');
      }

      // Check for navigation elements
      const navElements = await page.locator('nav, .nav, .navigation, [role="navigation"]').count();
      if (navElements > 0) {
        result.features.push(`Navigation elements (${navElements})`);
      }

      // Check for sidebar
      const sidebar = await page.locator('.sidebar, [data-testid="sidebar"], .side-panel').first().isVisible().catch(() => false);
      if (sidebar) {
        result.features.push('Sidebar/side panel');
      }

      // Check for header
      const header = await page.locator('header, .header, [role="banner"]').first().isVisible().catch(() => false);
      if (header) {
        result.features.push('Header section');
      }

      // Check for empty state or loading indicators
      const emptyState = await page.locator('[data-testid="empty-state"], .empty, .no-conversations').first().isVisible().catch(() => false);
      const loadingState = await page.locator('[data-testid="loading"], .loading, .spinner').first().isVisible().catch(() => false);
      
      if (emptyState) {
        result.features.push('Empty state display');
      }
      if (loadingState) {
        result.features.push('Loading indicators');
      }

      // UI Quality Assessment
      console.log(`  📊 Assessing UI quality...`);
      
      const uiQualityFactors = {
        responsive: false,
        styled: false,
        interactive: false,
        accessible: false,
        modern: false
      };

      // Check for CSS frameworks or styling
      const hasBootstrap = await page.locator('link[href*="bootstrap"], script[src*="bootstrap"]').count() > 0;
      const hasTailwind = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*')).some(el => 
          el.className && el.className.includes && (
            el.className.includes('flex') || 
            el.className.includes('grid') || 
            el.className.includes('p-') || 
            el.className.includes('m-')
          )
        );
      });
      
      if (hasBootstrap || hasTailwind) {
        uiQualityFactors.styled = true;
      }

      // Check for responsive elements
      const hasResponsiveElements = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets).map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join(' ');
          } catch (e) {
            return '';
          }
        }).join(' ');
        return styles.includes('@media') || styles.includes('responsive');
      });
      
      if (hasResponsiveElements) {
        uiQualityFactors.responsive = true;
      }

      // Check for interactive elements
      const interactiveElements = await page.locator('button, input, select, textarea, [role="button"], [tabindex]').count();
      if (interactiveElements > 5) {
        uiQualityFactors.interactive = true;
      }

      // Check for accessibility features
      const accessibleElements = await page.locator('[role], [aria-label], [aria-labelledby], [alt]').count();
      if (accessibleElements > 3) {
        uiQualityFactors.accessible = true;
      }

      // Modern UI indicators
      const modernIndicators = await page.evaluate(() => {
        const hasFlexbox = getComputedStyle(document.body).display.includes('flex') ||
                          Array.from(document.querySelectorAll('*')).some(el => 
                            getComputedStyle(el).display.includes('flex'));
        const hasGrid = Array.from(document.querySelectorAll('*')).some(el => 
                       getComputedStyle(el).display.includes('grid'));
        const hasModernColors = Array.from(document.querySelectorAll('*')).some(el => {
          const styles = getComputedStyle(el);
          return styles.backgroundColor.includes('rgb') || styles.color.includes('rgb');
        });
        return hasFlexbox || hasGrid || hasModernColors;
      });
      
      if (modernIndicators) {
        uiQualityFactors.modern = true;
      }

      // Calculate UI quality score
      const qualityScore = Object.values(uiQualityFactors).filter(Boolean).length;
      const uiQualityLevels = ['Poor', 'Basic', 'Good', 'Excellent', 'Outstanding'];
      result.uiQuality = uiQualityLevels[Math.min(qualityScore, 4)];

      // Test basic interactions
      console.log(`  🖱️  Testing basic interactions...`);
      
      try {
        // Try to click on interactive elements
        const clickableElements = await page.locator('button:visible, [role="button"]:visible').all();
        if (clickableElements.length > 0) {
          await clickableElements[0].click();
          await page.waitForTimeout(1000);
          result.features.push('Interactive buttons working');
        }
      } catch (e) {
        result.issues.push('Button interaction failed');
      }

      // Take final screenshot after interactions
      const finalScreenshotPath = path.join(screenshotsDir, `${interface.key}_final.png`);
      await page.screenshot({ 
        path: finalScreenshotPath, 
        fullPage: true 
      });
      result.screenshots.push(`${interface.key}_final.png`);

      // Production readiness assessment
      result.productionReady = (
        result.databaseConnected &&
        result.errors.length === 0 &&
        result.features.length >= 3 &&
        ['Good', 'Excellent', 'Outstanding'].includes(result.uiQuality)
      );

      console.log(`  ✅ Test completed - Load time: ${result.loadTime}ms`);
      console.log(`  📊 UI Quality: ${result.uiQuality}`);
      console.log(`  🎯 Production Ready: ${result.productionReady ? 'YES' : 'NO'}`);
      
    } catch (error) {
      result.errors.push(error.message);
      console.log(`  ❌ Test failed: ${error.message}`);
    }

    testResults.push(result);
  }

  await browser.close();

  // Generate comprehensive report
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMMUNICATION CENTER INTERFACES TEST REPORT');
  console.log('='.repeat(80));

  const report = {
    timestamp: new Date().toISOString(),
    serverUrl: 'http://localhost:3001',
    totalInterfaces: interfaces.length,
    results: testResults,
    summary: {
      working: testResults.filter(r => r.status === 200 && r.databaseConnected).length,
      withErrors: testResults.filter(r => r.errors.length > 0).length,
      productionReady: testResults.filter(r => r.productionReady).length
    }
  };

  // Console output
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${result.status === 200 ? '✅ OK' : '❌ ERROR'} (${result.status})`);
    console.log(`   Load Time: ${result.loadTime}ms`);
    console.log(`   Database Connected: ${result.databaseConnected ? '✅ YES' : '❌ NO'}`);
    console.log(`   UI Quality: ${result.uiQuality}`);
    console.log(`   Features: ${result.features.length > 0 ? result.features.join(', ') : 'None detected'}`);
    console.log(`   Errors: ${result.errors.length > 0 ? result.errors.join(', ') : 'None'}`);
    console.log(`   Issues: ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}`);
    console.log(`   Screenshots: ${result.screenshots.join(', ')}`);
    console.log(`   Production Ready: ${result.productionReady ? '✅ YES' : '❌ NO'}`);
  });

  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('🎯 RECOMMENDATIONS FOR PRODUCTION USE');
  console.log('='.repeat(80));

  const productionReadyInterfaces = testResults.filter(r => r.productionReady);
  const workingInterfaces = testResults.filter(r => r.status === 200 && r.databaseConnected);

  if (productionReadyInterfaces.length > 0) {
    console.log('\n✅ RECOMMENDED FOR PRODUCTION:');
    productionReadyInterfaces
      .sort((a, b) => {
        const qualityOrder = { 'Outstanding': 5, 'Excellent': 4, 'Good': 3, 'Basic': 2, 'Poor': 1 };
        return (qualityOrder[b.uiQuality] || 0) - (qualityOrder[a.uiQuality] || 0);
      })
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   - UI Quality: ${result.uiQuality}`);
        console.log(`   - Load Time: ${result.loadTime}ms`);
        console.log(`   - Features: ${result.features.length}`);
        console.log(`   - URL: ${result.url}`);
      });
  }

  if (workingInterfaces.length > productionReadyInterfaces.length) {
    console.log('\n⚠️  WORKING BUT NEEDS IMPROVEMENT:');
    workingInterfaces
      .filter(r => !r.productionReady)
      .forEach((result) => {
        console.log(`- ${result.name}: ${result.issues.join(', ') || 'UI quality needs improvement'}`);
      });
  }

  const brokenInterfaces = testResults.filter(r => r.status !== 200 || !r.databaseConnected);
  if (brokenInterfaces.length > 0) {
    console.log('\n❌ NOT WORKING - NEEDS FIXING:');
    brokenInterfaces.forEach((result) => {
      console.log(`- ${result.name}: ${result.errors.join(', ')}`);
    });
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'communication-center-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 TESTING COMPLETED');
  console.log('='.repeat(80));
  
  return report;
}

// Run the test
testCommunicationCenterInterfaces().catch(console.error);