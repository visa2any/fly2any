import { NextRequest, NextResponse } from 'next/server';
import { EmailMarketingMonitor } from '@/lib/email-marketing-monitor';

/**
 * API para análise de saúde de campanhas de email marketing
 * GET /api/email-marketing/health?campaign_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json({ 
        success: false, 
        error: 'campaign_id é obrigatório' 
      }, { status: 400 });
    }

    // Obter análise completa da campanha
    const insights = await EmailMarketingMonitor.analyzeCampaignPerformance(campaignId);
    
    return NextResponse.json({
      success: true,
      data: {
        status: insights.health.status,
        score: insights.health.score,
        issues: insights.health.issues,
        recommendations: insights.health.recommendations,
        trends: insights.trends,
        performance: {
          deliveryRate: insights.performance.deliveryRate,
          openRate: insights.performance.openRate,
          clickRate: insights.performance.clickRate,
          bounceRate: insights.performance.bounceRate,
          complaintRate: insights.performance.complaintRate,
          avgTimeToOpen: insights.performance.avgTimeToOpen,
          peakOpeningHours: insights.performance.peakOpeningHours,
          deviceDistribution: insights.performance.deviceDistribution
        },
        predictions: insights.predictions,
        lastAnalysis: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de health:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno na análise de saúde' 
    }, { status: 500 });
  }
}

/**
 * POST para gerar relatório completo de análise
 */
export async function POST(request: NextRequest) {
  try {
    const { campaign_id } = await request.json();

    if (!campaign_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'campaign_id é obrigatório' 
      }, { status: 400 });
    }

    // Gerar relatório completo
    const report = await EmailMarketingMonitor.generateAnalysisReport(campaign_id);
    
    return NextResponse.json({
      success: true,
      data: {
        report,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno na geração do relatório' 
    }, { status: 500 });
  }
}