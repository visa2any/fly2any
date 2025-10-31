'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Armchair, Luggage, Shield, Wifi, Star, Info } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  selected: boolean;
}

interface AddOnCategory {
  id: string;
  name: string;
  icon: 'seat' | 'baggage' | 'insurance' | 'wifi' | 'priority';
  subtitle: string;
  items: AddOn[];
  proTip?: string;
  expanded?: boolean;
}

interface AddOnsAccordionProps {
  categories: AddOnCategory[];
  onAddOnToggle: (categoryId: string, addOnId: string, selected: boolean) => void;
}

const CategoryIcon = ({ type }: { type: string }) => {
  const iconMap = {
    seat: Armchair,
    baggage: Luggage,
    insurance: Shield,
    wifi: Wifi,
    priority: Star,
  };
  const Icon = iconMap[type as keyof typeof iconMap] || Info;
  return <Icon className="w-5 h-5" />;
};

export function AddOnsAccordion({ categories, onAddOnToggle }: AddOnsAccordionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const selectedCount = category.items.filter(item => item.selected).length;
        const totalPrice = category.items
          .filter(item => item.selected)
          .reduce((sum, item) => sum + item.price, 0);

        return (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                <CategoryIcon type={category.icon} />
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{category.name}</h4>
                  {selectedCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{category.subtitle}</p>
              </div>

              {/* Price Summary */}
              {totalPrice > 0 && (
                <div className="text-right mr-2">
                  <p className="text-sm font-bold text-primary-600">
                    +{category.items[0].currency} {totalPrice}
                  </p>
                </div>
              )}

              {/* Expand Icon */}
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Category Content */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                {/* Pro Tip */}
                {category.proTip && (
                  <div className="mb-3 p-2 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-800">{category.proTip}</p>
                  </div>
                )}

                {/* Add-On Items */}
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <label
                      key={item.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                        ${item.selected
                          ? 'bg-primary-50 border-2 border-primary-300'
                          : 'bg-white border-2 border-gray-200 hover:border-primary-200'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => onAddOnToggle(category.id, item.id, e.target.checked)}
                        className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                          <span className="text-sm font-bold text-gray-900">
                            {item.currency} {item.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Special Cases: Seat Map Preview */}
                {category.id === 'seats' && (
                  <button className="mt-3 w-full py-2 px-4 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                    View Interactive Seat Map →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
