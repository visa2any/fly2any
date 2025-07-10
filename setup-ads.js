#!/usr/bin/env node

// Script de configuração automática para campanhas pagas
// Execute: node setup-ads.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdsConfiguration() {
  console.log('🚀 CONFIGURAÇÃO DE CAMPANHAS PAGAS - FLY2ANY\n');
  
  console.log('📋 Vou configurar todos os IDs das plataformas de anúncios:\n');
  
  // Google Ads Configuration
  console.log('🔵 GOOGLE ADS:');
  const googleAdsId = await question('Google Ads ID (AW-XXXXXXXXXX): ');
  const googleConversionId = await question('Conversion ID (XXXXXXXXXX): ');
  const googleFormLabel = await question('Form Conversion Label: ');
  const googlePhoneLabel = await question('Phone Conversion Label: ');
  const googleWhatsAppLabel = await question('WhatsApp Conversion Label: ');
  
  console.log('\n🔵 META/FACEBOOK:');
  const facebookPixelId = await question('Facebook Pixel ID: ');
  
  console.log('\n🟠 MICROSOFT BING:');
  const bingUetId = await question('Bing UET ID: ');
  const bingFormGoal = await question('Form Goal ID: ');
  const bingPhoneGoal = await question('Phone Goal ID: ');
  const bingWhatsAppGoal = await question('WhatsApp Goal ID: ');
  
  console.log('\n📊 ANALYTICS:');
  const gaId = await question('Google Analytics 4 ID (G-XXXXXXXXXX): ');
  const clarityId = await question('Microsoft Clarity ID: ');
  
  // Create .env.local file
  const envContent = `# Configuração gerada automaticamente - ${new Date().toISOString()}

# Google Analytics 4
NEXT_PUBLIC_GA_ID=${gaId}

# Google Ads Configuration
NEXT_PUBLIC_GOOGLE_ADS_ID=${googleAdsId}
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=${googleConversionId}
NEXT_PUBLIC_GOOGLE_FORM_CONVERSION_LABEL=${googleFormLabel}
NEXT_PUBLIC_GOOGLE_PHONE_CONVERSION_LABEL=${googlePhoneLabel}
NEXT_PUBLIC_GOOGLE_WHATSAPP_CONVERSION_LABEL=${googleWhatsAppLabel}

# Meta/Facebook Configuration
NEXT_PUBLIC_FB_PIXEL_ID=${facebookPixelId}

# Microsoft Advertising (Bing) Configuration
NEXT_PUBLIC_BING_UET_ID=${bingUetId}
NEXT_PUBLIC_BING_FORM_GOAL_ID=${bingFormGoal}
NEXT_PUBLIC_BING_PHONE_GOAL_ID=${bingPhoneGoal}
NEXT_PUBLIC_BING_WHATSAPP_GOAL_ID=${bingWhatsAppGoal}

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=${clarityId}

# Database (Vercel Postgres - será configurado automaticamente)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Admin Configuration
ADMIN_EMAIL=admin@fly2any.com
`;

  // Write .env.local file
  fs.writeFileSync('.env.local', envContent);
  
  console.log('\n✅ Arquivo .env.local criado com sucesso!');
  
  // Generate verification script
  const verificationScript = `
// Script de verificação - Cole no console do browser
console.log('🔍 VERIFICANDO CONFIGURAÇÃO DE TRACKING...');

// Verificar Google Analytics
if (typeof gtag !== 'undefined') {
  console.log('✅ Google Analytics 4 carregado');
  gtag('event', 'test_tracking', { test: true });
} else {
  console.log('❌ Google Analytics não encontrado');
}

// Verificar Meta Pixel
if (typeof fbq !== 'undefined') {
  console.log('✅ Meta Pixel carregado');
  fbq('track', 'PageView');
} else {
  console.log('❌ Meta Pixel não encontrado');
}

// Verificar Bing UET
if (typeof uetq !== 'undefined') {
  console.log('✅ Bing UET carregado');
  uetq.push('event', 'page_view', {});
} else {
  console.log('❌ Bing UET não encontrado');
}

// Testar tracking customizado
if (typeof window.tracking !== 'undefined') {
  console.log('✅ Sistema de tracking customizado carregado');
  // Teste de formulário
  window.tracking.trackFormSubmission({
    name: 'Teste',
    email: 'teste@teste.com',
    phone: '+5511999999999'
  }, 'test');
} else {
  console.log('❌ Sistema de tracking customizado não encontrado');
}

console.log('🎯 Verificação concluída! Confira os resultados acima.');
`;

  fs.writeFileSync('verification-script.js', verificationScript);
  
  console.log('✅ Script de verificação criado: verification-script.js');
  
  // Generate campaign configuration
  const campaignConfig = {
    google_ads: {
      campaigns: [
        {
          name: "Fly2Any - Search - Voos Brasil EUA",
          type: "Search",
          budget: 5, // $5/day
          keywords: [
            "voos miami sao paulo",
            "passagens brasil eua baratas", 
            "agencia viagem brasileiros",
            "cotacao voo brasil eua"
          ],
          locations: ["Miami FL", "Orlando FL", "New York NY"],
          languages: ["Portuguese", "English"]
        },
        {
          name: "Fly2Any - Performance Max",
          type: "Performance Max",
          budget: 3.30, // $3.30/day
          asset_groups: ["Voos Brasil-EUA", "Agência Especializada"],
          locations: ["United States"],
          languages: ["Portuguese"]
        }
      ]
    },
    meta_ads: {
      campaigns: [
        {
          name: "Fly2Any - Traffic - Brasileiros EUA",
          objective: "Traffic",
          budget: 1.65, // $1.65/day
          audience: {
            location: ["United States"],
            interests: ["Brazil", "Travel", "Family"],
            demographics: "Brazilians living in US",
            age_range: "25-55"
          }
        },
        {
          name: "Fly2Any - Lead Generation",
          objective: "Lead Generation",
          budget: 1, // $1/day
          audience: {
            location: ["Miami", "Orlando", "New York"],
            interests: ["Air Travel", "Brazil"],
            behaviors: "Frequent Travelers"
          }
        }
      ]
    },
    bing_ads: {
      campaigns: [
        {
          name: "Fly2Any - Search - Long Tail",
          type: "Search",
          budget: 1.65, // $1.65/day
          keywords: [
            "agencia viagem brasileiros miami",
            "passagens aereas brasileiros estados unidos",
            "como comprar passagem brasil eua",
            "voos promocionais brasil eua"
          ]
        }
      ]
    }
  };

  fs.writeFileSync('campaign-config.json', JSON.stringify(campaignConfig, null, 2));
  
  console.log('✅ Configuração de campanhas salva: campaign-config.json');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Execute: npm run build && npm run start');
  console.log('2. Abra: http://localhost:3000');
  console.log('3. Teste o formulário de cotação');
  console.log('4. Verifique: http://localhost:3000/admin/campanhas');
  console.log('5. Execute verification-script.js no console do browser');
  
  console.log('\n📊 MONITORAMENTO:');
  console.log('- Dashboard: /admin/campanhas');
  console.log('- Relatórios: POST /api/reports/daily');
  console.log('- Alertas: POST /api/alerts/performance');
  
  console.log('\n💰 BUDGET ALOCADO:');
  console.log('- Google Ads: $8.30/dia ($249/mês)');
  console.log('- Meta Ads: $2.65/dia ($79.50/mês)');
  console.log('- Bing Ads: $1.65/dia ($49.50/mês)');
  console.log('- TOTAL: $12.60/dia ($378/mês)');
  
  rl.close();
}

// Execute setup
setupAdsConfiguration().catch(console.error);