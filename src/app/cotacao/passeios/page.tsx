'use client';
export const dynamic = 'force-dynamic';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import PhoneInputSimple from '@/components/PhoneInputSimple';

export default function CotacaoPasseios() {
  const [formData, setFormData] = useState({
    destino: '',
    dataViagem: '',
    tipoPasseio: '',
    pessoas: 1,
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    observacoes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          serviceType: 'passeios',
          destino: formData.destino,
          dataViagem: formData.dataViagem,
          tipoPasseio: formData.tipoPasseio,
          pessoas: formData.pessoas,
          observacoes: formData.observacoes
        }],
        currentServiceIndex: 0,
        nome: formData.nome,
        sobrenome: '',
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        destinoPasseio: formData.destino,
        dataPasseio: formData.dataViagem,
        tipoPasseio: formData.tipoPasseio,
        numeroPassageiros: formData.pessoas,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cotação de Passeio Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Receberá as melhores opções de passeios em até 2 horas.
            </p>
            <Link 
              href="/cotacao/seguro" 
              className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors mb-4"
            >
              Cotar Seguro Viagem
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-700">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Flyy2Any</h1>
            </Link>
            <div className="text-sm text-gray-600">
              Cotação de Passeios
            </div>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Início', href: '/' },
              { label: 'Cotação', href: '/cotacao' },
              { label: 'Passeios' }
            ]}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Passeios e Experirências no Brasil
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade de Destino
                </label>
                <select
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione a cidade</option>
                  <option value="rio-janeiro">Rio de Janeiro</option>
                  <option value="sao-paulo">São Paulo</option>
                  <option value="salvador">Salvador</option>
                  <option value="fortaleza">Fortaleza</option>
                  <option value="recife">Recife</option>
                  <option value="florianopolis">Florianópolis</option>
                  <option value="foz-iguacu">Foz do Iguaçu</option>
                  <option value="manaus">Manaus</option>
                  <option value="brasilia">Brasília</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Passeio
                </label>
                <select
                  name="tipoPasseio"
                  value={formData.tipoPasseio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="city-tour">City Tour</option>
                  <option value="praias">Passeios de Praia</option>
                  <option value="aventura">Aventura/Ecoturismo</option>
                  <option value="cultural">Cultural/Histórico</option>
                  <option value="gastronomico">Gastronômico</option>
                  <option value="noturno">Vida Noturna</option>
                  <option value="religioso">Turismo Religioso</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Passeio
                  </label>
                  <input
                    type="date"
                    name="dataViagem"
                    value={formData.dataViagem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Pessoas
                  </label>
                  <select
                    name="pessoas"
                    value={formData.pessoas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} pessoa{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Especiais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Conte-nos sobre seus interesses, preferências ou necessidades especiais..."
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
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