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
  }, [selectedProperty, currentDate]);

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
            endDate: selectedDate.toISOString(),
            available: editAvailable,
            price: editPrice ? parseFloat(editPrice) : null
        };

        const res = await fetch(`/api/properties/${selectedProperty}/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save");

        const newEntry: AvailabilityEntry = {
            id: 'temp-' + Date.now(),
            startDate: payload.startDate,
            endDate: payload.endDate,
            available: payload.available,
            customPrice: payload.price,
            notes: null
        };
        const filtered = availability.filter(a => {
            const date = new Date(payload.startDate);
            const start = new Date(a.startDate);
            const end = new Date(a.endDate);
            return !(date >= start && date <= end);
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
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20 relative">
      <MaxWidthContainer>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Calendar & Availability</h1>
            <p className="text-gray-500 text-sm">Manage your property availability and custom pricing.</p>
          </div>
          {properties.length > 0 && (
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-gray-900 text-sm font-semibold focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 appearance-none cursor-pointer"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <CalendarIcon className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">No properties</h3>
            <p className="text-gray-500 text-sm">Add a property first to manage its calendar.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-lg bg-white border border-neutral-200 text-gray-500 hover:text-gray-900 hover:bg-neutral-50 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-gray-900 font-bold text-lg">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg bg-white border border-neutral-200 text-gray-500 hover:text-gray-900 hover:bg-neutral-50 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-gray-400 text-xs font-bold py-2">{d}</div>
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
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-md relative outline-none focus:ring-2 focus:ring-primary-500 ${
                      status && !status.available
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : status && status.available
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-neutral-200 text-gray-600 hover:bg-neutral-50'
                    } ${isToday ? 'ring-2 ring-primary-400' : ''}`}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    {status?.price && (
                      <span className="text-[10px] font-semibold mt-0.5">${status.price}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                Available
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-red-50 border border-red-200" />
                Blocked
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded bg-white border border-neutral-200" />
                Default
              </div>
            </div>
          </>
        )}
      </MaxWidthContainer>

      {/* Edit Modal */}
      {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                          Edit {format(selectedDate, 'MMM d, yyyy')}
                      </h3>
                      <button onClick={() => setSelectedDate(null)} className="p-1 rounded-full hover:bg-neutral-100 text-gray-400 hover:text-gray-900">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="space-y-6">
                      {/* Availability Toggle */}
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Availability</span>
                          <div className="flex bg-neutral-100 rounded-lg p-1">
                              <button 
                                onClick={() => setEditAvailable(true)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${editAvailable ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                              >
                                  Open
                              </button>
                              <button 
                                onClick={() => setEditAvailable(false)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!editAvailable ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                              >
                                  Blocked
                              </button>
                          </div>
                      </div>

                      {/* Price Input */}
                      {editAvailable && (
                          <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">Nightly Price</label>
                              <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input 
                                    type="number" 
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    placeholder="Default"
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                      {currentProperty?.currency}
                                  </span>
                              </div>
                          </div>
                      )}

                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
