'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';
import AirportAutocomplete from './flights/AirportAutocomplete';
import { AirportSelection } from '@/types/flights';

interface LeadCaptureSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}

export default function LeadCaptureSimple({ isOpen, onClose, context = 'popup' }: LeadCaptureSimpleProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    origem: null as AirportSelection | null,
    destino: null as AirportSelection | null,
    dataPartida: '',
    selectedServices: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
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
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setStep(1);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
            <p className="text-gray-600">
              Recebemos seus dados e entraremos em contato em breve!
            </p>
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
              <h2 className="text-2xl font-bold">Cotação Premium</h2>
              <p className="text-blue-200 text-sm mt-1">
                Passo {step} de 3 • Cotação 100% gratuita
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
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: Dados Pessoais */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-xl font-semibold text-gray-800">Seus Dados</h3>
                <p className="text-gray-600">Vamos começar com suas informações básicas</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Viagem */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">✈️</div>
                <h3 className="text-xl font-semibold text-gray-800">Destino dos Sonhos</h3>
                <p className="text-gray-600">Para onde você quer viajar?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origem *
                  </label>
                  <AirportAutocomplete
                    value={formData.origem || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => setFormData({...formData, origem: airport})}
                    placeholder="De onde você vai partir?"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino *
                  </label>
                  <AirportAutocomplete
                    value={formData.destino || { iataCode: '', name: '', city: '', country: '' }}
                    onChange={(airport) => setFormData({...formData, destino: airport})}
                    placeholder="Para onde você quer ir?"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Partida *
                  </label>
                  <DatePicker
                    value={formData.dataPartida}
                    onChange={(value) => setFormData({...formData, dataPartida: value})}
                    placeholder="Selecione a data de partida"
                    label="Data de Partida *"
                    minDate={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Serviços */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800">Serviços Desejados</h3>
                <p className="text-gray-600">Quais serviços você precisa?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'voos', nome: 'Passagens Aéreas', icon: '✈️' },
                  { id: 'hospedagem', nome: 'Hospedagem', icon: '🏨' },
                  { id: 'aluguel_carro', nome: 'Aluguel de Carro', icon: '🚗' },
                  { id: 'seguro_viagem', nome: 'Seguro Viagem', icon: '🛡️' },
                  { id: 'passeios', nome: 'Passeios', icon: '🎯' },
                  { id: 'outros', nome: 'Outros', icon: '📋' }
                ].map((servico) => (
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
                          setFormData({
                            ...formData,
                            selectedServices: [...formData.selectedServices, servico.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedServices: formData.selectedServices.filter(s => s !== servico.id)
                          });
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-2xl">{servico.icon}</span>
                    <span className="font-medium text-gray-700">{servico.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={() => setStep(Math.max(step - 1, 1))}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.nome || !formData.email || !formData.whatsapp)) ||
                  (step === 2 && (!formData.origem || !formData.destino || !formData.dataPartida))
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || formData.selectedServices.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>✅</span>
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