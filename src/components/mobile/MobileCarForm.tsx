'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface MobileCarFormProps {
  onSearch?: (searchData: any) => void;
  className?: string;
}

type StepType = 'location' | 'dates' | 'preferences';

export default function MobileCarForm({ onSearch, className = '' }: MobileCarFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('location');
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '10:00',
    dropoffDate: '',
    dropoffTime: '10:00',
    carType: 'any',
    transmission: 'any',
    features: [] as string[]
  });
  const [sameLocation, setSameLocation] = useState(true);

  const steps = [
    { id: 'location', title: 'Local', icon: MapPinIcon },
    { id: 'dates', title: 'Datas', icon: CalendarIcon },
    { id: 'preferences', title: 'Preferências', icon: TruckIcon }
  ];

  const handleNext = () => {
    const stepOrder: StepType[] = ['location', 'dates', 'preferences'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const stepOrder: StepType[] = ['location', 'dates', 'preferences'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    const searchData = {
      ...formData,
      dropoffLocation: sameLocation ? formData.pickupLocation : formData.dropoffLocation
    };
    console.log('Car search:', searchData);
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const getCurrentStepIndex = () => {
    const stepOrder: StepType[] = ['location', 'dates', 'preferences'];
    return stepOrder.indexOf(currentStep) + 1;
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-50 ${className}`}>
      {/* Progress Bar */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            Passo {getCurrentStepIndex()} de {steps.length}
          </span>
          <span className="text-sm font-semibold text-purple-600">
            {steps.find(s => s.id === currentStep)?.title}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
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
            {/* Location Step */}
            {currentStep === 'location' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TruckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Onde retirar o carro?</h2>
                  <p className="text-gray-600">Escolha o local de retirada</p>
                </div>

                <div className="space-y-4">
                  {/* Pickup Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local de Retirada</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Aeroporto, cidade ou endereço"
                        value={formData.pickupLocation}
                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-lg"
                      />
                    </div>
                  </div>

                  {/* Same Location Toggle */}
                  <label className="flex items-center p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={sameLocation}
                      onChange={(e) => setSameLocation(e.target.checked)}
                      className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-800">Devolver no mesmo local</span>
                  </label>

                  {/* Dropoff Location */}
                  {!sameLocation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">Local de Devolução</label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Aeroporto, cidade ou endereço"
                          value={formData.dropoffLocation}
                          onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-lg"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Popular Locations */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Locais Populares</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Aeroporto GRU', 'Aeroporto CGH', 'Centro SP', 'Aeroporto GIG'].map((location) => (
                        <button
                          key={location}
                          onClick={() => setFormData({ ...formData, pickupLocation: location })}
                          className="p-3 bg-white rounded-xl border border-gray-200 text-left hover:border-purple-500 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{location}</div>
                          <div className="text-xs text-gray-500">São Paulo / Rio</div>
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
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Quando você precisa?</h2>
                  <p className="text-gray-600">Defina as datas e horários</p>
                </div>

                <div className="space-y-4">
                  {/* Pickup Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retirada</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                      />
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.pickupTime}
                          onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none appearance-none"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <option key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dropoff Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Devolução</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={formData.dropoffDate}
                        onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                      />
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.dropoffTime}
                          onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none appearance-none"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <option key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quick Duration Options */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition-colors">
                      <div className="font-medium text-gray-800">1 Dia</div>
                    </button>
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition-colors">
                      <div className="font-medium text-gray-800">3 Dias</div>
                    </button>
                    <button className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition-colors">
                      <div className="font-medium text-gray-800">1 Semana</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Step */}
            {currentStep === 'preferences' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TruckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Suas Preferências</h2>
                  <p className="text-gray-600">Escolha o tipo de veículo</p>
                </div>

                <div className="space-y-4">
                  {/* Car Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Categoria do Veículo</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'economy', label: 'Econômico', icon: '🚗' },
                        { id: 'compact', label: 'Compacto', icon: '🚘' },
                        { id: 'suv', label: 'SUV', icon: '🚙' },
                        { id: 'luxury', label: 'Luxo', icon: '🏁' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, carType: type.id })}
                          className={`p-4 rounded-xl border-2 transition-colors ${
                            formData.carType === type.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Transmissão</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Automático', 'Manual'].map((trans) => (
                        <button
                          key={trans}
                          onClick={() => setFormData({ ...formData, transmission: trans.toLowerCase() })}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            formData.transmission === trans.toLowerCase()
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          {trans}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Recursos Extras</label>
                    <div className="space-y-2">
                      {['GPS', 'Ar Condicionado', 'Cadeirinha Infantil', 'Seguro Completo'].map((feature) => (
                        <label key={feature} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-purple-300">
                          <input
                            type="checkbox"
                            checked={formData.features.includes(feature)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, features: [...formData.features, feature] });
                              } else {
                                setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
                              }
                            }}
                            className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-gray-800">{feature}</span>
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
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            {getCurrentStepIndex() === steps.length ? (
              <>
                <MagnifyingGlassIcon className="w-5 h-5" />
                Buscar Carros
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