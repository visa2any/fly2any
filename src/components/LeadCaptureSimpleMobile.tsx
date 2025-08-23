'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';
import AirportAutocomplete from './flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

interface LeadCaptureSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

const services = [
  { id: 'voos', name: 'Passagens Aéreas', icon: '✈️' },
  { id: 'hospedagem', name: 'Hospedagem', icon: '🏨' },
  { id: 'transfer', name: 'Transfer', icon: '🚐' },
  { id: 'seguro', name: 'Seguro Viagem', icon: '🛡️' },
  { id: 'passeios', name: 'Passeios', icon: '🎯' },
  { id: 'consultoria', name: 'Consultoria', icon: '💼' }
];

export default function LeadCaptureSimpleMobile({ isOpen, onClose, context = 'popup' }: LeadCaptureSimpleProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    origem: null as AirportSelection | null,
    destino: null as AirportSelection | null,
    dataPartida: '',
    dataRetorno: '',
    numeroPassageiros: 1,
    selectedServices: [] as string[],
    tipoViagem: 'ida_volta' as 'ida' | 'ida_volta',
    prioridadeOrcamento: 'custo_beneficio',
    preferenciaContato: 'whatsapp'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepNumber) {
      case 1:
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Email inválido';
        }
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
        else if (formData.whatsapp.replace(/\D/g, '').length < 10) {
          newErrors.whatsapp = 'WhatsApp inválido';
        }
        break;
      case 2:
        if (!formData.origem) newErrors.origem = 'Origem é obrigatória';
        if (!formData.destino) newErrors.destino = 'Destino é obrigatório';
        if (!formData.dataPartida) newErrors.dataPartida = 'Data de ida é obrigatória';
        if (formData.tipoViagem === 'ida_volta' && !formData.dataRetorno) {
          newErrors.dataRetorno = 'Data de volta é obrigatória';
        }
        break;
      case 3:
        if (formData.selectedServices.length === 0) {
          newErrors.services = 'Selecione pelo menos um serviço';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const formatWhatsApp = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 0) {
      if (cleaned.length <= 2) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 7) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      } else if (cleaned.length <= 11) {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      } else {
        formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
      }
    }
    
    return formatted;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
    if (errors.whatsapp) {
      setErrors(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID()
        },
        body: JSON.stringify({
          ...formData,
          whatsapp: '+55' + formData.whatsapp.replace(/\D/g, ''),
          source: context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          serviceType: 'quick_quote',
          pais: 'Brasil',
          cidade: '',
          estado: '',
          classeViagem: 'economica',
          experienciaViagem: 'ocasional',
          motivoViagem: 'lazer',
          melhorHorario: 'qualquer',
          comoConheceu: 'google',
          receberPromocoes: true
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setStep(1);
          // Clear form
          setFormData({
            nome: '',
            email: '',
            whatsapp: '',
            origem: null,
            destino: null,
            dataPartida: '',
            dataRetorno: '',
            numeroPassageiros: 1,
            selectedServices: [],
            tipoViagem: 'ida_volta',
            prioridadeOrcamento: 'custo_beneficio',
            preferenciaContato: 'whatsapp'
          });
        }, 3000);
      } else {
        setErrors({ submit: data.message || 'Erro ao enviar. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      setErrors({ submit: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-scaleIn">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enviado com Sucesso!</h2>
            <p className="text-gray-600 text-sm">
              Recebemos seus dados e entraremos em contato em até 2 horas com as melhores opções!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999]">
      <div className={`
        bg-white w-full sm:max-w-lg
        ${isMobile ? 'rounded-t-[24px] max-h-[85vh]' : 'rounded-2xl max-h-[90vh] mx-4'}
        shadow-2xl overflow-hidden animate-slideUp
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold">Cotação Rápida</h2>
              <p className="text-blue-100 text-xs">
                Passo {step} de 3 • 100% Gratuito
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-blue-500/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-white rounded-full h-1.5 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div 
          className="p-4 overflow-y-auto"
          style={{ maxHeight: isMobile ? 'calc(85vh - 80px)' : 'calc(90vh - 100px)' }}
        >
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">👤</div>
                <h3 className="text-base font-semibold text-gray-900">Seus Dados</h3>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, nome: e.target.value }));
                    if (errors.nome) setErrors(prev => ({ ...prev, nome: '' }));
                  }}
                  className={`
                    w-full px-3 py-3 text-base
                    border rounded-lg
                    ${errors.nome ? 'border-red-500' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                  `}
                  placeholder="Seu nome"
                  autoComplete="name"
                  autoFocus={!isMobile}
                />
                {errors.nome && (
                  <p className="mt-1 text-xs text-red-600">{errors.nome}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`
                    w-full px-3 py-3 text-base
                    border rounded-lg
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200
                  `}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    +55
                  </span>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    className={`
                      w-full pl-12 pr-3 py-3 text-base
                      border rounded-lg
                      ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200
                    `}
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={15}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Travel Details */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">✈️</div>
                <h3 className="text-base font-semibold text-gray-900">Detalhes da Viagem</h3>
              </div>

              {/* Trip Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de viagem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipoViagem: 'ida' }))}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${formData.tipoViagem === 'ida'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    Somente Ida
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipoViagem: 'ida_volta' }))}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${formData.tipoViagem === 'ida_volta'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    Ida e Volta
                  </button>
                </div>
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  De onde? *
                </label>
                <AirportAutocomplete
                  value={formData.origem}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, origem: value }));
                    if (errors.origem) setErrors(prev => ({ ...prev, origem: '' }));
                  }}
                  placeholder="Cidade ou aeroporto"
                  className="w-full"
                  inputClassName={`
                    w-full px-3 py-3 text-base
                    ${errors.origem ? 'border-red-500' : ''}
                  `}
                />
                {errors.origem && (
                  <p className="mt-1 text-xs text-red-600">{errors.origem}</p>
                )}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Para onde? *
                </label>
                <AirportAutocomplete
                  value={formData.destino}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, destino: value }));
                    if (errors.destino) setErrors(prev => ({ ...prev, destino: '' }));
                  }}
                  placeholder="Cidade ou aeroporto"
                  className="w-full"
                  inputClassName={`
                    w-full px-3 py-3 text-base
                    ${errors.destino ? 'border-red-500' : ''}
                  `}
                />
                {errors.destino && (
                  <p className="mt-1 text-xs text-red-600">{errors.destino}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data ida *
                  </label>
                  <DatePicker
                    value={formData.dataPartida}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, dataPartida: value }));
                      if (errors.dataPartida) setErrors(prev => ({ ...prev, dataPartida: '' }));
                    }}
                    placeholder="Selecione"
                    className="w-full"
                    inputClassName={`
                      w-full px-3 py-3 text-sm
                      ${errors.dataPartida ? 'border-red-500' : ''}
                    `}
                  />
                  {errors.dataPartida && (
                    <p className="mt-1 text-xs text-red-600">{errors.dataPartida}</p>
                  )}
                </div>

                {formData.tipoViagem === 'ida_volta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data volta *
                    </label>
                    <DatePicker
                      value={formData.dataRetorno}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, dataRetorno: value }));
                        if (errors.dataRetorno) setErrors(prev => ({ ...prev, dataRetorno: '' }));
                      }}
                      placeholder="Selecione"
                      className="w-full"
                      inputClassName={`
                        w-full px-3 py-3 text-sm
                        ${errors.dataRetorno ? 'border-red-500' : ''}
                      `}
                    />
                    {errors.dataRetorno && (
                      <p className="mt-1 text-xs text-red-600">{errors.dataRetorno}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passageiros
                </label>
                <select
                  value={formData.numeroPassageiros}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroPassageiros: parseInt(e.target.value) }))}
                  className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'passageiro' : 'passageiros'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-base font-semibold text-gray-900">O que você precisa?</h3>
              </div>

              {errors.services && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">
                  {errors.services}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer
                      transition-all duration-200
                      ${formData.selectedServices.includes(service.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedServices.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            selectedServices: [...prev.selectedServices, service.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            selectedServices: prev.selectedServices.filter(s => s !== service.id)
                          }));
                        }
                        if (errors.services) setErrors(prev => ({ ...prev, services: '' }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-xl mr-2">{service.icon}</span>
                    <span className={`
                      text-xs font-medium
                      ${formData.selectedServices.includes(service.id)
                        ? 'text-blue-700'
                        : 'text-gray-700'
                      }
                    `}>
                      {service.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Budget Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'baixo_custo', label: '💰 Economia' },
                    { value: 'custo_beneficio', label: '⚖️ Custo-Benefício' },
                    { value: 'conforto', label: '🛋️ Conforto' },
                    { value: 'luxo', label: '💎 Luxo' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, prioridadeOrcamento: option.value }))}
                      className={`
                        py-2 px-3 rounded-lg text-xs font-medium
                        transition-all duration-200
                        ${formData.prioridadeOrcamento === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  {errors.submit}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="text-gray-600 text-sm font-medium"
            >
              ← Voltar
            </button>
          )}

          <div className="flex-1" />

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 flex items-center
                ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                  Enviar Cotação
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}