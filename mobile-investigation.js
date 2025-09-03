const { chromium } = require('playwright');

async function investigateMobileIssues() {
    const browser = await chromium.launch({ headless: false });
    
    // Test different mobile devices
    const devices = [
        'iPhone 12',
        'iPhone SE',
        'Samsung Galaxy S21',
        'iPad'
    ];
    
    const results = [];
    
    for (const deviceName of devices) {
        console.log(`\n🔍 Testing on ${deviceName}...`);
        
        const context = await browser.newContext({
            ...require('playwright').devices[deviceName],
            ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        
        try {
            // Navigate to the site
            console.log('📱 Navigating to fly2any.com...');
            const response = await page.goto('https://fly2any.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            console.log(`Response status: ${response.status()}`);
            
            // Take initial screenshot
            await page.screenshot({ 
                path: `/mnt/d/Users/vilma/fly2any/mobile-${deviceName.replace(/\s+/g, '-').toLowerCase()}-initial.png`,
                fullPage: true 
            });
            
            // Check for errors in console
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // Wait for page to fully load
            await page.waitForTimeout(3000);
            
            // Test key elements and interactions
            const testResults = {
                device: deviceName,
                url: page.url(),
                title: await page.title(),
                consoleErrors: consoleErrors,
                viewport: await page.viewportSize(),
                tests: {}
            };
            
            // Test 1: Check if main content is visible
            console.log('🔍 Testing main content visibility...');
            testResults.tests.mainContent = await page.locator('main, .main-content, [role="main"]').isVisible()
                .catch(() => false);
            
            // Test 2: Check navigation menu
            console.log('🔍 Testing navigation menu...');
            const navVisible = await page.locator('nav, .navigation, .menu').isVisible()
                .catch(() => false);
            testResults.tests.navigation = navVisible;
            
            // Test 3: Check for flight search form
            console.log('🔍 Testing flight search form...');
            const formVisible = await page.locator('form, .search-form, .flight-form').first().isVisible()
                .catch(() => false);
            testResults.tests.flightForm = formVisible;
            
            if (formVisible) {
                // Test form interactions
                try {
                    const fromInput = await page.locator('input[placeholder*="From"], input[name*="from"], input[id*="from"]').first();
                    if (await fromInput.isVisible()) {
                        await fromInput.click();
                        await fromInput.fill('New York');
                        testResults.tests.formInteraction = true;
                        
                        // Take screenshot of form interaction
                        await page.screenshot({ 
                            path: `/mnt/d/Users/vilma/fly2any/mobile-${deviceName.replace(/\s+/g, '-').toLowerCase()}-form.png`,
                            fullPage: true 
                        });
                    }
                } catch (error) {
                    testResults.tests.formInteraction = false;
                    testResults.tests.formError = error.message;
                }
            }
            
            // Test 4: Check responsive layout
            console.log('🔍 Testing responsive layout...');
            const bodyStyles = await page.evaluate(() => {
                const body = document.body;
                const computed = window.getComputedStyle(body);
                return {
                    width: body.scrollWidth,
                    height: body.scrollHeight,
                    overflow: computed.overflow,
                    overflowX: computed.overflowX
                };
            });
            testResults.tests.layout = bodyStyles;
            
            // Test 5: Check for horizontal scrolling issues
            const hasHorizontalScroll = bodyStyles.width > await page.viewportSize().width;
            testResults.tests.horizontalScroll = hasHorizontalScroll;
            
            // Test 6: Check touch interactions
            console.log('🔍 Testing touch interactions...');
            try {
                const clickableElements = await page.locator('button, a, .btn, [role="button"]').count();
                testResults.tests.clickableElements = clickableElements;
                
                // Test tap on first button/link
                if (clickableElements > 0) {
                    const firstButton = page.locator('button, a, .btn, [role="button"]').first();
                    const isClickable = await firstButton.isEnabled();
                    testResults.tests.firstButtonClickable = isClickable;
                }
            } catch (error) {
                testResults.tests.touchError = error.message;
            }
            
            // Test 7: Check for loading performance issues
            console.log('🔍 Testing loading performance...');
            const performanceTiming = await page.evaluate(() => {
                const timing = performance.timing;
                return {
                    loadTime: timing.loadEventEnd - timing.navigationStart,
                    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                    firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
                };
            });
            testResults.tests.performance = performanceTiming;
            
            // Test 8: Check for mobile-specific CSS
            console.log('🔍 Testing mobile CSS...');
            const mobileCSS = await page.evaluate(() => {
                const metaViewport = document.querySelector('meta[name="viewport"]');
                const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
                    try {
                        return Array.from(sheet.cssRules).some(rule => 
                            rule.type === CSSRule.MEDIA_RULE && 
                            rule.conditionText.includes('max-width')
                        );
                    } catch (e) {
                        return false;
                    }
                });
                
                return {
                    hasViewportMeta: !!metaViewport,
                    viewportContent: metaViewport?.getAttribute('content'),
                    hasMediaQueries: hasMediaQueries
                };
            });
            testResults.tests.mobileCSS = mobileCSS;
            
            // Check for specific error messages or broken elements
            console.log('🔍 Checking for error messages...');
            const errorElements = await page.locator('.error, .alert-error, [class*="error"], [id*="error"]').count();
            testResults.tests.errorElements = errorElements;
            
            if (errorElements > 0) {
                const errorTexts = await page.locator('.error, .alert-error, [class*="error"], [id*="error"]').allTextContents();
                testResults.tests.errorMessages = errorTexts;
            }
            
            // Final screenshot
            await page.screenshot({ 
                path: `/mnt/d/Users/vilma/fly2any/mobile-${deviceName.replace(/\s+/g, '-').toLowerCase()}-final.png`,
                fullPage: true 
            });
            
            results.push(testResults);
            
        } catch (error) {
            console.error(`Error testing ${deviceName}:`, error);
            results.push({
                device: deviceName,
                error: error.message,
                failed: true
            });
        }
        
        await context.close();
    }
    
    await browser.close();
    
    // Generate detailed report
    console.log('\n📊 MOBILE INVESTIGATION REPORT');
    console.log('================================');
    
    results.forEach(result => {
        console.log(`\n📱 ${result.device}:`);
        
        if (result.failed) {
            console.log(`❌ FAILED: ${result.error}`);
            return;
        }
        
        console.log(`📄 Page Title: ${result.title}`);
        console.log(`🔗 URL: ${result.url}`);
        console.log(`📐 Viewport: ${result.viewport?.width}x${result.viewport?.height}`);
        
        if (result.consoleErrors.length > 0) {
            console.log(`❌ Console Errors: ${result.consoleErrors.length}`);
            result.consoleErrors.forEach(error => console.log(`   - ${error}`));
        }
        
        console.log('\n🧪 Test Results:');
        Object.entries(result.tests).forEach(([test, value]) => {
            const status = value ? '✅' : '❌';
            console.log(`   ${status} ${test}: ${JSON.stringify(value)}`);
        });
    });
    
    // Save detailed report
    require('fs').writeFileSync(
        '/mnt/d/Users/vilma/fly2any/mobile-investigation-report.json', 
        JSON.stringify(results, null, 2)
    );
    
    console.log('\n📝 Detailed report saved to: mobile-investigation-report.json');
    
    return results;
}

investigateMobileIssues().catch(console.error);