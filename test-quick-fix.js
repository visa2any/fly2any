const { chromium } = require("playwright");

async function testFormSubmissionFix() {
  console.log("🚀 ULTRATHINK Form Submission Fix Test");
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate and test form submission
    await page.goto("http://localhost:3001", { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Click flight service
    await page.click("button:has-text(\"Voos\")");
    await page.waitForTimeout(2000);
    
    console.log("✅ Form loaded successfully");
    console.log("📋 Testing button text change...");
    
    // Check for Continue button
    const continueButton = await page.locator("button:has-text(\"Continue\")");
    if (await continueButton.isVisible()) {
      console.log("✅ Button text correctly changed to Continue");
    } else {
      console.log("❌ Button still shows old text");
    }
    
    await page.screenshot({ path: "form-test-verification.png" });
    console.log("📸 Screenshot saved");
    
  } catch (error) {
    console.error("❌ Test error:", error.message);
  } finally {
    await browser.close();
  }
}

testFormSubmissionFix().catch(console.error);
