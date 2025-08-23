'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  AtSymbolIcon, 
  PhoneIcon, 
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import PhoneInputSimple from './PhoneInputSimple';
import DatePicker from './DatePicker';
import AirportAutocomplete from './flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

interface LeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'chat' | 'form' | 'popup';
  initialData?: Partial<LeadFormData>;
}

interface LeadFormData {
  // Dados Pessoais
  nome: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  dataNascimento?: string;
  
  // Localização
  cidade: string;
  estado: string;
  pais: string;
  
  // Viagem
  tipoViagem: 'ida' | 'ida_volta' | 'multiplas_cidades';
  origem: AirportSelection | null;
  destino: AirportSelection | null;
  dataPartida: string;
  dataRetorno?: string;
  numeroPassageiros: number;
  classeViagem: 'economica' | 'premium' | 'executiva' | 'primeira';
  
  // Serviços
  selectedServices: string[];
  
  // Hospedagem
  precisaHospedagem: boolean;
  tipoHospedagem?: 'hotel' | 'pousada' | 'resort' | 'apartamento';
  categoriaHospedagem?: '3' | '4' | '5' | 'luxo';
  
  // Transporte
  precisaTransporte: boolean;
  tipoTransporte?: 'aluguel_carro' | 'transfer' | 'taxi' | 'uber';
  
  // Orçamento
  orcamentoTotal?: string;
  prioridadeOrcamento: 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
  
  // Experiência
  experienciaViagem: 'primeira_vez' | 'ocasional' | 'frequente' | 'expert';
  motivoViagem: 'lazer' | 'negocio' | 'familia' | 'lua_mel' | 'aventura' | 'cultura';
  
  // Comunicação
  preferenciaContato: 'whatsapp' | 'telefone' | 'email' | 'qualquer';
  melhorHorario: 'manha' | 'tarde' | 'noite' | 'qualquer';
  
  // Marketing
  comoConheceu: 'google' | 'facebook' | 'instagram' | 'indicacao' | 'youtube' | 'outro';
  receberPromocoes: boolean;
  
  // Observações
  observacoes?: string;
  necessidadeEspecial?: string;
}

const servicos = [
  { id: 'voos', nome: 'Passagens Aéreas', icon: '✈️' },
  { id: 'hospedagem', nome: 'Hospedagem', icon: '🏨' },
  { id: 'aluguel_carro', nome: 'Aluguel de Carro', icon: '🚗' },
  { id: 'seguro_viagem', nome: 'Seguro Viagem', icon: '🛡️' },
  { id: 'visto', nome: 'Visto/Documentação', icon: '📋' },
  { id: 'transfer', nome: 'Transfer', icon: '🚐' },
  { id: 'passeios', nome: 'Passeios e Tours', icon: '🎯' },
  { id: 'chip_internet', nome: 'Chip de Internet', icon: '📱' },
  { id: 'cambio', nome: 'Câmbio', icon: '💱' },
  { id: 'consultoria', nome: 'Consultoria Personalizada', icon: '🎓' }
];

const motivosViagem = [
  { id: 'lazer', nome: 'Lazer/Turismo', icon: '🌴' },
  { id: 'negocio', nome: 'Negócios', icon: '💼' },
  { id: 'familia', nome: 'Visita à Família', icon: '👨‍👩‍👧‍👦' },
  { id: 'lua_mel', nome: 'Lua de Mel', icon: '💕' },
  { id: 'aventura', nome: 'Aventura', icon: '🏔️' },
  { id: 'cultura', nome: 'Cultural', icon: '🎭' }
];

export default function LeadCaptureMobile({ isOpen, onClose, context = 'form', initialData = {} }: LeadCaptureProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    tipoViagem: 'ida_volta',
    origem: null,
    destino: null,
    dataPartida: '',
    numeroPassageiros: 1,
    classeViagem: 'economica',
    selectedServices: [],
    precisaHospedagem: false,
    precisaTransporte: false,
    prioridadeOrcamento: 'custo_beneficio',
    experienciaViagem: 'ocasional',
    motivoViagem: 'lazer',
    preferenciaContato: 'whatsapp',
    melhorHorario: 'qualquer',
    comoConheceu: 'google',
    receberPromocoes: true,
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalSteps = 6;

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepNumber) {
      case 1:
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
        break;
      case 2:
        if (!formData.origem) newErrors.origem = 'Origem é obrigatória';
        if (!formData.destino) newErrors.destino = 'Destino é obrigatório';
        if (!formData.dataPartida) newErrors.dataPartida = 'Data de partida é obrigatória';
        if (formData.tipoViagem === 'ida_volta' && !formData.dataRetorno) {
          newErrors.dataRetorno = 'Data de retorno é obrigatória';
        }
        break;
      case 3:
        if (formData.selectedServices.length === 0) {
          newErrors.selectedServices = 'Selecione pelo menos um serviço';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          pageUrl: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        
        // Enviar para automação
        await fetch('/api/webhooks/n8n/lead-automation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId: data.leadId,
            formData,
            source: context
          })
        });

        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setStep(1);
        }, 3000);
      } else {
        setErrors({ submit: data.message || 'Erro ao enviar formulário' });
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (step / totalSteps) * 100;

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-fadeIn">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scaleIn">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Obrigado!</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              Recebemos seus dados e entraremos em contato em breve com as melhores opções para sua viagem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
                <span>Resposta em até 2h</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
                <span>Cotação gratuita</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999]">
      <div className={`
        bg-white w-full sm:max-w-2xl 
        ${isMobile ? 'rounded-t-3xl max-h-[85vh]' : 'rounded-2xl max-h-[90vh] mx-4'}
        shadow-2xl overflow-hidden animate-slideUp
      `}>
        {/* Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">
                {isMobile ? 'Sua Viagem' : 'Planeje sua Viagem dos Sonhos'}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Passo {step} de {totalSteps} • Cotação gratuita
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-blue-500/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Content - Mobile Optimized */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(85vh - 120px)' : 'calc(90vh - 150px)' }}>
          
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Dados Pessoais</h3>
                <p className="text-sm text-gray-600">Vamos começar com suas informações básicas</p>
              </div>
              
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    className={`
                      w-full px-4 py-3 text-base
                      border rounded-xl
                      transition-all duration-200
                      ${errors.nome 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }
                      focus:ring-2 focus:outline-none
                    `}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`
                      w-full px-4 py-3 text-base
                      border rounded-xl
                      transition-all duration-200
                      ${errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }
                      focus:ring-2 focus:outline-none
                    `}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <PhoneInputSimple
                    value={formData.whatsapp}
                    onChange={(value) => updateFormData('whatsapp', value)}
                    error={errors.whatsapp}
                    className="w-full"
                    inputClassName={`
                      w-full px-4 py-3 text-base
                      border rounded-xl
                      ${errors.whatsapp 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                      }
                    `}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.whatsapp}
                    </p>
                  )}
                </div>

                {/* Location - Mobile Stack */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => updateFormData('cidade', e.target.value)}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sua cidade"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.estado}
                        onChange={(e) => updateFormData('estado', e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.pais}
                        onChange={(e) => updateFormData('pais', e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Travel Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPinIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Detalhes da Viagem</h3>
                <p className="text-sm text-gray-600">Para onde você quer ir?</p>
              </div>

              {/* Trip Type - Mobile Pills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de viagem
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'ida', label: 'Somente Ida' },
                    { value: 'ida_volta', label: 'Ida e Volta' },
                    { value: 'multiplas_cidades', label: 'Múltiplas Cidades' }
                  ].map((tipo) => (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => updateFormData('tipoViagem', tipo.value)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-200
                        ${formData.tipoViagem === tipo.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {tipo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin and Destination */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origem *
                  </label>
                  <AirportAutocomplete
                    value={formData.origem}
                    onChange={(value) => updateFormData('origem', value)}
                    placeholder="De onde você sai?"
                    className="w-full"
                    inputClassName={`
                      w-full px-4 py-3 text-base
                      ${errors.origem ? 'border-red-500' : ''}
                    `}
                  />
                  {errors.origem && (
                    <p className="mt-1 text-xs text-red-600">{errors.origem}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino *
                  </label>
                  <AirportAutocomplete
                    value={formData.destino}
                    onChange={(value) => updateFormData('destino', value)}
                    placeholder="Para onde você vai?"
                    className="w-full"
                    inputClassName={`
                      w-full px-4 py-3 text-base
                      ${errors.destino ? 'border-red-500' : ''}
                    `}
                  />
                  {errors.destino && (
                    <p className="mt-1 text-xs text-red-600">{errors.destino}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de ida *
                  </label>
                  <DatePicker
                    value={formData.dataPartida}
                    onChange={(value) => updateFormData('dataPartida', value)}
                    placeholder="Selecione a data"
                    className="w-full"
                    inputClassName={`
                      w-full px-4 py-3 text-base
                      ${errors.dataPartida ? 'border-red-500' : ''}
                    `}
                  />
                  {errors.dataPartida && (
                    <p className="mt-1 text-xs text-red-600">{errors.dataPartida}</p>
                  )}
                </div>

                {formData.tipoViagem === 'ida_volta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de volta *
                    </label>
                    <DatePicker
                      value={formData.dataRetorno || ''}
                      onChange={(value) => updateFormData('dataRetorno', value)}
                      placeholder="Selecione a data"
                      className="w-full"
                      inputClassName={`
                        w-full px-4 py-3 text-base
                        ${errors.dataRetorno ? 'border-red-500' : ''}
                      `}
                    />
                    {errors.dataRetorno && (
                      <p className="mt-1 text-xs text-red-600">{errors.dataRetorno}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Passengers and Class */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passageiros
                  </label>
                  <select
                    value={formData.numeroPassageiros}
                    onChange={(e) => updateFormData('numeroPassageiros', parseInt(e.target.value))}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe
                  </label>
                  <select
                    value={formData.classeViagem}
                    onChange={(e) => updateFormData('classeViagem', e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="economica">Econômica</option>
                    <option value="premium">Premium</option>
                    <option value="executiva">Executiva</option>
                    <option value="primeira">Primeira</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Serviços Desejados</h3>
                <p className="text-sm text-gray-600">O que você precisa para sua viagem?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione os serviços que deseja *
                </label>
                {errors.selectedServices && (
                  <p className="mb-3 text-xs text-red-600 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {errors.selectedServices}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicos.map((servico) => (
                    <label
                      key={servico.id}
                      className={`
                        flex items-center p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 hover:shadow-md
                        ${formData.selectedServices.includes(servico.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(servico.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData('selectedServices', [...formData.selectedServices, servico.id]);
                          } else {
                            updateFormData('selectedServices', formData.selectedServices.filter(s => s !== servico.id));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{servico.icon}</span>
                      <span className={`
                        text-sm font-medium
                        ${formData.selectedServices.includes(servico.id)
                          ? 'text-blue-700'
                          : 'text-gray-700'
                        }
                      `}>
                        {servico.nome}
                      </span>
                      {formData.selectedServices.includes(servico.id) && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Accommodation */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🏨</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Hospedagem e Transporte</h3>
                <p className="text-sm text-gray-600">Precisa de hospedagem ou transporte?</p>
              </div>

              {/* Hospedagem Toggle */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Precisa de hospedagem?
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData('precisaHospedagem', !formData.precisaHospedagem)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      ${formData.precisaHospedagem ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out
                        ${formData.precisaHospedagem ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {formData.precisaHospedagem && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de hospedagem
                      </label>
                      <select
                        value={formData.tipoHospedagem || ''}
                        onChange={(e) => updateFormData('tipoHospedagem', e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione</option>
                        <option value="hotel">Hotel</option>
                        <option value="pousada">Pousada</option>
                        <option value="resort">Resort</option>
                        <option value="apartamento">Apartamento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['3', '4', '5', 'luxo'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => updateFormData('categoriaHospedagem', cat)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium
                              transition-all duration-200
                              ${formData.categoriaHospedagem === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {cat === 'luxo' ? 'Luxo' : `${cat} ⭐`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Transporte Toggle */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Precisa de transporte?
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData('precisaTransporte', !formData.precisaTransporte)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      ${formData.precisaTransporte ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out
                        ${formData.precisaTransporte ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {formData.precisaTransporte && (
                  <div className="space-y-3 animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de transporte
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'aluguel_carro', label: '🚗 Aluguel de Carro' },
                        { value: 'transfer', label: '🚐 Transfer' },
                        { value: 'taxi', label: '🚕 Táxi' },
                        { value: 'uber', label: '🚙 Uber' }
                      ].map((tipo) => (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => updateFormData('tipoTransporte', tipo.value)}
                          className={`
                            p-3 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${formData.tipoTransporte === tipo.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {tipo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Budget and Experience */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CurrencyDollarIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Orçamento e Experiência</h3>
                <p className="text-sm text-gray-600">Qual seu perfil de viagem?</p>
              </div>

              {/* Budget Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Prioridade no orçamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'baixo_custo', label: '💰 Baixo Custo', desc: 'Economia máxima' },
                    { value: 'custo_beneficio', label: '⚖️ Custo-Benefício', desc: 'Equilíbrio ideal' },
                    { value: 'conforto', label: '🛋️ Conforto', desc: 'Mais conforto' },
                    { value: 'luxo', label: '💎 Luxo', desc: 'Premium' }
                  ].map((orcamento) => (
                    <button
                      key={orcamento.value}
                      type="button"
                      onClick={() => updateFormData('prioridadeOrcamento', orcamento.value)}
                      className={`
                        p-3 rounded-xl text-left
                        transition-all duration-200
                        ${formData.prioridadeOrcamento === orcamento.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <div className="font-medium text-sm">{orcamento.label}</div>
                      <div className={`text-xs mt-1 ${
                        formData.prioridadeOrcamento === orcamento.value
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {orcamento.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experiência com viagens
                </label>
                <select
                  value={formData.experienciaViagem}
                  onChange={(e) => updateFormData('experienciaViagem', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="primeira_vez">Primeira vez viajando</option>
                  <option value="ocasional">Viajo ocasionalmente</option>
                  <option value="frequente">Viajo frequentemente</option>
                  <option value="expert">Viajante experiente</option>
                </select>
              </div>

              {/* Travel Motive */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Motivo da viagem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {motivosViagem.map((motivo) => (
                    <button
                      key={motivo.id}
                      type="button"
                      onClick={() => updateFormData('motivoViagem', motivo.id)}
                      className={`
                        p-3 rounded-xl text-sm font-medium flex items-center
                        transition-all duration-200
                        ${formData.motivoViagem === motivo.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <span className="mr-2">{motivo.icon}</span>
                      <span>{motivo.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Communication Preferences */}
          {step === 6 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PhoneIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Preferências de Contato</h3>
                <p className="text-sm text-gray-600">Como prefere que entremos em contato?</p>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Canal preferido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'whatsapp', label: '💬 WhatsApp' },
                    { value: 'telefone', label: '📞 Telefone' },
                    { value: 'email', label: '📧 Email' },
                    { value: 'qualquer', label: '✅ Qualquer' }
                  ].map((canal) => (
                    <button
                      key={canal.value}
                      type="button"
                      onClick={() => updateFormData('preferenciaContato', canal.value)}
                      className={`
                        p-3 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${formData.preferenciaContato === canal.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {canal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Melhor horário
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'manha', label: '🌅 Manhã' },
                    { value: 'tarde', label: '☀️ Tarde' },
                    { value: 'noite', label: '🌙 Noite' },
                    { value: 'qualquer', label: '🕐 Qualquer' }
                  ].map((horario) => (
                    <button
                      key={horario.value}
                      type="button"
                      onClick={() => updateFormData('melhorHorario', horario.value)}
                      className={`
                        p-3 rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${formData.melhorHorario === horario.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {horario.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* How did you know us */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como nos conheceu?
                </label>
                <select
                  value={formData.comoConheceu}
                  onChange={(e) => updateFormData('comoConheceu', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicacao">Indicação</option>
                  <option value="youtube">YouTube</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Receive Promotions */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Receber promoções e ofertas especiais
                  </label>
                  <button
                    type="button"
                    onClick={() => updateFormData('receberPromocoes', !formData.receberPromocoes)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      ${formData.receberPromocoes ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out
                        ${formData.receberPromocoes ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações ou necessidades especiais
                </label>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => updateFormData('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Conte-nos mais sobre suas preferências..."
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              {errors.submit}
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed Bottom on Mobile */}
        <div className={`
          bg-gray-50 px-4 sm:px-6 py-4 border-t
          ${isMobile ? 'sticky bottom-0' : ''}
        `}>
          <div className="flex items-center justify-between gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            <div className="flex-1" />

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <span>Próximo</span>
                <ChevronRightIcon className="w-5 h-5 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  flex items-center px-6 py-3 rounded-xl font-medium
                  transition-all duration-200
                  ${isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span>Enviar Cotação</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); }
          to { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}