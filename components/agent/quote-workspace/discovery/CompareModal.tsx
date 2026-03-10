"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, ArrowRight } from "lucide-react";
import { useCompare, type CompareItem } from "./CompareContext";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

export default function CompareModal() {
  const { items, isOpen, closeCompare, clear } = useCompare();
  const { addItem, state } = useQuoteWorkspace();

  if (!isOpen || items.length < 2) return null;

  // Collect all unique detail keys across items
  const allKeys = new Set<string>();
  items.forEach((item) => {
    Object.keys(item.details).forEach((k) => allKeys.add(k));
  });
  const detailKeys = Array.from(allKeys);

  const handleAdd = (item: CompareItem) => {
    addItem(item.raw);
    closeCompare();
    clear();
  };

  const isAlreadyAdded = (item: CompareItem) =>
    state.items.some((si) => (si as any).apiOfferId === item.raw?.apiOfferId && item.raw?.apiOfferId);

  // Label formatting
  const formatKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();

  const formatValue = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  // Determine best value per row (lowest price, highest rating, etc.)
  const getBestIndex = (key: string): number | null => {
    const lowerKey = key.toLowerCase();
    const values = items.map((item) => item.details[key]);
    const numValues = values.map((v) => (typeof v === "number" ? v : parseFloat(String(v))));

    if (numValues.every(isNaN)) return null;

    // For price/cost → lowest is best; for rating/stars → highest is best
    const isLowerBetter =
      lowerKey.includes("price") || lowerKey.includes("cost") || lowerKey.includes("duration") || lowerKey.includes("stop");
    const bestVal = isLowerBetter
      ? Math.min(...numValues.filter((n) => !isNaN(n)))
      : Math.max(...numValues.filter((n) => !isNaN(n)));

    const idx = numValues.findIndex((n) => n === bestVal);
    return idx >= 0 ? idx : null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={closeCompare}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Compare Options</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select the best option for your client
              </p>
            </div>
            <button
              onClick={closeCompare}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    Feature
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <span className="font-semibold text-gray-900 text-sm max-w-[180px] truncate">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[10px] text-gray-500 max-w-[180px] truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price row — always first */}
                <tr className="border-b border-gray-50 bg-emerald-50/30">
                  <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">Price</td>
                  {items.map((item, idx) => {
                    const lowestPrice = Math.min(...items.map((i) => i.price));
                    const isBest = item.price === lowestPrice;
                    return (
                      <td
                        key={item.id}
                        className={`px-4 py-2.5 text-center font-bold text-base ${
                          isBest ? "text-emerald-600" : "text-gray-900"
                        }`}
                      >
                        ${item.price.toLocaleString()}
                        {isBest && items.length > 1 && (
                          <span className="ml-1 text-[9px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            BEST
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Detail rows */}
                {detailKeys.map((key) => {
                  const bestIdx = getBestIndex(key);
                  return (
                    <tr key={key} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2 text-xs font-medium text-gray-600">
                        {formatKey(key)}
                      </td>
                      {items.map((item, idx) => (
                        <td
                          key={item.id}
                          className={`px-4 py-2 text-center text-xs ${
                            bestIdx === idx ? "font-semibold text-emerald-700" : "text-gray-700"
                          }`}
                        >
                          {formatValue(item.details[key])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer — Add to Quote buttons */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            {items.map((item) => {
              const added = isAlreadyAdded(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleAdd(item)}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    added
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      Already Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add {item.title}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
