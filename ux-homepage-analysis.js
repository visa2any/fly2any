const { chromium } = require('playwright');

async function analyzeHomepage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Set viewport size to desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Navigate to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'homepage-analysis.png', 
      fullPage: true 
    });
    
    // Extract key elements for analysis
    const analysis = await page.evaluate(() => {
      const extractTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
      };
      
      const extractAllTextContent = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.textContent.trim());
      };
      
      return {
        // Hero section analysis
        hero: {
          mainHeading: extractTextContent('h1'),
          subtitle: extractTextContent('h1 + p'),
          trustIndicators: extractAllTextContent('[style*="Trust Indicators"] span'),
          ctaButtons: extractAllTextContent('button, a[style*="background: linear-gradient"]')
        },
        
        // Form analysis
        form: {
          visible: !!document.querySelector('form'),
          steps: extractAllTextContent('[style*="Progresso da Cotação"]'),
          serviceOptions: extractAllTextContent('button[onClick*="setServiceType"]')
        },
        
        // Social proof elements
        socialProof: {
          testimonials: extractAllTextContent('[style*="testimonial"]'),
          ratings: extractAllTextContent('[style*="star"], [style*="estrelas"]'),
          clientCount: extractTextContent('[style*="clientes"]'),
          experience: extractTextContent('[style*="anos"]')
        },
        
        // Trust elements
        trustElements: {
          guarantees: extractAllTextContent('[style*="garantia"], [style*="gratuita"]'),
          responseTime: extractTextContent('[style*="2 horas"]'),
          ssl: extractTextContent('[style*="SSL"]')
        },
        
        // Page structure
        structure: {
          sections: document.querySelectorAll('section').length,
          hasChat: !!document.querySelector('[style*="FloatingChat"], [style*="WhatsApp"]'),
          hasNewsletter: !!document.querySelector('[style*="newsletter"]'),
          hasExitIntent: !!document.querySelector('[style*="ExitIntent"]')
        }
      };
    });
    
    console.log('Homepage Analysis Results:');
    console.log(JSON.stringify(analysis, null, 2));
    
    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'homepage-mobile-analysis.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
  }
  
  await browser.close();
}

analyzeHomepage();