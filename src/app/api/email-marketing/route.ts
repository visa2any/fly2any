import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Função robusta para carregar credenciais Gmail
function getGmailCredentials() {
  // Primeiro, tenta process.env (configurado no Vercel)
  let email = process.env.GMAIL_EMAIL;
  let password = process.env.GMAIL_APP_PASSWORD;
  
  // Se não encontrou, carrega diretamente dos arquivos
  if (!email || !password) {
    const envFiles = ['.env.local', '.env', '.env.production.local'];
    
    for (const fileName of envFiles) {
      const envPath = path.join(process.cwd(), fileName);
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const equalIndex = trimmedLine.indexOf('=');
              if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim().replace(/["']/g, '');
                
                if (key === 'GMAIL_EMAIL' && !email) {
                  email = value;
                }
                if (key === 'GMAIL_APP_PASSWORD' && !password) {
                  password = value;
                }
              }
            }
          }
          
          if (email && password) {
            console.log(`✅ Credenciais Gmail carregadas de: ${fileName}`);
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao carregar ${fileName}:`, error);
      }
    }
  } else {
    console.log('✅ Credenciais Gmail carregadas de Vercel Environment Variables');
  }
  
  return { email, password };
}

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
      
      // Obter credenciais usando função robusta
      const credentials = getGmailCredentials();
      
      // Debug: verificar valores das variáveis
      console.log('=== DEBUG CREDENCIAIS GMAIL ===');
      console.log('GMAIL_EMAIL:', credentials.email || 'NÃO DEFINIDO');
      console.log('GMAIL_APP_PASSWORD:', credentials.password ? `****${credentials.password.slice(-4)}` : 'NÃO DEFINIDO');
      console.log('==============================');
      
      // Verificar se as credenciais foram carregadas
      if (!credentials.email || !credentials.password) {
        return NextResponse.json({ 
          success: false, 
          error: `Credenciais Gmail não configuradas. GMAIL_EMAIL: ${credentials.email ? 'OK' : 'MISSING'}, GMAIL_APP_PASSWORD: ${credentials.password ? 'OK' : 'MISSING'}` 
        }, { status: 500 });
      }
      
      const transporter = nodemailer.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: credentials.email,
          pass: credentials.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      const templates = {
        promotional: {
          subject: '⚡ ÚLTIMAS 24H: Economize até 40% - Miami por $1.299',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: white;">
                
                <!-- Header com Urgência -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; text-align: center; position: relative;">
                  <div style="position: absolute; top: 10px; right: 20px; background: #fbbf24; color: #000; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ⏰ RESTAM 24H
                  </div>
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700;">✈️ FLY2ANY</h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">+10 anos conectando brasileiros ao mundo</p>
                </div>

                <!-- Oferta Principal -->
                <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);">
                  <h2 style="color: #dc2626; font-size: 28px; margin: 0 0 10px 0; font-weight: 800;">
                    🔥 ECONOMIA DE ATÉ 40%
                  </h2>
                  <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">
                    Miami por apenas <span style="color: #dc2626; font-size: 24px;">$1.299</span>
                  </p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    <s>Preço normal: $2.165</s> • <strong style="color: #059669;">Você economiza $866!</strong>
                  </p>
                </div>

                <!-- Prova Social -->
                <div style="background: #f3f4f6; padding: 20px; margin: 0; border-left: 4px solid #10b981;">
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 18px;">⭐⭐⭐⭐⭐</span>
                    <span style="margin-left: 10px; font-weight: 600; color: #374151;">Maria Silva</span>
                    <span style="margin-left: 10px; color: #6b7280; font-size: 12px;">cliente verificada</span>
                  </div>
                  <p style="color: #374151; font-style: italic; margin: 0; font-size: 14px;">
                    "Incrível! Economizei mais de $800 na minha viagem para Miami. Atendimento impecável e resposta em 2 horas!"
                  </p>
                </div>

                <!-- Destinos em Destaque -->
                <div style="padding: 30px;">
                  <h3 style="text-align: center; color: #374151; margin: 0 0 20px 0;">🎯 OFERTAS EXCLUSIVAS</h3>
                  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding: 15px; align-items: center;">
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #374151;">🏖️ São Paulo → Miami</div>
                        <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.299</div>
                        <div style="font-size: 12px; color: #059669;">💰 Economia $866</div>
                      </div>
                    </div>

                    <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding: 15px; align-items: center;">
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #374151;">🗽 Rio → New York</div>
                        <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.599</div>
                        <div style="font-size: 12px; color: #059669;">💰 Economia $750</div>
                      </div>
                    </div>

                    <div style="display: flex; padding: 15px; align-items: center;">
                      <div style="flex: 1;">
                        <div style="font-weight: 600; color: #374151;">🎢 Salvador → Orlando</div>
                        <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.399</div>
                        <div style="font-size: 12px; color: #059669;">💰 Economia $680</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- CTA Principal -->
                <div style="padding: 30px; text-align: center; background: #fafafa;">
                  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 4px; border-radius: 12px; display: inline-block; margin-bottom: 15px;">
                    <a href="https://fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
                      🚀 GARANTIR OFERTA AGORA
                    </a>
                  </div>
                  <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                    ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há +10 anos
                  </p>
                  <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                    📱 WhatsApp: +1 (305) 555-0123 • 📧 contato@fly2any.com
                  </p>
                </div>
              </div>
            </body>
            </html>`
        },
        newsletter: {
          subject: '🧳 Segredos dos experts: Como economizar $800+ em viagens',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: white;">
                
                <!-- Header Premium -->
                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 700;">✈️ FLY2ANY INSIDER</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Newsletter Exclusiva • Edição #47</p>
                </div>

                <!-- Welcome Message -->
                <div style="padding: 25px; background: #fafafa; border-bottom: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                    Olá, <strong>Viajante</strong>! 👋<br>
                    Esta semana revelamos os <strong>segredos dos especialistas</strong> que nossa equipe usa há +10 anos para encontrar as melhores ofertas.
                  </p>
                </div>

                <!-- Main Content -->
                <div style="padding: 30px;">
                  <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
                    💡 DICA #1: O Truque das "Janelas Secretas"
                  </h2>
                  
                  <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
                    <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
                      <strong>🕐 Horários mágicos:</strong> Pesquise passagens entre <strong>14h-16h</strong> nas terças e quartas. Nossas análises de +50.000 buscas mostram economia média de <strong>32%</strong> nestes horários.
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      ✅ <em>Testado com clientes reais: Maria economizou $743 usando esta técnica na rota SP-Miami.</em>
                    </p>
                  </div>

                  <!-- Action Section -->
                  <div style="background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1;">
                    <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 QUER RESULTADOS ASSIM?</h3>
                    <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Nossa equipe monitora +1.000 rotas diariamente. Receba alertas personalizados quando os preços dos seus destinos favoritos despencarem.
                    </p>
                    <a href="https://fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                      📱 ATIVAR ALERTAS GRÁTIS
                    </a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Fly2Any Insider</strong> • Seus especialistas em viagens internacionais
                  </p>
                  <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                    📱 WhatsApp: +1 (305) 555-0123 • 📧 insider@fly2any.com
                  </p>
                </div>
              </div>
            </body>
            </html>`
        },
        reactivation: {
          subject: '💔 Sua próxima aventura está esperando... + 25% OFF exclusivo',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background: white;">
                
                <!-- Emotional Header -->
                <div style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; position: relative;">
                  <div style="position: absolute; top: 15px; right: 20px; background: #fbbf24; color: #000; padding: 8px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">
                    🎁 OFERTA VIP
                  </div>
                  <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700;">✈️ FLY2ANY</h1>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; opacity: 0.95;">
                    Que saudades de você... 💔
                  </p>
                </div>

                <!-- Personal Message -->
                <div style="padding: 30px; background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); text-align: center;">
                  <h2 style="color: #be123c; font-size: 24px; margin: 0 0 20px 0; font-weight: 700; line-height: 1.3;">
                    Já faz tempo que você não viaja conosco...
                  </h2>
                  <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
                    Sabemos que a vida anda corrida, mas <strong>você merece uma pausa</strong>. Sua última viagem conosco foi incrível, e temos certeza de que a próxima será ainda melhor!
                  </p>
                </div>

                <!-- Exclusive Offer -->
                <div style="padding: 30px; background: #f8fafc;">
                  <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 4px; border-radius: 16px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px; text-align: center;">
                      <h3 style="color: #92400e; font-size: 20px; margin: 0 0 15px 0; font-weight: 800;">
                        🎁 OFERTA ESPECIAL SÓ PARA VOCÊ
                      </h3>
                      <div style="color: #be123c; font-size: 32px; font-weight: 900; margin: 10px 0;">
                        25% OFF
                      </div>
                      <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                        Na sua próxima viagem dos sonhos
                      </p>
                      <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24;">
                        <div style="font-weight: 700; color: #92400e; font-size: 18px;">
                          Código: <span style="background: #92400e; color: white; padding: 5px 10px; border-radius: 4px;">SAUDADE25</span>
                        </div>
                        <div style="font-size: 12px; color: #92400e; margin-top: 5px;">
                          ⏰ Válido por 7 dias • Não perca esta chance!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Urgency CTA -->
                <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);">
                  <div style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); padding: 6px; border-radius: 16px; display: inline-block; margin-bottom: 15px;">
                    <a href="https://fly2any.com" style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(190, 18, 60, 0.4);">
                      💖 QUERO VOLTAR A VIAJAR
                    </a>
                  </div>
                  <div style="font-size: 14px; color: #be123c; margin-top: 10px; font-weight: 600;">
                    ⏰ Oferta expira em 7 dias • Código SAUDADE25
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há +10 anos
                  </p>
                  <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                    📱 WhatsApp: +1 (305) 555-0123 • 📧 contato@fly2any.com
                  </p>
                </div>
              </div>
            </body>
            </html>`
        }
      };

      const template = templates[campaignType as keyof typeof templates] || templates.promotional;
      
      const result = await transporter.sendMail({
        from: `"Fly2Any" <${credentials.email}>`,
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