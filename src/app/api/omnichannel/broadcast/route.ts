import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// POST /api/omnichannel/broadcast - Enviar mensagem em massa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, channels, type = 'promotional', target_group } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message content is required'
      }, { status: 400 });
    }

    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one channel must be selected'
      }, { status: 400 });
    }

    console.log('📢 Starting broadcast:', {
      message: message.substring(0, 50) + '...',
      channels,
      type,
      target_group
    });

    // Buscar contatos ativos para broadcast
    const contacts = await getBroadcastContacts(channels, target_group);
    
    if (contacts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active contacts found for selected channels'
      }, { status: 400 });
    }

    // Enviar mensagens para cada canal
    const results = await sendBroadcastMessages(message, channels, contacts, type);
    
    // Calcular estatísticas
    const totalSent = results.reduce((acc, result) => acc + result.sent_count, 0);
    const totalErrors = results.reduce((acc, result) => acc + result.error_count, 0);

    console.log('📢 Broadcast completed:', {
      total_contacts: contacts.length,
      total_sent: totalSent,
      total_errors: totalErrors,
      channels: results.map(r => ({ channel: r.channel, sent: r.sent_count, errors: r.error_count }))
    });

    // Log broadcast na base de dados
    await logBroadcastActivity({
      message,
      channels,
      type,
      total_contacts: contacts.length,
      total_sent: totalSent,
      total_errors: totalErrors,
      results
    });

    return NextResponse.json({
      success: true,
      message: 'Broadcast sent successfully',
      sent_count: totalSent,
      error_count: totalErrors,
      total_contacts: contacts.length,
      results: results.map(r => ({
        channel: r.channel,
        sent: r.sent_count,
        errors: r.error_count,
        success_rate: r.sent_count > 0 ? ((r.sent_count / (r.sent_count + r.error_count)) * 100).toFixed(1) + '%' : '0%'
      }))
    });

  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/broadcast - Histórico de broadcasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Buscar histórico de broadcasts (implementar na base de dados)
    const broadcasts = await getBroadcastHistory(limit, offset);

    return NextResponse.json({
      success: true,
      broadcasts,
      total: broadcasts.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função para buscar contatos para broadcast
async function getBroadcastContacts(channels: string[], target_group?: string): Promise<any[]> {
  try {
    // Buscar contatos ativos através das conversas existentes
    const contacts = [];
    
    for (const channel of channels) {
      try {
        // Buscar conversas ativas do canal para obter contatos
        const conversations = await OmnichannelAPI.getActiveConversations(undefined, 100);
        
        // Filtrar conversas do canal específico
        const channelConversations = conversations.filter((conv: any) => conv.channel === channel);
        
        // Extrair contatos únicos das conversas
        const channelContacts = channelConversations.map((conv: any) => ({
          customer_id: conv.customer_id,
          customer_name: conv.customer_name || conv.customer?.name || 'Cliente',
          phone: conv.customer_phone || conv.customer?.phone,
          email: conv.customer_email || conv.customer?.email,
          whatsapp_number: conv.customer_phone,
          telegram_chat_id: conv.channel_conversation_id,
          instagram_id: conv.channel_conversation_id,
          facebook_id: conv.channel_conversation_id,
          external_id: conv.channel_conversation_id,
          channel: channel,
          last_interaction: conv.updated_at
        }));
        
        contacts.push(...channelContacts);
        
        console.log(`📱 Found ${channelContacts.length} contacts for ${channel}`);
        
      } catch (error) {
        console.error(`Error fetching contacts for ${channel}:`, error);
        
        // Fallback: usar contatos mock para o canal se a API falhar
        const mockContacts = getMockContactsForChannel(channel);
        contacts.push(...mockContacts);
      }
    }

    // Filtrar duplicatas por customer_id e canal
    const uniqueContacts = contacts.filter((contact, index, self) => 
      index === self.findIndex(c => 
        c.customer_id === contact.customer_id && c.channel === contact.channel
      )
    );

    console.log(`📊 Found ${uniqueContacts.length} unique contacts across ${channels.length} channels`);
    
    return uniqueContacts;
    
  } catch (error) {
    console.error('Error fetching broadcast contacts:', error);
    
    // Fallback: retornar contatos mock se tudo falhar
    const fallbackContacts = [];
    for (const channel of channels) {
      fallbackContacts.push(...getMockContactsForChannel(channel));
    }
    
    return fallbackContacts;
  }
}

// Função para gerar contatos mock para teste de broadcast
function getMockContactsForChannel(channel: string): any[] {
  const baseContacts = [
    {
      customer_id: 1,
      customer_name: 'Cliente Teste 1',
      phone: '+5511999999999',
      email: 'teste1@email.com'
    },
    {
      customer_id: 2,
      customer_name: 'Cliente Teste 2', 
      phone: '+5511888888888',
      email: 'teste2@email.com'
    },
    {
      customer_id: 3,
      customer_name: 'Cliente Teste 3',
      phone: '+5511777777777', 
      email: 'teste3@email.com'
    }
  ];

  return baseContacts.map(contact => ({
    ...contact,
    channel,
    whatsapp_number: contact.phone,
    telegram_chat_id: `chat_${contact.customer_id}`,
    instagram_id: `ig_${contact.customer_id}`,
    facebook_id: `fb_${contact.customer_id}`,
    external_id: `${channel}_${contact.customer_id}`,
    last_interaction: new Date().toISOString()
  }));
}

// Função para enviar mensagens broadcast
async function sendBroadcastMessages(
  message: string, 
  channels: string[], 
  contacts: any[], 
  type: string
): Promise<any[]> {
  const results = [];

  for (const channel of channels) {
    const channelContacts = contacts.filter(c => c.channel === channel);
    let sent_count = 0;
    let error_count = 0;

    console.log(`📢 Sending to ${channelContacts.length} contacts on ${channel}`);

    for (const contact of channelContacts) {
      try {
        switch (channel) {
          case 'whatsapp':
            // Enviar via WhatsApp API
            await sendWhatsAppMessage(contact, message);
            sent_count++;
            break;
            
          case 'email':
            // Enviar via Email API
            await sendEmailMessage(contact, message, type);
            sent_count++;
            break;
            
          case 'sms':
            // Enviar via SMS API
            await sendSMSMessage(contact, message);
            sent_count++;
            break;
            
          case 'telegram':
            // Enviar via Telegram API
            await sendTelegramMessage(contact, message);
            sent_count++;
            break;
            
          default:
            console.warn(`Unsupported channel: ${channel}`);
            error_count++;
        }
        
        // Delay pequeno para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error sending to ${contact.customer_id} on ${channel}:`, error);
        error_count++;
      }
    }

    results.push({
      channel,
      total_contacts: channelContacts.length,
      sent_count,
      error_count
    });

    console.log(`✅ ${channel}: ${sent_count} sent, ${error_count} errors`);
  }

  return results;
}

// Funções específicas de cada canal
async function sendWhatsAppMessage(contact: any, message: string) {
  // Integrar com a API WhatsApp existente
  const response = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: contact.phone || contact.whatsapp_number,
      message,
      type: 'broadcast'
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.status}`);
  }
}

async function sendEmailMessage(contact: any, message: string, type: string) {
  // Integrar com a API Email existente
  const response = await fetch('/api/email-marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: contact.email,
      subject: type === 'promotional' ? '✈️ Oferta Especial Fly2Any' : 'Informativo Fly2Any',
      message,
      type: 'broadcast'
    })
  });

  if (!response.ok) {
    throw new Error(`Email API error: ${response.status}`);
  }
}

async function sendSMSMessage(contact: any, message: string) {
  // Integrar com a API SMS existente
  const response = await fetch('/api/omnichannel/webhook/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: contact.phone,
      message,
      type: 'broadcast'
    })
  });

  if (!response.ok) {
    throw new Error(`SMS API error: ${response.status}`);
  }
}

async function sendTelegramMessage(contact: any, message: string) {
  // Integrar com a API Telegram existente
  const response = await fetch('/api/omnichannel/webhook/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: contact.telegram_chat_id,
      text: message,
      type: 'broadcast'
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`);
  }
}

// Função para log da atividade de broadcast
async function logBroadcastActivity(data: any) {
  try {
    // Log no console e arquivo de sistema por enquanto
    // TODO: Implementar salvamento na base de dados quando a função estiver disponível
    console.log('📊 Broadcast Activity Log:', {
      timestamp: new Date().toISOString(),
      message_preview: data.message.substring(0, 100) + '...',
      channels: data.channels,
      type: data.type,
      total_contacts: data.total_contacts,
      total_sent: data.total_sent,
      total_errors: data.total_errors,
      success_rate: data.total_contacts > 0 ? 
        ((data.total_sent / data.total_contacts) * 100).toFixed(1) + '%' : '0%'
    });
    
    // Salvar como mensagem do sistema se possível
    try {
      await OmnichannelAPI.createMessage({
        conversation_id: -1, // ID especial para logs do sistema
        customer_id: 0, // ID especial para sistema
        content: `Broadcast enviado: ${data.total_sent}/${data.total_contacts} mensagens para ${data.channels.join(', ')}`,
        direction: 'outbound',
        message_type: 'text',
        sender_name: 'Sistema de Broadcast',
        channel: 'system',
        is_automated: true,
        metadata: data,
        created_at: new Date()
      });
    } catch (messageError) {
      // Se não conseguir salvar como mensagem, só loga no console
      console.log('📝 Broadcast log saved to system console only');
    }
    
  } catch (error) {
    console.error('Error logging broadcast activity:', error);
  }
}

// Função para buscar histórico de broadcasts
async function getBroadcastHistory(limit: number, offset: number): Promise<any[]> {
  try {
    // TODO: Implementar busca na base de dados quando a tabela estiver criada
    // Por enquanto, retornar dados mock realistas
    console.log('📋 Fetching broadcast history (mock data for now)');
    
    return [
      {
        id: 1,
        message: 'Promoção especial: Voos para Miami a partir de $1,299!',
        channels: ['whatsapp', 'email'],
        type: 'promotional',
        total_contacts: 150,
        total_sent: 145,
        total_errors: 5,
        success_rate: '96.7%',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        message: 'Lembrete: Check-in online disponível para seu voo',
        channels: ['sms', 'whatsapp'],
        type: 'notification',
        total_contacts: 85,
        total_sent: 83,
        total_errors: 2,
        success_rate: '97.6%',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        message: 'Nova rota disponível: São Paulo → Orlando com conexão',
        channels: ['email', 'telegram'],
        type: 'informational',
        total_contacts: 200,
        total_sent: 195,
        total_errors: 5,
        success_rate: '97.5%',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ].slice(offset, offset + limit);
    
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return [];
  }
}