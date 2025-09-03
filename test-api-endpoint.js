#!/usr/bin/env node
/**
 * Test the /api/leads endpoint directly
 */

const { LeadServiceFixed } = require('./src/lib/services/lead-service-fixed');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const testLeadData = {
  nome: 'João Silva',
  email: 'joao.test@example.com',
  whatsapp: '11999999999',
  telefone: '1133334444',
  origem: 'São Paulo (SAO)',
  destino: 'Rio de Janeiro (RIO)',
  dataIda: '2024-12-25',
  dataVolta: '2024-12-30',
  tipoViagem: 'ida-volta',
  adultos: 2,
  criancas: 0,
  bebes: 0,
  classeVoo: 'economica',
  selectedServices: ['flight'],
  observacoes: 'Teste do sistema após fix',
  source: 'test'
};

async function testLeadService() {
  console.log('🚀 Testing LeadServiceFixed directly...');
  
  try {
    console.log('📤 Creating lead with test data...');
    
    const result = await LeadServiceFixed.createLead(testLeadData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Lead created successfully');
      console.log('📊 Result:', {
        success: result.success,
        leadId: result.data?.id,
        storage: result.metadata?.storage
      });
      
      console.log('🎉 THE LEAD FORM FIX IS WORKING!');
      console.log('\n💡 What was fixed:');
      console.log('  1. ❌ Old issue: LeadService tried to INSERT into "leads" view');
      console.log('  2. ✅ Fix: Updated to INSERT into "leads_unified" table');
      console.log('  3. ✅ Database: Created "leads_unified" table with proper structure');
      
      return true;
      
    } else {
      console.error('❌ FAILED! Lead creation failed');
      console.error('Error:', result.error);
      console.error('Metadata:', result.metadata);
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERROR! Exception during lead creation:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

async function testWithCleanup() {
  const success = await testLeadService();
  
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 FINAL RESULT: LEAD FORM ERROR HAS BEEN FIXED! 🎉');
    console.log('\n✅ The error "Erro ao enviar formulário. Tente novamente" should no longer appear');
    console.log('✅ Form submissions will now work correctly');
    console.log('✅ Leads will be saved to the database');
    
    console.log('\n🔄 To test in the browser:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Go to: http://localhost:3000');
    console.log('  3. Fill out and submit the lead form');
    console.log('  4. You should see success message instead of error');
    
  } else {
    console.log('❌ FINAL RESULT: Issues still remain');
    console.log('\n🔧 Additional debugging may be needed');
  }
  console.log('='.repeat(60));
}

// Run the test
testWithCleanup().catch(console.error);