'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Globe, Check, X, UserCircle, CreditCard, Plane, Shield, Flag, Calendar } from 'lucide-react';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DateInput } from '@/components/ui/DateInput';
import { SpecialAssistanceTabs } from '@/components/booking/SpecialAssistanceTabs';
import { COUNTRIES } from '@/lib/data/countries';
import { AIRLINES, AIRLINES_BY_ALLIANCE, type Airline } from '@/lib/data/airlines';

interface PassengerData {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  email?: string;
  phone?: string;
  frequentFlyerAirline?: string; // Airline code
  frequentFlyerNumber?: string;
  tsaPreCheck?: string;
  // Special Service Requests (SSR)
  wheelchairAssistance?: 'WCHR' | 'WCHS' | 'WCHC' | null; // Wheelchair SSR codes
  mealPreference?: string; // Meal SSR code (VGML, HNML, etc.)
  otherRequests?: string; // Free text for other special requests
}

interface ValidationErrors {
  [key: string]: string;
}

interface CompactPassengerFormProps {
  passengers: PassengerData[];
  isInternational: boolean;
  onUpdate: (passengers: PassengerData[]) => void;
  contactEmail?: string;
  contactPhone?: string;
}

export function CompactPassengerForm({
  passengers,
  isInternational,
  onUpdate,
  contactEmail = '',
  contactPhone = '',
}: CompactPassengerFormProps) {
  const [formData, setFormData] = useState<PassengerData[]>(passengers);
  const [errors, setErrors] = useState<{ [passengerId: string]: ValidationErrors }>({});
  const [useFirstPassengerContact, setUseFirstPassengerContact] = useState(true);
  const [expandedPassenger, setExpandedPassenger] = useState<string>(passengers[0]?.id || '');

  useEffect(() => {
    onUpdate(formData);
  }, [formData]);

  const validateField = (passengerId: string, field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email address';
        }
        break;
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]{10,}$/.test(value)) {
          return 'Invalid phone number';
        }
        break;
      case 'dateOfBirth':
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime()) || date > new Date()) {
            return 'Invalid date';
          }
        }
        break;
      case 'passportExpiry':
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime()) || date < new Date()) {
            return 'Passport must be valid for travel';
          }
        }
        break;
    }
    return '';
  };

  const updatePassenger = (passengerId: string, field: keyof PassengerData, value: string | boolean) => {
    setFormData(prev => prev.map(p => {
      if (p.id === passengerId) {
        const updated = { ...p, [field]: value };

        // Validate field
        if (typeof value === 'string') {
          const error = validateField(passengerId, field, value);
          setErrors(prevErrors => ({
            ...prevErrors,
            [passengerId]: {
              ...prevErrors[passengerId],
              [field]: error,
            },
          }));
        }

        return updated;
      }
      return p;
    }));
  };

  const isPassengerComplete = (passenger: PassengerData, passengerIndex: number): boolean => {
    const required = ['title', 'firstName', 'lastName', 'dateOfBirth', 'nationality'];
    // PASSPORT IS OPTIONAL - Passengers can add it later
    // International flights don't require passport at booking time

    // First passenger must have email and phone for contact
    if (passengerIndex === 0) {
      required.push('email', 'phone');
    }
    return required.every(field => {
      const value = passenger[field as keyof PassengerData];
      return value && value.toString().trim() !== '';
    });
  };

  return (
    <div className="space-y-3 px-1 sm:px-0">
      {/* Passengers */}
      {formData.map((passenger, index) => {
        const isExpanded = expandedPassenger === passenger.id;
        const isComplete = isPassengerComplete(passenger, index);
        const passengerErrors = errors[passenger.id] || {};

        return (
          <div key={passenger.id} className="border border-gray-200 rounded-lg bg-white mx-0">
            {/* Passenger Header */}
            <button
              onClick={() => setExpandedPassenger(isExpanded ? '' : passenger.id)}
              className="w-full p-3 flex items-center gap-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                isComplete ? 'bg-success-100 text-success-700' : 'bg-primary-50 text-primary-600'
              }`}>
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">
                  Passenger {index + 1} ({passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)})
                </h4>
                {isComplete && passenger.firstName && passenger.lastName && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </p>
                )}
                {!isComplete && (
                  <p className="text-xs text-warning-600 mt-0.5">
                    Please complete all required fields
                  </p>
                )}
              </div>

              <div className="text-gray-400">
                {isExpanded ? '▲' : '▼'}
              </div>
            </button>

            {/* Passenger Form */}
            {isExpanded && (
              <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50 space-y-2.5">
                {/* Row 1: Title, First Name, Last Name - Mobile-first stacked */}
                <div className="grid grid-cols-4 sm:grid-cols-12 gap-2">
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary-500" />
                      Title *
                    </label>
                    <select
                      value={passenger.title}
                      onChange={(e) => updatePassenger(passenger.id, 'title', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <UserCircle className="w-3.5 h-3.5 text-primary-500" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                      placeholder="As on passport"
                      className="w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 placeholder:text-gray-400 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <UserCircle className="w-3.5 h-3.5 text-primary-500" />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                      placeholder="As on passport"
                      className="w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 placeholder:text-gray-400 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Date of Birth, Nationality */}
                <div className="grid grid-cols-2 gap-2">
                  <DateInput
                    value={passenger.dateOfBirth}
                    onChange={(value) => updatePassenger(passenger.id, 'dateOfBirth', value)}
                    label="Date of Birth"
                    required
                    error={passengerErrors.dateOfBirth}
                    usFormat={true}
                    useDropdowns={true}
                    yearRange={{ start: 1924, end: new Date().getFullYear() }}
                    maxDate={new Date().toISOString().split('T')[0]}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-primary-500" />
                      Nationality *
                    </label>
                    <select
                      value={passenger.nationality}
                      onChange={(e) => updatePassenger(passenger.id, 'nationality', e.target.value)}
                      className="w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Passport Details (International only) - OPTIONAL */}
                {isInternational && (
                  <div className="p-2.5 bg-info-50 border border-info-200 rounded-lg">
                    <h5 className="text-xs font-bold text-neutral-800 mb-1 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Passport Details (Optional)
                    </h5>
                    <p className="text-xs text-primary-600 mb-2">
                      ℹ️ You can add passport details now or update them later before your flight
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-info-500" />
                          Passport Number
                        </label>
                        <input
                          type="text"
                          value={passenger.passportNumber || ''}
                          onChange={(e) => updatePassenger(passenger.id, 'passportNumber', e.target.value)}
                          placeholder="AB123456 (optional)"
                          className="w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 placeholder:text-gray-400 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <DateInput
                          value={passenger.passportExpiry || ''}
                          onChange={(value) => updatePassenger(passenger.id, 'passportExpiry', value)}
                          label="Passport Expiry"
                          required={false}
                          error={passengerErrors.passportExpiry}
                          usFormat={true}
                          useDropdowns={true}
                          yearRange={{ start: new Date().getFullYear(), end: new Date().getFullYear() + 20 }}
                          minDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info (First passenger only) */}
                {index === 0 && (
                  <div className="pt-2.5 border-t border-gray-200">
                    <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h5>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-primary-500" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={passenger.email || ''}
                          onChange={(e) => updatePassenger(passenger.id, 'email', e.target.value)}
                          placeholder="your@email.com"
                          className={`w-full px-2 sm:px-3 py-2.5 text-sm text-neutral-800 placeholder:text-gray-400 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 ${
                            passengerErrors.email ? 'border-error-500' : 'border-gray-300'
                          }`}
                          required
                        />
                        {passengerErrors.email && (
                          <p className="text-xs text-error-500 mt-1">{passengerErrors.email}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Booking confirmation will be sent here</p>
                      </div>

                      <div>
                        <PhoneInput
                          value={passenger.phone || ''}
                          onChange={(value, countryCode) => updatePassenger(passenger.id, 'phone', value)}
                          label="Phone"
                          required
                          error={passengerErrors.phone}
                          defaultCountry="US"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Fields (Collapsed by default) */}
                <details className="group">
                  <summary className="cursor-pointer text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    Optional Information
                  </summary>

                  <div className="mt-2 space-y-2 pl-3">
                    {/* Frequent Flyer */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <Plane className="w-3.5 h-3.5 text-primary-500" />
                            Airline / Program
                          </label>
                          <select
                            value={passenger.frequentFlyerAirline || ''}
                            onChange={(e) => updatePassenger(passenger.id, 'frequentFlyerAirline', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Select Airline</option>
                            <optgroup label="⭐ Star Alliance">
                              {AIRLINES_BY_ALLIANCE['Star Alliance'].map(airline => (
                                <option key={airline.code} value={airline.code}>
                                  {airline.name} ({airline.frequentFlyerProgram})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="🌐 Oneworld">
                              {AIRLINES_BY_ALLIANCE['Oneworld'].map(airline => (
                                <option key={airline.code} value={airline.code}>
                                  {airline.name} ({airline.frequentFlyerProgram})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="🔷 SkyTeam">
                              {AIRLINES_BY_ALLIANCE['SkyTeam'].map(airline => (
                                <option key={airline.code} value={airline.code}>
                                  {airline.name} ({airline.frequentFlyerProgram})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="✈️ Independent">
                              {AIRLINES_BY_ALLIANCE['Independent'].map(airline => (
                                <option key={airline.code} value={airline.code}>
                                  {airline.name} ({airline.frequentFlyerProgram})
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-primary-500" />
                            Membership Number
                          </label>
                          <input
                            type="text"
                            value={passenger.frequentFlyerNumber || ''}
                            onChange={(e) => updatePassenger(passenger.id, 'frequentFlyerNumber', e.target.value)}
                            placeholder={passenger.frequentFlyerAirline ? 'Enter number' : 'Select airline first'}
                            disabled={!passenger.frequentFlyerAirline}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      {passenger.frequentFlyerAirline && (
                        <div className="space-y-1">
                          <p className="text-xs text-primary-600 flex items-center gap-1">
                            ✈️ Program: <span className="font-semibold">
                              {AIRLINES.find(a => a.code === passenger.frequentFlyerAirline)?.frequentFlyerProgram}
                            </span>
                          </p>
                          {passenger.frequentFlyerNumber && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                              <p className="text-xs text-green-800 font-semibold mb-1">Estimated Miles Earned:</p>
                              <p className="text-xs text-green-700">
                                This flight will earn approximately <span className="font-bold">500-1,500 miles</span> based on
                                distance and fare class. Exact miles calculated after booking.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* TSA PreCheck */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-primary-500" />
                        TSA PreCheck Number
                      </label>
                      <input
                        type="text"
                        value={passenger.tsaPreCheck || ''}
                        onChange={(e) => updatePassenger(passenger.id, 'tsaPreCheck', e.target.value)}
                        placeholder="KTN12345678"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    {/* Special Assistance Tabs */}
                    <div className="pt-2">
                      <SpecialAssistanceTabs
                        wheelchairAssistance={passenger.wheelchairAssistance || ''}
                        mealPreference={passenger.mealPreference || ''}
                        otherRequests={passenger.otherRequests || ''}
                        onWheelchairChange={(value) => updatePassenger(passenger.id, 'wheelchairAssistance', value)}
                        onMealChange={(value) => updatePassenger(passenger.id, 'mealPreference', value)}
                        onOtherRequestsChange={(value) => updatePassenger(passenger.id, 'otherRequests', value)}
                      />
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
