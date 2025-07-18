import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, campaignType } = body;

    if (action === 'send_test') {
      if (!email) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email é obrigatório para teste' 
        }, { status: 400 });
      }

      // Verificar se domínio está configurado
      // TODO: Remover quando mail.fly2any.com estiver verificado

      // Usar Gmail App Password ao invés do Resend
      const nodemailer = await import('nodemailer');
      
      // Debug: verificar valores das variáveis
      console.log('GMAIL_EMAIL:', process.env.GMAIL_EMAIL);
      console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '****' : 'undefined');
      
      // Verificar se as variáveis de ambiente estão carregadas
      if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        return NextResponse.json({ 
          success: false, 
          error: `Credenciais Gmail não configuradas. GMAIL_EMAIL: ${process.env.GMAIL_EMAIL ? 'OK' : 'MISSING'}, GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? 'OK' : 'MISSING'}` 
        }, { status: 500 });
      }
      
      const transporter = nodemailer.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      const templates = {
        promotional: {
          subject: '✈️ [TEST] Exclusive Offer: Miami from $1,299!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
                <h1>✈️ Fly2Any - TESTE MARKETING</h1>
                <h2>Oferta Especial!</h2>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                <h2 style="color: #1e40af;">🎯 Miami for only $1,299</h2>
                <p>✅ <strong>Sistema de Email Marketing FUNCIONANDO!</strong></p>
                <p>📧 Via Gmail OAuth2</p>
                <p>🚀 Sistema configurado com sucesso!</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>📅 Ofertas Disponíveis:</h3>
                  <ul>
                    <li>✅ Miami: $1,299</li>
                    <li>✅ Orlando: $1,399</li>
                    <li>✅ New York: $1,599</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://fly2any.com" 
                     style="background: #25d366; color: white; padding: 15px 30px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold;">
                    🚀 ACESSAR SITE
                  </a>
                </div>
              </div>
            </div>`
        },
        newsletter: {
          subject: '📰 [TESTE] Newsletter Fly2Any',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
                <h1>✈️ Newsletter Fly2Any - TESTE</h1>
              </div>
              <div style="padding: 20px;">
                <h2>📰 Newsletter Funcionando!</h2>
                <p>✅ Sistema de newsletter ativo</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <h3>🎯 Dica da Semana</h3>
                <p>Como economizar até 40% em passagens:</p>
                <ul>
                  <li>✅ Reserve com 3 meses de antecedência</li>
                  <li>✅ Viaje em dias de semana</li>
                  <li>✅ Use nosso sistema de alertas</li>
                </ul>
              </div>
            </div>`
        },
        reactivation: {
          subject: '💔 [TESTE] Sentimos sua falta!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
                <h1>💔 Sentimos sua falta! - TESTE</h1>
              </div>
              <div style="padding: 30px;">
                <h2>✅ Sistema de Reativação Funcionando!</h2>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>🎁 Oferta Especial de Volta:</h3>
                  <p><strong>15% OFF</strong> na sua próxima viagem!</p>
                  <p>Código: <strong>TESTE15</strong></p>
                </div>
              </div>
            </div>`
        }
      };

      const template = templates[campaignType as keyof typeof templates] || templates.promotional;
      
      const result = await transporter.sendMail({
        from: `"Fly2Any" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: template.subject,
        html: template.html
      });

      return NextResponse.json({ 
        success: true, 
        message: `Email teste enviado para ${email} via Gmail!`,
        messageId: result.messageId
      });
    }

    // Outras ações
    return NextResponse.json({ 
      success: true, 
      message: 'Funcionalidade em desenvolvimento - teste funcionando!' 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'stats':
      return NextResponse.json({
        totalContacts: 5000,
        segmentStats: {
          'brasileiros-eua': 1500,
          'familias': 1200,
          'casais': 1000,
          'aventureiros': 800,
          'executivos': 500
        },
        campaignsSent: 0,
        avgOpenRate: '0%',
        avgClickRate: '0%'
      });

    case 'templates':
      return NextResponse.json({
        templates: [
          { id: 'promotional', name: 'Campanha Promocional', description: 'Ofertas especiais' },
          { id: 'newsletter', name: 'Newsletter', description: 'Dicas e novidades' },
          { id: 'reactivation', name: 'Reativação', description: 'Reconquistar clientes' }
        ]
      });

    default:
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetro action obrigatório' 
      }, { status: 400 });
  }
}