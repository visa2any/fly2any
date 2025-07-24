import { NextRequest, NextResponse } from 'next/server';
import { EmailCampaignsDB, EmailSendsDB } from '@/lib/email-marketing-db';

// 🔄 API de REINÍCIO AUTOMÁTICO de campanhas travadas
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Executando verificação automática de campanhas travadas...');
    
    // Buscar todas as campanhas
    const campaigns = await EmailCampaignsDB.findAll();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos (mais agressivo)
    
    // Filtrar campanhas travadas
    const stuckCampaigns = campaigns.filter(campaign => 
      campaign.status === 'sending' && 
      campaign.updated_at < fiveMinutesAgo
    );

    console.log(`🕵️ Encontradas ${stuckCampaigns.length} campanhas potencialmente travadas`);

    const restartResults = [];

    for (const campaign of stuckCampaigns) {
      try {
        console.log(`🔍 Analisando campanha: ${campaign.name} (ID: ${campaign.id})`);
        
        const sends = await EmailSendsDB.findByCampaign(campaign.id);
        const pendingSends = sends.filter(s => s.status === 'pending');
        const sentSends = sends.filter(s => s.status === 'sent');
        
        console.log(`📊 Status: ${pendingSends.length} pendentes, ${sentSends.length} enviados`);

        if (pendingSends.length > 0) {
          // Há emails pendentes - resetar para draft para reiniciar
          console.log(`🔄 Resetando campanha "${campaign.name}" para reiniciar envio...`);
          
          await EmailCampaignsDB.updateStatus(campaign.id, 'draft');
          await EmailCampaignsDB.updateTimestamp(campaign.id); // Atualizar timestamp
          
          // Reiniciar automaticamente fazendo uma chamada para a API principal
          const restartResponse = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.fly2any.com'}/api/email-marketing`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'send_campaign',
              campaign_id: campaign.id
            })
          });

          const restartResult = await restartResponse.json();
          
          restartResults.push({
            id: campaign.id,
            name: campaign.name,
            action: 'restarted',
            pending: pendingSends.length,
            sent: sentSends.length,
            restartSuccess: restartResult.success,
            message: restartResult.success ? '✅ Reiniciado com sucesso' : `❌ Erro no reinício: ${restartResult.error}`
          });

          console.log(`✅ Campanha "${campaign.name}" reiniciada automaticamente`);
          
        } else if (sentSends.length > 0) {
          // Todos enviados - marcar como completa
          console.log(`✅ Marcando campanha "${campaign.name}" como completa`);
          
          await EmailCampaignsDB.updateStatus(campaign.id, 'completed');
          await EmailCampaignsDB.updateStats(campaign.id, {
            total_recipients: sends.length,
            total_sent: sentSends.length
          });

          restartResults.push({
            id: campaign.id,
            name: campaign.name,
            action: 'completed',
            pending: 0,
            sent: sentSends.length,
            restartSuccess: true,
            message: '✅ Marcada como completa'
          });
        }

      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.id}:`, error);
        
        restartResults.push({
          id: campaign.id,
          name: campaign.name,
          action: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          restartSuccess: false,
          message: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    }

    console.log(`🏁 Verificação automática concluída. ${restartResults.length} campanhas processadas`);

    return NextResponse.json({
      success: true,
      message: `✅ Verificação automática executada. ${stuckCampaigns.length} campanhas travadas encontradas e processadas.`,
      details: {
        totalCampaigns: campaigns.length,
        stuckCampaigns: stuckCampaigns.length,
        processedCampaigns: restartResults.length,
        results: restartResults
      }
    });

  } catch (error) {
    console.error('❌ Erro na verificação automática:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno na verificação automática'
    }, { status: 500 });
  }
}

// 🔍 GET para status do sistema de auto-restart
export async function GET() {
  try {
    const campaigns = await EmailCampaignsDB.findAll();
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const statusSummary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'sending').length,
      stuckCampaigns: campaigns.filter(c => 
        c.status === 'sending' && c.updated_at < fiveMinutesAgo
      ).length,
      completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
      draftCampaigns: campaigns.filter(c => c.status === 'draft').length,
      lastCheck: now.toISOString(),
      autoRestartEnabled: true
    };

    return NextResponse.json({
      success: true,
      autoRestart: statusSummary,
      message: statusSummary.stuckCampaigns > 0 
        ? `⚠️ ${statusSummary.stuckCampaigns} campanhas travadas detectadas`
        : '✅ Nenhuma campanha travada detectada'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}