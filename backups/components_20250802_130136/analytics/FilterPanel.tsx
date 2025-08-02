import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { AnalyticsFilters } from '@/types';

interface FilterPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onRefresh: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange, 
  onRefresh 
}) => {
  const handlePeriodChange = (period: string) => {
    onFiltersChange({ ...filters, period });
  };

  const handleEventChange = (event: string) => {
    onFiltersChange({ ...filters, event });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={filters.period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evento
          </label>
          <select
            value={filters.event}
            onChange={(e) => handleEventChange(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
          >
            <option value="all">Todos os eventos</option>
            <option value="form_submission">Formulários</option>
            <option value="phone_click">Cliques no telefone</option>
            <option value="whatsapp_click">Cliques WhatsApp</option>
            <option value="page_view">Visualizações</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onRefresh}
            className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};