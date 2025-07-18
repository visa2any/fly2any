import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      from,
      message,
      contactName,
      intent,
      priority,
      isBusinessHours
    } = data;

    // Import Resend dynamically
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Determine urgency
    const isUrgent = intent === 'urgent' || priority === 'high';
    const subject = `${isUrgent ? '🚨 URGENTE - ' : '📱 Nova - '}Mensagem WhatsApp`;

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isUrgent ? '#dc2626' : '#1e40af'}; color: white; padding: 20px; text-align: center;">
          <h1>${isUrgent ? '🚨 MENSAGEM URGENTE' : '📱 Nova Mensagem WhatsApp'}</h1>
        </div>
        
        <div style="padding: 20px; background: #f8fafc;">
          <h2>Detalhes da Mensagem:</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>📞 De:</strong> ${contactName || 'Cliente'}</p>
            <p><strong>📱 Telefone:</strong> ${from}</p>
            <p><strong>💬 Mensagem:</strong></p>
            <div style="background: #f1f5f9; padding: 10px; border-radius: 4px; margin: 10px 0;">
              ${message}
            </div>
          </div>

          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>📊 Análise Automática:</h3>
            <p><strong>🎯 Intenção:</strong> ${intent}</p>
            <p><strong>⚡ Prioridade:</strong> ${priority}</p>
            <p><strong>🕐 Horário Comercial:</strong> ${isBusinessHours ? 'Sim' : 'Não'}</p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://fly2any.com/admin" 
               style="background: #25d366; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              📋 Acessar Painel Admin
            </a>
          </div>

          <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3>📝 Próximos Passos:</h3>
            <ul>
              <li>✅ Responder via WhatsApp ou telefone</li>
              <li>✅ Criar ticket de suporte se necessário</li>
              <li>✅ Registrar interação no CRM</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const textContent = `
Nova mensagem WhatsApp recebida:

De: ${contactName || 'Cliente'}
Telefone: ${from}
Mensagem: ${message}

Análise:
- Intenção: ${intent}
- Prioridade: ${priority}
- Horário comercial: ${isBusinessHours ? 'Sim' : 'Não'}

Acesse o painel admin para responder: https://fly2any.com/admin
    `;

    // Send email notification
    const result = await resend.emails.send({
      from: 'Fly2Any <noreply@mail.fly2any.com>',
      to: ['fly2any.travel@gmail.com'],
      subject,
      html: htmlContent,
      text: textContent
    });

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso',
      messageId: result.data?.id
    });

  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}