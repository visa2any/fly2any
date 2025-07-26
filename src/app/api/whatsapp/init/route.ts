import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inicializando WhatsApp via Railway...');
    
    // Use Railway WhatsApp service instead of local Baileys
    const { WhatsAppRailwayService } = await import('../../../../lib/whatsapp-railway');
    
    // Initialize WhatsApp on Railway
    const whatsapp = WhatsAppRailwayService.getInstance();
    const result = await whatsapp.initialize();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp inicializado com sucesso via Railway',
        qrCode: result.qrCode,
        isReady: result.isConnected || false
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Falha na conexão com Railway'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp Railway:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do Railway'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { WhatsAppRailwayService } = await import('../../../../lib/whatsapp-railway');
    const whatsapp = WhatsAppRailwayService.getInstance();
    const status = await whatsapp.getStatus();
    
    return NextResponse.json({
      success: true,
      status: status.connected ? 'connected' : 'disconnected',
      qrCode: status.qrCode,
      isConnected: status.connected
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter status do Railway'
    }, { status: 500 });
  }
}