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
    <div className="flex items-center gap-1.5 py-2">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mr-1 flex-shrink-0">Also search:</span>

      {/* Icon-only buttons with tooltips - horizontally scrollable */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {(Object.keys(scopeConfig) as Array<keyof SearchScope>).map((key) => {
          const config = scopeConfig[key];
          const Icon = config.icon;
          const isSelected = scope[key];
          const isLoading = status[key] === "loading";
          const hasResults = status[key] === "success";
          const hasError = status[key] === "error";

          return (
            <div key={key} className="relative group flex-shrink-0">
              <motion.button
                onClick={() => !disabled && onToggle(key)}
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                className={`
                  relative w-8 h-8 rounded-lg flex items-center justify-center
                  transition-all duration-200 border
                  ${isSelected
                    ? `${config.color} text-white border-transparent shadow-md`
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}

                {/* Status dot */}
                {hasResults && !isLoading && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
                )}
                {hasError && !isLoading && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 border border-white" />
                )}
              </motion.button>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                {config.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          );
        })}
      </div>
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
