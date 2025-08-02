import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// GET /api/omnichannel/dashboard - Estatísticas do dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d
    const agentId = searchParams.get('agent_id');

    const stats = await OmnichannelAPI.getDashboardStats();

    // Adicionar estatísticas específicas do período
    const additionalStats = {
      period,
      timestamp: new Date().toISOString(),
      trends: {
        conversationsGrowth: '+12%', // Implementar cálculo real
        responseTimeImprovement: '-8%', // Implementar cálculo real
        satisfactionChange: '+5%' // Implementar cálculo real
      },
      agentPerformance: agentId ? {
        totalConversations: 45,
        avgResponseTime: 120,
        satisfactionRating: 4.2
      } : undefined
    };

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        ...additionalStats
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}