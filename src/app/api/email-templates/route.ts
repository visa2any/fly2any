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
    id: 'promotional',
    name: 'Super Oferta - Alta Conversão',
    description: 'Template promocional com gatilhos de urgência e prova social',
    type: 'promotional',
    subject: '🎯 SuperOFERTA!! Passagens Aéreas a partir de $699 - Fly2Any Travel',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          .gradient-text { background: linear-gradient(135deg, #dc2626, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
          .shadow-premium { box-shadow: 0 10px 40px rgba(220, 38, 38, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1); }
          .pulse { animation: pulse 2s infinite; }
          .floating { animation: float 3s ease-in-out infinite; }
          .zigzag { background-image: zigzag-pattern; }
          .limited-badge { position: relative; overflow: hidden; }
          .limited-badge::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shine 2s infinite; }
          .urgency-timer { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 800; display: inline-block; position: relative; }
          .scarcity-bar { height: 8px; background: #fee2e2; border-radius: 4px; overflow: hidden; }
          .scarcity-fill { height: 100%; background: linear-gradient(135deg, #dc2626, #ef4444); width: 23%; border-radius: 4px; }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
          @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 8px !important; }
            .mobile-compact { padding: 6px 8px !important; }
            .mobile-font-large { font-size: 20px !important; line-height: 1.1 !important; }
            .mobile-font-medium { font-size: 16px !important; line-height: 1.2 !important; }
            .mobile-font-small { font-size: 13px !important; line-height: 1.3 !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 6px !important; }
            .mobile-button { padding: 10px 16px !important; font-size: 14px !important; }
            .mobile-destinations { font-size: 13px !important; }
            .mobile-price { font-size: 16px !important; }
            .mobile-stack { display: flex !important; flex-direction: column !important; gap: 4px !important; }
            .mobile-two-col { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 6px !important; }
            .mobile-three-col { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 4px !important; }
            .mobile-ultra-compact { padding: 4px 6px !important; margin: 2px 0 !important; }
            .logo-responsive { max-width: 180px !important; height: auto !important; }
            .logo-mobile { max-width: 140px !important; height: auto !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <!-- Wrapper clicável -->
        <a href="https://www.fly2any.com" style="text-decoration: none; color: inherit; display: block;">
          <div style="width: 100%; background: white; cursor: pointer;">
          
          <!-- Header Ultra Compacto com Logo -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 12px 15px; text-align: center; position: relative;" class="mobile-compact">
            <!-- Urgência integrada -->
            <div style="background: rgba(0,0,0,0.4); margin: -12px -15px 8px -15px; padding: 6px; font-size: 13px; font-weight: 800;" class="mobile-font-small">
              ⏰ ÚLTIMAS 23 VAGAS • Expira 18h47min • 🔥 HISTÓRICO!
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;" class="mobile-stack">
              <div style="display: flex; align-items: center; gap: 8px;">
                <!-- Logo Fly2Any -->
                <img src="/mnt/c/Users/Power/Downloads/Fly2AnyLogo.png" alt="Fly2Any Travel" style="max-width: 200px; height: 45px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" class="logo-responsive logo-mobile" />
                <div style="text-align: left;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.95; font-weight: 600; line-height: 1.2;" class="mobile-font-small">🏆 21 anos conectando você ao mundo<br>50K+ clientes satisfeitos</p>
                </div>
              </div>
              <div style="text-align: right; font-size: 18px; font-weight: 900; background: rgba(251,191,36,0.2); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(251,191,36,0.5);" class="mobile-font-medium">
                <div style="color: #fbbf24; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">$699</div>
                <div style="font-size: 11px; opacity: 0.8; color: rgba(255,255,255,0.9);">A partir de</div>
              </div>
            </div>
          </div>

          <!-- Oferta Principal Horizontal -->
          <div style="padding: 10px 12px; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);" class="mobile-compact">
            <!-- Header + Escassez em linha -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" class="mobile-stack">
              <div>
                <h2 style="color: #dc2626; font-size: 22px; margin: 0; font-weight: 900;" class="mobile-font-medium">🎯 SuperOFERTA</h2>
                <div style="font-size: 11px; color: #dc2626; font-weight: 700;">⚡ 23/100 vagas restantes</div>
              </div>
              <div class="limited-badge" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 4px 8px; border-radius: 15px; font-size: 10px; font-weight: 900;">
                🔥 LIMITADO
              </div>
            </div>
            
            <!-- Barra de progresso compacta -->
            <div class="scarcity-bar" style="margin: 6px 0;">
              <div class="scarcity-fill"></div>
            </div>
            
            <!-- Destinos em Grid Horizontal Compacto -->
            <div style="background: white; padding: 10px; border-radius: 12px; margin: 8px 0; border: 2px solid #fbbf24;" class="shadow-premium">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 4px; border-radius: 6px; margin: -10px -10px 8px -10px; text-align: center; font-weight: 900; font-size: 12px;">
                💰 PREÇOS HISTÓRICOS
              </div>
              
              <!-- Grid 3 destinos em linha -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;" class="mobile-grid">
                <div style="text-align: center; padding: 6px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 6px;" class="mobile-grid-item mobile-ultra-compact">
                  <div style="font-size: 13px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ Miami</div>
                  <div style="color: #dc2626; font-size: 18px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                  <div style="font-size: 9px; color: #6b7280; text-decoration: line-through;">era $990</div>
                </div>
                
                <div style="text-align: center; padding: 6px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 6px;" class="mobile-grid-item mobile-ultra-compact">
                  <div style="font-size: 13px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ NY</div>
                  <div style="color: #dc2626; font-size: 18px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                  <div style="font-size: 9px; color: #6b7280; text-decoration: line-through;">era $950</div>
                </div>
                
                <div style="text-align: center; padding: 6px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 6px;" class="mobile-grid-item mobile-ultra-compact">
                  <div style="font-size: 13px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ Orlando</div>
                  <div style="color: #dc2626; font-size: 18px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                  <div style="font-size: 9px; color: #6b7280; text-decoration: line-through;">era $980</div>
                </div>
              </div>
              
              <div style="text-align: center; font-size: 10px; color: #6b7280; margin-top: 6px; font-weight: 600;">
                Ida e volta • Taxas incluídas • Todos para Belo Horizonte
              </div>
            </div>
            
            <!-- CTA + Bônus em linha -->
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin: 8px 0;" class="mobile-stack">
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 16px; flex: 1; text-align: center;" class="mobile-button pulse">
                🚀 GARANTIR AGORA
              </a>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); padding: 6px 8px; border-radius: 8px; border-left: 3px solid #10b981; font-size: 12px; margin: 6px 0;" class="mobile-font-small">
              🎁 <strong>BÔNUS:</strong> Hotel 4⭐ + Carro + Passeios + Seguro + Transfer • <span style="color: #dc2626; font-weight: 800;">Economize $500 extra!</span>
            </div>
          </div>

          <!-- Prova Social Ultra Compacta -->
          <div style="padding: 8px 12px; background: linear-gradient(135deg, #f8fafc, #e2e8f0);" class="mobile-compact">
            <!-- Estatísticas + Depoimentos em linha -->
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; align-items: center;" class="mobile-grid">
              <!-- Stats compactas -->
              <div style="background: white; padding: 8px; border-radius: 8px; text-align: center;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 16px; font-weight: 900; color: #dc2626; margin-bottom: 2px;" class="mobile-font-medium">50K+</div>
                <div style="font-size: 9px; color: #6b7280; font-weight: 700; line-height: 1.2;">Clientes • 21 anos • 98% satisfação</div>
              </div>
              
              <!-- Depoimento condensado -->
              <div style="background: white; padding: 8px; border-radius: 8px; border-left: 3px solid #fbbf24;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 12px; font-weight: 700; color: #dc2626; margin-bottom: 2px;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Maria S. • São Paulo ✓
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 11px; line-height: 1.2; font-weight: 500;" class="mobile-font-small">
                  "Economizei $1.400! Atendimento perfeito. 21 anos de experiência fazem diferença!"
                </p>
              </div>
            </div>
          </div>


          <!-- Prova Social Ultra Compacta -->
          <div style="padding: 8px 12px; background: linear-gradient(135deg, #f8fafc, #e2e8f0);" class="mobile-compact">
            <!-- Estatísticas + Depoimentos em linha -->
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; align-items: center;" class="mobile-grid">
              <!-- Stats compactas -->
              <div style="background: white; padding: 8px; border-radius: 8px; text-align: center;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 16px; font-weight: 900; color: #dc2626; margin-bottom: 2px;" class="mobile-font-medium">50K+</div>
                <div style="font-size: 9px; color: #6b7280; font-weight: 700; line-height: 1.2;">Clientes • 21 anos • 98% satisfação</div>
              </div>
              
              <!-- Depoimento condensado -->
              <div style="background: white; padding: 8px; border-radius: 8px; border-left: 3px solid #fbbf24;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 12px; font-weight: 700; color: #dc2626; margin-bottom: 2px;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Maria S. • São Paulo ✓
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 11px; line-height: 1.2; font-weight: 500;" class="mobile-font-small">
                  "Economizei $1.400! Atendimento perfeito. 21 anos de experiência fazem diferença!"
                </p>
              </div>
            </div>
          </div>


          <!-- Pacotes VIP Horizontal Compacto -->
          <div style="padding: 10px 12px; background: linear-gradient(135deg, #1e293b, #334155); color: white;" class="mobile-compact">
            <!-- Header + CTA em linha -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" class="mobile-stack">
              <h3 style="color: #fbbf24; font-size: 18px; margin: 0; font-weight: 900;" class="mobile-font-medium">
                🎆 PACOTES VIP
              </h3>
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b; padding: 8px 16px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 12px;" class="mobile-button">
                VER TODOS
              </a>
            </div>
            
            <!-- Pacotes em linha -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 8px 0;" class="mobile-grid">
              <!-- Miami VIP -->
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); padding: 8px; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); text-align: center; position: relative;" class="mobile-grid-item mobile-ultra-compact">
                <div style="position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; font-weight: 800;">TOP</div>
                <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; color: #fbbf24;" class="mobile-font-small">🏖️ MIAMI</div>
                <div style="font-size: 9px; color: rgba(255,255,255,0.8); margin: 2px 0; line-height: 1.2;" class="mobile-font-small">Hotel 5⭐ + Luxo</div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2px 4px; border-radius: 10px; font-size: 8px; font-weight: 700; margin-top: 4px;">💰 $800 OFF</div>
              </div>
              
              <!-- Orlando VIP -->
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); padding: 8px; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); text-align: center; position: relative;" class="mobile-grid-item mobile-ultra-compact">
                <div style="position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; font-weight: 800;">VIP</div>
                <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; color: #fbbf24;" class="mobile-font-small">🎢 ORLANDO</div>
                <div style="font-size: 9px; color: rgba(255,255,255,0.8); margin: 2px 0; line-height: 1.2;" class="mobile-font-small">Resort + Disney</div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2px 4px; border-radius: 10px; font-size: 8px; font-weight: 700; margin-top: 4px;">💰 $700 OFF</div>
              </div>
              
              <!-- NY VIP -->
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); padding: 8px; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); text-align: center; position: relative;" class="mobile-grid-item mobile-ultra-compact">
                <div style="position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; padding: 2px 4px; border-radius: 8px; font-size: 8px; font-weight: 800;">NEW</div>
                <div style="font-size: 14px; font-weight: 900; margin-bottom: 4px; color: #fbbf24;" class="mobile-font-small">🗽 NY</div>
                <div style="font-size: 9px; color: rgba(255,255,255,0.8); margin: 2px 0; line-height: 1.2;" class="mobile-font-small">Manhattan + VIP</div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2px 4px; border-radius: 10px; font-size: 8px; font-weight: 700; margin-top: 4px;">💰 $600 OFF</div>
              </div>
            </div>
            
            <!-- Vantagens condensadas -->
            <div style="background: rgba(251, 191, 36, 0.1); padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); font-size: 10px; text-align: center;">
              🏆 <strong>EXCLUSIVO:</strong> Atendimento 24/7 • Seguro Premium • Cancelamento Flexível • Suporte Destino
            </div>
          </div>

          </div>
        </a>
        
        <!-- Seção Final Ultra Compacta -->
        <div style="padding: 12px 15px; text-align: center; background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%); width: 100%; color: white;" class="mobile-compact">
          <!-- Urgência + Timer em linha -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #fbbf24;" class="mobile-stack">
            <div>
              <div style="font-size: 14px; font-weight: 900;" class="mobile-font-small">⚡ ÚLTIMAS 23 VAGAS!</div>
              <div style="font-size: 10px; color: #fbbf24; font-weight: 600;">Expira hoje às 23:59</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; color: #fbbf24; font-family: monospace;" class="mobile-font-medium">18:47:23</div>
              <div style="font-size: 8px; color: rgba(255,255,255,0.8);">H:M:S</div>
            </div>
          </div>
          
          <!-- CTA + Garantias em linha -->
          <div style="display: flex; gap: 8px; align-items: center; margin: 10px 0;" class="mobile-stack">
            <!-- CTA Principal -->
            <div style="flex: 2;">
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b; padding: 14px 20px; text-decoration: none; border-radius: 18px; font-weight: 900; font-size: 16px; display: block; text-align: center; box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);" class="mobile-button pulse">
                🚀 GARANTIR AGORA
              </a>
            </div>
            
            <!-- Garantias compactas -->
            <div style="flex: 1; font-size: 9px; line-height: 1.2; color: rgba(255,255,255,0.9);" class="mobile-font-small">
              ✅ Sem taxas<br>
              🛡️ Cancel. 24h<br>
              🏆 21 anos exp.<br>
              ⚡ Suporte 24/7
            </div>
          </div>
        </div>

        <!-- Footer Ultra Compacto com Logo -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f1f5f9; padding: 12px 15px; text-align: center; width: 100%; margin-top: 0; position: relative;" class="mobile-compact">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(135deg, #dc2626, #fbbf24, #10b981);"></div>
          
          <!-- Logo + Contatos em linha -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" class="mobile-stack">
            <!-- Logo compacto no footer -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <img src="/mnt/c/Users/Power/Downloads/Fly2AnyLogo.png" alt="Fly2Any Travel" style="max-width: 120px; height: 28px; object-fit: contain; opacity: 0.9;" class="logo-responsive" />
              <div style="text-align: left;">
                <div style="font-size: 9px; color: #64748b; font-weight: 600; line-height: 1.2;">21 anos • 50K+ clientes • IATA</div>
              </div>
            </div>
            
            <!-- Contatos horizontais -->
            <div style="display: flex; gap: 6px;" class="mobile-stack">
              <a href="https://wa.me/1151944717" style="background: rgba(37, 211, 102, 0.2); color: #25d366; padding: 6px 8px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px;" class="mobile-font-small">
                📱
              </a>
              <a href="mailto:info@fly2any.com" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa; padding: 6px 8px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px;" class="mobile-font-small">
                📧
              </a>
              <a href="tel:+551151944717" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 6px 8px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px;" class="mobile-font-small">
                📞
              </a>
            </div>
          </div>
          
          <!-- Certificações + Links em linha -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;" class="mobile-stack">
            <div>
              🛡️ SSL • 🏆 ISO • ✅ PCI • 🎨 IATA
            </div>
            <div>
              <a href="{{unsubscribe_url}}" style="color: #94a3b8; text-decoration: none;">⚙️ Sair</a> •
              <a href="#" style="color: #94a3b8; text-decoration: none;">Termos</a>
            </div>
          </div>
        </div>
      </body>
      </html>`
  }
];

// Variável global para armazenar templates salvos (em produção use banco de dados)
let savedTemplates: EmailTemplate[] | null = null;

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

// Endpoint para buscar templates salvos
export async function GET() {
  try {
    // Se há templates salvos, retornar eles
    if (savedTemplates && savedTemplates.length > 0) {
      console.log('✅ Retornando templates salvos:', savedTemplates.map(t => ({ id: t.id, subject: t.subject })));
      return NextResponse.json({
        success: true,
        templates: savedTemplates
      });
    }
    
    // Senão, retornar templates padrão
    console.log('📝 Retornando templates padrão');
    return NextResponse.json({
      success: true,
      templates: DEFAULT_TEMPLATES
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar templates'
    }, { status: 500 });
  }
}