import { EmailMarketingDatabase } from '@/lib/email-marketing-database';
import { sql } from '@vercel/postgres';

// Helper function to ensure tables exist
async function ensureTablesExist() {
  // This should be implemented or imported from the main route
  // For now, we'll skip this check
  return true;
}

/**
 * 🔄 Função para auto-restart de campanhas pausadas
 * Move do route handler para evitar conflitos de export do Next.js
 */
export async function executeAutoRestart() {
  try {
    await ensureTablesExist();
    console.log('🚀 Iniciando auto-restart de campanhas pausadas...');
    
    // 1. Buscar campanhas pausadas
    const allCampaigns = await EmailMarketingDatabase.getEmailCampaigns(1000);
    const pausedCampaigns = allCampaigns.filter((c: any) => c.status === 'paused');
    
    console.log(`📊 Encontradas ${pausedCampaigns.length} campanhas pausadas`);
    
    if (pausedCampaigns.length === 0) {
      return {
        success: true,
        data: {
          message: 'Nenhuma campanha pausada encontrada',
          restarted: 0,
          failed: 0
        }
      };
    }
    
    let restarted = 0;
    let failed = 0;
    const results = [];
    
    // 2. Para cada campanha pausada, verificar se há envios pendentes
    for (const campaign of pausedCampaigns) {
      try {
        console.log(`🔍 Verificando campanha: ${campaign.id} - ${campaign.name}`);
        
        // Verificar se há envios pendentes para esta campanha
        if (!campaign.id) {
          console.log(`⚠️ Campanha sem ID, pulando...`);
          continue;
        }
        const pendingSendsResult = await sql`
          SELECT * FROM email_sends 
          WHERE campaign_id = ${campaign.id} AND status = 'pending'
        `;
        const pendingSends = pendingSendsResult.rows;
        
        console.log(`📨 Campanha ${campaign.id}: ${pendingSends.length} envios pendentes`);
        
        if (pendingSends.length > 0) {
          // Reativar a campanha
          await sql`
            UPDATE email_campaigns 
            SET status = 'sending', updated_at = ${new Date().toISOString()}
            WHERE id = ${campaign.id}
          `;
          
          console.log(`✅ Campanha ${campaign.id} reativada com ${pendingSends.length} envios pendentes`);
          
          restarted++;
          results.push({
            campaignId: campaign.id,
            name: campaign.name,
            status: 'restarted',
            pendingSends: pendingSends.length,
            message: `Reativada com ${pendingSends.length} envios pendentes`
          });
        } else {
          console.log(`⏭️  Campanha ${campaign.id}: Nenhum envio pendente, mantendo pausada`);
          results.push({
            campaignId: campaign.id,
            name: campaign.name,
            status: 'skipped',
            pendingSends: 0,
            message: 'Nenhum envio pendente'
          });
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.id}:`, error);
        failed++;
        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          message: 'Falha ao reativar'
        });
      }
    }
    
    const summary = {
      totalPausedCampaigns: pausedCampaigns.length,
      restarted,
      failed,
      details: results,
      message: `✅ Auto-restart concluído: ${restarted} reativadas, ${failed} falharam`
    };
    
    console.log('🎯 RESUMO AUTO-RESTART:', summary);
    
    return {
      success: true,
      data: summary
    };
    
  } catch (error) {
    console.error('❌ Erro crítico no auto-restart:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no auto-restart'
    };
  }
}