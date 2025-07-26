import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inicializando WhatsApp otimizado para Vercel...');
    
    // Use Vercel-optimized Baileys service
    const { WhatsAppVercelService } = await import('../../../../lib/whatsapp-vercel-optimized');
    
    // Initialize WhatsApp with Vercel optimizations
    const whatsapp = WhatsAppVercelService.getInstance();
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
    const { WhatsAppVercelService } = await import('../../../../lib/whatsapp-vercel-optimized');
    const whatsapp = WhatsAppVercelService.getInstance();
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