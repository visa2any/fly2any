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
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
        paddingBottom: '80px'
      }}>
        <MobileNavigation currentPath="/" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}/>

        {/* Hero Section */}
        <div style={{ 
          padding: '16px 16px 0 16px',
          marginBottom: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            paddingTop: '8px'
          }}>
            <Logo size="lg" variant="logo-only" />
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '12px',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.3',
            textAlign: 'center',
            padding: '0 8px'
          }}>
            Sua Ponte para o Brasil
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '24px',
            lineHeight: '1.4',
            textAlign: 'center',
            padding: '0 8px'
          }}>
            Especialistas em viagens para brasileiros nos EUA há mais de 10 anos
          </p>
          
          {/* Key Benefits */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr', 
            gap: '12px', 
            marginBottom: '24px',
            padding: '0 8px'
          }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckIcon style={{ width: '20px', height: '20px', color: '#facc15' }} />
                <span style={{ 
                  fontSize: '14px',
                  color: 'white'
                }}>
                  {i === 0 && 'Cotação gratuita em 2 horas'}
                  {i === 1 && 'Atendimento 24h em português'}
                  {i === 2 && 'Melhores preços garantidos'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          margin: '0 20px 32px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '24px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            O que você precisa?
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr', 
            gap: '12px'
          }}>
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 16px',
                  borderRadius: '12px',
                  background: selectedService === service.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: 'white',
                  minHeight: '80px'
                }}
                onClick={() => setSelectedService(service.id)}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: service.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <service.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h3 style={{ 
                    fontSize: '16px',
                    fontWeight: '600', 
                    marginBottom: '4px',
                    color: 'white'
                  }}>
                    {service.name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    margin: 0
                  }}>
                    {service.id === 'voos' && 'Passagens aéreas Brasil-EUA'}
                    {service.id === 'hoteis' && 'Hospedagem no Brasil'}
                    {service.id === 'carros' && 'Aluguel de veículos'}
                    {service.id === 'passeios' && 'Tours e experiências'}
                    {service.id === 'seguro' && 'Proteção para viagem'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Routes */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          margin: '0 20px 32px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '24px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Rotas Populares
          </h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr', 
            gap: '12px'
          }}>
            <Link
              href="/voos-miami-sao-paulo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                color: 'white',
                minHeight: '80px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '600', 
                  marginBottom: '4px',
                  color: 'white'
                }}>
                  Miami → São Paulo
                </h3>
                <p style={{ 
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0
                }}>
                  A partir de $650
                </p>
              </div>
              <FlightIcon style={{ width: '20px', height: '20px', color: '#facc15' }} />
            </Link>

            <Link
              href="/voos-new-york-rio-janeiro"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                color: 'white',
                minHeight: '80px'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '600', 
                  marginBottom: '4px',
                  color: 'white'
                }}>
                  New York → Rio de Janeiro
                </h3>
                <p style={{ 
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0
                }}>
                  A partir de $720
                </p>
              </div>
              <FlightIcon style={{ width: '20px', height: '20px', color: '#facc15' }} />
            </Link>

            <Link
              href="/voos-brasil-eua"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(250, 204, 21, 0.2)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                color: 'white'
              }}
            >
              <span style={{ 
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Ver todas as rotas
              </span>
            </Link>
          </div>
        </div>

        {/* Social Proof */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          margin: '0 20px 32px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} style={{ width: '20px', height: '20px', color: '#facc15' }} />
              ))}
            </div>
            <p style={{ 
              fontSize: '16px',
              color: 'white', 
              fontWeight: '600',
              margin: 0
            }}>
              4.9/5 - Mais de 1.200 clientes satisfeitos
            </p>
          </div>
          
          <div style={{ 
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '16px'
          }}>
            <p style={{ 
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontStyle: 'italic',
              marginBottom: '8px'
            }}>
              &quot;Excelente atendimento! Conseguiram um preço incrível para minha viagem ao Brasil.&quot;
            </p>
            <p style={{ 
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0
            }}>
              - Maria Silva, Miami
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div style={{ 
          background: 'rgba(250, 204, 21, 0.1)', 
          border: '1px solid rgba(250, 204, 21, 0.3)',
          margin: '0 20px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '16px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Pronto para viajar?
          </h2>
          <p style={{ 
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Receba uma cotação personalizada em até 2 horas
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link 
              href="/cotacao/voos"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '8px',
                background: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              <FlightIcon style={{ width: '20px', height: '20px' }} />
              Solicitar Cotação
            </Link>
            
            <Link 
              href="/contato"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              <ChatIcon style={{ width: '20px', height: '20px' }} />
              Falar com Especialista
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
