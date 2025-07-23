'use client';

import React, { useState, useEffect } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
  type: 'promotional' | 'newsletter' | 'reactivation';
}

interface EditableFields {
  headerTitle?: string;
  headerSubtitle?: string;
  mainTitle?: string;
  mainContent?: string;
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
  whatsappNumber?: string;
  email?: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editableFields, setEditableFields] = useState<EditableFields>({});
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [showUseTemplateModal, setShowUseTemplateModal] = useState(false);
  const [selectedTemplateForUse, setSelectedTemplateForUse] = useState<EmailTemplate | null>(null);
  const [campaignSettings, setCampaignSettings] = useState({
    segment: '',
    testEmail: '',
    sendType: 'test' as 'test' | 'campaign'
  });
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Carregar templates salvos do localStorage
  const loadSavedTemplates = () => {
    try {
      const saved = localStorage.getItem('fly2any_email_templates');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar templates salvos:', error);
      return null;
    }
  };

  // Salvar templates no localStorage
  const saveTemplatesLocally = (templatesData: EmailTemplate[]) => {
    try {
      localStorage.setItem('fly2any_email_templates', JSON.stringify(templatesData));
      return true;
    } catch (error) {
      console.error('Erro ao salvar templates:', error);
      return false;
    }
  };

  const loadTemplates = async () => {
    try {
      // Carregar templates da API primeiro
      const response = await fetch('/api/email-templates');
      const data = await response.json();
      
      if (data.success && data.templates && data.templates.length > 0) {
        console.log('✅ Templates carregados da API:', data.templates.length);
        setTemplates(data.templates);
        // Salvar no localStorage como backup
        saveTemplatesLocally(data.templates);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar da API, usando templates padrão:', error);
    }
    
    // Fallback: Templates PREMIUM COMPACTOS - Versão mais recente e otimizada
    const systemTemplates: EmailTemplate[] = [
      {
        id: 'promotional',
        name: 'Super Oferta Premium - Ultra Compacto',
        description: 'Template promocional ultra compacto com design premium e alta conversão',
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
              
              <!-- Header Ultra Compacto -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 12px 15px; text-align: center; position: relative;" class="mobile-compact">
                <!-- Urgência integrada -->
                <div style="background: rgba(0,0,0,0.4); margin: -12px -15px 8px -15px; padding: 6px; font-size: 13px; font-weight: 800;" class="mobile-font-small">
                  ⏰ ÚLTIMAS 23 VAGAS • Expira 18h47min • 🔥 HISTÓRICO!
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

              </div>
            </a>
            
            <!-- Footer Ultra Compacto -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #f1f5f9; padding: 12px 15px; text-align: center; width: 100%; margin-top: 0; position: relative;" class="mobile-compact">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(135deg, #dc2626, #fbbf24, #10b981);"></div>
              
              <!-- Contatos + CTA Final -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;" class="mobile-stack">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <div style="color: white; font-size: 16px; font-weight: 900;">✈️ FLY2ANY</div>
                  <div style="text-align: left;">
                    <div style="font-size: 9px; color: #64748b; font-weight: 600; line-height: 1.2;">21 anos • 50K+ clientes • IATA</div>
                  </div>
                </div>
                
                <a href="https://www.fly2any.com" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1e293b; padding: 8px 16px; text-decoration: none; border-radius: 15px; font-weight: 900; font-size: 12px;" class="mobile-button">
                  🚀 GARANTIR AGORA
                </a>
              </div>
              
              <!-- Contatos horizontais -->
              <div style="display: flex; gap: 6px; justify-content: center;" class="mobile-stack">
                <a href="https://wa.me/1151944717" style="background: rgba(37, 211, 102, 0.2); color: #25d366; padding: 6px 8px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px;" class="mobile-font-small">
                  📱 WhatsApp
                </a>
                <a href="mailto:info@fly2any.com" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa; padding: 6px 8px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 11px;" class="mobile-font-small">
                  📧 Email
                </a>
              </div>
              
              <!-- Unsubscribe link -->
              <div style="font-size: 8px; color: #64748b; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                <a href="{{unsubscribe_url}}" style="color: #94a3b8; text-decoration: none;">⚙️ Cancelar inscrição</a>
              </div>
            </div>
          </body>
          </html>`
      },
      {
        id: 'newsletter',
        name: 'Newsletter Educativa Premium',
        description: 'Newsletter com value-driven content e soft selling',
        type: 'newsletter',
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
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Newsletter Exclusiva • Edição #47</p>
              </div>

              <!-- Welcome Message -->
              <div style="padding: 25px; background: #fafafa; border-bottom: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                  Olá, <strong>Viajante</strong>! 👋<br>
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
                    ✅ <em>Comprovado: Família Santos economizou $1.847 comprando o pacote COMPLETO ao invés de comprar separado.</em>
                  </p>
                </div>

                <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
                  📊 ANÁLISE REAL: O que INCLUÍMOS nos pacotes
                </h2>
                
                <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                  <div style="background: #10b981; color: white; padding: 15px; font-weight: 600;">
                    🎯 TUDO INCLUÍDO NOS NOSSOS PACOTES
                  </div>
                  
                  <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">✈️ PASSAGENS AÉREAS</div>
                        <div style="font-size: 12px; color: #6b7280;">Incluso no pacote</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">✅ INCLUÍDO</div>
                        <div style="font-size: 12px; color: #374151;">Voos nacionais e internacionais</div>
                      </div>
                    </div>
                  </div>

                  <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">🏨 HOTÉIS 4 E 5 ESTRELAS</div>
                        <div style="font-size: 12px; color: #6b7280;">Incluso no pacote</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">✅ INCLUÍDO</div>
                        <div style="font-size: 12px; color: #374151;">Localização premium e café da manhã</div>
                      </div>
                    </div>
                  </div>

                  <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">🚗 ALUGUEL DE CARROS + GPS</div>
                        <div style="font-size: 12px; color: #6b7280;">Incluso no pacote</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">✅ INCLUÍDO</div>
                        <div style="font-size: 12px; color: #374151;">Seguro total e GPS incluso</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Success Story -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #fbbf24;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">
                    🏆 CASE DE SUCESSO DA SEMANA
                  </h3>
                  <div style="display: flex; align-items: start; gap: 15px;">
                    <div style="flex: 1;">
                      <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.6; font-size: 14px;">
                        <strong>Família Oliveira</strong> (4 pessoas) queria Disney World COMPLETA. Ao invés de comprar separado, fecharam nosso PACOTE TOTAL e conseguiram:
                      </p>
                      <div style="background: white; padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <div style="color: #059669; font-weight: 700; font-size: 16px;">💰 PACOTE COMPLETO por $6.890</div>
                        <div style="font-size: 12px; color: #6b7280;">Passagens + Hotel Disney + Carro + Ingressos + Seguro TUDO INCLUÍDO</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Section -->
                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1;">
                  <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 QUER RESULTADOS ASSIM?</h3>
                  <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Há 21 anos criamos pacotes COMPLETOS que incluem TUDO: passagens, hotéis, carros, passeios e seguro viagem. Você só se preocupa em aproveitar!
                  </p>
                  <a href="https://fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                    📱 QUERO PACOTE COMPLETO
                  </a>
                </div>
              </div>

              <!-- Quick Tips -->
              <div style="background: #f0f9ff; padding: 25px;">
                <h3 style="color: #374151; margin: 0 0 20px 0; text-align: center;">⚡ DICAS RÁPIDAS</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🎫</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">FLEXIBILIDADE</div>
                    <div style="font-size: 11px; color: #6b7280;">±3 dias = 40% economia</div>
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📅</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">ANTECEDÊNCIA</div>
                    <div style="font-size: 11px; color: #6b7280;">8-12 semanas ideal</div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">
                  <strong>Fly2Any Insider</strong> • Seus especialistas em viagens internacionais
                </p>
                <p style="margin: 0 0 15px 0; font-size: 12px; opacity: 0.8;">
                  21 anos de experiência • +15.000 clientes satisfeitos • Pacotes COMPLETOS
                </p>
                <div style="font-size: 12px; opacity: 0.7;">
                  📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
                </div>
              </div>
            </div>
          </body>
          </html>`
      },
      {
        id: 'reactivation',
        name: 'Reativação Emocional VIP',
        description: 'Template de reativação com apelo emocional e oferta irresistível',
        type: 'reactivation',
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
                  Que saudades de você... 💔
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
                <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #fecaca; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #7f1d1d; font-style: italic;">
                    💭 <em>"A vida é feita de momentos, e os melhores momentos acontecem quando estamos viajando."</em>
                  </p>
                </div>
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
                        ⏰ Válido por 5 dias • Oferta EXCLUSIVA para quem já viajou conosco!
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Destinations Showcase -->
                <h3 style="text-align: center; color: #374151; margin: 0 0 20px 0; font-size: 20px;">
                  🌎 PACOTES COMPLETOS QUE VÃO TE SURPREENDER
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 15px; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 5px;">🏖️</div>
                      <div style="font-weight: 600;">MIAMI</div>
                    </div>
                    <div style="padding: 15px; text-align: center;">
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">PACOTE COMPLETO com 30% OFF</div>
                      <div style="font-weight: 700; color: #be123c; font-size: 18px;">$1.949</div>
                      <div style="font-size: 11px; color: #059669;">💰 Passagem+Hotel+Carro+Seguro TUDO INCLUÍDO</div>
                    </div>
                  </div>

                  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 5px;">🗽</div>
                      <div style="font-weight: 600;">NEW YORK</div>
                    </div>
                    <div style="padding: 15px; text-align: center;">
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">PACOTE COMPLETO com 30% OFF</div>
                      <div style="font-weight: 700; color: #be123c; font-size: 18px;">$2.299</div>
                      <div style="font-size: 11px; color: #059669;">💰 Passagem+Hotel+Carro+Passeios TUDO INCLUÍDO</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Emotional Trigger -->
              <div style="background: #f0f9ff; padding: 25px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">
                  🤔 Por que você deveria viajar AGORA?
                </h3>
                <div style="color: #374151; line-height: 1.6; font-size: 14px;">
                  <div style="margin-bottom: 10px;">✅ <strong>Você merece relaxar</strong> depois de tanto trabalho</div>
                  <div style="margin-bottom: 10px;">✅ <strong>Nossos PACOTES COMPLETOS nunca tiveram tanto desconto</strong> (30% OFF é histórico!)</div>
                  <div style="margin-bottom: 10px;">✅ <strong>Criar memórias</strong> é o melhor investimento que existe</div>
                  <div style="margin-bottom: 10px;">✅ <strong>Sua família/amigos</strong> vão adorar esta surpresa</div>
                </div>
              </div>

              <!-- Social Proof -->
              <div style="background: #ecfdf5; padding: 20px; margin: 0; border-left: 4px solid #10b981;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 16px;">⭐⭐⭐⭐⭐</span>
                  <span style="margin-left: 10px; font-weight: 600; color: #374151;">Carlos Mendes</span>
                  <span style="margin-left: 10px; color: #6b7280; font-size: 12px;">cliente que retornou</span>
                </div>
                <p style="color: #374151; font-style: italic; margin: 0; font-size: 14px; line-height: 1.5;">
                  "Estava há 2 anos sem viajar, mas a oferta era irresistível! Usei o desconto de 25% e levei toda família para Orlando. Foi a melhor decisão do ano! Obrigado Fly2Any por me lembrar da importância de viajar."
                </p>
              </div>

              <!-- Urgency CTA -->
              <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);">
                <div style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); padding: 6px; border-radius: 16px; display: inline-block; margin-bottom: 15px;">
                  <a href="https://fly2any.com" style="background: linear-gradient(135deg, #be123c 0%, #dc2626 100%); color: white; padding: 20px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(190, 18, 60, 0.4);">
                    💖 QUERO VOLTAR A VIAJAR
                  </a>
                </div>
                <div style="font-size: 14px; color: #be123c; margin-top: 10px; font-weight: 600;">
                  ⏰ Oferta expira em 7 dias • Código VOLTEI30
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
                  ✅ Sem taxa de conveniência • Cancelamento grátis em 24h • Parcelamento em 12x
                </div>
              </div>

              <!-- Final Message -->
              <div style="padding: 25px; background: white; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; font-style: italic;">
                  Estamos aqui esperando por você. Sua próxima aventura está a um clique de distância... ✈️
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">
                  <strong>Fly2Any</strong> • 21 anos conectando brasileiros ao mundo
                </p>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                  📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
                </p>
              </div>
            </div>
          </body>
          </html>`
      }
    ];
    
    // Tentar carregar templates salvos primeiro
    const savedTemplates = loadSavedTemplates();
    
    if (savedTemplates && savedTemplates.length > 0) {
      setTemplates(savedTemplates);
    } else {
      setTemplates(systemTemplates);
      // Salvar templates padrão na primeira vez
      saveTemplatesLocally(systemTemplates);
    }
    
    setLoading(false);
  };

  const previewEmail = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  // Extrair campos editáveis do HTML
  const extractEditableFields = (html: string): EditableFields => {
    const fields: EditableFields = {};
    
    // Extrair título do header
    const headerTitleMatch = html.match(/<h1[^>]*>([^<]*)<\/h1>/);
    if (headerTitleMatch) {
      fields.headerTitle = headerTitleMatch[1].replace(/✈️\s*/, '');
    }
    
    // Extrair subtítulo do header
    const headerSubtitleMatch = html.match(/<h1[^>]*>.*?<\/h1>\s*<p[^>]*>([^<]*)<\/p>/);
    if (headerSubtitleMatch) {
      fields.headerSubtitle = headerSubtitleMatch[1];
    }
    
    // Extrair título principal
    const mainTitleMatch = html.match(/<h2[^>]*[^>]*>([^<]*)<\/h2>/);
    if (mainTitleMatch) {
      fields.mainTitle = mainTitleMatch[1].replace(/🔥\s*|🎯\s*|💡\s*/g, '');
    }
    
    // Extrair texto do CTA
    const ctaMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/);
    if (ctaMatch) {
      fields.ctaUrl = ctaMatch[1];
      fields.ctaText = ctaMatch[2].replace(/🚀\s*|📱\s*|💖\s*/g, '');
    }
    
    // Extrair WhatsApp
    const whatsappMatch = html.match(/WhatsApp:\s*([+\d\s\-()]+)/);
    if (whatsappMatch) {
      fields.whatsappNumber = whatsappMatch[1].trim();
    }
    
    // Extrair email
    const emailMatch = html.match(/📧\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      fields.email = emailMatch[1];
    }
    
    return fields;
  };

  // Aplicar campos editáveis ao HTML
  const applyEditableFields = (html: string, fields: EditableFields): string => {
    let updatedHtml = html;
    
    if (fields.headerTitle) {
      updatedHtml = updatedHtml.replace(
        /<h1([^>]*)>([^<]*)<\/h1>/,
        `<h1$1>✈️ ${fields.headerTitle}</h1>`
      );
    }
    
    if (fields.headerSubtitle) {
      updatedHtml = updatedHtml.replace(
        /(<h1[^>]*>.*?<\/h1>\s*<p[^>]*>)([^<]*)(<\/p>)/,
        `$1${fields.headerSubtitle}$3`
      );
    }
    
    if (fields.mainTitle) {
      updatedHtml = updatedHtml.replace(
        /<h2([^>]*)>([^<]*)<\/h2>/,
        `<h2$1>🎯 ${fields.mainTitle}</h2>`
      );
    }
    
    if (fields.ctaText && fields.ctaUrl) {
      updatedHtml = updatedHtml.replace(
        /<a([^>]*)href="[^"]*"([^>]*)>([^<]*)<\/a>/,
        `<a$1href="${fields.ctaUrl}"$2>🚀 ${fields.ctaText}</a>`
      );
    }
    
    if (fields.whatsappNumber) {
      updatedHtml = updatedHtml.replace(
        /(WhatsApp:\s*)([+\d\s\-()]+)/g,
        `$1${fields.whatsappNumber}`
      );
      updatedHtml = updatedHtml.replace(
        /wa\.me\/[\d]+/g,
        `wa.me/${fields.whatsappNumber.replace(/[^\d]/g, '')}`
      );
    }
    
    if (fields.email) {
      updatedHtml = updatedHtml.replace(
        /(📧\s*)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        `$1${fields.email}`
      );
    }
    
    return updatedHtml;
  };

  const editTemplate = (template: EmailTemplate) => {
    setEditingTemplate({...template});
    setEditableFields(extractEditableFields(template.html));
    setIsCreatingNew(false);
    setShowEditor(true);
  };

  const createNewTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `custom_${Date.now()}`,
      name: 'Novo Template Personalizado',
      description: 'Template criado do zero para necessidades específicas',
      type: 'promotional',
      subject: '✨ Novo template - Personalize seu assunto aqui',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">✈️ FLY2ANY</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">21 anos conectando brasileiros ao mundo</p>
            </div>

            <!-- Conteúdo Principal -->
            <div style="padding: 40px; text-align: center;">
              <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">
                🎯 Seu Título Aqui
              </h2>
              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0; line-height: 1.6;">
                Escreva sua mensagem principal aqui. Use linguagem persuasiva e direta para capturar a atenção do leitor.
              </p>
              
              <!-- CTA Principal -->
              <div style="margin: 30px 0;">
                <a href="https://fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 18px;">
                  🚀 SEU CTA AQUI
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                Adicione informações adicionais ou benefícios aqui
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #374151; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">
                <strong>Fly2Any</strong> • 21 anos conectando brasileiros ao mundo
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                📱 <a href="https://wa.me/5511999999999" style="color: #25d366; text-decoration: none;">WhatsApp: +55 11 99999-9999</a> • 📧 info@fly2any.com
              </p>
            </div>
          </div>
        </body>
        </html>`
    };
    
    setEditingTemplate(newTemplate);
    setEditableFields(extractEditableFields(newTemplate.html));
    setIsCreatingNew(true);
    setShowEditor(true);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    
    setSaving(true);
    try {
      let updatedTemplates;
      
      if (isCreatingNew) {
        // Adicionar novo template
        updatedTemplates = [...templates, editingTemplate];
      } else {
        // Atualizar template existente
        updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id ? editingTemplate : t
        );
      }
      
      setTemplates(updatedTemplates);
      
      // Salvar no localStorage
      const saved = saveTemplatesLocally(updatedTemplates);
      
      // NOVO: Salvar também via API para usar no email marketing
      try {
        const response = await fetch('/api/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templates: updatedTemplates })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Templates sincronizados com email marketing');
        } else {
          console.warn('⚠️ Erro ao sincronizar templates:', result.error);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao sincronizar templates via API:', error);
      }
      
      if (saved) {
        setShowEditor(false);
        setEditingTemplate(null);
        setIsCreatingNew(false);
        
        // Feedback visual diferenciado para criação vs edição
        const action = isCreatingNew ? 'criado' : 'salvo';
        alert(`✅ Template "${editingTemplate.name}" ${action} com sucesso!\n\n💾 ${isCreatingNew ? 'Novo template adicionado e salvo' : 'Suas alterações foram salvas'} localmente.\n📧 Templates sincronizados com sistema de email marketing!`);
      } else {
        throw new Error('Falha ao salvar no localStorage');
      }
    } catch (error) {
      alert('❌ Erro ao salvar template. Tente novamente.');
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateTemplateField = (field: keyof EmailTemplate, value: string) => {
    if (!editingTemplate) return;
    
    if (field === 'html') {
      // Atualizar HTML diretamente
      setEditingTemplate({
        ...editingTemplate,
        [field]: value
      });
      // Reextrair campos editáveis
      setEditableFields(extractEditableFields(value));
    } else {
      setEditingTemplate({
        ...editingTemplate,
        [field]: value
      });
    }
  };

  const updateEditableField = (field: keyof EditableFields, value: string) => {
    if (!editingTemplate) return;
    
    const updatedFields = {
      ...editableFields,
      [field]: value
    };
    
    setEditableFields(updatedFields);
    
    // Aplicar campos ao HTML e atualizar template
    const updatedHtml = applyEditableFields(editingTemplate.html, updatedFields);
    setEditingTemplate({
      ...editingTemplate,
      html: updatedHtml
    });
  };

  const resetToDefault = () => {
    if (!editingTemplate) return;
    
    if (confirm('⚠️ Tem certeza que deseja restaurar este template para o padrão?\n\nTodas as suas alterações serão perdidas.')) {
      // Recarregar template padrão do sistema
      loadTemplates();
      setShowEditor(false);
      setEditingTemplate(null);
      alert('✅ Template restaurado para o padrão!');
    }
  };

  const exportTemplate = () => {
    if (!editingTemplate) return;
    
    const dataStr = JSON.stringify(editingTemplate, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${editingTemplate.id}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteTemplate = (templateId: string) => {
    // Verificar se é um template padrão (não pode deletar)
    const isSystemTemplate = ['promotional', 'newsletter', 'reactivation'].includes(templateId);
    
    if (isSystemTemplate) {
      alert('⚠️ Não é possível deletar templates padrão do sistema.\n\nUse "Restaurar Padrão" se quiser reverter alterações.');
      return;
    }
    
    if (confirm('⚠️ Tem certeza que deseja deletar este template?\n\nEsta ação não pode ser desfeita.')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      saveTemplatesLocally(updatedTemplates);
      alert('✅ Template deletado com sucesso!');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotional': return 'bg-green-100 text-green-800 border-green-200';
      case 'newsletter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reactivation': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotional': return '🎯';
      case 'newsletter': return '📰';
      case 'reactivation': return '💔';
      default: return '📧';
    }
  };

  const handleUseTemplate = (template: EmailTemplate | null) => {
    console.log('🚀 useTemplate chamado com:', template?.name);
    
    if (!template) {
      console.error('❌ Template é null');
      return;
    }
    
    console.log('✅ Configurando template para uso...');
    setSelectedTemplateForUse(template);
    setShowPreview(false);
    setShowUseTemplateModal(true);
    setCampaignSettings({
      segment: '',
      testEmail: '',
      sendType: 'test'
    });
    
    console.log('✅ Modal deve aparecer agora');
    
    // Debug temporário
    alert(`Template "${template.name}" selecionado! Modal deve aparecer.`);
    
    // Forçar um timeout para garantir que o estado foi atualizado
    setTimeout(() => {
      console.log('🔍 Estados após timeout:', {
        showUseTemplateModal,
        selectedTemplateForUse: selectedTemplateForUse?.name
      });
    }, 100);
  };

  const sendCampaignWithTemplate = async () => {
    if (!selectedTemplateForUse) return;
    
    setSendingCampaign(true);
    
    try {
      const endpoint = '/api/email-marketing';
      const action = campaignSettings.sendType === 'test' ? 'send_test' : 'send_campaign';
      
      let requestBody;
      
      if (campaignSettings.sendType === 'test') {
        if (!campaignSettings.testEmail) {
          throw new Error('Email para teste é obrigatório');
        }
        
        requestBody = {
          action: 'send_test',
          email: campaignSettings.testEmail,
          campaignType: selectedTemplateForUse.type
        };
      } else {
        // Primeiro criar a campanha
        const createResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_campaign',
            name: `${selectedTemplateForUse.name} - ${new Date().toLocaleDateString('pt-BR')}`,
            subject: selectedTemplateForUse.subject,
            templateType: selectedTemplateForUse.type,
            htmlContent: selectedTemplateForUse.html,
            textContent: ''
          })
        });
        
        const createResult = await createResponse.json();
        
        if (!createResult.success) {
          throw new Error(createResult.error || 'Erro ao criar campanha');
        }
        
        // Agora enviar a campanha
        requestBody = {
          action: 'send_campaign',
          campaignId: createResult.data.id,
          segment: campaignSettings.segment || undefined,
          limit: 500
        };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (result.success) {
        const message = campaignSettings.sendType === 'test' 
          ? `✅ Email teste enviado para ${campaignSettings.testEmail}!`
          : `✅ Campanha "${selectedTemplateForUse.name}" enviada com sucesso!`;
        
        alert(message);
        setShowUseTemplateModal(false);
        setSelectedTemplateForUse(null);
      } else {
        throw new Error(result.error || 'Erro ao enviar');
      }
      
    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
      alert(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSendingCampaign(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="admin-card">
          <div className="admin-card-content text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="admin-card-title">📧 Templates de Email</h1>
              <p className="admin-card-description">
                Gerencie e visualize os templates das campanhas de email marketing
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={createNewTemplate}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                ➕ Novo Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="admin-card">
            <div className="admin-card-content">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(template.type)}</span>
                  <div>
                    <h3 className="font-semibold text-admin-text-primary">
                      {template.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-admin-text-secondary mb-4">
                {template.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-admin-text-primary mb-1">
                  📬 Assunto:
                </h4>
                <p className="text-sm text-admin-text-secondary bg-gray-50 p-2 rounded">
                  {template.subject}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button 
                    onClick={() => previewEmail(template)}
                    className="admin-btn admin-btn-sm admin-btn-primary flex-1"
                  >
                    👁️ Visualizar
                  </button>
                  <button 
                    onClick={() => editTemplate(template)}
                    className="admin-btn admin-btn-sm admin-btn-secondary"
                  >
                    ✏️ Editar
                  </button>
                  {/* Botão de deletar apenas para templates personalizados */}
                  {!['promotional', 'newsletter', 'reactivation'].includes(template.id) && (
                    <button 
                      onClick={() => deleteTemplate(template.id)}
                      className="admin-btn admin-btn-sm text-red-600 border-red-300 hover:bg-red-50"
                      title="Deletar template personalizado"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => {
                    console.log('🔥 Botão clicado!', template.name);
                    handleUseTemplate(template);
                  }}
                  className="admin-btn admin-btn-sm w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:scale-105 transition-transform"
                  style={{ position: 'relative', overflow: 'visible' }}
                >
                  📤 Usar Template
                  {/* Indicador visual de que o botão está ativo */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                    ●
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                📧 Preview: {previewTemplate.name}
              </h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 bg-gray-50 border-b">
              <div className="text-sm">
                <strong>De:</strong> Fly2Any &lt;fly2any.travel@gmail.com&gt;<br/>
                <strong>Assunto:</strong> {previewTemplate.subject}
              </div>
            </div>
            
            <div className="overflow-auto max-h-[calc(90vh-200px)]">
              <iframe 
                srcDoc={previewTemplate.html}
                className="w-full h-96 border-0"
                title="Email Preview"
              />
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button 
                onClick={() => setShowPreview(false)}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                Fechar
              </button>
              <button 
                onClick={() => handleUseTemplate(previewTemplate)}
                className="admin-btn admin-btn-sm admin-btn-primary"
              >
                📤 Usar Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {isCreatingNew ? '➕ Criando Novo Template' : `✏️ Editando: ${editingTemplate.name}`}
              </h3>
              <button 
                onClick={() => {
                  if (isCreatingNew && confirm('⚠️ Descartar novo template?\n\nTodas as alterações serão perdidas.')) {
                    setShowEditor(false);
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  } else if (!isCreatingNew) {
                    setShowEditor(false);
                    setEditingTemplate(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex h-[calc(95vh-120px)]">
              {/* Editor Panel */}
              <div className="w-1/2 p-4 border-r overflow-auto">
                <div className="space-y-4">
                  
                  {/* Nome do Template */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Nome do Template
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => updateTemplateField('name', e.target.value)}
                      className="admin-input w-full"
                      placeholder="Ex: Super Oferta - Alta Conversão"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📄 Descrição
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.description}
                      onChange={(e) => updateTemplateField('description', e.target.value)}
                      className="admin-input w-full"
                      placeholder="Ex: Template promocional com gatilhos de urgência"
                    />
                  </div>

                  {/* Assunto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📧 Assunto do Email
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => updateTemplateField('subject', e.target.value)}
                      className="admin-input w-full"
                      placeholder="Ex: ⚡ ÚLTIMAS 24H: Pacote COMPLETO..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Use emojis e gatilhos de urgência para maior abertura
                    </p>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏷️ Tipo de Template
                    </label>
                    <select
                      value={editingTemplate.type}
                      onChange={(e) => updateTemplateField('type', e.target.value)}
                      className="admin-input w-full"
                    >
                      <option value="promotional">🎯 Promocional</option>
                      <option value="newsletter">📰 Newsletter</option>
                      <option value="reactivation">💔 Reativação</option>
                    </select>
                  </div>

                  {/* Modo de Edição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎛️ Modo de Edição
                    </label>
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedEditor(false)}
                        className={`px-3 py-2 text-sm rounded-lg border ${!showAdvancedEditor 
                          ? 'bg-blue-100 border-blue-300 text-blue-800' 
                          : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                      >
                        ✏️ Editor Visual
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdvancedEditor(true)}
                        className={`px-3 py-2 text-sm rounded-lg border ${showAdvancedEditor 
                          ? 'bg-blue-100 border-blue-300 text-blue-800' 
                          : 'bg-gray-100 border-gray-300 text-gray-600'}`}
                      >
                        🔧 HTML Avançado
                      </button>
                    </div>
                  </div>

                  {!showAdvancedEditor ? (
                    /* Editor Visual - Campos Específicos */
                    <div className="space-y-4">
                      
                      {/* Header */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-3">📍 Cabeçalho</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            🏢 Título da Empresa
                          </label>
                          <input
                            type="text"
                            value={editableFields.headerTitle || ''}
                            onChange={(e) => updateEditableField('headerTitle', e.target.value)}
                            className="admin-input w-full"
                            placeholder="Ex: FLY2ANY"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            📝 Subtítulo
                          </label>
                          <input
                            type="text"
                            value={editableFields.headerSubtitle || ''}
                            onChange={(e) => updateEditableField('headerSubtitle', e.target.value)}
                            className="admin-input w-full"
                            placeholder="Ex: 21 anos conectando brasileiros ao mundo"
                          />
                        </div>
                      </div>

                      {/* Conteúdo Principal */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3">🎯 Conteúdo Principal</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            💥 Título Principal
                          </label>
                          <input
                            type="text"
                            value={editableFields.mainTitle || ''}
                            onChange={(e) => updateEditableField('mainTitle', e.target.value)}
                            className="admin-input w-full"
                            placeholder="Ex: PACOTE COMPLETO: TUDO INCLUÍDO!"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Use palavras de impacto: EXCLUSIVO, URGENTE, LIMITADO
                          </p>
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-3">🚀 Call to Action (CTA)</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            🔗 URL de Destino
                          </label>
                          <input
                            type="url"
                            value={editableFields.ctaUrl || ''}
                            onChange={(e) => updateEditableField('ctaUrl', e.target.value)}
                            className="admin-input w-full"
                            placeholder="https://fly2any.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            💬 Texto do Botão
                          </label>
                          <input
                            type="text"
                            value={editableFields.ctaText || ''}
                            onChange={(e) => updateEditableField('ctaText', e.target.value)}
                            className="admin-input w-full"
                            placeholder="Ex: QUERO MEU PACOTE COMPLETO"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            💡 Use verbos de ação: QUERO, GARANTO, SOLICITO, COMPRO
                          </p>
                        </div>
                      </div>

                      {/* Contatos */}
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-3">📞 Informações de Contato</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            📱 WhatsApp
                          </label>
                          <input
                            type="text"
                            value={editableFields.whatsappNumber || ''}
                            onChange={(e) => updateEditableField('whatsappNumber', e.target.value)}
                            className="admin-input w-full"
                            placeholder="+55 11 99999-9999"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            📧 Email
                          </label>
                          <input
                            type="email"
                            value={editableFields.email || ''}
                            onChange={(e) => updateEditableField('email', e.target.value)}
                            className="admin-input w-full"
                            placeholder="info@fly2any.com"
                          />
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* HTML Avançado */
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🎨 Código HTML Completo
                      </label>
                      <textarea
                        value={editingTemplate.html}
                        onChange={(e) => updateTemplateField('html', e.target.value)}
                        className="admin-input w-full font-mono text-sm"
                        rows={25}
                        placeholder="Cole seu HTML aqui..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ⚠️ Use CSS inline para compatibilidade com clientes de email
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Preview Panel */}
              <div className="w-1/2 flex flex-col">
                <div className="p-4 bg-gray-50 border-b">
                  <h4 className="font-semibold text-gray-700">📱 Preview em Tempo Real</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>De:</strong> Fly2Any &lt;info@fly2any.com&gt;<br/>
                    <strong>Assunto:</strong> {editingTemplate.subject}
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-white">
                  <iframe 
                    srcDoc={editingTemplate.html}
                    className="w-full h-full border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={resetToDefault}
                  className="admin-btn admin-btn-sm text-orange-600 border-orange-300 hover:bg-orange-50"
                  title="Restaurar template padrão"
                >
                  🔄 Restaurar Padrão
                </button>
                <button 
                  onClick={exportTemplate}
                  className="admin-btn admin-btn-sm text-blue-600 border-blue-300 hover:bg-blue-50"
                  title="Exportar template como JSON"
                >
                  📤 Exportar
                </button>
              </div>
              <div className="text-sm text-gray-600 hidden md:block">
                💡 <strong>Dica:</strong> Use emojis, urgência e prova social para maior conversão
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (isCreatingNew && confirm('⚠️ Descartar novo template?\n\nTodas as alterações serão perdidas.')) {
                      setShowEditor(false);
                      setEditingTemplate(null);
                      setIsCreatingNew(false);
                    } else if (!isCreatingNew) {
                      setShowEditor(false);
                      setEditingTemplate(null);
                    }
                  }}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveTemplate}
                  disabled={saving}
                  className="admin-btn admin-btn-sm admin-btn-primary"
                >
                  {saving ? '💾 Salvando...' : (isCreatingNew ? '➕ Criar Template' : '💾 Salvar Template')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usar Template */}
      {showUseTemplateModal && selectedTemplateForUse && (
        console.log('🎯 RENDERIZANDO MODAL:', showUseTemplateModal, selectedTemplateForUse?.name) ||
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                📤 Usar Template: {selectedTemplateForUse.name}
              </h3>
              <button 
                onClick={() => {
                  setShowUseTemplateModal(false);
                  setSelectedTemplateForUse(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📧 Template Selecionado</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Nome:</strong> {selectedTemplateForUse.name}</div>
                    <div><strong>Tipo:</strong> {selectedTemplateForUse.type}</div>
                    <div><strong>Assunto:</strong> {selectedTemplateForUse.subject}</div>
                  </div>
                </div>
                
                {/* Tipo de Envio */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Tipo de Envio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCampaignSettings({...campaignSettings, sendType: 'test'})}
                      className={`p-3 rounded-lg border text-center ${
                        campaignSettings.sendType === 'test'
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-gray-50 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-lg mb-1">🧪</div>
                      <div className="font-semibold">Email Teste</div>
                      <div className="text-xs">Enviar para um email específico</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setCampaignSettings({...campaignSettings, sendType: 'campaign'})}
                      className={`p-3 rounded-lg border text-center ${
                        campaignSettings.sendType === 'campaign'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-gray-50 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="text-lg mb-1">🚀</div>
                      <div className="font-semibold">Campanha Real</div>
                      <div className="text-xs">Enviar para lista de contatos</div>
                    </button>
                  </div>
                </div>

                {/* Email Teste */}
                {campaignSettings.sendType === 'test' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📧 Email para Teste
                    </label>
                    <input
                      type="email"
                      value={campaignSettings.testEmail}
                      onChange={(e) => setCampaignSettings({...campaignSettings, testEmail: e.target.value})}
                      className="admin-input w-full"
                      placeholder="seu@email.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email teste será enviado apenas para este endereço
                    </p>
                  </div>
                )}

                {/* Segmento */}
                {campaignSettings.sendType === 'campaign' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      👥 Segmento de Contatos (Opcional)
                    </label>
                    <select
                      value={campaignSettings.segment}
                      onChange={(e) => setCampaignSettings({...campaignSettings, segment: e.target.value})}
                      className="admin-input w-full"
                    >
                      <option value="">Todos os contatos</option>
                      <option value="brasileiros-eua">Brasileiros nos EUA</option>
                      <option value="familias">Famílias</option>
                      <option value="casais">Casais/Lua de mel</option>
                      <option value="aventureiros">Aventureiros</option>
                      <option value="executivos">Executivos</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Deixe em branco para enviar para todos os contatos disponíveis
                    </p>
                  </div>
                )}

                {/* Aviso importante */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <div className="font-semibold mb-1">Importante:</div>
                      {campaignSettings.sendType === 'test' ? (
                        <div>O email teste será enviado imediatamente usando o template exato que você visualizou.</div>
                      ) : (
                        <div>
                          A campanha será enviada para todos os contatos do segmento selecionado. 
                          Esta ação não pode ser desfeita. Recomendamos fazer um teste primeiro.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowUseTemplateModal(false);
                  setSelectedTemplateForUse(null);
                }}
                className="admin-btn admin-btn-sm admin-btn-secondary"
                disabled={sendingCampaign}
              >
                Cancelar
              </button>
              <button 
                onClick={sendCampaignWithTemplate}
                disabled={sendingCampaign || (campaignSettings.sendType === 'test' && !campaignSettings.testEmail)}
                className="admin-btn admin-btn-sm admin-btn-primary"
              >
                {sendingCampaign ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    {campaignSettings.sendType === 'test' ? '🧪 Enviar Teste' : '🚀 Enviar Campanha'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="admin-card">
        <div className="admin-card-content">
          <h3 className="admin-card-title" style={{ marginBottom: '12px' }}>
            📖 Como Usar o Editor de Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tipos de Templates */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Tipos de Templates</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-green-600">🎯</span>
                  <div>
                    <strong>Promocional:</strong> Ofertas especiais, descontos e promoções de destinos
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600">📰</span>
                  <div>
                    <strong>Newsletter:</strong> Envios regulares com dicas, novidades e conteúdo informativo
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600">💔</span>
                  <div>
                    <strong>Reativação:</strong> Reconquistar clientes que não compram há muito tempo
                  </div>
                </div>
              </div>
            </div>

            {/* Como Usar */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">✏️ Como Usar</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-green-600">➕</span>
                  <div>
                    <strong>"➕ Novo Template"</strong> - Cria template personalizado do zero
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600">✏️</span>
                  <div>
                    <strong>"✏️ Editar"</strong> - Edita templates existentes
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">👁️</span>
                  <div>
                    <strong>"👁️ Visualizar"</strong> - Preview sem editar
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-600">🗑️</span>
                  <div>
                    <strong>"🗑️ Deletar"</strong> - Remove templates personalizados
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-600">💾</span>
                  <div>
                    Mudanças são <strong>salvas automaticamente</strong> no navegador
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas de Marketing */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🚀 Dicas de Marketing</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-800">📧 Assuntos que Convertem:</div>
                  <div className="text-yellow-700">Use emojis, urgência ("ÚLTIMAS 24H") e números específicos</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800">💰 Bundle Selling:</div>
                  <div className="text-green-700">Sempre mencione "PACOTE COMPLETO" vs venda individual</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800">⏰ Urgência & Escassez:</div>
                  <div className="text-blue-700">Timers, ofertas limitadas e CTAs que geram FOMO</div>
                </div>
              </div>
            </div>

            {/* Recursos Avançados */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🔧 Recursos Avançados</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-orange-600">🔄</span>
                  <div>
                    <strong>Restaurar Padrão:</strong> Volta para o template original
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600">📤</span>
                  <div>
                    <strong>Exportar:</strong> Baixa template como arquivo JSON
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600">💾</span>
                  <div>
                    <strong>Auto-Save:</strong> Mudanças salvas automaticamente no navegador
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-600">📱</span>
                  <div>
                    <strong>Preview Responsivo:</strong> Visualização em tempo real
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}