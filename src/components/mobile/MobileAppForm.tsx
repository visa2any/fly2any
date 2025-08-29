'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed useMobileUtils import to fix React hook rule violations
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass } from '@/types/flights';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import { CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';

interface MobileAppFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  initialData?: Partial<FlightSearchFormData>;
  isLoading?: boolean;
  className?: string;
}

const TRIP_TYPES = [
  { value: 'round-trip', label: 'Ida e volta', icon: '↔️' },
  { value: 'one-way', label: 'Somente ida', icon: '→' },
  { value: 'multi-city', label: 'Múltiplas cidades', icon: '🌐' }
];

const TRAVEL_CLASSES = [
  { value: 'ECONOMY', label: 'Econômica', short: 'Eco' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium', short: 'Premium' },
  { value: 'BUSINESS', label: 'Executiva', short: 'Exec' },
  { value: 'FIRST', label: 'Primeira', short: '1st' }
];

export default function MobileAppForm({
  onSearch,
  initialData,
  isLoading = false,
  className = ''
}: MobileAppFormProps) {
  // Mobile components assume mobile context - removed mobile detection hook

  // Ensure valid dates
  const getValidDate = (date?: Date | string | null) => {
    if (!date) return new Date();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Form state with safe date initialization
  const [formData, setFormData] = useState<FlightSearchFormData>(() => {
    const baseData = {
      tripType: 'round-trip' as const,
      origin: null,
      destination: null,
      departureDate: new Date(),
      returnDate: new Date(Date.now() + 86400000),
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'ECONOMY' as TravelClass,
      preferences: {
        nonStop: false,
        flexibleDates: { enabled: false, days: 2 },
        preferredAirlines: []
      }
    };
    
    if (initialData) {
      return {
        ...baseData,
        ...initialData,
        departureDate: getValidDate(initialData.departureDate) || baseData.departureDate,
        returnDate: getValidDate(initialData.returnDate) || baseData.returnDate
      };
    }
    
    return baseData;
  });

  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const touchTargetSize = 48; // Mobile touch target size

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Data';
    try {
      const validDate = date instanceof Date ? date : new Date(date);
      if (isNaN(validDate.getTime())) return 'Data';
      return new Intl.DateFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }).format(validDate);
    } catch (error) {
      return 'Data';
    }
  };

  const getTotalPassengers = () => {
    const { adults, children, infants } = formData.passengers;
    return adults + children + infants;
  };

  const updatePassenger = (type: keyof PassengerCounts, increment: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1))
      }
    }));
  };

  const handleSearch = () => {
    if (getTotalPassengers() === 0) {
      alert('Selecione pelo menos um passageiro');
      return;
    }
    if (!formData.origin?.iataCode || !formData.destination?.iataCode) {
      alert('Selecione origem e destino');
      return;
    }
    onSearch(formData);
  };

  const swapLocations = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setFormData((prev: any) => ({
        ...prev,
        origin: prev.destination,
        destination: prev.origin
      }));
      setIsSwapping(false);
    }, 150);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* App-Style Form Container */}
      <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
        
        {/* Trip Type Pills */}
        <div className="flex gap-1">
          {TRIP_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFormData((prev: any) => ({ ...prev, tripType: type.value }))}
              className={`
                flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                ${formData.tripType === type.value
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              style={{ minHeight: '36px' }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm">{type.icon}</span>
                <span className="hidden sm:inline">{type.label}</span>
                <span className="sm:hidden">{type.value === 'round-trip' ? 'I&V' : type.value === 'one-way' ? 'Ida' : 'Multi'}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Route Selection */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="relative">
            {/* From/To Row */}
            <div className="flex items-center gap-2">
              {/* From */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">De</div>
                <AirportAutocomplete
                  value={formData.origin}
                  onChange={(airport) => setFormData((prev: any) => ({ ...prev, origin: airport }))}
                  placeholder="Origem"
                  className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                />
              </div>

              {/* Swap Button */}
              <button
                onClick={swapLocations}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors mt-5"
                style={{ minHeight: touchTargetSize, minWidth: touchTargetSize }}
              >
                <motion.div
                  animate={{ rotate: isSwapping ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SwitchIcon className="w-5 h-5" />
                </motion.div>
              </button>

              {/* To */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Para</div>
                <AirportAutocomplete
                  value={formData.destination}
                  onChange={(airport) => setFormData((prev: any) => ({ ...prev, destination: airport }))}
                  placeholder="Destino"
                  className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[40px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Passengers Row */}
        <div className="flex gap-2">
          {/* Dates */}
          <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex gap-2">
              {/* Departure */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Ida</div>
                <button
                  onClick={() => setShowDatePicker('departure')}
                  className="w-full p-2 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  style={{ minHeight: '40px' }}
                >
                  {formatDate(formData.departureDate)}
                </button>
              </div>

              {/* Return (if round-trip) */}
              {formData.tripType === 'round-trip' && (
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Volta</div>
                  <button
                    onClick={() => setShowDatePicker('return')}
                    className="w-full p-2 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    style={{ minHeight: '40px' }}
                  >
                    {formatDate(formData.returnDate)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Passengers */}
          <div className="w-20">
            <div className="text-xs text-gray-500 mb-1">Pax</div>
            <button
              onClick={() => setShowPassengerPicker(true)}
              className="w-full p-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 flex items-center justify-center"
              style={{ minHeight: '40px' }}
            >
              <UsersIcon className="w-4 h-4 mr-1" />
              {getTotalPassengers()}
            </button>
          </div>
        </div>

        {/* Class & Search */}
        <div className="flex gap-2">
          {/* Travel Class */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Classe</div>
            <select
              value={formData.travelClass}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData((prev: any) => ({ ...prev, travelClass: e.target.value as TravelClass }))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              style={{ minHeight: '40px' }}
            >
              {TRAVEL_CLASSES.map((tc) => (
                <option key={tc.value} value={tc.value}>
                  {tc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="w-24">
            <div className="text-xs text-transparent mb-1">.</div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              style={{ minHeight: '40px' }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-sm">🔍</span>
              )}
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
          <div className="flex justify-center items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Gratuito</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>2h resposta</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">✓</span>
              <span>Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">
                {showDatePicker === 'departure' ? 'Data de ida' : 'Data de volta'}
              </h3>
              <button
                onClick={() => setShowDatePicker(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <input
              type="date"
              value={(() => {
                try {
                  const targetDate = showDatePicker === 'departure' 
                    ? formData.departureDate
                    : formData.returnDate;
                  if (!targetDate) return new Date().toISOString().split('T')[0];
                  return targetDate.toISOString().split('T')[0];
                } catch (error) {
                  return new Date().toISOString().split('T')[0];
                }
              })()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                try {
                  const newDate = new Date(e.target.value);
                  if (isNaN(newDate.getTime())) return;
                  setFormData((prev: any) => ({
                    ...prev,
                    [showDatePicker === 'departure' ? 'departureDate' : 'returnDate']: newDate
                  }));
                } catch (error) {
                  console.error('Error setting date:', error);
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDatePicker(null)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowDatePicker(null)}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passenger Picker Modal */}
      {showPassengerPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Passageiros</h3>
              <button
                onClick={() => setShowPassengerPicker(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Adultos</div>
                  <div className="text-sm text-gray-600">12+ anos</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePassenger('adults', false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    disabled={formData.passengers.adults <= 1}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{formData.passengers.adults}</span>
                  <button
                    onClick={() => updatePassenger('adults', true)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Crianças</div>
                  <div className="text-sm text-gray-600">2-11 anos</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePassenger('children', false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    disabled={formData.passengers.children <= 0}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{formData.passengers.children}</span>
                  <button
                    onClick={() => updatePassenger('children', true)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Bebês</div>
                  <div className="text-sm text-gray-600">0-2 anos</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePassenger('infants', false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    disabled={formData.passengers.infants <= 0}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{formData.passengers.infants}</span>
                  <button
                    onClick={() => updatePassenger('infants', true)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPassengerPicker(false)}
              className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}