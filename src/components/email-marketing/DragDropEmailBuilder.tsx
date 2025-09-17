'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import RichTextEditor from './RichTextEditor';

interface EmailComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'spacer' | 'divider' | 'social' | 'header';
  content: any;
  style?: any;
}

interface DragDropEmailBuilderProps {
  initialContent?: string;
  onContentChange: (html: string) => void;
  className?: string;
}

const componentTemplates = {
  text: {
    type: 'text',
    content: { html: '<p>Add your text here...</p>' },
    style: { padding: '10px', fontSize: '14px', lineHeight: '1.6' }
  },
  image: {
    type: 'image',
    content: { src: 'https://via.placeholder.com/400x200', alt: 'Image' },
    style: { width: '100%', maxWidth: '400px', height: 'auto', margin: '10px 0' }
  },
  button: {
    type: 'button',
    content: { text: 'Click Here', url: '#' },
    style: {
      background: '#007bff',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '6px',
      textDecoration: 'none',
      display: 'inline-block',
      margin: '10px 0'
    }
  },
  spacer: {
    type: 'spacer',
    content: { height: 20 },
    style: {}
  },
  divider: {
    type: 'divider',
    content: {},
    style: {
      border: 'none',
      borderTop: '1px solid #eee',
      margin: '20px 0'
    }
  },
  social: {
    type: 'social',
    content: {
      links: [
        { platform: 'facebook', url: '#', icon: '📘' },
        { platform: 'twitter', url: '#', icon: '🐦' },
        { platform: 'instagram', url: '#', icon: '📷' }
      ]
    },
    style: { textAlign: 'center', margin: '20px 0' }
  },
  header: {
    type: 'header',
    content: {
      title: 'Your Email Header',
      subtitle: 'Add your subtitle here',
      logoUrl: ''
    },
    style: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }
  }
};

export default function DragDropEmailBuilder({
  initialContent = '',
  onContentChange,
  className = ''
}: DragDropEmailBuilderProps) {
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const generateId = () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDragStart = (componentType: string) => {
    setDraggedComponent(componentType);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedComponent) {
      const template = componentTemplates[draggedComponent as keyof typeof componentTemplates];
      const newComponent: EmailComponent = {
        id: generateId(),
        type: template.type as EmailComponent['type'],
        content: template.content,
        style: template.style
      };
      setComponents(prev => [...prev, newComponent]);
      setDraggedComponent(null);
      updateHtmlContent([...components, newComponent]);
    }
  }, [draggedComponent, components]);

  const updateHtmlContent = (componentList: EmailComponent[]) => {
    const html = generateEmailHtml(componentList);
    onContentChange(html);
  };

  const generateEmailHtml = (componentList: EmailComponent[]) => {
    const componentHtml = componentList.map(component => {
      switch (component.type) {
        case 'text':
          return `<div style="${styleObjectToString(component.style)}">${component.content.html}</div>`;

        case 'image':
          return `<div style="text-align: center; margin: 10px 0;">
            <img src="${component.content.src}" alt="${component.content.alt}" style="${styleObjectToString(component.style)}" />
          </div>`;

        case 'button':
          return `<div style="text-align: center; margin: 20px 0;">
            <a href="${component.content.url}" style="${styleObjectToString(component.style)}">${component.content.text}</a>
          </div>`;

        case 'spacer':
          return `<div style="height: ${component.content.height}px; line-height: ${component.content.height}px;">&nbsp;</div>`;

        case 'divider':
          return `<hr style="${styleObjectToString(component.style)}" />`;

        case 'social':
          return `<div style="${styleObjectToString(component.style)}">
            ${component.content.links.map((link: any) =>
              `<a href="${link.url}" style="margin: 0 10px; text-decoration: none; font-size: 24px;">${link.icon}</a>`
            ).join('')}
          </div>`;

        case 'header':
          return `<div style="${styleObjectToString(component.style)}">
            ${component.content.logoUrl ? `<img src="${component.content.logoUrl}" alt="Logo" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
            <h1 style="margin: 10px 0; color: #333;">${component.content.title}</h1>
            <p style="margin: 5px 0; color: #666;">${component.content.subtitle}</p>
          </div>`;

        default:
          return '';
      }
    }).join('');

    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        ${componentHtml}
      </div>
    </body>
    </html>`;
  };

  const styleObjectToString = (styleObj: any) => {
    if (!styleObj) return '';
    return Object.entries(styleObj)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  };

  const deleteComponent = (id: string) => {
    const updated = components.filter(c => c.id !== id);
    setComponents(updated);
    updateHtmlContent(updated);
    setSelectedComponent(null);
  };

  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    const updated = components.map(c => c.id === id ? { ...c, ...updates } : c);
    setComponents(updated);
    updateHtmlContent(updated);
  };

  const componentPalette = [
    { type: 'header', icon: '📋', name: 'Header', color: 'bg-blue-100' },
    { type: 'text', icon: '📝', name: 'Text', color: 'bg-gray-100' },
    { type: 'image', icon: '🖼️', name: 'Image', color: 'bg-green-100' },
    { type: 'button', icon: '🔘', name: 'Button', color: 'bg-purple-100' },
    { type: 'divider', icon: '➖', name: 'Divider', color: 'bg-yellow-100' },
    { type: 'spacer', icon: '⬜', name: 'Spacer', color: 'bg-pink-100' },
    { type: 'social', icon: '📱', name: 'Social', color: 'bg-indigo-100' }
  ];

  return (
    <div className={`flex h-full ${className}`}>
      {/* Component Palette */}
      <div className="w-64 bg-gray-50 p-4 border-r overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📦 Components</h3>

        <div className="space-y-2">
          {componentPalette.map(component => (
            <div
              key={component.type}
              draggable
              onDragStart={() => handleDragStart(component.type)}
              className={`p-3 rounded-lg cursor-move hover:shadow-md transition-all ${component.color} border border-gray-200`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{component.icon}</span>
                <span className="text-sm font-medium">{component.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowCode(!showCode)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {showCode ? '👁️ Visual' : '</> HTML'}
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">✉️ Email Builder</h3>
          <p className="text-sm text-gray-600">Drag components from the left to build your email</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showCode ? (
            <textarea
              value={generateEmailHtml(components)}
              onChange={(e) => {
                // For code view, you could parse HTML back to components
                // For now, just show the generated HTML
              }}
              className="w-full h-full p-4 font-mono text-sm border rounded resize-none"
              placeholder="HTML code will appear here..."
            />
          ) : (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="min-h-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 max-w-2xl mx-auto"
              style={{ backgroundColor: '#f4f4f4' }}
            >
              <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', minHeight: '400px' }}>
                {components.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📧</div>
                      <p className="text-lg">Drag components here to start building</p>
                      <p className="text-sm">Your email will appear in this area</p>
                    </div>
                  </div>
                ) : (
                  components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`relative group ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedComponent(component.id)}
                    >
                      {/* Component Controls */}
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => deleteComponent(component.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Render Component */}
                      <div dangerouslySetInnerHTML={{
                        __html: generateEmailHtml([component]).match(/<div style="max-width: 600px[^>]*>([\s\S]*?)<\/div>/)?.[1] || ''
                      }} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Component Properties Panel */}
        {selectedComponent && (
          <div className="bg-gray-50 p-4 border-t max-h-64 overflow-y-auto">
            <h4 className="font-semibold mb-3">⚙️ Component Properties</h4>
            {/* Add property editors here based on component type */}
            <div className="text-sm text-gray-600">
              Selected: {components.find(c => c.id === selectedComponent)?.type}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}