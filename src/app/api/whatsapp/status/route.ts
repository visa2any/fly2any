import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const status = {
      baileys: {
        available: false,
        connected: false,
        connectionState: 'close' as string,
        qrCode: null as string | null
      },
      simulation: {
        available: false,
        connected: false
      },
      activeMode: 'baileys' // FORÇA MODO DE PRODUÇÃO
    };

    // Check Baileys status
    try {
      const { WhatsAppBaileysService } = await import('@/lib/whatsapp-baileys');
      const baileysWhatsAppService = WhatsAppBaileysService.getInstance();
      const baileysStatus = baileysWhatsAppService.getConnectionStatus();
      
      status.baileys = {
        available: true,
        connected: baileysStatus.isConnected,
        connectionState: String(baileysStatus.connectionState),
        qrCode: baileysStatus.qrCode as string | null
      };

      // SEMPRE USAR BAILEYS EM PRODUÇÃO
      status.activeMode = 'baileys';
    } catch (error) {
      console.error('❌ Baileys OBRIGATÓRIO para produção:', error);
      // Mesmo com erro, força modo baileys
      status.activeMode = 'baileys';
    }

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'initialize':
        const { whatsappService } = await import('@/lib/whatsapp');
        const initialized = await whatsappService.initialize();
        
        return NextResponse.json({
          success: initialized,
          message: initialized ? 'WhatsApp service initialized' : 'Failed to initialize'
        });

      case 'disconnect':
        try {
          const { WhatsAppBaileysService } = await import('@/lib/whatsapp-baileys');
      const baileysWhatsAppService = WhatsAppBaileysService.getInstance();
          await baileysWhatsAppService.disconnect();
          
          return NextResponse.json({
            success: true,
            message: 'WhatsApp disconnected'
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to disconnect'
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}