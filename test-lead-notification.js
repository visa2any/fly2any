/**
 * Test Lead Notification System
 * Run with: node test-lead-notification.js
 */

async function testLeadNotification() {
  console.log('🧪 Testing Lead Notification System...\n');

  const testLead = {
    selectedServices: ['voos', 'hoteis'],
    nome: 'Test User',
    sobrenome: 'Silva',
    email: 'test@example.com',
    whatsapp: '+5531999999999',
    telefone: '+5531999999999',
    origem: 'Belo Horizonte',
    destino: 'Miami',
    dataIda: '2024-02-15',
    dataVolta: '2024-02-25',
    tipoViagem: 'ida-volta',
    classeVoo: 'economica',
    adultos: 2,
    criancas: 1,
    bebes: 0,
    observacoes: 'Test lead submission',
    orcamentoAproximado: 'R$ 15.000',
    source: 'test'
  };

  try {
    console.log('📤 Sending test lead to API...');
    
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLead)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Lead submitted successfully!');
      console.log('📧 Lead ID:', result.data?.leadId);
      console.log('\n📋 Response:', JSON.stringify(result, null, 2));
      
      console.log('\n🔍 Check the following locations:');
      console.log('1. Console output above for email logs');
      console.log('2. logs/emails/ folder for saved email files');
      console.log('3. logs/emails/email-summary.txt for quick overview');
      
      console.log('\n⚠️  Gmail Configuration Status:');
      console.log('If you see "Email saved locally" - Gmail is NOT configured');
      console.log('Please follow GMAIL_SETUP_GUIDE.md to enable real email sending');
      
    } else {
      console.error('❌ Lead submission failed:', result.error);
      console.log('Full response:', result);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. The development server is running (npm run dev)');
    console.log('2. The server is accessible at http://localhost:3000');
  }
}

// Run the test
testLeadNotification().then(() => {
  console.log('\n✨ Test completed!');
}).catch(error => {
  console.error('\n❌ Test error:', error);
});