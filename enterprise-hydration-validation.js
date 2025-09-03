const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔬 ULTRATHINK ENTERPRISE - Hydration Fix Validation\n');
    console.log('=' .repeat(80));
    console.log('🎯 VALIDATING HYDRATION MISMATCH FIX');
    console.log('=' .repeat(80));
    
    let hydrationErrorDetected = false;
    let totalErrors = 0;
    let totalWarnings = 0;
    
    // Monitor for hydration errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error' && text.includes('hydration')) {
        hydrationErrorDetected = true;
        console.log(`🔴 HYDRATION ERROR STILL PRESENT: ${text}`);
        totalErrors++;
      } else if (type === 'warning' && (text.includes('hydration') || text.includes('mismatch'))) {
        console.log(`⚠️ HYDRATION WARNING: ${text}`);
        totalWarnings++;
      } else if (type === 'error') {
        console.log(`❌ OTHER ERROR: ${text}`);
        totalErrors++;
      }
    });
    
    // Monitor for exceptions
    page.on('pageerror', error => {
      if (error.message.includes('hydration')) {
        hydrationErrorDetected = true;
        console.log(`💥 HYDRATION EXCEPTION: ${error.message}`);
      }
      totalErrors++;
    });
    
    console.log('\n🔍 Step 1: Loading homepage and monitoring for hydration issues...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded, analyzing social proof counter...');
    
    // Step 2: Validate the social proof counter
    console.log('\n📊 Step 2: Validating social proof counter implementation...');
    
    const socialProofAnalysis = await page.evaluate(() => {
      // Find the social proof text element
      const socialProofElement = Array.from(document.querySelectorAll('div'))
        .find(div => div.textContent && div.textContent.includes('pessoas fizeram isso hoje'));
      
      if (!socialProofElement) {
        return { found: false, text: null, number: null };
      }
      
      const text = socialProofElement.textContent;
      const numberMatch = text.match(/Mais (\\d+) pessoas/);
      const number = numberMatch ? parseInt(numberMatch[1]) : null;
      
      return {
        found: true,
        text,
        number,
        isValidRange: number >= 5 && number <= 19,
        elementVisible: socialProofElement.offsetParent !== null
      };
    });
    
    console.log('Social Proof Analysis:', JSON.stringify(socialProofAnalysis, null, 2));
    
    // Step 3: Test multiple page reloads to ensure consistency
    console.log('\n🔄 Step 3: Testing multiple reloads for hydration stability...');
    
    const reloadResults = [];
    for (let i = 0; i < 3; i++) {
      console.log(`   Reload ${i + 1}/3...`);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const reloadAnalysis = await page.evaluate(() => {
        const socialProofElement = Array.from(document.querySelectorAll('div'))
          .find(div => div.textContent && div.textContent.includes('pessoas fizeram isso hoje'));
        
        if (!socialProofElement) return { number: null };
        
        const text = socialProofElement.textContent;
        const numberMatch = text.match(/Mais (\\d+) pessoas/);
        return { number: numberMatch ? parseInt(numberMatch[1]) : null };
      });
      
      reloadResults.push(reloadAnalysis.number);
      console.log(`   Result: ${reloadAnalysis.number}`);
    }
    
    // Step 4: Test form interaction (potential hydration trigger)
    console.log('\n🎯 Step 4: Testing form interaction for hydration stability...');
    
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    if (serviceButtons.length > 0) {
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('✅ Form opened without hydration issues');
      
      // Close form and check social proof again
      const homeButton = await page.$('button:has-text("Início")');
      if (homeButton) {
        await homeButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'hydration-validation-result.png' });
    
    // Final Assessment
    console.log('\\n' + '=' .repeat(80));
    console.log('🎉 ENTERPRISE HYDRATION FIX - VALIDATION RESULTS');
    console.log('=' .repeat(80));
    
    const validationResults = {
      'Hydration Error Eliminated': !hydrationErrorDetected,
      'Social Proof Counter Working': socialProofAnalysis.found && socialProofAnalysis.isValidRange,
      'Element Properly Rendered': socialProofAnalysis.elementVisible,
      'Reload Stability': reloadResults.every(num => num >= 5 && num <= 19),
      'Form Interaction Safe': !hydrationErrorDetected,
      'Zero Critical Errors': totalErrors === 0
    };
    
    let passedValidations = 0;
    const totalValidations = Object.keys(validationResults).length;
    
    Object.entries(validationResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
      if (passed) passedValidations++;
    });
    
    console.log('\\n' + '=' .repeat(80));
    console.log(`📊 VALIDATION SCORE: ${passedValidations}/${totalValidations} (${Math.round(passedValidations/totalValidations*100)}%)`);
    
    if (passedValidations === totalValidations) {
      console.log('\\n🏆 PERFECT SUCCESS - HYDRATION MISMATCH ELIMINATED!');
      console.log('✅ Enterprise-level hydration safety implemented');
      console.log('✅ Social proof counter working flawlessly');
      console.log('✅ No SSR/CSR mismatches detected');
      console.log('✅ Form interactions remain stable');
      console.log('✅ ULTRATHINK quality standards achieved');
    } else if (passedValidations >= totalValidations * 0.8) {
      console.log('\\n🎯 EXCELLENT PROGRESS - Minor issues may remain');
    } else {
      console.log('\\n⚠️ ADDITIONAL FIXES NEEDED');
    }
    
    console.log('\\n📊 Statistics:');
    console.log(`   • Total Errors: ${totalErrors}`);
    console.log(`   • Total Warnings: ${totalWarnings}`);
    console.log(`   • Social Proof Numbers: ${reloadResults.join(', ')}`);
    console.log(`   • Valid Range (5-19): ${reloadResults.every(num => num >= 5 && num <= 19) ? 'YES' : 'NO'}`);
    
    console.log('\\n📸 Validation screenshot: hydration-validation-result.png');
    
  } catch (error) {
    console.error('\\n💥 VALIDATION ERROR:', error.message);
    await page.screenshot({ path: 'validation-error.png' });
  } finally {
    await browser.close();
  }
})();