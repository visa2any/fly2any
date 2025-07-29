'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Users, Wifi, Car, Utensils, Clock, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { fetchPopularHotels, type PopularHotelData } from '@/lib/hotels/popular-hotels-service';

interface PopularHotel {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  image: string;
  amenities: string[];
  isPopular?: boolean;
  discount?: number;
  liteApiId?: string;
}

interface PopularHotelsGridProps {
  onHotelSelect?: (hotel: PopularHotel) => void;
}

export default function PopularHotelsGrid({ onHotelSelect }: PopularHotelsGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [hotels, setHotels] = useState<PopularHotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularHotels();
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  const loadPopularHotels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Loading popular hotels from LiteAPI...');
      const popularHotelsData = await fetchPopularHotels();
      
      // Transform to component format
      const transformedHotels: PopularHotel[] = popularHotelsData.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        city: hotel.city,
        state: hotel.state,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        price: hotel.price,
        image: hotel.image,
        amenities: hotel.amenities,
        isPopular: hotel.isPopular,
        discount: hotel.discount,
        liteApiId: hotel.liteApiId
      }));
      
      setHotels(transformedHotels);
      console.log(`✅ Loaded ${transformedHotels.length} popular hotels`);
      
    } catch (err) {
      console.error('❌ Error loading popular hotels:', err);
      setError('Erro ao carregar hotéis populares');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  const handleHotelClick = (hotel: PopularHotel) => {
    // Open search in new window/tab
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7); // Next week
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2 nights
    
    const searchParams = new URLSearchParams({
      destination: `${hotel.city}, ${hotel.state}`,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults: '2',
      children: '0',
      rooms: '1',
      view: 'results' // Force results view
    });
    
    // Open in new tab/window
    const url = `/hoteis?${searchParams.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Also call callback if provided
    if (onHotelSelect) {
      onHotelSelect(hotel);
    }
    
    console.log('🏨 Abrindo busca em nova janela:', hotel.name, 'em', hotel.city);
  };

  return (
    <section className={`py-8 md:py-12 px-4 mx-auto max-w-[1400px] transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Section Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
          🏨 Hotéis Populares no Brasil
        </h2>
        <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto">
          Os hotéis mais procurados pelos nossos clientes com ofertas exclusivas
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Carregando hotéis populares...</p>
            <p className="text-sm text-slate-500 mt-2">Consultando ofertas em tempo real</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-800 font-medium mb-2">Ops! Algo deu errado</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadPopularHotels}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      {!isLoading && !error && hotels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {hotels.map((hotel, index) => (
          <div
            key={hotel.id}
            className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 ${
              hoveredHotel === hotel.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.6s ease-out ${index * 100}ms, transform 0.6s ease-out ${index * 100}ms`
            }}
            onClick={() => handleHotelClick(hotel)}
            onMouseEnter={() => setHoveredHotel(hotel.id)}
            onMouseLeave={() => setHoveredHotel(null)}
          >
            {/* Hotel Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {hotel.isPopular && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔥 POPULAR
                  </span>
                )}
                {hotel.discount && (
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{hotel.discount}%
                  </span>
                )}
              </div>

              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-slate-900">{hotel.rating}</span>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="p-4 md:p-6">
              {/* Hotel Name & Location */}
              <div className="mb-3">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin size={14} />
                  <span className="text-sm">{hotel.location}, {hotel.city} - {hotel.state}</span>
                </div>
              </div>

              {/* Reviews */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={`${i < Math.floor(hotel.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  {hotel.reviewCount.toLocaleString('pt-BR')} avaliações
                </span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hotel.price.original && (
                    <span className="text-sm text-slate-500 line-through">
                      {formatPrice(hotel.price.original, hotel.price.currency)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(hotel.price.current, hotel.price.currency)}
                  </span>
                </div>
                <span className="text-xs text-slate-500">por noite</span>
              </div>

              {/* CTA Button */}
              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2">
                <span>Ver Disponibilidade</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* No Hotels Found */}
      {!isLoading && !error && hotels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum hotel encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Não conseguimos carregar os hotéis populares no momento.
          </p>
          <button
            onClick={loadPopularHotels}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* View More Button */}
      {!isLoading && hotels.length > 0 && (
        <div className="text-center mt-8 md:mt-12">
          <Link
            href="/hoteis?view=search"
            className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <span>Ver Todos os Hotéis</span>
            <Clock size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}