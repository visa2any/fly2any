'use client';

import { useState } from 'react';
import { User, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { DateInput } from '@/components/ui/DateInput';

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO format YYYY-MM-DD
  email: string;
  phone: string;
  gender: 'male' | 'female';
  title: 'mr' | 'mrs' | 'ms' | 'miss';
  // International flights only
  passportNumber?: string;
  passportExpiryDate?: string; // ISO format YYYY-MM-DD
  nationality?: string;
}

interface PassengerDetailsWidgetProps {
  passengerCount: number;
  flightType: 'domestic' | 'international';
  onSubmit: (passengers: PassengerInfo[]) => void;
  onBack?: () => void;
  isProcessing?: boolean;
}

interface ValidationErrors {
  [passengerId: string]: {
    [field: string]: string;
  };
}

export function PassengerDetailsWidget({
  passengerCount,
  flightType,
  onSubmit,
  onBack,
  isProcessing = false,
}: PassengerDetailsWidgetProps) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    Array.from({ length: passengerCount }, () => ({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      gender: 'male' as const,
      title: 'mr' as const,
      passportNumber: '',
      passportExpiryDate: '',
      nationality: 'US',
    }))
  );

  const [expandedPassenger, setExpandedPassenger] = useState<number>(0);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validatePassenger = (passenger: PassengerInfo, index: number): boolean => {
    const passengerErrors: { [field: string]: string } = {};

    // Required fields
    if (!passenger.firstName.trim()) {
      passengerErrors.firstName = 'First name is required';
    }

    if (!passenger.lastName.trim()) {
      passengerErrors.lastName = 'Last name is required';
    }

    if (!passenger.dateOfBirth) {
      passengerErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Check if passenger is at least 2 years old (infant minimum age)
      const birthDate = new Date(passenger.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        passengerErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!passenger.email.trim()) {
      passengerErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
      passengerErrors.email = 'Please enter a valid email';
    }

    if (!passenger.phone.trim()) {
      passengerErrors.phone = 'Phone number is required';
    }

    // International flights require passport
    if (flightType === 'international') {
      if (!passenger.passportNumber?.trim()) {
        passengerErrors.passportNumber = 'Passport number is required for international flights';
      }

      if (!passenger.passportExpiryDate) {
        passengerErrors.passportExpiryDate = 'Passport expiry date is required';
      } else {
        // Passport must be valid for at least 6 months
        const expiryDate = new Date(passenger.passportExpiryDate);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        if (expiryDate < sixMonthsFromNow) {
          passengerErrors.passportExpiryDate =
            'Passport must be valid for at least 6 months';
        }
      }

      if (!passenger.nationality?.trim()) {
        passengerErrors.nationality = 'Nationality is required for international flights';
      }
    }

    if (Object.keys(passengerErrors).length > 0) {
      setErrors(prev => ({ ...prev, [index]: passengerErrors }));
      return false;
    }

    // Clear errors for this passenger
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    return true;
  };

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerInfo,
    value: string
  ) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for this field
    if (errors[index]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: '',
        },
      }));
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;

    // Validate all passengers
    passengers.forEach((passenger, index) => {
      if (!validatePassenger(passenger, index)) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      // Remove optional empty fields for domestic flights
      const cleanedPassengers = passengers.map(p => {
        if (flightType === 'domestic') {
          const { passportNumber, passportExpiryDate, nationality, ...domestic } = p;
          return domestic;
        }
        return p;
      });

      onSubmit(cleanedPassengers as PassengerInfo[]);
    } else {
      // Expand first passenger with errors
      const firstErrorIndex = parseInt(Object.keys(errors)[0] || '0');
      setExpandedPassenger(firstErrorIndex);
    }
  };

  const isPassengerComplete = (passenger: PassengerInfo, index: number): boolean => {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'email', 'phone'];
    const hasRequiredFields = requiredFields.every(field =>
      passenger[field as keyof PassengerInfo]?.toString().trim()
    );

    if (flightType === 'international') {
      const hasPassport = Boolean(
        passenger.passportNumber?.trim() &&
        passenger.passportExpiryDate &&
        passenger.nationality?.trim()
      );
      return hasRequiredFields && hasPassport && !errors[index];
    }

    return hasRequiredFields && !errors[index];
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Passenger Details</h3>
          <p className="text-sm text-gray-600">
            {flightType === 'international'
              ? 'Please provide passport information for international travel'
              : 'Enter passenger information as it appears on government ID'}
          </p>
        </div>
      </div>

      {/* Passenger Accordions */}
      <div className="space-y-3 mb-6">
        {passengers.map((passenger, index) => {
          const isExpanded = expandedPassenger === index;
          const isComplete = isPassengerComplete(passenger, index);
          const hasErrors = !!errors[index];

          return (
            <div
              key={index}
              className={`border-2 rounded-lg transition-all ${
                hasErrors
                  ? 'border-red-300 bg-red-50'
                  : isComplete
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedPassenger(isExpanded ? -1 : index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : hasErrors ? (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {passenger.firstName && passenger.lastName
                        ? `${passenger.firstName} ${passenger.lastName}`
                        : `Passenger ${index + 1}`}
                    </div>
                    {isComplete && !isExpanded && (
                      <div className="text-xs text-gray-600">{passenger.email}</div>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Title & Name */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Title *
                      </label>
                      <select
                        value={passenger.title}
                        onChange={e =>
                          handlePassengerChange(index, 'title', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="mr">Mr</option>
                        <option value="mrs">Mrs</option>
                        <option value="ms">Ms</option>
                        <option value="miss">Miss</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={e =>
                          handlePassengerChange(index, 'firstName', e.target.value)
                        }
                        placeholder="John"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors[index]?.firstName
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[index]?.firstName && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[index].firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={e =>
                          handlePassengerChange(index, 'lastName', e.target.value)
                        }
                        placeholder="Doe"
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors[index]?.lastName
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[index]?.lastName && (
                        <p className="text-xs text-red-600 mt-1">{errors[index].lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <DateInput
                        label="Date of Birth *"
                        value={passenger.dateOfBirth}
                        onChange={value => handlePassengerChange(index, 'dateOfBirth', value)}
                        maxDate={new Date().toISOString().split('T')[0]}
                        error={errors[index]?.dateOfBirth}
                        required
                        useDropdowns
                        yearRange={{
                          start: new Date().getFullYear() - 100,
                          end: new Date().getFullYear(),
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={e =>
                          handlePassengerChange(index, 'gender', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={e => handlePassengerChange(index, 'email', e.target.value)}
                      placeholder="john.doe@example.com"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors[index]?.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors[index]?.email && (
                      <p className="text-xs text-red-600 mt-1">{errors[index].email}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Booking confirmation will be sent to this email
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <PhoneInput
                      label="Phone *"
                      value={passenger.phone}
                      onChange={value => handlePassengerChange(index, 'phone', value)}
                      error={errors[index]?.phone}
                      required
                    />
                  </div>

                  {/* International Flight Fields */}
                  {flightType === 'international' && (
                    <>
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Passport Information
                        </p>

                        <div className="space-y-3">
                          {/* Passport Number */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Passport Number *
                            </label>
                            <input
                              type="text"
                              value={passenger.passportNumber || ''}
                              onChange={e =>
                                handlePassengerChange(index, 'passportNumber', e.target.value)
                              }
                              placeholder="A12345678"
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                errors[index]?.passportNumber
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              }`}
                            />
                            {errors[index]?.passportNumber && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors[index].passportNumber}
                              </p>
                            )}
                          </div>

                          {/* Passport Expiry & Nationality */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <DateInput
                                label="Passport Expiry *"
                                value={passenger.passportExpiryDate || ''}
                                onChange={value =>
                                  handlePassengerChange(index, 'passportExpiryDate', value)
                                }
                                minDate={new Date().toISOString().split('T')[0]}
                                error={errors[index]?.passportExpiryDate}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Nationality *
                              </label>
                              <input
                                type="text"
                                value={passenger.nationality || ''}
                                onChange={e =>
                                  handlePassengerChange(index, 'nationality', e.target.value)
                                }
                                placeholder="US"
                                maxLength={2}
                                className={`w-full px-3 py-2 border rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                  errors[index]?.nationality
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                              />
                              {errors[index]?.nationality && (
                                <p className="text-xs text-red-600 mt-1">
                                  {errors[index].nationality}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Continue to Payment</span>
          )}
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        All fields marked with * are required
      </p>
    </div>
  );
}
