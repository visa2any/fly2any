const { chromium } = require('playwright');

async function testFrontend() {
    console.log('🎭 Starting Frontend Template Display Test');
    console.log('🔍 Testing the fix on the actual admin interface');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000,
        timeout: 60000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        console.log('\n📍 Step 1: Navigate to admin login');
        await page.goto('http://localhost:3001/admin/login', { waitUntil: 'networkidle' });
        
        console.log('🔐 Step 2: Fill login credentials');
        await page.fill('input[type="email"]', 'admin@fly2any.com');
        await page.fill('input[type="password"]', 'fly2any2024!');
        
        console.log('👆 Step 3: Submit login form');
        await page.click('button[type="submit"]');
        
        // Wait for redirect after login
        await page.waitForURL('**/admin/**', { timeout: 15000 });
        console.log('✅ Successfully logged in');
        
        console.log('📍 Step 4: Navigate to email marketing page');
        await page.goto('http://localhost:3001/admin/email-marketing/v2', { waitUntil: 'networkidle' });
        
        console.log('📋 Step 5: Wait for page to load and find Templates tab');
        await page.waitForTimeout(5000); // Wait for dynamic content to load
        
        // Look for Templates tab - try multiple selectors
        const templateTabSelectors = [
            'text=Templates',
            '[data-tab="templates"]', 
            'button:has-text("Templates")',
            '.tab:has-text("Templates")',
            '[role="tab"]:has-text("Templates")'
        ];
        
        let templateTab = null;
        for (const selector of templateTabSelectors) {
            try {
                templateTab = await page.locator(selector).first();
                if (await templateTab.isVisible({ timeout: 2000 })) {
                    console.log(`✅ Found Templates tab with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (templateTab && await templateTab.isVisible()) {
            await templateTab.click();
            console.log('👆 Clicked Templates tab');
            await page.waitForTimeout(3000);
        } else {
            console.log('⚠️ Templates tab not found, continuing with current page state');
        }
        
        console.log('📸 Step 6: Take screenshot of templates page');
        await page.screenshot({ 
            path: 'template-test-screen.png',
            fullPage: true 
        });
        
        console.log('🔍 Step 7: Look for preview buttons');
        const previewSelectors = [
            'text=👁️',
            'text=Visualizar',
            'button:has-text("👁️")',
            'button:has-text("Visualizar")',
            '[title*="Visualizar"]',
            '.btn:has-text("👁️")'
        ];
        
        let previewButton = null;
        for (const selector of previewSelectors) {
            try {
                const buttons = await page.locator(selector).all();
                if (buttons.length > 0) {
                    previewButton = buttons[0];
                    console.log(`✅ Found ${buttons.length} preview button(s) with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (previewButton && await previewButton.isVisible()) {
            console.log('👆 Step 8: Click preview button');
            await previewButton.click();
            
            // Wait for modal/preview to appear
            await page.waitForTimeout(3000);
            
            console.log('📸 Step 9: Take screenshot of preview');
            await page.screenshot({ 
                path: 'template-preview-screen.png',
                fullPage: true 
            });
            
            console.log('🔍 Step 10: Analyze preview content');
            
            // Check for error message
            const errorMessage = await page.locator('text=Conteúdo não disponível').first();
            const hasError = await errorMessage.isVisible().catch(() => false);
            
            // Check for HTML content indicators
            const htmlContent = await page.locator('iframe, .template-content, .preview-content, [data-testid="template-content"]').first();
            const hasContent = await htmlContent.isVisible().catch(() => false);
            
            // Get page content for analysis
            const pageText = await page.textContent('body');
            const hasHtmlIndicators = pageText.includes('<html>') || pageText.includes('DOCTYPE') || pageText.includes('<body>');
            
            console.log('\n📊 PREVIEW ANALYSIS:');
            console.log(`   - Error message visible: ${hasError ? '❌ YES' : '✅ NO'}`);
            console.log(`   - Content element visible: ${hasContent ? '✅ YES' : '⚠️ NO'}`);
            console.log(`   - HTML indicators present: ${hasHtmlIndicators ? '✅ YES' : '⚠️ NO'}`);
            
            const fixWorking = !hasError && (hasContent || hasHtmlIndicators);
            console.log(`\n🎯 FRONTEND FIX STATUS: ${fixWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
            
            return {
                success: true,
                fixWorking,
                hasError,
                hasContent,
                hasHtmlIndicators
            };
        } else {
            console.log('⚠️ No preview button found');
            return {
                success: true,
                fixWorking: false,
                error: 'No preview button found'
            };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ 
            path: 'error-screen.png',
            fullPage: true 
        });
        return {
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// Run the test
testFrontend()
    .then(result => {
        console.log('\n🏁 Frontend Test Results:');
        console.log('=======================');
        
        if (result.success) {
            if (result.fixWorking) {
                console.log('🎉 SUCCESS: Frontend template content display is working!');
                console.log('✅ Templates are showing proper HTML content instead of error message');
            } else {
                console.log('⚠️ ISSUE: Frontend may still have issues or no templates to test');
                console.log(`📝 Details: ${result.error || 'Check screenshots for more info'}`);
            }
        } else {
            console.log(`❌ Test failed: ${result.error}`);
        }
        
        console.log('\n📸 Screenshots saved:');
        console.log('   - template-test-screen.png (templates page)');
        console.log('   - template-preview-screen.png (preview modal)');
        console.log('   - error-screen.png (if error occurred)');
        
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    });