'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import CityAutocomplete from '@/components/CityAutocomplete';
import { cities } from '@/data/cities';

interface MobileInsuranceFormProps {
  onUpdate?: (insuranceData: any) => void;
  initialData?: any;
  className?: string;
}

type StepType = 'basic' | 'coverage' | 'health' | 'details';

export default function MobileInsuranceForm({ onUpdate, initialData, className = '' }: MobileInsuranceFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('basic');
  const [formData, setFormData] = useState({
    // Basic information
    destinoSeguro: initialData?.destinoSeguro || '',
    dataPartida: initialData?.dataPartida || '',
    dataRetorno: initialData?.dataRetorno || '',
    passageiros: initialData?.passageiros || 1,
    idadeViajante: initialData?.idadeViajante || '25-35',
    
    // Insurance type and coverage
    tipoSeguro: initialData?.tipoSeguro || 'basico',
    cobertura: initialData?.cobertura || '',
    seguroCompleto: initialData?.seguroCompleto || false,
    
    // Coverage options
    bagagemExtraviada: initialData?.bagagemExtraviada || false,
    cancelamentoViagem: initialData?.cancelamentoViagem || false,
    atrasoVoo: initialData?.atrasoVoo || false,
    assistenciaJuridica: initialData?.assistenciaJuridica || false,
    despesasFarmacia: initialData?.despesasFarmacia || false,
    hospedagemAcompanhante: initialData?.hospedagemAcompanhante || false,
    
    // Health conditions
    gestante: initialData?.gestante || false,
    praticaEsportes: initialData?.praticaEsportes || false,
    esportesEspecificos: initialData?.esportesEspecificos || '',
    condicoesPreexistentes: initialData?.condicoesPreexistentes || false,
    condicoesDetalhes: initialData?.condicoesDetalhes || '',
    
    // Additional details
    observacoesSeguro: initialData?.observacoesSeguro || '',
    orcamento: '',
    urgencia: false
  });

  const updateFormData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  const insuranceTypes = [
    { 
      value: 'basico', 
      label: 'Básico', 
      icon: '🛡️', 
      description: 'Cobertura essencial para viagem',
      coverage: 'Até USD 30.000'
    },
    { 
      value: 'intermediario', 
      label: 'Intermediário', 
      icon: '🛡️✨', 
      description: 'Cobertura ampliada',
      coverage: 'Até USD 60.000'
    },
    { 
      value: 'premium', 
      label: 'Premium', 
      icon: '🛡️👑', 
      description: 'Cobertura completa e serviços VIP',
      coverage: 'Até USD 100.000+'
    }
  ];

  const ageRanges = [
    { value: '0-17', label: '0-17 anos' },
    { value: '18-24', label: '18-24 anos' },
    { value: '25-35', label: '25-35 anos' },
    { value: '36-45', label: '36-45 anos' },
    { value: '46-55', label: '46-55 anos' },
    { value: '56-65', label: '56-65 anos' },
    { value: '66-75', label: '66-75 anos' },
    { value: '76+', label: '76+ anos' }
  ];

  const coverageOptions = [
    { 
      key: 'bagagemExtraviada', 
      label: 'Bagagem Extraviada', 
      icon: '🧳', 
      description: 'Cobertura para bagagem perdida ou atrasada'
    },
    { 
      key: 'cancelamentoViagem', 
      label: 'Cancelamento de Viagem', 
      icon: '❌', 
      description: 'Reembolso em caso de cancelamento'
    },
    { 
      key: 'atrasoVoo', 
      label: 'Atraso de Voo', 
      icon: '⏰', 
      description: 'Cobertura para atrasos e conexões perdidas'
    },
    { 
      key: 'assistenciaJuridica', 
      label: 'Assistência Jurídica', 
      icon: '⚖️', 
      description: 'Suporte legal no exterior'
    },
    { 
      key: 'despesasFarmacia', 
      label: 'Despesas de Farmácia', 
      icon: '💊', 
      description: 'Cobertura para medicamentos'
    },
    { 
      key: 'hospedagemAcompanhante', 
      label: 'Hospedagem Acompanhante', 
      icon: '🏨', 
      description: 'Hospedagem para acompanhante em caso de internação'
    }
  ];

  const steps = [
    { key: 'basic', label: 'Básico', icon: ShieldCheckIcon },
    { key: 'coverage', label: 'Cobertura', icon: ExclamationTriangleIcon },
    { key: 'health', label: 'Saúde', icon: HeartIcon },
    { key: 'details', label: 'Detalhes', icon: MapPinIcon }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 'basic':
        return formData.destinoSeguro.trim().length > 0 && 
               formData.dataPartida && 
               formData.dataRetorno;
      case 'coverage':
        return formData.tipoSeguro;
      case 'health':
        return !formData.condicoesPreexistentes || formData.condicoesDetalhes.trim().length > 0;
      case 'details':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepOrder: StepType[] = ['basic', 'coverage', 'health', 'details'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1 && canProceed()) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: StepType[] = ['basic', 'coverage', 'health', 'details'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-neu-lg border border-neutral-200 ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-success-500 to-success-600 text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Seguro Viagem</h3>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <div
                key={step.key}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-white' : isActive ? 'bg-white/70' : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 'basic' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <ShieldCheckIcon className="w-12 h-12 text-success-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Informações Básicas</h4>
                  <p className="text-sm text-neutral-600">Destino e período da viagem</p>
                </div>

                <div className="space-y-3">
                  <CityAutocomplete
                    value={formData.destinoSeguro}
                    onChange={(value) => updateFormData('destinoSeguro', value)}
                    placeholder="Ex: Europa, Estados Unidos, Ásia..."
                    label="Destino da Viagem *"
                    iconColor="#10b981"
                    cities={cities}
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Data de Partida *
                      </label>
                      <input
                        type="date"
                        value={formData.dataPartida}
                        onChange={(e) => updateFormData('dataPartida', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Data de Retorno *
                      </label>
                      <input
                        type="date"
                        value={formData.dataRetorno}
                        onChange={(e) => updateFormData('dataRetorno', e.target.value)}
                        min={formData.dataPartida || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Número de Passageiros
                      </label>
                      <select
                        value={formData.passageiros}
                        onChange={(e) => updateFormData('passageiros', Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} pessoa{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Faixa Etária Principal
                      </label>
                      <select
                        value={formData.idadeViajante}
                        onChange={(e) => updateFormData('idadeViajante', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200"
                      >
                        {ageRanges.map(age => (
                          <option key={age.value} value={age.value}>{age.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Coverage Type */}
            {currentStep === 'coverage' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <ExclamationTriangleIcon className="w-12 h-12 text-success-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Tipo de Cobertura</h4>
                  <p className="text-sm text-neutral-600">Escolha o plano ideal para sua viagem</p>
                </div>

                <div className="space-y-3">
                  {insuranceTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateFormData('tipoSeguro', type.value)}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        formData.tipoSeguro === type.value
                          ? 'bg-success-50 border-success-300 text-success-700'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-neutral-500">{type.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{type.coverage}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h5 className="font-medium text-neutral-900 mb-3">Coberturas Adicionais (opcionais)</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {coverageOptions.map((coverage) => (
                      <label key={coverage.key} className="flex items-start gap-2 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData[coverage.key as keyof typeof formData] as boolean}
                          onChange={(e) => updateFormData(coverage.key, e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-success-600 focus:ring-success-500 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{coverage.icon}</span>
                            <span className="text-xs font-medium text-neutral-900 leading-tight">{coverage.label}</span>
                          </div>
                          <p className="text-xs text-neutral-500 leading-tight">{coverage.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Health Information */}
            {currentStep === 'health' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <HeartIcon className="w-12 h-12 text-success-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Informações de Saúde</h4>
                  <p className="text-sm text-neutral-600">Para uma cobertura adequada às suas necessidades</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h5 className="font-medium text-neutral-900 mb-3">Condições Especiais</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.gestante}
                          onChange={(e) => updateFormData('gestante', e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-success-600 focus:ring-success-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤰</span>
                          <span className="text-xs text-neutral-700 leading-tight">Alguma viajante está grávida</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.praticaEsportes}
                          onChange={(e) => updateFormData('praticaEsportes', e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-success-600 focus:ring-success-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏃</span>
                          <span className="text-xs text-neutral-700 leading-tight">Praticaremos esportes ou atividades de risco</span>
                        </div>
                      </label>

                      {formData.praticaEsportes && (
                        <div className="ml-6">
                          <input
                            type="text"
                            value={formData.esportesEspecificos}
                            onChange={(e) => updateFormData('esportesEspecificos', e.target.value)}
                            placeholder="Especifique: ski, mergulho, escalada..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-success-500 focus:ring-1 focus:ring-success-500/20 transition-all duration-200 text-xs"
                          />
                        </div>
                      )}

                      <label className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData.condicoesPreexistentes}
                          onChange={(e) => updateFormData('condicoesPreexistentes', e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-success-600 focus:ring-success-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-base">💊</span>
                          <span className="text-xs text-neutral-700 leading-tight">Condições de saúde pré-existentes</span>
                        </div>
                      </label>

                      {formData.condicoesPreexistentes && (
                        <div className="ml-6">
                          <textarea
                            value={formData.condicoesDetalhes}
                            onChange={(e) => updateFormData('condicoesDetalhes', e.target.value)}
                            placeholder="Descreva: diabetes, hipertensão, problemas cardíacos..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:border-success-500 focus:ring-1 focus:ring-success-500/20 transition-all duration-200 text-xs resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <MapPinIcon className="w-12 h-12 text-success-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Detalhes Finais</h4>
                  <p className="text-sm text-neutral-600">Informações adicionais para sua cotação</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Orçamento Estimado (opcional)
                  </label>
                  <select
                    value={formData.orcamento}
                    onChange={(e) => updateFormData('orcamento', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200"
                  >
                    <option value="">Não tenho orçamento definido</option>
                    <option value="ate-100">Até R$ 100 por pessoa</option>
                    <option value="100-200">R$ 100 - R$ 200 por pessoa</option>
                    <option value="200-300">R$ 200 - R$ 300 por pessoa</option>
                    <option value="300-500">R$ 300 - R$ 500 por pessoa</option>
                    <option value="acima-500">Acima de R$ 500 por pessoa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Observações Especiais
                  </label>
                  <textarea
                    value={formData.observacoesSeguro}
                    onChange={(e) => updateFormData('observacoesSeguro', e.target.value)}
                    placeholder="Alguma informação adicional sobre a viagem ou necessidades especiais..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-success-500 focus:ring-2 focus:ring-success-500/20 transition-all duration-200 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.urgencia}
                    onChange={(e) => updateFormData('urgencia', e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-warning-600 focus:ring-warning-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-warning-900">Preciso do seguro com urgência</span>
                    <p className="text-xs text-warning-700">Viajo nos próximos 7 dias</p>
                  </div>
                </label>

                <div className="bg-success-50 rounded-xl p-3">
                  <h5 className="font-medium text-success-900 mb-2 text-sm">✅ O que está incluso:</h5>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-success-800 leading-tight">
                    <li>• Despesas médicas e hospitalares no exterior</li>
                    <li>• Regresso sanitário em caso de emergência</li>
                    <li>• Cobertura para COVID-19 (nos planos premium)</li>
                    <li>• Atendimento 24h em português</li>
                    <li>• App móvel para suporte durante a viagem</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50 pb-32 safe-area-inset-bottom">
        <div className="flex justify-between gap-3">
          <button
            onClick={prevStep}
            disabled={currentStep === 'basic'}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Anterior</span>
          </button>

          <div className="flex gap-1">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
              
              return (
                <div
                  key={step.key}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-success-600' : isActive ? 'bg-success-400' : 'bg-neutral-300'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">
              {currentStep === 'details' ? 'Concluir' : 'Continue'}
            </span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}