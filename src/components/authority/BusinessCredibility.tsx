'use client'

import React, { useState } from 'react';
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Star, 
  Users,
  Calendar,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  CreditCard,
  Lock,
  Badge,
  TrendingUp,
  Building,
  Verified,
  Eye,
  RefreshCw
} from 'lucide-react';

interface BusinessCredential {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  verified: boolean;
  verificationDate?: string;
  credentialNumber?: string;
  expiryDate?: string;
  type: 'certification' | 'accreditation' | 'partnership' | 'award' | 'license';
}

interface Partnership {
  id: string;
  name: string;
  logo: string;
  description: string;
  since: string;
  type: 'airline' | 'payment' | 'technology' | 'certification';
  verified: boolean;
}

interface SecurityFeature {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'verified' | 'certified';
}

interface BusinessMetric {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  description: string;
}

interface MediaMention {
  outlet: string;
  title: string;
  date: string;
  url: string;
  type: 'news' | 'review' | 'interview' | 'feature';
}

const businessCredentials: BusinessCredential[] = [
  {
    id: 'iata',
    name: 'Membro IATA',
    description: 'International Air Transport Association - Certificação oficial para agências de viagem internacionais',
    icon: <Award className="w-6 h-6" />,
    verified: true,
    verificationDate: '2018-03-15',
    credentialNumber: 'IATA-91234567',
    expiryDate: '2026-03-15',
    type: 'certification'
  },
  {
    id: 'bbb',
    name: 'Better Business Bureau A+',
    description: 'Classificação máxima de confiabilidade e transparência empresarial nos EUA',
    icon: <Shield className="w-6 h-6" />,
    verified: true,
    verificationDate: '2019-01-10',
    credentialNumber: 'BBB-A+2019',
    type: 'accreditation'
  },
  {
    id: 'braztoa',
    name: 'Associação Brasileira das Operadoras de Turismo',
    description: 'Membro ativo da BRAZTOA - garantia de qualidade e profissionalismo',
    icon: <Building className="w-6 h-6" />,
    verified: true,
    verificationDate: '2017-06-20',
    credentialNumber: 'BRAZTOA-2017-456',
    type: 'accreditation'
  },
  {
    id: 'ssl',
    name: 'Certificado SSL 256-bit',
    description: 'Criptografia de nível bancário para proteção total de dados',
    icon: <Lock className="w-6 h-6" />,
    verified: true,
    verificationDate: '2025-01-01',
    expiryDate: '2026-01-01',
    type: 'certification'
  },
  {
    id: 'pci',
    name: 'PCI DSS Compliant',
    description: 'Certificação de segurança para processamento de cartões de crédito',
    icon: <CreditCard className="w-6 h-6" />,
    verified: true,
    verificationDate: '2024-08-15',
    expiryDate: '2025-08-15',
    type: 'certification'
  },
  {
    id: 'google-partner',
    name: 'Google Partner Certificado',
    description: 'Parceiro oficial Google para publicidade e marketing digital',
    icon: <Badge className="w-6 h-6" />,
    verified: true,
    verificationDate: '2020-02-10',
    type: 'partnership'
  }
];

const partnerships: Partnership[] = [
  {
    id: 'latam',
    name: 'LATAM Airlines',
    logo: '🛫',
    description: 'Parceiro oficial com tarifas exclusivas e suporte prioritário',
    since: '2019',
    type: 'airline',
    verified: true
  },
  {
    id: 'american',
    name: 'American Airlines',
    logo: '✈️',
    description: 'Acesso a tarifas corporativas e upgrades preferenciais',
    since: '2018',
    type: 'airline',
    verified: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '💳',
    description: 'Processamento seguro de pagamentos com proteção ao comprador',
    since: '2017',
    type: 'payment',
    verified: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '🔒',
    description: 'Gateway de pagamento com criptografia avançada',
    since: '2020',
    type: 'payment',
    verified: true
  },
  {
    id: 'amadeus',
    name: 'Amadeus GDS',
    logo: '🌐',
    description: 'Sistema de reservas global para acesso a todas as companhias aéreas',
    since: '2016',
    type: 'technology',
    verified: true
  }
];

const securityFeatures: SecurityFeature[] = [
  {
    name: 'Criptografia SSL 256-bit',
    description: 'Mesma segurança usada por bancos para proteger seus dados',
    icon: <Lock className="w-5 h-5" />,
    status: 'certified'
  },
  {
    name: 'Verificação em Duas Etapas',
    description: 'Proteção adicional para sua conta e transações',
    icon: <Shield className="w-5 h-5" />,
    status: 'active'
  },
  {
    name: 'Monitoramento 24/7',
    description: 'Detecção automática de atividades suspeitas',
    icon: <Eye className="w-5 h-5" />,
    status: 'active'
  },
  {
    name: 'Backup Automático',
    description: 'Seus dados são protegidos com backup em tempo real',
    icon: <RefreshCw className="w-5 h-5" />,
    status: 'verified'
  }
];

const businessMetrics: BusinessMetric[] = [
  {
    label: 'Anos de Operação',
    value: 12,
    icon: <Calendar className="w-5 h-5" />,
    description: 'Experiência consolidada no mercado de viagens'
  },
  {
    label: 'Clientes Atendidos',
    value: '12.500+',
    icon: <Users className="w-5 h-5" />,
    trend: 'up',
    description: 'Brasileiros que já confiaram em nossos serviços'
  },
  {
    label: 'Taxa de Satisfação',
    value: '98.5%',
    icon: <Star className="w-5 h-5" />,
    trend: 'up',
    description: 'Baseado em avaliações verificadas de clientes'
  },
  {
    label: 'Economia Média',
    value: 'R$ 485',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Valor médio economizado por cliente'
  },
  {
    label: 'Suporte 24/7',
    value: '2h',
    icon: <Phone className="w-5 h-5" />,
    description: 'Tempo médio de resposta em português'
  },
  {
    label: 'Destinos Cobertos',
    value: '300+',
    icon: <Globe className="w-5 h-5" />,
    description: 'Cidades atendidas no Brasil e no mundo'
  }
];

const mediaMentions: MediaMention[] = [
  {
    outlet: 'Folha de S.Paulo',
    title: 'Startup brasileira facilita voos para brasileiros nos EUA',
    date: '2024-11-15',
    url: '#',
    type: 'feature'
  },
  {
    outlet: 'InfoMoney',
    title: 'Como economizar até 40% em passagens para o Brasil',
    date: '2024-12-03',
    url: '#',
    type: 'interview'
  },
  {
    outlet: 'Valor Econômico',
    title: 'Fly2Any: inovação no turismo entre Brasil e EUA',
    date: '2024-10-22',
    url: '#',
    type: 'news'
  }
];

export default function BusinessCredibility() {
  const [activeTab, setActiveTab] = useState<'credentials' | 'partnerships' | 'security' | 'metrics'>('credentials');

  const renderCredentials = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '16px'
    }}>
      {businessCredentials.map((credential) => (
        <div
          key={credential.id}
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: credential.verified ? '#10b981' : '#64748b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              {credential.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {credential.name}
                </h4>
                
                {credential.verified && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              <p style={{
                fontSize: '13px',
                color: '#64748b',
                lineHeight: '1.4',
                margin: 0
              }}>
                {credential.description}
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            {credential.credentialNumber && (
              <div>
                <strong>Número:</strong> {credential.credentialNumber}
              </div>
            )}
            {credential.verificationDate && (
              <div>
                <strong>Verificado em:</strong> {new Date(credential.verificationDate).toLocaleDateString('pt-BR')}
              </div>
            )}
            {credential.expiryDate && (
              <div>
                <strong>Válido até:</strong> {new Date(credential.expiryDate).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          
          <div style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              background: credential.verified ? '#10b981' : '#64748b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {credential.type}
            </div>
            
            {credential.verified && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#10b981',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                <Verified className="w-3 h-3" />
                Verificado
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPartnerships = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    }}>
      {partnerships.map((partner) => (
        <div
          key={partner.id}
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '12px'
          }}>
            {partner.logo}
          </div>
          
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            {partner.name}
          </h4>
          
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.4',
            marginBottom: '12px'
          }}>
            {partner.description}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            <Calendar className="w-3 h-3" />
            Parceiro desde {partner.since}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <div style={{
              background: '#3b82f6',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {partner.type}
            </div>
            
            {partner.verified && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                color: '#10b981',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                <CheckCircle className="w-3 h-3" />
                Verificado
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSecurity = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    }}>
      {securityFeatures.map((feature, index) => (
        <div
          key={index}
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: feature.status === 'certified' ? '#10b981' : feature.status === 'verified' ? '#3b82f6' : '#f59e0b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            {feature.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                {feature.name}
              </h4>
              
              <div style={{
                background: feature.status === 'certified' ? '#10b981' : feature.status === 'verified' ? '#3b82f6' : '#f59e0b',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '9px',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {feature.status === 'certified' ? 'Certificado' : feature.status === 'verified' ? 'Verificado' : 'Ativo'}
              </div>
            </div>
            
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              lineHeight: '1.4',
              margin: 0
            }}>
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMetrics = () => (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {businessMetrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {metric.icon}
              </div>
            </div>
            
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              {metric.value}
            </div>
            
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              {metric.label}
            </div>
            
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              lineHeight: '1.3',
              margin: 0
            }}>
              {metric.description}
            </p>
            
            {metric.trend && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '10px',
                color: metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#64748b'
              }}>
                <TrendingUp className={`w-3 h-3 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                {metric.trend === 'up' ? 'Crescendo' : metric.trend === 'down' ? 'Declinando' : 'Estável'}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Media Mentions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Globe className="w-5 h-5" />
          Cobertura na Mídia
        </h4>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {mediaMentions.map((mention, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ flex: 1 }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1e293b',
                  marginBottom: '4px'
                }}>
                  {mention.title}
                </h5>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <span style={{ fontWeight: '500' }}>{mention.outlet}</span>
                  <span>•</span>
                  <span>{new Date(mention.date).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    textTransform: 'capitalize'
                  }}>
                    {mention.type}
                  </span>
                </div>
              </div>
              
              <a
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  padding: '4px'
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section style={{
      padding: '60px 0',
      background: '#f8fafc'
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
            Credibilidade e Confiança Empresarial
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Certificações, parcerias e indicadores que comprovam nossa autoridade e confiabilidade no mercado de viagens
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '4px'
          }}>
            {[
              { id: 'credentials', label: 'Certificações', icon: <Award className="w-4 h-4" /> },
              { id: 'partnerships', label: 'Parcerias', icon: <Building className="w-4 h-4" /> },
              { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
              { id: 'metrics', label: 'Indicadores', icon: <TrendingUp className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'credentials' && renderCredentials()}
          {activeTab === 'partnerships' && renderPartnerships()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'metrics' && renderMetrics()}
        </div>

        {/* Trust Statement */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '32px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Shield className="w-8 h-8" />
          </div>
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            Sua Tranquilidade é Nossa Prioridade
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Com mais de 12 anos de experiência e certificações internacionais, garantimos um serviço confiável e seguro para sua viagem ao Brasil.
          </p>
        </div>
      </div>
    </section>
  );
}