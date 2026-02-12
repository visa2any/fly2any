'use client';

import { useState } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { ChevronLeft, ChevronRight, Loader2, DollarSign, X } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [properties] = useState([{ id: '1', name: 'Seaside Villa' }, { id: '2', name: 'Mountain Lodge' }]); // Mock properties selector
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0].id);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  // Mock pricing/availability data
  const getDayData = (date: Date) => {
    // In production, fetch this from API based on selectedPropertyId + date range
    const isBooked = isSameDay(date, new Date(2026, 1, 15)); // Example
    const price = 450; // Base price
    return { price, isBooked };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Calendar & Availability</h1>
            <p className="text-white/50 text-sm">Manage open dates and pricing.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm focus:outline-none focus:border-white/20"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-white"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-white"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold text-white/40 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, dayIdx) => {
              const { price, isBooked } = getDayData(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[120px] p-2 border-b border-r border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group
                    ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                    ${isSelected ? 'bg-white/[0.08] ring-1 ring-inset ring-amber-400' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-amber-400 text-black font-bold' : 'text-white/80'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {isBooked && (
                       <span className="w-2 h-2 rounded-full bg-red-400" title="Booked"></span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-white/60 font-medium">
                      ${price}
                    </div>
                    {isBooked && (
                      <div className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold truncate">
                        Booked
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
