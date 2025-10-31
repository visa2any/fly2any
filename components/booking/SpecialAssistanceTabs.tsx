'use client';

import { useState } from 'react';

interface SpecialAssistanceTabsProps {
  wheelchairAssistance?: string;
  mealPreference?: string;
  otherRequests?: string;
  onWheelchairChange: (value: string) => void;
  onMealChange: (value: string) => void;
  onOtherRequestsChange: (value: string) => void;
}

type TabId = 'wheelchair' | 'meals' | 'other';

const WHEELCHAIR_OPTIONS = [
  {
    code: '',
    name: 'No Wheelchair Needed',
    description: 'I can walk independently through the airport',
    icon: '✅'
  },
  {
    code: 'WCHR',
    name: 'WCHR - Wheelchair Ramp',
    description: 'I can walk short distances and climb stairs, need wheelchair for long distances',
    icon: '♿'
  },
  {
    code: 'WCHS',
    name: 'WCHS - Wheelchair Steps',
    description: 'I cannot climb stairs but can walk to my seat, need assistance with steps',
    icon: '♿'
  },
  {
    code: 'WCHC',
    name: 'WCHC - Wheelchair Cabin',
    description: 'I am completely immobile, need full assistance from wheelchair to cabin seat',
    icon: '♿'
  },
];

const MEAL_CATEGORIES = [
  {
    name: 'Vegetarian',
    icon: '🥗',
    meals: [
      { code: '', name: 'Standard Meal', description: 'Regular airline meal' },
      { code: 'VGML', name: 'Vegetarian', description: 'Non-dairy vegetarian meal' },
      { code: 'VOML', name: 'Vegetarian Oriental', description: 'Asian-style vegetarian' },
      { code: 'AVML', name: 'Asian Vegetarian', description: 'Indian-style vegetarian' },
    ]
  },
  {
    name: 'Religious',
    icon: '🕌',
    meals: [
      { code: 'HNML', name: 'Hindu', description: 'Hindu non-vegetarian meal' },
      { code: 'KSML', name: 'Kosher', description: 'Jewish dietary requirements' },
      { code: 'MOML', name: 'Muslim', description: 'Halal meal' },
    ]
  },
  {
    name: 'Medical',
    icon: '🏥',
    meals: [
      { code: 'DBML', name: 'Diabetic', description: 'Low sugar meal' },
      { code: 'GFML', name: 'Gluten-Free', description: 'No gluten products' },
      { code: 'LFML', name: 'Low Fat', description: 'Reduced fat content' },
      { code: 'LCML', name: 'Low Calorie', description: 'Calorie-restricted' },
      { code: 'NLML', name: 'Non-Lactose', description: 'Dairy-free meal' },
    ]
  },
  {
    name: 'Other',
    icon: '🍽️',
    meals: [
      { code: 'BBML', name: 'Baby Meal', description: 'For infants' },
      { code: 'CHML', name: 'Child Meal', description: 'Kid-friendly meal' },
      { code: 'FPML', name: 'Fruit Platter', description: 'Fresh fruit selection' },
      { code: 'SFML', name: 'Seafood', description: 'Fish and seafood' },
    ]
  }
];

export function SpecialAssistanceTabs({
  wheelchairAssistance = '',
  mealPreference = '',
  otherRequests = '',
  onWheelchairChange,
  onMealChange,
  onOtherRequestsChange,
}: SpecialAssistanceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('wheelchair');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          ♿ Special Assistance (SSR)
        </h4>
        <p className="text-xs text-gray-600 mt-0.5">
          Request wheelchair assistance, special meals, or other services
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('wheelchair')}
          className={`
            flex-1 px-4 py-2.5 text-xs font-semibold transition-all border-b-2
            ${activeTab === 'wheelchair'
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            ♿ WHEELCHAIR
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meals')}
          className={`
            flex-1 px-4 py-2.5 text-xs font-semibold transition-all border-b-2
            ${activeTab === 'meals'
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            🍽️ MEALS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('other')}
          className={`
            flex-1 px-4 py-2.5 text-xs font-semibold transition-all border-b-2
            ${activeTab === 'other'
              ? 'border-primary-500 text-primary-600 bg-primary-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            📝 OTHER
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Wheelchair Tab */}
        {activeTab === 'wheelchair' && (
          <div className="space-y-2 animate-fadeIn">
            <p className="text-xs text-gray-600 mb-3">
              Select the type of wheelchair assistance you need at the airport
            </p>
            {WHEELCHAIR_OPTIONS.map((option) => (
              <label
                key={option.code}
                className={`
                  flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all
                  ${wheelchairAssistance === option.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="wheelchair"
                  value={option.code}
                  checked={wheelchairAssistance === option.code}
                  onChange={(e) => onWheelchairChange(e.target.value)}
                  className="mt-1 w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{option.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
            {wheelchairAssistance && wheelchairAssistance !== '' && (
              <div className="mt-3 p-2 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-xs text-primary-700 flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>Wheelchair will be provided at airport, boarding, and deplaning</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-xs text-gray-600">
              Select a special meal preference for your flight
            </p>
            {MEAL_CATEGORIES.map((category) => (
              <div key={category.name}>
                <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {category.meals.map((meal) => (
                    <label
                      key={meal.code}
                      className={`
                        flex items-start gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all
                        ${mealPreference === meal.code
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="meal"
                        value={meal.code}
                        checked={mealPreference === meal.code}
                        onChange={(e) => onMealChange(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-gray-900 block">{meal.name}</span>
                        <span className="text-xs text-gray-600">{meal.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {mealPreference && mealPreference !== '' && (
              <div className="mt-3 p-2 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-xs text-primary-700 flex items-center gap-1.5">
                  <span>🍽️</span>
                  <span>Special meal will be prepared according to your preferences</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Other Requests Tab */}
        {activeTab === 'other' && (
          <div className="space-y-3 animate-fadeIn">
            <p className="text-xs text-gray-600">
              Describe any other special assistance or services you need
            </p>
            <textarea
              value={otherRequests}
              onChange={(e) => onOtherRequestsChange(e.target.value)}
              placeholder="Examples: Medical equipment (oxygen, CPAP), service animal, pregnancy assistance, unaccompanied minor, etc."
              rows={5}
              maxLength={500}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Airlines will review and confirm your request</span>
              <span>{otherRequests.length} / 500</span>
            </div>
            {otherRequests && (
              <div className="p-2 bg-warning-50 border border-warning-200 rounded-lg">
                <p className="text-xs text-warning-700 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Some services may require advance notice or additional fees</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
