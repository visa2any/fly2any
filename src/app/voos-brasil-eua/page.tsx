import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { FlightIcon, PhoneIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Footer from '@/components/Footer';

const routes = [
  { from: "Miami (MIA)", to: "São Paulo (GRU)", price: "$890", direct: true },
  { from: "New York (JFK)", to: "Rio de Janeiro (GIG)", price: "$1,150", direct: false },
  { from: "Los Angeles (LAX)", to: "São Paulo (GRU)", price: "$1,450", direct: false },
  { from: "Orlando (MCO)", to: "Brasília (BSB)", price: "$1,200", direct: false },
  { from: "Miami (MIA)", to: "Lisboa (LIS)", price: "$650", direct: false },
  { from: "New York (JFK)", to: "Londres (LHR)", price: "$520", direct: true },
  { from: "Los Angeles (LAX)", to: "Tokyo (NRT)", price: "$890", direct: false },
  { from: "Chicago (ORD)", to: "Paris (CDG)", price: "$680", direct: false },
  { from: "Dallas (DFW)", to: "Madrid (MAD)", price: "$720", direct: false },
  { from: "Atlanta (ATL)", to: "Amsterdam (AMS)", price: "$640", direct: true },
  { from: "Houston (IAH)", to: "Dubai (DXB)", price: "$1,080", direct: false },
  { from: "Boston (BOS)", to: "Frankfurt (FRA)", price: "$580", direct: false },
  { from: "San Francisco (SFO)", to: "Singapore (SIN)", price: "$1,200", direct: false },
  { from: "Denver (DEN)", to: "Zurich (ZUR)", price: "$750", direct: false },
  { from: "Phoenix (PHX)", to: "Istanbul (IST)", price: "$820", direct: false },
];

const airlines = [
  { 
    name: "LATAM", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7f/LATAM-Logo.svg", 
    features: ["Voos diretos", "Bagagem incluída", "Programa de milhas"] 
  },
  { 
    name: "American Airlines", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/American_Airlines_logo_2013.svg", 
    features: ["Rede extensa", "Upgrades disponíveis", "Conexões rápidas"] 
  },
  { 
    name: "Delta Air Lines", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg", 
    features: ["Conforto premium", "Entretenimento a bordo", "WiFi gratuito"] 
  },
  { 
    name: "United Airlines", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/United_Airlines_Logo.svg", 
    features: ["Assentos espaçosos", "Refeições inclusas", "Check-in móvel"] 
  },
  { 
    name: "Emirates", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg", 
    features: ["Luxo internacional", "Entretenimento premium", "Classe executiva"] 
  },
  { 
    name: "Lufthansa", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg", 
    features: ["Pontualidade alemã", "Conexões europeias", "Serviço premium"] 
  },
  { 
    name: "Air France", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg", 
    features: ["Elegância francesa", "Gastronomia a bordo", "Rede global"] 
  },
  { 
    name: "British Airways", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/British_Airways_Logo.svg", 
    features: ["Tradição britânica", "Primeira classe", "Conexões mundiais"] 
  },
  { 
    name: "Qatar Airways", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Qatar_Airways_Logo.svg", 
    features: ["5 estrelas", "Qsuite business", "Hub no Oriente Médio"] 
  },
  { 
    name: "Singapore Airlines", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Singapore_Airlines_Logo_2.svg", 
    features: ["Serviço excepcional", "Suítes A380", "Conexões asiáticas"] 
  },
  { 
    name: "KLM", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c7/KLM_logo.svg", 
    features: ["Tradição holandesa", "Sustentabilidade", "Conexões eficientes"] 
  },
  { 
    name: "Turkish Airlines", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Turkish_Airlines_logo_2019_compact.svg", 
    features: ["Ponte Europa-Ásia", "Gastronomia turca", "Rede extensa"] 
  }
];

export default function VoosBrasilEUA() {
  const containerStyle = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const heroGradient = {
    background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif'
  };


  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '24px',
    padding: '32px',
    transition: 'all 0.3s ease'
  };

  const buttonPrimary = {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    fontWeight: 'bold',
    padding: '20px 40px',
    borderRadius: '16px',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px'
  };

  const buttonWhatsApp = {
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: 'white',
    fontWeight: 'bold',
    padding: '20px 40px',
    borderRadius: '16px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px'
  };

  return (
    <>
      <GlobalMobileStyles />
      <div style={heroGradient}>
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
      <section style={{
        paddingTop: '96px',
        paddingBottom: '96px',
        position: 'relative'
      }}>
        <div style={{
          ...containerStyle,
          textAlign: 'center'
        }}>
          {/* Premium Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '50px',
            padding: '12px 24px',
            marginBottom: '32px'
          }} className="mobile-section">
            <span style={{ fontSize: '24px' }}>🔥</span>
            <span style={{
              color: 'rgba(254, 240, 138, 0.95)',
              fontWeight: '600'
            }}>PROMOÇÃO LIMITADA</span>
            <span style={{
              background: '#facc15',
              color: '#1f2937',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }} className="mobile-section">ATÉ 40% OFF</span>
          </div>

          <h1 style={{
            fontSize: '64px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '32px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.1'
          }}>
            Voos{' '}
            <span style={{
              background: 'linear-gradient(135deg, #facc15, #fb923c, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>EUA-Brasil</span>
          </h1>

          <p style={{
            fontSize: '24px',
            color: 'rgba(191, 219, 254, 0.9)',
            marginBottom: '48px',
            maxWidth: '896px',
            margin: '0 auto 48px auto',
            lineHeight: '1.5'
          }} className="mobile-container">
            Encontre as <strong>melhores passagens aéreas</strong> dos EUA para o Brasil e qualquer lugar do mundo com até <strong>40% de desconto</strong>. 
            Voos diretos e com conexão. Atendimento especializado em português para brasileiros nos EUA.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}>
            <Link href="/" style={buttonPrimary}>
              ✈️ <span>Solicitar Cotação</span>
            </Link>
            
            <a href="https://wa.me/551151944717" style={buttonWhatsApp}>
              💬 <span>WhatsApp Agora</span>
            </a>
          </div>

          {/* Social Proof */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            color: 'rgba(191, 219, 254, 0.8)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span style={{ fontSize: '14px' }}>100% Gratuito</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span style={{ fontSize: '14px' }}>Sem Compromisso</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span style={{ fontSize: '14px' }}>5.000+ Clientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rotas Populares */}
      <section style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        background: 'rgba(0, 0, 0, 0.1)'
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '50px',
              padding: '8px 24px',
              marginBottom: '24px'
            }} className="mobile-section">
              <span style={{
                color: 'rgba(191, 219, 254, 0.9)',
                fontWeight: '600'
              }}>ROTAS POPULARES</span>
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Destinos Mais Procurados
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(191, 219, 254, 0.9)',
              maxWidth: '768px',
              margin: '0 auto'
            }} className="mobile-container">
              Conectamos brasileiros nos EUA ao Brasil, Europa, Ásia e destinos worldwide com as melhores tarifas
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1400px',
            margin: '0 auto'
          }} className="mobile-container">
            {routes.map((route, index) => (
              <div key={index} style={cardStyle}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: route.direct ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: route.direct ? '#86efac' : '#fbbf24',
                    border: route.direct ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                  }} className="mobile-section">
                    {route.direct ? '🎯 Voo Direto' : '🔄 Com Conexão'}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#93c5fd',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>A partir de</div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#facc15',
                      fontFamily: 'Poppins, sans-serif'
                    }}>{route.price}</div>
                  </div>
                </div>
                
                {/* Route */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: '#60a5fa',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>{route.from}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '16px 0'
                  }}>
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(to right, transparent, #60a5fa, transparent)',
                      flex: 1
                    }}></div>
                    <div style={{
                      margin: '0 16px',
                      fontSize: '24px'
                    }}>✈️</div>
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(to right, transparent, #60a5fa, transparent)',
                      flex: 1
                    }}></div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: '#4ade80',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>{route.to}</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <button style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }} className="mobile-section">
                  Ver Disponibilidade →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companhias Aéreas */}
      <section style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3))'
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              borderRadius: '50px',
              padding: '8px 24px',
              marginBottom: '24px'
            }} className="mobile-section">
              <span style={{
                color: '#d8b4fe',
                fontWeight: '600',
                fontSize: '14px',
                textTransform: 'uppercase'
              }}>🤝 Nossas Parcerias</span>
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Principais</span> Companhias
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(191, 219, 254, 0.9)',
              maxWidth: '768px',
              margin: '0 auto'
            }} className="mobile-container">Trabalhamos com as <strong>melhores companhias aéreas</strong> para garantir sua segurança e conforto</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            maxWidth: '1600px',
            margin: '0 auto'
          }} className="mobile-container">
            {airlines.map((airline, index) => (
              <div key={index} style={{
                ...cardStyle,
                textAlign: 'center'
              }}>
                <div style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '12px'
                }} className="mobile-section">
                  <OptimizedImage 
                    src={airline.logo} 
                    alt={`${airline.name} logo`}
                    width={140}
                    height={60}
                    loading="lazy"
                    style={{
                      maxHeight: '60px',
                      maxWidth: '140px',
                      objectFit: 'contain'
                    }}
                    className="mobile-container"
                  />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '12px',
                  fontFamily: 'Poppins, sans-serif'
                }}>{airline.name}</h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {airline.features.map((feature, idx) => (
                    <li key={idx} style={{
                      color: 'rgba(191, 219, 254, 0.9)',
                      fontSize: '14px',
                      marginBottom: '4px'
                    }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        paddingTop: '96px',
        paddingBottom: '96px',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative'
      }}>
        <div style={{
          ...containerStyle,
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(239, 68, 68, 0.2))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '50px',
            padding: '8px 24px',
            marginBottom: '32px'
          }} className="mobile-section">
            <span style={{
              color: '#fbbf24',
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'uppercase'
            }}>🚀 Comece Agora</span>
          </div>
          
          <h2 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '24px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.2'
          }}>
            Pronto para sua{' '}
            <span style={{
              background: 'linear-gradient(135deg, #facc15, #fb923c, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>próxima viagem</span>?
          </h2>
          
          <p style={{
            fontSize: '24px',
            color: 'rgba(191, 219, 254, 0.9)',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Receba uma <strong>cotação personalizada</strong> em até 2 horas. 
            Sem compromisso, totalmente gratuito!
          </p>
          
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}>
            <Link href="/" style={{
              ...buttonPrimary,
              fontSize: '20px',
              padding: '24px 48px'
            }} className="mobile-section">
              ✈️ <span>Solicitar Cotação</span>
            </Link>
            
            <a href="https://wa.me/551151944717" style={{
              ...buttonWhatsApp,
              fontSize: '20px',
              padding: '24px 48px'
            }} className="mobile-section">
              📞 <span>WhatsApp Agora</span>
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            maxWidth: '600px',
            margin: '0 auto'
          }} className="mobile-container">
            {[
              { icon: '💳', text: 'Sem taxa de consultoria' },
              { icon: '🏆', text: 'Melhor preço garantido' },
              { icon: '🛡️', text: 'Suporte 24h' }
            ].map((item, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }} className="mobile-section">
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <span style={{
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
