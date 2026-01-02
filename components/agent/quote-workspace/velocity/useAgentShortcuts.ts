"use client";

import { useEffect, useCallback, useState } from "react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

// ============================================
// KEYBOARD SHORTCUT SYSTEM - Agent Velocity UX
// ============================================

export interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: "navigation" | "items" | "workflow" | "view";
  action: () => void;
}

// Check if user is typing in an input
function isTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}

// Format shortcut for display
export function formatShortcut(shortcut: Partial<ShortcutAction>): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.shift) parts.push(isMac ? "⇧" : "Shift");
  if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
  parts.push(shortcut.key?.toUpperCase() || "");
  return parts.join(isMac ? "" : "+");
}

// Shortcut definitions
export const SHORTCUT_MAP = {
  // Navigation
  JUMP_FLIGHTS: { key: "1", ctrl: true, description: "Jump to Flights", category: "navigation" },
  JUMP_HOTELS: { key: "2", ctrl: true, description: "Jump to Hotels", category: "navigation" },
  JUMP_ACTIVITIES: { key: "3", ctrl: true, description: "Jump to Activities", category: "navigation" },
  JUMP_CARS: { key: "4", ctrl: true, description: "Jump to Cars", category: "navigation" },
  JUMP_TRANSFERS: { key: "5", ctrl: true, description: "Jump to Transfers", category: "navigation" },
  TOGGLE_PREVIEW: { key: "p", ctrl: true, description: "Toggle Preview", category: "view" },

  // Items
  ADD_ITEM: { key: "a", ctrl: true, shift: true, description: "Add Selected Item", category: "items" },
  DUPLICATE_ITEM: { key: "d", ctrl: true, description: "Duplicate Item", category: "items" },
  DELETE_ITEM: { key: "Backspace", ctrl: true, description: "Delete Item", category: "items" },
  DUPLICATE_DAY: { key: "d", ctrl: true, shift: true, description: "Duplicate Day", category: "items" },

  // Workflow
  SAVE: { key: "s", ctrl: true, description: "Save Quote", category: "workflow" },
  SEND: { key: "Enter", ctrl: true, shift: true, description: "Send Quote", category: "workflow" },
  SEARCH: { key: "k", ctrl: true, description: "Focus Search", category: "workflow" },
  COMMAND_PALETTE: { key: "k", ctrl: true, shift: true, description: "Command Palette", category: "workflow" },
  UNDO: { key: "z", ctrl: true, description: "Undo", category: "workflow" },
  REDO: { key: "z", ctrl: true, shift: true, description: "Redo", category: "workflow" },
} as const;

interface UseAgentShortcutsOptions {
  onSave?: () => void;
  onSend?: () => void;
  onSearch?: () => void;
  onCommandPalette?: () => void;
  onTogglePreview?: () => void;
  onDuplicateDay?: (date: string) => void;
  enabled?: boolean;
}

export function useAgentShortcuts(options: UseAgentShortcutsOptions = {}) {
  const { dispatch, state } = useQuoteWorkspace();
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const { enabled = true } = options;

  // Tab switching
  const jumpToTab = useCallback((tab: string) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab as any });
    // Announce for accessibility
    const announcement = document.getElementById("shortcut-announcement");
    if (announcement) announcement.textContent = `Switched to ${tab}`;
  }, [dispatch]);

  // Main shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const key = e.key.toLowerCase();

    // Show shortcuts hint on long Ctrl hold
    if (e.key === "Control" || e.key === "Meta") {
      const timeout = setTimeout(() => setShowShortcutHint(true), 500);
      const clearHint = () => {
        clearTimeout(timeout);
        setShowShortcutHint(false);
        window.removeEventListener("keyup", clearHint);
      };
      window.addEventListener("keyup", clearHint);
      return;
    }

    // Skip if typing in input (except for Ctrl+S save)
    if (isTyping() && !(ctrl && key === "s")) return;

    // Navigation shortcuts (Ctrl+1-5)
    if (ctrl && !shift && /^[1-5]$/.test(key)) {
      e.preventDefault();
      const tabs = ["flight", "hotel", "activity", "car", "transfer"];
      jumpToTab(tabs[parseInt(key) - 1]);
      return;
    }

    // Toggle preview (Ctrl+P)
    if (ctrl && !shift && key === "p") {
      e.preventDefault();
      options.onTogglePreview?.();
      return;
    }

    // Save (Ctrl+S)
    if (ctrl && !shift && key === "s") {
      e.preventDefault();
      options.onSave?.();
      return;
    }

    // Send (Ctrl+Shift+Enter)
    if (ctrl && shift && key === "enter") {
      e.preventDefault();
      options.onSend?.();
      return;
    }

    // Search focus (Ctrl+K)
    if (ctrl && !shift && key === "k") {
      e.preventDefault();
      options.onSearch?.();
      return;
    }

    // Command palette (Ctrl+Shift+K)
    if (ctrl && shift && key === "k") {
      e.preventDefault();
      options.onCommandPalette?.();
      return;
    }

    // Duplicate day (Ctrl+Shift+D)
    if (ctrl && shift && key === "d") {
      e.preventDefault();
      // Find focused day and duplicate
      const focusedDay = document.querySelector("[data-day-focused='true']")?.getAttribute("data-day-date");
      if (focusedDay) options.onDuplicateDay?.(focusedDay);
      return;
    }
  }, [enabled, options, jumpToTab]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    showShortcutHint,
    shortcuts: SHORTCUT_MAP,
    formatShortcut,
  };
}

// Hook for individual item shortcuts
export function useItemShortcuts(itemId: string, options: {
  onDuplicate?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (ctrl && key === "d") {
      e.preventDefault();
      options.onDuplicate?.();
    }
    if (ctrl && key === "backspace") {
      e.preventDefault();
      options.onDelete?.();
    }
    if (key === "enter") {
      e.preventDefault();
      options.onEdit?.();
    }
  }, [options]);

  return { handleKeyDown };
}
