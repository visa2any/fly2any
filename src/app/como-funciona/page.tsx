import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, PhoneIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';

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

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        {/* Header */}
        <header style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }} className="mobile-container">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Logo size="sm" variant="logo-only" /><span style={{ fontWeight: 700, fontSize: "18px", color: "white" }}>Fly2Any</span></div>
            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link href="/" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <Link href="/voos-brasil-eua" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FlightIcon style={{ width: '14px', height: '14px' }} />
                Voos
              </Link>
              <Link href="/como-funciona" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Como Funciona
              </Link>
              <Link href="/blog" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </Link>
              <Link href="/faq" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQ
              </Link>
              <Link href="/sobre" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sobre
              </Link>
              <Link href="/contato" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.3s',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <PhoneIcon style={{ width: '14px', height: '14px' }} />
                Contato
              </Link>
            </nav>
          </div>
        </header>

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

        <footer style={{
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(3, 7, 18, 0.95))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '80px 0 40px 0',
          color: 'white'
      }} className="mobile-section">
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px'
        }} className="mobile-container">
            {/* Main Footer Content */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '48px',
              marginBottom: '64px'
            }}>
              {/* Logo and Description */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #2563eb, #c026d3)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '800',
                      fontFamily: 'Poppins, sans-serif'
                    }}>F</span>
                  </div>
                  <div>
                    <h3 style={{
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '800',
                      margin: 0,
                      fontFamily: 'Poppins, sans-serif'
                    }}>Fly2Any</h3>
                    <p style={{
                      color: 'rgba(219, 234, 254, 0.7)',
                      fontSize: '14px',
                      margin: 0
                    }}>Conectando você ao Brasil</p>
                  </div>
                </div>
                <p style={{
                  color: 'rgba(219, 234, 254, 0.8)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  Especialistas em viagens Brasil-EUA há mais de 10 anos. 
                  Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
                </p>
                
                {/* Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <a href="https://wa.me/551151944717" style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'color 0.3s'
                  }}>
                    <span style={{ fontSize: '20px' }}>📞</span>
                    WhatsApp
                  </a>
                  <a href="/contato" style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'color 0.3s'
                  }}>
                    <span style={{ fontSize: '20px' }}>✉️</span>
                    Enviar mensagem
                  </a>
                  <a href="https://wa.me/551151944717" style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'color 0.3s'
                  }}>
                    <span style={{ fontSize: '20px' }}>💬</span>
                    WhatsApp 24/7
                  </a>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Nossos Serviços
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Passagens Aéreas', href: '/', icon: '✈️' },
                    { name: 'Hotéis no Brasil', href: '/', icon: '🏨' },
                    { name: 'Aluguel de Carros', href: '/', icon: '🚗' },
                    { name: 'Passeios e Tours', href: '/', icon: '🗺️' },
                    { name: 'Seguro Viagem', href: '/', icon: '🛡️' }
                  ].map((service, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={service.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>{service.icon}</span>
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Suporte
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Como Funciona', href: '/como-funciona' },
                    { name: 'FAQ', href: '/faq' },
                    { name: 'Contato', href: '/contato' },
                    { name: 'Sobre Nós', href: '/sobre' },
                    { name: 'Blog', href: '/blog' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={item.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s'
                      }}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Legal
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {[
                    { name: 'Política de Privacidade', href: '/politica-privacidade' },
                    { name: 'Termos de Uso', href: '/termos-uso' },
                    { name: 'Cookies', href: '#' },
                    { name: 'Segurança', href: '#' }
                  ].map((item, index) => (
                    <li key={index} style={{ marginBottom: '12px' }}>
                      <Link href={item.href} style={{
                        color: 'rgba(219, 234, 254, 0.8)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'color 0.3s'
                      }}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Trust Badges */}
                <div style={{ marginTop: '32px' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#10b981',
                      textAlign: 'center',
                      fontWeight: '600'
                    }} className="mobile-section">
                      🔒 SSL Certificado
                    </div>
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#3b82f6',
                      textAlign: 'center',
                      fontWeight: '600'
                    }} className="mobile-section">
                      ⭐ 4.9/5 Estrelas
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Bottom */}
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px'
            }}>
              <div>
                <p style={{ 
                  margin: 0,
                  color: 'rgba(147, 197, 253, 0.8)',
                  fontSize: '14px'
                }}>
                  &copy; 2024 Fly2Any. Todos os direitos reservados.
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  color: 'rgba(147, 197, 253, 0.6)',
                  fontSize: '12px'
                }}>
                  Conectando brasileiros ao Brasil há mais de 10 anos.
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{
                  color: 'rgba(147, 197, 253, 0.6)',
                  fontSize: '12px'
                }}>
                  Feito com ❤️ para brasileiros
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}