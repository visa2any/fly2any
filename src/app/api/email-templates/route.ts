import { NextRequest, NextResponse } from 'next/server';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
  type: 'promotional' | 'newsletter' | 'reactivation';
}

// Templates padrão (fallback se não houver salvos)
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'promotional-v3',
    name: 'Super Oferta - Alta Conversão',
    description: 'Template promocional com gatilhos de urgência e prova social',
    type: 'promotional',
    subject: '⚡ ÚLTIMAS 24H: Passagem New York Para Belo Horizonte $ 699',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .pulse { animation: pulse 2s infinite; }
          .shadow { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
          
          @media only screen and (max-width: 600px) {
            .mobile-stack { display: block !important; }
            .mobile-text-center { text-align: center !important; }
            .mobile-padding { padding: 15px !important; }
            .mobile-font-large { font-size: 24px !important; }
            .mobile-font-medium { font-size: 18px !important; }
            .mobile-font-small { font-size: 14px !important; }
            .mobile-button { padding: 15px 25px !important; font-size: 16px !important; width: 100% !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 15px !important; }
            .mobile-hide { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          <!-- Header com Urgência -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center;">
            <div style="background: rgba(0,0,0,0.3); margin: -20px -20px 15px -20px; padding: 10px; font-size: 14px; font-weight: 700;" class="mobile-font-small">
              ⏰ ÚLTIMAS 24 HORAS • Promoção termina hoje!
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 900;" class="mobile-font-large">
              ⚡ SUPER OFERTA
            </h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;" class="mobile-font-medium">
              Passagens para New York → Belo Horizonte
            </p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 25px; text-align: center; background: linear-gradient(180deg, #fef3c7, #ffffff);" class="mobile-padding">
            
            <!-- Preço Destaque -->
            <div style="background: white; padding: 20px; border-radius: 15px; margin: 20px 0; border: 3px solid #fbbf24;" class="shadow">
              <div style="color: #dc2626; font-size: 48px; font-weight: 900; margin: 0;" class="mobile-font-large">
                $699
              </div>
              <div style="color: #6b7280; font-size: 16px; text-decoration: line-through;">
                Era $1.200
              </div>
              <div style="color: #374151; font-size: 14px; margin-top: 10px; font-weight: 600;">
                Ida e volta • Taxas incluídas
              </div>
            </div>

            <!-- CTA Principal -->
            <a href="https://www.fly2any.com" 
               style="background: linear-gradient(135deg, #dc2626, #ef4444); 
                      color: white; 
                      padding: 20px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 900; 
                      font-size: 18px; 
                      display: inline-block; 
                      margin: 15px 0;
                      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);" 
               class="mobile-button pulse">
              🚀 GARANTIR PASSAGEM
            </a>

            <!-- Benefícios -->
            <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981; margin: 20px 0;">
              <strong style="color: #065f46;">✅ Incluso no preço:</strong><br>
              • Bagagem de mão e despachada<br>
              • Seguro viagem<br>
              • Suporte 24/7
            </div>
          </div>

          <!-- Prova Social -->
          <div style="padding: 20px; background: #f8fafc;" class="mobile-padding">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;" class="mobile-grid">
              
              <!-- Estatísticas -->
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;" class="shadow mobile-grid-item">
                <div style="color: #dc2626; font-size: 32px; font-weight: 900;" class="mobile-font-large">21</div>
                <div style="color: #6b7280; font-size: 14px; font-weight: 600;">Anos de experiência</div>
              </div>

              <!-- Depoimento -->
              <div style="background: white; padding: 20px; border-radius: 10px;" class="shadow mobile-grid-item">
                <div style="color: #fbbf24; margin-bottom: 8px;">⭐⭐⭐⭐⭐</div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 14px;">
                  "Economizei muito! Atendimento excelente."
                </p>
                <div style="color: #6b7280; font-size: 12px; margin-top: 5px; font-weight: 600;">
                  - Maria S., São Paulo
                </div>
              </div>
            </div>
          </div>

          <!-- Urgência Final -->
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 25px; text-align: center;" class="mobile-padding">
            <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 900;" class="mobile-font-medium">
              ⚡ Últimas 15 vagas disponíveis!
            </h3>
            
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin: 15px 0;">
              <div style="color: #fbbf24; font-size: 24px; font-weight: 900; font-family: monospace;" class="mobile-font-medium">
                23:47:12
              </div>
              <div style="font-size: 12px; opacity: 0.8;">Tempo restante (H:M:S)</div>
            </div>

            <!-- CTA Final -->
            <a href="https://www.fly2any.com" 
               style="background: linear-gradient(135deg, #fbbf24, #f59e0b); 
                      color: #1e293b; 
                      padding: 18px 35px; 
                      text-decoration: none; 
                      border-radius: 20px; 
                      font-weight: 900; 
                      font-size: 16px; 
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);" 
               class="mobile-button pulse">
              🔥 GARANTIR AGORA
            </a>

            <div style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              ✅ Sem taxas extras • 🛡️ Cancelamento 24h • ⚡ Suporte 24/7
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;" class="mobile-padding">
            <div style="margin-bottom: 10px;">
              <strong style="color: white;">Fly2Any Travel</strong><br>
              21 anos conectando você ao mundo
            </div>
            
            <div style="margin: 15px 0;">
              <a href="https://wa.me/1151944717" style="color: #25d366; text-decoration: none; margin: 0 10px;">
                📱 WhatsApp
              </a>
              <a href="mailto:info@fly2any.com" style="color: #60a5fa; text-decoration: none; margin: 0 10px;">
                📧 Email
              </a>
            </div>
            
            <div style="border-top: 1px solid #334155; padding-top: 15px; margin-top: 15px;">
              <a href="{{unsubscribe_url}}" style="color: #64748b; text-decoration: none;">
                Cancelar inscrição
              </a>
            </div>
          </div>

        </div>
      </body>
      </html>`
  }
];

// Variável global para armazenar templates salvos (em produção use banco de dados)
let savedTemplates: EmailTemplate[] | null = null;

// Forçar limpeza do cache - SEMPRE PREMIUM COMPACTO
const CACHE_VERSION = 'PREMIUM-ULTRA-COMPACTO-v4-' + Date.now();

export async function POST(request: NextRequest) {
  try {
    const { templates } = await request.json();
    
    // Salvar templates em memória (em produção use banco de dados)
    savedTemplates = templates;
    
    console.log('✅ Templates salvos:', templates.map((t: any) => ({ id: t.id, subject: t.subject })));
    
    return NextResponse.json({
      success: true,
      message: 'Templates salvos com sucesso',
      templates: templates
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar templates'
    }, { status: 500 });
  }
}

// Endpoint para buscar templates salvos - SEMPRE PREMIUM COMPACTO
export async function GET() {
  try {
    // SEMPRE retornar templates PREMIUM COMPACTOS mais recentes
    console.log('🚀 FORÇANDO templates PREMIUM ULTRA COMPACTOS - Versão:', CACHE_VERSION);
    
    // Forçar cache bust completo
    const timestamp = Date.now();
    const templatesWithTimestamp = DEFAULT_TEMPLATES.map(template => ({
      ...template,
      id: template.id + '-PREMIUM-' + timestamp,
      cacheVersion: CACHE_VERSION,
      forceUpdate: true,
      isPremiumCompact: true
    }));
    
    // Headers para evitar cache
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return NextResponse.json({
      success: true,
      templates: templatesWithTimestamp,
      version: CACHE_VERSION,
      timestamp: new Date().toISOString(),
      message: '✅ Templates PREMIUM COMPACTOS carregados!',
      forceUpdate: true
    }, { headers });
    
  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar templates'
    }, { status: 500 });
  }
}