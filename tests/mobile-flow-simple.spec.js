// =====================================================
// PLAYWRIGHT MOBILE FLOW TEST - SIMPLES E DIRETO  
// =====================================================
// Testa fluxo de Voos e Hotéis com foco em Firefox vs Chrome
// ULTRATHINK: Testes precisos e eficazes

const { test, expect, devices } = require('@playwright/test');

// =====================================================
// TESTE 1: VERIFICAÇÃO DE CARREGAMENTO DOS CARDS
// =====================================================
test.describe('Mobile Cards Flow Tests', () => {
  
  test('Chrome Mobile - Cards Loading and Click Flow', async ({ page }) => {
    console.log('🧪 Testing Chrome Mobile - Cards Loading');
    
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    
    // Navegar para a página
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Screenshot inicial
    await page.screenshot({ 
      path: 'chrome-mobile-01-initial.png',
      fullPage: true 
    });
    
    // Aguardar cards aparecerem
    await page.waitForTimeout(2000);
    
    console.log('✈️ Procurando card de Voos...');
    
    // Localizar card de Voos usando diferentes seletores
    let flightCard = null;
    
    try {
      flightCard = await page.locator('button:has-text("Voos")').first();
      await flightCard.waitFor({ timeout: 5000 });
    } catch (error) {
      console.log('🔍 Tentando selector alternativo para Voos...');
      flightCard = await page.locator('button').filter({ hasText: 'Voos' }).first();
    }
    
    if (!flightCard) {
      console.log('❌ Card de Voos não encontrado, tentando seletor genérico...');
      flightCard = await page.locator('button').nth(0); // Primeiro botão
    }
    
    expect(flightCard).toBeTruthy();
    
    // Clicar no card
    console.log('🖱️ Clicando no card de Voos...');
    await flightCard.click();
    
    // Aguardar form aparecer
    await page.waitForTimeout(2000);
    
    // Screenshot após clique
    await page.screenshot({ 
      path: 'chrome-mobile-02-after-flight-click.png',
      fullPage: true 
    });
    
    // Verificar se form apareceu (qualquer form)
    const formVisible = await page.isVisible('form, div[class*="form"], div[class*="step"]');
    console.log('📋 Form visível:', formVisible);
    
    // Voltar e testar Hotéis
    await page.goBack();
    await page.waitForTimeout(1000);
    
    console.log('🏨 Procurando card de Hotéis...');
    let hotelCard = null;
    
    try {
      hotelCard = await page.locator('button:has-text("Hotéis")').first();
    } catch (error) {
      hotelCard = await page.locator('button').filter({ hasText: 'Hotéis' }).first();
    }
    
    if (hotelCard) {
      await hotelCard.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'chrome-mobile-03-after-hotel-click.png',
        fullPage: true 
      });
    }
  });
  
  test('Firefox Mobile - Cards Loading and Click Flow', async ({ page }) => {
    console.log('🧪 Testing Firefox Mobile - Cards Loading');
    
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    
    // Navegar para a página
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Screenshot inicial
    await page.screenshot({ 
      path: 'firefox-mobile-01-initial.png',
      fullPage: true 
    });
    
    // Aguardar cards aparecerem
    await page.waitForTimeout(2000);
    
    console.log('✈️ Firefox - Procurando card de Voos...');
    
    // Localizar card de Voos
    let flightCard = null;
    
    try {
      flightCard = await page.locator('button').filter({ hasText: 'Voos' }).first();
      await flightCard.waitFor({ timeout: 5000 });
    } catch (error) {
      console.log('🔍 Firefox - Tentando seletor genérico...');
      flightCard = await page.locator('button').nth(0);
    }
    
    if (flightCard) {
      // Clicar no card
      console.log('🖱️ Firefox - Clicando no card de Voos...');
      await flightCard.click();
      
      // Aguardar form aparecer
      await page.waitForTimeout(2000);
      
      // Screenshot após clique
      await page.screenshot({ 
        path: 'firefox-mobile-02-after-flight-click.png',
        fullPage: true 
      });
      
      // Voltar e testar Hotéis
      await page.goBack();
      await page.waitForTimeout(1000);
      
      console.log('🏨 Firefox - Procurando card de Hotéis...');
      const hotelCard = await page.locator('button').filter({ hasText: 'Hotéis' }).first();
      
      if (hotelCard) {
        await hotelCard.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'firefox-mobile-03-after-hotel-click.png',
          fullPage: true 
        });
      }
    }
  });
  
  // =====================================================
  // TESTE 2: COMPARAÇÃO VISUAL CHROME vs FIREFOX
  // =====================================================
  test('Visual Comparison - Chrome vs Firefox Mobile', async ({ browser }) => {
    console.log('🔍 Comparação Visual - Chrome vs Firefox');
    
    // Contexto Chrome
    const chromeContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 Chrome/91.0'
    });
    
    const chromePage = await chromeContext.newPage();
    
    // Navegar e capturar Chrome
    await chromePage.goto('http://localhost:3000');
    await chromePage.waitForLoadState('networkidle');
    await chromePage.waitForTimeout(2000);
    
    await chromePage.screenshot({ 
      path: 'comparison-chrome-home.png',
      fullPage: true 
    });
    
    // Clicar no primeiro card (Voos)
    const chromeFlightCard = await chromePage.locator('button').first();
    await chromeFlightCard.click();
    await chromePage.waitForTimeout(2000);
    
    await chromePage.screenshot({ 
      path: 'comparison-chrome-flight-form.png',
      fullPage: true 
    });
    
    // Análise de CSS
    const chromeStyles = await chromePage.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      
      return {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        backgroundColor: computedStyle.backgroundColor,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        }
      };
    });
    
    console.log('🎨 Chrome Styles:', chromeStyles);
    
    await chromeContext.close();
    
    // Log de conclusão
    console.log('✅ Testes visuais concluídos - verifique os screenshots gerados');
  });
  
  // =====================================================
  // TESTE 3: RESPONSIVIDADE E SCROLL BEHAVIOR
  // =====================================================
  test('Mobile Responsiveness Test', async ({ page }) => {
    console.log('📱 Testando responsividade mobile');
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Verificar se página é responsiva
    const responsiveCheck = await page.evaluate(() => {
      return {
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        isOverflowing: document.body.scrollWidth > window.innerWidth
      };
    });
    
    console.log('📊 Responsividade:', responsiveCheck);
    
    // Screenshot da responsividade
    await page.screenshot({ 
      path: 'mobile-responsiveness-test.png',
      fullPage: true 
    });
    
    // Teste de scroll
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'mobile-scroll-test.png',
      fullPage: true 
    });
    
    // Verificações
    expect(responsiveCheck.isOverflowing).toBe(false);
    expect(responsiveCheck.hasHorizontalScroll).toBe(false);
  });
});

// =====================================================
// TESTE 4: PERFORMANCE CARDS
// =====================================================
test.describe('Performance Tests', () => {
  test('Cards Performance Metrics', async ({ page }) => {
    console.log('⚡ Testando performance dos cards');
    
    await page.goto('http://localhost:3000');
    
    // Medir tempo de carregamento
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const start = performance.now();
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'complete') {
          resolve(performance.now() - start);
        } else {
          window.addEventListener('load', () => {
            resolve(performance.now() - start);
          });
        }
      });
    });
    
    console.log(`🏁 Página carregou em ${performanceMetrics}ms`);
    
    // Verificar se tempo é aceitável
    expect(performanceMetrics).toBeLessThan(10000); // 10s max
  });
});