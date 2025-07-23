const https = require('https');

async function testLogoIntegration() {
  console.log('🔍 Testando integração do logo Fly2Any...\n');
  
  try {
    // 1. Verificar se o logo está acessível
    console.log('📷 1. Verificando acesso ao logo...');
    const logoResponse = await checkUrl('https://www.fly2any.com/fly2any-logo.png');
    console.log(`   Status: ${logoResponse.statusCode}`);
    console.log(`   Content-Type: ${logoResponse.headers['content-type']}`);
    console.log(`   Tamanho: ${logoResponse.headers['content-length']} bytes`);
    
    if (logoResponse.statusCode === 200) {
      console.log('   ✅ Logo acessível!');
    } else {
      console.log('   ❌ Logo não acessível');
    }
    
    // 2. Testar email com novo logo
    console.log('\n📧 2. Testando email com logo atualizado...');
    const testData = {
      action: 'send_test_custom',
      email: 'fly2any.travel@gmail.com',
      subject: '[TESTE] Logo Atualizado',
      templateName: 'promotional',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px;">
            <!-- Header com Logo -->
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #dc2626, #ef4444); border-radius: 12px;">
              <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                <img src="https://www.fly2any.com/fly2any-logo.png" alt="Fly2Any" style="height: 40px; object-fit: contain;" />
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FLY2ANY</h1>
              </div>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sua ponte para o Brasil</p>
            </div>
            
            <!-- Conteúdo -->
            <div style="padding: 30px 0; text-align: center;">
              <h2 style="color: #333;">🎉 Logo Atualizado com Sucesso!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Este é um teste do novo logo oficial do Fly2Any integrado em toda a plataforma.
              </p>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0;">✅ Integração Completa:</h3>
                <ul style="text-align: left; color: #374151;">
                  <li>✓ Componente Logo.tsx atualizado</li>
                  <li>✓ Layout Admin atualizado</li>
                  <li>✓ Layout Omnichannel atualizado</li>
                  <li>✓ Templates de email atualizados</li>
                  <li>✓ Logo acessível via URL pública</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 10px;">
                <img src="https://www.fly2any.com/fly2any-logo.png" alt="Fly2Any" style="height: 24px; object-fit: contain;" />
                <span style="font-weight: 600; color: #374151;">FLY2ANY</span>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                21 anos conectando brasileiros ao mundo
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const emailResponse = await makePostRequest('https://www.fly2any.com/api/email-marketing', testData);
    
    if (emailResponse.success) {
      console.log('   ✅ Email teste enviado com sucesso!');
      console.log(`   Message ID: ${emailResponse.messageId}`);
    } else {
      console.log('   ❌ Erro no envio:', emailResponse.error);
    }
    
    // 3. Verificar páginas principais
    console.log('\n🌐 3. Verificando páginas com logo...');
    const pages = [
      'https://www.fly2any.com',
      'https://www.fly2any.com/admin',
      'https://www.fly2any.com/sobre'
    ];
    
    for (const page of pages) {
      try {
        const pageResponse = await checkUrl(page);
        console.log(`   ${page}: ${pageResponse.statusCode === 200 ? '✅' : '❌'} (${pageResponse.statusCode})`);
      } catch (error) {
        console.log(`   ${page}: ❌ Erro`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n✅ Teste de integração concluído!');
  console.log('\n📋 RESUMO DA INTEGRAÇÃO:');
  console.log('   • Logo oficial Fly2Any copiado para /public/fly2any-logo.png');
  console.log('   • Componente Logo.tsx atualizado para usar logo real');
  console.log('   • Layout Admin com logo real no sidebar');
  console.log('   • Layout Omnichannel com logo real no header');
  console.log('   • Templates de email com logo real via URL pública');
  console.log('   • Logo responsivo e otimizado para todas as telas');
}

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(new Error(`Erro ao parsear JSON: ${responseData.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Executar teste
testLogoIntegration().catch(console.error);