"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, Check, X } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

export default function PriceStalenessBar() {
  const { staleItems, recheckPrice, state } = useQuoteWorkspace();
  const [checking, setChecking] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState(false);

  if (staleItems.length === 0 || dismissed) return null;

  const staleItemDetails = state.items.filter(i => staleItems.includes(i.id));

  const handleRecheckAll = async () => {
    const ids = [...staleItems];
    setChecking(new Set(ids));
    for (const id of ids) {
      await recheckPrice(id);
    }
    setChecking(new Set());
  };

  const handleRecheckOne = async (id: string) => {
    setChecking(prev => new Set(prev).add(id));
    await recheckPrice(id);
    setChecking(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mt-2 mb-1 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {staleItems.length} item{staleItems.length > 1 ? "s have" : " has"} prices older than 2 hours
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Prices may have changed. Re-check before sending this quote.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {staleItemDetails.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleRecheckOne(item.id)}
                  disabled={checking.has(item.id)}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-white border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {checking.has(item.id) ? (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-2.5 h-2.5" />
                  )}
                  {item.type}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleRecheckAll}
            disabled={checking.size > 0}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${checking.size > 0 ? "animate-spin" : ""}`} />
            Re-check all
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-amber-400 hover:text-amber-600 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
