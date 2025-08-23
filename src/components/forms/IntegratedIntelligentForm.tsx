'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import { AirportSelection } from '@/types/flights';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';
import DatePicker from '@/components/DatePicker';
import PhoneInput from '@/components/PhoneInputSimple';

// Import our intelligent form components
import IntelligentFormSystem, { 
  IntelligentFormField, 
  FormContext, 
  ConversionTriggers,
  useSmartAutocomplete,
  useVoiceInput,
  useRealTimeValidation
} from './IntelligentFormSystem';

import ConversionOptimizer, {
  PsychologicalTrigger,
  ABTestVariant,
  useABTest,
  useScarcityTimer,
  useDynamicPricing,
  useSocialProof,
  useExitIntent,
  PriceComparison
} from './ConversionOptimizer';

import MobileOptimizedFormUX, {
  MobileFormConfig,
  MobileFormField,
  useOneHandedMode,
  useHapticFeedback,
  useSmartKeyboard,
  useSwipeGestures,
  useBiometricAuth,
  ProgressIndicator
} from './MobileOptimizedFormUX';

import TravelIntelligenceEngine, {
  TravelRoute,
  TravelInsight,
  useFuzzyAirportSearch,
  useTravelInsights,
  usePriceTrendPredictor
} from './TravelIntelligenceEngine';

// Integrated form data interface
interface IntegratedFormData {
  // Basic travel data
  origem: AirportSelection | null;
  destino: AirportSelection | null;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  
  // Personal data
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  
  // Preferences and additional
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  orcamentoAproximado: string;
  flexibilidadeDatas: boolean;
  observacoes: string;
}

interface IntegratedIntelligentFormProps {
  onSubmit: (data: IntegratedFormData) => Promise<void>;
  className?: string;
}

export default function IntegratedIntelligentForm({
  onSubmit,
  className = ''
}: IntegratedIntelligentFormProps) {
  // Form state
  const [formData, setFormData] = useState<IntegratedFormData>({
    origem: null,
    destino: null,
    dataIda: '',
    dataVolta: '',
    tipoViagem: 'ida-volta',
    classeVoo: 'economica',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    companhiaPreferida: '',
    horarioPreferido: 'qualquer',
    escalas: 'qualquer',
    orcamentoAproximado: '',
    flexibilidadeDatas: false,
    observacoes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intelligent form configuration
  const formContext: FormContext = useMemo(() => ({
    userBehavior: {
      fieldInteractions: {},
      timeSpent: {},
      abandonmentPoints: [],
      completionPatterns: []
    },
    travelContext: {
      previousSearches: [],
      preferences: {},
      seasonalTrends: {},
      popularRoutes: []
    },
    deviceContext: {
      isMobile,
      touchCapability: 'ontouchstart' in window,
      voiceSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      biometricAvailable: 'credentials' in navigator
    }
  }), [isMobile]);

  // A/B test variants for conversion optimization
  const abTestVariants: ABTestVariant[] = [
    {
      id: 'control',
      name: 'Control',
      weight: 50,
      elements: {
        ctaText: 'Buscar Voos',
        ctaColor: 'blue',
        ctaPosition: 'bottom',
        priceDisplay: 'standard',
        trustBadges: true,
        urgencyBanner: false
      },
      metrics: { views: 0, conversions: 0, conversionRate: 0 }
    },
    {
      id: 'urgency_variant',
      name: 'Urgency Variant',
      weight: 50,
      elements: {
        ctaText: 'Garantir Melhor Preço Agora',
        ctaColor: 'red',
        ctaPosition: 'sticky',
        priceDisplay: 'savings',
        trustBadges: true,
        urgencyBanner: true
      },
      metrics: { views: 0, conversions: 0, conversionRate: 0 }
    }
  ];

  // Psychological triggers
  const psychologicalTriggers: PsychologicalTrigger[] = [
    {
      type: 'scarcity',
      enabled: true,
      intensity: 'medium',
      timing: 'delayed',
      content: {
        message: '⏰ Apenas 3 assentos restantes neste preço!',
        action: 'reserve_now'
      }
    },
    {
      type: 'social_proof',
      enabled: true,
      intensity: 'high',
      timing: 'immediate',
      content: {
        message: '+ de 50 pessoas reservaram esta rota hoje',
        visual: 'notification'
      }
    },
    {
      type: 'urgency',
      enabled: true,
      intensity: 'high',
      timing: 'on_exit',
      content: {
        message: 'Preços podem subir a qualquer momento',
        action: 'book_now'
      }
    }
  ];

  // Conversion triggers
  const conversionTriggers: ConversionTriggers = {
    scarcity: {
      enabled: true,
      message: '⏰ Oferta válida por tempo limitado',
      countdown: 900 // 15 minutes
    },
    socialProof: {
      enabled: true,
      recentBookings: [],
      popularityScore: 85
    },
    urgency: {
      enabled: true,
      priceAlert: true,
      timeLimit: 1800 // 30 minutes
    },
    trust: {
      securityBadges: true,
      testimonials: [],
      certifications: ['SSL', 'PCI-DSS']
    }
  };

  // Mobile form configuration
  const mobileConfig: MobileFormConfig = {
    oneHandedMode: true,
    swipeGestures: true,
    hapticFeedback: true,
    biometricAuth: false,
    progressiveDisclosure: true,
    smartKeyboard: true,
    gestureNavigation: true
  };

  // Convert form data to intelligent form fields
  const intelligentFields: IntelligentFormField[] = [
    {
      id: 'origem',
      label: 'Origem',
      type: 'autocomplete',
      required: true,
      value: formData.origem,
      placeholder: 'De onde você está saindo?',
      aiFeatures: {
        smartAutocomplete: true,
        voiceInput: true,
        contextualHelp: true,
        predictiveText: true
      }
    },
    {
      id: 'destino',
      label: 'Destino',
      type: 'autocomplete',
      required: true,
      value: formData.destino,
      placeholder: 'Para onde você quer ir?',
      aiFeatures: {
        smartAutocomplete: true,
        voiceInput: true,
        contextualHelp: true,
        predictiveText: true
      }
    },
    {
      id: 'dataIda',
      label: 'Data de Ida',
      type: 'date',
      required: true,
      value: formData.dataIda,
      placeholder: 'Quando você quer viajar?'
    },
    {
      id: 'dataVolta',
      label: 'Data de Volta',
      type: 'date',
      required: formData.tipoViagem === 'ida-volta',
      value: formData.dataVolta,
      placeholder: 'Quando você quer voltar?'
    },
    {
      id: 'nome',
      label: 'Nome',
      type: 'text',
      required: true,
      value: formData.nome,
      placeholder: 'Seu primeiro nome',
      validation: {
        minLength: 2,
        maxLength: 50,
        message: 'Nome deve ter entre 2 e 50 caracteres'
      },
      aiFeatures: {
        contextualHelp: true
      }
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      value: formData.email,
      placeholder: 'seu@email.com',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Digite um email válido'
      },
      aiFeatures: {
        smartAutocomplete: true,
        contextualHelp: true
      }
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      type: 'tel',
      required: true,
      value: formData.whatsapp,
      placeholder: '(11) 99999-9999',
      validation: {
        pattern: /\(\d{2}\)\s?\d{4,5}-?\d{4}/,
        message: 'Digite um número de WhatsApp válido'
      },
      aiFeatures: {
        smartAutocomplete: true,
        contextualHelp: true
      }
    }
  ];

  // Convert to mobile form fields
  const mobileFields: MobileFormField[] = intelligentFields.map(field => ({
    id: field.id,
    label: field.label,
    type: field.type,
    value: field.value,
    mobileOptimizations: {
      keyboardType: field.type === 'email' ? 'email' : 
                   field.type === 'tel' ? 'tel' :
                   field.type === 'text' ? 'default' : 'default',
      inputMode: field.type === 'email' ? 'email' :
                field.type === 'tel' ? 'tel' :
                field.type === 'text' ? 'text' : 'text',
      autoComplete: field.id === 'email' ? 'email' :
                   field.id === 'nome' ? 'given-name' :
                   field.id === 'telefone' || field.id === 'whatsapp' ? 'tel' :
                   'off',
      minTouchTarget: 44,
      swipeActions: field.id === 'origem' || field.id === 'destino' ? 
                   { right: 'popular' } : undefined
    }
  }));

  // Travel intelligence hooks
  const { searchAirports } = useFuzzyAirportSearch();
  const { insights } = useTravelInsights(
    formData.origem?.iataCode,
    formData.destino?.iataCode,
    { departure: formData.dataIda, return: formData.dataVolta }
  );
  
  // Conversion optimization hooks
  const { activeVariant } = useABTest(abTestVariants);
  const { currentPrice, originalPrice, savings } = useDynamicPricing(650, 'medium');

  // Field change handler
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Show insights when origin and destination are selected
    if ((fieldId === 'origem' || fieldId === 'destino') && value) {
      setShowInsights(true);
    }
  }, []);

  // Form submission handler
  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    
    try {
      // Track conversion
      if (typeof trackFormSubmit === 'function') {
        trackFormSubmit('intelligent_form_submission', {
          ...data,
          abVariant: activeVariant?.name,
          formType: 'integrated_intelligent',
          deviceType: isMobile ? 'mobile' : 'desktop',
          completionTime: Date.now()
        });
      }

      // Submit form
      await onSubmit(data as IntegratedFormData);
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Insight selection handler
  const handleInsightSelect = (insight: TravelInsight) => {
    console.log('Selected insight:', insight);
    // Handle insight selection (could open modals, update form, etc.)
  };

  // Route selection handler
  const handleRouteSelect = (route: TravelRoute) => {
    // Auto-fill form with selected route
    const originAirport = { code: route.origin, name: route.origin };
    const destAirport = { code: route.destination, name: route.destination };
    
    handleFieldChange('origem', originAirport);
    handleFieldChange('destino', destAirport);
  };

  // Conversion event handler
  const handleConversionEvent = (eventType: string, data: any) => {
    console.log('Conversion event:', eventType, data);
    // Track conversion events for optimization
  };

  return (
    <div className={`integrated-intelligent-form ${className}`}>
      <ConversionOptimizer
        triggers={psychologicalTriggers}
        abTests={abTestVariants}
        onConversion={handleConversionEvent}
      >
        {/* Price comparison for high-value routes */}
        {formData.origem && formData.destino && (
          <PriceComparison
            currentPrice={currentPrice}
            originalPrice={originalPrice}
            savings={savings}
            competitorPrices={[
              { name: 'Decolar', price: currentPrice + 45 },
              { name: 'Expedia', price: currentPrice + 78 },
              { name: 'Booking', price: currentPrice + 23 }
            ]}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            {isMobile ? (
              <MobileOptimizedFormUX
                fields={mobileFields}
                config={mobileConfig}
                onFieldChange={handleFieldChange}
                onFormSubmit={handleFormSubmit}
                className="mb-6"
              />
            ) : (
              <IntelligentFormSystem
                fields={intelligentFields}
                context={formContext}
                triggers={conversionTriggers}
                onFieldChange={handleFieldChange}
                onFormSubmit={handleFormSubmit}
                className="mb-6"
              />
            )}

            {/* Custom form fields that need special handling */}
            <div className="space-y-6">
              {/* Airport Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origem *
                  </label>
                  <AirportAutocomplete
                    value={formData.origem}
                    onChange={(airport) => handleFieldChange('origem', airport)}
                    placeholder="De onde você está saindo?"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino *
                  </label>
                  <AirportAutocomplete
                    value={formData.destino}
                    onChange={(airport) => handleFieldChange('destino', airport)}
                    placeholder="Para onde você quer ir?"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Ida *
                  </label>
                  <DatePicker
                    value={formData.dataIda}
                    onChange={(date) => handleFieldChange('dataIda', date)}
                    placeholder="Selecione a data de ida"
                    className="w-full"
                  />
                </div>
                
                {formData.tipoViagem === 'ida-volta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Volta *
                    </label>
                    <DatePicker
                      value={formData.dataVolta}
                      onChange={(date) => handleFieldChange('dataVolta', date)}
                      placeholder="Selecione a data de volta"
                      minDate={formData.dataIda}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Passenger Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adultos
                  </label>
                  <select
                    value={formData.adultos}
                    onChange={(e) => handleFieldChange('adultos', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8,9].map(num => (
                      <option key={num} value={num}>{num} Adulto{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crianças (2-11)
                  </label>
                  <select
                    value={formData.criancas}
                    onChange={(e) => handleFieldChange('criancas', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[0,1,2,3,4,5,6,7,8,9].map(num => (
                      <option key={num} value={num}>{num} Criança{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bebês (0-2)
                  </label>
                  <select
                    value={formData.bebes}
                    onChange={(e) => handleFieldChange('bebes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[0,1,2,3,4].map(num => (
                      <option key={num} value={num}>{num} Bebê{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* WhatsApp Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <PhoneInput
                  value={formData.whatsapp}
                  onChange={(phone) => handleFieldChange('whatsapp', phone)}
                  placeholder="(11) 99999-9999"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Travel Intelligence Sidebar */}
          <div className="lg:col-span-1">
            {showInsights && (
              <TravelIntelligenceEngine
                origin={formData.origem?.iataCode}
                destination={formData.destino?.iataCode}
                dates={{ 
                  departure: formData.dataIda, 
                  return: formData.dataVolta 
                }}
                onInsightSelect={handleInsightSelect}
                onRouteSelect={handleRouteSelect}
                className="sticky top-4"
              />
            )}
          </div>
        </div>
      </ConversionOptimizer>
    </div>
  );
}