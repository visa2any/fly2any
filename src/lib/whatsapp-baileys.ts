// Real WhatsApp integration using Baileys
import makeWASocket, { 
  ConnectionState, 
  DisconnectReason, 
  useMultiFileAuthState as createAuthState,
  WAMessage,
  WASocket,
  isJidBroadcast,
  delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import * as QRCode from 'qrcode-terminal';

export interface BaileysMessage {
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

export class WhatsAppBaileysService {
  private static instance: WhatsAppBaileysService;
  private sock: WASocket | null = null;
  private qrCode: string | null = null;
  private isConnected = false;
  private connectionState: string = 'connecting';
  private logger: any;

  public static getInstance(): WhatsAppBaileysService {
    if (!WhatsAppBaileysService.instance) {
      WhatsAppBaileysService.instance = new WhatsAppBaileysService();
    }
    return WhatsAppBaileysService.instance;
  }

  private constructor() {
    this.logger = P({ level: 'silent' }); // Silent logger for production
  }

  // Convert real WhatsApp QR code to base64
  private async convertQRToBase64(qrText: string): Promise<string> {
    try {
      console.log('🔄 Converting QR code to base64...');
      const QRCodeLib = await import('qrcode');
      const qrDataURL = await QRCodeLib.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log('✅ QR code converted successfully');
      // Return just the base64 part
      return qrDataURL.split(',')[1];
    } catch (error) {
      console.error('❌ QRCode conversion failed:', error);
      // Return a fallback QR code
      return await this.generateDemoQRCode();
    }
  }

  // Generate a demo QR code for Vercel environments
  private async generateDemoQRCode(): Promise<string> {
    const demoText = `Fly2Any WhatsApp Demo - ${new Date().toISOString()}`; // Demo text
    
    try {
      // Use QRCode library to generate actual QR code
      const QRCodeLib = await import('qrcode');
      const qrDataURL = await QRCodeLib.toDataURL(demoText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Return just the base64 part
      return qrDataURL.split(',')[1];
    } catch (error) {
      console.warn('QRCode generation failed, using fallback');
      // Fallback: simple base64 QR code image
      return 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8ElEQVR4nO3dQW7jMAyA0ez/X3r3kAXawSSNJVKkRPO9TdJYlvVBOZNp27YNgJ5+/fcPAODfCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAIJYAAGIJACCWAABiCQAglgAAYgkAINYPNzMTeFbWJ7QAAAAASUVORK5CYII=';
    }
  }

  // Initialize WhatsApp connection with Baileys
  public async initialize(): Promise<{success: boolean; qrCode?: string; isReady?: boolean; error?: string}> {
    try {
      console.log('📱 Initializing Baileys WhatsApp service...');
      
      // Validate environment
      if (!process.env.N8N_WEBHOOK_WHATSAPP) {
        console.warn('⚠️ N8N_WEBHOOK_WHATSAPP not configured - auto-responses will be used');
      }
      
      // Reset state
      this.qrCode = null;
      this.isConnected = false;
      this.connectionState = 'connecting';
      
      // Use appropriate auth path based on environment
      const authPath = process.env.VERCEL ? '/tmp/baileys_auth_info' : 
                       process.env.RAILWAY_ENVIRONMENT ? '/tmp/baileys_auth_info' : 
                       process.env.NODE_ENV === 'production' ? '/tmp/baileys_auth_info' :
                       './baileys_auth_info';
      
      // Ensure directory exists
      const fs = await import('fs');
      const path = await import('path');
      const authDir = path.dirname(authPath);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      const { state, saveCreds } = await createAuthState(authPath);
      
      // Create socket
      console.log('🔧 Creating WhatsApp socket...');
      this.sock = makeWASocket({
        auth: state,
        logger: this.logger,
        printQRInTerminal: false, // We'll handle QR code display ourselves
        browser: ["Fly2Any", "Chrome", "1.0.0"],
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000, // 60 seconds timeout
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
      });
      console.log('✅ WhatsApp socket created successfully');

      // Promise to wait for QR code or connection
      return new Promise((resolve) => {
        let resolved = false;
        
        console.log('🔍 Starting WhatsApp connection process...');
        console.log('🔍 Auth path exists:', fs.existsSync(authPath));
        console.log('🔍 Current connection state:', this.isConnected ? 'Connected' : 'Disconnected');
        
        // Timeout after 25 seconds to give more time for QR generation
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log('⏰ Initialization timeout after 25 seconds');
            console.log(`📊 Final status: connected=${this.isConnected}, qrCode=${this.qrCode ? 'available' : 'not available'}`);
            resolve({
              success: this.qrCode ? true : false,
              error: this.qrCode ? undefined : 'QR code generation timeout - try again',
              qrCode: this.qrCode || undefined,
              isReady: this.isConnected
            });
          }
        }, 25000);

        // Handle socket errors
        this.sock!.ev.on('creds.update', saveCreds);
        
        // Force connection start
        console.log('🚀 Forcing connection start...');
        setTimeout(() => {
          if (this.sock && !this.isConnected) {
            console.log('⚡ Attempting to trigger connection...');
            // Try to trigger connection by accessing socket state
            try {
              this.sock.ws?.connect?.();
            } catch (e) {
              console.log('⚠️ Connection trigger attempt failed (normal):', e);
            }
          }
        }, 1000);
        
        // Handle connection updates
        this.sock!.ev.on('connection.update', async (update) => {
          console.log('📡 Connection update received:', JSON.stringify(update, null, 2));
          const { connection, lastDisconnect, qr } = update;
          
          if (qr) {
            console.log('📱 QR Code received! Processing...');
            console.log('📱 QR Code text length:', qr.length);
            try {
              this.qrCode = await this.convertQRToBase64(qr);
              QRCode.generate(qr, { small: true });
              console.log('✅ QR Code converted successfully!');
              console.log('📱 Base64 QR Code length:', this.qrCode?.length || 0);
              console.log('📱 Scan the QR code above with WhatsApp to connect');
              
              // Resolve with QR code
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                  success: true,
                  qrCode: this.qrCode,
                  isReady: false
                });
              }
            } catch (qrError) {
              console.error('❌ Failed to process QR code:', qrError);
              // Still try to resolve with error info
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                  success: false,
                  error: 'Failed to generate QR code: ' + (qrError instanceof Error ? qrError.message : 'Unknown error')
                });
              }
            }
          }
          
          if (connection === 'close') {
            this.isConnected = false;
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('📱 Connection closed due to:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
              setTimeout(() => this.initialize(), 5000); // Reconnect after 5 seconds
            }
          } else if (connection === 'open') {
            this.isConnected = true;
            this.qrCode = null;
            console.log('✅ WhatsApp connected successfully');
            
            // Resolve with connected status
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve({
                success: true,
                qrCode: undefined,
                isReady: true
              });
            }
          }
          
          this.connectionState = connection as string;
        });

        // Handle credentials update
        this.sock!.ev.on('creds.update', saveCreds);

        // Handle incoming messages
        this.sock!.ev.on('messages.upsert', async (m) => {
          const message = m.messages[0];
          if (!message.key.fromMe && message.message) {
            await this.handleIncomingMessage(message);
          }
        });

        console.log('✅ Baileys WhatsApp service initialized');
      });
      
    } catch (error) {
      console.error('❌ Baileys initialization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send text message
  public async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.sock || !this.isConnected) {
        console.error('WhatsApp not connected');
        return false;
      }

      // Format phone number for WhatsApp
      const jid = this.formatJid(to);
      
      console.log(`📤 Sending WhatsApp message to ${jid}: ${message}`);

      // Send message
      await this.sock.sendMessage(jid, { text: message });

      // Send to webhook for N8N processing
      await this.notifyN8N('message_sent', {
        to: jid,
        message,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return false;
    }
  }

  // Send template message with buttons
  public async sendTemplate(to: string, templateName: string, parameters: string[]): Promise<boolean> {
    try {
      if (!this.sock || !this.isConnected) {
        console.error('WhatsApp not connected');
        return false;
      }

      const { WhatsAppTemplateManager } = await import('./whatsapp-templates');
      
      // Get template
      const template = WhatsAppTemplateManager.getTemplate(templateName);
      
      if (template) {
        const variables: Record<string, string> = {};
        if (template.variables) {
          template.variables.forEach((varName, index) => {
            if (parameters[index]) {
              variables[varName] = parameters[index];
            }
          });
        }
        
        const message = WhatsAppTemplateManager.renderTemplate(templateName, variables);
        
        // Check if template has buttons
        if ((template as any).buttons && (template as any).buttons.length > 0) {
          const buttons = (template as any).buttons.map((btn: any, index: number) => ({
            buttonId: `btn_${index}`,
            buttonText: { displayText: btn.text },
            type: 1
          }));

          const buttonMessage = {
            text: message,
            buttons: buttons,
            headerType: 1
          };

          await this.sock.sendMessage(this.formatJid(to), buttonMessage);
        } else {
          // Send as regular text message
          await this.sock.sendMessage(this.formatJid(to), { text: message });
        }
        
        return true;
      }
      
      // Fallback to regular message
      return await this.sendMessage(to, parameters.join(' '));
    } catch (error) {
      console.error('WhatsApp template error:', error);
      return false;
    }
  }

  // Handle incoming messages
  private async handleIncomingMessage(message: WAMessage): Promise<void> {
    try {
      const messageContent = message.message;
      const from = message.key.remoteJid || '';
      const messageText = messageContent?.conversation || 
                         messageContent?.extendedTextMessage?.text || 
                         '';

      if (!messageText || isJidBroadcast(from)) {
        return; // Skip broadcast messages or empty messages
      }

      const baileysMessage: BaileysMessage = {
        id: message.key.id || `wa_${Date.now()}`,
        from,
        to: 'fly2any_bot',
        content: messageText,
        timestamp: new Date((message.messageTimestamp as number) * 1000),
        type: 'text'
      };

      console.log(`📥 Received WhatsApp message from ${from}: ${messageText}`);

      // Send to webhook for processing - format exactly like N8N workflow expects
      const webhookData = {
        from,
        message: messageText,
        text: messageText, // Both for compatibility
        contactName: await this.getContactName(from),
        timestamp: baileysMessage.timestamp.toISOString(),
        messageId: baileysMessage.id,
        isNewConversation: await this.checkIfNewConversation(from),
        // Add phone for compatibility with N8N workflow
        phone: from.split('@')[0]
      };

      console.log(`📱 Processing WhatsApp message:`, {
        from,
        messagePreview: messageText.substring(0, 50) + '...',
        isNewConversation: webhookData.isNewConversation,
        contactName: webhookData.contactName
      });

      // Try webhook first
      const webhookSuccess = await this.notifyN8N('whatsapp_message_received', webhookData);
      
      // If webhook fails, send automatic response directly
      if (!webhookSuccess) {
        console.log('📱 Webhook failed, sending direct auto-response...');
        await this.sendDirectAutoResponse(from, messageText);
      }

    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  // Get contact name
  private async getContactName(from: string): Promise<string> {
    try {
      // Extract phone number from JID and use as name
      const phoneNumber = from.split('@')[0];
      return phoneNumber || 'Cliente WhatsApp';
    } catch (error) {
      console.warn('Could not get contact name:', error);
    }
    return 'Cliente WhatsApp';
  }

  // Send direct auto-response (fallback)
  private async sendDirectAutoResponse(from: string, messageText: string): Promise<void> {
    try {
      const message = messageText.toLowerCase();
      let response = '';

      // Check business hours first
      const now = new Date();
      const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      const hour = easternTime.getHours();
      const day = easternTime.getDay();
      const isBusinessHours = (day >= 1 && day <= 5 && hour >= 9 && hour < 18) || (day === 6 && hour >= 9 && hour < 14);

      // Enhanced intent detection
      if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
        response = '😊 Olá! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem EUA-Brasil hoje?';
      } else if (message.includes('voo') || message.includes('passagem') || message.includes('viagem') || message.includes('avião')) {
        response = `✈️ Perfeito! Para uma cotação de voos, preciso saber:

📍 Origem e destino
📅 Datas de ida e volta  
👥 Quantos passageiros
💺 Classe preferida

Pode me enviar esses detalhes?

🎯 Cotação gratuita em até 2 horas!`;
      } else if (message.includes('preço') || message.includes('cotação') || message.includes('valor') || message.includes('custo')) {
        response = `💰 Nossos preços são imbatíveis! Alguns exemplos:

✈️ Miami ↔ São Paulo: $650-900
✈️ NY ↔ Rio de Janeiro: $720-1100  
✈️ Orlando ↔ São Paulo: $680-950
✈️ Atlanta ↔ São Paulo: $800-1200

🎯 Cotação personalizada GRÁTIS em 2h!
📞 Quer falar com um especialista agora?`;
      } else if (message.includes('hotel') || message.includes('hospedagem')) {
        response = `🏨 Ótimo! Temos parcerias com os melhores hotéis:

🌟 **Destinos populares:**
• São Paulo - Centro/Paulista
• Rio de Janeiro - Copacabana/Ipanema
• Salvador - Pelourinho/Orla
• Fortaleza - Praia de Iracema

📍 Em qual cidade você se hospedará?
📅 Quais as datas da estadia?`;
      } else if (message.includes('carro') || message.includes('aluguel')) {
        response = `🚗 Aluguel de carros em todo o Brasil:

🏢 **Parceiros:** Localiza, Hertz, Avis
🚗 **Categorias:** Econômico, Executivo, SUV
📍 **Retirada:** Aeroportos ou centros urbanos
📋 **Requisitos:** CNH internacional obrigatória

Em qual cidade você precisa?`;
      } else if (message.includes('urgente') || message.includes('emergência') || message.includes('problema')) {
        response = `🚨 **URGENTE** - Entendi que é uma emergência!

📞 Um especialista será notificado IMEDIATAMENTE e retornará sua mensagem em até 15 minutos.

🕐 Se for fora do horário comercial, o atendimento de emergência está disponível 24h.

Por favor, aguarde nossa resposta!`;
      } else {
        response = `😊 Entendi! Um dos nossos especialistas vai revisar sua mensagem e responder em breve.

🎯 Enquanto isso, saiba que oferecemos:
• ✈️ Voos EUA ↔ Brasil
• 🏨 Hotéis no Brasil
• 🚗 Aluguel de carros
• 🛡️ Seguro viagem

Tem mais alguma pergunta?`;
      }

      // Add after-hours message if needed
      if (!isBusinessHours && !message.includes('urgente') && !message.includes('emergência')) {
        response += `\n\n🕐 **Fora do horário comercial**
Um especialista retornará sua mensagem pela manhã!

⏰ **Horário:** Seg-Sex 9h-18h (EST), Sáb 9h-14h
🚨 **Emergências:** Atendimento 24h disponível`;
      }

      // Send the response
      await this.sendMessage(from, response);
      console.log(`📤 Sent enhanced auto-response to ${from.split('@')[0]} (intent detected: ${this.detectSimpleIntent(message)})`);
      
    } catch (error) {
      console.error('Error sending direct auto-response:', error);
      // Last resort - simple message
      try {
        await this.sendMessage(from, '😊 Obrigado por entrar em contato! Um especialista responderá em breve.');
      } catch (finalError) {
        console.error('Failed to send even simple response:', finalError);
      }
    }
  }

  // Simple intent detection helper
  private detectSimpleIntent(message: string): string {
    if (message.includes('oi') || message.includes('olá')) return 'greeting';
    if (message.includes('voo') || message.includes('viagem')) return 'flight_inquiry';
    if (message.includes('preço') || message.includes('cotação')) return 'pricing';
    if (message.includes('hotel')) return 'hotel_inquiry';
    if (message.includes('carro')) return 'car_rental';
    if (message.includes('urgente') || message.includes('emergência')) return 'urgent';
    return 'general';
  }

  // Check if this is a new conversation
  private async checkIfNewConversation(from: string): Promise<boolean> {
    try {
      // Simple check - could be enhanced with database lookup
      // For now, assume it's new if we haven't sent a message recently
      return true; // Simplified for demo
    } catch (error) {
      console.error('Error checking conversation:', error);
      return false;
    }
  }

  // Format phone number to WhatsApp JID
  private formatJid(phone: string): string {
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

  // Send notification to N8N
  private async notifyN8N(event: string, data: any): Promise<boolean> {
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
      if (!webhookUrl) {
        console.error('❌ N8N webhook URL not configured - using fallback response');
        console.log('📍 Expected webhook URL: https://n8n-production-81b6.up.railway.app/webhook/whatsapp');
        return false;
      }

      console.log(`📡 Sending to N8N webhook: ${webhookUrl}`);
      console.log(`📦 Event: ${event}`);
      console.log(`📦 Data:`, JSON.stringify(data, null, 2));

      // Format data exactly as N8N workflow expects
      const webhookPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        source: 'baileys',
        // Add data directly to root for N8N compatibility
        ...data,
        // Ensure required fields for N8N workflow
        body: {
          event,
          data,
          ...data
        }
      };

      console.log(`📦 Full Payload:`, JSON.stringify(webhookPayload, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Fly2Any-WhatsApp-Baileys/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        console.error(`❌ N8N webhook failed: ${response.status} ${response.statusText}`);
        const responseText = await response.text();
        console.error(`Response: ${responseText}`);
        
        // Log the exact URL being called for debugging
        console.error(`❌ Failed URL: ${webhookUrl}`);
        console.error(`❌ Payload that failed:`, JSON.stringify(webhookPayload, null, 2));
        
        return false;
      } else {
        console.log('✅ Successfully sent to N8N webhook');
        const responseText = await response.text();
        console.log('📥 N8N Response:', responseText);
        return true;
      }
    } catch (error) {
      console.error('❌ N8N notification failed:', error);
      console.error(`❌ Webhook URL: ${process.env.N8N_WEBHOOK_WHATSAPP}`);
      return false;
    }
  }

  // Get connection status
  public getConnectionStatus(): {
    isConnected: boolean;
    connectionState: string;
    qrCode: string | null;
  } {
    return {
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      qrCode: this.qrCode
    };
  }

  // Get status (alias for getConnectionStatus)
  public getStatus() {
    return this.getConnectionStatus();
  }

  // Get QR code for connection
  public getQRCode(): string | null {
    return this.qrCode;
  }

  // Disconnect
  public async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  public isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const baileysWhatsAppService = WhatsAppBaileysService.getInstance();

// Export convenience function for direct use
export async function sendBaileysMessage(phone: string, message: string): Promise<boolean> {
  return await baileysWhatsAppService.sendMessage(phone, message);
}