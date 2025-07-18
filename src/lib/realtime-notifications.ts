'use client';

// Sistema de Notificações Real-time - Frontend
// Gerencia conexões WebSocket e notificações push

export interface NotificationData {
  type: 'new_message' | 'conversation_assigned' | 'conversation_closed' | 'system_alert';
  conversationId?: number;
  customerId?: number;
  agentId?: number;
  channel?: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  vibration: boolean;
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
    webchat: boolean;
  };
}

// Classe principal para gerenciar notificações
export class RealtimeNotificationService {
  private ws: WebSocket | null = null;
  private agentId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private settings: NotificationSettings;
  private onNotificationCallbacks: ((notification: NotificationData) => void)[] = [];

  constructor(settings?: Partial<NotificationSettings>) {
    this.settings = {
      enabled: true,
      sound: true,
      desktop: true,
      vibration: false,
      channels: {
        whatsapp: true,
        email: true,
        sms: true,
        webchat: true
      },
      ...settings
    };

    // Solicitar permissão para notificações desktop
    this.requestNotificationPermission();
  }

  // Conectar ao WebSocket
  async connect(agentId: number): Promise<boolean> {
    this.agentId = agentId;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/omnichannel/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔌 Connected to real-time notifications');
        this.reconnectAttempts = 0;
        
        // Subscribir para notificações do agente
        this.send({
          type: 'subscribe',
          agentId: this.agentId!
        });
        
        // Iniciar heartbeat
        this.startHeartbeat();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        this.stopHeartbeat();
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return true;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      return false;
    }
  }

  // Desconectar
  disconnect() {
    if (this.ws) {
      this.send({ type: 'unsubscribe' });
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  // Enviar mensagem via WebSocket
  private send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Iniciar heartbeat
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'heartbeat' });
    }, 30000);
  }

  // Parar heartbeat
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Tentar reconectar
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.agentId) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect(this.agentId!);
      }, delay);
    }
  }

  // Manipular mensagens recebidas
  private handleMessage(message: any) {
    switch (message.type) {
      case 'notification':
        this.processNotification(message.data);
        break;
        
      case 'subscribed':
        console.log(`✅ Subscribed to notifications for agent ${message.agentId}`);
        break;
        
      case 'heartbeat':
        // Resposta do heartbeat - conexão ativa
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Processar notificação recebida
  private processNotification(notification: NotificationData) {
    if (!this.settings.enabled) return;

    // Verificar se o canal está habilitado
    if (notification.channel && !this.settings.channels[notification.channel as keyof typeof this.settings.channels]) {
      return;
    }

    console.log('🔔 New notification:', notification);

    // Tocar som
    if (this.settings.sound) {
      this.playNotificationSound(notification.priority);
    }

    // Mostrar notificação desktop
    if (this.settings.desktop) {
      this.showDesktopNotification(notification);
    }

    // Vibrar (mobile)
    if (this.settings.vibration && 'vibrate' in navigator) {
      const pattern = this.getVibrationPattern(notification.priority);
      navigator.vibrate(pattern);
    }

    // Chamar callbacks
    this.onNotificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Mostrar notificação desktop
  private showDesktopNotification(notification: NotificationData) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let title = 'Fly2Any - Nova Notificação';
    let body = notification.content || 'Você tem uma nova notificação';
    let icon = '/icons/notification-icon.png';

    switch (notification.type) {
      case 'new_message':
        title = `Nova Mensagem - ${this.getChannelName(notification.channel)}`;
        body = `${notification.metadata?.sender || 'Cliente'}: ${notification.content}`;
        icon = this.getChannelIcon(notification.channel);
        break;
        
      case 'conversation_assigned':
        title = 'Conversa Atribuída';
        body = `Uma nova conversa foi atribuída a você`;
        break;
        
      case 'conversation_closed':
        title = 'Conversa Finalizada';
        body = `Uma conversa foi finalizada`;
        break;
        
      case 'system_alert':
        title = 'Alerta do Sistema';
        body = notification.content || 'Alerta do sistema';
        break;
    }

    const desktopNotification = new Notification(title, {
      body,
      icon,
      badge: '/icons/badge-icon.png',
      tag: `${notification.type}-${notification.conversationId || Date.now()}`,
      requireInteraction: notification.priority === 'urgent',
      silent: !this.settings.sound
    });

    // Ação ao clicar na notificação
    desktopNotification.onclick = () => {
      window.focus();
      if (notification.conversationId) {
        // Navegar para a conversa
        window.location.href = `/admin/omnichannel/conversation/${notification.conversationId}`;
      }
      desktopNotification.close();
    };

    // Auto-fechar após 5 segundos (exceto urgent)
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);
    }
  }

  // Tocar som de notificação
  private playNotificationSound(priority?: string) {
    try {
      let soundFile = '/sounds/notification.mp3';
      
      switch (priority) {
        case 'urgent':
          soundFile = '/sounds/urgent.mp3';
          break;
        case 'high':
          soundFile = '/sounds/high.mp3';
          break;
        default:
          soundFile = '/sounds/normal.mp3';
      }

      const audio = new Audio(soundFile);
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Obter padrão de vibração
  private getVibrationPattern(priority?: string): number[] {
    switch (priority) {
      case 'urgent':
        return [200, 100, 200, 100, 200];
      case 'high':
        return [200, 100, 200];
      default:
        return [200];
    }
  }

  // Obter nome do canal
  private getChannelName(channel?: string): string {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'phone': return 'SMS';
      case 'webchat': return 'Chat Web';
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      default: return 'Canal';
    }
  }

  // Obter ícone do canal
  private getChannelIcon(channel?: string): string {
    switch (channel) {
      case 'whatsapp': return '/icons/whatsapp.png';
      case 'email': return '/icons/email.png';
      case 'phone': return '/icons/sms.png';
      case 'webchat': return '/icons/chat.png';
      case 'instagram': return '/icons/instagram.png';
      case 'facebook': return '/icons/facebook.png';
      default: return '/icons/notification.png';
    }
  }

  // Solicitar permissão para notificações
  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Adicionar callback para notificações
  onNotification(callback: (notification: NotificationData) => void) {
    this.onNotificationCallbacks.push(callback);
  }

  // Remover callback
  removeNotificationCallback(callback: (notification: NotificationData) => void) {
    const index = this.onNotificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.onNotificationCallbacks.splice(index, 1);
    }
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Salvar no localStorage
    localStorage.setItem('omnichannel_notification_settings', JSON.stringify(this.settings));
  }

  // Carregar configurações
  loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('omnichannel_notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    return this.settings;
  }

  // Obter status da conexão
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }
}

// Instância singleton para uso global
let notificationService: RealtimeNotificationService | null = null;

export function getNotificationService(settings?: Partial<NotificationSettings>): RealtimeNotificationService {
  if (!notificationService) {
    notificationService = new RealtimeNotificationService(settings);
  }
  return notificationService;
}

export default RealtimeNotificationService;