const { chromium } = require('playwright');

async function testUpdatedComponents() {
  console.log('🔍 Testing Updated LiveSite Header/Footer');
  console.log('==========================================');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('⏳ Waiting for server to be ready...');
    
    // Wait for server with multiple attempts
    let serverReady = false;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch('http://localhost:3000/');
        if (response.ok) {
          serverReady = true;
          break;
        }
      } catch (e) {
        console.log(`Attempt ${i + 1}/10: Server not ready yet...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    if (!serverReady) {
      console.log('❌ Server not ready after 50 seconds');
      return;
    }
    
    console.log('✅ Server ready, navigating to home page...');
    
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('⏳ Waiting for components to load...');
    await page.waitForTimeout(5000);
    
    // Take screenshot of the updated page
    await page.screenshot({ 
      path: 'updated-home-page.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved as updated-home-page.png');
    
    // Check for ACTUAL live site content
    console.log('\n📊 Checking for Live Site Header Content:');
    
    // Portuguese content from live site
    const inicio = await page.locator('text=Início').count();
    const voosBrasil = await page.locator('text=Voos Brasil-EUA').count();
    const whatsapp = await page.locator('text=WhatsApp').count();
    const ptLanguage = await page.locator('text=🇧🇷 PT').count();
    
    console.log(`- "Início" link: ${inicio > 0 ? '✅' : '❌'}`);
    console.log(`- "Voos Brasil-EUA": ${voosbrasil > 0 ? '✅' : '❌'}`);
    console.log(`- WhatsApp button: ${whatsapp > 0 ? '✅' : '❌'}`);
    console.log(`- PT language flag: ${ptLanguage > 0 ? '✅' : '❌'}`);
    
    console.log('\n📊 Checking for Live Site Footer Content:');
    
    // Portuguese footer content
    const especialistas = await page.locator('text=Especialistas em viagens Brasil-EUA').count();
    const nossosServicos = await page.locator('text=Nossos Serviços').count();
    const passagensAereas = await page.locator('text=Passagens Aéreas').count();
    const brasileiros = await page.locator('text=para brasileiros').count();
    
    console.log(`- "Especialistas em viagens": ${especialistas > 0 ? '✅' : '❌'}`);
    console.log(`- "Nossos Serviços": ${nossosServicos > 0 ? '✅' : '❌'}`);
    console.log(`- "Passagens Aéreas": ${passagensAereas > 0 ? '✅' : '❌'}`);
    console.log(`- "para brasileiros": ${brasileiros > 0 ? '✅' : '❌'}`);
    
    // Check for debug messages
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('LiveSite')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Reload to capture console messages
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    console.log('\n📝 Console Messages:');
    if (consoleLogs.length > 0) {
      consoleLogs.forEach(log => console.log(`- ${log}`));
    } else {
      console.log('- No LiveSite console messages captured');
    }
    
    // Summary
    const headerWorking = inicio > 0 && voosbrasil > 0 && whatsapp > 0;
    const footerWorking = especialistas > 0 && nossosServicos > 0 && passagensAereas > 0;
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 FINAL RESULT');
    console.log('='.repeat(50));
    
    if (headerWorking && footerWorking) {
      console.log('🎉 SUCCESS: Both header and footer match live fly2any.com!');
      console.log('✅ Portuguese content is displaying correctly');
      console.log('✅ Brazil-USA travel theme is active');
    } else if (headerWorking) {
      console.log('⚠️ Header working, footer needs attention');
    } else if (footerWorking) {
      console.log('⚠️ Footer working, header needs attention');
    } else {
      console.log('❌ Components not displaying correctly');
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testUpdatedComponents().catch(console.error);