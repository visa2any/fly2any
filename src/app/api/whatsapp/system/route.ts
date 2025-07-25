import { NextRequest, NextResponse } from 'next/server';
import { initializeWhatsAppSystem, checkWhatsAppSystemHealth } from '@/lib/whatsapp-system-init';

/**
 * 🔧 API de Sistema WhatsApp
 * 
 * GET ?action=health - Verificação rápida de saúde
 * GET ?action=status - Status completo do sistema  
 * POST action=initialize - Inicialização completa
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    switch (action) {
      case 'health':
        const health = await checkWhatsAppSystemHealth();
        return NextResponse.json({
          success: true,
          data: health
        });

      case 'status':
        console.log('🔍 Verificando status completo do sistema...');
        const status = await initializeWhatsAppSystem();
        
        return NextResponse.json({
          success: true,
          data: status,
          message: status.overall.ready ? 'Sistema funcionando' : 'Sistema com problemas'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: health, status'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na API do sistema:', error);
    return NextResponse.json({
      success: false,
      error: 'System check failed'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        console.log('🚀 Inicializando sistema completo...');
        const result = await initializeWhatsAppSystem();
        
        return NextResponse.json({
          success: result.overall.ready,
          data: result,
          message: result.overall.ready ? 
            'Sistema inicializado com sucesso' : 
            'Sistema inicializado com problemas'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: initialize'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    return NextResponse.json({
      success: false,
      error: 'System initialization failed'
    }, { status: 500 });
  }
}

// Configuração
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';