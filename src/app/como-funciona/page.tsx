import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, PhoneIcon } from '@/components/Icons';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Como Funciona | Processo Simples em 4 Passos | Fly2Any",
  description: "Descubra como é fácil viajar com a Fly2Any. Processo simples: 1) Solicite cotação 2) Receba proposta 3) Aprove e pague 4) Viaje tranquilo. Suporte 24h!",
  keywords: "como funciona fly2any, processo cotação, como comprar passagem, passo a passo viagem",
  openGraph: {
    title: "Como Funciona | Processo Simples em 4 Passos | Fly2Any",
    description: "Descubra como é fácil viajar com a Fly2Any. Processo simples em 4 passos.",
    url: "https://fly2any.com/como-funciona",
  },
};

const steps = [
  {
    number: "01",
    title: "Solicite sua Cotação",
    description: "Preencha nosso formulário rápido com seus dados de viagem. Leva apenas 2 minutos!",
    details: [
      "Escolha o tipo de serviço (voos, hotéis, carros, etc.)",
      "Informe origem, destino e datas",
      "Adicione seus dados de contato",
      "Envie sem compromisso"
    ],
    icon: "📝",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02", 
    title: "Receba Proposta Personalizada",
    description: "Em até 2 horas, nossa equipe te envia as melhores opções por email e WhatsApp.",
    details: [
      "Análise das melhores rotas e horários",
      "Comparação de preços entre companhias",
      "Opções de pagamento e parcelamento",
      "Condições de bagagem e cancelamento"
    ],
    icon: "⚡",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    title: "Aprove e Finalize",
    description: "Escolha a melhor opção e finalize sua compra de forma segura e rápida.",
    details: [
      "Pagamento seguro em até 12x no cartão",
      "Processamento imediato da reserva",
      "Confirmação por email em poucos minutos",
      "Documentos de viagem enviados"
    ],
    icon: "✅",
    color: "from-green-500 to-emerald-500"
  },
  {
    number: "04",
    title: "Viaje Tranquilo",
    description: "Nossa equipe te acompanha durante toda a viagem com suporte 24h.",
    details: [
      "Check-in online facilitado",
      "Suporte em caso de alterações ou cancelamentos",
      "Assistência durante conexões",
      "Atendimento 24h em português"
    ],
    icon: "🛫",
    color: "from-yellow-500 to-orange-500"
  }
];

const benefits = [
  {
    icon: "🎯",
    title: "Especialização",
    description: "Mais de 10 anos focados em brasileiros nos EUA"
  },
  {
    icon: "💰",
    title: "Melhor Preço",
    description: "Garantimos os preços mais competitivos do mercado"
  },
  {
    icon: "🇧🇷",
    title: "Atendimento BR",
    description: "Suporte completo em português"
  },
  {
    icon: "⚡",
    title: "Rapidez",
    description: "Cotações em até 2 horas"
  },
  {
    icon: "🛡️",
    title: "Segurança",
    description: "Pagamentos protegidos e reservas garantidas"
  },
  {
    icon: "📱",
    title: "Suporte 24h",
    description: "Assistência durante toda sua viagem"
  }
];

export default function ComoFunciona() {
  return (
    <>
      {/* Schema.org para HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Como funciona a Fly2Any",
            "description": "Processo simples em 4 passos para reservar sua viagem",
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description,
              "image": `https://fly2any.com/step-${index + 1}.jpg`
            }))
          }),
        }}
      />

      <GlobalMobileStyles />
      <ResponsiveHeader />
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        {/* Breadcrumbs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Breadcrumbs 
              items={[
                { label: 'Início', href: '/' },
                { label: 'Como Funciona' }
              ]} 
            />
          </div>
        </div>

        {/* Hero Section */}
        <section style={{ padding: '80px 0' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }} className="mobile-container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(74, 222, 128, 0.3)', borderRadius: '9999px', padding: '8px 16px', marginBottom: '24px' }} className="mobile-section">
              <span style={{ color: 'rgb(134, 239, 172)' }}>✨</span>
              <span style={{ color: 'rgb(187, 247, 208)', fontSize: '14px', fontWeight: '500' }}>Processo Simples e Rápido</span>
            </div>
            
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
              Como <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Funciona</span>
            </h1>
            <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', maxWidth: '768px', margin: '0 auto 32px auto' }} className="mobile-container">
              Viajar nunca foi tão simples! Conheça nosso processo em 4 passos 
              e descubra por que mais de 5.000 brasileiros já confiaram em nós.
            </p>
            <Link 
              href="/" 
              style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', textDecoration: 'none' }} className="mobile-section"
            >
              🚀 Começar Agora
            </Link>
          </div>
        </section>

        {/* Steps Section */}
        <section style={{ padding: '80px 0' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="mobile-container">
            <div style={{ maxWidth: '1152px', margin: '0 auto' }} className="mobile-container">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
                {steps.map((step, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: index % 2 === 1 ? 'row-reverse' : 'row', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>
                    {/* Content */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', background: step.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : step.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : step.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #eab308, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px' }}>
                          {step.number}
                        </div>
                        <div>
                          <h2 style={{ fontSize: '30px', fontWeight: '700', color: 'white', fontFamily: 'Poppins, sans-serif' }}>{step.title}</h2>
                          <p style={{ color: 'rgb(219, 234, 254)', fontSize: '18px', marginTop: '8px' }}>{step.description}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {step.details.map((detail, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={{ color: 'rgb(74, 222, 128)', marginTop: '4px' }}>✓</span>
                            <span style={{ color: 'rgb(219, 234, 254)' }}>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual */}
                    <div style={{ flex: '1', display: 'flex', justifyContent: 'center', minWidth: '300px' }}>
                      <div style={{ width: '256px', height: '256px', background: step.color === 'from-blue-500 to-cyan-500' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : step.color === 'from-purple-500 to-pink-500' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : step.color === 'from-green-500 to-emerald-500' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #eab308, #f97316)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '128px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        {step.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: '80px 0', background: 'rgba(0, 0, 0, 0.2)' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="mobile-container">
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Por que escolher a <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Fly2Any</span>?
              </h2>
              <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', maxWidth: '768px', margin: '0 auto' }} className="mobile-container">
                Mais de uma década de experiência conectando brasileiros ao mundo
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1152px', margin: '0 auto' }} className="mobile-container">
              {benefits.map((benefit, index) => (
                <div key={index} style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', textAlign: 'center' }} className="mobile-section">
                  <div style={{ fontSize: '36px', marginBottom: '16px' }}>{benefit.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>{benefit.title}</h3>
                  <p style={{ color: 'rgb(219, 234, 254)' }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Quick */}
        <section style={{ padding: '80px 0' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="mobile-container">
            <div style={{ maxWidth: '896px', margin: '0 auto' }} className="mobile-container">
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>Dúvidas Frequentes</h2>
                <p style={{ color: 'rgb(219, 234, 254)', fontSize: '18px' }}>Respostas rápidas para suas principais dúvidas</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
                  <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>A cotação é realmente gratuita?</h3>
                  <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>Sim! Nossa cotação é 100% gratuita e sem compromisso. Você só paga se decidir comprar.</p>
                </div>
                
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
                  <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>Posso parcelar minha passagem?</h3>
                  <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>Sim, aceitamos cartão de crédito em até 12x sem juros para cartões brasileiros.</p>
                </div>
                
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
                  <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>E se precisar cancelar?</h3>
                  <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>Sempre explicamos as políticas de cancelamento antes da compra e te ajudamos com o processo.</p>
                </div>
                
                <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
                  <h3 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>Têm suporte durante a viagem?</h3>
                  <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>Sim! Nossa equipe está disponível 24h para te ajudar com qualquer imprevisto.</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link href="/faq" style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', textDecoration: 'none' }} className="mobile-section">
                  Ver Todas as Perguntas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }} className="mobile-container">
            <div style={{ maxWidth: '768px', margin: '0 auto' }} className="mobile-container">
              <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Pronto para <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>começar</span>?
              </h2>
              <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', marginBottom: '32px' }}>
                O primeiro passo é simples: solicite sua cotação gratuita agora mesmo!
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
                <Link href="/" style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 40px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', fontSize: '20px', textDecoration: 'none' }} className="mobile-section">
                  ✈️ Solicitar Cotação
                </Link>
                <a href="https://wa.me/551151944717" style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 40px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', fontSize: '20px', textDecoration: 'none' }} className="mobile-section">
                  💬 Falar no WhatsApp
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgb(191, 219, 254)' }}>
                  <span style={{ color: 'rgb(74, 222, 128)' }}>✓</span>
                  <span>Cotação em 2h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgb(191, 219, 254)' }}>
                  <span style={{ color: 'rgb(74, 222, 128)' }}>✓</span>
                  <span>Sem compromisso</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgb(191, 219, 254)' }}>
                  <span style={{ color: 'rgb(74, 222, 128)' }}>✓</span>
                  <span>Suporte 24h</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}