const https = require('https');

async function testFinalVerification() {
    console.log('=== VERIFICAÇÃO FINAL DO SISTEMA EMAIL MARKETING ===\n');
    
    const baseUrl = 'https://www.fly2any.com';
    
    // Função para fazer requisições HTTP
    function makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: parsed
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: data,
                            parseError: e.message
                        });
                    }
                });
            });
            
            req.on('error', reject);
            if (options.body) {
                req.write(options.body);
            }
            req.end();
        });
    }
    
    try {
        console.log('Aguardando 30 segundos para deployment...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // 1. Testar nova funcionalidade import_from_local
        console.log('1. Testando import_from_local (POST)...');
        const importResult = await makeRequest(`${baseUrl}/api/email-marketing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'import_from_local'
            })
        });
        
        console.log('Status:', importResult.status);
        console.log('Response:', JSON.stringify(importResult.data, null, 2));
        
        // 2. Verificar stats após import
        console.log('\n2. Verificando stats após import...');
        const statsResult = await makeRequest(`${baseUrl}/api/email-marketing?action=stats&reload=true`);
        console.log('Total contatos:', statsResult.data.data.totalContacts);
        console.log('Email stats:', statsResult.data.data.emailStats);
        
        // 3. Buscar alguns contatos
        console.log('\n3. Buscando primeiros 5 contatos...');
        const contactsResult = await makeRequest(`${baseUrl}/api/email-marketing?action=contacts&limit=5`);
        console.log('Contatos encontrados:', contactsResult.data.data.contacts.length);
        
        if (contactsResult.data.data.contacts.length > 0) {
            console.log('Primeiro contato:', {
                id: contactsResult.data.data.contacts[0].id,
                nome: contactsResult.data.data.contacts[0].nome,
                email: contactsResult.data.data.contacts[0].email,
                segmento: contactsResult.data.data.contacts[0].segmento,
                emailStatus: contactsResult.data.data.contacts[0].emailStatus
            });
        }
        
        // 4. Testar templates
        console.log('\n4. Testando busca de templates...');
        const templatesResult = await makeRequest(`${baseUrl}/api/email-marketing?action=templates`);
        console.log('Templates disponíveis:', templatesResult.data.data.templates.length);
        
        // 5. Teste de envio (usando email de teste)
        console.log('\n5. Testando envio de email teste...');
        const testEmailResult = await makeRequest(`${baseUrl}/api/email-marketing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'send_test',
                email: 'test@fly2any.com',
                campaignType: 'promotional'
            })
        });
        
        console.log('Teste de envio - Status:', testEmailResult.status);
        console.log('Teste de envio - Success:', testEmailResult.data.success);
        
        // RESUMO FINAL
        console.log('\n=== RESUMO FINAL ===');
        const finalStats = statsResult.data.data;
        
        console.log('✅ SISTEMA EMAIL MARKETING DIAGNOSTICADO:');
        console.log(`📊 Total de contatos: ${finalStats.totalContacts}`);
        console.log(`📧 Não enviados: ${finalStats.emailStats.notSent}`);
        console.log(`✉️ Enviados: ${finalStats.emailStats.sent}`); 
        console.log(`❌ Falhas: ${finalStats.emailStats.failed}`);
        console.log(`🚫 Unsubscribed: ${finalStats.emailStats.unsubscribed}`);
        
        console.log('\n🎯 FUNCIONALIDADES TESTADAS:');
        console.log(`- Import/Reload: ${importResult.data.success ? '✅' : '❌'}`);
        console.log(`- Stats: ${statsResult.data.success ? '✅' : '❌'}`);
        console.log(`- Buscar Contatos: ${contactsResult.data.success ? '✅' : '❌'}`);
        console.log(`- Templates: ${templatesResult.data.success ? '✅' : '❌'}`);
        console.log(`- Envio Teste: ${testEmailResult.data.success ? '✅' : '❌'}`);
        
        const allWorking = importResult.data.success && statsResult.data.success && 
                          contactsResult.data.success && templatesResult.data.success && 
                          testEmailResult.data.success;
        
        console.log(`\n🔥 STATUS GERAL: ${allWorking ? '✅ TUDO FUNCIONANDO' : '⚠️ ALGUMAS FUNCIONALIDADES COM PROBLEMA'}`);
        
        if (finalStats.totalContacts > 0) {
            console.log('\n🚀 SISTEMA PRONTO PARA:');
            console.log('- Envio de campanhas para os primeiros 500 contatos');
            console.log('- Criação de campanhas personalizadas');
            console.log('- Monitoramento de stats em tempo real');
            console.log('- Templates promocionais, newsletter e reativação');
        }
        
    } catch (error) {
        console.error('❌ Erro durante verificação final:', error);
    }
}

// Executar verificação
testFinalVerification().catch(console.error);