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
    id: 'promotional-v4',
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
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .pulse { animation: pulse 2s infinite; }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 15px !important; }
            .mobile-font-large { font-size: 22px !important; }
            .mobile-font-medium { font-size: 16px !important; }
            .mobile-font-small { font-size: 14px !important; }
            .mobile-button { padding: 15px 20px !important; font-size: 16px !important; width: 100% !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 12px !important; }
            .mobile-logo { max-width: 150px !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center;">
            <!-- Logo -->
            <div style="margin-bottom: 15px;">
              <img src="/mnt/c/Users/Power/Downloads/Fly2AnyLogo.png" alt="Fly2Any Travel" style="max-width: 180px; height: auto;" class="mobile-logo" />
            </div>
            
            <h1 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 900;" class="mobile-font-large">
              ✈️ Fly2Any Travel
            </h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;" class="mobile-font-small">
              Há 21 anos conectando você ao Brasil e o mundo!
            </p>
          </div>

          <!-- Oferta Principal -->
          <div style="padding: 20px; background: #f8fafc;" class="mobile-padding">
            <h2 style="color: #dc2626; font-size: 26px; font-weight: 900; text-align: center; margin: 0 0 20px 0;" class="mobile-font-large">
              🎯 SuperOFERTA!! Passagens Aéreas
            </h2>
            
            <!-- Lista de Destinos -->
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 15px 0; border: 2px solid #dc2626;">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">✈️ Miami para Belo Horizonte</span>
                  <span style="font-weight: 900; color: #dc2626; font-size: 18px;">$ 699</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">✈️ New York para Belo Horizonte</span>
                  <span style="font-weight: 900; color: #dc2626; font-size: 18px;">$ 699</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">✈️ Newark para Belo Horizonte</span>
                  <span style="font-weight: 900; color: #dc2626; font-size: 18px;">$ 699</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">✈️ Boston para Belo Horizonte</span>
                  <span style="font-weight: 900; color: #dc2626; font-size: 18px;">$ 699</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                  <span style="font-weight: 600; color: #374151;">✈️ Orlando para Belo Horizonte</span>
                  <span style="font-weight: 900; color: #dc2626; font-size: 18px;">$ 699</span>
                </div>
              </div>
            </div>

            <!-- Serviços Extras -->
            <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981; margin: 15px 0;">
              <p style="margin: 0 0 8px 0; font-weight: 700; color: #065f46;">
                Também temos 🏨 Hotel + 🚗 Carro + 🎯 Passeios + 🛡️ Seguro Viagem
              </p>
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Preço Normal: $ 990 • <span style="color: #dc2626; font-weight: 700;">Economia: $ 300!</span>
              </p>
            </div>
          </div>

          <!-- Depoimento -->
          <div style="padding: 20px; background: white;" class="mobile-padding">
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24;">
              <div style="margin-bottom: 10px;">
                <span style="color: #fbbf24;">⭐⭐⭐⭐⭐</span>
                <strong style="color: #dc2626; margin-left: 8px;">Maria Silva</strong>
                <span style="color: #6b7280; font-size: 12px;">cliente verificada</span>
              </div>
              <p style="font-style: italic; color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">
                "Comprei o pacote completo da Fly2Any Travel: passagem, hotel 4⭐, carro e passeios. Economizei $1.400 e não precisei me preocupar com NADA! Experiência incrível!"
              </p>
            </div>
          </div>

          <!-- Pacotes Completos -->
          <div style="padding: 20px; background: #f8fafc;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 20px; font-weight: 900; text-align: center; margin: 0 0 20px 0;" class="mobile-font-medium">
              🎯 PACOTES COMPLETOS - TUDO INCLUÍDO
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;" class="mobile-grid">
              <!-- Miami -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🏖️</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">MIAMI COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida
                </div>
              </div>

              <!-- New York -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🗽</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">NEW YORK COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida
                </div>
              </div>

              <!-- Orlando -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🎢</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">ORLANDO COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida!
                </div>
              </div>
            </div>
          </div>

          <!-- Por que escolher -->
          <div style="padding: 20px; background: white;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 18px; font-weight: 900; text-align: center; margin: 0 0 15px 0;" class="mobile-font-medium">
              🎯 POR QUE ESCOLHER NOSSOS PACOTES?
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; text-align: center;" class="mobile-grid">
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">🎯</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">TUDO EM 1 LUGAR</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">💰</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">ECONOMIA REAL</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">🏆</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">21 ANOS EXP.</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">⚡</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">SUPORTE 24/7</div>
              </div>
            </div>
          </div>

          <!-- CTA Principal -->
          <div style="padding: 25px; text-align: center; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white;" class="mobile-padding">
            <a href="https://www.fly2any.com" 
               style="background: linear-gradient(135deg, #fbbf24, #f59e0b); 
                      color: #1e293b; 
                      padding: 20px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 900; 
                      font-size: 18px; 
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);" 
               class="mobile-button pulse">
              🚀 QUERO RESERVAR AGORA
            </a>
            
            <div style="margin-top: 15px; font-size: 12px;">
              ⏰ Oferta válida até amanhã às 23:59
            </div>
            <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
              ✅ Sem taxa de conveniência • Cancelamento grátis em 24h
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;" class="mobile-padding">
            <div style="margin-bottom: 15px;">
              <strong style="color: white;">Fly2Any Travel</strong><br>
              Há 21 anos conectando você ao Brasil e o mundo!
            </div>
            
            <div style="margin: 15px 0;">
              <a href="https://wa.me/551151944717" style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-weight: 700; display: inline-block; margin: 5px;">
                📱 WhatsApp
              </a>
            </div>
            <div>
              <a href="mailto:info@fly2any.com" style="background: #60a5fa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-weight: 700; display: inline-block; margin: 5px;">
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
  },
  {
    id: 'super-oferta-novo',
    name: 'Super Oferta - Novo Template',
    description: 'Template promocional com informações exatas solicitadas',
    type: 'promotional',
    subject: '⚡ ÚLTIMAS 24H: Passagem New York Para Belo Horizonte $ 699',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .pulse { animation: pulse 2s infinite; }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 15px !important; }
            .mobile-font-large { font-size: 22px !important; }
            .mobile-font-medium { font-size: 16px !important; }
            .mobile-font-small { font-size: 14px !important; }
            .mobile-button { padding: 15px 20px !important; font-size: 16px !important; width: 100% !important; }
            .mobile-grid { display: block !important; }
            .mobile-grid-item { margin-bottom: 12px !important; }
            .mobile-logo { max-width: 150px !important; }
            .mobile-flex { flex-direction: column !important; }
            .mobile-price { font-size: 16px !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center;">
            <!-- Logo -->
            <div style="margin-bottom: 15px;">
              <img src="/mnt/c/Users/Power/Downloads/Fly2AnyLogo.png" alt="Fly2Any Travel" style="max-width: 180px; height: auto;" class="mobile-logo" />
            </div>
            
            <h1 style="margin: 0 0 5px 0; font-size: 24px; font-weight: 900;" class="mobile-font-large">
              ✈️ Fly2Any Travel
            </h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;" class="mobile-font-small">
              Há 21 anos conectando você ao Brasil e o mundo!
            </p>
          </div>

          <!-- SuperOFERTA -->
          <div style="padding: 20px; background: #f8fafc;" class="mobile-padding">
            <h2 style="color: #dc2626; font-size: 26px; font-weight: 900; text-align: center; margin: 0 0 20px 0;" class="mobile-font-large">
              🎯 SuperOFERTA!! Passagens Aéreas
            </h2>
            
            <!-- Lista de Destinos -->
            <div style="background: white; padding: 20px; border-radius: 12px; margin: 15px 0; border: 2px solid #dc2626;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;" class="mobile-flex">
                <span style="font-weight: 600; color: #374151;">✈️ Miami para Belo Horizonte</span>
                <span style="font-weight: 900; color: #dc2626; font-size: 18px;" class="mobile-price">$ 699</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;" class="mobile-flex">
                <span style="font-weight: 600; color: #374151;">✈️ New York para Belo Horizonte</span>
                <span style="font-weight: 900; color: #dc2626; font-size: 18px;" class="mobile-price">$ 699</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;" class="mobile-flex">
                <span style="font-weight: 600; color: #374151;">✈️ Newark para Belo Horizonte</span>
                <span style="font-weight: 900; color: #dc2626; font-size: 18px;" class="mobile-price">$ 699</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;" class="mobile-flex">
                <span style="font-weight: 600; color: #374151;">✈️ Boston para Belo Horizonte</span>
                <span style="font-weight: 900; color: #dc2626; font-size: 18px;" class="mobile-price">$ 699</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;" class="mobile-flex">
                <span style="font-weight: 600; color: #374151;">✈️ Orlando para Belo Horizonte</span>
                <span style="font-weight: 900; color: #dc2626; font-size: 18px;" class="mobile-price">$ 699</span>
              </div>
            </div>

            <!-- Serviços Extras -->
            <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981; margin: 15px 0;">
              <p style="margin: 0 0 8px 0; font-weight: 700; color: #065f46;">
                Também temos 🏨 Hotel + 🚗 Carro + 🎯 Passeios + 🛡️ Seguro Viagem
              </p>
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Preço Normal: $ 990 • <span style="color: #dc2626; font-weight: 700;">Economia: $ 300!</span>
              </p>
            </div>
          </div>

          <!-- Depoimento -->
          <div style="padding: 20px; background: white;" class="mobile-padding">
            <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24;">
              <div style="margin-bottom: 10px;">
                <span style="color: #fbbf24;">⭐⭐⭐⭐⭐</span>
                <strong style="color: #dc2626; margin-left: 8px;">Maria Silva</strong>
                <span style="color: #6b7280; font-size: 12px; margin-left: 5px;">cliente verificada</span>
              </div>
              <p style="font-style: italic; color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">
                "Comprei o pacote completo da Fly2Any Travel: passagem, hotel 4⭐, carro e passeios. Economizei $1.400 e não precisei me preocupar com NADA! Experiência incrível!"
              </p>
            </div>
          </div>

          <!-- Pacotes Completos -->
          <div style="padding: 20px; background: #f8fafc;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 20px; font-weight: 900; text-align: center; margin: 0 0 20px 0;" class="mobile-font-medium">
              🎯 PACOTES COMPLETOS - TUDO INCLUÍDO
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;" class="mobile-grid">
              <!-- Miami -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🏖️</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">MIAMI COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida
                </div>
              </div>

              <!-- New York -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🗽</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">NEW YORK COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida
                </div>
              </div>

              <!-- Orlando -->
              <div style="background: white; padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #fbbf24;" class="mobile-grid-item">
                <div style="font-size: 18px; margin-bottom: 8px;">🎢</div>
                <h4 style="color: #dc2626; font-size: 16px; font-weight: 900; margin: 0 0 8px 0;" class="mobile-font-small">ORLANDO COMPLETO</h4>
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4;">
                  Passagem + Hotel 4⭐ + Carro + Seguro + Passeio
                </p>
                <div style="color: #dc2626; font-weight: 700; margin: 5px 0;">Consulte</div>
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700;">
                  💰 Economia Garantida!
                </div>
              </div>
            </div>
          </div>

          <!-- Por que escolher -->
          <div style="padding: 20px; background: white;" class="mobile-padding">
            <h3 style="color: #dc2626; font-size: 18px; font-weight: 900; text-align: center; margin: 0 0 15px 0;" class="mobile-font-medium">
              🎯 POR QUE ESCOLHER NOSSOS PACOTES?
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; text-align: center;" class="mobile-grid">
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">🎯</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">TUDO EM 1 LUGAR</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">💰</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">ECONOMIA REAL</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">🏆</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">21 ANOS EXP.</div>
              </div>
              <div class="mobile-grid-item">
                <div style="font-size: 24px; margin-bottom: 5px;">⚡</div>
                <div style="font-size: 12px; font-weight: 700; color: #374151;">SUPORTE 24/7</div>
              </div>
            </div>
          </div>

          <!-- CTA Principal -->
          <div style="padding: 25px; text-align: center; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white;" class="mobile-padding">
            <a href="https://www.fly2any.com" 
               style="background: linear-gradient(135deg, #fbbf24, #f59e0b); 
                      color: #1e293b; 
                      padding: 20px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 900; 
                      font-size: 18px; 
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);" 
               class="mobile-button pulse">
              🚀 QUERO RESERVAR AGORA
            </a>
            
            <div style="margin-top: 15px; font-size: 12px;">
              ⏰ Oferta válida até amanhã às 23:59
            </div>
            <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
              ✅ Sem taxa de conveniência • Cancelamento grátis em 24h
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;" class="mobile-padding">
            <div style="margin-bottom: 15px;">
              <strong style="color: white;">Fly2Any Travel</strong><br>
              Há 21 anos conectando você ao Brasil e o mundo!
            </div>
            
            <div style="margin: 15px 0;">
              <a href="https://wa.me/551151944717" style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-weight: 700; display: inline-block; margin: 5px;">
                📱 WhatsApp
              </a>
              <a href="mailto:info@fly2any.com" style="background: #60a5fa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-weight: 700; display: inline-block; margin: 5px;">
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