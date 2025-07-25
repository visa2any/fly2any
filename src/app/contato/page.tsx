import type { Metadata } from "next";
import Link from "next/link";
import { FlightIcon, HotelIcon, CarIcon, TourIcon, InsuranceIcon, PhoneIcon, MailIcon, ChatIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import NewsletterCapture from '@/components/NewsletterCapture';

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
    <>
      <GlobalMobileStyles />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
      <ResponsiveHeader />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 48px' }} className="mobile-container">
        <div style={{ maxWidth: '896px', margin: '0 auto' }} className="mobile-container">
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
                  <div style={{ color: 'rgb(5, 150, 105)', background: 'rgb(187, 247, 208)', padding: '8px', borderRadius: '50%' }} className="mobile-section">
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
                  <div style={{ color: 'rgb(124, 58, 237)', background: 'rgb(243, 232, 255)', padding: '8px', borderRadius: '50%' }} className="mobile-section">
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

              <div style={{ marginTop: '32px', padding: '24px', background: 'rgb(239, 246, 255)', borderRadius: '8px' }} className="mobile-section">
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
              <div style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
                  Solicite um Orçamento
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Link 
                    href="/cotacao/voos" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(37, 99, 235)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }} className="mobile-section"
                  >
                    <FlightIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Voos
                  </Link>
                  
                  <Link 
                    href="/cotacao/hoteis" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(5, 150, 105)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }} className="mobile-section"
                  >
                    <HotelIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Hotéis
                  </Link>
                  
                  <Link 
                    href="/cotacao/carros" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(234, 88, 12)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }} className="mobile-section"
                  >
                    <CarIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Carros
                  </Link>
                  
                  <Link 
                    href="/cotacao/passeios" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(124, 58, 237)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }} className="mobile-section"
                  >
                    <TourIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Passeios
                  </Link>
                  
                  <Link 
                    href="/cotacao/seguro" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgb(13, 148, 136)', color: 'white', fontWeight: '700', padding: '16px 24px', borderRadius: '8px', transition: 'background-color 0.3s', textAlign: 'center', textDecoration: 'none' }} className="mobile-section"
                  >
                    <InsuranceIcon style={{ width: '12px', height: '12px' }} />
                    Cotar Seguro
                  </Link>
                </div>

                <div style={{ marginTop: '32px', padding: '16px', background: 'rgb(254, 249, 195)', border: '1px solid rgb(253, 230, 138)', borderRadius: '8px' }} className="mobile-section">
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

          <div style={{ marginTop: '48px', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '24px', padding: '32px', transition: 'all 0.3s ease', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }} className="mobile-section">
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

          {/* Newsletter Capture Section */}
          <div style={{ marginTop: '64px' }}>
            <NewsletterCapture variant="vertical" showWhatsApp={true} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
