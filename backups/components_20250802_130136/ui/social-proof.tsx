'use client'

import { useEffect, useState } from 'react'
import { Star, MapPin, Clock, CheckCircle } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  location: string
  city: string
  rating: number
  comment: string
  saved: string
  date: string
  avatar: string
  route: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    location: 'Orlando, FL',
    city: 'São Paulo',
    rating: 5,
    comment: 'Economizei muito na passagem para visitar minha família. Atendimento excelente em português!',
    saved: 'R$ 450',
    date: 'há 3 dias',
    avatar: 'MS',
    route: 'Orlando → São Paulo'
  },
  {
    id: '2', 
    name: 'João Santos',
    location: 'Miami, FL',
    city: 'Rio de Janeiro',
    rating: 5,
    comment: 'Consegui viajar na emergência familiar com preço justo. Recomendo demais!',
    saved: 'R$ 680',
    date: 'há 1 semana',
    avatar: 'JS',
    route: 'Miami → Rio de Janeiro'
  },
  {
    id: '3',
    name: 'Ana Costa',
    location: 'New York, NY', 
    city: 'Belo Horizonte',
    rating: 5,
    comment: 'Perfeito para o Natal em família. Processo rápido e preços honestos.',
    saved: 'R$ 520',
    date: 'há 2 semanas',
    avatar: 'AC',
    route: 'New York → Belo Horizonte'
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    location: 'Boston, MA',
    city: 'Salvador',
    rating: 5,
    comment: 'Já é a terceira vez que uso. Sempre encontram os melhores preços!',
    saved: 'R$ 390',
    date: 'há 5 dias',
    avatar: 'CO',
    route: 'Boston → Salvador'
  }
]

const stats = [
  { label: 'Brasileiros atendidos', value: 1247, suffix: '+' },
  { label: 'Economia média', value: 485, prefix: 'R$ ', suffix: '' },
  { label: 'Satisfação', value: 98, suffix: '%' },
  { label: 'Tempo médio de resposta', value: 2, suffix: 'h' }
]

export default function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [liveCounter, setLiveCounter] = useState(1247)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    const counterInterval = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 3))
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(counterInterval)
    }
  }, [])

  return (
    <section style={{
      padding: '60px 0',
      background: '#ffffff'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 32px'
      }}>
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
            Brasileiros nos EUA confiam na Fly2Any
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Mais de 1.200 brasileiros já economizaram nas passagens para o Brasil
          </p>
        </div>

        {/* Stats Counter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#3b82f6',
                marginBottom: '4px'
              }}>
                {stat.prefix}
                {index === 0 ? liveCounter : stat.value}
                {stat.suffix}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {testimonials[currentTestimonial].avatar}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {testimonials[currentTestimonial].name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} style={{
                      width: '14px',
                      height: '14px',
                      color: '#fbbf24',
                      fill: '#fbbf24'
                    }} />
                  ))}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin style={{ width: '12px', height: '12px' }} />
                  {testimonials[currentTestimonial].location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '12px', height: '12px' }} />
                  {testimonials[currentTestimonial].date}
                </div>
              </div>
              
              <p style={{
                fontSize: '14px',
                color: '#475569',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>
                "{testimonials[currentTestimonial].comment}"
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <span style={{ fontWeight: '500' }}>Rota:</span> {testimonials[currentTestimonial].route}
                </div>
                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  Economizou {testimonials[currentTestimonial].saved}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <div key={testimonial.id} style={{
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {testimonial.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>{testimonial.name}</h5>
                  <p style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}>{testimonial.location}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} style={{
                      width: '12px',
                      height: '12px',
                      color: '#fbbf24',
                      fill: '#fbbf24'
                    }} />
                  ))}
                </div>
              </div>
              
              <p style={{
                fontSize: '13px',
                color: '#475569',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>"{testimonial.comment}"</p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ color: '#64748b' }}>{testimonial.route}</span>
                <span style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  Economizou {testimonial.saved}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Activity */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              background: '#10b981',
              borderRadius: '50%'
            }} />
            <span style={{
              fontSize: '12px',
              color: '#475569',
              fontWeight: '500'
            }}>
              3 brasileiros compraram passagens na última hora
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}