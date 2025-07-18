import { NextRequest, NextResponse } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { IncomingMessage } from 'http';

// Interface para mensagens WebSocket
interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'notification' | 'heartbeat';
  channel?: string;
  agentId?: number;
  data?: any;
  timestamp?: string;
}

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

// Armazenamento em memória das conexões (em produção, usar Redis)
const agentConnections = new Map<number, WebSocket[]>();
const connectionToAgent = new Map<WebSocket, number>();

// GET /api/omnichannel/ws - Informações sobre WebSocket
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'WebSocket endpoint for real-time notifications',
    endpoints: {
      websocket: `ws://localhost:3001/api/omnichannel/ws`,
      subscribe: 'Send {type:"subscribe", agentId:123}',
      heartbeat: 'Send {type:"heartbeat"} every 30s'
    },
    supported_notifications: [
      'new_message',
      'conversation_assigned', 
      'conversation_closed',
      'system_alert'
    ]
  });
}

// POST /api/omnichannel/ws - Enviar notificação para agentes
export async function POST(request: NextRequest) {
  try {
    const notification: NotificationData = await request.json();
    
    console.log('📡 Broadcasting notification:', notification);
    
    // Broadcast para agentes específicos ou todos
    if (notification.agentId) {
      await broadcastToAgent(notification.agentId, notification);
    } else {
      await broadcastToAllAgents(notification);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification sent',
      notification
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função para broadcast para um agente específico
async function broadcastToAgent(agentId: number, notification: NotificationData) {
  const connections = agentConnections.get(agentId) || [];
  
  const message = JSON.stringify({
    type: 'notification',
    data: notification,
    timestamp: new Date().toISOString()
  });
  
  connections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
  
  console.log(`📡 Notification sent to agent ${agentId}: ${connections.length} connections`);
}

// Função para broadcast para todos os agentes
async function broadcastToAllAgents(notification: NotificationData) {
  let totalSent = 0;
  
  const message = JSON.stringify({
    type: 'notification', 
    data: notification,
    timestamp: new Date().toISOString()
  });
  
  agentConnections.forEach((connections, agentId) => {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        totalSent++;
      }
    });
  });
  
  console.log(`📡 Notification broadcast to all agents: ${totalSent} connections`);
}

// Classe para gerenciar notificações em tempo real
class RealtimeNotificationManager {
  
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
      await broadcastToAgent(agentId, notification);
    } else {
      await broadcastToAllAgents(notification);
    }
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
    
    await broadcastToAgent(agentId, notification);
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
    
    await broadcastToAgent(agentId, notification);
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
    
    await broadcastToAllAgents(notification);
  }
}

// Configuração do WebSocket Server (para desenvolvimento)
// Em produção, use um processo separado ou service worker
function setupWebSocketServer() {
  const server = createServer();
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    console.log('🔌 New WebSocket connection');
    
    // Heartbeat para manter conexão viva
    const heartbeat = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        (ws as any).ping();
      }
    }, 30000);
    
    (ws as any).on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    (ws as any).on('close', () => {
      console.log('🔌 WebSocket connection closed');
      clearInterval(heartbeat);
      
      // Remover das conexões ativas
      const agentId = connectionToAgent.get(ws);
      if (agentId) {
        const connections = agentConnections.get(agentId) || [];
        const index = connections.indexOf(ws);
        if (index > -1) {
          connections.splice(index, 1);
        }
        connectionToAgent.delete(ws);
      }
    });
    
    (ws as any).on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  });
  
  return { server, wss };
}

// Manipular mensagens WebSocket
function handleWebSocketMessage(ws: WebSocket, message: WSMessage) {
  switch (message.type) {
    case 'subscribe':
      if (message.agentId) {
        // Registrar conexão para o agente
        if (!agentConnections.has(message.agentId)) {
          agentConnections.set(message.agentId, []);
        }
        agentConnections.get(message.agentId)!.push(ws);
        connectionToAgent.set(ws, message.agentId);
        
        console.log(`📡 Agent ${message.agentId} subscribed to notifications`);
        
        ws.send(JSON.stringify({
          type: 'subscribed',
          agentId: message.agentId,
          timestamp: new Date().toISOString()
        }));
      }
      break;
      
    case 'unsubscribe':
      const agentId = connectionToAgent.get(ws);
      if (agentId) {
        const connections = agentConnections.get(agentId) || [];
        const index = connections.indexOf(ws);
        if (index > -1) {
          connections.splice(index, 1);
        }
        connectionToAgent.delete(ws);
        
        console.log(`📡 Agent ${agentId} unsubscribed from notifications`);
      }
      break;
      
    case 'heartbeat':
      ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      }));
      break;
      
    default:
      console.log('Unknown WebSocket message type:', message.type);
  }
}

// Função utilitária para obter estatísticas das conexões
function getConnectionStats() {
  let totalConnections = 0;
  const agentStats: Record<number, number> = {};
  
  agentConnections.forEach((connections, agentId) => {
    const activeConnections = connections.filter(ws => ws.readyState === WebSocket.OPEN).length;
    agentStats[agentId] = activeConnections;
    totalConnections += activeConnections;
  });
  
  return {
    totalConnections,
    totalAgents: agentConnections.size,
    agentStats
  };
}