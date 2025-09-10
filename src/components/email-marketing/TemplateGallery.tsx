'use client';

import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface TemplateGalleryProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
  className?: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1', name: 'Welcome Email', category: 'Welcome', description: 'Template de boas-vindas moderno',
    thumbnail: 'https://via.placeholder.com/300x200', industry: 'General', rating: 4.8, downloads: 1250,
    html: '<div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;"><h1 style="color:#333;">Bem-vindo!</h1><p>Obrigado por se juntar a nós!</p></div>',
    subject: 'Bem-vindo à {{company_name}}!', variables: ['company_name', 'user_name']
  },
  {
    id: '2', name: 'Newsletter Modern', category: 'Newsletter', description: 'Newsletter clean e responsivo',
    thumbnail: 'https://via.placeholder.com/300x200', industry: 'Technology', rating: 4.9, downloads: 980,
    html: '<div style="max-width:600px;margin:0 auto;background:#f8f9fa;padding:40px 20px;"><div style="background:white;padding:40px;border-radius:8px;"><h2>Newsletter</h2><p>Suas últimas atualizações aqui...</p></div></div>',
    subject: 'Newsletter Semanal - {{week}}', variables: ['week', 'content']
  },
  {
    id: '3', name: 'Promotional Sale', category: 'Promotional', description: 'Template para promoções e vendas',
    thumbnail: 'https://via.placeholder.com/300x200', industry: 'E-commerce', rating: 4.7, downloads: 2100,
    html: '<div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:40px;text-align:center;"><h1 style="font-size:48px;margin:0;">{{discount}}% OFF</h1><p style="font-size:20px;">{{offer_text}}</p><a href="{{link}}" style="background:white;color:#667eea;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;">APROVEITAR AGORA</a></div>',
    subject: '🔥 {{discount}}% de Desconto Imperdível!', variables: ['discount', 'offer_text', 'link']
  },
  {
    id: '4', name: 'Event Invitation', category: 'Event', description: 'Convite para eventos e webinars',
    thumbnail: 'https://via.placeholder.com/300x200', industry: 'Events', rating: 4.6, downloads: 750,
    html: '<div style="max-width:600px;margin:0 auto;padding:20px;"><div style="border:3px solid #ff6b6b;border-radius:10px;padding:40px;text-align:center;"><h1 style="color:#ff6b6b;">Você está convidado!</h1><h2>{{event_name}}</h2><p><strong>Data:</strong> {{event_date}}</p><p><strong>Local:</strong> {{event_location}}</p><a href="{{rsvp_link}}" style="background:#ff6b6b;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;">CONFIRMAR PRESENÇA</a></div></div>',
    subject: '🎉 Convite: {{event_name}}', variables: ['event_name', 'event_date', 'event_location', 'rsvp_link']
  }
];

export default function TemplateGallery({ onTemplateSelect, className = "" }: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingTemplate, setSelectingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch templates from database
  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/email-marketing/v2?action=templates&category=${selectedCategory}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform database templates to component format
        const transformedTemplates = data.data.templates.map(transformDbTemplate);
        setTemplates(transformedTemplates);
        
        // Set categories from API
        const allCategories = ['All', ...data.data.categories];
        setCategories(allCategories);
      } else {
        throw new Error(data.error || 'Falha ao carregar templates do servidor');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      
      // Set user-friendly error messages based on error type
      let errorMessage = 'Erro desconhecido ao carregar templates';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '❌ Sem conexão com o servidor. Verifique sua internet e tente novamente.';
      } else if (error instanceof Error && error.message.includes('404')) {
        errorMessage = '📭 Templates não encontrados. O sistema pode estar em manutenção.';
      } else if (error instanceof Error && error.message.includes('500')) {
        errorMessage = '⚠️ Erro interno do servidor. Nossa equipe foi notificada.';
      } else if (error instanceof Error && error.message.includes('403')) {
        errorMessage = '🔐 Acesso negado. Verifique suas permissões.';
      } else if (error instanceof Error && error.message) {
        errorMessage = `⚠️ ${error.message}`;
      }
      
      setError(errorMessage);
      
      // Always provide fallback templates for better UX
      console.warn('Using fallback templates due to API error');
      setTemplates(defaultTemplates);
      setCategories(['All', ...Array.from(new Set(defaultTemplates.map(t => t.category)))]);
    } finally {
      setLoading(false);
    }
  };

  // Transform database template to component format
  const transformDbTemplate = (dbTemplate: any): EmailTemplate => ({
    id: dbTemplate.id || 'unknown',
    name: dbTemplate.name || 'Template sem nome',
    category: dbTemplate.category || 'General',
    description: dbTemplate.description || 'Template profissional',
    thumbnail: dbTemplate.thumbnail_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K',
    html: dbTemplate.html_content || dbTemplate.html || '',
    subject: dbTemplate.subject || 'Sem assunto',
    variables: (() => {
      try {
        // Handle all possible variable formats safely
        if (!dbTemplate.variables) return [];
        
        if (typeof dbTemplate.variables === 'string') {
          // Handle JSON string format
          if (dbTemplate.variables.startsWith('[') || dbTemplate.variables.startsWith('{')) {
            const parsed = JSON.parse(dbTemplate.variables);
            return Array.isArray(parsed) ? parsed.filter((v: any) => v && typeof v === 'string') : [];
          }
          // Handle comma-separated string format
          return dbTemplate.variables.split(',').map((v: string) => v.trim()).filter((v: string) => v);
        }
        
        if (Array.isArray(dbTemplate.variables)) {
          // Already an array, filter for valid strings
          return dbTemplate.variables.filter((v: any) => v && typeof v === 'string');
        }
        
        return [];
      } catch (error) {
        console.warn(`Template ${dbTemplate.id}: Failed to parse variables`, error);
        return [];
      }
    })(),
    industry: getIndustryFromCategory(dbTemplate.category || 'General'),
    rating: 4.8, // Default rating
    downloads: dbTemplate.usage_count || 0,
    createdAt: dbTemplate.created_at ? new Date(dbTemplate.created_at) : new Date()
  });

  const getIndustryFromCategory = (category: string): string => {
    if (!category) return 'General';
    
    const industryMap: Record<string, string> = {
      'Welcome': 'General',
      'Newsletter': 'Technology', 
      'Promotional': 'E-commerce',
      'promotional': 'Travel', 
      'Event': 'Events'
    };
    return industryMap[category] || 'General';
  };
  
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template?.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      (template?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (template?.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-4 md:space-y-6 px-2 sm:px-0 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎨 Email Template Gallery
              </h2>
              <p className="text-gray-600">
                Mais de 20 templates profissionais prontos para usar
              </p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                disabled={loading}
              />
            </div>
            {/* Mobile-optimized category buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  disabled={loading}
                  className={`min-h-[44px] px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white shadow-md scale-95'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Loading Progress Bar */}
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Carregando templates...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-800 font-medium mb-1">Problema ao carregar templates</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                    <p className="text-red-600 text-xs mt-2">
                      📋 Mostrando templates padrão para que você possa continuar trabalhando.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={fetchTemplates}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium touch-manipulation min-h-[44px]"
                    disabled={loading}
                  >
                    {loading ? '🔄 Tentando...' : '🔄 Tentar Novamente'}
                  </button>
                  <button 
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium touch-manipulation min-h-[44px]"
                  >
                    ✕ Dispensar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Loading skeletons */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Preview */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEhxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span>{template.rating}</span>
                </div>
                <div className="text-gray-500">
                  {template.downloads?.toLocaleString()} downloads
                </div>
              </div>
              
              {template.industry && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Indústria: {template.industry}</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="px-4 pb-4 space-y-2">
              <button
                className="w-full min-h-[44px] py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                onClick={() => {
                  setPreviewTemplate(template);
                  setShowPreview(true);
                }}
              >
                👁️ Visualizar Template
              </button>
              <button
                className={`w-full min-h-[48px] py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                  selectingTemplate === template.id
                    ? 'bg-gray-400 text-white scale-95'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95'
                }`}
                style={{ touchAction: 'manipulation' }}
                disabled={selectingTemplate === template.id}
                onClick={async () => {
                  setSelectingTemplate(template.id);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 300)); // Brief visual feedback
                    if (!onTemplateSelect) {
                      throw new Error('Template selection handler not available');
                    }
                    onTemplateSelect(template);
                  } catch (error) {
                    console.error('Error selecting template:', error);
                    // Could add toast notification here if needed
                    alert('⚠️ Erro ao selecionar template. Tente novamente.');
                  } finally {
                    setSelectingTemplate(null);
                  }
                }}
              >
                {selectingTemplate === template.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Selecionando...
                  </div>
                ) : (
                  '✓ Usar Template'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
      
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-lg mb-2">Nenhum template encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou busca</p>
        </div>
      )}
      
      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{previewTemplate.name}</h2>
                  <p className="text-blue-100">{previewTemplate.description}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      📁 {previewTemplate.category}
                    </span>
                    {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        🏷️ Variáveis: {previewTemplate.variables.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewTemplate(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Subject Line */}
            {previewTemplate.subject && (
              <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Assunto:</span>
                  <span className="text-gray-900">{previewTemplate.subject}</span>
                </div>
              </div>
            )}
            
            {/* Template Content Preview */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Prévia do Template:</h3>
                  <div className="border rounded-lg bg-white shadow-sm">
                    {previewTemplate.html ? (
                      <div 
                        className="p-4"
                        dangerouslySetInnerHTML={{ __html: previewTemplate.html }}
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.6'
                        }}
                      />
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <div className="mb-4">
                          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium mb-2">Conteúdo não disponível</p>
                        <p className="text-sm">Este template ainda não possui conteúdo HTML definido.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* HTML Code Preview (Collapsible) */}
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    🔧 Ver código HTML
                  </summary>
                  <pre className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{previewTemplate.html || '<!-- Sem conteúdo HTML -->'}</code>
                  </pre>
                </details>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewTemplate(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={async () => {
                  setShowPreview(false);
                  if (onTemplateSelect && previewTemplate) {
                    onTemplateSelect(previewTemplate);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                ✓ Usar este Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}