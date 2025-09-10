'use client'

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Calendar,
  MapPin,
  Verified,
  User,
  Plane,
  DollarSign,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Flag,
  Heart,
  Quote
} from 'lucide-react';

interface CustomerReview {
  id: string;
  customerName: string;
  customerLocation: string;
  customerInitials: string;
  rating: number;
  title: string;
  comment: string;
  route: string;
  savedAmount: string;
  travelDate: string;
  reviewDate: string;
  verified: boolean;
  helpful: number;
  category: 'flight' | 'service' | 'price' | 'overall';
  tags: string[];
  photos?: string[];
  response?: {
    author: string;
    date: string;
    message: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  categories: {
    service: number;
    price: number;
    communication: number;
    reliability: number;
    overall: number;
  };
}

const sampleReviews: CustomerReview[] = [
  {
    id: '1',
    customerName: 'Maria Silva Santos',
    customerLocation: 'Orlando, FL',
    customerInitials: 'MS',
    rating: 5,
    title: 'Economizei muito na passagem para visitar minha família!',
    comment: 'Excelente atendimento em português! O Ricardo me ajudou a encontrar uma passagem com ótimo preço para São Paulo. Consegui economizar quase R$ 500 comparado com outras agências. O suporte foi rápido e sempre disponível. Recomendo demais para todos os brasileiros aqui na Flórida.',
    route: 'Orlando → São Paulo',
    savedAmount: 'R$ 485',
    travelDate: '2024-12-15',
    reviewDate: '2024-12-20',
    verified: true,
    helpful: 23,
    category: 'overall',
    tags: ['Atendimento excelente', 'Preço justo', 'Suporte em português', 'Economia'],
    response: {
      author: 'Ricardo Silva - Fly2Any',
      date: '2024-12-21',
      message: 'Muito obrigado Maria! Foi um prazer ajudá-la a reencontrar a família. Estamos sempre aqui para nossos conterrâneos brasileiros. Boa viagem!'
    }
  },
  {
    id: '2',
    customerName: 'João Carlos Oliveira',
    customerLocation: 'Miami, FL',
    customerInitials: 'JO',
    rating: 5,
    title: 'Perfeito para emergência familiar',
    comment: 'Precisei viajar urgente para o Rio devido a uma emergência familiar. A equipe da Fly2Any conseguiu me encontrar um voo no mesmo dia com preço justo. O atendimento foi humanizado e compreensivo. Muito grato pelo profissionalismo e rapidez.',
    route: 'Miami → Rio de Janeiro',
    savedAmount: 'R$ 320',
    travelDate: '2024-11-28',
    reviewDate: '2024-12-02',
    verified: true,
    helpful: 18,
    category: 'service',
    tags: ['Urgência', 'Atendimento humanizado', 'Rapidez', 'Profissionalismo']
  },
  {
    id: '3',
    customerName: 'Ana Paula Costa',
    customerLocation: 'New York, NY',
    customerInitials: 'AC',
    rating: 5,
    title: 'Terceira vez que uso - sempre excelente!',
    comment: 'Já é a terceira viagem que faço usando a Fly2Any. Sempre conseguem preços melhores que as outras agências, e o atendimento em português faz toda diferença. Desta vez economizei R$ 520 na passagem para Belo Horizonte. Vou continuar recomendando!',
    route: 'New York → Belo Horizonte',
    savedAmount: 'R$ 520',
    travelDate: '2024-12-22',
    reviewDate: '2024-12-03',
    verified: true,
    helpful: 31,
    category: 'price',
    tags: ['Cliente fiel', 'Melhor preço', 'Atendimento português', 'Recomendo']
  },
  {
    id: '4',
    customerName: 'Carlos Roberto Mendes',
    customerLocation: 'Boston, MA',
    customerInitials: 'CM',
    rating: 4,
    title: 'Bom custo-benefício, entrega o prometido',
    comment: 'Serviço sólido e confiável. Consegui uma boa tarifa para Salvador e o processo foi transparente do início ao fim. Única ressalva é que demorou um pouco mais que 2h para receber a cotação, mas valeu a pena esperar. No final, economizei bastante.',
    route: 'Boston → Salvador',
    savedAmount: 'R$ 390',
    travelDate: '2025-01-10',
    reviewDate: '2024-12-18',
    verified: true,
    helpful: 12,
    category: 'overall',
    tags: ['Confiável', 'Transparente', 'Boa tarifa']
  },
  {
    id: '5',
    customerName: 'Fernanda Lima',
    customerLocation: 'Los Angeles, CA',
    customerInitials: 'FL',
    rating: 5,
    title: 'Atendimento excepcional, família toda satisfeita',
    comment: 'Organizei a viagem de Natal para toda família (6 pessoas) para Fortaleza. A Maria da Fly2Any foi um anjo, conseguiu coordenar todos os voos, horários e ainda economizamos R$ 2.800 no total. Atendimento personalizado que faz a diferença!',
    route: 'Los Angeles → Fortaleza',
    savedAmount: 'R$ 2.800',
    travelDate: '2024-12-20',
    reviewDate: '2024-12-25',
    verified: true,
    helpful: 45,
    category: 'service',
    tags: ['Família', 'Natal', 'Atendimento personalizado', 'Economia grande']
  }
];

const reviewStats: ReviewStats = {
  totalReviews: 1834,
  averageRating: 4.9,
  ratingDistribution: {
    5: 1648,
    4: 156,
    3: 25,
    2: 3,
    1: 2
  },
  categories: {
    service: 4.9,
    price: 4.8,
    communication: 4.9,
    reliability: 4.8,
    overall: 4.9
  }
};

export default function CustomerReviewSystem() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  const filteredReviews = sampleReviews.filter(review => {
    if (selectedRating && review.rating !== selectedRating) return false;
    if (selectedCategory !== 'all' && review.category !== selectedCategory) return false;
    if (searchQuery && !review.comment.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.customerLocation.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !review.route.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b.helpful - a.helpful;
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
      default:
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    }
  });

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

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
            Avaliações Verificadas de Clientes
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            O que brasileiros nos EUA falam sobre nossos serviços de viagem
          </p>
        </div>

        {/* Review Stats Overview */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
          borderRadius: '12px',
          padding: '32px',
          color: 'white',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {reviewStats.averageRating}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                {renderStars(Math.round(reviewStats.averageRating), 'lg')}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {reviewStats.totalReviews.toLocaleString()} avaliações
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {Object.entries(reviewStats.categories).map(([category, rating]) => (
                <div key={category} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {rating}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    textTransform: 'capitalize'
                  }}>
                    {category === 'service' ? 'Atendimento' :
                     category === 'price' ? 'Preço' :
                     category === 'communication' ? 'Comunicação' :
                     category === 'reliability' ? 'Confiabilidade' : 'Geral'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Distribuição de Estrelas
              </h4>
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                  fontSize: '12px'
                }}>
                  <span>{stars}</span>
                  <Star className="w-3 h-3" />
                  <div style={{
                    flex: 1,
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(reviewStats.ratingDistribution[stars] / reviewStats.totalReviews) * 100}%`,
                      height: '100%',
                      background: 'white',
                      borderRadius: '2px'
                    }} />
                  </div>
                  <span>{reviewStats.ratingDistribution[stars]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar avaliações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                width: '200px'
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '14px'
            }}
          >
            <option value="all">Todas as categorias</option>
            <option value="overall">Geral</option>
            <option value="service">Atendimento</option>
            <option value="price">Preço</option>
            <option value="flight">Voo</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '14px'
            }}
          >
            <option value="recent">Mais recentes</option>
            <option value="helpful">Mais úteis</option>
            <option value="rating">Maior nota</option>
          </select>

          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: selectedRating === rating ? '#3b82f6' : '#f8fafc',
                  color: selectedRating === rating ? 'white' : '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <Star className="w-3 h-3" />
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              }}
            >
              {/* Review Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
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
                    {review.customerInitials}
                  </div>

                  <div>
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
                        {review.customerName}
                      </h4>
                      {review.verified && (
                        <Verified className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      <MapPin className="w-3 h-3" />
                      {review.customerLocation}
                      <span>•</span>
                      <Calendar className="w-3 h-3" />
                      {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '4px'
                  }}>
                    {renderStars(review.rating)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    Viagem: {new Date(review.travelDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px',
                lineHeight: '1.3'
              }}>
                {review.title}
              </h3>

              {/* Review Content */}
              <div style={{
                position: 'relative',
                marginBottom: '16px'
              }}>
                <Quote className="w-6 h-6 text-gray-300 absolute -top-2 -left-1" />
                <p style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  paddingLeft: '16px',
                  fontStyle: 'italic'
                }}>
                  {review.comment}
                </p>
              </div>

              {/* Review Details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '12px',
                flexWrap: 'wrap',
                fontSize: '12px',
                color: '#64748b'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Plane className="w-3 h-3" />
                  {review.route}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#10b981',
                  fontWeight: '600'
                }}>
                  <DollarSign className="w-3 h-3" />
                  Economizou {review.savedAmount}
                </div>
              </div>

              {/* Tags */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: '16px'
              }}>
                {review.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Company Response */}
              {review.response && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#3b82f6',
                      borderRadius: '50%'
                    }} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      Resposta da {review.response.author}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      • {new Date(review.response.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {review.response.message}
                  </p>
                </div>
              )}

              {/* Review Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    <ThumbsUp className="w-3 h-3" />
                    Útil ({review.helpful})
                  </button>

                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    <MessageCircle className="w-3 h-3" />
                    Comentar
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {review.verified && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: '#10b981',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '500'
                    }}>
                      <Verified className="w-2 h-2" />
                      Verificado
                    </span>
                  )}

                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Reviews */}
        {!showAllReviews && sortedReviews.length > 3 && (
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <button
              onClick={() => setShowAllReviews(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto'
              }}
            >
              Ver todas as {sortedReviews.length} avaliações
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Junte-se aos milhares de brasileiros satisfeitos
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '20px',
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            Experimente nosso atendimento especializado e economize na sua próxima viagem ao Brasil
          </p>
          
          <button style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Solicitar Cotação Gratuita
          </button>
        </div>
      </div>
    </section>
  );
}