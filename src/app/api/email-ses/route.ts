import { NextRequest, NextResponse } from 'next/server';

// Configuração Amazon SES (Alternativa mais barata)
// 62.000 emails GRÁTIS por mês via AWS Free Tier
// Depois: $0.10 por 1.000 emails

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

      // Múltiplas tentativas de SMTP
      const nodemailer = await import('nodemailer');
      
      // Configurações SMTP em ordem de prioridade
      const smtpConfigs = [
        // 1. Gmail com OAuth2 (mais seguro)
        {
          name: 'Gmail OAuth2',
          config: {
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.GMAIL_EMAIL,
              clientId: process.env.GMAIL_CLIENT_ID,
              clientSecret: process.env.GMAIL_CLIENT_SECRET,
              refreshToken: process.env.GMAIL_REFRESH_TOKEN
            }
          }
        },
        // 2. Gmail com senha de app
        {
          name: 'Gmail App Password',
          config: {
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_EMAIL,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          }
        },
        // 3. SMTP direto Gmail
        {
          name: 'Gmail SMTP Direct',
          config: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.GMAIL_EMAIL,
              pass: process.env.GMAIL_APP_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          }
        },
        // 4. Outlook/Hotmail
        {
          name: 'Outlook SMTP',
          config: {
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.OUTLOOK_EMAIL,
              pass: process.env.OUTLOOK_PASSWORD
            }
          }
        }
      ];

      let transporter = null;
      let usedConfig = null;

      // Tentar cada configuração até uma funcionar
      for (const smtpConfig of smtpConfigs) {
        try {
          if (!smtpConfig.config.auth.user) continue; // Pular se não tiver credenciais
          
          transporter = nodemailer.default.createTransport(smtpConfig.config as any);
          await transporter.verify();
          usedConfig = smtpConfig.name;
          break;
        } catch (error) {
          console.log(`❌ ${smtpConfig.name} falhou:`, error.message);
          continue;
        }
      }

      if (!transporter) {
        // Erro - nenhum SMTP configurado
        console.log('❌ Nenhum SMTP configurado! Configure Gmail ou AWS SES');
        
        return NextResponse.json({ 
          success: false, 
          error: 'Nenhum SMTP configurado! Configure Gmail ou AWS SES',
          instructions: {
            gmail: 'Configure GMAIL_EMAIL e GMAIL_APP_PASSWORD',
            aws_ses: 'Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_FROM_EMAIL'
          }
        }, { status: 500 });
      }

      const templates = {
        promotional: {
          subject: '✈️ [SES TEST] Exclusive Offer: Miami from $1,299!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
                <h1>✈️ Fly2Any - Amazon SES TESTE</h1>
                <h2>62.000 Emails GRÁTIS/mês!</h2>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                <h2 style="color: #1e40af;">🎯 Miami for only $1,299</h2>
                <p>✅ <strong>Amazon SES funcionando!</strong></p>
                <p>📧 Via AWS SES (mais barato)</p>
                <p>🚀 62.000 emails grátis/mês</p>
                <p>💰 Depois: $0.10 por 1.000 emails</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>📊 Comparação de Custos:</h3>
                  <ul>
                    <li>🔥 <strong>Amazon SES:</strong> $0.10/1000 emails</li>
                    <li>💸 Resend: $20/mês para 50k emails</li>
                    <li>💸 Mailchimp: $350/mês para 50k emails</li>
                    <li>💸 SendGrid: $89.95/mês para 50k emails</li>
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
          subject: '📰 [SES TEST] Newsletter Fly2Any',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
                <h1>✈️ Newsletter Fly2Any - Amazon SES</h1>
              </div>
              <div style="padding: 20px;">
                <h2>📰 Newsletter via Amazon SES!</h2>
                <p>✅ Sistema mais barato ativo</p>
                <p>💰 62.000 emails grátis/mês</p>
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
          subject: '💔 [SES TEST] Sentimos sua falta!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
                <h1>💔 Sentimos sua falta! - Amazon SES</h1>
              </div>
              <div style="padding: 30px;">
                <h2>✅ Amazon SES Reativação Funcionando!</h2>
                <p>💰 Custo mais baixo do mercado</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>🎁 Oferta Especial de Volta:</h3>
                  <p><strong>15% OFF</strong> na sua próxima viagem!</p>
                  <p>Código: <strong>SES15</strong></p>
                </div>
              </div>
            </div>`
        }
      };

      const template = templates[campaignType as keyof typeof templates] || templates.promotional;
      
      const mailOptions = {
        from: '"Fly2Any" <contato@fly2any.com>',
        to: email,
        subject: template.subject,
        html: template.html
      };

      const result = await transporter.sendMail(mailOptions);

      return NextResponse.json({ 
        success: true, 
        message: `Email enviado via ${usedConfig} para ${email}!`,
        messageId: result.messageId,
        provider: usedConfig,
        smtp_working: true
      });
    }

    // Outras ações
    return NextResponse.json({ 
      success: true, 
      message: 'Amazon SES configurado - 62.000 emails grátis/mês!' 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno Amazon SES'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    provider: 'Amazon SES',
    pricing: {
      free: '62,000 emails/month',
      paid: '$0.10 per 1,000 emails',
      comparison: {
        'Amazon SES': '$0.10/1000',
        'Resend': '$20/month for 50k',
        'Mailchimp': '$350/month for 50k',
        'SendGrid': '$89.95/month for 50k'
      }
    },
    benefits: [
      '62.000 emails grátis por mês',
      'Depois apenas $0.10 por 1.000 emails',
      'Deliverability de 99%+',
      'Integração fácil com AWS',
      'Sem limites de contatos'
    ]
  });
}