import { NextRequest, NextResponse } from 'next/server';
import { EmailCampaignsDB, EmailSendsDB, EmailContactsDB } from '@/lib/email-marketing-db';

// 🔧 API de DEBUG e CORREÇÃO para campanhas travadas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      // 🕵️ Encontrar campanhas travadas
      case 'stuck_campaigns': {
        const campaigns = await EmailCampaignsDB.findAll();
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        const stuckCampaigns = campaigns.filter(campaign => 
          campaign.status === 'sending' && 
          campaign.updated_at < tenMinutesAgo
        );

        const stuckDetails = await Promise.all(
          stuckCampaigns.map(async (campaign) => {
            const sends = await EmailSendsDB.findByCampaign(campaign.id);
            const pendingSends = sends.filter(s => s.status === 'pending');
            const sentSends = sends.filter(s => s.status === 'sent');
            const failedSends = sends.filter(s => s.status === 'failed');

            return {
              campaign,
              totalSends: sends.length,
              pending: pendingSends.length,
              sent: sentSends.length,
              failed: failedSends.length,
              stuckTime: Math.round((Date.now() - campaign.updated_at.getTime()) / 60000)
            };
          })
        );

        return NextResponse.json({
          success: true,
          data: {
            stuckCampaigns: stuckDetails,
            totalStuck: stuckDetails.length
          }
        });
      }

      // 🔄 Resetar campanha específica
      case 'reset_stuck': {
        const campaignId = searchParams.get('campaign_id');
        
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id é obrigatório'
          }, { status: 400 });
        }

        const campaign = await EmailCampaignsDB.findById(campaignId);
        if (!campaign) {
          return NextResponse.json({
            success: false,
            error: 'Campanha não encontrada'
          }, { status: 404 });
        }

        const sends = await EmailSendsDB.findByCampaign(campaignId);
        const pendingSends = sends.filter(s => s.status === 'pending');
        const sentSends = sends.filter(s => s.status === 'sent');

        // Se todos foram enviados, marcar como completa
        if (pendingSends.length === 0 && sentSends.length > 0) {
          await EmailCampaignsDB.updateStatus(campaignId, 'completed');
          await EmailCampaignsDB.updateStats(campaignId, {
            total_recipients: sends.length,
            total_sent: sentSends.length
          });

          return NextResponse.json({
            success: true,
            message: `✅ Campanha "${campaign.name}" marcada como completa`,
            details: {
              totalSends: sends.length,
              sent: sentSends.length,
              pending: pendingSends.length
            }
          });
        }

        // Se há pendentes, resetar para draft
        if (pendingSends.length > 0) {
          await EmailCampaignsDB.updateStatus(campaignId, 'draft');
          
          return NextResponse.json({
            success: true,
            message: `🔄 Campanha "${campaign.name}" resetada para draft`,
            details: {
              totalSends: sends.length,
              sent: sentSends.length,
              pending: pendingSends.length
            }
          });
        }

        return NextResponse.json({
          success: false,
          error: '⚠️ Campanha não precisa ser resetada'
        });
      }

      // ⚡ Forçar conclusão
      case 'force_complete': {
        const campaignId = searchParams.get('campaign_id');
        
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id é obrigatório'
          }, { status: 400 });
        }

        const campaign = await EmailCampaignsDB.findById(campaignId);
        if (!campaign) {
          return NextResponse.json({
            success: false,
            error: 'Campanha não encontrada'
          }, { status: 404 });
        }

        const sends = await EmailSendsDB.findByCampaign(campaignId);
        const sentSends = sends.filter(s => s.status === 'sent');

        await EmailCampaignsDB.updateStatus(campaignId, 'completed');
        await EmailCampaignsDB.updateStats(campaignId, {
          total_recipients: sends.length,
          total_sent: sentSends.length
        });

        return NextResponse.json({
          success: true,
          message: `⚡ Campanha "${campaign.name}" forçada como completa`,
          details: {
            totalSends: sends.length,
            sent: sentSends.length
          }
        });
      }

      // 🩺 Health check completo
      case 'health_check': {
        const envVars = {
          hasGmailEmail: !!process.env.GMAIL_EMAIL,
          hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD
        };

        const campaigns = await EmailCampaignsDB.findAll();
        const lastCampaign = campaigns[0];
        const stats = await EmailContactsDB.getStats();

        return NextResponse.json({
          success: true,
          data: {
            environment: envVars,
            database: {
              totalCampaigns: campaigns.length,
              lastCampaign: lastCampaign ? {
                id: lastCampaign.id,
                name: lastCampaign.name,
                status: lastCampaign.status,
                created_at: lastCampaign.created_at
              } : null
            },
            contacts: stats
          }
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não encontrada. Use: stuck_campaigns, reset_stuck, force_complete, health_check'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

// 🛠️ POST para ações de correção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // 🔄 Resetar TODAS as campanhas travadas
      case 'reset_all_stuck': {
        const campaigns = await EmailCampaignsDB.findAll();
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        const stuckCampaigns = campaigns.filter(campaign => 
          campaign.status === 'sending' && 
          campaign.updated_at < tenMinutesAgo
        );

        const resetResults = await Promise.all(
          stuckCampaigns.map(async (campaign) => {
            const sends = await EmailSendsDB.findByCampaign(campaign.id);
            const pendingSends = sends.filter(s => s.status === 'pending');
            const sentSends = sends.filter(s => s.status === 'sent');

            if (pendingSends.length === 0 && sentSends.length > 0) {
              await EmailCampaignsDB.updateStatus(campaign.id, 'completed');
              await EmailCampaignsDB.updateStats(campaign.id, {
                total_recipients: sends.length,
                total_sent: sentSends.length
              });
              return { id: campaign.id, name: campaign.name, action: 'completed', sent: sentSends.length };
            } else {
              await EmailCampaignsDB.updateStatus(campaign.id, 'draft');
              return { id: campaign.id, name: campaign.name, action: 'reset_to_draft', pending: pendingSends.length };
            }
          })
        );

        return NextResponse.json({
          success: true,
          message: `✅ ${stuckCampaigns.length} campanhas travadas foram corrigidas automaticamente`,
          details: resetResults
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não encontrada'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de correção:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}