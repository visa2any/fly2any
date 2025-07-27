// Teste do sistema de email
async function testEmail() {
  try {
    const response = await fetch('http://localhost:3000/api/email-gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'info@fly2any.com',
        subject: '🧪 Teste de Email - Sistema de Alertas',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🧪 Teste do Sistema de Email</h2>
            <p>Este é um teste para verificar se o sistema de notificação de leads está funcionando.</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p>Se você recebeu este email, o sistema está funcionando corretamente!</p>
          </div>
        `,
        text: 'Teste do sistema de email - ' + new Date().toLocaleString('pt-BR')
      })
    });

    const result = await response.json();
    console.log('Resultado do teste:', result);
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log('❌ Falha no envio:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste se o servidor estiver rodando
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testEmail();
} else {
  // Browser environment
  console.log('Execute este teste no navegador ou Node.js');
}