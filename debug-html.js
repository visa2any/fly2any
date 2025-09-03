const { chromium } = require('playwright');

async function debugHTML() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('🔍 Debugging HTML content...');
        
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait a bit for React to render
        await page.waitForTimeout(5000);
        
        console.log('\n📄 Current URL:', page.url());
        console.log('📄 Page Title:', await page.title());
        
        // Get the full HTML
        const html = await page.content();
        console.log('\n📄 HTML Length:', html.length);
        
        // Check what's in the body
        const bodyText = await page.textContent('body');
        console.log('\n📄 Body Text Preview (first 500 chars):', bodyText.slice(0, 500));
        
        // Look for specific elements
        const hasForm = await page.locator('form').count();
        const hasInputs = await page.locator('input').count();
        const hasButtons = await page.locator('button').count();
        const hasLoading = await page.locator('.admin-loading').count();
        const hasLoginContent = bodyText.toLowerCase().includes('acesso administrativo');
        
        console.log('\n📄 Element Counts:');
        console.log('   Forms:', hasForm);
        console.log('   Inputs:', hasInputs);
        console.log('   Buttons:', hasButtons);
        console.log('   Loading elements:', hasLoading);
        console.log('   Has login content:', hasLoginContent);
        
        // Check if we're stuck in loading
        if (hasLoading > 0) {
            console.log('\n⏳ Page appears to be stuck in loading state');
            console.log('   Loading text:', await page.locator('.admin-loading').textContent());
        }
        
        // Check for React hydration issues
        const hasReactErrors = await page.evaluate(() => {
            return window.console && window.console.error ? 'Available' : 'Not available';
        });
        console.log('\n🔍 Console availability:', hasReactErrors);
        
        // Try to wait for specific content
        try {
            console.log('\n⏳ Waiting for login form to appear...');
            await page.waitForSelector('form.admin-login-form', { timeout: 10000 });
            console.log('✅ Form appeared!');
        } catch {
            console.log('❌ Form never appeared');
        }
        
        // Final screenshot
        await page.screenshot({ path: 'final-debug.png', fullPage: true });
        console.log('📸 Screenshot saved as final-debug.png');
        
    } catch (error) {
        console.log('❌ Debug error:', error.message);
    } finally {
        await browser.close();
    }
}

debugHTML().catch(console.error);