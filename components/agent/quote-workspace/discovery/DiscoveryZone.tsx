"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, Map } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import FlightSearchPanel from "./FlightSearchPanel";
import HotelSearchPanel from "./HotelSearchPanel";
import type { ProductType } from "../types/quote-workspace.types";

const PRODUCT_TABS: {
  type: ProductType;
  icon: typeof Plane;
  label: string;
  gradient: string;
  shadowColor: string;
}[] = [
  { type: "flight", icon: Plane, label: "Flights", gradient: "from-blue-500 to-indigo-600", shadowColor: "shadow-blue-500/30" },
  { type: "hotel", icon: Building2, label: "Hotels", gradient: "from-purple-500 to-pink-600", shadowColor: "shadow-purple-500/30" },
  { type: "car", icon: Car, label: "Cars", gradient: "from-cyan-500 to-blue-600", shadowColor: "shadow-cyan-500/30" },
  { type: "activity", icon: Compass, label: "Tours", gradient: "from-emerald-500 to-teal-600", shadowColor: "shadow-emerald-500/30" },
  { type: "transfer", icon: Bus, label: "Transfers", gradient: "from-amber-500 to-orange-600", shadowColor: "shadow-amber-500/30" },
  { type: "insurance", icon: Shield, label: "Insurance", gradient: "from-rose-500 to-pink-600", shadowColor: "shadow-rose-500/30" },
  { type: "custom", icon: Package, label: "Custom", gradient: "from-gray-600 to-gray-800", shadowColor: "shadow-gray-500/30" },
];

export default function DiscoveryZone() {
  const { state, setActiveTab } = useQuoteWorkspace();
  const activeTab = state.ui.activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* Product Type Tabs - Icon Only with Hover Tooltips */}
      <div className="flex-shrink-0 px-3 py-3 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/80">
        <div className="flex gap-1.5 justify-center">
          {PRODUCT_TABS.map(({ type, icon: Icon, label, gradient, shadowColor }) => {
            const isActive = activeTab === type;
            return (
              <div key={type} className="relative group">
                <motion.button
                  onClick={() => setActiveTab(type)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg ${shadowColor}`
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-40 blur-md`}
                    />
                  )}
                  <Icon className="relative w-5 h-5" />
                </motion.button>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {label}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Content with Premium Transition */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {activeTab === "flight" && <FlightSearchPanel />}
          {activeTab === "hotel" && <HotelSearchPanel />}
          {activeTab === "car" && <ComingSoon type="car" label="Cars" icon={Car} gradient="from-cyan-500 to-blue-600" />}
          {activeTab === "activity" && <ComingSoon type="activity" label="Activities" icon={Compass} gradient="from-emerald-500 to-teal-600" />}
          {activeTab === "transfer" && <ComingSoon type="transfer" label="Transfers" icon={Bus} gradient="from-amber-500 to-orange-600" />}
          {activeTab === "insurance" && <ComingSoon type="insurance" label="Insurance" icon={Shield} gradient="from-rose-500 to-pink-600" />}
          {activeTab === "custom" && <ComingSoon type="custom" label="Custom" icon={Package} gradient="from-gray-600 to-gray-800" />}
        </motion.div>
      </div>
    </div>
  );
}

// Premium Coming Soon Component
function ComingSoon({
  type,
  label,
  icon: Icon,
  gradient
}: {
  type: string;
  label: string;
  icon: typeof Plane;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-60 text-center p-6"
    >
      {/* Icon with animated background */}
      <div className="relative mb-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} blur-xl`}
        />
        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-lg font-bold text-gray-800 mb-1">{label}</h3>
      <p className="text-sm text-gray-400 max-w-[200px]">
        This feature is coming soon. Stay tuned for updates!
      </p>

      {/* Progress indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">In development</span>
      </div>
    </motion.div>
  );
}
