'use client';

import { useState, useEffect } from 'react';

interface Props {
  route?: string;
}

export function SearchActivityIndicator({ route }: Props) {
  const [viewers, setViewers] = useState(47);
  const [recentBooking, setRecentBooking] = useState('2 minutes ago');
  const [seatsLeft, setSeatsLeft] = useState(3);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
      const minutes = Math.floor(Math.random() * 10) + 1;
      setRecentBooking(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
    }, 5000);

    return () => clearInterval(interval);
  }, [route]);

  return (
    <div className="space-y-3">
      {/* Live viewers */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="font-semibold text-gray-900">{viewers} people</span>
        </div>
        <span className="text-gray-600">viewing this route now</span>
      </div>

      {/* Recent booking */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span>Someone booked this route <span className="font-semibold text-gray-900">{recentBooking}</span></span>
      </div>

      {/* Seats left */}
      {seatsLeft <= 5 && (
        <div className="flex items-center gap-2 p-2 bg-error/10 rounded-lg">
          <span className="text-xl">🔥</span>
          <span className="text-sm font-semibold text-error">
            Only {seatsLeft} seats left at this price!
          </span>
        </div>
      )}
    </div>
  );
}
