import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// Função simples de autenticação (desenvolvimento local)
function isAuthenticated(): boolean {
  // Em desenvolvimento, permite acesso local
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';

    try {
      // Inicializar tabelas se necessário
      await DatabaseService.initializeTables();
      
      if (stats) {
        // Retornar estatísticas
        const statsData = await DatabaseService.getLeadStats();
        return NextResponse.json(statsData);
      } else {
        // Retornar lista de leads
        const leadsData = await DatabaseService.getAllLeads(page, limit);
        return NextResponse.json(leadsData);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Fallback para dados mock se DB falhar
      const mockData = {
        leads: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'export') {
      try {
        // Inicializar tabelas se necessário
        await DatabaseService.initializeTables();
        
        // Exportar todos os leads
        const { leads } = await DatabaseService.getAllLeads(1, 10000);
        
        const csvData = leads.map(lead => ({
          id: lead.id,
          nome: lead.nome,
          email: lead.email,
          whatsapp: lead.whatsapp,
          servicos: Array.isArray(lead.selectedServices) ? lead.selectedServices.join(', ') : '',
          origem: lead.origem,
          destino: lead.destino,
          dataPartida: lead.dataPartida,
          dataRetorno: lead.dataRetorno,
          numeroPassageiros: lead.numeroPassageiros,
          tipoViagem: lead.tipoViagem,
          orcamento: lead.orcamentoTotal,
          prioridadeOrcamento: lead.prioridadeOrcamento,
          status: lead.status,
          priority: lead.priority,
          source: lead.source,
          criadoEm: lead.createdAt
        }));

        return NextResponse.json({
          success: true,
          data: csvData,
          total: csvData.length
        });
      } catch (dbError) {
        console.error('Export error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Failed to export leads'
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro na operação admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
