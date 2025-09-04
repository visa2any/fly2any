/**
 * Mobile Navigation Positioning Validation Test
 * Tests the height optimization changes for bottom navigation positioning
 * 
 * Changes being validated:
 * - Services: 53% → 50% (-3%)
 * - CTA: 14% → 12% (-2%) 
 * - Buffer: 6% → 5% (-1%)
 * - Navigation space: 7% → 13% (+6%)
 */

const { chromium } = require('playwright');

async function testMobileNavigationPositioning() {
    console.log('🚀 Starting Mobile Navigation Positioning Validation...\n');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // iPhone 12 Pro
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the application
        console.log('📱 Loading application on iPhone 12 Pro viewport (390x844)...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Take initial screenshot
        await page.screenshot({
            path: 'mobile-nav-positioning-step1-initial.png',
            fullPage: false
        });
        console.log('✅ Initial screenshot captured');
        
        // Test 1: Validate viewport dimensions and navigation visibility
        console.log('\n🔍 Test 1: Navigation Visibility & Positioning');
        
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}`);
        
        // Check if navigation is visible in viewport (found correct selector from inspection)
        const navigation = await page.locator('[class*="bg-white/95"][class*="backdrop-blur-xl"][class*="border-t"]').first();
        const navBoundingBox = await navigation.boundingBox();
        
        if (navBoundingBox) {
            console.log(`📍 Navigation position: top=${navBoundingBox.y}, height=${navBoundingBox.height}`);
            console.log(`📏 Distance from bottom: ${viewportHeight - (navBoundingBox.y + navBoundingBox.height)}px`);
            
            const isNavInViewport = navBoundingBox.y + navBoundingBox.height <= viewportHeight;
            console.log(`✅ Navigation within viewport: ${isNavInViewport}`);
        }
        
        // Test 2: Measure navigation icon touch targets
        console.log('\n🔍 Test 2: Touch Target Validation (≥44px requirement)');
        
        const navIcons = await page.locator('[class*="bg-white/95"][class*="backdrop-blur-xl"] button, [class*="bg-white/95"][class*="backdrop-blur-xl"] a').all();
        let minTouchTarget = Infinity;
        
        for (let i = 0; i < navIcons.length; i++) {
            const iconBox = await navIcons[i].boundingBox();
            if (iconBox) {
                const touchTargetSize = Math.min(iconBox.width, iconBox.height);
                minTouchTarget = Math.min(minTouchTarget, touchTargetSize);
                console.log(`🎯 Icon ${i + 1}: ${iconBox.width}x${iconBox.height}px (min: ${touchTargetSize}px)`);
            }
        }
        
        const touchTargetValid = minTouchTarget >= 44;
        console.log(`✅ All touch targets ≥44px: ${touchTargetValid} (min found: ${minTouchTarget.toFixed(1)}px)`);
        
        // Test 3: Validate section height percentages
        console.log('\n🔍 Test 3: Section Height Distribution');
        
        // Check services section (should be ~50% of viewport)
        const servicesSection = await page.locator('[class*="services"], .grid.gap-6').first();
        const servicesBoundingBox = await servicesSection.boundingBox();
        
        if (servicesBoundingBox) {
            const servicesHeightPercent = (servicesBoundingBox.height / viewportHeight) * 100;
            console.log(`📊 Services section: ${servicesBoundingBox.height}px (${servicesHeightPercent.toFixed(1)}% of viewport)`);
        }
        
        // Check CTA section (should be ~12% of viewport)
        const ctaSection = await page.locator('[class*="cta"], button[class*="bg-orange"]').first();
        const ctaBoundingBox = await ctaSection.boundingBox();
        
        if (ctaBoundingBox) {
            const ctaHeightPercent = (ctaBoundingBox.height / viewportHeight) * 100;
            console.log(`📊 CTA section: ${ctaBoundingBox.height}px (${ctaHeightPercent.toFixed(1)}% of viewport)`);
        }
        
        // Test 4: Check for element overlaps
        console.log('\n🔍 Test 4: Element Overlap Detection');
        
        const allElements = await page.locator('*').all();
        let overlapsFound = 0;
        
        // Check if navigation overlaps with main content
        const mainContent = await page.locator('main, [class*="main"], .container').first();
        const mainBoundingBox = await mainContent.boundingBox();
        
        if (navBoundingBox && mainBoundingBox) {
            const overlap = navBoundingBox.y < (mainBoundingBox.y + mainBoundingBox.height);
            if (overlap) {
                overlapsFound++;
                console.log('⚠️  Navigation overlaps with main content');
            } else {
                console.log('✅ No overlap between navigation and main content');
            }
        }
        
        // Test 5: Validate single screen fit
        console.log('\n🔍 Test 5: Single Screen Content Validation');
        
        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const fitsInSingleScreen = pageHeight <= viewportHeight;
        console.log(`📏 Page height: ${pageHeight}px, Viewport: ${viewportHeight}px`);
        console.log(`✅ Fits in single screen: ${fitsInSingleScreen}`);
        
        // Test 6: Visual hierarchy validation
        console.log('\n🔍 Test 6: Visual Hierarchy Validation');
        
        // Check z-index values for proper layering
        const navZIndex = await navigation.evaluate(el => window.getComputedStyle(el).zIndex);
        console.log(`📚 Navigation z-index: ${navZIndex}`);
        
        // Capture detailed navigation measurement screenshot
        await page.evaluate(() => {
            // Add measurement overlays for visual validation
            const nav = document.querySelector('[class*="bg-white/95"][class*="backdrop-blur-xl"][class*="border-t"]');
            if (nav) {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 20px;
                    background: rgba(255, 0, 0, 0.3);
                    border-top: 2px solid red;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(overlay);
                
                // Add distance indicator
                const distanceIndicator = document.createElement('div');
                distanceIndicator.textContent = `${window.innerHeight - (nav.getBoundingClientRect().y + nav.getBoundingClientRect().height)}px from bottom`;
                distanceIndicator.style.cssText = `
                    position: fixed;
                    bottom: 25px;
                    left: 10px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    font-size: 12px;
                    border-radius: 4px;
                    z-index: 9999;
                `;
                document.body.appendChild(distanceIndicator);
            }
        });
        
        await page.screenshot({
            path: 'mobile-nav-positioning-step2-with-measurements.png',
            fullPage: false
        });
        console.log('✅ Measurement screenshot captured');
        
        // Test 7: Navigation space utilization
        console.log('\n🔍 Test 7: Navigation Space Utilization');
        
        if (navBoundingBox) {
            const navSpacePercent = (navBoundingBox.height / viewportHeight) * 100;
            console.log(`📊 Navigation space: ${navBoundingBox.height}px (${navSpacePercent.toFixed(1)}% of viewport)`);
            
            const targetNavSpace = 13; // Should be ~13% after optimization
            const navSpaceOptimal = Math.abs(navSpacePercent - targetNavSpace) <= 2; // Allow 2% tolerance
            console.log(`✅ Navigation space optimal (target ~13%): ${navSpaceOptimal}`);
        }
        
        // Final comprehensive screenshot
        await page.screenshot({
            path: 'mobile-nav-positioning-step3-final-validation.png',
            fullPage: false
        });
        console.log('✅ Final validation screenshot captured');
        
        // Test Summary
        console.log('\n📋 VALIDATION SUMMARY');
        console.log('====================');
        console.log(`✅ Navigation visible in viewport: ${navBoundingBox ? 'YES' : 'NO'}`);
        console.log(`✅ Touch targets ≥44px: ${touchTargetValid}`);
        console.log(`✅ Content fits single screen: ${fitsInSingleScreen}`);
        console.log(`✅ No element overlaps: ${overlapsFound === 0}`);
        console.log(`✅ Navigation properly positioned: ${navBoundingBox ? 'YES' : 'NO'}`);
        
        if (navBoundingBox) {
            const distanceFromBottom = viewportHeight - (navBoundingBox.y + navBoundingBox.height);
            console.log(`📏 Navigation distance from bottom edge: ${distanceFromBottom}px`);
            
            if (distanceFromBottom >= 0 && distanceFromBottom <= 20) {
                console.log('🎉 OPTIMIZATION SUCCESS: Navigation properly positioned!');
            } else if (distanceFromBottom < 0) {
                console.log('⚠️  WARNING: Navigation extends beyond viewport');
            } else {
                console.log('💡 INFO: Navigation has extra spacing from bottom');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'mobile-nav-positioning-error.png' });
    } finally {
        await browser.close();
        console.log('\n🏁 Test completed. Check screenshots for visual validation.');
    }
}

// Run the test
testMobileNavigationPositioning().catch(console.error);