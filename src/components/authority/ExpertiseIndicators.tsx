'use client'

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  User,
  Eye,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Award,
  Globe,
  TrendingUp
} from 'lucide-react';

interface ContentMetadata {
  publishDate: string;
  lastUpdated: string;
  author: string;
  reviewer?: string;
  readTime: number;
  views: number;
  sources: Source[];
  factChecked: boolean;
  expertise: ExpertiseLevel;
  lastFactCheck?: string;
}

interface Source {
  title: string;
  url: string;
  organization: string;
  credibility: 'high' | 'medium' | 'low';
  publishDate: string;
}

interface ExpertiseLevel {
  level: 'beginner' | 'intermediate' | 'expert' | 'authority';
  yearsExperience: number;
  credentials: string[];
  specializations: string[];
}

interface ExpertiseIndicatorsProps {
  metadata: ContentMetadata;
  compact?: boolean;
  showSources?: boolean;
}

const defaultMetadata: ContentMetadata = {
  publishDate: '2025-01-15',
  lastUpdated: '2025-01-20',
  author: 'Ricardo Silva',
  reviewer: 'Maria Santos',
  readTime: 8,
  views: 12547,
  factChecked: true,
  lastFactCheck: '2025-01-20',
  expertise: {
    level: 'expert',
    yearsExperience: 12,
    credentials: ['Certificação IATA', 'Especialista BRAZTOA'],
    specializations: ['Viagens Brasil-EUA', 'Tarifas internacionais', 'Documentação']
  },
  sources: [
    {
      title: 'ANAC - Regulamentação de Voos Internacionais',
      url: 'https://anac.gov.br',
      organization: 'Agência Nacional de Aviação Civil',
      credibility: 'high',
      publishDate: '2024-12-15'
    },
    {
      title: 'IATA - Tarifas e Regulamentações 2025',
      url: 'https://iata.org',
      organization: 'International Air Transport Association',
      credibility: 'high',
      publishDate: '2025-01-10'
    },
    {
      title: 'Consulado Brasileiro - Documentos para Viagem',
      url: 'https://miami.itamaraty.gov.br',
      organization: 'Ministério das Relações Exteriores',
      credibility: 'high',
      publishDate: '2024-11-20'
    }
  ]
};

export default function ExpertiseIndicators({ 
  metadata = defaultMetadata, 
  compact = false, 
  showSources = true 
}: ExpertiseIndicatorsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'authority': return '#8b5cf6';
      case 'expert': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'beginner': return '#64748b';
      default: return '#64748b';
    }
  };

  const getExpertiseLabel = (level: string) => {
    switch (level) {
      case 'authority': return 'Autoridade no Assunto';
      case 'expert': return 'Especialista';
      case 'intermediate': return 'Intermediário';
      case 'beginner': return 'Iniciante';
      default: return 'Não especificado';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <User className="w-3 h-3" />
          {metadata.author}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <Calendar className="w-3 h-3" />
          {formatDate(metadata.publishDate)}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
          <Clock className="w-3 h-3" />
          {metadata.readTime} min leitura
        </div>
        
        {metadata.factChecked && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#10b981'
          }}>
            <CheckCircle className="w-3 h-3" />
            Verificado
          </div>
        )}
        
        <div style={{
          background: getExpertiseColor(metadata.expertise.level),
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          fontWeight: '500'
        }}>
          {getExpertiseLabel(metadata.expertise.level)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        color: 'white',
        padding: '16px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0
          }}>
            Indicadores de Autoridade do Conteúdo
          </h3>
          
          {metadata.factChecked && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              <CheckCircle className="w-3 h-3" />
              Verificado
            </div>
          )}
        </div>
        
        <p style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.9)',
          margin: 0
        }}>
          Este conteúdo foi criado e verificado por especialistas certificados
        </p>
      </div>

      {/* Content Metadata */}
      <div style={{ padding: '20px' }}>
        {/* Author & Expertise */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <User className="w-4 h-4 text-blue-600" />
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Autor Especialista
              </h4>
            </div>
            
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#3b82f6',
              marginBottom: '4px'
            }}>
              {metadata.author}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                background: getExpertiseColor(metadata.expertise.level),
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {getExpertiseLabel(metadata.expertise.level)}
              </div>
              
              <span style={{
                fontSize: '12px',
                color: '#64748b'
              }}>
                {metadata.expertise.yearsExperience} anos de experiência
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              {metadata.expertise.credentials.slice(0, 2).map((cert, index) => (
                <span
                  key={index}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '9px',
                    fontWeight: '500'
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
          
          {/* Content Stats */}
          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Estatísticas do Conteúdo
              </h4>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#3b82f6'
                }}>
                  {metadata.views.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  Visualizações
                </div>
              </div>
              
              <div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {metadata.readTime} min
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  Tempo de leitura
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Publication & Update Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
          padding: '16px',
          background: '#f1f5f9',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#475569'
          }}>
            <Calendar className="w-4 h-4" />
            <div>
              <strong>Publicado:</strong> {formatDate(metadata.publishDate)}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#475569'
          }}>
            <RefreshCw className="w-4 h-4" />
            <div>
              <strong>Atualizado:</strong> {formatDate(metadata.lastUpdated)}
            </div>
          </div>
          
          {metadata.reviewer && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#475569'
            }}>
              <CheckCircle className="w-4 h-4" />
              <div>
                <strong>Revisado por:</strong> {metadata.reviewer}
              </div>
            </div>
          )}
          
          {metadata.lastFactCheck && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#10b981'
            }}>
              <Award className="w-4 h-4" />
              <div>
                <strong>Verificado em:</strong> {formatDate(metadata.lastFactCheck)}
              </div>
            </div>
          )}
        </div>

        {/* Specializations */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BookOpen className="w-4 h-4" />
            Especializações do Autor
          </h4>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            {metadata.expertise.specializations.map((spec, index) => (
              <span
                key={index}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Sources Section */}
        {showSources && metadata.sources.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Globe className="w-4 h-4" />
                Fontes e Referências ({metadata.sources.length})
              </h4>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isExpanded ? 'Ocultar' : 'Ver todas'}
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: isExpanded ? 'none' : '200px',
              overflow: isExpanded ? 'visible' : 'hidden'
            }}>
              {metadata.sources.map((source, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: getCredibilityColor(source.credibility),
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0
                  }} />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <h5 style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#1e293b',
                        margin: 0,
                        flex: 1
                      }}>
                        {source.title}
                      </h5>
                      
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          flexShrink: 0
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontWeight: '500' }}>{source.organization}</span>
                      <span>•</span>
                      <span>{formatDate(source.publishDate)}</span>
                    </div>
                    
                    <div style={{
                      display: 'inline-block',
                      background: getCredibilityColor(source.credibility),
                      color: 'white',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      Credibilidade {source.credibility === 'high' ? 'Alta' : source.credibility === 'medium' ? 'Média' : 'Baixa'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Notice */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div style={{ fontSize: '12px', color: '#166534' }}>
            <strong>Conteúdo verificado:</strong> Este artigo foi escrito por especialistas certificados e suas informações foram verificadas com fontes oficiais em {formatDate(metadata.lastFactCheck || metadata.lastUpdated)}.
          </div>
        </div>
      </div>
    </div>
  );
}