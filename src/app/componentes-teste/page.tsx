'use client'

import SocialProof from '@/components/ui/social-proof'
import TrustBadges from '@/components/ui/trust-badges'
import { UrgencyBanner, MultiUrgencyStack } from '@/components/ui/urgency-banners'
import BrazilianForm from '@/components/ui/brazilian-form'
import { WhatsAppChat } from '@/components/ui/whatsapp-chat'
import PriceCalculator from '@/components/ui/price-calculator'
import { ReviewsIntegration } from '@/components/ui/reviews-integration'

export default function ComponentesTestePage() {
  const handleFormSubmit = (data: any) => {
    console.log('Form data:', data)
    alert('Formulário enviado! Dados no console.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🇧🇷 Componentes UX Brasileiros - Fly2Any
          </h1>
          <p className="text-gray-600">
            Demonstração dos componentes otimizados para conversão
          </p>
        </div>
      </div>

      {/* Urgency Banner */}
      <MultiUrgencyStack hotelId="test-hotel" />

      {/* Price Calculator Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              💰 Calculadora de Preços
            </h2>
            <p className="text-gray-600">
              Estime o valor da sua passagem instantaneamente
            </p>
          </div>
          <PriceCalculator />
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* Trust Badges Section */}
      <TrustBadges />

      {/* Brazilian Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📝 Formulário Brasileiro Otimizado
            </h2>
            <p className="text-gray-600">
              Experiência de preenchimento otimizada para brasileiros
            </p>
          </div>
          <BrazilianForm 
            onSubmit={handleFormSubmit}
            showProgress={true}
            initialStep={1}
          />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <ReviewsIntegration hotelId="test-hotel-123" />
        </div>
      </section>

      {/* Component List */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              🚀 Componentes Implementados
            </h2>
            <p className="text-gray-300">
              Cada componente foi desenvolvido com foco na conversão de brasileiros nos EUA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="font-semibold mb-2">Social Proof</h3>
              <p className="text-sm text-gray-300">
                Testemunhos reais de brasileiros com contadores dinâmicos
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">Trust Badges</h3>
              <p className="text-sm text-gray-300">
                Certificações, parcerias e garantias de confiança
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Urgency Banners</h3>
              <p className="text-sm text-gray-300">
                Elementos de urgência baseados em sazonalidade brasileira
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">📝</div>
              <h3 className="font-semibold mb-2">Brazilian Form</h3>
              <p className="text-sm text-gray-300">
                Formulário otimizado com CPF, cidades e UX brasileiro
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">WhatsApp Chat</h3>
              <p className="text-sm text-gray-300">
                Widget de suporte com horário brasileiro e mensagens pré-definidas
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Price Calculator</h3>
              <p className="text-sm text-gray-300">
                Estimativas instantâneas com comparação de economia
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-2xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2">Reviews Integration</h3>
              <p className="text-sm text-gray-300">
                Sistema agregado de reviews de múltiplas plataformas
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg">
              <span>✅</span>
              <span className="font-semibold">
                Todos os componentes estão funcionais e prontos para integração
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Widget */}
      <WhatsAppChat hotelId="demo-hotel" />

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            🤖 Componentes desenvolvidos com análise de especialista sênior em UX/UI
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Maximizando conversão para o nicho de brasileiros nos EUA
          </p>
        </div>
      </footer>
    </div>
  )
}