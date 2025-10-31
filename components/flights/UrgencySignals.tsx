'use client';

import { useEffect, useState } from 'react';
import { UrgencyCluster } from './UrgencyCluster';
import { SocialProofCluster } from './SocialProofCluster';

interface UrgencySignalsProps {
  flightId: string;
  route: string;
  price: number;
  departureDate: string;
  airline: string;
  seatsAvailable?: number;
}

interface UrgencySignalsData {
  priceLock: {
    active: boolean;
    minutesRemaining: number;
    secondsRemaining: number;
  };
  socialProof: {
    currentViewers: number;
    recentBookings: number;
    bookingsToday: number;
    seatsRemainingAtPrice: number;
  };
  mlPredictions: {
    priceTrend: 'rising' | 'stable' | 'falling';
    predictionPercent: number;
    confidenceScore: number;
    timeframe: '24h' | '48h' | '72h';
  };
  scarcity: {
    seatsRemaining: number;
    isLowInventory: boolean;
    popularSeatsRemaining?: number;
  };
  dealQuality: {
    percentVsAverage: number;
    isGoodDeal: boolean;
    isExcellentDeal: boolean;
  };
}

export function UrgencySignals({
  flightId,
  route,
  price,
  departureDate,
  airline,
  seatsAvailable,
}: UrgencySignalsProps) {
  const [signals, setSignals] = useState<UrgencySignalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<string>('');

  // Generate session ID once
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('urgencySessionId');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        sessionStorage.setItem('urgencySessionId', id);
      }
      return id;
    }
    return `session_${Date.now()}`;
  });

  // Fetch urgency signals
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await fetch('/api/flights/urgency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flightId,
            route,
            price,
            departureDate,
            airline,
            seatsAvailable,
            sessionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.signals) {
            setSignals(data.signals);
          }
        }
      } catch (error) {
        console.error('Failed to fetch urgency signals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [flightId, route, price, departureDate, airline, seatsAvailable, sessionId]);

  // Update timer every second
  useEffect(() => {
    if (!signals?.priceLock.active) return;

    const interval = setInterval(() => {
      const mins = signals.priceLock.minutesRemaining;
      const secs = signals.priceLock.secondsRemaining;

      // Calculate remaining time
      const totalSeconds = mins * 60 + secs - 1;
      if (totalSeconds <= 0) {
        setTimer('Price updating...');
        return;
      }

      const newMins = Math.floor(totalSeconds / 60);
      const newSecs = totalSeconds % 60;
      setTimer(`${newMins}:${newSecs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [signals]);

  if (loading || !signals) return null;

  // Prepare data for consolidated clusters
  const urgencyData = {
    priceLock: signals.priceLock.active ? {
      active: true,
      minutesRemaining: signals.priceLock.minutesRemaining,
      secondsRemaining: signals.priceLock.secondsRemaining,
    } : undefined,
    prediction: signals.mlPredictions.confidenceScore > 0.7 ? {
      trend: signals.mlPredictions.priceTrend,
      percent: signals.mlPredictions.predictionPercent,
      timeframe: signals.mlPredictions.timeframe,
    } : undefined,
    scarcity: signals.scarcity.isLowInventory ? {
      seatsLeft: signals.scarcity.seatsRemaining,
      isLow: true,
    } : undefined,
  };

  const socialData = {
    viewing: signals.socialProof.currentViewers > 5 ? signals.socialProof.currentViewers : undefined,
    booked: signals.socialProof.recentBookings > 0 ? signals.socialProof.recentBookings : undefined,
  };

  // Only render if we have signals to show
  if (!urgencyData.priceLock && !urgencyData.prediction && !urgencyData.scarcity && !socialData.viewing && !socialData.booked) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-2">
      <UrgencyCluster {...urgencyData} />
      <SocialProofCluster {...socialData} />
    </div>
  );
}
