"use client";

import { Plane, Building2, Car, Compass, Bus, Shield, Package, Sun, Sunset, Moon, Coffee, Clock, MapPin, Users } from "lucide-react";
import type { QuoteItem, FlightItem, HotelItem, CarItem, ActivityItem, TransferItem, InsuranceItem, ProductType } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC ITEM ROLE SYSTEM - Cognitive hierarchy for travel agents
// ═══════════════════════════════════════════════════════════════════════════════
export type ItemRole = "transport" | "accommodation" | "mobility" | "experience" | "protection" | "other";

const itemRoleConfig: Record<ItemRole, { label: string; color: string }> = {
  transport: { label: "Transport", color: "bg-slate-100 text-slate-600" },
  accommodation: { label: "Stay", color: "bg-violet-100 text-violet-600" },
  mobility: { label: "Mobility", color: "bg-sky-100 text-sky-600" },
  experience: { label: "Experience", color: "bg-emerald-100 text-emerald-600" },
  protection: { label: "Protection", color: "bg-rose-100 text-rose-600" },
  other: { label: "Item", color: "bg-gray-100 text-gray-500" },
};

export const getItemRole = (type: ProductType): ItemRole => {
  const roleMap: Record<ProductType, ItemRole> = {
    flight: "transport", transfer: "transport",
    hotel: "accommodation",
    car: "mobility",
    activity: "experience",
    insurance: "protection",
    custom: "other",
  };
  return roleMap[type] || "other";
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SORT PRIORITY - Cognitive hierarchy for daily planning
// Transport → Accommodation → Mobility → Experience → Protection → Other
// ═══════════════════════════════════════════════════════════════════════════════
const roleSortPriority: Record<ItemRole, number> = {
  transport: 1,      // Flights, Transfers first
  accommodation: 2,  // Hotels - where you stay
  mobility: 3,       // Cars - how you move
  experience: 4,     // Tours, Activities
  protection: 5,     // Insurance
  other: 6,          // Custom, notes
};

export const getItemSortPriority = (type: ProductType): number => {
  const role = getItemRole(type);
  return roleSortPriority[role];
};

/** Sort items by semantic role (visual only - doesn't mutate source) */
export const sortItemsByRole = <T extends { type: ProductType; sortOrder?: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const priorityDiff = getItemSortPriority(a.type) - getItemSortPriority(b.type);
    if (priorityDiff !== 0) return priorityDiff;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIME ANCHOR SYSTEM - Temporal context even without exact times
// ═══════════════════════════════════════════════════════════════════════════════
export type TimeAnchor = "morning" | "afternoon" | "evening" | "overnight" | "flexible";

const timeAnchorConfig: Record<TimeAnchor, { label: string; icon: typeof Sun; color: string }> = {
  morning: { label: "Morning", icon: Coffee, color: "text-amber-500" },
  afternoon: { label: "Afternoon", icon: Sun, color: "text-orange-500" },
  evening: { label: "Evening", icon: Sunset, color: "text-purple-500" },
  overnight: { label: "Overnight", icon: Moon, color: "text-indigo-500" },
  flexible: { label: "Flexible", icon: Clock, color: "text-gray-400" },
};

export const getTimeAnchor = (item: QuoteItem): TimeAnchor => {
  if (item.type === "hotel") return "overnight";
  const timeStr = (item as any).departureTime || (item as any).pickupTime || (item as any).startTime || "";
  if (!timeStr) return "flexible";
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (isNaN(hour)) return "flexible";
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "overnight";
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE BADGE - Minimal semantic category indicator
// ═══════════════════════════════════════════════════════════════════════════════
export const RoleBadge = ({ type }: { type: ProductType }) => {
  const role = getItemRole(type);
  const { label, color } = itemRoleConfig[role];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase ${color}`}>
      {label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIME ANCHOR BADGE - Temporal context indicator
// ═══════════════════════════════════════════════════════════════════════════════
export const TimeAnchorBadge = ({ item }: { item: QuoteItem }) => {
  const anchor = getTimeAnchor(item);
  const { label, icon: Icon, color } = timeAnchorConfig[anchor];
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      <span>{label}</span>
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AT-A-GLANCE INFO - Where, Duration, Who (compact row)
// ═══════════════════════════════════════════════════════════════════════════════
export const GlanceInfo = ({ item }: { item: QuoteItem }) => {
  const getInfo = (): { where: string | null; duration: string | null; who: string | null } => {
    switch (item.type) {
      case "flight": {
        const f = item as FlightItem;
        return { where: `${f.originCity} → ${f.destinationCity}`, duration: f.duration, who: `${f.passengers || 1} pax` };
      }
      case "hotel": {
        const h = item as HotelItem;
        return { where: h.location, duration: `${h.nights}n`, who: `${h.guests || 1}g` };
      }
      case "car": {
        const c = item as CarItem;
        return { where: c.pickupLocation, duration: `${c.days}d`, who: null };
      }
      case "activity": {
        const a = item as ActivityItem;
        return { where: a.location, duration: a.duration || "Varies", who: `${a.participants}p` };
      }
      case "transfer": {
        const t = item as TransferItem;
        return { where: `${t.pickupLocation} → ${t.dropoffLocation}`, duration: null, who: `${t.passengers || 1}p` };
      }
      case "insurance": {
        const i = item as InsuranceItem;
        return { where: null, duration: `${i.days || "Trip"}`, who: `${i.travelers}` };
      }
      default:
        return { where: null, duration: null, who: null };
    }
  };

  const { where, duration, who } = getInfo();

  return (
    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5">
      {where && <span className="flex items-center gap-0.5 truncate max-w-[100px]"><MapPin className="w-2 h-2 flex-shrink-0" />{where}</span>}
      {duration && <span className="flex items-center gap-0.5"><Clock className="w-2 h-2" />{duration}</span>}
      {who && <span className="flex items-center gap-0.5"><Users className="w-2 h-2" />{who}</span>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARD HEADER WITH ROLE + TIME ANCHOR - Unified header for all cards
// ═══════════════════════════════════════════════════════════════════════════════
export const CardRoleHeader = ({ item }: { item: QuoteItem }) => (
  <div className="flex items-center justify-between gap-2 mb-1">
    <RoleBadge type={item.type} />
    <TimeAnchorBadge item={item} />
  </div>
);
