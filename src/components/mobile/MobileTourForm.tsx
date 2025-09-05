'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CameraIcon,
  TruckIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface MobileTourFormProps {
  onUpdate?: (tourData: any) => void;
  initialData?: any;
  className?: string;
}

type StepType = 'destination' | 'preferences' | 'details' | 'requirements';

export default function MobileTourForm({ onUpdate, initialData, className = '' }: MobileTourFormProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('destination');
  const [formData, setFormData] = useState({
    // Destination and basic info
    destino: initialData?.destino || '',
    dataPasseio: initialData?.dataPasseio || '',
    duracao: initialData?.duracao || '1-dia',
    duracaoPersonalizada: initialData?.duracaoPersonalizada || '',
    numeroViajantes: initialData?.numeroViajantes || 2,
    
    // Tour types and preferences
    tipoPasseio: initialData?.tipoPasseio || [] as string[],
    interessesEspecificos: initialData?.interessesEspecificos || '',
    nivelAtividade: initialData?.nivelAtividade || 'moderado',
    
    // Services and inclusions
    guiaLocal: initialData?.guiaLocal || false,
    transporteIncluso: initialData?.transporteIncluso || false,
    refeicoes: initialData?.refeicoes || false,
    fotografo: initialData?.fotografo || false,
    acomodacao: initialData?.acomodacao || '',
    
    // Additional details
    observacoesPasseio: initialData?.observacoesPasseio || '',
    orcamento: '',
    flexibilidadeDatas: false
  });

  const updateFormData = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  const tourTypes = [
    { id: 'cultural', label: 'Cultural', icon: '🏛️', description: 'Museus, monumentos, história' },
    { id: 'natureza', label: 'Natureza', icon: '🌿', description: 'Parques, trilhas, paisagens' },
    { id: 'aventura', label: 'Aventura', icon: '🏔️', description: 'Esportes, atividades radicais' },
    { id: 'gastronomia', label: 'Gastronomia', icon: '🍽️', description: 'Restaurantes, tours gastronômicos' },
    { id: 'relaxamento', label: 'Relaxamento', icon: '🧘', description: 'Spa, bem-estar' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', description: 'Compras, outlets' },
    { id: 'noturno', label: 'Vida Noturna', icon: '🌙', description: 'Bares, shows, entretenimento' },
    { id: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦', description: 'Atividades para toda família' }
  ];

  const activityLevels = [
    { value: 'baixo', label: 'Baixo', icon: '😌', description: 'Atividades leves, muito descanso' },
    { value: 'moderado', label: 'Moderado', icon: '🚶', description: 'Caminhadas leves, ritmo tranquilo' },
    { value: 'ativo', label: 'Ativo', icon: '🏃', description: 'Muitas atividades, caminhadas longas' },
    { value: 'intenso', label: 'Intenso', icon: '💪', description: 'Atividades físicas desafiadoras' }
  ];

  const durationOptions = [
    { value: 'meio-dia', label: 'Meio Dia', description: '4 horas' },
    { value: '1-dia', label: '1 Dia Inteiro', description: '8-10 horas' },
    { value: '2-dias', label: '2 Dias', description: 'Final de semana' },
    { value: '3-5-dias', label: '3-5 Dias', description: 'Escapada' },
    { value: '1-semana', label: '1 Semana', description: '7 dias' },
    { value: 'mais-1-semana', label: 'Mais de 1 Semana', description: '8+ dias' },
    { value: 'personalizado', label: 'Personalizado', description: 'Duração customizada' }
  ];

  const steps = [
    { key: 'destination', label: 'Destino', icon: MapIcon },
    { key: 'preferences', label: 'Preferências', icon: HeartIcon },
    { key: 'details', label: 'Detalhes', icon: ClockIcon },
    { key: 'requirements', label: 'Requisitos', icon: UserGroupIcon }
  ];

  const handleToggleTourType = (typeId: string) => {
    const newTypes = formData.tipoPasseio.includes(typeId)
      ? formData.tipoPasseio.filter((t: string) => t !== typeId)
      : [...formData.tipoPasseio, typeId];
    updateFormData('tipoPasseio', newTypes);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'destination':
        return formData.destino.trim().length > 0 && formData.dataPasseio;
      case 'preferences':
        return formData.tipoPasseio.length > 0;
      case 'details':
        return true;
      case 'requirements':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepOrder: StepType[] = ['destination', 'preferences', 'details', 'requirements'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1 && canProceed()) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: StepType[] = ['destination', 'preferences', 'details', 'requirements'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-neu-lg border border-neutral-200 overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-warning-500 to-warning-600 text-white p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="text-lg font-bold">Passeios & Tours</h3>
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
            {/* Step 1: Destination */}
            {currentStep === 'destination' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <MapIcon className="w-12 h-12 text-warning-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Onde vamos?</h4>
                  <p className="text-sm text-neutral-600">Destino e quando você quer fazer o passeio</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Destino do Passeio *
                    </label>
                    <input
                      type="text"
                      value={formData.destino}
                      onChange={(e) => updateFormData('destino', e.target.value)}
                      placeholder="Ex: Rio de Janeiro, Paris, Tokyo..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Data Preferida *
                    </label>
                    <input
                      type="date"
                      value={formData.dataPasseio}
                      onChange={(e) => updateFormData('dataPasseio', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Número de Pessoas
                    </label>
                    <select
                      value={formData.numeroViajantes}
                      onChange={(e) => updateFormData('numeroViajantes', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} pessoa{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {currentStep === 'preferences' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <HeartIcon className="w-12 h-12 text-warning-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Suas Preferências</h4>
                  <p className="text-sm text-neutral-600">Que tipo de experiência você busca?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Tipos de Passeio (selecione todos que interessam)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {tourTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleToggleTourType(type.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                          formData.tipoPasseio.includes(type.id)
                            ? 'bg-warning-50 border-warning-300 text-warning-700'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{type.icon}</span>
                          <span className="font-medium text-sm">{type.label}</span>
                        </div>
                        <p className="text-xs text-neutral-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nível de Atividade
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateFormData('nivelAtividade', level.value)}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                          formData.nivelAtividade === level.value
                            ? 'bg-warning-50 border-warning-300 text-warning-700'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{level.icon}</div>
                        <div className="font-medium text-sm">{level.label}</div>
                        <div className="text-xs text-neutral-500">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <ClockIcon className="w-12 h-12 text-warning-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Detalhes do Passeio</h4>
                  <p className="text-sm text-neutral-600">Duração e serviços inclusos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Duração do Passeio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {durationOptions.map((duration) => (
                      <button
                        key={duration.value}
                        type="button"
                        onClick={() => updateFormData('duracao', duration.value)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                          formData.duracao === duration.value
                            ? 'bg-warning-50 border-warning-300 text-warning-700'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{duration.label}</div>
                        <div className="text-xs text-neutral-500">{duration.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.duracao === 'personalizado' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Especifique a duração
                    </label>
                    <input
                      type="text"
                      value={formData.duracaoPersonalizada}
                      onChange={(e) => updateFormData('duracaoPersonalizada', e.target.value)}
                      placeholder="Ex: 3 dias e 2 noites"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200"
                    />
                  </div>
                )}

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h5 className="font-medium text-neutral-900 mb-3">Serviços Inclusos (opcionais)</h5>
                  <div className="space-y-2">
                    {[
                      { key: 'guiaLocal', label: 'Guia Local', icon: '👨‍🏫' },
                      { key: 'transporteIncluso', label: 'Transporte Incluso', icon: '🚌' },
                      { key: 'refeicoes', label: 'Refeições', icon: '🍽️' },
                      { key: 'fotografo', label: 'Fotógrafo Profissional', icon: '📸' }
                    ].map((service) => (
                      <label key={service.key} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                        <input
                          type="checkbox"
                          checked={formData[service.key as keyof typeof formData] as boolean}
                          onChange={(e) => updateFormData(service.key, e.target.checked)}
                          className="w-5 h-5 rounded border-neutral-300 text-warning-600 focus:ring-warning-500"
                        />
                        <span className="text-lg">{service.icon}</span>
                        <span className="text-sm text-neutral-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Requirements */}
            {currentStep === 'requirements' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <UserGroupIcon className="w-12 h-12 text-warning-600 mx-auto mb-2" />
                  <h4 className="text-lg font-semibold text-neutral-900">Requisitos Especiais</h4>
                  <p className="text-sm text-neutral-600">Informações adicionais sobre o grupo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Interesses Específicos
                  </label>
                  <textarea
                    value={formData.interessesEspecificos}
                    onChange={(e) => updateFormData('interessesEspecificos', e.target.value)}
                    placeholder="Ex: Arte contemporânea, culinária local, arquitetura histórica..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Orçamento Estimado (opcional)
                  </label>
                  <select
                    value={formData.orcamento}
                    onChange={(e) => updateFormData('orcamento', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200"
                  >
                    <option value="">Não tenho orçamento definido</option>
                    <option value="ate-500">Até R$ 500 por pessoa</option>
                    <option value="500-1000">R$ 500 - R$ 1.000 por pessoa</option>
                    <option value="1000-2000">R$ 1.000 - R$ 2.000 por pessoa</option>
                    <option value="2000-5000">R$ 2.000 - R$ 5.000 por pessoa</option>
                    <option value="acima-5000">Acima de R$ 5.000 por pessoa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Observações Adicionais
                  </label>
                  <textarea
                    value={formData.observacoesPasseio}
                    onChange={(e) => updateFormData('observacoesPasseio', e.target.value)}
                    placeholder="Alguma informação especial, restrições, comemorações..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-warning-500 focus:ring-2 focus:ring-warning-500/20 transition-all duration-200 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.flexibilidadeDatas}
                    onChange={(e) => updateFormData('flexibilidadeDatas', e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-warning-600 focus:ring-warning-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-warning-900">Tenho flexibilidade nas datas</span>
                    <p className="text-xs text-warning-700">Posso ajustar as datas para obter melhor preço</p>
                  </div>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50 pb-20 safe-area-inset-bottom">
        <div className="flex justify-between gap-3">
          <button
            onClick={prevStep}
            disabled={currentStep === 'destination'}
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
                    isCompleted ? 'bg-warning-600' : isActive ? 'bg-warning-400' : 'bg-neutral-300'
                  }`}
                />
              );
            })}
          </div>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-4 py-2 bg-warning-600 text-white rounded-xl hover:bg-warning-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium">
              {currentStep === 'requirements' ? 'Concluir' : 'Continue'}
            </span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}