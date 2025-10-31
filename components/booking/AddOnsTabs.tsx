'use client';

import { useState } from 'react';
import { Armchair, Luggage, Shield, Wifi, Star, Info, Minus, Plus } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  selected: boolean;
  weight?: {
    value: number;
    unit: string;
  };
  quantity?: {
    min: number;
    max: number;
    selected?: number;
  };
  metadata?: {
    type?: 'checked' | 'carry_on';
    isReal?: boolean;
    isMock?: boolean;
    perPassenger?: boolean;
    perSegment?: boolean;
  };
}

interface AddOnCategory {
  id: string;
  name: string;
  icon: 'seat' | 'baggage' | 'insurance' | 'wifi' | 'priority';
  subtitle: string;
  items: AddOn[];
  proTip?: string;
}

interface AddOnsTabsProps {
  categories: AddOnCategory[];
  onAddOnToggle: (categoryId: string, addOnId: string, selected: boolean, quantity?: number) => void;
  onViewSeatMap?: () => void; // Handler for seat map button
}

const CategoryIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  const iconMap = {
    seat: Armchair,
    baggage: Luggage,
    insurance: Shield,
    wifi: Wifi,
    priority: Star,
  };
  const Icon = iconMap[type as keyof typeof iconMap] || Info;
  return <Icon className={className} />;
};

export function AddOnsTabs({ categories, onAddOnToggle, onViewSeatMap }: AddOnsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Handle empty categories
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">No add-ons available for this flight.</p>
      </div>
    );
  }

  const activeCategory = categories.find(cat => cat.id === activeTab);

  // Handle quantity change for baggage items
  const handleQuantityChange = (categoryId: string, itemId: string, newQuantity: number, item: AddOn) => {
    const max = item.quantity?.max || 5;
    const min = item.quantity?.min || 0;

    const clampedQuantity = Math.max(min, Math.min(max, newQuantity));

    setItemQuantities(prev => ({
      ...prev,
      [itemId]: clampedQuantity,
    }));

    // If quantity is 0, deselect the item; otherwise select it
    onAddOnToggle(categoryId, itemId, clampedQuantity > 0, clampedQuantity);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Horizontal Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {categories.map((category) => {
          const isActive = activeTab === category.id;
          const selectedCount = category.items.filter(item => item.selected).length;
          const totalPrice = category.items
            .filter(item => item.selected)
            .reduce((sum, item) => sum + item.price, 0);

          return (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`
                flex-1 px-3 py-3 flex flex-col items-center gap-1.5 transition-all relative
                ${isActive
                  ? 'bg-white text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                }
              `}
            >
              {/* Icon with selection badge */}
              <div className="relative">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                  ${isActive ? 'bg-primary-100' : 'bg-gray-100'}
                `}>
                  <CategoryIcon type={category.icon} className="w-4 h-4" />
                </div>
                {selectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {selectedCount}
                  </span>
                )}
              </div>

              {/* Category Name */}
              <span className="text-xs font-bold leading-tight">{category.name}</span>

              {/* Price (if any selected) */}
              {totalPrice > 0 && (
                <span className="text-[10px] font-bold text-primary-600">
                  +{category.items[0].currency} {totalPrice}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content (Fixed Height) */}
      {activeCategory && (
        <div className="p-4">
          {/* Pro Tip */}
          {activeCategory.proTip && (
            <div className="mb-3 p-2 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning-800">{activeCategory.proTip}</p>
            </div>
          )}

          {/* Subtitle */}
          <p className="text-xs text-gray-600 mb-3">{activeCategory.subtitle}</p>

          {/* Add-On Items (Grid for compactness) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {activeCategory.items.map((item) => {
              const isBaggage = activeCategory.id === 'baggage' && item.quantity;
              const currentQuantity = itemQuantities[item.id] || item.quantity?.selected || 0;
              const hasRealData = item.metadata?.isReal && !item.metadata?.isMock;

              return (
                <div
                  key={item.id}
                  className={`
                    flex items-start gap-2 p-2.5 rounded-lg transition-all
                    ${item.selected
                      ? 'bg-primary-50 border-2 border-primary-300'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-primary-200'
                    }
                  `}
                >
                  {!isBaggage ? (
                    // Checkbox for non-baggage items
                    <>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => onAddOnToggle(activeCategory.id, item.id, e.target.checked)}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-900 leading-tight">{item.name}</span>
                          <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                            {item.currency} {item.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">{item.description}</p>
                      </div>
                    </>
                  ) : (
                    // Quantity selector for baggage items
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900 leading-tight">{item.name}</span>
                            {hasRealData && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded uppercase">
                                Live Price
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                            {item.description}
                            {item.weight && ` - ${item.weight.value}${item.weight.unit}`}
                          </p>
                          {item.metadata?.perPassenger && (
                            <p className="text-[10px] text-gray-500 mt-0.5">Per passenger</p>
                          )}
                          {item.metadata?.perSegment && (
                            <p className="text-[10px] text-gray-500 mt-0.5">Per segment</p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                          {item.currency} {item.price}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activeCategory.id, item.id, currentQuantity - 1, item)}
                          disabled={currentQuantity <= (item.quantity?.min || 0)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                          {currentQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activeCategory.id, item.id, currentQuantity + 1, item)}
                          disabled={currentQuantity >= (item.quantity?.max || 5)}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-500 ml-2">
                          Max: {item.quantity?.max || 5}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Special Action: Seat Map */}
          {activeCategory.id === 'seats' && onViewSeatMap && (
            <button
              type="button"
              onClick={onViewSeatMap}
              className="mt-3 w-full py-2 px-3 bg-primary-500 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
            >
              View Interactive Seat Map →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
