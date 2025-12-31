"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, MoreVertical, Edit2, Copy, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteItem, FlightItem, HotelItem, CarItem, ActivityItem, TransferItem, InsuranceItem, CustomItem, ProductType } from "../types/quote-workspace.types";

// Icon and gradient config
const productConfig: Record<ProductType, { icon: typeof Plane; gradient: string; bgLight: string }> = {
  flight: { icon: Plane, gradient: "from-blue-500 to-indigo-600", bgLight: "bg-blue-50" },
  hotel: { icon: Building2, gradient: "from-purple-500 to-pink-600", bgLight: "bg-purple-50" },
  car: { icon: Car, gradient: "from-cyan-500 to-blue-600", bgLight: "bg-cyan-50" },
  activity: { icon: Compass, gradient: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-50" },
  transfer: { icon: Bus, gradient: "from-amber-500 to-orange-600", bgLight: "bg-amber-50" },
  insurance: { icon: Shield, gradient: "from-rose-500 to-pink-600", bgLight: "bg-rose-50" },
  custom: { icon: Package, gradient: "from-gray-600 to-gray-800", bgLight: "bg-gray-50" },
};

interface ItineraryCardProps {
  item: QuoteItem;
  dragListeners?: any;
  isDragging?: boolean;
}

export default function ItineraryCard({ item, dragListeners, isDragging }: ItineraryCardProps) {
  const { state, removeItem, expandItem } = useQuoteWorkspace();
  const [showMenu, setShowMenu] = useState(false);
  const isExpanded = state.ui.expandedItemId === item.id;

  const config = productConfig[item.type];
  const Icon = config.icon;

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: item.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get display title based on type
  const getTitle = () => {
    switch (item.type) {
      case "flight":
        return `${(item as FlightItem).airline} ${(item as FlightItem).flightNumber}`;
      case "hotel":
        return (item as HotelItem).name;
      case "car":
        return `${(item as CarItem).company} - ${(item as CarItem).carType}`;
      case "activity":
        return (item as ActivityItem).name;
      case "transfer":
        return `${(item as TransferItem).vehicleType} Transfer`;
      case "insurance":
        return `${(item as InsuranceItem).provider} - ${(item as InsuranceItem).planName}`;
      case "custom":
        return (item as CustomItem).name;
      default:
        return "Item";
    }
  };

  // Get subtitle based on type
  const getSubtitle = () => {
    switch (item.type) {
      case "flight": {
        const f = item as FlightItem;
        return `${f.originCity} → ${f.destinationCity} • ${f.duration} • ${f.stops === 0 ? "Direct" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}`;
      }
      case "hotel": {
        const h = item as HotelItem;
        return `${h.roomType} • ${h.nights} night${h.nights > 1 ? "s" : ""} • ${h.location}`;
      }
      case "car": {
        const c = item as CarItem;
        return `${c.pickupLocation} → ${c.dropoffLocation} • ${c.days} day${c.days > 1 ? "s" : ""}`;
      }
      case "activity": {
        const a = item as ActivityItem;
        return `${a.location} • ${a.duration} • ${a.participants} participant${a.participants > 1 ? "s" : ""}`;
      }
      case "transfer": {
        const t = item as TransferItem;
        return `${t.pickupLocation} → ${t.dropoffLocation}`;
      }
      case "insurance": {
        const i = item as InsuranceItem;
        return `${i.travelers} traveler${i.travelers > 1 ? "s" : ""} covered`;
      }
      case "custom": {
        const cu = item as CustomItem;
        return cu.description || cu.category;
      }
      default:
        return "";
    }
  };

  const handleDelete = () => {
    removeItem(item.id);
    setShowMenu(false);
  };

  const handleExpand = () => {
    expandItem(isExpanded ? null : item.id);
  };

  return (
    <motion.div
      layout
      className={`group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isExpanded ? "ring-2 ring-primary-500" : ""
      }`}
    >
      {/* Drag Handle */}
      <div
        {...dragListeners}
        className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent ${
          isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Main Content */}
      <div className="pl-8 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{getTitle()}</h4>
            <p className="text-sm text-gray-500 truncate">{getSubtitle()}</p>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900">{formatPrice(item.price)}</p>
            {item.type === "flight" && (
              <p className="text-xs text-gray-400">{(item as FlightItem).passengers} pax</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleExpand}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      <button
                        onClick={() => { expandItem(item.id); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className={`p-4 ${config.bgLight} rounded-lg`}>
                {/* Expanded content will show editable fields - Phase 3 */}
                <p className="text-sm text-gray-600">
                  Click Edit to modify this item. Full inline editing coming in Phase 3.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
