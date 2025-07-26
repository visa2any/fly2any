/**
 * WhatsApp Railway Integration
 * Connects to Baileys service hosted on Railway
 */

interface RailwayWhatsAppResponse {
  success: boolean;
  qrCode?: string;
  status?: string;
  error?: string;
  isConnected?: boolean;
}

interface WhatsAppStatus {
  connected: boolean;
  connectionState: string;
  qrCode?: string;
}

export class WhatsAppRailwayService {
  private static instance: WhatsAppRailwayService;
  private readonly railwayUrl: string;

  private constructor() {
    // Use the same Railway domain as N8N
    this.railwayUrl = process.env.WHATSAPP_RAILWAY_URL || 'https://baileys-production-81b6.up.railway.app';
    console.log('🚂 WhatsApp Railway URL:', this.railwayUrl);
  }

  public static getInstance(): WhatsAppRailwayService {
    if (!WhatsAppRailwayService.instance) {
      WhatsAppRailwayService.instance = new WhatsAppRailwayService();
    }
    return WhatsAppRailwayService.instance;
  }

  /**
   * Initialize WhatsApp connection and get QR code
   */
  async initialize(): Promise<RailwayWhatsAppResponse> {
    try {
      console.log('🚀 Initializing WhatsApp via Railway...');
      
      const response = await fetch(`${this.railwayUrl}/api/whatsapp/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Railway responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Railway response:', data);

      return {
        success: true,
        qrCode: data.qrCode,
        status: data.status,
        isConnected: data.isConnected || false
      };

    } catch (error) {
      console.error('❌ Railway WhatsApp error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Railway error'
      };
    }
  }

  /**
   * Get current WhatsApp status from Railway
   */
  async getStatus(): Promise<WhatsAppStatus> {
    try {
      console.log('🔍 Getting WhatsApp status from Railway...');
      
      const response = await fetch(`${this.railwayUrl}/api/whatsapp/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Railway status failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Railway status:', data);

      return {
        connected: data.isConnected || data.connected || false,
        connectionState: data.status || data.connectionState || 'disconnected',
        qrCode: data.qrCode
      };

    } catch (error) {
      console.error('❌ Railway status error:', error);
      return {
        connected: false,
        connectionState: 'error',
        qrCode: undefined
      };
    }
  }

  /**
   * Send message via Railway WhatsApp
   */
  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      console.log('📱 Sending message via Railway WhatsApp...');
      
      const response = await fetch(`${this.railwayUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          message
        }),
        timeout: 15000, // 15 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Railway send failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Railway send response:', data);

      return data.success || false;

    } catch (error) {
      console.error('❌ Railway send error:', error);
      return false;
    }
  }

  /**
   * Disconnect WhatsApp on Railway
   */
  async disconnect(): Promise<boolean> {
    try {
      console.log('🔌 Disconnecting WhatsApp on Railway...');
      
      const response = await fetch(`${this.railwayUrl}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const data = await response.json();
      return data.success || false;

    } catch (error) {
      console.error('❌ Railway disconnect error:', error);
      return false;
    }
  }
}