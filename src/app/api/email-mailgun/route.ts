import { NextRequest, NextResponse } from 'next/server';

// Configuração Mailgun (Melhor custo-benefício + simples)
// Sem limite de contatos + $0.80 por 1.000 emails

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, campaignType, subject, htmlContent, toEmails, html, text } = body;

    // Verificar se as credenciais Mailgun estão configuradas
    const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
    const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
    const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'contato@fly2any.com';

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais Mailgun não configuradas',
        instructions: {
          step1: 'Acesse mailgun.com e crie conta gratuita',
          step2: 'Verifique seu domínio',
          step3: 'Configure MAILGUN_API_KEY e MAILGUN_DOMAIN no .env',
          step4: 'Setup completo em 2 minutos!'
        }
      }, { status: 500 });
    }

    // Simple email sending for lead notifications
    if (action === 'send_simple') {
      if (!email) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email is required' 
        }, { status: 400 });
      }

      if (!subject || !html) {
        return NextResponse.json({ 
          success: false, 
          error: 'Subject and HTML are required' 
        }, { status: 400 });
      }

      // Send via Mailgun API
      const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
      
      const formData = new FormData();
      formData.append('from', `Fly2Any <${MAILGUN_FROM_EMAIL}>`);
      formData.append('to', email);
      formData.append('subject', subject);
      formData.append('html', html);
      if (text) {
        formData.append('text', text);
      }

      const response = await fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Mailgun error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();

      return NextResponse.json({ 
        success: true, 
        message: `Email sent via Mailgun to ${email}!`,
        messageId: result.id,
        provider: 'Mailgun'
      });
    }

    if (action === 'send_test') {
      if (!email) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email é obrigatório para teste' 
        }, { status: 400 });
      }

      const templates = {
        promotional: {
          subject: '✈️ [MAILGUN TEST] Exclusive Offer: Miami from $1,299!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
                <h1>✈️ Fly2Any - Mailgun ATIVO</h1>
                <h2>Sem Limite de Contatos!</h2>
              </div>
              <div style="padding: 30px; background: #f8fafc;">
                <h2 style="color: #1e40af;">🎯 Miami for only $1,299</h2>
                <p>✅ <strong>Mailgun funcionando perfeitamente!</strong></p>
                <p>📧 Via Mailgun (simples + barato)</p>
                <p>🚀 Sem limite de contatos</p>
                <p>💰 Apenas $0.80 por 1.000 emails</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>📊 Comparação de Custos:</h3>
                  <ul>
                    <li>🔥 <strong>Mailgun:</strong> $0.80/1000 emails</li>
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
          subject: '📰 [MAILGUN TEST] Newsletter Fly2Any',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
                <h1>✈️ Newsletter Fly2Any - Mailgun</h1>
              </div>
              <div style="padding: 20px;">
                <h2>📰 Newsletter via Mailgun!</h2>
                <p>✅ Sistema simples ativo</p>
                <p>💰 $0.80 por 1.000 emails</p>
                <p>🚀 Sem limite de contatos</p>
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
          subject: '💔 [MAILGUN TEST] Sentimos sua falta!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
                <h1>💔 Sentimos sua falta! - Mailgun</h1>
              </div>
              <div style="padding: 30px;">
                <h2>✅ Mailgun Reativação Funcionando!</h2>
                <p>💰 Custo baixo + sem limites</p>
                <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>🎁 Oferta Especial de Volta:</h3>
                  <p><strong>15% OFF</strong> na sua próxima viagem!</p>
                  <p>Código: <strong>MAILGUN15</strong></p>
                </div>
              </div>
            </div>`
        }
      };

      const template = templates[campaignType as keyof typeof templates] || templates.promotional;
      
      // Enviar via Mailgun API
      const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
      
      const formData = new FormData();
      formData.append('from', `Fly2Any <${MAILGUN_FROM_EMAIL}>`);
      formData.append('to', email);
      formData.append('subject', template.subject);
      formData.append('html', template.html);

      const response = await fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Mailgun error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();

      return NextResponse.json({ 
        success: true, 
        message: `Email enviado via Mailgun para ${email}!`,
        messageId: result.id,
        provider: 'Mailgun',
        mailgun_working: true
      });
    }

    if (action === 'send_campaign') {
      if (!toEmails || !Array.isArray(toEmails) || toEmails.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Lista de emails é obrigatória para campanha' 
        }, { status: 400 });
      }

      if (!subject || !htmlContent) {
        return NextResponse.json({ 
          success: false, 
          error: 'Subject e conteúdo HTML são obrigatórios' 
        }, { status: 400 });
      }

      const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
      const results = [];
      
      // Enviar para cada email (em lotes de 1000 para otimizar)
      for (let i = 0; i < toEmails.length; i += 1000) {
        const batch = toEmails.slice(i, i + 1000);
        
        const formData = new FormData();
        formData.append('from', `Fly2Any <${MAILGUN_FROM_EMAIL}>`);
        formData.append('to', batch.join(','));
        formData.append('subject', subject);
        formData.append('html', htmlContent);

        try {
          const response = await fetch(mailgunUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            results.push({ success: true, messageId: result.id, batch: batch.length });
          } else {
            const errorData = await response.text();
            results.push({ success: false, error: errorData, batch: batch.length });
          }
        } catch (error) {
          results.push({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            batch: batch.length 
          });
        }

        // Delay entre lotes para não sobrecarregar
        if (i + 1000 < toEmails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const totalEmails = toEmails.length;

      return NextResponse.json({ 
        success: true, 
        message: `Campanha enviada via Mailgun`,
        totalEmails,
        successfulBatches: successCount,
        results,
        provider: 'Mailgun'
      });
    }

    // Outras ações
    return NextResponse.json({ 
      success: true, 
      message: 'Mailgun configurado - Sem limite de contatos + $0.80/1000 emails!' 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno Mailgun'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    provider: 'Mailgun',
    pricing: {
      pay_as_you_go: '$0.80 per 1,000 emails',
      no_monthly_fees: true,
      no_contact_limits: true,
      comparison: {
        'Mailgun': '$0.80/1000 emails',
        'SendGrid': '$14.95/month + limits',
        'Mailchimp': '$350/month for 50k',
        'Resend': '$20/month + limits'
      }
    },
    benefits: [
      'Sem limite de contatos',
      'Apenas $0.80 por 1.000 emails',
      'Deliverability de 99%+',
      'Setup super simples (2 minutos)',
      'API confiável e estável',
      'Sem taxas mensais',
      'Pague apenas pelo que usar'
    ],
    setup_instructions: {
      step1: 'Acesse mailgun.com',
      step2: 'Crie conta gratuita',
      step3: 'Verifique seu domínio',
      step4: 'Pegue API Key e Domain',
      step5: 'Configure no .env: MAILGUN_API_KEY e MAILGUN_DOMAIN'
    }
  });
}