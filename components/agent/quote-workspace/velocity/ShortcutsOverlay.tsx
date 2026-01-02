"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";
import { SHORTCUT_MAP, formatShortcut } from "./useAgentShortcuts";

// ============================================
// SHORTCUTS OVERLAY - Visual Hint on Ctrl Hold
// ============================================

interface ShortcutsOverlayProps {
  visible: boolean;
  variant?: "full" | "compact";
}

export default function ShortcutsOverlay({ visible, variant = "compact" }: ShortcutsOverlayProps) {
  const categories = {
    navigation: Object.entries(SHORTCUT_MAP).filter(([_, v]) => v.category === "navigation"),
    items: Object.entries(SHORTCUT_MAP).filter(([_, v]) => v.category === "items"),
    workflow: Object.entries(SHORTCUT_MAP).filter(([_, v]) => v.category === "workflow"),
    view: Object.entries(SHORTCUT_MAP).filter(([_, v]) => v.category === "view"),
  };

  if (variant === "compact") {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-900/95 backdrop-blur-sm text-white rounded-xl shadow-2xl">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Shortcuts</span>
              </div>
              <div className="h-4 w-px bg-gray-700" />
              {[
                { key: "1-5", label: "Tabs" },
                { key: "P", label: "Preview" },
                { key: "S", label: "Save" },
                { key: "K", label: "Search" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-700 rounded">{s.key}</kbd>
                  <span className="text-xs text-gray-300">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full modal variant
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Keyboard className="w-6 h-6 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {Object.entries(categories).map(([cat, shortcuts]) => (
                <div key={cat}>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h3>
                  <div className="space-y-1.5">
                    {shortcuts.map(([key, shortcut]) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                        <kbd className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-gray-400 text-center">
              Hold Ctrl/⌘ to see shortcuts • Press any shortcut to close
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
