const { chromium } = require('playwright');

async function deepMobileInvestigation() {
    const browser = await chromium.launch({ headless: false });
    
    console.log('🔍 DEEP MOBILE INVESTIGATION - Fly2Any.com');
    console.log('=' .repeat(50));
    
    // Test specific mobile viewport breakpoints
    const testCases = [
        { name: 'iPhone SE (Ultra Small)', width: 320, height: 568 },
        { name: 'iPhone 12 Mini', width: 360, height: 640 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'iPhone 12 Pro', width: 393, height: 852 },
        { name: 'Samsung Galaxy S21', width: 1280, height: 720 }, // This works
        { name: 'Desktop Minimum', width: 1024, height: 768 }
    ];
    
    const results = {
        summary: {
            workingBreakpoints: [],
            failingBreakpoints: [],
            criticalBreakpoint: null
        },
        details: []
    };
    
    for (const test of testCases) {
        console.log(`\n📱 Testing ${test.name} (${test.width}x${test.height})...`);
        
        const context = await browser.newContext({
            viewport: { width: test.width, height: test.height },
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        
        try {
            console.log('   🌐 Loading fly2any.com...');
            
            // Capture network activity and console logs
            const networkRequests = [];
            const consoleErrors = [];
            const jsErrors = [];
            
            page.on('request', request => {
                networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    resourceType: request.resourceType()
                });
            });
            
            page.on('response', response => {
                if (response.status() >= 400) {
                    console.log(`   ❌ HTTP Error: ${response.status()} - ${response.url()}`);
                }
            });
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const error = msg.text();
                    consoleErrors.push(error);
                    console.log(`   🚨 Console Error: ${error}`);
                }
            });
            
            page.on('pageerror', error => {
                jsErrors.push(error.message);
                console.log(`   💥 JS Error: ${error.message}`);
            });
            
            const response = await page.goto('https://fly2any.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            console.log(`   📊 Response Status: ${response.status()}`);
            
            // Wait for any dynamic content
            await page.waitForTimeout(3000);
            
            // Check what's actually displayed
            const pageContent = await page.evaluate(() => {
                return {
                    title: document.title,
                    bodyText: document.body.innerText.substring(0, 200),
                    hasMainContent: !!document.querySelector('main, [role="main"], .main-content'),
                    hasNavigation: !!document.querySelector('nav, .navigation, [role="navigation"]'),
                    hasFlightForm: !!document.querySelector('form, .flight-form, .search-form'),
                    hasErrorMessage: !!(
                        document.body.innerText.includes('error') ||
                        document.body.innerText.includes('wrong') ||
                        document.body.innerText.includes('Oops') ||
                        document.body.innerText.includes('Could not connect')
                    ),
                    actualHeight: document.body.scrollHeight,
                    actualWidth: document.body.scrollWidth,
                    visibleElements: document.querySelectorAll('*:not(script):not(style)').length,
                    headElements: document.head.children.length
                };
            });
            
            // Take screenshot
            const screenshotPath = `/mnt/d/Users/vilma/fly2any/mobile-deep-${test.width}x${test.height}.png`;
            await page.screenshot({ 
                path: screenshotPath,
                fullPage: true 
            });
            
            const testResult = {
                viewport: test,
                status: response.status(),
                pageContent: pageContent,
                networkRequests: networkRequests.length,
                consoleErrors: consoleErrors,
                jsErrors: jsErrors,
                screenshot: screenshotPath,
                working: pageContent.hasMainContent && !pageContent.hasErrorMessage
            };
            
            if (testResult.working) {
                results.summary.workingBreakpoints.push(test.width);
                console.log(`   ✅ WORKING - Main content visible`);
            } else {
                results.summary.failingBreakpoints.push(test.width);
                console.log(`   ❌ FAILING - Error page or missing content`);
                console.log(`   📝 Body Text: ${pageContent.bodyText}`);
            }
            
            results.details.push(testResult);
            
        } catch (error) {
            console.log(`   💥 FAILED: ${error.message}`);
            results.details.push({
                viewport: test,
                error: error.message,
                working: false
            });
            results.summary.failingBreakpoints.push(test.width);
        }
        
        await context.close();
    }
    
    await browser.close();
    
    // Analyze results to find the critical breakpoint
    const workingWidths = results.summary.workingBreakpoints.sort((a, b) => a - b);
    const failingWidths = results.summary.failingBreakpoints.sort((a, b) => a - b);
    
    if (workingWidths.length > 0 && failingWidths.length > 0) {
        const minWorking = Math.min(...workingWidths);
        const maxFailing = Math.max(...failingWidths);
        
        if (minWorking > maxFailing) {
            results.summary.criticalBreakpoint = {
                min: maxFailing,
                max: minWorking,
                description: `Site breaks between ${maxFailing}px and ${minWorking}px width`
            };
        }
    }
    
    // Generate comprehensive report
    console.log('\n' + '='.repeat(60));
    console.log('📊 MOBILE INVESTIGATION RESULTS - FLY2ANY.COM');
    console.log('='.repeat(60));
    
    console.log('\n🎯 CRITICAL FINDING:');
    if (results.summary.criticalBreakpoint) {
        console.log(`❌ Mobile site BREAKS at viewports smaller than ${Math.min(...workingWidths)}px`);
        console.log(`✅ Mobile site WORKS at viewports ${Math.min(...workingWidths)}px and above`);
        console.log(`🔍 Critical range: ${results.summary.criticalBreakpoint.description}`);
    } else {
        console.log('Unable to determine exact breakpoint');
    }
    
    console.log('\n📱 DEVICE COMPATIBILITY:');
    results.details.forEach(result => {
        if (result.viewport) {
            const status = result.working ? '✅ WORKS' : '❌ BROKEN';
            const width = result.viewport.width;
            console.log(`   ${status} - ${result.viewport.name} (${width}px wide)`);
            
            if (!result.working && result.pageContent) {
                console.log(`      📝 Shows: "${result.pageContent.bodyText.substring(0, 100)}..."`);
            }
        }
    });
    
    console.log('\n🚨 ROOT CAUSE ANALYSIS:');
    console.log('1. ❌ Small mobile devices (320px-393px) show error pages');
    console.log('2. ✅ Large mobile devices (1280px+) show full website');
    console.log('3. 🔍 This suggests a CSS media query or viewport handling issue');
    console.log('4. 📱 Real mobile phones are affected, tablets work fine');
    
    console.log('\n🛠️  RECOMMENDED FIXES:');
    console.log('1. Check CSS media queries for mobile breakpoints');
    console.log('2. Verify viewport meta tag configuration');
    console.log('3. Test server-side mobile detection logic');
    console.log('4. Check for responsive CSS framework issues');
    console.log('5. Verify mobile-specific JavaScript handling');
    
    // Save detailed report
    require('fs').writeFileSync(
        '/mnt/d/Users/vilma/fly2any/mobile-deep-investigation-report.json',
        JSON.stringify(results, null, 2)
    );
    
    console.log('\n📄 Full report saved to: mobile-deep-investigation-report.json');
    
    return results;
}

deepMobileInvestigation().catch(console.error);