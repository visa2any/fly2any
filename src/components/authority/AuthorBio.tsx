'use client'

import React from 'react';
import { 
  User, 
  MapPin, 
  Calendar,
  Award,
  Plane,
  Globe,
  Star,
  ExternalLink,
  Linkedin,
  Twitter,
  Mail,
  Phone
} from 'lucide-react';

interface AuthorCredential {
  title: string;
  organization: string;
  year: string;
  verified: boolean;
}

interface AuthorExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
  followers?: string;
}

interface AuthorProps {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  location: string;
  yearsOfExperience: number;
  specializations: string[];
  credentials: AuthorCredential[];
  experience: AuthorExperience[];
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone?: string;
  languages: string[];
  achievements: string[];
  publishedArticles: number;
  clientsHelped: number;
  rating: number;
  reviewCount: number;
  lastActive: string;
  compact?: boolean;
}

const defaultAuthor: AuthorProps = {
  id: 'ricardo-silva',
  name: 'Ricardo Silva',
  title: 'Especialista em Viagens Brasil-EUA',
  bio: 'Especialista certificado em viagens internacionais com mais de 12 anos de experiência ajudando brasileiros a encontrar as melhores ofertas de voos para o Brasil. Formado em Turismo pela USP e certificado pela IATA.',
  avatar: 'RS',
  location: 'Miami, FL',
  yearsOfExperience: 12,
  specializations: [
    'Viagens Brasil-EUA',
    'Tarifas promocionais',
    'Documentação de viagem',
    'Conexões internacionais',
    'Programa de milhas'
  ],
  credentials: [
    {
      title: 'Certificação IATA',
      organization: 'International Air Transport Association',
      year: '2018',
      verified: true
    },
    {
      title: 'Especialista em Turismo Internacional',
      organization: 'BRAZTOA',
      year: '2016',
      verified: true
    },
    {
      title: 'Bacharel em Turismo',
      organization: 'Universidade de São Paulo (USP)',
      year: '2012',
      verified: true
    }
  ],
  experience: [
    {
      role: 'Consultor Sênior de Viagens',
      company: 'Fly2Any Travel',
      duration: '2018 - Presente',
      description: 'Especialização em rotas Brasil-EUA, análise de tarifas e otimização de viagens para comunidade brasileira'
    },
    {
      role: 'Agente de Viagens Internacional',
      company: 'CVC Corp',
      duration: '2015 - 2018',
      description: 'Responsável por viagens corporativas e pacotes internacionais para o mercado americano'
    }
  ],
  socialLinks: [
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/ricardo-silva-travel',
      icon: <Linkedin className="w-4 h-4" />,
      followers: '2.1k'
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/ricardofly2any',
      icon: <Twitter className="w-4 h-4" />,
      followers: '1.8k'
    }
  ],
  contactEmail: 'ricardo@fly2any.com',
  contactPhone: '+1 (305) 555-0123',
  languages: ['Português', 'English', 'Español'],
  achievements: [
    'Mais de 5.000 brasileiros atendidos',
    'Economia média de R$ 450 por cliente',
    'Avaliação 4.9/5 estrelas',
    'Especialista certificado IATA',
    'Colunista em portal de viagens'
  ],
  publishedArticles: 127,
  clientsHelped: 5247,
  rating: 4.9,
  reviewCount: 1834,
  lastActive: '2 horas atrás'
};

export default function AuthorBio({ author = defaultAuthor, compact = false }: { author?: AuthorProps; compact?: boolean }) {
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {author.avatar}
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '2px'
          }}>
            {author.name}
          </h4>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            {author.title}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin className="w-3 h-3" />
              {author.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              {author.rating} ({author.reviewCount})
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: '#10b981',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <Award className="w-3 h-3" />
          Certificado IATA
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '12px',
      padding: '32px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      marginBottom: '32px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {author.avatar}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              {author.name}
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#10b981',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              <Award className="w-4 h-4" />
              Especialista Certificado
            </div>
          </div>
          
          <p style={{
            fontSize: '18px',
            color: '#3b82f6',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            {author.title}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin className="w-4 h-4" />
              {author.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar className="w-4 h-4" />
              {author.yearsOfExperience} anos de experiência
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe className="w-4 h-4" />
              {author.languages.join(', ')}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(author.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                marginLeft: '4px'
              }}>
                {author.rating} ({author.reviewCount.toLocaleString()} avaliações)
              </span>
            </div>
          </div>
          
          <p style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: '1.6',
            marginBottom: '16px'
          }}>
            {author.bio}
          </p>
          
          {/* Contact Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <a 
              href={`mailto:${author.contactEmail}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              <Mail className="w-4 h-4" />
              {author.contactEmail}
            </a>
            
            {author.contactPhone && (
              <a 
                href={`tel:${author.contactPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <Phone className="w-4 h-4" />
                {author.contactPhone}
              </a>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {author.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontSize: '12px',
                    padding: '4px 8px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                >
                  {link.icon}
                  {link.followers}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#3b82f6',
            marginBottom: '4px'
          }}>
            {author.clientsHelped.toLocaleString()}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Brasileiros Atendidos
          </div>
        </div>
        
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#10b981',
            marginBottom: '4px'
          }}>
            {author.publishedArticles}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Artigos Publicados
          </div>
        </div>
        
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#f59e0b',
            marginBottom: '4px'
          }}>
            {author.yearsOfExperience}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Anos de Experiência
          </div>
        </div>
        
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ef4444',
            marginBottom: '4px'
          }}>
            R$ 450
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Economia Média/Cliente
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          Especializações
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          {author.specializations.map((spec, index) => (
            <span
              key={index}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          Certificações e Credenciais
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {author.credentials.map((cred, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: cred.verified ? '#10b981' : '#64748b',
                borderRadius: '50%',
                flexShrink: 0
              }}>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '2px'
                }}>
                  {cred.title}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {cred.organization} • {cred.year}
                </p>
              </div>
              {cred.verified && (
                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  Verificado
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          Principais Conquistas
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {author.achievements.map((achievement, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#475569'
              }}
            >
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              {achievement}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Status */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#10b981',
            borderRadius: '50%'
          }} />
          Ativo {author.lastActive}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#10b981'
        }}>
          <span>Resposta garantida em 2h</span>
        </div>
      </div>
    </div>
  );
}