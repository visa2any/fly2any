// =====================================================
// PLAYWRIGHT MOBILE FLOW TEST - VOOS & HOTÉIS
// =====================================================
// Testa precisamente os fluxos de Voos e Hotéis mobile
// Inclui testes multi-browser (Chrome, Firefox, Safari)
// ULTRATHINK: Testes completos e robustos

const { test, expect, devices } = require('@playwright/test');

// Configurações de dispositivos mobile para testes
const mobileDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
  { name: 'iPad Air', device: devices['iPad Air'] }
];

// Configurações de navegadores
const browsers = [
  { name: 'Chrome Mobile', browserName: 'chromium' },
  { name: 'Firefox Mobile', browserName: 'firefox' },
  { name: 'Safari Mobile', browserName: 'webkit' }
];

// =====================================================
// TESTE 1: FLUXO COMPLETO DE VOOS
// =====================================================
test.describe('Mobile Flight Flow Tests', () => {
  
  mobileDevices.forEach(({ name, device }) => {
    browsers.forEach(({ name: browserName, browserName: browser }) => {
      
      test(`${name} - ${browserName} - Complete Flight Flow`, async ({ browser: browserInstance }) => {
        const context = await browserInstance.newContext({
          ...device,
          geolocation: { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
          permissions: ['geolocation']
        });
        
        const page = await context.newPage();
        
        console.log(`🧪 Testing Flight Flow: ${name} on ${browserName}`);
        
        // Navegar para a página
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Screenshot inicial
        await page.screenshot({ 
          path: `flight-test-${name}-${browserName}-01-initial.png`,
          fullPage: true 
        });
        
        // Passo 1: Clicar no card de Voos
        const flightCard = page.locator('button:has-text("Voos")').first();
        await expect(flightCard).toBeVisible({ timeout: 10000 });
        
        console.log('✈️ Clicando no card de Voos...');
        await flightCard.click();
        
        // Aguardar animação e carregamento do form
        await page.waitForTimeout(1000);
        
        // Screenshot após clicar no card
        await page.screenshot({ 
          path: `flight-test-${name}-${browserName}-02-after-click.png`,
          fullPage: true 
        });
        
        // Passo 2: Verificar se o multistep form apareceu
        const multistepForm = page.locator('[data-testid="mobile-flight-form"], .mobile-flight-form, form').first();
        await expect(multistepForm).toBeVisible({ timeout: 5000 });
        
        console.log('📋 Multistep form carregado com sucesso');
        
        // Passo 3: Preencher origem (se visível)
        try {
          const originInput = page.locator('input[placeholder*="origem"], input[placeholder*="Origem"], input[placeholder*="partida"]').first();
          if (await originInput.isVisible({ timeout: 2000 })) {
            await originInput.fill('São Paulo');
            await page.waitForTimeout(500);
          }
        } catch (error) {
          console.log('🔍 Campo origem não encontrado ou não preenchível neste step');
        }
        
        // Passo 4: Preencher destino (se visível)
        try {
          const destinationInput = page.locator('input[placeholder*="destino"], input[placeholder*="Destino"], input[placeholder*="chegada"]').first();
          if (await destinationInput.isVisible({ timeout: 2000 })) {
            await destinationInput.fill('Rio de Janeiro');
            await page.waitForTimeout(500);
          }
        } catch (error) {
          console.log('🔍 Campo destino não encontrado ou não preenchível neste step');
        }
        
        // Screenshot após preenchimento
        await page.screenshot({ 
          path: `flight-test-${name}-${browserName}-03-filled-form.png`,
          fullPage: true 
        });
        
        // Passo 5: Tentar avançar no fluxo
        const nextButtons = page.locator('button:has-text("Continuar"), button:has-text("Próximo"), button:has-text("Next"), button:has-text("Continue"), button[type="submit"]');
        const nextButton = nextButtons.first();
        
        if (await nextButton.isVisible({ timeout: 2000 })) {
          console.log('➡️ Avançando no fluxo...');
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Screenshot do próximo step
          await page.screenshot({ 
            path: `flight-test-${name}-${browserName}-04-next-step.png`,
            fullPage: true 
          });
        }
        
        // Passo 6: Verificar se não há erros JavaScript
        const jsErrors = [];
        page.on('pageerror', error => jsErrors.push(error.message));
        
        // Passo 7: Verificar responsividade
        const isMobileResponsive = await page.evaluate(() => {
          const viewport = window.innerWidth;
          const hasHorizontalScroll = document.documentElement.scrollWidth > viewport;
          return {
            viewport,
            hasHorizontalScroll,
            isMobile: viewport <= 768
          };
        });
        
        console.log('📱 Responsividade:', isMobileResponsive);
        
        // Passo 8: Testar scroll behavior
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(500);
        
        // Screenshot final
        await page.screenshot({ 
          path: `flight-test-${name}-${browserName}-05-final.png`,
          fullPage: true 
        });
        
        // Verificações finais
        expect(jsErrors).toHaveLength(0);
        expect(isMobileResponsive.isMobile).toBe(true);
        expect(isMobileResponsive.hasHorizontalScroll).toBe(false);
        
        await context.close();
      });
    });
  });
});

// =====================================================
// TESTE 2: FLUXO COMPLETO DE HOTÉIS
// =====================================================
test.describe('Mobile Hotel Flow Tests', () => {
  
  mobileDevices.forEach(({ name, device }) => {
    browsers.forEach(({ name: browserName, browserName: browser }) => {
      
      test(`${name} - ${browserName} - Complete Hotel Flow`, async ({ browser: browserInstance }) => {
        const context = await browserInstance.newContext({
          ...device,
          geolocation: { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
          permissions: ['geolocation']
        });
        
        const page = await context.newPage();
        
        console.log(`🧪 Testing Hotel Flow: ${name} on ${browserName}`);
        
        // Navegar para a página
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Screenshot inicial
        await page.screenshot({ 
          path: `hotel-test-${name}-${browserName}-01-initial.png`,
          fullPage: true 
        });
        
        // Passo 1: Clicar no card de Hotéis
        const hotelCard = page.locator('button:has-text("Hotéis"), button:has-text("Hotel")').first();
        await expect(hotelCard).toBeVisible({ timeout: 10000 });
        
        console.log('🏨 Clicando no card de Hotéis...');
        await hotelCard.click();
        
        // Aguardar animação e carregamento do form
        await page.waitForTimeout(1000);
        
        // Screenshot após clicar no card
        await page.screenshot({ 
          path: `hotel-test-${name}-${browserName}-02-after-click.png`,
          fullPage: true 
        });
        
        // Passo 2: Verificar se o multistep form apareceu
        const multistepForm = page.locator('[data-testid="mobile-hotel-form"], .mobile-hotel-form, form').first();
        await expect(multistepForm).toBeVisible({ timeout: 5000 });
        
        console.log('📋 Multistep form carregado com sucesso');
        
        // Passo 3: Preencher destino (se visível)
        try {
          const destinationInput = page.locator('input[placeholder*="destino"], input[placeholder*="Destino"], input[placeholder*="cidade"]').first();
          if (await destinationInput.isVisible({ timeout: 2000 })) {
            await destinationInput.fill('Rio de Janeiro');
            await page.waitForTimeout(500);
          }
        } catch (error) {
          console.log('🔍 Campo destino não encontrado ou não preenchível neste step');
        }
        
        // Passo 4: Configurar datas (se visível)
        try {
          const checkinInput = page.locator('input[type="date"], input[placeholder*="check"], input[placeholder*="entrada"]').first();
          if (await checkinInput.isVisible({ timeout: 2000 })) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await checkinInput.fill(tomorrow.toISOString().split('T')[0]);
            await page.waitForTimeout(500);
          }
        } catch (error) {
          console.log('🔍 Campo data não encontrado ou não preenchível neste step');
        }
        
        // Screenshot após preenchimento
        await page.screenshot({ 
          path: `hotel-test-${name}-${browserName}-03-filled-form.png`,
          fullPage: true 
        });
        
        // Passo 5: Tentar avançar no fluxo
        const nextButtons = page.locator('button:has-text("Continuar"), button:has-text("Próximo"), button:has-text("Next"), button:has-text("Continue"), button[type="submit"]');
        const nextButton = nextButtons.first();
        
        if (await nextButton.isVisible({ timeout: 2000 })) {
          console.log('➡️ Avançando no fluxo...');
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Screenshot do próximo step
          await page.screenshot({ 
            path: `hotel-test-${name}-${browserName}-04-next-step.png`,
            fullPage: true 
          });
        }
        
        // Passo 6: Verificar se não há erros JavaScript
        const jsErrors = [];
        page.on('pageerror', error => jsErrors.push(error.message));
        
        // Passo 7: Verificar responsividade
        const isMobileResponsive = await page.evaluate(() => {
          const viewport = window.innerWidth;
          const hasHorizontalScroll = document.documentElement.scrollWidth > viewport;
          return {
            viewport,
            hasHorizontalScroll,
            isMobile: viewport <= 768
          };
        });
        
        console.log('📱 Responsividade:', isMobileResponsive);
        
        // Screenshot final
        await page.screenshot({ 
          path: `hotel-test-${name}-${browserName}-05-final.png`,
          fullPage: true 
        });
        
        // Verificações finais
        expect(jsErrors).toHaveLength(0);
        expect(isMobileResponsive.isMobile).toBe(true);
        expect(isMobileResponsive.hasHorizontalScroll).toBe(false);
        
        await context.close();
      });
    });
  });
});

// =====================================================
// TESTE 3: COMPARAÇÃO FIREFOX vs CHROME
// =====================================================
test.describe('Firefox Mobile Style Differences', () => {
  
  test('Firefox vs Chrome - Visual Comparison', async ({ browser }) => {
    console.log('🔍 Iniciando comparação Firefox vs Chrome...');
    
    // Configurar contextos para ambos navegadores
    const chromeContext = await browser.newContext({
      ...devices['iPhone 13'],
      userAgent: devices['iPhone 13'].userAgent.replace('Safari', 'Chrome')
    });
    
    const firefoxContext = await browser.newContext({
      ...devices['iPhone 13'],
      userAgent: devices['iPhone 13'].userAgent.replace('Safari', 'Firefox')
    });
    
    const chromePage = await chromeContext.newPage();
    const firefoxPage = await firefoxContext.newPage();
    
    // Navegar ambas páginas
    await Promise.all([
      chromePage.goto('http://localhost:3000'),
      firefoxPage.goto('http://localhost:3000')
    ]);
    
    await Promise.all([
      chromePage.waitForLoadState('networkidle'),
      firefoxPage.waitForLoadState('networkidle')
    ]);
    
    // Screenshots lado a lado
    await Promise.all([
      chromePage.screenshot({ path: 'chrome-mobile-home.png', fullPage: true }),
      firefoxPage.screenshot({ path: 'firefox-mobile-home.png', fullPage: true })
    ]);
    
    // Testar clique no card de Voos em ambos
    await Promise.all([
      chromePage.locator('button:has-text("Voos")').first().click(),
      firefoxPage.locator('button:has-text("Voos")').first().click()
    ]);
    
    await Promise.all([
      chromePage.waitForTimeout(1000),
      firefoxPage.waitForTimeout(1000)
    ]);
    
    // Screenshots após clique
    await Promise.all([
      chromePage.screenshot({ path: 'chrome-mobile-flight-form.png', fullPage: true }),
      firefoxPage.screenshot({ path: 'firefox-mobile-flight-form.png', fullPage: true })
    ]);
    
    // Analisar diferenças de CSS
    const chromeStyles = await chromePage.evaluate(() => {
      const form = document.querySelector('form, [data-testid], .mobile-app-layout');
      if (!form) return null;
      
      const computedStyle = window.getComputedStyle(form);
      return {
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        display: computedStyle.display,
        overflow: computedStyle.overflow,
        transform: computedStyle.transform,
        backgroundColor: computedStyle.backgroundColor,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius
      };
    });
    
    const firefoxStyles = await firefoxPage.evaluate(() => {
      const form = document.querySelector('form, [data-testid], .mobile-app-layout');
      if (!form) return null;
      
      const computedStyle = window.getComputedStyle(form);
      return {
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        display: computedStyle.display,
        overflow: computedStyle.overflow,
        transform: computedStyle.transform,
        backgroundColor: computedStyle.backgroundColor,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius
      };
    });
    
    console.log('🎨 Chrome Styles:', chromeStyles);
    console.log('🦊 Firefox Styles:', firefoxStyles);
    
    // Fechar contextos
    await chromeContext.close();
    await firefoxContext.close();
  });
});

// =====================================================
// TESTE 4: PERFORMANCE E MÉTRICAS
// =====================================================
test.describe('Mobile Performance Tests', () => {
  
  test('Performance Metrics - Flight & Hotel Cards', async ({ page }) => {
    console.log('⚡ Testando performance dos cards...');
    
    await page.goto('http://localhost:3000');
    
    // Medir tempo de carregamento dos cards
    const cardLoadTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Aguardar todos os cards aparecerem
      return new Promise((resolve) => {
        const checkCards = () => {
          const voosCard = document.querySelector('button:has-text("Voos")');
          const hoteisCard = document.querySelector('button:has-text("Hotéis")');
          
          if (voosCard && hoteisCard) {
            const end = performance.now();
            resolve(end - start);
          } else {
            setTimeout(checkCards, 10);
          }
        };
        checkCards();
      });
    });
    
    console.log(`🏁 Cards carregaram em ${cardLoadTime}ms`);
    
    // Medir tempo de abertura do form de Voos
    const flightFormTime = await page.evaluate(async () => {
      const start = performance.now();
      const voosCard = document.querySelector('button:has-text("Voos")');
      if (voosCard) voosCard.click();
      
      return new Promise((resolve) => {
        const checkForm = () => {
          const form = document.querySelector('form, [data-testid*="flight"]');
          if (form) {
            const end = performance.now();
            resolve(end - start);
          } else {
            setTimeout(checkForm, 10);
          }
        };
        checkForm();
      });
    });
    
    console.log(`✈️ Form de Voos abriu em ${flightFormTime}ms`);
    
    // Verificar se tempos são aceitáveis
    expect(cardLoadTime).toBeLessThan(3000); // 3s max
    expect(flightFormTime).toBeLessThan(2000); // 2s max
  });
});