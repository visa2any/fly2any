"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Plane, Building2, Car, Compass, Bus, Shield, Package, MoreVertical, Edit2, Copy, Trash2, GripVertical, ChevronDown, ChevronUp, Briefcase, RefreshCw, XCircle, CheckCircle2, Info, Luggage, Star, Clock, Users, MapPin, Sparkles, Heart, Sun, Sunset, Moon, Coffee } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { getProductCopy, type ToneProfile } from "./ToneSystem";
import type { QuoteItem, FlightItem, HotelItem, CarItem, ActivityItem, TransferItem, InsuranceItem, CustomItem, ProductType } from "../types/quote-workspace.types";
import { RoleBadge, TimeAnchorBadge, GlanceInfo, CardRoleHeader } from "./ItemRoleSystem";
import ItemQualitySignals from "./ItemQualitySignals";

// Icon and gradient config
const productConfig: Record<ProductType, { icon: typeof Plane; gradient: string; bgLight: string }> = {
  flight: { icon: Plane, gradient: "from-blue-500 to-indigo-600", bgLight: "bg-blue-50" },
  hotel: { icon: Building2, gradient: "from-purple-500 to-pink-600", bgLight: "bg-purple-50" },
  car: { icon: Car, gradient: "from-cyan-500 to-blue-600", bgLight: "bg-cyan-50" },
  tour: { icon: MapPin, gradient: "from-orange-500 to-red-600", bgLight: "bg-orange-50" },
  activity: { icon: Compass, gradient: "from-emerald-500 to-teal-600", bgLight: "bg-emerald-50" },
  transfer: { icon: Bus, gradient: "from-amber-500 to-orange-600", bgLight: "bg-amber-50" },
  insurance: { icon: Shield, gradient: "from-rose-500 to-pink-600", bgLight: "bg-rose-50" },
  custom: { icon: Package, gradient: "from-gray-600 to-gray-800", bgLight: "bg-gray-50" },
};

interface ItineraryCardProps {
  item: QuoteItem;
  dragListeners?: any;
  isDragging?: boolean;
  viewMode?: "agent" | "client";
  tone?: ToneProfile;
}

export default function ItineraryCard({ item, dragListeners, isDragging, viewMode = "agent", tone = "family" }: ItineraryCardProps) {
  const { state, removeItem, expandItem } = useQuoteWorkspace();
  const [showMenu, setShowMenu] = useState(false);
  const productCopyData = getProductCopy(tone, item.type);
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
        {/* Drag Handle - Agent Only */}
        {viewMode === "agent" && (
          <div
            {...dragListeners}
            className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )}

        {/* 3-Column Layout - Responsive */}
        <div className="flex flex-col sm:flex-row">
          {/* LEFT: Role Badge + Logo + Airline Name + Fare Type */}
          <div className="flex flex-row sm:flex-col items-center justify-center px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 min-w-[72px] ml-5 gap-2 sm:gap-0">
            <div className="hidden sm:flex items-center gap-1 mb-1">
              <RoleBadge type="flight" />
            </div>
            <AirlineLogo code={f.airline} size="sm" className="flex-shrink-0" />
            <p className="text-[9px] font-bold text-gray-900 mt-1 text-center truncate max-w-[68px]">
              {f.airlineName || f.airline}
            </p>
            {f.fareType && (
              <p className="text-[8px] text-indigo-600 font-medium bg-indigo-50 px-1 py-0.5 rounded mt-0.5 truncate max-w-[68px]">
                {f.fareType}
              </p>
            )}
          </div>

          {/* MIDDLE: Flight Rows */}
          <div className="flex-1 min-w-0">
            {/* Outbound Row */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
              <div className="w-16">
                <span className="text-[10px] font-bold text-indigo-600 uppercase">→OUT</span>
                <p className="text-[9px] text-gray-400">{f.date ? format(parseISO(f.date), "MMM d") : ""}</p>
              </div>
              <span className="text-xs text-gray-500 w-14 truncate">{f.airline} {f.flightNumber}</span>
              <div className="text-center min-w-[48px]">
                <p className="text-sm font-bold text-gray-900">{f.departureTime || "--:--"}</p>
                <p className="text-xs text-gray-500">{f.origin}</p>
              </div>
              <div className="flex-1 px-2">
                <div className="relative h-px bg-gradient-to-r from-gray-300 via-indigo-400 to-gray-300">
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500 bg-white" />
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-xs text-gray-500">{f.duration}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStopsStyle(f.stops)}`}>
                    {f.stops === 0 ? "Direct" : `${f.stops} stop`}
                  </span>
                </div>
              </div>
              <div className="text-center min-w-[48px]">
                <p className="text-sm font-bold text-gray-900">{f.arrivalTime || "--:--"}</p>
                <p className="text-xs text-gray-500">{f.destination}</p>
              </div>
            </div>

            {/* Return Row */}
            {isRoundtrip && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50/50">
                <div className="w-16">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">←RET</span>
                  <p className="text-[9px] text-gray-400">{f.returnDate ? format(parseISO(f.returnDate), "MMM d") : ""}</p>
                </div>
                <span className="text-xs text-gray-500 w-14 truncate">{f.airline} {f.returnFlightNumber}</span>
                <div className="text-center min-w-[48px]">
                  <p className="text-sm font-bold text-gray-900">{f.returnDepartureTime || "--:--"}</p>
                  <p className="text-xs text-gray-500">{f.destination}</p>
                </div>
                <div className="flex-1 px-2">
                  <div className="relative h-px bg-gradient-to-r from-gray-300 via-orange-400 to-gray-300">
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-orange-500 bg-white rotate-180" />
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">{f.returnDuration}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getStopsStyle(f.returnStops || 0)}`}>
                      {(f.returnStops || 0) === 0 ? "Direct" : `${f.returnStops} stop`}
                    </span>
                  </div>
                </div>
                <div className="text-center min-w-[48px]">
                  <p className="text-sm font-bold text-gray-900">{f.returnArrivalTime || "--:--"}</p>
                  <p className="text-xs text-gray-500">{f.origin}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Price + Actions */}
          <div className="flex flex-col items-center justify-center px-3 py-3 border-t sm:border-t-0 sm:border-l border-gray-100 min-w-[100px]">
            {viewMode === "agent" ? (
              <>
                <p className="text-base font-black text-gray-900 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">{formatPrice(f.price)}</p>
                <p className="text-xs text-gray-400 mt-1">{f.passengers} pax • {isRoundtrip ? "RT" : "OW"}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <button onClick={handleExpand} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Client View - Confirmed status */
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-700">Confirmed</p>
                </div>
                <p className="text-[10px] text-gray-500">{f.passengers} {f.passengers === 1 ? "traveler" : "travelers"}</p>
                <p className="text-[10px] text-gray-400">{isRoundtrip ? "Round trip" : "One way"}</p>
              </div>
            )}
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

                {/* Flight Numbers & Route */}
                <div className="mb-2 p-2 bg-white rounded-lg border border-gray-100">
                  <p className="text-[8px] text-gray-500 uppercase tracking-wide mb-1">Flight Information</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-900">{f.airline} {f.flightNumber}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-gray-700">{f.origin} → {f.destination}</span>
                    {f.aircraftType && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{f.aircraftType}</span>
                      </>
                    )}
                  </div>
                  {f.confirmationNumber && (
                    <p className="text-[9px] text-gray-500 mt-1">Confirmation: <span className="font-mono font-semibold text-gray-700">{f.confirmationNumber}</span></p>
                  )}
                </div>

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

  // Activity/Tour-specific card with photo and more info
  if (item.type === "activity" || item.type === "tour") {
    const a = item as ActivityItem;
    // DEBUG: Check image field
    if (!a.image) console.warn(`[${item.type}] No image:`, a.name, 'Image field:', a.image);
    return (
      <motion.div
        layout
        className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
          isExpanded ? `ring-2 ${item.type === "tour" ? "ring-orange-400" : "ring-emerald-400"}` : ""
        }`}
      >
        {/* Drag Handle - Agent Only */}
        {viewMode === "agent" && (
          <div
            {...dragListeners}
            className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex ml-5">
          {/* Photo Thumbnail - Standardized 128x96 */}
          <div className={`w-32 h-24 rounded-l-xl overflow-hidden flex-shrink-0 ${item.type === "tour" ? "bg-orange-100" : "bg-emerald-100"}`}>
            {a.image ? (
              <img src={a.image} alt={a.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => {
                console.log('Image load error:', a.image);
                e.currentTarget.style.display = 'none';
              }} />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${item.type === "tour" ? "bg-gradient-to-br from-orange-200 to-red-200" : "bg-gradient-to-br from-emerald-200 to-teal-200"}`}>
                {item.type === "tour" ? <MapPin className="w-8 h-8 text-orange-400" /> : <Compass className="w-8 h-8 text-emerald-400" />}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <RoleBadge type={item.type} />
                  <TimeAnchorBadge item={item} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{a.name}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" />{a.location}
                  </span>
                  {a.duration && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
                      <Clock className="w-3 h-3" />{a.duration}
                    </span>
                  )}
                  {a.time && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600">
                      🕐 {a.time}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Users className="w-3 h-3" />{a.participants} {a.participants === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
                {a.description && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                )}
              </div>
              {/* Price - Standardized alignment */}
              {viewMode === "agent" ? (
                <div className="flex-shrink-0 text-right">
                  <p className="font-black text-gray-900 text-sm bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">{formatPrice(a.price)}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{a.date ? format(parseISO(a.date), "MMM d") : ""}</p>
                </div>
              ) : (
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Agent Only */}
          {viewMode === "agent" && (
            <div className="flex flex-col items-center justify-center px-2 border-l border-gray-100 gap-1">
              <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                <p className="text-xs text-gray-600">{a.description || "No description available."}</p>
                {a.includes && a.includes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.includes.map((inc, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{inc}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropdown Menu - Fixed z-index */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-[101] overflow-hidden"
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

  // Hotel-specific card with photo and more info
  if (item.type === "hotel") {
    const h = item as HotelItem;
    return (
      <motion.div
        layout
        className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
          isExpanded ? "ring-2 ring-purple-400" : ""
        }`}
      >
        {/* Drag Handle - Agent Only */}
        {viewMode === "agent" && (
          <div
            {...dragListeners}
            className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex ml-5">
          {/* Photo Thumbnail - Standardized 128x96 */}
          <div className="w-32 h-24 rounded-l-xl bg-purple-100 overflow-hidden flex-shrink-0">
            {h.image ? (
              <img src={h.image} alt={h.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <RoleBadge type="hotel" />
                  <TimeAnchorBadge item={item} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{h.name}</h4>
                  {h.starRating && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(h.starRating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">{h.roomType}</span>
                  {h.boardType && (
                    <span className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{h.boardType}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" />{h.location}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />{h.nights} night{h.nights > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Users className="w-3 h-3" />{h.guests} guest{h.guests > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {/* Price - Standardized alignment */}
              {viewMode === "agent" ? (
                <div className="flex-shrink-0 text-right">
                  <p className="font-black text-gray-900 text-sm bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">{formatPrice(h.price)}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{h.checkIn ? format(parseISO(h.checkIn), "MMM d") : ""}</p>
                </div>
              ) : (
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Agent Only */}
          {viewMode === "agent" && (
            <div className="flex flex-col items-center justify-center px-2 border-l border-gray-100 gap-1">
              <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details - Show for both views */}
        <AnimatePresence>
          {(isExpanded || viewMode === "client") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200"
            >
              <div className="p-3 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-[8px] text-gray-500 uppercase">Check-in</p>
                    <p className="text-xs font-semibold text-gray-900">{h.checkIn ? format(parseISO(h.checkIn), "EEE, MMM d") : ""}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-[8px] text-gray-500 uppercase">Check-out</p>
                    <p className="text-xs font-semibold text-gray-900">{h.checkOut ? format(parseISO(h.checkOut), "EEE, MMM d") : ""}</p>
                  </div>
                </div>
                {h.amenities && h.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {h.amenities.slice(0, 6).map((amenity, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">{amenity}</span>
                    ))}
                    {h.amenities.length > 6 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{h.amenities.length - 6} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropdown Menu - Fixed z-index */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-[101] overflow-hidden"
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

  // Car-specific card with photo and more info
  if (item.type === "car") {
    const c = item as CarItem;
    return (
      <motion.div
        layout
        className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
          isExpanded ? "ring-2 ring-cyan-400" : ""
        }`}
      >
        {/* Drag Handle - Agent Only */}
        {viewMode === "agent" && (
          <div
            {...dragListeners}
            className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex ml-5">
          {/* Photo Thumbnail */}
          <div className="w-32 h-24 rounded-l-xl bg-cyan-100 overflow-hidden flex-shrink-0">
            {c.image ? (
              <img src={c.image} alt={c.carType} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-8 h-8 text-cyan-300" />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <RoleBadge type="car" />
                  <TimeAnchorBadge item={item} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{c.company}</h4>
                  <span className="text-[9px] text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded font-medium uppercase">{c.carClass}</span>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-0.5">{c.carType}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" />{c.pickupLocation}
                  </span>
                  <span className="text-[10px] text-gray-400">→</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" />{c.dropoffLocation}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />{c.days} day{c.days > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {/* Price - Agent Only / Client Emotional Copy */}
              {viewMode === "agent" ? (
                <div className="flex-shrink-0 text-right">
                  <p className="font-black text-gray-900 text-sm bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">{formatPrice(c.price)}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{c.date ? format(parseISO(c.date), "MMM d") : ""}</p>
                </div>
              ) : (
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Agent Only */}
          {viewMode === "agent" && (
            <div className="flex flex-col items-center justify-center px-2 border-l border-gray-100 gap-1">
              <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {(isExpanded || viewMode === "client") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200"
            >
              <div className="p-3 bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-[8px] text-gray-500 uppercase">Pickup</p>
                    <p className="text-xs font-semibold text-gray-900">{c.pickupLocation}</p>
                    <p className="text-[9px] text-gray-500">{c.pickupDate ? format(parseISO(c.pickupDate), "MMM d, yyyy") : ""}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-[8px] text-gray-500 uppercase">Dropoff</p>
                    <p className="text-xs font-semibold text-gray-900">{c.dropoffLocation}</p>
                    <p className="text-[9px] text-gray-500">{c.dropoffDate ? format(parseISO(c.dropoffDate), "MMM d, yyyy") : ""}</p>
                  </div>
                </div>
                {c.features && c.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.features.map((feat, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">{feat}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropdown Menu - Fixed z-index */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-[101] overflow-hidden"
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

  // Transfer-specific card with improved layout
  if (item.type === "transfer") {
    const t = item as TransferItem;
    return (
      <motion.div
        layout
        className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
          isExpanded ? "ring-2 ring-amber-400" : ""
        }`}
      >
        {/* Drag Handle - Agent Only */}
        {viewMode === "agent" && (
          <div
            {...dragListeners}
            className={`absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing bg-gradient-to-r from-gray-50 to-transparent z-10 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex ml-5">
          {/* Icon */}
          <div className="w-16 flex items-center justify-center border-r border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <Bus className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <RoleBadge type="transfer" />
              <TimeAnchorBadge item={item} />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-gray-900 text-sm">{t.vehicleType} Transfer</h4>
              <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">{t.provider}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
              <span className="font-medium">{t.pickupLocation}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium">{t.dropoffLocation}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />{t.pickupTime}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <Users className="w-3 h-3" />{t.passengers} pax
              </span>
              {t.meetAndGreet && (
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Meet & Greet</span>
              )}
            </div>
          </div>

          {/* Price + Actions - Agent / Client */}
          {viewMode === "agent" ? (
            <div className="flex items-center gap-2 px-3 border-l border-gray-100">
              <div className="text-right">
                <p className="font-black text-gray-900 text-sm bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded">{formatPrice(t.price)}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{t.date ? format(parseISO(t.date), "MMM d") : ""}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={handleExpand} className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center px-3 border-l border-gray-100">
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Confirmed</span>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Menu - Fixed z-index */}
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-2 top-12 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-[101] overflow-hidden"
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

  // Default card for other items (hotel, car, insurance, custom)
  return (
    <motion.div
      layout
      className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
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
            <ItemQualitySignals item={item} />
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
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
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

      {/* Dropdown Menu - Fixed z-index */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-4 top-12 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-[101] overflow-hidden"
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
    </motion.div>
  );
}
