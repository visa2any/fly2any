'use client';

import { useKeyboardShortcuts, formatShortcut, KeyboardShortcut, ShortcutGroup } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: ShortcutGroup[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp = ({ 
  shortcuts, 
  isOpen, 
  onClose 
}: KeyboardShortcutsHelpProps) => {
  // Close on Escape key
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Fechar ajuda',
      action: onClose,
      global: true
    }
  ], { enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Atalhos do Teclado</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Use estes atalhos para navegar mais rapidamente
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortcuts.map((group) => (
              <div key={group.name} className="space-y-3">
                <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{shortcut.description}</span>
                      <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-800">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Pressione <kbd className="bg-gray-100 px-2 py-1 rounded">ESC</kbd> para fechar
          </div>
        </div>
      </div>
    </div>
  );
};