const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runComprehensiveWebpackTest() {
    console.log('🚀 PLAYWRIGHT WEBPACK CHUNK LOADING TEST - COMPREHENSIVE');
    console.log('======================================================');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        devtools: true
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
    });
    
    const page = await context.newPage();
    
    // Array to collect all console messages
    const consoleMessages = [];
    const errors = [];
    const warnings = [];
    
    // Listen for all console events
    page.on('console', msg => {
        const message = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
        };
        
        consoleMessages.push(message);
        
        console.log(`[${message.type.toUpperCase()}] ${message.text}`);
        
        if (msg.type() === 'error') {
            errors.push(message);
        } else if (msg.type() === 'warning') {
            warnings.push(message);
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        const errorMessage = {
            type: 'pageerror',
            text: error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
        errors.push(errorMessage);
        console.log(`[PAGE ERROR] ${error.toString()}`);
    });
    
    try {
        console.log('\n📍 Step 1: Navigating to homepage...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded, waiting for React hydration...');
        await page.waitForTimeout(5000); // Wait for hydration
        
        // Take homepage screenshot
        await page.screenshot({ 
            path: 'webpack-test-1-homepage.png',
            fullPage: true
        });
        console.log('📸 Homepage screenshot taken');
        
        console.log('\n📍 Step 2: Testing navigation to trigger chunk loading...');
        
        // Test navigation to different pages to trigger dynamic imports
        const routes = ['/voos', '/hotel', '/carro', '/tour', '/seguro'];
        
        for (const route of routes) {
            console.log(`\n🔄 Testing route: ${route}`);
            try {
                await page.goto(`http://localhost:3000${route}`, { 
                    waitUntil: 'networkidle',
                    timeout: 15000 
                });
                await page.waitForTimeout(3000); // Wait for chunk loading
                
                // Take screenshot of the page
                const routeName = route.replace('/', '');
                await page.screenshot({ 
                    path: `webpack-test-${routeName}-page.png`,
                    fullPage: true
                });
                console.log(`📸 Screenshot taken for ${route}`);
                
            } catch (error) {
                console.log(`⚠️ Route ${route} may not exist or failed to load: ${error.message}`);
            }
        }
        
        console.log('\n📍 Step 3: Going back to homepage for phone input test...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        await page.waitForTimeout(3000);
        
        console.log('\n📍 Step 4: Testing phone input component...');
        
        // Look for phone input fields
        const phoneInputSelectors = [
            'input[type="tel"]',
            'input[placeholder*="phone"]',
            'input[placeholder*="telefone"]',
            'input[name*="phone"]',
            'input[name*="telefone"]',
            '.phone-input input',
            '[data-testid*="phone"] input',
            '.react-tel-input input'
        ];
        
        let phoneInputFound = false;
        let phoneInputSelector = null;
        
        for (const selector of phoneInputSelectors) {
            try {
                const element = await page.locator(selector).first();
                if (await element.isVisible()) {
                    phoneInputFound = true;
                    phoneInputSelector = selector;
                    console.log(`✅ Phone input found: ${selector}`);
                    break;
                }
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (phoneInputFound) {
            console.log(`\n🔄 Testing phone input interaction with selector: ${phoneInputSelector}`);
            
            // Click on the phone input
            await page.locator(phoneInputSelector).first().click();
            await page.waitForTimeout(2000);
            
            // Look for country selector dropdown
            const dropdownSelectors = [
                '.country-list',
                '.flag-dropdown',
                '.country-dropdown',
                '.react-tel-input .flag-dropdown',
                '[class*="country"]',
                '[class*="flag"]',
                '.dropdown-menu',
                '.phone-dropdown'
            ];
            
            let dropdownFound = false;
            for (const dropSelector of dropdownSelectors) {
                try {
                    const dropdown = await page.locator(dropSelector).first();
                    if (await dropdown.isVisible()) {
                        console.log(`✅ Country dropdown found and visible: ${dropSelector}`);
                        dropdownFound = true;
                        break;
                    }
                } catch (error) {
                    // Continue to next selector
                }
            }
            
            if (!dropdownFound) {
                console.log('⚠️ Country dropdown not visible, trying to click flag...');
                
                const flagSelectors = [
                    '.selected-flag',
                    '.flag',
                    '.country-flag',
                    '.react-tel-input .selected-flag'
                ];
                
                for (const flagSelector of flagSelectors) {
                    try {
                        const flag = await page.locator(flagSelector).first();
                        if (await flag.isVisible()) {
                            console.log(`🔄 Clicking flag: ${flagSelector}`);
                            await flag.click();
                            await page.waitForTimeout(2000);
                            
                            // Check if dropdown appeared after clicking flag
                            for (const dropSelector of dropdownSelectors) {
                                try {
                                    const dropdown = await page.locator(dropSelector).first();
                                    if (await dropdown.isVisible()) {
                                        console.log(`✅ Country dropdown appeared after flag click: ${dropSelector}`);
                                        dropdownFound = true;
                                        break;
                                    }
                                } catch (error) {
                                    // Continue
                                }
                            }
                            break;
                        }
                    } catch (error) {
                        // Continue to next flag selector
                    }
                }
            }
            
            // Take screenshot of phone input state
            await page.screenshot({ 
                path: 'webpack-test-phone-input.png',
                fullPage: true
            });
            console.log('📸 Phone input test screenshot taken');
            
            if (dropdownFound) {
                console.log('✅ Phone input dropdown functionality working correctly');
            } else {
                console.log('❌ Phone input dropdown not found or not working');
            }
            
        } else {
            console.log('⚠️ No phone input field found on the page');
        }
        
        console.log('\n📍 Step 5: Testing mobile viewport...');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Take mobile screenshot
        await page.screenshot({ 
            path: 'webpack-test-mobile-view.png',
            fullPage: true
        });
        console.log('📸 Mobile view screenshot taken');
        
        // Test phone input on mobile if found
        if (phoneInputFound) {
            console.log('\n🔄 Testing phone input on mobile...');
            await page.locator(phoneInputSelector).first().click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: 'webpack-test-mobile-phone-input.png',
                fullPage: true
            });
            console.log('📸 Mobile phone input screenshot taken');
        }
        
        console.log('\n📍 Step 6: Final console analysis...');
        
        // Analysis of console messages
        const webpackErrors = consoleMessages.filter(msg => 
            msg.text.includes('__webpack_require__') || 
            msg.text.includes('chunk loading') ||
            msg.text.includes('Loading chunk') ||
            msg.text.includes('ChunkLoadError') ||
            msg.text.includes('.f.j')
        );
        
        const hydrationErrors = consoleMessages.filter(msg =>
            msg.text.includes('hydration') ||
            msg.text.includes('Hydration') ||
            msg.text.includes('server-side') ||
            msg.text.includes('client-side')
        );
        
        console.log('\n🔍 WEBPACK CHUNK LOADING ERROR ANALYSIS:');
        console.log('==========================================');
        if (webpackErrors.length > 0) {
            console.log(`❌ Found ${webpackErrors.length} webpack-related errors:`);
            webpackErrors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.text}`);
            });
        } else {
            console.log('✅ No webpack chunk loading errors found!');
        }
        
        console.log('\n🔍 HYDRATION ERROR ANALYSIS:');
        console.log('=============================');
        if (hydrationErrors.length > 0) {
            console.log(`❌ Found ${hydrationErrors.length} hydration-related errors:`);
            hydrationErrors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.text}`);
            });
        } else {
            console.log('✅ No hydration errors found!');
        }
        
        console.log('\n📊 OVERALL CONSOLE SUMMARY:');
        console.log('============================');
        console.log(`Total console messages: ${consoleMessages.length}`);
        console.log(`Errors: ${errors.length}`);
        console.log(`Warnings: ${warnings.length}`);
        console.log(`Info/Log messages: ${consoleMessages.length - errors.length - warnings.length}`);
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalMessages: consoleMessages.length,
                errors: errors.length,
                warnings: warnings.length,
                webpackErrors: webpackErrors.length,
                hydrationErrors: hydrationErrors.length,
                phoneInputFound: phoneInputFound,
                phoneInputWorking: phoneInputFound && dropdownFound
            },
            webpackErrors: webpackErrors,
            hydrationErrors: hydrationErrors,
            allErrors: errors,
            allWarnings: warnings,
            allMessages: consoleMessages
        };
        
        fs.writeFileSync('webpack-console-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📝 Detailed report saved to webpack-console-test-report.json');
        
        console.log('\n🎯 TEST RESULTS:');
        console.log('================');
        if (webpackErrors.length === 0) {
            console.log('✅ WEBPACK CHUNK LOADING: All optimizations working correctly!');
        } else {
            console.log('❌ WEBPACK CHUNK LOADING: Issues detected - see details above');
        }
        
        if (phoneInputFound) {
            if (dropdownFound) {
                console.log('✅ PHONE INPUT: Component working correctly');
            } else {
                console.log('⚠️ PHONE INPUT: Found but dropdown functionality needs attention');
            }
        } else {
            console.log('ℹ️ PHONE INPUT: No phone input component found on homepage');
        }
        
        if (errors.length === 0) {
            console.log('✅ OVERALL: No JavaScript errors detected!');
        } else {
            console.log(`❌ OVERALL: ${errors.length} JavaScript errors need attention`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
        console.log('\n🏁 Test completed!');
    }
}

// Run the test
runComprehensiveWebpackTest().catch(console.error);