'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface MobilePackageFormProps {
  onSearch?: (searchData: any) => void;
  className?: string;
}

type StepType = 'destination' | 'dates' | 'travelers' | 'preferences';

export default function MobilePackageForm({ onSearch, className = '' }: MobilePackageFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('destination');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 2,
    children: 0,
    rooms: 1,
    flightClass: 'economy',
    hotelStars: 'any',
    needsCar: false,
    packageType: 'flight_hotel',
    budget: 'medium'
  });

  const steps = [
    { id: 'destination', title: 'Destinos', icon: GlobeAltIcon },
    { id: 'dates', title: 'Datas', icon: CalendarIcon },
    { id: 'travelers', title: 'Viajantes', icon: UserGroupIcon },
    { id: 'preferences', title: 'Preferências', icon: StarIcon }
  ];

  const handleNext = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'travelers', 'preferences'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'travelers', 'preferences'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    console.log('Package search:', formData);
    if (onSearch) {
      onSearch(formData);
    }
  };

  const getCurrentStepIndex = () => {
    const stepOrder: StepType[] = ['destination', 'dates', 'travelers', 'preferences'];
    return stepOrder.indexOf(currentStep) + 1;
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-rose-50 to-pink-50 ${className}`}>
      {/* Progress Bar */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            Passo {getCurrentStepIndex()} de {steps.length}
          </span>
          <span className="text-sm font-semibold text-rose-600">
            {steps.find(s => s.id === currentStep)?.title}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
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
                  <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GlobeAltIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Para onde vamos?</h2>
                  <p className="text-gray-600">Escolha sua origem e destino</p>
                </div>

                <div className="space-y-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">De onde você sai?</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cidade de origem"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Para onde você quer ir?</label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Destino dos sonhos"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg"
                      />
                    </div>
                  </div>

                  {/* Popular Destinations */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Destinos Populares</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { city: 'Rio de Janeiro', country: 'Brasil', flag: '🇧🇷' },
                        { city: 'São Paulo', country: 'Brasil', flag: '🇧🇷' },
                        { city: 'Salvador', country: 'Brasil', flag: '🇧🇷' },
                        { city: 'Fortaleza', country: 'Brasil', flag: '🇧🇷' }
                      ].map((dest) => (
                        <button
                          key={dest.city}
                          onClick={() => setFormData({ ...formData, destination: dest.city })}
                          className="p-3 bg-white rounded-xl border border-gray-200 text-left hover:border-rose-500 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{dest.flag}</span>
                            <div className="font-medium text-gray-800">{dest.city}</div>
                          </div>
                          <div className="text-xs text-gray-500">{dest.country}</div>
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
                  <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quando será a viagem?</h2>
                  <p className="text-gray-600">Escolha suas datas</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Ida</label>
                    <input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Volta</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg"
                    />
                  </div>

                  {/* Duration Suggestions */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-rose-500 transition-colors">
                      <div className="font-medium text-gray-800">3 Dias</div>
                      <div className="text-xs text-gray-500">Fim de semana</div>
                    </button>
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-rose-500 transition-colors">
                      <div className="font-medium text-gray-800">1 Semana</div>
                      <div className="text-xs text-gray-500">Clássico</div>
                    </button>
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-rose-500 transition-colors">
                      <div className="font-medium text-gray-800">2 Semanas</div>
                      <div className="text-xs text-gray-500">Relax</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Travelers Step */}
            {currentStep === 'travelers' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quem vai viajar?</h2>
                  <p className="text-gray-600">Defina os viajantes</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">Adultos</span>
                        <div className="text-sm text-gray-500">12+ anos</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">{formData.adults}</span>
                        <button
                          onClick={() => setFormData({ ...formData, adults: formData.adults + 1 })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">Crianças</span>
                        <div className="text-sm text-gray-500">2-11 anos</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFormData({ ...formData, children: Math.max(0, formData.children - 1) })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">{formData.children}</span>
                        <button
                          onClick={() => setFormData({ ...formData, children: formData.children + 1 })}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between">
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
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Step */}
            {currentStep === 'preferences' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Suas Preferências</h2>
                  <p className="text-gray-600">Personalize seu pacote</p>
                </div>

                <div className="space-y-6">
                  {/* Package Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">O que incluir no pacote?</label>
                    <div className="space-y-3">
                      {[
                        { id: 'flight_hotel', label: 'Voo + Hotel', icons: '✈️🏨' },
                        { id: 'flight_hotel_car', label: 'Voo + Hotel + Carro', icons: '✈️🏨🚗' },
                        { id: 'complete', label: 'Pacote Completo', icons: '✨' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, packageType: type.id })}
                          className={`w-full p-4 rounded-xl border-2 transition-colors text-left ${
                            formData.packageType === type.id
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-200 bg-white hover:border-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{type.icons}</span>
                            <span className="font-medium">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flight Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Classe do Voo</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Econômica', 'Executiva'].map((flightClass) => (
                        <button
                          key={flightClass}
                          onClick={() => setFormData({ ...formData, flightClass: flightClass.toLowerCase() })}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.flightClass === flightClass.toLowerCase()
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-200 bg-white hover:border-rose-300'
                          }`}
                        >
                          {flightClass}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Faixa de Orçamento</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'Econômico', icon: '💰' },
                        { id: 'medium', label: 'Médio', icon: '💳' },
                        { id: 'high', label: 'Premium', icon: '✨' }
                      ].map((budget) => (
                        <button
                          key={budget.id}
                          onClick={() => setFormData({ ...formData, budget: budget.id })}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.budget === budget.id
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-gray-200 bg-white hover:border-rose-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{budget.icon}</div>
                          <div className="text-sm font-medium">{budget.label}</div>
                        </button>
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            {getCurrentStepIndex() === steps.length ? (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                Buscar Pacotes
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