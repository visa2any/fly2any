'use client';

import React, { useState } from 'react';
// Using admin CSS classes instead of UI components
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  DollarSign,
  MapPin,
  User,
  Star,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';

export interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  source: string[];
  assignedTo: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  budgetRange: {
    min: number | undefined;
    max: number | undefined;
  };
  origem: string;
  destino: string;
  hasNotes: boolean | undefined;
  tags: string[];
  tagCategories: string[];
}

interface LeadFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExport: () => void;
  onReset: () => void;
  totalLeads: number;
  filteredLeads: number;
  availableTags?: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
    count?: number;
  }>;
}

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'cotacao_enviada', label: 'Cotação Enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'agendado', label: 'Agendado' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' }
];

const priorityOptions = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' }
];

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'referral', label: 'Indicação' }
];

export function LeadFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onReset, 
  totalLeads, 
  filteredLeads,
  availableTags = []
}: LeadFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'source' | 'tags', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const clearFilter = (key: keyof FilterState) => {
    if (key === 'status' || key === 'priority' || key === 'source' || key === 'tags' || key === 'tagCategories') {
      updateFilter(key, []);
    } else if (key === 'dateRange') {
      updateFilter(key, { from: undefined, to: undefined });
    } else if (key === 'budgetRange') {
      updateFilter(key, { min: undefined, max: undefined });
    } else {
      updateFilter(key, '');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.source.length > 0) count++;
    if (filters.assignedTo) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.budgetRange.min || filters.budgetRange.max) count++;
    if (filters.origem) count++;
    if (filters.destino) count++;
    if (filters.hasNotes !== undefined) count++;
    if (filters.tags.length > 0) count++;
    if (filters.tagCategories.length > 0) count++;
    return count;
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="admin-card-title flex items-center gap-2">
              <Filter className="h-5 w-5" />
              🔍 Filtros
            </h3>
            {getActiveFiltersCount() > 0 && (
              <span className="admin-badge admin-badge-secondary">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="admin-text-muted text-sm">
              {filteredLeads} de {totalLeads} leads
            </span>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={onExport}>
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="h-4 w-4" />
              {isExpanded ? 'Ocultar' : 'Expandir'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card-content">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="admin-input pl-10"
            placeholder="Buscar por nome, email, telefone..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          {filters.search && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 admin-btn admin-btn-ghost admin-btn-sm"
              onClick={() => clearFilter('search')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="flex flex-wrap gap-2">
          {/* Status Pills */}
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`admin-btn admin-btn-sm ${filters.status.includes(option.value) ? 'admin-btn-primary' : 'admin-btn-outline'}`}
              onClick={() => toggleArrayFilter('status', option.value)}
            >
              {option.label}
              {filters.status.includes(option.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Priority Filter */}
            <div>
              <label className="admin-label">Prioridade</label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priority.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                    />
                    <label htmlFor={`priority-${option.value}`} className="admin-label-inline">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="admin-label">Fonte</label>
              <div className="space-y-2">
                {sourceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${option.value}`}
                      checked={filters.source.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('source', option.value)}
                    />
                    <label htmlFor={`source-${option.value}`} className="admin-label-inline">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="admin-label">Período</label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => updateFilter('dateRange', range)}
              />
            </div>

            {/* Budget Range */}
            <div>
              <label className="admin-label">Orçamento (R$)</label>
              <div className="flex gap-2">
                <input
                  className="admin-input"
                  type="number"
                  placeholder="Mín"
                  value={filters.budgetRange.min || ''}
                  onChange={(e) => updateFilter('budgetRange', {
                    ...filters.budgetRange,
                    min: parseFloat(e.target.value) || undefined
                  })}
                />
                <input
                  className="admin-input"
                  type="number"
                  placeholder="Máx"
                  value={filters.budgetRange.max || ''}
                  onChange={(e) => updateFilter('budgetRange', {
                    ...filters.budgetRange,
                    max: parseFloat(e.target.value) || undefined
                  })}
                />
              </div>
            </div>

            {/* Travel Destinations */}
            <div>
              <label className="admin-label">Origem</label>
              <input
                className="admin-input"
                placeholder="Cidade de origem"
                value={filters.origem}
                onChange={(e) => updateFilter('origem', e.target.value)}
              />
            </div>

            <div>
              <label className="admin-label">Destino</label>
              <input
                className="admin-input"
                placeholder="Cidade de destino"
                value={filters.destino}
                onChange={(e) => updateFilter('destino', e.target.value)}
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="admin-label">Atribuído para</label>
              <input
                className="admin-input"
                placeholder="Nome do responsável"
                value={filters.assignedTo}
                onChange={(e) => updateFilter('assignedTo', e.target.value)}
              />
            </div>

            {/* Tags Filter */}
            <div className="md:col-span-2">
              <label className="admin-label">Tags</label>
              {availableTags.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                    {availableTags.map((tag) => (
                      <span
                        key={tag.id}
                        className={`admin-badge cursor-pointer transition-all ${
                          filters.tags.includes(tag.id) 
                            ? 'admin-badge-primary' 
                            : 'admin-badge-outline'
                        }`}
                        style={{ backgroundColor: filters.tags.includes(tag.id) ? tag.color : undefined }}
                        onClick={() => toggleArrayFilter('tags', tag.id)}
                      >
                        {tag.name}
                        {tag.count && (
                          <span className="ml-1 text-xs">({tag.count})</span>
                        )}
                      </span>
                    ))}
                  </div>
                  {filters.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''} selecionada{filters.tags.length > 1 ? 's' : ''}
                      </span>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => updateFilter('tags', [])}
                      >
                        <X className="h-3 w-3" />
                        Limpar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma tag disponível</p>
              )}
            </div>

            {/* Has Notes */}
            <div>
              <label className="admin-label">Notas</label>
              <select
                className="admin-select"
                value={filters.hasNotes === undefined ? '' : filters.hasNotes.toString()}
                onChange={(e) => 
                  updateFilter('hasNotes', e.target.value === '' ? undefined : e.target.value === 'true')
                }
              >
                <option value="">Todos</option>
                <option value="true">Com notas</option>
                <option value="false">Sem notas</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <button className="admin-btn admin-btn-outline" onClick={onReset}>
              <RefreshCw className="h-4 w-4" />
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}