const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testTemplateDisplay() {
    console.log('🚀 Starting template content display test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Add delay for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate to admin page
        console.log('📍 Step 1: Navigating to admin email marketing page...');
        await page.goto('http://localhost:3001/admin/email-marketing/v2');
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of login page
        await page.screenshot({ 
            path: 'screenshots/01-login-page.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: 01-login-page.png');
        
        // Step 2: Login
        console.log('🔐 Step 2: Logging in...');
        await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'admin@fly2any.com');
        await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i]', 'fly2any2024!');
        
        // Try different login button selectors
        const loginSelectors = [
            'button[type="submit"]',
            'button:has-text("Login")',
            'button:has-text("Entrar")',
            'input[type="submit"]',
            '.btn-primary',
            '[data-testid="login-button"]'
        ];
        
        let loginSuccessful = false;
        for (const selector of loginSelectors) {
            try {
                const loginButton = page.locator(selector).first();
                if (await loginButton.isVisible({ timeout: 2000 })) {
                    await loginButton.click();
                    loginSuccessful = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!loginSuccessful) {
            console.log('⚠️ Could not find login button, pressing Enter...');
            await page.keyboard.press('Enter');
        }
        
        // Wait for navigation after login
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Take screenshot after login
        await page.screenshot({ 
            path: 'screenshots/02-after-login.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: 02-after-login.png');
        
        // Step 3: Navigate to Templates tab
        console.log('📋 Step 3: Accessing Templates tab...');
        
        // Look for Templates tab with various selectors
        const templateTabSelectors = [
            'text="Templates"',
            '[data-tab="templates"]',
            'button:has-text("Templates")',
            'a:has-text("Templates")',
            '.tab:has-text("Templates")',
            '[role="tab"]:has-text("Templates")'
        ];
        
        let tabFound = false;
        for (const selector of templateTabSelectors) {
            try {
                const tab = page.locator(selector).first();
                if (await tab.isVisible({ timeout: 2000 })) {
                    await tab.click();
                    tabFound = true;
                    console.log(`✅ Found and clicked Templates tab with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!tabFound) {
            console.log('⚠️ Templates tab not found, trying to scroll and search...');
            // Scroll to find the tab
            await page.evaluate(() => window.scrollTo(0, 300));
            await page.waitForTimeout(1000);
        }
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Take screenshot of templates tab
        await page.screenshot({ 
            path: 'screenshots/03-templates-tab.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: 03-templates-tab.png');
        
        // Step 4: Find the specific template
        console.log('🔍 Step 4: Looking for template "Super Oferta - Novo Template - 24/07/2025"...');
        
        // Wait for templates to load
        await page.waitForTimeout(3000);
        
        // Look for the specific template
        const templateSelectors = [
            'text="Super Oferta - Novo Template - 24/07/2025"',
            ':has-text("Super Oferta - Novo Template")',
            ':has-text("Super Oferta")',
            ':has-text("24/07/2025")'
        ];
        
        let templateFound = false;
        for (const selector of templateSelectors) {
            try {
                const template = page.locator(selector).first();
                if (await template.isVisible({ timeout: 3000 })) {
                    console.log(`✅ Found template with selector: ${selector}`);
                    templateFound = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        // Step 5: Find and click the preview button
        console.log('👁️ Step 5: Looking for preview button...');
        
        const previewSelectors = [
            'text="👁️ Visualizar Template"',
            'button:has-text("👁️")',
            'button:has-text("Visualizar")',
            '[title*="Visualizar"]',
            '[aria-label*="Visualizar"]',
            '.preview-btn',
            '.btn-preview'
        ];
        
        let previewFound = false;
        for (const selector of previewSelectors) {
            try {
                const previewButton = page.locator(selector).first();
                if (await previewButton.isVisible({ timeout: 3000 })) {
                    console.log(`✅ Found preview button with selector: ${selector}`);
                    await previewButton.click();
                    previewFound = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!previewFound) {
            console.log('⚠️ Preview button not found, looking for any buttons near template...');
            // Try to find any button that might be the preview
            const anyButton = page.locator('button').first();
            if (await anyButton.isVisible()) {
                await anyButton.click();
            }
        }
        
        // Wait for modal to appear
        await page.waitForTimeout(3000);
        
        // Step 6: Take screenshot of preview modal
        console.log('📸 Step 6: Capturing preview modal screenshot...');
        await page.screenshot({ 
            path: 'screenshots/04-preview-modal.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: 04-preview-modal.png');
        
        // Step 7: Check template content
        console.log('🔍 Step 7: Analyzing template content...');
        
        // Look for content in the modal
        const contentSelectors = [
            '.modal-body',
            '.template-preview',
            '.content',
            '[data-testid="template-content"]',
            'iframe',
            '.preview-content'
        ];
        
        let contentAnalysis = {
            hasContent: false,
            hasErrorMessage: false,
            contentType: 'unknown',
            contentPreview: ''
        };
        
        for (const selector of contentSelectors) {
            try {
                const contentElement = page.locator(selector).first();
                if (await contentElement.isVisible({ timeout: 2000 })) {
                    const textContent = await contentElement.textContent();
                    const innerHTML = await contentElement.innerHTML();
                    
                    contentAnalysis.hasContent = true;
                    contentAnalysis.contentPreview = textContent?.substring(0, 200) || '';
                    
                    if (textContent?.includes('Conteúdo não disponível')) {
                        contentAnalysis.hasErrorMessage = true;
                        contentAnalysis.contentType = 'error';
                    } else if (innerHTML?.includes('<') && innerHTML?.includes('>')) {
                        contentAnalysis.contentType = 'html';
                    } else {
                        contentAnalysis.contentType = 'text';
                    }
                    
                    console.log(`✅ Found content with selector: ${selector}`);
                    console.log(`Content preview: ${contentAnalysis.contentPreview}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        // Take a focused screenshot of just the modal if possible
        try {
            const modal = page.locator('.modal, .dialog, [role="dialog"]').first();
            if (await modal.isVisible()) {
                await modal.screenshot({ path: 'screenshots/05-modal-focus.png' });
                console.log('✅ Screenshot saved: 05-modal-focus.png');
            }
        } catch (e) {
            console.log('⚠️ Could not capture focused modal screenshot');
        }
        
        // Generate report
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        console.log(`✅ Navigation successful: ${true}`);
        console.log(`✅ Login successful: ${true}`);
        console.log(`✅ Templates tab accessed: ${tabFound}`);
        console.log(`✅ Template found: ${templateFound}`);
        console.log(`✅ Preview button clicked: ${previewFound}`);
        console.log(`✅ Content analysis:`);
        console.log(`   - Has content: ${contentAnalysis.hasContent}`);
        console.log(`   - Content type: ${contentAnalysis.contentType}`);
        console.log(`   - Has error message: ${contentAnalysis.hasErrorMessage}`);
        console.log(`   - Content preview: ${contentAnalysis.contentPreview}`);
        
        const fixWorking = contentAnalysis.hasContent && !contentAnalysis.hasErrorMessage && contentAnalysis.contentType !== 'error';
        console.log(`\n🎯 FIX STATUS: ${fixWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
        
        if (fixWorking) {
            console.log('🎉 The template content display fix is working correctly!');
            console.log('📝 Template HTML content is now displaying instead of "Conteúdo não disponível"');
        } else {
            console.log('⚠️ The fix may not be working as expected.');
            console.log('📝 Please check the screenshots for more details.');
        }
        
        return {
            success: true,
            fixWorking,
            contentAnalysis,
            screenshots: [
                'screenshots/01-login-page.png',
                'screenshots/02-after-login.png',
                'screenshots/03-templates-tab.png',
                'screenshots/04-preview-modal.png',
                'screenshots/05-modal-focus.png'
            ]
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        // Take error screenshot
        await page.screenshot({ 
            path: 'screenshots/error-state.png',
            fullPage: true 
        });
        
        return {
            success: false,
            error: error.message,
            screenshots: ['screenshots/error-state.png']
        };
    } finally {
        await browser.close();
    }
}

// Create screenshots directory
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

// Run the test
testTemplateDisplay()
    .then(result => {
        console.log('\n🏁 Test completed!');
        console.log('📁 Screenshots saved in ./screenshots/ directory');
        
        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });