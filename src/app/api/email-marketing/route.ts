import { NextRequest, NextResponse } from 'next/server';
import { 
  initEmailMarketingTables, 
  EmailContactsDB, 
  EmailCampaignsDB, 
  EmailSendsDB,
  generateUnsubscribeToken,
  EmailContact,
  EmailCampaign,
  processEmailRetries
} from '@/lib/email-marketing-db';
import { emailMarketingLogger, EmailEvent, LogLevel } from '@/lib/email-marketing-logger';
import { EmailTrackingSystem, initEmailTracking } from '@/lib/email-tracking';
import { sql } from '@vercel/postgres';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Inicializar tabelas na primeira execução
let tablesInitialized = false;
async function ensureTablesExist() {
  if (!tablesInitialized) {
    try {
      await initEmailMarketingTables();
      await initEmailTracking();
      tablesInitialized = true;
      console.log('✅ Tabelas de email marketing e tracking inicializadas');
    } catch (error) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      throw error;
    }
  }
}

// Função para obter credenciais Gmail
function getGmailCredentials() {
  let email = process.env.GMAIL_EMAIL;
  let password = process.env.GMAIL_APP_PASSWORD;
  
  if (!email || !password) {
    const envFiles = ['.env.local', '.env', '.env.production.local'];
    
    for (const fileName of envFiles) {
      const envPath = path.join(process.cwd(), fileName);
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const equalIndex = trimmedLine.indexOf('=');
              if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim().replace(/["']/g, '');
                
                if (key === 'GMAIL_EMAIL' && !email) email = value;
                if (key === 'GMAIL_APP_PASSWORD' && !password) password = value;
              }
            }
          }
          
          if (email && password) {
            console.log(`✅ Credenciais Gmail carregadas de: ${fileName}`);
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao carregar ${fileName}:`, error);
      }
    }
  } else {
    console.log('✅ Credenciais Gmail carregadas de variáveis de ambiente');
  }
  
  return { email, password };
}

// Função para carregar templates da API (corrigida para produção)
async function loadSavedTemplates() {
  const startTime = Date.now();
  try {
    // Construir URL correta para produção e desenvolvimento
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : 'https://www.fly2any.com'; // URL de produção CORRETA
    
    emailMarketingLogger.debug(
      EmailEvent.TEMPLATE_LOADED,
      'Loading email templates from API',
      { metadata: { baseUrl } }
    );
    console.log('🔄 Carregando templates de:', baseUrl);
    
    const response = await fetch(`${baseUrl}/api/email-templates`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Adicionar timeout para evitar travamento
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      console.warn(`❌ Falha HTTP ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.templates && data.templates.length > 0) {
      console.log('✅ Templates carregados da API para email marketing:', data.templates.length);
      
      // Converter para formato esperado pelo email marketing
      const templatesFormatted: any = {};
      
      data.templates.forEach((template: any) => {
        templatesFormatted[template.type] = {
          subject: template.subject,
          html: template.html
        };
      });
      
      console.log('📧 Templates formatados:', Object.keys(templatesFormatted));
      return templatesFormatted;
    } else {
      console.warn('⚠️ Resposta inválida da API de templates:', data);
      throw new Error('Resposta inválida da API de templates');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar templates da API, usando fallback:', error);
  }
  
  // Fallback para templates padrão
  console.log('📋 Usando templates fallback - ISSO NÃO DEVERIA ACONTECER se dados corretos foram enviados');
  return EMAIL_TEMPLATES_FALLBACK;
}

// Templates PREMIUM ULTRA COMPACTOS - Super Oferta Alta Conversão
const EMAIL_TEMPLATES_FALLBACK = {
  promotional: {
    subject: '⏰ ÚLTIMAS 18 VAGAS! $699 Miami→BH • 16h23min RESTANTES • 30% OFF - Fly2Any',
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
          .limited-badge { position: relative; overflow: hidden; }
          .limited-badge::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shine 2s infinite; }
          .urgency-timer { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 800; display: inline-block; position: relative; }
          .scarcity-bar { height: 8px; background: #fee2e2; border-radius: 4px; overflow: hidden; }
          .scarcity-fill { height: 100%; background: linear-gradient(135deg, #dc2626, #ef4444); width: 18%; border-radius: 4px; }
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
              ⏰ ÚLTIMAS 18 VAGAS • Expira 16h23min • 🔥 30% OFF HISTÓRICO!
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;" class="mobile-stack">
              <div style="display: flex; align-items: center; gap: 8px;">
                <!-- Logo Fly2Any -->
                <div style="color: white; font-size: 24px; font-weight: 900;">✈️ FLY2ANY</div>
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
                <div style="font-size: 11px; color: #dc2626; font-weight: 700;">⚡ 18/100 vagas restantes</div>
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
                💰 PREÇOS HISTÓRICOS - NUNCA VISTO!
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
              🎁 <strong>BÔNUS INCLUÍDO:</strong> Hotel 4⭐ + Carro + Passeios + Seguro + Transfer • <span style="color: #dc2626; font-weight: 800;">Economize $500 extra!</span>
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
              <div style="font-size: 14px; font-weight: 900;" class="mobile-font-small">⚡ ÚLTIMAS 18 VAGAS!</div>
              <div style="font-size: 10px; color: #fbbf24; font-weight: 600;">Expira hoje às 23:59</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; color: #fbbf24; font-family: monospace;" class="mobile-font-medium">16:23:47</div>
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

        <!-- Footer Ultra Compacto -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f1f5f9; padding: 12px 15px; text-align: center; width: 100%; margin-top: 0; position: relative;" class="mobile-compact">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(135deg, #dc2626, #fbbf24, #10b981);"></div>
          
          <!-- Logo + Contatos em linha -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" class="mobile-stack">
            <!-- Logo compacto no footer -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="color: white; font-size: 16px; font-weight: 900;">✈️ FLY2ANY</div>
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
  },
  newsletter: {
    subject: '🧳 21 ANOS de segredos: Como montar sua viagem COMPLETA economizando $1.500+',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Header Premium -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">✈️ FLY2ANY INSIDER</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Newsletter Exclusiva • Dicas semanais</p>
          </div>

          <!-- Welcome Message -->
          <div style="padding: 25px; background: #fafafa; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
              Olá, <strong>{{nome}}</strong>! 👋<br>
              Esta semana revelamos os <strong>segredos dos especialistas</strong> que nossa equipe usa há 21 anos para montar viagens COMPLETAS com economia máxima.
            </p>
          </div>

          <!-- Main Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
              💡 SEGREDO #1: Por que comprar SEPARADO é mais caro
            </h2>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
              <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
                <strong>🕐 Horários mágicos:</strong> Quando você compra passagem, hotel, carro e passeios SEPARADAMENTE, paga até 60% mais caro. Nossos pacotes COMPLETOS garantem o melhor preço por incluir TUDO em uma única negociação.
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                ✅ <em>Testado com clientes reais: Maria economizou $743 usando esta técnica na rota SP-Miami.</em>
              </p>
            </div>

            <!-- Action Section -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 QUER RESULTADOS ASSIM?</h3>
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Há 21 anos criamos pacotes COMPLETOS que incluem TUDO: passagens, hotéis, carros, passeios e seguro viagem. Você só se preocupa em aproveitar!
              </p>
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                📱 QUERO PACOTE COMPLETO
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #374151; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Fly2Any Insider</strong> • Seus especialistas em viagens internacionais
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              📱 WhatsApp: +55 11 99999-9999 • 📧 insider@fly2any.com
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; opacity: 0.6;">
              <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Cancelar inscrição</a>
            </p>
          </div>
        </div>
      </body>
      </html>`
  },
  reactivation: {
    subject: '💔 Sentimos sua falta... PACOTE COMPLETO com 30% OFF só para você!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Emotional Header -->
          <div style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 15px; right: 20px; background: #fbbf24; color: #000; padding: 8px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">
              🎁 OFERTA VIP
            </div>
            <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700;">✈️ FLY2ANY</h1>
            <p style="margin: 0; font-size: 18px; font-weight: 600; opacity: 0.95;">
              Que saudades de você, {{nome}}... 💔
            </p>
          </div>

          <!-- Personal Message -->
          <div style="padding: 30px; background: linear-gradient(180deg, #fef2f2 0%, #ffffff 100%); text-align: center;">
            <h2 style="color: #be123c; font-size: 24px; margin: 0 0 20px 0; font-weight: 700; line-height: 1.3;">
              Depois de 21 anos, sabemos quando um viajante especial como você está pronto para a próxima aventura...
            </h2>
            <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
              Sabemos que a vida anda corrida, mas <strong>você merece muito mais do que uma pausa</strong>. Merece uma experiência COMPLETA, sem stress, onde só precisa se preocupar em aproveitar!
            </p>
          </div>

          <!-- Exclusive Offer -->
          <div style="padding: 30px; background: #f8fafc;">
            <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 4px; border-radius: 16px; margin-bottom: 20px;">
              <div style="background: white; padding: 25px; border-radius: 12px; text-align: center;">
                <h3 style="color: #92400e; font-size: 20px; margin: 0 0 15px 0; font-weight: 800;">
                  🎁 OFERTA ESPECIAL SÓ PARA VOCÊ
                </h3>
                <div style="color: #be123c; font-size: 32px; font-weight: 900; margin: 10px 0;">
                  30% OFF
                </div>
                <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                  No seu PACOTE COMPLETO dos sonhos
                </p>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24;">
                  <div style="font-weight: 700; color: #92400e; font-size: 18px;">
                    Código: <span style="background: #92400e; color: white; padding: 5px 10px; border-radius: 4px;">VOLTEI30</span>
                  </div>
                  <div style="font-size: 12px; color: #92400e; margin-top: 5px;">
                    ⏰ Válido por 7 dias • Não perca esta chance!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Urgency CTA -->
          <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);">
            <div style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); padding: 6px; border-radius: 16px; display: inline-block; margin-bottom: 15px;">
              <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(190, 18, 60, 0.4);">
                💖 QUERO MEU PACOTE COMPLETO
              </a>
            </div>
            <div style="font-size: 14px; color: #be123c; margin-top: 10px; font-weight: 600;">
              ⏰ Oferta expira em 7 dias • Código VOLTEI30
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
};

// POST - Ações principais
export async function POST(request: NextRequest) {
  try {
    await ensureTablesExist();
    
    const body = await request.json();
    const { action } = body;

    switch (action) {
      // Importar contatos
      case 'import_contacts': {
        const { contactsData } = body;
        
        if (!Array.isArray(contactsData) || contactsData.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Dados de contatos inválidos'
          }, { status: 400 });
        }

        // Preparar contatos para inserção
        const contactsToInsert = contactsData.map((contact: any) => ({
          email: contact.email,
          nome: contact.nome || contact.name || 'Cliente',
          sobrenome: contact.sobrenome || contact.lastName || '',
          telefone: contact.telefone || contact.phone || '',
          segmento: contact.segmento || 'geral',
          tags: Array.isArray(contact.tags) ? contact.tags : (contact.tags ? contact.tags.split(';') : []),
          status: 'ativo' as const,
          email_status: 'not_sent' as const,
          unsubscribe_token: generateUnsubscribeToken()
        }));

        const result = await EmailContactsDB.bulkCreate(contactsToInsert);
        
        return NextResponse.json({
          success: true,
          data: {
            imported: result.inserted,
            duplicates: result.duplicates,
            errors: result.errors,
            message: `${result.inserted} contatos importados com sucesso! ${result.duplicates} duplicatas ignoradas.`
          }
        });
      }

      // Criar campanha
      case 'create_campaign': {
        const { name, subject, templateType, htmlContent, textContent } = body;
        
        // Log dos dados recebidos para debug
        console.log('🔍 Recebido create_campaign:', {
          name,
          subject,
          templateType,
          htmlContentLength: htmlContent?.length || 0,
          textContentLength: textContent?.length || 0
        });
        
        // PRIORIZAR dados enviados pelo frontend - garantir que o template visualizado seja o mesmo enviado
        let finalSubject = subject;
        let finalHtmlContent = htmlContent;
        
        // Só usar fallback se os dados não foram enviados
        if (!finalSubject || !finalHtmlContent) {
          const EMAIL_TEMPLATES = await loadSavedTemplates();
          const template = EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES] || EMAIL_TEMPLATES.promotional;
          finalSubject = finalSubject || template.subject;
          finalHtmlContent = finalHtmlContent || template.html;
        }
        
        const campaign = await EmailCampaignsDB.create({
          name: name || 'Nova Campanha',
          subject: finalSubject,
          template_type: templateType || 'promotional',
          html_content: finalHtmlContent,
          text_content: textContent || '',
          status: 'draft',
          total_recipients: 0,
          total_sent: 0,
          total_delivered: 0,
          total_opened: 0,
          total_clicked: 0,
          total_bounced: 0,
          total_unsubscribed: 0
        });
        
        return NextResponse.json({
          success: true,
          data: campaign
        });
      }

      // Enviar email de teste personalizado (direto do template selecionado)
      case 'send_test_custom': {
        const { email, subject, htmlContent, templateName } = body;
        
        // Log dos dados recebidos para debug
        console.log('📧 Recebido teste personalizado:', {
          templateName,
          subject,
          email,
          htmlContentLength: htmlContent?.length || 0
        });
        
        if (!email || !subject || !htmlContent) {
          return NextResponse.json({
            success: false,
            error: 'Email, subject e htmlContent são obrigatórios'
          }, { status: 400 });
        }

        const credentials = getGmailCredentials();
        
        if (!credentials.email || !credentials.password) {
          return NextResponse.json({
            success: false,
            error: 'Credenciais Gmail não configuradas'
          }, { status: 500 });
        }
        
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: credentials.email,
            pass: credentials.password,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        // Personalizar template usando o HTML exato selecionado
        const personalizedHtml = htmlContent
          .replace(/{{nome}}/g, 'Teste')
          .replace(/{{unsubscribe_url}}/g, 'https://www.fly2any.com/unsubscribe');
        
        const result = await transporter.sendMail({
          from: `"Fly2Any" <${credentials.email}>`,
          to: email,
          subject: `[TESTE] ${subject}`,
          html: personalizedHtml
        });

        console.log(`✅ Email teste enviado usando template: ${templateName}`);

        return NextResponse.json({
          success: true,
          message: `Email teste "${templateName}" enviado para ${email}`,
          messageId: result.messageId
        });
      }

      // Enviar email de teste (método antigo - mantido para compatibilidade)
      case 'send_test': {
        const { email, campaignType = 'promotional' } = body;
        
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email é obrigatório'
          }, { status: 400 });
        }

        const credentials = getGmailCredentials();
        
        if (!credentials.email || !credentials.password) {
          return NextResponse.json({
            success: false,
            error: 'Credenciais Gmail não configuradas'
          }, { status: 500 });
        }
        
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: credentials.email,
            pass: credentials.password,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        
        // Carregar templates salvos dinamicamente
        const EMAIL_TEMPLATES = await loadSavedTemplates();
        const template = EMAIL_TEMPLATES[campaignType as keyof typeof EMAIL_TEMPLATES] || EMAIL_TEMPLATES.promotional;
        
        // Personalizar template
        const personalizedHtml = template.html
          .replace(/{{nome}}/g, 'Teste')
          .replace(/{{unsubscribe_url}}/g, 'https://www.fly2any.com/unsubscribe');
        
        const result = await transporter.sendMail({
          from: `"Fly2Any" <${credentials.email}>`,
          to: email,
          subject: `[TESTE] ${template.subject}`,
          html: personalizedHtml
        });

        return NextResponse.json({
          success: true,
          message: `Email teste enviado para ${email}`,
          messageId: result.messageId
        });
      }

      // Enviar campanha
      case 'send_campaign': {
        const { campaignId, segment, limit = 500 } = body;
        
        const campaign = await EmailCampaignsDB.findById(campaignId);
        if (!campaign) {
          return NextResponse.json({
            success: false,
            error: 'Campanha não encontrada'
          }, { status: 404 });
        }

        // 🚨 CORREÇÃO CRÍTICA: Buscar apenas contatos que NÃO receberam esta campanha
        const baseFilters: any = {
          status: 'ativo',
          email_status: ['not_sent', 'sent', 'opened', 'clicked'],
          limit: parseInt(limit) * 2 // Aumentar limite para compensar filtros
        };

        if (segment && segment !== '') {
          baseFilters.segmento = segment;
        }

        const allContacts = await EmailContactsDB.findAll(baseFilters);
        
        // Buscar contatos que JÁ receberam esta campanha
        const existingSends = await sql`
          SELECT DISTINCT contact_id 
          FROM email_sends 
          WHERE campaign_id = ${campaignId}
            AND status IN ('sent', 'delivered', 'opened', 'clicked')
        `;
        
        const alreadySentContactIds = new Set(existingSends.rows.map(row => row.contact_id));
        
        // Filtrar apenas contatos que NÃO receberam esta campanha
        const contacts = allContacts
          .filter(contact => !alreadySentContactIds.has(contact.id))
          .slice(0, parseInt(limit)); // Aplicar limite final
        
        console.log(`📊 Filtro anti-duplicação: ${allContacts.length} total → ${contacts.length} novos para campanha ${campaignId}`);
        
        if (contacts.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Nenhum contato novo disponível para esta campanha. Todos já receberam este email.'
          }, { status: 400 });
        }

        // Atualizar status da campanha
        await EmailCampaignsDB.updateStatus(campaignId, 'sending');
        
        // Criar registros de envio
        const sendPromises = contacts.map(contact => 
          EmailSendsDB.create({
            campaign_id: campaignId,
            contact_id: contact.id,
            email: contact.email,
            status: 'pending',
            retry_count: 0
          })
        );
        
        const emailSends = await Promise.all(sendPromises);

        // Processar envios de forma assíncrona
        processCampaignSends(campaign, contacts, emailSends).catch(error => {
          console.error('Erro no processamento assíncrono:', error);
        });
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Campanha iniciada para ${contacts.length} contatos`,
            campaignId,
            totalRecipients: contacts.length,
            status: 'sending'
          }
        });
      }

      // Retry envio de campanha que ficou pendente
      case 'retry_campaign': {
        const { campaignId } = body;
        
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaignId é obrigatório'
          }, { status: 400 });
        }

        const campaign = await EmailCampaignsDB.findById(campaignId);
        if (!campaign) {
          return NextResponse.json({
            success: false,
            error: 'Campanha não encontrada'
          }, { status: 404 });
        }

        // Buscar envios pendentes
        const pendingSends = await EmailSendsDB.findByCampaign(campaignId);
        const pendingOnly = pendingSends.filter(send => send.status === 'pending');
        
        if (pendingOnly.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Não há envios pendentes para esta campanha'
          }, { status: 400 });
        }

        // Buscar contatos para os envios pendentes
        const contactIds = pendingOnly.map(send => send.contact_id);
        const contacts: EmailContact[] = [];
        
        for (const contactId of contactIds) {
          const contact = await EmailContactsDB.findById(contactId);
          if (contact) {
            contacts.push(contact);
          }
        }

        // Reiniciar processo de envio assíncrono
        await EmailCampaignsDB.updateStatus(campaignId, 'sending');
        
        processCampaignSends(campaign, contacts, pendingOnly).catch(error => {
          console.error('Erro no reprocessamento assíncrono:', error);
        });
        
        return NextResponse.json({
          success: true,
          data: {
            message: `Reprocessando ${pendingOnly.length} envios pendentes`,
            campaignId,
            totalPending: pendingOnly.length
          }
        });
      }

      // Ações rápidas (compatibilidade com interface atual)
      case 'send_promotional':
      case 'send_newsletter': 
      case 'send_reactivation': {
        const { segment } = body;
        const templateType = action.replace('send_', '');
        
        // Carregar templates salvos dinamicamente
        const EMAIL_TEMPLATES = await loadSavedTemplates();
        const template = EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES];
        const campaign = await EmailCampaignsDB.create({
          name: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} - ${new Date().toLocaleDateString('pt-BR')}`,
          subject: template.subject,
          template_type: templateType as any,
          html_content: template.html,
          text_content: '',
          status: 'draft',
          total_recipients: 0,
          total_sent: 0,
          total_delivered: 0,
          total_opened: 0,
          total_clicked: 0,
          total_bounced: 0,
          total_unsubscribed: 0
        });

        // Enviar campanha
        return await POST(new NextRequest(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify({
            action: 'send_campaign',
            campaignId: campaign.id,
            segment,
            limit: 500
          })
        }));
      }

      // 🔄 NOVA FUNCIONALIDADE: Resetar status de contatos para permitir reenvio
      case 'reset_contacts_status': {
        const { segment, resetType = 'all' } = body;
        
        try {
          let query = `UPDATE email_contacts SET email_status = 'not_sent', updated_at = CURRENT_TIMESTAMP WHERE status = 'ativo'`;
          const params: any[] = [];
          
          // Resetar apenas contatos que não falharam permanentemente
          if (resetType === 'sent_only') {
            query += ` AND email_status IN ('sent', 'opened', 'clicked')`;
          } else if (resetType === 'all') {
            query += ` AND email_status NOT IN ('failed', 'bounced', 'unsubscribed')`;
          }
          
          // Filtrar por segmento se especificado
          if (segment && segment !== '') {
            query += ` AND segmento = $${params.length + 1}`;
            params.push(segment);
          }
          
          const result = await sql.query(query, params);
          
          return NextResponse.json({
            success: true,
            message: `Status resetado para ${result.rowCount} contatos`,
            data: {
              resetCount: result.rowCount,
              resetType,
              segment: segment || 'todos'
            }
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao resetar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não encontrada'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erro na API de email marketing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

// GET - Consultas
export async function GET(request: NextRequest) {
  try {
    await ensureTablesExist();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        const stats = await EmailContactsDB.getStats();
        const campaigns = await EmailCampaignsDB.findAll();
        const metrics = await EmailCampaignsDB.getMetrics();
        
        return NextResponse.json({
          success: true,
          data: {
            totalContacts: stats.totalContacts,
            segmentStats: stats.bySegmento,
            emailStats: stats.byEmailStatus,
            campaignsSent: campaigns.filter(c => c.status === 'completed' || c.status === 'sent').length,
            avgOpenRate: metrics.openRate.toFixed(1) + '%',
            avgClickRate: metrics.clickRate.toFixed(1) + '%'
          }
        });
      }

      case 'contacts': {
        const limit = parseInt(searchParams.get('limit') || '500');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status') || undefined;
        const emailStatus = searchParams.get('email_status') || undefined;
        const segmento = searchParams.get('segmento') || undefined;
        
        const contacts = await EmailContactsDB.findAll({
          status,
          email_status: emailStatus,
          segmento,
          limit,
          offset
        });
        
        // Buscar o total REAL com os mesmos filtros (sem limit/offset)
        const totalContacts = await EmailContactsDB.findAll({
          status,
          email_status: emailStatus,
          segmento
          // Sem limit/offset para contar todos
        });
        
        const stats = await EmailContactsDB.getStats();
        
        return NextResponse.json({
          success: true,
          data: {
            contacts,
            total: totalContacts.length, // Total REAL com filtros aplicados
            totalGeneral: stats.totalContacts, // Total geral sem filtros
            stats: stats.byEmailStatus,
            filters: { status, emailStatus, segmento } // Para debug
          }
        });
      }

      case 'campaigns': {
        const campaigns = await EmailCampaignsDB.findAll();
        
        return NextResponse.json({
          success: true,
          data: { campaigns }
        });
      }

      case 'campaign_stats': {
        const campaignId = searchParams.get('campaign_id');
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id é obrigatório'
          }, { status: 400 });
        }

        const stats = await EmailSendsDB.getCampaignStats(campaignId);
        
        return NextResponse.json({
          success: true,
          data: { stats }
        });
      }

      case 'add_metrics_columns': {
        try {
          console.log('🚀 Adicionando colunas de métricas à tabela email_campaigns...');
          
          // Adicionar colunas de métricas se não existirem
          try {
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_recipients INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_sent INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_delivered INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_opened INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_clicked INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_bounced INTEGER DEFAULT 0`;
            await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS total_unsubscribed INTEGER DEFAULT 0`;
            
            console.log('✅ Colunas de métricas adicionadas com sucesso!');
            
            return NextResponse.json({
              success: true,
              message: 'Colunas de métricas adicionadas com sucesso!'
            });
          } catch (error) {
            console.error('❌ Erro ao adicionar colunas:', error);
            return NextResponse.json({
              success: false,
              error: `Erro ao adicionar colunas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }, { status: 500 });
          }
        } catch (error) {
          console.error('❌ Erro geral:', error);
          return NextResponse.json({
            success: false,
            error: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'force_init_tables': {
        try {
          console.log('🚀 FORÇANDO criação das tabelas...');
          
          // Dropa e recria a tabela se existir
          await sql`DROP TABLE IF EXISTS email_sends CASCADE`;
          await sql`DROP TABLE IF EXISTS email_campaigns CASCADE`;
          await sql`DROP TABLE IF EXISTS email_contacts CASCADE`;
          
          // Criar tabela email_contacts com schema exato
          await sql`
            CREATE TABLE email_contacts (
              id VARCHAR(255) PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              nome VARCHAR(255) NOT NULL,
              sobrenome VARCHAR(255),
              telefone VARCHAR(50),
              segmento VARCHAR(100) DEFAULT 'geral',
              tags JSONB DEFAULT '[]',
              status VARCHAR(50) DEFAULT 'ativo',
              email_status VARCHAR(50) DEFAULT 'not_sent',
              last_email_sent TIMESTAMP,
              unsubscribe_token VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          // Criar índices
          await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email)`;
          await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status)`;
          
          // Criar outras tabelas COM as colunas de métricas
          await sql`
            CREATE TABLE email_campaigns (
              id VARCHAR(255) PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              subject VARCHAR(500) NOT NULL,
              template_type VARCHAR(50) DEFAULT 'promotional',
              html_content TEXT,
              text_content TEXT,
              status VARCHAR(50) DEFAULT 'draft',
              total_recipients INTEGER DEFAULT 0,
              total_sent INTEGER DEFAULT 0,
              total_delivered INTEGER DEFAULT 0,
              total_opened INTEGER DEFAULT 0,
              total_clicked INTEGER DEFAULT 0,
              total_bounced INTEGER DEFAULT 0,
              total_unsubscribed INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          await sql`
            CREATE TABLE email_sends (
              id VARCHAR(255) PRIMARY KEY,
              campaign_id VARCHAR(255),
              contact_id VARCHAR(255),
              email VARCHAR(255) NOT NULL,
              status VARCHAR(50) DEFAULT 'pending',
              message_id VARCHAR(255),
              sent_at TIMESTAMP,
              delivered_at TIMESTAMP,
              opened_at TIMESTAMP,
              clicked_at TIMESTAMP,
              failed_reason TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;

          console.log('✅ Tabelas criadas com sucesso!');
          
          return NextResponse.json({
            success: true,
            message: 'Tabelas recriadas com sucesso!'
          });
        } catch (error) {
          console.error('❌ Erro ao criar tabelas:', error);
          return NextResponse.json({
            success: false,
            error: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'delete_contact': {
        const contactId = searchParams.get('id');
        const email = searchParams.get('email');
        
        if (!contactId && !email) {
          return NextResponse.json({
            success: false,
            error: 'ID ou email do contato é obrigatório'
          }, { status: 400 });
        }
        
        try {
          let result;
          if (contactId) {
            result = await EmailContactsDB.deleteById(contactId);
          } else {
            result = await sql`DELETE FROM email_contacts WHERE email = ${email}`;
            result = (result.rowCount ?? 0) > 0;
          }
          
          if (result) {
            return NextResponse.json({
              success: true,
              message: 'Contato removido com sucesso'
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Contato não encontrado'
            }, { status: 404 });
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao remover contato: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'clear_all_contacts': {
        try {
          const result = await sql`DELETE FROM email_contacts`;
          return NextResponse.json({
            success: true,
            message: `Todos os ${result.rowCount || 0} contatos foram removidos`
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao limpar contatos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'track_open': {
        const campaignId = searchParams.get('campaign_id');
        const contactId = searchParams.get('contact_id');
        
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id é obrigatório'
          }, { status: 400 });
        }

        try {
          // Incrementar contador de abertura na campanha
          await EmailCampaignsDB.incrementOpened(campaignId);
          
          // Se temos contact_id, atualizar status do envio específico
          if (contactId) {
            await EmailContactsDB.updateEmailStatus(contactId, 'opened');
            
            // Encontrar o send específico e atualizar
            const sends = await EmailSendsDB.findByCampaign(campaignId);
            const send = sends.find(s => s.contact_id === contactId);
            if (send) {
              await EmailSendsDB.updateStatus(send.id, 'opened', { opened_at: new Date() });
            }
          }
          
          // Retornar pixel transparente (1x1 GIF)
          const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
          return new NextResponse(pixel, {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Content-Length': pixel.length.toString()
            }
          });
        } catch (error) {
          console.error('Erro no tracking de abertura:', error);
          // Mesmo em caso de erro, retornar pixel para não quebrar a renderização do email
          const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
          return new NextResponse(pixel, {
            headers: {
              'Content-Type': 'image/gif',
              'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
          });
        }
      }

      case 'track_click': {
        const campaignId = searchParams.get('campaign_id');
        const contactId = searchParams.get('contact_id');
        const url = searchParams.get('url');
        
        if (!campaignId || !url) {
          return NextResponse.json({
            success: false,
            error: 'campaign_id e url são obrigatórios'
          }, { status: 400 });
        }

        try {
          // Incrementar contador de clique na campanha
          await EmailCampaignsDB.incrementClicked(campaignId);
          
          // Se temos contact_id, atualizar status do envio específico
          if (contactId) {
            await EmailContactsDB.updateEmailStatus(contactId, 'clicked');
            
            // Encontrar o send específico e atualizar
            const sends = await EmailSendsDB.findByCampaign(campaignId);
            const send = sends.find(s => s.contact_id === contactId);
            if (send) {
              await EmailSendsDB.updateStatus(send.id, 'clicked', { clicked_at: new Date() });
            }
          }
          
          // Redirecionar para URL original
          return NextResponse.redirect(decodeURIComponent(url));
        } catch (error) {
          console.error('Erro no tracking de clique:', error);
          // Em caso de erro, redirecionar para URL mesmo assim
          return NextResponse.redirect(decodeURIComponent(url));
        }
      }

      case 'auto_restart': {
        const { executeAutoRestart } = await import('@/lib/email-auto-restart');
        const result = await executeAutoRestart();
        return NextResponse.json(result.success ? result : result, { 
          status: result.success ? 200 : 500 
        });
      }

      case 'delete_campaign': {
        const campaignId = searchParams.get('id');
        if (!campaignId) {
          return NextResponse.json({
            success: false,
            error: 'ID da campanha é obrigatório'
          }, { status: 400 });
        }

        try {
          const deleted = await EmailCampaignsDB.deleteById(campaignId);
          if (deleted) {
            return NextResponse.json({
              success: true,
              message: 'Campanha excluída com sucesso'
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Campanha não encontrada'
            }, { status: 404 });
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao excluir campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'delete_all_campaigns': {
        try {
          const result = await sql`DELETE FROM email_campaigns`;
          await sql`DELETE FROM email_sends`; // Limpar envios também
          
          return NextResponse.json({
            success: true,
            message: `${result.rowCount || 0} campanhas excluídas com sucesso`
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao excluir campanhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'update_campaign_status': {
        const campaignId = searchParams.get('id');
        const newStatus = searchParams.get('status');
        
        if (!campaignId || !newStatus) {
          return NextResponse.json({
            success: false,
            error: 'ID da campanha e status são obrigatórios'
          }, { status: 400 });
        }

        try {
          await EmailCampaignsDB.updateStatus(campaignId, newStatus as any);
          return NextResponse.json({
            success: true,
            message: `Status da campanha atualizado para: ${newStatus}`
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'retry_failed': {
        try {
          console.log('🔄 Iniciando retry manual de emails falhados...');
          const result = await processEmailRetries();
          
          return NextResponse.json({
            success: result.success,
            data: {
              message: `Retry processado: ${result.retried} emails recolocados na fila`,
              processed: result.processed,
              retried: result.retried,
              failed: result.failed,
              details: result.details
            }
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro no retry: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      case 'debug_stats': {
        try {
          const [contacts, campaigns, campaignStats] = await Promise.all([
            EmailContactsDB.getStats(),
            EmailCampaignsDB.findAll(),
            EmailCampaignsDB.getMetrics()
          ]);

          // Buscar envios por campanha
          const campaignDetails = await Promise.all(
            campaigns.map(async (campaign) => {
              const sends = await EmailSendsDB.findByCampaign(campaign.id);
              const sendStats = await EmailSendsDB.getCampaignStats(campaign.id);
              return {
                ...campaign,
                sends: sends.length,
                sendStats
              };
            })
          );

          // Buscar estatísticas de retry
          const failedForRetry = await EmailSendsDB.findFailedForRetry();

          return NextResponse.json({
            success: true,
            debug: {
              contacts,
              campaigns: campaignDetails,
              campaignStats,
              totalCampaigns: campaigns.length,
              completedCampaigns: campaigns.filter(c => c.status === 'completed' || c.status === 'sent').length,
              retryStats: {
                eligibleForRetry: failedForRetry.length,
                details: failedForRetry.map(send => ({
                  email: send.email,
                  retryCount: send.retry_count,
                  retryAfter: send.retry_after,
                  failedReason: send.failed_reason
                }))
              }
            }
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Erro no debug: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Ação não encontrada: ${action}. Ações disponíveis: stats, contacts, campaigns, campaign_stats, auto_restart, retry_failed, debug_stats, etc.`
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Erro na consulta da API de email marketing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    }, { status: 500 });
  }
}

// 🔄 Função local para auto-restart de campanhas (movida para lib)
async function executeAutoRestart() {
  try {
    await ensureTablesExist();
    
    console.log('🚀 Iniciando auto-restart de campanhas pausadas...');
    
    // 1. Buscar campanhas pausadas
    const allCampaigns = await EmailCampaignsDB.findAll();
    const pausedCampaigns = allCampaigns.filter(c => c.status === 'paused');
    
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
        console.log(`🔍 Verificando campanha: ${campaign.name} (${campaign.id})`);
        
        // Buscar envios pendentes desta campanha
        const sends = await EmailSendsDB.findByCampaign(campaign.id);
        const pendingSends = sends.filter(send => send.status === 'pending');
        
        console.log(`📧 Campanha ${campaign.name}: ${pendingSends.length} envios pendentes`);
        
        if (pendingSends.length === 0) {
          console.log(`⚠️ Campanha ${campaign.name} não tem envios pendentes, pulando...`);
          continue;
        }
        
        // 3. Buscar contatos para os envios pendentes
        const contactIds = pendingSends.map(send => send.contact_id);
        const contacts: EmailContact[] = [];
        
        for (const contactId of contactIds) {
          const contact = await EmailContactsDB.findById(contactId);
          if (contact) {
            contacts.push(contact);
          }
        }
        
        console.log(`👥 Encontrados ${contacts.length} contatos para reprocessar`);
        
        if (contacts.length === 0) {
          console.log(`⚠️ Nenhum contato encontrado para campanha ${campaign.name}`);
          continue;
        }
        
        // 4. Reiniciar processo de envio assíncrono
        console.log(`🔄 Reiniciando campanha: ${campaign.name}`);
        await EmailCampaignsDB.updateStatus(campaign.id, 'sending');
        
        // Processar de forma assíncrona (não aguardar conclusão)
        processCampaignSends(campaign, contacts, pendingSends).catch(error => {
          console.error(`❌ Erro no reprocessamento da campanha ${campaign.name}:`, error);
          // Em caso de erro, marcar como pausada novamente
          EmailCampaignsDB.updateStatus(campaign.id, 'paused').catch(e => 
            console.error('Erro ao atualizar status para paused:', e)
          );
        });
        
        restarted++;
        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          pendingEmails: contacts.length,
          status: 'restarted'
        });
        
        console.log(`✅ Campanha ${campaign.name} reiniciada com sucesso`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar campanha ${campaign.name}:`, error);
        failed++;
        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    const summary = {
      totalPausedCampaigns: pausedCampaigns.length,
      restarted,
      failed,
      details: results
    };
    
    console.log('📊 Resumo do auto-restart:', summary);
    
    return {
      success: true,
      data: {
        message: `Auto-restart concluído: ${restarted} campanhas reiniciadas, ${failed} falharam`,
        ...summary
      }
    };
    
  } catch (error) {
    console.error('❌ Erro no auto-restart:', error);
    return {
      success: false,
      error: `Erro no auto-restart: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

// 🔄 Executar auto-retry antes de iniciar nova campanha
async function executeAutoRetry(): Promise<void> {
  try {
    console.log('🔄 AUTO-RETRY PRÉ-CAMPANHA:');
    const result = await processEmailRetries();
    
    console.log(`✅ AUTO-RETRY CONCLUÍDO:`, {
      processados: result.processed,
      recolocados: result.retried,
      falhas: result.failed,
      timestamp: new Date().toISOString()
    });
    
    if (result.details.length > 0) {
      console.log('📋 Detalhes do auto-retry:', result.details.slice(0, 5)); // Primeiros 5
    }
  } catch (error) {
    console.error('❌ ERRO AUTO-RETRY:', error);
  }
}

// Função para processar envios da campanha de forma assíncrona COM AUTO-RESTART
async function processCampaignSends(campaign: EmailCampaign, contacts: EmailContact[], emailSends: any[]) {
  const campaignStartTime = Date.now();
  
  emailMarketingLogger.info(
    EmailEvent.CAMPAIGN_STARTED,
    'Campaign processing started',
    {
      campaignId: campaign.id,
      metadata: {
        campaignName: campaign.name,
        contactCount: contacts.length,
        status: campaign.status
      }
    }
  );
  
  const credentials = getGmailCredentials();
  
  if (!credentials.email || !credentials.password) {
    emailMarketingLogger.critical(
      EmailEvent.CREDENTIALS_LOADED,
      'Gmail credentials not configured - campaign paused',
      { campaignId: campaign.id }
    );
    console.error('❌ Credenciais Gmail não configuradas');
    // Marcar campanha como paused para reprocessamento posterior
    await EmailCampaignsDB.updateStatus(campaign.id, 'paused');
    return;
  }
  
  emailMarketingLogger.info(
    EmailEvent.CREDENTIALS_LOADED,
    'Gmail credentials loaded successfully',
    { campaignId: campaign.id, metadata: { email: credentials.email } }
  );

  // 🚨 SISTEMA DE HEARTBEAT para auto-recovery
  const heartbeatInterval = setInterval(async () => {
    try {
      // Atualizar timestamp da campanha a cada 2 minutos para indicar que está ativa
      await EmailCampaignsDB.updateTimestamp(campaign.id);
      
      emailMarketingLogger.logHeartbeat(
        campaign.id,
        'active',
        {
          uptime: Date.now() - campaignStartTime,
          memoryUsage: process.memoryUsage().heapUsed,
          contactsProcessed: contacts.length
        }
      );
      
      console.log(`💓 Heartbeat: Campanha ${campaign.name} ainda ativa`);
    } catch (error) {
      emailMarketingLogger.error(
        EmailEvent.HEARTBEAT,
        'Heartbeat failed',
        { campaignId: campaign.id, error: error as Error }
      );
      console.error('❌ Erro no heartbeat:', error);
    }
  }, 120000); // 2 minutos

  // Função para limpar heartbeat
  const cleanup = () => {
    clearInterval(heartbeatInterval);
  };

  // Auto-cleanup em caso de erro
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: credentials.email,
      pass: credentials.password,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // 🔍 Verificar conectividade antes de iniciar envios
  try {
    await transporter.verify();
    emailMarketingLogger.logCampaignStart(campaign.id, {
      message: 'SMTP transporter verificado com sucesso',
      credentials: credentials.email
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    emailMarketingLogger.logEmailError(campaign.id, 'transporter_verification', '', errorMessage);
    return NextResponse.json({
      success: false,
      error: 'Falha na verificação SMTP: ' + errorMessage
    }, { status: 500 });
  }

  let successCount = 0;
  let failureCount = 0;
  // Rate limiting otimizado para Gmail (3x mais rápido):
  // - Gmail permite 500 emails/dia via SMTP 
  // - Otimizado: até 3 emails por minuto = 180 emails/hora
  // - Lotes maiores com pausa menor para máxima eficiência
  const batchSize = 15; // Processar 15 emails por vez (mais otimizado)
  const batchDelayMs = 15000; // 15 segundos entre lotes (4x mais rápido)

  // 🔄 Executar auto-retry antes de iniciar
  await executeAutoRetry();
  
  emailMarketingLogger.info(
    EmailEvent.CAMPAIGN_STARTED,
    'Campaign email sending initiated',
    {
      campaignId: campaign.id,
      metadata: {
        totalContacts: contacts.length,
        batchSize,
        batchDelay: batchDelayMs,
        rateLimit: `${batchSize} emails per ${batchDelayMs/1000}s`
      }
    }
  );
  
  console.log(`🚀 Iniciando envio da campanha ${campaign.name} para ${contacts.length} contatos`);
  console.log(`⚙️ Rate limiting: ${batchSize} emails por lote, ${batchDelayMs/1000}s entre lotes`);

  // Processar em lotes
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batchStartTime = Date.now();
    const batch = contacts.slice(i, i + batchSize);
    const batchSends = emailSends.slice(i, i + batchSize);
    const batchIndex = Math.floor(i/batchSize) + 1;
    
    emailMarketingLogger.info(
      EmailEvent.BATCH_STARTED,
      `Batch ${batchIndex} processing started`,
      {
        campaignId: campaign.id,
        metadata: {
          batchIndex,
          batchSize: batch.length,
          totalBatches: Math.ceil(contacts.length / batchSize),
          progress: `${Math.round(((i + batch.length) / contacts.length) * 100)}%`
        }
      }
    );
    
    console.log(`📧 Processando lote ${batchIndex} - ${batch.length} emails`);
    
    // Processar lote em paralelo
    const batchPromises = batch.map(async (contact, index) => {
      try {
        const emailSend = batchSends[index];
        
        // Personalizar HTML com dados do contato
        let personalizedHtml = (campaign.html_content || '')
          .replace(/{{nome}}/g, contact.nome)
          .replace(/{{email}}/g, contact.email)
          .replace(/{{unsubscribe_url}}/g, `https://www.fly2any.com/unsubscribe?token=${contact.unsubscribe_token}`);
        
        // Injetar tracking completo (pixels + links rastreáveis)
        personalizedHtml = EmailTrackingSystem.injectTrackingIntoEmail(
          personalizedHtml, 
          emailSend.id, 
          campaign.id
        );
        
        // Enviar email com envelope e headers customizados para melhor tracking
        const result = await transporter.sendMail({
          from: `"Fly2Any" <${credentials.email}>`,
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml,
          // Envelope customizado para bounce tracking
          envelope: {
            from: `bounce+${emailSend.id}@fly2any.com`,
            to: contact.email
          },
          // Headers adicionais para melhor tracking
          headers: {
            'X-Campaign-ID': campaign.id,
            'X-Send-ID': emailSend.id,
            'X-Contact-Email': contact.email,
            'List-Unsubscribe': `<https://www.fly2any.com/unsubscribe?token=${contact.unsubscribe_token}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }
        });
        
        // Atualizar status do envio
        await EmailSendsDB.updateStatus(emailSend.id, 'sent', {
          sent_at: new Date(),
          message_id: result?.messageId || 'unknown'
        });
        
        // Atualizar status do contato
        await EmailContactsDB.updateEmailStatus(contact.id, 'sent', new Date());
        
        // 🎯 Registrar evento de envio no tracking
        await EmailTrackingSystem.trackEvent({
          send_id: emailSend.id,
          campaign_id: campaign.id,
          contact_email: contact.email,
          event_type: 'sent',
          event_data: {
            message_id: result?.messageId || 'unknown',
            timestamp: new Date().toISOString()
          }
        });
        
        // 📈 LOG DETALHADO DE SUCESSO
        emailMarketingLogger.logEmailSuccess(
          campaign.id,
          contact.id,
          contact.email,
          {
            messageId: result?.messageId || 'unknown',
            processingTime: Date.now() - batchStartTime,
            retryCount: emailSend.retry_count || 0
          }
        );
        
        console.log(`✅ SUCESSO EMAIL - ${contact.email}:`, {
          campanha: campaign.name,
          tentativa: (emailSend.retry_count || 0) + 1,
          messageId: (result?.messageId || 'unknown').substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        });
        
        return { success: true, email: contact.email };
        
      } catch (error) {
        const emailSend = batchSends[index];
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Verificar se erro é elegível para retry
        const isRetryable = EmailSendsDB.isRetryableError(errorMessage);
        
        // 📈 LOG DETALHADO DE FALHA
        emailMarketingLogger.logEmailFailure(
          campaign.id,
          contact.id,
          contact.email,
          error as Error,
          {
            retryCount: emailSend.retry_count,
            willRetry: isRetryable && emailSend.retry_count < 4
          }
        );
        
        console.log(`🚨 FALHA EMAIL - ${contact.email}:`, {
          campanha: campaign.name,
          tentativa: emailSend.retry_count + 1,
          erro: errorMessage,
          eligivelRetry: isRetryable,
          maxTentativas: 4
        });
        
        if (isRetryable && emailSend.retry_count < 4) {
          // Agendar retry com delay exponencial
          const retryDelays = [1, 5, 15, 60]; // minutos
          const delayMinutes = retryDelays[Math.min(emailSend.retry_count, retryDelays.length - 1)];
          
          await EmailSendsDB.scheduleRetry(emailSend.id, emailSend.retry_count, errorMessage);
          
          console.log(`🔄 RETRY AGENDADO - ${contact.email}:`, {
            tentativa: emailSend.retry_count + 1,
            proximoRetry: `${delayMinutes} minutos`,
            motivo: errorMessage.substring(0, 100)
          });
        } else {
          // Marcar como falha definitiva
          await EmailSendsDB.updateStatus(emailSend.id, 'failed', {
            failed_reason: errorMessage
          });
          
          await EmailContactsDB.updateEmailStatus(contact.id, 'failed');
          
          console.error(`❌ FALHA DEFINITIVA - ${contact.email}:`, {
            tentativas: emailSend.retry_count + 1,
            motivoFinal: errorMessage,
            acao: isRetryable ? 'Max tentativas atingido' : 'Erro não retriable'
          });
        }
        
        return { success: false, email: contact.email, error };
      }
    });
    
    // Aguardar conclusão do lote
    const results = await Promise.all(batchPromises);
    
    // Contar sucessos e falhas com log de lote
    let batchSuccesses = 0;
    let batchFailures = 0;
    
    results.forEach(result => {
      if (result.success) {
        successCount++;
        batchSuccesses++;
      } else {
        failureCount++;
        batchFailures++;
      }
    });
    
    // 📈 LOG DE LOTE
    const batchProcessingTime = Date.now() - batchStartTime;
    
    emailMarketingLogger.logBatchProcessing(
      campaign.id,
      batchIndex,
      batch.length,
      {
        successes: batchSuccesses,
        failures: batchFailures,
        processingTime: batchProcessingTime
      }
    );
    
    console.log(`📦 LOTE ${batchIndex} FINALIZADO:`, {
      sucessos: batchSuccesses,
      falhas: batchFailures,
      total: batch.length,
      taxaSucesso: `${((batchSuccesses/batch.length)*100).toFixed(1)}%`
    });
    
    // Aguardar entre lotes (rate limiting otimizado)
    if (i + batchSize < contacts.length) {
      const nextBatch = Math.floor(i/batchSize) + 2;
      
      emailMarketingLogger.logRateLimited(
        campaign.id,
        batchDelayMs,
        `Rate limiting delay between batch ${batchIndex} and ${nextBatch}`
      );
      
      console.log(`⏸️ Aguardando ${batchDelayMs/1000} segundos antes do lote ${nextBatch}...`);
      await new Promise(resolve => setTimeout(resolve, batchDelayMs));
    }
  }

  // Atualizar estatísticas da campanha
  await EmailCampaignsDB.updateStats(campaign.id, {
    total_recipients: contacts.length,
    total_sent: successCount
  });
  
  await EmailCampaignsDB.updateStatus(campaign.id, 'completed');

  // 📈 LOG FINAL DETALHADO DA CAMPANHA
  const totalEmails = contacts.length;
  const successRate = totalEmails > 0 ? ((successCount / totalEmails) * 100) : 0;
  const campaignDuration = Date.now() - campaignStartTime;
  
  emailMarketingLogger.logCampaignMetrics(
    campaign.id,
    {
      totalEmails,
      successCount,
      failureCount,
      successRate,
      duration: campaignDuration,
      averageResponseTime: Math.round(campaignDuration / totalEmails)
    }
  );
  
  emailMarketingLogger.info(
    EmailEvent.CAMPAIGN_COMPLETED,
    'Campaign processing completed successfully',
    {
      campaignId: campaign.id,
      metadata: {
        campaignName: campaign.name,
        finalStatus: 'completed',
        totalProcessed: totalEmails,
        successRate: `${successRate.toFixed(1)}%`
      },
      duration: campaignDuration
    }
  );
  
  console.log(`✅ CAMPANHA FINALIZADA - ${campaign.name}:`, {
    totalEmails,
    sucessos: successCount,
    falhas: failureCount,
    taxaSucesso: `${successRate.toFixed(1)}%`,
    duracaoAproximada: `${Math.ceil((totalEmails / batchSize) * (batchDelayMs / 1000 / 60))} minutos`,
    timestamp: new Date().toISOString()
  });
  
  // 🧹 Limpar heartbeat
  cleanup();
  
  emailMarketingLogger.info(
    EmailEvent.CAMPAIGN_COMPLETED,
    'Campaign cleanup completed',
    { campaignId: campaign.id, duration: Date.now() - campaignStartTime }
  );
}

// 🔧 Função auxiliar para adicionar updateTimestamp no EmailCampaignsDB se não existir
// (Para ser adicionada no arquivo email-marketing-db.ts)
async function ensureUpdateTimestampExists() {
  // Esta função será implementada no arquivo de database
  console.log('⚠️ Lembrete: Implementar updateTimestamp no EmailCampaignsDB');
}