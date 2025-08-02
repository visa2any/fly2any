/**
 * Script para analisar overflow horizontal na página /voos
 * Usa Playwright para testar em diferentes resoluções
 */

const { chromium } = require('playwright');

async function analyzeOverflow() {
  const browser = await chromium.launch({ headless: false });
  
  // Resoluções para testar
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop Small', width: 1024, height: 768 },
    { name: 'Desktop Large', width: 1440, height: 900 }
  ];

  const results = [];

  for (const viewport of viewports) {
    console.log(`🔍 Analisando ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    try {
      // Navegar para a página /voos
      await page.goto('http://localhost:3000/voos', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Aguardar carregamento completo
      await page.waitForTimeout(2000);

      // Verificar overflow horizontal
      const overflowInfo = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        const bodyWidth = body.scrollWidth;
        const htmlWidth = html.scrollWidth;
        const viewportWidth = window.innerWidth;
        
        const hasOverflow = bodyWidth > viewportWidth || htmlWidth > viewportWidth;
        
        // Encontrar elementos que excedem a largura da viewport
        const overflowElements = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);
          
          // Verificar se o elemento excede a largura da viewport
          if (rect.right > viewportWidth) {
            const tagName = element.tagName.toLowerCase();
            const className = element.className || '';
            const id = element.id || '';
            
            overflowElements.push({
              index,
              tagName,
              className: typeof className === 'string' ? className : '',
              id,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              overflow: Math.round(rect.right - viewportWidth),
              position: computedStyle.position,
              display: computedStyle.display,
              transform: computedStyle.transform,
              marginLeft: computedStyle.marginLeft,
              marginRight: computedStyle.marginRight,
              paddingLeft: computedStyle.paddingLeft,
              paddingRight: computedStyle.paddingRight,
              minWidth: computedStyle.minWidth,
              maxWidth: computedStyle.maxWidth,
              flexShrink: computedStyle.flexShrink,
              whiteSpace: computedStyle.whiteSpace,
              textOverflow: computedStyle.textOverflow
            });
          }
        });
        
        return {
          hasOverflow,
          bodyWidth,
          htmlWidth,
          viewportWidth,
          totalOverflow: Math.max(bodyWidth - viewportWidth, htmlWidth - viewportWidth),
          overflowElements: overflowElements.slice(0, 20) // Limitar a 20 elementos
        };
      });

      // Capturar screenshot
      await page.screenshot({
        path: `/mnt/d/Users/vilma/fly2any/overflow-analysis-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: true
      });

      results.push({
        viewport,
        ...overflowInfo
      });

    } catch (error) {
      console.error(`❌ Erro ao analisar ${viewport.name}:`, error.message);
      results.push({
        viewport,
        error: error.message
      });
    }
    
    await page.close();
  }

  await browser.close();

  // Gerar relatório
  console.log('\n📊 RELATÓRIO DE ANÁLISE DE OVERFLOW HORIZONTAL\n');
  console.log('='.repeat(60));

  results.forEach(result => {
    console.log(`\n📱 ${result.viewport.name} (${result.viewport.width}x${result.viewport.height})`);
    
    if (result.error) {
      console.log(`❌ Erro: ${result.error}`);
      return;
    }

    if (result.hasOverflow) {
      console.log(`🚨 OVERFLOW DETECTADO - ${result.totalOverflow}px além da viewport`);
      console.log(`📏 Body: ${result.bodyWidth}px | HTML: ${result.htmlWidth}px | Viewport: ${result.viewportWidth}px`);
      
      if (result.overflowElements.length > 0) {
        console.log(`\n🔍 Elementos problemáticos (${result.overflowElements.length}):`);
        
        result.overflowElements.forEach((el, index) => {
          console.log(`  ${index + 1}. <${el.tagName}>${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').join('.') : ''}`);
          console.log(`     🌐 Posição: ${el.left}px → ${el.right}px (largura: ${el.width}px)`);
          console.log(`     📏 Overflow: +${el.overflow}px além da viewport`);
          console.log(`     🎨 CSS: position: ${el.position}, display: ${el.display}`);
          if (el.minWidth !== 'auto' && el.minWidth !== '0px') {
            console.log(`     📐 min-width: ${el.minWidth}`);
          }
          if (el.transform !== 'none') {
            console.log(`     🔄 transform: ${el.transform}`);
          }
          console.log('');
        });
      }
    } else {
      console.log('✅ Sem overflow horizontal detectado');
    }
  });

  // Salvar relatório JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalViewports: viewports.length,
      viewportsWithOverflow: results.filter(r => r.hasOverflow).length,
      viewportsWithErrors: results.filter(r => r.error).length
    },
    results
  };

  require('fs').writeFileSync(
    '/mnt/d/Users/vilma/fly2any/overflow-analysis-report.json',
    JSON.stringify(reportData, null, 2)
  );

  console.log('\n💾 Relatório salvo em: overflow-analysis-report.json');
  console.log('📸 Screenshots salvos com prefixo: overflow-analysis-*.png');
}

// Executar análise
analyzeOverflow().catch(console.error);