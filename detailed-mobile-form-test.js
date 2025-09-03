/**
 * DETAILED MOBILE FORM TEST
 * Deep dive into form functionality, navigation, and validation
 */

const { chromium } = require('playwright');

async function runDetailedFormTest() {
  console.log('🔍 Starting Detailed Mobile Form Test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  const results = {
    services: {},
    navigation: {},
    validation: {},
    integration: {}
  };

  try {
    console.log('📱 Loading app...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const services = [
      { key: 'voos', label: 'Voos', component: 'MobileFlightFormUnified' },
      { key: 'hoteis', label: 'Hotéis', component: 'MobileHotelForm' },
      { key: 'carros', label: 'Carros', component: 'MobileCarForm' },
      { key: 'passeios', label: 'Passeios', component: 'MobileTourForm' },
      { key: 'seguro', label: 'Seguro', component: 'MobileInsuranceForm' }
    ];

    for (const service of services) {
      console.log(`\n🧪 Testing ${service.label} Form in Detail...`);
      
      try {
        // Reset to home
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(1500);

        // Click service button
        const serviceButton = page.locator(`button:has-text("${service.label}")`).first();
        await serviceButton.click();
        await page.waitForTimeout(2000);

        const serviceResults = {
          formOpened: false,
          steps: [],
          navigation: {},
          inputs: [],
          validation: {}
        };

        // Check if form opened
        const formLocators = [
          '[class*="Mobile"]',
          '.mobile-lead-capture',
          '.lead-form',
          'form',
          '[class*="form"]'
        ];

        let formFound = false;
        for (const locator of formLocators) {
          const elements = await page.locator(locator).count();
          if (elements > 0) {
            formFound = true;
            break;
          }
        }

        serviceResults.formOpened = formFound;
        console.log(`  📝 Form opened: ${formFound ? 'Yes' : 'No'}`);

        if (formFound) {
          // Test navigation elements
          console.log('  🧭 Testing navigation elements...');
          
          const backButtons = await page.locator('button:has-text("Voltar"), [aria-label*="back"], [class*="back"]').count();
          const nextButtons = await page.locator('button:has-text("Próximo"), button:has-text("Continuar"), [aria-label*="next"]').count();
          const submitButtons = await page.locator('button:has-text("Enviar"), button[type="submit"]').count();

          serviceResults.navigation = {
            backButtons,
            nextButtons, 
            submitButtons
          };

          console.log(`    Back buttons: ${backButtons}`);
          console.log(`    Next/Continue buttons: ${nextButtons}`);
          console.log(`    Submit buttons: ${submitButtons}`);

          // Test input fields
          console.log('  📝 Testing input fields...');
          
          const textInputs = await page.locator('input[type="text"], input:not([type])').count();
          const emailInputs = await page.locator('input[type="email"]').count();
          const dateInputs = await page.locator('input[type="date"]').count();
          const selects = await page.locator('select').count();
          const textareas = await page.locator('textarea').count();
          const checkboxes = await page.locator('input[type="checkbox"]').count();
          const radios = await page.locator('input[type="radio"]').count();

          serviceResults.inputs = {
            text: textInputs,
            email: emailInputs,
            date: dateInputs,
            select: selects,
            textarea: textareas,
            checkbox: checkboxes,
            radio: radios,
            total: textInputs + emailInputs + dateInputs + selects + textareas + checkboxes + radios
          };

          console.log(`    Total inputs: ${serviceResults.inputs.total}`);
          console.log(`    Text: ${textInputs}, Email: ${emailInputs}, Date: ${dateInputs}`);
          console.log(`    Select: ${selects}, Textarea: ${textareas}, Checkbox: ${checkboxes}, Radio: ${radios}`);

          // Test form steps/sections
          console.log('  📊 Testing form steps...');
          
          const stepIndicators = await page.locator('[class*="step"], [class*="Step"], .progress, [role="progressbar"]').count();
          const sections = await page.locator('section, [class*="section"], [class*="Section"]').count();
          const fieldsets = await page.locator('fieldset').count();

          serviceResults.steps = {
            indicators: stepIndicators,
            sections,
            fieldsets
          };

          console.log(`    Step indicators: ${stepIndicators}`);
          console.log(`    Sections: ${sections}`);
          console.log(`    Fieldsets: ${fieldsets}`);

          // Test specific form interactions
          if (service.key === 'voos') {
            console.log('  ✈️ Testing flight-specific features...');
            
            // Test airport autocomplete
            const airportInputs = await page.locator('[placeholder*="origem"], [placeholder*="destino"], input[class*="airport"]').count();
            serviceResults.flightSpecific = {
              airportInputs,
              hasAutocomplete: airportInputs > 0
            };
            
            console.log(`    Airport inputs: ${airportInputs}`);

            // Try to interact with origin field
            try {
              const originInput = page.locator('[placeholder*="origem"], input').first();
              if (await originInput.count() > 0) {
                await originInput.fill('São');
                await page.waitForTimeout(1000);
                
                const suggestions = await page.locator('[class*="suggestion"], [class*="dropdown"], li').count();
                serviceResults.flightSpecific.autocompleteWorking = suggestions > 0;
                console.log(`    Autocomplete suggestions: ${suggestions}`);
              }
            } catch (e) {
              console.log(`    Autocomplete test: ${e.message}`);
            }
          }

          // Test form validation
          console.log('  ✅ Testing validation...');
          
          try {
            // Try to submit empty form
            const submitButton = page.locator('button:has-text("Enviar"), button[type="submit"]').first();
            if (await submitButton.count() > 0) {
              await submitButton.click();
              await page.waitForTimeout(1000);
              
              const errorMessages = await page.locator('[class*="error"], [class*="invalid"], [role="alert"], .text-red').count();
              const requiredFields = await page.locator('[required], [aria-required="true"]').count();
              
              serviceResults.validation = {
                errorMessages,
                requiredFields,
                hasValidation: errorMessages > 0 || requiredFields > 0
              };
              
              console.log(`    Error messages: ${errorMessages}`);
              console.log(`    Required fields: ${requiredFields}`);
              console.log(`    Has validation: ${serviceResults.validation.hasValidation}`);
            }
          } catch (e) {
            console.log(`    Validation test: ${e.message}`);
          }

          // Test back navigation
          console.log('  ⬅️ Testing back navigation...');
          
          try {
            const backButton = page.locator('button:has-text("Voltar")').first();
            if (await backButton.count() > 0) {
              await backButton.click();
              await page.waitForTimeout(1500);
              
              // Check if we're back to home
              const homeElements = await page.locator('button:has-text("Voos"), [class*="home"], h1').count();
              serviceResults.navigation.backWorking = homeElements > 0;
              
              console.log(`    Back navigation working: ${serviceResults.navigation.backWorking}`);
            }
          } catch (e) {
            console.log(`    Back navigation test: ${e.message}`);
          }
        }

        results.services[service.key] = serviceResults;

      } catch (error) {
        console.log(`  ❌ Error testing ${service.label}: ${error.message}`);
        results.services[service.key] = { error: error.message };
      }
    }

    // Test MobileLeadCaptureCorrect integration
    console.log('\n🔗 Testing MobileLeadCaptureCorrect Integration...');
    
    try {
      await page.goto('http://localhost:3000');
      await page.waitForTimeout(1500);

      // Test main CTA
      const ctaButton = page.locator('button:has-text("Buscar Ofertas"), button:has-text("Grátis")').first();
      if (await ctaButton.count() > 0) {
        await ctaButton.click();
        await page.waitForTimeout(2000);
        
        const leadFormOpened = await page.locator('.mobile-lead-capture, [class*="MobileLeadCapture"]').count() > 0;
        results.integration.mainCTA = leadFormOpened;
        
        console.log(`  Main CTA integration: ${leadFormOpened ? 'Working' : 'Issues detected'}`);
      }

      // Test tab navigation
      const tabs = ['search', 'favorites', 'profile'];
      for (const tab of tabs) {
        try {
          const tabButton = page.locator(`button:has-text("Explorar"), button:has-text("Favoritos"), button:has-text("Perfil")`).nth(tabs.indexOf(tab));
          if (await tabButton.count() > 0) {
            await tabButton.click();
            await page.waitForTimeout(1000);
            
            const offerButton = page.locator('button:has-text("Buscar"), button:has-text("Ofertas")').first();
            if (await offerButton.count() > 0) {
              await offerButton.click();
              await page.waitForTimeout(1500);
              
              const formOpened = await page.locator('.mobile-lead-capture, [class*="form"]').count() > 0;
              results.integration[`${tab}Tab`] = formOpened;
              
              console.log(`  ${tab} tab integration: ${formOpened ? 'Working' : 'Issues detected'}`);
            }
          }
        } catch (e) {
          console.log(`  ${tab} tab test error: ${e.message}`);
        }
      }

    } catch (error) {
      console.log(`  Integration test error: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Generate detailed report
  console.log('\n📊 DETAILED MOBILE FORM TEST REPORT');
  console.log('='.repeat(60));

  Object.entries(results.services).forEach(([service, result]) => {
    console.log(`\n🔸 ${service.toUpperCase()} SERVICE:`);
    
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}`);
      return;
    }

    console.log(`  Form Opened: ${result.formOpened ? '✅' : '❌'}`);
    
    if (result.navigation) {
      console.log(`  Navigation: Back(${result.navigation.backButtons}) Next(${result.navigation.nextButtons}) Submit(${result.navigation.submitButtons})`);
      if (result.navigation.backWorking !== undefined) {
        console.log(`  Back Navigation: ${result.navigation.backWorking ? '✅' : '❌'}`);
      }
    }
    
    if (result.inputs && result.inputs.total > 0) {
      console.log(`  Total Inputs: ${result.inputs.total}`);
      console.log(`  Input Types: Text(${result.inputs.text}) Email(${result.inputs.email}) Date(${result.inputs.date}) Select(${result.inputs.select})`);
    }
    
    if (result.validation) {
      console.log(`  Validation: ${result.validation.hasValidation ? '✅' : '⚠️'} (${result.validation.errorMessages} errors, ${result.validation.requiredFields} required)`);
    }
    
    if (result.steps) {
      console.log(`  Steps/Structure: Indicators(${result.steps.indicators}) Sections(${result.steps.sections}) Fieldsets(${result.steps.fieldsets})`);
    }

    if (result.flightSpecific) {
      console.log(`  Flight Features: Airport inputs(${result.flightSpecific.airportInputs}) Autocomplete(${result.flightSpecific.autocompleteWorking ? '✅' : '⚠️'})`);
    }
  });

  console.log('\n🔗 INTEGRATION RESULTS:');
  Object.entries(results.integration).forEach(([test, result]) => {
    console.log(`  ${test}: ${result ? '✅' : '⚠️'}`);
  });

  // Summary
  const workingServices = Object.values(results.services).filter(s => !s.error && s.formOpened).length;
  const totalServices = Object.keys(results.services).length;
  const integrationTests = Object.values(results.integration).filter(Boolean).length;
  const totalIntegrationTests = Object.keys(results.integration).length;

  console.log(`\n📈 SUMMARY:`);
  console.log(`  Service Forms: ${workingServices}/${totalServices} working`);
  console.log(`  Integration Tests: ${integrationTests}/${totalIntegrationTests} passing`);
  
  if (workingServices === totalServices && integrationTests >= totalIntegrationTests * 0.8) {
    console.log('  🎉 Overall Status: EXCELLENT - All systems working');
  } else if (workingServices >= totalServices * 0.8) {
    console.log('  ✅ Overall Status: GOOD - Minor issues detected');
  } else {
    console.log('  ⚠️ Overall Status: NEEDS ATTENTION - Several issues found');
  }

  console.log('\n='.repeat(60));

  return results;
}

runDetailedFormTest().catch(console.error);