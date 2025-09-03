'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import PhoneInput from '@/components/PhoneInputSimple';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

interface FlightFormData {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  origin: AirportSelection | null;
  destination: AirportSelection | null;
  departureDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelClass: 'economy' | 'premium' | 'business' | 'first';
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  };
  budget: 'economy' | 'standard' | 'premium' | 'luxury';
  preferences: string;
  urgente: boolean;
  flexivelDatas: boolean;
}

interface MobileFlightFormUltraProps {
  onSearch?: (data: FlightFormData) => void;
  className?: string;
}

type StepType = 'travel' | 'contact' | 'review';
type SectionType = 'trip' | 'route' | 'dates' | 'passengers' | 'class' | null;

export default function MobileFlightFormUltra({ onSearch, className = '' }: MobileFlightFormUltraProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('travel');
  const [activeSection, setActiveSection] = useState<SectionType>('trip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FlightFormData>({
    tripType: 'round-trip',
    origin: null,
    destination: null,
    departureDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelClass: 'economy',
    contactInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+55'
    },
    budget: 'standard',
    preferences: '',
    urgente: false,
    flexivelDatas: false
  });

  const steps = [
    { key: 'travel', title: 'Viagem', icon: PaperAirplaneIcon },
    { key: 'contact', title: 'Contato', icon: UserIcon },
    { key: 'review', title: 'Revisar', icon: CheckIcon }
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  
  const canProceedFromStep = (step: StepType): boolean => {
    switch (step) {
      case 'travel':
        return !!(
          formData.tripType && 
          formData.origin?.iataCode && 
          formData.destination?.iataCode && 
          formData.departureDate && 
          (formData.tripType !== 'round-trip' || formData.returnDate) &&
          formData.passengers.adults > 0
        );
      case 'contact':
        return !!(
          formData.contactInfo.firstName && 
          formData.contactInfo.lastName && 
          formData.contactInfo.email && 
          formData.contactInfo.phone
        );
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1 && canProceedFromStep(currentStep)) {
      setCurrentStep(steps[currentIndex + 1].key as StepType);
      setActiveSection(null);
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 40, 8]);
      }
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as StepType);
      setActiveSection('trip');
      if ('vibrate' in navigator) {
        navigator.vibrate([5, 20, 5]);
      }
    }
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, prev.passengers[type] + (increment ? 1 : -1))
      }
    }));
    
    if ('vibrate' in navigator) {
      navigator.vibrate(increment ? 12 : 8);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      trackFormSubmit('flight_form_mobile_ultra');
      trackQuoteRequest({ services: ['voos'] });

      const submissionData = {
        nome: `${formData.contactInfo.firstName} ${formData.contactInfo.lastName}`,
        email: formData.contactInfo.email,
        telefone: formData.contactInfo.phone,
        servicos: ['voos'],
        serviceData: {
          voos: {
            ...formData,
            originAirport: formData.origin,
            destinationAirport: formData.destination,
            origin: formData.origin?.iataCode || '',
            destination: formData.destination?.iataCode || ''
          }
        },
        flightSearchParams: {
          originLocationCode: formData.origin?.iataCode || '',
          destinationLocationCode: formData.destination?.iataCode || '',
          departureDate: formData.departureDate,
          returnDate: formData.returnDate || undefined,
          adults: formData.passengers.adults,
          children: formData.passengers.children,
          infants: formData.passengers.infants,
          travelClass: formData.travelClass.toUpperCase(),
          oneWay: formData.tripType === 'one-way',
          flexibleDates: formData.flexivelDatas ? { enabled: true, days: 3 } : undefined
        },
        observacoes: formData.preferences || '',
        urgente: formData.urgente,
        flexivelDatas: formData.flexivelDatas,
        budget: formData.budget,
        timestamp: new Date().toISOString(),
        source: 'mobile_flight_form_ultra',
        userAgent: navigator.userAgent
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }

      if (onSearch) {
        onSearch(formData);
      }

      alert('Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.');
      
    } catch (error) {
      console.error('Error submitting flight form:', error);
      alert('Erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className={`fixed inset-0 bg-white flex flex-col ${className}`}>
      {/* Ultra Compact Header - 7% */}
      <div className="h-[7%] bg-gradient-to-r from-blue-500 to-sky-500 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaperAirplaneIcon className="w-5 h-5" />
          <span className="font-bold text-sm">Voos</span>
        </div>
        
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = getCurrentStepIndex() > index;
            
            return (
              <div
                key={step.key}
                className={`w-8 h-1 rounded-full transition-all ${
                  isCompleted ? 'bg-white' : isActive ? 'bg-white/70' : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Ultra Compact Content Area - 86% */}
      <div className="h-[86%] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
            className="h-full p-3"
          >
            
            {/* STEP 1: ULTRA COMPACT TRAVEL DETAILS */}
            {currentStep === 'travel' && (
              <div className="h-full flex flex-col space-y-2">
                
                {/* Trip Type - Compact */}
                <motion.div
                  className={`bg-white rounded-xl border-2 transition-all ${
                    activeSection === 'trip' ? 'border-blue-500' : 'border-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveSection(activeSection === 'trip' ? null : 'trip')}
                    className="w-full px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">✈️ Tipo</span>
                      <span className="text-xs text-neutral-600">
                        {formData.tripType === 'round-trip' ? 'Ida e volta' : 'Somente ida'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      activeSection === 'trip' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeSection === 'trip' && (
                    <div className="px-3 pb-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'round-trip', label: 'Ida e volta', icon: '↔️' },
                          { value: 'one-way', label: 'Somente ida', icon: '→' }
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, tripType: type.value as any }));
                              setActiveSection('route');
                            }}
                            className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                              formData.tripType === type.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-neutral-200 bg-white'
                            }`}
                          >
                            <span className="mr-1">{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Route - Ultra Compact */}
                <motion.div
                  className={`bg-white rounded-xl border-2 transition-all ${
                    activeSection === 'route' ? 'border-blue-500' : 'border-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveSection(activeSection === 'route' ? null : 'route')}
                    className="w-full px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold">Rota</span>
                      <span className="text-xs text-neutral-600 truncate max-w-[150px]">
                        {formData.origin?.iataCode || 'Origem'} → {formData.destination?.iataCode || 'Destino'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      activeSection === 'route' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeSection === 'route' && (
                    <div className="px-3 pb-2 space-y-2">
                      <AirportAutocomplete
                        value={formData.origin}
                        onChange={(airport) => setFormData(prev => ({ ...prev, origin: airport }))}
                        placeholder="De onde?"
                        className="w-full"
                        inputClassName="px-3 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                        isMobile={true}
                        maxResults={4}
                      />
                      
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              origin: prev.destination,
                              destination: prev.origin
                            }));
                          }}
                          className="p-2 bg-blue-100 rounded-lg text-blue-600"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <AirportAutocomplete
                        value={formData.destination}
                        onChange={(airport) => {
                          setFormData(prev => ({ ...prev, destination: airport }));
                          if (airport) setActiveSection('dates');
                        }}
                        placeholder="Para onde?"
                        className="w-full"
                        inputClassName="px-3 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                        isMobile={true}
                        maxResults={4}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Dates - Side by Side Ultra Compact */}
                <motion.div
                  className={`bg-white rounded-xl border-2 transition-all ${
                    activeSection === 'dates' ? 'border-blue-500' : 'border-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveSection(activeSection === 'dates' ? null : 'dates')}
                    className="w-full px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold">Datas</span>
                      <span className="text-xs text-neutral-600">
                        {formData.departureDate ? new Date(formData.departureDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Selecione'}
                        {formData.tripType === 'round-trip' && formData.returnDate && 
                          ` - ${new Date(formData.returnDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                        }
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      activeSection === 'dates' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeSection === 'dates' && (
                    <div className="px-3 pb-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-neutral-700 mb-1 block">Ida</label>
                          <input
                            type="date"
                            value={formData.departureDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                            min={getTodayDate()}
                            className="w-full px-2 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                          />
                        </div>
                        
                        {formData.tripType === 'round-trip' && (
                          <div>
                            <label className="text-xs font-medium text-neutral-700 mb-1 block">Volta</label>
                            <input
                              type="date"
                              value={formData.returnDate}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, returnDate: e.target.value }));
                                if (e.target.value) setActiveSection('passengers');
                              }}
                              min={formData.departureDate || getTomorrowDate()}
                              className="w-full px-2 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                      
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.flexivelDatas}
                          onChange={(e) => setFormData(prev => ({ ...prev, flexivelDatas: e.target.checked }))}
                          className="w-4 h-4 rounded border-blue-300 text-blue-600"
                        />
                        <span className="text-xs text-neutral-700">Datas flexíveis (+/- 3 dias)</span>
                      </label>
                    </div>
                  )}
                </motion.div>

                {/* Passengers - Ultra Compact Grid */}
                <motion.div
                  className={`bg-white rounded-xl border-2 transition-all ${
                    activeSection === 'passengers' ? 'border-blue-500' : 'border-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveSection(activeSection === 'passengers' ? null : 'passengers')}
                    className="w-full px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold">Passageiros</span>
                      <span className="text-xs text-neutral-600">
                        {formData.passengers.adults + formData.passengers.children + formData.passengers.infants} pessoa(s)
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      activeSection === 'passengers' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeSection === 'passengers' && (
                    <div className="px-3 pb-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-xs font-medium text-neutral-700 mb-1">Adultos</div>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePassengerChange('adults', false)}
                              disabled={formData.passengers.adults <= 1}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm min-w-[20px]">{formData.passengers.adults}</span>
                            <button
                              onClick={() => handlePassengerChange('adults', true)}
                              disabled={formData.passengers.adults >= 9}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs font-medium text-neutral-700 mb-1">Crianças</div>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePassengerChange('children', false)}
                              disabled={formData.passengers.children <= 0}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm min-w-[20px]">{formData.passengers.children}</span>
                            <button
                              onClick={() => handlePassengerChange('children', true)}
                              disabled={formData.passengers.children >= 9}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xs font-medium text-neutral-700 mb-1">Bebês</div>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handlePassengerChange('infants', false)}
                              disabled={formData.passengers.infants <= 0}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="font-bold text-sm min-w-[20px]">{formData.passengers.infants}</span>
                            <button
                              onClick={() => handlePassengerChange('infants', true)}
                              disabled={formData.passengers.infants >= formData.passengers.adults}
                              className="w-6 h-6 bg-neutral-100 rounded flex items-center justify-center disabled:opacity-50 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Travel Class - Compact Grid */}
                <motion.div
                  className={`bg-white rounded-xl border-2 transition-all ${
                    activeSection === 'class' ? 'border-blue-500' : 'border-neutral-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveSection(activeSection === 'class' ? null : 'class')}
                    className="w-full px-3 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">✨ Classe</span>
                      <span className="text-xs text-neutral-600">
                        {formData.travelClass === 'economy' && 'Econômica'}
                        {formData.travelClass === 'premium' && 'Premium'}
                        {formData.travelClass === 'business' && 'Executiva'}
                        {formData.travelClass === 'first' && 'Primeira'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      activeSection === 'class' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {activeSection === 'class' && (
                    <div className="px-3 pb-2">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'economy', label: 'Econômica', icon: '💺' },
                          { value: 'premium', label: 'Premium', icon: '🎯' },
                          { value: 'business', label: 'Executiva', icon: '💼' },
                          { value: 'first', label: 'Primeira', icon: '👑' }
                        ].map((cls) => (
                          <button
                            key={cls.value}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, travelClass: cls.value as any }));
                              setActiveSection(null);
                            }}
                            className={`p-2 rounded-lg border-2 text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                              formData.travelClass === cls.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-neutral-200 bg-white'
                            }`}
                          >
                            <span>{cls.icon}</span>
                            <span>{cls.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

              </div>
            )}

            {/* STEP 2: ULTRA COMPACT CONTACT */}
            {currentStep === 'contact' && (
              <div className="h-full flex flex-col">
                <div className="text-center mb-3">
                  <UserIcon className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-neutral-900">Seus Dados</h4>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Nome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.firstName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, firstName: e.target.value }
                        }))}
                        placeholder="Primeiro"
                        className="w-full px-2 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-700 mb-1 block">Sobrenome *</label>
                      <input
                        type="text"
                        value={formData.contactInfo.lastName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, lastName: e.target.value }
                        }))}
                        placeholder="Último"
                        className="w-full px-2 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">E-mail *</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))}
                        placeholder="seu@email.com"
                        className="w-full pl-8 pr-2 py-2 text-sm rounded-lg border-2 border-neutral-200 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Telefone *</label>
                    <PhoneInput
                      value={formData.contactInfo.phone}
                      onChange={(value) => setFormData(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, phone: value }
                      }))}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-1 block">Orçamento</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { value: 'economy', label: 'Eco', icon: '💰' },
                        { value: 'standard', label: 'Padrão', icon: '💳' },
                        { value: 'premium', label: 'Premium', icon: '💎' },
                        { value: 'luxury', label: 'Luxo', icon: '👑' }
                      ].map((budget) => (
                        <button
                          key={budget.value}
                          onClick={() => setFormData(prev => ({ ...prev, budget: budget.value as any }))}
                          className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                            formData.budget === budget.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-neutral-200 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-base mb-1">{budget.icon}</div>
                            <div className="text-xs">{budget.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.urgente}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgente: e.target.checked }))}
                      className="w-4 h-4 rounded border-yellow-300 text-yellow-600"
                    />
                    <span className="text-xs font-medium text-yellow-900">⚡ Urgente</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: ULTRA COMPACT REVIEW */}
            {currentStep === 'review' && (
              <div className="h-full flex flex-col">
                <div className="text-center mb-3">
                  <CheckIcon className="w-8 h-8 text-green-600 mx-auto mb-1" />
                  <h4 className="text-sm font-semibold text-neutral-900">Confirmar</h4>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <h5 className="text-xs font-bold text-blue-900 mb-1">✈️ Viagem</h5>
                    <div className="space-y-1 text-xs text-blue-800">
                      <div className="flex justify-between">
                        <span>Rota:</span>
                        <span className="font-medium">{formData.origin?.iataCode} → {formData.destination?.iataCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Datas:</span>
                        <span className="font-medium">
                          {formData.departureDate && new Date(formData.departureDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          {formData.returnDate && ` - ${new Date(formData.returnDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passageiros:</span>
                        <span className="font-medium">
                          {formData.passengers.adults}A
                          {formData.passengers.children > 0 && `+${formData.passengers.children}C`}
                          {formData.passengers.infants > 0 && `+${formData.passengers.infants}B`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <h5 className="text-xs font-bold text-green-900 mb-1">👤 Contato</h5>
                    <div className="space-y-1 text-xs text-green-800">
                      <div>{formData.contactInfo.firstName} {formData.contactInfo.lastName}</div>
                      <div>{formData.contactInfo.email}</div>
                      <div>{formData.contactInfo.phone}</div>
                    </div>
                  </div>

                  {(formData.urgente || formData.flexivelDatas) && (
                    <div className="flex gap-2">
                      {formData.urgente && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚡ Urgente</span>
                      )}
                      {formData.flexivelDatas && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">📅 Flexível</span>
                      )}
                    </div>
                  )}

                  <div className="text-center space-y-1 text-xs text-neutral-600 mt-3">
                    <p>✅ Resposta em até 2 horas</p>
                    <p>📞 Atendimento especializado</p>
                    <p>💰 Cotação gratuita</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <PaperAirplaneIcon className="w-4 h-4" />
                      Enviar Solicitação
                    </span>
                  )}
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Ultra Compact Navigation - 7% */}
      <div className="h-[7%] border-t border-neutral-200 bg-white px-3 py-2 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 'travel'}
          className="flex items-center gap-1 px-3 py-1.5 text-neutral-600 text-sm font-medium disabled:opacity-50"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex gap-1">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = getCurrentStepIndex() > index;
            
            return (
              <div
                key={step.key}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isCompleted ? 'bg-blue-600' : isActive ? 'bg-blue-400' : 'bg-neutral-300'
                }`}
              />
            );
          })}
        </div>

        {currentStep !== 'review' ? (
          <button
            onClick={nextStep}
            disabled={!canProceedFromStep(currentStep)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Continue
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-16"></div>
        )}
      </div>
    </div>
  );
}