'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  EmailTemplate, 
  generateCampaignName,
  replaceTemplateVariables,
  extractTemplateVariables,
  validateTemplate
} from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveStatus } from '@/components/ui/AutoSaveStatus';
import TipTapEditor from '@/components/ui/TipTapEditor';

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
  from_email: string;
  from_name: string;
  reply_to?: string;
}

interface DragElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'header' | 'footer' | 'section' | 'columns' | 'hero' | 'testimonial' | 'pricing' | 'cta-block';
  content: string;
  style: Record<string, string>;
  showHtml?: boolean;
  children?: DragElement[]; // For nested block architecture
  layout?: {
    columns?: number;
    distribution?: 'equal' | 'custom';
    columnWidths?: string[];
  };
}

interface DragState {
  isDragging: boolean;
  draggedElement: string | null;
  dropZoneActive: boolean;
  insertIndex: number | null;
}

const templateElements = [
  // Basic Elements
  {
    id: 'text',
    type: 'text' as const,
    name: 'Texto',
    icon: '📝',
    category: 'basic',
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
    category: 'basic',
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
    category: 'basic',
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
    category: 'basic',
    defaultContent: '<hr style="border: 1px solid #e0e0e0; margin: 20px 0;">',
    defaultStyle: { 
      padding: '10px 0' 
    }
  },

  // Layout Blocks
  {
    id: 'section',
    type: 'section' as const,
    name: 'Seção',
    icon: '📦',
    category: 'layout',
    defaultContent: '<div style="padding: 40px 20px; background-color: #ffffff;"><p style="text-align: center; color: #666;">Arraste elementos aqui para criar uma seção</p></div>',
    defaultStyle: { 
      backgroundColor: '#ffffff',
      padding: '40px 20px',
      margin: '0'
    }
  },
  {
    id: 'columns',
    type: 'columns' as const,
    name: 'Colunas',
    icon: '📊',
    category: 'layout',
    defaultContent: `
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Coluna 1</h3>
          <p style="margin: 0; color: #666;">Conteúdo da primeira coluna</p>
        </div>
        <div style="flex: 1; min-width: 250px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Coluna 2</h3>
          <p style="margin: 0; color: #666;">Conteúdo da segunda coluna</p>
        </div>
      </div>
    `,
    defaultStyle: { 
      padding: '20px 0',
    },
    layout: {
      columns: 2,
      distribution: 'equal',
      columnWidths: ['50%', '50%']
    }
  },

  // Advanced Blocks
  {
    id: 'hero',
    type: 'hero' as const,
    name: 'Hero Section',
    icon: '🦸',
    category: 'advanced',
    defaultContent: `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; text-align: center; color: white; border-radius: 12px;">
        <h1 style="margin: 0 0 20px 0; font-size: 2.5em; font-weight: bold;">Título Impactante</h1>
        <p style="margin: 0 0 30px 0; font-size: 1.2em; opacity: 0.9;">Desperte a atenção dos seus clientes com este hero section moderno</p>
        <a href="#" style="display: inline-block; padding: 15px 30px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 1.1em;">🚀 Call to Action</a>
      </div>
    `,
    defaultStyle: { 
      padding: '0',
      margin: '20px 0'
    }
  },
  {
    id: 'testimonial',
    type: 'testimonial' as const,
    name: 'Depoimento',
    icon: '💬',
    category: 'advanced',
    defaultContent: `
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #007bff;">
        <div style="display: flex; align-items: flex-start; gap: 20px;">
          <img src="https://via.placeholder.com/60x60/007bff/white?text=👤" alt="Cliente" style="width: 60px; height: 60px; border-radius: 50%; flex-shrink: 0;">
          <div>
            <blockquote style="margin: 0 0 15px 0; font-style: italic; font-size: 1.1em; color: #333; line-height: 1.5;">
              "Este produto transformou completamente minha experiência. Recomendo para todos!"
            </blockquote>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div>
                <strong style="color: #333;">Maria Silva</strong><br>
                <span style="color: #666; font-size: 0.9em;">Cliente Satisfeita</span>
              </div>
              <div style="color: #ffc107; font-size: 1.2em;">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>
    `,
    defaultStyle: { 
      padding: '10px 0'
    }
  },
  {
    id: 'pricing',
    type: 'pricing' as const,
    name: 'Plano/Preço',
    icon: '💰',
    category: 'advanced',
    defaultContent: `
      <div style="background-color: white; border: 2px solid #e1e5e9; border-radius: 12px; padding: 30px; text-align: center; position: relative; max-width: 300px; margin: 0 auto;">
        <div style="background-color: #007bff; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; font-size: 0.9em; font-weight: bold;">
          POPULAR
        </div>
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.5em;">Plano Premium</h3>
        <div style="margin-bottom: 20px;">
          <span style="font-size: 3em; font-weight: bold; color: #333;">R$99</span>
          <span style="color: #666; font-size: 1em;">/mês</span>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0 0 30px 0; text-align: left;">
          <li style="padding: 8px 0; color: #333; display: flex; align-items: center; gap: 10px;">
            <span style="color: #28a745; font-weight: bold;">✓</span> Recurso Premium 1
          </li>
          <li style="padding: 8px 0; color: #333; display: flex; align-items: center; gap: 10px;">
            <span style="color: #28a745; font-weight: bold;">✓</span> Recurso Premium 2
          </li>
          <li style="padding: 8px 0; color: #333; display: flex; align-items: center; gap: 10px;">
            <span style="color: #28a745; font-weight: bold;">✓</span> Suporte Prioritário
          </li>
        </ul>
        <a href="#" style="display: block; width: 100%; padding: 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Escolher Plano</a>
      </div>
    `,
    defaultStyle: { 
      padding: '20px 0',
      textAlign: 'center'
    }
  },
  {
    id: 'cta-block',
    type: 'cta-block' as const,
    name: 'CTA Completo',
    icon: '🎯',
    category: 'advanced',
    defaultContent: `
      <div style="background: linear-gradient(45deg, #ff6b35, #f7931e); padding: 40px; border-radius: 12px; text-align: center; color: white;">
        <h2 style="margin: 0 0 15px 0; font-size: 2em; font-weight: bold;">Não Perca Esta Oportunidade!</h2>
        <p style="margin: 0 0 25px 0; font-size: 1.2em; opacity: 0.95;">Junte-se a mais de 10.000 clientes satisfeitos</p>
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
          <a href="#" style="display: inline-block; padding: 15px 30px; background-color: white; color: #ff6b35; text-decoration: none; border-radius: 25px; font-weight: bold; border: 2px solid white;">🚀 Começar Agora</a>
          <a href="#" style="display: inline-block; padding: 15px 30px; background-color: transparent; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; border: 2px solid white;">📞 Falar com Vendas</a>
        </div>
        <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
          ⏰ Oferta válida por tempo limitado
        </div>
      </div>
    `,
    defaultStyle: { 
      padding: '10px 0'
    }
  },

  // Structure Elements
  {
    id: 'social',
    type: 'social' as const,
    name: 'Redes Sociais',
    icon: '🔗',
    category: 'structure',
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
    category: 'structure',
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
    category: 'structure',
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
    previewText: '',
    from_email: 'noreply@fly2any.com',
    from_name: 'Fly2Any',
    reply_to: 'contato@fly2any.com'
  });

  const [elements, setElements] = useState<DragElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElement: null,
    dropZoneActive: false,
    insertIndex: null
  });

  // Undo/Redo functionality
  const [history, setHistory] = useState<DragElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  
  // Save state to history for undo/redo
  const saveToHistory = useCallback((newElements: DragElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newElements]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  // Power user features state
  const [commandPalette, setCommandPalette] = useState(false);
  const [quickSearch, setQuickSearch] = useState<{ visible: boolean; query: string }>({ visible: false, query: '' });
  
  // Quick element creation function
  const createQuickElement = (elementType: string) => {
    const template = templateElements.find(t => t.type === elementType);
    if (!template) return;

    const newElement: DragElement = {
      id: Date.now().toString(),
      type: template.type,
      content: template.defaultContent,
      style: template.defaultStyle as unknown as Record<string, string>
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    
    // Show brief notification
    const notification = document.createElement('div');
    notification.textContent = `✅ ${template.name} adicionado`;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #10b981; color: white; padding: 12px 20px;
      border-radius: 8px; font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  };

  // Enhanced keyboard shortcuts with power user features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs (except for command palette)
      const isTypingInInput = (e.target as HTMLElement)?.tagName === 'INPUT' || 
                              (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
                              (e.target as HTMLElement)?.contentEditable === 'true';
      
      if (isTypingInInput && !(e.ctrlKey && e.shiftKey && e.key === 'P')) {
        return;
      }

      // Command Palette (Ctrl+Shift+P)
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCommandPalette(!commandPalette);
        return;
      }

      // Quick Search (Ctrl+F)
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setQuickSearch(prev => ({ ...prev, visible: !prev.visible }));
        return;
      }

      // Close modals on Escape
      if (e.key === 'Escape') {
        setCommandPalette(false);
        setQuickSearch({ visible: false, query: '' });
        setAiSuggestionsModal({ visible: false, elementId: null, suggestions: [] });
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          // Basic editing shortcuts
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            if (selectedElement) {
              e.preventDefault();
              const element = elements.find(el => el.id === selectedElement);
              if (element) {
                navigator.clipboard.writeText(JSON.stringify(element));
                // Show copy confirmation
                const notification = document.createElement('div');
                notification.textContent = '📋 Elemento copiado';
                notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; font-size: 12px;';
                document.body.appendChild(notification);
                setTimeout(() => document.body.removeChild(notification), 1500);
              }
            }
            break;
          case 'v':
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
              try {
                const element = JSON.parse(text);
                if (element.type && element.content) {
                  const newElement: DragElement = {
                    ...element,
                    id: Date.now().toString()
                  };
                  setElements(prev => [...prev, newElement]);
                  setSelectedElement(newElement.id);
                }
              } catch {
                console.log('Invalid clipboard content for paste operation');
              }
            });
            break;
          case 'd':
            if (selectedElement) {
              e.preventDefault();
              duplicateElement(selectedElement);
            }
            break;
          case 'a':
            e.preventDefault();
            setMultiSelection(elements.map(el => el.id));
            break;
          
          // Save shortcuts
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+S: Send campaign
              sendCampaign();
            } else {
              // Ctrl+S: Save campaign
              saveCampaign();
            }
            break;
          
          // Preview toggle
          case 'p':
            if (!e.shiftKey) {
              e.preventDefault();
              setShowPreview(!showPreview);
            }
            break;
          
          // AI suggestions
          case ' ':
            if (selectedElement) {
              e.preventDefault();
              aiSuggestContent(selectedElement);
            }
            break;
          
          // Quick element creation shortcuts (Ctrl+1, Ctrl+2, etc.)
          case '1':
            e.preventDefault();
            createQuickElement('text');
            break;
          case '2':
            e.preventDefault();
            createQuickElement('image');
            break;
          case '3':
            e.preventDefault();
            createQuickElement('button');
            break;
          case '4':
            e.preventDefault();
            createQuickElement('hero');
            break;
          case '5':
            e.preventDefault();
            createQuickElement('testimonial');
            break;
          case '6':
            e.preventDefault();
            createQuickElement('pricing');
            break;
          case '7':
            e.preventDefault();
            createQuickElement('cta-block');
            break;
          case '8':
            e.preventDefault();
            createQuickElement('columns');
            break;
          case '9':
            e.preventDefault();
            createQuickElement('section');
            break;
          case '0':
            e.preventDefault();
            createQuickElement('divider');
            break;
          
          // Element navigation shortcuts
          case 'j':
            e.preventDefault();
            // Select next element
            if (elements.length > 0) {
              const currentIndex = selectedElement ? elements.findIndex(el => el.id === selectedElement) : -1;
              const nextIndex = (currentIndex + 1) % elements.length;
              setSelectedElement(elements[nextIndex].id);
            }
            break;
          case 'k':
            e.preventDefault();
            // Select previous element
            if (elements.length > 0) {
              const currentIndex = selectedElement ? elements.findIndex(el => el.id === selectedElement) : 0;
              const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
              setSelectedElement(elements[prevIndex].id);
            }
            break;
        }
      }

      // Non-modifier shortcuts
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedElement && !isTypingInInput) {
            e.preventDefault();
            deleteElement(selectedElement);
          }
          break;
        case 'ArrowUp':
          if (!isTypingInInput && selectedElement) {
            e.preventDefault();
            moveElement(selectedElement, 'up');
          }
          break;
        case 'ArrowDown':
          if (!isTypingInInput && selectedElement) {
            e.preventDefault();
            moveElement(selectedElement, 'down');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, undo, redo, historyIndex, showPreview, commandPalette]);
  const [floatingToolbar, setFloatingToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string | null;
  }>({ visible: false, x: 0, y: 0, elementId: null });
  
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
    
    // If we have HTML content, create a single element containing the full template
    if (html && html.trim()) {
      elements.push({
        id: Date.now().toString(),
        type: 'text',
        content: html,
        style: { 
          width: '100%',
          minHeight: '400px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.6'
        }
      });
    }
    
    return elements;
  };

  // Parse and inject styles into HTML content
  const injectStylesIntoContent = (content: string, styles: Record<string, string>): string => {
    if (!content || !styles || Object.keys(styles).length === 0) {
      return content;
    }

    // Convert styles object to CSS string
    const cssStyles = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    // Try to inject styles into the root element of the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const firstElement = tempDiv.firstElementChild;
    if (firstElement) {
      const existingStyle = firstElement.getAttribute('style') || '';
      const combinedStyles = existingStyle + (existingStyle ? '; ' : '') + cssStyles;
      firstElement.setAttribute('style', combinedStyles);
      return tempDiv.innerHTML;
    } else {
      // If no root element, wrap content with styled div
      return `<div style="${cssStyles}">${content}</div>`;
    }
  };

  // Duplicate element
  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement: DragElement = {
      ...element,
      id: Date.now().toString()
    };
    
    const index = elements.findIndex(el => el.id === id);
    setElements(prev => [
      ...prev.slice(0, index + 1),
      newElement,
      ...prev.slice(index + 1)
    ]);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedElement: elementType,
      dropZoneActive: false
    }));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add drag preview styling
    const dragPreview = document.createElement('div');
    dragPreview.textContent = templateElements.find(el => el.type === elementType)?.name || 'Element';
    dragPreview.style.cssText = `
      background: #3b82f6;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 50, 20);
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    setDragState(prev => ({
      ...prev,
      dropZoneActive: true
    }));
    
    // Calculate insert position
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      const rect = dropZone.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const elementHeight = 60; // Approximate element height
      const insertIndex = Math.floor(y / elementHeight);
      
      setDragState(prev => ({
        ...prev,
        insertIndex: Math.min(insertIndex, elements.length)
      }));
    }
  };
  
  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const { clientX, clientY } = e;
    const isOutside = clientX < rect.left || clientX > rect.right || 
                     clientY < rect.top || clientY > rect.bottom;
                     
    if (isOutside) {
      setDragState(prev => ({
        ...prev,
        dropZoneActive: false,
        insertIndex: null
      }));
    }
  };

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragState.draggedElement) return;
    
    const template = templateElements.find(t => t.type === dragState.draggedElement);
    if (!template) return;
    
    const newElement: DragElement = {
      id: Date.now().toString(),
      type: template.type,
      content: template.defaultContent,
      style: template.defaultStyle as unknown as Record<string, string>
    };
    
    const insertIndex = dragState.insertIndex ?? elements.length;
    setElements(prev => [
      ...prev.slice(0, insertIndex),
      newElement,
      ...prev.slice(insertIndex)
    ]);
    
    setDragState({
      isDragging: false,
      draggedElement: null,
      dropZoneActive: false,
      insertIndex: null
    });
    
    // Auto-select the newly added element
    setTimeout(() => setSelectedElement(newElement.id), 100);
  }, [dragState, elements]);

  // Update element content with history tracking
  const updateElement = (id: string, updates: Partial<DragElement>) => {
    setElements(prev => {
      const newElements = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      saveToHistory(newElements);
      return newElements;
    });
  };

  // TipTap editor helper functions
  const insertVariable = (elementId: string) => {
    const variables = ['{{first_name}}', '{{email}}', '{{company}}', '{{unsubscribe_url}}'];
    const variableOptions = variables.map(v => `• ${v}`).join('\n');
    const selectedVar = prompt(`Escolha uma variável:\n${variableOptions}\n\nDigite a variável:`);
    
    if (!selectedVar) return;

    const element = elements.find(el => el.id === elementId);
    if (element) {
      updateElement(elementId, { 
        content: element.content + selectedVar 
      });
    }
  };

  // AI-powered content suggestions with context awareness
  const [aiSuggestionsModal, setAiSuggestionsModal] = useState<{
    visible: boolean;
    elementId: string | null;
    suggestions: Array<{
      type: string;
      content: string;
      description: string;
    }>;
  }>({ visible: false, elementId: null, suggestions: [] });

  const generateContextualSuggestions = (element: DragElement, campaignType: string) => {
    const suggestions: Array<{ type: string; content: string; description: string }> = [];

    // Context-aware suggestions based on element type and campaign type
    if (element.type === 'header') {
      switch (campaignType) {
        case 'promotional':
          suggestions.push(
            { type: 'headline', content: '<h1 style="color: #e74c3c; text-align: center;">🔥 Oferta Relâmpago - 48h Apenas!</h1>', description: 'Headline urgente com emoji' },
            { type: 'headline', content: '<h1 style="color: #2c3e50; text-align: center;">Desconto Exclusivo para Você</h1>', description: 'Headline personalizada elegante' },
            { type: 'headline', content: '<h1 style="color: #8e44ad; text-align: center;">✨ Super Promoção de Inverno</h1>', description: 'Headline sazonal com emoji' }
          );
          break;
        case 'newsletter':
          suggestions.push(
            { type: 'headline', content: '<h1 style="color: #34495e; text-align: center;">📰 Newsletter Semanal - Fly2Any</h1>', description: 'Cabeçalho informativo' },
            { type: 'headline', content: '<h1 style="color: #16a085; text-align: center;">Novidades da Semana</h1>', description: 'Cabeçalho clean e moderno' },
            { type: 'headline', content: '<h1 style="color: #e67e22; text-align: center;">🌟 Destaques e Tendências</h1>', description: 'Cabeçalho engajante' }
          );
          break;
        case 'welcome':
          suggestions.push(
            { type: 'headline', content: '<h1 style="color: #27ae60; text-align: center;">🎉 Bem-vindo(a) à Fly2Any!</h1>', description: 'Boas-vindas calorosas' },
            { type: 'headline', content: '<h1 style="color: #3498db; text-align: center;">Sua Jornada Começa Aqui</h1>', description: 'Mensagem inspiradora' },
            { type: 'headline', content: '<h1 style="color: #9b59b6; text-align: center;">✈️ Pronto para Decolar?</h1>', description: 'Tema aviação com emoji' }
          );
          break;
      }
    } else if (element.type === 'text') {
      switch (campaignType) {
        case 'promotional':
          suggestions.push(
            { 
              type: 'content', 
              content: '<p>Não perca esta <strong>oportunidade única</strong>! Por tempo limitado, você tem acesso a descontos de até <span style="color: #e74c3c; font-size: 18px;"><strong>50%</strong></span> em toda nossa linha de produtos premium.</p><p>⏰ <em>Oferta válida apenas até {{deadline}}</em></p>', 
              description: 'Conteúdo promocional com urgência' 
            },
            { 
              type: 'content', 
              content: '<p>Olá {{first_name}},</p><p>Preparamos uma seleção especial pensando em você. Produtos cuidadosamente escolhidos com <strong>preços exclusivos</strong> para nossos clientes VIP.</p><p>🎁 <em>Frete grátis em compras acima de R$ 200</em></p>', 
              description: 'Conteúdo personalizado e exclusivo' 
            },
            { 
              type: 'content', 
              content: '<p>🚀 <strong>Últimas unidades disponíveis!</strong></p><p>Nossos produtos mais populares estão quase esgotados. Garante o seu antes que seja tarde demais!</p><ul><li>Qualidade premium garantida</li><li>Entrega rápida em todo o Brasil</li><li>Satisfação 100% ou seu dinheiro de volta</li></ul>', 
              description: 'Lista de benefícios com escassez' 
            }
          );
          break;
        case 'newsletter':
          suggestions.push(
            { 
              type: 'content', 
              content: '<p>Olá {{first_name}},</p><p>Esta semana trouxemos conteúdos especiais sobre <strong>tendências de mercado</strong> e <strong>dicas exclusivas</strong> para você se manter sempre atualizado.</p><p>📈 <em>Principais destaques da semana</em></p>', 
              description: 'Introdução informativa' 
            },
            { 
              type: 'content', 
              content: '<p><strong>🔍 Em Destaque:</strong></p><ul><li>Análise do mercado atual</li><li>Dicas de especialistas</li><li>Cases de sucesso</li><li>Tendências para 2024</li></ul><p>Continue lendo para descobrir insights valiosos!</p>', 
              description: 'Lista de tópicos da newsletter' 
            }
          );
          break;
        case 'welcome':
          suggestions.push(
            { 
              type: 'content', 
              content: '<p>Olá {{first_name}}, seja bem-vindo(a)!</p><p>É um prazer tê-lo(a) conosco! Agora você faz parte de uma comunidade exclusiva que tem acesso a:</p><ul><li>✅ Ofertas especiais e descontos únicos</li><li>✅ Conteúdo premium gratuito</li><li>✅ Atendimento prioritário</li><li>✅ Novidades em primeira mão</li></ul>', 
              description: 'Mensagem de boas-vindas com benefícios' 
            },
            { 
              type: 'content', 
              content: '<p>🎯 <strong>Próximos passos:</strong></p><p>Para aproveitar ao máximo sua experiência, recomendamos:</p><ol><li>Complete seu perfil em nossa plataforma</li><li>Explore nossa central de ajuda</li><li>Siga-nos nas redes sociais</li><li>Fique de olho em seu email para ofertas exclusivas</li></ol>', 
              description: 'Guia de próximos passos' 
            }
          );
          break;
      }
    } else if (element.type === 'button') {
      suggestions.push(
        { type: 'cta', content: '<a href="#" style="display: inline-block; padding: 15px 30px; background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; text-transform: uppercase;">🔥 Aproveitar Agora</a>', description: 'CTA urgente com gradiente' },
        { type: 'cta', content: '<a href="#" style="display: inline-block; padding: 12px 24px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">✅ Garantir Meu Desconto</a>', description: 'CTA de conversão verde' },
        { type: 'cta', content: '<a href="#" style="display: inline-block; padding: 14px 28px; background-color: #3498db; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">👉 Saiba Mais</a>', description: 'CTA informativo azul' },
        { type: 'cta', content: '<a href="#" style="display: inline-block; padding: 16px 32px; background-color: #8e44ad; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);">💎 Acesso VIP</a>', description: 'CTA premium com sombra' }
      );
    } else if (element.type === 'hero') {
      switch (campaignType) {
        case 'promotional':
          suggestions.push(
            { type: 'hero', content: '<div style="background: linear-gradient(45deg, #ff6b35, #f7931e); padding: 80px 40px; text-align: center; color: white; border-radius: 12px;"><h1 style="margin: 0 0 20px 0; font-size: 3em; font-weight: bold;">🔥 MEGA PROMOÇÃO</h1><p style="margin: 0 0 30px 0; font-size: 1.3em; opacity: 0.95;">Desconto de até 70% em produtos selecionados</p><a href="#" style="display: inline-block; padding: 20px 40px; background-color: white; color: #ff6b35; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.2em;">🛒 Comprar Agora</a><div style="margin-top: 25px; font-size: 0.9em; opacity: 0.8;">⏰ Válido apenas até {{deadline}}</div></div>', description: 'Hero promocional com urgência' },
            { type: 'hero', content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 70px 40px; text-align: center; color: white; border-radius: 12px;"><h1 style="margin: 0 0 20px 0; font-size: 2.8em; font-weight: bold;">Ofertas Exclusivas</h1><p style="margin: 0 0 30px 0; font-size: 1.2em; opacity: 0.9;">Para nossos clientes VIP</p><a href="#" style="display: inline-block; padding: 18px 35px; background-color: rgba(255,255,255,0.9); color: #667eea; text-decoration: none; border-radius: 25px; font-weight: bold;">✨ Ver Ofertas</a></div>', description: 'Hero VIP elegante' }
          );
          break;
        case 'welcome':
          suggestions.push(
            { type: 'hero', content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; text-align: center; color: white; border-radius: 12px;"><h1 style="margin: 0 0 20px 0; font-size: 2.5em; font-weight: bold;">🎉 Bem-vindo(a), {{first_name}}!</h1><p style="margin: 0 0 30px 0; font-size: 1.2em; opacity: 0.9;">Você agora faz parte da família Fly2Any</p><a href="#" style="display: inline-block; padding: 15px 30px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">🚀 Começar Jornada</a></div>', description: 'Hero de boas-vindas personalizado' }
          );
          break;
      }
    } else if (element.type === 'testimonial') {
      suggestions.push(
        { type: 'testimonial', content: '<div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #28a745;"><div style="display: flex; align-items: flex-start; gap: 20px;"><img src="https://via.placeholder.com/60x60/28a745/white?text=JM" alt="João" style="width: 60px; height: 60px; border-radius: 50%; flex-shrink: 0;"><div><blockquote style="margin: 0 0 15px 0; font-style: italic; font-size: 1.1em; color: #333;">"Resultados incríveis! Superou todas minhas expectativas. Empresa séria e confiável."</blockquote><div><strong>João Martins</strong><br><span style="color: #666; font-size: 0.9em;">Empresário - São Paulo</span></div><div style="color: #ffc107; margin-top: 10px;">⭐⭐⭐⭐⭐</div></div></div></div>', description: 'Depoimento empresarial verde' },
        { type: 'testimonial', content: '<div style="background-color: white; padding: 35px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"><div style="text-align: center; margin-bottom: 20px;"><div style="color: #ffc107; font-size: 2em; margin-bottom: 15px;">⭐⭐⭐⭐⭐</div><blockquote style="margin: 0; font-style: italic; font-size: 1.2em; color: #333; line-height: 1.6;">"Simplesmente fantástico! Recomendo de olhos fechados para qualquer pessoa."</blockquote></div><div style="display: flex; align-items: center; justify-content: center; gap: 15px;"><img src="https://via.placeholder.com/50x50/007bff/white?text=AM" alt="Ana" style="width: 50px; height: 50px; border-radius: 50%;"><div><strong>Ana Melissa</strong><br><span style="color: #666;">Designer Freelancer</span></div></div></div>', description: 'Depoimento centralizado com destaque' }
      );
    } else if (element.type === 'pricing') {
      suggestions.push(
        { type: 'pricing', content: '<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;"><div style="background-color: white; border: 2px solid #e1e5e9; border-radius: 12px; padding: 25px; text-align: center; min-width: 250px;"><h3 style="margin: 0 0 20px 0; color: #333;">Plano Básico</h3><div style="margin-bottom: 20px;"><span style="font-size: 2.5em; font-weight: bold; color: #333;">R$49</span><span style="color: #666;">/mês</span></div><ul style="list-style: none; padding: 0; margin: 0 0 25px 0;"><li style="padding: 5px 0; color: #333;">✓ Recurso básico</li><li style="padding: 5px 0; color: #333;">✓ Suporte por email</li></ul><a href="#" style="display: block; padding: 10px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 6px;">Escolher</a></div><div style="background-color: white; border: 3px solid #007bff; border-radius: 12px; padding: 25px; text-align: center; min-width: 250px; transform: scale(1.05);"><div style="background-color: #007bff; color: white; padding: 5px 15px; border-radius: 15px; margin: -30px auto 15px; display: inline-block; font-size: 0.9em;">RECOMENDADO</div><h3 style="margin: 0 0 20px 0; color: #333;">Plano Pro</h3><div style="margin-bottom: 20px;"><span style="font-size: 2.5em; font-weight: bold; color: #007bff;">R$99</span><span style="color: #666;">/mês</span></div><ul style="list-style: none; padding: 0; margin: 0 0 25px 0;"><li style="padding: 5px 0; color: #333;">✓ Todos recursos básicos</li><li style="padding: 5px 0; color: #333;">✓ Recursos avançados</li><li style="padding: 5px 0; color: #333;">✓ Suporte prioritário</li></ul><a href="#" style="display: block; padding: 10px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px;">Escolher</a></div></div>', description: 'Comparação de planos com destaque' },
        { type: 'pricing', content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 15px; text-align: center;"><h2 style="margin: 0 0 20px 0; font-size: 2em;">Oferta Especial</h2><div style="margin-bottom: 25px;"><span style="font-size: 3.5em; font-weight: bold;">R$77</span><br><span style="opacity: 0.8; text-decoration: line-through;">R$147</span> <span style="background-color: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; font-size: 0.9em;">47% OFF</span></div><p style="margin-bottom: 30px; opacity: 0.9;">Acesso completo por 12 meses</p><a href="#" style="display: inline-block; padding: 15px 40px; background-color: white; color: #667eea; text-decoration: none; border-radius: 25px; font-weight: bold;">Aproveitar Oferta</a><div style="margin-top: 20px; opacity: 0.8; font-size: 0.9em;">⏰ Restam apenas 5 dias</div></div>', description: 'Oferta especial com desconto' }
      );
    } else if (element.type === 'cta-block') {
      suggestions.push(
        { type: 'cta-block', content: '<div style="background: linear-gradient(45deg, #28a745, #20c997); padding: 50px 40px; border-radius: 15px; text-align: center; color: white;"><h2 style="margin: 0 0 20px 0; font-size: 2.2em; font-weight: bold;">🚀 Transforme Seu Negócio</h2><p style="margin: 0 0 30px 0; font-size: 1.3em; opacity: 0.95;">Junte-se a milhares de empreendedores de sucesso</p><div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 25px;"><div style="text-align: center;"><div style="font-size: 2em; font-weight: bold;">+50k</div><div style="opacity: 0.9;">Clientes</div></div><div style="text-align: center;"><div style="font-size: 2em; font-weight: bold;">98%</div><div style="opacity: 0.9;">Satisfação</div></div><div style="text-align: center;"><div style="font-size: 2em; font-weight: bold;">24/7</div><div style="opacity: 0.9;">Suporte</div></div></div><a href="#" style="display: inline-block; padding: 18px 40px; background-color: white; color: #28a745; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">Começar Agora Grátis</a></div>', description: 'CTA com números e estatísticas' },
        { type: 'cta-block', content: '<div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 45px; border-radius: 12px; text-align: center; color: white; position: relative; overflow: hidden;"><div style="position: absolute; top: -20px; right: -20px; background-color: rgba(255,255,255,0.2); width: 100px; height: 100px; border-radius: 50%; opacity: 0.3;"></div><div style="position: absolute; bottom: -30px; left: -30px; background-color: rgba(255,255,255,0.1); width: 120px; height: 120px; border-radius: 50%; opacity: 0.3;"></div><div style="position: relative; z-index: 2;"><h2 style="margin: 0 0 15px 0; font-size: 2em; font-weight: bold;">⏰ Última Chance!</h2><p style="margin: 0 0 25px 0; font-size: 1.1em; opacity: 0.95;">Esta oferta expira em breve</p><div style="background-color: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 25px; display: inline-block;"><div style="font-size: 1.5em; font-weight: bold;">Restam apenas 24 horas</div></div><a href="#" style="display: inline-block; padding: 15px 35px; background-color: white; color: #ff6b35; text-decoration: none; border-radius: 25px; font-weight: bold; animation: pulse 2s infinite;">🔥 Garantir Agora</a></div></div>', description: 'CTA de urgência com countdown' }
      );
    }

    // Add universal suggestions for any element type
    if (campaignType === 'promotional') {
      suggestions.push(
        { type: 'universal', content: '<p style="text-align: center; color: #e74c3c; font-weight: bold;">⚡ Oferta por tempo limitado - Não perca!</p>', description: 'Elemento de urgência universal' },
        { type: 'universal', content: '<p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">💰 <strong>Economia garantida:</strong> Compare e veja a diferença!</p>', description: 'Box de destaque amarelo' }
      );
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  const aiSuggestContent = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Generate contextual suggestions
    const suggestions = generateContextualSuggestions(element, campaign.type);
    
    setAiSuggestionsModal({
      visible: true,
      elementId,
      suggestions
    });
  };

  const applySuggestion = (suggestion: { content: string }) => {
    if (!aiSuggestionsModal.elementId) return;

    const element = elements.find(el => el.id === aiSuggestionsModal.elementId);
    if (!element) return;

    // Replace content instead of appending for better UX
    updateElement(aiSuggestionsModal.elementId, { content: suggestion.content });
    
    setAiSuggestionsModal({ visible: false, elementId: null, suggestions: [] });
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    setFloatingToolbar(prev => ({ ...prev, visible: false, elementId: null }));
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
      // Inject styles directly into content instead of using wrapper div
      return injectStylesIntoContent(element.content, element.style);
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
      // Validation
      if (!campaign.name.trim()) {
        throw new Error('Nome da campanha é obrigatório');
      }
      if (!campaign.subject.trim()) {
        throw new Error('Assunto é obrigatório');
      }
      if (!campaign.from_email.trim()) {
        throw new Error('Email do remetente é obrigatório');
      }
      if (!campaign.from_name.trim()) {
        throw new Error('Nome do remetente é obrigatório');
      }
      if (elements.length === 0) {
        throw new Error('Adicione pelo menos um elemento ao email');
      }

      const finalHTML = generateHTML();
      const campaignData = {
        ...campaign,
        content: finalHTML,
        created_by: 'admin' // TODO: Get from auth context
      };

      const response = await emailMarketingAPI.createCampaign(campaignData);
      if (response.success) {
        // Show success message
        alert('✅ Campanha salva com sucesso!');
        onSave?.(response.data);
      } else {
        throw new Error(response.error || 'Erro ao salvar campanha');
      }
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Erro desconhecido ao salvar campanha';
      alert(`❌ Erro: ${errorMessage}`);
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
  
  // Handle element selection and floating toolbar
  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setFloatingToolbar({
      visible: true,
      x: rect.right + 10,
      y: rect.top,
      elementId
    });
  };
  
  // Close floating toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.floating-toolbar') && !target.closest('.element-wrapper')) {
        setFloatingToolbar(prev => ({ ...prev, visible: false, elementId: null }));
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Left Sidebar - Block Categories */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🧱 Blocos de Construção
          </h3>
          
          {/* Block Categories */}
          {[
            { key: 'basic', name: '📝 Básicos', color: 'blue' },
            { key: 'layout', name: '📊 Layout', color: 'green' },
            { key: 'advanced', name: '🚀 Avançados', color: 'purple' },
            { key: 'structure', name: '🏗️ Estrutura', color: 'gray' }
          ].map((category) => {
            const categoryElements = templateElements.filter(el => (el as any).category === category.key);
            return (
              <div key={category.key} className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  {category.name}
                  <span className={`bg-${category.color}-100 text-${category.color}-600 text-xs px-2 py-1 rounded-full`}>
                    {categoryElements.length}
                  </span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {categoryElements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, element.type)}
                      className={`p-3 border-2 border-dashed rounded-lg cursor-grab hover:border-${category.color}-400 hover:bg-${category.color}-50 text-center transition-all duration-200 group`}
                    >
                      <div className="text-lg mb-1 group-hover:scale-110 transition-transform">{element.icon}</div>
                      <div className="text-xs text-gray-600 font-medium">{element.name}</div>
                      
                      {/* Advanced blocks get special indicator */}
                      {category.key === 'advanced' && (
                        <div className="mt-1">
                          <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 px-1 py-0.5 rounded">
                            ✨ Pro
                          </span>
                        </div>
                      )}
                      
                      {/* Layout blocks get layout indicator */}
                      {category.key === 'layout' && (
                        <div className="mt-1">
                          <span className="text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                            📐 Layout
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Remetente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={campaign.from_email}
                    onChange={(e) => setCampaign(prev => ({ ...prev, from_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="noreply@fly2any.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Remetente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaign.from_name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, from_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Fly2Any"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Resposta
                </label>
                <input
                  type="email"
                  value={campaign.reply_to || ''}
                  onChange={(e) => setCampaign(prev => ({ ...prev, reply_to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="contato@fly2any.com"
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
              <AutoSaveStatus autoSave={autoSave as any} />
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
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`bg-white min-h-96 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                      dragState.dropZoneActive 
                        ? 'border-blue-400 bg-blue-50 shadow-inner' 
                        : 'border-gray-300'
                    }`}
                  >
                    {/* Drop zone empty state */}
                    {elements.length === 0 && (
                      <div className={`text-center py-20 transition-all duration-200 ${
                        dragState.dropZoneActive ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        <div className="text-4xl mb-4">
                          {dragState.dropZoneActive ? '📥' : '📧'}
                        </div>
                        <p className="text-lg mb-2">
                          {dragState.dropZoneActive 
                            ? 'Solte o elemento aqui' 
                            : 'Arraste elementos para começar'
                          }
                        </p>
                        <p className="text-sm">
                          {dragState.dropZoneActive 
                            ? 'Crie seu primeiro elemento' 
                            : 'Crie seu email personalizado'
                          }
                        </p>
                      </div>
                    )}
                    
                    {/* Elements list */}
                    {elements.map((element, index) => (
                      <React.Fragment key={element.id}>
                        {/* Drop indicator */}
                        {dragState.dropZoneActive && dragState.insertIndex === index && (
                          <div className="h-2 bg-blue-400 rounded-full mb-2 opacity-75 animate-pulse" />
                        )}
                        
                        <div
                          className={`element-wrapper relative group border-2 rounded-lg transition-all duration-200 mb-2 ${
                            selectedElement === element.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={(e) => handleElementClick(e, element.id)}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedElement(element.id);
                            updateElement(element.id, { showHtml: false });
                            // Focus the content editor in the sidebar
                            setTimeout(() => {
                              const contentEditor = document.querySelector(`[data-element-id="${element.id}"] [contenteditable]`) as HTMLElement;
                              if (contentEditor) {
                                contentEditor.focus();
                              }
                            }, 100);
                          }}
                        >
                          {/* Drag handle */}
                          <div className={`absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                            selectedElement === element.id ? 'opacity-100' : ''
                          }`}>
                            <div className="w-6 h-6 bg-gray-400 hover:bg-gray-500 rounded cursor-grab flex items-center justify-center text-white text-xs">
                              ⋮⋮
                            </div>
                          </div>
                          
                          {/* Element content with injected styles */}
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: injectStylesIntoContent(element.content, element.style) 
                            }}
                          />
                          
                          {/* Selection indicator */}
                          {selectedElement === element.id && (
                            <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
                              <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                {templateElements.find(t => t.type === element.type)?.name || element.type}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Drop indicator at end */}
                        {dragState.dropZoneActive && dragState.insertIndex === index + 1 && index === elements.length - 1 && (
                          <div className="h-2 bg-blue-400 rounded-full mt-2 opacity-75 animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                    
                    {/* Final drop zone when no elements */}
                    {dragState.dropZoneActive && elements.length > 0 && dragState.insertIndex === elements.length && (
                      <div className="h-2 bg-blue-400 rounded-full mt-2 opacity-75 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Toolbar */}
              {floatingToolbar.visible && floatingToolbar.elementId && (
                <div 
                  className="floating-toolbar fixed bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex gap-1 z-50"
                  style={{
                    left: `${Math.min(floatingToolbar.x, window.innerWidth - 300)}px`,
                    top: `${Math.max(floatingToolbar.y, 10)}px`
                  }}
                >
                  <button
                    onClick={() => {
                      const index = elements.findIndex(el => el.id === floatingToolbar.elementId);
                      if (index > 0) moveElement(floatingToolbar.elementId!, 'up');
                    }}
                    disabled={elements.findIndex(el => el.id === floatingToolbar.elementId) === 0}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => {
                      const index = elements.findIndex(el => el.id === floatingToolbar.elementId);
                      if (index < elements.length - 1) moveElement(floatingToolbar.elementId!, 'down');
                    }}
                    disabled={elements.findIndex(el => el.id === floatingToolbar.elementId) === elements.length - 1}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => duplicateElement(floatingToolbar.elementId!)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Duplicar elemento"
                  >
                    📋
                  </button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <button
                    onClick={() => deleteElement(floatingToolbar.elementId!)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                    title="Deletar elemento"
                  >
                    🗑️
                  </button>
                </div>
              )}
              
              {/* Right Panel - Element Properties */}
              {selectedElement && (
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto" data-element-id={selectedElement}>
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
                            
                            {/* TipTap Rich Text Editor */}
                            <TipTapEditor
                              content={element.content}
                              onChange={(content) => updateElement(element.id, { content })}
                              placeholder="Digite seu conteúdo aqui..."
                              className="w-full"
                              showToolbar={true}
                              showCharacterCount={false}
                              onAISuggestion={() => aiSuggestContent(element.id)}
                              onInsertVariable={() => insertVariable(element.id)}
                            />
                            
                            {/* HTML Source Toggle */}
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const htmlMode = !element.showHtml;
                                  updateElement(element.id, { showHtml: htmlMode });
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {element.showHtml ? '📝 Editor Visual' : '🔧 Código HTML'}
                              </button>
                              
                              {element.showHtml && (
                                <textarea
                                  value={element.content}
                                  onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                  rows={4}
                                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="<p>Seu HTML aqui...</p>"
                                />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Largura
                                </label>
                                <input
                                  type="text"
                                  value={element.style.width || ''}
                                  onChange={(e) => updateElement(element.id, { 
                                    style: { ...element.style, width: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="100% ou 300px"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Altura
                                </label>
                                <input
                                  type="text"
                                  value={element.style.height || ''}
                                  onChange={(e) => updateElement(element.id, { 
                                    style: { ...element.style, height: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="auto ou 200px"
                                />
                              </div>
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
                                Cor de Fundo
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={element.style.backgroundColor || '#ffffff'}
                                  onChange={(e) => updateElement(element.id, { 
                                    style: { ...element.style, backgroundColor: e.target.value }
                                  })}
                                  className="w-12 h-8 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={element.style.backgroundColor || ''}
                                  onChange={(e) => updateElement(element.id, { 
                                    style: { ...element.style, backgroundColor: e.target.value }
                                  })}
                                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="#ffffff ou transparent"
                                />
                              </div>
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
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Margem
                              </label>
                              <input
                                type="text"
                                value={element.style.margin || ''}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, margin: e.target.value }
                                })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="10px ou 10px 20px"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Borda
                              </label>
                              <input
                                type="text"
                                value={element.style.border || ''}
                                onChange={(e) => updateElement(element.id, { 
                                  style: { ...element.style, border: e.target.value }
                                })}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="1px solid #ccc"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Raio da Borda
                            </label>
                            <input
                              type="text"
                              value={element.style.borderRadius || ''}
                              onChange={(e) => updateElement(element.id, { 
                                style: { ...element.style, borderRadius: e.target.value }
                              })}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="4px ou 50%"
                            />
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

      {/* Command Palette */}
      {commandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚡ Command Palette
              </h3>
              <p className="text-sm text-gray-600">Execute commands quickly with keyboard shortcuts</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">🚀 Quick Actions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                         onClick={() => { setShowPreview(!showPreview); setCommandPalette(false); }}>
                      <span className="text-sm">Toggle Preview</span>
                      <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+P</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                         onClick={() => { saveCampaign(); setCommandPalette(false); }}>
                      <span className="text-sm">Save Campaign</span>
                      <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+S</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                         onClick={() => { sendCampaign(); setCommandPalette(false); }}>
                      <span className="text-sm">Send Campaign</span>
                      <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+Shift+S</kbd>
                    </div>
                    {selectedElement && (
                      <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                           onClick={() => { aiSuggestContent(selectedElement); setCommandPalette(false); }}>
                        <span className="text-sm">AI Suggestions</span>
                        <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+Space</kbd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Element Creation */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">➕ Quick Create</h4>
                  <div className="space-y-2">
                    {[
                      { key: '1', name: 'Text', type: 'text', icon: '📝' },
                      { key: '2', name: 'Image', type: 'image', icon: '🖼️' },
                      { key: '3', name: 'Button', type: 'button', icon: '🔲' },
                      { key: '4', name: 'Hero Section', type: 'hero', icon: '🦸' },
                      { key: '5', name: 'Testimonial', type: 'testimonial', icon: '💬' },
                      { key: '6', name: 'Pricing', type: 'pricing', icon: '💰' },
                    ].map((item) => (
                      <div key={item.key}
                           className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                           onClick={() => { createQuickElement(item.type); setCommandPalette(false); }}>
                        <span className="text-sm flex items-center gap-2">
                          <span>{item.icon}</span>
                          {item.name}
                        </span>
                        <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl+{item.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">⌨️ Navigation Shortcuts</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+J</kbd> Next Element</div>
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+K</kbd> Previous Element</div>
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">↑↓</kbd> Move Element</div>
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+C</kbd> Copy</div>
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+V</kbd> Paste</div>
                  <div><kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+D</kbd> Duplicate</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Press <kbd className="bg-gray-200 px-1 py-0.5 rounded text-xs">Esc</kbd> to close</span>
                <button
                  onClick={() => setCommandPalette(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Search */}
      {quickSearch.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-20 z-40">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search elements..."
                  value={quickSearch.query}
                  onChange={(e) => setQuickSearch(prev => ({ ...prev, query: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {elements
                  .filter(element => 
                    !quickSearch.query || 
                    element.content.toLowerCase().includes(quickSearch.query.toLowerCase()) ||
                    element.type.toLowerCase().includes(quickSearch.query.toLowerCase())
                  )
                  .map((element, index) => {
                    const template = templateElements.find(t => t.type === element.type);
                    return (
                      <div
                        key={element.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedElement === element.id 
                            ? 'bg-blue-100 border border-blue-300' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedElement(element.id);
                          setQuickSearch({ visible: false, query: '' });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{template?.icon || '📄'}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{template?.name || element.type}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {element.content.replace(/<[^>]*>/g, '').slice(0, 50)}...
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                        </div>
                      </div>
                    );
                  })
                }
                
                {elements.filter(element => 
                  !quickSearch.query || 
                  element.content.toLowerCase().includes(quickSearch.query.toLowerCase()) ||
                  element.type.toLowerCase().includes(quickSearch.query.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🔍</div>
                    <p>No elements found</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
              Press <kbd className="bg-gray-200 px-1 py-0.5 rounded">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {aiSuggestionsModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ✨ Sugestões de IA Contextuais
              </h3>
              <p className="text-gray-600">
                Escolha uma sugestão baseada no tipo do seu elemento e campanha atual ({campaign.type})
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiSuggestionsModal.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">Clique para aplicar</span>
                      </div>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-green-600 text-sm font-medium transition-opacity"
                      >
                        ✅ Usar
                      </button>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">
                      {suggestion.description}
                    </h4>
                    
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      <div className="text-xs text-gray-500 mb-2">Visualização:</div>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: suggestion.content }}
                      />
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-400">
                      💡 Esta sugestão foi gerada com base no contexto do elemento e tipo de campanha
                    </div>
                  </div>
                ))}
              </div>
              
              {aiSuggestionsModal.suggestions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg mb-2">Nenhuma sugestão disponível</p>
                  <p className="text-sm">Tente selecionar um elemento diferente ou alterar o tipo de campanha.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🎯</span>
                  <span>Sugestões personalizadas para melhorar conversão</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiSuggestionsModal({ visible: false, elementId: null, suggestions: [] })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}