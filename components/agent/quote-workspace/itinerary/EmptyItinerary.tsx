"use client";

import { motion } from "framer-motion";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { ProductType } from "../types/quote-workspace.types";

const QUICK_START_PRODUCTS: {
  type: ProductType;
  icon: typeof Plane;
  label: string;
  desc: string;
  gradient: string;
  bg: string;
  textColor: string;
}[] = [
  { type: "flight", icon: Plane, label: "Add Flight", desc: "Search 900+ airlines", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50 hover:bg-blue-100", textColor: "text-blue-700" },
  { type: "hotel", icon: Building2, label: "Add Hotel", desc: "1M+ properties", gradient: "from-purple-500 to-pink-600", bg: "bg-purple-50 hover:bg-purple-100", textColor: "text-purple-700" },
  { type: "activity", icon: Compass, label: "Add Activity", desc: "Tours & experiences", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 hover:bg-emerald-100", textColor: "text-emerald-700" },
  { type: "transfer", icon: Bus, label: "Add Transfer", desc: "Airport & city rides", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50 hover:bg-amber-100", textColor: "text-amber-700" },
  { type: "car", icon: Car, label: "Rent a Car", desc: "Best rental rates", gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-50 hover:bg-cyan-100", textColor: "text-cyan-700" },
  { type: "custom", icon: Package, label: "Custom Item", desc: "Add anything", gradient: "from-gray-600 to-gray-800", bg: "bg-gray-50 hover:bg-gray-100", textColor: "text-gray-700" },
];

const TIPS = [
  { icon: "🎯", text: "Start with flights to anchor dates" },
  { icon: "🏨", text: "Add hotels matching travel dates" },
  { icon: "✨", text: "Include 1-2 activities for conversion" },
];

export default function EmptyItinerary() {
  const { state, setActiveTab, openClientModal } = useQuoteWorkspace();

  const handleProductClick = (type: ProductType) => {
    setActiveTab(type);
  };

  const hasClient = !!state.client;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] px-6 py-8 text-center"
    >
      {/* Icon cluster */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        className="relative w-20 h-20 mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-2xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-primary-500" />
        </div>
        {/* Orbiting icons */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <Plane className="w-3 h-3 text-white" />
          </div>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
            <Building2 className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-1">Build Your Quote</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          {!hasClient
            ? "Select a client, then add flights, hotels, and experiences"
            : "Search products on the left and add them to build the perfect itinerary"}
        </p>
      </motion.div>

      {/* Step 1: Client prompt */}
      {!hasClient && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openClientModal}
          className="flex items-center gap-2 px-4 py-2.5 mb-5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-500/25 transition-all"
        >
          <MapPin className="w-4 h-4" />
          Start: Select Client
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}

      {/* Product quick-start grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-2 w-full max-w-sm mb-6"
      >
        {QUICK_START_PRODUCTS.map(({ type, icon: Icon, label, desc, bg, textColor, gradient }, idx) => (
          <motion.button
            key={type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleProductClick(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${bg} border border-transparent hover:border-current hover:border-opacity-20`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className={`text-[10px] font-bold ${textColor} leading-tight`}>{label}</span>
            <span className="text-[9px] text-gray-400 leading-tight">{desc}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Pro tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-1.5 w-full max-w-xs"
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pro Tips</p>
        {TIPS.map((tip, i) => (
          <div key={i} className="flex items-center gap-2 text-left">
            <span className="text-sm">{tip.icon}</span>
            <span className="text-xs text-gray-500">{tip.text}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
