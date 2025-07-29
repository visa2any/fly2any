/**
 * Componente de filtros para busca de hotéis
 * Permite filtrar por preço, classificação, facilidades, etc.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Star,
  Wifi,
  Car,
  Coffee,
  Users,
  Waves,
  Utensils,
  Shield,
  Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import type { HotelFiltersProps, SearchFilters } from '../../types/hotels';

// Facilidades disponíveis com ícones
const availableAmenities = [
  { id: 'wifi', name: 'Wi-Fi gratuito', icon: Wifi },
  { id: 'parking', name: 'Estacionamento', icon: Car },
  { id: 'breakfast', name: 'Café da manhã', icon: Coffee },
  { id: 'gym', name: 'Academia', icon: Users },
  { id: 'pool', name: 'Piscina', icon: Waves },
  { id: 'restaurant', name: 'Restaurante', icon: Utensils },
  { id: 'spa', name: 'Spa', icon: Users },
  { id: 'concierge', name: 'Concierge', icon: Shield },
];

// Tipos de propriedade
const propertyTypes = [
  { id: 'hotel', name: 'Hotel' },
  { id: 'resort', name: 'Resort' },
  { id: 'pousada', name: 'Pousada' },
  { id: 'apart_hotel', name: 'Apart Hotel' },
  { id: 'hostel', name: 'Hostel' },
];

// Políticas de cancelamento
const cancellationPolicies = [
  { id: 'free', name: 'Cancelamento gratuito' },
  { id: 'paid', name: 'Cancelamento com taxa' },
  { id: 'non_refundable', name: 'Não reembolsável' },
];

// Planos alimentares
const mealPlans = [
  { id: 'room_only', name: 'Apenas acomodação' },
  { id: 'breakfast', name: 'Com café da manhã' },
  { id: 'half_board', name: 'Meia pensão' },
  { id: 'full_board', name: 'Pensão completa' },
  { id: 'all_inclusive', name: 'Tudo incluído' },
];

export default function HotelFilters({
  filters,
  onFiltersChange,
  priceRange,
  availableAmenities: customAmenities,
  loading = false
}: HotelFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Sempre expandido
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [priceMin, setPriceMin] = useState(filters.priceRange?.min || 0);
  const [priceMax, setPriceMax] = useState(filters.priceRange?.max || 1000);

  // Atualizar filtros locais quando props mudam
  useEffect(() => {
    setLocalFilters(filters);
    setPriceMin(filters.priceRange?.min || 0);
    setPriceMax(filters.priceRange?.max || 1000);
  }, [filters]);

  // Aplicar filtros
  const applyFilters = () => {
    const newFilters: SearchFilters = {
      ...localFilters,
      priceRange: {
        min: priceMin,
        max: priceMax,
        currency: priceRange?.currency || 'BRL'
      }
    };
    
    onFiltersChange(newFilters);
  };

  // Resetar filtros
  const resetFilters = () => {
    const emptyFilters: SearchFilters = {};
    setLocalFilters(emptyFilters);
    setPriceMin(0);
    setPriceMax(1000);
    onFiltersChange(emptyFilters);
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.keys(filters).reduce((count, key) => {
    const value = filters[key as keyof SearchFilters];
    if (Array.isArray(value) && value.length > 0) return count + 1;
    if (value && typeof value === 'object' && Object.keys(value).length > 0) return count + 1;
    if (value && typeof value === 'string') return count + 1;
    return count;
  }, 0);

  // Handlers para filtros
  const handleStarRatingChange = (rating: number, checked: boolean) => {
    const current = localFilters.starRating || [];
    const updated = checked 
      ? [...current, rating]
      : current.filter(r => r !== rating);
    
    setLocalFilters({ ...localFilters, starRating: updated });
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const current = localFilters.amenities || [];
    const updated = checked 
      ? [...current, amenity]
      : current.filter(a => a !== amenity);
    
    setLocalFilters({ ...localFilters, amenities: updated });
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    const current = localFilters.propertyTypes || [];
    const updated = checked 
      ? [...current, type]
      : current.filter(t => t !== type);
    
    setLocalFilters({ ...localFilters, propertyTypes: updated });
  };

  const handleMealPlanChange = (plan: string, checked: boolean) => {
    const current = localFilters.mealPlans || [];
    const updated = checked 
      ? [...current, plan]
      : current.filter(p => p !== plan);
    
    setLocalFilters({ ...localFilters, mealPlans: updated });
  };

  const handleCancellationChange = (policy: string) => {
    setLocalFilters({ ...localFilters, cancellationPolicy: policy as 'free' | 'paid' | 'non_refundable' });
  };

  // Renderizar slider de preço
  const renderPriceRange = () => (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Preço por noite</Label>
      
      <div className="space-y-3">
        {/* Inputs de preço */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs text-gray-500">Mínimo</Label>
            <div className="flex items-center">
              <span className="text-sm mr-1">{priceRange?.currency || 'BRL'}</span>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                min="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-gray-500">Máximo</Label>
            <div className="flex items-center">
              <span className="text-sm mr-1">{priceRange?.currency || 'BRL'}</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Range visual */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={priceRange?.max || 2000}
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max={priceRange?.max || 2000}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="text-xs text-gray-500 text-center">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: priceRange?.currency || 'BRL'
          }).format(priceMin)} - {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: priceRange?.currency || 'BRL'
          }).format(priceMax)}
        </div>
      </div>
    </div>
  );

  // Renderizar classificação por estrelas
  const renderStarRating = () => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Classificação</Label>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center space-x-2">
            <Checkbox
              id={`star-${rating}`}
              checked={localFilters.starRating?.includes(rating) || false}
              onCheckedChange={(checked) => handleStarRatingChange(rating, checked as boolean)}
            />
            <label htmlFor={`star-${rating}`} className="flex items-center gap-1 cursor-pointer">
              <div className="flex">
                {Array.from({ length: rating }, (_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm">{rating} estrela{rating > 1 ? 's' : ''}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar facilidades
  const renderAmenities = () => {
    const amenities = customAmenities || availableAmenities;
    
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Facilidades</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {amenities.map(amenity => {
            const IconComponent = typeof amenity === 'object' && 'icon' in amenity 
              ? amenity.icon 
              : Wifi;
            const amenityId = typeof amenity === 'string' ? amenity : amenity.id;
            const amenityName = typeof amenity === 'string' ? amenity : amenity.name;

            return (
              <div key={amenityId} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenityId}`}
                  checked={localFilters.amenities?.includes(amenityId) || false}
                  onCheckedChange={(checked) => handleAmenityChange(amenityId, checked as boolean)}
                />
                <label htmlFor={`amenity-${amenityId}`} className="flex items-center gap-2 cursor-pointer">
                  <IconComponent className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{amenityName}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header sem toggle - sempre visível */}
      <div className="p-4 border-b border-gray-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">🔍 Filtros</h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.starRating?.map(rating => (
            <Badge key={`star-${rating}`} variant="secondary" className="flex items-center gap-1">
              {rating} estrela{rating > 1 ? 's' : ''}
              <button onClick={() => handleStarRatingChange(rating, false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {filters.amenities?.map(amenity => (
            <Badge key={`amenity-${amenity}`} variant="secondary" className="flex items-center gap-1">
              {amenity}
              <button onClick={() => handleAmenityChange(amenity, false)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {filters.priceRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: filters.priceRange.currency
              }).format(filters.priceRange.min)} - {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: filters.priceRange.currency
              }).format(filters.priceRange.max)}
              <button onClick={() => setLocalFilters({ ...localFilters, priceRange: undefined })}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Painel de filtros - sempre visível */}
      <div className="p-4 space-y-6">
          {/* Preço */}
          {renderPriceRange()}

          {/* Classificação */}
          {renderStarRating()}

          {/* Facilidades */}
          {renderAmenities()}

          {/* Tipo de propriedade */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de propriedade</Label>
            <div className="space-y-2">
              {propertyTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`property-${type.id}`}
                    checked={localFilters.propertyTypes?.includes(type.id) || false}
                    onCheckedChange={(checked) => handlePropertyTypeChange(type.id, checked as boolean)}
                  />
                  <label htmlFor={`property-${type.id}`} className="text-sm cursor-pointer">
                    {type.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Plano alimentar */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Plano alimentar</Label>
            <div className="space-y-2">
              {mealPlans.map(plan => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`meal-${plan.id}`}
                    checked={localFilters.mealPlans?.includes(plan.id) || false}
                    onCheckedChange={(checked) => handleMealPlanChange(plan.id, checked as boolean)}
                  />
                  <label htmlFor={`meal-${plan.id}`} className="text-sm cursor-pointer">
                    {plan.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Política de cancelamento */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cancelamento</Label>
            <div className="space-y-2">
              {cancellationPolicies.map(policy => (
                <div key={policy.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`cancel-${policy.id}`}
                    name="cancellation"
                    checked={localFilters.cancellationPolicy === policy.id}
                    onChange={() => handleCancellationChange(policy.id)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`cancel-${policy.id}`} className="text-sm cursor-pointer">
                    {policy.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyFilters} disabled={loading} className="flex-1">
              {loading ? 'Aplicando...' : 'Aplicar filtros'}
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              Limpar
            </Button>
          </div>
      </div>
    </div>
  );
}