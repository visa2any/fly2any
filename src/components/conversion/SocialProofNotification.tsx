'use client';

import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Plane, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'visitor' | 'saving' | 'review';
  message: string;
  location?: string;
  timestamp: Date;
  avatar?: string;
  name?: string;
  amount?: string;
}

interface SocialProofNotificationProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  theme?: 'default' | 'premium' | 'minimal';
  showVisitorCount?: boolean;
  autoRotate?: boolean;
  className?: string;
}

export const SocialProofNotification: React.FC<SocialProofNotificationProps> = ({
  position = 'bottom-left',
  theme = 'default',
  showVisitorCount = true,
  autoRotate = true,
  className = ''
}) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);

  // Mock notifications for demonstration
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'booking',
      message: 'acabou de reservar um voo para São Paulo',
      location: 'Miami, FL',
      timestamp: new Date(),
      name: 'Maria S.',
      amount: 'R$ 1.850'
    },
    {
      id: '2',
      type: 'saving',
      message: 'economizou R$ 2.340 na passagem para o Rio',
      location: 'New York, NY',
      timestamp: new Date(),
      name: 'João P.',
      amount: 'R$ 2.340'
    },
    {
      id: '3',
      type: 'booking',
      message: 'reservou voo para Salvador com desconto',
      location: 'Boston, MA',
      timestamp: new Date(),
      name: 'Ana L.',
      amount: 'R$ 1.650'
    },
    {
      id: '4',
      type: 'review',
      message: 'avaliou nosso serviço com 5 estrelas',
      location: 'Orlando, FL',
      timestamp: new Date(),
      name: 'Carlos R.'
    },
    {
      id: '5',
      type: 'visitor',
      message: 'pessoas estão vendo esta oferta agora',
      timestamp: new Date()
    }
  ];

  useEffect(() => {
    // Simulate visitor count
    const baseCount = 127;
    const randomVariation = Math.floor(Math.random() * 50) + 1;
    setVisitorCount(baseCount + randomVariation);

    // Update visitor count periodically
    const visitorTimer = setInterval(() => {
      setVisitorCount(prev => {
        const change = Math.floor(Math.random() * 6) - 2; // -2 to +3
        return Math.max(85, Math.min(250, prev + change));
      });
    }, 8000);

    return () => clearInterval(visitorTimer);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;

    const showNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setCurrentNotification(randomNotification);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(showNotification, 3000);

    // Then show notifications every 12-18 seconds
    const recurringTimer = setInterval(() => {
      showNotification();
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, [autoRotate]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      default:
        return 'bottom-4 left-4';
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400';
      case 'minimal':
        return 'bg-white text-gray-800 border-gray-200 shadow-lg';
      default:
        return 'bg-green-600 text-white border-green-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Plane className="w-4 h-4" />;
      case 'saving':
        return <Check className="w-4 h-4" />;
      case 'review':
        return <Check className="w-4 h-4" />;
      case 'visitor':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const generateAvatar = (name?: string) => {
    if (!name) return '';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
        {initials}
      </div>
    );
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      {/* Visitor Counter */}
      {showVisitorCount && (
        <div className={`mb-3 px-3 py-2 rounded-full border-2 ${getThemeClasses()} text-sm font-semibold flex items-center gap-2 shadow-lg`}>
          <Users className="w-4 h-4 animate-pulse" />
          <span className="tabular-nums">{visitorCount}</span>
          <span className="hidden sm:inline">pessoas visualizando</span>
          <span className="sm:hidden">online</span>
        </div>
      )}

      {/* Notification */}
      {currentNotification && (
        <div 
          className={`
            transition-all duration-500 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
            max-w-sm w-full p-4 rounded-lg border-2 shadow-lg
            ${getThemeClasses()}
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {currentNotification.name ? generateAvatar(currentNotification.name) : getIcon(currentNotification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {currentNotification.name && (
                  <span className="font-semibold text-sm">{currentNotification.name}</span>
                )}
                {getIcon(currentNotification.type)}
              </div>
              
              <p className="text-sm leading-tight">
                {currentNotification.type === 'visitor' ? (
                  <>
                    <span className="font-bold tabular-nums">{visitorCount}</span> {currentNotification.message}
                  </>
                ) : (
                  currentNotification.message
                )}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-xs opacity-90">
                {currentNotification.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{currentNotification.location}</span>
                  </div>
                )}
                
                {currentNotification.amount && (
                  <div className="font-bold text-yellow-200">
                    {currentNotification.amount}
                  </div>
                )}
                
                <div className="flex items-center gap-1 ml-auto">
                  <Clock className="w-3 h-3" />
                  <span>agora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};