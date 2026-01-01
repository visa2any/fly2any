"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, AlertTriangle, Bell, X, RefreshCcw } from "lucide-react";

interface PriceChange {
  itemId: string;
  itemType: string;
  itemName: string;
  originalPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  direction: "up" | "down";
  detectedAt: Date;
}

interface PriceAlertBadgeProps {
  quoteId: string;
  onPriceUpdate?: (changes: PriceChange[]) => void;
  compact?: boolean;
}

export default function PriceAlertBadge({
  quoteId,
  onPriceUpdate,
  compact = false,
}: PriceAlertBadgeProps) {
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check for price changes periodically (every 15 min)
  useEffect(() => {
    if (!quoteId) return;

    checkPrices();
    const interval = setInterval(checkPrices, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [quoteId]);

  const checkPrices = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/agents/quotes/${quoteId}/price-check`);
      if (res.ok) {
        const data = await res.json();
        setPriceChanges(data.changes || []);
        setLastChecked(new Date());
        onPriceUpdate?.(data.changes || []);
      }
    } catch (error) {
      console.error("Price check failed:", error);
    } finally {
      setChecking(false);
    }
  };

  const hasDrops = priceChanges.some((c) => c.direction === "down");
  const hasIncreases = priceChanges.some((c) => c.direction === "up");
  const totalSavings = priceChanges
    .filter((c) => c.direction === "down")
    .reduce((sum, c) => sum + Math.abs(c.change), 0);

  if (priceChanges.length === 0 && !checking) {
    // No changes - show subtle "prices stable" indicator
    if (compact) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-500">
        <Bell className="w-3.5 h-3.5" />
        <span>Prices stable</span>
        {lastChecked && (
          <span className="text-gray-400">
            • Checked {lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          onClick={checkPrices}
          disabled={checking}
          className="p-1 hover:bg-gray-200 rounded transition-colors ml-1"
        >
          <RefreshCcw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
        </button>
      </div>
    );
  }

  // Compact badge view
  if (compact) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
          hasDrops
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
        } transition-colors`}
      >
        {hasDrops ? (
          <>
            <TrendingDown className="w-4 h-4" />
            <span>-${Math.round(totalSavings)}</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            <span>{priceChanges.length} price change{priceChanges.length > 1 ? "s" : ""}</span>
          </>
        )}
      </motion.button>
    );
  }

  // Full alert view
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl overflow-hidden border-2 ${
          hasDrops
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            : "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
        }`}
      >
        <div
          className="px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${hasDrops ? "bg-green-100" : "bg-orange-100"}`}
            >
              {hasDrops ? (
                <TrendingDown className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div>
              <p className={`font-semibold ${hasDrops ? "text-green-800" : "text-orange-800"}`}>
                {hasDrops
                  ? `Price Drop Alert: Save $${Math.round(totalSavings)}!`
                  : `${priceChanges.length} Price Change${priceChanges.length > 1 ? "s" : ""} Detected`}
              </p>
              <p className="text-sm text-gray-600">
                {priceChanges.length} item{priceChanges.length > 1 ? "s" : ""} affected since quote creation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkPrices();
              }}
              disabled={checking}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 text-gray-500 ${checking ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {priceChanges.map((change) => (
                  <div
                    key={change.itemId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{change.itemName}</p>
                      <p className="text-xs text-gray-500 capitalize">{change.itemType}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-sm">
                          ${change.originalPrice.toLocaleString()}
                        </span>
                        <span
                          className={`font-bold ${
                            change.direction === "down" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          ${change.currentPrice.toLocaleString()}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          change.direction === "down" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {change.direction === "down" ? "↓" : "↑"} {Math.abs(change.changePercent).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}

                {hasDrops && (
                  <button className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors mt-2">
                    Update Quote Prices
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal for compact view */}
      <AnimatePresence>
        {isExpanded && compact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Price Alerts</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {priceChanges.map((change) => (
                  <div
                    key={change.itemId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{change.itemName}</p>
                      <p className="text-xs text-gray-500 capitalize">{change.itemType}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 line-through text-sm mr-2">
                        ${change.originalPrice.toLocaleString()}
                      </span>
                      <span
                        className={`font-bold ${
                          change.direction === "down" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${change.currentPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
