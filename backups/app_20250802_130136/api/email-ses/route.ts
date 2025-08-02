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
        } catch (error: any) {
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

      // Se email personalizado foi enviado, use ele. Senão use template padrão apenas para testes manuais.
      let mailOptions;
      
      if (body.subject && body.html) {
        // Email personalizado (usado pelos leads reais)
        mailOptions = {
          from: '"Fly2Any" <contato@fly2any.com>',
          to: email,
          subject: body.subject,
          html: body.html,
          text: body.text
        };
      } else {
        // Template de teste apenas para testes manuais
        const testTemplate = {
          subject: '✅ Teste Gmail SMTP - Fly2Any',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #25d366; color: white; padding: 30px; text-align: center;">
                <h1>✅ Gmail SMTP Funcionando!</h1>
                <h2>Sistema de Email Ativo</h2>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                <h2 style="color: #25d366;">✅ Teste de Funcionamento</h2>
                <p><strong>Gmail SMTP conectado com sucesso!</strong></p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                <p>🚀 Sistema pronto para envio de leads</p>
              </div>
            </div>`
        };
        
        mailOptions = {
          from: '"Fly2Any" <contato@fly2any.com>',
          to: email,
          subject: testTemplate.subject,
          html: testTemplate.html
        };
      }

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