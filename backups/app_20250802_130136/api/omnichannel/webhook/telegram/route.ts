import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelAPI } from '@/lib/omnichannel-api';

// POST /api/omnichannel/webhook/telegram - Processar mensagens do Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🤖 Telegram webhook received:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem ou callback
    if (body.message) {
      await processTelegramMessage(body.message);
    } else if (body.callback_query) {
      await processTelegramCallback(body.callback_query);
    } else if (body.edited_message) {
      console.log('Telegram message edited - ignoring');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/webhook/telegram - Status do webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Telegram webhook endpoint active',
    timestamp: new Date().toISOString(),
    bot_info: {
      webhook_configured: !!process.env.TELEGRAM_BOT_TOKEN,
      bot_username: process.env.TELEGRAM_BOT_USERNAME || 'fly2any_bot'
    }
  });
}

// Processar mensagem do Telegram
async function processTelegramMessage(message: any) {
  try {
    const { message_id, from, chat, text, date, document, photo, voice, video } = message;

    if (!from || chat.type !== 'private') {
      console.log('Skipping Telegram message - not a private chat');
      return;
    }

    const senderId = from.id.toString();
    const messageText = text || getAttachmentDescription(message);
    const telegramMessageId = `tg_${message_id}`;

    // Informações do usuário
    const senderInfo = {
      id: from.id,
      username: from.username,
      first_name: from.first_name,
      last_name: from.last_name,
      name: `${from.first_name || ''} ${from.last_name || ''}`.trim() || from.username || 'Usuário Telegram',
      language_code: from.language_code,
      platform: 'telegram'
    };

    const metadata = {
      platform: 'telegram',
      sender_info: senderInfo,
      message_id: telegramMessageId,
      telegram_message_id: message_id,
      timestamp: new Date(date * 1000).toISOString(),
      chat_id: chat.id,
      message_type: getMessageType(message),
      attachments: getAttachments(message),
      webhook_data: message
    };

    // Processar no sistema omnichannel
    const result = await OmnichannelAPI.processIncomingMessage(
      'telegram',
      telegramMessageId,
      senderId,
      messageText,
      metadata
    );

    console.log('✅ Telegram message processed:', {
      conversationId: result.conversation.id,
      customerId: result.customer.id,
      messageType: metadata.message_type
    });

    // Verificar se deve responder automaticamente
    const shouldAutoRespond = await shouldAutoRespondTelegram(result.conversation, messageText, message);

    if (shouldAutoRespond) {
      await sendTelegramAutoResponse(chat.id, result.conversation, message);
    } else {
      // Notificar agentes sobre nova mensagem
      await notifyAgentsTelegram(result.conversation, messageText, senderInfo);
    }

  } catch (error) {
    console.error('Error processing Telegram message:', error);
  }
}

// Processar callback do Telegram (botões inline)
async function processTelegramCallback(callbackQuery: any) {
  try {
    const { id, from, message, data } = callbackQuery;

    console.log('🔘 Telegram callback received:', {
      callback_id: id,
      user: from.first_name,
      data
    });

    // Responder ao callback para remover loading
    await answerCallbackQuery(id, 'Processando...');

    // Processar ação baseada no callback data
    switch (data) {
      case 'QUOTE_REQUEST':
        await sendTelegramMessage(
          message.chat.id,
          `✈️ Perfeito! Para uma cotação personalizada, preciso de:

📍 Origem e destino
📅 Datas de ida e volta
👥 Número de passageiros
🎫 Classe preferida

📱 Continue enviando as informações ou:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com`
        );
        break;

      case 'TALK_TO_AGENT':
        await sendTelegramMessage(
          message.chat.id,
          `👤 Conectando você com um de nossos especialistas...

⏱️ Tempo médio de resposta: 2-5 minutos
📱 Para atendimento mais rápido:
• WhatsApp: (555) 123-4567

💬 Continue aqui que um agente responderá em breve!`
        );
        break;

      case 'MODIFY_BOOKING':
        await sendTelegramMessage(
          message.chat.id,
          `🔄 Para alterar sua reserva, preciso de:

🎫 Número da reserva/localizador
📧 Email usado na compra
📅 Nova data desejada

⚠️ Alterações podem ter taxas
💬 Envie as informações que um especialista te ajudará!`
        );
        break;

      case 'INFO_REQUEST':
        await sendTelegramMessage(
          message.chat.id,
          `ℹ️ Fly2Any - Informações Principais:

✈️ Especialistas em voos EUA ↔ Brasil
🏆 +10 anos no mercado
✅ +50.000 clientes satisfeitos
🔒 Pagamentos 100% seguros

📞 Contatos:
• WhatsApp: (555) 123-4567
• Email: contato@fly2any.com
• Site: www.fly2any.com

🕐 Atendimento: Seg-Sex 9h-18h (EST)`
        );
        break;

      default:
        console.log('Unknown callback data:', data);
    }

  } catch (error) {
    console.error('Error processing Telegram callback:', error);
  }
}

// Determinar tipo da mensagem
function getMessageType(message: any): string {
  if (message.text) return 'text';
  if (message.photo) return 'photo';
  if (message.document) return 'document';
  if (message.voice) return 'voice';
  if (message.video) return 'video';
  if (message.sticker) return 'sticker';
  if (message.location) return 'location';
  if (message.contact) return 'contact';
  return 'unknown';
}

// Obter descrição de anexo
function getAttachmentDescription(message: any): string {
  if (message.text) return message.text;
  if (message.photo) return '[Foto enviada]';
  if (message.document) return `[Documento: ${message.document.file_name || 'arquivo'}]`;
  if (message.voice) return '[Mensagem de voz]';
  if (message.video) return '[Vídeo enviado]';
  if (message.sticker) return '[Sticker enviado]';
  if (message.location) return '[Localização compartilhada]';
  if (message.contact) return '[Contato compartilhado]';
  return '[Mensagem sem texto]';
}

// Obter anexos
function getAttachments(message: any): any[] {
  const attachments = [];
  
  if (message.photo) {
    attachments.push({ type: 'photo', data: message.photo });
  }
  if (message.document) {
    attachments.push({ type: 'document', data: message.document });
  }
  if (message.voice) {
    attachments.push({ type: 'voice', data: message.voice });
  }
  if (message.video) {
    attachments.push({ type: 'video', data: message.video });
  }
  
  return attachments;
}

// Determinar se deve responder automaticamente
async function shouldAutoRespondTelegram(conversation: any, message: string, messageObj: any): Promise<boolean> {
  const now = new Date();
  const hour = now.getHours();
  
  // Comandos do Telegram sempre respondem
  if (message.startsWith('/')) {
    return true;
  }
  
  // Fora do horário comercial (9h-18h EST)
  if (hour < 9 || hour >= 18) {
    return true;
  }
  
  // Primeira mensagem do cliente
  const messageCount = conversation.messages?.length || 0;
  if (messageCount <= 1) {
    return true;
  }
  
  // Palavras-chave que triggerem resposta automática
  const autoTriggers = [
    'oi', 'olá', 'hello', 'hi', 'ola',
    '/start', '/help', '/info',
    'informação', 'info', 'ajuda', 'help',
    'voo', 'flight', 'passagem', 'ticket',
    'preço', 'price', 'cotação', 'quote'
  ];
  
  const messageWords = message.toLowerCase().split(/\s+/);
  const hasTrigger = autoTriggers.some(trigger => 
    messageWords.some(word => word.includes(trigger))
  );
  
  return hasTrigger;
}

// Enviar resposta automática no Telegram
async function sendTelegramAutoResponse(chatId: number, conversation: any, originalMessage: any) {
  try {
    const now = new Date();
    const hour = now.getHours();
    const messageText = originalMessage.text || '';
    
    // Responder a comandos específicos
    if (messageText === '/start') {
      await sendTelegramMessage(chatId, {
        text: `🛫 Bem-vindo ao Fly2Any Bot!

✈️ Especialistas em voos EUA ↔ Brasil
🎯 Como podemos ajudar hoje?`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✈️ Cotação de Voo', callback_data: 'QUOTE_REQUEST' },
              { text: '📞 Falar com Agente', callback_data: 'TALK_TO_AGENT' }
            ],
            [
              { text: '🔄 Alterar Reserva', callback_data: 'MODIFY_BOOKING' },
              { text: 'ℹ️ Informações', callback_data: 'INFO_REQUEST' }
            ]
          ]
        }
      });
      return;
    }

    if (messageText === '/help') {
      await sendTelegramMessage(chatId, `🤖 Comandos disponíveis:

/start - Menu principal
/help - Esta mensagem
/info - Informações da empresa
/contato - Nossos contatos

💬 Ou simplesmente envie sua mensagem que responderemos!

📱 Contatos diretos:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com`);
      return;
    }

    if (messageText === '/info') {
      await sendTelegramMessage(chatId, `🏢 Sobre a Fly2Any:

✅ +10 anos no mercado
✅ Licenciada IATA
✅ +50.000 clientes satisfeitos
✅ Especialistas EUA-Brasil
✅ Suporte 24/7 em português

🏆 Prêmios:
• Melhor Agência Online 2023
• Excelência em Atendimento

🔒 100% Seguro - Pagamento protegido`);
      return;
    }

    // Resposta automática padrão
    let response;
    
    if (hour < 9 || hour >= 18) {
      // Fora do horário comercial
      response = {
        text: `🛫 Olá! Obrigado por entrar em contato com a Fly2Any!

🕐 Estamos fora do horário comercial
⏰ Atendimento: Seg-Sex 9h-18h (EST)

📱 Para atendimento imediato:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com

✈️ Retornaremos sua mensagem pela manhã!`
      };
    } else {
      // Horário comercial com botões
      response = {
        text: `🛫 Olá! Bem-vindo à Fly2Any!

✈️ Especialistas em voos EUA ↔ Brasil
🎯 Como podemos ajudar hoje?`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✈️ Cotação de Voo', callback_data: 'QUOTE_REQUEST' },
              { text: '📞 Falar com Agente', callback_data: 'TALK_TO_AGENT' }
            ],
            [
              { text: '🔄 Alterar Reserva', callback_data: 'MODIFY_BOOKING' },
              { text: 'ℹ️ Informações', callback_data: 'INFO_REQUEST' }
            ]
          ]
        }
      };
    }

    // Registrar mensagem automática no sistema
    await OmnichannelAPI.createMessage({
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'telegram',
      direction: 'outbound',
      content: response.text,
      is_automated: true,
      template_id: hour < 9 || hour >= 18 ? 'telegram_off_hours' : 'telegram_greeting',
      metadata: {
        auto_response: true,
        trigger_time: new Date().toISOString(),
        chat_id: chatId,
        platform: 'telegram',
        inline_keyboard: response.reply_markup?.inline_keyboard || [],
        original_message_type: getMessageType(originalMessage)
      }
    });

    // Enviar via API do Telegram
    await sendTelegramMessage(chatId, response);

    console.log('🤖 Telegram auto-response sent:', {
      chat_id: chatId,
      conversation_id: conversation.id,
      has_buttons: !!response.reply_markup
    });

  } catch (error) {
    console.error('Error sending Telegram auto-response:', error);
  }
}

// Enviar mensagem via API do Telegram
async function sendTelegramMessage(chatId: number, messageData: any) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.log('Telegram bot token not configured - message not sent');
      return;
    }

    const payload = typeof messageData === 'string' ? 
      { text: messageData } : 
      messageData;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          ...payload,
          parse_mode: 'HTML'
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Telegram message sent successfully:', result.result.message_id);
    } else {
      const error = await response.text();
      console.error('❌ Failed to send Telegram message:', error);
    }

  } catch (error) {
    console.error('Error sending Telegram message via API:', error);
  }
}

// Responder callback query
async function answerCallbackQuery(callbackQueryId: string, text: string = '') {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;

    await fetch(
      `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: false
        })
      }
    );

  } catch (error) {
    console.error('Error answering Telegram callback query:', error);
  }
}

// Notificar agentes sobre nova mensagem do Telegram
async function notifyAgentsTelegram(conversation: any, messageContent: string, senderInfo: any) {
  try {
    console.log(`🔔 Notifying agents about new Telegram message in conversation ${conversation.id}`);
    
    const notificationData = {
      type: 'new_message',
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'telegram',
      message: messageContent,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      metadata: {
        platform: 'telegram',
        sender: senderInfo,
        requires_response: true,
        is_bot_chat: true
      }
    };

    // Enviar notificação em tempo real
    await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    console.log('🤖 Telegram notification sent to agents');
    
  } catch (error) {
    console.error('Error notifying agents about Telegram message:', error);
  }
}