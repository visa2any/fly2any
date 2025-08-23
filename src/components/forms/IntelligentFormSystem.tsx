'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Core intelligent form types
export interface IntelligentFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'date' | 'autocomplete' | 'voice';
  required?: boolean;
  placeholder?: string;
  value: any;
  suggestions?: any[];
  validation?: {
    pattern?: RegExp;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
  aiFeatures?: {
    smartAutocomplete?: boolean;
    voiceInput?: boolean;
    contextualHelp?: boolean;
    predictiveText?: boolean;
  };
}

export interface FormContext {
  userBehavior: {
    fieldInteractions: Record<string, number>;
    timeSpent: Record<string, number>;
    abandonmentPoints: string[];
    completionPatterns: string[];
  };
  travelContext: {
    previousSearches: any[];
    preferences: Record<string, any>;
    seasonalTrends: any;
    popularRoutes: any[];
  };
  deviceContext: {
    isMobile: boolean;
    touchCapability: boolean;
    voiceSupported: boolean;
    biometricAvailable: boolean;
  };
}

export interface ConversionTriggers {
  scarcity: {
    enabled: boolean;
    message: string;
    countdown?: number;
  };
  socialProof: {
    enabled: boolean;
    recentBookings: any[];
    popularityScore: number;
  };
  urgency: {
    enabled: boolean;
    priceAlert: boolean;
    timeLimit?: number;
  };
  trust: {
    securityBadges: boolean;
    testimonials: any[];
    certifications: string[];
  };
}

interface IntelligentFormSystemProps {
  fields: IntelligentFormField[];
  context: FormContext;
  triggers: ConversionTriggers;
  onFieldChange: (fieldId: string, value: any) => void;
  onFormSubmit: (data: Record<string, any>) => Promise<void>;
  className?: string;
}

// AI-powered smart autocomplete hook
export const useSmartAutocomplete = (field: IntelligentFormField, context: FormContext) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useCallback(async (input: string) => {
    if (!field.aiFeatures?.smartAutocomplete || input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Travel-specific intelligent suggestions
      if (field.id === 'origem' || field.id === 'destino') {
        const airportSuggestions = await generateAirportSuggestions(input, context);
        setSuggestions(airportSuggestions);
      } else if (field.id === 'email') {
        const emailSuggestions = generateEmailSuggestions(input);
        setSuggestions(emailSuggestions);
      } else {
        const contextualSuggestions = await generateContextualSuggestions(field, input, context);
        setSuggestions(contextualSuggestions);
      }
    } catch (error) {
      console.warn('Smart autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [field, context]);

  return { suggestions, isLoading, generateSuggestions };
};

// Voice input hook
export const useVoiceInput = (field: IntelligentFormField) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!field.aiFeatures?.voiceInput || !('webkitSpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        setTranscript(result[0].transcript);
        setIsListening(false);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [field.aiFeatures?.voiceInput]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening };
};

// Real-time validation hook
export const useRealTimeValidation = (field: IntelligentFormField, value: any) => {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    validateField();
  }, [value]);

  const validateField = useCallback(() => {
    if (!value && field.required) {
      setError(`${field.label} é obrigatório`);
      setIsValid(false);
      return;
    }

    if (!value) {
      setError(null);
      setIsValid(true);
      return;
    }

    // Pattern validation
    if (field.validation?.pattern && !field.validation.pattern.test(value)) {
      setError(field.validation.message || `Formato inválido para ${field.label}`);
      setIsValid(false);
      return;
    }

    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      setError(`${field.label} deve ter pelo menos ${field.validation.minLength} caracteres`);
      setIsValid(false);
      return;
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      setError(`${field.label} deve ter no máximo ${field.validation.maxLength} caracteres`);
      setIsValid(false);
      return;
    }

    // Field-specific validation with helpful suggestions
    const fieldSuggestions = generateValidationSuggestions(field, value);
    setSuggestions(fieldSuggestions);

    setError(null);
    setIsValid(true);
  }, [field, value]);

  return { error, isValid, suggestions };
};

// Helper functions for AI features
const generateAirportSuggestions = async (input: string, context: FormContext) => {
  // Popular Brazil-US routes based on user behavior
  const popularRoutes = [
    { code: 'GRU', name: 'São Paulo - Guarulhos', country: 'Brasil', popularity: 95 },
    { code: 'GIG', name: 'Rio de Janeiro - Galeão', country: 'Brasil', popularity: 88 },
    { code: 'BSB', name: 'Brasília', country: 'Brasil', popularity: 75 },
    { code: 'JFK', name: 'New York - JFK', country: 'EUA', popularity: 92 },
    { code: 'MIA', name: 'Miami', country: 'EUA', popularity: 89 },
    { code: 'LAX', name: 'Los Angeles', country: 'EUA', popularity: 83 },
    { code: 'LAS', name: 'Las Vegas', country: 'EUA', popularity: 76 },
    { code: 'ORD', name: 'Chicago', country: 'EUA', popularity: 71 }
  ];

  const filtered = popularRoutes
    .filter(airport => 
      airport.code.toLowerCase().includes(input.toLowerCase()) ||
      airport.name.toLowerCase().includes(input.toLowerCase())
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);

  return filtered.map(airport => ({
    ...airport,
    label: `${airport.code} - ${airport.name}`,
    trending: airport.popularity > 80
  }));
};

const generateEmailSuggestions = (input: string) => {
  if (!input.includes('@')) return [];
  
  const [user, domain] = input.split('@');
  const popularDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com.br', 'uol.com.br'];
  
  return popularDomains
    .filter(d => d.startsWith(domain.toLowerCase()))
    .slice(0, 3)
    .map(d => ({
      value: `${user}@${d}`,
      label: `${user}@${d}`,
      confidence: d === 'gmail.com' ? 0.9 : 0.7
    }));
};

const generateContextualSuggestions = async (field: IntelligentFormField, input: string, context: FormContext) => {
  // Generate contextual suggestions based on field type and user behavior
  const suggestions: any[] = [];

  // Travel preferences based on context
  if (field.id === 'classeVoo') {
    suggestions.push(
      { value: 'economica', label: 'Econômica', savings: '40% mais barato', popular: true },
      { value: 'premium', label: 'Premium Economy', comfort: 'Mais espaço', trending: true },
      { value: 'executiva', label: 'Executiva', luxury: 'Lounge incluído' }
    );
  }

  return suggestions;
};

const generateValidationSuggestions = (field: IntelligentFormField, value: string): string[] => {
  const suggestions: string[] = [];

  if (field.type === 'email' && value.includes('@')) {
    const commonTypos = {
      'gmial': 'gmail',
      'gmai': 'gmail',
      'hotmial': 'hotmail',
      'yahooo': 'yahoo'
    };

    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (value.includes(typo)) {
        suggestions.push(`Você quis dizer: ${value.replace(typo, correct)}?`);
      }
    }
  }

  if (field.id === 'telefone' || field.id === 'whatsapp') {
    const phonePattern = /\(\d{2}\)\s?\d{4,5}-?\d{4}/;
    if (!phonePattern.test(value) && value.length >= 10) {
      suggestions.push('Formato sugerido: (11) 99999-9999');
    }
  }

  return suggestions;
};

export default function IntelligentFormSystem({
  fields,
  context,
  triggers,
  onFieldChange,
  onFormSubmit,
  className = ''
}: IntelligentFormSystemProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completionProgress, setCompletionProgress] = useState(0);
  
  // Track user interactions for AI learning
  useEffect(() => {
    const progress = calculateCompletionProgress();
    setCompletionProgress(progress);
  }, [formData]);

  const calculateCompletionProgress = () => {
    const requiredFields = fields.filter(f => f.required);
    const completedRequired = requiredFields.filter(f => formData[f.id]).length;
    return requiredFields.length > 0 ? (completedRequired / requiredFields.length) * 100 : 0;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    onFieldChange(fieldId, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onFormSubmit(formData);
  };

  return (
    <div className={`intelligent-form-system ${className}`}>
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso do formulário
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(completionProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionProgress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <IntelligentFormField
            key={field.id}
            field={field}
            value={formData[field.id] || ''}
            onChange={(value) => handleFieldChange(field.id, value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            isFocused={focusedField === field.id}
            context={context}
          />
        ))}

        {/* Conversion triggers */}
        <ConversionTriggersDisplay triggers={triggers} />

        <button
          type="submit"
          disabled={completionProgress < 100}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Buscar Ofertas Exclusivas</span>
          {completionProgress === 100 && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

// Individual intelligent form field component
function IntelligentFormField({
  field,
  value,
  onChange,
  onFocus,
  onBlur,
  isFocused,
  context
}: {
  field: IntelligentFormField;
  value: any;
  onChange: (value: any) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  context: FormContext;
}) {
  const { suggestions, isLoading, generateSuggestions } = useSmartAutocomplete(field, context);
  const { isListening, transcript, startListening, stopListening } = useVoiceInput(field);
  const { error, isValid, suggestions: validationSuggestions } = useRealTimeValidation(field, value);

  // Update field value from voice input
  useEffect(() => {
    if (transcript && transcript !== value) {
      onChange(transcript);
    }
  }, [transcript]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (field.aiFeatures?.smartAutocomplete) {
      generateSuggestions(newValue);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Main input */}
        <input
          type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'}
          value={value}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={field.placeholder}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
                     ${isValid ? 'border-gray-200 focus:border-blue-500' : 'border-red-500'}
                     ${isFocused ? 'shadow-lg ring-2 ring-blue-100' : ''}
                     ${field.aiFeatures?.voiceInput ? 'pr-12' : 'pr-4'}`}
        />

        {/* Voice input button */}
        {field.aiFeatures?.voiceInput && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full
                       ${isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}
                       hover:bg-opacity-80 transition-all duration-200`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Smart suggestions */}
      {suggestions.length > 0 && isFocused && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onChange(suggestion.value || suggestion.label);
                generateSuggestions(''); // Clear suggestions
              }}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between
                       first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
            >
              <span className="text-gray-900">{suggestion.label}</span>
              {suggestion.trending && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  🔥 Popular
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Validation error */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-start space-x-1">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Validation suggestions */}
      {validationSuggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationSuggestions.map((suggestion, index) => (
            <div key={index} className="text-sm text-blue-600 flex items-center space-x-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for suggestions */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

// Conversion triggers display component
function ConversionTriggersDisplay({ triggers }: { triggers: ConversionTriggers }) {
  return (
    <div className="space-y-4">
      {/* Scarcity trigger */}
      {triggers.scarcity.enabled && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">⚠️</span>
            <span className="text-orange-800 font-medium">{triggers.scarcity.message}</span>
          </div>
        </div>
      )}

      {/* Social proof */}
      {triggers.socialProof.enabled && triggers.socialProof.recentBookings.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-800 font-medium">Reservas Recentes</span>
          </div>
          <div className="text-sm text-green-700">
            {triggers.socialProof.recentBookings[0]?.message || 
             `Maria de São Paulo acabou de reservar uma viagem para Miami`}
          </div>
        </div>
      )}

      {/* Trust signals */}
      {triggers.trust.securityBadges && (
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">SSL Seguro</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Pagamento Seguro</span>
          </div>
        </div>
      )}
    </div>
  );
}