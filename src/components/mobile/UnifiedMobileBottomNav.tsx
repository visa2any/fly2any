'use client';

import React from 'react';
import { HomeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, ChatBubbleLeftIcon as ChatBubbleLeftIconSolid } from '@heroicons/react/24/solid';
import {
  FlightIcon,
  HotelIcon,
  CarIcon
} from '@/components/Icons';

interface UnifiedMobileBottomNavProps {
  activeTab?: 'home' | 'chat' | 'voos' | 'hotel' | 'car';
  onHomeClick: () => void;
  onChatClick: () => void;
  onVoosClick: () => void;
  onHotelClick: () => void;
  onCarClick: () => void;
  className?: string;
}

export default function UnifiedMobileBottomNav({
  activeTab = 'home',
  onHomeClick,
  onChatClick,
  onVoosClick,
  onHotelClick,
  onCarClick,
  className = ''
}: UnifiedMobileBottomNavProps) {

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      onClick: onHomeClick,
      color: 'text-blue-600'
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: ChatBubbleLeftIcon,
      iconSolid: ChatBubbleLeftIconSolid,
      onClick: onChatClick,
      color: 'text-green-600'
    },
    {
      id: 'voos',
      label: 'Voos',
      icon: FlightIcon,
      iconSolid: FlightIcon,
      onClick: onVoosClick,
      color: 'text-sky-600'
    },
    {
      id: 'hotel',
      label: 'Hotel',
      icon: HotelIcon,
      iconSolid: HotelIcon,
      onClick: onHotelClick,
      color: 'text-amber-600'
    },
    {
      id: 'car',
      label: 'Car',
      icon: CarIcon,
      iconSolid: CarIcon,
      onClick: onCarClick,
      color: 'text-violet-600'
    }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${className}`}>
      <div className="flex items-center justify-around px-2 py-2 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = isActive ? item.iconSolid : item.icon;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`
                relative flex flex-col items-center justify-center
                py-2 px-1 min-h-[56px] flex-1
                transition-all duration-200
                ${isActive ? item.color : 'text-gray-600'}
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
                rounded-lg
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-current rounded-full" />
              )}

              {/* Icon */}
              <div className={`relative mb-1 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Label */}
              <span className={`text-xs leading-tight ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}