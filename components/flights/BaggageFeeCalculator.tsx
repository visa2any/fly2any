'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getBaggageFees,
  getAirlinePolicy,
  calculateBaggageFees,
  type BaggageSelection,
  type CabinClass,
  type RouteType
} from '@/lib/airlines/baggageFees';
import {
  Briefcase,
  ShoppingBag,
  Package,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Minus,
  Check,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';

export interface BaggageFeeCalculatorProps {
  flightId: string;
  airline: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  basePrice: number;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  onTotalUpdate: (totalWithBaggage: number) => void;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  routeType?: RouteType;
  isRoundTrip?: boolean;
}

const TRANSLATIONS = {
  en: {
    title: 'Baggage Fee Calculator',
    subtitle: 'Add baggage and see your total trip cost',
    personalItem: 'Personal Item',
    carryOn: 'Carry-On Bag',
    checked1: '1st Checked Bag',
    checked2: '2nd Checked Bag',
    checked3: '3rd Checked Bag',
    oversized: 'Oversized Bag',
    overweight: 'Overweight Fee',
    sportEquipment: 'Sport Equipment',
    free: 'FREE',
    perPerson: 'per person',
    perBag: 'per bag',
    included: 'Included',
    notIncluded: 'Not included with this airline',
    basePrice: 'Base Flight Price',
    baggageFees: 'Baggage Fees',
    totalPrice: 'Total Trip Cost',
    whatYouPay: "What You'll Actually Pay",
    passengers: 'passengers',
    viewPolicy: 'View Airline Policy',
    sizeLimit: 'Size Limit',
    weightLimit: 'Weight Limit',
    upgradeToSave: 'Upgrade to save on baggage fees',
    savingsWithUpgrade: 'Save with cabin upgrade',
    bestValue: 'Best Value',
    bagsIncluded: 'bags included',
    airlinePerks: 'Airline Perks',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
    roundTripNote: 'Round-trip fees calculated',
    domesticFees: 'Domestic Fees',
    internationalFees: 'International Fees',
    selectBags: 'Select your baggage',
    totalSavings: 'Total Savings',
    compared: 'compared to other airlines',
    mustFit: 'Must fit under seat',
    overheadBin: 'Overhead bin storage',
    checkedAtGate: 'Checked at gate',
    alwaysFree: 'Always included free',
    charges: 'charges',
    calculator: 'Baggage Calculator',
    breakdown: 'Price Breakdown',
  },
  pt: {
    title: 'Calculadora de Taxas de Bagagem',
    subtitle: 'Adicione bagagem e veja o custo total da viagem',
    personalItem: 'Item Pessoal',
    carryOn: 'Bagagem de Mão',
    checked1: '1ª Bagagem Despachada',
    checked2: '2ª Bagagem Despachada',
    checked3: '3ª Bagagem Despachada',
    oversized: 'Bagagem Grande',
    overweight: 'Taxa de Excesso',
    sportEquipment: 'Equipamento Esportivo',
    free: 'GRÁTIS',
    perPerson: 'por pessoa',
    perBag: 'por mala',
    included: 'Incluído',
    notIncluded: 'Não incluído com esta companhia',
    basePrice: 'Preço Base do Voo',
    baggageFees: 'Taxas de Bagagem',
    totalPrice: 'Custo Total da Viagem',
    whatYouPay: 'O Que Você Vai Pagar',
    passengers: 'passageiros',
    viewPolicy: 'Ver Política da Companhia',
    sizeLimit: 'Limite de Tamanho',
    weightLimit: 'Limite de Peso',
    upgradeToSave: 'Faça upgrade e economize em bagagem',
    savingsWithUpgrade: 'Economize com upgrade de classe',
    bestValue: 'Melhor Custo-Benefício',
    bagsIncluded: 'malas incluídas',
    airlinePerks: 'Vantagens da Companhia',
    showDetails: 'Mostrar Detalhes',
    hideDetails: 'Ocultar Detalhes',
    roundTripNote: 'Taxas de ida e volta calculadas',
    domesticFees: 'Taxas Domésticas',
    internationalFees: 'Taxas Internacionais',
    selectBags: 'Selecione suas bagagens',
    totalSavings: 'Economia Total',
    compared: 'comparado a outras companhias',
    mustFit: 'Deve caber sob o assento',
    overheadBin: 'Compartimento superior',
    checkedAtGate: 'Despachado no portão',
    alwaysFree: 'Sempre incluído grátis',
    charges: 'cobra',
    calculator: 'Calculadora de Bagagem',
    breakdown: 'Detalhamento de Preço',
  },
  es: {
    title: 'Calculadora de Tarifas de Equipaje',
    subtitle: 'Agregue equipaje y vea el costo total del viaje',
    personalItem: 'Artículo Personal',
    carryOn: 'Equipaje de Mano',
    checked1: '1er Equipaje Facturado',
    checked2: '2do Equipaje Facturado',
    checked3: '3er Equipaje Facturado',
    oversized: 'Equipaje Grande',
    overweight: 'Tarifa por Exceso',
    sportEquipment: 'Equipo Deportivo',
    free: 'GRATIS',
    perPerson: 'por persona',
    perBag: 'por maleta',
    included: 'Incluido',
    notIncluded: 'No incluido con esta aerolínea',
    basePrice: 'Precio Base del Vuelo',
    baggageFees: 'Tarifas de Equipaje',
    totalPrice: 'Costo Total del Viaje',
    whatYouPay: 'Lo Que Realmente Pagará',
    passengers: 'pasajeros',
    viewPolicy: 'Ver Política de Aerolínea',
    sizeLimit: 'Límite de Tamaño',
    weightLimit: 'Límite de Peso',
    upgradeToSave: 'Mejore para ahorrar en equipaje',
    savingsWithUpgrade: 'Ahorre con mejora de clase',
    bestValue: 'Mejor Valor',
    bagsIncluded: 'maletas incluidas',
    airlinePerks: 'Ventajas de Aerolínea',
    showDetails: 'Mostrar Detalles',
    hideDetails: 'Ocultar Detalles',
    roundTripNote: 'Tarifas de ida y vuelta calculadas',
    domesticFees: 'Tarifas Domésticas',
    internationalFees: 'Tarifas Internacionales',
    selectBags: 'Seleccione su equipaje',
    totalSavings: 'Ahorro Total',
    compared: 'comparado con otras aerolíneas',
    mustFit: 'Debe caber bajo el asiento',
    overheadBin: 'Compartimento superior',
    checkedAtGate: 'Facturado en puerta',
    alwaysFree: 'Siempre incluido gratis',
    charges: 'cobra',
    calculator: 'Calculadora de Equipaje',
    breakdown: 'Desglose de Precio',
  },
};

interface BagQuantity {
  carryOn: number;
  checked1: number;
  checked2: number;
  checked3: number;
  oversized: number;
  overweight: number;
  sportEquipment: number;
}

export default function BaggageFeeCalculator({
  flightId,
  airline,
  cabinClass,
  basePrice,
  passengers,
  onTotalUpdate,
  currency = 'USD',
  lang = 'en',
  routeType = 'DOMESTIC',
  isRoundTrip = false,
}: BaggageFeeCalculatorProps) {
  const t = TRANSLATIONS[lang];
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUpgradeComparison, setShowUpgradeComparison] = useState(false);

  const [bagQuantities, setBagQuantities] = useState<BagQuantity>({
    carryOn: 0,
    checked1: 0,
    checked2: 0,
    checked3: 0,
    oversized: 0,
    overweight: 0,
    sportEquipment: 0,
  });

  // Get airline policy and fees
  const airlinePolicy = useMemo(() => getAirlinePolicy(airline), [airline]);
  const fees = useMemo(() => getBaggageFees(airline, cabinClass, routeType), [airline, cabinClass, routeType]);

  // Calculate total baggage fees
  const baggageFees = useMemo(() => {
    if (!fees) return 0;

    const selection: BaggageSelection = {
      carryOn: bagQuantities.carryOn,
      checked1: bagQuantities.checked1,
      checked2: bagQuantities.checked2,
      checked3: bagQuantities.checked3,
      oversized: bagQuantities.oversized,
      overweight: bagQuantities.overweight,
      sportEquipment: bagQuantities.sportEquipment,
    };

    const singleTripFee = calculateBaggageFees(airline, cabinClass, selection, passengers, routeType);
    return isRoundTrip ? singleTripFee * 2 : singleTripFee;
  }, [fees, bagQuantities, airline, cabinClass, passengers, routeType, isRoundTrip]);

  // Calculate total price
  const totalPrice = basePrice + baggageFees;

  // Update parent component with total
  useEffect(() => {
    onTotalUpdate(totalPrice);
  }, [totalPrice, onTotalUpdate]);

  // Calculate upgrade savings
  const upgradeComparison = useMemo(() => {
    if (cabinClass === 'FIRST') return null;

    const nextClass: Record<CabinClass, CabinClass | null> = {
      ECONOMY: 'PREMIUM_ECONOMY',
      PREMIUM_ECONOMY: 'BUSINESS',
      BUSINESS: 'FIRST',
      FIRST: null,
    };

    const next = nextClass[cabinClass];
    if (!next) return null;

    const currentFees = fees;
    const upgradeFees = getBaggageFees(airline, next, routeType);

    if (!currentFees || !upgradeFees) return null;

    // Calculate potential savings
    const currentBagCost = (bagQuantities.checked1 * currentFees.checked1) +
                          (bagQuantities.checked2 * currentFees.checked2);
    const upgradeBagCost = (bagQuantities.checked1 * upgradeFees.checked1) +
                          (bagQuantities.checked2 * upgradeFees.checked2);

    const savings = currentBagCost - upgradeBagCost;

    if (savings <= 0) return null;

    return {
      nextClass: next,
      savings: savings * (passengers.adults + passengers.children) * (isRoundTrip ? 2 : 1),
    };
  }, [cabinClass, fees, bagQuantities, airline, routeType, passengers, isRoundTrip]);

  const updateBagQuantity = (type: keyof BagQuantity, delta: number) => {
    setBagQuantities(prev => ({
      ...prev,
      [type]: Math.max(0, Math.min(prev[type] + delta, 3)),
    }));
  };

  const formatPrice = (price: number): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      BRL: 'R$',
    };
    const symbol = symbols[currency] || currency + ' ';
    return `${symbol}${price.toFixed(2)}`;
  };

  if (!airlinePolicy || !fees) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {t.notIncluded}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Airline code: {airline}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalPassengers = passengers.adults + passengers.children;

  return (
    <div className="space-y-4">
      {/* Header with total preview */}
      <div
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30
                   border border-blue-200 dark:border-blue-800 rounded-xl p-6 cursor-pointer
                   hover:shadow-lg transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 dark:bg-blue-500 rounded-lg p-3">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.calculator}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {airlinePolicy.name} • {cabinClass.replace('_', ' ')}
              </p>

              {/* Quick perks preview */}
              <div className="flex flex-wrap gap-2 mt-3">
                {airlinePolicy.personalItemIncluded && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30
                                 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                    <Check className="w-3 h-3" />
                    {t.personalItem}
                  </span>
                )}
                {fees.carryOn === 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30
                                 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                    <Check className="w-3 h-3" />
                    {t.carryOn}
                  </span>
                )}
                {fees.checked1 === 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30
                                 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                    <Check className="w-3 h-3" />
                    {t.checked1}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t.totalPrice}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(totalPrice)}
            </div>
            {baggageFees > 0 && (
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                +{formatPrice(baggageFees)} {t.baggageFees.toLowerCase()}
              </div>
            )}
            <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {isExpanded ? t.hideDetails : t.showDetails}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">

          {/* Southwest special callout */}
          {airline === 'WN' && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20
                           border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {t.bestValue}!
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    First 2 {t.bagsIncluded} • {t.alwaysFree}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Spirit/Frontier warning */}
          {(airline === 'NK' || airline === 'F9') && fees.carryOn > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <span className="font-semibold">{airlinePolicy.name}</span> {t.charges} {formatPrice(fees.carryOn)}
                    {' '}{t.perPerson} for carry-on bags
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Baggage selector */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.selectBags}
            </h4>

            <div className="space-y-4">
              {/* Personal Item (always free) */}
              <BagItem
                icon={<ShoppingBag className="w-5 h-5" />}
                name={t.personalItem}
                price={0}
                quantity={totalPassengers}
                description={t.mustFit}
                sizeLimit={airlinePolicy.sizeLimit.personalItem}
                isFree={true}
                isIncluded={true}
                formatPrice={formatPrice}
                lang={lang}
              />

              {/* Carry-on */}
              <BagItem
                icon={<Briefcase className="w-5 h-5" />}
                name={t.carryOn}
                price={fees.carryOn}
                quantity={bagQuantities.carryOn}
                onQuantityChange={(delta) => updateBagQuantity('carryOn', delta)}
                description={t.overheadBin}
                sizeLimit={airlinePolicy.sizeLimit.carryOn}
                weightLimit={airlinePolicy.weightLimit.carryOn}
                isFree={fees.carryOn === 0}
                isIncluded={airlinePolicy.carryOnIncluded}
                formatPrice={formatPrice}
                perPerson={totalPassengers}
                lang={lang}
              />

              {/* 1st Checked Bag */}
              <BagItem
                icon={<Package className="w-5 h-5" />}
                name={t.checked1}
                price={fees.checked1}
                quantity={bagQuantities.checked1}
                onQuantityChange={(delta) => updateBagQuantity('checked1', delta)}
                description={t.checkedAtGate}
                sizeLimit={airlinePolicy.sizeLimit.checked}
                weightLimit={airlinePolicy.weightLimit.checked}
                isFree={fees.checked1 === 0}
                formatPrice={formatPrice}
                perPerson={totalPassengers}
                lang={lang}
              />

              {/* 2nd Checked Bag */}
              <BagItem
                icon={<Package className="w-5 h-5" />}
                name={t.checked2}
                price={fees.checked2}
                quantity={bagQuantities.checked2}
                onQuantityChange={(delta) => updateBagQuantity('checked2', delta)}
                sizeLimit={airlinePolicy.sizeLimit.checked}
                weightLimit={airlinePolicy.weightLimit.checked}
                isFree={fees.checked2 === 0}
                formatPrice={formatPrice}
                perPerson={totalPassengers}
                lang={lang}
              />

              {/* 3rd Checked Bag */}
              <BagItem
                icon={<Package className="w-5 h-5" />}
                name={t.checked3}
                price={fees.checked3}
                quantity={bagQuantities.checked3}
                onQuantityChange={(delta) => updateBagQuantity('checked3', delta)}
                sizeLimit={airlinePolicy.sizeLimit.checked}
                weightLimit={airlinePolicy.weightLimit.checked}
                isFree={fees.checked3 === 0}
                formatPrice={formatPrice}
                perPerson={totalPassengers}
                lang={lang}
              />
            </div>
          </div>

          {/* Upgrade suggestion */}
          {upgradeComparison && upgradeComparison.savings > 100 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20
                           border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 dark:bg-purple-500 rounded-lg p-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {t.upgradeToSave}
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 mt-1">
                    {t.savingsWithUpgrade}: {formatPrice(upgradeComparison.savings)}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    Upgrade to {upgradeComparison.nextClass.replace('_', ' ')} and get more free bags
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.breakdown}
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.basePrice}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(basePrice)}
                </span>
              </div>

              {baggageFees > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.baggageFees} ({totalPassengers} {t.passengers})
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    +{formatPrice(baggageFees)}
                  </span>
                </div>
              )}

              {isRoundTrip && baggageFees > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                  {t.roundTripNote}
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {t.whatYouPay}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Airline perks */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t.airlinePerks}
            </h4>
            <ul className="space-y-2">
              {airlinePolicy.perks.map((perk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <a
              href={airlinePolicy.policyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400
                       hover:underline font-medium"
            >
              {t.viewPolicy}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Baggage item component
interface BagItemProps {
  icon: React.ReactNode;
  name: string;
  price: number;
  quantity: number;
  onQuantityChange?: (delta: number) => void;
  description?: string;
  sizeLimit?: string;
  weightLimit?: string;
  isFree: boolean;
  isIncluded?: boolean;
  formatPrice: (price: number) => string;
  perPerson?: number;
  lang: 'en' | 'pt' | 'es';
}

function BagItem({
  icon,
  name,
  price,
  quantity,
  onQuantityChange,
  description,
  sizeLimit,
  weightLimit,
  isFree,
  isIncluded,
  formatPrice,
  perPerson = 1,
  lang,
}: BagItemProps) {
  const t = TRANSLATIONS[lang];
  const [showInfo, setShowInfo] = useState(false);

  const totalPrice = price * quantity * perPerson;
  const canDecrease = onQuantityChange && quantity > 0;
  const canIncrease = onQuantityChange && quantity < 3;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4
                    hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${
            isFree
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}>
            {icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {name}
              </h5>
              {(sizeLimit || weightLimit) && (
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
            </div>

            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {description}
              </p>
            )}

            {showInfo && (sizeLimit || weightLimit) && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs space-y-1">
                {sizeLimit && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t.sizeLimit}:</span> {sizeLimit}
                  </div>
                )}
                {weightLimit && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t.weightLimit}:</span> {weightLimit}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              {isFree ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30
                               text-green-700 dark:text-green-300 rounded-md text-xs font-bold">
                  <Check className="w-3 h-3" />
                  {t.free}
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-normal ml-1">
                    {t.perPerson}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onQuantityChange ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(-1)}
                  disabled={!canDecrease}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600
                           flex items-center justify-center
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>

                <button
                  onClick={() => onQuantityChange(1)}
                  disabled={!canIncrease}
                  className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600
                           flex items-center justify-center
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {totalPrice > 0 && (
                <div className="text-right min-w-[80px]">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(totalPrice)}
                  </div>
                  {perPerson > 1 && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {perPerson} {t.passengers}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">{t.included}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {quantity} {t.passengers}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
