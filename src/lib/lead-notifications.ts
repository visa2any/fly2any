import { sendEmail } from './email';

export interface LeadNotificationData {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  telefone?: string;
  origem: string;
  destino: string;
  selectedServices: string[];
  source: string;
  createdAt: string;
  orcamentoTotal?: string;
  // Campos adicionais de viagem
  dataPartida?: string;
  dataRetorno?: string;
  tipoViagem?: string;
  numeroPassageiros?: number;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  classeViagem?: string;
  prioridadeOrcamento?: string;
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
  observacoes?: string;
  // Dados completos para fallback
  fullData?: any;
}

/**
 * Envia notificação por email quando um novo lead é criado
 */
export async function sendLeadNotificationToAdmin(leadData: LeadNotificationData) {
  try {
    const adminEmails = [
      'fly2any.travel@gmail.com',  // Primary Gmail account
      'info@fly2any.com'  // Secondary if needed
    ];

    const subject = `🚨 Novo Lead Recebido - ${leadData.nome}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Reset e Base */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f5f5f5;
            padding: 0;
            margin: 0;
        }
        
        /* Container Principal */
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        /* Header */
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 24px 20px; 
            text-align: center;
        }
        .header h2 { 
            font-size: 24px; 
            margin-bottom: 8px; 
            font-weight: 700;
        }
        .header p { 
            font-size: 16px; 
            opacity: 0.9; 
            margin: 0;
        }
        
        /* Content */
        .content { 
            padding: 20px; 
            background: white;
        }
        
        /* Cards de Informação */
        .lead-info { 
            background: #f8fafc; 
            padding: 16px; 
            border-radius: 8px; 
            margin: 16px 0; 
            border-left: 4px solid #667eea;
            border: 1px solid #e2e8f0;
        }
        .lead-info h3 { 
            font-size: 18px; 
            margin-bottom: 12px; 
            color: #1a202c;
            font-weight: 600;
        }
        
        /* Campos */
        .field { 
            margin: 12px 0; 
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .label { 
            font-weight: 600; 
            color: #4a5568; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .value { 
            color: #1a202c; 
            font-size: 16px;
            font-weight: 500;
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        /* Serviços */
        .services { 
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); 
            padding: 16px; 
            border-radius: 8px; 
            margin: 16px 0;
            border: 1px solid #bbdefb;
        }
        .services h3 {
            color: #1565c0;
            margin-bottom: 12px;
            font-size: 18px;
        }
        .services ul {
            list-style: none;
            padding: 0;
        }
        .services li {
            background: white;
            padding: 8px 12px;
            margin: 6px 0;
            border-radius: 6px;
            border-left: 3px solid #2196f3;
            font-weight: 500;
        }
        
        /* Estado Urgente */
        .urgent { 
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); 
            border-left-color: #ff9800;
            border-color: #ffcc02;
        }
        .urgent h3 { color: #e65100; }
        
        /* Botões */
        .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 14px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 16px 0;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }
        
        /* Footer */
        .footer { 
            text-align: center; 
            margin-top: 24px; 
            padding: 20px;
            color: #666; 
            font-size: 13px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        
        /* Mobile First - Media Queries */
        @media screen and (max-width: 480px) {
            .container { 
                margin: 0; 
                box-shadow: none;
                border-radius: 0;
            }
            
            .header { 
                padding: 20px 16px; 
                border-radius: 0;
            }
            .header h2 { 
                font-size: 20px; 
            }
            .header p { 
                font-size: 14px; 
            }
            
            .content { 
                padding: 16px; 
            }
            
            .lead-info { 
                padding: 14px; 
                margin: 12px 0;
                border-radius: 6px;
            }
            .lead-info h3 { 
                font-size: 16px; 
            }
            
            .field { 
                margin: 10px 0; 
            }
            .label { 
                font-size: 12px; 
            }
            .value { 
                font-size: 15px;
                padding: 10px;
            }
            
            .services { 
                padding: 14px; 
            }
            .services h3 {
                font-size: 16px;
            }
            .services li {
                padding: 10px;
                font-size: 14px;
            }
            
            .btn { 
                padding: 16px 24px; 
                font-size: 16px;
                width: 100%;
                text-align: center;
                display: block;
            }
            
            .footer { 
                padding: 16px;
                font-size: 12px;
            }
        }
        
        /* Suporte a Dark Mode */
        @media (prefers-color-scheme: dark) {
            .value {
                background: #f8fafc;
                color: #1a202c;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🛫 Fly2Any - Novo Lead Recebido</h2>
            <p>Um novo cliente potencial se interessou pelos nossos serviços!</p>
        </div>
        
        <div class="content">
            <div class="lead-info ${leadData.orcamentoTotal ? 'urgent' : ''}">
                <h3>👤 Informações do Cliente</h3>
                <div class="field">
                    <span class="label">Nome:</span> 
                    <span class="value">${leadData.nome}</span>
                </div>
                <div class="field">
                    <span class="label">Email:</span> 
                    <span class="value">${leadData.email}</span>
                </div>
                <div class="field">
                    <span class="label">WhatsApp:</span> 
                    <span class="value">${leadData.whatsapp}</span>
                </div>
            </div>

            <div class="lead-info">
                <h3>✈️ Detalhes da Viagem</h3>
                <div class="field">
                    <span class="label">Origem:</span> 
                    <span class="value">${leadData.origem || 'Não informado'}</span>
                </div>
                <div class="field">
                    <span class="label">Destino:</span> 
                    <span class="value">${leadData.destino || 'Não informado'}</span>
                </div>
                ${leadData.dataPartida ? `
                <div class="field">
                    <span class="label">Data de Partida:</span> 
                    <span class="value">${new Date(leadData.dataPartida).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${leadData.dataRetorno ? `
                <div class="field">
                    <span class="label">Data de Retorno:</span> 
                    <span class="value">${new Date(leadData.dataRetorno).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${leadData.tipoViagem ? `
                <div class="field">
                    <span class="label">Tipo de Viagem:</span> 
                    <span class="value">${leadData.tipoViagem === 'ida_volta' ? 'Ida e Volta' : 
                                      leadData.tipoViagem === 'ida-volta' ? 'Ida e Volta' :
                                      leadData.tipoViagem === 'somente-ida' ? 'Somente Ida' :
                                      leadData.tipoViagem === 'ida' ? 'Somente Ida' :
                                      leadData.tipoViagem === 'multiplas-cidades' ? 'Múltiplas Cidades' :
                                      leadData.tipoViagem === 'multiplas_cidades' ? 'Múltiplas Cidades' :
                                      leadData.tipoViagem}</span>
                </div>
                ` : ''}
                <div class="field">
                    <span class="label">Passageiros:</span> 
                    <span class="value">
                        ${leadData.numeroPassageiros ? `${leadData.numeroPassageiros} passageiros` :
                          (leadData.adultos || leadData.criancas || leadData.bebes) ? 
                          `${leadData.adultos || 0} adultos${leadData.criancas ? `, ${leadData.criancas} crianças` : ''}${leadData.bebes ? `, ${leadData.bebes} bebês` : ''}` :
                          'Não informado'}
                    </span>
                </div>
                ${leadData.classeViagem ? `
                <div class="field">
                    <span class="label">Classe:</span> 
                    <span class="value">${leadData.classeViagem === 'economica' ? 'Econômica' :
                                      leadData.classeViagem === 'premium' ? 'Premium' :
                                      leadData.classeViagem === 'executiva' ? 'Executiva' :
                                      leadData.classeViagem === 'primeira' ? 'Primeira Classe' :
                                      leadData.classeViagem}</span>
                </div>
                ` : ''}
                ${leadData.prioridadeOrcamento ? `
                <div class="field">
                    <span class="label">Prioridade Orçamento:</span> 
                    <span class="value">${leadData.prioridadeOrcamento === 'baixo_custo' ? 'Baixo Custo' :
                                      leadData.prioridadeOrcamento === 'custo_beneficio' ? 'Custo-Benefício' :
                                      leadData.prioridadeOrcamento === 'conforto' ? 'Conforto' :
                                      leadData.prioridadeOrcamento === 'luxo' ? 'Luxo' :
                                      leadData.prioridadeOrcamento}</span>
                </div>
                ` : ''}
                ${leadData.orcamentoTotal ? `
                <div class="field">
                    <span class="label">Orçamento:</span> 
                    <span class="value">${leadData.orcamentoTotal}</span>
                </div>
                ` : ''}
            </div>

            ${(leadData.precisaHospedagem || leadData.precisaTransporte) ? `
            <div class="lead-info">
                <h3>🏨 Serviços Adicionais</h3>
                ${leadData.precisaHospedagem ? `
                <div class="field">
                    <span class="label">Hospedagem:</span> 
                    <span class="value">✅ Necessária</span>
                </div>
                ` : ''}
                ${leadData.precisaTransporte ? `
                <div class="field">
                    <span class="label">Transporte:</span> 
                    <span class="value">✅ Necessário</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${leadData.observacoes ? `
            <div class="lead-info">
                <h3>📝 Observações</h3>
                <div class="field">
                    <span class="value">${leadData.observacoes}</span>
                </div>
            </div>
            ` : ''}

            <div class="services">
                <h3>🎯 Serviços Solicitados</h3>
                <ul>
                    ${leadData.selectedServices.map(service => `<li>${service}</li>`).join('')}
                </ul>
            </div>

            <div class="lead-info">
                <h3>📊 Informações Técnicas</h3>
                <div class="field">
                    <span class="label">ID do Lead:</span> 
                    <span class="value">${leadData.id}</span>
                </div>
                <div class="field">
                    <span class="label">Origem:</span> 
                    <span class="value">${leadData.source}</span>
                </div>
                <div class="field">
                    <span class="label">Data/Hora:</span> 
                    <span class="value">${new Date(leadData.createdAt).toLocaleString('pt-BR')}</span>
                </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <a href="https://fly2any.com/admin/leads" class="btn">
                    🔗 Ver no Painel Admin
                </a>
                <br>
                <a href="https://wa.me/${leadData.whatsapp.replace(/\D/g, '')}" class="btn" style="background: #25d366;">
                    💬 Contatar via WhatsApp
                </a>
            </div>

            <div class="footer">
                <p>📧 Esta é uma notificação automática do sistema Fly2Any</p>
                <p>Para mais informações, acesse o painel administrativo</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
🛫 NOVO LEAD RECEBIDO - FLY2ANY

👤 Cliente: ${leadData.nome}
📧 Email: ${leadData.email}
📱 WhatsApp: ${leadData.whatsapp}${leadData.telefone ? `\n☎️ Telefone: ${leadData.telefone}` : ''}

✈️ Viagem:
- Origem: ${leadData.origem || 'Não informado'}
- Destino: ${leadData.destino || 'Não informado'}${leadData.dataPartida ? `\n- Data Partida: ${new Date(leadData.dataPartida).toLocaleDateString('pt-BR')}` : ''}${leadData.dataRetorno ? `\n- Data Retorno: ${new Date(leadData.dataRetorno).toLocaleDateString('pt-BR')}` : ''}${leadData.tipoViagem ? `\n- Tipo: ${leadData.tipoViagem === 'ida_volta' ? 'Ida e Volta' : 
      leadData.tipoViagem === 'ida-volta' ? 'Ida e Volta' :
      leadData.tipoViagem === 'somente-ida' ? 'Somente Ida' :
      leadData.tipoViagem === 'ida' ? 'Somente Ida' :
      leadData.tipoViagem === 'multiplas-cidades' ? 'Múltiplas Cidades' :
      leadData.tipoViagem === 'multiplas_cidades' ? 'Múltiplas Cidades' :
      leadData.tipoViagem}` : ''}
- Passageiros: ${leadData.numeroPassageiros ? `${leadData.numeroPassageiros} passageiros` :
    (leadData.adultos || leadData.criancas || leadData.bebes) ? 
    `${leadData.adultos || 0} adultos${leadData.criancas ? `, ${leadData.criancas} crianças` : ''}${leadData.bebes ? `, ${leadData.bebes} bebês` : ''}` :
    'Não informado'}${leadData.classeViagem ? `\n- Classe: ${leadData.classeViagem === 'economica' ? 'Econômica' :
      leadData.classeViagem === 'premium' ? 'Premium' :
      leadData.classeViagem === 'executiva' ? 'Executiva' :
      leadData.classeViagem === 'primeira' ? 'Primeira Classe' :
      leadData.classeViagem}` : ''}${leadData.prioridadeOrcamento ? `\n- Prioridade: ${leadData.prioridadeOrcamento === 'baixo_custo' ? 'Baixo Custo' :
      leadData.prioridadeOrcamento === 'custo_beneficio' ? 'Custo-Benefício' :
      leadData.prioridadeOrcamento === 'conforto' ? 'Conforto' :
      leadData.prioridadeOrcamento === 'luxo' ? 'Luxo' :
      leadData.prioridadeOrcamento}` : ''}
${leadData.orcamentoTotal ? `- Orçamento: ${leadData.orcamentoTotal}` : ''}

🎯 Serviços: ${leadData.selectedServices.join(', ')}

${(leadData.precisaHospedagem || leadData.precisaTransporte) ? `🏨 Serviços Adicionais:${leadData.precisaHospedagem ? '\n- Hospedagem: Necessária' : ''}${leadData.precisaTransporte ? '\n- Transporte: Necessário' : ''}\n\n` : ''}${leadData.observacoes ? `📝 Observações: ${leadData.observacoes}\n\n` : ''}📊 Detalhes:
- ID: ${leadData.id}
- Fonte: ${leadData.source}
- Data: ${new Date(leadData.createdAt).toLocaleString('pt-BR')}

🔗 Painel Admin: https://fly2any.com/admin/leads
💬 WhatsApp: https://wa.me/${leadData.whatsapp.replace(/\D/g, '')}
`;

    // Enviar para todos os emails administrativos
    const results = await Promise.allSettled(
      adminEmails.map(adminEmail =>
        sendEmail({
          to: adminEmail,
          subject,
          html: htmlContent,
          text: textContent
        })
      )
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    console.log(`📧 Notificações enviadas: ${successes} sucessos, ${failures} falhas`);

    return {
      success: successes > 0,
      sent: successes,
      failed: failures,
      details: results
    };

  } catch (error) {
    console.error('Erro ao enviar notificação de lead:', error);
    return {
      success: false,
      sent: 0,
      failed: 1,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Envia notificação via webhook N8N (alternativa ou complementar ao email)
 */
export async function sendLeadNotificationToN8N(leadData: LeadNotificationData) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_EMAIL;
    
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_EMAIL não configurado');
      return { success: false, error: 'Webhook não configurado' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_lead_notification',
        timestamp: new Date().toISOString(),
        leadData,
        adminEmails: ['contato@fly2any.com', 'fly2any.travel@gmail.com']
      })
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    console.log('📨 Notificação enviada via N8N webhook');
    return { success: true };

  } catch (error) {
    console.error('Erro ao enviar notificação via N8N:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Função principal que tenta enviar por múltiplos canais
 */
/**
 * Envia email de confirmação para o cliente
 */
export async function sendCustomerConfirmationEmail(leadData: LeadNotificationData) {
  try {
    const subject = `✈️ Bem-vindo à Fly2Any, ${leadData.nome}! Suas ofertas de viagem chegaram`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%); 
          color: white; 
          padding: 30px; 
          border-radius: 12px 12px 0 0; 
          text-align: center;
        }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 18px; opacity: 0.9; }
        .content { 
          background: #f8fafc; 
          padding: 30px; 
          border-radius: 0 0 12px 12px; 
          border: 1px solid #e2e8f0;
        }
        .welcome { 
          background: white; 
          padding: 25px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #1e40af;
        }
        .offers { 
          background: #ecfdf5; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
          border: 2px solid #10b981;
        }
        .offer-item { 
          display: flex; 
          align-items: center; 
          margin: 12px 0; 
          font-size: 16px;
        }
        .check { color: #10b981; font-weight: bold; margin-right: 10px; font-size: 18px; }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #1e40af, #a21caf); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: bold; 
          text-align: center;
          margin: 15px 10px;
        }
        .whatsapp-btn {
          background: #25d366;
        }
        .urgency { 
          background: #fef3c7; 
          padding: 20px; 
          border-radius: 8px; 
          border-left: 4px solid #f59e0b;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
          color: #666; 
          font-size: 14px; 
        }
        .contact-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          border: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✈️ Fly2Any</div>
            <div class="subtitle">Conectando brasileiros ao mundo desde 2014</div>
        </div>
        
        <div class="content">
            <div class="welcome">
                <h2 style="color: #1e40af; margin-top: 0;">Olá, ${leadData.nome}! 🌟</h2>
                <p style="font-size: 18px; margin-bottom: 15px;">
                    <strong>Obrigado por escolher a Fly2Any!</strong>
                </p>
                <p>
                    Somos especialistas em viagens para brasileiros nos EUA e temos 
                    <strong>mais de 10 anos de experiência</strong> criando experiências 
                    inesquecíveis. Sua solicitação foi recebida e nossa equipe já está 
                    preparando as melhores ofertas para você!
                </p>
            </div>

            <div class="urgency">
                <h3 style="color: #d97706; margin-top: 0; text-align: center;">
                    🔥 OFERTA LIMITADA - APENAS HOJE!
                </h3>
                <p style="text-align: center; font-size: 18px; margin: 0;">
                    <strong>Economize até $2,500</strong> em passagens + hotel
                </p>
            </div>

            <div class="offers">
                <h3 style="color: #059669; margin-top: 0; text-align: center;">
                    🎯 O que oferecemos exclusivamente:
                </h3>
                <div class="offer-item">
                    <span class="check">✈️</span>
                    <span><strong>Passagens aéreas</strong> com até 60% de desconto</span>
                </div>
                <div class="offer-item">
                    <span class="check">🏨</span>
                    <span><strong>Hotéis premium</strong> com tarifas especiais</span>
                </div>
                <div class="offer-item">
                    <span class="check">🚗</span>
                    <span><strong>Aluguel de carros</strong> sem taxas ocultas</span>
                </div>
                <div class="offer-item">
                    <span class="check">🎫</span>
                    <span><strong>Ingressos Disney/Universal</strong> com desconto</span>
                </div>
                <div class="offer-item">
                    <span class="check">🛡️</span>
                    <span><strong>Seguro viagem</strong> completo incluso</span>
                </div>
                <div class="offer-item">
                    <span class="check">📞</span>
                    <span><strong>Suporte 24/7</strong> em português nos EUA</span>
                </div>
            </div>

            <div class="contact-info">
                <h3 style="color: #1e40af; margin-top: 0;">
                    🚀 Nossa equipe entrará em contato em até 30 minutos!
                </h3>
                <p style="margin-bottom: 20px;">
                    Precisa falar conosco agora? Clique abaixo:
                </p>
                <a href="https://wa.me/+15513646029" class="cta-button whatsapp-btn">
                    📱 WhatsApp Direto EUA
                </a>
                <a href="tel:+15513646029" class="cta-button">
                    📞 Ligar Agora: +1 (551) 364-6029
                </a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.fly2any.com" class="cta-button">
                    🌎 Ver Mais Ofertas no Site
                </a>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                    <strong>💡 Por que escolher a Fly2Any?</strong><br>
                    • Empresa brasileira estabelecida nos EUA<br>
                    • Mais de 50.000 clientes satisfeitos<br>
                    • Preços exclusivos não encontrados em outros lugares
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>Fly2Any Travel Inc.</strong></p>
            <p>📍 Miami, FL - Estados Unidos | 📧 contato@fly2any.com</p>
            <p style="font-size: 12px; color: #9ca3af;">
                Você está recebendo este email porque solicitou informações em nosso site.<br>
                © 2024 Fly2Any. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
✈️ BEM-VINDO À FLY2ANY, ${leadData.nome.toUpperCase()}!

Obrigado por escolher a Fly2Any! Somos especialistas em viagens para brasileiros nos EUA com mais de 10 anos de experiência.

🔥 OFERTA LIMITADA - APENAS HOJE!
Economize até $2,500 em passagens + hotel

🎯 O que oferecemos exclusivamente:
✈️ Passagens aéreas com até 60% de desconto
🏨 Hotéis premium com tarifas especiais  
🚗 Aluguel de carros sem taxas ocultas
🎫 Ingressos Disney/Universal com desconto
🛡️ Seguro viagem completo incluso
📞 Suporte 24/7 em português nos EUA

🚀 Nossa equipe entrará em contato em até 30 minutos!

Precisa falar conosco agora?
📱 WhatsApp: https://wa.me/+15513646029
📞 Telefone: +1 (551) 364-6029

💡 Por que escolher a Fly2Any?
• Empresa brasileira estabelecida nos EUA
• Mais de 50.000 clientes satisfeitos  
• Preços exclusivos não encontrados em outros lugares

🌎 Ver mais ofertas: https://www.fly2any.com

Fly2Any Travel Inc.
📍 Miami, FL - Estados Unidos
📧 contato@fly2any.com
`;

    const result = await sendEmail({
      to: leadData.email,
      subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`📧 Email de confirmação para cliente: ${result.success ? 'Enviado' : 'Falhou'}`);

    return result;

  } catch (error) {
    console.error('Erro ao enviar email de confirmação para cliente:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Enhanced Lead Notification System
 * Now uses enterprise-grade email queue and notification service
 */
export async function sendLeadNotification(leadData: LeadNotificationData) {
  console.log('📧 [LEAD-NOTIFICATION] Processing lead notification', {
    leadId: leadData.id,
    email: leadData.email,
    nome: leadData.nome,
    origem: leadData.origem,
    destino: leadData.destino
  });

  // Send both admin and customer notifications directly
  const [adminResult, customerResult, webhookResult] = await Promise.allSettled([
    sendLeadNotificationToAdmin(leadData),
    sendCustomerConfirmationEmail(leadData),
    sendLeadNotificationToN8N(leadData)
  ]);

  // Process results
  const adminSuccess = adminResult.status === 'fulfilled' && adminResult.value.success;
  const customerSuccess = customerResult.status === 'fulfilled' && customerResult.value.success;
  const webhookSuccess = webhookResult.status === 'fulfilled' && webhookResult.value.success;

  const combinedResult = {
    success: adminSuccess || customerSuccess || webhookSuccess,
    customerEmail: customerResult.status === 'fulfilled' ? customerResult.value : { success: false, error: 'Failed to send' },
    adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: 'Failed to send' },
    webhook: webhookResult.status === 'fulfilled' ? webhookResult.value : { success: false, error: 'Failed to send' },
    metadata: {
      adminSuccess,
      customerSuccess,
      webhookSuccess,
      timestamp: new Date().toISOString()
    }
  };

  console.log('📧 [LEAD-NOTIFICATION] Notification processing completed', {
    success: combinedResult.success,
    adminSuccess,
    customerSuccess,
    webhookSuccess
  });

  if (!combinedResult.success) {
    console.error('❌ [LEAD-NOTIFICATION] All notification methods failed', {
      adminError: adminResult.status === 'rejected' ? adminResult.reason : undefined,
      customerError: customerResult.status === 'rejected' ? customerResult.reason : undefined,
      webhookError: webhookResult.status === 'rejected' ? webhookResult.reason : undefined
    });
  }

  return combinedResult;
}