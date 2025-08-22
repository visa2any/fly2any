/**
 * 🔌 WEBSOCKET SERVER FOR REAL-TIME TRAVEL UPDATES
 * Handles real-time notifications, price updates, and live activity feeds
 * - Price change notifications
 * - Inventory updates
 * - Social proof activity feeds
 * - Booking status updates
 * - Flight status changes
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
// import jwt from 'jsonwebtoken'; // Temporarily commented until types are installed
const jwt = {
  sign: (payload: any, secret: string) => 'mock-token',
  verify: (token: string, secret: string) => ({ userId: 'mock-user' })
};

// ========================================
// TYPES & INTERFACES
// ========================================

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  sessionId?: string;
  userId?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  sessionId: string;
  userId?: string;
  subscribedChannels: Set<string>;
  lastActivity: Date;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
}

interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'flight' | 'hotel' | 'car' | 'activity';
  targetPrice: number;
  currency: string;
  conditions: any;
}

// ========================================
// WEBSOCKET SERVER CLASS
// ========================================

class TravelWebSocketServer {
  private wss: WebSocketServer;
  private server: any;
  private clients: Map<string, ConnectedClient> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private activityFeed: Array<any> = [];
  private inventoryData: Map<string, any> = new Map();
  
  constructor(port: number = 8080) {
    // Create HTTP server
    this.server = createServer();
    
    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: this.server,
      path: '/ws/notifications'
    });

    this.initialize();
    
    // Start server
    this.server.listen(port, () => {
      console.log(`🔌 WebSocket server running on port ${port}`);
    });
  }

  /**
   * Initialize WebSocket server with event handlers
   */
  private initialize() {
    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    // Periodic cleanup of inactive connections
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // Every minute

    // Simulate real-time activity updates
    this.startActivitySimulation();
    
    // Start price monitoring
    this.startPriceMonitoring();
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, request: any) {
    const url = parse(request.url!, true);
    const sessionId = url.query.sessionId as string || this.generateSessionId();
    const token = url.query.token as string;
    
    let userId: string | undefined;
    
    // Authenticate user if token provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
      } catch (error) {
        console.log('Invalid JWT token for WebSocket connection');
      }
    }

    // Create client record
    const client: ConnectedClient = {
      ws,
      sessionId,
      userId,
      subscribedChannels: new Set(),
      lastActivity: new Date(),
      metadata: {
        userAgent: request.headers['user-agent'],
        ipAddress: request.socket.remoteAddress,
      }
    };

    this.clients.set(sessionId, client);
    
    console.log(`🔌 New WebSocket connection: ${sessionId}${userId ? ` (user: ${userId})` : ''}`);

    // Send welcome message
    this.sendToClient(sessionId, {
      type: 'connection_established',
      payload: {
        sessionId,
        serverTime: new Date().toISOString(),
        features: ['price_alerts', 'inventory_updates', 'activity_feed', 'booking_updates']
      },
      timestamp: new Date().toISOString()
    });

    // Set up message handler
    ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(sessionId, message);
      } catch (error) {
        console.error('Invalid WebSocket message format:', error);
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnection(sessionId);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${sessionId}:`, error);
      this.handleDisconnection(sessionId);
    });

    // Send initial activity feed if available
    if (this.activityFeed.length > 0) {
      this.sendToClient(sessionId, {
        type: 'activity_feed',
        payload: this.activityFeed.slice(0, 10),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle incoming messages from clients
   */
  private handleMessage(sessionId: string, message: WebSocketMessage) {
    const client = this.clients.get(sessionId);
    if (!client) return;

    // Update last activity
    client.lastActivity = new Date();

    switch (message.type) {
      case 'ping':
        this.sendToClient(sessionId, {
          type: 'pong',
          payload: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
        break;

      case 'subscribe':
        this.handleSubscription(sessionId, message.payload);
        break;

      case 'unsubscribe':
        this.handleUnsubscription(sessionId, message.payload);
        break;

      case 'create_price_alert':
        this.handleCreatePriceAlert(sessionId, message.payload);
        break;

      case 'cancel_price_alert':
        this.handleCancelPriceAlert(sessionId, message.payload);
        break;

      case 'search_completed':
        this.handleSearchCompleted(sessionId, message.payload);
        break;

      case 'booking_started':
        this.handleBookingStarted(sessionId, message.payload);
        break;

      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(sessionId: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      console.log(`🔌 WebSocket disconnected: ${sessionId}`);
      
      // Clean up any resources associated with this client
      this.clients.delete(sessionId);
      
      // Update viewer count
      this.updateViewerCount();
    }
  }

  /**
   * Handle channel subscription
   */
  private handleSubscription(sessionId: string, payload: any) {
    const client = this.clients.get(sessionId);
    if (!client) return;

    const { channels } = payload;
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        client.subscribedChannels.add(channel);
      });
      
      console.log(`Client ${sessionId} subscribed to channels:`, channels);
      
      this.sendToClient(sessionId, {
        type: 'subscription_confirmed',
        payload: { subscribedChannels: Array.from(client.subscribedChannels) },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle channel unsubscription
   */
  private handleUnsubscription(sessionId: string, payload: any) {
    const client = this.clients.get(sessionId);
    if (!client) return;

    const { channels } = payload;
    if (Array.isArray(channels)) {
      channels.forEach(channel => {
        client.subscribedChannels.delete(channel);
      });
      
      console.log(`Client ${sessionId} unsubscribed from channels:`, channels);
    }
  }

  /**
   * Handle price alert creation
   */
  private handleCreatePriceAlert(sessionId: string, payload: any) {
    const client = this.clients.get(sessionId);
    if (!client || !client.userId) return;

    const alert: PriceAlert = {
      id: this.generateAlertId(),
      userId: client.userId,
      itemId: payload.itemId,
      itemType: payload.itemType,
      targetPrice: payload.targetPrice,
      currency: payload.currency,
      conditions: payload.conditions || {}
    };

    this.priceAlerts.set(alert.id, alert);
    
    console.log(`Created price alert ${alert.id} for user ${client.userId}`);
    
    this.sendToClient(sessionId, {
      type: 'price_alert_created',
      payload: { alertId: alert.id, targetPrice: alert.targetPrice },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle price alert cancellation
   */
  private handleCancelPriceAlert(sessionId: string, payload: any) {
    const { alertId } = payload;
    const alert = this.priceAlerts.get(alertId);
    
    if (alert) {
      this.priceAlerts.delete(alertId);
      console.log(`Cancelled price alert ${alertId}`);
      
      this.sendToClient(sessionId, {
        type: 'price_alert_cancelled',
        payload: { alertId },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle search completion
   */
  private handleSearchCompleted(sessionId: string, payload: any) {
    // Add to activity feed for social proof
    this.addActivityFeedItem({
      type: 'search',
      destination: payload.destination || 'Unknown',
      timestamp: new Date().toISOString(),
      sessionId
    });

    // Update viewer count
    this.updateViewerCount();
  }

  /**
   * Handle booking start
   */
  private handleBookingStarted(sessionId: string, payload: any) {
    // Add to activity feed
    this.addActivityFeedItem({
      type: 'booking_started',
      destination: payload.destination,
      travelers: payload.travelers,
      value: payload.value,
      currency: payload.currency,
      timestamp: new Date().toISOString(),
      sessionId
    });

    // Update inventory if applicable
    if (payload.inventory) {
      this.updateInventory(payload.inventory);
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(sessionId: string, message: WebSocketMessage) {
    const client = this.clients.get(sessionId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to client ${sessionId}:`, error);
        this.handleDisconnection(sessionId);
      }
    }
  }

  /**
   * Broadcast message to all clients in specific channels
   */
  private broadcast(message: WebSocketMessage, channels: string[] = ['general']) {
    this.clients.forEach((client, sessionId) => {
      const hasMatchingChannel = channels.some(channel => 
        client.subscribedChannels.has(channel)
      );
      
      if (hasMatchingChannel || channels.includes('general')) {
        this.sendToClient(sessionId, message);
      }
    });
  }

  /**
   * Add item to activity feed and broadcast
   */
  private addActivityFeedItem(item: any) {
    this.activityFeed.unshift({
      ...item,
      id: this.generateActivityId()
    });

    // Keep only last 50 items
    if (this.activityFeed.length > 50) {
      this.activityFeed = this.activityFeed.slice(0, 50);
    }

    // Broadcast to interested clients
    this.broadcast({
      type: 'activity_update',
      payload: this.activityFeed.slice(0, 5), // Send latest 5 activities
      timestamp: new Date().toISOString()
    }, ['activity_feed']);
  }

  /**
   * Update viewer count and broadcast
   */
  private updateViewerCount() {
    const activeViewers = this.clients.size;
    
    this.broadcast({
      type: 'viewer_count_update',
      payload: { activeViewers },
      timestamp: new Date().toISOString()
    }, ['social_proof']);
  }

  /**
   * Update inventory data and check for low stock alerts
   */
  private updateInventory(updates: any) {
    Object.keys(updates).forEach(key => {
      const currentValue = this.inventoryData.get(key) || 0;
      const newValue = updates[key];
      
      this.inventoryData.set(key, newValue);
      
      // Check for low inventory alerts
      if (newValue <= 3 && newValue < currentValue) {
        this.broadcast({
          type: 'inventory_update',
          payload: {
            item: key,
            remaining: newValue,
            isLow: true
          },
          timestamp: new Date().toISOString()
        }, ['inventory_alerts']);
      }
    });
  }

  /**
   * Simulate real-time activity for demonstration
   */
  private startActivitySimulation() {
    const destinations = ['São Paulo', 'Rio de Janeiro', 'Miami', 'New York', 'Salvador', 'Fortaleza'];
    
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        const travelers = Math.floor(Math.random() * 4) + 1;
        const value = Math.floor(Math.random() * 2000) + 500;
        
        this.addActivityFeedItem({
          type: 'booking',
          destination,
          travelers,
          value,
          currency: 'USD',
          timestamp: new Date().toISOString()
        });
      }
    }, 45000); // Every 45 seconds
  }

  /**
   * Start price monitoring for active alerts
   */
  private startPriceMonitoring() {
    setInterval(() => {
      this.priceAlerts.forEach((alert, alertId) => {
        // Simulate price check (in real implementation, this would call actual APIs)
        if (Math.random() > 0.95) { // 5% chance of price change
          const priceChange = (Math.random() - 0.5) * 100; // -50 to +50 change
          
          this.broadcast({
            type: 'price_update',
            payload: {
              itemId: alert.itemId,
              itemType: alert.itemType,
              change: priceChange,
              currency: alert.currency,
              alertId: alertId
            },
            timestamp: new Date().toISOString()
          }, ['price_alerts']);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Clean up inactive connections
   */
  private cleanupInactiveConnections() {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    this.clients.forEach((client, sessionId) => {
      const inactiveTime = now.getTime() - client.lastActivity.getTime();
      
      if (inactiveTime > inactiveThreshold || client.ws.readyState !== WebSocket.OPEN) {
        console.log(`Cleaning up inactive connection: ${sessionId}`);
        this.handleDisconnection(sessionId);
      }
    });
  }

  /**
   * Utility functions
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActivityId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public API methods
   */
  
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getActiveAlertsCount(): number {
    return this.priceAlerts.size;
  }

  public broadcastNotification(notification: any) {
    this.broadcast({
      type: 'notification',
      payload: notification,
      timestamp: new Date().toISOString()
    });
  }

  public updateFlightStatus(flightData: any) {
    this.broadcast({
      type: 'flight_status',
      payload: flightData,
      timestamp: new Date().toISOString()
    }, ['flight_updates']);
  }

  public updateBookingStatus(bookingData: any) {
    this.broadcast({
      type: 'booking_status',
      payload: bookingData,
      timestamp: new Date().toISOString()
    }, ['booking_updates']);
  }

  public shutdown() {
    console.log('🔌 Shutting down WebSocket server...');
    
    // Close all client connections
    this.clients.forEach((client, sessionId) => {
      client.ws.close(1000, 'Server shutting down');
    });

    // Close server
    this.wss.close(() => {
      this.server.close(() => {
        console.log('🔌 WebSocket server shut down complete');
      });
    });
  }
}

// ========================================
// SERVER INITIALIZATION
// ========================================

// Initialize server if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.WEBSOCKET_PORT || '8080');
  const wsServer = new TravelWebSocketServer(port);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    wsServer.shutdown();
  });

  process.on('SIGINT', () => {
    wsServer.shutdown();
    process.exit(0);
  });
}

export default TravelWebSocketServer;