"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowsUpFromLine, Trash2 } from "lucide-react";
import { useCompare } from "./CompareContext";

export default function CompareBar() {
  const { items, remove, clear, openCompare } = useCompare();

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700"
      >
        {/* Selected items */}
        <div className="flex items-center gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 rounded-lg text-xs"
            >
              <span className="max-w-[120px] truncate font-medium">{item.title}</span>
              <span className="text-gray-400">${item.price}</span>
              <button
                onClick={() => remove(item.id)}
                className="ml-0.5 p-0.5 rounded hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-20 h-7 border border-dashed border-gray-600 rounded-lg"
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-700">
          <button
            onClick={openCompare}
            disabled={items.length < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowsUpFromLine className="w-3.5 h-3.5" />
            Compare ({items.length})
          </button>
          <button
            onClick={clear}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
            title="Clear selection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
