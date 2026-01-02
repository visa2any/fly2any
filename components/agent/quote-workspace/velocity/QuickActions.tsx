"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Trash2, Edit2, MoveUp, MoveDown, MoreHorizontal, Eye, Calendar, DollarSign } from "lucide-react";
import { formatShortcut } from "./useAgentShortcuts";

// ============================================
// QUICK ACTIONS - Hover-Based Fast Actions
// ============================================

interface QuickAction {
  id: string;
  icon: typeof Copy;
  label: string;
  shortcut?: { key: string; ctrl?: boolean };
  variant?: "default" | "danger" | "primary";
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  position?: "left" | "right" | "top" | "bottom";
  visible?: boolean;
  compact?: boolean;
}

export function QuickActions({ actions, position = "right", visible = true, compact = false }: QuickActionsProps) {
  if (!visible || actions.length === 0) return null;

  const positionClasses = {
    left: "left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 flex-row-reverse",
    right: "right-0 top-1/2 -translate-y-1/2 translate-x-full pl-1 flex-row",
    top: "top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-1 flex-col-reverse",
    bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-1 flex-col",
  };

  const getVariantClasses = (variant: QuickAction["variant"]) => {
    switch (variant) {
      case "danger":
        return "text-red-500 hover:bg-red-50 hover:text-red-600";
      case "primary":
        return "text-primary-500 hover:bg-primary-50 hover:text-primary-600";
      default:
        return "text-gray-500 hover:bg-gray-100 hover:text-gray-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute ${positionClasses[position]} flex gap-0.5 z-20`}
    >
      <div className="flex bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`group relative p-1.5 transition-colors ${getVariantClasses(action.variant)}`}
              title={action.shortcut ? `${action.label} (${formatShortcut(action.shortcut)})` : action.label}
            >
              <Icon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                {action.label}
                {action.shortcut && (
                  <span className="ml-1 opacity-60">{formatShortcut(action.shortcut)}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Pre-configured action sets
export function useItemQuickActions(options: {
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}): QuickAction[] {
  return [
    { id: "edit", icon: Edit2, label: "Edit", shortcut: { key: "Enter" }, onClick: options.onEdit },
    { id: "duplicate", icon: Copy, label: "Duplicate", shortcut: { key: "D", ctrl: true }, onClick: options.onDuplicate },
    ...(options.onMoveUp ? [{ id: "moveUp", icon: MoveUp, label: "Move Up", onClick: options.onMoveUp }] : []),
    ...(options.onMoveDown ? [{ id: "moveDown", icon: MoveDown, label: "Move Down", onClick: options.onMoveDown }] : []),
    { id: "delete", icon: Trash2, label: "Delete", shortcut: { key: "⌫", ctrl: true }, variant: "danger" as const, onClick: options.onDelete },
  ];
}

export function useDayQuickActions(options: {
  onDuplicateDay: () => void;
  onAddItem: () => void;
  onViewDay: () => void;
}): QuickAction[] {
  return [
    { id: "view", icon: Eye, label: "View Details", onClick: options.onViewDay },
    { id: "add", icon: Calendar, label: "Add Item", variant: "primary" as const, onClick: options.onAddItem },
    { id: "duplicate", icon: Copy, label: "Duplicate Day", shortcut: { key: "D", ctrl: true }, onClick: options.onDuplicateDay },
  ];
}

// Floating action bar for selected items
export function FloatingActionBar({
  selectedCount,
  onDuplicate,
  onDelete,
  onClear
}: {
  selectedCount: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-full shadow-2xl">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <div className="w-px h-4 bg-gray-700" />
        <button
          onClick={onDuplicate}
          className="flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-gray-800 rounded transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-2 py-1 text-sm text-red-400 hover:bg-red-900/50 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
        <button
          onClick={onClear}
          className="ml-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
}
