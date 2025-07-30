'use client';

/**
 * Main Flights Page
 * Integrates search, results, details, and booking flow for flights
 */

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsList from '@/components/flights/FlightResultsList';
import { BenefitsSection } from '@/components/ui/benefits-section';
import { HeroSection } from '@/components/ui/hero-section';
import { ErrorMessage } from '@/components/ui/error-message';
import { FilterIcon, XIcon } from '@/components/Icons';
import type { 
  FlightSearchFormData, 
  ProcessedFlightOffer, 
  FlightFilters,
  FlightSortOptions,
  FlightSearchResponse 
} from '@/types/flights';
import { convertFormToSearchParams } from '@/lib/flights/validators';

type PageView = 'search' | 'results' | 'details' | 'booking' | 'confirmation';

interface PageState {
  view: PageView;
  searchData: FlightSearchFormData | null;
  searchResults: ProcessedFlightOffer[] | null;
  selectedFlight: ProcessedFlightOffer | null;
  isLoading: boolean;
  error: string | null;
  filters: FlightFilters;
  sortOptions: FlightSortOptions;
}

const initialState: PageState = {
  view: 'search',
  searchData: null,
  searchResults: null,
  selectedFlight: null,
  isLoading: false,
  error: null,
  filters: {},
  sortOptions: { sortBy: 'price', sortOrder: 'asc' }
};

function VoosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>(initialState);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateState = useCallback((updates: Partial<PageState> | ((prev: PageState) => Partial<PageState>)) => {
    if (typeof updates === 'function') {
      setState(prev => ({ ...prev, ...updates(prev) }));
    } else {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const handleSearch = useCallback(async (searchData: FlightSearchFormData) => {
    updateState({ 
      isLoading: true, 
      error: null, 
      searchData,
      view: 'results'
    });

    try {
      console.log('🔍 Iniciando busca de voos com dados:', searchData);

      // Convert form data to API parameters
      const searchParams = convertFormToSearchParams(searchData);
      
      const queryParams = new URLSearchParams();
      queryParams.set('originLocationCode', searchParams.originLocationCode);
      queryParams.set('destinationLocationCode', searchParams.destinationLocationCode);
      queryParams.set('departureDate', searchParams.departureDate);
      queryParams.set('adults', searchParams.adults.toString());
      
      if (searchParams.returnDate) {
        queryParams.set('returnDate', searchParams.returnDate);
      }
      if (searchParams.children) {
        queryParams.set('children', searchParams.children.toString());
      }
      if (searchParams.infants) {
        queryParams.set('infants', searchParams.infants.toString());
      }
      if (searchParams.travelClass) {
        queryParams.set('travelClass', searchParams.travelClass);
      }
      if (searchParams.nonStop !== undefined) {
        queryParams.set('nonStop', searchParams.nonStop.toString());
      }
      if (searchParams.maxPrice) {
        queryParams.set('maxPrice', searchParams.maxPrice.toString());
      }
      if (searchParams.currencyCode) {
        queryParams.set('currencyCode', searchParams.currencyCode);
      }

      console.log('📡 Fazendo requisição para:', `/api/flights/search?${queryParams}`);

      const response = await fetch(`/api/flights/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result: FlightSearchResponse = await response.json();
      console.log('📊 Resposta da API de voos:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro na busca de voos');
      }

      console.log('✅ Voos encontrados:', result.data?.length || 0);

      updateState({ 
        searchResults: result.data || [],
        isLoading: false 
      });

    } catch (error) {
      console.error('❌ Erro na busca de voos:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar voos',
        isLoading: false,
        view: 'search'
      });
    }
  }, [updateState]);

  const handleFlightSelect = useCallback((flight: ProcessedFlightOffer) => {
    updateState({
      selectedFlight: flight,
      view: 'details'
    });
  }, [updateState]);

  const handleBackToSearch = useCallback(() => {
    updateState(initialState);
  }, [updateState]);

  const handleBackToResults = useCallback(() => {
    updateState({
      view: 'results',
      selectedFlight: null,
      isLoading: false,
      error: null
    });
  }, [updateState]);

  const handleFiltersChange = useCallback((filters: FlightFilters) => {
    updateState({ filters });
  }, [updateState]);

  const handleSortChange = useCallback((sortOptions: FlightSortOptions) => {
    updateState({ sortOptions });
  }, [updateState]);

  const renderPageContent = () => {
    switch (state.view) {
      case 'search':
        return (
          <div className="w-full space-y-6 md:space-y-8">
            <div className="transform transition-all duration-700 ease-out">
              <HeroSection
                title="✈️ ENCONTRE VOOS PARA TODO MUNDO!"
                subtitle="Compare preços de centenas de companhias aéreas e encontre as melhores ofertas"
                features={[]}
              >
                <div className="mt-4">
                  <FlightSearchForm 
                    onSearch={handleSearch}
                    isLoading={state.isLoading}
                  />
                </div>
                
                {/* Features Cards */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                  {[
                    { icon: '🔍', text: 'Compare preços' },
                    { icon: '⚡', text: 'Busca rápida' },
                    { icon: '✅', text: 'Reserva segura' },
                    { icon: '🌍', text: 'Voos globais' }
                  ].map((feature, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <span className="text-xl md:text-2xl mb-2 block">{feature.icon}</span>
                      <span className="text-slate-700 text-xs md:text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </HeroSection>
            </div>

            {state.error && (
              <div className="max-w-4xl mx-auto px-4">
                <ErrorMessage 
                  message={state.error}
                  onClose={() => updateState({ error: null })}
                />
              </div>
            )}

            {/* Benefits Section */}
            <div className="transform transition-all duration-700 ease-out delay-300">
              <BenefitsSection
                title="Por que escolher a Fly2Any para voos?"
                subtitle="Mais de 500 companhias aéreas • Preços transparentes • Suporte especializado"
                benefits={[
                  {
                    icon: "✈️",
                    badge: "MELHOR PREÇO",
                    badgeVariant: "default",
                    title: "Preços Competitivos Garantidos",
                    description: "Comparamos preços em tempo real de centenas de companhias aéreas. Acesso exclusivo a tarifas promocionais e ofertas especiais.",
                    stats: "Economia média: R$ 380 por passagem"
                  },
                  {
                    icon: "⚡",
                    badge: "BUSCA INTELIGENTE",
                    badgeVariant: "success", 
                    title: "Tecnologia de Busca Avançada",
                    description: "Algoritmos inteligentes encontram as melhores combinações de voos. Filtros personalizados para suas preferências de viagem.",
                    stats: "Resultados em menos de 10 segundos"
                  },
                  {
                    icon: "🛡️",
                    badge: "100% SEGURO",
                    badgeVariant: "secondary",
                    title: "Reservas Protegidas & Flexíveis",
                    description: "Parceiros certificados IATA. Opções de cancelamento flexível. Proteção contra mudanças de voo e imprevistos.",
                    stats: "Certificação IATA e proteção total"
                  },
                  {
                    icon: "📞",
                    badge: "SUPPORT VIP",
                    badgeVariant: "warning",
                    title: "Especialistas em Viagens 24/7",
                    description: "Equipe especializada em rotas internacionais. Assistência antes, durante e após sua viagem. Suporte em português sempre.",
                    stats: "Atendimento especializado 24 horas"
                  }
                ]}
                socialProof={[
                  { value: "500+", label: "Companhias aéreas" },
                  { value: "4.9★", label: "Avaliação média" },
                  { value: "99%", label: "Satisfação cliente" }
                ]}
              />
            </div>
          </div>
        );

      case 'results':
        return (
          <>
            {/* Results header */}
            <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 md:py-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-5 mb-4 shadow-sm">
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                      ✈️ <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-black">{state.searchResults?.length || 0}</span> 
                      {(state.searchResults?.length || 0) === 1 ? ' voo encontrado' : ' voos encontrados'}
                    </h2>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                      <span>✨</span>
                      Atualizado agora
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {state.searchData && (
                      <>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>🛫</span>
                          <span>{state.searchData.origin.city} → {state.searchData.destination.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>📅</span>
                          <span>{state.searchData.departureDate.toLocaleDateString('pt-BR')}{state.searchData.returnDate && ` → ${state.searchData.returnDate.toLocaleDateString('pt-BR')}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>👥</span>
                          <span>{state.searchData.passengers.adults + state.searchData.passengers.children + state.searchData.passengers.infants} passageiros</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>✈️ Preço médio: <strong className="text-blue-600">R$ {Math.round((state.searchResults?.reduce((sum, f) => sum + parseFloat(f.totalPrice.replace(/[^\d,]/g, '').replace(',', '.')), 0) || 0) / (state.searchResults?.length || 1))}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <span>🔔</span>
                        <span>Alerta de preço</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <span>📤</span>
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results list */}
            <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              <FlightResultsList
                offers={state.searchResults || []}
                onOfferSelect={handleFlightSelect}
                filters={state.filters}
                onFiltersChange={handleFiltersChange}
                sortOptions={state.sortOptions}
                onSortChange={handleSortChange}
                isLoading={state.isLoading}
              />
            </div>
          </>
        );

      case 'details':
        return (
          <div className="w-full py-4 md:py-8">
            <div className="max-w-6xl mx-auto px-4">
              <button
                onClick={handleBackToResults}
                className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <span>←</span>
                <span>Voltar aos resultados</span>
              </button>
              
              {state.selectedFlight && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Detalhes do Voo</h1>
                  
                  {/* Flight details would go here */}
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detalhes completos do voo em desenvolvimento
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Esta seção incluirá informações detalhadas sobre o voo, bagagens, políticas de cancelamento e mais.
                    </p>
                    <button
                      onClick={() => alert('Funcionalidade de reserva em desenvolvimento')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                      Reservar Este Voo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden font-sans flex flex-col">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-slate-100/10"></div>

        {/* Header */}
        <ResponsiveHeader />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-140px)] py-8 md:py-12">
          {renderPageContent()}
        </main>

        <Footer />
        
        {/* Mobile Filters Button */}
        {state.view === 'results' && state.searchResults && isMobile && (
          <button
            onClick={() => setShowMobileFilters(true)}  
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
            aria-label="Abrir filtros"
          >
            <FilterIcon className="w-6 h-6" />
          </button>
        )}

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Fechar filtros"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Mobile filters would go here */}
                  <div className="text-center py-8 text-gray-500">
                    Filtros em desenvolvimento
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function VoosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando busca de voos...</p>
        </div>
      </div>
    }>
      <VoosContent />
    </Suspense>
  );
}