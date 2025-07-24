import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { DatabaseFallback } from '@/lib/database-fallback';
import { LeadService } from '@/lib/services/lead-service';
import { DatabaseChecker } from '@/lib/database-checker';
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await verifyAdminAuth(request);
    if (!auth.isAuthenticated) {
      return createUnauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';

    // Check database status first
    const dbStatus = await DatabaseChecker.checkConnection();
    console.log('[ADMIN] Database status:', dbStatus);
    
    if (dbStatus.connected) {
      // Use real database
      console.log('[ADMIN] Using real database...');
      try {
        await DatabaseChecker.initializeTables();
        
        if (stats) {
          const statsData = await DatabaseService.getLeadStats();
          return NextResponse.json({
            ...statsData,
            _source: 'database',
            _status: 'connected'
          });
        } else {
          const leadsData = await DatabaseService.getAllLeads(page, limit);
          return NextResponse.json({
            ...leadsData,
            _source: 'database',
            _status: 'connected'
          });
        }
      } catch (dbError) {
        console.error('[ADMIN] Database operation failed:', dbError);
      }
    }
    
    // Fallback to cache if database not available
    try {
      console.log('[ADMIN] Using cache fallback...');
      if (stats) {
        const cacheStats = LeadService.getStatsFromCache();
        console.log('[ADMIN] Cache stats:', JSON.stringify(cacheStats, null, 2));
        return NextResponse.json({
          ...cacheStats,
          _source: 'cache',
          _status: dbStatus.configured ? 'database_error' : 'database_not_configured',
          _message: dbStatus.instructions || 'Using temporary cache'
        });
      } else {
        const cacheData = LeadService.getLeadsFromCache(page, limit);
        console.log('[ADMIN] Cache data:', JSON.stringify(cacheData, null, 2));
        return NextResponse.json({
          ...cacheData,
          _source: 'cache',
          _status: dbStatus.configured ? 'database_error' : 'database_not_configured',
          _message: dbStatus.instructions || 'Using temporary cache'
        });
      }
    } catch (cacheError) {
      console.warn('[ADMIN] Cache also failed:', cacheError);
    }

    try {
      // Try database as fallback
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
      console.error('Database error, using fallback:', dbError);
      
      // Usar fallback para arquivo JSON
      try {
        const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
        
        if (stats) {
          // Calcular estatísticas dos leads do fallback
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const thisWeek = new Date(now.setDate(now.getDate() - 7));
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const statsData = {
            total: fallbackLeads.length,
            today: fallbackLeads.filter((lead: any) => 
              new Date(lead.createdAt) >= today
            ).length,
            thisWeek: fallbackLeads.filter((lead: any) => 
              new Date(lead.createdAt) >= thisWeek
            ).length,
            thisMonth: fallbackLeads.filter((lead: any) => 
              new Date(lead.createdAt) >= thisMonth
            ).length,
            byService: fallbackLeads.reduce((acc: any, lead: any) => {
              const services = lead.selectedServices || [lead.serviceType || 'unknown'];
              services.forEach((service: string) => {
                acc[service] = (acc[service] || 0) + 1;
              });
              return acc;
            }, {})
          };
          
          return NextResponse.json(statsData);
        } else {
          // Transformar dados do fallback para o formato esperado
          const transformedLeads = fallbackLeads.map((lead: any) => ({
            id: lead.id,
            nome: lead.nome || undefined,
            email: lead.email || undefined,
            whatsapp: lead.whatsapp || undefined,
            telefone: lead.telefone || undefined,
            origem: lead.origem || undefined,
            destino: lead.destino || undefined,
            dataPartida: lead.dataPartida || lead.dataIda || undefined,
            dataRetorno: lead.dataRetorno || lead.dataVolta || undefined,
            numeroPassageiros: lead.numeroPassageiros || lead.adultos || 1,
            selectedServices: Array.isArray(lead.selectedServices) ? 
              lead.selectedServices : 
              (lead.serviceType ? [lead.serviceType] : ['unknown']),
            status: lead.status || 'novo',
            source: lead.source || 'website',
            createdAt: lead.createdAt,
            orcamentoTotal: lead.orcamentoTotal || lead.orcamentoAproximado,
            fullData: lead
          }));
          
          // Aplicar paginação
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedLeads = transformedLeads.slice(startIndex, endIndex);
          
          const leadsData = {
            leads: paginatedLeads,
            total: transformedLeads.length,
            page: page,
            totalPages: Math.ceil(transformedLeads.length / limit)
          };
          
          return NextResponse.json(leadsData);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        
        // Try cache as final fallback
        try {
          console.log('[ADMIN] Trying cache fallback...');
          if (stats) {
            const cacheStats = LeadService.getStatsFromCache();
            console.log('[ADMIN] Cache stats:', JSON.stringify(cacheStats, null, 2));
            return NextResponse.json(cacheStats);
          } else {
            const cacheData = LeadService.getLeadsFromCache(page, limit);
            console.log('[ADMIN] Cache data:', JSON.stringify(cacheData, null, 2));
            return NextResponse.json(cacheData);
          }
        } catch (cacheError) {
          console.error('Cache error:', cacheError);
          
          // Final fallback - empty data with message
          const emptyData = stats ? {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            byService: {},
            message: "Leads são processados via webhook N8N. Cache vazio no momento."
          } : {
            leads: [],
            total: 0,
            page: 1,
            totalPages: 0,
            message: "Leads são processados via webhook N8N. Cache vazio no momento."
          };
          return NextResponse.json(emptyData);
        }
      }
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
    const auth = await verifyAdminAuth(request);
    if (!auth.isAuthenticated) {
      return createUnauthorizedResponse(auth.error);
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
