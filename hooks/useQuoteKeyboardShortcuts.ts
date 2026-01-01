"use client";

import { useEffect, useCallback, useRef } from "react";

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

interface UseQuoteKeyboardShortcutsOptions {
  enabled?: boolean;
  onSave?: () => void;
  onPreview?: () => void;
  onSend?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSearch?: () => void;
  onAddFlight?: () => void;
  onAddHotel?: () => void;
  onAddActivity?: () => void;
  onAddTransfer?: () => void;
  onToggleTemplates?: () => void;
  onTogglePricing?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
}

export function useQuoteKeyboardShortcuts({
  enabled = true,
  onSave,
  onPreview,
  onSend,
  onDuplicate,
  onUndo,
  onRedo,
  onSearch,
  onAddFlight,
  onAddHotel,
  onAddActivity,
  onAddTransfer,
  onToggleTemplates,
  onTogglePricing,
  onEscape,
  onHelp,
}: UseQuoteKeyboardShortcutsOptions) {
  const isInputFocused = useRef(false);

  // Build shortcuts map
  const shortcuts: ShortcutAction[] = [
    // Primary actions
    { key: "s", ctrl: true, description: "Save quote", action: () => onSave?.() },
    { key: "p", ctrl: true, description: "Preview quote", action: () => onPreview?.() },
    { key: "Enter", ctrl: true, shift: true, description: "Send quote", action: () => onSend?.() },
    { key: "d", ctrl: true, description: "Duplicate quote", action: () => onDuplicate?.() },

    // History
    { key: "z", ctrl: true, description: "Undo", action: () => onUndo?.() },
    { key: "z", ctrl: true, shift: true, description: "Redo", action: () => onRedo?.() },
    { key: "y", ctrl: true, description: "Redo", action: () => onRedo?.() },

    // Quick add (Alt+key)
    { key: "f", alt: true, description: "Add flight", action: () => onAddFlight?.() },
    { key: "h", alt: true, description: "Add hotel", action: () => onAddHotel?.() },
    { key: "a", alt: true, description: "Add activity", action: () => onAddActivity?.() },
    { key: "t", alt: true, description: "Add transfer", action: () => onAddTransfer?.() },

    // Navigation & Search
    { key: "k", ctrl: true, description: "Search", action: () => onSearch?.() },
    { key: "/", description: "Focus search", action: () => onSearch?.() },

    // Panels
    { key: "t", ctrl: true, shift: true, description: "Toggle templates", action: () => onToggleTemplates?.() },
    { key: "b", ctrl: true, description: "Toggle pricing", action: () => onTogglePricing?.() },

    // General
    { key: "Escape", description: "Close modal/cancel", action: () => onEscape?.() },
    { key: "?", shift: true, description: "Show shortcuts help", action: () => onHelp?.() },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if typing in input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only allow Escape
        if (event.key === "Escape") {
          onEscape?.();
        }
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!s.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatch = !!s.shift === event.shiftKey;
        const altMatch = !!s.alt === event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [enabled, shortcuts, onEscape]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Return shortcuts for help display
  return {
    shortcuts: shortcuts.map((s) => ({
      key: s.key,
      modifiers: [
        s.ctrl ? "⌘" : null,
        s.shift ? "⇧" : null,
        s.alt ? "⌥" : null,
      ].filter(Boolean),
      description: s.description,
    })),
  };
}

// Keyboard Shortcuts Help Modal Component
export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Array<{ key: string; modifiers: (string | null)[]; description: string }>;
}) {
  if (!isOpen) return null;

  const grouped = {
    "Primary Actions": shortcuts.filter((s) =>
      ["Save", "Preview", "Send", "Duplicate"].some((word) => s.description.includes(word))
    ),
    "Quick Add": shortcuts.filter((s) => s.description.startsWith("Add")),
    "Navigation": shortcuts.filter((s) =>
      ["Search", "Focus", "Toggle"].some((word) => s.description.includes(word))
    ),
    "General": shortcuts.filter((s) =>
      ["Undo", "Redo", "Close", "Show"].some((word) => s.description.includes(word))
    ),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-6 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.modifiers.map((mod, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono"
                        >
                          {mod}
                        </kbd>
                      ))}
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono uppercase">
                        {shortcut.key}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
