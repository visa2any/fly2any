// Teste da API de produção
const https = require('https');

const testData = {
  nome: 'João Silva Teste',
  email: 'joao.teste@example.com',
  whatsapp: '+55 11 99999-9999',
  source: 'exit_intent_popup',
  serviceType: 'newsletter_signup',
  selectedServices: ['newsletter'],
  tipoViagem: 'ida_volta',
  numeroPassageiros: 1,
  prioridadeOrcamento: 'custo_beneficio',
  pais: 'Brasil',
  timestamp: new Date().toISOString()
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'www.fly2any.com',
  port: 443,
  path: '/api/leads',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'X-Request-Id': 'test-' + Date.now()
  }
};

console.log('Testando API de produção com dados:');
console.log(JSON.stringify(testData, null, 2));
console.log('\nEnviando requisição...\n');

const req = https.request(options, (res) => {
  console.log('=== RESPOSTA ===');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== CORPO DA RESPOSTA ===');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Resposta não é JSON:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('=== ERRO DA REQUISIÇÃO ===');
  console.error(error);
});

req.write(postData);
req.end();