'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Building2, Ticket, Car, ShieldCheck, Plus, ChevronDown, FileText, Bus, Star, Clock, MapPin, Users, Calendar, ArrowRight, Luggage } from 'lucide-react';

interface QuoteItineraryProps {
  quote: {
    flights: any;
    hotels: any;
    activities: any;
    transfers: any;
    carRentals: any;
    insurance: any;
    customItems: any;
  };
}

function fmt(val: any) {
  if (!val) return null;
  if (typeof val === 'string' && val.includes('T') && val.includes(':')) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  return String(val);
}

function fmtDate(val: any) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(val: any) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(5, count) }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

function FlightCard({ item }: { item: any }) {
  const dep = item.departureTime || item.departure_time;
  const arr = item.arrivalTime || item.arrival_time;
  const origin = item.originCity || item.origin || item.from;
  const dest = item.destinationCity || item.destination || item.to;
  const airline = item.airlineName || item.airline;
  const flight = item.flightNumber || item.flight_number;
  const stops = item.stops ?? 0;
  const cabin = item.cabinClass || item.cabin_class || item.class;
  const bags = item.baggage || item.includedBags;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-center flex-shrink-0">
            <p className="text-lg font-bold text-gray-900">{origin}</p>
            {dep && <p className="text-xs text-gray-500">{fmtTime(dep)}</p>}
          </div>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <div className="text-center flex-shrink-0">
              <p className="text-[10px] font-medium text-gray-500 whitespace-nowrap">{stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}</p>
              {item.duration && <p className="text-[10px] text-gray-400">{item.duration}</p>}
            </div>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-lg font-bold text-gray-900">{dest}</p>
            {arr && <p className="text-xs text-gray-500">{fmtTime(arr)}</p>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
        {airline && <span>{airline}{flight ? ` · ${flight}` : ''}</span>}
        {dep && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(dep)}</span>}
        {cabin && <span className="capitalize">{cabin.toLowerCase().replace('_', ' ')}</span>}
        {bags && <span className="flex items-center gap-1"><Luggage className="w-3 h-3" />Bags included</span>}
      </div>
    </div>
  );
}

function HotelCard({ item }: { item: any }) {
  const stars = item.stars ?? item.starRating ?? item.rating;
  const nights = item.nights;
  const checkIn = item.checkIn || item.check_in;
  const checkOut = item.checkOut || item.check_out;
  const roomType = item.roomType || item.room_type || item.room;
  const location = item.location || item.city;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{item.name || 'Accommodation'}</p>
          {location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{location}</p>}
        </div>
        {stars ? <Stars count={Number(stars)} /> : null}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {checkIn && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Check-in: {fmtDate(checkIn)}</span>}
        {checkOut && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Check-out: {fmtDate(checkOut)}</span>}
        {nights && <span>{nights} night{nights !== 1 ? 's' : ''}</span>}
        {roomType && <span className="capitalize">{roomType}</span>}
      </div>
      {item.amenities && Array.isArray(item.amenities) && item.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.amenities.slice(0, 4).map((a: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">{a}</span>
          ))}
          {item.amenities.length > 4 && <span className="text-[10px] text-gray-400">+{item.amenities.length - 4} more</span>}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ item }: { item: any }) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-900">{item.name || 'Experience'}</p>
      {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
        {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>}
        {item.participants && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.participants} participants</span>}
        {item.time && <span>{fmtTime(item.time)}</span>}
        {item.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(item.date)}</span>}
      </div>
      {item.includes && Array.isArray(item.includes) && item.includes.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {item.includes.slice(0, 3).map((inc: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-emerald-50 rounded-full text-[10px] text-emerald-700">✓ {inc}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function TransferCard({ item }: { item: any }) {
  const pickup = item.pickupLocation || item.from || item.origin;
  const dropoff = item.dropoffLocation || item.to || item.destination;
  return (
    <div className="space-y-1.5">
      {(pickup || dropoff) && (
        <div className="flex items-center gap-2 flex-wrap">
          {pickup && <span className="font-medium text-gray-900 text-sm">{pickup}</span>}
          {pickup && dropoff && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          {dropoff && <span className="font-medium text-gray-900 text-sm">{dropoff}</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {item.vehicleType && <span className="capitalize">{item.vehicleType.replace('_', ' ')}</span>}
        {item.pickupTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(item.pickupTime)}</span>}
        {item.passengers && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.passengers} passengers</span>}
        {item.meetAndGreet && <span className="text-emerald-600">Meet & Greet included</span>}
        {item.provider && <span>{item.provider}</span>}
      </div>
    </div>
  );
}

function CarCard({ item }: { item: any }) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-900">{item.carType || item.carClass || 'Rental Car'}{item.company ? ` · ${item.company}` : ''}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {item.pickupLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Pick-up: {item.pickupLocation}</span>}
        {item.pickupDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(item.pickupDate)}</span>}
        {item.dropoffDate && <span>→ {fmtDate(item.dropoffDate)}</span>}
        {item.days && <span>{item.days} day{item.days !== 1 ? 's' : ''}</span>}
      </div>
      {item.features && Array.isArray(item.features) && item.features.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.features.slice(0, 3).map((f: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function InsuranceCard({ item }: { item: any }) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-gray-900">{item.planName || 'Travel Insurance'}{item.provider ? ` · ${item.provider}` : ''}</p>
      {item.coverage && Array.isArray(item.coverage) && item.coverage.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.coverage.slice(0, 4).map((c: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-indigo-50 rounded-full text-[10px] text-indigo-700">✓ {c}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {item.travelers && <span>{item.travelers} traveler{item.travelers !== 1 ? 's' : ''} covered</span>}
        {item.startDate && <span>{fmtDate(item.startDate)} – {fmtDate(item.endDate)}</span>}
      </div>
    </div>
  );
}

function CustomCard({ item }: { item: any }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-gray-900">{item.name || 'Additional Service'}</p>
      {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
      {item.category && <p className="text-xs text-gray-500 capitalize">{item.category}</p>}
    </div>
  );
}

const SECTIONS = [
  { key: 'flights',     label: 'Flights',           Icon: Plane,      gradient: 'from-blue-500 to-blue-600',    bg: 'bg-blue-50',    text: 'text-blue-600',    Card: FlightCard },
  { key: 'hotels',      label: 'Hotels',             Icon: Building2,  gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50',  text: 'text-purple-600',  Card: HotelCard },
  { key: 'activities',  label: 'Activities',         Icon: Ticket,     gradient: 'from-emerald-500 to-emerald-600',bg:'bg-emerald-50', text: 'text-emerald-600', Card: ActivityCard },
  { key: 'transfers',   label: 'Transfers',          Icon: Bus,        gradient: 'from-amber-500 to-amber-600',  bg: 'bg-amber-50',   text: 'text-amber-600',   Card: TransferCard },
  { key: 'carRentals',  label: 'Car Rentals',        Icon: Car,        gradient: 'from-orange-500 to-orange-600',bg: 'bg-orange-50',  text: 'text-orange-600',  Card: CarCard },
  { key: 'insurance',   label: 'Travel Insurance',   Icon: ShieldCheck,gradient: 'from-indigo-500 to-indigo-600',bg: 'bg-indigo-50',  text: 'text-indigo-600',  Card: InsuranceCard },
  { key: 'customItems', label: 'Additional Items',   Icon: Plus,       gradient: 'from-gray-500 to-gray-600',   bg: 'bg-gray-50',    text: 'text-gray-600',    Card: CustomCard },
] as const;

function normalizeItems(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && Object.keys(data).length > 0) return [data];
  return [];
}

export default function QuoteItinerary({ quote }: QuoteItineraryProps) {
  const [expanded, setExpanded] = useState<string[]>(['flights', 'hotels']);

  const toggle = (key: string) =>
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const hasAny = SECTIONS.some(s => normalizeItems((quote as any)[s.key]).length > 0);

  if (!hasAny) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600">Itinerary details will be added shortly</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
      <div className="p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">What's Included</h2>
        <div className="space-y-3">
          {SECTIONS.map(({ key, label, Icon, gradient, bg, text, Card }, idx) => {
            const items = normalizeItems((quote as any)[key]);
            if (!items.length) return null;
            const isOpen = expanded.includes(key);
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => toggle(key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                      <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        {items.map((item: any, i: number) => (
                          <div key={i} className={`${bg} rounded-xl p-4`}>
                            <Card item={item} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
