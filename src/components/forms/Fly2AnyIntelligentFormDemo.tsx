'use client';

import { useState, useEffect } from 'react';
import { IntegratedIntelligentForm } from './index';
import { FormOptimizationPresets } from './index';

/**
 * Demonstration component showing how to integrate the intelligent form system
 * with Fly2Any's existing homepage and booking flow.
 * 
 * This component can replace or enhance the existing form in /src/app/page.tsx
 */

interface Fly2AnyFormData {
  // Travel data
  origem: { iataCode: string; name: string; city?: string } | null;
  destino: { iataCode: string; name: string; city?: string } | null;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  
  // Personal data
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  
  // Preferences
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  orcamentoAproximado: string;
  flexibilidadeDatas: boolean;
  observacoes: string;
}

export default function Fly2AnyIntelligentFormDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submissionData, setSubmissionData] = useState<Fly2AnyFormData | null>(null);

  // Handle form submission - integrate with existing Fly2Any API
  const handleFormSubmission = async (formData: Fly2AnyFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Submitting intelligent form data:', formData);
      
      // Format data for existing Fly2Any API structure
      const fly2anyData = {
        // Map intelligent form data to existing structure
        selectedServices: [{
          serviceType: 'voos',
          completed: true,
          origem: formData.origem,
          destino: formData.destino,
          dataIda: formData.dataIda,
          dataVolta: formData.dataVolta,
          tipoViagem: formData.tipoViagem,
          classeVoo: formData.classeVoo,
          adultos: formData.adultos,
          criancas: formData.criancas,
          bebes: formData.bebes,
          companhiaPreferida: formData.companhiaPreferida,
          horarioPreferido: formData.horarioPreferido,
          escalas: formData.escalas,
          orcamentoAproximado: formData.orcamentoAproximado,
          flexibilidadeDatas: formData.flexibilidadeDatas,
          observacoes: formData.observacoes
        }],
        currentServiceIndex: 0,
        
        // Copy all travel data to main level (existing structure)
        origem: formData.origem,
        destino: formData.destino,
        dataIda: formData.dataIda,
        dataVolta: formData.dataVolta,
        tipoViagem: formData.tipoViagem,
        classeVoo: formData.classeVoo,
        adultos: formData.adultos,
        criancas: formData.criancas,
        bebes: formData.bebes,
        companhiaPreferida: formData.companhiaPreferida,
        horarioPreferido: formData.horarioPreferido,
        escalas: formData.escalas,
        
        // Personal data
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        
        // Additional data
        orcamentoAproximado: formData.orcamentoAproximado,
        flexibilidadeDatas: formData.flexibilidadeDatas,
        observacoes: formData.observacoes,
        
        // Add intelligent form metadata
        formType: 'intelligent_form',
        submissionTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };

      // Send to existing Fly2Any lead capture endpoint
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fly2anyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Form submitted successfully:', result);
      
      // Store submission data for success display
      setSubmissionData(formData);
      setShowSuccessMessage(true);
      
      // Track successful conversion
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit_intelligent', {
          event_category: 'conversion',
          event_label: 'intelligent_form_success',
          value: 1
        });
      }
      
    } catch (error) {
      console.error('❌ Form submission error:', error);
      
      // Show error message to user
      alert('Erro ao enviar formulário. Tente novamente em alguns instantes.');
      
      // Track error
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit_error', {
          event_category: 'error',
          event_label: 'intelligent_form_error',
          value: 0
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide success message after 10 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  if (showSuccessMessage && submissionData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-800 mb-4">
            Parabéns! Sua solicitação foi enviada com sucesso!
          </h2>
          <p className="text-lg text-green-700 mb-6">
            Recebemos sua solicitação para viajar de{' '}
            <strong>{submissionData.origem?.name || submissionData.origem?.iataCode}</strong> para{' '}
            <strong>{submissionData.destino?.name || submissionData.destino?.iataCode}</strong>
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Próximos Passos:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">📧</span>
                <span>Email de confirmação enviado</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 text-xl">💬</span>
                <span>WhatsApp será contactado em breve</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-500 text-xl">✈️</span>
                <span>Ofertas personalizadas em 24h</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mr-4"
            >
              Fazer Nova Busca
            </button>
            <button
              onClick={() => window.open(`https://wa.me/5511999999999?text=Olá! Acabei de enviar uma solicitação de viagem pelo site da Fly2Any`, '_blank')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              💬 Falar no WhatsApp
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-6">
            Dúvidas? Entre em contato: (11) 99999-9999 | contato@fly2any.com.br
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Voos para os EUA
              </span>
              <br />
              <span className="text-gray-700">com Inteligência Artificial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Nossa tecnologia inteligente encontra os melhores preços e ofertas personalizadas 
              para sua viagem dos sonhos do Brasil para os Estados Unidos.
            </p>
            
            {/* Trust indicators */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">+ de 50.000 clientes</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">4.9/5 estrelas</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Certificado ANAC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent Form Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Form header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                🤖 Formulário Inteligente
              </h2>
              <p className="text-blue-100 text-lg">
                IA + UX Premium + Conversão Otimizada
              </p>
              <div className="flex justify-center space-x-4 mt-4 text-sm text-blue-100">
                <span>✨ Autocomplete inteligente</span>
                <span>🎤 Comando de voz</span>
                <span>📱 Otimizado para mobile</span>
              </div>
            </div>
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-lg font-semibold text-gray-700">
                  Processando sua solicitação...
                </p>
                <p className="text-sm text-gray-500">
                  Nossa IA está encontrando as melhores ofertas para você
                </p>
              </div>
            </div>
          )}

          {/* Intelligent Form */}
          <div className="p-6 md:p-8">
            <IntegratedIntelligentForm
              onSubmit={handleFormSubmission}
              className="intelligent-form-container"
            />
          </div>
        </div>

        {/* Features showcase */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-3">IA Integrada</h3>
            <p className="text-gray-600">
              Autocomplete inteligente, sugestões contextuais e preenchimento preditivo
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-3">UX Mobile Premium</h3>
            <p className="text-gray-600">
              Otimizado para uma mão, gestos touch e feedback háptico
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-3">Conversão Otimizada</h3>
            <p className="text-gray-600">
              Gatilhos psicológicos, testes A/B e analytics em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export for easy integration
export { Fly2AnyIntelligentFormDemo };