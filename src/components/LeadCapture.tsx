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
  ExclamationTriangleIcon
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

export default function LeadCapture({ isOpen, onClose, context = 'form', initialData = {} }: LeadCaptureProps) {
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
            <p className="text-gray-600 mb-4">
              Recebemos seus dados e entraremos em contato em breve com as melhores opções para sua viagem.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                Resposta em até 2h
              </div>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 mr-1" />
                Cotação gratuita
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Planeje sua Viagem dos Sonhos</h2>
              <p className="text-blue-200 text-sm mt-1">
                Passo {step} de {totalSteps} • Cotação 100% gratuita
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white p-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-blue-500 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <UserIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-gray-800">Seus Dados</h3>
                <p className="text-gray-600">Vamos começar com suas informações básicas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <PhoneInputSimple
                    value={formData.whatsapp}
                    onChange={(value) => updateFormData('whatsapp', value)}
                  />
                  {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
                </div>

                <div>
                  <DatePicker
                    value={formData.dataNascimento || ''}
                    onChange={(value) => updateFormData('dataNascimento', value)}
                    placeholder="Selecione sua data de nascimento"
                    label="Data de Nascimento"
                    maxDate={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => updateFormData('cidade', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => updateFormData('estado', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    value={formData.pais}
                    onChange={(e) => updateFormData('pais', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Brasil">Brasil</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detalhes da Viagem */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <MapPinIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-gray-800">Destino dos Sonhos</h3>
                <p className="text-gray-600">Para onde você quer viajar?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Viagem
                  </label>
                  <select
                    value={formData.tipoViagem}
                    onChange={(e) => updateFormData('tipoViagem', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ida">Só Ida</option>
                    <option value="ida_volta">Ida e Volta</option>
                    <option value="multiplas_cidades">Múltiplas Cidades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origem *
                  </label>
                  <AirportAutocomplete
                    value={formData.origem || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => updateFormData('origem', airport)}
                    placeholder="De onde você vai partir?"
                    error={errors.origem}
                    className="w-full"
                  />
                  {errors.origem && <p className="text-red-500 text-sm mt-1">{errors.origem}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino *
                  </label>
                  <AirportAutocomplete
                    value={formData.destino || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => updateFormData('destino', airport)}
                    placeholder="Para onde você quer ir?"
                    error={errors.destino}
                    className="w-full"
                  />
                  {errors.destino && <p className="text-red-500 text-sm mt-1">{errors.destino}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DatePicker
                    value={formData.dataPartida}
                    onChange={(value) => updateFormData('dataPartida', value)}
                    placeholder="Selecione a data de partida"
                    label="Data de Partida *"
                    minDate={new Date().toISOString().split('T')[0]}
                    error={errors.dataPartida}
                    className="w-full"
                  />
                  {errors.dataPartida && <p className="text-red-500 text-sm mt-1">{errors.dataPartida}</p>}
                </div>

                {formData.tipoViagem === 'ida_volta' && (
                  <div>
                    <DatePicker
                      value={formData.dataRetorno || ''}
                      onChange={(value) => updateFormData('dataRetorno', value)}
                      placeholder="Selecione a data de retorno"
                      label="Data de Retorno *"
                      minDate={formData.dataPartida}
                      error={errors.dataRetorno}
                      className="w-full"
                    />
                    {errors.dataRetorno && <p className="text-red-500 text-sm mt-1">{errors.dataRetorno}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Passageiros
                  </label>
                  <select
                    value={formData.numeroPassageiros}
                    onChange={(e) => updateFormData('numeroPassageiros', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} passageiro{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe da Viagem
                  </label>
                  <select
                    value={formData.classeViagem}
                    onChange={(e) => updateFormData('classeViagem', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="economica">Econômica</option>
                    <option value="premium">Premium Economy</option>
                    <option value="executiva">Executiva</option>
                    <option value="primeira">Primeira Classe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Viagem
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {motivosViagem.map((motivo) => (
                    <button
                      key={motivo.id}
                      type="button"
                      onClick={() => updateFormData('motivoViagem', motivo.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.motivoViagem === motivo.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{motivo.icon}</span>
                        <span className="text-sm font-medium">{motivo.nome}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Serviços */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-gray-800">Serviços Desejados</h3>
                <p className="text-gray-600">Quais serviços você precisa para sua viagem?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicos.map((servico) => (
                  <label
                    key={servico.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.selectedServices.includes(servico.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
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
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-2xl">{servico.icon}</span>
                    <span className="font-medium text-gray-700">{servico.nome}</span>
                  </label>
                ))}
              </div>
              
              {errors.selectedServices && (
                <p className="text-red-500 text-sm text-center">{errors.selectedServices}</p>
              )}
            </div>
          )}

          {/* Step 4: Hospedagem e Transporte */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="flex justify-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏨</span>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Hospedagem & Transporte</h3>
                <p className="text-gray-600">Vamos personalizar sua experiência</p>
              </div>

              {/* Hospedagem */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="hospedagem"
                    checked={formData.precisaHospedagem}
                    onChange={(e) => updateFormData('precisaHospedagem', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="hospedagem" className="text-lg font-medium text-gray-800">
                    Preciso de hospedagem
                  </label>
                </div>

                {formData.precisaHospedagem && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Hospedagem
                      </label>
                      <select
                        value={formData.tipoHospedagem}
                        onChange={(e) => updateFormData('tipoHospedagem', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
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
                      <select
                        value={formData.categoriaHospedagem}
                        onChange={(e) => updateFormData('categoriaHospedagem', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="3">3 Estrelas</option>
                        <option value="4">4 Estrelas</option>
                        <option value="5">5 Estrelas</option>
                        <option value="luxo">Luxo</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Transporte */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="transporte"
                    checked={formData.precisaTransporte}
                    onChange={(e) => updateFormData('precisaTransporte', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="transporte" className="text-lg font-medium text-gray-800">
                    Preciso de transporte no destino
                  </label>
                </div>

                {formData.precisaTransporte && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Transporte
                    </label>
                    <select
                      value={formData.tipoTransporte}
                      onChange={(e) => updateFormData('tipoTransporte', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="aluguel_carro">Aluguel de Carro</option>
                      <option value="transfer">Transfer</option>
                      <option value="taxi">Taxi</option>
                      <option value="uber">Uber/App</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Orçamento e Preferências */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CurrencyDollarIcon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-gray-800">Orçamento & Preferências</h3>
                <p className="text-gray-600">Vamos ajustar tudo ao seu perfil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento Total (opcional)
                  </label>
                  <select
                    value={formData.orcamentoTotal}
                    onChange={(e) => updateFormData('orcamentoTotal', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Não tenho orçamento definido</option>
                    <option value="ate_2000">Up to $2,000</option>
                    <option value="2000_5000">$2,000 - $5,000</option>
                    <option value="5000_10000">$5,000 - $10,000</option>
                    <option value="10000_20000">$10,000 - $20,000</option>
                    <option value="acima_20000">Above $20,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridadeOrcamento}
                    onChange={(e) => updateFormData('prioridadeOrcamento', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="baixo_custo">Baixo Custo</option>
                    <option value="custo_beneficio">Custo-Benefício</option>
                    <option value="conforto">Conforto</option>
                    <option value="luxo">Luxo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experiência com Viagens
                  </label>
                  <select
                    value={formData.experienciaViagem}
                    onChange={(e) => updateFormData('experienciaViagem', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="primeira_vez">Primeira vez</option>
                    <option value="ocasional">Ocasional</option>
                    <option value="frequente">Frequente</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como conheceu a Fly2Any?
                  </label>
                  <select
                    value={formData.comoConheceu}
                    onChange={(e) => updateFormData('comoConheceu', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="indicacao">Indicação</option>
                    <option value="youtube">YouTube</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Preferências de Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canal Preferido
                    </label>
                    <select
                      value={formData.preferenciaContato}
                      onChange={(e) => updateFormData('preferenciaContato', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telefone">Telefone</option>
                      <option value="email">Email</option>
                      <option value="qualquer">Qualquer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Melhor Horário
                    </label>
                    <select
                      value={formData.melhorHorario}
                      onChange={(e) => updateFormData('melhorHorario', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="manha">Manhã (8h-12h)</option>
                      <option value="tarde">Tarde (12h-18h)</option>
                      <option value="noite">Noite (18h-22h)</option>
                      <option value="qualquer">Qualquer horário</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Observações e Finalização */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Finalizando</h3>
                <p className="text-gray-600">Última oportunidade para nos contar mais detalhes</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações ou Pedidos Especiais
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => updateFormData('observacoes', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Conte-nos sobre preferências especiais, restrições alimentares, acessibilidade, comemorações, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Necessidades Especiais
                  </label>
                  <textarea
                    value={formData.necessidadeEspecial}
                    onChange={(e) => updateFormData('necessidadeEspecial', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acessibilidade, medicamentos, dietas especiais, etc."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.receberPromocoes}
                      onChange={(e) => updateFormData('receberPromocoes', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Desejo receber promoções exclusivas e novidades da Fly2Any
                    </span>
                  </label>
                </div>
              </div>

              {/* Resumo */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Resumo da Viagem</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Destino:</strong> {formData.origem ? `${formData.origem.city} (${formData.origem.iataCode})` : ''} → {formData.destino ? `${formData.destino.city} (${formData.destino.iataCode})` : ''}</p>
                    <p><strong>Datas:</strong> {formData.dataPartida} {formData.dataRetorno && `- ${formData.dataRetorno}`}</p>
                    <p><strong>Passageiros:</strong> {formData.numeroPassageiros}</p>
                  </div>
                  <div>
                    <p><strong>Serviços:</strong> {formData.selectedServices.length} selecionados</p>
                    <p><strong>Contato:</strong> {formData.preferenciaContato}</p>
                    <p><strong>Orçamento:</strong> {formData.orcamentoTotal || 'Não definido'}</p>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{errors.submit}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5" />
                )}
                <span>{isSubmitting ? 'Enviando...' : 'Finalizar Cotação'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}