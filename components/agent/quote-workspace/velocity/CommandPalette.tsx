"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plane, Building2, Compass, Car, Bus, Send, Save, Eye, Crown, Users, Mountain, Briefcase, Heart, Settings, HelpCircle, Keyboard, Plus } from "lucide-react";
import { formatShortcut, SHORTCUT_MAP } from "./useAgentShortcuts";
import { QUOTE_PRESETS } from "./SmartPresets";

// ============================================
// COMMAND PALETTE - Power User Quick Access
// ============================================

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  shortcut?: { key: string; ctrl?: boolean; shift?: boolean };
  category: "navigation" | "actions" | "presets" | "help";
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (commandId: string) => void;
  customCommands?: Command[];
}

export default function CommandPalette({ isOpen, onClose, onAction, customCommands = [] }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build command list
  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      // Navigation
      { id: "nav-flights", label: "Go to Flights", icon: Plane, category: "navigation", shortcut: { key: "1", ctrl: true }, action: () => onAction?.("nav-flights") },
      { id: "nav-hotels", label: "Go to Hotels", icon: Building2, category: "navigation", shortcut: { key: "2", ctrl: true }, action: () => onAction?.("nav-hotels") },
      { id: "nav-activities", label: "Go to Activities", icon: Compass, category: "navigation", shortcut: { key: "3", ctrl: true }, action: () => onAction?.("nav-activities") },
      { id: "nav-cars", label: "Go to Cars", icon: Car, category: "navigation", shortcut: { key: "4", ctrl: true }, action: () => onAction?.("nav-cars") },
      { id: "nav-transfers", label: "Go to Transfers", icon: Bus, category: "navigation", shortcut: { key: "5", ctrl: true }, action: () => onAction?.("nav-transfers") },

      // Actions
      { id: "preview", label: "Toggle Preview", description: "Show client view", icon: Eye, category: "actions", shortcut: { key: "P", ctrl: true }, action: () => onAction?.("preview") },
      { id: "save", label: "Save Quote", icon: Save, category: "actions", shortcut: { key: "S", ctrl: true }, action: () => onAction?.("save") },
      { id: "send", label: "Send Quote", description: "Email to client", icon: Send, category: "actions", shortcut: { key: "Enter", ctrl: true, shift: true }, action: () => onAction?.("send") },
      { id: "add-item", label: "Add Item", description: "Add to itinerary", icon: Plus, category: "actions", shortcut: { key: "A", ctrl: true, shift: true }, action: () => onAction?.("add-item") },

      // Presets
      ...QUOTE_PRESETS.map((preset) => ({
        id: `preset-${preset.id}`,
        label: `${preset.name} Mode`,
        description: preset.description,
        icon: preset.icon,
        category: "presets" as const,
        action: () => onAction?.(`preset-${preset.id}`),
      })),

      // Help
      { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard, category: "help", action: () => onAction?.("shortcuts") },
      { id: "help", label: "Help & Support", icon: HelpCircle, category: "help", action: () => onAction?.("help") },
      { id: "settings", label: "Settings", icon: Settings, category: "help", action: () => onAction?.("settings") },
    ];

    return [...base, ...customCommands];
  }, [onAction, customCommands]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower) ||
        cmd.category.includes(lower)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filteredCommands, selectedIndex, onClose]
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    actions: "Actions",
    presets: "Quote Modes",
    help: "Help",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
              <kbd className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} className="mb-2">
                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </p>
                  {cmds.map((cmd, i) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          globalIndex === selectedIndex ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-gray-500 truncate">{cmd.description}</p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">
                            {formatShortcut(cmd.shortcut)}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filteredCommands.length === 0 && (
                <div className="py-8 text-center text-gray-400">
                  <p className="text-sm">No commands found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span>⌘⇧K to open</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
