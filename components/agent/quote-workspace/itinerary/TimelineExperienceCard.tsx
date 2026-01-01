"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Ticket,
  Bus,
  Clock,
  Users,
  Star,
  ChevronDown,
  Trash2,
  Edit3,
  GripVertical,
  ExternalLink,
  Briefcase,
  Coffee,
  Utensils,
  Wifi,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, differenceInMinutes } from "date-fns";

type ProductType = "flight" | "hotel" | "car" | "activity" | "transfer";
type ViewMode = "agent" | "client";

interface TimelineExperienceCardProps {
  item: any;
  type: ProductType;
  viewMode?: ViewMode;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const typeConfig: Record<ProductType, {
  icon: typeof Plane;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  flight: {
    icon: Plane,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    label: "Flight",
  },
  hotel: {
    icon: Hotel,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    label: "Stay",
  },
  car: {
    icon: Car,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Car Rental",
  },
  activity: {
    icon: Ticket,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    label: "Experience",
  },
  transfer: {
    icon: Bus,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Transfer",
  },
};

export default function TimelineExperienceCard({
  item,
  type,
  viewMode = "agent",
  isExpanded = false,
  onToggleExpand,
  onRemove,
  onEdit,
  isDragging = false,
  dragHandleProps,
}: TimelineExperienceCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isAgent = viewMode === "agent";

  // Render based on product type
  const renderContent = () => {
    switch (type) {
      case "flight":
        return <FlightContent item={item} isAgent={isAgent} isExpanded={isExpanded} />;
      case "hotel":
        return <HotelContent item={item} isAgent={isAgent} isExpanded={isExpanded} />;
      case "car":
        return <CarContent item={item} isAgent={isAgent} isExpanded={isExpanded} />;
      case "activity":
        return <ActivityContent item={item} isAgent={isAgent} isExpanded={isExpanded} />;
      case "transfer":
        return <TransferContent item={item} isAgent={isAgent} isExpanded={isExpanded} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isDragging
          ? "0 20px 40px -10px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.05)"
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white rounded-xl border ${config.borderColor} overflow-hidden ${
        isDragging ? "ring-2 ring-primary-500 z-50" : ""
      }`}
    >
      {/* Type Badge + Drag Handle */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        {isAgent && dragHandleProps && (
          <div
            {...dragHandleProps}
            className="p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${config.bgColor} ${config.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </div>

      {/* Agent Controls */}
      {isAgent && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="pt-12 px-4 pb-4">
        {renderContent()}
      </div>

      {/* Expand/Collapse Button */}
      {onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span>{isExpanded ? "Show less" : "Show more"}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      )}
    </motion.div>
  );
}

// Flight Content
function FlightContent({ item, isAgent, isExpanded }: { item: any; isAgent: boolean; isExpanded: boolean }) {
  const flight = item.details || item;
  const segments = flight.segments || flight.itineraries?.[0]?.segments || [];
  const firstSegment = segments[0] || {};
  const lastSegment = segments[segments.length - 1] || firstSegment;

  const depTime = firstSegment.departure?.at || flight.departureTime;
  const arrTime = lastSegment.arrival?.at || flight.arrivalTime;
  const depAirport = firstSegment.departure?.iataCode || flight.origin;
  const arrAirport = lastSegment.arrival?.iataCode || flight.destination;
  const carrier = firstSegment.carrierCode || flight.airline;
  const flightNum = firstSegment.number || flight.flightNumber;
  const stops = segments.length > 1 ? segments.length - 1 : 0;

  // Calculate duration
  const duration = flight.duration || (depTime && arrTime ? calculateDuration(depTime, arrTime) : null);

  return (
    <div className="space-y-3">
      {/* Route Display */}
      <div className="flex items-center gap-4">
        {/* Departure */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{depAirport}</p>
          {depTime && (
            <p className="text-sm text-gray-500">{formatFlightTime(depTime)}</p>
          )}
        </div>

        {/* Flight Path */}
        <div className="flex-1 relative">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-gray-200" />
          <div className="relative flex justify-center">
            <div className="bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Plane className="w-3.5 h-3.5 rotate-90" />
                <span>{duration || "--"}</span>
                {stops > 0 && (
                  <span className="text-amber-600">({stops} stop{stops > 1 ? "s" : ""})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Arrival */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{arrAirport}</p>
          {arrTime && (
            <p className="text-sm text-gray-500">{formatFlightTime(arrTime)}</p>
          )}
        </div>
      </div>

      {/* Airline & Flight Number */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-medium">{carrier} {flightNum}</span>
          {flight.cabin && (
            <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{flight.cabin}</span>
          )}
        </div>
        {isAgent && flight.price && (
          <span className="font-bold text-gray-900">${flight.price.toLocaleString()}</span>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-gray-100 space-y-2"
          >
            {segments.length > 1 && (
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Flight Segments:</p>
                {segments.map((seg: any, idx: number) => (
                  <p key={idx} className="pl-2">
                    {seg.departure?.iataCode} → {seg.arrival?.iataCode}
                    {seg.carrierCode && seg.number && ` (${seg.carrierCode}${seg.number})`}
                  </p>
                ))}
              </div>
            )}
            {flight.baggage && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{flight.baggage}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hotel Content
function HotelContent({ item, isAgent, isExpanded }: { item: any; isAgent: boolean; isExpanded: boolean }) {
  const hotel = item.details || item;
  const name = hotel.name || hotel.hotelName || "Hotel";
  const checkIn = hotel.checkIn || item.date;
  const checkOut = hotel.checkOut;
  const nights = hotel.nights || 1;
  const image = hotel.image || hotel.photo || "/images/placeholder-hotel.jpg";
  const rating = hotel.rating || hotel.stars;
  const address = hotel.address || hotel.location;

  return (
    <div className="space-y-3">
      {/* Hotel Image & Info */}
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          {rating && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}
          {address && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stay Duration */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <span>{nights} night{nights > 1 ? "s" : ""}</span>
          {checkIn && checkOut && (
            <span className="text-xs text-gray-400">
              {formatDate(checkIn)} → {formatDate(checkOut)}
            </span>
          )}
        </div>
        {isAgent && hotel.price && (
          <span className="font-bold text-gray-900">${hotel.price.toLocaleString()}</span>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-gray-100"
          >
            {hotel.roomType && (
              <p className="text-sm text-gray-600 mb-2">{hotel.roomType}</p>
            )}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-xs text-gray-600"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Car Content
function CarContent({ item, isAgent, isExpanded }: { item: any; isAgent: boolean; isExpanded: boolean }) {
  const car = item.details || item;
  const name = car.name || car.vehicleName || "Car Rental";
  const company = car.company || car.vendor;
  const image = car.image || "/images/placeholder-car.jpg";
  const pickupDate = car.pickupDate || item.date;
  const dropoffDate = car.dropoffDate;

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
          {company && (
            <p className="text-sm text-gray-500">{company}</p>
          )}
          {car.transmission && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
              {car.transmission}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {pickupDate && formatDate(pickupDate)} – {dropoffDate && formatDate(dropoffDate)}
        </span>
        {isAgent && car.price && (
          <span className="font-bold text-gray-900">${car.price.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}

// Activity Content
function ActivityContent({ item, isAgent, isExpanded }: { item: any; isAgent: boolean; isExpanded: boolean }) {
  const activity = item.details || item;
  const name = activity.name || activity.title || "Activity";
  const image = activity.image || activity.photo || "/images/placeholder-activity.jpg";
  const duration = activity.duration;
  const location = activity.location;
  const time = activity.time || activity.startTime;

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 line-clamp-2">{name}</h4>
          {location && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time}
            </span>
          )}
          {duration && (
            <span>{duration}</span>
          )}
        </div>
        {isAgent && activity.price && (
          <span className="font-bold text-gray-900">${activity.price.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}

// Transfer Content
function TransferContent({ item, isAgent, isExpanded }: { item: any; isAgent: boolean; isExpanded: boolean }) {
  const transfer = item.details || item;
  const from = transfer.from || transfer.pickup;
  const to = transfer.to || transfer.dropoff;
  const vehicleType = transfer.vehicleType || transfer.type;
  const time = transfer.time || transfer.pickupTime;

  return (
    <div className="space-y-3">
      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500">From</p>
          <p className="font-medium text-gray-900 truncate">{from}</p>
        </div>
        <div className="text-gray-300">→</div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">To</p>
          <p className="font-medium text-gray-900 truncate">{to}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {time}
            </span>
          )}
          {vehicleType && (
            <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{vehicleType}</span>
          )}
        </div>
        {isAgent && transfer.price && (
          <span className="font-bold text-gray-900">${transfer.price.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatFlightTime(dateTime: string): string {
  try {
    const date = parseISO(dateTime);
    return format(date, "h:mm a");
  } catch {
    return dateTime;
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMM d");
  } catch {
    return dateStr;
  }
}

function calculateDuration(dep: string, arr: string): string {
  try {
    const depDate = parseISO(dep);
    const arrDate = parseISO(arr);
    const mins = differenceInMinutes(arrDate, depDate);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  } catch {
    return "";
  }
}

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="w-3 h-3" />;
  if (lower.includes("breakfast") || lower.includes("food")) return <Coffee className="w-3 h-3" />;
  if (lower.includes("restaurant") || lower.includes("dining")) return <Utensils className="w-3 h-3" />;
  return <CheckCircle2 className="w-3 h-3" />;
}
