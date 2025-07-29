'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Users, Eye, AlertTriangle, Zap, Flame, Star, CheckCircle } from 'lucide-react';
import { liteApiClient } from '@/lib/hotels/liteapi-client';

interface UrgencyBannerProps {
  type: 'time' | 'availability' | 'demand' | 'price' | 'booking' | 'preBooking' | 'lastChance';
  hotelId?: string;
  rateId?: string;
  roomsLeft?: number;
  viewersCount?: number;
  priceIncrease?: number;
  timeLeft?: number;
  prebookingActive?: boolean;
  className?: string;
  onPreBooking?: (prebookId: string) => void;
}

interface PreBookingData {
  prebookId: string;
  expiresAt: Date;
  guaranteedPrice: number;
  originalPrice: number;
}

export const UrgencyBanner: React.FC<UrgencyBannerProps> = ({
  type,
  hotelId,
  rateId,
  roomsLeft = Math.floor(Math.random() * 5) + 1,
  viewersCount = Math.floor(Math.random() * 15) + 5,
  priceIncrease = Math.floor(Math.random() * 20) + 10,
  timeLeft = Math.floor(Math.random() * 300) + 60,
  prebookingActive = false,
  className = '',
  onPreBooking
}) => {
  const [currentViewers, setCurrentViewers] = useState(viewersCount);
  const [currentTimeLeft, setCurrentTimeLeft] = useState(timeLeft);
  const [currentRoomsLeft, setCurrentRoomsLeft] = useState(roomsLeft);
  const [isBlinking, setIsBlinking] = useState(false);
  const [prebookingData, setPrebookingData] = useState<PreBookingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (type === 'demand') {
      const interval = setInterval(() => {
        setCurrentViewers(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          return Math.max(3, Math.min(25, prev + change));
        });
      }, 3000 + Math.random() * 2000);
      return () => clearInterval(interval);
    }
  }, [type]);

  useEffect(() => {
    if (type === 'time' || type === 'booking' || type === 'preBooking' || type === 'lastChance') {
      const interval = setInterval(() => {
        setCurrentTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type]);

  useEffect(() => {
    if (type === 'lastChance' && currentTimeLeft < 60) {
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
      return () => clearInterval(blinkInterval);
    }
  }, [type, currentTimeLeft]);

  const handlePreBooking = async () => {
    if (!rateId || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await liteApiClient.prebookHotel(rateId);
      if (response.success && response.data) {
        const prebookData: PreBookingData = {
          prebookId: response.data.prebook_id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
          guaranteedPrice: response.data.price,
          originalPrice: response.data.original_price || response.data.price
        };
        setPrebookingData(prebookData);
        onPreBooking?.(prebookData.prebookId);
      }
    } catch (error) {
      console.error('Erro no pre-booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getBannerContent = () => {
    switch (type) {
      case 'preBooking':
        return {
          icon: <Flame size={16} className="text-purple-600 animate-pulse" />,
          text: prebookingData 
            ? `🚀 PRÉ-RESERVA ATIVA - Garantido por ${formatTime(currentTimeLeft)} minutos!`
            : `🚀 GARANTIR PREÇO - Clique para segurar por 15 minutos!`,
          bgColor: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300',
          textColor: 'text-purple-900 font-bold',
          animate: true,
          action: !prebookingData ? handlePreBooking : undefined
        };
      
      case 'lastChance':
        return {
          icon: <AlertTriangle size={16} className={`text-red-600 ${isBlinking ? 'animate-bounce' : ''}`} />,
          text: `⚡ ÚLTIMA CHANCE! Reserva expira em ${formatTime(currentTimeLeft)}`,
          bgColor: `bg-gradient-to-r from-red-100 to-orange-100 border-red-400 ${isBlinking ? 'animate-pulse' : ''}`,
          textColor: 'text-red-900 font-black',
          animate: true
        };
      
      case 'time':
        return {
          icon: <Clock size={16} className="text-red-600" />,
          text: `⏰ Oferta expira em ${formatTime(currentTimeLeft)} - Reserve agora!`,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800'
        };
      
      case 'availability':
        return {
          icon: <AlertTriangle size={16} className="text-orange-600" />,
          text: `🔥 Apenas ${currentRoomsLeft} quartos restantes neste hotel!`,
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800'
        };
      
      case 'demand':
        return {
          icon: <Eye size={16} className="text-blue-600" />,
          text: `👥 ${currentViewers} pessoas estão vendo este hotel agora`,
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800'
        };
      
      case 'price':
        return {
          icon: <Zap size={16} className="text-yellow-600" />,
          text: `📈 Preço pode aumentar ${priceIncrease}% nas próximas horas`,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800'
        };
      
      case 'booking':
        return {
          icon: <Star size={16} className="text-green-600" />,
          text: `✅ Reserve em ${formatTime(currentTimeLeft)} e ganhe upgrade gratuito!`,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800'
        };
      
      default:
        return {
          icon: <AlertTriangle size={16} className="text-gray-600" />,
          text: '📢 Oferta especial disponível',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const banner = getBannerContent();

  return (
    <div 
      className={`${banner.bgColor} ${banner.textColor} border rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium ${className} ${banner.animate ? 'shadow-lg' : ''} ${banner.action ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
      onClick={banner.action}
    >
      {banner.icon}
      <span className="flex-1">{banner.text}</span>
      {isLoading && <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>}
      {prebookingActive && type === 'preBooking' && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
        </div>
      )}
      {prebookingData && (
        <CheckCircle size={16} className="text-green-600" />
      )}
    </div>
  );
};

interface MultiUrgencyStackProps {
  hotelId: string;
  rateId?: string;
  roomsLeft?: number;
  className?: string;
  onPreBooking?: (prebookId: string) => void;
}

export const MultiUrgencyStack: React.FC<MultiUrgencyStackProps> = ({
  hotelId,
  rateId,
  roomsLeft = Math.floor(Math.random() * 5) + 1,
  className = '',
  onPreBooking
}) => {
  const [prebookingActive, setPrebookingActive] = useState(false);
  const [showUrgency, setShowUrgency] = useState(true);
  const [activeUrgencyIndex, setActiveUrgencyIndex] = useState(0);

  const urgencyTypes = ['demand', 'availability', 'price'] as const;

  useEffect(() => {
    if (!prebookingActive) {
      const interval = setInterval(() => {
        setActiveUrgencyIndex(prev => (prev + 1) % urgencyTypes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [prebookingActive]);

  const handlePreBookingSuccess = (prebookId: string) => {
    setPrebookingActive(true);
    onPreBooking?.(prebookId);
  };

  if (!showUrgency) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Banner de Pre-booking - sempre visível se houver rateId */}
      {rateId && (
        <UrgencyBanner 
          type="preBooking" 
          hotelId={hotelId}
          rateId={rateId}
          prebookingActive={prebookingActive}
          timeLeft={prebookingActive ? 900 : undefined} // 15 minutos
          onPreBooking={handlePreBookingSuccess}
        />
      )}

      {/* Banners rotativos de urgência */}
      {!prebookingActive && (
        <UrgencyBanner 
          type={urgencyTypes[activeUrgencyIndex]}
          hotelId={hotelId}
          roomsLeft={roomsLeft}
        />
      )}

      {/* Banner de última chance quando pre-booking está ativo */}
      {prebookingActive && (
        <UrgencyBanner 
          type="lastChance"
          hotelId={hotelId}
          timeLeft={900} // 15 minutos
        />
      )}
    </div>
  );
};