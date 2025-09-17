'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { EmailActivity, formatDate } from '../../lib/email-marketing/utils';
import { emailMarketingAPI } from '../../lib/email-marketing/api';

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

const activityIcons = {
  sent: '📤',
  delivered: '✅',
  opened: '👀',
  clicked: '👆',
  bounced: '❌',
  unsubscribed: '✋',
  complained: '🚫'
};

const activityColors = {
  sent: 'text-blue-600 bg-blue-50',
  delivered: 'text-green-600 bg-green-50',
  opened: 'text-purple-600 bg-purple-50',
  clicked: 'text-orange-600 bg-orange-50',
  bounced: 'text-red-600 bg-red-50',
  unsubscribed: 'text-gray-600 bg-gray-50',
  complained: 'text-red-600 bg-red-50'
};

export default function ActivityFeed({ className = "", limit = 50 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<EmailActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivity();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getRecentActivity(limit);
      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
    setLoading(false);
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const getActivityDescription = (activity: EmailActivity) => {
    const descriptions = {
      sent: 'Email enviado',
      delivered: 'Email entregue',
      opened: 'Email aberto',
      clicked: 'Link clicado no email',
      bounced: 'Email rejeitado',
      unsubscribed: 'Contato se descadastrou',
      complained: 'Contato marcou como spam'
    };
    return descriptions[activity.type as keyof typeof descriptions] || activity.type;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📊 Feed de Atividades em Tempo Real
            </h3>
            <p className="text-gray-600">
              Acompanhe todas as interações dos seus contatos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="opened">Aberturas</option>
              <option value="clicked">Cliques</option>
              <option value="bounced">Rejeições</option>
              <option value="unsubscribed">Descadastros</option>
            </select>
            
            <button
              onClick={loadActivity}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '🔄' : '↻'} Atualizar
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            <p>Carregando atividades...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg mb-2">Nenhuma atividade encontrada</p>
            <p className="text-sm">As atividades aparecerão aqui conforme acontecem</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity, index) => (
              <div key={`${activity.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type as keyof typeof activityColors] || 'text-gray-600 bg-gray-50'}`}>
                    <span className="text-sm">
                      {activityIcons[activity.type as keyof typeof activityIcons] || '📧'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <span>Contato: {activity.contactId}</span>
                      {activity.campaignId && (
                        <span className="ml-2">Campanha: {activity.campaignId}</span>
                      )}
                    </div>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {activity.type === 'clicked' && activity.metadata.url && (
                          <span>URL: {activity.metadata.url}</span>
                        )}
                        {activity.location && (
                          <span>
                            📍 {activity.location.city}, {activity.location.country}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {filteredActivities.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Mostrando {filteredActivities.length} de {activities.length} atividades
          <span className="ml-2">• Atualização automática a cada 30s</span>
        </div>
      )}
    </div>
  );
}