'use client';

import { useState } from 'react';
import { Briefcase, Check, Plus, Minus } from 'lucide-react';
import { BaggageOption } from '@/types/booking-flow';
import { useCurrency } from '@/lib/context/CurrencyContext';

const translations = {
  en: {
    title: 'Add Checked Baggage',
    subtitle: 'Save by adding bags now vs. at airport',
    mostPopular: 'Most Popular',
    none: 'None',
    bag: 'Bag',
    bags: 'Bags',
    free: 'Free',
    customAmount: 'Custom Amount',
  },
  pt: {
    title: 'Adicionar Bagagem Despachada',
    subtitle: 'Economize adicionando bagagem agora',
    mostPopular: 'Mais Popular',
    none: 'Nenhuma',
    bag: 'Mala',
    bags: 'Malas',
    free: 'Grátis',
    customAmount: 'Quantidade Personalizada',
  },
  es: {
    title: 'Agregar Equipaje Facturado',
    subtitle: 'Ahorra agregando equipaje ahora',
    mostPopular: 'Más Popular',
    none: 'Ninguna',
    bag: 'Maleta',
    bags: 'Maletas',
    free: 'Gratis',
    customAmount: 'Cantidad Personalizada',
  },
};

interface BaggageUpsellWidgetProps {
  options: BaggageOption[];
  selectedQuantity?: number;
  onSelect: (quantity: number) => void;
  maxBags?: number;
  lang?: 'en' | 'pt' | 'es';
}

/**
 * Baggage Upsell Widget - Inline Chat Component
 *
 * Visual, easy-to-use baggage selection optimized for chat interface
 * Shows clear pricing and benefits
 */
export function BaggageUpsellWidget({
  options,
  selectedQuantity = 0,
  onSelect,
  maxBags = 3,
  lang = 'en',
}: BaggageUpsellWidgetProps) {
  const [quantity, setQuantity] = useState(selectedQuantity);
  const { getSymbol } = useCurrency();
  const t = translations[lang] || translations.en;
  const currencySymbol = getSymbol();

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(0, Math.min(newQuantity, maxBags));
    setQuantity(validQuantity);
    onSelect(validQuantity);
  };

  // Calculate total price
  const selectedOption = options.find(opt => opt.quantity === quantity);
  const totalPrice = selectedOption?.price || 0;

  return (
    <div className="space-y-2.5 max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{t.title}</h4>
          <p className="text-[10px] text-gray-600">{t.subtitle}</p>
        </div>
      </div>

      {/* Quick Select Options */}
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = quantity === option.quantity;
          const isMostPopular = option.quantity === 1;

          return (
            <button
              key={option.id}
              onClick={() => handleQuantityChange(option.quantity)}
              className={`
                relative p-2.5 rounded-lg border-2 text-center transition-all
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-primary-300'
                }
              `}
            >
              {/* Popular Badge */}
              {isMostPopular && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {t.mostPopular}
                </div>
              )}

              {/* Check Icon */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              {/* Bag Icon & Quantity */}
              <div className="mb-1.5">
                <Briefcase className={`w-5 h-5 mx-auto ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="text-xs font-bold text-gray-900 mt-1">
                  {option.quantity === 0 ? t.none : `${option.quantity} ${option.quantity > 1 ? t.bags : t.bag}`}
                </div>
              </div>

              {/* Price */}
              <div className={`text-sm font-bold ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                {option.price === 0 ? t.free : `+${currencySymbol}${option.price}`}
              </div>

              {/* Weight Info */}
              <div className="text-[9px] text-gray-500 mt-0.5">
                {option.weight}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Quantity Selector (if more than 3 bags needed) */}
      {maxBags > 3 && (
        <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">{t.customAmount}:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity === 0}
              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxBags}
              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Savings Callout */}
      {quantity > 0 && totalPrice > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="text-[10px]">
            <span className="font-semibold text-green-900">You save $15!</span>
            <span className="text-green-700 ml-1">vs. paying at airport</span>
          </div>
        </div>
      )}

      {/* Policy Info */}
      <div className="text-[9px] text-gray-500 bg-gray-50 rounded p-2">
        <div className="flex items-start gap-1 mb-1">
          <Check className="w-2.5 h-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>Each bag up to 50 lbs (23 kg)</span>
        </div>
        <div className="flex items-start gap-1">
          <Check className="w-2.5 h-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>Add more bags later if needed</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Baggage Widget - Minimal version
 */
export function CompactBaggageWidget({
  onSelect,
}: {
  onSelect: (quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(0);

  const handleSelect = (q: number) => {
    setQuantity(q);
    onSelect(q);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleSelect(0)}
        className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
          quantity === 0
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        No bags
      </button>
      <button
        onClick={() => handleSelect(1)}
        className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
          quantity === 1
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        1 bag +$35
      </button>
      <button
        onClick={() => handleSelect(2)}
        className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
          quantity === 2
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        2 bags +$60
      </button>
    </div>
  );
}
