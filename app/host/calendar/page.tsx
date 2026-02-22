'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X, Check, DollarSign, Flame, CalendarDays
} from 'lucide-react';
import { format, subMonths, addMonths, eachDayOfInterval, isWithinInterval, isSameDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ICalSyncModal } from './components/ICalSyncModal';

interface PropertyOption { id: string; name: string; currency: string; }
interface AvailabilityEntry {
  id: string; startDate: string; endDate: string;
  available: boolean; customPrice: number | null; notes: string | null;
}

// Removed global getDemandScore to instead use component state

export default function CalendarPage() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [demandMap, setDemandMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Drag Selection State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Slide-over Modal State
  const [editPrice, setEditPrice] = useState<string>('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties/dashboard');
        if (res.ok) {
          const json = await res.json();
          const props = (json.data?.properties || []).map((p: any) => ({ 
              id: p.id, name: p.name, currency: p.currency || 'USD'
          }));
          setProperties(props);
          if (props.length > 0) setSelectedProperty(props[0].id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    loadProperties();
  }, []);



  useEffect(() => {
    if (!selectedProperty) return;
    async function loadData() {
      try {
        const [availRes, demandRes] = await Promise.all([
            fetch(`/api/properties/${selectedProperty}/availability`),
            fetch(`/api/properties/${selectedProperty}/demand`)
        ]);

        if (availRes.ok) {
          const json = await availRes.json();
          setAvailability(json.data || []);
        }

        if (demandRes.ok) {
            const json = await demandRes.json();
            setDemandMap(json.data || {});
        }
      } catch (e) { 
          console.error('Failed to load calendar data', e); 
      }
    }
    loadData();
  }, [selectedProperty, currentDate]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = format(currentDate, 'MMMM yyyy');

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDayStatus = (date: Date): { available: boolean; price: number | null } | null => {
    for (const entry of availability) {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      if (date >= start && date <= end) {
        return { available: entry.available, price: entry.customPrice };
      }
    }
    return null;
  };

  const getDemandScore = (date: Date) => {
      const ds = demandMap[format(date, 'yyyy-MM-dd')];
      return ds || 'normal';
  };

  const currentProperty = properties.find(p => p.id === selectedProperty);

  // Mouse Handlers for Drag Selection
  const handleMouseDown = (day: number) => {
    const date = new Date(year, month, day);
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
    setSelectedDates([]); // clear previous
  };

  const handleMouseEnter = (day: number) => {
    if (isDragging) {
      setDragEnd(new Date(year, month, day));
    }
  };

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd) {
      setIsDragging(false);
      const start = dragStart < dragEnd ? dragStart : dragEnd;
      const end = dragStart > dragEnd ? dragStart : dragEnd;
      const dates = eachDayOfInterval({ start, end });
      setSelectedDates(dates);
      
      const status = getDayStatus(start);
      setEditAvailable(status ? status.available : true);
      setEditPrice(status?.price ? String(status.price) : '');
    }
  }, [isDragging, dragStart, dragEnd]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleSave = async () => {
    if (selectedDates.length === 0 || !selectedProperty) return;
    setIsSaving(true);
    
    // Convert to contiguous regions or push individually. For simplicity, we just push the contiguous block.
    const start = selectedDates[0];
    const end = selectedDates[selectedDates.length - 1];

    try {
        const payload = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
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
            const rangeStart = new Date(payload.startDate);
            const rangeEnd = new Date(payload.endDate);
            const aStart = new Date(a.startDate);
            const aEnd = new Date(a.endDate);
            // Rough overlap check to remove old overridden dates
            return !(rangeEnd >= aStart && rangeStart <= aEnd);
        });
        setAvailability([...filtered, newEntry]);
        
        toast.success(`Updated ${selectedDates.length} days`);
        setSelectedDates([]);

    } catch (e) {
        toast.error("Failed to update availability");
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] bg-[#FDFDFD] px-4 py-2 relative overflow-hidden flex flex-col">
      <MaxWidthContainer className="flex-1 flex flex-col min-h-0 h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-2 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-midnight-navy mb-1 tracking-tight">
                Availability Calendar
            </h1>
            <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Select dates to adjust pricing or block availability.</p>
          </div>
          <div className="flex items-center gap-3">
              <button 
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-neutral-50 text-midnight-navy font-black text-[10px] uppercase tracking-widest transition-all border border-neutral-100 shadow-sm"
              >
                  Sync iCal
              </button>
              {properties.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="px-5 py-3 pr-10 rounded-2xl bg-[#0B1221] text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer shadow-lg border border-white/10"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                      <ChevronRight className="w-3 h-3 rotate-90" />
                  </div>
                </div>
              )}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <CalendarIcon className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-midnight-navy font-bold text-lg mb-2">No properties</h3>
            <p className="text-neutral-500 text-sm">Add a property first to manage its calendar.</p>
          </div>
        ) : (
          <div className="flex gap-8 flex-1 min-h-0 h-full pb-4">
            <div className={`flex-1 flex flex-col min-h-0 h-full transition-all duration-300 ${selectedDates.length > 0 ? 'pr-[340px]' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
                  <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm w-max">
                    <button onClick={prevMonth} className="p-2 rounded-lg text-neutral-500 hover:text-midnight-navy hover:bg-neutral-50 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-midnight-navy font-black text-lg min-w-[140px] text-center">{monthName}</h2>
                    <button onClick={nextMonth} className="p-2 rounded-lg text-neutral-500 hover:text-midnight-navy hover:bg-neutral-50 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                   {/* AI Smart Yield Toggle */}
                   <div className="flex items-center gap-4 bg-white border border-neutral-100 px-5 py-3 rounded-2xl shadow-soft group hover:border-[#4F46E5]/20 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                          <div className="bg-[#4F46E5] text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                             <Flame className="w-4 h-4" />
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-midnight-navy uppercase tracking-widest leading-none">Smart Yield</p>
                              <p className="text-[10px] text-neutral-400 mt-1 font-bold uppercase tracking-widest">Market Demand Active</p>
                          </div>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500 rounded-full ml-4 relative shadow-inner">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1 shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center text-neutral-400 text-[10px] font-bold py-1 uppercase tracking-tighter">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1 min-h-0 select-none overflow-hidden">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-full" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const status = getDayStatus(date);
                    const isToday = isSameDay(date, new Date());
                    const demand = getDemandScore(date);
                    
                    let isInDrag = false;
                    if (isDragging && dragStart && dragEnd) {
                        const start = dragStart < dragEnd ? dragStart : dragEnd;
                        const end = dragStart > dragEnd ? dragStart : dragEnd;
                        isInDrag = isWithinInterval(date, { start, end });
                    }
                    const isSelected = selectedDates.some(d => isSameDay(d, date)) || isInDrag;
                    
                    // Heatmap coloring
                    let bgClass = 'bg-white';
                    let textClass = 'text-midnight-navy';
                    let borderClass = 'border-neutral-200';
                    let labelClass = 'text-neutral-500';
                    
                    if (status && !status.available) {
                         bgClass = 'bg-neutral-50/50';
                         textClass = 'text-neutral-300 line-through';
                         borderClass = 'border-neutral-100';
                         labelClass = 'text-neutral-200';
                    } else if (status?.available !== false) {
                         if (demand === 'peak') { 
                            bgClass = 'bg-rose-50'; 
                            borderClass='border-rose-100'; 
                            textClass='text-rose-700';
                            labelClass='text-rose-500';
                         }
                         else if (demand === 'high') { 
                            bgClass = 'bg-amber-50'; 
                            borderClass='border-amber-100'; 
                            textClass='text-amber-700';
                            labelClass='text-amber-500';
                         }
                    }

                    if (isSelected) {
                        bgClass = 'bg-primary-600';
                        borderClass = 'border-primary-600 shadow-lg z-20 scale-[1.02]';
                        textClass = 'text-white';
                        labelClass = 'text-primary-100';
                    }

                    return (
                      <div
                        key={day}
                        onMouseDown={() => handleMouseDown(day)}
                        onMouseEnter={() => handleMouseEnter(day)}
                        className={`rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-xl hover:scale-[1.03] hover:z-30 relative group h-full ${bgClass} ${borderClass} ${textClass} ${isToday && !isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
                      >
                        <span className={`text-sm ${isSelected ? 'font-black' : 'font-bold'}`}>{day}</span>
                        {status?.price && status.available && (
                          <span className={`text-xs font-black mt-1 ${labelClass}`}>${status.price}</span>
                        )}
                        {!status?.price && status?.available !== false && demand === 'peak' && (
                           <Flame className="w-3 h-3 text-rose-400 absolute top-2 right-2 opacity-50" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-8 mt-4 justify-center bg-white border border-neutral-100 rounded-full py-2 px-8 w-max mx-auto shadow-sm shrink-0">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-rose-400" /> Peak
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-amber-400" /> High 
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-neutral-200" /> Unavailable
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    <div className="w-2 h-2 rounded-full bg-primary-500" /> Selected
                  </div>
                </div>
            </div>

            {/* Slide-over Menu for Editing */}
            {selectedDates.length > 0 && (
                <div className="fixed top-[73px] right-0 bottom-0 w-[340px] bg-white border-l border-neutral-200 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-40 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 ease-out flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-midnight-navy">Bulk Edit</h3>
                            <p className="text-sm font-medium text-primary-600 flex items-center gap-1">
                                <CalendarDays className="w-4 h-4" /> {selectedDates.length} Days Selected
                            </p>
                        </div>
                        <button onClick={() => setSelectedDates([])} className="p-2 bg-neutral-100 rounded-full text-neutral-400 hover:text-midnight-navy transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-8 flex-1">
                        {/* Selected Date Range Preview */}
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Date Range</p>
                            <p className="text-sm text-midnight-navy font-medium">
                                {format(selectedDates[0], 'MMM d, yyyy')} - {format(selectedDates[selectedDates.length - 1], 'MMM d, yyyy')}
                            </p>
                        </div>

                        {/* Availability Toggle */}
                        <div className="space-y-3">
                            <span className="text-sm font-bold text-midnight-navy">Status</span>
                            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                                <button 
                                  onClick={() => setEditAvailable(true)}
                                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${editAvailable ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                                >
                                    {editAvailable && <Check className="w-4 h-4" />} Open
                                </button>
                                <button 
                                  onClick={() => setEditAvailable(false)}
                                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!editAvailable ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                                >
                                    {!editAvailable && <Check className="w-4 h-4" />} Blocked
                                </button>
                            </div>
                        </div>

                        {/* Price Input */}
                        {editAvailable && (
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-midnight-navy flex items-center justify-between">
                                    Nightly Price
                                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded font-medium">Smart Demand: High</span>
                                </label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input 
                                      type="number" 
                                      value={editPrice}
                                      onChange={(e) => setEditPrice(e.target.value)}
                                      placeholder="Leave blank for base price"
                                      className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-12 pr-12 text-midnight-navy font-bold text-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all shadow-sm"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-bold">
                                        {currentProperty?.currency}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-neutral-100 mt-auto">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="w-full py-4 rounded-xl bg-midnight-navy text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                            Apply to {selectedDates.length} Days
                        </button>
                        <button onClick={() => setSelectedDates([])} className="w-full py-3 mt-2 text-sm font-bold text-neutral-500 hover:text-midnight-navy transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}
      </MaxWidthContainer>

      {isSyncModalOpen && selectedProperty && currentProperty && (
        <ICalSyncModal 
          propertyId={currentProperty.id}
          propertyName={currentProperty.name}
          onClose={() => setIsSyncModalOpen(false)}
          onSyncComplete={() => {
             setIsSyncModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
