import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, HotelIcon, CarIcon, TourIcon, InsuranceIcon, PhoneIcon, MailIcon, ChatIcon } from '@/components/Icons';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  title: "Contato | Fale Conosco - Fly2Any",
  description: "Entre em contato com a Fly2Any. Telefone, WhatsApp, email. Atendimento em português 24h. Cotação gratuita em até 2 horas.",
  keywords: "contato fly2any, telefone, whatsapp, email, atendimento brasileiros",
  openGraph: {
    title: "Contato | Fale Conosco - Fly2Any",
    description: "Entre em contato conosco. Atendimento especializado em português.",
    url: "https://fly2any.com/contato",
  },
};

export default function Contato() {
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
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
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

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 48px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px', fontFamily: 'Poppins, sans-serif' }}>
              Entre em Contato
            </h2>
            <p style={{ fontSize: '20px', color: 'rgb(219, 234, 254)' }}>
              Estamos aqui para ajudar você a planejar sua viagem dos sonhos
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
                Fale Conosco
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ color: 'rgb(5, 150, 105)', background: 'rgb(187, 247, 208)', padding: '8px', borderRadius: '50%' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>WhatsApp</h4>
                    <p style={{ color: 'rgb(219, 234, 254)' }}>Clique para conversar</p>
                    <p style={{ fontSize: '14px', color: 'rgb(191, 219, 254)' }}>Atendimento 24/7</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ color: 'rgb(124, 58, 237)', background: 'rgb(243, 232, 255)', padding: '8px', borderRadius: '50%' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>Formulário</h4>
                    <p style={{ color: 'rgb(219, 234, 254)' }}>Envie sua mensagem</p>
                    <p style={{ fontSize: '14px', color: 'rgb(191, 219, 254)' }}>Resposta em até 2 horas</p>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: '32px', padding: '24px', background: 'rgb(239, 246, 255)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ color: 'rgb(37, 99, 235)' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 style={{ fontWeight: '600', color: 'rgb(30, 58, 138)' }}>Horário de Atendimento</h4>
                </div>
                <div style={{ fontSize: '14px', color: 'rgb(29, 78, 216)' }}>
                  <p><strong>Segunda a Sexta:</strong> 8h às 18h (EST)</p>
                  <p><strong>Sábado:</strong> 9h às 15h (EST)</p>
                  <p><strong>Domingo:</strong> Fechado</p>
                  <p style={{ marginTop: '8px' }}><strong>WhatsApp:</strong> 24/7 para emergências</p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
                  Solicite um Orçamento
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Link 
                    href="/cotacao/voos" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(37, 99, 235)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }}
                  >
                    <FlightIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Voos
                  </Link>
                  
                  <Link 
                    href="/cotacao/hoteis" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(5, 150, 105)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }}
                  >
                    <HotelIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Hotéis
                  </Link>
                  
                  <Link 
                    href="/cotacao/carros" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(234, 88, 12)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }}
                  >
                    <CarIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Carros
                  </Link>
                  
                  <Link 
                    href="/cotacao/passeios" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(124, 58, 237)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }}
                  >
                    <TourIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Passeios
                  </Link>
                  
                  <Link 
                    href="/cotacao/seguro" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(13, 148, 136)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }}
                  >
                    <InsuranceIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Seguro
                  </Link>
                </div>

                <div style={{ marginTop: '32px', padding: '16px', background: 'rgb(254, 249, 195)', border: '1px solid rgb(253, 230, 138)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ color: 'rgb(202, 138, 4)' }}>
                      <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 style={{ fontWeight: '600', color: 'rgb(146, 64, 14)' }}>Dica Importante</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgb(180, 83, 9)' }}>
                    Para cotações mais precisas, tenha em mãos suas datas de viagem, 
                    número de passageiros e preferências de destino.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '48px', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
              Perguntas Frequentes
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Quanto tempo leva para receber uma cotação?
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>
                  Enviamos cotações em até 2 horas durante o horário comercial.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Vocês trabalham com parcelamento?
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>
                  Sim, oferecemos diversas opções de pagamento e parcelamento.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Há taxa para cotação?
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>
                  Não, todas as cotações são gratuitas e sem compromisso.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Atendem emergências?
                </h4>
                <p style={{ color: 'rgb(219, 234, 254)', fontSize: '14px' }}>
                  Sim, temos suporte 24/7 via WhatsApp para emergências.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '80px 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '64px'
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Logo size="md" showText={true} />
              </div>
              <p style={{
                color: 'rgba(219, 234, 254, 1)',
                marginBottom: '24px',
                maxWidth: '400px',
                lineHeight: '1.6'
              }}>
                Especialistas em viagens Brasil-EUA há mais de 10 anos. 
                Conectamos brasileiros nos EUA ao Brasil com atendimento personalizado e preços exclusivos.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="https://wa.me/551151944717" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s'
                }}>
                  <ChatIcon style={{ width: '20px', height: '20px' }} />
                  WhatsApp 24/7
                </a>
                <a href="/contato" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'color 0.3s'
                }}>
                  <MailIcon style={{ width: '20px', height: '20px' }} />
                  Enviar Mensagem
                </a>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px',
                fontFamily: 'Poppins, sans-serif'
              }}>Nossos Serviços</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s'
                }}>✈️ Passagens Aéreas</Link>
                <Link href="/" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s'
                }}>🏨 Hotéis no Brasil</Link>
                <Link href="/" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s'
                }}>🚗 Aluguel de Carros</Link>
                <Link href="/" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s'
                }}>🗺️ Passeios e Tours</Link>
                <Link href="/" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.3s'
                }}>🛡️ Seguro Viagem</Link>
              </div>
            </div>

            <div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px',
                fontFamily: 'Poppins, sans-serif'
              }}>Suporte</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/como-funciona" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}>Como Funciona</Link>
                <Link href="/faq" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}>FAQ</Link>
                <Link href="/contato" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}>Contato</Link>
                <Link href="/sobre" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}>Sobre Nós</Link>
                <Link href="/blog" style={{
                  color: 'rgba(219, 234, 254, 1)',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}>Blog</Link>
              </div>
              
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>🔒 SSL Certificado</span>
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '600' }}>⭐ 4.9/5 Estrelas</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: 'rgba(147, 197, 253, 1)', fontSize: '14px', margin: 0 }}>&copy; 2024 Fly2Any. Todos os direitos reservados.</p>
              <p style={{ color: 'rgba(96, 165, 250, 1)', fontSize: '12px', margin: '4px 0 0 0' }}>Conectando brasileiros ao Brasil há mais de 10 anos.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/politica-privacidade" style={{
                color: 'rgba(147, 197, 253, 1)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.3s'
              }}>Política de Privacidade</Link>
              <Link href="/termos-uso" style={{
                color: 'rgba(147, 197, 253, 1)',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.3s'
              }}>Termos de Uso</Link>
              <span style={{ color: 'rgba(96, 165, 250, 1)', fontSize: '12px' }}>Feito com ❤️ para brasileiros</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
