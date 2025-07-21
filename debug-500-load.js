const https = require('https');

async function debug500Load() {
    console.log('=== DEBUG: CARREGAMENTO 500 CONTATOS ===\n');
    
    const baseUrl = 'https://www.fly2any.com';
    
    function makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data,
                        length: data.length
                    });
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
        console.log('Testando requisição POST para load_500_contacts...');
        
        const result = await makeRequest(`${baseUrl}/api/email-marketing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'load_500_contacts'
            })
        });
        
        console.log('Status HTTP:', result.status);
        console.log('Content Length:', result.length);
        console.log('Raw Response (primeiros 500 chars):');
        console.log(result.data.substring(0, 500));
        
        try {
            const parsed = JSON.parse(result.data);
            console.log('\nResponse parseado:');
            console.log('Success:', parsed.success);
            console.log('Data keys:', Object.keys(parsed.data || {}));
            console.log('Full response:', JSON.stringify(parsed, null, 2));
        } catch (parseError) {
            console.log('\n❌ Erro ao parsear JSON:', parseError.message);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
}

debug500Load().catch(console.error);