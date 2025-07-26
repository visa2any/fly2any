import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inicializando WhatsApp otimizado para Vercel...');
    
    // Use simple test service to verify QR code generation works
    const { WhatsAppSimpleTestService } = await import('../../../../lib/whatsapp-simple-test');
    
    // Initialize test service
    const whatsapp = WhatsAppSimpleTestService.getInstance();
    const result = await whatsapp.initialize();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp inicializado com sucesso via Railway',
        qrCode: result.qrCode,
        isReady: result.isReady || false
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
    const { WhatsAppSimpleTestService } = await import('../../../../lib/whatsapp-simple-test');
    const whatsapp = WhatsAppSimpleTestService.getInstance();
    const status = whatsapp.getStatus();
    
    return NextResponse.json({
      success: true,
      status: status.isConnected ? 'connected' : 'disconnected',
      qrCode: status.qrCode,
      isConnected: status.isConnected
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter status do Railway'
    }, { status: 500 });
  }
}