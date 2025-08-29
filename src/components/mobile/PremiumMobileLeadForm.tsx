'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PremiumMobileLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'mobile-app' | 'chat' | 'popup';
}

interface LeadFormData {
  // Step 1: Personal Info
  nome: string;
  email: string;
  whatsapp: string;
  
  // Step 2: Trip Details  
  origem: string;
  destino: string;
  dataPartida: string;
  dataRetorno?: string;
  tipoViagem: 'ida' | 'ida-volta' | 'multiplas-cidades';
  
  // Step 3: Services
  selectedServices: string[];
  
  // Step 4: Budget & Preferences
  orcamento: string;
  prioridade: 'economia' | 'conforto' | 'luxo';
  observacoes?: string;
}

const services = [
  { id: 'voos', name: 'Passagens Aéreas', icon: '✈️', color: 'bg-blue-500' },
  { id: 'hospedagem', name: 'Hotéis', icon: '🏨', color: 'bg-green-500' },
  { id: 'carros', name: 'Aluguel de Carros', icon: '🚗', color: 'bg-purple-500' },
  { id: 'seguro', name: 'Seguro Viagem', icon: '🛡️', color: 'bg-orange-500' },
  { id: 'passeios', name: 'Tours & Passeios', icon: '🎯', color: 'bg-pink-500' },
  { id: 'transfer', name: 'Transfer', icon: '🚐', color: 'bg-indigo-500' }
];

const budgetRanges = [
  { id: 'ate-2000', label: 'Até $2.000', value: 'ate_2000' },
  { id: '2000-5000', label: '$2.000 - $5.000', value: '2000_5000' },
  { id: '5000-10000', label: '$5.000 - $10.000', value: '5000_10000' },
  { id: 'acima-10000', label: 'Acima de $10.000', value: 'acima_10000' }
];

export default function PremiumMobileLeadForm({ isOpen, onClose, context = 'mobile-app' }: PremiumMobileLeadFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    nome: '',
    email: '',
    whatsapp: '',
    origem: '',
    destino: '',
    dataPartida: '',
    tipoViagem: 'ida-volta',
    selectedServices: ['voos'],
    orcamento: '',
    prioridade: 'conforto'
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep((prev: any) => prev + 1);
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep((prev: any) => prev - 1);
    }
  }

  const handleSubmit = async (): Promise<void> => {
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

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setStep(1);
          setFormData({
            nome: '',
            email: '',
            whatsapp: '',
            origem: '',
            destino: '',
            dataPartida: '',
            tipoViagem: 'ida-volta',
            selectedServices: ['voos'],
            orcamento: '',
            prioridade: 'conforto'
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepIcons = [
    { icon: UserIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: MapPinIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: SparklesIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: CurrencyDollarIcon, color: 'text-orange-600', bg: 'bg-orange-100' }
  ];

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Cotação Enviada! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Recebemos seus dados! Nossa equipe entrará em contato em até 2 horas com as melhores ofertas.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <ChatBubbleLeftRightIcon className="w-3 h-3" />
              <span>Resposta em 2h</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <SparklesIcon className="w-3 h-3" />
              <span>100% Gratuito</span>
            </Badge>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 h-auto"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Cotação Gratuita</h1>
              <p className="text-blue-100 text-sm">Passo {step} de {totalSteps}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {stepIcons.map((stepIcon, index) => {
              const IconComponent = stepIcon.icon;
              const isActive = step === index + 1;
              const isCompleted = step > index + 1;
              
              return (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-white text-blue-600' :
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-white rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus Dados</h2>
                    <p className="text-gray-600">Vamos começar com suas informações básicas</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('nome', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('email', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 mb-2">
                        WhatsApp *
                      </Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.whatsapp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('whatsapp', e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Trip Details */}
            {step === 2 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MapPinIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Destino dos Sonhos</h2>
                    <p className="text-gray-600">Para onde você quer viajar?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="origem" className="text-sm font-medium text-gray-700 mb-2">
                          Origem *
                        </Label>
                        <Input
                          id="origem"
                          placeholder="São Paulo"
                          value={formData.origem}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('origem', e.target.value)}
                          className="h-12 text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="destino" className="text-sm font-medium text-gray-700 mb-2">
                          Destino *
                        </Label>
                        <Input
                          id="destino"
                          placeholder="Paris"
                          value={formData.destino}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('destino', e.target.value)}
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3">
                        Tipo de Viagem
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'ida', label: 'Só Ida' },
                          { value: 'ida-volta', label: 'Ida e Volta' }
                        ].map((tipo) => (
                          <Button
                            key={tipo.value}
                            variant={formData.tipoViagem === tipo.value ? 'default' : 'outline'}
                            onClick={() => updateFormData('tipoViagem', tipo.value)}
                            className="h-12"
                          >
                            {tipo.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="dataPartida" className="text-sm font-medium text-gray-700 mb-2">
                          Data de Partida *
                        </Label>
                        <Input
                          id="dataPartida"
                          type="date"
                          value={formData.dataPartida}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('dataPartida', e.target.value)}
                          className="h-12 text-base"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      {formData.tipoViagem === 'ida-volta' && (
                        <div>
                          <Label htmlFor="dataRetorno" className="text-sm font-medium text-gray-700 mb-2">
                            Data de Retorno
                          </Label>
                          <Input
                            id="dataRetorno"
                            type="date"
                            value={formData.dataRetorno || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('dataRetorno', e.target.value)}
                            className="h-12 text-base"
                            min={formData.dataPartida}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Services */}
            {step === 3 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Serviços Desejados</h2>
                    <p className="text-gray-600">O que você precisa para sua viagem?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => {
                      const isSelected = formData.selectedServices.includes(service.id);
                      return (
                        <Button
                          key={service.id}
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => {
                            const newServices = isSelected
                              ? formData.selectedServices.filter(s => s !== service.id)
                              : [...formData.selectedServices, service.id];
                            updateFormData('selectedServices', newServices);
                          }}
                          className={`h-20 flex-col space-y-2 ${isSelected ? `${service.color} text-white` : ''}`}
                        >
                          <span className="text-2xl">{service.icon}</span>
                          <span className="text-sm font-medium">{service.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Budget & Final Details */}
            {step === 4 && (
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CurrencyDollarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Orçamento & Preferências</h2>
                    <p className="text-gray-600">Finalize sua solicitação</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3">
                        Orçamento Aproximado
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {budgetRanges.map((budget) => (
                          <Button
                            key={budget.id}
                            variant={formData.orcamento === budget.value ? 'default' : 'outline'}
                            onClick={() => updateFormData('orcamento', budget.value)}
                            className="h-12"
                          >
                            {budget.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3">
                        Prioridade
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'economia', label: 'Economia', icon: '💰' },
                          { value: 'conforto', label: 'Conforto', icon: '⭐' },
                          { value: 'luxo', label: 'Luxo', icon: '💎' }
                        ].map((prio) => (
                          <Button
                            key={prio.value}
                            variant={formData.prioridade === prio.value ? 'default' : 'outline'}
                            onClick={() => updateFormData('prioridade', prio.value)}
                            className="h-16 flex-col space-y-1"
                          >
                            <span className="text-xl">{prio.icon}</span>
                            <span className="text-sm">{prio.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700 mb-2">
                        Observações (opcional)
                      </Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Conte-nos mais sobre sua viagem ideal..."
                        value={formData.observacoes || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('observacoes', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {step < totalSteps ? (
            <Button onClick={nextStep} className="flex items-center space-x-2">
              <span>Próximo</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Enviando...' : 'Finalizar'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}