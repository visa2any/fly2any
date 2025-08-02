'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'message' | 'escalation' | 'assignment' | 'status_change' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channel?: string;
  conversationId?: number;
  customerName?: string;
  read: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

interface NotificationSystemProps {
  agentId?: number;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  agentId, 
  onNotificationClick 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Configurar áudio para notificações
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    // Buscar notificações iniciais
    fetchNotifications();

    // Configurar polling para novas notificações
    const interval = setInterval(fetchNotifications, 5000);

    // Configurar WebSocket para notificações em tempo real (opcional)
    setupWebSocket();

    return () => {
      clearInterval(interval);
    };
  }, [agentId]);

  useEffect(() => {
    // Atualizar contador de não lidas
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      // Simular busca de notificações - em produção viria da API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'Nova mensagem',
          message: 'Cliente Maria Silva enviou uma mensagem via WhatsApp',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          priority: 'medium',
          channel: 'whatsapp',
          conversationId: 123,
          customerName: 'Maria Silva',
          read: false
        },
        {
          id: '2',
          type: 'escalation',
          title: 'Escalação automática',
          message: 'Conversa com João Santos foi escalada por tempo de resposta',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          priority: 'high',
          conversationId: 124,
          customerName: 'João Santos',
          read: false,
          actions: [
            {
              id: 'take_conversation',
              label: 'Assumir',
              type: 'primary',
              onClick: () => handleTakeConversation(124)
            }
          ]
        },
        {
          id: '3',
          type: 'assignment',
          title: 'Nova atribuição',
          message: 'Você foi atribuído à conversa com Ana Costa',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          priority: 'medium',
          conversationId: 125,
          customerName: 'Ana Costa',
          read: true
        },
        {
          id: '4',
          type: 'system',
          title: 'Sistema atualizado',
          message: 'Novas funcionalidades disponíveis na Central de Comunicação',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          priority: 'low',
          read: false
        }
      ];

      const hasNewNotifications = mockNotifications.some(n => 
        !notifications.find(existing => existing.id === n.id)
      );

      if (hasNewNotifications && soundEnabled) {
        playNotificationSound();
      }

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const setupWebSocket = () => {
    // Implementar WebSocket para notificações em tempo real
    // const ws = new WebSocket('ws://localhost:3001/notifications');
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   addNotification(notification);
    // };
  };

  const playNotificationSound = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.play().catch(e => {
        console.log('Could not play notification sound:', e);
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Callback para o componente pai
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Fechar painel se necessário
    setShowPanel(false);
  };

  const handleTakeConversation = (conversationId: number) => {
    // Implementar lógica para assumir conversa
    console.log('Taking conversation:', conversationId);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'escalation': return '🚨';
      case 'assignment': return '👤';
      case 'status_change': return '🔄';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '📱';
      case 'email': return '📧';
      case 'webchat': return '💬';
      case 'phone': return '📞';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '🌐';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'agora';
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}d`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high' || notification.priority === 'critical';
    return notification.type === filter;
  });

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          onClick={() => setShowPanel(!showPanel)}
          variant="ghost"
          size="sm"
          className="relative p-2"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 text-xs min-w-[20px] h-5 flex items-center justify-center px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-hidden z-50 shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </Button>
                <Button
                  onClick={markAllAsRead}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  ✓ Marcar todas
                </Button>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex space-x-2 mt-3">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="all">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="high">Alta prioridade</option>
                <option value="message">Mensagens</option>
                <option value="escalation">Escalações</option>
                <option value="assignment">Atribuições</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        {notification.channel && (
                          <span className="text-xs">{getChannelIcon(notification.channel)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {notification.customerName && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.customerName}
                          </Badge>
                          {notification.conversationId && (
                            <Badge variant="outline" className="text-xs">
                              #{notification.conversationId}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {notification.actions && (
                        <div className="flex space-x-2 mt-2">
                          {notification.actions.map((action) => (
                            <Button
                              key={action.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                              }}
                              variant={action.type === 'primary' ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button
                onClick={clearAllNotifications}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                🗑️ Limpar todas
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;