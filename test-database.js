// Teste direto da função de banco de dados
const { saveLead } = require('./src/lib/database.ts');

const testLead = {
  id: 'test-123',
  nome: 'João Silva',
  sobrenome: 'Santos',
  email: 'joao.silva@email.com',
  telefone: '11999999999',
  whatsapp: '11999999999',
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
  observacoes: 'Teste direto do banco',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function testDatabase() {
  try {
    console.log('Testando função de salvar lead...');
    
    const result = await saveLead(testLead);
    console.log('Resultado:', result);
    
    // Verificar arquivo
    const fs = require('fs');
    const leadsData = JSON.parse(fs.readFileSync('./data/leads.json', 'utf8'));
    console.log('Total de leads:', leadsData.length);
    console.log('Último lead salvo:', leadsData[leadsData.length - 1]);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testDatabase();