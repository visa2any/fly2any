/**
 * Direct API Test for Lead Creation
 * Tests the lead API endpoint directly without browser
 */

const fetch = require('node-fetch');

async function testLeadAPI() {
  console.log('🚀 Testing Lead API Directly...\n');
  
  const API_URL = 'http://localhost:3001/api/leads';
  
  // Test data
  const testLead = {
    nome: 'João',
    sobrenome: 'Silva',
    email: 'test@example.com',
    telefone: '11999999999',
    whatsapp: '11999999999',
    origem: 'São Paulo',
    destino: 'Rio de Janeiro',
    dataIda: '2025-09-15',
    dataVolta: '2025-09-22',
    tipoViagem: 'ida-volta',
    classeVoo: 'economica',
    adultos: 2,
    criancas: 0,
    bebes: 0,
    companhiaPreferida: '',
    horarioPreferido: 'qualquer',
    escalas: 'qualquer',
    orcamentoAproximado: '5000',
    flexibilidadeDatas: false,
    observacoes: 'Teste automatizado do sistema',
    selectedServices: ['flight'],
    source: 'website'
  };
  
  try {
    console.log('📤 Sending test lead to API...');
    console.log('Data:', JSON.stringify(testLead, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLead)
    });
    
    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('Response Body:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS! Lead created successfully');
      console.log('Lead ID:', result.data?.leadId);
      console.log('Storage method:', result.metadata?.storage);
    } else {
      console.log('\n❌ FAILED! Lead creation failed');
      console.log('Error:', result.error || result.message);
      if (result.metadata?.validationErrors) {
        console.log('Validation Errors:', result.metadata.validationErrors);
      }
    }
    
    // Test GET endpoint
    console.log('\n📋 Testing GET endpoint...');
    const getResponse = await fetch(API_URL + '?limit=5');
    const getResult = await getResponse.json();
    
    if (getResponse.ok && getResult.success) {
      console.log('✅ GET endpoint working');
      console.log(`Found ${getResult.data?.leads?.length || 0} leads`);
    } else {
      console.log('❌ GET endpoint failed');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
console.log('='.repeat(60));
console.log('LEAD API DIRECT TEST');
console.log('='.repeat(60));
testLeadAPI().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
});