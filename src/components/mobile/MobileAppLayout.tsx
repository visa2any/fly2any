'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid';
import PremiumMobileLeadForm from '@/components/mobile/PremiumMobileLeadForm';
import MobileFlightForm from '@/components/mobile/MobileFlightForm';
import MobileHotelForm from '@/components/mobile/MobileHotelForm';
import MobileCarForm from '@/components/mobile/MobileCarForm';
import MobilePackageForm from '@/components/mobile/MobilePackageForm';
import { ChevronLeftIcon } from '@/heroicons/react/24/outline';

interface MobileAppLayoutProps {
  children: React.ReactNode;
}

type TabType = 'home' | 'search' | 'favorites' | 'profile' | 'chat';
type ServiceType = 'flights' | 'hotels' | 'cars' | 'packages' | null;

export default function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentService, setCurrentService] = useState<ServiceType>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Service context configuration
  const serviceContext = {
    flights: { title: 'Busca de Voos', icon: '✈️', color: 'from-blue-500 via-blue-600 to-cyan-600' },
    hotels: { title: 'Busca de Hotéis', icon: '🏨', color: 'from-emerald-500 via-green-600 to-teal-600' },
    cars: { title: 'Aluguel de Carros', icon: '🚗', color: 'from-purple-500 via-violet-600 to-indigo-600' },
    packages: { title: 'Pacotes Completos', icon: '🌟', color: 'from-rose-500 via-pink-600 to-fuchsia-600' }
  };

  // Handle service selection - no more modals!
  const handleServiceSelection = (service: ServiceType) => {
    setCurrentService(service);
    setActiveTab('search');
  };

  // Handle back navigation
  const handleBackToHome = () => {
    setCurrentService(null);
    setActiveTab('home');
  };

  // Handle search completions for all services
  const handleFlightSearch = (searchData: any) => {
    console.log('Flight search:', searchData);
    // Here we would typically navigate to results or handle the search
    // For now, let's show the lead form as a fallback
    setShowLeadForm(true);
  };

  const handleHotelSearch = (searchData: any) => {
    console.log('Hotel search:', searchData);
    setShowLeadForm(true);
  };

  const handleCarSearch = (searchData: any) => {
    console.log('Car search:', searchData);
    setShowLeadForm(true);
  };

  const handlePackageSearch = (searchData: any) => {
    console.log('Package search:', searchData);
    setShowLeadForm(true);
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
      label: 'Buscar',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
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
      id: 'chat' as TabType,
      label: 'Chat',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatBubbleLeftRightIconSolid,
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
      gradient: 'from-emerald-500 to-teal-500'
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

  const handleQuoteRequest = () => {
    setShowLeadForm(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      {/* Status Bar Overlay - Premium Gradient */}
      <div className="h-safe-top bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600" />
      
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
                <div className="h-full flex flex-col">
                  {/* Hero Header - Premium Gradient */}
                  <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 p-6 pb-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 left-4 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                      <div className="absolute top-12 right-8 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
                      <div className="absolute bottom-4 left-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center"
                    >
                      <h1 className="text-2xl font-bold text-white mb-2">
                        ✈️ Fly2Any
                      </h1>
                      <p className="text-blue-100 text-sm">
                        Sua viagem dos sonhos começa aqui
                      </p>
                    </motion.div>
                  </div>

                  {/* Quick Actions - Fixed Height */}
                  <div className="px-4 -mt-4 flex-1 flex flex-col">
                    {/* Main CTA Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-2xl shadow-lg p-6 mb-4"
                    >
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <PlusCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          Nova Cotação
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Receba as melhores ofertas em minutos
                        </p>
                      </div>
                      
                      <motion.button
                        onClick={handleQuoteRequest}
                        className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-2xl py-5 font-bold text-lg shadow-2xl shadow-purple-500/30 border border-white/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(139, 69, 195, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl">✨</span>
                          <span>Solicitar Cotação Grátis</span>
                        </div>
                      </motion.button>
                    </motion.div>

                    {/* Quick Services Grid - Premium Cards */}
                    <div className="grid grid-cols-2 gap-3 flex-1 max-h-40">
                      {[
                        { key: 'flights', icon: '✈️', label: 'Voos', color: 'from-blue-500 via-blue-600 to-cyan-600', glow: 'shadow-blue-500/20' },
                        { key: 'hotels', icon: '🏨', label: 'Hotéis', color: 'from-emerald-500 via-green-600 to-teal-600', glow: 'shadow-green-500/20' },
                        { key: 'cars', icon: '🚗', label: 'Carros', color: 'from-purple-500 via-violet-600 to-indigo-600', glow: 'shadow-purple-500/20' },
                        { key: 'packages', icon: '🌟', label: 'Pacotes', color: 'from-rose-500 via-pink-600 to-fuchsia-600', glow: 'shadow-rose-500/20' }
                      ].map((service, index) => (
                        <motion.button
                          key={service.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          onClick={() => handleServiceSelection(service.key as ServiceType)}
                          className={`bg-gradient-to-br ${service.color} rounded-2xl p-4 text-white shadow-lg ${service.glow} backdrop-blur-sm border border-white/10`}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="text-2xl mb-1">{service.icon}</div>
                          <div className="text-sm font-medium">{service.label}</div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Stats Bar - Fixed Height */}
                    <div className="bg-white rounded-xl p-4 mt-4 shadow-sm">
                      <div className="flex justify-around text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">50K+</div>
                          <div className="text-xs text-gray-600">Viajantes</div>
                        </div>
                        <div className="border-l border-gray-200" />
                        <div>
                          <div className="text-lg font-bold text-purple-600">4.9★</div>
                          <div className="text-xs text-gray-600">Avaliação</div>
                        </div>
                        <div className="border-l border-gray-200" />
                        <div>
                          <div className="text-lg font-bold text-green-600">24h</div>
                          <div className="text-xs text-gray-600">Suporte</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'search' && (
                <div className="h-full bg-gray-50">
                  {/* Service Header with Back Navigation */}
                  {currentService && (
                    <div className="flex items-center gap-3 p-4 bg-white border-b shadow-sm sticky top-0 z-10">
                      <button 
                        onClick={handleBackToHome}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{serviceContext[currentService]?.icon}</span>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {serviceContext[currentService]?.title}
                        </h2>
                      </div>
                    </div>
                  )}

                  {/* Service-Specific Forms */}
                  <div className="h-full">
                    {currentService === 'flights' && (
                      <MobileFlightForm 
                        onSearch={handleFlightSearch}
                        className="h-full"
                      />
                    )}
                    
                    {currentService === 'hotels' && (
                      <MobileHotelForm 
                        onSearch={handleHotelSearch}
                        className="h-full"
                      />
                    )}
                    
                    {currentService === 'cars' && (
                      <MobileCarForm 
                        onSearch={handleCarSearch}
                        className="h-full"
                      />
                    )}
                    
                    {currentService === 'packages' && (
                      <MobilePackageForm 
                        onSearch={handlePackageSearch}
                        className="h-full"
                      />
                    )}

                    {/* Default search state */}
                    {!currentService && (
                      <div className="h-full flex items-center justify-center p-6">
                        <div className="text-center">
                          <MagnifyingGlassIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Escolha um Serviço</h3>
                          <p className="text-gray-600">Volte ao início e selecione o serviço desejado</p>
                          <button
                            onClick={handleBackToHome}
                            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                          >
                            Voltar ao Início
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="h-full flex items-center justify-center bg-rose-50">
                  <div className="text-center p-6">
                    <HeartIcon className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Seus Favoritos</h2>
                    <p className="text-gray-600 mb-4">Salve suas viagens dos sonhos</p>
                    <button
                      onClick={() => setShowLeadForm(true)}
                      className="bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Explorar Destinos
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-full flex items-center justify-center bg-green-50">
                  <div className="text-center p-6">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Chat Suporte</h2>
                    <p className="text-gray-600 mb-4">Converse com nossos especialistas</p>
                    <button
                      onClick={() => setShowLeadForm(true)}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Iniciar Conversa
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="h-full flex items-center justify-center bg-orange-50">
                  <div className="text-center p-6">
                    <UserIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Meu Perfil</h2>
                    <p className="text-gray-600 mb-4">Gerencie suas informações</p>
                    <button
                      onClick={() => setShowLeadForm(true)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Fazer Login
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation - Premium Design */}
        <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 px-2 py-2 pb-safe-bottom shadow-2xl shadow-black/5">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = isActive ? tab.iconSolid : tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2 px-1 relative"
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? `${tab.bgColor} shadow-lg shadow-${tab.color.split('-')[1]}-500/20 border border-white/30` 
                        : 'hover:bg-gray-50'
                    }`}>
                      <IconComponent 
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive ? `${tab.color} drop-shadow-sm` : 'text-gray-400'
                        }`} 
                      />
                    </div>
                    <span className={`text-xs mt-1 font-semibold transition-all duration-300 ${
                      isActive ? `${tab.color} drop-shadow-sm` : 'text-gray-400'
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
      </div>

      {/* Premium Lead Form Modal */}
      <PremiumMobileLeadForm
        isOpen={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        context="mobile-app"
      />

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