import React from 'react';
import { ChartBarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
                Dashboard de Campanhas
              </h1>
              <p className="mt-2 text-gray-600">
                Monitore o desempenho dos anúncios pagos em tempo real
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CalendarDaysIcon className="w-5 h-5" />
              <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};