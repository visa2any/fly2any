const { chromium } = require('playwright');
const fs = require('fs');

async function quickTestServiceCards() {
    console.log('🚀 Starting quick service cards test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('https://fly2any.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const serviceCards = ['Carros', 'Tours', 'Seguro'];
        const results = {};
        
        for (const service of serviceCards) {
            console.log(`\n🔍 Testing ${service}...`);
            
            // Take before screenshot
            await page.screenshot({ 
                path: `deployed-${service.toLowerCase()}-before-quick.png`, 
                fullPage: true 
            });
            
            // Click using text selector
            await page.click(`text="${service}"`);
            await page.waitForTimeout(3000);
            
            // Take after screenshot
            await page.screenshot({ 
                path: `deployed-${service.toLowerCase()}-after-quick.png`, 
                fullPage: true 
            });
            
            // Check scroll position
            const scrollInfo = await page.evaluate(() => ({
                scrollTop: document.documentElement.scrollTop,
                scrollHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight
            }));
            
            console.log(`📜 ${service} scroll info:`, scrollInfo);
            
            results[service] = {
                scrollInfo,
                timestamp: new Date().toISOString()
            };
            
            // Reset for next test
            await page.keyboard.press('Escape');
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(1000);
        }
        
        fs.writeFileSync('quick-test-results.json', JSON.stringify(results, null, 2));
        console.log('\n✅ Quick test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

quickTestServiceCards().catch(console.error);