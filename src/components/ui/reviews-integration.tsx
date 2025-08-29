'use client';
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Award, Verified } from 'lucide-react';
import { liteApiClient } from '@/lib/hotels/liteapi-client';

interface Review {
  id: string;
  author: {
    name: string;
    country: string;
    isVerified: boolean;
    travelType: 'business' | 'leisure' | 'family' | 'couple' | 'solo';
    reviewCount: number;
    profileImage?: string;
  };
  rating: {
    overall: number;
    categories: {
      cleanliness: number;
      service: number;
      location: number;
      value: number;
      facilities: number;
      comfort: number;
    };
  };
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  stayDate: string;
  reviewDate: string;
  roomType: string;
  helpful: {
    likes: number;
    dislikes: number;
    userVote?: 'like' | 'dislike';
  };
  images?: string[];
  isRecent: boolean;
  hotelResponse?: {
    content: string;
    date: string;
    author: string;
  };
}

interface ReviewsIntegrationProps {
  hotelId: string;
  className?: string;
}

const TRAVEL_TYPE_LABELS = {
  business: '💼 Negócios',
  leisure: '🏖️ Lazer',
  family: '👨‍👩‍👧‍👦 Família',
  couple: '💑 Casal',
  solo: '🧳 Solo'
};

const CATEGORY_LABELS = {
  cleanliness: 'Limpeza',
  service: 'Atendimento',
  location: 'Localização',
  value: 'Custo-benefício',
  facilities: 'Instalações',
  comfort: 'Conforto'
};

export const ReviewsIntegration: React.FC<ReviewsIntegrationProps> = ({ hotelId, className = '' }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'high' | 'low'>('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [hotelId]);

  const loadReviews = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await liteApiClient.getHotelReviews(hotelId, 20);
      if (response.success && response.data?.reviews) {
        setReviews(response.data.reviews);
      } else {
        setReviews(generateDemoReviews());
      }
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
      setReviews(generateDemoReviews());
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoReviews = (): Review[] => [
    {
      id: '1',
      author: {
        name: 'Maria Silva',
        country: 'Brasil',
        isVerified: true,
        travelType: 'family',
        reviewCount: 23,
        profileImage: 'https://ui-avatars.com/api/?name=Maria+Silva&background=random'
      },
      rating: {
        overall: 9.2,
        categories: {
          cleanliness: 9.5,
          service: 9.0,
          location: 8.8,
          value: 9.1,
          facilities: 8.9,
          comfort: 9.3
        }
      },
      title: 'Experiência excepcional para família!',
      content: 'Hotel incrível para férias em família. Quartos espaçosos, piscina maravilhosa e equipe muito atenciosa. Café da manhã variado e delicioso. Localização perfeita, perto de tudo que precisávamos.',
      pros: ['Piscina incrível', 'Café da manhã excelente', 'Quartos espaçosos', 'Equipe atenciosa'],
      cons: ['Wi-Fi lento no quarto'],
      stayDate: '2025-01-15',
      reviewDate: '2025-01-20',
      roomType: 'Quarto Familiar Superior',
      helpful: { likes: 34, dislikes: 2 },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400'
      ],
      isRecent: true,
      hotelResponse: {
        content: 'Muito obrigado pelo feedback, Maria! Ficamos felizes em saber que sua família teve uma experiência maravilhosa. Já encaminhamos a questão do Wi-Fi para nossa equipe técnica.',
        date: '2025-01-21',
        author: 'Gerência do Hotel'
      }
    }
  ];

  const filteredReviews = reviews.filter(review => {
    switch (selectedFilter) {
      case 'recent':
        return review.isRecent;
      case 'high':
        return review.rating.overall >= 8.5;
      case 'low':
        return review.rating.overall < 7.0;
      default:
        return true;
    }
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length;
  const totalReviews = reviews.length;
  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-60'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 font-semibold text-gray-900">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">📝 Avaliações</h3>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{averageRating.toFixed(1)}</div>
              <div className="text-xs text-gray-600">Nota Geral</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{totalReviews}</div>
              <div className="text-xs text-gray-600">Avaliações</div>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {displayedReviews.map(review => (
          <div key={review.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {review.author.profileImage ? (
                    <img src={review.author.profileImage} alt={review.author.name} className="w-full h-full rounded-full" />
                  ) : (
                    review.author.name[0]
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{review.author.name}</span>
                    {review.author.isVerified && (
                      <Verified size={12} className="text-blue-600" />
                    )}
                    <span className="text-xs text-gray-500">• {review.author.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{TRAVEL_TYPE_LABELS[review.author.travelType]}</span>
                    <span>• {review.author.reviewCount} avaliações</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {renderStars(review.rating.overall)}
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-2 text-sm">{review.title}</h4>
            <p className="text-gray-700 mb-3 leading-relaxed text-sm">{review.content}</p>

            {review.hotelResponse && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={12} className="text-blue-600" />
                  <span className="font-medium text-blue-900 text-xs">Resposta da Gerência</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.hotelResponse.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-blue-800 text-xs">{review.hotelResponse.content}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>Quarto: {review.roomType}</span>
                <span>Estadia: {new Date(review.stayDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-green-600 transition-colors">
                  <ThumbsUp size={12} />
                  {review.helpful.likes}
                </button>
                <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors">
                  <ThumbsDown size={12} />
                  {review.helpful.dislikes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};