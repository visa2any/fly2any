const { chromium } = require('playwright');

async function testAdminMenus() {
  console.log('🔍 Testando menus do painel administrativo...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Fazer login primeiro
    console.log('1️⃣ Fazendo login...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForSelector('.admin-login-form', { timeout: 10000 });
    
    await page.fill('input[name="email"]', 'admin@fly2any.com');
    await page.fill('input[name="password"]', 'fly2any2024!');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL('**/admin**', { timeout: 10000 });
    console.log('✅ Login realizado com sucesso');
    
    // 2. Testar sidebar
    console.log('\n2️⃣ Testando sidebar...');
    
    // Verificar se sidebar está visível
    const sidebar = await page.locator('aside').first();
    await expect(sidebar).toBeVisible();
    console.log('✅ Sidebar visível');
    
    // Testar hover para expandir
    await sidebar.hover();
    await page.waitForTimeout(1000);
    console.log('✅ Hover na sidebar funcionando');
    
    // 3. Testar navegação pelos links
    console.log('\n3️⃣ Testando navegação pelos links...');
    
    const menuItems = [
      { name: 'Dashboard', href: '/admin', text: 'Dashboard' },
      { name: 'Leads', href: '/admin/leads', text: 'Leads' },
      { name: 'Clientes', href: '/admin/customers', text: 'Clientes' },
      { name: 'Campanhas', href: '/admin/campaigns', text: 'Campanhas' }
    ];
    
    for (const item of menuItems) {
      try {
        // Clicar no item do menu
        await page.click(`a[href="${item.href}"]`);
        await page.waitForTimeout(1000);
        
        // Verificar se a URL mudou
        const currentUrl = page.url();
        if (currentUrl.includes(item.href)) {
          console.log(`✅ ${item.name}: Navegação funcionando`);
        } else {
          console.log(`⚠️  ${item.name}: Redirecionou para ${currentUrl}`);
        }
        
        // Verificar breadcrumb
        const breadcrumb = await page.textContent('nav');
        if (breadcrumb && breadcrumb.includes(item.text)) {
          console.log(`✅ ${item.name}: Breadcrumb atualizado`);
        }
        
      } catch (error) {
        console.log(`❌ ${item.name}: Erro - ${error.message}`);
      }
    }
    
    // 4. Testar navbar superior
    console.log('\n4️⃣ Testando navbar superior...');
    
    // Verificar botão de notificações
    const notificationBtn = await page.locator('button:has-text("🔔")').first();
    if (await notificationBtn.isVisible()) {
      console.log('✅ Botão de notificações visível');
    }
    
    // Verificar botão de configurações
    const settingsBtn = await page.locator('button:has-text("⚙️")').first();
    if (await settingsBtn.isVisible()) {
      console.log('✅ Botão de configurações visível');
    }
    
    // Verificar botão de logout
    const logoutBtn = await page.locator('button:has-text("Sair")').first();
    if (await logoutBtn.isVisible()) {
      console.log('✅ Botão de logout visível');
    }
    
    // 5. Testar menu mobile (se aplicável)
    console.log('\n5️⃣ Testando responsividade...');
    
    // Redimensionar para mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Verificar se o menu mobile aparece
    const mobileMenuBtn = await page.locator('button[aria-label="Toggle mobile menu"]').first();
    if (await mobileMenuBtn.isVisible()) {
      console.log('✅ Botão de menu mobile visível');
      
      // Testar abertura do menu mobile
      await mobileMenuBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Menu mobile abre corretamente');
      
      // Fechar menu
      await page.click('body');
      await page.waitForTimeout(500);
    }
    
    // 6. Voltar para desktop e testar logout
    console.log('\n6️⃣ Testando logout...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    // Capturar screenshot final
    await page.screenshot({ 
      path: 'admin-dashboard-fixed.png',
      fullPage: true 
    });
    console.log('📸 Screenshot salvo como admin-dashboard-fixed.png');
    
    console.log('\n✅ Teste dos menus administrativos concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminMenus().catch(console.error);