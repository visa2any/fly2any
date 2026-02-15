'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X, Check, DollarSign, Ban
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { toast } from 'react-hot-toast';

interface PropertyOption { id: string; name: string; currency: string; }
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
  
  // Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch properties
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties/dashboard');
        if (res.ok) {
          const json = await res.json();
          const props = (json.data?.properties || []).map((p: any) => ({ 
              id: p.id, 
              name: p.name,
              currency: p.currency || 'USD'
          }));
          setProperties(props);
          if (props.length > 0) setSelectedProperty(props[0].id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    loadProperties();
  }, []);

  // Fetch availability
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
  }, [selectedProperty, currentDate]); // Refresh when month changes? Or just fetch all? better to fetch range ideally.

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = format(currentDate, 'MMMM yyyy');

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDayStatus = (day: number): { available: boolean; price: number | null } | null => {
    const date = new Date(year, month, day);
    for (const entry of availability) {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);
      // Simple date comparison (ignoring time)
      if (date >= start && date <= end) {
        return { available: entry.available, price: entry.customPrice };
      }
    }
    return null;
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    const status = getDayStatus(day);
    
    setSelectedDate(date);
    setEditAvailable(status ? status.available : true);
    setEditPrice(status?.price ? String(status.price) : '');
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedProperty) return;
    setIsSaving(true);
    
    try {
        const payload = {
            startDate: selectedDate.toISOString(),
            endDate: selectedDate.toISOString(), // Single day for now
            available: editAvailable,
            price: editPrice ? parseFloat(editPrice) : null
        };

        const res = await fetch(`/api/properties/${selectedProperty}/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save");

        // Optimistically update local state (or refetch)
        // For simplicity, let's just refetch or append
        const newEntry: AvailabilityEntry = {
            id: 'temp-' + Date.now(),
            startDate: payload.startDate,
            endDate: payload.endDate,
            available: payload.available,
            customPrice: payload.price,
            notes: null
        };
        // Remove old overlapping entries for this day (simple filtering)
        const filtered = availability.filter(a => {
            const date = new Date(payload.startDate);
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);
            return !(date >= start && date <= end); // Removing only exact matches might be tricky with ranges
        });
        setAvailability([...filtered, newEntry]);
        
        toast.success("Availability updated!");
        setSelectedDate(null);

    } catch (e) {
        toast.error("Failed to update availability");
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4 pb-20 relative">
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
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-white font-bold text-lg">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-white/30 text-xs font-bold py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/20 relative outline-none focus:ring-2 focus:ring-primary-500 ${
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
                  </button>
                );
              })}
            </div>
          </>
        )}
      </MaxWidthContainer>

      {/* Edit Modal / Panel */}
      {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#1a1a20] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">
                          Edit {format(selectedDate, 'MMM d, yyyy')}
                      </h3>
                      <button onClick={() => setSelectedDate(null)} className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="space-y-6">
                      {/* Availability Toggle */}
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/70">Availability</span>
                          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                              <button 
                                onClick={() => setEditAvailable(true)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${editAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white'}`}
                              >
                                  Open
                              </button>
                              <button 
                                onClick={() => setEditAvailable(false)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!editAvailable ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white'}`}
                              >
                                  Blocked
                              </button>
                          </div>
                      </div>

                      {/* Price Input */}
                      {editAvailable && (
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-white/70">Nightly Price</label>
                              <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                  <input 
                                    type="number" 
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    placeholder="Default"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                      {currentProperty?.currency}
                                  </span>
                              </div>
                          </div>
                      )}

                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
