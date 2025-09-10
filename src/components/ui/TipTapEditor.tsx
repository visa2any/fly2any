'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useCallback, useEffect, useState } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  onAISuggestion?: () => void;
  onInsertVariable?: () => void;
  editable?: boolean;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Comece a digitar...',
  className = '',
  showToolbar = true,
  showCharacterCount = false,
  maxCharacters,
  onAISuggestion,
  onInsertVariable,
  editable = true,
}: TipTapEditorProps) {
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDialogVisible, setLinkDialogVisible] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({ 
        types: ['textStyle', 'heading'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      ...(maxCharacters ? [CharacterCount.configure({ limit: maxCharacters })] : []),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    immediatelyRender: false, // Fix SSR hydration issues
    shouldRerenderOnTransaction: false, // Improve performance
    // Error handling and lifecycle
    onCreate: ({ editor }) => {
      setIsEditorReady(true);
      setEditorError(null);
    },
    onDestroy: () => {
      setIsEditorReady(false);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      try {
        editor.commands.setContent(content, { emitUpdate: false });
      } catch (error) {
        console.error('Failed to set editor content:', error);
        setEditorError(error instanceof Error ? error.message : 'Failed to set content');
      }
    }
  }, [content, editor]);

  // Cleanup effect for proper editor destruction
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
      // Clean up modal states
      setColorPickerVisible(false);
      setLinkDialogVisible(false);
    };
  }, [editor]);

  const insertLink = useCallback(() => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      setLinkUrl(previousUrl || '');
      setLinkDialogVisible(true);
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    // Check for empty string instead of null
    if (!linkUrl || linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkDialogVisible(false);
      return;
    }

    // Add URL validation and auto-fix
    try {
      let validUrl = linkUrl;
      if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        validUrl = `https://${linkUrl}`;
      }
      
      // Test URL validity
      new URL(validUrl);
      
      // Set the link with validated URL
      editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
    } catch (error) {
      console.error('Invalid URL:', linkUrl);
      // Could add user notification here in the future
    }
    
    setLinkDialogVisible(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  // Error state display
  if (editorError) {
    return (
      <div className={`border border-red-300 bg-red-50 p-4 rounded-lg ${className}`}>
        <p className="text-red-600 text-sm">
          ❌ Editor failed to initialize: {editorError}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Loading state display
  if (!editor || !isEditorReady) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 min-h-[100px] flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">
          ⏳ Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50 border-b-0">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('bold') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Negrito (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('italic') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Itálico (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('strike') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Riscado (Ctrl+Shift+X)"
            >
              <s>S</s>
            </button>
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Headings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Título 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Título 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('paragraph') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Parágrafo"
            >
              P
            </button>
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('bulletList') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Lista com marcadores"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('orderedList') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Lista numerada"
            >
              1.
            </button>
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Alinhar à esquerda"
            >
              ⬅️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Centralizar"
            >
              ↔️
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Alinhar à direita"
            >
              ➡️
            </button>
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Link */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={insertLink}
              className={`px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors ${
                editor.isActive('link') ? 'bg-blue-100 border-blue-300' : ''
              }`}
              title="Adicionar/Editar Link (Ctrl+K)"
            >
              🔗
            </button>
            {editor.isActive('link') && (
              <button
                type="button"
                onClick={removeLink}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-red-100 text-red-600"
                title="Remover Link"
              >
                🔗❌
              </button>
            )}
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorPickerVisible(!colorPickerVisible)}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              title="Cor do texto"
            >
              🎨
            </button>
            {colorPickerVisible && (
              <div className="absolute top-8 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {[
                    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                    '#ff0000', '#ff6600', '#ffcc00', '#33cc00', '#0066cc', '#6600cc',
                    '#ff3366', '#ff9900', '#ffff00', '#66ff00', '#0099ff', '#9900ff'
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setColorPickerVisible(false);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setColorPickerVisible(false);
                  }}
                  className="w-full px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Remover cor
                </button>
              </div>
            )}
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Advanced Features */}
          <div className="flex items-center gap-1">
            {onInsertVariable && (
              <button
                type="button"
                onClick={onInsertVariable}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                title="Inserir Variável"
              >
                🏷️
              </button>
            )}
            {onAISuggestion && (
              <button
                type="button"
                onClick={onAISuggestion}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 transition-colors"
                title="Sugestão de IA (Ctrl+Space)"
              >
                ✨
              </button>
            )}
          </div>

          {/* Visual separator */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Desfazer (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refazer (Ctrl+Y)"
            >
              ↷
            </button>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {linkDialogVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">Adicionar/Editar Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLink();
                } else if (e.key === 'Escape') {
                  setLinkDialogVisible(false);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkDialogVisible(false)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={setLink}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={`prose prose-sm max-w-none border border-gray-200 rounded-b-lg p-3 min-h-[100px] focus-within:ring-1 focus-within:ring-blue-500 ${
          showToolbar ? 'border-t-0' : ''
        }`}
        style={{ 
          maxHeight: '300px', 
          overflowY: 'auto',
        }}
      />

      {/* Character Count */}
      {showCharacterCount && maxCharacters && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {editor.storage.characterCount.characters()}/{maxCharacters} caracteres
        </div>
      )}

      {/* Click outside handler for color picker */}
      {colorPickerVisible && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setColorPickerVisible(false)}
        />
      )}
    </div>
  );
}