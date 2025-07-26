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

    // Check Railway Baileys status
    try {
      const { WhatsAppRailwayService } = await import('../../../../lib/whatsapp-railway');
      const railwayService = WhatsAppRailwayService.getInstance();
      const railwayStatus = await railwayService.getStatus();
      
      status.baileys = {
        available: true,
        connected: railwayStatus.connected,
        connectionState: railwayStatus.connectionState,
        qrCode: railwayStatus.qrCode as string | null
      };

      // Use Railway Baileys em produção
      status.activeMode = 'baileys';
    } catch (error) {
      console.error('❌ Railway Baileys error:', error);
      status.baileys = {
        available: false,
        connected: false,
        connectionState: 'error',
        qrCode: null
      };
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