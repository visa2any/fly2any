'use client';

import { useState } from 'react';
import { Armchair, Luggage, Shield, Wifi, Star, Info, Minus, Plus, ChevronRight, ChevronDown, X } from 'lucide-react';

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

// Ultra-compact mobile card for each category (~60px height)
function MobileCompactCard({
  category,
  onViewSeatMap,
  onAddOnToggle,
  onExpand,
  isExpanded,
}: {
  category: AddOnCategory;
  onViewSeatMap?: () => void;
  onAddOnToggle: (categoryId: string, addOnId: string, selected: boolean, quantity?: number) => void;
  onExpand: () => void;
  isExpanded: boolean;
}) {
  const selectedCount = category.items.filter(item => item.selected).length;
  const totalPrice = category.items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price, 0);

  const isSeatCategory = category.id === 'seats';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Compact Header Row */}
      <button
        onClick={() => {
          if (isSeatCategory && onViewSeatMap) {
            onViewSeatMap();
          } else {
            onExpand();
          }
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <CategoryIcon type={category.icon} className="w-4 h-4 text-primary-600" />
        </div>

        {/* Category Name + Subtitle */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{category.name}</span>
            {selectedCount > 0 && (
              <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 truncate">
            {isSeatCategory
              ? 'Interactive map • Select per passenger'
              : category.subtitle
            }
          </p>
        </div>

        {/* Price (if selected) + Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalPrice > 0 && (
            <span className="text-xs font-bold text-primary-600">
              +{category.items[0]?.currency || 'USD'} {totalPrice}
            </span>
          )}
          {isSeatCategory ? (
            <span className="text-xs font-semibold text-primary-600 flex items-center gap-0.5">
              View <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </button>

      {/* Expanded Content (non-seat categories) */}
      {isExpanded && !isSeatCategory && (
        <MobileExpandedContent
          category={category}
          onAddOnToggle={onAddOnToggle}
          onClose={onExpand}
        />
      )}
    </div>
  );
}

// Expanded content for mobile add-on selection
function MobileExpandedContent({
  category,
  onAddOnToggle,
  onClose,
}: {
  category: AddOnCategory;
  onAddOnToggle: (categoryId: string, addOnId: string, selected: boolean, quantity?: number) => void;
  onClose: () => void;
}) {
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (itemId: string, newQuantity: number, item: AddOn) => {
    const max = item.quantity?.max || 5;
    const min = item.quantity?.min || 0;
    const clampedQuantity = Math.max(min, Math.min(max, newQuantity));

    setItemQuantities(prev => ({
      ...prev,
      [itemId]: clampedQuantity,
    }));

    onAddOnToggle(category.id, itemId, clampedQuantity > 0, clampedQuantity);
  };

  return (
    <div className="border-t border-gray-100 p-3 bg-gray-50 animate-slideDown">
      {/* Items Grid - 2 per row */}
      <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
        {category.items.map((item) => {
          const isBaggage = category.id === 'baggage' && item.quantity;
          const currentQuantity = itemQuantities[item.id] || item.quantity?.selected || 0;

          return (
            <div
              key={item.id}
              className={`
                p-2 rounded-lg transition-all text-left
                ${item.selected
                  ? 'bg-primary-50 border border-primary-300'
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              {!isBaggage ? (
                <label className="flex items-start gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) => onAddOnToggle(category.id, item.id, e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 text-primary-500 rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-900 truncate">{item.name}</div>
                    <div className="text-[9px] text-gray-500 truncate">{item.description}</div>
                    <div className="text-[10px] font-bold text-gray-900 mt-0.5">
                      {item.currency} {item.price}
                    </div>
                  </div>
                </label>
              ) : (
                <div>
                  <div className="text-[10px] font-semibold text-gray-900 truncate">{item.name}</div>
                  <div className="text-[9px] text-gray-500 truncate mb-1">
                    {item.currency} {item.price}
                    {item.weight && ` • ${item.weight.value}${item.weight.unit}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, currentQuantity - 1, item)}
                      disabled={currentQuantity <= (item.quantity?.min || 0)}
                      className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 disabled:opacity-30"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-semibold min-w-[1rem] text-center">{currentQuantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, currentQuantity + 1, item)}
                      disabled={currentQuantity >= (item.quantity?.max || 5)}
                      className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 disabled:opacity-30"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 py-1.5 text-xs font-semibold text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50"
      >
        Done
      </button>
    </div>
  );
}

export function AddOnsTabs({ categories, onAddOnToggle, onViewSeatMap }: AddOnsTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

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
    <>
      {/* MOBILE: Ultra-compact accordion cards (~60px each collapsed) */}
      <div className="sm:hidden space-y-2">
        {categories.map((category) => (
          <MobileCompactCard
            key={category.id}
            category={category}
            onViewSeatMap={onViewSeatMap}
            onAddOnToggle={onAddOnToggle}
            onExpand={() => setExpandedMobileCategory(
              expandedMobileCategory === category.id ? null : category.id
            )}
            isExpanded={expandedMobileCategory === category.id}
          />
        ))}
      </div>

      {/* DESKTOP: Original tabbed layout */}
      <div className="hidden sm:block bg-white border border-gray-200 rounded-lg overflow-hidden">
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

          {/* Add-On Items (Grid for compactness) - 2 per row on mobile */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2 max-h-[300px] overflow-y-auto">
            {/* Special message for seats category when using seat map */}
            {activeCategory.id === 'seats' && activeCategory.items.length === 0 && onViewSeatMap && (
              <div className="col-span-full text-center py-4">
                <Armchair className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Select your seats using our interactive seat map</p>
                <p className="text-xs text-gray-500 mt-1">See real-time availability and prices for each seat</p>
              </div>
            )}
            {activeCategory.items.map((item) => {
              const isBaggage = activeCategory.id === 'baggage' && item.quantity;
              const currentQuantity = itemQuantities[item.id] || item.quantity?.selected || 0;
              const hasRealData = item.metadata?.isReal && !item.metadata?.isMock;

              return (
                <div
                  key={item.id}
                  className={`
                    flex items-start gap-1 sm:gap-2 p-1.5 sm:p-2.5 rounded-lg transition-all
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
                    // Quantity selector for baggage items - compact mobile
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1 sm:mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-900 leading-tight truncate">{item.name}</span>
                            {hasRealData && (
                              <span className="px-1 py-0.5 bg-green-100 text-green-700 text-[8px] sm:text-[9px] font-bold rounded uppercase flex-shrink-0">
                                Live Price
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] sm:text-xs text-gray-600 mt-0.5 leading-tight truncate">
                            {item.description}
                            {item.weight && ` - ${item.weight.value}${item.weight.unit}`}
                          </p>
                          {item.metadata?.perPassenger && (
                            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">Per passenger</p>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                          {item.currency} {item.price}
                        </span>
                      </div>

                      {/* Quantity Selector - compact */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activeCategory.id, item.id, currentQuantity - 1, item)}
                          disabled={currentQuantity <= (item.quantity?.min || 0)}
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                          {currentQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(activeCategory.id, item.id, currentQuantity + 1, item)}
                          disabled={currentQuantity >= (item.quantity?.max || 5)}
                          className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="text-[9px] sm:text-xs text-gray-500 ml-1 sm:ml-2">
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
    </>
  );
}
