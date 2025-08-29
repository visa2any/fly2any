'use client';
import React from 'react';
import Link from "next/link";
import { FlightIcon, PhoneIcon, ChatIcon } from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Sobre() {
  return (
    <>
      <GlobalMobileStyles />
      <ResponsiveHeader />
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        {/* Breadcrumbs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Breadcrumbs 
              items={[
                { label: 'Início', href: '/' },
                { label: 'Sobre' }
              ]} 
            />
          </div>
        </div>

        <div className="container-mobile spacing-mobile">
          <div style={{ maxWidth: '800px', margin: '0 auto' }} className="mobile-container">
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: 'white', 
                marginBottom: '16px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} className="mobile-heading">
                Sobre a Fly2Any
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: 'rgba(255,255,255,0.9)', 
                lineHeight: '1.6',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }} className="mobile-text">
                Sua agência de viagens especializada em conectar o Brasil ao mundo
              </p>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '16px', 
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }} className="mobile-card">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '16px'
              }}>
                Nossa História
              </h2>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.7', 
                marginBottom: '16px'
              }}>
                A Fly2Any nasceu da paixão por conectar pessoas aos seus destinos dos sonhos. 
                Somos uma agência de viagens brasileira especializada em voos nacionais e internacionais, 
                com foco em oferecer as melhores tarifas e um atendimento personalizado.
              </p>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.7'
              }}>
                Nossa missão é tornar sua viagem uma experiência única desde o primeiro contato, 
                oferecendo suporte completo antes, durante e após sua jornada.
              </p>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '16px', 
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }} className="mobile-card">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '16px'
              }}>
                Por que escolher a Fly2Any?
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ 
                    background: '#1e40af', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                      Melhores Preços
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Comparamos centenas de opções para encontrar as tarifas mais vantajosas
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ 
                    background: '#1e40af', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                      Atendimento 24/7
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Suporte completo via WhatsApp antes, durante e após sua viagem
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{ 
                    background: '#1e40af', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                      Experiência Comprovada
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                      Anos de experiência conectando brasileiros aos seus destinos favoritos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.95)', 
              borderRadius: '16px', 
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }} className="mobile-card">
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '16px'
              }}>
                Pronto para Viajar?
              </h2>
              <p style={{ 
                color: '#374151', 
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Entre em contato conosco e descubra como podemos tornar sua próxima viagem inesquecível.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contato" style={{
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  <ChatIcon style={{ width: '18px', height: '18px' }} />
                  Entre em Contato
                </Link>
                <Link href="/" style={{
                  background: 'white',
                  color: '#1e40af',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '2px solid #1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}>
                  <FlightIcon style={{ width: '18px', height: '18px' }} />
                  Buscar Voos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}