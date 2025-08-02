#!/usr/bin/env node

/**
 * Script para detectar overflow horizontal na página /voos
 * Executa testes automatizados em diferentes resoluções
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configurações de teste
const testConfigs = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop Small', width: 1024, height: 768 },
  { name: 'Desktop Large', width: 1440, height: 900 }
];

console.log('🔍 Testando overflow horizontal na página /voos...\n');

// Verifica se o servidor dev está rodando
try {
  execSync('curl -s http://localhost:3000 > /dev/null', { stdio: 'ignore' });
  console.log('✅ Servidor dev detectado em localhost:3000');
} catch (error) {
  console.log('❌ Servidor dev não está rodando. Inicie com: npm run dev');
  process.exit(1);
}

// Cria script de teste com Playwright
const playwrightTest = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testConfigs = ${JSON.stringify(testConfigs)};
  const results = [];
  
  for (const config of testConfigs) {
    await page.setViewportSize({ width: config.width, height: config.height });
    
    try {
      await page.goto('http://localhost:3000/voos', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Aguarda o carregamento completo
      await page.waitForTimeout(2000);
      
      // Verifica overflow horizontal
      const bodyScroll = await page.evaluate(() => {
        return {
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.body.clientWidth,
          hasHorizontalOverflow: document.body.scrollWidth > document.body.clientWidth
        };
      });
      
      // Verifica elementos específicos problemáticos
      const problemElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const problems = [];
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          
          // Verifica se elemento sai da viewport
          if (rect.right > window.innerWidth && el.offsetParent !== null) {
            problems.push({
              tagName: el.tagName,
              className: el.className || '',
              width: rect.width,
              right: rect.right,
              overflow: rect.right - window.innerWidth
            });
          }
        });
        
        return problems.slice(0, 5); // Limita a 5 elementos
      });
      
      results.push({
        config: config.name,
        viewport: \`\${config.width}x\${config.height}\`,
        hasOverflow: bodyScroll.hasHorizontalOverflow,
        scrollWidth: bodyScroll.scrollWidth,
        clientWidth: bodyScroll.clientWidth,
        overflowAmount: bodyScroll.scrollWidth - bodyScroll.clientWidth,
        problemElements: problemElements
      });
      
      console.log(\`\${config.name} (\${config.width}x\${config.height}): \${bodyScroll.hasHorizontalOverflow ? '❌ HAS OVERFLOW' : '✅ NO OVERFLOW'}\`);
      
    } catch (error) {
      console.log(\`❌ Erro ao testar \${config.name}: \${error.message}\`);
      results.push({
        config: config.name,
        viewport: \`\${config.width}x\${config.height}\`,
        error: error.message
      });
    }
  }
  
  // Salva resultados detalhados
  require('fs').writeFileSync('overflow-test-results.json', JSON.stringify(results, null, 2));
  
  await browser.close();
  
  // Resumo final
  console.log('\\n📊 RESUMO DOS TESTES:');
  const overflowCount = results.filter(r => r.hasOverflow).length;
  const totalTests = results.filter(r => !r.error).length;
  
  console.log(\`Total de testes: \${totalTests}\`);
  console.log(\`Com overflow: \${overflowCount}\`);
  console.log(\`Sem overflow: \${totalTests - overflowCount}\`);
  
  if (overflowCount > 0) {
    console.log('\\n⚠️  PROBLEMAS ENCONTRADOS:');
    results.filter(r => r.hasOverflow).forEach(result => {
      console.log(\`- \${result.config}: +\${result.overflowAmount}px de overflow\`);
      if (result.problemElements.length > 0) {
        result.problemElements.forEach(el => {
          console.log(\`  → \${el.tagName}.\${el.className}: +\${Math.round(el.overflow)}px\`);
        });
      }
    });
  } else {
    console.log('\\n🎉 NENHUM OVERFLOW DETECTADO!');
  }
  
  console.log('\\n📄 Resultados detalhados salvos em: overflow-test-results.json');
})();
`;

// Salva o script de teste
fs.writeFileSync('/tmp/playwright-overflow-test.js', playwrightTest);

try {
  // Instala playwright se necessário
  try {
    require.resolve('playwright');
  } catch (e) {
    console.log('📦 Instalando Playwright...');
    execSync('npm install --no-save playwright', { stdio: 'inherit' });
  }
  
  // Executa o teste
  console.log('🚀 Executando testes de overflow...\n');
  execSync('node /tmp/playwright-overflow-test.js', { stdio: 'inherit' });
  
} catch (error) {
  console.log(`\n❌ Erro ao executar testes: ${error.message}`);
  
  // Fallback: teste manual simplificado
  console.log('\n🔄 Executando teste simplificado...');
  
  testConfigs.forEach(config => {
    console.log(`\n📱 ${config.name} (${config.width}x${config.height}):`);
    console.log(`   Verifique manualmente: http://localhost:3000/voos`);
    console.log(`   Redimensione o navegador para ${config.width}x${config.height}`);
    console.log(`   Procure por scrollbar horizontal ou elementos cortados`);
  });
  
  console.log('\n💡 Para teste automatizado completo, instale: npm install playwright');
}

console.log('\n✅ Teste de overflow concluído!');