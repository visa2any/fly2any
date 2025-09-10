import React from 'react';
import { Metadata } from 'next';
import { Plane, Heart, Shield, Clock, Users, Star, Phone, CheckCircle2, ArrowRight, Zap, TrendingDown } from 'lucide-react';
import { CountdownTimer } from '@/components/conversion/CountdownTimer';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';

export const metadata: Metadata = {
  title: 'Voos para Brasileiros nos EUA - Economize até R$ 3.500 | Fly2Any',
  description: 'Voos especiais para brasileiros que vivem nos EUA. Economize até R$ 3.500 em passagens para o Brasil. 21 anos ajudando brasileiros a viajar mais barato.',
  keywords: 'voos para brasileiros, passagens baratas brasil eua, voos miami sao paulo, voos new york rio janeiro, brasileiros nos eua',
  openGraph: {
    title: 'Voos Exclusivos para Brasileiros - Economize até R$ 3.500',
    description: 'Especialistas em voos para brasileiros nos EUA há 21 anos. Suporte em português, parcelamento e as melhores rotas.',
    images: ['/images/brasileiros-eua-voos.jpg']
  }
};

export default function VoosParaBrasileiros() {
  const currentTime = new Date();
  const offerEndTime = new Date(currentTime.getTime() + 47 * 60 * 60 * 1000); // 47 hours from now

  const testimonials = [
    {
      name: "Maria Santos",
      location: "Miami, FL",
      savings: "R$ 2.890",
      text: "Economizei quase R$ 3 mil na viagem para ver minha família em São Paulo! Atendimento incrível em português.",
      rating: 5,
      route: "Miami → São Paulo"
    },
    {
      name: "João Silva",
      location: "New York, NY", 
      savings: "R$ 2.150",
      text: "21 anos morando aqui e nunca encontrei preços tão bons. Agora só vou com a Fly2Any!",
      rating: 5,
      route: "JFK → Rio de Janeiro"
    },
    {
      name: "Ana Rodrigues",
      location: "Boston, MA",
      savings: "R$ 1.750",
      text: "Parcelei em 12x sem juros e ainda ganhei upgrade. Meus filhos conheceram a vovó pela primeira vez!",
      rating: 5,
      route: "Boston → Salvador"
    }
  ];

  const routes = [
    { from: "Miami", to: "São Paulo", price: "R$ 1.650", original: "R$ 2.890", savings: "43%" },
    { from: "New York", to: "Rio de Janeiro", price: "R$ 1.890", original: "R$ 3.450", savings: "45%" },
    { from: "Orlando", to: "Brasília", price: "R$ 1.750", original: "R$ 2.950", savings: "41%" },
    { from: "Boston", to: "Salvador", price: "R$ 1.980", original: "R$ 3.200", savings: "38%" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Social Proof Notifications */}
      <SocialProofNotification 
        position="bottom-left" 
        showVisitorCount={true}
        autoRotate={true}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Urgency Banner */}
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
              <Zap className="w-4 h-4" />
              OFERTA EXCLUSIVA PARA BRASILEIROS - TERMINA EM BREVE!
              <Zap className="w-4 h-4" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              🇧🇷 VOOS ESPECIAIS PARA
              <span className="block text-yellow-400">BRASILEIROS NOS EUA</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 font-semibold">
              ⚡ <span className="text-yellow-400 font-black">Economize até R$ 3.500</span> em passagens para o Brasil
              <br />
              <span className="text-lg">21 anos ajudando brasileiros a matar a saudade de casa</span>
            </p>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="font-bold">Suporte 24/7</div>
                <div className="text-sm">Em Português</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="font-bold">Parcelamento</div>
                <div className="text-sm">Até 12x sem juros</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="font-bold">Garantia</div>
                <div className="text-sm">Melhor preço</div>
              </div>
            </div>

            {/* Main CTA */}
            <div className="space-y-4">
              <a 
                href="https://wa.me/1234567890?text=Quero%20economizar%20nas%20minhas%20passagens%20para%20o%20Brasil!"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-6 h-6" />
                QUERO ECONOMIZAR AGORA!
                <ArrowRight className="w-6 h-6" />
              </a>
              <div className="text-sm opacity-90">
                📱 WhatsApp • ⏰ Resposta em até 2 minutos • 🇧🇷 Atendimento em português
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <CountdownTimer 
              endTime={offerEndTime}
              theme="urgent"
              size="lg"
              showProgressBar={true}
              className="mx-auto"
            />
            <div className="text-center mt-6">
              <p className="text-xl font-bold">
                🔥 ÚLTIMAS HORAS DA PROMOÇÃO! 🔥
              </p>
              <p className="text-lg">
                Apenas <span className="font-black text-yellow-400">12 vagas</span> restantes hoje
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-8">
              😤 CANSADO DE PAGAR CARO PARA VER A FAMÍLIA?
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-700 mb-4">❌ COM OUTRAS AGÊNCIAS:</h3>
                <ul className="space-y-2 text-red-600">
                  <li>• Preços abusivos (até R$ 4.500)</li>
                  <li>• Atendimento só em inglês</li>
                  <li>• Sem parcelamento</li>
                  <li>• Taxas escondidas</li>
                  <li>• Zero flexibilidade</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-700 mb-4">✅ COM A FLY2ANY:</h3>
                <ul className="space-y-2 text-green-600">
                  <li>• Preços partir de R$ 1.650</li>
                  <li>• Suporte 24/7 em português</li>
                  <li>• Parcelamento até 12x</li>
                  <li>• Sem taxas extras</li>
                  <li>• Total flexibilidade</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-800 mb-4">
                💰 VEJA QUANTO VOCÊ ESTÁ PERDENDO!
              </h3>
              <div className="text-lg text-yellow-700">
                Família de 4 pessoas pagando R$ 3.200 por passagem = <span className="font-black">R$ 12.800</span>
                <br />
                Com a Fly2Any pagaria apenas = <span className="font-black text-green-600">R$ 6.600</span>
                <br />
                <span className="text-2xl font-black text-red-600">ECONOMIA DE R$ 6.200!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              ✈️ ROTAS MAIS PROCURADAS PELOS BRASILEIROS
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {routes.map((route, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="font-bold text-blue-600">{route.from}</span>
                      <Plane className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-green-600">{route.to}</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 line-through">{route.original}</div>
                      <div className="text-2xl font-black text-green-600">{route.price}</div>
                      <div className="text-sm font-bold text-red-600">
                        <TrendingDown className="w-4 h-4 inline" />
                        Economize {route.savings}
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/1234567890?text=Quero%20voo%20${route.from}%20para%20${route.to}%20por%20${route.price}`}
                      className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg"
                    >
                      RESERVAR AGORA
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-gray-600 mb-4">
                🎯 Não encontrou sua rota? Temos <span className="font-bold">ofertas especiais</span> para todas as cidades!
              </p>
              <a
                href="https://wa.me/1234567890?text=Preciso%20de%20uma%20cotação%20personalizada"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300"
              >
                COTAÇÃO PERSONALIZADA
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                🗣️ O QUE FALAM OS BRASILEIROS
              </h2>
              <p className="text-xl text-gray-600">
                Mais de <span className="font-bold text-green-600">5.000+ brasileiros</span> já economizaram conosco
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-800">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.location}</div>
                        <div className="text-sm text-blue-600">{testimonial.route}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Economizou:</div>
                        <div className="text-lg font-bold text-green-600">{testimonial.savings}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="bg-green-100 rounded-lg p-6 inline-block">
                <div className="flex items-center justify-center gap-4 text-green-800">
                  <Users className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-black">98%</div>
                    <div className="text-sm">Taxa de Satisfação</div>
                  </div>
                  <Clock className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-black">21</div>
                    <div className="text-sm">Anos de Experiência</div>
                  </div>
                  <Star className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-black">4.9</div>
                    <div className="text-sm">Avaliação Média</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              🚀 PRONTO PARA ECONOMIZAR?
            </h2>
            
            <p className="text-xl mb-8">
              Não deixe para depois! Cada dia que passa você perde <span className="font-black text-yellow-400">centenas de reais</span>.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="text-2xl font-bold mb-2">🎁 BÔNUS EXCLUSIVO HOJE:</div>
              <div className="text-lg">
                ✅ Seguro viagem GRÁTIS (valor R$ 450)
                <br />
                ✅ Check-in prioritário
                <br />
                ✅ Suporte 24/7 durante toda a viagem
              </div>
            </div>

            <a
              href="https://wa.me/1234567890?text=Quero%20aproveitar%20a%20oferta%20especial%20para%20brasileiros!"
              className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-full text-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
            >
              <Phone className="w-8 h-8" />
              GARANTIR MINHA ECONOMIA AGORA!
              <ArrowRight className="w-8 h-8" />
            </a>

            <div className="text-lg">
              📱 Clique para falar no WhatsApp • ⚡ Resposta imediata • 🎯 Só hoje
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}