'use client'

import { useState, useEffect } from 'react'
import { Shield, Clock, DollarSign, Phone, Award, CheckCircle } from 'lucide-react'

interface TrustBadge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: 'certification' | 'guarantee' | 'partnership' | 'service'
  color: string
}

const trustBadges: TrustBadge[] = [
  {
    id: 'iata',
    title: 'Membro IATA',
    description: 'Certificação internacional de agências de viagem',
    icon: <Award className="w-6 h-6" />,
    type: 'certification',
    color: 'blue'
  },
  {
    id: 'bbb',
    title: 'Better Business Bureau A+',
    description: 'Classificação máxima de confiabilidade',
    icon: <Shield className="w-6 h-6" />,
    type: 'certification', 
    color: 'green'
  },
  {
    id: 'google-partner',
    title: 'Google Partner',
    description: 'Parceiro certificado Google para publicidade',
    icon: <CheckCircle className="w-6 h-6" />,
    type: 'certification',
    color: 'blue'
  },
  {
    id: 'price-match',
    title: 'Garantia de Preço',
    description: 'Se achar mais barato, igualamos + 5% desconto',
    icon: <DollarSign className="w-6 h-6" />,
    type: 'guarantee',
    color: 'green'
  },
  {
    id: 'support-24h',
    title: 'Suporte 24h em Português',
    description: 'Atendimento brasileiro especializado',
    icon: <Phone className="w-6 h-6" />,
    type: 'service',
    color: 'blue'
  },
  {
    id: 'response-time',
    title: 'Resposta em 2h',
    description: 'Cotação garantida em até 2 horas',
    icon: <Clock className="w-6 h-6" />,
    type: 'service',
    color: 'orange'
  }
]

const partnerships = [
  { name: 'LATAM Airlines', logo: '🛫', description: 'Parceiro Oficial' },
  { name: 'American Airlines', logo: '✈️', description: 'Tarifas Especiais' },
  { name: 'United Airlines', logo: '🌎', description: 'Voos Diretos' },
  { name: 'JetBlue', logo: '💙', description: 'Conexões EUA' }
]

const guarantees = [
  '✅ Sem taxas ocultas',
  '✅ Cancelamento gratuito em 24h',
  '✅ Remarcação emergencial',
  '✅ Atendimento em português',
  '✅ Suporte para documentação',
  '✅ Parcelamento disponível'
]

export default function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getColorGradient = (color: string) => {
    const colorMap = {
      blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      orange: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section style={{
      background: '#f8fafc',
      padding: '60px 0'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            Por que brasileiros confiam na Fly2Any?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Certificações, parcerias e garantias que oferecem segurança total para sua viagem ao Brasil
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}>
          {trustBadges.map((badge, index) => (
            <div 
              key={badge.id}
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: badge.color === 'blue' ? '#3b82f6' : badge.color === 'green' ? '#10b981' : '#f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'white'
              }}>
                {badge.icon}
              </div>
              
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                {badge.title}
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>
                {badge.description}
              </p>
              
              {badge.type === 'guarantee' && (
                <div style={{
                  display: 'inline-block',
                  background: '#10b981',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Garantia
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Partnerships Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '48px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '32px'
          }}>
            Parcerias com as Melhores Companhias
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            {partnerships.map((partner, index) => (
              <div key={index} style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{partner.logo}</div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '4px'
                }}>
                  {partner.name}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>{partner.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees Section */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
          borderRadius: '12px',
          padding: '32px',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              Nossas Garantias para Brasileiros
            </h3>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Entendemos as necessidades específicas de brasileiros morando nos EUA
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            marginBottom: '32px'
          }}>
            {guarantees.map((guarantee, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <span style={{ fontSize: '16px' }}>{guarantee.split(' ')[0]}</span>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>{guarantee.substring(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Mais de 1.200 brasileiros já confiaram em nós
              </span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px' 
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '12px'
          }}>
            <Shield style={{ width: '14px', height: '14px' }} />
            <span>Seus dados estão protegidos com criptografia SSL 256-bit</span>
          </div>
        </div>
      </div>
    </section>
  )
}