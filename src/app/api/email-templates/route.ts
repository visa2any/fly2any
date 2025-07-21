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
          .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 12px !important; }
            .mobile-compact { padding: 8px 12px !important; }
            .mobile-font-large { font-size: 22px !important; line-height: 1.2 !important; }
            .mobile-font-medium { font-size: 18px !important; line-height: 1.3 !important; }
            .mobile-font-small { font-size: 14px !important; line-height: 1.4 !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 8px !important; }
            .mobile-button { padding: 12px 20px !important; font-size: 15px !important; }
            .mobile-destinations { font-size: 15px !important; }
            .mobile-price { font-size: 18px !important; }
            .mobile-stack { display: flex !important; flex-direction: column !important; gap: 6px !important; }
            .mobile-hide-spacing { margin: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <!-- Wrapper clicável -->
        <a href="https://www.fly2any.com" style="text-decoration: none; color: inherit; display: block;">
          <div style="width: 100%; background: white; cursor: pointer;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%, #f97316 100%); color: white; padding: 20px 15px; text-align: center;" class="mobile-compact">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);" class="mobile-font-large">✈️ Fly2Any Travel</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.95; font-weight: 500;" class="mobile-font-small">21 anos conectando você ao mundo!</p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 18px 12px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);" class="mobile-compact">
            <h2 style="color: #dc2626; font-size: 26px; margin: 0 0 10px 0; font-weight: 900; text-shadow: 0 1px 2px rgba(0,0,0,0.1);" class="mobile-font-medium">
              🎯 SuperOFERTA!! Passagens
            </h2>
            
            <!-- Lista de Destinos -->
            <div style="background: white; padding: 12px; border-radius: 16px; margin: 8px 0;" class="shadow-premium">
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;" class="mobile-destinations mobile-stack">
                <span>✈️ Miami → Belo Horizonte</span> <span style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</span>
              </div>
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;" class="mobile-destinations mobile-stack">
                <span>✈️ New York → Belo Horizonte</span> <span style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</span>
              </div>
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;" class="mobile-destinations mobile-stack">
                <span>✈️ Newark → Belo Horizonte</span> <span style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</span>
              </div>
              <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;" class="mobile-destinations mobile-stack">
                <span>✈️ Boston → Belo Horizonte</span> <span style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</span>
              </div>
              <div style="font-size: 16px; font-weight: 700; padding: 3px 0; display: flex; justify-content: space-between; align-items: center;" class="mobile-destinations mobile-stack">
                <span>✈️ Orlando → Belo Horizonte</span> <span style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</span>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); padding: 8px 12px; border-radius: 12px; margin: 8px 0; border-left: 4px solid #10b981;">
              <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.4; font-weight: 600;" class="mobile-font-small">
                🎯 <strong>PACOTE COMPLETO:</strong> 🏨 Hotel + 🚗 Carro + 🎢 Passeios + 🛡️ Seguro<br>
                <span style="background: linear-gradient(135deg, #dc2626, #059669); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;"><s>$990</s> → Economia: $300!</span>
              </p>
            </div>
          </div>

          <!-- Depoimento -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 12px 15px; border-radius: 12px; margin: 8px 0; position: relative; overflow: hidden;" class="mobile-compact">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 40px; opacity: 0.1; transform: rotate(15deg);">💬</div>
            <div style="text-align: center; margin-bottom: 6px; font-size: 16px; font-weight: 700;" class="mobile-font-small">
              ⭐⭐⭐⭐⭐ <strong style="color: #dc2626;">Maria Silva</strong> ✓ verificada
            </div>
            <p style="font-style: italic; color: #374151; margin: 0; text-align: center; font-size: 14px; line-height: 1.4; font-weight: 500;" class="mobile-font-small">
              "Economizei $1.400 com o pacote completo! Não precisei me preocupar com NADA. Experiência incrível!"
            </p>
          </div>


          <!-- Depoimento -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 12px 15px; border-radius: 12px; margin: 8px 0; position: relative; overflow: hidden;" class="mobile-compact">
            <div style="position: absolute; top: -10px; right: -10px; font-size: 40px; opacity: 0.1; transform: rotate(15deg);">💬</div>
            <div style="text-align: center; margin-bottom: 6px; font-size: 16px; font-weight: 700;" class="mobile-font-small">
              ⭐⭐⭐⭐⭐ <strong style="color: #dc2626;">Maria Silva</strong> ✓ verificada
            </div>
            <p style="font-style: italic; color: #374151; margin: 0; text-align: center; font-size: 14px; line-height: 1.4; font-weight: 500;" class="mobile-font-small">
              "Economizei $1.400 com o pacote completo! Não precisei me preocupar com NADA. Experiência incrível!"
            </p>
          </div>


          <!-- Por que escolher -->
          <div style="padding: 15px 12px; background: white; text-align: center;" class="mobile-compact">
            <h3 style="color: #dc2626; font-size: 20px; margin: 0 0 12px 0; font-weight: 800;" class="mobile-font-medium">🎯 POR QUE FLY2ANY?</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0;" class="mobile-grid">
              <div class="mobile-grid-item" style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 8px; border-radius: 12px;">
                <div style="font-size: 24px; margin-bottom: 4px;">🎯</div>
                <div style="font-weight: 800; font-size: 12px; color: #dc2626;" class="mobile-font-small">TUDO EM 1</div>
              </div>
              <div class="mobile-grid-item" style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 8px; border-radius: 12px;">
                <div style="font-size: 24px; margin-bottom: 4px;">💰</div>
                <div style="font-weight: 800; font-size: 12px; color: #dc2626;" class="mobile-font-small">ECONOMIA</div>
              </div>
              <div class="mobile-grid-item" style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 8px; border-radius: 12px;">
                <div style="font-size: 24px; margin-bottom: 4px;">🏆</div>
                <div style="font-weight: 800; font-size: 12px; color: #dc2626;" class="mobile-font-small">21 ANOS</div>
              </div>
              <div class="mobile-grid-item" style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 8px; border-radius: 12px;">
                <div style="font-size: 24px; margin-bottom: 4px;">⚡</div>
                <div style="font-weight: 800; font-size: 12px; color: #dc2626;" class="mobile-font-small">24/7</div>
              </div>
            </div>
          </div>

          </div>
        </a>
        
        <!-- CTA Principal (fora do wrapper clicável) -->
        <div style="padding: 20px 15px; text-align: center; background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); width: 100%;" class="mobile-compact">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%, #f97316 100%); padding: 4px; border-radius: 20px; display: inline-block; margin-bottom: 12px; position: relative; overflow: hidden;" class="shadow-premium">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%); animation: shimmer 2s infinite;"></div>
            <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; position: relative; z-index: 1;" class="mobile-button">
              🚀 RESERVAR AGORA
            </a>
          </div>
          <div style="background: linear-gradient(135deg, #fef3c7, #fff7ed); padding: 8px 12px; border-radius: 12px; margin: 8px 0; border: 2px solid #f59e0b;">
            <div style="font-size: 14px; color: #92400e; font-weight: 800;" class="mobile-font-small">
              ⏰ Oferta válida até <span style="color: #dc2626;">amanhã 23:59</span>
            </div>
          </div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 8px; font-weight: 600;" class="mobile-font-small">
            ✅ Sem taxas extras • 🛡️ Cancelamento 24h grátis
          </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: #f3f4f6; padding: 18px 15px; text-align: center; width: 100%; margin-top: 0; position: relative; overflow: hidden;" class="mobile-compact">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(135deg, #dc2626, #f59e0b, #10b981);"></div>
          <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 900; line-height: 1.3; color: #ffffff;" class="mobile-font-small">
            <span style="background: linear-gradient(135deg, #dc2626, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">Fly2Any Travel</span> • 21 anos conectando você ao mundo!
          </p>
          <div style="margin: 12px 0; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;" class="mobile-stack">
            <div style="background: rgba(37, 211, 102, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(37, 211, 102, 0.3);">
              <a href="https://wa.me/1151944717" style="color: #25d366; text-decoration: none; font-weight: 700; font-size: 14px;" class="mobile-font-small">
                📱 WhatsApp
              </a>
            </div>
            <div style="background: rgba(96, 165, 250, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(96, 165, 250, 0.3);">
              <a href="mailto:info@fly2any.com" style="color: #60a5fa; text-decoration: none; font-weight: 700; font-size: 14px;" class="mobile-font-small">
                📧 Email
              </a>
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 12px 0;">
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #d1d5db; line-height: 1.3;">
            <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: none; opacity: 0.7;">⚙️ Cancelar inscrição</a>
          </p>
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