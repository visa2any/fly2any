'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AirportAutocomplete } from './AirportAutocomplete';
import MultiAirportSelector, { Airport } from '@/components/common/MultiAirportSelector';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Plus, X } from 'lucide-react';

// Types
type Language = 'en' | 'pt' | 'es';
type TripType = 'roundtrip' | 'oneway';
type TravelClass = 'economy' | 'premium' | 'business' | 'first';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface FormData {
  origin: string[];  // Array of airport codes
  destination: string[];  // Array of airport codes
  departureDate: string;
  departureDates: Date[];  // Array of specific departure dates
  useMultiDate: boolean;   // Toggle between single date and multi-date mode
  returnDate: string;
  passengers: PassengerCounts;
  travelClass: TravelClass;
  tripType: TripType;
  directFlights: boolean;
  departureFlex: number;  // ±N days for departure (0-5) - only for single date mode
  tripDuration: number;   // Number of nights for round trips (1-14)
}

interface FlightSearchFormProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  className?: string;
}

// Translations
const content = {
  en: {
    tripType: {
      roundtrip: 'Round Trip',
      oneway: 'One Way',
    },
    from: 'From',
    to: 'To',
    departure: 'Departure',
    return: 'Return',
    passengers: 'Passengers & Class',
    fromPlaceholder: 'Where from?',
    toPlaceholder: 'Where to?',
    classes: {
      economy: 'Economy',
      premium: 'Premium Economy',
      business: 'Business',
      first: 'First Class',
    },
    passengerTypes: {
      adults: 'Adults',
      adultsDesc: '12+ years',
      children: 'Children',
      childrenDesc: '2-12 years',
      infants: 'Infants',
      infantsDesc: 'Under 2 years',
    },
    search: 'Search Flights',
    directFlights: 'Direct flights only',
    done: 'Done',
    selectDate: 'Select date',
    flexDates: 'Flexible Dates',
    tripDuration: 'Trip Duration',
    nights: 'nights',
    exactDates: 'Exact dates',
    plusMinus: '±',
    errors: {
      originRequired: 'Please select an origin airport',
      destinationRequired: 'Please select a destination airport',
      departureDateRequired: 'Please select a departure date',
      departureDatePast: 'Departure date must be in the future',
      returnDateRequired: 'Please select a return date for round trip',
      returnDateInvalid: 'Return date must be after departure date',
    },
  },
  pt: {
    tripType: {
      roundtrip: 'Ida e Volta',
      oneway: 'Somente Ida',
    },
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Volta',
    passengers: 'Passageiros & Classe',
    fromPlaceholder: 'De onde?',
    toPlaceholder: 'Para onde?',
    classes: {
      economy: 'Econômica',
      premium: 'Econômica Premium',
      business: 'Executiva',
      first: 'Primeira Classe',
    },
    passengerTypes: {
      adults: 'Adultos',
      adultsDesc: '12+ anos',
      children: 'Crianças',
      childrenDesc: '2-12 anos',
      infants: 'Bebês',
      infantsDesc: 'Menos de 2 anos',
    },
    search: 'Buscar Voos',
    directFlights: 'Apenas voos diretos',
    done: 'Concluir',
    selectDate: 'Selecionar data',
    flexDates: 'Datas Flexíveis',
    tripDuration: 'Duração da Viagem',
    nights: 'noites',
    exactDates: 'Datas exatas',
    plusMinus: '±',
    errors: {
      originRequired: 'Por favor, selecione um aeroporto de origem',
      destinationRequired: 'Por favor, selecione um aeroporto de destino',
      departureDateRequired: 'Por favor, selecione uma data de ida',
      departureDatePast: 'A data de ida deve ser futura',
      returnDateRequired: 'Por favor, selecione uma data de volta',
      returnDateInvalid: 'A data de volta deve ser após a data de ida',
    },
  },
  es: {
    tripType: {
      roundtrip: 'Ida y Vuelta',
      oneway: 'Solo Ida',
    },
    from: 'De',
    to: 'Para',
    departure: 'Ida',
    return: 'Vuelta',
    passengers: 'Pasajeros & Clase',
    fromPlaceholder: '¿De dónde?',
    toPlaceholder: '¿A dónde?',
    classes: {
      economy: 'Económica',
      premium: 'Económica Premium',
      business: 'Ejecutiva',
      first: 'Primera Clase',
    },
    passengerTypes: {
      adults: 'Adultos',
      adultsDesc: '12+ años',
      children: 'Niños',
      childrenDesc: '2-12 años',
      infants: 'Bebés',
      infantsDesc: 'Menos de 2 años',
    },
    search: 'Buscar Vuelos',
    directFlights: 'Solo vuelos directos',
    done: 'Listo',
    selectDate: 'Seleccionar fecha',
    flexDates: 'Fechas Flexibles',
    tripDuration: 'Duración del Viaje',
    nights: 'noches',
    exactDates: 'Fechas exactas',
    plusMinus: '±',
    errors: {
      originRequired: 'Por favor, seleccione un aeropuerto de origen',
      destinationRequired: 'Por favor, seleccione un aeropuerto de destino',
      departureDateRequired: 'Por favor, seleccione una fecha de ida',
      departureDatePast: 'La fecha de ida debe ser futura',
      returnDateRequired: 'Por favor, seleccione una fecha de vuelta',
      returnDateInvalid: 'La fecha de vuelta debe ser después de la fecha de ida',
    },
  },
};

export default function FlightSearchForm({
  language = 'en',
  onLanguageChange,
  className = '',
}: FlightSearchFormProps) {
  const router = useRouter();
  const [lang, setLang] = useState<Language>(language);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isPassengerDropdownOpen, setIsPassengerDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    origin: [],  // Start with empty array
    destination: [],  // Start with empty array
    departureDate: '',
    departureDates: [],    // Array of specific departure dates
    useMultiDate: false,   // Toggle between single-date and multi-date mode
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    travelClass: 'economy',
    tripType: 'roundtrip',
    directFlights: false,
    departureFlex: 0,      // Default: exact dates
    tripDuration: 7,       // Default: 7 nights
  });

  const [tempPassengers, setTempPassengers] = useState<PassengerCounts>(formData.passengers);
  const [tempClass, setTempClass] = useState<TravelClass>(formData.travelClass);

  const t = content[lang];

  // Update language when prop changes
  useEffect(() => {
    setLang(language);
  }, [language]);

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Origin validation
    if (!formData.origin || formData.origin.length === 0) {
      newErrors.origin = t.errors.originRequired;
    }

    // Destination validation
    if (!formData.destination || formData.destination.length === 0) {
      newErrors.destination = t.errors.destinationRequired;
    }

    // Departure date validation
    if (formData.useMultiDate) {
      // Multi-date mode: validate departureDates array
      if (!formData.departureDates || formData.departureDates.length === 0) {
        newErrors.departureDate = t.errors.departureDateRequired;
      } else {
        // Check if any selected date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const hasPastDate = formData.departureDates.some(date => {
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);
          return checkDate < today;
        });
        if (hasPastDate) {
          newErrors.departureDate = t.errors.departureDatePast;
        }
      }
    } else {
      // Single-date mode: validate departureDate
      if (!formData.departureDate) {
        newErrors.departureDate = t.errors.departureDateRequired;
      } else {
        const depDate = new Date(formData.departureDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (depDate < today) {
          newErrors.departureDate = t.errors.departureDatePast;
        }
      }
    }

    // Return date validation for round trip
    if (formData.tripType === 'roundtrip') {
      if (!formData.returnDate) {
        newErrors.returnDate = t.errors.returnDateRequired;
      } else if (formData.departureDate) {
        const depDate = new Date(formData.departureDate);
        const retDate = new Date(formData.returnDate);
        if (retDate <= depDate) {
          newErrors.returnDate = t.errors.returnDateInvalid;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle passenger count changes
  const updatePassengerCount = (type: keyof PassengerCounts, delta: number) => {
    const updated = { ...tempPassengers };
    const newValue = updated[type] + delta;

    // Validation rules
    if (type === 'adults' && newValue < 1) return;
    if (newValue < 0) return;
    if (newValue > 9) return; // Max 9 per type
    if (type === 'infants' && newValue > updated.adults) return; // Can't have more infants than adults

    updated[type] = newValue;
    setTempPassengers(updated);
  };

  // Apply passenger and class changes
  const applyPassengerChanges = () => {
    setFormData({
      ...formData,
      passengers: tempPassengers,
      travelClass: tempClass,
    });
    setIsPassengerDropdownOpen(false);
  };

  // Get passenger display text
  const getPassengerDisplayText = () => {
    const { adults, children, infants } = formData.passengers;
    const total = adults + children + infants;
    const passengerText = `${total} ${total === 1 ? 'Passenger' : 'Passengers'}`;
    const classText = t.classes[formData.travelClass];
    return `${passengerText} • ${classText}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Build query params
    const params = new URLSearchParams({
      origin: formData.origin.join(','), // Join multiple airport codes with comma
      destination: formData.destination.join(','), // Join multiple airport codes with comma
      departureDate: formData.useMultiDate
        ? formData.departureDates.map(date => format(date, 'yyyy-MM-dd')).join(',')
        : formData.departureDate,
      useMultiDate: formData.useMultiDate.toString(),
      adults: formData.passengers.adults.toString(),
      children: formData.passengers.children.toString(),
      infants: formData.passengers.infants.toString(),
      travelClass: formData.travelClass,  // Changed from 'class' to 'travelClass'
      tripType: formData.tripType,
      nonStop: formData.directFlights.toString(),  // Changed from 'direct' to 'nonStop' to match API
      departureFlex: formData.departureFlex.toString(),
    });

    if (formData.tripType === 'roundtrip' && formData.returnDate) {
      params.append('returnDate', formData.returnDate);
      params.append('tripDuration', formData.tripDuration.toString());
    }

    // Navigate to results page
    setTimeout(() => {
      router.push(`/flights/results?${params.toString()}`);
      setIsLoading(false);
    }, 500);
  };

  // Handle trip type change
  const handleTripTypeChange = (type: TripType) => {
    setFormData({
      ...formData,
      tripType: type,
      returnDate: type === 'oneway' ? '' : formData.returnDate,
    });
    if (errors.returnDate && type === 'oneway') {
      const newErrors = { ...errors };
      delete newErrors.returnDate;
      setErrors(newErrors);
    }
  };

  return (
    <div className={`bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 mx-1 sm:mx-0 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6" aria-label="Flight search form">
        {/* Trip Type Toggle - Horizontally scrollable on mobile */}
        <fieldset className="flex gap-2 md:gap-3 p-1 bg-gray-100 rounded-2xl overflow-x-auto scrollbar-hide scroll-smooth">
          <legend className="sr-only">Trip Type</legend>
          <button
            type="button"
            onClick={() => handleTripTypeChange('roundtrip')}
            className={`flex-1 min-w-[100px] py-2.5 md:py-3 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
              formData.tripType === 'roundtrip'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={t.tripType.roundtrip}
            aria-pressed={formData.tripType === 'roundtrip'}
            role="radio"
            aria-checked={formData.tripType === 'roundtrip'}
          >
            {t.tripType.roundtrip}
          </button>
          <button
            type="button"
            onClick={() => handleTripTypeChange('oneway')}
            className={`flex-1 min-w-[100px] py-2.5 md:py-3 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 whitespace-nowrap ${
              formData.tripType === 'oneway'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label={t.tripType.oneway}
            aria-pressed={formData.tripType === 'oneway'}
            role="radio"
            aria-checked={formData.tripType === 'oneway'}
          >
            {t.tripType.oneway}
          </button>
        </fieldset>

        {/* Origin and Destination */}
        <fieldset className="grid md:grid-cols-2 gap-3 md:gap-4">
          <legend className="sr-only">Flight Route</legend>
          {/* Origin */}
          <div>
            <MultiAirportSelector
              label={t.from}
              placeholder={t.fromPlaceholder}
              value={formData.origin}
              onChange={(codes, airports) => {
                setFormData({ ...formData, origin: codes });
                if (errors.origin) {
                  const newErrors = { ...errors };
                  delete newErrors.origin;
                  setErrors(newErrors);
                }
              }}
              maxDisplay={2}
              lang={lang}
              testId="origin-input"
            />
            {errors.origin && (
              <p id="origin-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
                {errors.origin}
              </p>
            )}
          </div>

          {/* Destination */}
          <div>
            <MultiAirportSelector
              label={t.to}
              placeholder={t.toPlaceholder}
              value={formData.destination}
              onChange={(codes, airports) => {
                setFormData({ ...formData, destination: codes });
                if (errors.destination) {
                  const newErrors = { ...errors };
                  delete newErrors.destination;
                  setErrors(newErrors);
                }
              }}
              maxDisplay={2}
              lang={lang}
              testId="destination-input"
            />
            {errors.destination && (
              <p id="destination-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
                {errors.destination}
              </p>
            )}
          </div>
        </fieldset>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {/* Departure Date with Multi-Date Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t.departure}
              </label>

              {/* Toggle between Single Date and Multi-Date - Compact on mobile */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 overflow-x-auto scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, useMultiDate: false, departureDates: [] })}
                  className={`px-2 md:px-3 py-1 rounded text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${
                    !formData.useMultiDate
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, useMultiDate: true, departureDate: '' })}
                  className={`px-2 md:px-3 py-1 rounded text-[10px] md:text-xs font-semibold transition-all whitespace-nowrap ${
                    formData.useMultiDate
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Multi
                </button>
              </div>
            </div>

            {/* Single Date Mode - MOBILE-OPTIMIZED */}
            {!formData.useMultiDate ? (
              <div className="flex items-center gap-2">
                {/* Date Input - MOBILE: Larger touch target, visible input */}
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={formData.departureDate}
                    min={getMinDate()}
                    onChange={(e) => {
                      setFormData({ ...formData, departureDate: e.target.value });
                      if (errors.departureDate) {
                        const newErrors = { ...errors };
                        delete newErrors.departureDate;
                        setErrors(newErrors);
                      }
                    }}
                    className={`
                      w-full pl-10 md:pl-12 pr-3 md:pr-4
                      py-3.5 md:py-4
                      min-h-[48px] md:min-h-[56px]
                      border-2 rounded-xl
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      outline-none transition-all
                      text-base md:text-lg font-semibold
                      bg-white cursor-pointer
                      ${errors.departureDate ? 'border-red-500' : 'border-gray-300'}
                    `}
                    style={{
                      colorScheme: 'light',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                    }}
                    aria-label={t.departure}
                    aria-invalid={!!errors.departureDate}
                    aria-describedby={errors.departureDate ? 'departure-error' : undefined}
                  />
                </div>

                {/* Inline Flex Controls - MOBILE: Hidden on small screens to save space */}
                <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-2 border-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, departureFlex: Math.max(0, formData.departureFlex - 1) })}
                    disabled={formData.departureFlex === 0}
                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-white hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                    aria-label="Decrease flex days"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold text-gray-700 min-w-[36px] text-center">
                    {formData.departureFlex === 0 ? 'Exact' : `±${formData.departureFlex}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, departureFlex: Math.min(5, formData.departureFlex + 1) })}
                    disabled={formData.departureFlex === 5}
                    className="w-8 h-8 rounded flex items-center justify-center hover:bg-white hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                    aria-label="Increase flex days"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              /* Multi-Date Mode - Inline Native Implementation */
              <div className="space-y-2">
                {/* Selected Dates Display */}
                {formData.departureDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.departureDates.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                      >
                        {format(date, 'MMM d, yyyy')}
                        <button
                          type="button"
                          onClick={() => {
                            const newDates = formData.departureDates.filter((_, i) => i !== index);
                            setFormData({ ...formData, departureDates: newDates });
                          }}
                          className="ml-1 hover:text-blue-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Add Date Input */}
                {formData.departureDates.length < 7 && (
                  <div className="relative">
                    <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="date"
                      min={getMinDate()}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newDate = new Date(e.target.value + 'T00:00:00');
                          const exists = formData.departureDates.some(d =>
                            format(d, 'yyyy-MM-dd') === format(newDate, 'yyyy-MM-dd')
                          );
                          if (!exists) {
                            setFormData({
                              ...formData,
                              departureDates: [...formData.departureDates, newDate].sort((a, b) => a.getTime() - b.getTime())
                            });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3.5 md:py-4 min-h-[48px] md:min-h-[56px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base md:text-lg font-semibold bg-white cursor-pointer"
                      style={{ colorScheme: 'light' }}
                      placeholder="Add departure date"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      {formData.departureDates.length}/7 dates
                    </span>
                  </div>
                )}
              </div>
            )}

            {errors.departureDate && (
              <p id="departure-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
                {errors.departureDate}
              </p>
            )}
          </div>

          {/* Return Date - MOBILE-OPTIMIZED */}
          {formData.tripType === 'roundtrip' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.return}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={formData.returnDate}
                  min={formData.departureDate || getMinDate()}
                  onChange={(e) => {
                    setFormData({ ...formData, returnDate: e.target.value });
                    if (errors.returnDate) {
                      const newErrors = { ...errors };
                      delete newErrors.returnDate;
                      setErrors(newErrors);
                    }
                  }}
                  className={`
                    w-full pl-10 md:pl-12 pr-3 md:pr-4
                    py-3.5 md:py-4
                    min-h-[48px] md:min-h-[56px]
                    border-2 rounded-xl
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    outline-none transition-all
                    text-base md:text-lg font-semibold
                    bg-white cursor-pointer
                    ${errors.returnDate ? 'border-red-500' : 'border-gray-300'}
                  `}
                  style={{
                    colorScheme: 'light',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                  aria-label={t.return}
                  aria-invalid={!!errors.returnDate}
                  aria-describedby={errors.returnDate ? 'return-error' : undefined}
                />
              </div>
              {errors.returnDate && (
                <p id="return-error" className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
                  {errors.returnDate}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Trip Duration - Stepper with Editable Input */}
        {formData.tripType === 'roundtrip' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.tripDuration}
            </label>
            <div className="flex items-center gap-2 bg-white border-2 border-gray-300 rounded-xl px-3 md:px-4 py-3 md:py-4 hover:border-blue-500 transition-all">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tripDuration: Math.max(1, formData.tripDuration - 1) })}
                disabled={formData.tripDuration <= 1}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                aria-label="Decrease duration"
              >
                −
              </button>
              <input
                type="number"
                value={formData.tripDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 30) {
                    setFormData({ ...formData, tripDuration: val });
                  }
                }}
                min="1"
                max="30"
                className="flex-1 text-center text-lg font-semibold text-gray-900 border-0 outline-none bg-transparent"
                aria-label="Trip duration"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tripDuration: Math.min(30, formData.tripDuration + 1) })}
                disabled={formData.tripDuration >= 30}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-50 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                aria-label="Increase duration"
              >
                +
              </button>
              <span className="text-sm text-gray-600 ml-1">{t.nights}</span>
            </div>
          </div>
        )}

        {/* MOBILE: Travelers & Class + Direct Flights - ALL IN ONE ROW */}
        <div className={`flex md:hidden items-center gap-2 flex-nowrap ${isPassengerDropdownOpen ? 'relative z-[100]' : ''}`}>
          {/* Travelers & Class - Compact button with proper touch target */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPassengerDropdownOpen(!isPassengerDropdownOpen);
                if (!isPassengerDropdownOpen) {
                  setTempPassengers(formData.passengers);
                  setTempClass(formData.travelClass);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 whitespace-nowrap active:bg-gray-100 touch-manipulation"
              aria-label={t.passengers}
              aria-expanded={isPassengerDropdownOpen}
            >
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>{formData.passengers.adults + formData.passengers.children + formData.passengers.infants}</span>
              <span className="text-gray-300">|</span>
              <span>{t.classes[formData.travelClass]}</span>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isPassengerDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Passenger Dropdown - Mobile with click-outside */}
            {isPassengerDropdownOpen && (
              <>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-[90] bg-black/20"
                  onClick={() => setIsPassengerDropdownOpen(false)}
                />
                <div className="absolute z-[100] mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 w-[280px] left-0 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Passenger Counts */}
                <div className="space-y-3 mb-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.passengerTypes.adults}</div>
                      <div className="text-xs text-gray-500">{t.passengerTypes.adultsDesc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updatePassengerCount('adults', -1)} disabled={tempPassengers.adults <= 1} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">−</button>
                      <span className="w-6 text-center font-bold text-gray-900">{tempPassengers.adults}</span>
                      <button type="button" onClick={() => updatePassengerCount('adults', 1)} disabled={tempPassengers.adults >= 9} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">+</button>
                    </div>
                  </div>
                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.passengerTypes.children}</div>
                      <div className="text-xs text-gray-500">{t.passengerTypes.childrenDesc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updatePassengerCount('children', -1)} disabled={tempPassengers.children <= 0} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">−</button>
                      <span className="w-6 text-center font-bold text-gray-900">{tempPassengers.children}</span>
                      <button type="button" onClick={() => updatePassengerCount('children', 1)} disabled={tempPassengers.children >= 9} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">+</button>
                    </div>
                  </div>
                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.passengerTypes.infants}</div>
                      <div className="text-xs text-gray-500">{t.passengerTypes.infantsDesc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updatePassengerCount('infants', -1)} disabled={tempPassengers.infants <= 0} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">−</button>
                      <span className="w-6 text-center font-bold text-gray-900">{tempPassengers.infants}</span>
                      <button type="button" onClick={() => updatePassengerCount('infants', 1)} disabled={tempPassengers.infants >= tempPassengers.adults || tempPassengers.infants >= 9} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-500 disabled:opacity-30 text-sm font-bold">+</button>
                    </div>
                  </div>
                </div>
                {/* Travel Class */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(['economy', 'premium', 'business', 'first'] as TravelClass[]).map((classType) => (
                      <button key={classType} type="button" onClick={() => setTempClass(classType)} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${tempClass === classType ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {t.classes[classType]}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={applyPassengerChanges} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm active:bg-blue-700 touch-manipulation">{t.done}</button>
                </div>
              </>
            )}
          </div>

          {/* Vertical divider */}
          <div className="h-5 w-px bg-gray-200 flex-shrink-0" />

          {/* Direct Flights - Full text with proper touch target */}
          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 px-2 py-2 min-h-[44px] active:bg-gray-50 rounded-lg touch-manipulation">
            <input
              type="checkbox"
              checked={formData.directFlights}
              onChange={(e) => setFormData({ ...formData, directFlights: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              aria-label={t.directFlights}
            />
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{t.directFlights}</span>
          </label>
        </div>

        {/* DESKTOP: Passengers and Class - Full Width */}
        <div className="hidden md:block relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.passengers}
          </label>
          <button
            type="button"
            onClick={() => {
              setIsPassengerDropdownOpen(!isPassengerDropdownOpen);
              if (!isPassengerDropdownOpen) {
                setTempPassengers(formData.passengers);
                setTempClass(formData.travelClass);
              }
            }}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left flex items-center justify-between bg-white hover:border-gray-400"
            aria-label={t.passengers}
            aria-expanded={isPassengerDropdownOpen}
          >
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <span className="font-semibold text-lg text-gray-900">{getPassengerDisplayText()}</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isPassengerDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Passenger Dropdown - Desktop */}
          {isPassengerDropdownOpen && (
            <div className="absolute z-50 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-6 w-96">
              {/* Passenger Counts */}
              <div className="space-y-4 mb-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t.passengerTypes.adults}</div>
                    <div className="text-xs text-gray-500">{t.passengerTypes.adultsDesc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updatePassengerCount('adults', -1)} disabled={tempPassengers.adults <= 1} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Decrease ${t.passengerTypes.adults}`}>−</button>
                    <span className="w-8 text-center font-bold text-gray-900 text-lg">{tempPassengers.adults}</span>
                    <button type="button" onClick={() => updatePassengerCount('adults', 1)} disabled={tempPassengers.adults >= 9} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Increase ${t.passengerTypes.adults}`}>+</button>
                  </div>
                </div>
                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t.passengerTypes.children}</div>
                    <div className="text-xs text-gray-500">{t.passengerTypes.childrenDesc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updatePassengerCount('children', -1)} disabled={tempPassengers.children <= 0} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Decrease ${t.passengerTypes.children}`}>−</button>
                    <span className="w-8 text-center font-bold text-gray-900 text-lg">{tempPassengers.children}</span>
                    <button type="button" onClick={() => updatePassengerCount('children', 1)} disabled={tempPassengers.children >= 9} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Increase ${t.passengerTypes.children}`}>+</button>
                  </div>
                </div>
                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t.passengerTypes.infants}</div>
                    <div className="text-xs text-gray-500">{t.passengerTypes.infantsDesc}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => updatePassengerCount('infants', -1)} disabled={tempPassengers.infants <= 0} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Decrease ${t.passengerTypes.infants}`}>−</button>
                    <span className="w-8 text-center font-bold text-gray-900 text-lg">{tempPassengers.infants}</span>
                    <button type="button" onClick={() => updatePassengerCount('infants', 1)} disabled={tempPassengers.infants >= tempPassengers.adults || tempPassengers.infants >= 9} className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg font-bold" aria-label={`Increase ${t.passengerTypes.infants}`}>+</button>
                  </div>
                </div>
              </div>

              {/* Travel Class */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="font-semibold text-gray-900 mb-3">Travel Class</div>
                <div className="space-y-2">
                  {(['economy', 'premium', 'business', 'first'] as TravelClass[]).map((classType) => (
                    <button
                      key={classType}
                      type="button"
                      onClick={() => setTempClass(classType)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        tempClass === classType
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      aria-label={t.classes[classType]}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{t.classes[classType]}</span>
                        {tempClass === classType && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Done Button */}
              <button type="button" onClick={applyPassengerChanges} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">{t.done}</button>
            </div>
          )}
        </div>

        {/* DESKTOP: Direct Flights Checkbox */}
        <div className="hidden md:block">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.directFlights}
              onChange={(e) => setFormData({ ...formData, directFlights: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              aria-label={t.directFlights}
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {t.directFlights}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 md:py-4 px-6 md:px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          aria-label={t.search}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              <span>{t.search}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
