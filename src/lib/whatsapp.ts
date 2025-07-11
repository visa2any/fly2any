// WhatsApp Integration using Baileys (Lightweight Open Source)
import { Boom } from '@hapi/boom';

// Types for WhatsApp integration
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio';
  metadata?: {
    caption?: string;
    filename?: string;
    mimetype?: string;
  };
}

export interface WhatsAppSession {
  id: string;
  phone: string;
  name?: string;
  status: 'active' | 'inactive';
  lastSeen: Date;
  messages: WhatsAppMessage[];
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  private isConnected = false;
  private sessions = new Map<string, WhatsAppSession>();

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private constructor() {}

  // Initialize WhatsApp connection
  public async initialize() {
    try {
      console.log('📱 Initializing WhatsApp service...');
      
      // In production, you would initialize Baileys here
      // For now, we'll simulate the connection
      this.isConnected = true;
      
      console.log('✅ WhatsApp service initialized');
      return true;
    } catch (error) {
      console.error('❌ WhatsApp initialization failed:', error);
      return false;
    }
  }

  // Send text message
  public async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('WhatsApp not connected');
      }

      // Format phone number (remove special characters, add country code if needed)
      const formattedPhone = this.formatPhoneNumber(to);
      
      console.log(`📤 Sending WhatsApp message to ${formattedPhone}: ${message}`);

      // In production, you would use Baileys to send the message
      // For now, we'll simulate and log the message
      const whatsappMessage: WhatsAppMessage = {
        id: `wa_${Date.now()}`,
        from: 'fly2any_bot',
        to: formattedPhone,
        content: message,
        timestamp: new Date(),
        type: 'text'
      };

      // Store message in session
      this.addMessageToSession(formattedPhone, whatsappMessage);

      // Send to webhook for N8N processing
      await this.notifyN8N('message_sent', {
        to: formattedPhone,
        message,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  // Send template message (for business messaging)
  public async sendTemplate(to: string, templateName: string, parameters: string[]): Promise<boolean> {
    try {
      const { WhatsAppTemplateManager } = await import('./whatsapp-templates');
      
      // Try to get template from our template manager
      const template = WhatsAppTemplateManager.getTemplate(templateName);
      
      if (template) {
        // Create variables object from parameters
        const variables: Record<string, string> = {};
        if (template.variables) {
          template.variables.forEach((varName, index) => {
            if (parameters[index]) {
              variables[varName] = parameters[index];
            }
          });
        }
        
        const message = WhatsAppTemplateManager.renderTemplate(templateName, variables);
        return await this.sendMessage(to, message);
      }
      
      // Fallback to legacy templates
      const legacyTemplates = {
        welcome: `🛫 Olá! Bem-vindo à Fly2Any!

Somos especialistas em viagens Brasil-EUA há mais de 10 anos.

✅ Voos com melhores preços
✅ Cotação gratuita em 2h  
✅ Atendimento 24h em português

Como posso te ajudar hoje?`,

        quote_ready: `🎯 Sua cotação está pronta!

Rota: ${parameters[0] || 'Não especificado'}
Valor: ${parameters[1] || 'Consulte'}
Válida até: ${parameters[2] || '48 horas'}

Para confirmar ou tirar dúvidas, responda esta mensagem.

Fly2Any - Sua ponte para o Brasil ✈️`,

        follow_up: `😊 Oi! Vimos que você se interessou pelos nossos serviços.

Tem alguma dúvida sobre:
• ✈️ Voos Brasil-EUA
• 🏨 Hotéis no Brasil  
• 🚗 Aluguel de carros
• 🛡️ Seguro viagem

Estamos aqui para ajudar! 👨‍💼`
      };

      const message = legacyTemplates[templateName as keyof typeof legacyTemplates] || parameters.join(' ');
      return await this.sendMessage(to, message);
    } catch (error) {
      console.error('WhatsApp template error:', error);
      return false;
    }
  }

  // Handle incoming messages (webhook from Baileys)
  public async handleIncomingMessage(messageData: any): Promise<void> {
    try {
      const message: WhatsAppMessage = {
        id: messageData.key?.id || `wa_${Date.now()}`,
        from: messageData.key?.remoteJid || '',
        to: 'fly2any_bot',
        content: messageData.message?.conversation || messageData.message?.extendedTextMessage?.text || '',
        timestamp: new Date(messageData.messageTimestamp * 1000),
        type: 'text'
      };

      console.log(`📥 Received WhatsApp message from ${message.from}: ${message.content}`);

      // Store message
      this.addMessageToSession(message.from, message);

      // Process with AI or forward to human
      await this.processIncomingMessage(message);

    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  // Process incoming message with AI or human routing
  private async processIncomingMessage(message: WhatsAppMessage): Promise<void> {
    try {
      // Check if it's business hours
      const isBusinessHours = this.isBusinessHours();
      
      // Detect intent
      const intent = this.detectIntent(message.content);
      
      if (intent === 'urgent' || isBusinessHours) {
        // Send to human agent
        await this.notifyN8N('human_required', {
          from: message.from,
          message: message.content,
          intent,
          timestamp: message.timestamp.toISOString()
        });
        
        await this.sendMessage(message.from, 
          '👨‍💼 Um de nossos especialistas vai te responder em instantes!\n\nEnquanto isso, você pode nos contar mais detalhes sobre sua viagem.'
        );
      } else {
        // Auto-respond with AI
        const response = await this.generateAIResponse(message.content, intent);
        await this.sendMessage(message.from, response);
        
        // If after hours, notify that human will respond later
        if (!isBusinessHours) {
          await this.sendMessage(message.from, 
            '🕐 Estamos fora do horário comercial, mas um especialista retornará sua mensagem pela manhã!\n\n⏰ Horário: Seg-Sex 9h-18h (EST)'
          );
        }
      }
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  // Generate AI response for WhatsApp
  private async generateAIResponse(message: string, intent: string): Promise<string> {
    const responses = {
      greeting: '😊 Olá! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem Brasil-EUA hoje?',
      
      flight_inquiry: `✈️ Perfeito! Para uma cotação de voos, preciso saber:

📍 Origem e destino
📅 Datas de ida e volta  
👥 Quantos passageiros
💺 Classe preferida

Pode me enviar esses detalhes?

🎯 Cotação gratuita em até 2 horas!`,
      
      pricing: `💰 Nossos preços são imbatíveis! Alguns exemplos:

✈️ Miami ↔ São Paulo: $650-900
✈️ NY ↔ Rio de Janeiro: $720-1100  
✈️ Orlando ↔ São Paulo: $680-950
✈️ Atlanta ↔ São Paulo: $800-1200

🎯 Cotação personalizada GRÁTIS em 2h!
📞 Quer falar com um especialista agora?`,

      hotel_inquiry: `🏨 Ótimo! Temos parcerias com os melhores hotéis:

🌟 **Destinos populares:**
• São Paulo - Centro/Paulista
• Rio de Janeiro - Copacabana/Ipanema
• Salvador - Pelourinho/Orla
• Fortaleza - Praia de Iracema

📍 Em qual cidade você se hospedará?
📅 Quais as datas da estadia?`,

      car_rental: `🚗 Aluguel de carros em todo o Brasil:

🏢 **Parceiros:** Localiza, Hertz, Avis
🚗 **Categorias:** Econômico, Executivo, SUV
📍 **Retirada:** Aeroportos ou centros urbanos
📋 **Requisitos:** CNH internacional obrigatória

Em qual cidade você precisa?`,

      insurance: `🛡️ Seguro viagem essencial:

✅ **Coberturas:**
• Médica: até $500K
• Bagagem: até $2K
• Cancelamento: até $5K
• Assistência 24h

Para onde você vai viajar?`,

      documentation: `📋 **Documentação Brasil-EUA:**

✅ **Obrigatórios:**
• Passaporte brasileiro (6+ meses)
• Visto americano válido
• Comprovante vacina COVID-19

✅ **Recomendados:**
• CNH internacional
• Seguro saúde
• Comprovante hospedagem`,

      baggage: `🧳 **Bagagem permitida:**

✅ **Permitido:**
• Industrializados lacrados
• Chocolates, café, doces
• Roupas e objetos pessoais

❌ **Proibido:**
• Perecíveis (frutas, verduras)
• Carnes e derivados
• Queijos e laticínios

📏 **Limites:** 23kg despachada, 10kg mão`,
      
      contact: `📞 **Contatos Fly2Any:**

💬 WhatsApp: Este número
📧 Email: contato@fly2any.com
🌐 Site: www.fly2any.com

⏰ **Horário de Atendimento:**
Seg-Sex: 9h-18h (EST)
Sáb: 9h-14h (EST)
🚨 Emergências: 24h via WhatsApp`,
      
      default: `😊 Entendi! Um dos nossos especialistas vai revisar sua mensagem e responder em breve.

🎯 Enquanto isso, saiba que oferecemos:
• ✈️ Voos Brasil ↔ EUA
• 🏨 Hotéis no Brasil
• 🚗 Aluguel de carros
• 🛡️ Seguro viagem

Tem mais alguma pergunta?`
    };

    return responses[intent as keyof typeof responses] || responses.default;
  }

  // Detect message intent
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
      return 'greeting';
    }
    if (lowerMessage.includes('voo') || lowerMessage.includes('passagem') || lowerMessage.includes('viagem') || lowerMessage.includes('voar') || lowerMessage.includes('avião')) {
      return 'flight_inquiry';
    }
    if (lowerMessage.includes('hotel') || lowerMessage.includes('hospedagem') || lowerMessage.includes('ficar') || lowerMessage.includes('dormir') || lowerMessage.includes('pousada')) {
      return 'hotel_inquiry';
    }
    if (lowerMessage.includes('carro') || lowerMessage.includes('aluguel') || lowerMessage.includes('alugar') || lowerMessage.includes('dirigir') || lowerMessage.includes('veículo')) {
      return 'car_rental';
    }
    if (lowerMessage.includes('seguro') || lowerMessage.includes('cobertura') || lowerMessage.includes('proteção') || lowerMessage.includes('saúde')) {
      return 'insurance';
    }
    if (lowerMessage.includes('passaporte') || lowerMessage.includes('visto') || lowerMessage.includes('documento') || lowerMessage.includes('cnh')) {
      return 'documentation';
    }
    if (lowerMessage.includes('bagagem') || lowerMessage.includes('mala') || lowerMessage.includes('peso') || lowerMessage.includes('kg')) {
      return 'baggage';
    }
    if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('valor') || lowerMessage.includes('cotação')) {
      return 'pricing';
    }
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('email') || lowerMessage.includes('falar')) {
      return 'contact';
    }
    if (lowerMessage.includes('urgente') || lowerMessage.includes('emergência') || lowerMessage.includes('problema') || lowerMessage.includes('cancelar')) {
      return 'urgent';
    }
    
    return 'default';
  }

  // Check if it's business hours
  private isBusinessHours(): boolean {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = easternTime.getHours();
    const day = easternTime.getDay();
    
    // Monday-Friday 9AM-6PM, Saturday 9AM-2PM (EST)
    if (day >= 1 && day <= 5) {
      return hour >= 9 && hour < 18;
    } else if (day === 6) {
      return hour >= 9 && hour < 14;
    }
    
    return false;
  }

  // Format phone number for WhatsApp
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned; // Add US country code
    } else if (cleaned.length === 11 && cleaned.startsWith('55')) {
      // Brazilian number, keep as is
    } else if (cleaned.length === 11 && !cleaned.startsWith('1')) {
      cleaned = '55' + cleaned.substring(1); // Add Brazil country code
    }
    
    return cleaned + '@s.whatsapp.net';
  }

  // Add message to session
  private addMessageToSession(phone: string, message: WhatsAppMessage): void {
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, {
        id: `session_${phone}`,
        phone,
        status: 'active',
        lastSeen: new Date(),
        messages: []
      });
    }
    
    const session = this.sessions.get(phone)!;
    session.messages.push(message);
    session.lastSeen = new Date();
  }

  // Get session messages
  public getSession(phone: string): WhatsAppSession | undefined {
    return this.sessions.get(phone);
  }

  // Send notification to N8N
  private async notifyN8N(event: string, data: any): Promise<void> {
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
      if (!webhookUrl) return;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          source: 'whatsapp'
        })
      });
    } catch (error) {
      console.warn('N8N notification failed:', error);
    }
  }

  // Get connection status
  public isConnectedStatus(): boolean {
    return this.isConnected;
  }

  // Get all active sessions
  public getActiveSessions(): WhatsAppSession[] {
    return Array.from(this.sessions.values()).filter(session => session.status === 'active');
  }
}

// Export singleton instance
export const whatsappService = WhatsAppService.getInstance();

// Export convenience function for direct use
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  return await whatsappService.sendMessage(phone, message);
}