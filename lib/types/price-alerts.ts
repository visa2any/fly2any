/**
 * Type definitions for Price Alerts feature
 */

export interface PriceAlert {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  active: boolean;
  triggered: boolean;
  lastChecked: Date;
  triggeredAt: Date | null;
  lastNotifiedAt: Date | null;
  notificationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceAlertFormData {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  currentPrice: number;
  targetPrice: number;
  currency?: string;
}

export interface PriceAlertFilters {
  status: 'all' | 'active' | 'triggered' | 'inactive';
}

export interface CreatePriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  flightData: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    currentPrice: number;
    currency?: string;
  };
  onSuccess?: (alert: PriceAlert) => void;
}

export interface PriceAlertCardProps {
  alert: PriceAlert;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export interface PriceAlertNotificationProps {
  triggeredAlerts: PriceAlert[];
  onDismiss: () => void;
  onViewAlerts: () => void;
}
