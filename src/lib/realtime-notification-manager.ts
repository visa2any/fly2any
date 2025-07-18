// Gerenciador de Notificações em Tempo Real - Sistema Omnichannel
// Classe para envio de notificações WebSocket para agentes

interface NotificationData {
  type: 'new_message' | 'conversation_assigned' | 'conversation_closed' | 'system_alert';
  conversationId?: number;
  customerId?: number;
  agentId?: number;
  channel?: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

// Função para enviar notificação via API
async function sendNotification(notification: NotificationData) {
  try {
    const response = await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}

// Classe para gerenciar notificações em tempo real
export class RealtimeNotificationManager {
  
  // Notificar nova mensagem
  static async notifyNewMessage(conversationId: number, message: any, agentId?: number) {
    const notification: NotificationData = {
      type: 'new_message',
      conversationId,
      customerId: message.customer_id,
      channel: message.channel,
      content: message.content,
      priority: 'normal',
      metadata: {
        messageId: message.id,
        sender: message.sender_name,
        timestamp: message.created_at
      }
    };
    
    if (agentId) {
      notification.agentId = agentId;
    }

    return await sendNotification(notification);
  }
  
  // Notificar atribuição de conversa
  static async notifyConversationAssigned(conversationId: number, agentId: number, assignedBy: number) {
    const notification: NotificationData = {
      type: 'conversation_assigned',
      conversationId,
      agentId,
      priority: 'high',
      metadata: {
        assignedBy,
        timestamp: new Date().toISOString()
      }
    };
    
    return await sendNotification(notification);
  }
  
  // Notificar fechamento de conversa
  static async notifyConversationClosed(conversationId: number, agentId: number, closedBy: number) {
    const notification: NotificationData = {
      type: 'conversation_closed',
      conversationId,
      agentId,
      priority: 'normal',
      metadata: {
        closedBy,
        timestamp: new Date().toISOString()
      }
    };
    
    return await sendNotification(notification);
  }
  
  // Notificar alerta do sistema
  static async notifySystemAlert(message: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') {
    const notification: NotificationData = {
      type: 'system_alert',
      content: message,
      priority,
      metadata: {
        timestamp: new Date().toISOString()
      }
    };
    
    return await sendNotification(notification);
  }
}

export default RealtimeNotificationManager;