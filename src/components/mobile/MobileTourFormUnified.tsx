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
  ClockIcon,
  StarIcon,
  CameraIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import CityAutocomplete from '../CityAutocomplete';
import PhoneInput from '@/components/PhoneInput';
import { cities } from '@/data/cities';

interface TourFormData {
  destination: string;
  startDate: string;
  endDate: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  tourType: string;
  duration: string;
  activities: string[];
  groupType: string;
  language: string;
  accessibility: boolean;
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

interface MobileTourFormProps {
  onClose: () => void;
  onSubmit?: (data: TourFormData) => void;
  mode?: 'compact' | 'premium' | 'embedded';
  className?: string;
}


const trackFormSubmit = (step: string, data?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_step_complete', {
      event_category: 'Tours Form',
      event_label: step,
      value: data
    });
  }
};

const trackQuoteRequest = (data: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'quote_request', {
      event_category: 'Tours',
      event_label: 'Tour Package Quote',
      value: (data.passengers?.adults || 0) + (data.passengers?.children || 0) + (data.passengers?.infants || 0)
    });
  }
};

const MobileTourFormUnified: React.FC<MobileTourFormProps> = ({ 
  onClose, 
  onSubmit,
  mode = 'premium',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TourFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    passengers: {
      adults: 2,
      children: 0,
      infants: 0
    },
    tourType: '',
    duration: '',
    activities: [],
    groupType: '',
    language: 'portuguese',
    accessibility: false,
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

  const tourTypes = [
    { id: 'cultural', name: 'Tours Culturais', icon: '🏛️' },
    { id: 'adventure', name: 'Aventura', icon: '🏔️' },
    { id: 'gastronomy', name: 'Gastronomia', icon: '🍷' },
    { id: 'nature', name: 'Natureza', icon: '🌿' },
    { id: 'historical', name: 'Histórico', icon: '🏰' },
    { id: 'photography', name: 'Fotografia', icon: '📸' },
    { id: 'wellness', name: 'Bem-estar', icon: '🧘' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' }
  ];

  const durations = [
    { id: 'half-day', name: 'Meio Dia (4h)', hours: '4h' },
    { id: 'full-day', name: 'Dia Inteiro (8h)', hours: '8h' },
    { id: 'multi-day-2', name: '2 Dias', hours: '2 dias' },
    { id: 'multi-day-3', name: '3 Dias', hours: '3 dias' },
    { id: 'week', name: 'Uma Semana', hours: '7 dias' },
    { id: 'custom', name: 'Personalizado', hours: 'Sob medida' }
  ];

  const activities = [
    { id: 'walking', name: 'Caminhadas', icon: '🚶' },
    { id: 'museums', name: 'Museus', icon: '🎨' },
    { id: 'food-tours', name: 'Tours Gastronômicos', icon: '🍽️' },
    { id: 'boat-trips', name: 'Passeios de Barco', icon: '⛵' },
    { id: 'bike-tours', name: 'Tours de Bicicleta', icon: '🚴' },
    { id: 'wine-tasting', name: 'Degustação de Vinhos', icon: '🍇' },
    { id: 'nightlife', name: 'Vida Noturna', icon: '🌙' },
    { id: 'shopping', name: 'Compras', icon: '🛒' },
    { id: 'architecture', name: 'Arquitetura', icon: '🏢' },
    { id: 'religious', name: 'Locais Religiosos', icon: '⛪' }
  ];

  const groupTypes = [
    { id: 'private', name: 'Tour Privativo', description: 'Exclusivo para seu grupo' },
    { id: 'small-group', name: 'Grupo Pequeno', description: 'Até 8 pessoas' },
    { id: 'regular', name: 'Tour Regular', description: 'Grupo padrão até 20 pessoas' },
    { id: 'family', name: 'Tour Familiar', description: 'Adequado para famílias com crianças' }
  ];

  const languages = [
    { id: 'portuguese', name: 'Português' },
    { id: 'english', name: 'Inglês' },
    { id: 'spanish', name: 'Espanhol' },
    { id: 'french', name: 'Francês' },
    { id: 'italian', name: 'Italiano' },
    { id: 'german', name: 'Alemão' }
  ];

  const budgetRanges = [
    { id: 'budget', name: 'Econômico', range: 'Até R$ 200/pessoa', min: '0', max: '200' },
    { id: 'mid', name: 'Intermediário', range: 'R$ 200 - R$ 500/pessoa', min: '200', max: '500' },
    { id: 'premium', name: 'Premium', range: 'R$ 500 - R$ 1000/pessoa', min: '500', max: '1000' },
    { id: 'luxury', name: 'Luxo', range: 'Acima de R$ 1000/pessoa', min: '1000', max: '5000' },
    { id: 'custom', name: 'Personalizado', range: 'Definir valor específico', min: '', max: '' }
  ];

  const handleInputChange = (field: keyof TourFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handleActivityToggle = (activityId: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(id => id !== activityId)
        : [...prev.activities, activityId]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.destination && formData.startDate && formData.endDate && 
                 formData.tourType && formData.duration && formData.groupType);
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
        type: 'tours',
        ...formData,
        selectedActivities: formData.activities.map(id => 
          activities.find(activity => activity.id === id)?.name
        ).filter(Boolean),
        tourTypeName: tourTypes.find(type => type.id === formData.tourType)?.name,
        durationName: durations.find(dur => dur.id === formData.duration)?.name,
        groupTypeName: groupTypes.find(group => group.id === formData.groupType)?.name,
        languageName: languages.find(lang => lang.id === formData.language)?.name,
        budgetRange: budgetRanges.find(budget => budget.id === formData.budget)?.name,
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
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Detalhes do Tour';
      case 2: return 'Orçamento & Observações';
      case 3: return 'Seus Dados';
      case 4: return 'Confirmação';
      default: return 'Tour';
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
            
            {/* STEP 1: TOUR DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Service Header */}
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl shadow-md">
                    <CameraIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-900 leading-tight mb-1">Detalhes do Tour</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">Configure sua experiência ideal</p>
                  </div>
                </div>

                  {/* Destination */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPinIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Destino do Tour
                    </label>
                    <CityAutocomplete
                      value={formData.destination}
                      onChange={(value) => handleInputChange('destination', value)}
                      placeholder="Para onde vamos?"
                      className="w-full"
                      cities={cities}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-2 text-amber-500" />
                        Data de Início
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-2 text-amber-500" />
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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

                  {/* Tour Type */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <StarIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Tipo de Tour
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {tourTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('tourType', type.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            formData.tourType === type.id
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{type.icon}</div>
                          <div className="text-sm font-medium">{type.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <ClockIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Duração do Tour
                    </label>
                    <div className="space-y-2">
                      {durations.map((duration) => (
                        <motion.button
                          key={duration.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('duration', duration.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            formData.duration === duration.id
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{duration.name}</span>
                            <span className="text-sm text-gray-500">{duration.hours}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Group Type */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <UserGroupIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Tipo de Grupo
                    </label>
                    <div className="space-y-2">
                      {groupTypes.map((group) => (
                        <motion.button
                          key={group.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleInputChange('groupType', group.id)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                            formData.groupType === group.id
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-500">{group.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <CameraIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Atividades de Interesse (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {activities.map((activity) => (
                        <motion.button
                          key={activity.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleActivityToggle(activity.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            formData.activities.includes(activity.id)
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{activity.icon}</div>
                          <div className="text-xs font-medium">{activity.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <LanguageIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Idioma do Tour
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Accessibility */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="accessibility"
                      checked={formData.accessibility}
                      onChange={(e) => handleInputChange('accessibility', e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="accessibility" className="text-sm text-gray-700">
                      Preciso de acessibilidade para pessoas com mobilidade reduzida
                    </label>
                  </div>
              </div>
            )}

            {/* STEP 2: BUDGET & NOTES */}
            {currentStep === 2 && (
              <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2 text-amber-500" />
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
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
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
                            placeholder="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Valor Máximo (R$)</label>
                          <input
                            type="number"
                            value={formData.budgetMax}
                            onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                            placeholder="1000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
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
                      placeholder="Conte-nos mais sobre suas preferências, restrições alimentares, interesses especiais ou qualquer informação que possa nos ajudar a personalizar seu tour..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>
              </div>
            )}

            {/* STEP 3: CONTACT INFO */}
            {currentStep === 3 && (
              <div className="space-y-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 mr-2 text-amber-500" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <EnvelopeIcon className="w-4 h-4 mr-2 text-amber-500" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="w-4 h-4 mr-2 text-amber-500" />
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
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
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
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-700">
                      Quero receber ofertas e dicas de viagem por e-mail
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
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Tour Solicitado!</h3>
                      <p className="text-gray-600 mb-6">
                        Recebemos sua solicitação de tour e entraremos em contato em breve com as melhores opções.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                      >
                        Fechar
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <h3 className="font-bold text-amber-800 mb-3 flex items-center">
                          <CameraIcon className="w-5 h-5 mr-2" />
                          Resumo do Tour
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Destino:</span>
                            <span className="font-medium text-gray-800">{formData.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Período:</span>
                            <span className="font-medium text-gray-800">
                              {formatDateForDisplay(formData.startDate)} - {formatDateForDisplay(formData.endDate)}
                              {calculateDays() > 0 && (
                                <span className="text-amber-600 ml-1">({calculateDays()} dia{calculateDays() > 1 ? 's' : ''})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Participantes:</span>
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
                            <span className="text-gray-600">Tipo de Tour:</span>
                            <span className="font-medium text-gray-800">
                              {tourTypes.find(t => t.id === formData.tourType)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duração:</span>
                            <span className="font-medium text-gray-800">
                              {durations.find(d => d.id === formData.duration)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo de Grupo:</span>
                            <span className="font-medium text-gray-800">
                              {groupTypes.find(g => g.id === formData.groupType)?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Idioma:</span>
                            <span className="font-medium text-gray-800">
                              {languages.find(l => l.id === formData.language)?.name}
                            </span>
                          </div>
                          
                          {formData.activities.length > 0 && (
                            <div>
                              <span className="text-gray-600">Atividades de Interesse:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {formData.activities.map(activityId => {
                                  const activity = activities.find(a => a.id === activityId);
                                  return (
                                    <span key={activityId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                                      <span className="mr-1">{activity?.icon}</span>
                                      {activity?.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {formData.accessibility && (
                            <div className="flex items-center text-blue-600">
                              <span className="text-gray-600">Acessibilidade:</span>
                              <span className="font-medium ml-2">✓ Solicitada</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between pt-2 border-t border-amber-200">
                            <span className="text-gray-600">Orçamento:</span>
                            <span className="font-medium text-amber-700">
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
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
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
                        Solicitar Tour
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

export default MobileTourFormUnified;