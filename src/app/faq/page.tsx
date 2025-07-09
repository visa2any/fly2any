import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, PhoneIcon } from '@/components/Icons';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  title: "FAQ - Perguntas Frequentes | Fly2Any",
  description: "Tire suas dúvidas sobre voos Brasil-EUA, documentação, bagagem, preços e muito mais. Respostas completas para suas perguntas sobre viagem.",
  keywords: "faq voos brasil eua, dúvidas viagem, documentos viagem, bagagem internacional, preços passagens",
  openGraph: {
    title: "FAQ - Perguntas Frequentes | Fly2Any",
    description: "Tire suas dúvidas sobre voos Brasil-EUA, documentação, bagagem, preços e muito mais.",
    url: "https://fly2any.com/faq",
  },
};

const faqData = [
  {
    category: "Voos e Reservas",
    questions: [
      {
        question: "Como funciona o processo de cotação?",
        answer: "Nosso processo é simples e rápido: 1) Preencha o formulário com seus dados de viagem, 2) Nossa equipe analisa as melhores opções em até 2 horas, 3) Você recebe uma cotação personalizada por email/WhatsApp, 4) Aprovando, finalizamos sua reserva."
      },
      {
        question: "Qual a diferença entre vocês e outros sites de viagem?",
        answer: "Somos especialistas em brasileiros nos EUA há mais de 10 anos. Oferecemos atendimento personalizado em português, preços exclusivos por termos parcerias diretas com companhias aéreas, e suporte completo antes, durante e após a viagem."
      },
      {
        question: "Vocês trabalham com todas as companhias aéreas?",
        answer: "Sim, trabalhamos com todas as principais companhias que operam entre Brasil e EUA: American Airlines, Delta, United, LATAM, Azul, GOL, Copa Airlines, Avianca e outras."
      },
      {
        question: "Posso cancelar ou alterar minha passagem?",
        answer: "As políticas de cancelamento e alteração dependem da tarifa escolhida e da companhia aérea. Sempre explicamos essas condições antes da compra e te ajudamos com qualquer necessidade posterior."
      }
    ]
  },
  {
    category: "Documentação e Viagem",
    questions: [
      {
        question: "Que documentos preciso para viajar do Brasil para os EUA?",
        answer: "Você precisa de: passaporte brasileiro válido (com pelo menos 6 meses de validade), visto americano válido (B1/B2 ou outro apropriado), e comprovante de vacina contra COVID-19 se ainda exigido."
      },
      {
        question: "Preciso de visto para fazer conexão nos EUA?",
        answer: "Sim, mesmo para conexões nos EUA você precisa de visto americano válido. Não existe trânsito internacional sem visto nos aeroportos americanos."
      },
      {
        question: "Meu visto está vencido, posso viajar?",
        answer: "Não, você deve renovar seu visto antes de viajar. Oferecemos orientação sobre o processo de renovação e podemos aguardar sua documentação ficar pronta."
      }
    ]
  },
  {
    category: "Bagagem e Tarifas",
    questions: [
      {
        question: "Quantas bagagens posso levar?",
        answer: "Depende da companhia e tipo de tarifa. Geralmente: bagagem de mão (1 peça de até 10kg) é gratuita, bagagem despachada varia de 0 a 2 peças incluídas. Sempre informamos os detalhes na cotação."
      },
      {
        question: "Posso levar produtos brasileiros na bagagem?",
        answer: "Sim, mas há restrições. Produtos industrializados lacrados geralmente são permitidos. Evite produtos perecíveis, carnes, queijos. Consulte sempre a alfândega americana para produtos específicos."
      },
      {
        question: "Como funciona o excesso de bagagem?",
        answer: "Cada companhia tem suas regras. Geralmente varia de $100-200 por bagagem extra. Recomendamos comprar antecipadamente quando possível, sai mais barato."
      }
    ]
  },
  {
    category: "Preços e Pagamento",
    questions: [
      {
        question: "Por que os preços variam tanto?",
        answer: "Os preços de passagens aéreas mudam constantemente baseado em: disponibilidade, época do ano, antecedência da compra, eventos especiais, e demanda. Por isso nossa cotação personalizada encontra o melhor momento."
      },
      {
        question: "Posso parcelar minha passagem?",
        answer: "Sim! Oferecemos parcelamento em até 12x no cartão de crédito brasileiro, além de aceitar cartões americanos e transferência bancária."
      },
      {
        question: "Vocês cobram taxa de serviço?",
        answer: "Nossa cotação é gratuita! Cobramos apenas uma pequena taxa de conveniência já incluída no preço final, sempre transparente e informada antecipadamente."
      }
    ]
  },
  {
    category: "Suporte e Emergências",
    questions: [
      {
        question: "E se houver problemas durante a viagem?",
        answer: "Oferecemos suporte 24h durante sua viagem. Se há cancelamentos, atrasos ou outras emergências, nossa equipe te ajuda a resolver diretamente com a companhia aérea."
      },
      {
        question: "Como entro em contato com vocês?",
        answer: "WhatsApp ou pelo formulário do site. Respondemos em até 2 horas durante horário comercial."
      },
      {
        question: "Vocês têm escritório físico?",
        answer: "Somos uma agência digital especializada, com equipe em Miami e São Paulo. Isso nos permite oferecer preços melhores mantendo excelência no atendimento."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <>
      {/* Schema.org para FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.flatMap(category => 
              category.questions.map(q => ({
                "@type": "Question",
                "name": q.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": q.answer
                }
              }))
            )
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
          }}>
            <Logo size="md" showText={true} />
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
        <section style={{ padding: '80px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
              Perguntas <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Frequentes</span>
            </h1>
            <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', maxWidth: '768px', margin: '0 auto 32px auto' }}>
              Tire todas suas dúvidas sobre viagens Brasil-EUA. 
              Se não encontrar sua resposta, entre em contato conosco!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <Link 
                href="/contato" 
                style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                💬 Falar Conosco
              </Link>
              <Link 
                href="/" 
                style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                🚀 Solicitar Cotação
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section style={{ padding: '64px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ maxWidth: '896px', margin: '0 auto' }}>
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} style={{ marginBottom: '48px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '12px' }}>
                    {category.category}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {category.questions.map((item, index) => (
                      <div key={index} style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
                          {item.question}
                        </h3>
                        <p style={{ color: 'rgb(219, 234, 254)', lineHeight: '1.6' }}>
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '64px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: '768px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Não encontrou sua resposta?
              </h2>
              <p style={{ color: 'rgb(219, 234, 254)', marginBottom: '32px', fontSize: '18px' }}>
                Nossa equipe especializada está pronta para te ajudar com qualquer dúvida específica sobre sua viagem.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                <a 
                  href="https://wa.me/15551234567" 
                  style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a 
                  href="mailto:contato@fly2any.com" 
                  style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  ✉️ Email
                </a>
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
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px'
          }}>
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
                  <a href="https://wa.me/5511951944717" style={{
                    color: 'rgba(219, 234, 254, 0.8)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'color 0.3s'
                  }}>
                    <span style={{ fontSize: '20px' }}>💬</span>
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
                  <a href="https://wa.me/5511951944717" style={{
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
                    }}>
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
                    }}>
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