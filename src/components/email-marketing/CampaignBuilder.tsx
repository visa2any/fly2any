'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import {
  EmailTemplate,
  generateCampaignName,
  replaceTemplateVariables,
  extractTemplateVariables,
  validateTemplate
} from '../../lib/email-marketing/utils';
import { emailMarketingAPI } from '../../lib/email-marketing/api';
import { useAutoSave } from '../../hooks/useAutoSave';
import AutoSaveStatus from './AutoSaveStatus';

interface CampaignBuilderProps {
  onSave?: (campaign: any) => void;
  onSend?: (campaign: any) => void;
  initialTemplate?: EmailTemplate;
  className?: string;
}

interface CampaignData {
  name: string;
  subject: string;
  content: string;
  type: string;
  templateId?: string;
  variables: Record<string, string>;
  previewText?: string;
  segmentId?: string;
}

interface DragElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'header' | 'footer';
  content: string;
  style: Record<string, string>;
}

const templateElements = [
  {
    id: 'text',
    type: 'text' as const,
    name: 'Texto',
    icon: '📝',
    defaultContent: '<p>Adicione seu texto aqui...</p>',
    defaultStyle: { 
      fontSize: '16px', 
      color: '#333333', 
      padding: '10px',
      fontFamily: 'Arial, sans-serif'
    }
  },
  {
    id: 'image',
    type: 'image' as const,
    name: 'Imagem',
    icon: '🖼️',
    defaultContent: '<img src="https://via.placeholder.com/600x300" alt="Imagem" style="max-width: 100%; height: auto;">',
    defaultStyle: { 
      textAlign: 'center', 
      padding: '10px' 
    }
  },
  {
    id: 'button',
    type: 'button' as const,
    name: 'Botão',
    icon: '🔲',
    defaultContent: '<a href="#" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Clique Aqui</a>',
    defaultStyle: { 
      textAlign: 'center', 
      padding: '20px' 
    }
  },
  {
    id: 'divider',
    type: 'divider' as const,
    name: 'Divisor',
    icon: '➖',
    defaultContent: '<hr style="border: 1px solid #e0e0e0; margin: 20px 0;">',
    defaultStyle: { 
      padding: '10px 0' 
    }
  },
  {
    id: 'social',
    type: 'social' as const,
    name: 'Redes Sociais',
    icon: '🔗',
    defaultContent: `
      <div style="text-align: center;">
        <a href="#" style="display: inline-block; margin: 0 10px;"><img src="https://via.placeholder.com/32x32" alt="Facebook"></a>
        <a href="#" style="display: inline-block; margin: 0 10px;"><img src="https://via.placeholder.com/32x32" alt="Instagram"></a>
        <a href="#" style="display: inline-block; margin: 0 10px;"><img src="https://via.placeholder.com/32x32" alt="Twitter"></a>
      </div>
    `,
    defaultStyle: { 
      padding: '20px' 
    }
  },
  {
    id: 'header',
    type: 'header' as const,
    name: 'Cabeçalho',
    icon: '📋',
    defaultContent: '<h1 style="margin: 0; color: #333;">Seu Título Aqui</h1>',
    defaultStyle: { 
      textAlign: 'center', 
      padding: '30px 20px',
      backgroundColor: '#f8f9fa'
    }
  },
  {
    id: 'footer',
    type: 'footer' as const,
    name: 'Rodapé',
    icon: '🔻',
    defaultContent: `
      <p style="margin: 0; font-size: 12px; color: #666;">
        © 2024 Fly2Any. Todos os direitos reservados.<br>
        <a href="{{unsubscribe_url}}" style="color: #666;">Descadastrar</a>
      </p>
    `,
    defaultStyle: { 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#f1f1f1',
      fontSize: '12px'
    }
  }
];

export default function CampaignBuilder({ 
  onSave, 
  onSend, 
  initialTemplate,
  className = "" 
}: CampaignBuilderProps) {
  const [campaign, setCampaign] = useState<CampaignData>({
    name: generateCampaignName('promotional'),
    subject: '',
    content: '',
    type: 'promotional',
    variables: {},
    previewText: ''
  });

  const [elements, setElements] = useState<DragElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  const autoSave = useAutoSave(
    { campaign, elements },
    {
      key: `campaign_${Date.now()}`,
      delay: 3000,
      onSave: async (data) => {
        console.log('Auto-saving campaign...', data);
        // In real app, this would save to API
      }
    }
  );

  // Initialize with template if provided
  React.useEffect(() => {
    if (initialTemplate) {
      setCampaign(prev => ({
        ...prev,
        templateId: initialTemplate.id,
        subject: initialTemplate.subject,
        content: initialTemplate.html,
        variables: initialTemplate.variables?.reduce((acc, variable) => {
          acc[variable] = '';
          return acc;
        }, {} as Record<string, string>) || {}
      }));
      
      // Parse template content into elements (simplified)
      const templateElements = parseTemplateToElements(initialTemplate.html);
      setElements(templateElements);
    }
  }, [initialTemplate]);

  // Parse HTML template into draggable elements
  const parseTemplateToElements = (html: string): DragElement[] => {
    // This is a simplified parser - in a real app you'd use a proper HTML parser
    const elements: DragElement[] = [];
    
    // Extract text content
    if (html.includes('<p>') || html.includes('<h1>') || html.includes('<h2>')) {
      elements.push({
        id: Date.now().toString(),
        type: 'text',
        content: html,
        style: { fontSize: '16px', color: '#333333', padding: '10px' }
      });
    }
    
    return elements;
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    setDraggedElement(elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const template = templateElements.find(t => t.type === draggedElement);
    if (!template) return;
    
    const newElement: DragElement = {
      id: Date.now().toString(),
      type: template.type,
      content: template.defaultContent,
      style: template.defaultStyle as unknown as Record<string, string>
    };
    
    setElements(prev => [...prev, newElement]);
    setDraggedElement(null);
  }, [draggedElement]);

  // Update element content
  const updateElement = (id: string, updates: Partial<DragElement>) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Move element up/down
  const moveElement = (id: string, direction: 'up' | 'down') => {
    setElements(prev => {
      const index = prev.findIndex(el => el.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newElements = [...prev];
      [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];
      return newElements;
    });
  };

  // Generate final HTML
  const generateHTML = (): string => {
    const bodyContent = elements.map(element => {
      const styles = Object.entries(element.style)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
      
      return `<div style="${styles}">${element.content}</div>`;
    }).join('\n');

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.subject}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4; 
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 10px rgba(0,0,0,0.1); 
        }
        img { 
            max-width: 100%; 
            height: auto; 
        }
        a { 
            color: #007bff; 
        }
    </style>
</head>
<body>
    <div class="email-container">
        ${bodyContent}
    </div>
</body>
</html>`;

    return replaceTemplateVariables(html, campaign.variables);
  };

  // Save campaign
  const saveCampaign = async () => {
    setLoading(true);
    try {
      const finalHTML = generateHTML();
      const campaignData = {
        ...campaign,
        content: finalHTML
      };

      const response = await emailMarketingAPI.createCampaign(campaignData);
      if (response.success) {
        onSave?.(response.data);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
    setLoading(false);
  };

  // Send campaign
  const sendCampaign = async () => {
    await saveCampaign();
    const finalHTML = generateHTML();
    onSend?.({ ...campaign, content: finalHTML });
  };

  // Get template variables
  const templateVariables = extractTemplateVariables(generateHTML());

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Left Sidebar - Elements */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🧱 Elementos
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {templateElements.map((element) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element.type)}
                className="p-3 border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 text-center transition-colors"
              >
                <div className="text-xl mb-1">{element.icon}</div>
                <div className="text-xs text-gray-600">{element.name}</div>
              </div>
            ))}
          </div>

          {/* Campaign Settings */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">⚙️ Configurações</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={campaign.name}
                  onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={campaign.subject}
                  onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={campaign.type}
                  onChange={(e) => setCampaign(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="promotional">Promocional</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="reactivation">Reativação</option>
                  <option value="welcome">Boas-vindas</option>
                  <option value="announcement">Anúncio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto de Pré-visualização
                </label>
                <textarea
                  value={campaign.previewText || ''}
                  onChange={(e) => setCampaign(prev => ({ ...prev, previewText: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Texto que aparece no preview..."
                />
              </div>
            </div>
          </div>

          {/* Variables */}
          {templateVariables.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowVariables(!showVariables)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
              >
                🔧 Variáveis ({templateVariables.length})
                <span>{showVariables ? '▼' : '▶'}</span>
              </button>
              
              {showVariables && (
                <div className="space-y-2">
                  {templateVariables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-xs text-gray-600 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={campaign.variables[variable] || ''}
                        onChange={(e) => setCampaign(prev => ({
                          ...prev,
                          variables: {
                            ...prev.variables,
                            [variable]: e.target.value
                          }
                        }))}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Valor para ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                📧 Campaign Builder
              </h2>
              <AutoSaveStatus autoSave={autoSave} />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    previewDevice === 'desktop' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🖥️ Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    previewDevice === 'mobile' 
                      ? 'bg-white text-gray-900 shadow' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📱 Mobile
                </button>
              </div>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                👁️ Preview
              </button>
              
              <button
                onClick={saveCampaign}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? '💾 Salvando...' : '💾 Salvar'}
              </button>
              
              <button
                onClick={sendCampaign}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                🚀 Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            <div className="h-full bg-gray-100 p-6 overflow-y-auto">
              <div 
                className={`mx-auto bg-white shadow-lg ${
                  previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
                }`}
                dangerouslySetInnerHTML={{ __html: generateHTML() }}
              />
            </div>
          ) : (
            <div className="flex h-full">
              {/* Canvas */}
              <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div 
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="bg-white min-h-96 border-2 border-dashed border-gray-300 rounded-lg p-4"
                  >
                    {elements.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">
                        <div className="text-4xl mb-4">📧</div>
                        <p className="text-lg mb-2">Arraste elementos para começar</p>
                        <p className="text-sm">Crie seu email personalizado</p>
                      </div>
                    ) : (
                      elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={`relative group border-2 rounded transition-all ${
                            selectedElement === element.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div 
                            style={element.style}
                            dangerouslySetInnerHTML={{ __html: element.content }}
                          />
                          
                          {selectedElement === element.id && (
                            <div className="absolute -top-2 -right-2 flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'up');
                                }}
                                disabled={index === 0}
                                className="bg-gray-500 text-white p-1 rounded text-xs hover:bg-gray-600 disabled:opacity-50"
                              >
                                ⬆
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'down');
                                }}
                                disabled={index === elements.length - 1}
                                className="bg-gray-500 text-white p-1 rounded text-xs hover:bg-gray-600 disabled:opacity-50"
                              >
                                ⬇
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                                className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                              >
                                🗑
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Element Properties */}
              {selectedElement && (
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      ✏️ Propriedades do Elemento
                    </h4>
                    
                    {(() => {
                      const element = elements.find(el => el.id === selectedElement);
                      if (!element) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Conteúdo
                            </label>
                            <textarea
                              value={element.content}
                              onChange={(e) => updateElement(element.id, { content: e.target.value })}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Padding
                              </label>
                              <input
                                type="text"
                                value={element.style.padding || ''}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, padding: e.target.value }
                                })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cor do Texto
                              </label>
                              <input
                                type="color"
                                value={element.style.color || '#000000'}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, color: e.target.value }
                                })}
                                className="w-full h-8 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fundo
                              </label>
                              <input
                                type="color"
                                value={element.style.backgroundColor || '#ffffff'}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, backgroundColor: e.target.value }
                                })}
                                className="w-full h-8 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alinhamento
                              </label>
                              <select
                                value={element.style.textAlign || 'left'}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, textAlign: e.target.value }
                                })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="left">Esquerda</option>
                                <option value="center">Centro</option>
                                <option value="right">Direita</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}