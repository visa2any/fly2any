/**
 * WhatsApp Simple Test Service
 * Generate a test QR code to verify the frontend is working
 */

interface InitResult {
  success: boolean;
  qrCode?: string;
  error?: string;
  isReady?: boolean;
}

export class WhatsAppSimpleTestService {
  private static instance: WhatsAppSimpleTestService;

  public static getInstance(): WhatsAppSimpleTestService {
    if (!WhatsAppSimpleTestService.instance) {
      WhatsAppSimpleTestService.instance = new WhatsAppSimpleTestService();
    }
    return WhatsAppSimpleTestService.instance;
  }

  async initialize(): Promise<InitResult> {
    try {
      console.log('🧪 Generating test QR code...');
      
      // Generate a simple test QR code using qrcode library
      const QRCodeLib = await import('qrcode');
      const testQRData = 'https://wa.me/qr/TEST_QR_CODE_FLOW_' + Date.now();
      
      const qrDataURL = await QRCodeLib.toDataURL(testQRData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('✅ Test QR code generated successfully!');
      
      return {
        success: true,
        qrCode: qrDataURL,
        isReady: false
      };
      
    } catch (error) {
      console.error('❌ Test QR generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getStatus() {
    return {
      isConnected: false,
      connectionState: 'test',
      qrCode: null,
      isInitializing: false
    };
  }

  getConnectionStatus() {
    return this.getStatus();
  }

  async disconnect() {
    console.log('✅ Test service disconnected');
    return true;
  }
}