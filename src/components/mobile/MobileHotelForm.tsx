'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOffice2Icon,
  CalendarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface MobileHotelFormProps {
  onSearch?: (searchData: any) => void;
  className?: string;
}

type StepType = 'destination' | 'dates' | 'guests' | 'preferences' | 'budget';

export default function MobileHotelForm({ onSearch, className = '' }: MobileHotelFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('destination');
  const [formData, setFormData] = useState({
    // Core hotel data
    destination: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    guests: {
      adults: 2,
      children: 0,
      infants: 0
    },
    
    // Hotel preferences
    starRating: 'any',
    hotelCategory: 'qualquer',
    amenities: [] as string[],
    preferences: [] as string[],
    locationPreference: 'qualquer',
    
    // Budget and options
    budgetRange: '',
    flexibleDates: false,
    specialRequests: ''
  });

  const steps = [
    { id: 'destination', title: 'Destino', icon: MapPinIcon },
    { id: 'dates', title: 'Datas', icon: CalendarIcon },
    { id: 'guests', title: 'Quartos & Hóspedes', icon: UserGroupIcon },
    { id: 'preferences', title: 'Preferências', icon: StarIcon },
    { id: 'budget', title: 'Orçamento', icon: BuildingOffice2Icon }
  ];

  const handleNext = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'guests', 'preferences', 'budget'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      // Submit the form
      handleSubmit();
    }
  };

  const handleBack = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'guests', 'preferences', 'budget'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    console.log('Hotel search:', formData);
    if (onSearch) {
      onSearch(formData);
    }
  };

  const getCurrentStepIndex = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'guests', 'preferences', 'budget'];
    return stepOrder.indexOf(currentStep) + 1;
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-emerald-50 to-teal-50 ${className}`}>
      {/* Progress Bar */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            Passo {getCurrentStepIndex()} de {steps.length}
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            {steps.find(s => s.id === currentStep)?.title}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(getCurrentStepIndex() / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {/* Destination Step */}
            {currentStep === 'destination' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BuildingOffice2Icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Para onde você vai?</h2>
                  <p className="text-gray-600">Escolha sua cidade ou hotel</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cidade, hotel ou região"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg"
                    />
                  </div>

                  {/* Popular Destinations */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Destinos Populares</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza'].map((city) => (
                        <button
                          key={city}
                          onClick={() => setFormData({ ...formData, destination: city })}
                          className="p-3 bg-white rounded-xl border border-gray-200 text-left hover:border-emerald-500 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{city}</div>
                          <div className="text-xs text-gray-500">Brasil</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dates Step */}
            {currentStep === 'dates' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quando você vai?</h2>
                  <p className="text-gray-600">Escolha as datas da estadia</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg"
                    />
                  </div>

                  {/* Quick Date Options */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors">
                      <div className="font-medium text-gray-800">Final de Semana</div>
                      <div className="text-xs text-gray-500">Sex - Dom</div>
                    </button>
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors">
                      <div className="font-medium text-gray-800">Uma Semana</div>
                      <div className="text-xs text-gray-500">7 noites</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guests Step */}
            {currentStep === 'guests' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quantos hóspedes?</h2>
                  <p className="text-gray-600">Defina quartos e hóspedes</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-800">Quartos</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFormData({ ...formData, rooms: Math.max(1, formData.rooms - 1) })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">{formData.rooms}</span>
                        <button
                          onClick={() => setFormData({ ...formData, rooms: formData.rooms + 1 })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Hóspedes</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFormData({ 
                            ...formData, 
                            guests: { 
                              ...formData.guests, 
                              adults: Math.max(1, formData.guests.adults - 1) 
                            } 
                          })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">
                          {formData.guests.adults + formData.guests.children + formData.guests.infants}
                        </span>
                        <button
                          onClick={() => setFormData({ 
                            ...formData, 
                            guests: { 
                              ...formData.guests, 
                              adults: formData.guests.adults + 1 
                            } 
                          })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Step */}
            {currentStep === 'preferences' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Suas Preferências</h2>
                  <p className="text-gray-600">Personalize sua busca</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Categoria do Hotel</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['3★', '4★', '5★', 'Qualquer'].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFormData({ ...formData, starRating: rating })}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.starRating === rating
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 bg-white hover:border-emerald-300'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Comodidades</label>
                    <div className="space-y-2">
                      {['Piscina', 'Academia', 'Wi-Fi Grátis', 'Café da Manhã'].map((amenity) => (
                        <label key={amenity} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-300">
                          <input
                            type="checkbox"
                            checked={formData.preferences.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, preferences: [...formData.preferences, amenity] });
                              } else {
                                setFormData({ ...formData, preferences: formData.preferences.filter(p => p !== amenity) });
                              }
                            }}
                            className="mr-3 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-gray-800">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t p-4 space-y-3">
        <div className="flex gap-3">
          {getCurrentStepIndex() > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            {getCurrentStepIndex() === steps.length ? (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                Buscar Hotéis
              </>
            ) : (
              <>
                Continuar
                <ChevronRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}