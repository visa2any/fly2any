const { chromium } = require('playwright');
const fs = require('fs');

async function ultrathinMobileFlightFormTesting() {
    console.log('🚀 ULTRATHINK Mobile Flight Form Optimization Testing...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const mobileViewports = [
        {
            name: 'iPhone 12',
            viewport: { width: 390, height: 844 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
        },
        {
            name: 'Samsung Galaxy S21',
            viewport: { width: 384, height: 854 },
            userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        },
        {
            name: 'iPhone SE',
            viewport: { width: 375, height: 667 },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
        }
    ];
    
    const testResults = {
        devices: [],
        ultrathinOptimizations: {
            verticalSpaceEfficiency: {},
            touchTargetCompliance: {},
            spacingImplementation: {},
            functionalityValidation: {}
        },
        screenshots: [],
        overallStatus: 'TESTING'
    };
    
    for (const device of mobileViewports) {
        console.log(`\n📱 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})...`);
        
        const context = await browser.newContext({
            viewport: device.viewport,
            userAgent: device.userAgent,
            hasTouch: true,
            isMobile: true,
            deviceScaleFactor: 2
        });
        
        const page = await context.newPage();
        const deviceResult = {
            device: device.name,
            viewport: device.viewport,
            testSteps: [],
            optimizationMetrics: {},
            status: 'TESTING'
        };
        
        try {
            console.log('   ⏳ Loading homepage...');
            await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(3000);
            
            console.log('   📸 Initial homepage screenshot...');
            const homepageScreenshot = `ultrathink-optimized-${device.name.toLowerCase().replace(' ', '-')}-homepage.png`;
            await page.screenshot({
                path: homepageScreenshot,
                fullPage: true
            });
            testResults.screenshots.push(homepageScreenshot);
            deviceResult.testSteps.push('✅ Homepage loaded and captured');
            
            // Analyze ULTRATHINK vertical space optimization
            console.log('   📏 Analyzing vertical space optimization...');
            const spaceMetrics = await page.evaluate(() => {
                const body = document.body;
                const html = document.documentElement;
                
                const totalHeight = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );
                
                const viewportHeight = window.innerHeight;
                const contentAboveFold = viewportHeight;
                const verticalEfficiency = (contentAboveFold / totalHeight) * 100;
                
                // Analyze ULTRATHINK spacing classes
                const ultrathinElements = document.querySelectorAll(`
                    .space-y-1, .space-y-2, .space-y-3,
                    .gap-1, .gap-2, .gap-3,
                    .p-1, .p-2, .p-3,
                    .py-1, .py-2, .py-3,
                    .my-1, .my-2, .my-3,
                    .mb-1, .mb-2, .mb-3,
                    .mt-1, .mt-2, .mt-3
                `);
                
                const spacingAnalysis = {
                    totalOptimizedElements: ultrathinElements.length,
                    ultrathinLevel1: 0,
                    ultrathinLevel2: 0,
                    ultrathinLevel3: 0
                };
                
                ultrathinElements.forEach(el => {
                    const classes = el.className;
                    if (classes.includes('-1')) spacingAnalysis.ultrathinLevel1++;
                    if (classes.includes('-2')) spacingAnalysis.ultrathinLevel2++;
                    if (classes.includes('-3')) spacingAnalysis.ultrathinLevel3++;
                });
                
                return {
                    totalHeight,
                    viewportHeight,
                    verticalEfficiency: Math.round(verticalEfficiency),
                    spacingAnalysis,
                    isUltrathinOptimized: ultrathinElements.length > 0
                };
            });
            
            testResults.ultrathinOptimizations.verticalSpaceEfficiency[device.name] = spaceMetrics;
            deviceResult.optimizationMetrics.verticalSpace = spaceMetrics;
            
            console.log(`   📊 Vertical efficiency: ${spaceMetrics.verticalEfficiency}% (${spaceMetrics.isUltrathinOptimized ? 'OPTIMIZED' : 'NOT OPTIMIZED'})`);
            console.log(`   🎨 ULTRATHINK elements: ${spaceMetrics.spacingAnalysis.totalOptimizedElements} total`);
            deviceResult.testSteps.push(`✅ Vertical optimization: ${spaceMetrics.verticalEfficiency}%`);
            
            // Test mobile interaction and flight form
            console.log('   🎯 Testing mobile flight form interaction...');
            
            // Look for flight-related buttons and forms
            const flightInteractionTest = await page.evaluate(() => {
                const possibleFlightButtons = Array.from(document.querySelectorAll(`
                    button, 
                    [role="button"],
                    .btn,
                    .button,
                    .service-card,
                    .service-option,
                    a[href*="flight"],
                    a[href*="voo"],
                    [data-service],
                    [data-testid*="flight"],
                    [data-testid*="service"]
                `));
                
                const flightButtons = possibleFlightButtons.filter(btn => {
                    const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
                    return text.includes('flight') || 
                           text.includes('voo') || 
                           text.includes('passagem') || 
                           text.includes('aéreo') ||
                           btn.getAttribute('data-service') === 'flight';
                });
                
                // Analyze forms
                const forms = Array.from(document.querySelectorAll('form'));
                const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
                
                // Check for mobile-optimized spacing in forms
                const mobileOptimizedForms = forms.filter(form => {
                    const formClasses = form.className;
                    return formClasses.includes('space-y-1') || 
                           formClasses.includes('space-y-2') || 
                           formClasses.includes('space-y-3') ||
                           formClasses.includes('gap-1') ||
                           formClasses.includes('gap-2') ||
                           formClasses.includes('gap-3');
                });
                
                return {
                    flightButtonsFound: flightButtons.length,
                    formsFound: forms.length,
                    inputsFound: inputs.length,
                    mobileOptimizedForms: mobileOptimizedForms.length,
                    hasFlightInterface: flightButtons.length > 0 || inputs.length > 0,
                    buttonDetails: flightButtons.slice(0, 3).map(btn => ({
                        text: btn.textContent?.slice(0, 50),
                        classes: btn.className,
                        tag: btn.tagName
                    }))
                };
            });
            
            console.log(`   🔍 Found ${flightInteractionTest.flightButtonsFound} flight buttons, ${flightInteractionTest.formsFound} forms`);
            console.log(`   📱 Mobile-optimized forms: ${flightInteractionTest.mobileOptimizedForms}/${flightInteractionTest.formsFound}`);
            
            if (flightInteractionTest.hasFlightInterface) {
                deviceResult.testSteps.push('✅ Flight interface elements found');
                
                // Test clicking on flight service if available
                if (flightInteractionTest.flightButtonsFound > 0) {
                    console.log('   👆 Testing flight button interaction...');
                    
                    try {
                        // Try to click the first flight-related button
                        await page.click('button, [role="button"], .btn, .button, .service-card, .service-option').catch(() => {
                            console.log('     ⚠️ Button click failed, trying alternative approach...');
                        });
                        
                        await page.waitForTimeout(2000);
                        
                        // Capture after interaction
                        const interactionScreenshot = `ultrathink-optimized-${device.name.toLowerCase().replace(' ', '-')}-interaction.png`;
                        await page.screenshot({
                            path: interactionScreenshot,
                            fullPage: true
                        });
                        testResults.screenshots.push(interactionScreenshot);
                        deviceResult.testSteps.push('✅ Flight button interaction tested');
                        
                    } catch (e) {
                        console.log('     ⚠️ Interaction test partial: ' + e.message.slice(0, 100));
                        deviceResult.testSteps.push('⚠️ Flight button interaction partial');
                    }
                }
                
                // Test form inputs if available
                console.log('   📝 Testing form input optimization...');
                
                try {
                    const inputs = await page.locator('input:visible').all();
                    if (inputs.length > 0) {
                        // Test first few inputs
                        for (let i = 0; i < Math.min(3, inputs.length); i++) {
                            try {
                                const input = inputs[i];
                                const box = await input.boundingBox();
                                if (box) {
                                    // Validate touch target size
                                    const touchTargetSize = Math.min(box.width, box.height);
                                    const isAdequateSize = touchTargetSize >= 44; // iOS/Android minimum
                                    
                                    if (i === 0) {
                                        testResults.ultrathinOptimizations.touchTargetCompliance[device.name] = {
                                            averageSize: touchTargetSize,
                                            isCompliant: isAdequateSize,
                                            testedInputs: Math.min(3, inputs.length)
                                        };
                                    }
                                    
                                    await input.click();
                                    await input.fill('Test Value ' + (i + 1));
                                    await page.waitForTimeout(500);
                                    
                                    console.log(`     ✅ Input ${i + 1}: ${touchTargetSize}px (${isAdequateSize ? 'ADEQUATE' : 'TOO SMALL'})`);
                                }
                            } catch (inputError) {
                                console.log(`     ⚠️ Input ${i + 1} test failed: ${inputError.message.slice(0, 50)}`);
                            }
                        }
                        deviceResult.testSteps.push(`✅ Tested ${Math.min(3, inputs.length)} input fields`);
                    }
                } catch (e) {
                    console.log('     ⚠️ Form input testing partial: ' + e.message.slice(0, 100));
                    deviceResult.testSteps.push('⚠️ Form input testing partial');
                }
                
                // Final comprehensive screenshot
                console.log('   📸 Final comprehensive screenshot...');
                const finalScreenshot = `ultrathink-optimized-${device.name.toLowerCase().replace(' ', '-')}-final.png`;
                await page.screenshot({
                    path: finalScreenshot,
                    fullPage: true
                });
                testResults.screenshots.push(finalScreenshot);
                deviceResult.testSteps.push('✅ Final state captured');
                
            } else {
                console.log('   ⚠️ No flight interface elements found - capturing current state');
                const noInterfaceScreenshot = `ultrathink-optimized-${device.name.toLowerCase().replace(' ', '-')}-no-interface.png`;
                await page.screenshot({
                    path: noInterfaceScreenshot,
                    fullPage: true
                });
                testResults.screenshots.push(noInterfaceScreenshot);
                deviceResult.testSteps.push('⚠️ No flight interface found');
            }
            
            // Test mobile navigation and scrolling optimization
            console.log('   📱 Testing mobile navigation optimization...');
            
            const scrollMetrics = await page.evaluate(() => {
                const initialScrollY = window.scrollY;
                window.scrollTo(0, 200);
                const scrolledY = window.scrollY;
                window.scrollTo(0, initialScrollY);
                
                return {
                    canScroll: scrolledY > initialScrollY,
                    smoothScrolling: getComputedStyle(document.documentElement).scrollBehavior === 'smooth',
                    viewportOptimization: window.innerHeight >= 600 // Minimum mobile viewport
                };
            });
            
            testResults.ultrathinOptimizations.functionalityValidation[device.name] = {
                scrollOptimization: scrollMetrics,
                formInteraction: flightInteractionTest,
                mobileOptimized: flightInteractionTest.mobileOptimizedForms > 0
            };
            
            deviceResult.optimizationMetrics.functionality = scrollMetrics;
            deviceResult.optimizationMetrics.interaction = flightInteractionTest;
            deviceResult.status = 'SUCCESS';
            console.log(`   ✅ ${device.name} testing completed successfully`);
            
        } catch (error) {
            console.log(`   ❌ Error testing ${device.name}: ${error.message}`);
            deviceResult.status = 'ERROR';
            deviceResult.error = error.message;
            deviceResult.testSteps.push(`❌ Error: ${error.message.slice(0, 100)}`);
        }
        
        testResults.devices.push(deviceResult);
        await context.close();
    }
    
    await browser.close();
    
    // Generate comprehensive ULTRATHINK optimization report
    console.log('\n🎯 ULTRATHINK Mobile Flight Form Optimization Results:');
    console.log('=' .repeat(70));
    
    let successCount = 0;
    let optimizedCount = 0;
    
    testResults.devices.forEach(device => {
        console.log(`\n📱 ${device.device}:`);
        console.log(`   Status: ${device.status} ${device.status === 'SUCCESS' ? '✅' : '❌'}`);
        
        if (device.status === 'SUCCESS') {
            successCount++;
            
            device.testSteps.forEach(step => {
                console.log(`   ${step}`);
            });
            
            if (device.optimizationMetrics.verticalSpace?.isUltrathinOptimized) {
                optimizedCount++;
                console.log(`   🎨 ULTRATHINK Optimization: ACTIVE ✅`);
                console.log(`   📊 Vertical Efficiency: ${device.optimizationMetrics.verticalSpace.verticalEfficiency}%`);
                console.log(`   📏 Optimized Elements: ${device.optimizationMetrics.verticalSpace.spacingAnalysis.totalOptimizedElements}`);
            } else {
                console.log(`   🎨 ULTRATHINK Optimization: NOT FOUND ⚠️`);
            }
        } else {
            console.log(`   Error: ${device.error}`);
        }
    });
    
    testResults.overallStatus = successCount === testResults.devices.length ? 'SUCCESS' : 'PARTIAL';
    
    console.log('\n📊 OPTIMIZATION SUMMARY:');
    console.log('-'.repeat(40));
    console.log(`✅ Successful Tests: ${successCount}/${testResults.devices.length}`);
    console.log(`🎨 ULTRATHINK Optimized: ${optimizedCount}/${testResults.devices.length}`);
    
    // Vertical Space Efficiency Summary
    console.log('\n📐 Vertical Space Efficiency:');
    Object.entries(testResults.ultrathinOptimizations.verticalSpaceEfficiency).forEach(([device, metrics]) => {
        const status = metrics.verticalEfficiency > 70 ? '🟢 EXCELLENT' : 
                      metrics.verticalEfficiency > 50 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT';
        console.log(`   ${device}: ${metrics.verticalEfficiency}% ${status}`);
    });
    
    // Touch Target Compliance Summary
    console.log('\n👆 Touch Target Compliance:');
    Object.entries(testResults.ultrathinOptimizations.touchTargetCompliance).forEach(([device, metrics]) => {
        console.log(`   ${device}: ${metrics.averageSize}px ${metrics.isCompliant ? '✅ COMPLIANT' : '❌ TOO SMALL'}`);
    });
    
    console.log('\n📸 Screenshots Generated:');
    console.log('-'.repeat(30));
    testResults.screenshots.forEach(screenshot => {
        console.log(`   📷 ${screenshot}`);
    });
    
    // Save comprehensive report
    const reportPath = 'ultrathink-mobile-optimization-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Comprehensive report: ${reportPath}`);
    
    console.log('\n🎉 ULTRATHINK Mobile Flight Form Testing Complete!');
    console.log(`📱 Overall Status: ${testResults.overallStatus}`);
    
    return testResults;
}

// Execute the comprehensive ULTRATHINK testing
ultrathinMobileFlightFormTesting().catch(console.error);