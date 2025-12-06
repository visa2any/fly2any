/**
 * Save Search Button & Modal
 *
 * State-of-the-art saved search functionality with:
 * - Authentication-gated saving
 * - Server-side persistence (database)
 * - Price drop alerts integration
 * - Seamless auth modal flow
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Star, Check, TrendingDown, X, Loader2, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FeatureAuthModal } from '@/components/auth/FeatureAuthModal';
import { FlightFilters } from '@/components/flights/FlightFilters';
import {
  saveSearch as saveToLocalStorage,
  generateSearchName,
  type SavedSearch
} from '@/lib/filters/savedSearches';

interface SaveSearchButtonProps {
  route: {
    from: string;
    to: string;
    departure: string;
    return?: string;
    adults: number;
    children: number;
    infants: number;
    class: 'economy' | 'premium' | 'business' | 'first';
  };
  filters: FlightFilters;
  currentPrice: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    save: 'Save Search',
    saved: 'Saved!',
    saving: 'Saving...',
    modalTitle: 'Save this search',
    searchName: 'Search name',
    searchNamePlaceholder: 'e.g., NYC to Paris - Summer trip',
    priceAlert: 'Price alert',
    priceAlertDesc: 'Get notified when price drops below:',
    currentPrice: 'Current price',
    targetPrice: 'Alert me when price is',
    orLower: 'or lower',
    saveButton: 'Save search',
    cancel: 'Cancel',
    savings: 'Save ${amount}',
    successMessage: 'Search saved! You can access it from your account.',
    errorMessage: 'Failed to save search. Please try again.',
  },
  pt: {
    save: 'Salvar Busca',
    saved: 'Salvo!',
    saving: 'Salvando...',
    modalTitle: 'Salvar esta busca',
    searchName: 'Nome da busca',
    searchNamePlaceholder: 'ex: NYC para Paris - Viagem de verão',
    priceAlert: 'Alerta de preço',
    priceAlertDesc: 'Ser notificado quando o preço cair abaixo de:',
    currentPrice: 'Preço atual',
    targetPrice: 'Alertar quando o preço for',
    orLower: 'ou menor',
    saveButton: 'Salvar busca',
    cancel: 'Cancelar',
    savings: 'Economize ${amount}',
    successMessage: 'Busca salva! Você pode acessá-la na sua conta.',
    errorMessage: 'Falha ao salvar busca. Tente novamente.',
  },
  es: {
    save: 'Guardar Búsqueda',
    saved: '¡Guardado!',
    saving: 'Guardando...',
    modalTitle: 'Guardar esta búsqueda',
    searchName: 'Nombre de búsqueda',
    searchNamePlaceholder: 'ej: NYC a París - Viaje de verano',
    priceAlert: 'Alerta de precio',
    priceAlertDesc: 'Recibir notificación cuando el precio baje de:',
    currentPrice: 'Precio actual',
    targetPrice: 'Alertarme cuando el precio sea',
    orLower: 'o menor',
    saveButton: 'Guardar búsqueda',
    cancel: 'Cancelar',
    savings: 'Ahorra ${amount}',
    successMessage: '¡Búsqueda guardada! Puedes accederla desde tu cuenta.',
    errorMessage: 'Error al guardar búsqueda. Intenta de nuevo.',
  }
};

export default function SaveSearchButton({
  route,
  filters,
  currentPrice,
  lang = 'en'
}: SaveSearchButtonProps) {
  const { data: session, status } = useSession();
  const t = content[lang];

  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [enableAlert, setEnableAlert] = useState(true);
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9));
  const [pendingAction, setPendingAction] = useState(false);

  // Generate default search name
  const defaultName = generateSearchName(route, filters);

  // Handle pending action after successful auth
  useEffect(() => {
    if (pendingAction && session?.user) {
      setPendingAction(false);
      setShowModal(true);
    }
  }, [session, pendingAction]);

  const handleOpenModal = () => {
    // If not authenticated, show auth modal first
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setPendingAction(true); // Will open save modal after session updates
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error('Please sign in to save searches');
      return;
    }

    setIsLoading(true);

    try {
      // Save to server (database)
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName || defaultName,
          origin: route.from,
          destination: route.to,
          departDate: route.departure,
          returnDate: route.return || null,
          adults: route.adults,
          children: route.children,
          infants: route.infants,
          cabinClass: route.class,
          filters: filters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save search');
      }

      // Also create price alert if enabled
      if (enableAlert && targetPrice < currentPrice) {
        try {
          await fetch('/api/price-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: route.from,
              destination: route.to,
              departDate: route.departure,
              returnDate: route.return || null,
              currentPrice: currentPrice,
              targetPrice: targetPrice,
              currency: 'USD',
            }),
          });
        } catch (alertError) {
          console.error('Failed to create price alert:', alertError);
          // Don't fail the whole operation if alert creation fails
        }
      }

      // Also save to localStorage for offline access
      const savedSearch: Omit<SavedSearch, 'id' | 'createdAt'> = {
        name: searchName || defaultName,
        route,
        filters,
        priceAlert: enableAlert ? {
          enabled: true,
          targetPrice,
          currentPrice
        } : undefined
      };
      saveToLocalStorage(savedSearch);

      // Show success state
      setSaved(true);
      setShowModal(false);
      toast.success(t.successMessage, {
        icon: '🔔',
        duration: 3000,
      });

      // Reset after animation
      setTimeout(() => setSaved(false), 3000);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error(t.errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const potentialSavings = currentPrice - targetPrice;

  return (
    <>
      {/* Save Button */}
      <button
        onClick={handleOpenModal}
        disabled={saved || status === 'loading'}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
          transition-all duration-200 min-w-[44px] min-h-[44px] touch-manipulation
          ${saved
            ? 'bg-green-50 border border-green-500 text-green-700 cursor-default'
            : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600 hover:shadow-sm'
          }
        `}
        aria-label={saved ? t.saved : t.save}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-semibold">{t.saved}</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4" strokeWidth={2} />
            <span>{t.save}</span>
          </>
        )}
      </button>

      {/* Auth Modal */}
      <FeatureAuthModal
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        feature="savedSearch"
        productContext={{
          name: `${route.from} → ${route.to}`,
          price: currentPrice,
          currency: '$',
        }}
      />

      {/* Save Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] animate-fadeIn"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-[111] animate-slideUp">
            <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-lg w-full mx-auto md:m-4 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Bookmark className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.modalTitle}</h3>
                    <p className="text-sm text-gray-600">{route.from} → {route.to}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Search Name */}
                <div>
                  <label htmlFor="search-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.searchName}
                  </label>
                  <input
                    id="search-name"
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={defaultName}
                    className="
                      w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      text-base
                    "
                  />
                </div>

                {/* Price Alert */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Bell className="w-4 h-4" />
                      {t.priceAlert}
                    </label>
                    <button
                      onClick={() => setEnableAlert(!enableAlert)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${enableAlert ? 'bg-primary-600' : 'bg-gray-300'}
                      `}
                      role="switch"
                      aria-checked={enableAlert}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${enableAlert ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  {enableAlert && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600">{t.priceAlertDesc}</p>

                      {/* Current Price Display */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t.currentPrice}:</span>
                        <span className="text-lg font-bold text-gray-900">${currentPrice.toLocaleString()}</span>
                      </div>

                      {/* Target Price Input */}
                      <div>
                        <label htmlFor="target-price" className="block text-sm font-medium text-gray-700 mb-2">
                          {t.targetPrice}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-700 font-bold text-lg">
                            $
                          </span>
                          <input
                            id="target-price"
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(parseInt(e.target.value) || 0)}
                            min={0}
                            max={currentPrice}
                            className="
                              w-full pl-8 pr-4 py-3 border-2 border-primary-300 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                              text-lg font-bold text-primary-700
                            "
                          />
                        </div>

                        {/* Savings Indicator */}
                        {potentialSavings > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-green-700">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-semibold">
                              {t.savings.replace('{amount}', potentialSavings.toLocaleString())}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Slider for quick adjustment */}
                      <div>
                        <input
                          type="range"
                          min={Math.floor(currentPrice * 0.5)}
                          max={currentPrice}
                          step={10}
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(parseInt(e.target.value))}
                          className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>50% off</span>
                          <span>Current</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="
                    flex-1 px-6 py-3 border border-gray-300 rounded-lg
                    text-gray-700 font-semibold hover:bg-gray-100
                    transition-colors min-h-[48px] disabled:opacity-50
                  "
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="
                    flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600
                    hover:from-primary-700 hover:to-blue-700 rounded-lg
                    text-white font-semibold shadow-lg hover:shadow-xl
                    transition-all min-h-[48px] flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      {t.saveButton}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
}
