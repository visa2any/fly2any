'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  MapPinIcon,
  HeartIcon,
  UserIcon,
  PlusCircleIcon,
  Bars3Icon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapPinIcon as MapPinIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';
import MobileLeadCaptureCorrect from '@/components/mobile/MobileLeadCaptureCorrect';
import MobileSocialProofBadge from '@/components/mobile/MobileSocialProofBadge';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import LiveSiteHeader from '@/components/home/LiveSiteHeader';

interface MobileAppLayoutProps {
  children?: React.ReactNode;
}

type TabType = 'home' | 'search' | 'favorites' | 'profile';

export default function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [leadFormEmbedded, setLeadFormEmbedded] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle service selection from home screen
  const handleServiceSelection = (serviceType: string) => {
    setPreSelectedService(serviceType);
    setLeadFormEmbedded(true);
  };

  // Handle generic quote request
  const handleGenericQuote = () => {
    setPreSelectedService(null);
    setLeadFormEmbedded(true);
  };

  // Handle multi-step lead form submission
  const handleLeadFormSubmit = async (formData: any) => {
    console.log('Lead form submitted:', formData);
    // Handle form submission - send to API, show success message, etc.
    
    // For now, just log and reset
    setLeadFormEmbedded(false);
    setPreSelectedService(null);
    setActiveTab('home');
  };

  // Handle back navigation
  const handleBackToHome = () => {
    setLeadFormEmbedded(false);
    setPreSelectedService(null);
    setActiveTab('home');
  };

  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'search' as TabType,
      label: 'Explorar',
      icon: MapPinIcon,
      iconSolid: MapPinIconSolid,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'favorites' as TabType,
      label: 'Favoritos',
      icon: HeartIcon,
      iconSolid: HeartIconSolid,
      color: 'text-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-100',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      id: 'profile' as TabType,
      label: 'Perfil',
      icon: UserIcon,
      iconSolid: UserIconSolid,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
      gradient: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="h-screen max-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden relative">
      {/* Modern Status Bar with Enhanced UX */}
      <div className="h-safe-top bg-gradient-to-r from-primary-600 to-primary-700 relative">
        <div className="absolute inset-0 bg-black/5"></div>
      </div>
      
      {/* MAIN MOBILE HEADER - Clean and consistent */}
      <div className="bg-white shadow-neu-md border-b border-neutral-200/50 relative z-50">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <Logo 
              size="sm" 
              variant="logo-only" 
              className="flex-shrink-0"
            />
          </div>
          
          {/* Right Section - Clean Menu */}
          <div className="flex items-center gap-2">
            <button className="text-neutral-600 hover:text-neutral-800 text-xs font-medium px-3 py-2 rounded-xl hover:bg-neutral-100 transition-all duration-200">
              🇧🇷
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-xl transition-all duration-200 active:scale-95">
              <Bars3Icon className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT STEP NAVIGATION - Smaller and efficient */}
      {leadFormEmbedded && (
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white relative z-40 shadow-sm border-b border-white/20">
          <div className="px-3 py-2">
            {/* Single Row Layout */}
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-1 text-white/90 hover:text-white transition-colors py-1 px-1 hover:bg-white/10 rounded -ml-1"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Voltar</span>
              </button>
              
              {/* Service Title + Progress */}
              <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {preSelectedService === 'voos' && '✈️ Voos'}
                  {preSelectedService === 'hoteis' && '🏨 Hotéis'}
                  {preSelectedService === 'carros' && '🚗 Carros'}
                  {preSelectedService === 'passeios' && '🎯 Tours'}
                  {preSelectedService === 'seguro' && '🛡️ Seguro'}
                  {!preSelectedService && '⚡ Cotação'}
                </div>
                
                {/* Compact Progress for Flight Forms */}
                {preSelectedService === 'voos' && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((stepNum, index) => {
                      const isActive = index === 0; // Placeholder
                      const isCompleted = false; // Placeholder
                      
                      return (
                        <div key={stepNum} className="flex items-center">
                          {/* Small Step Circle */}
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-emerald-400 text-white' 
                              : isActive 
                                ? 'bg-white text-blue-600' 
                                : 'bg-white/30 text-white/70'
                          }`}>
                            {isCompleted ? '✓' : stepNum}
                          </div>
                          
                          {/* Small Progress Line */}
                          {index < 3 && (
                            <div className={`w-3 h-px mx-1 transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-400' : 'bg-white/30'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Simple indicator for other services */}
                {preSelectedService !== 'voos' && (
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {/* Right spacer */}
              <div className="w-12"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* App Container - FIXED HEIGHT, NO SCROLLING */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Main Content Area - Fixed Height */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'home' && (
                <div className="h-full flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
                  {/* Optimized Full-Screen Distribution */}
                  <div className="h-full flex flex-col px-2 py-0">
                    
                    {/* Compact Top Section - 15% */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center mb-2 flex-shrink-0"
                      style={{ height: '15%' }}
                    >
                      <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
                        Onde vamos hoje?
                      </h1>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1 bg-success-50 px-3 py-2 rounded-2xl shadow-neu-sm border border-success-200/50">
                          <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-success-700">Promoções ativas</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-accent-50 px-3 py-2 rounded-2xl shadow-neu-sm border border-accent-200/50">
                          <span className="text-xs font-semibold text-accent-700">✨ Até 70% OFF</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* ULTRATHINK: Enhanced Mobile Services Section - Optimized for Touch */}
                    <div className="flex-grow flex flex-col justify-center mb-2" style={{ height: '50%' }}>
                      <div className="grid grid-cols-2 gap-2 h-full">
                        {[
                          { key: 'voos', icon: '✈️', label: 'Voos', subtitle: 'Passagens aéreas', bgColor: 'bg-white', iconBg: 'bg-primary-100', iconColor: 'text-primary-600', textColor: 'text-neutral-800', popular: true },
                          { key: 'hoteis', icon: '🏨', label: 'Hotéis', subtitle: 'Hospedagem', bgColor: 'bg-white', iconBg: 'bg-success-100', iconColor: 'text-success-600', textColor: 'text-neutral-800', popular: false },
                          { key: 'carros', icon: '🚗', label: 'Carros', subtitle: 'Aluguel', bgColor: 'bg-white', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', textColor: 'text-neutral-800', popular: false },
                          { key: 'passeios', icon: '🎯', label: 'Passeios', subtitle: 'Tours', bgColor: 'bg-white', iconBg: 'bg-accent-100', iconColor: 'text-accent-600', textColor: 'text-neutral-800', popular: false },
                          { key: 'seguro', icon: '🛡️', label: 'Seguro', subtitle: 'Proteção viagem', bgColor: 'bg-white', iconBg: 'bg-warning-100', iconColor: 'text-warning-600', textColor: 'text-neutral-800', popular: false }
                        ].map((service, index) => (
                          <motion.div
                            key={service.label}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05, type: "spring", damping: 20 }}
                            className="relative h-full"
                          >
                            {service.popular && (
                              <div className="absolute -top-2 -right-2 z-10">
                                <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-neu-md">
                                  🔥 Popular
                                </div>
                              </div>
                            )}
                            <motion.button
                              onClick={() => handleServiceSelection(service.key)}
                              className={`w-full h-full ${service.bgColor} rounded-2xl p-4 shadow-neu-lg hover:shadow-neu-xl border border-neutral-200/50 relative overflow-hidden transition-all duration-300`}
                              whileTap={{ scale: 0.95 }}
                              whileHover={{ scale: 1.02, y: -1 }}
                              transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            >
                              <div className="text-center h-full flex flex-col justify-center space-y-3">
                                <div className={`w-16 h-16 ${service.iconBg} rounded-2xl mx-auto flex items-center justify-center shadow-neu-sm`}>
                                  <span className="text-2xl">{service.icon}</span>
                                </div>
                                <div>
                                  <div className={`text-base font-bold ${service.textColor} mb-1`}>{service.label}</div>
                                  <div className="text-xs text-neutral-600">{service.subtitle}</div>
                                </div>
                              </div>
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced CTA + Social Proof - 35% */}
                    <div className="flex-shrink-0 space-y-2" style={{ height: '35%' }}>
                      {/* Main CTA */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-neu-lg p-4 border border-neutral-200/50"
                      >
                        <motion.button
                          onClick={handleGenericQuote}
                          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl py-4 font-bold text-base shadow-glow-md min-h-[48px] active:shadow-glow-sm transition-all duration-200"
                          whileTap={{ scale: 0.96 }}
                          whileHover={{ 
                            scale: 1.02,
                            y: -1
                          }}
                          style={{ touchAction: 'manipulation' }}
                        >
                          <div className="flex items-center justify-center space-x-3">
                            <span className="text-lg">⚡</span>
                            <span>Buscar Ofertas Grátis</span>
                          </div>
                        </motion.button>
                      </motion.div>
                      
                      {/* Enhanced Social Proof */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-neutral-50 rounded-2xl p-4 shadow-neu-inset border border-neutral-200/50"
                      >
                        <div className="flex items-center justify-between text-center mb-3">
                          <div className="flex-1">
                            <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">150K+</div>
                            <div className="text-xs text-neutral-600 font-medium">Clientes felizes</div>
                          </div>
                          <div className="w-px h-10 bg-gradient-to-b from-transparent via-neutral-300 to-transparent" />
                          <div className="flex-1">
                            <div className="text-lg font-bold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">4.9★</div>
                            <div className="text-xs text-neutral-600 font-medium">Avaliação média</div>
                          </div>
                          <div className="w-px h-10 bg-gradient-to-b from-transparent via-neutral-300 to-transparent" />
                          <div className="flex-1">
                            <div className="text-lg font-bold bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">2min</div>
                            <div className="text-xs text-neutral-600 font-medium">Cotação rápida</div>
                          </div>
                        </div>
                        
                        {/* Premium trust badges */}
                        <div className="flex items-center justify-center space-x-3">
                          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-green-700">🔒 100% Seguro</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                            <span className="text-xs font-semibold text-blue-700">✨ Gratuito</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'search' && (
                <div className="h-full flex items-center justify-center bg-blue-50">
                  <div className="text-center p-6">
                    <MagnifyingGlassIcon className="w-14 h-14 text-blue-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Explorar Serviços</h2>
                    <p className="text-gray-600 mb-3">Descubra as melhores ofertas de viagem</p>
                    <button
                      onClick={handleGenericQuote}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Buscar Ofertas
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="h-full flex items-center justify-center bg-rose-50">
                  <div className="text-center p-6">
                    <HeartIcon className="w-14 h-14 text-rose-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Seus Favoritos</h2>
                    <p className="text-gray-600 mb-3">Salve suas viagens dos sonhos</p>
                    <button
                      onClick={handleGenericQuote}
                      className="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Explorar Destinos
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="h-full flex items-center justify-center bg-orange-50">
                  <div className="text-center p-6">
                    <UserIcon className="w-14 h-14 text-orange-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Meu Perfil</h2>
                    <p className="text-gray-600 mb-3">Gerencie suas informações</p>
                    <button
                      onClick={handleGenericQuote}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Começar Cotação
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modern Enhanced Bottom Navigation - Hidden when lead form is active */}
        {!leadFormEmbedded && (
          <div className="bg-white/95 backdrop-blur-xl border-t border-neutral-200/50 px-2 py-2 pb-safe-bottom shadow-neu-lg relative z-50">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/20 to-transparent"></div>
          <div className="flex justify-around relative z-10">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = isActive ? tab.iconSolid : tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-3 px-2 relative min-h-[56px] flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.03 }}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? `bg-white shadow-neu-md border border-neutral-200/50` 
                        : 'hover:bg-neutral-50'
                    }`}>
                      <IconComponent 
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? `${tab.color}` : 'text-neutral-400'
                        }`} 
                      />
                    </div>
                    <span className={`text-xs mt-1 font-semibold transition-all duration-300 ${
                      isActive ? `${tab.color}` : 'text-neutral-400'
                    }`}>
                      {tab.label}
                    </span>
                  </div>

                  {/* Premium Active Indicator */}
                  {isActive && (
                    <motion.div
                      className={`absolute -top-0.5 left-1/2 w-8 h-1 bg-gradient-to-r ${tab.gradient} rounded-full shadow-lg`}
                      layoutId="activeIndicator"
                      style={{ x: '-50%' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    />
                  )}

                  {/* Glow Effect */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tab.gradient} opacity-5 blur-sm`}
                      layoutId="glowEffect"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* ULTRATHINK Mobile Social Proof Badge - Only when NOT in form mode */}
      {!leadFormEmbedded && <MobileSocialProofBadge />}

      {/* ULTRATHINK Mobile Multi-Step Lead Form - Positioned below headers with lower z-index */}
      {leadFormEmbedded && (
        <div className="fixed inset-0 z-20" style={{ paddingTop: '80px' }}>
          {/* z-20 is below headers (z-50 and z-40) but above regular content */}
          {/* 80px = 48px (header) + 32px (compact step nav) */}
          <MobileLeadCaptureCorrect 
            onSubmit={handleLeadFormSubmit}
            onClose={handleBackToHome}
            preSelectedService={preSelectedService}
            className="h-full"
            isEmbedded={true}
          />
        </div>
      )}

      <style jsx={true} global={true}>{`
        .h-safe-top {
          height: env(safe-area-inset-top);
        }
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Ensure no scrolling on mobile */
        html, body {
          overflow: hidden;
          height: 100vh;
          position: fixed;
          width: 100%;
        }
        
        @media (max-width: 768px) {
          body {
            touch-action: manipulation;
            -webkit-overflow-scrolling: none;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
}