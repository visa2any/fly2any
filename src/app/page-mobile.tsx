'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { 
  FlightIcon, 
  HotelIcon, 
  CarIcon, 
  TourIcon, 
  InsuranceIcon,
  CheckIcon,
  StarIcon,
  ChatIcon
} from '@/components/Icons';
import Logo from '@/components/Logo';
import MobileNavigation from '@/components/MobileNavigation';

export default function HomeMobile() {
  const [selectedService, setSelectedService] = useState('voos');

  const services = [
    { id: 'voos', name: 'Voos', icon: FlightIcon, color: '#2563eb', href: '/cotacao/voos' },
    { id: 'hoteis', name: 'Hotéis', icon: HotelIcon, color: '#059669', href: '/cotacao/hoteis' },
    { id: 'carros', name: 'Carros', icon: CarIcon, color: '#dc2626', href: '/cotacao/carros' },
    { id: 'passeios', name: 'Passeios', icon: TourIcon, color: '#7c3aed', href: '/cotacao/passeios' },
    { id: 'seguro', name: 'Seguro', icon: InsuranceIcon, color: '#ea580c', href: '/cotacao/seguro' },
  ];

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div style={{ 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
        paddingBottom: 'env(safe-area-inset-bottom, 80px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <MobileNavigation currentPath="/" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}/>

        {/* Compact Hero Section */}
        <div style={{ 
          padding: '12px 20px 8px',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <Logo size="md" variant="logo-only" />
          <h1 style={{ 
            fontSize: '18px',
            fontWeight: '700', 
            color: 'white', 
            margin: '6px 0 4px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.2'
          }}>
            Sua Ponte para o Brasil
          </h1>
          <p style={{ 
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: 0,
            lineHeight: '1.3'
          }}>
            Especialistas em viagens • Cotação em 2h • 24/7 português
          </p>
        </div>

        {/* Services Grid - Main Content */}
        <div style={{ 
          flex: 1,
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h2 style={{ 
            fontSize: '16px',
            fontWeight: '600', 
            color: 'white', 
            margin: '0 0 12px',
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            O que você precisa?
          </h2>
          
          {/* Services Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px',
            marginBottom: '12px'
          }}>
            {services.slice(0, 4).map((service) => (
              <Link
                key={service.id}
                href={service.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  background: selectedService === service.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: 'white',
                  minHeight: '70px'
                }}
                onClick={() => setSelectedService(service.id)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: service.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <service.icon style={{ width: '18px', height: '18px', color: 'white' }} />
                </div>
                <span style={{ 
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {service.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Featured Service - Seguro */}
          <Link
            href={services[4].href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: selectedService === services[4].id ? 'rgba(234, 88, 12, 0.3)' : 'rgba(234, 88, 12, 0.2)',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              color: 'white',
              marginBottom: '12px'
            }}
            onClick={() => setSelectedService(services[4].id)}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: services[4].color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <services[4].icon style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3 style={{ 
                fontSize: '14px',
                fontWeight: '600', 
                margin: '0 0 2px',
                color: 'white'
              }}>
                {services[4].name}
              </h3>
              <p style={{ 
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0
              }}>
                Proteção para viagem
              </p>
            </div>
          </Link>
        </div>

          {/* Compact Actions */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: 'auto',
            paddingBottom: '8px'
          }}>
            {/* Social Proof Badge */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} style={{ width: '12px', height: '12px', color: '#facc15' }} />
                ))}
              </div>
              <span style={{ 
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '500'
              }}>
                4.9/5 • 1.200+ clientes
              </span>
            </div>

            {/* Main CTA - BUSCAR OFERTAS GRATIS */}
            <Link 
              href="/cotacao/voos"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                color: '#1f2937',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)',
                border: 'none'
              }}
            >
              <FlightIcon style={{ width: '18px', height: '18px', color: '#1f2937' }} />
              BUSCAR OFERTAS GRÁTIS
            </Link>
            
            {/* Secondary Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link 
                href="/voos-brasil-eua"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '12px'
                }}
              >
                Ver Rotas
              </Link>
              
              <Link 
                href="/contato"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '12px'
                }}
              >
                <ChatIcon style={{ width: '14px', height: '14px' }} />
                Contato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
