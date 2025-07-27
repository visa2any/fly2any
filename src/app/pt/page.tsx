import type { Metadata } from "next";
import Link from "next/link";
import { 
  FlightIcon, 
  HotelIcon, 
  CarIcon, 
  TourIcon, 
  InsuranceIcon,
  CheckIcon,
  StarIcon,
  LocationIcon
} from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';

export const metadata: Metadata = {
  title: "Fly2Any - Especialistas em Viagens ao Brasil | Voos Brasil-EUA",
  description: "Agência de viagens especialista em Brasil para brasileiros e estrangeiros. Melhores voos, hotéis, carros, passeios e seguro viagem. Cotação grátis em 2 horas!",
  keywords: "voos brasil eua, passagens aereas brasil, viagem brasil, voos sao paulo, voos rio de janeiro, voos baratos brasil, agencia viagem brasil",
  openGraph: {
    title: "Fly2Any - Especialistas em Viagens ao Brasil",
    description: "Agência de viagens especialista em Brasil. Melhores ofertas e atendimento personalizado.",
    url: "https://fly2any.com/pt",
    locale: "pt_BR",
  },
  alternates: {
    canonical: "https://fly2any.com/pt",
    languages: {
      'en-US': 'https://fly2any.com/en',
      'pt-BR': 'https://fly2any.com/pt',
      'es-419': 'https://fly2any.com/es',
      'x-default': 'https://fly2any.com',
    },
  },
};

export default function PortugueseHomePage() {
  return (
    <>
      <GlobalMobileStyles />
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
            <Logo size="md" variant="logo-only" headingLevel="div" />
            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link href="/pt" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Início
              </Link>
              <Link href="/sobre" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Sobre
              </Link>
              <Link href="/contato" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Contato
              </Link>
              <Link href="/en" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇺🇸 EN
              </Link>
              <Link href="/es" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇪🇸 ES
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 32px' }} className="mobile-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '16px', 
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }} className="mobile-section">
              <LocationIcon style={{ width: '24px', height: '24px', color: '#facc15' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                Especialistas em Brasil desde 2014
              </span>
            </div>
            <h1 style={{ 
              fontSize: '56px', 
              fontWeight: '800', 
              color: 'white', 
              margin: '0 0 24px 0',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: '1.1',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Sua Porta de Entrada para o
              <span style={{ 
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Brasil Maravilhoso
              </span>
            </h1>
            <p style={{ 
              fontSize: '20px', 
              color: 'rgb(219, 234, 254)', 
              marginBottom: '48px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 48px auto'
            }}>
              Agência de viagens especialista em Brasil para brasileiros e estrangeiros. 
              <strong style={{ color: 'white' }}> Cotação personalizada em 2 horas!</strong>
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link 
                href="/cotacao/voos"
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="mobile-section"
              >
                <FlightIcon style={{ width: '20px', height: '20px' }} />
                Cotar Voos
              </Link>
              
              <Link 
                href="/contato"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                className="mobile-section"
              >
                Falar com Especialista
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} style={{ width: '16px', height: '16px', color: '#facc15' }} />
                  ))}
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  4.9/5 (1,247 avaliações)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  10+ Anos de Experiência
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  15,000+ Viajantes Satisfeitos
                </span>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '64px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: '48px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Serviços Completos de Viagem ao Brasil
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px'
            }}>
              {[
                {
                  icon: FlightIcon,
                  title: "Voos para o Brasil",
                  description: "Melhores ofertas em voos para o Brasil. Voos diretos e com conexões de qualquer lugar do mundo.",
                  link: "/cotacao/voos"
                },
                {
                  icon: HotelIcon,
                  title: "Hotéis no Brasil",
                  description: "Hotéis selecionados do econômico ao luxo em todo o Brasil. Rio, São Paulo, Salvador e muito mais.",
                  link: "/cotacao/hoteis"
                },
                {
                  icon: CarIcon,
                  title: "Aluguel de Carros",
                  description: "Serviços confiáveis de aluguel de carros em todo o Brasil. Perfeito para explorar no seu próprio ritmo.",
                  link: "/cotacao/carros"
                },
                {
                  icon: TourIcon,
                  title: "Passeios e Experiências",
                  description: "Tours exclusivos e experiências culturais. Descubra o verdadeiro Brasil com guias locais.",
                  link: "/cotacao/passeios"
                },
                {
                  icon: InsuranceIcon,
                  title: "Seguro Viagem",
                  description: "Cobertura abrangente para sua viagem ao Brasil. Médico, bagagem e cancelamento de viagem.",
                  link: "/cotacao/seguro"
                }
              ].map((service, index) => (
                <Link
                  key={index}
                  href={service.link}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    display: 'block'
                  }}
                  className="mobile-section"
                >
                  <service.icon style={{ width: '48px', height: '48px', color: '#facc15', marginBottom: '16px' }} />
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: 'white', 
                    marginBottom: '12px' 
                  }}>
                    {service.title}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '64px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: '48px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Por Que Escolher a Fly2Any
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '32px'
            }}>
              {[
                {
                  title: "Expertise em Brasil",
                  description: "10+ anos especializando exclusivamente em viagens ao Brasil. Conhecemos as melhores rotas, épocas e destinos únicos."
                },
                {
                  title: "Atendimento Especializado",
                  description: "Equipe brasileira com base em Miami. Disponível 7 dias por semana para ajudar com sua viagem."
                },
                {
                  title: "Garantia do Melhor Preço",
                  description: "Comparamos várias companhias aéreas e fornecedores para encontrar as melhores ofertas. Superamos qualquer preço da concorrência."
                },
                {
                  title: "Assistência com Documentação",
                  description: "Ajuda completa com requisitos de visto e documentação para visitantes ao Brasil."
                },
                {
                  title: "Suporte 24/7",
                  description: "Assistência de emergência durante sua viagem. Estamos aqui quando você mais precisa."
                },
                {
                  title: "Conhecimento Cultural",
                  description: "Dicas exclusivas sobre a cultura brasileira, costumes e destinos imperdíveis."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <CheckIcon style={{ width: '24px', height: '24px', color: '#1f2937' }} />
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white', 
                    marginBottom: '12px' 
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            textAlign: 'center'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Pronto para Descobrir o Brasil?
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '32px',
              lineHeight: '1.5',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Junte-se a milhares de viajantes que confiaram em nós para sua aventura brasileira. 
              Obtenha sua cotação personalizada em apenas 2 horas!
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/cotacao/voos"
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                className="mobile-section"
              >
                Planejar Minha Viagem
              </Link>
              
              <Link 
                href="/contato"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                className="mobile-section"
              >
                WhatsApp (11) 91234-5678
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Schema.org JSON-LD for Portuguese page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://fly2any.com/pt",
            "url": "https://fly2any.com/pt",
            "name": "Fly2Any - Especialistas em Viagens ao Brasil",
            "description": "Agência de viagens especialista em Brasil. Melhores voos, hotéis e serviços de viagem.",
            "inLanguage": "pt-BR",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://fly2any.com",
              "url": "https://fly2any.com",
              "name": "Fly2Any"
            },
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Especialistas em viagens ao Brasil"
            },
            "mainEntity": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Especialistas em Viagens ao Brasil",
              "description": "Agência de viagens especialista em Brasil",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Viajantes para o Brasil"
              }
            }
          }),
        }}
      />
    </>
  );
}