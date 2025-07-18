import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inicializando WhatsApp Baileys...');
    
    // Import WhatsApp service dynamically
    const { WhatsAppBaileysService } = await import('../../../../lib/whatsapp-baileys');
    
    // Initialize WhatsApp
    const whatsapp = WhatsAppBaileysService.getInstance();
    const result = await whatsapp.initialize();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp inicializado com sucesso',
        qrCode: result.qrCode,
        isReady: result.isReady
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { WhatsAppBaileysService } = await import('../../../../lib/whatsapp-baileys');
    const whatsapp = WhatsAppBaileysService.getInstance();
    const status = whatsapp.getStatus();
    
    return NextResponse.json({
      success: true,
      status: status.isConnected ? 'connected' : 'disconnected',
      qrCode: status.qrCode
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'WhatsApp não inicializado'
    }, { status: 500 });
  }
}