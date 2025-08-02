import React from 'react';
import { EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AnalyticsData } from '@/types';
import { formatCurrency, formatEventName } from '@/utils';
import { EventIcon } from './EventIcon';

interface RecentEventsProps {
  events: AnalyticsData[];
}

export const RecentEvents: React.FC<RecentEventsProps> = ({ events }) => {
  const hasEvents = events.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <EyeIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Eventos Recentes</h3>
      </div>
      
      {hasEvents ? (
        <div className="space-y-3">
          {events.slice(0, 10).map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <EventIcon eventName={event.event_name} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventName(event.event_name)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {event.campaign_source && `${event.campaign_source} • `}
                    {new Date(event.event_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {event.event_count}x
                </p>
                {event.total_value > 0 && (
                  <p className="text-xs text-gray-500">
                    {formatCurrency(event.total_value)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Sem eventos recentes
          </h3>
          <p className="text-sm text-gray-600">
            Nenhum evento foi registrado para o período selecionado.
          </p>
        </div>
      )}
    </div>
  );
};