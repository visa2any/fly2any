'use client';

import { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Clock, Database, CheckCircle2 } from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface MLMetadata {
  cacheTTL?: number;
  cacheConfidence?: number;
  cacheReason?: string;
  apiStrategy?: 'amadeus' | 'duffel' | 'both';
  apiConfidence?: number;
  apiReason?: string;
  estimatedSavings?: number;
}

export interface MLInsightsProps {
  route: {
    from: string;
    to: string;
    departureDate: string;
  };
  currentPrice: number;
  averagePrice?: number;
  mlMetadata?: MLMetadata;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'ML Price Intelligence',
    subtitle: 'AI-Powered Cost Optimization',
    cacheSection: 'Smart Caching',
    apiSection: 'API Optimization',
    cacheTTL: 'Cache Duration',
    cacheConfidence: 'Confidence',
    cacheReason: 'Why',
    apiStrategy: 'Strategy',
    apiConfidence: 'Reliability',
    apiSavings: 'Estimated Savings',
    minutes: 'min',
    strategies: {
      amadeus: 'Amadeus Only',
      duffel: 'Duffel Only',
      both: 'Both APIs',
    },
    learningMode: 'Learning Mode',
    learningDesc: 'Building route profile...',
    noData: 'No ML data available yet',
  },
  pt: {
    title: 'Inteligência de Preço ML',
    subtitle: 'Otimização de Custo com IA',
    cacheSection: 'Cache Inteligente',
    apiSection: 'Otimização de API',
    cacheTTL: 'Duração do Cache',
    cacheConfidence: 'Confiança',
    cacheReason: 'Porquê',
    apiStrategy: 'Estratégia',
    apiConfidence: 'Confiabilidade',
    apiSavings: 'Economia Estimada',
    minutes: 'min',
    strategies: {
      amadeus: 'Somente Amadeus',
      duffel: 'Somente Duffel',
      both: 'Ambas APIs',
    },
    learningMode: 'Modo de Aprendizado',
    learningDesc: 'Construindo perfil de rota...',
    noData: 'Dados ML ainda não disponíveis',
  },
  es: {
    title: 'Inteligencia de Precio ML',
    subtitle: 'Optimización de Costo con IA',
    cacheSection: 'Caché Inteligente',
    apiSection: 'Optimización de API',
    cacheTTL: 'Duración de Caché',
    cacheConfidence: 'Confianza',
    cacheReason: 'Por qué',
    apiStrategy: 'Estrategia',
    apiConfidence: 'Fiabilidad',
    apiSavings: 'Ahorro Estimado',
    minutes: 'min',
    strategies: {
      amadeus: 'Solo Amadeus',
      duffel: 'Solo Duffel',
      both: 'Ambas APIs',
    },
    learningMode: 'Modo de Aprendizaje',
    learningDesc: 'Construyendo perfil de ruta...',
    noData: 'Datos ML aún no disponibles',
  },
};

// ===========================
// SUB-COMPONENTS
// ===========================

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ icon, label, value, subValue, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={colors.icon}>{icon}</div>
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className={`text-lg font-bold ${colors.text}`}>{value}</div>
      {subValue && (
        <div className="text-xs text-gray-600 mt-1">{subValue}</div>
      )}
    </div>
  );
};

const ConfidenceMeter: React.FC<{
  confidence: number;
  label: string;
}> = ({ confidence, label }) => {
  const percentage = Math.round(confidence * 100);
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-orange-500';

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const MLInsights: React.FC<MLInsightsProps> = ({
  route,
  currentPrice,
  averagePrice,
  mlMetadata,
  currency = 'USD',
  lang = 'en',
  className = '',
}) => {
  const t = translations[lang];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // If no ML metadata available yet
  if (!mlMetadata || Object.keys(mlMetadata).length === 0) {
    return (
      <div
        className={`
          relative
          bg-white/90 backdrop-blur-md
          rounded-xl
          border border-gray-200/50
          shadow-lg
          overflow-hidden
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          ${className}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-purple-50/20 pointer-events-none" />

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md w-8 h-8">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {t.title}
              </h3>
              <p className="text-xs text-gray-600">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Learning Mode Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 text-center">
            <Database className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-purple-900">{t.learningMode}</p>
            <p className="text-xs text-purple-700 mt-1">{t.learningDesc}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-1" />
      </div>
    );
  }

  return (
    <div
      className={`
        relative
        bg-white/90 backdrop-blur-md
        rounded-xl
        border border-gray-200/50
        shadow-lg
        overflow-hidden
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-purple-50/20 pointer-events-none" />

      {/* Content */}
      <div className="relative p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md w-9 h-9">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {t.title}
            </h3>
            <p className="text-xs text-gray-600">
              {route.from} → {route.to}
            </p>
          </div>
        </div>

        {/* Smart Caching Section */}
        {mlMetadata.cacheTTL && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" />
              {t.cacheSection}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                icon={<Clock className="w-4 h-4" />}
                label={t.cacheTTL}
                value={mlMetadata.cacheTTL}
                subValue={t.minutes}
                color="blue"
              />

              {mlMetadata.cacheConfidence && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">{t.cacheConfidence}</span>
                  </div>
                  <ConfidenceMeter
                    confidence={mlMetadata.cacheConfidence}
                    label=""
                  />
                </div>
              )}
            </div>

            {mlMetadata.cacheReason && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-900">
                  <span className="font-semibold">{t.cacheReason}:</span> {mlMetadata.cacheReason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* API Optimization Section */}
        {mlMetadata.apiStrategy && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-purple-600" />
              {t.apiSection}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                icon={<Database className="w-4 h-4" />}
                label={t.apiStrategy}
                value={t.strategies[mlMetadata.apiStrategy] || mlMetadata.apiStrategy}
                color="purple"
              />

              {mlMetadata.estimatedSavings !== undefined && mlMetadata.estimatedSavings > 0 && (
                <MetricCard
                  icon={<span className="text-lg">💰</span>}
                  label={t.apiSavings}
                  value={`$${mlMetadata.estimatedSavings.toFixed(2)}`}
                  color="green"
                />
              )}
            </div>

            {mlMetadata.apiReason && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <p className="text-xs text-purple-900">
                  <span className="font-semibold">{t.cacheReason}:</span> {mlMetadata.apiReason}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Accent Border */}
      <div className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 h-1" />
    </div>
  );
};

export default MLInsights;
