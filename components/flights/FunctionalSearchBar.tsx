'use client';

import { useState, useRef, useEffect } from 'react';
import { Plane, Calendar, Users, ChevronDown, Minus, Plus, Search } from 'lucide-react';
import { typography, spacing, layout, dimensions } from '@/lib/design-system';
import { useRouter } from 'next/navigation';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface FunctionalSearchBarProps {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    from: 'From',
    to: 'To',
    depart: 'Depart',
    return: 'Return',
    travelers: 'Travelers',
    class: 'Class',
    search: 'Search',
    oneWay: 'One-way',
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    economy: 'Economy',
    premium: 'Premium',
    business: 'Business',
    first: 'First',
    done: 'Done',
  },
  pt: {
    from: 'De',
    to: 'Para',
    depart: 'Ida',
    return: 'Volta',
    travelers: 'Viajantes',
    class: 'Classe',
    search: 'Buscar',
    oneWay: 'Só ida',
    adults: 'Adultos',
    children: 'Crianças',
    infants: 'Bebês',
    economy: 'Econômica',
    premium: 'Premium',
    business: 'Executiva',
    first: 'Primeira',
    done: 'Pronto',
  },
  es: {
    from: 'Desde',
    to: 'Hasta',
    depart: 'Salida',
    return: 'Regreso',
    travelers: 'Viajeros',
    class: 'Clase',
    search: 'Buscar',
    oneWay: 'Solo ida',
    adults: 'Adultos',
    children: 'Niños',
    infants: 'Bebés',
    economy: 'Económica',
    premium: 'Premium',
    business: 'Ejecutiva',
    first: 'Primera',
    done: 'Listo',
  },
};

export default function FunctionalSearchBar({
  origin: initialOrigin,
  destination: initialDestination,
  departureDate: initialDepartureDate,
  returnDate: initialReturnDate,
  passengers: initialPassengers,
  cabinClass: initialCabinClass,
  lang = 'en',
}: FunctionalSearchBarProps) {
  const t = content[lang];
  const router = useRouter();

  // Form state
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departureDate, setDepartureDate] = useState(initialDepartureDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate || '');
  const [passengers, setPassengers] = useState(initialPassengers);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);

  // UI state
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
      if (classRef.current && !classRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setPassengers(prev => {
      const newValue = Math.max(type === 'adults' ? 1 : 0, prev[type] + delta);
      return { ...prev, [type]: newValue };
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      departure: formatDateForInput(departureDate),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
      class: cabinClass,
    });

    if (returnDate) {
      params.append('return', formatDateForInput(returnDate));
    }

    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Container with max-width matching results page (Priceline-style) */}
      <div
        className="mx-auto"
        style={{
          maxWidth: layout.container.maxWidth,
          padding: layout.container.padding.desktop,
        }}
      >
        {/* Desktop: ONE LINE layout (Priceline style) */}
        <div
          className="hidden lg:flex items-center"
          style={{
            height: layout.searchBar.height,
            gap: layout.searchBar.gap,
          }}
        >
          {/* From/To Route Combo */}
          <div
            className="flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all"
            style={{ padding: '8px 12px', gap: spacing.sm }}
          >
            <Plane className="text-gray-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              className="w-16 font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-center placeholder-gray-400"
              style={{ fontSize: typography.body.md.size }}
              placeholder="JFK"
              maxLength={3}
            />
            <svg
              className="text-gray-400 flex-shrink-0"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="w-16 font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-center placeholder-gray-400"
              style={{ fontSize: typography.body.md.size }}
              placeholder="LAX"
              maxLength={3}
            />
          </div>

          {/* Depart Date */}
          <div
            className="flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all cursor-pointer"
            style={{ padding: '8px 12px', gap: spacing.sm }}
          >
            <Calendar className="text-gray-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            <input
              type="date"
              value={formatDateForInput(departureDate)}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer"
              style={{ fontSize: typography.body.md.size, width: '120px' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Return Date */}
          <div
            className="flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all cursor-pointer"
            style={{ padding: '8px 12px', gap: spacing.sm }}
          >
            <Calendar className="text-gray-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
            <input
              type="date"
              value={formatDateForInput(returnDate)}
              onChange={(e) => setReturnDate(e.target.value)}
              className="font-semibold text-gray-900 bg-transparent border-none outline-none cursor-pointer"
              style={{ fontSize: typography.body.md.size, width: '120px' }}
              min={formatDateForInput(departureDate)}
              placeholder={t.oneWay}
            />
          </div>

          {/* Travelers Dropdown */}
          <div ref={passengerRef} className="relative">
            <button
              onClick={() => {
                setShowPassengerDropdown(!showPassengerDropdown);
                setShowClassDropdown(false);
              }}
              className="flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
              style={{ padding: '8px 12px', gap: spacing.sm, minWidth: '130px' }}
            >
              <Users className="text-gray-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
              <span className="font-semibold text-gray-900 whitespace-nowrap" style={{ fontSize: typography.body.md.size }}>
                {totalPassengers} {totalPassengers === 1 ? 'Guest' : 'Guests'}
              </span>
              <ChevronDown className="text-gray-400 flex-shrink-0 ml-auto" style={{ width: '16px', height: '16px' }} />
            </button>

            {showPassengerDropdown && (
              <div
                className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
                style={{ width: '280px', padding: spacing.lg }}
              >
                {/* Adults */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontSize: typography.body.md.size }}>
                      {t.adults}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: typography.body.sm.size }}>
                      18+ years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('adults', -1)}
                      disabled={passengers.adults <= 1}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900" style={{ fontSize: typography.body.lg.size }}>
                      {passengers.adults}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('adults', 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontSize: typography.body.md.size }}>
                      {t.children}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: typography.body.sm.size }}>
                      2-17 years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('children', -1)}
                      disabled={passengers.children <= 0}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900" style={{ fontSize: typography.body.lg.size }}>
                      {passengers.children}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('children', 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-semibold text-gray-900" style={{ fontSize: typography.body.md.size }}>
                      {t.infants}
                    </div>
                    <div className="text-gray-500" style={{ fontSize: typography.body.sm.size }}>
                      Under 2 years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('infants', -1)}
                      disabled={passengers.infants <= 0}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900" style={{ fontSize: typography.body.lg.size }}>
                      {passengers.infants}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('infants', 1)}
                      className="w-9 h-9 rounded-full border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center text-gray-700 hover:text-primary-500 font-bold transition-colors"
                      style={{ fontSize: typography.h4.size }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Done Button */}
                <button
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
                  style={{ fontSize: typography.body.md.size }}
                >
                  {t.done}
                </button>
              </div>
            )}
          </div>

          {/* Class Dropdown */}
          <div ref={classRef} className="relative">
            <button
              onClick={() => {
                setShowClassDropdown(!showClassDropdown);
                setShowPassengerDropdown(false);
              }}
              className="flex items-center bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
              style={{ padding: '8px 12px', gap: spacing.sm, minWidth: '150px' }}
            >
              <span className="font-semibold text-gray-900 whitespace-nowrap capitalize" style={{ fontSize: typography.body.md.size }}>
                {t[cabinClass]}
              </span>
              <ChevronDown className="text-gray-400 flex-shrink-0 ml-auto" style={{ width: '16px', height: '16px' }} />
            </button>

            {showClassDropdown && (
              <div
                className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
                style={{ minWidth: '200px', padding: spacing.sm }}
              >
                {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      setCabinClass(cls);
                      setShowClassDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                      cabinClass === cls
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={{ fontSize: typography.body.md.size }}
                  >
                    {t[cls]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex-shrink-0"
            style={{ padding: '12px 32px', fontSize: typography.body.md.size }}
          >
            {t.search}
          </button>
        </div>

        {/* Mobile/Tablet: Compact stacked layout */}
        <div className="lg:hidden space-y-2">
          {/* Route */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{t.from}</div>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="w-full font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-sm"
                placeholder="JFK"
                maxLength={3}
              />
            </div>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{t.to}</div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="w-full font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-sm"
                placeholder="LAX"
                maxLength={3}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{t.depart}</div>
              <input
                type="date"
                value={formatDateForInput(departureDate)}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{returnDate ? t.return : t.oneWay}</div>
              <input
                type="date"
                value={formatDateForInput(returnDate)}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full font-semibold text-gray-900 bg-transparent border-none outline-none p-0 text-sm"
                min={formatDateForInput(departureDate)}
              />
            </div>
          </div>

          {/* Travelers, Class, Search */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{t.travelers}</div>
              <div className="font-semibold text-gray-900 text-sm">{totalPassengers}</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="text-gray-500 text-xs">{t.class}</div>
              <div className="font-semibold text-gray-900 text-sm capitalize">{t[cabinClass]}</div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold rounded-lg shadow-md text-sm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
