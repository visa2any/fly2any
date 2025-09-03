const { chromium } = require('playwright');

async function diagnoseNextjsIssue() {
    let browser;
    let context;
    let page;
    
    try {
        console.log('🚀 Starting Playwright diagnosis...');
        
        // Launch browser with extensive debugging
        browser = await chromium.launch({ 
            headless: false,
            devtools: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        });
        
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        
        page = await context.newPage();
        
        // Collect console messages
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push({
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
            console.log(`🔍 Console [${msg.type()}]:`, msg.text());
        });
        
        // Collect network errors
        const networkErrors = [];
        page.on('requestfailed', request => {
            networkErrors.push({
                url: request.url(),
                failure: request.failure()
            });
            console.log('🚫 Network failed:', request.url(), request.failure());
        });
        
        // Navigate to test page first
        console.log('📄 Testing simple HTML page...');
        await page.goto('http://localhost:3000/simple-test-new.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });
        
        // Take screenshot of test page
        await page.screenshot({
            path: 'test-page-screenshot.png',
            fullPage: true
        });
        
        // Get page content
        const testPageContent = await page.content();
        console.log('✅ Test page loaded successfully');
        console.log('📏 Test page content length:', testPageContent.length);
        
        // Test JavaScript execution
        const jsResult = await page.evaluate(() => {
            return {
                title: document.title,
                jsWorking: typeof console !== 'undefined',
                domReady: document.readyState === 'complete',
                hasElements: document.querySelectorAll('div').length > 0
            };
        });
        console.log('🧪 JS Test Results:', jsResult);
        
        // Now test what happens when we try to navigate to Next.js
        console.log('🎯 Attempting to navigate to Next.js app...');
        try {
            await page.goto('http://localhost:3000/', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            
            await page.screenshot({
                path: 'nextjs-page-screenshot.png',
                fullPage: true
            });
            
            const nextjsContent = await page.content();
            console.log('📄 Next.js page content length:', nextjsContent.length);
            
        } catch (nextjsError) {
            console.log('❌ Next.js navigation failed:', nextjsError.message);
        }
        
        // Summary
        console.log('\n📊 DIAGNOSIS SUMMARY:');
        console.log('='.repeat(50));
        console.log('Console Logs:', consoleLogs.length);
        console.log('Network Errors:', networkErrors.length);
        console.log('Test page loaded:', jsResult.title === 'Simple Test Page');
        
        if (consoleLogs.length > 0) {
            console.log('\n📝 Console Messages:');
            consoleLogs.forEach(log => {
                console.log(`  [${log.type}] ${log.text}`);
            });
        }
        
        if (networkErrors.length > 0) {
            console.log('\n🚫 Network Errors:');
            networkErrors.forEach(error => {
                console.log(`  ${error.url}: ${error.failure?.errorText || 'Unknown error'}`);
            });
        }
        
        return {
            testPageWorking: true,
            consoleLogs,
            networkErrors,
            jsResult
        };
        
    } catch (error) {
        console.error('💥 Fatal error during diagnosis:', error);
        return { error: error.message };
    } finally {
        if (page) await page.close();
        if (context) await context.close();  
        if (browser) await browser.close();
    }
}

// Run diagnosis
diagnoseNextjsIssue().then(results => {
    console.log('\n🎉 Diagnosis completed!');
    if (results.error) {
        console.error('❌ Error:', results.error);
        process.exit(1);
    } else {
        console.log('✅ Analysis successful');
        process.exit(0);
    }
}).catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});