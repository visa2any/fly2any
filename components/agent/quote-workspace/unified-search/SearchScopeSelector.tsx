"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Check, Loader2 } from "lucide-react";
import { useUnifiedSearchContext, useUnifiedSearchSafe } from "./UnifiedSearchProvider";
import type { SearchScope, SearchStatus } from "./useUnifiedSearch";

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH SCOPE SELECTOR - Lightweight product toggles above search CTA
// "Search includes: [✓ Flights] [✓ Hotels] [ ] Cars] [ ] Activities]"
// ═══════════════════════════════════════════════════════════════════════════════

const SCOPE_CONFIG: {
  key: keyof SearchScope;
  icon: typeof Plane;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
}[] = [
  { key: "flights", icon: Plane, label: "Flights", shortLabel: "Flights", color: "text-blue-600", bgColor: "bg-blue-100" },
  { key: "hotels", icon: Building2, label: "Hotels", shortLabel: "Hotels", color: "text-purple-600", bgColor: "bg-purple-100" },
  { key: "cars", icon: Car, label: "Cars", shortLabel: "Cars", color: "text-cyan-600", bgColor: "bg-cyan-100" },
  { key: "activities", icon: Compass, label: "Activities", shortLabel: "Tours", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  { key: "transfers", icon: Bus, label: "Transfers", shortLabel: "Transfer", color: "text-amber-600", bgColor: "bg-amber-100" },
];

interface SearchScopeSelectorProps {
  variant?: "full" | "compact" | "minimal";
  showStatus?: boolean;
}

export default function SearchScopeSelector({
  variant = "compact",
  showStatus = true,
}: SearchScopeSelectorProps) {
  const search = useUnifiedSearchSafe();

  // Fallback if not within provider
  if (!search) return null;

  const { scope, products, toggleScope, isSearching } = search;

  const getStatus = (key: keyof SearchScope): SearchStatus => products[key].status;
  const getCount = (key: keyof SearchScope): number => products[key].count;

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 mr-1">Search:</span>
        {SCOPE_CONFIG.slice(0, 4).map(({ key, icon: Icon, shortLabel }) => {
          const isActive = scope[key];
          const status = getStatus(key);
          return (
            <button
              key={key}
              onClick={() => toggleScope(key)}
              disabled={isSearching}
              className={`relative p-1.5 rounded-lg transition-all ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              title={shortLabel}
            >
              <Icon className="w-3.5 h-3.5" />
              {status === "loading" && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
              {status === "success" && getCount(key) > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-medium text-gray-500 mr-1">Search includes:</span>
        {SCOPE_CONFIG.map(({ key, icon: Icon, shortLabel, color, bgColor }) => {
          const isActive = scope[key];
          const status = getStatus(key);
          const count = getCount(key);

          return (
            <motion.button
              key={key}
              onClick={() => toggleScope(key)}
              disabled={isSearching}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                isActive
                  ? `${bgColor} ${color} ring-1 ring-inset ring-current/20`
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`w-3 h-3 rounded flex items-center justify-center ${
                isActive ? "bg-current/20" : "bg-gray-200"
              }`}>
                {isActive && <Check className="w-2 h-2" />}
              </div>

              <Icon className="w-3 h-3" />
              <span>{shortLabel}</span>

              {/* Status indicators */}
              {showStatus && status === "loading" && (
                <Loader2 className="w-2.5 h-2.5 animate-spin ml-0.5" />
              )}
              {showStatus && status === "success" && count > 0 && (
                <span className="ml-0.5 px-1 py-0.5 bg-white/50 rounded text-[8px]">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">Search Scope</span>
        <span className="text-[10px] text-gray-400">
          {Object.values(scope).filter(Boolean).length} products selected
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {SCOPE_CONFIG.map(({ key, icon: Icon, label, color, bgColor }) => {
          const isActive = scope[key];
          const status = getStatus(key);
          const count = getCount(key);

          return (
            <motion.button
              key={key}
              onClick={() => toggleScope(key)}
              disabled={isSearching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive
                  ? `${bgColor} ${color} shadow-sm`
                  : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {/* Status dot */}
                {status === "loading" && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                )}
                {status === "success" && count > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-1.5 h-1.5 text-white" />
                  </div>
                )}
                {status === "error" && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                )}
              </div>

              <span className="text-[10px] font-medium">{label}</span>

              {status === "success" && count > 0 && (
                <span className="text-[8px] bg-white/50 px-1.5 py-0.5 rounded-full">
                  {count} found
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB RESULT INDICATORS - Subtle badges for product tabs
// ═══════════════════════════════════════════════════════════════════════════════

export function TabResultIndicator({ product }: { product: keyof SearchScope }) {
  const search = useUnifiedSearchSafe();
  if (!search) return null;

  const { products } = search;
  const { status, count } = products[product];

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="absolute -top-1 -right-1 w-3 h-3">
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
        <div className="relative w-3 h-3 bg-blue-500 rounded-full" />
      </div>
    );
  }

  if (status === "success" && count > 0) {
    return (
      <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-[9px] font-bold text-white">{count > 99 ? "99+" : count}</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH STATUS BAR - Global search progress indicator
// ═══════════════════════════════════════════════════════════════════════════════

export function SearchStatusBar() {
  const search = useUnifiedSearchSafe();
  if (!search) return null;

  const { isSearching, computed, products } = search;

  if (!isSearching && computed.totalResults === 0) return null;

  const loadingProducts = Object.entries(products)
    .filter(([, p]) => p.status === "loading")
    .map(([k]) => k);

  if (isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100"
      >
        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        <span className="text-xs text-blue-700">
          Searching {loadingProducts.join(", ")}...
        </span>
      </motion.div>
    );
  }

  if (computed.totalResults > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100"
      >
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs text-emerald-700">
          {computed.totalResults} results across {computed.readyProducts} products
        </span>
      </motion.div>
    );
  }

  return null;
}
