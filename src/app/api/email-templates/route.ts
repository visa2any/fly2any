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
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">✈️ Fly2Any Travel</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Há 21 anos conectando você ao Brasil e o mundo!</p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);">
            <h2 style="color: #dc2626; font-size: 32px; margin: 0 0 20px 0; font-weight: 800;">
              🎯 SuperOFERTA!! Passagens Aéreas
            </h2>
            
            <!-- Lista de Destinos -->
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px 0;">
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
                ✈️ Miami para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
                ✈️ New York para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
                ✈️ Newark para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
              </div>
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">
                ✈️ Boston para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
              </div>
              <div style="font-size: 18px; font-weight: 600;">
                ✈️ Orlando para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
              </div>
            </div>

            <p style="color: #6b7280; font-size: 16px; margin: 20px 0;">
              Também temos 🏨 Hotel + 🚗 Carro + 🎯 Passeios + 🛡️ Seguro Viagem<br>
              <s>Preço Normal: $990</s> • <strong style="color: #059669;">Economia: $300!</strong>
            </p>
          </div>

          <!-- Depoimento -->
          <div style="background: #f8f9fa; padding: 25px; border-left: 4px solid #fbbf24;">
            <div style="text-align: center; margin-bottom: 15px;">
              ⭐⭐⭐⭐⭐ <strong>Maria Silva</strong> cliente verificada
            </div>
            <p style="font-style: italic; color: #374151; margin: 0; text-align: center;">
              "Comprei o pacote completo da Fly2Any Travel: passagem, hotel 4⭐, carro e passeios. Economizei $1.400 e não precisei me preocupar com NADA! Experiência incrível!"
            </p>
          </div>

          <!-- Pacotes Completos -->
          <div style="padding: 30px; background: #fafafa;">
            <h3 style="color: #dc2626; font-size: 24px; text-align: center; margin: 0 0 20px 0;">
              🎯 PACOTES COMPLETOS - TUDO INCLUÍDO
            </h3>
            
            <div style="display: grid; gap: 15px;">
              <!-- Miami -->
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">🏖️ MIAMI COMPLETO</div>
                <div style="font-size: 14px; color: #6b7280; margin: 10px 0;">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 18px; font-weight: bold;">Consulte</div>
                <div style="color: #059669; font-weight: bold;">💰 Economia Garantida</div>
              </div>
              
              <!-- New York -->
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">🗽 NEW YORK COMPLETO</div>
                <div style="font-size: 14px; color: #6b7280; margin: 10px 0;">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 18px; font-weight: bold;">Consulte</div>
                <div style="color: #059669; font-weight: bold;">💰 Economia Garantida</div>
              </div>
              
              <!-- Orlando -->
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 20px; font-weight: bold; color: #dc2626;">🎢 ORLANDO COMPLETO</div>
                <div style="font-size: 14px; color: #6b7280; margin: 10px 0;">Passagem + Hotel 4⭐ + Carro + Seguro + Passeio</div>
                <div style="font-size: 18px; font-weight: bold;">Consulte</div>
                <div style="color: #059669; font-weight: bold;">💰 Economia Garantida!</div>
              </div>
            </div>
          </div>

          <!-- Por que escolher -->
          <div style="padding: 30px; background: white; text-align: center;">
            <h3 style="color: #dc2626; font-size: 20px; margin: 0 0 20px 0;">🎯 POR QUE ESCOLHER NOSSOS PACOTES?</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
              <div>
                <div style="font-size: 32px;">🎯</div>
                <div style="font-weight: bold;">TUDO EM 1 LUGAR</div>
              </div>
              <div>
                <div style="font-size: 32px;">💰</div>
                <div style="font-weight: bold;">ECONOMIA REAL</div>
              </div>
              <div>
                <div style="font-size: 32px;">🏆</div>
                <div style="font-weight: bold;">21 ANOS EXP.</div>
              </div>
              <div>
                <div style="font-size: 32px;">⚡</div>
                <div style="font-weight: bold;">SUPORTE 24/7</div>
              </div>
            </div>
          </div>

          <!-- CTA Principal -->
          <div style="padding: 30px; text-align: center; background: #fafafa;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 4px; border-radius: 12px; display: inline-block; margin-bottom: 15px;">
              <a href="https://fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                🚀 QUERO RESERVAR AGORA
              </a>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 15px;">
              ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">
              ✅ Sem taxa de conveniência • Cancelamento grátis em 24h
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
              Fly2Any Travel • Há 21 anos conectando você ao Brasil e o mundo!
            </p>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">
              📱 <a href="https://wa.me/1151944717" style="color: #25d366; text-decoration: none;">WhatsApp: wa.me/1151944717</a> • 📧 info@fly2any.com
            </p>
            <p style="margin: 15px 0 0 0; font-size: 11px; opacity: 0.7;">
              <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
            </p>
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