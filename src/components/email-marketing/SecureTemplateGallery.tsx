'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { EmailTemplate } from '../../lib/email-marketing/utils';
import { emailMarketingAPI } from '../../lib/email-marketing/api';
import SafeErrorBoundary from '../ui/SafeErrorBoundary';
import { useSafeAsyncError, useSafeAsync } from '../../hooks/useSafeAsync';
import { 
  sanitizeEmailContent, 
  sanitizePreviewContent, 
  sanitizeUserInput, 
  globalRateLimiter,
  validateFileUpload
} from '../../lib/security/sanitization';
import { useSecureNotifications } from '../../hooks/useSecureNotifications';

interface TemplateGalleryProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
  className?: string;
  maxTemplates?: number;
  allowedCategories?: string[];
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: '1', name: 'Welcome Email', category: 'Welcome', description: 'Template de boas-vindas moderno',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K', 
    industry: 'General', rating: 4.8, downloads: 1250,
    html: '<div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial,sans-serif;"><h1 style="color:#333;">Bem-vindo!</h1><p>Obrigado por se juntar a nós!</p></div>',
    subject: 'Bem-vindo à {{company_name}}!', 
    variables: ['company_name', 'user_name']
  },
  {
    id: '2', name: 'Newsletter Modern', category: 'Newsletter', description: 'Newsletter clean e responsivo',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K', 
    industry: 'Technology', rating: 4.9, downloads: 980,
    html: '<div style="max-width:600px;margin:0 auto;background:#f8f9fa;padding:40px 20px;"><div style="background:white;padding:40px;border-radius:8px;"><h2>Newsletter</h2><p>Suas últimas atualizações aqui...</p></div></div>',
    subject: 'Newsletter Semanal - {{week}}', 
    variables: ['week', 'content']
  }
];

function SecureTemplateGalleryCore({ onTemplateSelect, className = "", maxTemplates = 50, allowedCategories }: TemplateGalleryProps) {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectingTemplate, setSelectingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const { handleError: throwAsyncError } = useSafeAsyncError();
  const notifications = useSecureNotifications();

  // Transform database template to component format with security sanitization
  const transformDbTemplate = useCallback((dbTemplate: any): EmailTemplate => {
    try {
      // Validate required fields
      if (!dbTemplate || typeof dbTemplate !== 'object') {
        throw new Error('Invalid template data received');
      }

      // Sanitize all string fields
      const sanitizedTemplate: EmailTemplate = {
        id: sanitizeUserInput(dbTemplate.id || 'unknown'),
        name: sanitizeUserInput(dbTemplate.name || 'Template sem nome'),
        category: sanitizeUserInput(dbTemplate.category || 'General'),
        description: sanitizeUserInput(dbTemplate.description || 'Template profissional'),
        thumbnail: dbTemplate.thumbnail_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K',
        // SECURITY: Sanitize HTML content for XSS protection
        html: sanitizeEmailContent(dbTemplate.html_content || dbTemplate.html || ''),
        subject: sanitizeUserInput(dbTemplate.subject || 'Sem assunto'),
        variables: (() => {
          try {
            // Handle all possible variable formats safely
            if (!dbTemplate.variables) return [];
            
            if (typeof dbTemplate.variables === 'string') {
              // Handle JSON string format
              if (dbTemplate.variables.startsWith('[') || dbTemplate.variables.startsWith('{')) {
                const parsed = JSON.parse(dbTemplate.variables);
                return Array.isArray(parsed) 
                  ? parsed.filter((v: any) => v && typeof v === 'string').map((v: string) => sanitizeUserInput(v))
                  : [];
              }
              // Handle comma-separated string format
              return dbTemplate.variables.split(',')
                .map((v: string) => sanitizeUserInput(v.trim()))
                .filter((v: string) => v);
            }
            
            if (Array.isArray(dbTemplate.variables)) {
              // Already an array, filter for valid strings and sanitize
              return dbTemplate.variables
                .filter((v: any) => v && typeof v === 'string')
                .map((v: string) => sanitizeUserInput(v));
            }
            
            return [];
          } catch (error) {
            console.warn(`Template ${dbTemplate.id}: Failed to parse variables`, error);
            notifications.warning('Template Variable Error', `Template ${dbTemplate.id} has malformed variables`);
            return [];
          }
        })(),
        industry: getIndustryFromCategory(dbTemplate.category || 'General'),
        rating: Math.max(0, Math.min(5, Number(dbTemplate.rating) || 4.8)), // Clamp rating between 0-5
        downloads: Math.max(0, Number(dbTemplate.usage_count) || 0), // Ensure non-negative
        createdAt: dbTemplate.created_at ? new Date(dbTemplate.created_at) : new Date()
      };

      return sanitizedTemplate;
    } catch (error) {
      console.error('Error transforming template:', error);
      notifications.error('Template Processing Error', 'A template could not be processed safely');
      
      // Return safe fallback template
      return {
        id: 'error_template',
        name: 'Error Loading Template',
        category: 'General',
        description: 'This template could not be loaded safely',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwSDE3MFY2MEgxMzBWMTAwWiIgZmlsbD0iI0Q1REJEQiIvPgo8L3N2Zz4K',
        html: '<div style="padding: 20px; text-align: center;">Template could not be loaded safely</div>',
        subject: 'Error Loading Template',
        variables: [],
        industry: 'General',
        rating: 0,
        downloads: 0,
        createdAt: new Date()
      };
    }
  }, [notifications]);

  // Use safe async hook for fetching templates with security checks
  const { data: templatesData, loading, error, retry, execute } = useSafeAsync(async () => {
    // Rate limiting check
    const clientId = 'template_fetch_' + (typeof window !== 'undefined' ? window.location.hostname : 'server');
    if (globalRateLimiter.isRateLimited(clientId, 10, 60000)) {
      notifications.rateLimitExceeded('template loading');
      throw new Error('Rate limit exceeded for template loading');
    }

    const sanitizedCategory = sanitizeUserInput(selectedCategory);
    const response = await fetch(`/api/email-marketing/v2?action=templates&category=${encodeURIComponent(sanitizedCategory)}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add CSRF protection header if available
        ...(typeof window !== 'undefined' && (window as any).csrfToken && {
          'X-CSRF-Token': (window as any).csrfToken
        })
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000),
      // Ensure credentials are included for CSRF
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      const sanitizedTemplates = data.data.templates
        .map(transformDbTemplate)
        .slice(0, maxTemplates); // Limit number of templates

      const filteredCategories = allowedCategories
        ? ['All', ...data.data.categories.filter((cat: string) => allowedCategories.includes(cat))]
        : ['All', ...data.data.categories];

      return {
        templates: sanitizedTemplates,
        categories: filteredCategories
      };
    } else {
      throw new Error(data.error || 'Failed to load templates from server');
    }
  });

  // Execute template fetch when dependencies change
  useEffect(() => {
    execute();
  }, [selectedCategory, maxTemplates, allowedCategories, transformDbTemplate, execute]);

  // Update categories when data loads
  useEffect(() => {
    if (templatesData?.categories) {
      setCategories(templatesData.categories);
    }
  }, [templatesData]);

  // Get templates with fallback
  const templates = templatesData?.templates || defaultTemplates;
  
  // Handle errors gracefully
  const handleError = (error: Error) => {
    console.error('TemplateGallery error:', error);
    if (error.message.includes('recentlyCreatedOwnerStacks')) {
      throwAsyncError(error);
    }
  };

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
  
  // Memoized filtered templates with security validation
  const filteredTemplates = useMemo(() => {
    return templates.filter((template: any) => {
      // Security check: ensure template has required fields
      if (!template || !template.id || !template.name) {
        return false;
      }

      const matchesCategory = selectedCategory === 'All' || template?.category === selectedCategory;
      
      // Sanitize search query for security
      const sanitizedQuery = sanitizeUserInput(searchQuery).toLowerCase();
      const matchesSearch = !sanitizedQuery || 
        (template?.name?.toLowerCase().includes(sanitizedQuery) || false) ||
        (template?.description?.toLowerCase().includes(sanitizedQuery) || false);
        
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Handle secure search input
  const handleSearchChange = useCallback((value: string) => {
    // Rate limiting for search
    if (globalRateLimiter.isRateLimited('template_search', 20, 60000)) {
      notifications.rateLimitExceeded('template search');
      return;
    }
    
    // Basic input validation
    if (value.length > 100) {
      notifications.invalidInput('search query (too long)');
      return;
    }
    
    setSearchQuery(value);
    setSearchAttempts(prev => prev + 1);
  }, [notifications]);

  // Handle template selection with security checks
  const handleTemplateSelection = useCallback(async (template: EmailTemplate) => {
    // Rate limiting for template selection
    if (globalRateLimiter.isRateLimited('template_select_' + template.id, 5, 60000)) {
      notifications.rateLimitExceeded('template selection');
      return;
    }

    setSelectingTemplate(template.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief visual feedback
      
      if (!onTemplateSelect) {
        throw new Error('Template selection handler not available');
      }
      
      // Validate template before selection
      if (!template.html || template.html.trim().length === 0) {
        throw new Error('Template has no content');
      }
      
      onTemplateSelect(template);
      notifications.success('Template Selected', `${template.name} has been selected successfully`);
    } catch (error) {
      console.error('Error selecting template:', error);
      notifications.error('Template Selection Error', 'Unable to select template. Please try again.');
    } finally {
      setSelectingTemplate(null);
    }
  }, [onTemplateSelect, notifications]);

  return (
    <div className={`space-y-4 md:space-y-6 px-2 sm:px-0 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <span aria-hidden="true">🎨</span> Email Template Gallery
              </h2>
              <p className="text-gray-600">
                Mais de 20 templates profissionais prontos para usar
              </p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex-1">
              <label htmlFor="template-search" className="sr-only">
                Search templates
              </label>
              <input
                id="template-search"
                type="text"
                placeholder="Pesquisar templates..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
                disabled={loading}
                maxLength={100}
                aria-describedby="search-help"
                autoComplete="off"
                spellCheck="false"
              />
              <div id="search-help" className="sr-only">
                Search through email templates by name or description. Maximum 100 characters.
              </div>
            </div>
            
            {/* Mobile-optimized category buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3" role="group" aria-label="Template categories">
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
                  aria-pressed={selectedCategory === category}
                  type="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!loading) setSelectedCategory(category);
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Loading Progress Bar */}
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-label="Loading templates">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Carregando templates...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm" aria-hidden="true">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-800 font-medium mb-1">Problema ao carregar templates</h4>
                    <p className="text-red-700 text-sm">{error.message || 'Erro ao conectar com o servidor'}</p>
                    <p className="text-red-600 text-xs mt-2">
                      <span aria-hidden="true">📋</span> Mostrando templates padrão para que você possa continuar trabalhando.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={retry}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium touch-manipulation min-h-[44px]"
                    disabled={loading}
                    type="button"
                  >
                    {loading ? <><span aria-hidden="true">🔄</span> Tentando...</> : <><span aria-hidden="true">🔄</span> Tentar Novamente</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Loading templates">
          {/* Loading skeletons */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse" aria-hidden="true">
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
          {filteredTemplates.map((template: any) => (
          <article
            key={template.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Preview - Mobile Responsive */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
              {template.html ? (
                <div className="absolute inset-0 p-1 sm:p-2">
                  <div 
                    className="w-full h-full overflow-hidden rounded bg-white shadow-inner"
                    style={{
                      // Mobile responsive scaling:
                      transform: 'scale(var(--template-scale))',
                      transformOrigin: 'top left',
                      width: 'var(--template-width)',
                      height: 'var(--template-height)',
                      // CSS Variables for responsive scaling
                      '--template-scale': 'clamp(0.15, 0.2vw + 0.1, 0.3)',
                      '--template-width': 'clamp(500%, 3000% - 100vw, 333%)',
                      '--template-height': 'clamp(500%, 3000% - 100vw, 333%)'
                    } as React.CSSProperties}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ __html: sanitizePreviewContent(template.html) }}
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: 'clamp(10px, 2vw + 8px, 14px)',
                        lineHeight: '1.4'
                      }}
                      role="presentation"
                      aria-label={`Preview of ${template.name} template`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Template Preview</span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900" title={template.name}>{template.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500" aria-hidden="true">⭐</span>
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
                aria-label={`Preview ${template.name} template`}
                type="button"
              >
                <span aria-hidden="true">👁️</span> Visualizar Template
              </button>
              <button
                className={`w-full min-h-[48px] py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                  selectingTemplate === template.id
                    ? 'bg-gray-400 text-white scale-95'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95'
                }`}
                style={{ touchAction: 'manipulation' }}
                disabled={selectingTemplate === template.id}
                onClick={() => handleTemplateSelection(template)}
                aria-label={`Use ${template.name} template`}
                type="button"
              >
                {selectingTemplate === template.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    Selecionando...
                  </div>
                ) : (
                  <><span aria-hidden="true">✓</span> Usar Template</>
                )}
              </button>
            </div>
          </article>
        ))}
        </div>
      )}
      
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500" role="status">
          <div className="text-4xl mb-4" aria-hidden="true">🎨</div>
          <p className="text-lg mb-2">Nenhum template encontrado</p>
          <p className="text-sm">Tente ajustar os filtros ou busca</p>
        </div>
      )}
      
      {/* Template Preview Modal - Mobile Responsive */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-2 sm:mx-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header - Mobile Responsive */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 sm:p-6">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 id="preview-title" className="text-lg sm:text-2xl font-bold mb-2 truncate">{previewTemplate.name}</h2>
                  <p className="text-blue-100">{previewTemplate.description}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      <span aria-hidden="true">📁</span> {previewTemplate.category}
                    </span>
                    {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        <span aria-hidden="true">🏷️</span> Variáveis: {previewTemplate.variables.join(', ')}
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
                  aria-label="Close preview"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                        dangerouslySetInnerHTML={{ __html: sanitizePreviewContent(previewTemplate.html) }}
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.6'
                        }}
                        role="document"
                        aria-label="Template preview content"
                      />
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <div className="mb-4">
                          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                    <span aria-hidden="true">🔧</span> Ver código HTML
                  </summary>
                  <pre className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{sanitizePreviewContent(previewTemplate.html) || '<!-- Sem conteúdo HTML -->'}</code>
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
                type="button"
              >
                Fechar
              </button>
              <button
                onClick={async () => {
                  setShowPreview(false);
                  if (onTemplateSelect && previewTemplate) {
                    await handleTemplateSelection(previewTemplate);
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                type="button"
              >
                <span aria-hidden="true">✓</span> Usar este Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with SafeErrorBoundary wrapper
export default function SecureTemplateGallery(props: TemplateGalleryProps) {
  return (
    <SafeErrorBoundary>
      <SecureTemplateGalleryCore {...props} />
    </SafeErrorBoundary>
  );
}