'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileUtils } from '@/hooks/useMobileDetection';
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass } from '@/types/flights';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import { CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';

interface MobileFlightFormProps {
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
  { value: 'ECONOMY', label: 'Econômica', description: 'Melhor preço' },
  { value: 'PREMIUM_ECONOMY', label: 'Econômica Premium', description: 'Mais conforto' },
  { value: 'BUSINESS', label: 'Executiva', description: 'Luxo e comodidade' },
  { value: 'FIRST', label: 'Primeira Classe', description: 'Máximo luxo' }
];

export default function MobileFlightForm({
  onSearch,
  initialData,
  isLoading = false,
  className = ''
}: MobileFlightFormProps) {
  const {
    isMobileDevice,
    screenWidth,
    getTouchTargetSize,
    getFontSize,
    getSpacing
  } = useMobileUtils();

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
      returnDate: new Date(Date.now() + 86400000), // Tomorrow
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'ECONOMY' as TravelClass,
      preferences: {
        nonStop: false,
        flexibleDates: { enabled: false, days: 2 },
        preferredAirlines: []
      }
    };
    
    // Safely merge initial data
    if (initialData) {
      return {
        ...baseData,
        ...initialData,
        // Always ensure dates are valid
        departureDate: getValidDate(initialData.departureDate) || baseData.departureDate,
        returnDate: getValidDate(initialData.returnDate) || baseData.returnDate
      };
    }
    
    return baseData;
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'departure' | 'return' | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const touchTargetSize = getTouchTargetSize();

  // Handle escape key to close date picker
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDatePicker) {
        setShowDatePicker(null);
      }
    };

    if (showDatePicker) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDatePicker]);

  // Don't render on non-mobile devices
  if (!isMobileDevice) {
    return null;
  }

  // Form steps for progressive disclosure
  const steps = [
    { id: 'trip-type', label: 'Tipo de Viagem' },
    { id: 'airports', label: 'Origem e Destino' },
    { id: 'dates', label: 'Datas' },
    { id: 'passengers', label: 'Passageiros' },
    { id: 'search', label: 'Buscar' }
  ];

  const handleSwapAirports = async (): Promise<void> => {
    if (isSwapping) return;

    setIsSwapping(true);
    
    // Create swap animation
    await new Promise(resolve => setTimeout(resolve, 200));

    setFormData((prev: any) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    setTimeout(() => setIsSwapping(false), 300);
  };

  const handlePassengerChange = (type: keyof PassengerCounts, increment: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1))
      }
    }));
  };

  const getTotalPassengers = () => {
    const { adults, children, infants } = formData.passengers;
    return adults + children + infants;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Selecionar data';
    
    try {
      // Ensure we have a valid Date object
      const validDate = date instanceof Date ? date : new Date(date);
      if (isNaN(validDate.getTime())) {
        return 'Data inválida';
      }
      
      return new Intl.DateFormat('pt-BR', {
        day: 'numeric',
        month: 'short',
        weekday: 'short'
      }).format(validDate);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Selecionar data';
    }
  };

  const handleSearch = () => {
    // Validate form
    const totalPassengers = getTotalPassengers();
    if (totalPassengers === 0) {
      alert('Selecione pelo menos um passageiro');
      return;
    }

    if (!formData.origin?.iataCode || !formData.destination?.iataCode) {
      alert('Selecione origem e destino');
      return;
    }

    onSearch(formData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev: any) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev: any) => prev - 1);
    }
  };

  return (
    <motion.div
      ref={formRef}
      className={`
        bg-white rounded-2xl shadow-xl border border-gray-100
        overflow-visible relative w-full max-w-full mx-auto
        ${className}
      `}
      style={{ 
        width: '100%', 
        maxWidth: '100vw', 
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 60
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep].label}
          </h3>
          <span className="text-sm text-gray-600 font-medium">
            {currentStep + 1}/{steps.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* Step 0: Trip Type */}
          {currentStep === 0 && (
            <motion.div
              key="trip-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {TRIP_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, tripType: type.value as any }));
                    nextStep();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all
                    ${formData.tripType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  style={{ minHeight: touchTargetSize }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{type.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Step 1: Airports */}
          {currentStep === 1 && (
            <motion.div
              key="airports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  De onde você sai?
                </label>
                <AirportAutocomplete
                  value={formData.origin}
                  onChange={(airport) => setFormData((prev: any) => ({ ...prev, origin: airport }))}
                  placeholder="Cidade ou aeroporto de origem"
                  isMobile
                  className="mb-4"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={handleSwapAirports}
                  disabled={isSwapping}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: isSwapping ? 180 : 0 }}
                  className="p-3 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                  style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                >
                  <SwitchIcon className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para onde você vai?
                </label>
                <AirportAutocomplete
                  value={formData.destination}
                  onChange={(airport) => setFormData((prev: any) => ({ ...prev, destination: airport }))}
                  placeholder="Cidade ou aeroporto de destino"
                  isMobile
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Dates */}
          {currentStep === 2 && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de ida
                </label>
                <button
                  onClick={() => setShowDatePicker('departure')}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors"
                  style={{ minHeight: touchTargetSize }}
                >
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(formData.departureDate)}</div>
                    <div className="text-sm text-gray-600">Toque para alterar</div>
                  </div>
                </button>
              </div>

              {/* Return Date (if round trip) */}
              {formData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de volta
                  </label>
                  <button
                    onClick={() => setShowDatePicker('return')}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 text-left flex items-center gap-3 hover:bg-gray-100 transition-colors"
                    style={{ minHeight: touchTargetSize }}
                  >
                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{formatDate(formData.returnDate)}</div>
                      <div className="text-sm text-gray-600">Toque para alterar</div>
                    </div>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Passengers */}
          {currentStep === 3 && (
            <motion.div
              key="passengers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Passengers */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Passageiros</h4>
                
                {/* Adults */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Adultos</div>
                    <div className="text-sm text-gray-600">12+ anos</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('adults', false)}
                      disabled={formData.passengers.adults <= 1}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="font-medium min-w-[2ch] text-center text-gray-900">
                      {formData.passengers.adults}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('adults', true)}
                      disabled={formData.passengers.adults >= 9}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Crianças</div>
                    <div className="text-sm text-gray-600">2-11 anos</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('children', false)}
                      disabled={formData.passengers.children <= 0}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="font-medium min-w-[2ch] text-center text-gray-900">
                      {formData.passengers.children}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('children', true)}
                      disabled={formData.passengers.children >= 9}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">Bebês</div>
                    <div className="text-sm text-gray-600">0-2 anos</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePassengerChange('infants', false)}
                      disabled={formData.passengers.infants <= 0}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="font-medium min-w-[2ch] text-center text-gray-900">
                      {formData.passengers.infants}
                    </span>
                    <button
                      onClick={() => handlePassengerChange('infants', true)}
                      disabled={formData.passengers.infants >= formData.passengers.adults}
                      className="p-2 bg-white rounded-full shadow disabled:opacity-50"
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Travel Class */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Classe de viagem</h4>
                {TRAVEL_CLASSES.map((travelClass) => (
                  <button
                    key={travelClass.value}
                    onClick={() => setFormData((prev: any) => ({ ...prev, travelClass: travelClass.value as TravelClass }))}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${formData.travelClass === travelClass.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    style={{ minHeight: touchTargetSize }}
                  >
                    <div className="font-medium text-gray-900">{travelClass.label}</div>
                    <div className="text-sm text-gray-600">{travelClass.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Search */}
          {currentStep === 4 && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <div className="text-6xl">✈️</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Pronto para buscar!
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <strong className="text-gray-900">{formData.origin?.city}</strong> → <strong className="text-gray-900">{formData.destination?.city}</strong>
                  </div>
                  <div>{formatDate(formData.departureDate)}</div>
                  {formData.tripType === 'round-trip' && (
                    <div>Volta: {formatDate(formData.returnDate)}</div>
                  )}
                  <div>{getTotalPassengers()} passageiro(s)</div>
                </div>
              </div>

              <motion.button
                onClick={handleSearch}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold
                  rounded-xl shadow-lg transition-all
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}
                `}
                style={{ minHeight: touchTargetSize, padding: '16px' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Buscando...
                  </div>
                ) : (
                  'Buscar Voos'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="border-t border-gray-100 p-4 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              style={{ minHeight: touchTargetSize }}
            >
              Anterior
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            style={{ minHeight: touchTargetSize }}
          >
            {currentStep === 3 ? 'Finalizar' : 'Próximo'}
          </button>
        </div>
      )}

      {/* Date Picker Modal - Responsive */}
      {showDatePicker && (
        <div 
          className="mobile-date-picker-modal"
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              setShowDatePicker(null);
            }
          }}
        >
          <div className="mobile-date-picker-content">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showDatePicker === 'departure' ? 'Data de ida' : 'Data de volta'}
                </h3>
                <button
                  onClick={() => setShowDatePicker(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <input
                type="date"
                value={(() => {
                  try {
                    const targetDate = showDatePicker === 'departure' 
                      ? formData.departureDate
                      : formData.returnDate;
                    
                    if (!targetDate || !(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
                      return new Date().toISOString().split('T')[0];
                    }
                    
                    return targetDate.toISOString().split('T')[0];
                  } catch (error) {
                    console.error('Error formatting date for picker:', error);
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
                    console.error('Error setting new date:', error);
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border border-gray-300 rounded-xl text-lg text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ minHeight: touchTargetSize }}
                autoFocus
              />
            </div>
              
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDatePicker(null)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                style={{ minHeight: touchTargetSize }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowDatePicker(null)}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                style={{ minHeight: touchTargetSize }}
              >
                Confirmar
              </button>
            </div>
            
            {/* Safe area bottom padding for mobile devices */}
            <div className="pb-safe-area-inset-bottom md:pb-0"></div>
          </div>
        </div>
      )}
    </motion.div>
  );
}