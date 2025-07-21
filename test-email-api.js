const https = require('https');

async function testEmailMarketingAPI() {
    console.log('=== TESTE DA API EMAIL MARKETING ===\n');
    
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
        // 1. Teste GET /api/email-marketing?action=stats
        console.log('1. Testando GET /api/email-marketing?action=stats');
        console.log('URL:', `${baseUrl}/api/email-marketing?action=stats`);
        
        const statsResult = await makeRequest(`${baseUrl}/api/email-marketing?action=stats`);
        console.log('Status:', statsResult.status);
        console.log('Response:', JSON.stringify(statsResult.data, null, 2));
        console.log('---\n');
        
        // 2. Teste GET /api/email-marketing?action=contacts
        console.log('2. Testando GET /api/email-marketing?action=contacts&limit=10');
        console.log('URL:', `${baseUrl}/api/email-marketing?action=contacts&limit=10`);
        
        const contactsResult = await makeRequest(`${baseUrl}/api/email-marketing?action=contacts&limit=10`);
        console.log('Status:', contactsResult.status);
        console.log('Response:', JSON.stringify(contactsResult.data, null, 2));
        console.log('---\n');
        
        // 3. Teste POST /api/email-marketing (send_test)
        console.log('3. Testando POST /api/email-marketing (send_test)');
        
        const postData = JSON.stringify({
            action: 'send_test',
            email: 'test@example.com',
            campaignType: 'promotional'
        });
        
        const postOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const testEmailResult = await new Promise((resolve, reject) => {
            const req = https.request(`${baseUrl}/api/email-marketing`, postOptions, (res) => {
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
            req.write(postData);
            req.end();
        });
        
        console.log('Status:', testEmailResult.status);
        console.log('Response:', JSON.stringify(testEmailResult.data, null, 2));
        console.log('---\n');
        
        // 4. Verificar arquivo de contatos
        console.log('4. Verificando arquivo de contatos local');
        const fs = require('fs');
        const path = require('path');
        
        const contactsFile = path.join(process.cwd(), 'contacts-imported.json');
        
        if (fs.existsSync(contactsFile)) {
            const stats = fs.statSync(contactsFile);
            const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
            
            console.log('Arquivo encontrado:', contactsFile);
            console.log('Tamanho:', stats.size, 'bytes');
            console.log('Modificado em:', stats.mtime);
            console.log('Total de contatos:', contacts.length);
            
            if (contacts.length > 0) {
                console.log('Exemplo de contato:', JSON.stringify(contacts[0], null, 2));
                
                // Stats dos contatos
                const emailStatus = {};
                const segments = {};
                
                contacts.forEach(contact => {
                    emailStatus[contact.emailStatus] = (emailStatus[contact.emailStatus] || 0) + 1;
                    segments[contact.segmento] = (segments[contact.segmento] || 0) + 1;
                });
                
                console.log('Status de emails:', emailStatus);
                console.log('Segmentos:', segments);
            }
        } else {
            console.log('❌ Arquivo de contatos não encontrado:', contactsFile);
        }
        
        console.log('\n=== RESULTADOS DO TESTE ===');
        console.log('API Stats:', statsResult.status === 200 ? '✅ OK' : '❌ ERRO');
        console.log('API Contacts:', contactsResult.status === 200 ? '✅ OK' : '❌ ERRO');
        console.log('API Send Test:', testEmailResult.status === 200 ? '✅ OK' : '❌ ERRO');
        console.log('Arquivo Contatos:', fs.existsSync(contactsFile) ? '✅ OK' : '❌ ERRO');
        
    } catch (error) {
        console.error('❌ Erro durante teste:', error);
    }
}

// Executar teste
testEmailMarketingAPI().catch(console.error);