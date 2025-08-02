import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, PhoneIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "FAQ - Brazil Travel Questions | Fly2Any Travel Specialists",
  description: "Get answers about flights to Brazil, visa requirements, best times to visit, and travel tips. Complete guide for Americans, Latinos, and Brazilians traveling to Brazil.",
  keywords: "faq brazil travel, flights to brazil questions, brazil visa requirements, travel to brazil guide, brazil travel specialists",
  openGraph: {
    title: "FAQ - Brazil Travel Questions | Fly2Any Travel Specialists",
    description: "Get answers about flights to Brazil, visa requirements, best times to visit, and travel tips.",
    url: "https://fly2any.com/faq",
  },
  alternates: {
    canonical: "https://fly2any.com/faq",
    languages: {
      'en-US': 'https://fly2any.com/en/faq',
      'pt-BR': 'https://fly2any.com/pt/faq',
      'es-419': 'https://fly2any.com/es/faq',
      'x-default': 'https://fly2any.com/faq',
    },
  },
};

const faqData = [
  {
    category: "For International Travelers (EN/ES)",
    questions: [
      {
        question: "Do Americans need a visa to visit Brazil?",
        answer: "Yes, American citizens need a visa to visit Brazil for tourism or business. You can apply for an e-visa online through the Brazilian government website. Our team can help guide you through the process."
      },
      {
        question: "¿Los mexicanos necesitan visa para Brasil?",
        answer: "No, los ciudadanos mexicanos pueden ingresar a Brasil sin visa por turismo hasta 90 días. Solo necesitan pasaporte válido con al menos 6 meses de vigencia."
      },
      {
        question: "What's the best time to visit Brazil?",
        answer: "Brazil is great year-round! For beach destinations like Rio and Salvador: Dec-Mar (summer). For Amazon: Apr-Oct (dry season). For southern cities like São Paulo: Mar-May and Sep-Nov (mild weather). We help you choose based on your preferences."
      },
      {
        question: "¿Cuál es la mejor época para viajar a Brasil?",
        answer: "Brasil es increíble todo el año. Para playas (Río, Salvador): Dic-Mar (verano). Para Amazonia: Abr-Oct (estación seca). Para ciudades del sur: Mar-May y Sep-Nov (clima templado). Te ayudamos a elegir según tus preferencias."
      },
      {
        question: "Why choose Fly2Any over other travel agencies?",
        answer: "We specialize exclusively in Brazil travel for 10+ years. Our team speaks English, Spanish, and Portuguese. We offer personalized service, insider knowledge, competitive prices, and 24/7 support during your trip."
      },
      {
        question: "¿Por qué elegir Fly2Any sobre otras agencias?",
        answer: "Nos especializamos exclusivamente en viajes a Brasil por más de 10 años. Nuestro equipo habla español, inglés y portugués. Ofrecemos servicio personalizado, conocimiento local, precios competitivos y soporte 24/7."
      }
    ]
  },
  {
    category: "Flights & Bookings / Voos e Reservas",
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
      {/* Schema.org para FAQ Multi-idioma */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Brazil Travel FAQ - Fly2Any Travel Specialists",
            "description": "Frequently asked questions about traveling to Brazil for Americans, Latinos, and Brazilians",
            "url": "https://fly2any.com/faq",
            "inLanguage": ["en", "es", "pt"],
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Brazil travel specialists",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              }
            },
            "audience": [
              {
                "@type": "Audience",
                "audienceType": "American travelers to Brazil"
              },
              {
                "@type": "Audience", 
                "audienceType": "Latin American travelers to Brazil"
              },
              {
                "@type": "Audience",
                "audienceType": "Brazilian travelers"
              }
            ],
            "mainEntity": faqData.flatMap(category => 
              category.questions.map(q => ({
                "@type": "Question",
                "name": q.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": q.answer,
                  "author": {
                    "@type": "Organization",
                    "name": "Fly2Any Brazil Travel Specialists"
                  }
                },
                "dateCreated": "2025-07-27",
                "dateModified": "2025-07-27"
              }))
            )
          }),
        }}
      />

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        <ResponsiveHeader />

        {/* Hero Section */}
        <section style={{ padding: '80px 0' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }} className="mobile-container">
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
              Brazil Travel <span style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>FAQ</span>
            </h1>
            <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)', maxWidth: '768px', margin: '0 auto 32px auto' }} className="mobile-container">
              Get answers about traveling to Brazil. Questions in English, Spanish, and Portuguese. 
              Can't find your answer? Contact our Brazil travel specialists!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <Link 
                href="/contato" 
                style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} className="mobile-section"
              >
                💬 Falar Conosco
              </Link>
              <Link 
                href="/" 
                style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} className="mobile-section"
              >
                🚀 Solicitar Cotação
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section style={{ padding: '64px 0' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="mobile-container">
            <div style={{ maxWidth: '896px', margin: '0 auto' }} className="mobile-container">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} style={{ marginBottom: '48px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '12px' }}>
                    {category.category}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {category.questions.map((item, index) => (
                      <div key={index} style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
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
        <section style={{ padding: '64px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} className="mobile-section">
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }} className="mobile-container">
            <div style={{ maxWidth: '768px', margin: '0 auto' }} className="mobile-container">
              <h2 style={{ fontSize: '30px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Não encontrou sua resposta?
              </h2>
              <p style={{ color: 'rgb(219, 234, 254)', marginBottom: '32px', fontSize: '18px' }}>
                Nossa equipe especializada está pronta para te ajudar com qualquer dúvida específica sobre sua viagem.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                <a 
                  href="https://wa.me/15551234567" 
                  style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} className="mobile-section"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
                <a 
                  href="mailto:contato@fly2any.com" 
                  style={{ background: 'linear-gradient(135deg, #eab308, #f59e0b)', color: '#1f2937', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} className="mobile-section"
                >
                  ✉️ Email
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}