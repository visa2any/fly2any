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
    subject: '⚡ ÚLTIMAS 24H: Passagem New York Para Belo Horizonte $ 699',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Header com Urgência -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 20px; text-align: center; position: relative;">
            <div style="position: absolute; top: 10px; right: 20px; background: #fbbf24; color: #000; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              ⏰ RESTAM 24H
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">✈️ FLY2ANY</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">21 anos conectando brasileiros ao mundo</p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);">
            <h2 style="color: #dc2626; font-size: 28px; margin: 0 0 10px 0; font-weight: 800;">
              🔥 SUPER OFERTA: NEW YORK ➜ BELO HORIZONTE!
            </h2>
            <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">
              Passagem direta por apenas <span style="color: #dc2626; font-size: 24px;">$699</span>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              ✈️ Voo direto + 🎯 Flexibilidade + 🛡️ Seguro incluído<br><s>Preço normal: $1.299</s> • <strong style="color: #059669;">Economia: $600!</strong>
            </p>
          </div>

          <!-- CTA Principal -->
          <div style="padding: 30px; text-align: center; background: #fafafa;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 4px; border-radius: 12px; display: inline-block; margin-bottom: 15px;">
              <a href="https://fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
                🚀 QUERO ESSA PASSAGEM
              </a>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há 21 anos
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.6;">
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