// Teste simples da API de leads
const testData = {
  selectedServices: [{
    serviceType: 'voos',
    origem: 'Miami',
    destino: 'São Paulo',
    dataIda: '2024-08-01',
    dataVolta: '2024-08-15',
    adultos: 2,
    criancas: 0,
    classeVoo: 'economica'
  }],
  currentServiceIndex: 0,
  nome: 'João Silva',
  sobrenome: 'Santos',
  email: 'joao.silva@email.com',
  telefone: '11999999999',
  whatsapp: '11999999999',
  origem: 'Miami',
  destino: 'São Paulo',
  dataIda: '2024-08-01',
  dataVolta: '2024-08-15',
  tipoViagem: 'ida-volta',
  classeVoo: 'economica',
  adultos: 2,
  criancas: 0,
  bebes: 0,
  companhiaPreferida: '',
  horarioPreferido: 'qualquer',
  escalas: 'qualquer',
  observacoes: 'Teste de API'
};

async function testAPI() {
  try {
    console.log('Testando API de leads...');
    
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro na resposta:', errorData);
      return;
    }
    
    const result = await response.json();
    console.log('Sucesso:', result);
    
    // Verificar se o lead foi salvo
    const fs = require('fs');
    const leadsData = JSON.parse(fs.readFileSync('./data/leads.json', 'utf8'));
    console.log('Leads salvos:', leadsData.length);
    console.log('Último lead:', leadsData[leadsData.length - 1]);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;