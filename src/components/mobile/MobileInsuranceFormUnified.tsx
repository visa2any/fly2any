'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  HeartIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import CityAutocomplete from '../CityAutocomplete';
import PhoneInput from '@/components/PhoneInputSimple';
import { cities } from '@/data/cities';

interface InsuranceFormData {
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelType: string;
  coverageType: string;
  coverageAmount: string;
  medicalHistory: boolean;
  medicalDetails: string;
  activities: string[];
  budget: string;
  budgetMin: string;
  budgetMax: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  contactPreference: string;
  newsletter: boolean;
}

interface MobileInsuranceFormProps {
  onClose: () => void;
  onSubmit?: (data: InsuranceFormData) => void;
  mode?: 'compact' | 'premium' | 'embedded';
  className?: string;
}


const trackFormSubmit = (step: string, data?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_step_complete', {
      event_category: 'Insurance Form',
      event_label: step,
      value: data
    });
  }
};

const trackQuoteRequest = (data: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'quote_request', {
      event_category: 'Travel Insurance',
      event_label: 'Insurance Quote',
      value: (data.passengers?.adults || 0) + (data.passengers?.children || 0) + (data.passengers?.infants || 0)
    });
  }
};

const MobileInsuranceFormUnified: React.FC<MobileInsuranceFormProps> = ({ 
  onClose, 
  onSubmit,
  mode = 'premium',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InsuranceFormData>({
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelType: '',
    coverageType: '',
    coverageAmount: '',
    medicalHistory: false,
    medicalDetails: '',
    activities: [],
    budget: '',
    budgetMin: '',
    budgetMax: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    contactPreference: 'whatsapp',
    newsletter: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const travelTypes = [
    { id: 'leisure', name: 'Lazer/Turismo', icon: '🏖️', description: 'Viagem de férias e turismo' },
    { id: 'business', name: 'Negócios', icon: '💼', description: 'Viagem corporativa ou trabalho' },
    { id: 'study', name: 'Estudos', icon: '🎓', description: 'Intercâmbio ou curso' },
    { id: 'family', name: 'Visita Familiar', icon: '👨‍👩‍👧‍👦', description: 'Visitar familiares ou amigos' },
    { id: 'medical', name: 'Tratamento Médico', icon: '🏥', description: 'Viagem para tratamento de saúde' },
    { id: 'sports', name: 'Esportes/Aventura', icon: '⛷️', description: 'Atividades esportivas ou radicais' }
  ];

  const coverageTypes = [
    { 
      id: 'basic', 
      name: 'Básico', 
      icon: '🛡️', 
      features: ['Despesas médicas', 'Bagagem extraviada', 'Cancelamento'],
      maxCoverage: 'USD 30.000'
    },
    { 
      id: 'standard', 
      name: 'Padrão', 
      icon: '🔒', 
      features: ['Despesas médicas', 'Bagagem', 'Cancelamento', 'Atraso de voo'],
      maxCoverage: 'USD 60.000'
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      icon: '💎', 
      features: ['Cobertura completa', 'Esportes', 'Gestante', 'Doenças preexistentes'],
      maxCoverage: 'USD 100.000'
    },
    { 
      id: 'platinum', 
      name: 'Platinum', 
      icon: '👑', 
      features: ['Cobertura máxima', 'Todas as atividades', 'Telemedicina', 'Concierge'],
      maxCoverage: 'USD 250.000'
    }
  ];

  const coverageAmounts = [
    { id: '30000', name: 'USD 30.000', description: 'Mínimo para Europa', popular: false },
    { id: '60000', name: 'USD 60.000', description: 'Recomendado geral', popular: true },
    { id: '100000', name: 'USD 100.000', description: 'Cobertura ampliada', popular: false },
    { id: '250000', name: 'USD 250.000', description: 'Cobertura máxima', popular: false },
    { id: 'custom', name: 'Personalizado', description: 'Definir valor específico', popular: false }
  ];

  const riskActivities = [
    { id: 'skiing', name: 'Esqui/Snowboard', icon: '⛷️' },
    { id: 'diving', name: 'Mergulho', icon: '🤿' },
    { id: 'climbing', name: 'Escalada/Montanhismo', icon: '🧗' },
    { id: 'skydiving', name: 'Paraquedismo', icon: '🪂' },
    { id: 'surfing', name: 'Surf', icon: '🏄' },
    { id: 'motorcycling', name: 'Motociclismo', icon: '🏍️' },
    { id: 'bungee', name: 'Bungee Jump', icon: '🤸' },
    { id: 'rafting', name: 'Rafting', icon: '🚣' },
    { id: 'sailing', name: 'Vela/Iatismo', icon: '⛵' },
    { id: 'trekking', name: 'Trekking Extremo', icon: '🥾' }
  ];

  const budgetRanges = [
    { id: 'budget', name: 'Econômico', range: 'R$ 50 - R$ 150/pessoa', min: '50', max: '150' },
    { id: 'standard', name: 'Padrão', range: 'R$ 150 - R$ 300/pessoa', min: '150', max: '300' },
    { id: 'premium', name: 'Premium', range: 'R$ 300 - R$ 500/pessoa', min: '300', max: '500' },
    { id: 'luxury', name: 'Completo', range: 'R$ 500 - R$ 1000/pessoa', min: '500', max: '1000' },
    { id: 'custom', name: 'Personalizado', range: 'Definir valor específico', min: '', max: '' }
  ];

  const handleInputChange = (field: keyof InsuranceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActivityToggle = (activityId: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId]
    }));
  };

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFormData(prev => {
      const currentValue = prev.passengers[type];
      let newValue;
      
      if (increment) {
        newValue = Math.min(currentValue + 1, 9);
      } else {
        const minValue = type === 'adults' ? 1 : 0;
        newValue = Math.max(currentValue - 1, minValue);
      }
      
      return {
        ...prev,
        passengers: {
          ...prev.passengers,
          [type]: newValue
        }
      };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.destination && formData.departureDate && formData.returnDate && 
                 formData.travelType && formData.coverageType && formData.coverageAmount && 
                 (formData.passengers.adults + formData.passengers.children + formData.passengers.infants) > 0);
      case 2:
        return !!(formData.budget && (formData.budget !== 'custom' || (formData.budgetMin && formData.budgetMax)));
      case 3:
        return !!(formData.name && formData.email && formData.phone);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      trackFormSubmit(`step_${currentStep}`);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitForm = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    
    try {
      const submissionData = {
        type: 'insurance',
        ...formData,
        travelTypeName: travelTypes.find(type => type.id === formData.travelType)?.name,
        coverageTypeName: coverageTypes.find(coverage => coverage.id === formData.coverageType)?.name,
        coverageAmountName: coverageAmounts.find(amount => amount.id === formData.coverageAmount)?.name,
        selectedActivities: formData.activities.map(id => 
          riskActivities.find(activity => activity.id === id)?.name
        ).filter(Boolean),
        budgetRange: budgetRanges.find(budget => budget.id === formData.budget)?.name,
        passengers: formData.passengers,
        totalTravelers: formData.passengers.adults + formData.passengers.children + formData.passengers.infants,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        trackQuoteRequest(submissionData);
        setShowSuccess(true);
        setCurrentStep(4);
        
        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(formData);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = () => {
    if (!formData.departureDate || !formData.returnDate) return 0;
    const start = new Date(formData.departureDate);
    const end = new Date(formData.returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Detalhes do Seguro';
      case 2: return 'Orçamento & Observações';
      case 3: return 'Seus Dados';
      case 4: return 'Confirmação';
      default: return 'Seguro Viagem';
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className={`flex flex-col bg-white ${className}`}>
      

      {/* MAIN CONTENT AREA */}
      <div className="pb-32 safe-area-inset-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-3"
            style={{ minHeight: 'auto' }}
          >
            
            {/* STEP 1: INSURANCE DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Service Header */}
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-md">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-900 leading-tight mb-1">Detalhes do Seguro</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">Configure sua proteção ideal</p>
                  </div>
                </div>

                  {/* Destination */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-2 text-green-500" />
                      Destino da Viagem
                    </label>
                    <CityAutocomplete
                      value={formData.destination}
                      onChange={(value) => handleInputChange('destination', value)}
                      placeholder="Para onde você vai viajar?"
                      className="w-full"
                      cities={cities}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-2 text-green-500" />
                        Data de Ida
                      </label>
                      <input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => handleInputChange('departureDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-2 text-green-500" />
                        Data de Volta
                      </label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        min={formData.departureDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Passageiros</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { type: 'adults', label: 'Adultos', emoji: '👤', min: 1 },
                        { type: 'children', label: 'Crianças', emoji: '🧒', min: 0 },
                        { type: 'infants', label: 'Bebês', emoji: '👶', min: 0 }
                      ].map((passenger) => (
                        <div key={passenger.type} className="text-center">
                          <div className="text-xs font-medium text-gray-700 mb-2 flex flex-col items-center">
                            <span className="text-lg mb-1">{passenger.emoji}</span>
                            <span>{passenger.label}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePassengerChange(passenger.type as any, false)}
                              disabled={formData.passengers[passenger.type as keyof typeof formData.passengers] <= passenger.min}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="font-bold text-lg min-w-[24px]">
                              {formData.passengers[passenger.type as keyof typeof formData.passengers]}
                            </span>
                            <button
                              onClick={() => handlePassengerChange(passenger.type as any, true)}
                              disabled={formData.passengers[passenger.type as keyof typeof formData.passengers] >= 9}
                              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-50 text-sm font-bold hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Travel Type */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <GlobeAltIcon className="w-4 h-4 mr-2 text-green-500" />
                      Motivo da Viagem
                    </label>
                    <div className="space-y-2">
                      {travelTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('travelType', type.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            formData.travelType === type.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{type.icon}</span>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Coverage Type */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-500" />
                      Tipo de Cobertura
                    </label>
                    <div className="space-y-3">
                      {coverageTypes.map((coverage) => (
                        <motion.button
                          key={coverage.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('coverageType', coverage.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.coverageType === coverage.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{coverage.icon}</span>
                              <span className="font-semibold">{coverage.name}</span>
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                              até {coverage.maxCoverage}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {coverage.features.map((feature, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center">
                                <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Coverage Amount */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-500" />
                      Valor da Cobertura
                    </label>
                    <div className="space-y-2">
                      {coverageAmounts.map((amount) => (
                        <motion.button
                          key={amount.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('coverageAmount', amount.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            formData.coverageAmount === amount.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium flex items-center">
                                {amount.name}
                                {amount.popular && (
                                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                                    Recomendado
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{amount.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Risk Activities */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-orange-500" />
                      Atividades de Risco (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {riskActivities.map((activity) => (
                        <motion.button
                          key={activity.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleActivityToggle(activity.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            formData.activities.includes(activity.id)
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{activity.icon}</div>
                          <div className="text-xs font-medium">{activity.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="medicalHistory"
                        checked={formData.medicalHistory}
                        onChange={(e) => handleInputChange('medicalHistory', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="medicalHistory" className="text-sm font-medium text-blue-800 mb-2 block">
                          <HeartIcon className="w-4 h-4 inline mr-2" />
                          Tenho condições médicas preexistentes
                        </label>
                        <p className="text-xs text-blue-600 mb-2">
                          Marque se você ou algum viajante possui doenças crônicas, condições médicas ou está em tratamento
                        </p>
                        {formData.medicalHistory && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2"
                          >
                            <textarea
                              value={formData.medicalDetails}
                              onChange={(e) => handleInputChange('medicalDetails', e.target.value)}
                              placeholder="Descreva brevemente as condições médicas para melhor atendimento..."
                              rows={3}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
            )}

            {/* STEP 2: BUDGET & NOTES */}
            {currentStep === 2 && (
              <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-500" />
                      Faixa de Orçamento por Pessoa
                    </label>
                    <div className="space-y-3">
                      {budgetRanges.map((budget) => (
                        <motion.button
                          key={budget.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            handleInputChange('budget', budget.id);
                            if (budget.id !== 'custom') {
                              handleInputChange('budgetMin', budget.min);
                              handleInputChange('budgetMax', budget.max);
                            }
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.budget === budget.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-sm text-gray-500">{budget.range}</div>
                        </motion.button>
                      ))}
                    </div>

                    {formData.budget === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Valor Mínimo (R$)</label>
                          <input
                            type="number"
                            value={formData.budgetMin}
                            onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                            placeholder="50"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Valor Máximo (R$)</label>
                          <input
                            type="number"
                            value={formData.budgetMax}
                            onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                            placeholder="500"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Observações Adicionais (opcional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Compartilhe informações sobre medicamentos em uso, condições específicas de saúde, preocupações sobre o destino, coberturas especiais desejadas ou qualquer detalhe que possa nos ajudar a encontrar o seguro ideal para você..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>
              </div>
            )}

            {/* STEP 3: CONTACT INFO */}
            {currentStep === 3 && (
              <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 mr-2 text-green-500" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-green-500" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="w-4 h-4 mr-2 text-green-500" />
                      Telefone/WhatsApp
                    </label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Como prefere ser contatado?
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
                        { id: 'phone', name: 'Ligação', icon: '📞' },
                        { id: 'email', name: 'E-mail', icon: '✉️' }
                      ].map((method) => (
                        <motion.button
                          key={method.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('contactPreference', method.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            formData.contactPreference === method.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-3">{method.icon}</span>
                          {method.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={formData.newsletter}
                      onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-700">
                      Quero receber dicas de viagem e ofertas de seguro
                    </label>
                  </div>
              </div>
            )}

            {/* STEP 4: CONFIRMATION */}
            {currentStep === 4 && (
              <div className="space-y-6">
                  {showSuccess ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.1, 1.1, 1.1, 1]
                        }}
                        transition={{ duration: 0.6 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircleIcon className="w-10 h-10 text-green-600" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Cotação Solicitada!</h3>
                      <p className="text-gray-600 mb-6">
                        Recebemos sua solicitação de seguro viagem e entraremos em contato em breve com as melhores opções e preços.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                      >
                        Fechar
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-bold text-green-800 mb-3 flex items-center">
                          <ShieldCheckIcon className="w-5 h-5 mr-2" />
                          Resumo do Seguro Viagem
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Destino:</span>
                            <span className="font-medium text-gray-800">{formData.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Período:</span>
                            <span className="font-medium text-gray-800">
                              {formatDateForDisplay(formData.departureDate)} - {formatDateForDisplay(formData.returnDate)}
                              {calculateDays() > 0 && (
                                <span className="text-green-600 ml-1">({calculateDays()} dia{calculateDays() > 1 ? 's' : ''})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Viajantes:</span>
                            <div className="text-right">
                              <div className="font-medium text-gray-800">{formData.passengers.adults + formData.passengers.children + formData.passengers.infants} pessoa{formData.passengers.adults + formData.passengers.children + formData.passengers.infants > 1 ? 's' : ''}</div>
                              <div className="text-xs text-gray-500 space-x-2">
                                <span>{formData.passengers.adults} Adulto(s)</span>
                                {formData.passengers.children > 0 && (
                                  <span>{formData.passengers.children} Criança(s)</span>
                                )}
                                {formData.passengers.infants > 0 && (
                                  <span>{formData.passengers.infants} Bebê(s)</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Motivo da Viagem:</span>
                            <span className="font-medium text-gray-800">
                              {travelTypes.find(t => t.id === formData.travelType)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cobertura:</span>
                            <span className="font-medium text-gray-800">
                              {coverageTypes.find(c => c.id === formData.coverageType)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valor da Cobertura:</span>
                            <span className="font-medium text-gray-800">
                              {coverageAmounts.find(a => a.id === formData.coverageAmount)?.name}
                            </span>
                          </div>
                          
                          {formData.activities.length > 0 && (
                            <div>
                              <span className="text-gray-600">Atividades de Risco:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {formData.activities.map(activityId => {
                                  const activity = riskActivities.find(a => a.id === activityId);
                                  return (
                                    <span key={activityId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                                      <span className="mr-1">{activity?.icon}</span>
                                      {activity?.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {formData.medicalHistory && (
                            <div className="flex items-center text-blue-600">
                              <span className="text-gray-600">Condições Médicas:</span>
                              <span className="font-medium ml-2">✓ Informadas</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between pt-2 border-t border-green-200">
                            <span className="text-gray-600">Orçamento:</span>
                            <span className="font-medium text-green-700">
                              {formData.budget === 'custom' 
                                ? `R$ ${formData.budgetMin} - R$ ${formData.budgetMax}/pessoa`
                                : budgetRanges.find(b => b.id === formData.budget)?.range
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                          <UserIcon className="w-5 h-5 mr-2" />
                          Dados de Contato
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nome:</span>
                            <span className="font-medium text-gray-800">{formData.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">E-mail:</span>
                            <span className="font-medium text-gray-800">{formData.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium text-gray-800">{formData.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contatar via:</span>
                            <span className="font-medium text-gray-800 capitalize">{formData.contactPreference}</span>
                          </div>
                        </div>
                      </div>

                      {formData.notes && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-bold text-gray-800 mb-2">Observações</h3>
                          <p className="text-sm text-gray-600">{formData.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Navigation Buttons */}
            {!showSuccess && (
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex space-x-3">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </motion.button>
              )}
              
              {currentStep < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    validateStep(currentStep)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentStep === 1 ? 'Continuar' : 'Avançar'}
                  <ChevronRightIcon className="w-4 h-4 ml-2 inline" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitForm}
                  disabled={isSubmitting || !validateStep(3)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                    !isSubmitting && validateStep(3)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enviando...
                    </div>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2 inline" />
                        Solicitar Cotação
                      </>
                    )}
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileInsuranceFormUnified;