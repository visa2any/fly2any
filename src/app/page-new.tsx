'use client';

import React, { useState, useEffect } from 'react';
import { trackFormSubmit, trackQuoteRequest } from '@/lib/analytics-safe';
import LiveSiteHeader from '@/components/home/LiveSiteHeader';
import LiveSiteFooter from '@/components/home/LiveSiteFooter';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import MobileUnifiedLeadForm from '@/components/mobile/MobileUnifiedLeadForm';
import MobileFlightFormUnified from '@/components/mobile/MobileFlightFormUnified';
import MobileHotelFormUnified from '@/components/mobile/MobileHotelFormUnified';
import MobileCarFormUnified from '@/components/mobile/MobileCarFormUnified';
import MobileTourFormUnified from '@/components/mobile/MobileTourFormUnified';
import MobileInsuranceFormUnified from '@/components/mobile/MobileInsuranceFormUnified';
import MobileSuccessModal from '@/components/mobile/MobileSuccessModal';
import UnifiedMobileBottomNav from '@/components/mobile/UnifiedMobileBottomNav';
import AI2025FAQ from '@/components/seo/AI2025FAQ';
import FloatingChat from '@/components/FloatingChat';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import styles from './page.module.css';

interface ServiceData {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed: boolean;
}

export default function Home() {
  // Mobile form states
  const [showMobileFlightForm, setShowMobileFlightForm] = useState(false);
  const [showMobileHotelForm, setShowMobileHotelForm] = useState(false);
  const [showMobileCarForm, setShowMobileCarForm] = useState(false);
  const [showMobileTourForm, setShowMobileTourForm] = useState(false);
  const [showMobileInsuranceForm, setShowMobileInsuranceForm] = useState(false);
  const [showMobileSuccessModal, setShowMobileSuccessModal] = useState(false);
  const [mobileSuccessData, setMobileSuccessData] = useState<any>(null);

  // Track analytics on mount
  useEffect(() => {
    trackQuoteRequest('homepage_view');
  }, []);

  // Handle mobile form submission
  const handleMobileSubmit = async (data: any, serviceType: string) => {
    try {
      // Track form submission
      await trackFormSubmit(serviceType, data);

      // Send to API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          serviceType,
          source: 'mobile_app_homepage',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMobileSuccessData({ ...data, serviceType });
        setShowMobileSuccessModal(true);

        // Close the form
        setShowMobileFlightForm(false);
        setShowMobileHotelForm(false);
        setShowMobileCarForm(false);
        setShowMobileTourForm(false);
        setShowMobileInsuranceForm(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <>
      <GlobalMobileStyles />

      {/* Header */}
      <LiveSiteHeader />

      {/* Mobile App Experience */}
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">

        {/* Hero Section - Mobile App Style */}
        <div className="relative px-4 pt-20 pb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            🇧🇷 Voos para o Brasil
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Especialistas em viagens Brasil-EUA desde 2014
            <br />
            <span className="text-sky-600 font-semibold">Cotação grátis em 2 horas!</span>
          </p>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-semibold">⭐ 15K+ Clientes</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-semibold">✓ 4.9 Avaliação</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-semibold">✨ Grátis</span>
            </div>
          </div>
        </div>

        {/* Service Cards - Mobile App Grid */}
        <div className="px-4 pb-24">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">

            {/* Flights Card */}
            <button
              onClick={() => setShowMobileFlightForm(true)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="text-5xl mb-3">✈️</div>
              <h3 className="font-bold text-gray-900 mb-1">Voos</h3>
              <p className="text-xs text-gray-600">Melhores tarifas</p>
            </button>

            {/* Hotels Card */}
            <button
              onClick={() => setShowMobileHotelForm(true)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="text-5xl mb-3">🏨</div>
              <h3 className="font-bold text-gray-900 mb-1">Hotéis</h3>
              <p className="text-xs text-gray-600">Reservas seguras</p>
            </button>

            {/* Cars Card */}
            <button
              onClick={() => setShowMobileCarForm(true)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="text-5xl mb-3">🚗</div>
              <h3 className="font-bold text-gray-900 mb-1">Carros</h3>
              <p className="text-xs text-gray-600">Aluguel fácil</p>
            </button>

            {/* Tours Card */}
            <button
              onClick={() => setShowMobileTourForm(true)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="text-5xl mb-3">🎫</div>
              <h3 className="font-bold text-gray-900 mb-1">Passeios</h3>
              <p className="text-xs text-gray-600">Experiências</p>
            </button>

            {/* Insurance Card - Full Width */}
            <button
              onClick={() => setShowMobileInsuranceForm(true)}
              className="col-span-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="text-5xl mb-3">🛡️</div>
              <h3 className="font-bold text-white mb-1">Seguro Viagem</h3>
              <p className="text-sm text-sky-100">Proteção 24h mundial</p>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-center">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🔒</div>
              <span className="text-sm text-gray-700 font-medium">100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">⚡</div>
              <span className="text-sm text-gray-700 font-medium">2h Resposta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">✨</div>
              <span className="text-sm text-gray-700 font-medium">Cotação Grátis</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="px-4 pb-24 max-w-4xl mx-auto">
          <AI2025FAQ
            language="pt"
            showSearch={true}
            enableVoiceSearch={true}
            categoryFilter={true}
            maxVisible={10}
          />
        </div>
      </div>

      {/* Mobile Forms - Full Screen Overlays */}
      {showMobileFlightForm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen pb-20">
            <MobileFlightFormUnified
              mode="premium"
              showNavigation={true}
              onClose={() => setShowMobileFlightForm(false)}
              onSubmit={(data) => handleMobileSubmit(data, 'voos')}
            />
          </div>
          <UnifiedMobileBottomNav
            activeTab="flights"
            onHomeClick={() => setShowMobileFlightForm(false)}
            onChatClick={() => window.open('https://wa.me/551151944717', '_blank')}
            onVoosClick={() => {}}
            onHotelClick={() => {
              setShowMobileFlightForm(false);
              setShowMobileHotelForm(true);
            }}
            onCarClick={() => {
              setShowMobileFlightForm(false);
              setShowMobileCarForm(true);
            }}
          />
        </div>
      )}

      {showMobileHotelForm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen pb-20">
            <MobileHotelFormUnified
              mode="premium"
              showNavigation={true}
              onClose={() => setShowMobileHotelForm(false)}
              onSubmit={(data) => handleMobileSubmit(data, 'hoteis')}
            />
          </div>
          <UnifiedMobileBottomNav
            activeTab="hotels"
            onHomeClick={() => setShowMobileHotelForm(false)}
            onChatClick={() => window.open('https://wa.me/551151944717', '_blank')}
            onVoosClick={() => {
              setShowMobileHotelForm(false);
              setShowMobileFlightForm(true);
            }}
            onHotelClick={() => {}}
            onCarClick={() => {
              setShowMobileHotelForm(false);
              setShowMobileCarForm(true);
            }}
          />
        </div>
      )}

      {showMobileCarForm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen pb-20">
            <MobileCarFormUnified
              mode="premium"
              showNavigation={true}
              onClose={() => setShowMobileCarForm(false)}
              onSubmit={(data) => handleMobileSubmit(data, 'carros')}
            />
          </div>
          <UnifiedMobileBottomNav
            activeTab="cars"
            onHomeClick={() => setShowMobileCarForm(false)}
            onChatClick={() => window.open('https://wa.me/551151944717', '_blank')}
            onVoosClick={() => {
              setShowMobileCarForm(false);
              setShowMobileFlightForm(true);
            }}
            onHotelClick={() => {
              setShowMobileCarForm(false);
              setShowMobileHotelForm(true);
            }}
            onCarClick={() => {}}
          />
        </div>
      )}

      {showMobileTourForm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen pb-20">
            <MobileTourFormUnified
              mode="premium"
              showNavigation={true}
              onClose={() => setShowMobileTourForm(false)}
              onSubmit={(data) => handleMobileSubmit(data, 'passeios')}
            />
          </div>
          <UnifiedMobileBottomNav
            activeTab="home"
            onHomeClick={() => setShowMobileTourForm(false)}
            onChatClick={() => window.open('https://wa.me/551151944717', '_blank')}
            onVoosClick={() => {
              setShowMobileTourForm(false);
              setShowMobileFlightForm(true);
            }}
            onHotelClick={() => {
              setShowMobileTourForm(false);
              setShowMobileHotelForm(true);
            }}
            onCarClick={() => {
              setShowMobileTourForm(false);
              setShowMobileCarForm(true);
            }}
          />
        </div>
      )}

      {showMobileInsuranceForm && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen pb-20">
            <MobileInsuranceFormUnified
              mode="premium"
              showNavigation={true}
              onClose={() => setShowMobileInsuranceForm(false)}
              onSubmit={(data) => handleMobileSubmit(data, 'seguro')}
            />
          </div>
          <UnifiedMobileBottomNav
            activeTab="home"
            onHomeClick={() => setShowMobileInsuranceForm(false)}
            onChatClick={() => window.open('https://wa.me/551151944717', '_blank')}
            onVoosClick={() => {
              setShowMobileInsuranceForm(false);
              setShowMobileFlightForm(true);
            }}
            onHotelClick={() => {
              setShowMobileInsuranceForm(false);
              setShowMobileHotelForm(true);
            }}
            onCarClick={() => {
              setShowMobileInsuranceForm(false);
              setShowMobileCarForm(true);
            }}
          />
        </div>
      )}

      {/* Success Modal */}
      <MobileSuccessModal
        isOpen={showMobileSuccessModal}
        onClose={() => setShowMobileSuccessModal(false)}
        leadData={mobileSuccessData}
      />

      {/* Floating Chat */}
      <FloatingChat />

      {/* Exit Intent */}
      <ExitIntentPopup />

      {/* Footer */}
      <LiveSiteFooter />
    </>
  );
}
