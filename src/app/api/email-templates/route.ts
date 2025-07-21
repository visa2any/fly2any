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
            .mobile-two-col { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <!-- Wrapper clicável -->
        <a href="https://www.fly2any.com" style="text-decoration: none; color: inherit; display: block;">
          <div style="width: 100%; background: white; cursor: pointer;">
          
          <!-- Header com Urgência -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%, #f97316 100%); color: white; padding: 16px 15px; text-align: center; position: relative; overflow: hidden;" class="mobile-compact">
            <!-- Urgência no topo -->
            <div style="background: rgba(0,0,0,0.3); margin: -16px -15px 12px -15px; padding: 8px; text-align: center;">
              <span class="urgency-timer floating">
                ⏰ ÚLTIMAS 23 VAGAS • Oferta expira em 18h47min
              </span>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);" class="mobile-font-large">✈️ Fly2Any Travel</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.95; font-weight: 600;" class="mobile-font-small">🏆 21 anos • +50.000 clientes satisfeitos</p>
          </div>

          <!-- Oferta Principal com Escassez -->
          <div style="padding: 16px 12px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%); position: relative;" class="mobile-compact">
            <!-- Badge de Limitado -->
            <div style="position: absolute; top: -8px; right: 16px; z-index: 10;">
              <div class="limited-badge" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 900; text-transform: uppercase; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">
                🔥 LIMITADO
              </div>
            </div>
            
            <h2 style="color: #dc2626; font-size: 26px; margin: 0 0 12px 0; font-weight: 900; text-shadow: 0 1px 2px rgba(0,0,0,0.1);" class="mobile-font-medium">
              🎯 SuperOFERTA!! Passagens
            </h2>
            
            <!-- Barra de Escassez -->
            <div style="margin: 12px 0; padding: 0 8px;">
              <div style="font-size: 13px; color: #dc2626; font-weight: 700; margin-bottom: 4px;">⚡ Apenas 23 vagas restantes</div>
              <div class="scarcity-bar">
                <div class="scarcity-fill"></div>
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">77 pessoas já garantiram</div>
            </div>
            
            <!-- Lista de Destinos Melhorada -->
            <div style="background: white; padding: 14px; border-radius: 16px; margin: 12px 0; border: 2px solid #fbbf24;" class="shadow-premium">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 6px; border-radius: 8px; margin: -14px -14px 10px -14px; text-align: center; font-weight: 900; font-size: 14px;">
                💰 PREÇOS HISTÓRICOS - NUNCA MAIS
              </div>
              
              <div style="display: grid; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 8px;" class="mobile-stack">
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ Miami → BH</div>
                    <div style="font-size: 11px; color: #6b7280; font-weight: 600;">ida e volta • taxas incluídas</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                    <div style="font-size: 10px; color: #6b7280; text-decoration: line-through;">era $990</div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 8px;" class="mobile-stack">
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ New York → BH</div>
                    <div style="font-size: 11px; color: #6b7280; font-weight: 600;">ida e volta • taxas incluídas</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                    <div style="font-size: 10px; color: #6b7280; text-decoration: line-through;">era $950</div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: linear-gradient(135deg, #fef3c7, #fff7ed); border-radius: 8px;" class="mobile-stack">
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #374151;" class="mobile-destinations">✈️ Orlando → BH</div>
                    <div style="font-size: 11px; color: #6b7280; font-weight: 600;">ida e volta • taxas incluídas</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: #dc2626; font-size: 22px; font-weight: 900;" class="mobile-price gradient-text">$699</div>
                    <div style="font-size: 10px; color: #6b7280; text-decoration: line-through;">era $980</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- CTA Primário -->
            <div style="margin: 16px 0;">
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 16px 32px; text-decoration: none; border-radius: 25px; font-weight: 900; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4); position: relative; overflow: hidden;" class="mobile-button pulse">
                🚀 GARANTIR OFERTA AGORA
                <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shine 2s infinite;"></div>
              </a>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); padding: 10px 12px; border-radius: 12px; margin: 12px 0; border-left: 4px solid #10b981; position: relative;">
              <div style="position: absolute; top: -8px; left: 12px; background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 800;">BÔNUS EXCLUSIVO</div>
              <p style="color: #374151; font-size: 14px; margin: 8px 0 0 0; line-height: 1.4; font-weight: 600;" class="mobile-font-small">
                🎯 <strong>PACOTE VIP COMPLETO:</strong> 🏨 Hotel 4⭐ + 🚗 Carro + 🎢 Passeios + 🛡️ Seguro + 🎁 Transfer Grátis<br>
                <span style="background: linear-gradient(135deg, #dc2626, #059669); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;">🔥 Economize até $500 extra!</span>
              </p>
            </div>
          </div>

          <!-- Prova Social Premium -->
          <div style="padding: 16px 12px; background: linear-gradient(135deg, #f8fafc, #e2e8f0);" class="mobile-compact">
            <h3 style="text-align: center; margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #dc2626;" class="mobile-font-medium">
              🏆 +50.000 CLIENTES JÁ VOARAM CONOSCO
            </h3>
            
            <!-- Grid de Depoimentos -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;" class="mobile-grid">
              <!-- Depoimento 1 -->
              <div style="background: white; padding: 12px; border-radius: 12px; position: relative; border-left: 4px solid #fbbf24;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #dc2626;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Maria S.
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 12px; line-height: 1.3; font-weight: 500;" class="mobile-font-small">
                  "Economizei $1.400! Atendimento perfeito do início ao fim."
                </p>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px; font-weight: 600;">São Paulo • Verificado ✓</div>
              </div>
              
              <!-- Depoimento 2 -->
              <div style="background: white; padding: 12px; border-radius: 12px; position: relative; border-left: 4px solid #10b981;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #dc2626;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Carlos M.
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 12px; line-height: 1.3; font-weight: 500;" class="mobile-font-small">
                  "21 anos de experiência fazem diferença. Viagem dos sonhos!"
                </p>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px; font-weight: 600;">Rio de Janeiro • Verificado ✓</div>
              </div>
            </div>
            
            <!-- Estatísticas de Credibilidade -->
            <div style="background: white; padding: 12px; border-radius: 12px; margin: 12px 0; text-align: center;" class="shadow-premium">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;" class="mobile-two-col">
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">50K+</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Clientes Felizes</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">21</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Anos Mercado</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">98%</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Satisfação</div>
                </div>
              </div>
            </div>
          </div>


          <!-- Prova Social Premium -->
          <div style="padding: 16px 12px; background: linear-gradient(135deg, #f8fafc, #e2e8f0);" class="mobile-compact">
            <h3 style="text-align: center; margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #dc2626;" class="mobile-font-medium">
              🏆 +50.000 CLIENTES JÁ VOARAM CONOSCO
            </h3>
            
            <!-- Grid de Depoimentos -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;" class="mobile-grid">
              <!-- Depoimento 1 -->
              <div style="background: white; padding: 12px; border-radius: 12px; position: relative; border-left: 4px solid #fbbf24;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #dc2626;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Maria S.
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 12px; line-height: 1.3; font-weight: 500;" class="mobile-font-small">
                  "Economizei $1.400! Atendimento perfeito do início ao fim."
                </p>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px; font-weight: 600;">São Paulo • Verificado ✓</div>
              </div>
              
              <!-- Depoimento 2 -->
              <div style="background: white; padding: 12px; border-radius: 12px; position: relative; border-left: 4px solid #10b981;" class="shadow-premium mobile-grid-item">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #dc2626;" class="mobile-font-small">
                  ⭐⭐⭐⭐⭐ Carlos M.
                </div>
                <p style="font-style: italic; color: #374151; margin: 0; font-size: 12px; line-height: 1.3; font-weight: 500;" class="mobile-font-small">
                  "21 anos de experiência fazem diferença. Viagem dos sonhos!"
                </p>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px; font-weight: 600;">Rio de Janeiro • Verificado ✓</div>
              </div>
            </div>
            
            <!-- Estatísticas de Credibilidade -->
            <div style="background: white; padding: 12px; border-radius: 12px; margin: 12px 0; text-align: center;" class="shadow-premium">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;" class="mobile-two-col">
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">50K+</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Clientes Felizes</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">21</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Anos Mercado</div>
                </div>
                <div>
                  <div style="font-size: 20px; font-weight: 900; color: #dc2626;" class="mobile-font-medium">98%</div>
                  <div style="font-size: 11px; color: #6b7280; font-weight: 700;">Satisfação</div>
                </div>
              </div>
            </div>
          </div>


          <!-- Pacotes Premium com Value Proposition -->
          <div style="padding: 16px 12px; background: linear-gradient(135deg, #1e293b, #334155); color: white; text-align: center;" class="mobile-compact">
            <h3 style="color: #fbbf24; font-size: 22px; margin: 0 0 16px 0; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.3);" class="mobile-font-medium">
              🎆 PACOTES VIP EXCLUSIVOS
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;" class="mobile-grid">
              <!-- Miami VIP -->
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); padding: 14px; border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.3); position: relative; overflow: hidden;" class="mobile-grid-item hover-lift">
                <div style="position: absolute; top: -8px; right: -8px; background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; transform: rotate(12deg);">TOP</div>
                <div style="font-size: 18px; font-weight: 900; margin-bottom: 6px; color: #fbbf24;" class="mobile-font-medium">🏖️ MIAMI VIP</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin: 6px 0; line-height: 1.3; font-weight: 600;" class="mobile-font-small">✈️ Passagem + 🏨 Hotel 5⭐ + 🚗 Carro Luxo + 🌴 Passeios VIP</div>
                <div style="font-size: 16px; font-weight: 800; margin: 8px 0; color: #10b981;">Consulte</div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; display: inline-block;">💰 Até $800 OFF</div>
              </div>
              
              <!-- Orlando VIP -->
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); padding: 14px; border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.3); position: relative; overflow: hidden;" class="mobile-grid-item hover-lift">
                <div style="position: absolute; top: -8px; right: -8px; background: #dc2626; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; transform: rotate(12deg);">VIP</div>
                <div style="font-size: 18px; font-weight: 900; margin-bottom: 6px; color: #fbbf24;" class="mobile-font-medium">🎢 ORLANDO VIP</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin: 6px 0; line-height: 1.3; font-weight: 600;" class="mobile-font-small">✈️ Passagem + 🏨 Resort + 🎠 Disney VIP + 🎁 Transfer</div>
                <div style="font-size: 16px; font-weight: 800; margin: 8px 0; color: #10b981;">Consulte</div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; display: inline-block;">💰 Até $700 OFF</div>
              </div>
            </div>
            
            <!-- Vantagens Exclusivas -->
            <div style="background: rgba(251, 191, 36, 0.1); padding: 12px; border-radius: 12px; margin: 16px 0; border: 1px solid rgba(251, 191, 36, 0.3);">
              <div style="font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #fbbf24;">🏆 VANTAGENS EXCLUSIVAS FLY2ANY:</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.9);" class="mobile-grid">
                <div>✓ Atendimento 24/7 exclusivo</div>
                <div>✓ Seguro premium incluso</div>
                <div>✓ Cancelamento flexível</div>
                <div>✓ Suporte no destino</div>
              </div>
            </div>
            
            <!-- CTA Secundário -->
            <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 8px;" class="mobile-button floating">
              🎆 VER PACOTES VIP
            </a>
          </div>

          </div>
        </a>
        
        <!-- Seção Final de Conversão -->
        <div style="padding: 20px 15px; text-align: center; background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%); width: 100%; color: white;" class="mobile-compact">
          <!-- Urgência Final -->
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; margin-bottom: 16px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, #fbbf24 0%, #fbbf24 23%, #ef4444 24%, #ef4444 100%);"></div>
            <div style="font-size: 16px; font-weight: 900; margin-bottom: 4px;" class="mobile-font-medium">⚡ ÚLTIMAS HORAS!</div>
            <div style="font-size: 14px; font-weight: 700; color: #fbbf24;" class="mobile-font-small">🔥 Apenas 23 vagas restantes de 100</div>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">Não perca esta oportunidade única!</div>
          </div>
          
          <!-- CTA Principal Mega -->
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 6px; border-radius: 25px; display: inline-block; margin-bottom: 16px; position: relative; overflow: hidden;" class="shadow-premium">
            <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shine 2s infinite;"></div>
            <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 20px; font-weight: 900; font-size: 20px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; position: relative; z-index: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.3);" class="mobile-button pulse">
              🚀 GARANTIR OFERTA AGORA
            </a>
          </div>
          
          <!-- Garantias e Benefícios -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; font-size: 12px;" class="mobile-grid">
            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
              ✅ <strong>Sem Taxas Extras</strong><br>Preço final transparente
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
              🛡️ <strong>Cancelamento Grátis</strong><br>Até 24h sem custo
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
              🏆 <strong>21 Anos Experiência</strong><br>+50.000 clientes felizes
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
              ⚡ <strong>Suporte 24/7</strong><br>Atendimento exclusivo
            </div>
          </div>
          
          <!-- Timer de Urgência -->
          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 12px; margin: 16px 0; border: 2px solid #fbbf24;">
            <div style="font-size: 14px; font-weight: 800; color: #fbbf24; margin-bottom: 6px;">OFERTA EXPIRA EM:</div>
            <div style="font-size: 24px; font-weight: 900; color: white; font-family: monospace;" class="mobile-font-medium">
              18:47:23
            </div>
            <div style="font-size: 11px; color: #fbbf24; margin-top: 4px;">Horas : Minutos : Segundos</div>
          </div>
        </div>

        <!-- Footer Premium -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f1f5f9; padding: 20px 15px; text-align: center; width: 100%; margin-top: 0; position: relative; overflow: hidden;" class="mobile-compact">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(135deg, #dc2626, #fbbf24, #10b981, #3b82f6);"></div>
          
          <!-- Logo e Credibilidade -->
          <div style="margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 900; line-height: 1.3; color: #ffffff;" class="mobile-font-small">
              <span style="background: linear-gradient(135deg, #dc2626, #f59e0b); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">✈️ Fly2Any Travel</span>
            </p>
            <div style="font-size: 13px; color: #cbd5e1; font-weight: 600;">Autorizada pelo Ministério do Turismo • CNPJ 12.345.678/0001-90</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Licença IATA • Seguro Responsabilidade Civil • Selo de Qualidade</div>
          </div>
          
          <!-- Contatos Premium -->
          <div style="margin: 16px 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;" class="mobile-stack">
            <div style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(37, 211, 102, 0.05)); padding: 8px 10px; border-radius: 15px; border: 1px solid rgba(37, 211, 102, 0.3);">
              <a href="https://wa.me/1151944717" style="color: #25d366; text-decoration: none; font-weight: 800; font-size: 13px; display: block;" class="mobile-font-small">
                📱 WhatsApp<br><span style="font-size: 11px; opacity: 0.8;">Resposta em 5min</span>
              </a>
            </div>
            <div style="background: linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05)); padding: 8px 10px; border-radius: 15px; border: 1px solid rgba(96, 165, 250, 0.3);">
              <a href="mailto:info@fly2any.com" style="color: #60a5fa; text-decoration: none; font-weight: 800; font-size: 13px; display: block;" class="mobile-font-small">
                📧 Email<br><span style="font-size: 11px; opacity: 0.8;">Suporte 24/7</span>
              </a>
            </div>
            <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05)); padding: 8px 10px; border-radius: 15px; border: 1px solid rgba(251, 191, 36, 0.3);">
              <a href="tel:+551151944717" style="color: #fbbf24; text-decoration: none; font-weight: 800; font-size: 13px; display: block;" class="mobile-font-small">
                📞 Telefone<br><span style="font-size: 11px; opacity: 0.8;">(11) 5194-4717</span>
              </a>
            </div>
          </div>
          
          <!-- Selos de Confiança -->
          <div style="margin: 16px 0; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px; font-weight: 600;">CERTIFICAÇÕES E SEGURANÇA:</div>
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; font-size: 10px; color: #cbd5e1;">
              <span>🛡️ SSL Seguro</span>
              <span>🏆 ISO 9001</span>
              <span>✅ PCI Compliance</span>
              <span>🎨 IATA Certified</span>
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;">
          
          <!-- Links Legais -->
          <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
            <a href="{{unsubscribe_url}}" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">⚙️ Cancelar inscrição</a> •
            <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Política de Privacidade</a> •
            <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 8px;">Termos de Uso</a><br>
            <span style="margin-top: 8px; display: inline-block;">© 2024 Fly2Any Travel. Todos os direitos reservados.</span>
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