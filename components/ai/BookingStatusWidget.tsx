'use client';

/**
 * Booking Status Widget for AI Chat
 *
 * Real-time booking status updates for customers.
 * Subscribes to SSE and shows notifications when booking status changes.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ticket,
  X,
  ChevronRight,
} from 'lucide-react';

interface BookingStatusWidgetProps {
  bookingReference?: string;
  onStatusChange?: (status: string, data: any) => void;
}

interface BookingUpdate {
  type: string;
  bookingReference: string;
  status: string;
  eticketNumbers?: string[];
  airlineRecordLocator?: string;
  timestamp: string;
}

export default function BookingStatusWidget({
  bookingReference,
  onStatusChange,
}: BookingStatusWidgetProps) {
  const [lastUpdate, setLastUpdate] = useState<BookingUpdate | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!bookingReference) return;

    // Connect to SSE for this booking
    const sseUrl = `/api/notifications/sse?type=customer&booking=${bookingReference}`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`📡 Connected to booking updates for ${bookingReference}`);
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    // Listen for ticket issued events
    eventSource.addEventListener('booking_ticketed', (event) => {
      try {
        const data: BookingUpdate = JSON.parse(event.data);
        console.log('🎫 Booking ticketed notification:', data);

        if (data.bookingReference === bookingReference) {
          setLastUpdate(data);
          setIsVisible(true);
          onStatusChange?.('ticketed', data);
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    });

    // Listen for status change events
    eventSource.addEventListener('booking_status_changed', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Booking status changed:', data);

        if (data.bookingReference === bookingReference) {
          setLastUpdate(data);
          setIsVisible(true);
          onStatusChange?.(data.newStatus, data);
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [bookingReference, onStatusChange]);

  // Auto-hide after 30 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        // Keep visible if ticketed (important info)
        if (lastUpdate?.status !== 'ticketed') {
          setIsVisible(false);
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, lastUpdate]);

  if (!isVisible || !lastUpdate) {
    return null;
  }

  const isTicketed = lastUpdate.status === 'ticketed';

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300">
      <div
        className={`relative rounded-xl p-4 shadow-lg border ${
          isTicketed
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isTicketed ? 'bg-green-100' : 'bg-blue-100'
            }`}
          >
            {isTicketed ? (
              <Ticket className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3
              className={`font-semibold ${
                isTicketed ? 'text-green-800' : 'text-blue-800'
              }`}
            >
              {isTicketed ? '🎉 E-Ticket Ready!' : '📊 Booking Update'}
            </h3>
            <p className="text-sm text-gray-600">
              Booking {lastUpdate.bookingReference}
            </p>
          </div>
        </div>

        {/* Content */}
        {isTicketed && (
          <div className="space-y-3">
            {/* PNR */}
            {lastUpdate.airlineRecordLocator && (
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Airline PNR
                  </p>
                  <p className="text-xl font-bold text-green-700 font-mono">
                    {lastUpdate.airlineRecordLocator}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            )}

            {/* E-Tickets */}
            {lastUpdate.eticketNumbers && lastUpdate.eticketNumbers.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  E-Ticket Numbers
                </p>
                <div className="space-y-1">
                  {lastUpdate.eticketNumbers.map((ticket, index) => (
                    <p
                      key={index}
                      className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded"
                    >
                      {ticket}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <a
              href={`/my-trips/${lastUpdate.bookingReference}`}
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              View Full Itinerary
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Non-ticketed status */}
        {!isTicketed && (
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm text-gray-700">
                Status updated to:{' '}
                <span className="font-semibold capitalize">
                  {lastUpdate.status?.replace(/_/g, ' ')}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 mt-3 text-center">
          Updated {new Date(lastUpdate.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to use booking status updates in any component
 */
export function useBookingStatusUpdates(bookingReference?: string) {
  const [status, setStatus] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<BookingUpdate | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!bookingReference) return;

    const sseUrl = `/api/notifications/sse?type=customer&booking=${bookingReference}`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('booking_ticketed', (event) => {
      const data = JSON.parse(event.data);
      if (data.bookingReference === bookingReference) {
        setStatus('ticketed');
        setLastUpdate(data);
      }
    });

    eventSource.addEventListener('booking_status_changed', (event) => {
      const data = JSON.parse(event.data);
      if (data.bookingReference === bookingReference) {
        setStatus(data.newStatus);
        setLastUpdate(data);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [bookingReference]);

  return { status, lastUpdate };
}
