'use client';

import React, { useState, useEffect } from 'react';
import { Car, Smartphone, Check, Plus, Minus, Sparkles, Zap } from 'lucide-react';

interface UberVoucher {
  id: string;
  type: 'uber_voucher';
  name: string;
  description: string;
  amount: number;
  currency: string;
  price: number;
  savings?: string;
  popular?: boolean;
}

interface ESIMPlan {
  id: string;
  type: 'esim';
  name: string;
  description: string;
  dataAmount: string;
  duration: string;
  coverage: string[];
  price: number;
  currency: string;
  popular?: boolean;
}

type AddOn = UberVoucher | ESIMPlan;

interface AddOnsSelectorProps {
  destination?: string;
  countryCode?: string;
  onSelectionChange?: (selectedAddons: AddOn[], total: number) => void;
  className?: string;
}

export function AddOnsSelector({
  destination,
  countryCode,
  onSelectionChange,
  className = '',
}: AddOnsSelectorProps) {
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Map<string, AddOn>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'uber' | 'esim'>('all');

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const params = new URLSearchParams();
        if (destination) params.set('destination', destination);
        if (countryCode) params.set('countryCode', countryCode);

        const response = await fetch(`/api/hotels/addons?${params}`);
        const data = await response.json();

        if (data.success) {
          setAddons(data.data.addons);
        }
      } catch (error) {
        console.error('Failed to load add-ons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, [destination, countryCode]);

  const toggleAddon = (addon: AddOn) => {
    const newSelected = new Map(selectedAddons);

    if (newSelected.has(addon.id)) {
      newSelected.delete(addon.id);
    } else {
      newSelected.set(addon.id, addon);
    }

    setSelectedAddons(newSelected);

    // Calculate total and notify parent
    const total = Array.from(newSelected.values()).reduce((sum, a) => sum + a.price, 0);
    onSelectionChange?.(Array.from(newSelected.values()), total);
  };

  const filteredAddons = addons.filter(addon => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'uber') return addon.type === 'uber_voucher';
    if (activeCategory === 'esim') return addon.type === 'esim';
    return true;
  });

  const totalPrice = Array.from(selectedAddons.values()).reduce((sum, a) => sum + a.price, 0);

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Enhance Your Trip
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add travel essentials at great prices
          </p>
        </div>
        {totalPrice > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Add-ons total</p>
            <p className="text-xl font-bold text-blue-600">${totalPrice}</p>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('uber')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeCategory === 'uber'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Car className="w-4 h-4" />
          Uber
        </button>
        <button
          onClick={() => setActiveCategory('esim')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeCategory === 'esim'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          eSIM
        </button>
      </div>

      {/* Add-ons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAddons.map((addon) => {
          const isSelected = selectedAddons.has(addon.id);
          const isUber = addon.type === 'uber_voucher';

          return (
            <button
              key={addon.id}
              onClick={() => toggleAddon(addon)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Popular Badge */}
              {addon.popular && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Popular
                </span>
              )}

              {/* Selection Indicator */}
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                isUber ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
              }`}>
                {isUber ? <Car className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              </div>

              {/* Content */}
              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{addon.description}</p>

              {/* eSIM specific info */}
              {addon.type === 'esim' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {(addon as ESIMPlan).dataAmount}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {(addon as ESIMPlan).duration}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">${addon.price}</span>
                {isUber && (addon as UberVoucher).savings && (
                  <span className="text-sm font-medium text-green-600">
                    {(addon as UberVoucher).savings}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedAddons.size > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {selectedAddons.size} add-on{selectedAddons.size !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {Array.from(selectedAddons.values()).map(a => a.name).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${totalPrice}</p>
              <p className="text-xs text-gray-500">Added to booking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for booking sidebar
export function AddOnsSelectorCompact({
  destination,
  countryCode,
  onSelectionChange,
  className = '',
}: AddOnsSelectorProps) {
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Map<string, AddOn>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const response = await fetch(`/api/hotels/addons?destination=${destination || ''}&countryCode=${countryCode || ''}`);
        const data = await response.json();
        if (data.success) {
          setAddons(data.data.addons.filter((a: AddOn) => a.popular));
        }
      } catch (error) {
        console.error('Failed to load add-ons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddons();
  }, [destination, countryCode]);

  const toggleAddon = (addon: AddOn) => {
    const newSelected = new Map(selectedAddons);
    if (newSelected.has(addon.id)) {
      newSelected.delete(addon.id);
    } else {
      newSelected.set(addon.id, addon);
    }
    setSelectedAddons(newSelected);
    const total = Array.from(newSelected.values()).reduce((sum, a) => sum + a.price, 0);
    onSelectionChange?.(Array.from(newSelected.values()), total);
  };

  if (loading) return null;

  const totalPrice = Array.from(selectedAddons.values()).reduce((sum, a) => sum + a.price, 0);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-600" />
          <span className="font-medium text-sm">Travel Add-ons</span>
          {totalPrice > 0 && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              +${totalPrice}
            </span>
          )}
        </div>
        <span className="text-gray-400">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="p-3 space-y-2">
          {addons.slice(0, 4).map(addon => {
            const isSelected = selectedAddons.has(addon.id);
            return (
              <button
                key={addon.id}
                onClick={() => toggleAddon(addon)}
                className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {addon.type === 'uber_voucher' ? (
                    <Car className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm font-medium">{addon.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">${addon.price}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AddOnsSelector;
