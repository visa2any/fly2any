'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CotacaoCarros() {
  const [formData, setFormData] = useState({
    local: '',
    dataRetirada: '',
    dataEntrega: '',
    categoria: '',
    nome: '',
    email: '',
    telefone: '',
    whatsapp: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cotação de Carro Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Receberá as melhores ofertas de aluguel de carros em até 2 horas.
            </p>
            <Link 
              href="/cotacao/passeios" 
              className="block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors mb-4"
            >
              Cotar Passeios
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
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-700">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Flyy2Any</h1>
            </Link>
            <div className="text-sm text-gray-600">
              Cotação de Aluguel de Carros
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Aluguel de Carros no Brasil
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local de Retirada
                </label>
                <select
                  name="local"
                  value={formData.local}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Selecione o local</option>
                  <option value="aeroporto-gru">Aeroporto Guarulhos (GRU)</option>
                  <option value="aeroporto-gig">Aeroporto Galeão (GIG)</option>
                  <option value="aeroporto-cnf">Aeroporto Confins (CNF)</option>
                  <option value="aeroporto-ssa">Aeroporto Salvador (SSA)</option>
                  <option value="centro-sp">Centro de São Paulo</option>
                  <option value="centro-rj">Centro do Rio de Janeiro</option>
                  <option value="copacabana">Copacabana</option>
                  <option value="ipanema">Ipanema</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Retirada
                  </label>
                  <input
                    type="date"
                    name="dataRetirada"
                    value={formData.dataRetirada}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    name="dataEntrega"
                    value={formData.dataEntrega}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria do Veículo
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Indiferente</option>
                  <option value="economico">Econômico</option>
                  <option value="compacto">Compacto</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="executivo">Executivo</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van/Minivan</option>
                </select>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (EUA) *
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
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