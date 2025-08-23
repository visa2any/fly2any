'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Travel intelligence types
export interface TravelRoute {
  origin: string;
  destination: string;
  popularity: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  seasonality: Record<string, { demand: number; price: number }>;
  travelTime: { min: number; max: number }; // in hours
  airlines: string[];
}

export interface TravelInsight {
  type: 'price_trend' | 'best_time' | 'weather' | 'events' | 'visa_info' | 'popularity';
  title: string;
  description: string;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
  data: any;
  icon?: string;
}

export interface SeasonalTrend {
  month: string;
  demand: 'low' | 'medium' | 'high';
  priceIndex: number; // 1.0 = average, 0.8 = 20% below average
  weatherScore: number; // 1-10
  events: string[];
}

export interface AirportSuggestion {
  code: string;
  name: string;
  city: string;
  country: string;
  popularity: number;
  averageDelay: number; // in minutes
  facilities: string[];
  distance?: number; // from user query
  matchScore: number;
}

interface TravelIntelligenceEngineProps {
  origin?: string;
  destination?: string;
  dates?: { departure: string; return?: string };
  onInsightSelect: (insight: TravelInsight) => void;
  onRouteSelect: (route: TravelRoute) => void;
  className?: string;
}

// Brazil-US travel data
const POPULAR_BRAZIL_US_ROUTES: TravelRoute[] = [
  {
    origin: 'GRU',
    destination: 'JFK',
    popularity: 95,
    averagePrice: 650,
    priceRange: { min: 450, max: 1200 },
    seasonality: {
      'Jan': { demand: 0.9, price: 1.1 },
      'Feb': { demand: 0.8, price: 1.0 },
      'Mar': { demand: 0.7, price: 0.9 },
      'Apr': { demand: 0.8, price: 0.95 },
      'May': { demand: 0.9, price: 1.0 },
      'Jun': { demand: 1.2, price: 1.3 },
      'Jul': { demand: 1.4, price: 1.4 },
      'Aug': { demand: 1.3, price: 1.35 },
      'Sep': { demand: 0.9, price: 1.0 },
      'Oct': { demand: 0.8, price: 0.9 },
      'Nov': { demand: 0.9, price: 1.0 },
      'Dec': { demand: 1.3, price: 1.3 }
    },
    travelTime: { min: 9.5, max: 14 },
    airlines: ['LATAM', 'American Airlines', 'Delta', 'United']
  },
  {
    origin: 'GRU',
    destination: 'MIA',
    popularity: 88,
    averagePrice: 580,
    priceRange: { min: 420, max: 950 },
    seasonality: {
      'Jan': { demand: 1.1, price: 1.2 },
      'Feb': { demand: 1.0, price: 1.1 },
      'Mar': { demand: 1.2, price: 1.25 },
      'Apr': { demand: 0.9, price: 1.0 },
      'May': { demand: 0.8, price: 0.9 },
      'Jun': { demand: 1.0, price: 1.1 },
      'Jul': { demand: 1.3, price: 1.35 },
      'Aug': { demand: 1.2, price: 1.3 },
      'Sep': { demand: 0.9, price: 0.95 },
      'Oct': { demand: 0.8, price: 0.9 },
      'Nov': { demand: 0.9, price: 1.0 },
      'Dec': { demand: 1.4, price: 1.4 }
    },
    travelTime: { min: 8.5, max: 12 },
    airlines: ['LATAM', 'American Airlines', 'Avianca', 'Copa Airlines']
  },
  {
    origin: 'GIG',
    destination: 'JFK',
    popularity: 82,
    averagePrice: 675,
    priceRange: { min: 480, max: 1300 },
    seasonality: {
      'Jan': { demand: 1.0, price: 1.15 },
      'Feb': { demand: 0.9, price: 1.05 },
      'Mar': { demand: 0.8, price: 0.95 },
      'Apr': { demand: 0.8, price: 0.9 },
      'May': { demand: 0.9, price: 1.0 },
      'Jun': { demand: 1.1, price: 1.25 },
      'Jul': { demand: 1.3, price: 1.4 },
      'Aug': { demand: 1.2, price: 1.3 },
      'Sep': { demand: 0.9, price: 1.0 },
      'Oct': { demand: 0.8, price: 0.9 },
      'Nov': { demand: 0.9, price: 1.0 },
      'Dec': { demand: 1.2, price: 1.25 }
    },
    travelTime: { min: 9.5, max: 15 },
    airlines: ['LATAM', 'American Airlines', 'Delta', 'United', 'GOL']
  }
];

const AIRPORT_DATABASE: AirportSuggestion[] = [
  // Brazil
  { code: 'GRU', name: 'São Paulo-Guarulhos International', city: 'São Paulo', country: 'Brasil', popularity: 95, averageDelay: 25, facilities: ['wifi', 'lounges', 'shopping', 'restaurants'], matchScore: 0 },
  { code: 'GIG', name: 'Rio de Janeiro-Galeão International', city: 'Rio de Janeiro', country: 'Brasil', popularity: 88, averageDelay: 30, facilities: ['wifi', 'lounges', 'duty-free'], matchScore: 0 },
  { code: 'BSB', name: 'Brasília International', city: 'Brasília', country: 'Brasil', popularity: 75, averageDelay: 20, facilities: ['wifi', 'restaurants'], matchScore: 0 },
  { code: 'SSA', name: 'Salvador Deputado Luís Eduardo Magalhães', city: 'Salvador', country: 'Brasil', popularity: 68, averageDelay: 22, facilities: ['wifi', 'shopping'], matchScore: 0 },
  { code: 'FOR', name: 'Fortaleza Pinto Martins International', city: 'Fortaleza', country: 'Brasil', popularity: 65, averageDelay: 18, facilities: ['wifi', 'restaurants'], matchScore: 0 },
  
  // USA
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'EUA', popularity: 92, averageDelay: 35, facilities: ['wifi', 'lounges', 'shopping', 'restaurants', 'hotels'], matchScore: 0 },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'EUA', popularity: 89, averageDelay: 28, facilities: ['wifi', 'lounges', 'duty-free', 'restaurants'], matchScore: 0 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'EUA', popularity: 83, averageDelay: 32, facilities: ['wifi', 'lounges', 'shopping', 'restaurants'], matchScore: 0 },
  { code: 'ORD', name: 'Chicago O\'Hare International', city: 'Chicago', country: 'EUA', popularity: 81, averageDelay: 38, facilities: ['wifi', 'lounges', 'shopping'], matchScore: 0 },
  { code: 'LAS', name: 'Las Vegas McCarran International', city: 'Las Vegas', country: 'EUA', popularity: 76, averageDelay: 25, facilities: ['wifi', 'restaurants', 'entertainment'], matchScore: 0 }
];

// Fuzzy matching for airport search
export const useFuzzyAirportSearch = () => {
  const searchAirports = useCallback((query: string): AirportSuggestion[] => {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    
    const scored = AIRPORT_DATABASE.map(airport => {
      let score = 0;
      
      // Exact code match (highest priority)
      if (airport.code.toLowerCase() === normalizedQuery) {
        score += 100;
      } else if (airport.code.toLowerCase().startsWith(normalizedQuery)) {
        score += 80;
      }
      
      // City name match
      if (airport.city.toLowerCase().includes(normalizedQuery)) {
        score += 60;
      } else if (airport.city.toLowerCase().startsWith(normalizedQuery)) {
        score += 70;
      }
      
      // Airport name match
      if (airport.name.toLowerCase().includes(normalizedQuery)) {
        score += 40;
      }
      
      // Country match
      if (airport.country.toLowerCase().includes(normalizedQuery)) {
        score += 30;
      }
      
      // Popularity boost
      score += airport.popularity * 0.3;
      
      // Penalty for high delays
      score -= airport.averageDelay * 0.5;
      
      return { ...airport, matchScore: score };
    });
    
    return scored
      .filter(airport => airport.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  }, []);
  
  return { searchAirports };
};

// Travel insights generator
export const useTravelInsights = (origin?: string, destination?: string, dates?: { departure: string; return?: string }) => {
  const [insights, setInsights] = useState<TravelInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async () => {
    if (!origin || !destination) {
      setInsights([]);
      return;
    }

    setLoading(true);

    try {
      const route = POPULAR_BRAZIL_US_ROUTES.find(r => 
        r.origin === origin && r.destination === destination
      );

      const newInsights: TravelInsight[] = [];

      // Price trend insight
      if (route) {
        const currentMonth = new Date().toLocaleString('en', { month: 'short' });
        const currentSeasonality = route.seasonality[currentMonth];
        
        if (currentSeasonality) {
          const priceLevel = currentSeasonality.price;
          let trendMessage = '';
          let urgency: 'low' | 'medium' | 'high' = 'low';
          
          if (priceLevel < 0.9) {
            trendMessage = `Preços estão ${Math.round((1 - priceLevel) * 100)}% abaixo da média. Ótima oportunidade!`;
            urgency = 'high';
          } else if (priceLevel > 1.2) {
            trendMessage = `Preços estão ${Math.round((priceLevel - 1) * 100)}% acima da média. Considere outras datas.`;
            urgency = 'medium';
          } else {
            trendMessage = 'Preços estão dentro da média para este período.';
          }

          newInsights.push({
            type: 'price_trend',
            title: 'Tendência de Preços',
            description: trendMessage,
            actionable: true,
            urgency,
            data: { priceLevel, route: route.origin + '-' + route.destination },
            icon: '📈'
          });
        }

        // Best time to travel
        const bestMonths = Object.entries(route.seasonality)
          .sort(([,a], [,b]) => a.price - b.price)
          .slice(0, 3)
          .map(([month]) => month);

        newInsights.push({
          type: 'best_time',
          title: 'Melhor Época para Viajar',
          description: `Os melhores meses com preços mais baixos são: ${bestMonths.join(', ')}`,
          actionable: true,
          urgency: 'medium',
          data: { bestMonths, route },
          icon: '📅'
        });

        // Route popularity
        newInsights.push({
          type: 'popularity',
          title: 'Popularidade da Rota',
          description: `Esta rota tem ${route.popularity}% de popularidade. ${route.airlines.length} companhias aéreas operam esta rota.`,
          actionable: false,
          urgency: 'low',
          data: { popularity: route.popularity, airlines: route.airlines },
          icon: '✈️'
        });
      }

      // Destination-specific insights
      const destinationInsights = getDestinationInsights(destination);
      newInsights.push(...destinationInsights);

      // Weather insights (simplified)
      const weatherInsight = getWeatherInsight(destination, dates?.departure);
      if (weatherInsight) {
        newInsights.push(weatherInsight);
      }

      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, dates]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  return { insights, loading, regenerateInsights: generateInsights };
};

// Destination insights helper
const getDestinationInsights = (destination: string): TravelInsight[] => {
  const insights: TravelInsight[] = [];

  const destinationData: Record<string, any> = {
    'JFK': {
      visaInfo: 'Brasileiros precisam de ESTA ou visto americano',
      events: ['Broadway shows', 'Museums', 'Central Park'],
      tips: 'Reserve com antecedência para atrações populares'
    },
    'MIA': {
      visaInfo: 'Brasileiros precisam de ESTA ou visto americano',
      events: ['Art Basel (dezembro)', 'South Beach', 'Everglades'],
      tips: 'Ideal para conexões para Caribe e América Central'
    },
    'LAX': {
      visaInfo: 'Brasileiros precisam de ESTA ou visto americano',
      events: ['Hollywood tours', 'Disneyland', 'Santa Monica'],
      tips: 'Considere traslados - trânsito pode ser intenso'
    }
  };

  const data = destinationData[destination];
  if (data) {
    insights.push({
      type: 'visa_info',
      title: 'Documentação Necessária',
      description: data.visaInfo,
      actionable: true,
      urgency: 'high',
      data: { destination, visa: data.visaInfo },
      icon: '📄'
    });

    insights.push({
      type: 'events',
      title: 'Atrações Populares',
      description: `Não perca: ${data.events.slice(0, 3).join(', ')}`,
      actionable: false,
      urgency: 'low',
      data: { events: data.events, tips: data.tips },
      icon: '🎯'
    });
  }

  return insights;
};

// Weather insights helper
const getWeatherInsight = (destination: string, departureDate?: string): TravelInsight | null => {
  if (!departureDate) return null;

  const date = new Date(departureDate);
  const month = date.getMonth() + 1;

  const weatherData: Record<string, Record<number, { temp: string; condition: string; recommendation: string }>> = {
    'JFK': {
      1: { temp: '-1°C a 4°C', condition: 'Inverno rigoroso', recommendation: 'Traga roupas de frio pesadas' },
      2: { temp: '0°C a 6°C', condition: 'Frio intenso', recommendation: 'Casacos e botas impermeáveis' },
      3: { temp: '4°C a 12°C', condition: 'Começo da primavera', recommendation: 'Camadas de roupa' },
      6: { temp: '18°C a 27°C', condition: 'Verão agradável', recommendation: 'Roupas leves e protetor solar' },
      7: { temp: '21°C a 29°C', condition: 'Verão quente', recommendation: 'Hidrate-se bem e use protetor solar' },
      8: { temp: '20°C a 28°C', condition: 'Verão', recommendation: 'Roupas leves, pode haver chuvas' },
      12: { temp: '2°C a 8°C', condition: 'Inverno frio', recommendation: 'Roupas de inverno essenciais' }
    },
    'MIA': {
      1: { temp: '15°C a 24°C', condition: 'Seco e agradável', recommendation: 'Tempo ideal para turismo' },
      6: { temp: '24°C a 31°C', condition: 'Quente e úmido', recommendation: 'Roupas leves e hidratação' },
      7: { temp: '25°C a 32°C', condition: 'Muito quente', recommendation: 'Protetor solar forte e água' },
      8: { temp: '25°C a 32°C', condition: 'Temporada de furacões', recommendation: 'Acompanhe previsões meteorológicas' },
      12: { temp: '16°C a 25°C', condition: 'Tempo perfeito', recommendation: 'Ideal para atividades ao ar livre' }
    }
  };

  const weather = weatherData[destination]?.[month];
  if (!weather) return null;

  return {
    type: 'weather',
    title: 'Previsão do Tempo',
    description: `${weather.temp} - ${weather.condition}. ${weather.recommendation}`,
    actionable: true,
    urgency: 'medium',
    data: { temperature: weather.temp, condition: weather.condition, month },
    icon: '🌤️'
  };
};

// Price trend predictor
export const usePriceTrendPredictor = (origin: string, destination: string) => {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (!origin || !destination) return;

    const route = POPULAR_BRAZIL_US_ROUTES.find(r => 
      r.origin === origin && r.destination === destination
    );

    if (!route) return;

    // Generate next 12 months predictions
    const currentDate = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const predictions = [];
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setMonth(targetDate.getMonth() + i);
      
      const monthKey = monthNames[targetDate.getMonth()];
      const seasonality = route.seasonality[monthKey];
      
      if (seasonality) {
        predictions.push({
          month: targetDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
          price: Math.round(route.averagePrice * seasonality.price),
          demand: seasonality.demand,
          recommendation: seasonality.price < 0.95 ? 'buy' : seasonality.price > 1.2 ? 'wait' : 'monitor'
        });
      }
    }

    setPredictions(predictions);
  }, [origin, destination]);

  return predictions;
};

export default function TravelIntelligenceEngine({
  origin,
  destination,
  dates,
  onInsightSelect,
  onRouteSelect,
  className = ''
}: TravelIntelligenceEngineProps) {
  const { searchAirports } = useFuzzyAirportSearch();
  const { insights, loading } = useTravelInsights(origin, destination, dates);
  const pricePredictions = usePriceTrendPredictor(origin || '', destination || '');

  const handleInsightClick = (insight: TravelInsight) => {
    onInsightSelect(insight);
  };

  if (loading) {
    return (
      <div className={`travel-intelligence-engine ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`travel-intelligence-engine ${className}`}>
      {/* Travel Insights */}
      {insights.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🧠</span>
            <span>Insights de Viagem</span>
          </h3>
          
          <div className="grid gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                onClick={() => handleInsightClick(insight)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                          ${insight.urgency === 'high' ? 'border-red-200 bg-red-50' :
                            insight.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-blue-200 bg-blue-50'}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      {insight.urgency === 'high' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Urgente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    {insight.actionable && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 mt-2">
                        Ver detalhes →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Trend Chart */}
      {pricePredictions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <span>📈</span>
            <span>Tendência de Preços</span>
          </h3>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pricePredictions.slice(0, 6).map((prediction, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border text-center
                            ${prediction.recommendation === 'buy' ? 'border-green-200 bg-green-50' :
                              prediction.recommendation === 'wait' ? 'border-red-200 bg-red-50' :
                              'border-gray-200 bg-gray-50'}`}
                >
                  <div className="text-sm font-medium text-gray-700">
                    {prediction.month.split(' ')[0]}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${prediction.price}
                  </div>
                  <div className={`text-xs mt-1
                                ${prediction.recommendation === 'buy' ? 'text-green-600' :
                                  prediction.recommendation === 'wait' ? 'text-red-600' :
                                  'text-gray-600'}`}>
                    {prediction.recommendation === 'buy' ? '💰 Boa oportunidade' :
                     prediction.recommendation === 'wait' ? '⏳ Aguardar' :
                     '👀 Monitorar'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popular Routes Suggestions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-4">
          <span>🔥</span>
          <span>Rotas Populares Brasil-EUA</span>
        </h3>
        
        <div className="grid gap-3">
          {POPULAR_BRAZIL_US_ROUTES.slice(0, 3).map((route, index) => (
            <div
              key={index}
              onClick={() => onRouteSelect(route)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 
                       cursor-pointer transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{route.origin}</div>
                    <div className="text-xs text-gray-500">
                      {AIRPORT_DATABASE.find(a => a.code === route.origin)?.city}
                    </div>
                  </div>
                  <div className="text-gray-400">✈️</div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{route.destination}</div>
                    <div className="text-xs text-gray-500">
                      {AIRPORT_DATABASE.find(a => a.code === route.destination)?.city}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    A partir de ${route.priceRange.min}
                  </div>
                  <div className="text-xs text-gray-500">
                    {route.popularity}% popularidade
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <div>
                  {route.travelTime.min}h - {route.travelTime.max}h de voo
                </div>
                <div className="flex items-center space-x-1">
                  <span>{route.airlines.length} companhias</span>
                  <span className="text-blue-600">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}