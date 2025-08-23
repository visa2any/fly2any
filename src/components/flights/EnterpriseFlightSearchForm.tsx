'use client';

/**
 * 🏢 ENTERPRISE FLIGHT SEARCH FORM
 * Premium full-width one-line search form with enterprise UX
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import AirportAutocomplete from './AirportAutocomplete';
import DatePicker from '@/components/DatePicker';
import { FlightSearchFormData, TravelClass, AirportSelection, FlightSegment } from '@/types/flights';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, ChevronDownIcon, LightBulbIcon, SparklesIcon, PlusIcon, MinusIcon } from '@/components/Icons';

interface EnterpriseFlightSearchFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  isLoading?: boolean;
  showHeader?: boolean;
  className?: string;
}

const TRAVEL_CLASSES: { value: TravelClass; label: string; icon: string }[] = [
  { value: 'ECONOMY', label: 'Economy', icon: '💺' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy', icon: '✈️' },
  { value: 'BUSINESS', label: 'Business', icon: '🥂' },
  { value: 'FIRST', label: 'First Class', icon: '👑' },
];

export default function EnterpriseFlightSearchForm({ 
  onSearch, 
  isLoading = false, 
  showHeader = true,
  className = '' 
}: EnterpriseFlightSearchFormProps) {
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: null,
    destination: null,
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'ECONOMY' as TravelClass,
    segments: [
      {
        origin: null,
        destination: null,
        departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        origin: null,
        destination: null,
        departureDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
      }
    ],
    preferences: {
      nonStop: false,
      flexibleDates: { enabled: false, days: 2 },
      preferredAirlines: []
    }
  });

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);

  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  // Handle click outside
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

  const swapAirports = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  // Multi-city segment management
  const addSegment = () => {
    if (formData.segments && formData.segments.length < 6) {
      const lastSegment = formData.segments[formData.segments.length - 1];
      const newSegment: FlightSegment = {
        origin: lastSegment?.destination || null,
        destination: null,
        departureDate: new Date(Date.now() + (formData.segments.length + 7) * 24 * 60 * 60 * 1000)
      };
      
      setFormData(prev => ({
        ...prev,
        segments: [...(prev.segments || []), newSegment]
      }));
    }
  };

  const removeSegment = (index: number) => {
    if (formData.segments && formData.segments.length > 2) {
      setFormData(prev => ({
        ...prev,
        segments: prev.segments?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const updateSegment = (index: number, updates: Partial<FlightSegment>) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments?.map((segment, i) => 
        i === index ? { ...segment, ...updates } : segment
      ) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  const getTotalPassengers = () => {
    return formData.passengers.adults + formData.passengers.children + formData.passengers.infants;
  };

  const getPassengerText = () => {
    const total = getTotalPassengers();
    if (total === 1) return '1 Passenger';
    return `${total} Passengers`;
  };

  const getClassText = () => {
    return TRAVEL_CLASSES.find(c => c.value === formData.travelClass)?.label || 'Economy';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header with Navigation */}
      {showHeader && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <FlightIcon className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">Fly2Any</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="/flights" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Flights</a>
                  <a href="/hotels" className="text-gray-700 hover:text-blue-600 transition-colors">Hotels</a>
                  <a href="/cars" className="text-gray-700 hover:text-blue-600 transition-colors">Cars</a>
                  <a href="/packages" className="text-gray-700 hover:text-blue-600 transition-colors">Packages</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-700 hover:text-blue-600 transition-colors">My Trips</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Search Form */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Search Flights
              <span className="ml-3 inline-flex items-center gap-2 text-yellow-400">
                <SparklesIcon className="w-8 h-8" />
                AI-Powered
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Compare 500+ airlines instantly • Save up to 60% • Sub-1 second results
            </p>
          </div>

          {/* Trip Type Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 flex">
              {[
                { value: 'round-trip', label: 'Round Trip', icon: '↔️' },
                { value: 'one-way', label: 'One Way', icon: '→' },
                { value: 'multi-city', label: 'Multi-City', icon: '🌐' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tripType: type.value as any }))}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    formData.tripType === type.value
                      ? 'bg-white text-blue-700 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Search Form - Full Width One Line */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div 
              className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
                isFormFocused ? 'ring-4 ring-blue-300/50 shadow-3xl' : ''
              }`}
              onFocus={() => setIsFormFocused(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsFormFocused(false);
                }
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                
                {/* Origin Airport */}
                <div className="lg:col-span-2 p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From
                  </label>
                  <AirportAutocomplete
                    value={formData.origin}
                    onChange={(airport) => setFormData(prev => ({ ...prev, origin: airport }))}
                    placeholder="Departure city or airport"
                    className="text-lg"
                  />
                </div>

                {/* Swap Button */}
                <div className="hidden lg:flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={swapAirports}
                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors group"
                    title="Swap airports"
                  >
                    <SwitchIcon className="w-5 h-5 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                </div>

                {/* Destination Airport */}
                <div className="lg:col-span-2 p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To
                  </label>
                  <AirportAutocomplete
                    value={formData.destination}
                    onChange={(airport) => setFormData(prev => ({ ...prev, destination: airport }))}
                    placeholder="Destination city or airport"
                    className="text-lg"
                  />
                </div>

                {/* Dates */}
                <div className="lg:col-span-1 p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Departure
                  </label>
                  <DatePicker
                    value={formData.departureDate.toISOString().split('T')[0]}
                    onChange={(date) => setFormData(prev => ({ ...prev, departureDate: new Date(date) }))}
                    placeholder="Select date"
                    className="text-base"
                  />
                  {formData.tripType === 'round-trip' && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return
                      </label>
                      <DatePicker
                        value={formData.returnDate?.toISOString().split('T')[0] || ''}
                        onChange={(date) => setFormData(prev => ({ ...prev, returnDate: new Date(date) }))}
                        placeholder="Select date"
                        className="text-base"
                        minDate={formData.departureDate.toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>

                {/* Passengers & Class */}
                <div className="lg:col-span-1 p-6 space-y-4">
                  {/* Passengers */}
                  <div className="relative" ref={passengerRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passengers
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                      className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                        {getPassengerText()}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showPassengerDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
                        >
                          {/* Adults */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Adults</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, adults: Math.max(1, prev.passengers.adults - 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{formData.passengers.adults}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, adults: Math.min(9, prev.passengers.adults + 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          {/* Children */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">Children <span className="text-sm text-gray-500">(2-11)</span></span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, children: Math.max(0, prev.passengers.children - 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{formData.passengers.children}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, children: Math.min(9, prev.passengers.children + 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Infants <span className="text-sm text-gray-500">(Under 2)</span></span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, infants: Math.max(0, prev.passengers.infants - 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{formData.passengers.infants}</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, infants: Math.min(9, prev.passengers.infants + 1) }
                                }))}
                                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Travel Class */}
                  <div className="relative" ref={classRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowClassDropdown(!showClassDropdown)}
                      className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>{TRAVEL_CLASSES.find(c => c.value === formData.travelClass)?.icon}</span>
                        {getClassText()}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showClassDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showClassDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                        >
                          {TRAVEL_CLASSES.map((travelClass) => (
                            <button
                              key={travelClass.value}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, travelClass: travelClass.value }));
                                setShowClassDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                formData.travelClass === travelClass.value ? 'bg-blue-50 text-blue-700' : ''
                              }`}
                            >
                              <span>{travelClass.icon}</span>
                              {travelClass.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Multi-City Segments */}
              {formData.tripType === 'multi-city' && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Flight Segments</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {formData.segments?.length || 0} of 6 segments
                      </span>
                      {formData.segments && formData.segments.length < 6 && (
                        <button
                          type="button"
                          onClick={addSegment}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Add Segment
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.segments?.map((segment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Segment {index + 1}
                            {index === 0 && <span className="ml-2 text-sm text-blue-600">(Departure)</span>}
                            {index === (formData.segments?.length || 0) - 1 && index > 0 && (
                              <span className="ml-2 text-sm text-green-600">(Final)</span>
                            )}
                          </h4>
                          {formData.segments && formData.segments.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeSegment(index)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Remove segment"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* From */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              From {index === 0 ? '' : `(${formData.segments?.[index-1]?.destination?.city || 'Previous destination'})`}
                            </label>
                            <AirportAutocomplete
                              value={segment.origin}
                              onChange={(airport) => updateSegment(index, { origin: airport })}
                              placeholder="Departure city"
                            />
                          </div>

                          {/* To */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              To
                            </label>
                            <AirportAutocomplete
                              value={segment.destination}
                              onChange={(airport) => updateSegment(index, { destination: airport })}
                              placeholder="Destination city"
                            />
                          </div>

                          {/* Departure Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Departure Date
                            </label>
                            <DatePicker
                              value={segment.departureDate.toISOString().split('T')[0]}
                              onChange={(date) => updateSegment(index, { departureDate: new Date(date) })}
                              placeholder="Select date"
                              minDate={index === 0 ? new Date().toISOString().split('T')[0] : formData.segments?.[index-1]?.departureDate.toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              <div className="border-t border-gray-200 p-6">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
                >
                  <LightBulbIcon className="w-4 h-4" />
                  Advanced Options
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Non-stop flights */}
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences.nonStop}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, nonStop: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">Non-stop flights only</span>
                        </label>

                        {/* Flexible dates */}
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.preferences.flexibleDates && 'enabled' in formData.preferences.flexibleDates) ? formData.preferences.flexibleDates.enabled : (formData.preferences.flexibleDates && 'departure' in formData.preferences.flexibleDates) ? formData.preferences.flexibleDates.departure.enabled : false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                flexibleDates: { 
                                  ...(prev.preferences.flexibleDates || { days: 3, enabled: false, maxDays: 7 }), 
                                  enabled: e.target.checked 
                                }
                              }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">Flexible dates (±2 days)</span>
                        </label>

                        {/* Price alerts */}
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">Set up price alerts</span>
                        </label>

                        {/* Nearby airports */}
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">Include nearby airports</span>
                        </label>

                        {/* Smart recommendations */}
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="font-medium">Smart recommendations</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Button */}
              <div className="p-6 pt-0">
                <motion.button
                  type="submit"
                  disabled={isLoading || !formData.origin?.iataCode || !formData.destination?.iataCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-bold py-6 px-8 rounded-xl text-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-3xl relative overflow-hidden group"
                >
                  {/* Premium shine effect */}
                  <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching Flights...</span>
                      <div className="flex gap-1 ml-2">
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <FlightIcon className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" />
                      <span>Search 500+ Airlines</span>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⚡</span>
                        <span className="text-sm bg-yellow-400 text-blue-900 px-2 py-1 rounded-full font-semibold">
                          AI-Powered
                        </span>
                      </div>
                    </div>
                  )}
                </motion.button>

                {/* Search confidence indicator */}
                {(formData.origin?.iataCode && formData.destination?.iataCode) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ready to search • Estimated results: 50-150 flights
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Trust Signals */}
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Price Match Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}