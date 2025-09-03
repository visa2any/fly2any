const { chromium } = require('playwright');

async function debugAdminPage() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🔍 Debugging Admin Login Page...\n');
        
        // Navigate to admin login
        console.log('1. Navigating to /admin/login...');
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Take a screenshot
        await page.screenshot({ path: 'admin-login-debug.png', fullPage: true });
        console.log('   Screenshot saved as admin-login-debug.png');
        
        // Get page title and URL
        const title = await page.title();
        const url = page.url();
        console.log(`   Page title: "${title}"`);
        console.log(`   Current URL: ${url}`);
        
        // Check if this redirects to another login page
        console.log('\n2. Checking for redirects...');
        if (!url.includes('/admin/login')) {
            console.log(`   ⚠️  Redirected to: ${url}`);
        } else {
            console.log('   ✅ Stayed on admin login page');
        }
        
        // Get page content
        console.log('\n3. Analyzing page content...');
        const bodyText = await page.textContent('body');
        const hasFormElements = bodyText.toLowerCase().includes('email') || bodyText.toLowerCase().includes('password') || bodyText.toLowerCase().includes('login');
        console.log(`   Has form-related text: ${hasFormElements}`);
        
        // Look for all input elements
        const inputs = await page.locator('input').all();
        console.log(`   Total input elements found: ${inputs.length}`);
        
        for (let i = 0; i < inputs.length; i++) {
            const type = await inputs[i].getAttribute('type');
            const name = await inputs[i].getAttribute('name');
            const id = await inputs[i].getAttribute('id');
            const placeholder = await inputs[i].getAttribute('placeholder');
            console.log(`   Input ${i + 1}: type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
        }
        
        // Look for all button elements
        const buttons = await page.locator('button').all();
        console.log(`   Total button elements found: ${buttons.length}`);
        
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            const type = await buttons[i].getAttribute('type');
            console.log(`   Button ${i + 1}: text="${text}" type="${type}"`);
        }
        
        // Look for forms
        const forms = await page.locator('form').all();
        console.log(`   Total form elements found: ${forms.length}`);
        
        // Check for auth providers (NextAuth.js patterns)
        const authButtons = await page.locator('[class*="provider"], [data-provider], button:has-text("Sign in with")').all();
        console.log(`   Auth provider buttons found: ${authButtons.length}`);
        
        // Get HTML structure
        console.log('\n4. HTML structure analysis...');
        const html = await page.innerHTML('body');
        const isNextAuth = html.includes('next-auth') || html.includes('signin') || html.includes('providers');
        const isCustomLogin = html.includes('admin') && (html.includes('login') || html.includes('signin'));
        
        console.log(`   Appears to be NextAuth.js: ${isNextAuth}`);
        console.log(`   Appears to be custom admin login: ${isCustomLogin}`);
        
        // Check for error messages or loading states
        const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], .loader').all();
        console.log(`   Loading elements found: ${loadingElements.length}`);
        
        const errorElements = await page.locator('[class*="error"], .error, [role="alert"]').all();
        console.log(`   Error elements found: ${errorElements.length}`);
        
        // Try alternative admin routes
        console.log('\n5. Testing alternative routes...');
        
        const alternativeRoutes = [
            '/admin',
            '/auth/signin',
            '/api/auth/signin',
            '/login',
            '/signin'
        ];
        
        for (const route of alternativeRoutes) {
            try {
                await page.goto(`http://localhost:3000${route}`, { timeout: 10000 });
                const currentUrl = page.url();
                const currentTitle = await page.title();
                console.log(`   ${route} → ${currentUrl} ("${currentTitle}")`);
            } catch (error) {
                console.log(`   ${route} → Error: ${error.message}`);
            }
        }
        
        await page.waitForTimeout(2000);
        
    } catch (error) {
        console.log('❌ Debug error:', error.message);
    } finally {
        await browser.close();
    }
}

debugAdminPage().catch(console.error);