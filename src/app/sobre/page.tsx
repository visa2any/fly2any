import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, PhoneIcon, MailIcon, ChatIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Sobre a Fly2Any | Nossa História e Missão",
  description: "Conheça a Fly2Any, especialista em viagens Brasil-EUA há mais de 10 anos. Nossa missão é conectar brasileiros nos Estados Unidos ao Brasil com excelência.",
  keywords: "sobre fly2any, agência viagem brasileiros, história fly2any, missão empresa",
  openGraph: {
    title: "Sobre a Fly2Any | Nossa História e Missão",
    description: "Conheça nossa história e missão de conectar brasileiros nos EUA ao Brasil.",
    url: "https://fly2any.com/sobre",
  },
};

export default function Sobre() {
  return (
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
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Logo size="sm" showText={true} />
          <nav style={{ display: 'none' }} className="hidden-mobile">{/* Hidden on mobile */}
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
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <Breadcrumbs 
            items={[
              { label: 'Início', href: '/' },
              { label: 'Sobre' }
            ]} 
          />
        </div>
      </header>

      <div className="container-mobile spacing-mobile">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="text-mobile-3xl" style={{ 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '16px', 
              fontFamily: 'Poppins, sans-serif' 
            }}>
              Sobre a Fly2Any
            </h2>
            <p className="text-mobile-lg" style={{ color: 'rgb(219, 234, 254)' }}>
              Conectando brasileiros nos EUA ao Brasil com excelência e confiança
            </p>
          </div>

          <div className="grid-mobile" style={{ gridTemplateColumns: '1fr', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Nossa História
              </h3>
              <p style={{ color: 'rgb(219, 234, 254)', marginBottom: '16px', lineHeight: '1.6' }}>
                A Fly2Any nasceu da necessidade de facilitar as viagens dos brasileiros que vivem nos Estados Unidos 
                e desejam visitar o Brasil. Como brasileiros que entendemos os desafios e peculiaridades dessa jornada, 
                criamos uma agência especializada em atender nossa comunidade.
              </p>
              <p style={{ color: 'rgb(219, 234, 254)', lineHeight: '1.6' }}>
                Sabemos que viajar para casa não é apenas uma questão de comprar uma passagem - é sobre conexão, 
                saudade, família e momentos especiais. Por isso, tratamos cada cliente como parte da nossa família.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
                Nossa Missão
              </h3>
              <p style={{ color: 'rgb(219, 234, 254)', marginBottom: '16px', lineHeight: '1.6' }}>
                Facilitar e tornar mais acessíveis as viagens dos brasileiros residentes nos EUA para o Brasil, 
                oferecendo atendimento personalizado, preços competitivos e soluções completas de viagem.
              </p>
              <p style={{ color: 'rgb(219, 234, 254)', lineHeight: '1.6' }}>
                Queremos ser a ponte que conecta você ao seu lar, proporcionando experiências de viagem 
                inesquecíveis e sem complicações.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', marginBottom: '48px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
              Por que escolher a Fly2Any?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto', width: '64px', height: '64px', background: 'rgb(219, 234, 254)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg style={{ width: '32px', height: '32px', color: 'rgb(37, 99, 235)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Entendemos Você
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)' }}>
                  Somos brasileiros atendendo brasileiros. Conhecemos suas necessidades, cultura e expectativas.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto', width: '64px', height: '64px', background: 'rgb(187, 247, 208)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg style={{ width: '32px', height: '32px', color: 'rgb(5, 150, 105)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Preços Competitivos
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)' }}>
                  Negociamos diretamente com companhias aéreas e hotéis para oferecer os melhores preços.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto', width: '64px', height: '64px', background: 'rgb(243, 232, 255)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg style={{ width: '32px', height: '32px', color: 'rgb(124, 58, 237)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Atendimento Personalizado
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)' }}>
                  Cada cliente recebe atenção individual e suporte completo durante todo o processo.
                </p>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', color: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
              Nossos Números
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>500+</div>
                <p style={{ color: 'rgb(219, 234, 254)' }}>Clientes Atendidos</p>
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>1000+</div>
                <p style={{ color: 'rgb(219, 234, 254)' }}>Viagens Realizadas</p>
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>4.9/5</div>
                <p style={{ color: 'rgb(219, 234, 254)' }}>Avaliação dos Clientes</p>
              </div>
              <div>
                <div style={{ fontSize: '30px', fontWeight: '700', marginBottom: '8px' }}>24/7</div>
                <p style={{ color: 'rgb(219, 234, 254)' }}>Suporte Disponível</p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
              Pronto para sua próxima viagem?
            </h3>
            <p style={{ color: 'rgb(219, 234, 254)', marginBottom: '24px', fontSize: '18px' }}>
              Solicite uma cotação gratuita e descubra como podemos ajudar você a chegar ao Brasil.
            </p>
            <Link 
              href="/" 
              style={{ background: 'linear-gradient(135deg, #2563eb, #c026d3)', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '600', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              ✈️ Solicitar Cotação
            </Link>
          </div>
        </div>
      </div>

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                  <PhoneIcon style={{ width: '20px', height: '20px' }} />
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
                  <MailIcon style={{ width: '20px', height: '20px' }} />
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
                  <ChatIcon style={{ width: '20px', height: '20px' }} />
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
  );
}