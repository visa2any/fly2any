/**
 * Mobile Navigation Positioning Validation Test - Optimized
 * Focused validation of height optimization changes for bottom navigation
 * 
 * Optimization Results Being Validated:
 * - Services: 53% → 50% (-3%)
 * - CTA: 14% → 12% (-2%) 
 * - Buffer: 6% → 5% (-1%)
 * - Navigation space: 7% → 13% (+6%)
 */

const { chromium } = require('playwright');

async function validateMobileNavOptimized() {
    console.log('🚀 Mobile Navigation Positioning Validation - Optimized\n');
    
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
        console.log('📱 Loading application on iPhone 12 Pro viewport (390x844)...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}\n`);
        
        // ✅ CRITICAL TEST 1: Navigation Positioning
        console.log('🔍 CRITICAL TEST 1: Bottom Navigation Positioning');
        console.log('================================================');
        
        const navigation = await page.locator('[class*="bg-white/95"][class*="backdrop-blur-xl"][class*="border-t"]').first();
        const navBoundingBox = await navigation.boundingBox();
        
        if (navBoundingBox) {
            const distanceFromBottom = viewportHeight - (navBoundingBox.y + navBoundingBox.height);
            const navHeightPercent = (navBoundingBox.height / viewportHeight) * 100;
            
            console.log(`📍 Navigation position: y=${navBoundingBox.y}, height=${navBoundingBox.height}px`);
            console.log(`📏 Distance from bottom edge: ${distanceFromBottom}px`);
            console.log(`📊 Navigation space: ${navHeightPercent.toFixed(1)}% of viewport`);
            console.log(`✅ Within viewport: ${navBoundingBox.y + navBoundingBox.height <= viewportHeight}`);
            console.log(`✅ Properly positioned: ${distanceFromBottom >= 0 && distanceFromBottom <= 5}`);
            
            // Validate the 13% target space allocation
            const targetNavSpace = 13;
            const spaceOptimal = Math.abs(navHeightPercent - targetNavSpace) <= 3;
            console.log(`🎯 Target ~13% space achieved: ${spaceOptimal} (actual: ${navHeightPercent.toFixed(1)}%)`);
        }
        
        // ✅ CRITICAL TEST 2: Touch Target Validation
        console.log('\n🔍 CRITICAL TEST 2: Touch Target Validation (≥44px)');
        console.log('==================================================');
        
        const navIcons = await page.locator('[class*="bg-white/95"][class*="backdrop-blur-xl"] button, [class*="bg-white/95"][class*="backdrop-blur-xl"] a').all();
        let minTouchTarget = Infinity;
        let maxTouchTarget = 0;
        let avgTouchTarget = 0;
        
        console.log(`📱 Found ${navIcons.length} navigation elements`);
        
        for (let i = 0; i < navIcons.length; i++) {
            const iconBox = await navIcons[i].boundingBox();
            if (iconBox) {
                const touchTargetSize = Math.min(iconBox.width, iconBox.height);
                minTouchTarget = Math.min(minTouchTarget, touchTargetSize);
                maxTouchTarget = Math.max(maxTouchTarget, touchTargetSize);
                avgTouchTarget += touchTargetSize;
                console.log(`🎯 Element ${i + 1}: ${iconBox.width.toFixed(1)}x${iconBox.height.toFixed(1)}px (min dimension: ${touchTargetSize.toFixed(1)}px)`);
            }
        }
        
        if (navIcons.length > 0) {
            avgTouchTarget = avgTouchTarget / navIcons.length;
            console.log(`📊 Touch target stats: min=${minTouchTarget.toFixed(1)}px, max=${maxTouchTarget.toFixed(1)}px, avg=${avgTouchTarget.toFixed(1)}px`);
            console.log(`✅ All targets ≥44px: ${minTouchTarget >= 44}`);
            console.log(`🚀 Accessibility excellent: ${minTouchTarget >= 60 ? 'YES (60px+)' : 'Standard (44px+)'}`);
        }
        
        // ✅ CRITICAL TEST 3: Single Screen Content Fit
        console.log('\n🔍 CRITICAL TEST 3: Single Screen Content Validation');
        console.log('===================================================');
        
        const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        const fitsInViewport = documentHeight <= viewportHeight;
        
        console.log(`📏 Document height: ${documentHeight}px`);
        console.log(`📏 Body height: ${bodyHeight}px`);
        console.log(`📏 Viewport height: ${viewportHeight}px`);
        console.log(`✅ Fits in single screen: ${fitsInViewport}`);
        console.log(`📊 Content utilization: ${(documentHeight / viewportHeight * 100).toFixed(1)}% of viewport`);
        
        // ✅ CRITICAL TEST 4: Element Overlap Detection
        console.log('\n🔍 CRITICAL TEST 4: Element Overlap Detection');
        console.log('=============================================');
        
        let overlapIssues = 0;
        
        // Check main content area
        const mainContentSelectors = ['main', '[class*="main"]', '.container', 'body > div'];
        let mainContentFound = false;
        
        for (const selector of mainContentSelectors) {
            try {
                const mainContent = await page.locator(selector).first();
                const mainBoundingBox = await mainContent.boundingBox();
                
                if (mainBoundingBox && navBoundingBox) {
                    const overlap = navBoundingBox.y < (mainBoundingBox.y + mainBoundingBox.height);
                    console.log(`📋 Main content (${selector}): y=${mainBoundingBox.y}, height=${mainBoundingBox.height}`);
                    console.log(`🔍 Overlap check: ${overlap ? '⚠️  OVERLAP DETECTED' : '✅ No overlap'}`);
                    
                    if (overlap) overlapIssues++;
                    mainContentFound = true;
                    break;
                }
            } catch (e) {
                // Selector not found, try next
            }
        }
        
        if (!mainContentFound) {
            console.log('📋 Main content area detection: Using document body as reference');
        }
        
        console.log(`📊 Overlap issues found: ${overlapIssues}`);
        
        // ✅ VISUAL VALIDATION: Add measurement overlays and capture screenshots
        console.log('\n🔍 VISUAL VALIDATION: Creating Measurement Overlays');
        console.log('===================================================');
        
        await page.evaluate((navHeight, viewportHeight, distanceFromBottom) => {
            // Remove any existing overlays
            const existingOverlays = document.querySelectorAll('.test-overlay');
            existingOverlays.forEach(el => el.remove());
            
            const nav = document.querySelector('[class*="bg-white/95"][class*="backdrop-blur-xl"][class*="border-t"]');
            if (nav) {
                // Bottom edge indicator
                const bottomIndicator = document.createElement('div');
                bottomIndicator.className = 'test-overlay';
                bottomIndicator.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #ff0000;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(bottomIndicator);
                
                // Navigation height indicator
                const navIndicator = document.createElement('div');
                navIndicator.className = 'test-overlay';
                navIndicator.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 50px;
                    height: ${navHeight}px;
                    background: rgba(0, 255, 0, 0.3);
                    border: 2px solid #00ff00;
                    z-index: 9998;
                    pointer-events: none;
                `;
                document.body.appendChild(navIndicator);
                
                // Distance measurement
                const distanceLabel = document.createElement('div');
                distanceLabel.className = 'test-overlay';
                distanceLabel.textContent = `Nav: ${navHeight}px (${(navHeight/viewportHeight*100).toFixed(1)}%) | Distance: ${distanceFromBottom}px`;
                distanceLabel.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 10px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-family: monospace;
                    border-radius: 4px;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(distanceLabel);
                
                // Touch target indicators
                const navElements = document.querySelectorAll('[class*="bg-white/95"][class*="backdrop-blur-xl"] button, [class*="bg-white/95"][class*="backdrop-blur-xl"] a');
                navElements.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const indicator = document.createElement('div');
                    indicator.className = 'test-overlay';
                    indicator.style.cssText = `
                        position: fixed;
                        top: ${rect.top}px;
                        left: ${rect.left}px;
                        width: ${rect.width}px;
                        height: ${rect.height}px;
                        border: 2px solid #ffff00;
                        background: rgba(255, 255, 0, 0.1);
                        z-index: 9997;
                        pointer-events: none;
                    `;
                    document.body.appendChild(indicator);
                    
                    // Touch target size label
                    const sizeLabel = document.createElement('div');
                    sizeLabel.className = 'test-overlay';
                    sizeLabel.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
                    sizeLabel.style.cssText = `
                        position: fixed;
                        top: ${rect.top + rect.height + 5}px;
                        left: ${rect.left}px;
                        background: rgba(255, 255, 0, 0.9);
                        color: black;
                        padding: 2px 6px;
                        font-size: 10px;
                        font-family: monospace;
                        border-radius: 2px;
                        z-index: 9999;
                        pointer-events: none;
                    `;
                    document.body.appendChild(sizeLabel);
                });
            }
        }, navBoundingBox?.height || 0, viewportHeight, viewportHeight - (navBoundingBox?.y || 0) - (navBoundingBox?.height || 0));
        
        // Capture screenshots
        await page.screenshot({
            path: 'mobile-nav-validation-step1-with-measurements.png',
            fullPage: false
        });
        console.log('✅ Measurement screenshot captured: mobile-nav-validation-step1-with-measurements.png');
        
        await page.screenshot({
            path: 'mobile-nav-validation-step2-full-page.png',
            fullPage: true
        });
        console.log('✅ Full page screenshot captured: mobile-nav-validation-step2-full-page.png');
        
        // Clean up overlays
        await page.evaluate(() => {
            const overlays = document.querySelectorAll('.test-overlay');
            overlays.forEach(el => el.remove());
        });
        
        await page.screenshot({
            path: 'mobile-nav-validation-step3-clean.png',
            fullPage: false
        });
        console.log('✅ Clean screenshot captured: mobile-nav-validation-step3-clean.png');
        
        // ✅ FINAL SUMMARY
        console.log('\n🎉 VALIDATION SUMMARY - HEIGHT OPTIMIZATION RESULTS');
        console.log('==================================================');
        
        if (navBoundingBox) {
            const distanceFromBottom = viewportHeight - (navBoundingBox.y + navBoundingBox.height);
            const navSpacePercent = (navBoundingBox.height / viewportHeight) * 100;
            const touchTargetOptimal = minTouchTarget >= 44;
            const positionOptimal = distanceFromBottom >= 0 && distanceFromBottom <= 5;
            const spaceOptimal = Math.abs(navSpacePercent - 13) <= 3;
            
            console.log(`✅ Navigation Positioning: ${positionOptimal ? 'OPTIMAL' : 'NEEDS ADJUSTMENT'}`);
            console.log(`   • Distance from bottom: ${distanceFromBottom}px`);
            console.log(`   • Within viewport: ${navBoundingBox.y + navBoundingBox.height <= viewportHeight}`);
            
            console.log(`✅ Space Allocation: ${spaceOptimal ? 'TARGET ACHIEVED' : 'NEEDS ADJUSTMENT'}`);
            console.log(`   • Navigation space: ${navSpacePercent.toFixed(1)}% (target: ~13%)`);
            console.log(`   • Height optimization: ${navSpacePercent > 10 ? 'SUCCESS' : 'INCOMPLETE'}`);
            
            console.log(`✅ Touch Targets: ${touchTargetOptimal ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}`);
            console.log(`   • Minimum size: ${minTouchTarget.toFixed(1)}px (required: ≥44px)`);
            console.log(`   • Accessibility level: ${minTouchTarget >= 60 ? 'Premium (60px+)' : minTouchTarget >= 44 ? 'Standard (44px+)' : 'Insufficient'}`);
            
            console.log(`✅ Content Layout: ${documentHeight <= viewportHeight ? 'SINGLE SCREEN' : 'SCROLLABLE'}`);
            console.log(`   • Document height: ${documentHeight}px`);
            console.log(`   • Viewport utilization: ${(documentHeight / viewportHeight * 100).toFixed(1)}%`);
            
            console.log(`✅ Element Overlaps: ${overlapIssues === 0 ? 'NONE DETECTED' : `${overlapIssues} ISSUE(S) FOUND`}`);
            
            // Overall success assessment
            const overallSuccess = positionOptimal && touchTargetOptimal && (overlapIssues === 0) && spaceOptimal;
            console.log(`\n🏆 OVERALL OPTIMIZATION: ${overallSuccess ? '🎉 SUCCESS!' : '⚠️  PARTIAL SUCCESS - Review needed'}`);
            
            if (overallSuccess) {
                console.log('🎯 Height optimization successfully implemented!');
                console.log('📱 Bottom navigation is properly positioned with adequate touch targets.');
                console.log('🚀 Mobile user experience significantly improved.');
            } else {
                console.log('📋 Review the specific issues above and consider further adjustments.');
            }
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        await page.screenshot({ path: 'mobile-nav-validation-error.png' });
    } finally {
        await browser.close();
        console.log('\n🏁 Mobile navigation validation completed.');
        console.log('📸 Screenshots saved for visual verification.');
    }
}

// Run the validation
validateMobileNavOptimized().catch(console.error);