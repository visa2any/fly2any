/**
 * SIMPLE MOBILE SERVICE FLOW TEST
 * Quick verification of mobile service flows
 */

const { chromium } = require('playwright');

async function runSimpleTest() {
  console.log('🚀 Starting Simple Mobile Service Flow Test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  const results = {
    appLoading: false,
    services: {},
    issues: []
  };

  try {
    console.log('📱 Loading mobile app...');
    
    // Load with less strict waiting
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait for basic content
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded');
    results.appLoading = true;

    // Take initial screenshot
    await page.screenshot({ path: 'mobile-test-initial.png', fullPage: false });
    console.log('📸 Initial screenshot saved: mobile-test-initial.png');

    // Test service buttons
    console.log('\n🔘 Testing Service Buttons...');
    
    const services = [
      { key: 'voos', label: 'Voos', icon: '✈️' },
      { key: 'hoteis', label: 'Hotéis', icon: '🏨' },
      { key: 'carros', label: 'Carros', icon: '🚗' },
      { key: 'passeios', label: 'Passeios', icon: '🎯' },
      { key: 'seguro', label: 'Seguro', icon: '🛡️' }
    ];

    for (const service of services) {
      console.log(`  Testing ${service.icon} ${service.label}...`);
      
      try {
        // Look for service button in various ways
        let buttonFound = false;
        
        // Try different selectors
        const selectors = [
          `button:has-text("${service.label}")`,
          `[data-service="${service.key}"]`,
          `button:text-matches("${service.label}", "i")`,
          `button >> text=${service.label}`,
        ];

        for (const selector of selectors) {
          try {
            const button = await page.locator(selector).first();
            if (await button.count() > 0 && await button.isVisible()) {
              console.log(`    ✅ Found ${service.label} button`);
              
              // Test click
              await button.click();
              await page.waitForTimeout(1500);
              
              // Take screenshot after click
              await page.screenshot({ path: `mobile-test-${service.key}-clicked.png`, fullPage: false });
              console.log(`    📸 Screenshot after ${service.label} click: mobile-test-${service.key}-clicked.png`);
              
              // Check if form appeared
              const formVisible = await page.locator('.mobile-lead-capture, [class*="Mobile"], [class*="form"], .lead-form').first().count() > 0;
              
              results.services[service.key] = {
                buttonFound: true,
                formOpened: formVisible
              };
              
              console.log(`    ${formVisible ? '✅' : '⚠️'} Form ${formVisible ? 'opened' : 'not detected'}`);
              
              // Go back to home for next test
              try {
                const backButton = await page.locator('button:has-text("Voltar"), [aria-label*="back"]').first();
                if (await backButton.count() > 0) {
                  await backButton.click();
                  await page.waitForTimeout(1000);
                  console.log(`    ✅ Back navigation working`);
                } else {
                  // Reload page to reset
                  await page.reload();
                  await page.waitForTimeout(2000);
                  console.log(`    ⚠️ Back button not found, reloaded page`);
                }
              } catch (e) {
                await page.reload();
                await page.waitForTimeout(2000);
              }
              
              buttonFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }

        if (!buttonFound) {
          console.log(`    ❌ ${service.label} button not found`);
          results.services[service.key] = {
            buttonFound: false,
            formOpened: false
          };
        }

      } catch (error) {
        console.log(`    ❌ Error testing ${service.label}: ${error.message}`);
        results.services[service.key] = {
          buttonFound: false,
          error: error.message
        };
      }
    }

    // Test main CTA button
    console.log('\n⚡ Testing Main CTA Button...');
    try {
      await page.reload();
      await page.waitForTimeout(2000);
      
      const ctaButton = await page.locator('button:has-text("Buscar"), button:has-text("Ofertas"), button:has-text("Grátis")').first();
      if (await ctaButton.count() > 0) {
        await ctaButton.click();
        await page.waitForTimeout(1500);
        
        await page.screenshot({ path: 'mobile-test-cta-clicked.png', fullPage: false });
        console.log('  📸 CTA clicked screenshot: mobile-test-cta-clicked.png');
        
        const leadFormVisible = await page.locator('.mobile-lead-capture, [class*="MobileLeadCapture"], .lead-form').first().count() > 0;
        results.ctaIntegration = leadFormVisible;
        console.log(`  ${leadFormVisible ? '✅' : '⚠️'} MobileLeadCaptureCorrect ${leadFormVisible ? 'opened' : 'not detected'}`);
      }
    } catch (e) {
      console.log(`  ❌ CTA test error: ${e.message}`);
    }

    // Test form fields and navigation
    console.log('\n📝 Testing Form Elements...');
    try {
      const inputs = await page.locator('input, select, textarea').count();
      const buttons = await page.locator('button').count();
      const forms = await page.locator('form, [class*="form"]').count();
      
      results.formElements = {
        inputs,
        buttons,
        forms
      };
      
      console.log(`  ✅ Found ${inputs} inputs, ${buttons} buttons, ${forms} forms`);
    } catch (e) {
      console.log(`  ⚠️ Form elements test error: ${e.message}`);
    }

  } catch (error) {
    console.log(`❌ Critical error: ${error.message}`);
    results.issues.push(error.message);
  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n📊 SIMPLE MOBILE SERVICE TEST REPORT');
  console.log('='.repeat(50));
  
  console.log(`\n📱 App Loading: ${results.appLoading ? '✅ Success' : '❌ Failed'}`);
  
  console.log('\n🔘 Service Button Results:');
  Object.entries(results.services).forEach(([service, result]) => {
    const buttonStatus = result.buttonFound ? '✅' : '❌';
    const formStatus = result.formOpened ? '✅' : '⚠️';
    console.log(`  ${buttonStatus}${formStatus} ${service.toUpperCase()}: Button=${result.buttonFound}, Form=${result.formOpened}`);
  });

  if (results.ctaIntegration !== undefined) {
    console.log(`\n⚡ Main CTA Integration: ${results.ctaIntegration ? '✅ Working' : '⚠️ Issues detected'}`);
  }

  if (results.formElements) {
    console.log(`\n📝 Form Elements: ${results.formElements.inputs} inputs, ${results.formElements.buttons} buttons, ${results.formElements.forms} forms`);
  }

  if (results.issues.length > 0) {
    console.log('\n🚨 Issues:');
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  const workingServices = Object.values(results.services).filter(s => s.buttonFound && s.formOpened).length;
  const totalServices = Object.keys(results.services).length;
  
  console.log(`\n🎯 Summary: ${workingServices}/${totalServices} services fully functional`);
  
  if (workingServices === totalServices) {
    console.log('🎉 All mobile service flows are working correctly!');
  } else if (workingServices >= totalServices * 0.8) {
    console.log('✅ Most mobile service flows are working - minor issues detected');
  } else {
    console.log('⚠️ Several mobile service flows need attention');
  }

  console.log('\n📸 Screenshots saved for visual verification');
  console.log('='.repeat(50));

  return results;
}

// Run the test
runSimpleTest().catch(console.error);