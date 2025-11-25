/**
 * Notification System Types
 *
 * Comprehensive type definitions for the real-time notification system
 * supporting both admin and customer notifications.
 */

// ==========================================
// Notification Event Types
// ==========================================

export type NotificationType =
  // Booking Events
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_ticketed'
  | 'booking_cancelled'
  | 'booking_payment_received'
  | 'booking_status_changed'
  // Customer Events
  | 'customer_inquiry'
  | 'customer_message'
  // Admin Events
  | 'admin_action_required'
  | 'admin_alert'
  // System Events
  | 'system_alert'
  | 'price_alert'
  | 'promotion';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'telegram' | 'sms' | 'push';

export type RecipientType = 'customer' | 'admin' | 'agent';

// ==========================================
// Base Notification Interface
// ==========================================

export interface BaseNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
}

export interface CustomerNotification extends BaseNotification {
  recipientType: 'customer';
  userId?: string;
  email?: string;
  bookingReference?: string;
}

export interface AdminNotification extends BaseNotification {
  recipientType: 'admin';
  adminUserId?: string;
  requiresAction: boolean;
  actionTaken?: boolean;
  actionTakenAt?: Date;
  actionTakenBy?: string;
}

export type Notification = CustomerNotification | AdminNotification;

// ==========================================
// Booking Notification Payload
// ==========================================

export interface BookingNotificationPayload {
  bookingId: string;
  bookingReference: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  route: string; // e.g., "JFK → LAX"
  departureDate: string;
  totalAmount: number;
  currency: string;
  passengerCount: number;
  // Additional ticketing info
  eticketNumbers?: string[];
  airlineRecordLocator?: string;
  ticketedAt?: string;
  ticketedBy?: string;
}

// ==========================================
// SSE Event Types
// ==========================================

export interface SSEEvent {
  event: string;
  data: any;
  id?: string;
  retry?: number;
}

export interface BookingSSEEvent extends SSEEvent {
  event: 'booking_update' | 'booking_created' | 'booking_ticketed';
  data: {
    bookingReference: string;
    status: string;
    timestamp: string;
    details?: BookingNotificationPayload;
  };
}

export interface AdminSSEEvent extends SSEEvent {
  event: 'admin_notification' | 'action_required';
  data: AdminNotification;
}

// ==========================================
// Notification Service Config
// ==========================================

export interface NotificationConfig {
  // Telegram configuration
  telegram: {
    enabled: boolean;
    botToken?: string;
    adminChatIds: string[]; // Chat IDs to send admin notifications
  };
  // Email configuration (uses existing Resend)
  email: {
    enabled: boolean;
    adminEmails: string[];
  };
  // SSE configuration
  sse: {
    enabled: boolean;
    heartbeatInterval: number; // milliseconds
    reconnectRetry: number; // milliseconds
  };
}

// ==========================================
// Notification Templates
// ==========================================

export interface NotificationTemplate {
  type: NotificationType;
  title: {
    en: string;
    pt: string;
    es: string;
  };
  message: {
    en: string;
    pt: string;
    es: string;
  };
  priority: NotificationPriority;
  channels: NotificationChannel[];
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  booking_created: {
    type: 'booking_created',
    title: {
      en: '🎫 New Booking Received',
      pt: '🎫 Nova Reserva Recebida',
      es: '🎫 Nueva Reserva Recibida',
    },
    message: {
      en: 'New booking {bookingReference} from {customerName} - {route} on {departureDate}. Total: {currency} {totalAmount}',
      pt: 'Nova reserva {bookingReference} de {customerName} - {route} em {departureDate}. Total: {currency} {totalAmount}',
      es: 'Nueva reserva {bookingReference} de {customerName} - {route} el {departureDate}. Total: {currency} {totalAmount}',
    },
    priority: 'high',
    channels: ['in_app', 'telegram', 'email'],
  },
  booking_ticketed: {
    type: 'booking_ticketed',
    title: {
      en: '✈️ E-Ticket Issued',
      pt: '✈️ E-Ticket Emitido',
      es: '✈️ E-Ticket Emitido',
    },
    message: {
      en: 'Your booking {bookingReference} has been ticketed! PNR: {airlineRecordLocator}',
      pt: 'Sua reserva {bookingReference} foi emitida! PNR: {airlineRecordLocator}',
      es: '¡Tu reserva {bookingReference} ha sido emitida! PNR: {airlineRecordLocator}',
    },
    priority: 'high',
    channels: ['in_app', 'email', 'push'],
  },
  booking_pending_ticketing: {
    type: 'booking_created',
    title: {
      en: '⏳ Booking Processing',
      pt: '⏳ Reserva em Processamento',
      es: '⏳ Reserva en Procesamiento',
    },
    message: {
      en: 'Your booking {bookingReference} is being processed. You will receive your e-ticket within 1-2 hours.',
      pt: 'Sua reserva {bookingReference} está sendo processada. Você receberá seu e-ticket em 1-2 horas.',
      es: 'Tu reserva {bookingReference} está siendo procesada. Recibirás tu e-ticket en 1-2 horas.',
    },
    priority: 'medium',
    channels: ['in_app', 'email'],
  },
  admin_action_required: {
    type: 'admin_action_required',
    title: {
      en: '🔔 Action Required',
      pt: '🔔 Ação Necessária',
      es: '🔔 Acción Requerida',
    },
    message: {
      en: 'Booking {bookingReference} requires your attention. Please review and process.',
      pt: 'Reserva {bookingReference} precisa de sua atenção. Por favor, revise e processe.',
      es: 'La reserva {bookingReference} requiere tu atención. Por favor, revisa y procesa.',
    },
    priority: 'urgent',
    channels: ['in_app', 'telegram'],
  },
};

// ==========================================
// Utility Functions
// ==========================================

export function formatNotificationMessage(
  template: NotificationTemplate,
  language: 'en' | 'pt' | 'es',
  data: Record<string, string | number>
): { title: string; message: string } {
  let title = template.title[language];
  let message = template.message[language];

  // Replace placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, String(value));
    message = message.replace(placeholder, String(value));
  });

  return { title, message };
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
