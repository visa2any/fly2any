const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLogoVisibility() {
  console.log('🚀 Starting Fly2Any Logo Visibility Test with Playwright...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: {},
    screenshots: [],
    issues: [],
    summary: {}
  };

  try {
    // Test Desktop View
    console.log('📱 Testing Desktop View (1920x1080)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);
    
    // Take desktop screenshot
    const desktopScreenshot = 'desktop-logo-test.png';
    await desktopPage.screenshot({ 
      path: desktopScreenshot, 
      fullPage: true 
    });
    results.screenshots.push({ view: 'desktop', file: desktopScreenshot });
    console.log(`✅ Desktop screenshot saved: ${desktopScreenshot}`);
    
    // Test desktop logo visibility and properties
    const desktopResults = await testLogoElements(desktopPage, 'desktop');
    results.testResults.desktop = desktopResults;
    
    await desktopContext.close();

    // Test Mobile View (iPhone 12 Pro)
    console.log('\n📱 Testing Mobile View (iPhone 12 Pro)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    
    await mobilePage.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);
    
    // Take mobile screenshot
    const mobileScreenshot = 'mobile-logo-test.png';
    await mobilePage.screenshot({ 
      path: mobileScreenshot, 
      fullPage: true 
    });
    results.screenshots.push({ view: 'mobile', file: mobileScreenshot });
    console.log(`✅ Mobile screenshot saved: ${mobileScreenshot}`);
    
    // Test mobile logo visibility and properties
    const mobileResults = await testLogoElements(mobilePage, 'mobile');
    results.testResults.mobile = mobileResults;
    
    await mobileContext.close();

    // Test Tablet View (iPad)
    console.log('\n📱 Testing Tablet View (iPad)...');
    const tabletContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const tabletPage = await tabletContext.newPage();
    
    await tabletPage.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    await tabletPage.waitForTimeout(2000);
    
    // Take tablet screenshot
    const tabletScreenshot = 'tablet-logo-test.png';
    await tabletPage.screenshot({ 
      path: tabletScreenshot, 
      fullPage: true 
    });
    results.screenshots.push({ view: 'tablet', file: tabletScreenshot });
    console.log(`✅ Tablet screenshot saved: ${tabletScreenshot}`);
    
    // Test tablet logo visibility and properties
    const tabletResults = await testLogoElements(tabletPage, 'tablet');
    results.testResults.tablet = tabletResults;
    
    await tabletContext.close();

  } catch (error) {
    console.error('❌ Error during testing:', error);
    results.issues.push({
      type: 'critical_error',
      message: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }

  // Generate summary
  generateSummary(results);
  
  // Save detailed results
  const reportFile = 'logo-visibility-test-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportFile}`);
  
  return results;
}

async function testLogoElements(page, viewType) {
  console.log(`\n🔍 Testing logo elements in ${viewType} view...`);
  
  const results = {
    logoImages: [],
    logoLinks: [],
    visibility: {},
    accessibility: {},
    functionality: {},
    issues: []
  };

  try {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Find all logo-related elements
    const logoSelectors = [
      'img[src*="fly2any-logo"]',
      'img[alt*="fly2any" i]',
      'img[alt*="logo" i]',
      '[class*="logo"]',
      'a[href="/"] img',
      'header img'
    ];

    for (const selector of logoSelectors) {
      try {
        const elements = await page.$$(selector);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const elementInfo = await analyzeLogoElement(page, element, selector, i);
          
          if (elementInfo.tagName === 'IMG') {
            results.logoImages.push(elementInfo);
          } else if (elementInfo.tagName === 'A') {
            results.logoLinks.push(elementInfo);
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not find elements with selector: ${selector}`);
      }
    }

    // Test logo image loading
    await testImageLoading(page, results);
    
    // Test logo click functionality
    await testLogoClickFunctionality(page, results);
    
    // Test accessibility
    await testLogoAccessibility(page, results);
    
    console.log(`✅ Found ${results.logoImages.length} logo images and ${results.logoLinks.length} logo links`);
    
  } catch (error) {
    console.error(`❌ Error testing ${viewType} logo elements:`, error);
    results.issues.push({
      type: 'element_test_error',
      message: error.message,
      viewType
    });
  }

  return results;
}

async function analyzeLogoElement(page, element, selector, index) {
  const elementInfo = await element.evaluate((el, sel, idx) => {
    const rect = el.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(el);
    
    return {
      tagName: el.tagName,
      selector: sel,
      index: idx,
      src: el.src || null,
      alt: el.alt || null,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
      visible: rect.width > 0 && rect.height > 0 && computedStyle.visibility !== 'hidden' && computedStyle.display !== 'none',
      opacity: computedStyle.opacity,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      zIndex: computedStyle.zIndex,
      className: el.className,
      href: el.href || null,
      naturalWidth: el.naturalWidth || null,
      naturalHeight: el.naturalHeight || null,
      complete: el.complete || null,
      loading: el.loading || null
    };
  }, selector, index);

  return elementInfo;
}

async function testImageLoading(page, results) {
  console.log('🖼️ Testing image loading status...');
  
  for (const logoImg of results.logoImages) {
    try {
      if (logoImg.src) {
        // Test if image is actually loaded
        const imageLoaded = await page.evaluate((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
          });
        }, logoImg.src);

        logoImg.loadedSuccessfully = imageLoaded;
        
        if (!imageLoaded) {
          results.issues.push({
            type: 'image_loading_error',
            message: `Logo image failed to load: ${logoImg.src}`,
            element: logoImg
          });
        }
        
        // Check for broken image indicators
        if (logoImg.naturalWidth === 0 || logoImg.naturalHeight === 0) {
          results.issues.push({
            type: 'broken_image',
            message: `Logo image appears broken (0 dimensions): ${logoImg.src}`,
            element: logoImg
          });
        }
      }
    } catch (error) {
      results.issues.push({
        type: 'image_test_error',
        message: `Error testing image loading: ${error.message}`,
        element: logoImg
      });
    }
  }
}

async function testLogoClickFunctionality(page, results) {
  console.log('🖱️ Testing logo click functionality...');
  
  // Find clickable logo elements (links containing logos or logos themselves)
  const clickableLogos = [...results.logoImages, ...results.logoLinks].filter(el => 
    el.href || el.tagName === 'A' || el.className.includes('clickable')
  );

  for (const logo of clickableLogos) {
    try {
      // Test if logo is clickable and navigates correctly
      const currentUrl = page.url();
      
      // Try to click the logo
      if (logo.selector && logo.index !== undefined) {
        const elements = await page.$$(logo.selector);
        if (elements[logo.index]) {
          await elements[logo.index].click();
          await page.waitForTimeout(1000);
          
          const newUrl = page.url();
          
          logo.clickable = true;
          logo.navigationTest = {
            originalUrl: currentUrl,
            newUrl: newUrl,
            navigatedToHome: newUrl.includes('localhost:3003') && (newUrl === 'http://localhost:3003/' || newUrl === 'http://localhost:3003')
          };
          
          // Navigate back to original page for other tests
          if (newUrl !== currentUrl) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    } catch (error) {
      logo.clickable = false;
      logo.clickError = error.message;
      results.issues.push({
        type: 'click_test_error',
        message: `Error testing logo click: ${error.message}`,
        element: logo
      });
    }
  }
}

async function testLogoAccessibility(page, results) {
  console.log('♿ Testing logo accessibility...');
  
  results.accessibility = {
    altTextPresent: 0,
    altTextMissing: 0,
    altTextAppropriate: 0,
    keyboardAccessible: 0,
    issues: []
  };

  for (const logoImg of results.logoImages) {
    // Check alt text
    if (logoImg.alt && logoImg.alt.trim() !== '') {
      results.accessibility.altTextPresent++;
      
      // Check if alt text is appropriate
      const altLower = logoImg.alt.toLowerCase();
      if (altLower.includes('fly2any') || altLower.includes('logo') || altLower.includes('home')) {
        results.accessibility.altTextAppropriate++;
      } else {
        results.accessibility.issues.push({
          type: 'poor_alt_text',
          message: `Alt text may not be descriptive enough: "${logoImg.alt}"`,
          element: logoImg
        });
      }
    } else {
      results.accessibility.altTextMissing++;
      results.accessibility.issues.push({
        type: 'missing_alt_text',
        message: 'Logo image missing alt text',
        element: logoImg
      });
    }
  }

  // Test keyboard accessibility
  try {
    const focusableLogos = await page.$$('a img, button img, [tabindex] img');
    results.accessibility.keyboardAccessible = focusableLogos.length;
  } catch (error) {
    results.accessibility.issues.push({
      type: 'keyboard_test_error',
      message: `Error testing keyboard accessibility: ${error.message}`
    });
  }
}

function generateSummary(results) {
  console.log('\n📊 LOGO VISIBILITY TEST SUMMARY');
  console.log('═'.repeat(50));
  
  const viewTypes = Object.keys(results.testResults);
  let totalLogos = 0;
  let totalIssues = 0;
  let visibleLogos = 0;
  let workingLogos = 0;

  viewTypes.forEach(viewType => {
    const viewResults = results.testResults[viewType];
    const logoCount = viewResults.logoImages.length;
    const visibleCount = viewResults.logoImages.filter(img => img.visible).length;
    const workingCount = viewResults.logoImages.filter(img => img.loadedSuccessfully).length;
    const issueCount = viewResults.issues.length;

    totalLogos += logoCount;
    visibleLogos += visibleCount;
    workingLogos += workingCount;
    totalIssues += issueCount;

    console.log(`\n${viewType.toUpperCase()} VIEW:`);
    console.log(`  📸 Screenshots: ${results.screenshots.filter(s => s.view === viewType).length}`);
    console.log(`  🖼️ Logo images found: ${logoCount}`);
    console.log(`  👀 Visible logos: ${visibleCount}`);
    console.log(`  ✅ Working logos: ${workingCount}`);
    console.log(`  🔗 Clickable logos: ${viewResults.logoLinks.length}`);
    console.log(`  ⚠️ Issues: ${issueCount}`);
    
    if (viewResults.logoImages.length > 0) {
      const mainLogo = viewResults.logoImages[0];
      console.log(`  📐 Main logo dimensions: ${Math.round(mainLogo.width)}x${Math.round(mainLogo.height)}px`);
      console.log(`  🏷️ Alt text: "${mainLogo.alt || 'Missing'}"`);
    }
  });

  results.summary = {
    totalViewsTested: viewTypes.length,
    totalLogosFound: totalLogos,
    totalVisibleLogos: visibleLogos,
    totalWorkingLogos: workingLogos,
    totalIssues: totalIssues,
    screenshotsTaken: results.screenshots.length,
    testStatus: totalIssues === 0 ? 'PASS' : totalIssues < 5 ? 'PASS_WITH_WARNINGS' : 'FAIL'
  };

  console.log('\n🎯 OVERALL RESULTS:');
  console.log(`  Views tested: ${viewTypes.length}`);
  console.log(`  Total logos found: ${totalLogos}`);
  console.log(`  Visible logos: ${visibleLogos}`);
  console.log(`  Working logos: ${workingLogos}`);
  console.log(`  Screenshots taken: ${results.screenshots.length}`);
  console.log(`  Total issues: ${totalIssues}`);
  console.log(`  Test status: ${results.summary.testStatus}`);

  if (totalIssues > 0) {
    console.log('\n⚠️ ISSUES FOUND:');
    viewTypes.forEach(viewType => {
      const issues = results.testResults[viewType].issues;
      if (issues.length > 0) {
        console.log(`\n  ${viewType.toUpperCase()} issues:`);
        issues.forEach((issue, i) => {
          console.log(`    ${i + 1}. ${issue.type}: ${issue.message}`);
        });
      }
    });
  }

  console.log('\n' + '═'.repeat(50));
}

// Run the test
testLogoVisibility()
  .then(() => {
    console.log('\n🎉 Logo visibility test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Logo visibility test failed:', error);
    process.exit(1);
  });