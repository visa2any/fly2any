'use client';

import { useState, useEffect, useRef } from 'react';

type TravelClass = 'economy' | 'premium' | 'business' | 'first';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface Props {
  label: string;
  passengers: PassengerCounts;
  travelClass: TravelClass;
  onChange: (passengers: PassengerCounts, travelClass: TravelClass) => void;
}

const classOptions = {
  economy: {
    name: 'Economy',
    icon: '💺',
    features: ['Standard seat', 'Carry-on bag', 'In-flight entertainment'],
    popular: true,
  },
  premium: {
    name: 'Premium Economy',
    icon: '🎫',
    features: ['Extra legroom', 'Priority boarding', 'Premium meals'],
    popular: false,
  },
  business: {
    name: 'Business Class',
    icon: '💼',
    features: ['Lie-flat seats', 'Lounge access', 'Premium dining'],
    popular: false,
  },
  first: {
    name: 'First Class',
    icon: '👑',
    features: ['Private suites', 'Chef meals', 'Luxury amenities'],
    popular: false,
  },
};

export function PassengerClassSelector({ label, passengers, travelClass, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPassengers, setLocalPassengers] = useState(passengers);
  const [localClass, setLocalClass] = useState<TravelClass>(travelClass);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const displayLabel = label || 'Travellers and Class';

  useEffect(() => {
    setLocalPassengers(passengers);
    setLocalClass(travelClass);
  }, [passengers, travelClass]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updatePassengers = (type: keyof PassengerCounts, delta: number) => {
    const updated = { ...localPassengers };
    const newValue = updated[type] + delta;

    // Validation
    if (type === 'adults' && newValue < 1) return;
    if (newValue < 0) return;
    if (type === 'infants' && newValue > updated.adults) return; // Can't have more infants than adults

    updated[type] = newValue;
    setLocalPassengers(updated);
  };

  const handleDone = () => {
    onChange(localPassengers, localClass);
    setIsOpen(false);
  };

  const totalPassengers = localPassengers.adults + localPassengers.children + localPassengers.infants;

  const getDisplayText = () => {
    const parts = [];

    // Add passenger counts with icons
    if (passengers.adults > 0) parts.push(`${passengers.adults}👤`);
    if (passengers.children > 0) parts.push(`${passengers.children}👶`);
    if (passengers.infants > 0) parts.push(`${passengers.infants}🍼`);

    const passengerText = parts.join(' ');
    return `${passengerText} • ${classOptions[travelClass].name}`;
  };

  return (
    <div className="relative">
      <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
        <span className="text-xl">👥</span> {displayLabel}
      </label>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-left flex items-center justify-between bg-white hover:border-gray-400 relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          👤
        </div>
        <span className="font-semibold text-base text-gray-900">{getDisplayText()}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-6 w-full md:w-96"
        >
          {/* Passenger Counts */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Adults</div>
                <div className="text-xs text-gray-500">12+ years</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePassengers('adults', -1)}
                  disabled={localPassengers.adults <= 1}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{localPassengers.adults}</span>
                <button
                  type="button"
                  onClick={() => updatePassengers('adults', 1)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Children</div>
                <div className="text-xs text-gray-500">2-12 years</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePassengers('children', -1)}
                  disabled={localPassengers.children <= 0}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{localPassengers.children}</span>
                <button
                  type="button"
                  onClick={() => updatePassengers('children', 1)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Infants</div>
                <div className="text-xs text-gray-500">Under 2 years</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePassengers('infants', -1)}
                  disabled={localPassengers.infants <= 0}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{localPassengers.infants}</span>
                <button
                  type="button"
                  onClick={() => updatePassengers('infants', 1)}
                  disabled={localPassengers.infants >= localPassengers.adults}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Travel Class */}
          <div className="border-t border-gray-200 pt-6">
            <div className="font-semibold text-gray-900 mb-3">Travel Class</div>
            <div className="space-y-2">
              {(Object.keys(classOptions) as TravelClass[]).map((classType) => {
                const option = classOptions[classType];
                const isSelected = localClass === classType;

                return (
                  <button
                    key={classType}
                    type="button"
                    onClick={() => setLocalClass(classType)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{option.name}</span>
                          {option.popular && (
                            <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full font-bold">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.features.join(' • ')}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={handleDone}
            className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
