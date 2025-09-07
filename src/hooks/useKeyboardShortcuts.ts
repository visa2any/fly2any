import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  global?: boolean; // If true, works even when inputs are focused
}

export interface ShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[] | ShortcutGroup[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  // Flatten shortcuts if grouped
  const flattenedShortcuts = Array.isArray(shortcuts) 
    ? shortcuts.some(s => 'shortcuts' in s)
      ? (shortcuts as ShortcutGroup[]).flatMap(group => group.shortcuts)
      : shortcuts as KeyboardShortcut[]
    : [];

  shortcutsRef.current = flattenedShortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const activeElement = document.activeElement as HTMLElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    );

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      // Skip if input is focused and shortcut is not global
      if (isInputFocused && !shortcut.global) return false;

      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = Boolean(shortcut.ctrlKey) === event.ctrlKey;
      const altMatch = Boolean(shortcut.altKey) === event.altKey;
      const shiftMatch = Boolean(shortcut.shiftKey) === event.shiftKey;
      const metaMatch = Boolean(shortcut.metaKey) === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault ?? preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  }, [enabled, preventDefault]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [handleKeyDown, enabled]);
};

// Hook specifically for email marketing shortcuts
export const useEmailMarketingShortcuts = (callbacks: {
  onNewCampaign?: () => void;
  onSendCampaign?: () => void;
  onViewContacts?: () => void;
  onViewAnalytics?: () => void;
  onQuickSave?: () => void;
  onPreview?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onShowKeyboardHelp?: () => void;
  onRefresh?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}) => {
  const shortcuts: ShortcutGroup[] = [
    {
      name: 'Geral',
      shortcuts: [
        {
          key: 'n',
          ctrlKey: true,
          description: 'Nova campanha',
          action: callbacks.onNewCampaign || (() => {}),
          global: true
        },
        {
          key: 's',
          ctrlKey: true,
          description: 'Salvar rápido',
          action: callbacks.onQuickSave || (() => {}),
          global: true
        },
        {
          key: 'Enter',
          ctrlKey: true,
          description: 'Enviar campanha',
          action: callbacks.onSendCampaign || (() => {}),
          global: true
        },
        {
          key: 'p',
          ctrlKey: true,
          description: 'Pré-visualizar',
          action: callbacks.onPreview || (() => {}),
          global: true
        },
        {
          key: 'f',
          ctrlKey: true,
          description: 'Pesquisar',
          action: callbacks.onSearch || (() => {}),
          global: false
        },
        {
          key: 'r',
          ctrlKey: true,
          description: 'Atualizar',
          action: callbacks.onRefresh || (() => {}),
          global: true
        },
        {
          key: 'z',
          ctrlKey: true,
          description: 'Desfazer',
          action: callbacks.onUndo || (() => {}),
          global: false
        },
        {
          key: 'y',
          ctrlKey: true,
          description: 'Refazer',
          action: callbacks.onRedo || (() => {}),
          global: false
        },
        {
          key: '?',
          description: 'Ajuda de atalhos',
          action: callbacks.onShowKeyboardHelp || (() => {}),
          global: true
        },
        {
          key: 'Escape',
          description: 'Fechar modais/cancelar',
          action: () => {
            // Close any open modals
            const modals = document.querySelectorAll('[role="dialog"], .modal');
            if (modals.length > 0) {
              const lastModal = modals[modals.length - 1] as HTMLElement;
              const closeButton = lastModal.querySelector('[data-close], .close, [aria-label="Fechar"]') as HTMLElement;
              if (closeButton) {
                closeButton.click();
              }
            }
          },
          global: true,
          preventDefault: false
        }
      ]
    },
    {
      name: 'Navegação',
      shortcuts: [
        {
          key: '1',
          ctrlKey: true,
          description: 'Dashboard',
          action: () => window.location.href = '/admin/email-marketing',
          global: true
        },
        {
          key: '2',
          ctrlKey: true,
          description: 'Campanhas',
          action: () => window.location.href = '/admin/email-marketing#campaigns',
          global: true
        },
        {
          key: '3',
          ctrlKey: true,
          description: 'Contatos',
          action: callbacks.onViewContacts || (() => {}),
          global: true
        },
        {
          key: '4',
          ctrlKey: true,
          description: 'Análises',
          action: callbacks.onViewAnalytics || (() => {}),
          global: true
        },
        {
          key: 'b',
          ctrlKey: true,
          description: 'Toggle sidebar',
          action: callbacks.onToggleSidebar || (() => {}),
          global: true
        }
      ]
    },
    {
      name: 'Seleção e Ações',
      shortcuts: [
        {
          key: 'a',
          ctrlKey: true,
          description: 'Selecionar tudo',
          action: callbacks.onSelectAll || (() => {}),
          global: false
        },
        {
          key: 'Delete',
          description: 'Excluir selecionados',
          action: callbacks.onDelete || (() => {}),
          global: false
        },
        {
          key: 'd',
          ctrlKey: true,
          description: 'Duplicar',
          action: callbacks.onDuplicate || (() => {}),
          global: false
        },
        {
          key: 'e',
          ctrlKey: true,
          description: 'Exportar',
          action: callbacks.onExport || (() => {}),
          global: true
        },
        {
          key: 'i',
          ctrlKey: true,
          description: 'Importar',
          action: callbacks.onImport || (() => {}),
          global: true
        }
      ]
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
};

// Utility to display keyboard shortcuts in a help modal
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};


export default useKeyboardShortcuts;