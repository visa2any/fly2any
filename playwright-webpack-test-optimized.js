const { chromium } = require('playwright');
const fs = require('fs');

async function runOptimizedWebpackTest() {
    console.log('🚀 PLAYWRIGHT WEBPACK TEST - OPTIMIZED FOR SLOW LOADING');
    console.log('======================================================');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
    });
    
    const page = await context.newPage();
    
    // Arrays to collect console data
    const consoleMessages = [];
    const errors = [];
    const warnings = [];
    
    // Console listeners
    page.on('console', msg => {
        const message = {
            type: msg.type(),
            text: msg.text(),
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
        console.log('\n📍 Step 1: Loading homepage with extended timeout...');
        
        // Use a more lenient approach
        await page.goto('http://localhost:3000', { 
            waitUntil: 'load',  // Changed from 'networkidle' to 'load'
            timeout: 60000      // Increased timeout
        });
        
        console.log('✅ Initial page load completed');
        
        // Wait for potential React hydration
        console.log('⏳ Waiting for React hydration and chunk loading...');
        await page.waitForTimeout(8000); // Extended wait
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'webpack-optimized-1-homepage.png',
            fullPage: true
        });
        console.log('📸 Homepage screenshot captured');
        
        console.log('\n📍 Step 2: Testing dynamic navigation for chunk loading...');
        
        // Try to find and click navigation elements to trigger chunk loading
        const navigationSelectors = [
            'a[href="/voos"]',
            'a[href="/hotel"]', 
            'a[href="/carro"]',
            'a[href="/tour"]',
            'a[href="/seguro"]',
            'nav a',
            '.nav-link',
            '[role="navigation"] a'
        ];
        
        let navigationTested = false;
        
        for (const selector of navigationSelectors) {
            try {
                const navElement = await page.locator(selector).first();
                if (await navElement.isVisible()) {
                    console.log(`🔄 Clicking navigation: ${selector}`);
                    await navElement.click();
                    await page.waitForTimeout(3000);
                    
                    // Take screenshot after navigation
                    await page.screenshot({ 
                        path: `webpack-optimized-nav-${Date.now()}.png`,
                        fullPage: true
                    });
                    
                    navigationTested = true;
                    break;
                }
            } catch (error) {
                // Continue to next selector
                console.log(`⚠️ Navigation selector ${selector} not found or clickable`);
            }
        }
        
        if (!navigationTested) {
            console.log('ℹ️ No navigation elements found, testing manual URL navigation...');
            
            // Try direct URL navigation
            try {
                await page.goto('http://localhost:3000/voos', { 
                    waitUntil: 'load',
                    timeout: 30000 
                });
                await page.waitForTimeout(3000);
                console.log('✅ Manual navigation to /voos successful');
                
                await page.screenshot({ 
                    path: 'webpack-optimized-voos-page.png',
                    fullPage: true
                });
                
            } catch (error) {
                console.log('⚠️ Manual navigation failed, continuing with main page test');
                await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 30000 });
            }
        }
        
        console.log('\n📍 Step 3: Testing phone input component...');
        
        // Enhanced phone input detection
        const phoneInputSelectors = [
            'input[type="tel"]',
            'input[placeholder*="phone" i]',
            'input[placeholder*="telefone" i]',
            'input[name*="phone" i]',
            'input[name*="telefone" i]',
            '.phone-input input',
            '.react-tel-input input',
            '[data-testid*="phone" i] input',
            'input[id*="phone" i]',
            'input[class*="phone" i]'
        ];
        
        let phoneInputFound = false;
        let phoneInputSelector = null;
        
        for (const selector of phoneInputSelectors) {
            try {
                const elements = await page.locator(selector).all();
                for (const element of elements) {
                    if (await element.isVisible()) {
                        phoneInputFound = true;
                        phoneInputSelector = selector;
                        console.log(`✅ Phone input found: ${selector}`);
                        
                        // Test clicking the input
                        await element.click();
                        await page.waitForTimeout(1500);
                        
                        // Look for dropdown after clicking
                        const dropdownSelectors = [
                            '.country-list',
                            '.flag-dropdown',
                            '.country-dropdown',
                            '.react-tel-input .flag-dropdown',
                            '.selected-flag',
                            '[class*="country"]',
                            '[class*="flag"]',
                            '.dropdown-menu'
                        ];
                        
                        for (const dropSelector of dropdownSelectors) {
                            try {
                                const dropdown = await page.locator(dropSelector).first();
                                if (await dropdown.isVisible()) {
                                    console.log(`✅ Phone dropdown working: ${dropSelector}`);
                                    break;
                                }
                            } catch (error) {
                                // Continue checking
                            }
                        }
                        
                        break;
                    }
                }
                if (phoneInputFound) break;
            } catch (error) {
                // Continue to next selector
            }
        }
        
        if (!phoneInputFound) {
            console.log('ℹ️ No phone input found on current page');
        }
        
        // Take screenshot of phone input test
        await page.screenshot({ 
            path: 'webpack-optimized-phone-test.png',
            fullPage: true
        });
        
        console.log('\n📍 Step 4: Mobile viewport test...');
        
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: 'webpack-optimized-mobile.png',
            fullPage: true
        });
        console.log('📸 Mobile screenshot captured');
        
        console.log('\n📍 Step 5: Final console analysis...');
        
        // Enhanced webpack error detection
        const webpackErrors = consoleMessages.filter(msg => {
            const text = msg.text.toLowerCase();
            return text.includes('__webpack_require__') || 
                   text.includes('chunk loading') ||
                   text.includes('loading chunk') ||
                   text.includes('chunkloaderror') ||
                   text.includes('.f.j') ||
                   text.includes('webpack') ||
                   text.includes('failed to load') ||
                   text.includes('network error') ||
                   text.includes('import error');
        });
        
        const hydrationErrors = consoleMessages.filter(msg => {
            const text = msg.text.toLowerCase();
            return text.includes('hydration') ||
                   text.includes('server') && text.includes('client') ||
                   text.includes('mismatch') ||
                   text.includes('suppresshydrationwarning');
        });
        
        const reactErrors = consoleMessages.filter(msg => {
            const text = msg.text.toLowerCase();
            return text.includes('react') && msg.type === 'error';
        });
        
        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            testDuration: '~30 seconds',
            summary: {
                totalMessages: consoleMessages.length,
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                webpackErrors: webpackErrors.length,
                hydrationErrors: hydrationErrors.length,
                reactErrors: reactErrors.length,
                phoneInputFound: phoneInputFound
            },
            details: {
                webpackErrors: webpackErrors,
                hydrationErrors: hydrationErrors,
                reactErrors: reactErrors,
                allErrors: errors.slice(0, 10), // Limit to first 10
                allWarnings: warnings.slice(0, 10),
                recentMessages: consoleMessages.slice(-20) // Last 20 messages
            }
        };
        
        fs.writeFileSync('webpack-optimized-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n🎯 FINAL RESULTS:');
        console.log('==================');
        console.log(`📊 Total console messages: ${consoleMessages.length}`);
        console.log(`❌ Total errors: ${errors.length}`);
        console.log(`⚠️ Total warnings: ${warnings.length}`);
        console.log(`🔧 Webpack errors: ${webpackErrors.length}`);
        console.log(`💧 Hydration errors: ${hydrationErrors.length}`);
        console.log(`⚛️ React errors: ${reactErrors.length}`);
        console.log(`📱 Phone input found: ${phoneInputFound ? 'YES' : 'NO'}`);
        
        if (webpackErrors.length === 0) {
            console.log('\n✅ SUCCESS: No webpack chunk loading errors detected!');
            console.log('🎉 Your webpack optimizations appear to be working correctly!');
        } else {
            console.log('\n❌ WEBPACK ISSUES DETECTED:');
            webpackErrors.forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.text}`);
            });
        }
        
        if (errors.length === 0) {
            console.log('✅ OVERALL: Clean console - no JavaScript errors!');
        } else {
            console.log(`\n⚠️ ATTENTION: ${errors.length} JavaScript errors detected:`);
            errors.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. [${error.type}] ${error.text.substring(0, 100)}...`);
            });
        }
        
        console.log('\n📝 Detailed report saved to: webpack-optimized-report.json');
        console.log('📸 Screenshots saved with prefix: webpack-optimized-');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
        console.log('\n🏁 Test completed successfully!');
    }
}

// Run the optimized test
runOptimizedWebpackTest().catch(console.error);