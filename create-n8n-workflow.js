const puppeteer = require('puppeteer');

async function createEmailMarketingWorkflow() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🌐 Acessando N8N...');
    await page.goto('https://n8n-production-81b6.up.railway.app', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Aguardar a interface carregar
    await page.waitForTimeout(5000);
    
    // Verificar se há formulário de login
    const loginForm = await page.$('input[type="email"], input[type="password"]');
    
    if (loginForm) {
      console.log('🔐 Formulário de login detectado. Precisa configurar credenciais...');
      
      // Se houver login, vamos tentar credenciais padrão ou pular
      try {
        await page.type('input[type="email"]', 'admin@n8n.io');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      } catch (e) {
        console.log('⚠️ Não foi possível fazer login automaticamente');
      }
    }
    
    // Aguardar carregar dashboard/workflows
    await page.waitForTimeout(5000);
    
    // Tentar encontrar botão para criar novo workflow
    const createButton = await page.$('[data-test-id="create-workflow"], .el-button--primary, button:contains("New"), a[href*="workflow/new"]');
    
    if (createButton) {
      console.log('✅ Botão de criar workflow encontrado!');
      await createButton.click();
      await page.waitForTimeout(3000);
    } else {
      // Tentar navegar diretamente para criação de workflow
      console.log('🔄 Tentando navegar diretamente...');
      await page.goto('https://n8n-production-81b6.up.railway.app/workflow/new');
      await page.waitForTimeout(5000);
    }
    
    // Fazer screenshot para debug
    await page.screenshot({ path: '/mnt/d/Users/vilma/fly2any/n8n-debug.png', fullPage: true });
    console.log('📸 Screenshot salvo como n8n-debug.png');
    
    // Tentar encontrar elementos da interface do workflow
    const workflowCanvas = await page.$('.workflow-canvas, .node-view, .node-creator');
    
    if (workflowCanvas) {
      console.log('🎯 Interface de workflow detectada!');
      
      // Aqui você pode continuar com a automação específica do N8N
      // Por exemplo, adicionar nós, configurar webhook, etc.
      
      console.log('📋 Instruções para configuração manual:');
      console.log('1. Adicione um nó Webhook');
      console.log('2. Configure o path: /webhook/email-marketing-final');
      console.log('3. Adicione nó Gmail para envio');
      console.log('4. Configure rate limiting');
      console.log('5. Ative o workflow');
      
    } else {
      console.log('❌ Interface de workflow não encontrada');
    }
    
    // Manter browser aberto para inspeção manual
    console.log('🔍 Browser mantido aberto para inspeção manual...');
    console.log('Pressione Ctrl+C quando terminar');
    
    // Aguardar indefinidamente
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await browser.close();
  }
}

createEmailMarketingWorkflow();