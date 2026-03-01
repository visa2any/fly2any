'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X, Check,
  DollarSign, Flame, CalendarDays, RotateCcw, Lock, Sun
} from 'lucide-react';
import {
  format, subMonths, addMonths, eachDayOfInterval, isWithinInterval,
  isSameDay, startOfMonth, endOfMonth
} from 'date-fns';
import { toast } from 'react-hot-toast';
import { ICalSyncModal } from './components/ICalSyncModal';

interface PropertyOption { id: string; name: string; currency: string; basePricePerNight?: number; }
interface AvailabilityEntry {
  id: string; startDate: string; endDate: string;
  available: boolean; customPrice: number | null; notes: string | null;
}

export default function CalendarPage() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [demandMap, setDemandMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMonths, setViewMonths] = useState<1 | 2>(1);

  // Drag selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Edit panel
  const [editPrice, setEditPrice] = useState<string>('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Undo
  const [lastAction, setLastAction] = useState<{ data: AvailabilityEntry[]; label: string } | null>(null);
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load properties
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/properties/dashboard');
        if (res.ok) {
          const json = await res.json();
          const props = (json.data?.properties || []).map((p: any) => ({
            id: p.id, name: p.name, currency: p.currency || 'USD',
            basePricePerNight: p.basePricePerNight
          }));
          setProperties(props);
          if (props.length > 0) setSelectedProperty(props[0].id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  // Load availability + demand
  useEffect(() => {
    if (!selectedProperty) return;
    async function load() {
      try {
        const [availRes, demandRes] = await Promise.all([
          fetch(`/api/properties/${selectedProperty}/availability`),
          fetch(`/api/properties/${selectedProperty}/demand`)
        ]);
        if (availRes.ok) setAvailability((await availRes.json()).data || []);
        if (demandRes.ok) setDemandMap((await demandRes.json()).data || {});
      } catch (e) { console.error('Calendar load failed', e); }
    }
    load();
  }, [selectedProperty]);

  // Keyboard: Esc = clear, ←→ = navigate months
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedDates([]); return; }
      if ((e.target as HTMLElement)?.matches('input,textarea,select')) return;
      if (e.key === 'ArrowLeft') setCurrentDate(d => subMonths(d, 1));
      if (e.key === 'ArrowRight') setCurrentDate(d => addMonths(d, 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const getDayStatus = useCallback((date: Date) => {
    for (const entry of availability) {
      const s = new Date(entry.startDate); s.setHours(0,0,0,0);
      const e = new Date(entry.endDate); e.setHours(23,59,59,999);
      if (date >= s && date <= e) return { available: entry.available, price: entry.customPrice };
    }
    return null;
  }, [availability]);

  const getDemandScore = (date: Date) => demandMap[format(date, 'yyyy-MM-dd')] || 'normal';

  const currentProperty = properties.find(p => p.id === selectedProperty);
  const basePrice = currentProperty?.basePricePerNight || 0;

  // Month revenue stats
  const stats = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    let blocked = 0, revenue = 0;
    days.forEach(day => {
      const s = getDayStatus(day);
      if (s && !s.available) blocked++;
      else revenue += s?.price ?? basePrice;
    });
    const total = days.length;
    const avail = total - blocked;
    return {
      occupancyRate: total ? Math.round((blocked / total) * 100) : 0,
      projectedRevenue: Math.round(revenue),
      avgNightly: avail > 0 ? Math.round(revenue / avail) : 0,
      availableDays: avail,
    };
  }, [currentDate, getDayStatus, basePrice]);

  // Drag handlers
  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
    setSelectedDates([]);
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging) setDragEnd(date);
  };

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) return;
    setIsDragging(false);
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart > dragEnd ? dragStart : dragEnd;
    const dates = eachDayOfInterval({ start, end });
    setSelectedDates(dates);
    const s = getDayStatus(start);
    setEditAvailable(s ? s.available : true);
    setEditPrice(s?.price ? String(s.price) : '');
    setEditNotes('');
  }, [isDragging, dragStart, dragEnd, getDayStatus]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseUp]);

  const handleSave = async () => {
    if (!selectedDates.length || !selectedProperty) return;
    setIsSaving(true);
    const prevAvail = [...availability];
    try {
      const payload = {
        startDate: selectedDates[0].toISOString(),
        endDate: selectedDates[selectedDates.length - 1].toISOString(),
        available: editAvailable,
        price: editPrice ? parseFloat(editPrice) : null,
        notes: editNotes || null,
      };
      const res = await fetch(`/api/properties/${selectedProperty}/availability`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');

      const newEntry: AvailabilityEntry = {
        id: 'temp-' + Date.now(), startDate: payload.startDate, endDate: payload.endDate,
        available: payload.available, customPrice: payload.price, notes: payload.notes
      };
      const filtered = availability.filter(a => {
        const rs = new Date(payload.startDate), re = new Date(payload.endDate);
        const as = new Date(a.startDate), ae = new Date(a.endDate);
        return !(re >= as && rs <= ae);
      });
      setAvailability([...filtered, newEntry]);

      // Undo setup
      setLastAction({ data: prevAvail, label: `${selectedDates.length} days` });
      if (undoRef.current) clearTimeout(undoRef.current);
      undoRef.current = setTimeout(() => setLastAction(null), 8000);

      const label = !editAvailable ? 'Blocked' : editPrice ? `Priced at $${editPrice}` : 'Opened';
      toast.success(`${label} · ${selectedDates.length} days`, {
        style: { borderRadius: '12px', background: '#0A0A0A', color: '#fff', fontSize: '13px' }
      });
      setSelectedDates([]);
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleUndo = () => {
    if (!lastAction) return;
    setAvailability(lastAction.data);
    setLastAction(null);
    if (undoRef.current) clearTimeout(undoRef.current);
    toast.success('Reverted', { style: { borderRadius: '12px' } });
  };

  const applyPreset = (mult: number) => {
    setEditPrice(basePrice > 0 ? String(Math.round(basePrice * mult)) : '');
    setEditAvailable(true);
  };

  // Render one calendar month
  const renderMonth = (monthDate: Date, showNav: boolean) => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDow = new Date(y, m, 1).getDay();
    const today = new Date(); today.setHours(0,0,0,0);

    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-3 shrink-0 h-9">
          {showNav ? (
            <div className="flex items-center gap-2 bg-white p-0.5 rounded-xl border border-neutral-200 shadow-sm">
              <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0A0A0A] hover:bg-neutral-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[#0A0A0A] font-black text-sm min-w-[130px] text-center">{format(monthDate, 'MMMM yyyy')}</span>
              <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0A0A0A] hover:bg-neutral-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-[#0A0A0A] font-black text-sm w-full text-center block">{format(monthDate, 'MMMM yyyy')}</span>
          )}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1 shrink-0">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-neutral-300 text-[9px] font-bold uppercase tracking-tight">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 auto-rows-fr gap-1 flex-1 min-h-0 select-none overflow-hidden">
          {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(y, m, day);
            const status = getDayStatus(date);
            const isToday = isSameDay(date, new Date());
            const demand = getDemandScore(date);
            const isPast = date < today;

            let isInDrag = false;
            if (isDragging && dragStart && dragEnd) {
              const ds = dragStart < dragEnd ? dragStart : dragEnd;
              const de = dragStart > dragEnd ? dragStart : dragEnd;
              isInDrag = isWithinInterval(date, { start: ds, end: de });
            }
            const isSelected = selectedDates.some(d => isSameDay(d, date)) || isInDrag;

            // Styling logic
            let bg = 'bg-white', text = 'text-[#0A0A0A]', border = 'border-neutral-100', priceText = 'text-neutral-400';
            if (status && !status.available) {
              // Striped pattern for blocked dates
              bg = '[background:repeating-linear-gradient(45deg,#fafafa,#fafafa_4px,#f4f4f4_4px,#f4f4f4_8px)]';
              text = 'text-neutral-300'; border = 'border-neutral-100'; priceText = 'text-neutral-200';
            } else if (!isPast) {
              if (demand === 'peak') { bg = 'bg-rose-50'; border = 'border-rose-100'; text = 'text-rose-700'; priceText = 'text-rose-400'; }
              else if (demand === 'high') { bg = 'bg-amber-50'; border = 'border-amber-100'; text = 'text-amber-700'; priceText = 'text-amber-400'; }
            }
            if (isPast && !(status && !status.available)) { text = 'text-neutral-300'; }
            if (isSelected) { bg = 'bg-primary-500'; border = 'border-primary-500'; text = 'text-white'; priceText = 'text-primary-200'; }

            return (
              <div
                key={day}
                onMouseDown={() => !isPast && handleMouseDown(date)}
                onMouseEnter={() => !isPast && handleMouseEnter(date)}
                onTouchStart={(e) => { if (!isPast) { e.preventDefault(); handleMouseDown(date); } }}
                className={`rounded-xl border flex flex-col items-center justify-center relative h-full ${bg} ${border} ${text} ${
                  isPast ? 'cursor-default opacity-40' : 'cursor-pointer hover:shadow-md hover:scale-[1.05] hover:z-20 active:scale-[0.98]'
                } ${isSelected ? 'scale-[1.05] shadow-md z-20' : ''} ${isToday && !isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''} transition-all duration-100`}
              >
                <span className={`text-xs leading-none ${isSelected ? 'font-black' : 'font-bold'}`}>{day}</span>
                {status?.price && status.available && !isPast && (
                  <span className={`text-[9px] font-black mt-0.5 ${priceText}`}>${status.price}</span>
                )}
                {!status?.price && demand === 'peak' && !isPast && status?.available !== false && (
                  <Flame className="w-2.5 h-2.5 text-rose-400 mt-0.5 opacity-50" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] bg-[#FDFDFD] flex flex-col overflow-hidden">
      <MaxWidthContainer className="flex-1 flex flex-col min-h-0 py-4 px-4">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">Availability Calendar</h1>
            <p className="text-neutral-400 text-[10px] font-bold mt-0.5 tracking-wide">
              Drag to select &middot;&nbsp;
              <kbd className="bg-neutral-100 px-1 py-0.5 rounded text-[9px] font-mono">←→</kbd> navigate &middot;&nbsp;
              <kbd className="bg-neutral-100 px-1 py-0.5 rounded text-[9px] font-mono">Esc</kbd> clear
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMonths(v => v === 1 ? 2 : 1)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                viewMonths === 2 ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {viewMonths === 1 ? '2-Month' : '1-Month'}
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white text-[#0A0A0A] font-black text-[10px] uppercase tracking-widest border border-neutral-200 hover:border-neutral-300 transition-all"
            >
              Sync iCal
            </button>
            {properties.length > 0 && (
              <div className="relative">
                <select
                  value={selectedProperty}
                  onChange={e => setSelectedProperty(e.target.value)}
                  className="px-4 py-2 pr-8 rounded-xl bg-[#0A0A0A] text-white text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer border border-white/10"
                >
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 pointer-events-none rotate-90" />
              </div>
            )}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <CalendarIcon className="w-12 h-12 text-neutral-300 mb-4" />
            <h3 className="text-[#0A0A0A] font-bold text-lg mb-2">No properties yet</h3>
            <p className="text-neutral-500 text-sm">Add a property first to manage its calendar.</p>
          </div>
        ) : (
          <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">

            {/* Main Column */}
            <div className={`flex flex-col min-h-0 flex-1 transition-all duration-300 ${selectedDates.length > 0 ? 'mr-[360px]' : ''}`}>

              {/* Revenue Stats Bar */}
              <div className="grid grid-cols-4 gap-3 mb-4 shrink-0">
                <div className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Occupancy</p>
                  <span className="text-xl font-black text-[#0A0A0A]">{stats.occupancyRate}%</span>
                  <div className="mt-1.5 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-700"
                      style={{ width: `${stats.occupancyRate}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Proj. Revenue</p>
                  <span className="text-xl font-black text-emerald-600">${stats.projectedRevenue.toLocaleString()}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Avg / Night</p>
                  <span className="text-xl font-black text-[#0A0A0A]">${stats.avgNightly}</span>
                </div>
                <div className="bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">Open Days</p>
                  <span className="text-xl font-black text-[#0A0A0A]">{stats.availableDays}</span>
                </div>
              </div>

              {/* Toolbar: Smart Yield + Legend */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2 bg-white border border-neutral-100 px-3 py-1.5 rounded-xl shadow-sm">
                  <div className="bg-[#4F46E5] text-white p-1 rounded-lg">
                    <Flame className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-black text-[#0A0A0A] uppercase tracking-widest">Smart Yield Active</span>
                  <div className="w-7 h-3.5 bg-emerald-500 rounded-full relative ml-1">
                    <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-300 inline-block" />Peak</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />High</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[repeating-linear-gradient(45deg,#e5e5e5,#e5e5e5_2px,#fafafa_2px,#fafafa_4px)] inline-block" />Blocked</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />Selected</span>
                </div>
              </div>

              {/* Calendar Grid(s) */}
              <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0">
                  {renderMonth(currentDate, true)}
                </div>
                {viewMonths === 2 && (
                  <div className="flex-1 flex flex-col min-h-0 border-l border-neutral-100 pl-6">
                    {renderMonth(addMonths(currentDate, 1), false)}
                  </div>
                )}
              </div>

              {/* Undo Bar */}
              {lastAction && (
                <div className="shrink-0 mt-3 flex items-center justify-between px-4 py-2.5 bg-[#0A0A0A] text-white rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                  <span className="text-xs font-bold">Updated {lastAction.label}</span>
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 text-xs font-black text-primary-300 hover:text-primary-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Undo
                  </button>
                </div>
              )}
            </div>

            {/* Edit Slide-over Panel */}
            {selectedDates.length > 0 && (
              <div className="fixed top-[73px] right-0 bottom-0 w-[360px] bg-white border-l border-neutral-100 shadow-[-8px_0_24px_rgba(0,0,0,0.05)] z-40 flex flex-col animate-in slide-in-from-right duration-250 ease-out">

                {/* Panel Header */}
                <div className="px-6 py-4 border-b border-neutral-100 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#0A0A0A]">Edit Dates</h3>
                      <p className="text-xs font-bold text-primary-500 flex items-center gap-1 mt-0.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {selectedDates.length} days &middot; {format(selectedDates[0], 'MMM d')}–{format(selectedDates[selectedDates.length - 1], 'MMM d')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDates([])}
                      className="p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-[#0A0A0A] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                  {/* Availability Toggle */}
                  <div>
                    <p className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest mb-2">Availability</p>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-50 rounded-xl border border-neutral-100">
                      <button
                        onClick={() => setEditAvailable(true)}
                        className={`py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${editAvailable ? 'bg-white text-emerald-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Open
                      </button>
                      <button
                        onClick={() => setEditAvailable(false)}
                        className={`py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${!editAvailable ? 'bg-white text-red-500 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                      >
                        <Lock className="w-3.5 h-3.5" /> Block
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  {editAvailable && (
                    <div>
                      <p className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest mb-2">Quick Presets</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Base', mult: 1, cls: 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300' },
                          { label: 'Weekend', mult: 1.2, cls: 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300' },
                          { label: 'Peak', mult: 1.5, cls: 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300' },
                        ].map(({ label, mult, cls }) => (
                          <button
                            key={label}
                            onClick={() => applyPreset(mult)}
                            disabled={!basePrice}
                            className={`py-2 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all disabled:opacity-40 ${cls}`}
                          >
                            {label}
                            {basePrice > 0 && (
                              <span className="block text-[9px] font-bold mt-0.5 opacity-70">
                                ${Math.round(basePrice * mult)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Input */}
                  {editAvailable && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest">Price / Night</p>
                        {editPrice && (
                          <button
                            onClick={() => setEditPrice('')}
                            className="text-[9px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-wider transition-colors"
                          >
                            Reset to Base
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          placeholder={basePrice ? `Base: $${basePrice}` : 'Set custom price...'}
                          className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-10 pr-16 text-[#0A0A0A] font-bold text-base focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-bold">
                          {currentProperty?.currency || 'USD'}
                        </span>
                      </div>
                      {editPrice && basePrice > 0 && (
                        <p className="text-[10px] text-neutral-400 font-bold mt-1.5">
                          {((parseFloat(editPrice) / basePrice - 1) * 100).toFixed(0)}%&nbsp;
                          {parseFloat(editPrice) >= basePrice ? 'above' : 'below'} base price
                        </p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <p className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest mb-2">
                      Notes <span className="text-neutral-400 normal-case font-medium text-[10px]">(optional)</span>
                    </p>
                    <textarea
                      value={editNotes}
                      onChange={e => setEditNotes(e.target.value)}
                      placeholder={!editAvailable ? 'e.g. Personal use, Maintenance...' : 'e.g. High season pricing...'}
                      rows={2}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 px-3 text-[#0A0A0A] text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Revenue Projection */}
                  {editAvailable && editPrice && parseFloat(editPrice) > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Selection Revenue</p>
                      <p className="text-2xl font-black text-emerald-700">
                        ${(parseFloat(editPrice) * selectedDates.length).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        {selectedDates.length} nights × ${editPrice}
                      </p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="px-6 py-4 border-t border-neutral-100 shrink-0">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-2xl bg-[#0A0A0A] text-white font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Apply to {selectedDates.length} Days
                  </button>
                  <button
                    onClick={() => setSelectedDates([])}
                    className="w-full py-2.5 mt-1 text-xs font-bold text-neutral-400 hover:text-[#0A0A0A] transition-colors"
                  >
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
          onSyncComplete={() => setIsSyncModalOpen(false)}
        />
      )}
    </div>
  );
}
