// Script de teste completo para o sistema de email marketing Fly2Any
const N8N_WEBHOOK_URL = 'https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final';

async function testEmailMarketing() {
  console.log('🚀 Iniciando teste do sistema de email marketing Fly2Any');
  console.log('📡 Webhook URL:', N8N_WEBHOOK_URL);
  
  // Dados de teste da campanha
  const testCampaign = {
    campaignId: `test-${Date.now()}`,
    campaignName: 'Teste Automatizado - Fly2Any',
    subject: '✈️ [TESTE] Oferta Especial Miami - Fly2Any',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
          <h1>✈️ Fly2Any - TESTE</h1>
          <h2>Olá {{nome}}! 👋</h2>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e40af;">🧪 Este é um email de teste</h2>
          <p>Olá {{nome}},</p>
          <p>Este email foi enviado automaticamente pelo sistema de email marketing da Fly2Any!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🔥 Dados do Teste:</h3>
            <ul>
              <li>📧 Seu email: {{email}}</li>
              <li>🕒 Enviado em: ${new Date().toLocaleString('pt-BR')}</li>
              <li>🆔 Campaign ID: {{campaignId}}</li>
              <li>⚡ Sistema: N8N + Gmail API</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fly2any.com" 
               style="background: #25d366; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              🌟 VISITAR FLY2ANY
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            ✅ Se você recebeu este email, o sistema está funcionando perfeitamente!
          </p>
        </div>
        
        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
          <p>© 2024 Fly2Any - Sistema de Email Marketing</p>
          <p>Este é um email de teste automatizado</p>
        </div>
      </body>
      </html>`,
    textContent: 'Teste do sistema de email marketing Fly2Any para {{nome}} ({{email}})',
    contacts: [
      {
        email: 'teste@fly2any.com', // SUBSTITUA pelo seu email de teste
        nome: 'Teste Sistema',
        sobrenome: 'Fly2Any',
        segmento: 'brasileiros-eua'
      },
      {
        email: 'admin@fly2any.com', // SUBSTITUA pelo seu email
        nome: 'Admin',
        sobrenome: 'Fly2Any', 
        segmento: 'teste'
      }
    ],
    timestamp: new Date().toISOString()
  };
  
  console.log('📋 Dados da campanha de teste:');
  console.log(`  📧 Campaign ID: ${testCampaign.campaignId}`);
  console.log(`  📨 Subject: ${testCampaign.subject}`);
  console.log(`  👥 Contatos: ${testCampaign.contacts.length}`);
  console.log(`  🕒 Timestamp: ${testCampaign.timestamp}`);
  
  try {
    console.log('\\n🌐 Enviando requisição para o webhook N8N...');
    
    const startTime = Date.now();
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fly2Any-EmailMarketing-Test/1.0'
      },
      body: JSON.stringify(testCampaign)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Tempo de resposta: ${duration}ms`);
    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Requisição enviada com sucesso!');
      
      try {
        const responseData = await response.json();
        console.log('📄 Resposta do webhook:');
        console.log(JSON.stringify(responseData, null, 2));
        
        if (responseData.success) {
          console.log('\\n🎉 SUCESSO TOTAL!');
          console.log('✅ Webhook está ativo e funcionando');
          console.log('✅ Campanha foi processada corretamente');
          console.log('✅ Emails devem estar sendo enviados');
          console.log('\\n📧 Verifique sua caixa de entrada para os emails de teste!');
        } else {
          console.log('\\n⚠️  Webhook respondeu, mas houve erro no processamento:');
          console.log('❌ Error:', responseData.error || 'Erro desconhecido');
        }
        
      } catch (jsonError) {
        console.log('⚠️  Resposta não é JSON válido. Conteúdo:');
        const textResponse = await response.text();
        console.log(textResponse);
      }
      
    } else if (response.status === 404) {
      console.log('\\n❌ WEBHOOK NÃO ENCONTRADO (404)');
      console.log('🔧 O workflow N8N não existe ou não está ativo!');
      console.log('📋 Instruções:');
      console.log('   1. Acesse: https://n8n-production-81b6.up.railway.app');
      console.log('   2. Importe o workflow do arquivo N8N_SETUP_COMPLETE.md');
      console.log('   3. Configure credenciais Gmail');
      console.log('   4. Ative o workflow');
      console.log('   5. Execute este teste novamente');
      
    } else if (response.status === 401) {
      console.log('\\n❌ ERRO DE AUTENTICAÇÃO (401)');
      console.log('🔐 N8N requer autenticação ou credenciais inválidas');
      
    } else if (response.status === 500) {
      console.log('\\n❌ ERRO INTERNO DO SERVIDOR (500)');
      console.log('⚠️  Possíveis causas:');
      console.log('   - Erro no código do workflow');
      console.log('   - Credenciais Gmail inválidas');
      console.log('   - Problema na configuração do N8N');
      
      try {
        const errorText = await response.text();
        console.log('📄 Detalhes do erro:');
        console.log(errorText);
      } catch (e) {
        console.log('❌ Não foi possível obter detalhes do erro');
      }
      
    } else {
      console.log(`\\n❌ ERRO HTTP ${response.status}`);
      try {
        const errorText = await response.text();
        console.log('📄 Resposta do servidor:');
        console.log(errorText);
      } catch (e) {
        console.log('❌ Não foi possível ler a resposta do erro');
      }
    }
    
  } catch (networkError) {
    console.log('\\n🌐 ERRO DE CONEXÃO');
    console.log('❌ Não foi possível conectar ao webhook N8N');
    console.log('📡 Erro:', networkError.message);
    console.log('\\n🔍 Verificações:');
    console.log('   1. Internet conectada?');
    console.log('   2. URL do N8N está correta?');
    console.log('   3. Serviço N8N está online?');
    
    // Testar conectividade básica
    try {
      console.log('\\n🧪 Testando conectividade básica com N8N...');
      const pingResponse = await fetch('https://n8n-production-81b6.up.railway.app');
      console.log(`✅ N8N está online (Status: ${pingResponse.status})`);
    } catch (pingError) {
      console.log('❌ N8N não está acessível:', pingError.message);
    }
  }
  
  console.log('\\n' + '='.repeat(80));
  console.log('📊 RESUMO DO TESTE');
  console.log('='.repeat(80));
  console.log(`🕒 Executado em: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`🆔 Campaign ID testado: ${testCampaign.campaignId}`);
  console.log(`📧 Contatos de teste: ${testCampaign.contacts.length}`);
  console.log(`📡 Webhook URL: ${N8N_WEBHOOK_URL}`);
  console.log('='.repeat(80));
}

// Executar teste
testEmailMarketing().catch(error => {
  console.error('💥 Erro fatal no teste:', error);
});