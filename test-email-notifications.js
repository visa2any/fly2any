/**
 * Test Email Notification System
 * Standalone test to verify email functionality
 */

// Mock environment variables for testing
process.env.GMAIL_EMAIL = 'test@gmail.com';
process.env.GMAIL_APP_PASSWORD = 'test-password';
process.env.N8N_WEBHOOK_EMAIL = 'https://test-webhook.com/email';

// Mock fetch for testing
global.fetch = async (url, options) => {
  console.log(`📡 Mock fetch called: ${url}`);
  console.log(`📊 Options:`, options?.method, options?.headers?.['Content-Type']);
  
  if (url.includes('/api/email-gmail')) {
    return {
      ok: options?.body ? true : false,
      json: async () => ({
        success: true,
        messageId: 'test-message-id',
        provider: 'gmail'
      })
    };
  }
  
  if (url.includes('n8n-production')) {
    return {
      ok: true,
      json: async () => ({ success: true })
    };
  }
  
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  };
};

// Import our lead notification system
async function testEmailSystem() {
  console.log('🧪 Testing Lead Email Notification System\n');
  
  try {
    // Import the notification functions
    const { sendLeadNotificationToAdmin, sendCustomerConfirmationEmail, sendLeadNotification } = 
      await import('./src/lib/lead-notifications.js');
    
    // Mock lead data
    const testLead = {
      id: 'test-lead-123',
      nome: 'João Silva',
      email: 'joao@teste.com',
      whatsapp: '+5511999999999',
      telefone: '+5511888888888',
      origem: 'São Paulo',
      destino: 'Miami',
      selectedServices: ['voos', 'hospedagem', 'seguro_viagem'],
      source: 'website',
      createdAt: new Date().toISOString(),
      orcamentoTotal: 'R$ 8.000',
      dataPartida: '2024-12-15',
      dataRetorno: '2024-12-30',
      tipoViagem: 'ida_volta',
      numeroPassageiros: 2,
      classeViagem: 'economica',
      prioridadeOrcamento: 'custo_beneficio',
      precisaHospedagem: true,
      precisaTransporte: false,
      observacoes: 'Lua de mel - preciso de quarto romântico'
    };
    
    console.log('📋 Test Lead Data:');
    console.log(`   Nome: ${testLead.nome}`);
    console.log(`   Email: ${testLead.email}`);
    console.log(`   Viagem: ${testLead.origem} → ${testLead.destino}`);
    console.log(`   Serviços: ${testLead.selectedServices.length} selecionados\n`);
    
    // Test 1: Admin notification
    console.log('📧 Test 1: Admin Email Notification');
    const adminResult = await sendLeadNotificationToAdmin(testLead);
    console.log(`   Result: ${adminResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Details: ${JSON.stringify(adminResult, null, 2)}\n`);
    
    // Test 2: Customer confirmation
    console.log('📧 Test 2: Customer Confirmation Email');
    const customerResult = await sendCustomerConfirmationEmail(testLead);
    console.log(`   Result: ${customerResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Details: ${JSON.stringify(customerResult, null, 2)}\n`);
    
    // Test 3: Complete notification flow
    console.log('📧 Test 3: Complete Notification Flow');
    const completeResult = await sendLeadNotification(testLead);
    console.log(`   Result: ${completeResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Customer Email: ${completeResult.customerEmail?.success ? '✅' : '❌'}`);
    console.log(`   Admin Email: ${completeResult.adminEmail?.success ? '✅' : '❌'}`);
    console.log(`   Webhook: ${completeResult.webhook?.success ? '✅' : '❌'}\n`);
    
    // Test 4: Email service configuration
    console.log('⚙️  Test 4: Email Service Configuration');
    const { emailService } = await import('./src/lib/email.js');
    
    const testEmailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Test HTML content</p>',
      text: 'Test text content'
    };
    
    const serviceResult = await emailService.sendEmail(testEmailData);
    console.log(`   Email Service: ${serviceResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Details: ${JSON.stringify(serviceResult, null, 2)}\n`);
    
    // Summary
    console.log('📊 SUMMARY');
    console.log('=====================================');
    console.log(`✅ Admin Notifications: ${adminResult.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Customer Emails: ${customerResult.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Complete Flow: ${completeResult.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Email Service: ${serviceResult.success ? 'WORKING' : 'FAILED'}`);
    
    if (adminResult.success && customerResult.success && serviceResult.success) {
      console.log('\n🎉 ALL TESTS PASSED - Email system is working correctly!');
      console.log('\n🔧 Next Steps:');
      console.log('   1. Set proper Gmail credentials in environment variables');
      console.log('   2. Test with real email addresses');
      console.log('   3. Submit a test lead form to verify end-to-end flow');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED - Check configuration');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Verify Gmail credentials are set');
      console.log('   2. Check N8N webhook URL is correct');
      console.log('   3. Ensure all dependencies are installed');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.log('\n🔧 Common Issues:');
    console.log('   1. Missing dependencies: npm install');
    console.log('   2. Import path issues: check file locations');
    console.log('   3. Environment setup: verify all required vars');
  }
}

// Run the test
testEmailSystem().catch(console.error);