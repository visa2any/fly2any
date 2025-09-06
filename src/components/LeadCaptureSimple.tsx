'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';
import AirportAutocomplete from './flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';
import { 
  FlightIcon, 
  HotelIcon, 
  CarIcon, 
  TourIcon, 
  InsuranceIcon, 
  CalendarIcon, 
  UsersIcon, 
  CheckIcon,
  PhoneIcon,
  MailIcon
} from './Icons';

interface ServiceFormData {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed: boolean;
  // Travel data
  origem: AirportSelection | null;
  destino: AirportSelection | null;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  // Additional preferences
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  // Hotel specific
  checkin?: string;
  checkout?: string;
  quartos?: number;
  categoriaHotel?: string;
  // Car specific
  localRetirada?: string;
  dataRetirada?: string;
  horaRetirada?: string;
  dataEntrega?: string;
  horaEntrega?: string;
  categoriaVeiculo?: string;
  // Tour specific
  tipoPasseio?: string;
  duracao?: string;
  // Insurance specific
  tipoSeguro?: string;
  cobertura?: string;
  idadeViajante?: string;
  // Additional
  observacoes?: string;
  flexibilidadeDatas?: boolean;
  orcamentoAproximado?: string;
}

interface LeadCaptureSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

const LeadCaptureSimple = memo(function LeadCaptureSimple({ isOpen, onClose, context = 'popup' }: LeadCaptureSimpleProps) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 LeadCaptureSimple rendering!', { isOpen, context });
  }
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedServices: [] as ServiceFormData[],
    currentServiceIndex: 0,
    // Personal data (shared between all services)
    nome: '',
    email: '',
    whatsapp: '',
    // Shared travel preferences
    origem: null as AirportSelection | null,
    destino: null as AirportSelection | null,
    dataIda: '',
    dataVolta: '',
    tipoViagem: 'ida-volta' as const,
    adultos: 1,
    criancas: 0,
    bebes: 0,
    observacoes: '',
    orcamentoAproximado: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAddingService, setIsAddingService] = useState(true);

  // Service management functions
  const addNewService = useCallback((serviceType: ServiceFormData['serviceType']) => {
    const newService: ServiceFormData = {
      serviceType,
      completed: false,
      origem: formData.origem,
      destino: formData.destino,
      dataIda: formData.dataIda,
      dataVolta: formData.dataVolta,
      tipoViagem: formData.tipoViagem,
      classeVoo: 'economica',
      adultos: formData.adultos,
      criancas: formData.criancas,
      bebes: formData.bebes,
      companhiaPreferida: '',
      horarioPreferido: 'qualquer',
      escalas: 'qualquer',
      observacoes: formData.observacoes,
      flexibilidadeDatas: false,
      orcamentoAproximado: formData.orcamentoAproximado
    };
    
    setFormData((prev: any) => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newService],
      currentServiceIndex: prev.selectedServices.length
    }));
    setIsAddingService(false);
    setCurrentStep(2);
  }, [formData.origem, formData.destino, formData.dataIda, formData.dataVolta, formData.tipoViagem, formData.adultos, formData.criancas, formData.bebes, formData.observacoes, formData.orcamentoAproximado]);

  const removeService = useCallback((index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((_: any, i: number) => i !== index)
    }));
    if (formData.selectedServices.length === 1) {
      setIsAddingService(true);
      setCurrentStep(1);
    }
  }, [formData.selectedServices.length]);

  const getCurrentService = useCallback(() => {
    return formData.selectedServices[formData.currentServiceIndex] || null;
  }, [formData.selectedServices, formData.currentServiceIndex]);

  const updateCurrentService = useCallback((updates: Partial<ServiceFormData>) => {
    setFormData((prev: any) => {
      const updatedServices = [...prev.selectedServices];
      if (updatedServices[prev.currentServiceIndex]) {
        updatedServices[prev.currentServiceIndex] = {
          ...updatedServices[prev.currentServiceIndex],
          ...updates
        };
      }
      return {
        ...prev,
        selectedServices: updatedServices
      };
    });
  }, [formData.selectedServices, formData.currentServiceIndex]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedServices: formData.selectedServices,
          source: context,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setCurrentStep(1);
          setFormData({
            selectedServices: [],
            currentServiceIndex: 0,
            nome: '',
            email: '',
            whatsapp: '',
            origem: null,
            destino: null,
            dataIda: '',
            dataVolta: '',
            tipoViagem: 'ida-volta',
            adultos: 1,
            criancas: 0,
            bebes: 0,
            observacoes: '',
            orcamentoAproximado: ''
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, context, onClose]);

  if (!isOpen) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ LeadCaptureSimple not open, returning null');
    }
    return null;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ LeadCaptureSimple is open and rendering!');
  }

  // Get service icons and names (memoized)
  const getServiceIcon = useMemo(() => (serviceType: string) => {
    switch (serviceType) {
      case 'voos': return <FlightIcon className="w-6 h-6" />;
      case 'hoteis': return <HotelIcon className="w-6 h-6" />;
      case 'carros': return <CarIcon className="w-6 h-6" />;
      case 'passeios': return <TourIcon className="w-6 h-6" />;
      case 'seguro': return <InsuranceIcon className="w-6 h-6" />;
      default: return <FlightIcon className="w-6 h-6" />;
    }
  }, []);

  const getServiceName = useMemo(() => (serviceType: string) => {
    switch (serviceType) {
      case 'voos': return 'Voos';
      case 'hoteis': return 'Hotéis';
      case 'carros': return 'Carros';
      case 'passeios': return 'Passeios';
      case 'seguro': return 'Seguro';
      default: return 'Serviço';
    }
  }, []);

  if (submitSuccess) {
    return (
      <div className="h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform animate-bounce">
          <div className="text-primary-500 text-6xl mb-6 animate-pulse">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfeito!</h2>
          <p className="text-gray-600 mb-6">
            Sua cotação foi enviada com sucesso! Nossa equipe entrará em contato em breve com as melhores ofertas.
          </p>
          <div className="text-4xl mb-4">✈️🏨🚗</div>
        </div>
      </div>
    );
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🎨 Rendering premium app design!');
  }
  
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      fontSize: '14px'
    }}>
      
      {/* Premium App Header */}
      <div className="bg-blue-600 text-white p-4 md:p-6 md:rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Original Fly2Any Logo */}
            <img 
              src="/fly2any-logo.svg" 
              alt="Fly2Any" 
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg"
              style={{ 
                width: '48px', 
                height: '48px', 
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Hamburger Menu & Close */}
          <div className="flex items-center space-x-2">
            <button className="text-blue-200 hover:text-white p-2 rounded-full hover:bg-blue-500 transition-colors">
              <div className="flex flex-col space-y-1">
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Header - Compact with icon on left */}
      <div className="bg-white/60 backdrop-blur-lg px-4 py-3 border-b border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > 1 ? '✓' : '🎯'}
            </div>
            <h2 className="text-base font-semibold text-gray-800">
              {currentStep === 1 && 'Escolha os Serviços'}
              {currentStep === 2 && 'Detalhes do Serviço'}
              {currentStep === 3 && 'Informações Adicionais'}
              {currentStep === 4 && 'Dados Pessoais'}
            </h2>
          </div>
          <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full">
            Passo {currentStep} de 4
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-500 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area - Responsive */}
      <div className="flex-1 overflow-hidden p-4 md:p-6" style={{ paddingBottom: '140px' }}>

        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">Quais serviços você precisa?</h3>
              <p className="text-sm md:text-base text-gray-600">Selecione todos os serviços desejados para sua viagem</p>
            </div>

            {/* Selected Services Display */}
            {formData.selectedServices.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white/90 mb-3">Serviços Selecionados:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-2 rounded-full"
                    >
                      {getServiceIcon(service.serviceType)}
                      <span className="text-sm font-medium text-gray-800">{getServiceName(service.serviceType)}</span>
                      {service.completed && (
                        <CheckIcon className="w-4 h-4 text-primary-500" />
                      )}
                      <button
                        onClick={() => removeService(index)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsive Service Selection Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                {(['voos', 'hoteis', 'carros', 'passeios', 'seguro'] as const).map(serviceType => {
                  const isSelected = formData.selectedServices.some(s => s.serviceType === serviceType);
                  
                  return (
                    <button
                      key={serviceType}
                      onClick={() => !isSelected && addNewService(serviceType)}
                      disabled={isSelected}
                      className={`
                        relative p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
                        ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-300 shadow-lg'
                            : 'bg-white/90 backdrop-blur-lg border-gray-200 hover:border-blue-300 hover:shadow-lg'
                        }
                      `}
                      style={{ 
                        minHeight: '85px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: isSelected ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {serviceType === 'voos' && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Popular
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {getServiceIcon(serviceType)}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          {getServiceName(serviceType)}
                        </h4>
                        <p className="text-xs text-gray-600 leading-tight">
                          {serviceType === 'voos' && 'Passagens aéreas'}
                          {serviceType === 'hoteis' && 'Hospedagem'}
                          {serviceType === 'carros' && 'Aluguel de veículos'}
                          {serviceType === 'passeios' && 'Tours e atividades'}
                          {serviceType === 'seguro' && 'Proteção de viagem'}
                        </p>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckIcon className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {currentStep === 2 && getCurrentService() && (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{getServiceIcon(getCurrentService()!.serviceType)}</div>
              <h3 className="text-xl font-bold text-gray-800">
                Detalhes - {getServiceName(getCurrentService()!.serviceType)}
              </h3>
              <p className="text-gray-600">Configure as preferências para este serviço</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Common travel fields for all services */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Origem</label>
                  <AirportAutocomplete
                    value={getCurrentService()?.origem || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => updateCurrentService({ origem: airport })}
                    placeholder="De onde você parte?"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Destino</label>
                  <AirportAutocomplete
                    value={getCurrentService()?.destino || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => updateCurrentService({ destino: airport })}
                    placeholder="Para onde você vai?"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data Ida</label>
                    <DatePicker
                      value={getCurrentService()?.dataIda || ''}
                      onChange={(value) => updateCurrentService({ dataIda: value })}
                      placeholder="Data de ida"
                      label=""
                      minDate={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data Volta</label>
                    <DatePicker
                      value={getCurrentService()?.dataVolta || ''}
                      onChange={(value) => updateCurrentService({ dataVolta: value })}
                      placeholder="Data de volta"
                      label=""
                      minDate={getCurrentService()?.dataIda || new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Flight specific fields */}
                {getCurrentService()?.serviceType === 'voos' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Classe</label>
                      <select
                        value={getCurrentService()?.classeVoo || 'economica'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ classeVoo: e.target.value as any })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="economica">Econômica</option>
                        <option value="premium">Econômica Premium</option>
                        <option value="executiva">Executiva</option>
                        <option value="primeira">Primeira Classe</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Adultos</label>
                        <select
                          value={getCurrentService()?.adultos || 1}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ adultos: parseInt(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Crianças</label>
                        <select
                          value={getCurrentService()?.criancas || 0}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ criancas: parseInt(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bebês</label>
                        <select
                          value={getCurrentService()?.bebes || 0}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ bebes: parseInt(e.target.value) })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {[0,1,2].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Hotel specific fields */}
                {getCurrentService()?.serviceType === 'hoteis' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria do Hotel</label>
                      <select
                        value={getCurrentService()?.categoriaHotel || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ categoriaHotel: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        <option value="3-estrelas">3 Estrelas</option>
                        <option value="4-estrelas">4 Estrelas</option>
                        <option value="5-estrelas">5 Estrelas</option>
                        <option value="resort">Resort</option>
                        <option value="boutique">Boutique Hotel</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Quartos</label>
                      <select
                        value={getCurrentService()?.quartos || 1}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentService({ quartos: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} quarto{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Information */}
        {currentStep === 3 && (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-bold text-gray-800">Informações Adicionais</h3>
              <p className="text-gray-600">Nos ajude a personalizar sua experiência</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Orçamento Aproximado</label>
                <select
                  value={formData.orcamentoAproximado}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, orcamentoAproximado: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma faixa...</option>
                  <option value="ate-2000">Até R$ 2.000</option>
                  <option value="2000-5000">R$ 2.000 - R$ 5.000</option>
                  <option value="5000-10000">R$ 5.000 - R$ 10.000</option>
                  <option value="10000-20000">R$ 10.000 - R$ 20.000</option>
                  <option value="acima-20000">Acima de R$ 20.000</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Conte-nos sobre suas preferências, necessidades especiais, ou qualquer detalhe importante..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              {/* Services Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3">Resumo dos Serviços:</h4>
                <div className="space-y-2">
                  {formData.selectedServices.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {getServiceIcon(service.serviceType)}
                      <span className="font-medium text-gray-700">{getServiceName(service.serviceType)}</span>
                      {service.completed && <CheckIcon className="w-4 h-4 text-primary-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Personal Information */}
        {currentStep === 4 && (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-xl font-bold text-gray-800">Dados Pessoais</h3>
              <p className="text-gray-600">Para finalizarmos sua cotação personalizada</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full pl-10 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-xl border border-primary-200">
                <div className="flex items-start space-x-3">
                  <div className="text-primary-500 text-xl">🔒</div>
                  <div>
                    <h5 className="font-semibold text-primary-800 mb-1">Seus dados estão seguros</h5>
                    <p className="text-sm text-primary-700">
                      Utilizamos criptografia de ponta e não compartilhamos suas informações com terceiros.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Premium Bottom Navigation */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200/50 p-4 fixed bottom-0 left-0 right-0">

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              if (currentStep === 2 && formData.selectedServices.length > 1) {
                setCurrentStep(1);
              } else {
                setCurrentStep(Math.max(currentStep - 1, 1));
              }
            }}
            disabled={currentStep === 1}
            className="px-4 py-3 md:px-6 text-sm md:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Voltar
          </button>

          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  i <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <button
              onClick={() => {
                if (currentStep === 1 && formData.selectedServices.length > 0) {
                  setCurrentStep(2);
                } else if (currentStep === 1) {
                  return;
                } else if (currentStep === 2) {
                  setCurrentStep(3);
                } else if (currentStep === 3) {
                  setCurrentStep(4);
                }
              }}
              disabled={
                (currentStep === 1 && formData.selectedServices.length === 0) ||
                (currentStep === 2 && getCurrentService() && (!getCurrentService()?.origem || !getCurrentService()?.destino || !getCurrentService()?.dataIda))
              }
              className="px-4 py-3 md:px-6 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.nome || !formData.email || !formData.whatsapp}
              className="px-4 py-3 md:px-6 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>✅</span>
              )}
              <span>{isSubmitting ? 'Enviando...' : 'Finalizar Cotação'}</span>
            </button>
          )}
        </div>
        
        {/* Fly2Any Main App Navigation */}
        <div className="flex items-center justify-around pt-2 border-t border-gray-200">
          {[
            { icon: '🏠', label: 'Início', active: false },
            { icon: '🔍', label: 'Buscar', active: false },
            { icon: '❤️', label: 'Favoritos', active: false },
            { icon: '✈️', label: 'Viagens', active: true },
            { icon: '👤', label: 'Perfil', active: false }
          ].map(({ icon, label, active }) => (
            <div key={label} className="flex flex-col items-center space-y-1 py-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all duration-300 ${
                active 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}>
                {icon}
              </div>
              <span className={`text-xs font-medium ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
LeadCaptureSimple.displayName = 'LeadCaptureSimple';

export default LeadCaptureSimple;