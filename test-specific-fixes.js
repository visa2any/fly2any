const { chromium } = require("playwright");

async function testSpecificFixes() {
  console.log("🔍 ULTRATHINK Specific Fixes Verification");
  console.log("==========================================");
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to app
    console.log("📱 Loading mobile app...");
    await page.goto("http://localhost:3001");
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: "fix-test-1-homepage.png", fullPage: true });
    console.log("✅ Homepage loaded");
    
    // Click on Voos to open flight form
    console.log("✈️ Opening flight form...");
    await page.waitForSelector("button", { timeout: 10000 });
    
    // Try different selectors to find the flight button
    const flightButton = await page.locator("button").filter({ hasText: "Voos" }).or(
      page.locator("button").filter({ hasText: "✈️" })
    ).first();
    
    if (await flightButton.isVisible()) {
      await flightButton.click();
      await page.waitForTimeout(3000);
      console.log("✅ Flight form opened");
      
      await page.screenshot({ path: "fix-test-2-form-opened.png", fullPage: true });
      
      // Test 1: Check for Continue button (should be fixed from "Próximo")
      console.log("🔍 Testing Continue button fix...");
      const continueButton = page.locator("button").filter({ hasText: "Continue" });
      const proximoButton = page.locator("button").filter({ hasText: "Próximo" });
      
      if (await continueButton.isVisible()) {
        console.log("✅ FIXED: Button correctly shows 'Continue'");
      } else if (await proximoButton.isVisible()) {
        console.log("❌ NOT FIXED: Button still shows 'Próximo'");
      } else {
        console.log("ℹ️  Button not found - checking all buttons...");
        const allButtons = await page.locator("button").allTextContents();
        console.log("Available buttons:", allButtons);
      }
      
      // Test 2: Check if PhoneInput dropdown can be accessed
      console.log("📞 Testing WhatsApp dropdown accessibility...");
      
      // Navigate to contact step if possible
      const nextButton = page.locator("button").filter({ hasText: /Continue|Próximo|Next/ }).first();
      if (await nextButton.isVisible()) {
        // Fill minimal travel data first if needed
        console.log("📝 Attempting to proceed to contact step...");
        
        // Look for any visible input fields and try basic interaction
        try {
          await nextButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ Moved to next step");
          
          await page.screenshot({ path: "fix-test-3-next-step.png", fullPage: true });
          
          // Look for phone input
          const phoneDropdown = page.locator("button").filter({ hasText: /🇧🇷|\+55/ });
          if (await phoneDropdown.isVisible()) {
            console.log("🔍 Testing phone dropdown visibility fix...");
            await phoneDropdown.click();
            await page.waitForTimeout(1000);
            
            await page.screenshot({ path: "fix-test-4-dropdown-opened.png", fullPage: true });
            
            // Check if dropdown items are visible
            const dropdownItem = page.locator("text=Brasil").or(page.locator("text=Estados Unidos"));
            if (await dropdownItem.isVisible()) {
              console.log("✅ FIXED: Phone dropdown is properly visible!");
            } else {
              console.log("❌ Phone dropdown items not visible");
            }
          } else {
            console.log("ℹ️  Phone dropdown not found in current step");
          }
          
        } catch (e) {
          console.log("ℹ️  Could not test phone dropdown - form navigation issue");
        }
      }
      
      console.log("\n📊 Fix Verification Summary:");
      console.log("- Continue button text: Checked");
      console.log("- WhatsApp dropdown: Attempted verification");
      console.log("- Screenshots saved for manual review");
      
    } else {
      console.log("❌ Could not find flight button");
      const allButtons = await page.locator("button").allTextContents();
      console.log("Available buttons:", allButtons);
    }
    
    await page.screenshot({ path: "fix-test-final.png", fullPage: true });
    
  } catch (error) {
    console.error("❌ Test error:", error.message);
    await page.screenshot({ path: "fix-test-error.png", fullPage: true });
  } finally {
    await browser.close();
  }
}

testSpecificFixes().catch(console.error);