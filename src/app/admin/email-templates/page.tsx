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

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Templates de alta conversão baseados na análise do site
    const systemTemplates: EmailTemplate[] = [
      {
        id: 'promotional',
        name: 'Super Oferta - Alta Conversão',
        description: 'Template promocional com gatilhos de urgência e prova social',
        type: 'promotional',
        subject: '⚡ ÚLTIMAS 24H: Economize até 40% - Miami por $1.299',
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
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">+10 anos conectando brasileiros ao mundo</p>
              </div>

              <!-- Oferta Principal -->
              <div style="padding: 30px; text-align: center; background: linear-gradient(180deg, #fef3c7 0%, #ffffff 100%);">
                <h2 style="color: #dc2626; font-size: 28px; margin: 0 0 10px 0; font-weight: 800;">
                  🔥 ECONOMIA DE ATÉ 40%
                </h2>
                <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0; font-weight: 600;">
                  Miami por apenas <span style="color: #dc2626; font-size: 24px;">$1.299</span>
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <s>Preço normal: $2.165</s> • <strong style="color: #059669;">Você economiza $866!</strong>
                </p>
              </div>

              <!-- Prova Social -->
              <div style="background: #f3f4f6; padding: 20px; margin: 0; border-left: 4px solid #10b981;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="font-size: 18px;">⭐⭐⭐⭐⭐</span>
                  <span style="margin-left: 10px; font-weight: 600; color: #374151;">Maria Silva</span>
                  <span style="margin-left: 10px; color: #6b7280; font-size: 12px;">cliente verificada</span>
                </div>
                <p style="color: #374151; font-style: italic; margin: 0; font-size: 14px;">
                  "Incrível! Economizei mais de $800 na minha viagem para Miami. Atendimento impecável e resposta em 2 horas!"
                </p>
              </div>

              <!-- Destinos em Destaque -->
              <div style="padding: 30px;">
                <h3 style="text-align: center; color: #374151; margin: 0 0 20px 0;">🎯 OFERTAS EXCLUSIVAS</h3>
                <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  
                  <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding: 15px; align-items: center;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #374151;">🏖️ São Paulo → Miami</div>
                      <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.299</div>
                      <div style="font-size: 12px; color: #059669;">💰 Economia $866</div>
                    </div>
                  </div>

                  <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding: 15px; align-items: center;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #374151;">🗽 Rio → New York</div>
                      <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.599</div>
                      <div style="font-size: 12px; color: #059669;">💰 Economia $750</div>
                    </div>
                  </div>

                  <div style="display: flex; padding: 15px; align-items: center;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #374151;">🎢 Salvador → Orlando</div>
                      <div style="font-size: 12px; color: #6b7280;">Ida e volta • Taxas incluídas</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-weight: 700; color: #dc2626; font-size: 18px;">$1.399</div>
                      <div style="font-size: 12px; color: #059669;">💰 Economia $680</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Garantias e Benefícios -->
              <div style="background: #f0f9ff; padding: 25px; margin: 0;">
                <h3 style="text-align: center; color: #374151; margin: 0 0 20px 0;">🛡️ SUAS GARANTIAS</h3>
                <div style="text-align: center;">
                  <div style="display: inline-block; margin: 0 15px 15px 0; text-align: center;">
                    <div style="font-size: 24px;">⚡</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">Resposta em 2h</div>
                  </div>
                  <div style="display: inline-block; margin: 0 15px 15px 0; text-align: center;">
                    <div style="font-size: 24px;">💳</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">12x sem juros</div>
                  </div>
                  <div style="display: inline-block; margin: 0 15px 15px 0; text-align: center;">
                    <div style="font-size: 24px;">🔒</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">Melhor preço</div>
                  </div>
                  <div style="display: inline-block; margin: 0 15px 15px 0; text-align: center;">
                    <div style="font-size: 24px;">🎯</div>
                    <div style="font-size: 12px; font-weight: 600; color: #374151;">5.000+ clientes</div>
                  </div>
                </div>
              </div>

              <!-- CTA Principal -->
              <div style="padding: 30px; text-align: center; background: #fafafa;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 4px; border-radius: 12px; display: inline-block; margin-bottom: 15px;">
                  <a href="https://fly2any.com" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);">
                    🚀 GARANTIR OFERTA AGORA
                  </a>
                </div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">
                  ⏰ Oferta válida até <strong>amanhã às 23:59</strong>
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                  ✅ Sem taxa de conveniência • Cancelamento grátis em 24h
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #374151; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">
                  <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há +10 anos
                </p>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                  📱 WhatsApp: +1 (305) 555-0123 • 📧 contato@fly2any.com
                </p>
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
        subject: '🧳 Segredos dos experts: Como economizar $800+ em viagens',
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
                  Esta semana revelamos os <strong>segredos dos especialistas</strong> que nossa equipe usa há +10 anos para encontrar as melhores ofertas.
                </p>
              </div>

              <!-- Main Content -->
              <div style="padding: 30px;">
                <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
                  💡 DICA #1: O Truque das "Janelas Secretas"
                </h2>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
                  <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
                    <strong>🕐 Horários mágicos:</strong> Pesquise passagens entre <strong>14h-16h</strong> nas terças e quartas. Nossas análises de +50.000 buscas mostram economia média de <strong>32%</strong> nestes horários.
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    ✅ <em>Testado com clientes reais: Maria economizou $743 usando esta técnica na rota SP-Miami.</em>
                  </p>
                </div>

                <h2 style="color: #1e40af; font-size: 22px; margin: 0 0 20px 0; font-weight: 700;">
                  📊 ANÁLISE DA SEMANA: Tendências de Preços
                </h2>
                
                <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                  <div style="background: #10b981; color: white; padding: 15px; font-weight: 600;">
                    📈 DESTINOS EM ALTA (preços ↓)
                  </div>
                  
                  <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">🏖️ Miami</div>
                        <div style="font-size: 12px; color: #6b7280;">Média dos últimos 30 dias</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">↓ 28%</div>
                        <div style="font-size: 12px; color: #374151;">Melhor época: Maio-Junho</div>
                      </div>
                    </div>
                  </div>

                  <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">🗽 New York</div>
                        <div style="font-size: 12px; color: #6b7280;">Média dos últimos 30 dias</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">↓ 22%</div>
                        <div style="font-size: 12px; color: #374151;">Melhor época: Abril-Maio</div>
                      </div>
                    </div>
                  </div>

                  <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #374151;">🌴 Califórnia</div>
                        <div style="font-size: 12px; color: #6b7280;">Média dos últimos 30 dias</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="color: #10b981; font-weight: 700;">↓ 35%</div>
                        <div style="font-size: 12px; color: #374151;">Melhor época: Março-Abril</div>
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
                        <strong>João Silva</strong> (empresário, São Paulo) planejava viajar para Orlando com a família (4 pessoas). Usando nossas dicas de timing + alertas personalizados, conseguiu:
                      </p>
                      <div style="background: white; padding: 12px; border-radius: 8px; margin-top: 10px;">
                        <div style="color: #059669; font-weight: 700; font-size: 16px;">💰 Economia total: $3.124</div>
                        <div style="font-size: 12px; color: #6b7280;">4 passagens SP-Orlando + 7 dias de hotel</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Section -->
                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1;">
                  <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 QUER RESULTADOS ASSIM?</h3>
                  <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Nossa equipe monitora +1.000 rotas diariamente. Receba alertas personalizados quando os preços dos seus destinos favoritos despencarem.
                  </p>
                  <a href="https://fly2any.com" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                    📱 ATIVAR ALERTAS GRÁTIS
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
                  +10 anos de experiência • +5.000 clientes satisfeitos • Economia média de 35%
                </p>
                <div style="font-size: 12px; opacity: 0.7;">
                  📱 WhatsApp: +1 (305) 555-0123 • 📧 insider@fly2any.com
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
        subject: '💔 Sua próxima aventura está esperando... + 25% OFF exclusivo',
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
                  Já faz tempo que você não viaja conosco...
                </h2>
                <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0; line-height: 1.6;">
                  Sabemos que a vida anda corrida, mas <strong>você merece uma pausa</strong>. Sua última viagem conosco foi incrível, e temos certeza de que a próxima será ainda melhor!
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
                      25% OFF
                    </div>
                    <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                      Na sua próxima viagem dos sonhos
                    </p>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24;">
                      <div style="font-weight: 700; color: #92400e; font-size: 18px;">
                        Código: <span style="background: #92400e; color: white; padding: 5px 10px; border-radius: 4px;">SAUDADE25</span>
                      </div>
                      <div style="font-size: 12px; color: #92400e; margin-top: 5px;">
                        ⏰ Válido por 7 dias • Não perca esta chance!
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Destinations Showcase -->
                <h3 style="text-align: center; color: #374151; margin: 0 0 20px 0; font-size: 20px;">
                  🌎 DESTINOS QUE VÃO TE EMOCIONAR
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 15px; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 5px;">🏖️</div>
                      <div style="font-weight: 600;">MIAMI</div>
                    </div>
                    <div style="padding: 15px; text-align: center;">
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">com 25% OFF</div>
                      <div style="font-weight: 700; color: #be123c; font-size: 18px;">$974</div>
                      <div style="font-size: 11px; color: #059669;">💰 Você economiza $325</div>
                    </div>
                  </div>

                  <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px; text-align: center;">
                      <div style="font-size: 24px; margin-bottom: 5px;">🗽</div>
                      <div style="font-weight: 600;">NEW YORK</div>
                    </div>
                    <div style="padding: 15px; text-align: center;">
                      <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">com 25% OFF</div>
                      <div style="font-weight: 700; color: #be123c; font-size: 18px;">$1.199</div>
                      <div style="font-size: 11px; color: #059669;">💰 Você economiza $400</div>
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
                  <div style="margin-bottom: 10px;">✅ <strong>Preços nunca estiveram tão baixos</strong> (25% OFF é histórico!)</div>
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
                  ⏰ Oferta expira em 7 dias • Código SAUDADE25
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
                  <strong>Fly2Any</strong> • Conectando brasileiros ao mundo há +10 anos
                </p>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                  📱 WhatsApp: +1 (305) 555-0123 • 📧 contato@fly2any.com
                </p>
              </div>
            </div>
          </body>
          </html>`
      }
    ];
    
    setTemplates(systemTemplates);
    setLoading(false);
  };

  const previewEmail = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
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
              <button className="admin-btn admin-btn-sm admin-btn-secondary">
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
              
              <div className="flex gap-2">
                <button 
                  onClick={() => previewEmail(template)}
                  className="admin-btn admin-btn-sm admin-btn-primary flex-1"
                >
                  👁️ Visualizar
                </button>
                <button className="admin-btn admin-btn-sm admin-btn-secondary">
                  ✏️ Editar
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
              <button className="admin-btn admin-btn-sm admin-btn-primary">
                📤 Usar Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="admin-card">
        <div className="admin-card-content">
          <h3 className="admin-card-title" style={{ marginBottom: '12px' }}>
            📖 Como Usar os Templates
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600">🎯</span>
              <div>
                <strong>Promocional:</strong> Use para ofertas especiais, descontos e promoções de destinos
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600">📰</span>
              <div>
                <strong>Newsletter:</strong> Para envios regulares com dicas, novidades e conteúdo informativo
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-600">💔</span>
              <div>
                <strong>Reativação:</strong> Para reconquistar clientes que não compram há muito tempo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}