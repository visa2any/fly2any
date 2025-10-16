'use client';

import { useState, useEffect } from 'react';
import { Bell, TrendingDown, Mail, Target, CheckCircle2, X, ChevronDown } from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface PriceAlert {
  id: string;
  flightId: string;
  email: string;
  threshold: number;
  createdAt: string;
  isActive: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface PriceAlertsProps {
  flightId: string;
  currentPrice: number;
  priceHistory?: PriceHistoryPoint[];
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  onSetAlert?: (email: string, threshold: number) => Promise<boolean>;
  activeAlertsCount?: number;
  route?: {
    from: string;
    to: string;
    date: string;
  };
  className?: string;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'Price Alert',
    subtitle: 'Get notified when prices drop',
    emailLabel: 'Your Email',
    emailPlaceholder: 'Enter your email',
    priceThresholdLabel: 'Alert me when price drops to',
    currentPrice: 'Current Price',
    trackButton: 'Track This Flight',
    tracking: 'Setting up alert...',
    activeAlerts: 'Active Alerts',
    successTitle: 'Alert Set Successfully!',
    successMessage: "We'll email you when the price drops to your target.",
    close: 'Close',
    tips: {
      title: 'Pro Tips',
      tuesday: 'Prices usually drop on Tuesdays',
      early: 'Book 2-3 months ahead for best deals',
      flexible: 'Be flexible with dates to save more',
      offPeak: 'Off-peak times offer better prices',
    },
    priceHistory: 'Price Trend (30 days)',
    avgPrice: 'Avg',
    lowestPrice: 'Lowest',
    highestPrice: 'Highest',
    savingsEstimate: 'Potential savings',
    quickSelect: 'Quick Select',
    customAmount: 'Custom Amount',
    validEmail: 'Please enter a valid email',
    validPrice: 'Please select a target price',
  },
  pt: {
    title: 'Alerta de Preço',
    subtitle: 'Seja notificado quando os preços caírem',
    emailLabel: 'Seu Email',
    emailPlaceholder: 'Digite seu email',
    priceThresholdLabel: 'Alertar quando o preço cair para',
    currentPrice: 'Preço Atual',
    trackButton: 'Rastrear Este Voo',
    tracking: 'Configurando alerta...',
    activeAlerts: 'Alertas Ativos',
    successTitle: 'Alerta Configurado!',
    successMessage: 'Enviaremos um email quando o preço atingir sua meta.',
    close: 'Fechar',
    tips: {
      title: 'Dicas Pro',
      tuesday: 'Preços geralmente caem às terças-feiras',
      early: 'Reserve 2-3 meses antes para melhores ofertas',
      flexible: 'Seja flexível com datas para economizar mais',
      offPeak: 'Horários fora de pico oferecem melhores preços',
    },
    priceHistory: 'Tendência de Preço (30 dias)',
    avgPrice: 'Média',
    lowestPrice: 'Mais Baixo',
    highestPrice: 'Mais Alto',
    savingsEstimate: 'Economia potencial',
    quickSelect: 'Seleção Rápida',
    customAmount: 'Valor Personalizado',
    validEmail: 'Por favor, insira um email válido',
    validPrice: 'Por favor, selecione um preço alvo',
  },
  es: {
    title: 'Alerta de Precio',
    subtitle: 'Recibe notificaciones cuando bajen los precios',
    emailLabel: 'Tu Email',
    emailPlaceholder: 'Ingresa tu email',
    priceThresholdLabel: 'Alertar cuando el precio baje a',
    currentPrice: 'Precio Actual',
    trackButton: 'Rastrear Este Vuelo',
    tracking: 'Configurando alerta...',
    activeAlerts: 'Alertas Activas',
    successTitle: '¡Alerta Configurada!',
    successMessage: 'Te enviaremos un email cuando el precio alcance tu objetivo.',
    close: 'Cerrar',
    tips: {
      title: 'Consejos Pro',
      tuesday: 'Los precios suelen bajar los martes',
      early: 'Reserva 2-3 meses antes para mejores ofertas',
      flexible: 'Sé flexible con las fechas para ahorrar más',
      offPeak: 'Horarios fuera de pico ofrecen mejores precios',
    },
    priceHistory: 'Tendencia de Precio (30 días)',
    avgPrice: 'Prom',
    lowestPrice: 'Más Bajo',
    highestPrice: 'Más Alto',
    savingsEstimate: 'Ahorro potencial',
    quickSelect: 'Selección Rápida',
    customAmount: 'Monto Personalizado',
    validEmail: 'Por favor, ingresa un email válido',
    validPrice: 'Por favor, selecciona un precio objetivo',
  },
};

// ===========================
// SUB-COMPONENTS
// ===========================

const PriceHistoryMiniChart: React.FC<{
  history: PriceHistoryPoint[];
  currentPrice: number;
  threshold: number | null;
  currency: string;
  lang: 'en' | 'pt' | 'es';
}> = ({ history, currentPrice, threshold, currency, lang }) => {
  const t = translations[lang];

  if (!history || history.length === 0) {
    // Generate mock data for demo purposes
    const mockHistory: PriceHistoryPoint[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const variance = Math.random() * 0.3 - 0.15; // -15% to +15%
      const price = currentPrice * (1 + variance);
      mockHistory.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
      });
    }
    history = mockHistory;
  }

  const prices = history.map(h => h.price);
  const maxPrice = Math.max(...prices, currentPrice);
  const minPrice = Math.min(...prices, currentPrice);
  const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
  const range = maxPrice - minPrice || 1;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-primary-500" />
        {t.priceHistory}
      </h4>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="text-center">
          <div className="text-gray-500">{t.lowestPrice}</div>
          <div className="font-bold text-success">{currency}{minPrice}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">{t.avgPrice}</div>
          <div className="font-bold text-gray-700">{currency}{avgPrice}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">{t.highestPrice}</div>
          <div className="font-bold text-error">{currency}{maxPrice}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-24 bg-gradient-to-br from-primary-50/30 to-primary-100/20 rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="priceAlertGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0087FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0087FF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Threshold line */}
          {threshold && threshold < currentPrice && (
            <line
              x1="0"
              y1={100 - ((threshold - minPrice) / range) * 100}
              x2="100"
              y2={100 - ((threshold - minPrice) / range) * 100}
              stroke="#00A699"
              strokeWidth="1"
              strokeDasharray="4 2"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Area under the line */}
          <path
            d={`
              M 0,${100 - ((history[0].price - minPrice) / range) * 100}
              ${history.map((point, idx) => {
                const x = (idx / (history.length - 1)) * 100;
                const y = 100 - ((point.price - minPrice) / range) * 100;
                return `L ${x},${y}`;
              }).join(' ')}
              L 100,100
              L 0,100
              Z
            `}
            fill="url(#priceAlertGradient)"
          />

          {/* Price line */}
          <polyline
            points={history.map((point, idx) => {
              const x = (idx / (history.length - 1)) * 100;
              const y = 100 - ((point.price - minPrice) / range) * 100;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#0087FF"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Current price dot */}
          <circle
            cx="100"
            cy={100 - ((currentPrice - minPrice) / range) * 100}
            r="2.5"
            fill="#0057B7"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Threshold label */}
        {threshold && threshold < currentPrice && (
          <div
            className="absolute right-2 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded"
            style={{
              top: `${100 - ((threshold - minPrice) / range) * 100}%`,
              transform: 'translateY(-50%)',
            }}
          >
            {currency}{threshold}
          </div>
        )}
      </div>
    </div>
  );
};

const ProTips: React.FC<{ lang: 'en' | 'pt' | 'es' }> = ({ lang }) => {
  const t = translations[lang];
  const tips = [
    { icon: '📅', text: t.tips.tuesday, color: 'from-blue-500/10 to-blue-600/5' },
    { icon: '⏰', text: t.tips.early, color: 'from-purple-500/10 to-purple-600/5' },
    { icon: '🎯', text: t.tips.flexible, color: 'from-green-500/10 to-green-600/5' },
    { icon: '🌙', text: t.tips.offPeak, color: 'from-orange-500/10 to-orange-600/5' },
  ];

  return (
    <div className="bg-gradient-to-br from-primary-50/50 to-white p-4 rounded-xl border border-primary-200/50">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-lg">💡</span>
        {t.tips.title}
      </h4>
      <div className="space-y-2">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 p-2 rounded-lg bg-gradient-to-br ${tip.color} transition-all hover:scale-102`}
          >
            <span className="text-base flex-shrink-0">{tip.icon}</span>
            <span className="text-xs text-gray-700 leading-relaxed">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
  threshold: number;
  currency: string;
  currentPrice: number;
  lang: 'en' | 'pt' | 'es';
}> = ({ isOpen, onClose, email, threshold, currency, currentPrice, lang }) => {
  const t = translations[lang];
  const savings = currentPrice - threshold;
  const savingsPercent = Math.round((savings / currentPrice) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Success Header with Animation */}
        <div className="relative bg-gradient-to-br from-success via-success/90 to-success/80 p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-wiggle">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="text-2xl font-bold mb-1">{t.successTitle}</h3>
          <p className="text-white/90 text-sm">{t.successMessage}</p>
        </div>

        {/* Success Details */}
        <div className="p-6 space-y-4">
          {/* Email Confirmation */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100/30 rounded-xl border border-primary-200">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 font-medium mb-1">Alert sent to</div>
              <div className="text-sm font-bold text-gray-900 truncate">{email}</div>
            </div>
          </div>

          {/* Target Price */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/30">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-medium mb-1">Target Price</div>
              <div className="text-2xl font-bold text-success">{currency}{threshold}</div>
            </div>
            {savings > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium mb-1">{t.savingsEstimate}</div>
                <div className="text-lg font-bold text-success">
                  {currency}{savings}
                  <span className="text-sm ml-1">({savingsPercent}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* What happens next */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-2">What happens next?</h4>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>We'll monitor this flight 24/7 for price changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>Instant email notification when price drops to your target</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                <span>Direct booking link included in the alert email</span>
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl transition-all hover:scale-102 shadow-primary"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const PriceAlerts: React.FC<PriceAlertsProps> = ({
  flightId,
  currentPrice,
  priceHistory = [],
  currency = '$',
  lang = 'en',
  onSetAlert,
  activeAlertsCount = 0,
  route,
  className = '',
}) => {
  const t = translations[lang];
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState<number | null>(null);
  const [customThreshold, setCustomThreshold] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Bell animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsBellAnimating(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Generate quick select options
  const quickSelectOptions = [
    { label: '-5%', value: Math.round(currentPrice * 0.95) },
    { label: '-10%', value: Math.round(currentPrice * 0.90) },
    { label: '-15%', value: Math.round(currentPrice * 0.85) },
    { label: '-20%', value: Math.round(currentPrice * 0.80) },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleQuickSelect = (value: number) => {
    setThreshold(value);
    setCustomThreshold('');
    setPriceError('');
  };

  const handleCustomThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomThreshold(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setThreshold(numValue);
      setPriceError('');
    } else {
      setThreshold(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    let hasError = false;

    if (!validateEmail(email)) {
      setEmailError(t.validEmail);
      hasError = true;
    }

    if (!threshold || threshold >= currentPrice) {
      setPriceError(t.validPrice);
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      if (onSetAlert && threshold !== null) {
        const success = await onSetAlert(email, threshold);
        if (success) {
          setShowSuccess(true);
          setEmail('');
          setThreshold(null);
          setCustomThreshold('');
        }
      } else {
        // Mock success for demo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setShowSuccess(true);
        setEmail('');
        setThreshold(null);
        setCustomThreshold('');
      }
    } catch (error) {
      console.error('Failed to set alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`
          relative
          bg-white
          rounded-2xl
          border-2 border-gray-200/50
          shadow-xl
          overflow-hidden
          transition-all duration-300
          hover:shadow-2xl
          ${className}
        `}
      >
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-success-50/30 pointer-events-none" />

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-14 h-14 rounded-xl
                  bg-gradient-to-br from-primary-500 to-primary-600
                  flex items-center justify-center
                  shadow-primary
                  ${isBellAnimating ? 'animate-wiggle' : ''}
                `}
              >
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {t.title}
                  {activeAlertsCount > 0 && (
                    <span className="px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full">
                      {activeAlertsCount}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Current Price Display */}
          <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">{t.currentPrice}</span>
              <span className="text-3xl font-bold text-primary-600">
                {currency}{currentPrice}
              </span>
            </div>
          </div>

          {/* Form - Always visible on desktop, collapsible on mobile */}
          <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder={t.emailPlaceholder}
                    className={`
                      w-full pl-11 pr-4 py-3
                      border-2 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      transition-all
                      ${emailError ? 'border-error' : 'border-gray-200'}
                    `}
                    required
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-error font-medium">{emailError}</p>
                )}
              </div>

              {/* Price Threshold Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {t.priceThresholdLabel}
                </label>

                {/* Quick Select Buttons */}
                <div className="mb-3">
                  <div className="text-xs text-gray-600 font-medium mb-2">{t.quickSelect}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {quickSelectOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleQuickSelect(option.value)}
                        className={`
                          py-2 px-3 rounded-lg font-bold text-sm
                          transition-all hover:scale-105
                          ${
                            threshold === option.value
                              ? 'bg-gradient-to-br from-success to-success/80 text-white shadow-lg'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                          }
                        `}
                      >
                        <div>{option.label}</div>
                        <div className="text-xs">{currency}{option.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                  <div className="text-xs text-gray-600 font-medium mb-2">{t.customAmount}</div>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={customThreshold}
                      onChange={handleCustomThresholdChange}
                      placeholder={Math.round(currentPrice * 0.9).toString()}
                      className={`
                        w-full pl-16 pr-4 py-3
                        border-2 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-success focus:border-success
                        transition-all
                        ${priceError ? 'border-error' : 'border-gray-200'}
                      `}
                      min="1"
                      max={currentPrice - 1}
                    />
                  </div>
                  {priceError && (
                    <p className="mt-1 text-xs text-error font-medium">{priceError}</p>
                  )}
                  {threshold && threshold < currentPrice && (
                    <p className="mt-1 text-xs text-success font-medium">
                      {t.savingsEstimate}: {currency}{currentPrice - threshold} (
                      {Math.round(((currentPrice - threshold) / currentPrice) * 100)}%)
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !threshold}
                className={`
                  w-full py-4 rounded-xl
                  font-bold text-white text-lg
                  transition-all duration-300
                  flex items-center justify-center gap-3
                  ${
                    isLoading || !email || !threshold
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-success via-success/90 to-success/80 hover:from-success/90 hover:to-success shadow-lg hover:shadow-xl hover:scale-102'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    {t.tracking}
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    {t.trackButton}
                  </>
                )}
              </button>
            </form>

            {/* Price History Chart */}
            <PriceHistoryMiniChart
              history={priceHistory}
              currentPrice={currentPrice}
              threshold={threshold}
              currency={currency}
              lang={lang}
            />

            {/* Pro Tips */}
            <ProTips lang={lang} />
          </div>
        </div>

        {/* Bottom Accent Border */}
        <div className="h-1 bg-gradient-to-r from-primary-400 via-success to-primary-500" />
      </div>

      {/* Success Modal */}
      {threshold && (
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          email={email}
          threshold={threshold}
          currency={currency}
          currentPrice={currentPrice}
          lang={lang}
        />
      )}
    </>
  );
};

export default PriceAlerts;
