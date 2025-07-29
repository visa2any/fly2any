'use client';

/**
 * Hotel Reviews Component
 * Exibe avaliações reais e simuladas dos hotéis
 */

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import type { Hotel } from '@/types/hotels';

interface HotelReviewsProps {
  hotel: Hotel;
  className?: string;
}

interface Review {
  id: string;
  guestName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  roomType?: string;
  stayDate?: string;
}

// Mock reviews for demonstration
const generateMockReviews = (hotel: Hotel): Review[] => [
  {
    id: '1',
    guestName: 'Maria Silva',
    rating: 5,
    title: 'Experiência incrível!',
    comment: `Fiquei hospedada no ${hotel.name} e foi uma experiência maravilhosa. O atendimento foi excepcional, o quarto muito limpo e confortável. A localização é perfeita para explorar a cidade. Definitivamente voltarei!`,
    date: '2024-01-15',
    helpful: 12,
    notHelpful: 1,
    verified: true,
    roomType: 'Quarto Standard',
    stayDate: '2024-01-10'
  },
  {
    id: '2',
    guestName: 'João Santos',
    rating: 4,
    title: 'Muito bom, mas pode melhorar',
    comment: 'Hotel com boa infraestrutura e localização excelente. O café da manhã poderia ter mais variedade, mas no geral foi uma estadia agradável. Staff muito atencioso.',
    date: '2024-01-08',
    helpful: 8,
    notHelpful: 2,
    verified: true,
    roomType: 'Quarto Superior',
    stayDate: '2024-01-05'
  },
  {
    id: '3',
    guestName: 'Ana Costa',
    rating: 5,
    title: 'Perfeito para lua de mel',
    comment: 'Escolhemos este hotel para nossa lua de mel e foi a decisão certa! O quarto era romântico, a vista incrível e o spa relaxante. Recomendo para casais!',
    date: '2023-12-28',
    helpful: 15,
    notHelpful: 0,
    verified: true,
    roomType: 'Suíte',
    stayDate: '2023-12-20'
  },
  {
    id: '4',
    guestName: 'Carlos Oliveira',
    rating: 4,
    title: 'Boa opção para negócios',
    comment: 'Estive a trabalho e o hotel atendeu perfeitamente. Internet rápida, centro de negócios bem equipado e localização central. O único ponto negativo foi o barulho do trânsito.',
    date: '2023-12-15',
    helpful: 6,
    notHelpful: 1,
    verified: true,
    roomType: 'Quarto Executivo',
    stayDate: '2023-12-10'
  }
];

export default function HotelReviews({ hotel, className = '' }: HotelReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de reviews
    setTimeout(() => {
      setReviews(generateMockReviews(hotel));
      setLoading(false);
    }, 1000);
  }, [hotel]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4.0) return 'Muito Bom';
    if (rating >= 3.5) return 'Bom';
    if (rating >= 3.0) return 'Regular';
    return 'Ruim';
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Avaliações</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-b border-gray-100 pb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm w-full overflow-hidden ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Avaliações dos Hóspedes</h3>
        
        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-blue-600">{hotel.guestRating?.toFixed(1) || '9.2'}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {renderStars(Math.round(hotel.guestRating || 4.5))}
              </div>
              <div className="text-lg font-semibold text-gray-900">{getRatingText(hotel.guestRating || 4.5)}</div>
              <div className="text-sm text-gray-600">{hotel.reviewCount || reviews.length} avaliações</div>
            </div>
          </div>
          
          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = (count / reviews.length) * 100;
              
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-3">{stars}</span>
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review.id} className={`${index > 0 ? 'border-t border-gray-100 pt-6' : ''}`}>
            <div className="flex items-start gap-2 lg:gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base truncate max-w-[120px]">{review.guestName}</h4>
                  {review.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ Verificado
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{new Date(review.date).toLocaleDateString('pt-BR')}</span>
                  {review.roomType && (
                    <>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-blue-600">{review.roomType}</span>
                    </>
                  )}
                </div>
                
                <h5 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base break-words">{review.title}</h5>
                <p className="text-gray-700 mb-4 leading-relaxed text-sm break-words overflow-hidden">{review.comment.length > 150 ? `${review.comment.substring(0, 150)}...` : review.comment}</p>
                
                {review.stayDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar size={14} />
                    <span>Data da estadia: {new Date(review.stayDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                  <button className="flex items-center gap-1 text-xs lg:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <ThumbsUp size={12} />
                    <span>Útil ({review.helpful})</span>
                  </button>
                  <button className="flex items-center gap-1 text-xs lg:text-sm text-gray-600 hover:text-red-600 transition-colors">
                    <ThumbsDown size={12} />
                    <span>Não útil ({review.notHelpful})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          Ver todas as {hotel.reviewCount || 1000}+ avaliações
        </button>
      </div>
    </div>
  );
}