// Teste real da API /api/leads
const testData = {
  nome: 'João Silva',
  email: 'joao.silva@test.com',
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

console.log('Testando API /api/leads com dados:');
console.log(JSON.stringify(testData, null, 2));

fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Request-Id': crypto.randomUUID()
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('\n=== RESPOSTA ===');
  console.log('Status:', response.status);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  return response.json();
})
.then(data => {
  console.log('\n=== DADOS DA RESPOSTA ===');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('\n=== ERRO ===');
  console.error(error);
});