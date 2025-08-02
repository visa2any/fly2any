'use client'

import { useState, useCallback, useEffect } from 'react'
import { User, MapPin, Calendar, Plane, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface BrazilianFormProps {
  onSubmit: (data: FormData) => void
  initialStep?: number
  showProgress?: boolean
}

interface FormData {
  // Dados pessoais
  name: string
  email: string
  phone: string
  document: string
  documentType: 'cpf' | 'rg' | 'passport'
  
  // Dados de viagem
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  passengers: number
  travelClass: 'economy' | 'premium' | 'business'
  
  // Preferências
  flexibleDates: boolean
  newsletter: boolean
  urgency: 'normal' | 'urgent' | 'emergency'
}

const brazilianCities = [
  { name: 'São Paulo', state: 'SP', airport: 'GRU/CGH', popular: true },
  { name: 'Rio de Janeiro', state: 'RJ', airport: 'GIG/SDU', popular: true },
  { name: 'Belo Horizonte', state: 'MG', airport: 'CNF', popular: true },
  { name: 'Salvador', state: 'BA', airport: 'SSA', popular: true },
  { name: 'Brasília', state: 'DF', airport: 'BSB', popular: true },
  { name: 'Fortaleza', state: 'CE', airport: 'FOR', popular: true },
  { name: 'Recife', state: 'PE', airport: 'REC', popular: true },
  { name: 'Porto Alegre', state: 'RS', airport: 'POA', popular: true },
  { name: 'Curitiba', state: 'PR', airport: 'CWB', popular: false },
  { name: 'Manaus', state: 'AM', airport: 'MAO', popular: false },
  { name: 'Belém', state: 'PA', airport: 'BEL', popular: false },
  { name: 'Goiânia', state: 'GO', airport: 'GYN', popular: false }
]

const americanCities = [
  { name: 'Miami', state: 'FL', airport: 'MIA', popular: true },
  { name: 'Orlando', state: 'FL', airport: 'MCO', popular: true },
  { name: 'New York', state: 'NY', airport: 'JFK/LGA', popular: true },
  { name: 'Los Angeles', state: 'CA', airport: 'LAX', popular: true },
  { name: 'Boston', state: 'MA', airport: 'BOS', popular: true },
  { name: 'Washington', state: 'DC', airport: 'DCA', popular: true },
  { name: 'Atlanta', state: 'GA', airport: 'ATL', popular: false },
  { name: 'Chicago', state: 'IL', airport: 'ORD', popular: false },
  { name: 'Houston', state: 'TX', airport: 'IAH', popular: false },
  { name: 'Las Vegas', state: 'NV', airport: 'LAS', popular: false }
]

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: User, description: 'Suas informações básicas' },
  { id: 2, title: 'Destinos', icon: MapPin, description: 'De onde e para onde' },
  { id: 3, title: 'Datas', icon: Calendar, description: 'Quando viajar' },
  { id: 4, title: 'Preferências', icon: Plane, description: 'Detalhes da viagem' }
]

export default function BrazilianForm({ onSubmit, initialStep = 1, showProgress = true }: BrazilianFormProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    documentType: 'cpf',
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    travelClass: 'economy',
    flexibleDates: false,
    newsletter: true,
    urgency: 'normal'
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [suggestions, setSuggestions] = useState<{ origin: any[], destination: any[] }>({
    origin: [],
    destination: []
  })

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '')
    if (cleaned.length !== 11) return false
    
    if (/^(\d)\1{10}$/.test(cleaned)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0
    
    return cleaned[9] === digit1.toString() && cleaned[10] === digit2.toString()
  }

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}
    
    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = 'Nome é obrigatório'
        if (!formData.email) newErrors.email = 'Email é obrigatório'
        if (!formData.phone) newErrors.phone = 'Telefone é obrigatório'
        if (!formData.document) {
          newErrors.document = 'Documento é obrigatório'
        } else if (formData.documentType === 'cpf' && !validateCPF(formData.document)) {
          newErrors.document = 'CPF inválido'
        }
        break
      case 2:
        if (!formData.origin) newErrors.origin = 'Cidade de origem é obrigatória'
        if (!formData.destination) newErrors.destination = 'Cidade de destino é obrigatória'
        break
      case 3:
        if (!formData.departureDate) newErrors.departureDate = 'Data de ida é obrigatória'
        if (!formData.returnDate) newErrors.returnDate = 'Data de volta é obrigatória'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      } else {
        onSubmit(formData)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getCitySuggestions = useCallback((input: string, type: 'origin' | 'destination') => {
    if (!input || input.length < 2) {
      setSuggestions(prev => ({ ...prev, [type]: [] }))
      return
    }

    const cities = type === 'origin' ? americanCities : brazilianCities
    const filtered = cities
      .filter(city => 
        city.name.toLowerCase().includes(input.toLowerCase()) ||
        city.state.toLowerCase().includes(input.toLowerCase())
      )
      .sort((a, b) => {
        if (a.popular && !b.popular) return -1
        if (!a.popular && b.popular) return 1
        return 0
      })
      .slice(0, 5)

    setSuggestions(prev => ({ ...prev, [type]: filtered }))
  }, [])

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: João Silva Santos"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => updateFormData('documentType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cpf">CPF</option>
            <option value="rg">RG</option>
            <option value="passport">Passaporte</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.documentType.toUpperCase()} *
          </label>
          <input
            type="text"
            value={formData.documentType === 'cpf' ? formatCPF(formData.document) : formData.document}
            onChange={(e) => {
              const value = formData.documentType === 'cpf' 
                ? e.target.value.replace(/\D/g, '') 
                : e.target.value
              updateFormData('document', value)
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.document ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={
              formData.documentType === 'cpf' ? '000.000.000-00' :
              formData.documentType === 'rg' ? '00.000.000-0' :
              'ABC123456'
            }
          />
          {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telefone (WhatsApp) *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+55 (11) 99999-9999"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        <p className="text-sm text-gray-500 mt-1">
          ℹ️ Enviaremos a cotação via WhatsApp em até 2 horas
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saindo de (EUA) *
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => {
              updateFormData('origin', e.target.value)
              getCitySuggestions(e.target.value, 'origin')
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.origin ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Miami, Orlando, New York..."
          />
          {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
          
          {suggestions.origin.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {suggestions.origin.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    updateFormData('origin', `${city.name}, ${city.state}`)
                    setSuggestions(prev => ({ ...prev, origin: [] }))
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.name}, {city.state}</span>
                    <span className="text-sm text-gray-500">{city.airport}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indo para (Brasil) *
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => {
              updateFormData('destination', e.target.value)
              getCitySuggestions(e.target.value, 'destination')
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.destination ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: São Paulo, Rio de Janeiro..."
          />
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
          
          {suggestions.destination.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {suggestions.destination.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    updateFormData('destination', `${city.name}, ${city.state}`)
                    setSuggestions(prev => ({ ...prev, destination: [] }))
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.name}, {city.state}</span>
                    <span className="text-sm text-gray-500">{city.airport}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🇺🇸 Cidades Populares nos EUA:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {americanCities.filter(c => c.popular).map((city, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateFormData('origin', `${city.name}, ${city.state}`)}
              className="text-left text-sm text-blue-700 hover:text-blue-900 hover:underline"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">🇧🇷 Destinos Populares no Brasil:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {brazilianCities.filter(c => c.popular).map((city, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateFormData('destination', `${city.name}, ${city.state}`)}
              className="text-left text-sm text-green-700 hover:text-green-900 hover:underline"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Ida *
          </label>
          <input
            type="date"
            value={formData.departureDate}
            onChange={(e) => updateFormData('departureDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.departureDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Volta *
          </label>
          <input
            type="date"
            value={formData.returnDate}
            onChange={(e) => updateFormData('returnDate', e.target.value)}
            min={formData.departureDate || new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.returnDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
        <input
          type="checkbox"
          id="flexibleDates"
          checked={formData.flexibleDates}
          onChange={(e) => updateFormData('flexibleDates', e.target.checked)}
          className="w-4 h-4 text-blue-600"
        />
        <label htmlFor="flexibleDates" className="text-sm text-gray-700">
          Tenho flexibilidade com as datas (±3 dias) - pode economizar até 30%
        </label>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">⚡ Urgência da Viagem</h4>
        <div className="space-y-2">
          {[
            { value: 'normal', label: 'Normal - até 15 dias', icon: '📅' },
            { value: 'urgent', label: 'Urgente - até 7 dias', icon: '⏰' },
            { value: 'emergency', label: 'Emergência - até 3 dias', icon: '🚨' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="urgency"
                value={option.value}
                checked={formData.urgency === option.value}
                onChange={(e) => updateFormData('urgency', e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{option.icon} {option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Passageiros
          </label>
          <select
            value={formData.passengers}
            onChange={(e) => updateFormData('passengers', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'passageiro' : 'passageiros'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classe de Viagem
          </label>
          <select
            value={formData.travelClass}
            onChange={(e) => updateFormData('travelClass', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="economy">Econômica</option>
            <option value="premium">Premium Economy</option>
            <option value="business">Executiva</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="newsletter"
            checked={formData.newsletter}
            onChange={(e) => updateFormData('newsletter', e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor="newsletter" className="text-sm text-gray-700">
            Quero receber dicas de viagem e promoções exclusivas
          </label>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="font-medium text-green-900 mb-4">📋 Resumo da Solicitação</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Passageiro:</strong> {formData.name}</div>
          <div><strong>Rota:</strong> {formData.origin} → {formData.destination}</div>
          <div><strong>Datas:</strong> {formData.departureDate} até {formData.returnDate}</div>
          <div><strong>Passageiros:</strong> {formData.passengers}</div>
          <div><strong>Classe:</strong> {formData.travelClass === 'economy' ? 'Econômica' : formData.travelClass === 'premium' ? 'Premium' : 'Executiva'}</div>
          <div><strong>Urgência:</strong> {formData.urgency === 'normal' ? 'Normal' : formData.urgency === 'urgent' ? 'Urgente' : 'Emergência'}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${currentStep > step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    w-full h-1 mx-4
                    ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            {currentStep < steps.length ? (
              <>
                Próximo
                <Clock className="w-4 h-4" />
              </>
            ) : (
              <>
                Enviar Solicitação
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {currentStep === steps.length && (
        <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            📲 Cotação será enviada para seu WhatsApp em até 2 horas!
          </p>
        </div>
      )}
    </div>
  )
}