// Teste da validação da API
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
  observacoes: 'Teste de validação'
};

// Função de validação copiada da API
function validateLeadData(data) {
  const errors = [];

  // Campos obrigatórios
  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length < 2) {
    errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email inválido');
    }
  }

  if (!data.whatsapp || typeof data.whatsapp !== 'string' || data.whatsapp.length < 10) {
    errors.push('WhatsApp é obrigatório e deve ter pelo menos 10 dígitos');
  }

  if (!data.selectedServices || !Array.isArray(data.selectedServices) || data.selectedServices.length === 0) {
    errors.push('Pelo menos um serviço deve ser selecionado');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

console.log('Testando validação dos dados...');
console.log('Dados de teste:', JSON.stringify(testData, null, 2));

const validation = validateLeadData(testData);
console.log('Resultado da validação:', validation);

if (validation.isValid) {
  console.log('✅ Dados válidos! A API deveria aceitar estes dados.');
} else {
  console.log('❌ Dados inválidos. Erros encontrados:');
  validation.errors.forEach(error => console.log('- ' + error));
}