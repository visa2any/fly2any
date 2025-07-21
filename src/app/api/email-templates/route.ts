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
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 15px !important; }
            .mobile-font-large { font-size: 24px !important; }
            .mobile-font-medium { font-size: 20px !important; }
            .mobile-font-small { font-size: 16px !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 15px !important; }
            .mobile-button { padding: 15px 25px !important; font-size: 16px !important; }
            .mobile-destinations { font-size: 16px !important; }
            .mobile-price { font-size: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <!-- Wrapper clicável -->
        <a href="https://www.fly2any.com" style="text-decoration: none; color: inherit; display: block;">
          <div style="width: 100%; background: white; cursor: pointer;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px 20px; text-align: center;" class="mobile-padding">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;" class="mobile-font-large">✈️ Fly2Any Travel</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;" class="mobile-font-small">Há 21 anos conectando você ao Brasil e o mundo!</p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 40px 20px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);" class="mobile-padding">
            <h2 style="color: #dc2626; font-size: 36px; margin: 0 0 25px 0; font-weight: 800;" class="mobile-font-medium">
              🎯 SuperOFERTA!! Passagens Aéreas
            </h2>
            
            <!-- Lista de Destinos -->
            <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); margin: 25px 0;">
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 18px; padding: 10px 0; border-bottom: 1px solid #f3f4f6;" class="mobile-destinations">
                ✈️ Miami → Belo Horizonte <span style="color: #dc2626; font-size: 26px; font-weight: 800;" class="mobile-price">$699</span>
              </div>
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 18px; padding: 10px 0; border-bottom: 1px solid #f3f4f6;" class="mobile-destinations">
                ✈️ New York → Belo Horizonte <span style="color: #dc2626; font-size: 26px; font-weight: 800;" class="mobile-price">$699</span>
              </div>
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 18px; padding: 10px 0; border-bottom: 1px solid #f3f4f6;" class="mobile-destinations">
                ✈️ Newark → Belo Horizonte <span style="color: #dc2626; font-size: 26px; font-weight: 800;" class="mobile-price">$699</span>
              </div>
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 18px; padding: 10px 0; border-bottom: 1px solid #f3f4f6;" class="mobile-destinations">
                ✈️ Boston → Belo Horizonte <span style="color: #dc2626; font-size: 26px; font-weight: 800;" class="mobile-price">$699</span>
              </div>
              <div style="font-size: 20px; font-weight: 600; padding: 10px 0;" class="mobile-destinations">
                ✈️ Orlando → Belo Horizonte <span style="color: #dc2626; font-size: 26px; font-weight: 800;" class="mobile-price">$699</span>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 18px; margin: 25px 0; line-height: 1.6;" class="mobile-font-small">
              Também temos 🏨 Hotel + 🚗 Carro + 🎯 Passeios + 🛡️ Seguro Viagem<br>
              <s>Preço Normal: $990</s> • <strong style="color: #059669;">Economia: $300!</strong>
            </p>
          </div>

          <!-- Depoimento -->
          <div style="background: #f8f9fa; padding: 30px 20px; border-left: 6px solid #fbbf24;" class="mobile-padding">
            <div style="text-align: center; margin-bottom: 18px; font-size: 18px;" class="mobile-font-small">
              ⭐⭐⭐⭐⭐ <strong>Maria Silva</strong> cliente verificada
            </div>
            <p style="font-style: italic; color: #374151; margin: 0; text-align: center; font-size: 16px; line-height: 1.5;" class="mobile-font-small">
              "Comprei o pacote completo da Fly2Any Travel: passagem, hotel 4⭐, carro e passeios. Economizei $1.400 e não precisei me preocupar com NADA! Experiência incrível!"
            </p>
          </div>

          <!-- Pacotes Completos -->
          <div style="padding: 40px 20px; background: #fafafa;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 28px; text-align: center; margin: 0 0 30px 0; font-weight: 800;" class="mobile-font-medium">
              🎯 PACOTES COMPLETOS - TUDO INCLUÍDO
            </h3>
            
            <div style="display: grid; gap: 20px;" class="mobile-grid">
              <!-- Miami -->
              <div style="background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.2s;" class="mobile-grid-item">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px;" class="mobile-font-medium">🏖️ MIAMI COMPLETO</div>
                <div style="font-size: 16px; color: #6b7280; margin: 15px 0; line-height: 1.4;" class="mobile-font-small">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">Consulte</div>
                <div style="color: #059669; font-weight: bold; font-size: 16px;">💰 Economia Garantida</div>
              </div>
              
              <!-- New York -->
              <div style="background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.2s;" class="mobile-grid-item">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px;" class="mobile-font-medium">🗽 NEW YORK COMPLETO</div>
                <div style="font-size: 16px; color: #6b7280; margin: 15px 0; line-height: 1.4;" class="mobile-font-small">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">Consulte</div>
                <div style="color: #059669; font-weight: bold; font-size: 16px;">💰 Economia Garantida</div>
              </div>
              
              <!-- Orlando -->
              <div style="background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.2s;" class="mobile-grid-item">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px;" class="mobile-font-medium">🎢 ORLANDO COMPLETO</div>
                <div style="font-size: 16px; color: #6b7280; margin: 15px 0; line-height: 1.4;" class="mobile-font-small">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 20px; font-weight: bold; margin: 10px 0;">Consulte</div>
                <div style="color: #059669; font-weight: bold; font-size: 16px;">💰 Economia Garantida!</div>
              </div>
            </div>
          </div>

          <!-- Por que escolher -->
          <div style="padding: 40px 20px; background: white; text-align: center;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 24px; margin: 0 0 30px 0; font-weight: 700;" class="mobile-font-medium">🎯 POR QUE ESCOLHER NOSSOS PACOTES?</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin: 30px 0;" class="mobile-grid">
              <div class="mobile-grid-item">
                <div style="font-size: 40px; margin-bottom: 10px;">🎯</div>
                <div style="font-weight: bold; font-size: 16px;" class="mobile-font-small">TUDO EM 1 LUGAR</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 40px; margin-bottom: 10px;">💰</div>
                <div style="font-weight: bold; font-size: 16px;" class="mobile-font-small">ECONOMIA REAL</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
                <div style="font-weight: bold; font-size: 16px;" class="mobile-font-small">21 ANOS EXP.</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 40px; margin-bottom: 10px;">⚡</div>
                <div style="font-weight: bold; font-size: 16px;" class="mobile-font-small">SUPORTE 24/7</div>
              </div>
            </div>
          </div>

          </div>
        </a>
        
        <!-- CTA Principal (fora do wrapper clicável) -->
        <div style="padding: 40px 20px; text-align: center; background: #fafafa; width: 100%;" class="mobile-padding">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 6px; border-radius: 15px; display: inline-block; margin-bottom: 20px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
            <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 25px 50px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 22px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s;" class="mobile-button">
              🚀 QUERO RESERVAR AGORA
            </a>
          </div>
          <div style="font-size: 16px; color: #6b7280; margin-top: 20px; font-weight: 600;" class="mobile-font-small">
            ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
          </div>
          <div style="font-size: 14px; color: #6b7280; margin-top: 15px;" class="mobile-font-small">
            ✅ Sem taxa de conveniência • Cancelamento grátis em 24h
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #374151; color: white; padding: 30px 20px; text-align: center; width: 100%;" class="mobile-padding">
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold;" class="mobile-font-small">
            Fly2Any Travel • Há 21 anos conectando você ao Brasil e o mundo!
          </p>
          <p style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;" class="mobile-font-small">
            📱 <a href="https://wa.me/1151944717" style="color: #25d366; text-decoration: none; font-weight: 600;">WhatsApp: wa.me/1151944717</a>
          </p>
          <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;" class="mobile-font-small">
            📧 <a href="mailto:info@fly2any.com" style="color: #60a5fa; text-decoration: none;">info@fly2any.com</a>
          </p>
          <p style="margin: 20px 0 0 0; font-size: 12px; opacity: 0.7;">
            <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
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