'use client';
export const dynamic = 'force-dynamic';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PhoneInputSimple from '@/components/PhoneInputSimple';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { trackFormSubmission } from '@/lib/tracking';

interface FormData {
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida' | 'idaVolta';
  adultos: number;
  criancas: number;
  bebes: number;
  classe: 'economica' | 'executiva' | 'primeira';
  flexivel: boolean;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  observacoes: string;
}

export default function CotacaoVoos() {
  const [formData, setFormData] = useState<FormData>({
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    tipoViagem: 'idaVolta',
    adultos: 1,
    criancas: 0,
    bebes: 0,
    classe: 'economica',
    flexivel: false,
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    observacoes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Preparar dados para envio
      const leadData = {
        selectedServices: [{
          serviceType: 'voos',
          origem: formData.origem,
          destino: formData.destino,
          dataIda: formData.dataIda,
          dataVolta: formData.dataVolta,
          adultos: formData.adultos,
          criancas: formData.criancas,
          classeVoo: formData.classe
        }],
        currentServiceIndex: 0,
        nome: formData.nome,
        sobrenome: '',
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        origem: formData.origem,
        destino: formData.destino,
        dataIda: formData.dataIda,
        dataVolta: formData.dataVolta,
        tipoViagem: formData.tipoViagem,
        classeVoo: formData.classe,
        adultos: formData.adultos,
        criancas: formData.criancas,
        bebes: formData.bebes,
        companhiaPreferida: '',
        horarioPreferido: 'qualquer',
        escalas: 'qualquer',
        flexibilidadeDatas: formData.flexivel,
        observacoes: formData.observacoes || ''
      };

      // Enviar para API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar cotação');
      }

      const result = await response.json();
      console.log('Cotação enviada com sucesso:', result);
      
      // Track conversion for all advertising platforms
      trackFormSubmission({
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        route: `${formData.origem} → ${formData.destino}`,
        message: formData.observacoes
      }, 'flight_quote');
      
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar cotação:', error);
      alert('Erro ao enviar cotação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cotação Enviada com Sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Recebemos sua solicitação de cotação para voos. Nossa equipe entrará em contato em até 2 horas no WhatsApp/telefone informado.
            </p>
            <div className="space-y-4">
              <Link 
                href="/cotacao/hoteis" 
                className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Cotar Hotéis Também
              </Link>
              <Link 
                href="/" 
                className="block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }} className="bg-gradient-hero">
      <ResponsiveHeader />
      
      {/* Progress Indicator - movido para faixa separada */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-mobile" style={{ padding: '12px 16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{ 
              fontSize: '14px',
              color: '#374151',
              fontWeight: '600'
            }}>
              Cotação de Voos - Passo {currentStep} de 3
            </div>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Início', href: '/' },
              { label: 'Cotação', href: '/cotacao' },
              { label: 'Voos' }
            ]} 
          />
        </div>
      </div>

      <div className="container-mobile spacing-mobile">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm">Dados do Voo</span>
              <span className="text-white text-sm">Passageiros</span>
              <span className="text-white text-sm">Contato</span>
            </div>
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  background: 'linear-gradient(90deg, #facc15, #f59e0b)',
                  height: '100%',
                  borderRadius: '10px',
                  transition: 'width 0.3s ease',
                  width: `${(currentStep / 3) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="card-mobile" style={{ 
            background: 'white',
            color: '#1f2937',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="form-mobile">
                  <h2 className="text-mobile-2xl" style={{ 
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}>
                    Dados da Viagem
                  </h2>
                  
                  <div className="grid-mobile" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade de Origem (EUA)
                      </label>
                      <select
                        name="origem"
                        value={formData.origem}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione a cidade</option>
                        <option value="MIA">Miami, FL</option>
                        <option value="MCO">Orlando, FL</option>
                        <option value="JFK">Nova York, NY</option>
                        <option value="LAX">Los Angeles, CA</option>
                        <option value="BOS">Boston, MA</option>
                        <option value="ATL">Atlanta, GA</option>
                        <option value="DFW">Dallas, TX</option>
                        <option value="CHI">Chicago, IL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino (Brasil)
                      </label>
                      <select
                        name="destino"
                        value={formData.destino}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione o destino</option>
                        <option value="GRU">São Paulo, SP</option>
                        <option value="GIG">Rio de Janeiro, RJ</option>
                        <option value="CNF">Belo Horizonte, MG</option>
                        <option value="SSA">Salvador, BA</option>
                        <option value="FOR">Fortaleza, CE</option>
                        <option value="REC">Recife, PE</option>
                        <option value="BSB">Brasília, DF</option>
                        <option value="CWB">Curitiba, PR</option>
                        <option value="POA">Porto Alegre, RS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Viagem
                      </label>
                      <select
                        name="tipoViagem"
                        value={formData.tipoViagem}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="idaVolta">Ida e Volta</option>
                        <option value="ida">Somente Ida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Ida
                      </label>
                      <input
                        type="date"
                        name="dataIda"
                        value={formData.dataIda}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {formData.tipoViagem === 'idaVolta' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Volta
                        </label>
                        <input
                          type="date"
                          name="dataVolta"
                          value={formData.dataVolta}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classe de Viagem
                    </label>
                    <select
                      name="classe"
                      value={formData.classe}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="economica">Econômica</option>
                      <option value="executiva">Executiva</option>
                      <option value="primeira">Primeira Classe</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="flexivel"
                      checked={formData.flexivel}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Tenho flexibilidade de datas (±3 dias)
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Passageiros
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adultos (12+ anos)
                      </label>
                      <select
                        name="adultos"
                        value={formData.adultos}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1,2,3,4,5,6,7,8,9].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crianças (2-11 anos)
                      </label>
                      <select
                        name="criancas"
                        value={formData.criancas}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[0,1,2,3,4,5,6,7,8,9].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bebês (0-23 meses)
                      </label>
                      <select
                        name="bebes"
                        value={formData.bebes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[0,1,2,3,4,5,6,7,8,9].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Resumo da Viagem
                    </h3>
                    <div className="text-sm text-blue-700">
                      <p><strong>Rota:</strong> {formData.origem} → {formData.destino}</p>
                      <p><strong>Data:</strong> {formData.dataIda} {formData.tipoViagem === 'idaVolta' && formData.dataVolta ? `→ ${formData.dataVolta}` : ''}</p>
                      <p><strong>Passageiros:</strong> {formData.adultos} adulto(s), {formData.criancas} criança(s), {formData.bebes} bebê(s)</p>
                      <p><strong>Classe:</strong> {formData.classe.charAt(0).toUpperCase() + formData.classe.slice(1)}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Seus Dados de Contato
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <PhoneInputSimple
                        value={formData.telefone}
                        onChange={(value: string) => setFormData((prev: any) => ({ ...prev, telefone: value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações (Opcional)
                    </label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alguma preferência especial, companhia aérea, horário, etc."
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      🎉 Você está quase lá!
                    </h3>
                    <p className="text-sm text-green-700">
                      Nossa equipe especializada entrará em contato em até 2 horas com as melhores opções 
                      de voos e preços exclusivos para brasileiros.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors"
                  >
                    Voltar
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors ml-auto"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition-colors ml-auto disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Solicitar Cotação'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}