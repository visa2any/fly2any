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
    // Templates atuais do sistema (extraídos do código)
    const systemTemplates: EmailTemplate[] = [
      {
        id: 'promotional',
        name: 'Campanha Promocional',
        description: 'Template para ofertas especiais e promoções',
        type: 'promotional',
        subject: '✈️ Oferta Exclusiva: Miami por apenas $1,299!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
              <h1>✈️ Fly2Any</h1>
              <h2>Oferta Especial!</h2>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e40af;">🎯 Miami por apenas $1,299</h2>
              <p>Não perca esta oportunidade única!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📅 Ofertas Disponíveis:</h3>
                <ul>
                  <li>✅ Miami: $1,299</li>
                  <li>✅ Orlando: $1,399</li>
                  <li>✅ New York: $1,599</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://fly2any.com" 
                   style="background: #25d366; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;">
                  🚀 RESERVAR AGORA
                </a>
              </div>
            </div>
          </div>`
      },
      {
        id: 'newsletter',
        name: 'Newsletter Semanal',
        description: 'Template para newsletter com dicas e novidades',
        type: 'newsletter',
        subject: '📰 Newsletter Fly2Any - Dicas de Viagem',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>✈️ Newsletter Fly2Any</h1>
            </div>
            <div style="padding: 20px;">
              <h2>📰 Dicas de Viagem da Semana</h2>
              <p>Confira nossas dicas para economizar e viajar melhor!</p>
              
              <h3>🎯 Como Economizar até 40% em Passagens</h3>
              <ul>
                <li>✅ Reserve com 3 meses de antecedência</li>
                <li>✅ Viaje em dias de semana</li>
                <li>✅ Use nosso sistema de alertas de preço</li>
                <li>✅ Seja flexível com as datas</li>
              </ul>
              
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>🌟 Destaque da Semana</h4>
                <p>Miami está com preços incríveis! A partir de $1,299.</p>
              </div>
            </div>
          </div>`
      },
      {
        id: 'reactivation',
        name: 'Reativação de Cliente',
        description: 'Template para reconquistar clientes inativos',
        type: 'reactivation',
        subject: '💔 Sentimos sua falta!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
              <h1>💔 Sentimos sua falta!</h1>
            </div>
            <div style="padding: 30px;">
              <h2>Que tal planejar sua próxima aventura?</h2>
              <p>Há um tempo que você não viaja conosco. Preparamos uma oferta especial para você!</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3>🎁 Oferta Especial de Volta:</h3>
                <p><strong>15% OFF</strong> na sua próxima viagem!</p>
                <p>Código: <strong>VOLTEI15</strong></p>
                <p style="font-size: 12px; color: #666;">Válido até o final do mês</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://fly2any.com" 
                   style="background: #dc2626; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;">
                  💖 VOLTAR A VIAJAR
                </a>
              </div>
            </div>
          </div>`
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