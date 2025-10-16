'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBlogEngagement } from '@/lib/hooks/useBlogEngagement';
import {
  getTimeRemaining,
  formatCountdown,
  getUrgencyLevel,
  getUrgencyBgColor,
  sortDealsByUrgency,
  filterActiveDeals,
  type Deal,
} from '@/lib/utils/dealCountdown';
import { trackDealClick } from '@/lib/analytics/blogAnalytics';
import { Radar, MapPin, Clock, TrendingDown, Plane, Settings2 } from 'lucide-react';

interface DealRadarProps {
  deals: Deal[];
  language?: 'en' | 'pt' | 'es';
  className?: string;
  maxDisplay?: number;
}

const DealRadar: React.FC<DealRadarProps> = ({
  deals,
  language = 'en',
  className = '',
  maxDisplay = 5,
}) => {
  const { preferences, updatePreferences } = useBlogEngagement();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(
    preferences.homeAirport || ''
  );
  const [currentTime, setCurrentTime] = useState(Date.now());

  const translations = {
    en: {
      title: 'Deal Radar',
      subtitle: 'Deals from your home airport',
      setAirport: 'Set Home Airport',
      changeAirport: 'Change',
      save: 'Save',
      cancel: 'Cancel',
      noAirport: 'Set your home airport to see relevant deals',
      noDeals: 'No active deals from',
      checkBack: 'Check back soon for new deals!',
      viewDeal: 'View Deal',
      expiresIn: 'Expires in',
      discount: 'OFF',
      from: 'from',
    },
    pt: {
      title: 'Radar de Ofertas',
      subtitle: 'Ofertas do seu aeroporto',
      setAirport: 'Definir Aeroporto',
      changeAirport: 'Alterar',
      save: 'Salvar',
      cancel: 'Cancelar',
      noAirport: 'Defina seu aeroporto para ver ofertas relevantes',
      noDeals: 'Nenhuma oferta ativa de',
      checkBack: 'Volte em breve para novas ofertas!',
      viewDeal: 'Ver Oferta',
      expiresIn: 'Expira em',
      discount: 'DESC',
      from: 'de',
    },
    es: {
      title: 'Radar de Ofertas',
      subtitle: 'Ofertas desde tu aeropuerto',
      setAirport: 'Establecer Aeropuerto',
      changeAirport: 'Cambiar',
      save: 'Guardar',
      cancel: 'Cancelar',
      noAirport: 'Establece tu aeropuerto para ver ofertas relevantes',
      noDeals: 'No hay ofertas activas desde',
      checkBack: 'Vuelve pronto para nuevas ofertas!',
      viewDeal: 'Ver Oferta',
      expiresIn: 'Expira en',
      discount: 'DESC',
      from: 'desde',
    },
  };

  const t = translations[language];

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Common airports (can be expanded)
  const commonAirports = [
    { code: 'GRU', name: 'Sao Paulo (GRU)', country: 'Brazil' },
    { code: 'GIG', name: 'Rio de Janeiro (GIG)', country: 'Brazil' },
    { code: 'BSB', name: 'Brasilia (BSB)', country: 'Brazil' },
    { code: 'CGH', name: 'Sao Paulo Congonhas (CGH)', country: 'Brazil' },
    { code: 'SSA', name: 'Salvador (SSA)', country: 'Brazil' },
    { code: 'FOR', name: 'Fortaleza (FOR)', country: 'Brazil' },
    { code: 'POA', name: 'Porto Alegre (POA)', country: 'Brazil' },
    { code: 'LIS', name: 'Lisbon (LIS)', country: 'Portugal' },
    { code: 'OPO', name: 'Porto (OPO)', country: 'Portugal' },
    { code: 'MAD', name: 'Madrid (MAD)', country: 'Spain' },
    { code: 'BCN', name: 'Barcelona (BCN)', country: 'Spain' },
    { code: 'JFK', name: 'New York JFK (JFK)', country: 'USA' },
    { code: 'LAX', name: 'Los Angeles (LAX)', country: 'USA' },
    { code: 'MIA', name: 'Miami (MIA)', country: 'USA' },
    { code: 'LHR', name: 'London (LHR)', country: 'UK' },
    { code: 'CDG', name: 'Paris (CDG)', country: 'France' },
  ];

  // Filter deals by user's home airport
  const relevantDeals = useMemo(() => {
    if (!preferences.homeAirport || !deals || deals.length === 0) return [];

    const activeDeals = filterActiveDeals(deals);
    const filtered = activeDeals.filter(
      (deal) =>
        deal.fromAirport &&
        deal.fromAirport.toLowerCase() === preferences.homeAirport?.toLowerCase()
    );

    return sortDealsByUrgency(filtered).slice(0, maxDisplay);
  }, [deals, preferences.homeAirport, maxDisplay]);

  const handleSaveAirport = () => {
    updatePreferences({ homeAirport: selectedAirport });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedAirport(preferences.homeAirport || '');
    setIsEditing(false);
  };

  const handleDealClick = (deal: Deal) => {
    trackDealClick(deal.id, deal.title, deal.price, deal.toDestination);
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radar className="w-6 h-6 text-blue-600 animate-pulse" />
            <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-25"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t.title}</h3>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>
        </div>
        {preferences.homeAirport && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Settings2 className="w-4 h-4" />
            {t.changeAirport}
          </button>
        )}
      </div>

      {/* Airport Selection */}
      {(!preferences.homeAirport || isEditing) && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-blue-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.setAirport}
          </label>
          <select
            value={selectedAirport}
            onChange={(e) => setSelectedAirport(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          >
            <option value="">Select airport...</option>
            {commonAirports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAirport}
              disabled={!selectedAirport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t.save}
            </button>
            {isEditing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Airport Set */}
      {!preferences.homeAirport && !isEditing && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">{t.noAirport}</p>
        </div>
      )}

      {/* No Deals */}
      {preferences.homeAirport && relevantDeals.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">
            {t.noDeals} {preferences.homeAirport}
          </p>
          <p className="text-sm text-gray-500">{t.checkBack}</p>
        </div>
      )}

      {/* Deals List */}
      {preferences.homeAirport && relevantDeals.length > 0 && !isEditing && (
        <div className="space-y-3">
          {relevantDeals.map((deal) => {
            const timeRemaining = getTimeRemaining(deal.expiryDate);
            const urgency = getUrgencyLevel(timeRemaining);
            const urgencyClasses = getUrgencyBgColor(urgency);

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                onClick={() => handleDealClick(deal)}
                className="block bg-white rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-300"
              >
                {/* Deal Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {deal.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {deal.fromAirport} → {deal.toDestination}
                      </span>
                    </div>
                  </div>
                  {deal.discount && (
                    <div className="flex-shrink-0 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                      {deal.discount}% {t.discount}
                    </div>
                  )}
                </div>

                {/* Price */}
                {deal.price && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ${deal.price}
                    </span>
                    {deal.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${deal.originalPrice}
                      </span>
                    )}
                  </div>
                )}

                {/* Countdown */}
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded ${urgencyClasses}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {t.expiresIn}: {formatCountdown(timeRemaining, language, true)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* View All Deals Link */}
      {preferences.homeAirport && relevantDeals.length >= maxDisplay && (
        <Link
          href="/deals"
          className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all deals from {preferences.homeAirport} →
        </Link>
      )}
    </div>
  );
};

export default DealRadar;
