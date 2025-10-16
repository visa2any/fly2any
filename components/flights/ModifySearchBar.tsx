'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Calendar, Users, Armchair, Edit3, Check, X, ChevronDown, Search } from 'lucide-react';
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface ModifySearchBarProps {
  // Current search params
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: PassengerCounts;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';

  // Optional
  lang?: 'en' | 'pt' | 'es';
  sticky?: boolean;
  onSearchUpdate?: () => void;
}

const content = {
  en: {
    modifySearch: 'Modify Search',
    search: 'Search',
    cancel: 'Cancel',
    save: 'Update',
    from: 'From',
    to: 'To',
    departure: 'Departure',
    return: 'Return',
    passengers: 'Passengers',
    class: 'Class',
    adult: 'Adult',
    adults: 'Adults',
    child: 'Child',
    children: 'Children',
    infant: 'Infant',
    infants: 'Infants',
    economy: 'Economy',
    premium: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    roundTrip: 'Round Trip',
    oneWay: 'One Way',
  },
  pt: {
    modifySearch: 'Modificar Busca',
    search: 'Buscar',
    cancel: 'Cancelar',
    save: 'Atualizar',
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Volta',
    passengers: 'Passageiros',
    class: 'Classe',
    adult: 'Adulto',
    adults: 'Adultos',
    child: 'Criança',
    children: 'Crianças',
    infant: 'Bebê',
    infants: 'Bebês',
    economy: 'Econômica',
    premium: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    roundTrip: 'Ida e Volta',
    oneWay: 'Só Ida',
  },
  es: {
    modifySearch: 'Modificar Búsqueda',
    search: 'Buscar',
    cancel: 'Cancelar',
    save: 'Actualizar',
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Vuelta',
    passengers: 'Pasajeros',
    class: 'Clase',
    adult: 'Adulto',
    adults: 'Adultos',
    child: 'Niño',
    children: 'Niños',
    infant: 'Bebé',
    infants: 'Bebés',
    economy: 'Económica',
    premium: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    roundTrip: 'Ida y Vuelta',
    oneWay: 'Solo Ida',
  },
};

const cabinClassMap = {
  economy: { en: 'Economy', pt: 'Econômica', es: 'Económica', short: 'Y' },
  premium: { en: 'Premium Eco', pt: 'Eco Premium', es: 'Eco Premium', short: 'W' },
  business: { en: 'Business', pt: 'Executiva', es: 'Ejecutiva', short: 'C' },
  first: { en: 'First', pt: 'Primeira', es: 'Primera', short: 'F' },
};

export default function ModifySearchBar({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers,
  cabinClass,
  lang = 'en',
  sticky = true,
  onSearchUpdate,
}: ModifySearchBarProps) {
  const router = useRouter();
  const t = content[lang];

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Form states
  const [editFrom, setEditFrom] = useState(origin);
  const [editTo, setEditTo] = useState(destination);
  const [editDeparture, setEditDeparture] = useState(departureDate);
  const [editReturn, setEditReturn] = useState(returnDate || '');
  const [editAdults, setEditAdults] = useState(passengers.adults);
  const [editChildren, setEditChildren] = useState(passengers.children);
  const [editInfants, setEditInfants] = useState(passengers.infants);
  const [editClass, setEditClass] = useState(cabinClass);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Reset form when props change
  useEffect(() => {
    setEditFrom(origin);
    setEditTo(destination);
    setEditDeparture(departureDate);
    setEditReturn(returnDate || '');
    setEditAdults(passengers.adults);
    setEditChildren(passengers.children);
    setEditInfants(passengers.infants);
    setEditClass(cabinClass);
  }, [origin, destination, departureDate, returnDate, passengers, cabinClass]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get passenger text
  const getPassengerText = () => {
    const parts: string[] = [];
    if (editAdults > 0) parts.push(`${editAdults}A`);
    if (editChildren > 0) parts.push(`${editChildren}C`);
    if (editInfants > 0) parts.push(`${editInfants}I`);
    return parts.join(' ');
  };

  const getTotalPassengers = () => editAdults + editChildren + editInfants;

  // Extract airport code
  const extractAirportCode = (value: string): string => {
    if (!value) return '';
    const trimmed = value.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/^([A-Z]{3})/);
    return match ? match[1] : trimmed;
  };

  // Handle search update
  const handleSearch = () => {
    setIsSearching(true);

    const originCode = extractAirportCode(editFrom);
    const destinationCode = extractAirportCode(editTo);

    if (!originCode || !destinationCode || !editDeparture) {
      alert('Please fill in all required fields');
      setIsSearching(false);
      return;
    }

    const params = new URLSearchParams({
      from: originCode,
      to: destinationCode,
      departure: editDeparture,
      adults: editAdults.toString(),
      children: editChildren.toString(),
      infants: editInfants.toString(),
      class: editClass.toLowerCase(),
    });

    if (editReturn) {
      params.append('return', editReturn);
    }

    router.push(`/flights/results?${params.toString()}`);

    if (onSearchUpdate) {
      onSearchUpdate();
    }
  };

  const handleCancel = () => {
    setEditFrom(origin);
    setEditTo(destination);
    setEditDeparture(departureDate);
    setEditReturn(returnDate || '');
    setEditAdults(passengers.adults);
    setEditChildren(passengers.children);
    setEditInfants(passengers.infants);
    setEditClass(cabinClass);
    setIsEditing(false);
  };

  const stickyClasses = sticky ? 'sticky top-0 z-50' : '';

  return (
    <div className={`${stickyClasses} bg-white/95 backdrop-blur-xl border-b-2 border-gray-200/50 shadow-lg transition-all duration-300`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* COMPACT VIEW - Not Editing */}
        {!isEditing && (
          <div className="py-2.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-3 flex-wrap">

              {/* Left: Search Summary - Ultra Compact */}
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                {/* Route */}
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary-50 to-blue-50 px-2.5 py-1.5 rounded-lg border border-primary-200/50 shadow-sm">
                  <Plane className="w-3.5 h-3.5 text-primary-600 transform rotate-45" />
                  <span className="font-bold text-gray-900 text-sm">{origin}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-bold text-gray-900 text-sm">{destination}</span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1 bg-white/60 px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    {formatDate(departureDate)}
                    {returnDate && <> • {formatDate(returnDate)}</>}
                  </span>
                </div>

                {/* Passengers */}
                <div className="flex items-center gap-1 bg-white/60 px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    {getTotalPassengers()} pax
                  </span>
                </div>

                {/* Class */}
                <div className="flex items-center gap-1 bg-white/60 px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <Armchair className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    {cabinClassMap[cabinClass][lang]}
                  </span>
                </div>
              </div>

              {/* Right: Edit Button - Compact */}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md text-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.modifySearch}</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>
          </div>
        )}

        {/* EDIT VIEW - Expanded Inline Form */}
        {isEditing && (
          <div className="py-3 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">

              {/* From Airport */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.from}
                </label>
                <AirportAutocomplete
                  label=""
                  placeholder="JFK"
                  value={editFrom}
                  onChange={setEditFrom}
                  icon={<Plane className="w-4 h-4 text-primary-600" />}
                />
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex md:col-span-auto items-end pb-2">
                <button
                  onClick={() => {
                    const temp = editFrom;
                    setEditFrom(editTo);
                    setEditTo(temp);
                  }}
                  className="p-2 bg-gray-100 hover:bg-primary-50 rounded-lg transition-colors group"
                  title="Swap airports"
                >
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* To Airport */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.to}
                </label>
                <AirportAutocomplete
                  label=""
                  placeholder="LAX"
                  value={editTo}
                  onChange={setEditTo}
                  icon={<Plane className="w-4 h-4 text-secondary-600 transform rotate-180" />}
                />
              </div>

              {/* Departure Date */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.departure}
                </label>
                <input
                  type="date"
                  value={editDeparture}
                  onChange={(e) => setEditDeparture(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Return Date */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.return}
                </label>
                <input
                  type="date"
                  value={editReturn}
                  onChange={(e) => setEditReturn(e.target.value)}
                  min={editDeparture || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="One way"
                />
              </div>

              {/* Passengers Dropdown */}
              <div className="md:col-span-2 relative">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.passengers}
                </label>
                <button
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 hover:border-primary-300 focus:border-primary-500 focus:outline-none transition-colors text-left flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">{getTotalPassengers()}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Passenger Dropdown Panel */}
                {showPassengerDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border-2 border-primary-200 shadow-xl z-50 p-3 space-y-3 animate-slideDown">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{t.adults}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditAdults(Math.max(1, editAdults - 1))}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">{editAdults}</span>
                        <button
                          onClick={() => setEditAdults(Math.min(9, editAdults + 1))}
                          className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{t.children}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditChildren(Math.max(0, editChildren - 1))}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">{editChildren}</span>
                        <button
                          onClick={() => setEditChildren(Math.min(9, editChildren + 1))}
                          className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{t.infants}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditInfants(Math.max(0, editInfants - 1))}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">{editInfants}</span>
                        <button
                          onClick={() => setEditInfants(Math.min(editAdults, editInfants + 1))}
                          className="w-7 h-7 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Done Button */}
                    <button
                      onClick={() => setShowPassengerDropdown(false)}
                      className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Class */}
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  {t.class}
                </label>
                <select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="economy">{cabinClassMap.economy[lang]}</option>
                  <option value="premium">{cabinClassMap.premium[lang]}</option>
                  <option value="business">{cabinClassMap.business[lang]}</option>
                  <option value="first">{cabinClassMap.first[lang]}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-1 flex gap-1">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-1"
                  title={t.cancel}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  title={t.search}
                >
                  {isSearching ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Helper Text */}
            <div className="mt-2 text-center">
              <p className="text-[10px] text-gray-500">
                💡 <span className="font-semibold">Quick tip:</span> Use Tab to navigate between fields
              </p>
            </div>
          </div>
        )}

        {/* Click outside to close passenger dropdown */}
        {showPassengerDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPassengerDropdown(false)}
          />
        )}
      </div>
    </div>
  );
}
