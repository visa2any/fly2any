'use client';

/**
 * Hotel Details Page Component
 * Comprehensive hotel information display with booking capabilities
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Utensils, 
  Waves,
  Coffee,
  Shield,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Clock,
  Check,
  X,
  Heart,
  Share2,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import HotelReviews from './HotelReviews';
import HotelMap from './HotelMap';
import type { Hotel, Rate, HotelSearchParams } from '@/types/hotels';

interface HotelDetailsPageProps {
  hotel: Hotel | null;
  searchParams: HotelSearchParams;
  onBack: () => void;
  onRateSelect: (rate: Rate) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface ImageViewerProps {
  images: Hotel['images'];
  currentIndex: number;
  onClose: () => void;
}

const AMENITY_ICONS: Record<string, any> = {
  'wifi': Wifi,
  'parking': Car,
  'restaurant': Utensils,
  'pool': Waves,
  'breakfast': Coffee,
  'security': Shield
};

const BOARD_TYPE_LABELS: Record<string, string> = {
  'room_only': 'Apenas Quarto',
  'breakfast': 'Com Café da Manhã',
  'half_board': 'Meia Pensão',
  'full_board': 'Pensão Completa',
  'all_inclusive': 'All Inclusive'
};

const AMENITY_CATEGORIES: Record<string, string> = {
  'connectivity': 'Conectividade',
  'parking': 'Estacionamento',
  'dining': 'Alimentação',
  'recreation': 'Recreação',
  'business': 'Negócios',
  'accessibility': 'Acessibilidade',
  'family': 'Família',
  'spa': 'Spa & Bem-estar',
  'general': 'Geral'
};

function ImageViewer({ images, currentIndex, onClose }: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button 
          className="absolute -top-12 right-0 bg-white bg-opacity-10 hover:bg-opacity-20 border-0 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-10 transition-all"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <button 
          className="absolute top-1/2 -translate-y-1/2 -left-16 bg-white bg-opacity-10 hover:bg-opacity-20 border-0 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer z-10 transition-all"
          onClick={prevImage}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          className="absolute top-1/2 -translate-y-1/2 -right-16 bg-white bg-opacity-10 hover:bg-opacity-20 border-0 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer z-10 transition-all"
          onClick={nextImage}
        >
          <ChevronRight size={24} />
        </button>

        <div className="rounded-lg overflow-hidden max-w-full max-h-[calc(90vh-120px)]">
          <Image
            src={images[activeIndex].url}
            alt={images[activeIndex].description || 'Hotel image'}
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div className="absolute -top-12 left-0 text-white text-sm">
          {activeIndex + 1} / {images.length}
        </div>

        <div className="flex gap-2 mt-5 max-w-full overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              className={`border-2 ${index === activeIndex ? 'border-white' : 'border-transparent'} rounded overflow-hidden cursor-pointer flex-shrink-0 transition-all`}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.description || 'Thumbnail'}
                width={80}
                height={60}
                className="w-20 h-15 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HotelDetailsPage({
  hotel,
  searchParams,
  onBack,
  onRateSelect,
  isLoading = false,
  error = null
}: HotelDetailsPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'amenities' | 'policies'>('overview');
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  // Carregar estado de favorito do localStorage
  useEffect(() => {
    if (hotel) {
      const favorites = JSON.parse(localStorage.getItem('hotel-favorites') || '[]');
      setIsFavorite(favorites.includes(hotel.id));
    }
  }, [hotel]);

  const handleToggleFavorite = () => {
    if (!hotel) return;
    
    const favorites = JSON.parse(localStorage.getItem('hotel-favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      // Remover dos favoritos
      newFavorites = favorites.filter((id: string) => id !== hotel.id);
      setIsFavorite(false);
      // TODO: Adicionar toast notification
      alert('❤️ Hotel removido dos favoritos!');
    } else {
      // Adicionar aos favoritos
      newFavorites = [...favorites, hotel.id];
      setIsFavorite(true);
      // TODO: Adicionar toast notification
      alert('💖 Hotel adicionado aos favoritos!');
    }
    
    localStorage.setItem('hotel-favorites', JSON.stringify(newFavorites));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={20} 
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  const renderAmenityIcon = (amenityId: string) => {
    const IconComponent = AMENITY_ICONS[amenityId] || Shield;
    return <IconComponent size={20} className="text-blue-600" />;
  };

  const groupAmenitiesByCategory = (amenities: Hotel['amenities']) => {
    return amenities.reduce((groups, amenity) => {
      const category = amenity.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(amenity);
      return groups;
    }, {} as Record<string, typeof amenities>);
  };

  const handleShare = async (): Promise<void> => {
    if (!hotel) return;
    
    const shareData = {
      title: `${hotel.name} - Fly2Any`,
      text: `Confira este incrível hotel: ${hotel.name} em ${hotel.location.address.city}. A partir de ${hotel.lowestRate?.formatted || 'N/A'} por noite.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.log('Share failed:', error);
          await fallbackToClipboard();
        }
      }
    } else {
      await fallbackToClipboard();
    }
  };

  const fallbackToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // TODO: Adicionar toast notification
      alert('📎 Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback final: mostrar o link para copiar manualmente
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('📎 Link copiado!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white rounded-2xl">
        <div className="text-center text-gray-700">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold">Carregando detalhes do hotel...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white rounded-2xl">
        <div className="text-center text-gray-700">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar hotel</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white border-0 rounded-lg cursor-pointer hover:bg-blue-700 transition-all"
          >
            <ArrowLeft size={16} />
            Voltar à busca
          </button>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return null;
  }

  const groupedAmenities = groupAmenitiesByCategory(hotel.amenities);
  const mainImage = hotel.images.find(img => img.isMain) || hotel.images[0];

  return (
    <div className="min-h-screen bg-hotel-main">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        {/* Header padronizado */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
              <span>Voltar aos resultados</span>
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Share2 size={16} />
                <span>Compartilhar</span>
              </button>
              <button 
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isFavorite 
                    ? 'text-red-600 bg-red-50 border border-red-200' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart size={16} className={isFavorite ? 'fill-red-500' : ''} />
                <span>{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Layout principal - 2 colunas para detalhes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 lg:gap-6 items-start">
          {/* Coluna principal - Detalhes do hotel */}
          <div className="space-y-6">
            {/* Galeria de imagens */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
                {mainImage && (
                  <div className="relative cursor-pointer rounded-2xl overflow-hidden group h-[300px] lg:h-[400px]" onClick={() => setSelectedImageIndex(0)}>
                    <Image
                      src={mainImage.url}
                      alt={hotel.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 600px"
                    />
                    <button className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black bg-opacity-70 text-white border-0 rounded-lg text-sm hover:bg-opacity-80 transition-all">
                      <Camera size={16} />
                      Ver todas as fotos ({hotel.images.length})
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {hotel.images.slice(1, 5).map((image, index) => (
                    <div 
                      key={index} 
                      className="relative cursor-pointer rounded-lg overflow-hidden group h-[120px] lg:h-[150px]"
                      onClick={() => setSelectedImageIndex(index + 1)}
                    >
                      <Image
                        src={image.url}
                        alt={image.description || `Hotel image ${index + 2}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumo do hotel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{hotel.name}</h1>
                  <div className="flex gap-1 mb-3">
                    {renderStars(hotel.starRating || 0)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span>
                    {hotel.location.address.street && `${hotel.location.address.street}, `}
                    {hotel.location.address.city}, {hotel.location.address.country}
                  </span>
                </div>

                {hotel.guestRating && (
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">{hotel.guestRating.toFixed(1)}</div>
                    <div>
                      <span className="block font-semibold text-gray-900">Muito Bom</span>
                      {hotel.reviewCount && (
                        <span className="block text-sm text-gray-600">({hotel.reviewCount} avaliações)</span>
                      )}
                    </div>
                  </div>
                )}

                {hotel.lowestRate && (
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <span className="block text-sm text-gray-600 mb-2">A partir de</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-600">{hotel.lowestRate.currency}</span>
                      <span className="text-3xl font-bold text-blue-600">{hotel.lowestRate.amount}</span>
                      <span className="text-sm text-gray-600">por noite</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm mb-8">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`flex-1 px-6 py-3 text-center border-0 bg-transparent cursor-pointer font-medium transition-all ${
                    activeTab === 'overview' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Visão Geral
                </button>
                <button 
                  className={`flex-1 px-6 py-3 text-center border-0 bg-transparent cursor-pointer font-medium transition-all ${
                    activeTab === 'rooms' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Quartos & Tarifas
                </button>
                <button 
                  className={`flex-1 px-6 py-3 text-center border-0 bg-transparent cursor-pointer font-medium transition-all ${
                    activeTab === 'amenities' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('amenities')}
                >
                  Comodidades
                </button>
                <button 
                  className={`flex-1 px-6 py-3 text-center border-0 bg-transparent cursor-pointer font-medium transition-all ${
                    activeTab === 'policies' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveTab('policies')}
                >
                  Políticas
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  {hotel.description && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Sobre o Hotel</h3>
                      <p className="text-gray-700 text-lg leading-relaxed">{hotel.description}</p>
                    </div>
                  )}

                  {hotel.highlights && hotel.highlights.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Destaques</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {hotel.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700">
                            <Check size={16} className="text-green-600 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hotel.location.landmarks && hotel.location.landmarks.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Pontos de Interesse Próximos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotel.location.landmarks.slice(0, 6).map((landmark, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{landmark.name}</span>
                            <span className="text-sm text-gray-600">
                              {landmark.distance} {landmark.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hotel.contact && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Contato</h3>
                      <div className="flex flex-col gap-3">
                        {hotel.contact.phone && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Phone size={16} className="text-blue-600" />
                            <span>{hotel.contact.phone}</span>
                          </div>
                        )}
                        {hotel.contact.email && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Mail size={16} className="text-blue-600" />
                            <span>{hotel.contact.email}</span>
                          </div>
                        )}
                        {hotel.contact.website && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Globe size={16} className="text-blue-600" />
                            <a href={hotel.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Site oficial
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Informações avançadas do hotel */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Informações Adicionais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Horários */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">🕰️ Horários</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-in:</span>
                            <span className="font-medium">{hotel.policies?.checkIn || '15:00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out:</span>
                            <span className="font-medium">{hotel.policies?.checkOut || '11:00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recepção:</span>
                            <span className="font-medium">24 horas</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Serviços */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">🎆 Serviços Exclusivos</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Concierge 24h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Room Service</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Transfer Aeroporto</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Lavanderia</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Acessibilidade */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">♿ Acessibilidade</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-600" />
                            <span className="text-gray-700">Acesso para cadeirantes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-600" />
                            <span className="text-gray-700">Elevadores adaptados</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-blue-600" />
                            <span className="text-gray-700">Banheiros adaptados</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Segurança */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">🛡️ Segurança & Saúde</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Cofres nos quartos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">CCTV nas áreas comuns</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Protocolos de higiene</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check size={16} className="text-green-600" />
                            <span className="text-gray-700">Serviço médico</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-6">Quartos Disponíveis</h3>
                    <div className="flex flex-wrap gap-6 text-gray-600 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        {searchParams.checkIn.toLocaleDateString('pt-BR')} - {searchParams.checkOut.toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={16} />
                        {searchParams.adults} adultos, {searchParams.children} crianças
                      </span>
                    </div>
                  </div>

                  {hotel.rates && hotel.rates.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {hotel.rates.map((rate) => (
                        <div key={rate.id} className="flex justify-between p-6 border border-gray-200 rounded-xl bg-white transition-all hover:border-blue-600 hover:shadow-sm">
                          <div className="flex-1 mr-6">
                            <div className="mb-3">
                              <h4 className="text-xl font-semibold text-gray-900 mb-2">{rate.roomType.name}</h4>
                              <div className="flex gap-4 mb-3">
                                <span className="text-blue-600 font-medium">
                                  {BOARD_TYPE_LABELS[rate.boardType] || rate.boardType}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600 text-sm">
                                  <Users size={14} />
                                  Até {rate.maxOccupancy || 2} pessoas
                                </span>
                              </div>
                            </div>

                            {rate.roomType.description && (
                              <p className="text-gray-700 mb-4 leading-relaxed">{rate.roomType.description}</p>
                            )}

                            <div className="flex flex-col gap-2 mb-4">
                              {rate.isFreeCancellation && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Check size={16} className="text-green-600" />
                                  <span>Cancelamento grátis</span>
                                </div>
                              )}
                              
                              {rate.isRefundable && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Check size={16} className="text-green-600" />
                                  <span>Totalmente reembolsável</span>
                                </div>
                              )}

                              {rate.cancellationDeadline && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock size={16} className="text-blue-600" />
                                  <span>Cancelar até {new Date(rate.cancellationDeadline).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </div>

                            {rate.roomType.amenities && rate.roomType.amenities.length > 0 && (
                              <div className="mt-4">
                                <span className="block text-sm font-medium text-gray-700 mb-2">Comodidades do quarto:</span>
                                <div className="flex flex-wrap gap-2">
                                  {rate.roomType.amenities.slice(0, 4).map((amenity, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end justify-between min-w-[200px]">
                            {rate.originalPrice && rate.originalPrice.amount > rate.price.amount && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="line-through text-gray-400 text-sm">{rate.originalPrice.formatted}</span>
                                {rate.discountPercentage && (
                                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                                    -{rate.discountPercentage}%
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="text-right mb-2">
                              <span className="block text-2xl font-bold text-blue-600">{rate.totalPrice?.formatted || 'N/A'}</span>
                              <span className="block text-xs text-gray-600">por noite</span>
                            </div>

                            {rate.taxes && rate.taxes.length > 0 && (
                              <div className="text-xs text-gray-600 mb-4">
                                <span>+ impostos e taxas</span>
                              </div>
                            )}

                            <button
                              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-lg cursor-pointer font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                              onClick={() => onRateSelect(rate)}
                            >
                              Selecionar Quarto
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-600">
                      <p>Nenhuma tarifa disponível para as datas selecionadas</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="flex flex-col gap-8">
                  {Object.entries(groupedAmenities).map(([category, amenities]) => (
                    <div key={category}>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{AMENITY_CATEGORIES[category] || category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {amenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <div className="text-blue-600 mt-0.5">
                              {renderAmenityIcon(amenity.id)}
                            </div>
                            <div className="flex-1">
                              <span className="block font-medium text-gray-900 mb-1">{amenity.name}</span>
                              {amenity.description && (
                                <span className="block text-sm text-gray-600 mb-1">{amenity.description}</span>
                              )}
                              {amenity.isFree && (
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Grátis
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'policies' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Check-in e Check-out</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3">
                        <span className="font-medium text-gray-700 min-w-[80px]">Check-in:</span>
                        <span className="text-gray-700">{hotel.policies?.checkIn || '15:00'}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-medium text-gray-700 min-w-[80px]">Check-out:</span>
                        <span className="text-gray-700">{hotel.policies?.checkOut || '11:00'}</span>
                      </div>
                    </div>
                  </div>

                  {hotel.policies?.children && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Política para Crianças</h3>
                      <p className="text-gray-700 leading-relaxed">{hotel.policies.children}</p>
                    </div>
                  )}

                  {hotel.policies?.pets && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Política para Animais</h3>
                      <p className="text-gray-700 leading-relaxed">{hotel.policies.pets}</p>
                    </div>
                  )}

                  {hotel.policies?.smoking && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Política de Fumo</h3>
                      <p className="text-gray-700 leading-relaxed">{hotel.policies.smoking}</p>
                    </div>
                  )}

                  {hotel.policies?.extraBeds && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Camas Extras</h3>
                      <p className="text-gray-700 leading-relaxed">{hotel.policies.extraBeds}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Coluna lateral - Reviews e Mapa */}
          <div className="space-y-6">
            {/* Reviews component */}
            <HotelReviews hotel={hotel} />
            
            {/* Map component */}
            <HotelMap hotel={hotel} />
            
            {/* Sustainability info */}
            {hotel.sustainability && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🌱 Sustentabilidade</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Nível de Sustentabilidade</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-3 rounded-full ${
                            i < (hotel.sustainability?.level || 0) ? 'bg-green-500' : 'bg-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  {hotel.sustainability.certifications && hotel.sustainability.certifications.length > 0 && (
                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-2">Certificações:</span>
                      <div className="flex flex-wrap gap-2">
                        {hotel.sustainability.certifications.map((cert, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Viewer Modal */}
        {selectedImageIndex !== null && (
          <ImageViewer
            images={hotel.images}
            currentIndex={selectedImageIndex}
            onClose={() => setSelectedImageIndex(null)}
          />
        )}
      </div>
    </div>
  );
}