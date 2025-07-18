// Teste simples de escrita no arquivo leads.json
const fs = require('fs');
const path = require('path');

async function testFileWrite() {
  try {
    console.log('Testando escrita no arquivo leads.json...');
    
    const testLead = {
      id: `test_${Date.now()}`,
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      whatsapp: '11999999999',
      serviceType: 'voos',
      createdAt: new Date().toISOString()
    };
    
    // Ler leads existentes
    const leadsFile = path.join(__dirname, 'data', 'leads.json');
    let leads = [];
    
    try {
      const data = fs.readFileSync(leadsFile, 'utf8');
      leads = JSON.parse(data);
    } catch (error) {
      console.log('Arquivo não existe, criando novo...');
    }
    
    // Adicionar novo lead
    leads.push(testLead);
    
    // Escrever de volta
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    
    console.log('Lead salvo com sucesso!');
    console.log('Total de leads:', leads.length);
    console.log('Último lead:', testLead);
    
    // Verificar se realmente foi salvo
    const savedData = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
    console.log('Verificação - Total após salvar:', savedData.length);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testFileWrite();