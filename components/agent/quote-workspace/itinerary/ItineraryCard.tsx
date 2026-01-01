"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, MoreVertical, Edit2, Copy, Trash2, GripVertical, ChevronDown, ChevronUp, Briefcase, RefreshCw, XCircle, CheckCircle2, Info, Luggage } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import AirlineLogo from "@/components/flights/AirlineLogo";
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

  // Render flight-specific compact card with return flight - 3-column layout
  if (item.type === "flight") {
    const f = item as FlightItem;
    const isRoundtrip = !!f.returnDepartureTime;
    const getStopsStyle = (stops: number) =>
      stops === 0 ? "bg-emerald-100 text-emerald-700" : stops === 1 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

    return (
      <motion.div
        layout
        className={`group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
          isExpanded ? "ring-2 ring-indigo-400" : ""
        }`}
      >
        {/* Drag Handle */}
        <div
          {...dragListeners}
          className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>

        {/* 3-Column Layout */}
        <div className="flex">
          {/* LEFT: Logo + Airline Name + Fare Type */}
          <div className="flex flex-col items-center justify-center px-2 py-2 border-r border-gray-100 min-w-[72px] ml-5">
            <AirlineLogo code={f.airline} size="sm" className="flex-shrink-0" />
            <p className="text-[9px] font-bold text-gray-900 mt-1 text-center truncate max-w-[68px]">
              {f.airlineName || f.airline}
            </p>
            {f.fareType && (
              <p className="text-[7px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 truncate max-w-[68px]">
                {f.fareType}
              </p>
            )}
          </div>

          {/* MIDDLE: Flight Rows */}
          <div className="flex-1 min-w-0">
            {/* Outbound Row */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-50">
              <span className="text-[7px] font-bold text-indigo-600 uppercase w-7">→OUT</span>
              <span className="text-[8px] text-gray-500 w-12 truncate">{f.airline} {f.flightNumber}</span>
              <div className="text-center min-w-[36px]">
                <p className="text-xs font-bold text-gray-900">{f.departureTime || "--:--"}</p>
                <p className="text-[8px] text-gray-500">{f.origin}</p>
              </div>
              <div className="flex-1 px-1">
                <div className="relative h-px bg-gradient-to-r from-gray-300 via-indigo-400 to-gray-300">
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 text-indigo-500 bg-white" />
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <span className="text-[7px] text-gray-500">{f.duration}</span>
                  <span className={`text-[6px] font-bold px-0.5 rounded ${getStopsStyle(f.stops)}`}>
                    {f.stops === 0 ? "Direct" : `${f.stops}stop`}
                  </span>
                </div>
              </div>
              <div className="text-center min-w-[36px]">
                <p className="text-xs font-bold text-gray-900">{f.arrivalTime || "--:--"}</p>
                <p className="text-[8px] text-gray-500">{f.destination}</p>
              </div>
            </div>

            {/* Return Row */}
            {isRoundtrip && (
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50/50">
                <span className="text-[7px] font-bold text-orange-600 uppercase w-7">←RET</span>
                <span className="text-[8px] text-gray-500 w-12 truncate">{f.airline} {f.returnFlightNumber}</span>
                <div className="text-center min-w-[36px]">
                  <p className="text-xs font-bold text-gray-900">{f.returnDepartureTime || "--:--"}</p>
                  <p className="text-[8px] text-gray-500">{f.destination}</p>
                </div>
                <div className="flex-1 px-1">
                  <div className="relative h-px bg-gradient-to-r from-gray-300 via-orange-400 to-gray-300">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 text-orange-500 bg-white rotate-180" />
                  </div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <span className="text-[7px] text-gray-500">{f.returnDuration}</span>
                    <span className={`text-[6px] font-bold px-0.5 rounded ${getStopsStyle(f.returnStops || 0)}`}>
                      {(f.returnStops || 0) === 0 ? "Direct" : `${f.returnStops}stop`}
                    </span>
                  </div>
                </div>
                <div className="text-center min-w-[36px]">
                  <p className="text-xs font-bold text-gray-900">{f.returnArrivalTime || "--:--"}</p>
                  <p className="text-[8px] text-gray-500">{f.origin}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Price + Actions */}
          <div className="flex flex-col items-center justify-center px-2 py-2 border-l border-gray-100 min-w-[80px]">
            <p className="text-sm font-black text-gray-900 bg-yellow-100 px-1.5 py-0.5 rounded">{formatPrice(f.price)}</p>
            <p className="text-[8px] text-gray-400 mt-0.5">{f.passengers} pax • {isRoundtrip ? "RT" : "OW"}</p>
            <div className="flex items-center gap-0.5 mt-1">
              <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Details Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 overflow-hidden"
            >
              <div className="p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <h5 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Flight Details
                </h5>

                <div className="grid grid-cols-3 gap-2">
                  {/* Fare Type */}
                  <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                    <p className="text-[8px] text-gray-500 uppercase tracking-wide">Fare Type</p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{f.fareType || "Standard"}</p>
                    {f.fareBasis && (
                      <p className="text-[8px] text-gray-400 mt-0.5">{f.fareBasis}</p>
                    )}
                  </div>

                  {/* Cabin Class */}
                  <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                    <p className="text-[8px] text-gray-500 uppercase tracking-wide">Cabin</p>
                    <p className="text-xs font-semibold text-gray-900 capitalize mt-0.5">
                      {f.cabinClass?.replace("_", " ") || "Economy"}
                    </p>
                  </div>

                  {/* Baggage */}
                  <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                    <p className="text-[8px] text-gray-500 uppercase tracking-wide flex items-center gap-0.5">
                      <Luggage className="w-2.5 h-2.5" /> Baggage
                    </p>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">
                      {f.includedBags?.quantity ? `${f.includedBags.quantity} bag${f.includedBags.quantity > 1 ? "s" : ""}` : f.baggage || "Check policy"}
                    </p>
                    {f.includedBags?.weight && (
                      <p className="text-[8px] text-gray-400">{f.includedBags.weight}</p>
                    )}
                  </div>
                </div>

                {/* Fare Rules */}
                {f.fareRules && (
                  <div className="mt-2 flex items-center gap-3 text-[9px]">
                    <div className="flex items-center gap-1">
                      {f.fareRules.changeable ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className={f.fareRules.changeable ? "text-emerald-700" : "text-red-500"}>
                        {f.fareRules.changeable ? "Changeable" : "Non-changeable"}
                      </span>
                      {f.fareRules.changeFee && (
                        <span className="text-gray-400">({f.fareRules.changeFee})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {f.fareRules.refundable ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className={f.fareRules.refundable ? "text-emerald-700" : "text-red-500"}>
                        {f.fareRules.refundable ? "Refundable" : "Non-refundable"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Route Summary */}
                <div className="mt-2 pt-2 border-t border-gray-200/50 text-[9px] text-gray-500">
                  <span className="font-medium">{f.originCity || f.origin}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium">{f.destinationCity || f.destination}</span>
                  {isRoundtrip && (
                    <>
                      <span className="mx-1">→</span>
                      <span className="font-medium">{f.originCity || f.origin}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden"
              >
                <button onClick={() => { expandItem(item.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Default card for non-flight items
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
      <div className="pl-8 pr-4 py-3">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-4 h-4 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate text-sm">{getTitle()}</h4>
            <p className="text-xs text-gray-500 truncate">{getSubtitle()}</p>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-1">
            <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      <button onClick={() => { expandItem(item.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Copy className="w-4 h-4" /> Duplicate
                      </button>
                      <div className="border-t border-gray-100" />
                      <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Remove
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
              className="mt-3 pt-3 border-t border-gray-100"
            >
              <div className={`p-3 ${config.bgLight} rounded-lg`}>
                <p className="text-xs text-gray-600">Click Edit to modify this item.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
