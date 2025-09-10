import React from 'react';
import { Metadata } from 'next';
import { Plane, MapPin, DollarSign, Clock, Users, Star, Phone, CheckCircle2, ArrowRight, Zap, TrendingDown, Shield, Heart, CalendarDays } from 'lucide-react';
import { CountdownTimer } from '@/components/conversion/CountdownTimer';
import { SocialProofNotification } from '@/components/conversion/SocialProofNotification';
import ExitIntentPopup from '@/components/conversion/ExitIntentPopup';

export const metadata: Metadata = {
  title: 'Voos Miami → São Paulo - Promoção R$ 1.650 | Só Hoje | Fly2Any',
  description: 'OFERTA RELÂMPAGO! Voos Miami para São Paulo a partir de R$ 1.650. Economize R$ 1.240 vs concorrência. Apenas 12 vagas hoje. Reserve agora!',
  keywords: 'voos miami sao paulo, passagem miami sao paulo barata, promocao voo miami sao paulo, fly2any miami sao paulo',
  openGraph: {
    title: 'FLASH SALE: Miami → São Paulo por R$ 1.650 - Só Hoje!',
    description: 'Promoção relâmpago! Economize R$ 1.240 em voos Miami-São Paulo. Apenas 12 vagas restantes hoje.',
    images: ['/images/miami-sao-paulo-promo.jpg']
  }
};

export default function VoosMiamiSaoPaulo() {
  const currentTime = new Date();
  const offerEndTime = new Date(currentTime.getTime() + 8 * 60 * 60 * 1000); // 8 hours from now
  
  const benefits = [
    { icon: DollarSign, title: "Menor Preço", subtitle: "Garantido ou devolvemos a diferença" },
    { icon: Shield, title: "Sem Taxas", subtitle: "Preço final transparente" },
    { icon: Heart, title: "Parcelamento", subtitle: "Até 12x sem juros no cartão" },
    { icon: Phone, title: "Suporte 24/7", subtitle: "Em português durante toda viagem" }
  ];

  const flightDetails = [
    { label: "Saída", value: "Miami (MIA)", time: "Vários horários" },
    { label: "Chegada", value: "São Paulo (GRU)", time: "Voo direto disponível" },
    { label: "Duração", value: "8h 45min", time: "Voo direto" },
    { label: "Bagagem", value: "23kg", time: "Incluída no preço" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Social Proof Notifications */}
      <SocialProofNotification 
        position="bottom-right" 
        showVisitorCount={true}
        autoRotate={true}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup enabled={true} />

      {/* Urgent Flash Sale Banner */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-bold animate-pulse">
              <Zap className="w-4 h-4" />
              🔥 FLASH SALE MIAMI → SÃO PAULO - TERMINA HOJE ÀS 23:59! 
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                {/* Route Display */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-black">MIA</div>
                    <div className="text-sm opacity-90">Miami</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Plane className="w-8 h-8 mb-1" />
                    <div className="text-xs">8h 45min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black">GRU</div>
                    <div className="text-sm opacity-90">São Paulo</div>
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black mb-4 text-center lg:text-left leading-tight">
                  <span className="text-red-400">PROMOÇÃO RELÂMPAGO!</span>
                  <br />
                  MIAMI → SÃO PAULO
                </h1>

                {/* Price Display */}
                <div className="text-center lg:text-left mb-6">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                    <div className="text-2xl line-through text-red-300 opacity-75">R$ 2.890</div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -43% OFF
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-black text-yellow-400 mb-2">
                    R$ 1.650
                  </div>
                  <div className="text-lg text-green-300">
                    💸 Você economiza <span className="font-black">R$ 1.240</span>
                  </div>
                </div>

                {/* Scarcity Indicators */}
                <div className="bg-red-600/20 backdrop-blur-sm rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-bold">⚠️ VAGAS LIMITADAS</span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">ÚLTIMAS 12</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                  <div className="text-sm text-red-200">
                    347 pessoas já garantiram esta oferta hoje!
                  </div>
                </div>
              </div>

              <div>
                {/* Countdown Timer */}
                <CountdownTimer 
                  endTime={offerEndTime}
                  theme="urgent"
                  size="lg"
                  showProgressBar={true}
                  className="mb-6"
                />

                {/* Main CTA */}
                <div className="space-y-4">
                  <a 
                    href="https://wa.me/1234567890?text=QUERO%20O%20VOO%20MIAMI%20SÃO%20PAULO%20POR%20R$1650!"
                    className="block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl text-xl font-black text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Phone className="w-6 h-6" />
                      GARANTIR POR R$ 1.650 AGORA!
                    </div>
                    <div className="text-sm font-normal">
                      📱 Resposta imediata no WhatsApp
                    </div>
                  </a>
                  
                  <div className="text-center text-sm opacity-90">
                    ✅ Confirmação imediata • 💳 Parcele em até 12x • 🇧🇷 Atendimento em português
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300">
                  <benefit.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="font-bold text-gray-800 mb-2">{benefit.title}</div>
                  <div className="text-sm text-gray-600">{benefit.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flight Details */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-8">✈️ DETALHES DO VOO</h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid md:grid-cols-4 gap-6">
                {flightDetails.map((detail, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-500 mb-1">{detail.label}</div>
                    <div className="text-lg font-bold text-gray-800 mb-1">{detail.value}</div>
                    <div className="text-xs text-blue-600">{detail.time}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Bagagem 23kg incluída</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Refeição a bordo</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Entretenimento de bordo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-8">🗣️ O QUE DIZEM NOSSOS CLIENTES</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Incrível! Paguei R$ 1.650 enquanto meus amigos pagaram R$ 2.800 na mesma data. Vou sempre com a Fly2Any!"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold">Ricardo M.</div>
                  <div className="text-sm text-gray-500">Miami, FL</div>
                  <div className="text-green-600 font-bold">Economizou R$ 1.150</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Atendimento em português, parcelamento sem juros e preço justo. Recomendo para todos os brasileiros!"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold">Fernanda L.</div>
                  <div className="text-sm text-gray-500">Boca Raton, FL</div>
                  <div className="text-green-600 font-bold">Economizou R$ 980</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Rapidez no atendimento e transparência total. Consegui viajar no Natal pagando muito menos!"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold">Carlos R.</div>
                  <div className="text-sm text-gray-500">Fort Lauderdale, FL</div>
                  <div className="text-green-600 font-bold">Economizou R$ 1.200</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-6 text-blue-800">
                <div className="text-center">
                  <div className="text-3xl font-black">12.534</div>
                  <div className="text-sm">Brasileiros atendidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black">98.7%</div>
                  <div className="text-sm">Satisfação dos clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black">21</div>
                  <div className="text-sm">Anos de experiência</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              🚨 ÚLTIMA CHAMADA!
            </h2>
            
            <p className="text-xl mb-8">
              Restam apenas <span className="font-black text-yellow-400">8 vagas</span> desta promoção hoje.
              <br />
              Não perca a chance de economizar <span className="font-black">R$ 1.240</span>!
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="text-2xl font-bold mb-4">🎁 BÔNUS SE RESERVAR AGORA:</div>
              <div className="grid md:grid-cols-3 gap-4 text-lg">
                <div>✅ Seguro viagem GRÁTIS</div>
                <div>✅ Check-in prioritário</div>
                <div>✅ Suporte durante toda viagem</div>
              </div>
            </div>

            <a
              href="https://wa.me/1234567890?text=URGENTE!%20Quero%20garantir%20minha%20vaga%20Miami%20→%20São%20Paulo%20por%20R$1650!"
              className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-full text-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
            >
              <Phone className="w-8 h-8" />
              GARANTIR MINHA VAGA AGORA!
              <ArrowRight className="w-8 h-8" />
            </a>

            <div className="text-lg">
              📱 WhatsApp • ⚡ Confirmação imediata • 💳 Parcele em até 12x
            </div>

            <div className="mt-6 text-sm opacity-90">
              ⏰ Oferta válida apenas hoje • 🔐 100% seguro • 🇧🇷 Suporte em português
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}