#!/usr/bin/env node

/**
 * Script to test form submission API endpoint locally
 * This will help verify that our fixes work correctly
 */

const testFormSubmission = async () => {
  console.log('🧪 Testing form submission...');
  
  // Test data that mimics what the form sends
  const testData = {
    nome: 'João Silva',
    email: 'joao.teste@gmail.com',
    whatsapp: '11999999999',
    selectedServices: ['voos', 'hoteis'],
    origem: 'Miami',
    destino: 'São Paulo',
    dataPartida: '2024-02-15',
    dataRetorno: '2024-02-22',
    numeroPassageiros: 2,
    tipoViagem: 'ida_volta',
    source: 'website_form_test'
  };

  try {
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('🎉 Form submission test PASSED!');
      console.log('Lead ID:', result.leadId);
      console.log('Processing Results:', result.processed);
    } else {
      console.log('❌ Form submission test FAILED!');
      console.log('Error:', result.message);
      console.log('Errors:', result.errors);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Make sure the development server is running with: npm run dev');
  }
};

// Run the test
testFormSubmission();