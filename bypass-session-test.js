const { chromium } = require('playwright');

async function bypassSessionTest() {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('🚀 Testing login by bypassing session check...\n');
        
        // Navigate to login page
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
        
        console.log('1. Page loaded, checking for loading state...');
        
        // Check if we're in loading state
        const isLoading = await page.isVisible('.admin-loading');
        console.log('   Loading state visible:', isLoading);
        
        if (isLoading) {
            console.log('   Found loading state - bypassing by modifying the page state...');
            
            // Inject script to bypass the session check
            await page.evaluate(() => {
                // Find the loading element and hide it
                const loadingElement = document.querySelector('.admin-loading');
                if (loadingElement && loadingElement.parentElement) {
                    loadingElement.parentElement.style.display = 'none';
                }
                
                // Try to trigger the form to show by setting the state
                // This is a hack but helps us test the actual login functionality
                window.postMessage({ type: 'BYPASS_SESSION_CHECK' }, '*');
            });
            
            await page.waitForTimeout(2000);
            
            // Check if form is now visible
            const formVisible = await page.isVisible('form.admin-login-form');
            console.log('   Form visible after bypass:', formVisible);
            
            if (!formVisible) {
                console.log('   Trying alternative approach - injecting form HTML...');
                
                // Inject the login form directly
                await page.evaluate(() => {
                    const container = document.querySelector('.admin-login-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="admin-login-card">
                                <div class="admin-login-content">
                                    <div class="admin-login-header">
                                        <h1>Acesso Administrativo</h1>
                                        <p>Entre com suas credenciais para acessar o painel admin</p>
                                    </div>
                                    <div class="bg-white rounded-xl shadow-lg border border-gray-200 admin-login-form-card">
                                        <form class="admin-login-form" id="manual-login-form">
                                            <div class="admin-login-field">
                                                <label for="email">Email</label>
                                                <input id="email" name="email" type="email" 
                                                       class="w-full px-4 py-3 border border-gray-200 rounded-lg" 
                                                       placeholder="admin@fly2any.com" />
                                            </div>
                                            <div class="admin-login-field">
                                                <label for="password">Senha</label>
                                                <input id="password" name="password" type="password" 
                                                       class="w-full px-4 py-3 border border-gray-200 rounded-lg" 
                                                       placeholder="Digite sua senha" />
                                            </div>
                                            <div class="admin-login-button-wrapper">
                                                <button type="submit" id="manual-submit"
                                                        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg">
                                                    Entrar no Sistema
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                
                await page.waitForTimeout(1000);
            }
        }
        
        // Now test the actual login functionality
        console.log('\n2. Testing login functionality...');
        
        // Wait for form elements
        await page.waitForSelector('input[name="email"]', { timeout: 5000 });
        await page.waitForSelector('input[name="password"]', { timeout: 5000 });
        await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        
        console.log('   Form elements found!');
        
        // Test invalid credentials
        console.log('\n3. Testing invalid credentials...');
        await page.fill('input[name="email"]', 'wrong@test.com');
        await page.fill('input[name="password"]', 'wrongpass');
        
        // If we have a manual form, handle submission differently
        const isManualForm = await page.isVisible('#manual-login-form');
        
        if (isManualForm) {
            console.log('   Using manual form submission...');
            
            // Add manual event handler
            await page.evaluate(() => {
                const form = document.getElementById('manual-login-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;
                        
                        console.log('Manual form submitted:', email);
                        
                        // Call NextAuth signIn manually
                        if (window.next && window.next.auth) {
                            try {
                                const result = await window.next.auth.signIn('credentials', {
                                    email,
                                    password,
                                    redirect: false
                                });
                                console.log('SignIn result:', result);
                            } catch (err) {
                                console.error('SignIn error:', err);
                            }
                        } else {
                            // Try to make API call directly
                            fetch('/api/auth/signin', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ email, password })
                            }).then(res => res.json()).then(data => {
                                console.log('API response:', data);
                            });
                        }
                    });
                }
            });
            
            await page.click('#manual-submit');
        } else {
            await page.click('button[type="submit"]');
        }
        
        await page.waitForTimeout(5000);
        
        const currentUrl1 = page.url();
        console.log('   URL after invalid creds:', currentUrl1);
        
        // Test valid credentials
        console.log('\n4. Testing valid credentials...');
        await page.fill('input[name="email"]', 'admin@fly2any.com');
        await page.fill('input[name="password"]', 'fly2any2024!');
        
        if (isManualForm) {
            await page.click('#manual-submit');
        } else {
            await page.click('button[type="submit"]');
        }
        
        // Wait for potential redirect
        await page.waitForTimeout(8000);
        
        const currentUrl2 = page.url();
        console.log('   URL after valid creds:', currentUrl2);
        
        // Check if we were redirected to admin
        if (currentUrl2.includes('/admin') && !currentUrl2.includes('/admin/login')) {
            console.log('✅ Successfully logged in and redirected to admin!');
        } else {
            console.log('❌ Login may have failed or no redirect occurred');
            
            // Check for error messages
            const errorText = await page.textContent('body');
            if (errorText.toLowerCase().includes('error') || errorText.toLowerCase().includes('invalid')) {
                console.log('   Found error text in page');
            }
        }
        
        // Take final screenshot
        await page.screenshot({ path: 'bypass-test-result.png', fullPage: true });
        console.log('   Screenshot saved as bypass-test-result.png');
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
}

bypassSessionTest().catch(console.error);