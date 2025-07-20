'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

  const toggleArrayFilter = (key: 'status' | 'priority' | 'source', value: string) => {
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredLeads} de {totalLeads} leads
            </span>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Ocultar' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email, telefone..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => clearFilter('search')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="flex flex-wrap gap-2">
          {/* Status Pills */}
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.status.includes(option.value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter('status', option.value)}
              className="h-8"
            >
              {option.label}
              {filters.status.includes(option.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Priority Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priority.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('priority', option.value)}
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fonte</Label>
              <div className="space-y-2">
                {sourceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${option.value}`}
                      checked={filters.source.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter('source', option.value)}
                    />
                    <Label htmlFor={`source-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Período</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => updateFilter('dateRange', range)}
              />
            </div>

            {/* Budget Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Orçamento (R$)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.budgetRange.min || ''}
                  onChange={(e) => updateFilter('budgetRange', {
                    ...filters.budgetRange,
                    min: parseFloat(e.target.value) || undefined
                  })}
                />
                <Input
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
              <Label className="text-sm font-medium mb-2 block">Origem</Label>
              <Input
                placeholder="Cidade de origem"
                value={filters.origem}
                onChange={(e) => updateFilter('origem', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Destino</Label>
              <Input
                placeholder="Cidade de destino"
                value={filters.destino}
                onChange={(e) => updateFilter('destino', e.target.value)}
              />
            </div>

            {/* Assigned To */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Atribuído para</Label>
              <Input
                placeholder="Nome do responsável"
                value={filters.assignedTo}
                onChange={(e) => updateFilter('assignedTo', e.target.value)}
              />
            </div>

            {/* Tags Filter */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-2 block">Tags</Label>
              {availableTags.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className={`cursor-pointer transition-all ${tag.color} ${
                          filters.tags.includes(tag.id) 
                            ? 'ring-2 ring-blue-400' 
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => toggleArrayFilter('tags', tag.id)}
                      >
                        {tag.name}
                        {tag.count && (
                          <span className="ml-1 text-xs">({tag.count})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {filters.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {filters.tags.length} tag{filters.tags.length > 1 ? 's' : ''} selecionada{filters.tags.length > 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateFilter('tags', [])}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma tag disponível</p>
              )}
            </div>

            {/* Has Notes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Notas</Label>
              <Select
                value={filters.hasNotes === undefined ? '' : filters.hasNotes.toString()}
                onValueChange={(value) => 
                  updateFilter('hasNotes', value === '' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Com/sem notas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Com notas</SelectItem>
                  <SelectItem value="false">Sem notas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}