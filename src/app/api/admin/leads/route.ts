import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, getLeadStats, type ServiceData } from '@/lib/database';

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

    if (stats) {
      // Retornar estatísticas
      const statsData = await getLeadStats();
      return NextResponse.json(statsData);
    } else {
      // Retornar lista de leads
      const leadsData = await getAllLeads(page, limit);
      return NextResponse.json(leadsData);
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
      // Exportar todos os leads
      const { leads } = await getAllLeads(1, 10000);
      
      const csvData = leads.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        sobrenome: lead.sobrenome,
        email: lead.email,
        whatsapp: lead.whatsapp,
        telefone: lead.telefone,
        servicos: lead.selectedServices.map((s: ServiceData) => s.serviceType).join(', '),
        origem: lead.origem,
        destino: lead.destino,
        dataIda: lead.dataIda,
        dataVolta: lead.dataVolta,
        adultos: lead.adultos,
        criancas: lead.criancas,
        bebes: lead.bebes,
        orcamento: lead.orcamentoAproximado,
        observacoes: lead.observacoes,
        criadoEm: lead.createdAt
      }));

      return NextResponse.json({
        success: true,
        data: csvData,
        total: csvData.length
      });
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
