import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Voos Miami - São Paulo | Passagens Aéreas MIA-GRU | Fly2Any",
  description: "Voos diretos Miami para São Paulo com os melhores preços. Passagens aéreas MIA-GRU com especialistas brasileiros. Cotação gratuita em 2 horas!",
  keywords: "voos miami sao paulo, passagens aereas MIA GRU, voos miami brasil, passagens miami sao paulo, voos diretos miami",
  openGraph: {
    title: "Voos Miami - São Paulo | Passagens Aéreas MIA-GRU | Fly2Any",
    description: "Voos diretos Miami para São Paulo com os melhores preços. Cotação gratuita em 2 horas!",
    url: "https://fly2any.com/voos-miami-sao-paulo",
  },
};

export default function VoosMiamiSaoPaulo() {
  return (
    <>
      <GlobalMobileStyles />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
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
            <Link href="/" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px'
            }}>
              Home
            </Link>
            <Link href="/voos-brasil-eua" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px'
            }}>
              Voos Brasil-EUA
            </Link>
            <Link href="/contato" style={{
              color: 'rgba(255, 255, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontSize: '14px'
            }}>
              Contato
            </Link>
          </nav>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="mobile-container">
          <Breadcrumbs 
            items={[
              { label: 'Início', href: '/' },
              { label: 'Voos Brasil-EUA', href: '/voos-brasil-eua' },
              { label: 'Miami - São Paulo' }
            ]} 
          />
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }} className="mobile-container">
        <div style={{ maxWidth: '896px', margin: '0 auto' }} className="mobile-container">
          
          {/* Hero Section */}
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
              <FlightIcon style={{ width: '24px', height: '24px', color: '#facc15' }} />
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: '700', 
                color: 'white', 
                margin: 0,
                fontFamily: 'Poppins, sans-serif',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Voos Miami ✈️ São Paulo
              </h1>
            </div>
            <p style={{ 
              fontSize: '20px', 
              color: 'rgb(219, 234, 254)', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Passagens aéreas MIA-GRU com os melhores preços e atendimento especializado
            </p>
          </div>

          {/* Rota Information */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '48px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Informações da Rota MIA-GRU
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }} className="mobile-section">
                <h3 style={{ color: '#facc15', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🛫 Origem
                </h3>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Miami International Airport (MIA)
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Miami, Florida - Estados Unidos
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }} className="mobile-section">
                <h3 style={{ color: '#facc15', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🛬 Destino
                </h3>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Aeroporto de Guarulhos (GRU)
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  São Paulo, SP - Brasil
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }} className="mobile-section">
                <h3 style={{ color: '#facc15', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  ⏱️ Duração
                </h3>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  Aproximadamente 8h 30min
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Voo direto sem escalas
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }} className="mobile-section">
                <h3 style={{ color: '#facc15', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🌎 Distância
                </h3>
                <p style={{ color: 'white', fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  6.847 km
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '4px 0 0 0' }}>
                  Distância entre as cidades
                </p>
              </div>
            </div>
          </div>

          {/* Companhias Aéreas */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '48px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Companhias Aéreas Disponíveis
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px'
            }}>
              {['LATAM', 'American Airlines', 'Avianca', 'GOL', 'Azul'].map((airline) => (
                <div key={airline} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center'
                }} className="mobile-section">
                  <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    {airline}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            textAlign: 'center'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '600', 
              color: 'white', 
              marginBottom: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Solicite Sua Cotação
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Nossa equipe especializada encontrará as melhores opções de voos Miami-São Paulo para você.
              Atendimento em português 24 horas por dia.
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
                  fontSize: '16px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                className="mobile-section"
              >
                Cotar Voos Miami-SP
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
                  fontSize: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                className="mobile-section"
              >
                Falar com Especialista
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}