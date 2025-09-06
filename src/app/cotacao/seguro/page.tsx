'use client';
export const dynamic = 'force-dynamic';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PhoneInputSimple from '@/components/PhoneInputSimple';

export default function CotacaoSeguro() {
  const [formData, setFormData] = useState({
    tipoSeguro: '',
    dataInicio: '',
    dataFim: '',
    pessoas: 1,
    idade: '',
    cobertura: '',
    nome: '',
    email: '',
    telefone: '',
    whatsapp: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Preparar dados para envio
      const leadData = {
        selectedServices: [{
          serviceType: 'seguro',
          tipoSeguro: formData.tipoSeguro,
          dataInicio: formData.dataInicio,
          dataFim: formData.dataFim,
          pessoas: formData.pessoas,
          idade: formData.idade,
          cobertura: formData.cobertura
        }],
        currentServiceIndex: 0,
        nome: formData.nome,
        sobrenome: '',
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        tipoSeguro: formData.tipoSeguro,
        dataInicioSeguro: formData.dataInicio,
        dataFimSeguro: formData.dataFim,
        numeroPassageiros: formData.pessoas,
        faixaEtaria: formData.idade,
        coberturaDesejada: formData.cobertura,
        observacoes: ''
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
      
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar cotação:', error);
      alert('Erro ao enviar cotação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cotação de Seguro Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Receberá as melhores opções de seguro viagem em até 2 horas.
            </p>
            <Link 
              href="/cotacao/voos" 
              className="block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full transition-colors mb-4"
            >
              Cotar Mais Serviços
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-700">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Flyy2Any</h1>
            </Link>
            <div className="text-sm text-gray-600">
              Cotação de Seguro Viagem
            </div>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Início', href: '/' },
              { label: 'Cotação', href: '/cotacao' },
              { label: 'Seguro' }
            ]}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Seguro Viagem
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Seguro
                </label>
                <select
                  name="tipoSeguro"
                  value={formData.tipoSeguro}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="nacional">Nacional (dentro do Brasil)</option>
                  <option value="internacional">Internacional (EUA → Brasil)</option>
                  <option value="multiplo">Múltiplas Viagens</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Pessoas
                  </label>
                  <select
                    name="pessoas"
                    value={formData.pessoas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} pessoa{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa Etária
                  </label>
                  <select
                    name="idade"
                    value={formData.idade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione</option>
                    <option value="0-17">0-17 anos</option>
                    <option value="18-39">18-39 anos</option>
                    <option value="40-59">40-59 anos</option>
                    <option value="60-69">60-69 anos</option>
                    <option value="70+">70+ anos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cobertura Desejada
                </label>
                <select
                  name="cobertura"
                  value={formData.cobertura}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecione</option>
                  <option value="basica">Básica (até $30,000)</option>
                  <option value="intermediaria">Intermediária ($30,000 - $60,000)</option>
                  <option value="premium">Premium ($60,000 - $100,000)</option>
                  <option value="completa">Completa ($100,000+)</option>
                </select>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 mb-2">
                  🛡️ Por que contratar um seguro viagem?
                </h3>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Cobertura médica e hospitalar</li>
                  <li>• Cancelamento de viagem</li>
                  <li>• Extravio de bagagem</li>
                  <li>• Assistência 24h em português</li>
                </ul>
              </div>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Solicitar Cotação'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}