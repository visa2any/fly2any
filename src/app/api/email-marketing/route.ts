import { NextRequest, NextResponse } from 'next/server';
import { 
  initEmailMarketingTables, 
  EmailContactsDB, 
  EmailCampaignsDB, 
  EmailSendsDB,
  generateUnsubscribeToken,
  EmailContact,
  EmailCampaign 
} from '@/lib/email-marketing-db';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Inicializar tabelas na primeira execução
let tablesInitialized = false;
async function ensureTablesExist() {
  if (!tablesInitialized) {
    try {
      await initEmailMarketingTables();
      tablesInitialized = true;
      console.log('✅ Tabelas de email marketing inicializadas');
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      throw error;
    }
  }
}

// Função para obter credenciais Gmail
function getGmailCredentials() {
  let email = process.env.GMAIL_EMAIL;
  let password = process.env.GMAIL_APP_PASSWORD;
  
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
                
                if (key === 'GMAIL_EMAIL' && !email) email = value;
                if (key === 'GMAIL_APP_PASSWORD' && !password) password = value;
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
    console.log('✅ Credenciais Gmail carregadas de variáveis de ambiente');
  }
  
  return { email, password };
}

// Templates de email
const EMAIL_TEMPLATES = {
  promotional: {
    subject: '⚡ ÚLTIMAS 24H: Pacote COMPLETO Miami por $1.299 - Passagem+Hotel+Carro',
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
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">21 anos conectando brasileiros ao mundo</p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);">
            <h2 style="color: #dc2626; font-size: 28px; margin: 0 0 10px 0; font-weight: 800;">
              🔥 PACOTE COMPLETO: TUDO INCLUÍDO!
            </h2>
            <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">
              Miami COMPLETO por apenas <span style="color: #dc2626; font-size: 24px;">$1.299</span>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ✈️ Passagem + 🏨 Hotel + 🚗 Carro + 🎯 Passeios + 🛡️ Seguro<br><s>Preço separado: $2.890</s> • <strong style="color: #059669;">Economia: $1.591!</strong>
            </p>
          </div>

          <!-- CTA Principal -->
          <div style="padding: 30px; text-align: center; background: #fafafa;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 4px; border-radius: 12px; display: inline-block; margin-bottom: 15px;">
              <a href="https://fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
                🚀 QUERO MEU PACOTE COMPLETO
              </a>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há 21 anos
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.6;">
              <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      </body>
      </html>`
  },
  newsletter: {
    subject: '🧳 21 ANOS de segredos: Como montar sua viagem COMPLETA economizando $1.500+',
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
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Newsletter Exclusiva • Dicas semanais</p>
          </div>

          <!-- Welcome Message -->
          <div style="padding: 25px; background: #fafafa; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Olá, <strong>{{nome}}</strong>! 👋<br>
              Esta semana revelamos os <strong>segredos dos especialistas</strong> que nossa equipe usa há 21 anos para montar viagens COMPLETAS com economia máxima.
            </p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
              💡 SEGREDO #1: Por que comprar SEPARADO é mais caro
            </h2>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
              <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
                <strong>🕐 Horários mágicos:</strong> Quando você compra passagem, hotel, carro e passeios SEPARADAMENTE, paga até 60% mais caro. Nossos pacotes COMPLETOS garantem o melhor preço por incluir TUDO em uma única negociação.
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                ✅ <em>Testado com clientes reais: Maria economizou $743 usando esta técnica na rota SP-Miami.</em>
              </p>
            </div>

            <!-- Action Section -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 QUER RESULTADOS ASSIM?</h3>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Há 21 anos criamos pacotes COMPLETOS que incluem TUDO: passagens, hotéis, carros, passeios e seguro viagem. Você só se preocupa em aproveitar!
              </p>
              <a href="https://fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                📱 QUERO PACOTE COMPLETO
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Fly2Any Insider</strong> • Seus especialistas em viagens internacionais
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              📱 WhatsApp: +55 11 99999-9999 • 📧 insider@fly2any.com
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.6;">
              <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      </body>
      </html>`
  },
  reactivation: {
    subject: '💔 Sentimos sua falta... PACOTE COMPLETO com 30% OFF só para você!',
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
              Que saudades de você, {{nome}}... 💔
            </p>
          </div>

          <!-- Personal Message -->
          <div style="padding: 30px; background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); text-align: center;">
            <h2 style="color: #be123c; font-size: 24px; margin: 0 0 20px 0; font-weight: 700; line-height: 1.3;">
              Depois de 21 anos, sabemos quando um viajante especial como você está pronto para a próxima aventura...
            </h2>
            <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              Sabemos que a vida anda corrida, mas <strong>você merece muito mais do que uma pausa</strong>. Merece uma experiência COMPLETA, sem stress, onde só precisa se preocupar em aproveitar!
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
                  30% OFF
                </div>
                <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                  No seu PACOTE COMPLETO dos sonhos
                </p>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24;">
                  <div style="font-weight: 700; color: #92400e; font-size: 18px;">
                    Código: <span style="background: #92400e; color: white; padding: 5px 10px; border-radius: 4px;">VOLTEI30</span>
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
                💖 QUERO MEU PACOTE COMPLETO
              </a>
            </div>
            <div style="font-size: 14px; color: #be123c; margin-top: 10px; font-weight: 600;">
              ⏰ Oferta expira em 7 dias • Código VOLTEI30
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há 21 anos
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.6;">
              <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      </body>
      </html>`
  }
};

// POST - Ações principais
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();
    
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // Importar contatos
      case 'import_contacts': {
        const { contactsData } = body;
        
        if (!Array.isArray(contactsData) || contactsData.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Dados de contatos inválidos'
          }, { status: 400 });
        }

        // Preparar contatos para inserção
        const contactsToInsert = contactsData.map((contact: any) => ({
          email: contact.email,
          nome: contact.nome || contact.name || 'Cliente',
          sobrenome: contact.sobrenome || contact.lastName || '',
          telefone: contact.telefone || contact.phone || '',
          segmento: contact.segmento || 'geral',
          tags: Array.isArray(contact.tags) ? contact.tags : (contact.tags ? contact.tags.split(';') : []),
          status: 'ativo' as const,
          email_status: 'not_sent' as const,
          unsubscribe_token: generateUnsubscribeToken()
        }));

        const result = await EmailContactsDB.bulkCreate(contactsToInsert);
        
        return NextResponse.json({
          success: true,
          data: {
            imported: result.inserted,
            duplicates: result.duplicates,
            errors: result.errors,
            message: `${result.inserted} contatos importados com sucesso! ${result.duplicates} duplicatas ignoradas.`
          }
        });
      }

      // Criar campanha
      case 'create_campaign': {
        const { name, subject, templateType, htmlContent, textContent } = body;
        
        const template = EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES] || EMAIL_TEMPLATES.promotional;
        
        const campaign = await EmailCampaignsDB.create({
          name: name || 'Nova Campanha',
          subject: subject || template.subject,
          template_type: templateType || 'promotional',
          html_content: htmlContent || template.html,
          text_content: textContent || '',
          status: 'draft',
          total_recipients: 0,
          total_sent: 0,
          total_delivered: 0,
          total_opened: 0,
          total_clicked: 0,
          total_bounced: 0,
          total_unsubscribed: 0
        });
        
        return NextResponse.json({
          success: true,
          data: campaign
        });
      }

      // Enviar email de teste
      case 'send_test': {
        const { email, campaignType = 'promotional' } = body;
        
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email é obrigatório'
          }, { status: 400 });
        }

        const credentials = getGmailCredentials();
        
        if (!credentials.email || !credentials.password) {
          return NextResponse.json({
            success: false,
            error: 'Credenciais Gmail não configuradas'
          }, { status: 500 });
        }
        
        const transporter = nodemailer.createTransport({
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
        
        const template = EMAIL_TEMPLATES[campaignType as keyof typeof EMAIL_TEMPLATES] || EMAIL_TEMPLATES.promotional;
        
        // Personalizar template
        const personalizedHtml = template.html
          .replace(/{{nome}}/g, 'Teste')
          .replace(/{{unsubscribe_url}}/g, 'https://fly2any.com/unsubscribe');
        
        const result = await transporter.sendMail({
          from: `"Fly2Any" <${credentials.email}>`,
          to: email,
          subject: `[TESTE] ${template.subject}`,
          html: personalizedHtml
        });

        return NextResponse.json({
          success: true,
          message: `Email teste enviado para ${email}`,
          messageId: result.messageId
        });
      }

      // Enviar campanha
      case 'send_campaign': {
        const { campaignId, segment, limit = 500 } = body;
        
        const campaign = await EmailCampaignsDB.findById(campaignId);
        if (!campaign) {
          return NextResponse.json({
            success: false,
            error: 'Campanha não encontrada'
          }, { status: 404 });
        }

        // Buscar contatos disponíveis
        const filters: any = {
          status: 'active',
          email_status: 'not_sent',
          limit: parseInt(limit)
        };

        if (segment && segment !== '') {
          filters.segmento = segment;
        }

        const contacts = await EmailContactsDB.findAll(filters);
        
        if (contacts.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum contato disponível para envio'
          }, { status: 400 });
        }

        // Atualizar status da campanha
        await EmailCampaignsDB.updateStatus(campaignId, 'sending');
        
        // Criar registros de envio
        const sendPromises = contacts.map(contact => 
          EmailSendsDB.create({
            campaign_id: campaignId,
            contact_id: contact.id,
            email: contact.email,
            status: 'pending'
          })
        );
        
        const emailSends = await Promise.all(sendPromises);

        // Processar envios de forma assíncrona
        processCampaignSends(campaign, contacts, emailSends).catch(error => {
          console.error('Erro no processamento assíncrono:', error);
        });
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Campanha iniciada para ${contacts.length} contatos`,
            campaignId,
            totalRecipients: contacts.length,
            status: 'sending'
          }
        });
      }

      // Ações rápidas (compatibilidade com interface atual)
      case 'send_promotional':
      case 'send_newsletter': 
      case 'send_reactivation': {
        const { segment } = body;
        const templateType = action.replace('send_', '') as keyof typeof EMAIL_TEMPLATES;
        
        // Criar campanha automática
        const template = EMAIL_TEMPLATES[templateType];
        const campaign = await EmailCampaignsDB.create({
          name: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${new Date().toLocaleDateString('pt-BR')}`,
          subject: template.subject,
          template_type: templateType as any,
          html_content: template.html,
          text_content: '',
          status: 'draft',
          total_recipients: 0,
          total_sent: 0,
          total_delivered: 0,
          total_opened: 0,
          total_clicked: 0,
          total_bounced: 0,
          total_unsubscribed: 0
        });

        // Enviar campanha
        return await POST(new NextRequest(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify({
            action: 'send_campaign',
            campaignId: campaign.id,
            segment,
            limit: 500
          })
        }));
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não encontrada'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erro na API de email marketing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

// GET - Consultas
export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        const stats = await EmailContactsDB.getStats();
        const campaigns = await EmailCampaignsDB.findAll();
        
        return NextResponse.json({
          success: true,
          data: {
            totalContacts: stats.totalContacts,
            segmentStats: stats.bySegmento,
            emailStats: stats.byEmailStatus,
            campaignsSent: campaigns.filter(c => c.status === 'completed').length,
            avgOpenRate: '0%', // TODO: Implementar cálculo real
            avgClickRate: '0%'  // TODO: Implementar cálculo real
          }
        });
      }

      case 'contacts': {
        const limit = parseInt(searchParams.get('limit') || '500');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;
        const emailStatus = searchParams.get('email_status') || undefined;
        const segmento = searchParams.get('segmento') || undefined;
        
        const contacts = await EmailContactsDB.findAll({
          status,
          email_status: emailStatus,
          segmento,
          limit,
          offset
        });
        
        const stats = await EmailContactsDB.getStats();
        
        return NextResponse.json({
          success: true,
          data: {
            contacts,
            total: stats.totalContacts,
            stats: stats.byEmailStatus
          }
        });
      }

      case 'campaigns': {
        const campaigns = await EmailCampaignsDB.findAll();
        
        return NextResponse.json({
          success: true,
          data: { campaigns }
        });
      }

      case 'campaign_stats': {
        const campaignId = searchParams.get('campaign_id');
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id é obrigatório'
          }, { status: 400 });
        }

        const stats = await EmailSendsDB.getCampaignStats(campaignId);
        
        return NextResponse.json({
          success: true,
          data: { stats }
        });
      }

      case 'load_imported_contacts': {
        try {
          // Executar o SQL de importação
          const importFile = path.join(process.cwd(), 'final-import.sql');
          
          if (fs.existsSync(importFile)) {
            const importSQL = fs.readFileSync(importFile, 'utf8');
            
            // Extrair apenas os INSERTs, pular CREATE TABLE e índices
            const insertLines = importSQL
              .split('\n')
              .filter(line => line.trim().startsWith('INSERT INTO email_contacts'))
              .slice(0, 500); // Limitar a 500 para evitar timeout
            
            let imported = 0;
            for (const insertLine of insertLines) {
              try {
                // Executar diretamente o INSERT via raw SQL
                const result = await sql.query(insertLine);
                imported++;
              } catch (error) {
                // Ignorar duplicatas
                if (!error?.message?.includes('duplicate key')) {
                  console.error('Erro ao importar:', error);
                }
              }
            }
            
            return NextResponse.json({
              success: true,
              data: { 
                imported,
                message: `${imported} contatos importados do arquivo SQL`
              }
            });
          }
          
          return NextResponse.json({
            success: false,
            error: 'Arquivo de importação não encontrado'
          }, { status: 404 });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação obrigatória'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erro na consulta da API de email marketing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

// Função para processar envios da campanha de forma assíncrona
async function processCampaignSends(campaign: EmailCampaign, contacts: EmailContact[], emailSends: any[]) {
  const credentials = getGmailCredentials();
  
  if (!credentials.email || !credentials.password) {
    console.error('❌ Credenciais Gmail não configuradas');
    return;
  }

  const transporter = nodemailer.createTransport({
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

  let successCount = 0;
  let failureCount = 0;
  const batchSize = 10; // Processar 10 emails por vez

  console.log(`🚀 Iniciando envio da campanha ${campaign.name} para ${contacts.length} contatos`);

  // Processar em lotes
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const batchSends = emailSends.slice(i, i + batchSize);
    
    console.log(`📧 Processando lote ${Math.floor(i/batchSize) + 1} - ${batch.length} emails`);
    
    // Processar lote em paralelo
    const batchPromises = batch.map(async (contact, index) => {
      try {
        const emailSend = batchSends[index];
        
        // Personalizar HTML
        const personalizedHtml = (campaign.html_content || '')
          .replace(/{{nome}}/g, contact.nome)
          .replace(/{{email}}/g, contact.email)
          .replace(/{{unsubscribe_url}}/g, `https://fly2any.com/unsubscribe?token=${contact.unsubscribe_token}`);
        
        // Enviar email
        const result = await transporter.sendMail({
          from: `"Fly2Any" <${credentials.email}>`,
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml
        });
        
        // Atualizar status do envio
        await EmailSendsDB.updateStatus(emailSend.id, 'sent', {
          sent_at: new Date(),
          message_id: result.messageId
        });
        
        // Atualizar status do contato
        await EmailContactsDB.updateEmailStatus(contact.id, 'sent', new Date());
        
        console.log(`✅ Email enviado: ${contact.email}`);
        return { success: true, email: contact.email };
        
      } catch (error) {
        const emailSend = batchSends[index];
        
        // Atualizar como falha
        await EmailSendsDB.updateStatus(emailSend.id, 'failed', {
          failed_reason: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        
        await EmailContactsDB.updateEmailStatus(contact.id, 'failed');
        
        console.error(`❌ Erro ao enviar para ${contact.email}:`, error);
        return { success: false, email: contact.email, error };
      }
    });
    
    // Aguardar conclusão do lote
    const results = await Promise.all(batchPromises);
    
    // Contar sucessos e falhas
    results.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    });
    
    // Aguardar entre lotes (rate limiting)
    if (i + batchSize < contacts.length) {
      console.log('⏸️ Aguardando 30 segundos antes do próximo lote...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // Atualizar estatísticas da campanha
  await EmailCampaignsDB.updateStats(campaign.id, {
    total_recipients: contacts.length,
    total_sent: successCount
  });
  
  await EmailCampaignsDB.updateStatus(campaign.id, 'completed');

  console.log(`✅ Campanha ${campaign.name} finalizada: ${successCount} sucessos, ${failureCount} falhas`);
}