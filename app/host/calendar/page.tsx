'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon
} from 'lucide-react';

interface PropertyOption { id: string; name: string; }
interface AvailabilityEntry {
  id: string; startDate: string; endDate: string;
  available: boolean; customPrice: number | null; notes: string | null;
}

export default function CalendarPage() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch properties for selector
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties/dashboard');
        if (res.ok) {
          const json = await res.json();
          const props = (json.data?.properties || []).map((p: any) => ({ id: p.id, name: p.name }));
          setProperties(props);
          if (props.length > 0) setSelectedProperty(props[0].id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    loadProperties();
  }, []);

  // Fetch availability when property changes
  useEffect(() => {
    if (!selectedProperty) return;
    async function loadAvailability() {
      try {
        const res = await fetch(`/api/properties/${selectedProperty}/availability`);
        if (res.ok) {
          const json = await res.json();
          setAvailability(json.data || []);
        }
      } catch (e) { console.error(e); }
    }
    loadAvailability();
  }, [selectedProperty]);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Check if a day has an availability entry
  const getDayStatus = (day: number): { available: boolean; price: number | null } | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(dateStr);
    for (const entry of availability) {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);
      if (date >= start && date <= end) {
        return { available: entry.available, price: entry.customPrice };
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Calendar & Availability</h1>
            <p className="text-white/50 text-sm">Manage your property availability and custom pricing.</p>
          </div>
          {properties.length > 0 && (
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
              style={{ backgroundImage: 'none' }}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1a1a20] text-white">{p.name}</option>
              ))}
            </select>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
            <CalendarIcon className="w-12 h-12 text-white/10 mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No properties</h3>
            <p className="text-white/40 text-sm">Add a property first to manage its calendar.</p>
          </div>
        ) : (
          <>
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-white font-bold text-lg">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-white/30 text-xs font-bold py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/10 ${
                      status && !status.available
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : status && status.available
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/[0.03] border-white/10 text-white/60'
                    } ${isToday ? 'ring-2 ring-amber-400/50' : ''}`}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    {status?.price && (
                      <span className="text-[10px] font-semibold mt-0.5">${status.price}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/40" />
                Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" />
                Blocked
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/5 border border-white/10" />
                Default
              </div>
            </div>
          </>
        )}
      </MaxWidthContainer>
    </div>
  );
}
