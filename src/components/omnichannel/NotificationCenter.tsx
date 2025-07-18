'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  getNotificationService, 
  NotificationData, 
  NotificationSettings 
} from '@/lib/realtime-notifications';

interface NotificationCenterProps {
  agentId: number;
  onNotificationClick?: (notification: NotificationData) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  agentId, 
  onNotificationClick 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const notificationService = getNotificationService();

  useEffect(() => {
    // Conectar ao serviço de notificações
    const initializeNotifications = async () => {
      const success = await notificationService.connect(agentId);
      if (success) {
        setConnectionStatus('connected');
      }
      
      // Carregar configurações
      const loadedSettings = notificationService.loadSettings();
      setSettings(loadedSettings);
    };

    initializeNotifications();

    // Callback para novas notificações
    const handleNotification = (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Máximo 50 notificações
      setUnreadCount(prev => prev + 1);
    };

    notificationService.onNotification(handleNotification);

    // Verificar status da conexão periodicamente
    const statusInterval = setInterval(() => {
      setConnectionStatus(notificationService.getConnectionStatus());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      notificationService.removeNotificationCallback(handleNotification);
      notificationService.disconnect();
    };
  }, [agentId]);

  const handleNotificationClick = (notification: NotificationData) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Marcar como lida (remover da lista de não lidas)
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const updateChannelSettings = (channel: string, enabled: boolean) => {
    if (!settings) return;
    
    const newSettings = {
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: enabled
      }
    };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message': return '💬';
      case 'conversation_assigned': return '👤';
      case 'conversation_closed': return '✅';
      case 'system_alert': return '⚠️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300';
      case 'high': return 'bg-orange-100 border-orange-300';
      case 'normal': return 'bg-blue-100 border-blue-300';
      case 'low': return 'bg-gray-100 border-gray-300';
      default: return 'bg-blue-100 border-blue-300';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
    }
  };

  if (!settings) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        variant="outline"
        className="relative p-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg">🔔</span>
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Indicador de status de conexão */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
      </Button>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  🔔 Notificações
                  <Badge variant="secondary">{unreadCount}</Badge>
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}></div>
                  <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {/* Lista de notificações */}
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(notification.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.type === 'new_message' && 'Nova Mensagem'}
                              {notification.type === 'conversation_assigned' && 'Conversa Atribuída'}
                              {notification.type === 'conversation_closed' && 'Conversa Finalizada'}
                              {notification.type === 'system_alert' && 'Alerta do Sistema'}
                            </p>
                            
                            {notification.priority && (
                              <Badge 
                                variant={notification.priority === 'urgent' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          
                          <div className="flex justify-between items-center mt-2">
                            {notification.channel && (
                              <Badge variant="outline" className="text-xs">
                                {notification.channel}
                              </Badge>
                            )}
                            
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <span className="text-4xl mb-4 block">🔕</span>
                  <p>Nenhuma notificação</p>
                </div>
              )}
            </CardContent>

            {/* Configurações rápidas */}
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Notificações Ativadas</span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked: boolean) => updateSettings('enabled', checked)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Som</span>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked: boolean) => updateSettings('sound', checked)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Desktop</span>
                <Switch
                  checked={settings.desktop}
                  onCheckedChange={(checked: boolean) => updateSettings('desktop', checked)}
                />
              </div>

              {/* Configurações por canal */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">Canais:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(settings.channels).map(([channel, enabled]) => (
                    <div key={channel} className="flex justify-between items-center">
                      <span className="text-xs capitalize">{channel}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked: boolean) => updateChannelSettings(channel, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="flex-1"
                >
                  Limpar Todas
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;