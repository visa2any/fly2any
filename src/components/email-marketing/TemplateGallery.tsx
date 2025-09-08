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

  // Fetch templates from database
  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/email-marketing/v2?action=templates&category=${selectedCategory}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform database templates to component format
        const transformedTemplates = data.data.templates.map(transformDbTemplate);
        setTemplates(transformedTemplates);
        
        // Set categories from API
        const allCategories = ['All', ...data.data.categories];
        setCategories(allCategories);
      } else {
        // Fallback to default templates if API fails
        console.warn('Failed to load templates from database, using defaults');
        setTemplates(defaultTemplates);
        setCategories(['All', ...Array.from(new Set(defaultTemplates.map(t => t.category)))]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Erro ao carregar templates');
      // Fallback to default templates
      setTemplates(defaultTemplates);
      setCategories(['All', ...Array.from(new Set(defaultTemplates.map(t => t.category)))]);
    } finally {
      setLoading(false);
    }
  };

  // Transform database template to component format
  const transformDbTemplate = (dbTemplate: any): EmailTemplate => ({
    id: dbTemplate.id,
    name: dbTemplate.name,
    category: dbTemplate.category,
    description: dbTemplate.description || 'Template profissional',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K',
    html: dbTemplate.html_content,
    subject: dbTemplate.subject,
    variables: dbTemplate.variables ? dbTemplate.variables.split(',').map((v: string) => v.trim()) : [],
    industry: getIndustryFromCategory(dbTemplate.category),
    rating: 4.8, // Default rating
    downloads: dbTemplate.usage_count || 0,
    createdAt: dbTemplate.created_at ? new Date(dbTemplate.created_at) : new Date()
  });

  const getIndustryFromCategory = (category: string): string => {
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
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
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
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700">{error}</span>
                <button 
                  onClick={fetchTemplates}
                  className="ml-auto text-red-600 hover:text-red-800 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onTemplateSelect?.(template)}
          >
            {/* Preview */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K';
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
            
            {/* Action */}
            <div className="px-4 pb-4">
              <button
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:scale-105 transition-transform font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateSelect?.(template);
                }}
              >
                Usar Template
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
    </div>
  );
}