const https = require('https');

async function testReloadContacts() {
    console.log('=== TESTE DE RELOAD DOS CONTATOS ===\n');
    
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
            req.end();
        });
    }
    
    try {
        // 1. Primeiro, verificar stats atuais
        console.log('1. Stats ANTES do reload:');
        const statsBefore = await makeRequest(`${baseUrl}/api/email-marketing?action=stats`);
        console.log('Total contatos:', statsBefore.data.data.totalContacts);
        
        // 2. Forçar reload
        console.log('\n2. Forçando reload dos contatos...');
        const reloadResult = await makeRequest(`${baseUrl}/api/email-marketing?action=stats&reload=true`);
        console.log('Reload response:', reloadResult.data.data.totalContacts);
        
        // 3. Verificar stats após reload
        console.log('\n3. Stats APÓS o reload:');
        const statsAfter = await makeRequest(`${baseUrl}/api/email-marketing?action=stats`);
        console.log('Total contatos:', statsAfter.data.data.totalContacts);
        console.log('Email stats:', statsAfter.data.data.emailStats);
        console.log('Segment stats:', statsAfter.data.data.segmentStats);
        
        // 4. Tentar buscar contatos
        console.log('\n4. Buscando primeiros 5 contatos:');
        const contactsResult = await makeRequest(`${baseUrl}/api/email-marketing?action=contacts&limit=5`);
        console.log('Total retornado:', contactsResult.data.data.total);
        console.log('Contatos encontrados:', contactsResult.data.data.contacts.length);
        
        if (contactsResult.data.data.contacts.length > 0) {
            console.log('Primeiro contato:', contactsResult.data.data.contacts[0]);
        }
        
        console.log('\n=== RESUMO ===');
        console.log('Antes do reload:', statsBefore.data.data.totalContacts, 'contatos');
        console.log('Após reload:', statsAfter.data.data.totalContacts, 'contatos');
        console.log('Status:', statsAfter.data.data.totalContacts > 0 ? '✅ CORRIGIDO' : '❌ AINDA COM PROBLEMA');
        
    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    }
}

// Executar teste
testReloadContacts().catch(console.error);