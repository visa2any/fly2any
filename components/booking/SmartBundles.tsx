'use client';

import { useState } from 'react';
import { Briefcase, Palmtree, Backpack, Sparkles, Check } from 'lucide-react';

interface BundleItem {
  name: string;
  included: boolean;
}

interface Bundle {
  id: string;
  name: string;
  icon: 'business' | 'vacation' | 'traveler';
  description: string;
  items: BundleItem[];
  price: number;
  savings: number;
  currency: string;
  recommended?: boolean;
}

interface SmartBundlesProps {
  bundles: Bundle[];
  selectedBundleId?: string | null;
  onSelect: (bundleId: string | null) => void;
}

const BundleIcon = ({ type }: { type: 'business' | 'vacation' | 'traveler' }) => {
  const iconMap = {
    business: Briefcase,
    vacation: Palmtree,
    traveler: Backpack,
  };
  const Icon = iconMap[type];
  return <Icon className="w-5 h-5" />;
};

export function SmartBundles({ bundles, selectedBundleId, onSelect }: SmartBundlesProps) {
  const [selected, setSelected] = useState<string | null>(selectedBundleId || null);

  // Handle empty bundles
  if (!bundles || bundles.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">No bundle deals available for this flight.</p>
        <p className="text-xs text-gray-500 mt-1">You can still customize your trip with individual add-ons below.</p>
      </div>
    );
  }

  const handleSelect = (bundleId: string) => {
    const newSelection = selected === bundleId ? null : bundleId;
    setSelected(newSelection);
    onSelect(newSelection);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-500" />
        <h3 className="text-base font-bold text-gray-900">Smart Bundles for Your Trip</h3>
      </div>
      <p className="text-xs text-gray-600 -mt-1">
        Save up to 25% by bundling popular add-ons together
      </p>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {bundles.map((bundle) => {
          const isSelected = selected === bundle.id;

          return (
            <button
              key={bundle.id}
              onClick={() => handleSelect(bundle.id)}
              className={`
                relative p-3 rounded-lg border-2 text-left transition-all duration-300 transform hover:-translate-y-1
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
                ${bundle.recommended ? 'ring-2 ring-warning-200' : ''}
              `}
            >
              {/* Recommended Badge */}
              {bundle.recommended && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  BEST VALUE
                </div>
              )}

              {/* Bundle Icon & Name */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <BundleIcon type={bundle.icon} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{bundle.name}</h4>
                  <p className="text-xs text-gray-600">{bundle.description}</p>
                </div>
              </div>

              {/* Included Items */}
              <ul className="space-y-0.5 mb-2">
                {bundle.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <Check className="w-3 h-3 text-success-500 flex-shrink-0 mt-0.5" />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>

              {/* Price & Savings */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      +{bundle.currency} {bundle.price}
                    </span>
                    <p className="text-xs text-success-600 font-medium">
                      Save {bundle.currency} {bundle.savings}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Skip Option */}
      <button
        onClick={() => {
          setSelected(null);
          onSelect(null);
        }}
        className="text-sm text-gray-600 hover:text-gray-900 underline mx-auto block"
      >
        ⚙️ Or customize your add-ons below
      </button>
    </div>
  );
}
