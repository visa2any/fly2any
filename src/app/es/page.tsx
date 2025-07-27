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
  title: "Fly2Any - Especialistas en Viajes a Brasil | Vuelos desde Latinoamérica",
  description: "Agencia de viajes especialista en Brasil para latinoamericanos. Mejores vuelos, hoteles, autos, tours y seguro de viaje. ¡Cotización gratis en 2 horas!",
  keywords: "vuelos a brasil, viajes brasil, vuelos rio de janeiro, vuelos sao paulo, viajes latinoamerica brasil, vuelos baratos brasil, agencia viajes brasil",
  openGraph: {
    title: "Fly2Any - Especialistas en Viajes a Brasil para Latinoamericanos",
    description: "Agencia de viajes especialista en Brasil para latinoamericanos. Mejores ofertas y servicio personalizado.",
    url: "https://fly2any.com/es",
    locale: "es_419",
  },
  alternates: {
    canonical: "https://fly2any.com/es",
    languages: {
      'en-US': 'https://fly2any.com/en',
      'pt-BR': 'https://fly2any.com/pt',
      'es-419': 'https://fly2any.com/es',
      'x-default': 'https://fly2any.com',
    },
  },
};

export default function SpanishHomePage() {
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
              <Link href="/es" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Inicio
              </Link>
              <Link href="/es/nosotros" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Nosotros
              </Link>
              <Link href="/es/contacto" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Contacto
              </Link>
              <Link href="/en" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇺🇸 EN
              </Link>
              <Link href="/pt" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇧🇷 PT
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
                Especialistas en Brasil desde 2014
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
              Tu Puerta de Entrada a
              <span style={{ 
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Brasil Hermoso
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
              Agencia de viajes especialista en Brasil para latinoamericanos. 
              <strong style={{ color: 'white' }}> ¡Cotización personalizada en 2 horas!</strong>
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
                Cotizar Vuelos
              </Link>
              
              <Link 
                href="/es/contacto"
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
                Hablar con Experto
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
                  4.9/5 (1,247 reseñas)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  10+ Años de Experiencia
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  15,000+ Viajeros Felices
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
              Servicios Completos de Viaje a Brasil
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px'
            }}>
              {[
                {
                  icon: FlightIcon,
                  title: "Vuelos a Brasil",
                  description: "Mejores ofertas en vuelos desde toda Latinoamérica a Brasil. Vuelos directos y con conexiones.",
                  link: "/cotacao/voos"
                },
                {
                  icon: HotelIcon,
                  title: "Hoteles en Brasil",
                  description: "Hoteles seleccionados desde económicos hasta lujo en todo Brasil. Río, São Paulo, Salvador y más.",
                  link: "/cotacao/hoteis"
                },
                {
                  icon: CarIcon,
                  title: "Alquiler de Autos",
                  description: "Servicios confiables de alquiler de autos en todo Brasil. Perfecto para explorar a tu ritmo.",
                  link: "/cotacao/carros"
                },
                {
                  icon: TourIcon,
                  title: "Tours y Experiencias",
                  description: "Tours exclusivos y experiencias culturales. Descubre el verdadero Brasil con guías locales.",
                  link: "/cotacao/passeios"
                },
                {
                  icon: InsuranceIcon,
                  title: "Seguro de Viaje",
                  description: "Cobertura completa para tu viaje a Brasil. Médico, equipaje y cancelación de viaje.",
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
              Por Qué Latinoamericanos Eligen Fly2Any
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '32px'
            }}>
              {[
                {
                  title: "Experiencia en Brasil",
                  description: "10+ años especializándose exclusivamente en viajes a Brasil. Conocemos las mejores rutas, temporadas y joyas ocultas."
                },
                {
                  title: "Atención en Español",
                  description: "Equipo hispanohablante con base en Miami. Disponible 7 días a la semana para ayudarte con tu viaje."
                },
                {
                  title: "Garantía del Mejor Precio",
                  description: "Comparamos múltiples aerolíneas y proveedores para encontrarte las mejores ofertas. Superamos cualquier precio de la competencia."
                },
                {
                  title: "Asistencia con Visa",
                  description: "Ayuda completa con requisitos de visa para Brasil y documentación para ciudadanos latinoamericanos."
                },
                {
                  title: "Soporte 24/7",
                  description: "Asistencia de emergencia durante tu viaje. Estamos aquí cuando más nos necesitas."
                },
                {
                  title: "Conocimiento Cultural",
                  description: "Obtén consejos únicos sobre la cultura brasileña, costumbres y destinos imperdibles."
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
              ¿Listo para Descubrir Brasil?
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '32px',
              lineHeight: '1.5',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Únete a miles de latinoamericanos que confiaron en nosotros para su aventura brasileña. 
              ¡Obtén tu cotización personalizada en solo 2 horas!
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
                Planificar Mi Viaje
              </Link>
              
              <Link 
                href="/es/contacto"
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
                WhatsApp +55 11 99999-0000
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Schema.org JSON-LD for Spanish page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://fly2any.com/es",
            "url": "https://fly2any.com/es",
            "name": "Fly2Any - Especialistas en Viajes a Brasil para Latinoamericanos",
            "description": "Agencia de viajes especialista en Brasil para latinoamericanos. Mejores vuelos, hoteles y servicios de viaje.",
            "inLanguage": "es-419",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://fly2any.com",
              "url": "https://fly2any.com",
              "name": "Fly2Any"
            },
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Especialistas en viajes a Brasil para viajeros latinoamericanos"
            },
            "mainEntity": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Especialistas en Viajes a Brasil",
              "description": "Agencia de viajes especialista en Brasil para latinoamericanos",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Viajeros latinoamericanos a Brasil"
              }
            }
          }),
        }}
      />
    </>
  );
}