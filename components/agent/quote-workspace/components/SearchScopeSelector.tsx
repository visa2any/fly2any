"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Check, Loader2 } from "lucide-react";
import type { SearchScope, SearchStatus } from "../hooks/useUnifiedSearch";

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH SCOPE SELECTOR - "Search includes: [✓ Flights] [✓ Hotels] ..."
// Apple-class minimal design, zero cognitive load
// ═══════════════════════════════════════════════════════════════════════════════

interface SearchScopeSelectorProps {
  scope: SearchScope;
  status: SearchStatus;
  onToggle: (product: keyof SearchScope) => void;
  disabled?: boolean;
}

const scopeConfig: Record<keyof SearchScope, { label: string; icon: typeof Plane; color: string }> = {
  flights: { label: "Flights", icon: Plane, color: "bg-blue-500" },
  hotels: { label: "Hotels", icon: Building2, color: "bg-purple-500" },
  cars: { label: "Cars", icon: Car, color: "bg-cyan-500" },
  activities: { label: "Activities", icon: Compass, color: "bg-emerald-500" },
  transfers: { label: "Transfers", icon: Bus, color: "bg-amber-500" },
};

export default function SearchScopeSelector({ scope, status, onToggle, disabled }: SearchScopeSelectorProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-xs font-medium text-gray-500 mr-1">Search includes:</span>

      {(Object.keys(scopeConfig) as Array<keyof SearchScope>).map((key) => {
        const config = scopeConfig[key];
        const Icon = config.icon;
        const isSelected = scope[key];
        const isLoading = status[key] === "loading";
        const hasResults = status[key] === "success";
        const hasError = status[key] === "error";

        return (
          <motion.button
            key={key}
            onClick={() => !disabled && onToggle(key)}
            disabled={disabled}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200 border
              ${isSelected
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {/* Icon or Loading State */}
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isSelected ? (
              <Check className="w-3 h-3" />
            ) : (
              <Icon className="w-3 h-3" />
            )}

            <span>{config.label}</span>

            {/* Success indicator */}
            {hasResults && !isLoading && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            )}

            {/* Error indicator */}
            {hasError && !isLoading && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 ml-0.5" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact version for tight spaces
export function SearchScopeSelectorCompact({ scope, status, onToggle, disabled }: SearchScopeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {(Object.keys(scopeConfig) as Array<keyof SearchScope>).map((key) => {
        const config = scopeConfig[key];
        const Icon = config.icon;
        const isSelected = scope[key];
        const isLoading = status[key] === "loading";

        return (
          <button
            key={key}
            onClick={() => !disabled && onToggle(key)}
            disabled={disabled}
            title={config.label}
            className={`
              p-1.5 rounded-md transition-all
              ${isSelected
                ? `${config.color} text-white`
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }
              ${disabled ? "opacity-50" : ""}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
          </button>
        );
      })}
    </div>
  );
}
