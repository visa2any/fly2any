'use client';

import { useState, useEffect } from 'react';

interface Booking {
  name: string;
  destination: string;
  timeAgo: string;
  location?: string;
  amount?: number;
}

interface RecentBookingsFeedProps {
  bookings?: Booking[];
  autoScroll?: boolean;
  speed?: number; // ms between updates
}

// Mock data generator
const generateMockBooking = (): Booking => {
  const names = ['Sarah M.', 'John D.', 'Maria S.', 'David L.', 'Emma W.', 'Michael R.', 'Lisa K.', 'James P.', 'Anna B.', 'Chris T.'];
  const locations = ['NYC', 'LA', 'Miami', 'Chicago', 'Boston', 'London', 'Toronto', 'Dallas', 'Seattle', 'Denver'];
  const destinations = ['Paris', 'Tokyo', 'Bali', 'Rome', 'Dubai', 'Barcelona', 'London', 'Maldives', 'Iceland', 'Thailand'];
  const timeUnits = ['minute', 'minutes', 'hour', 'hours'];

  const amount = Math.floor(Math.random() * 600) + 199;
  const timeValue = Math.floor(Math.random() * 12) + 1;
  const timeUnit = timeValue === 1 ? timeUnits[0] : (timeValue < 5 ? timeUnits[1] : (timeValue === 1 ? timeUnits[2] : timeUnits[3]));

  return {
    name: names[Math.floor(Math.random() * names.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    amount,
    timeAgo: `${timeValue} ${timeUnit} ago`,
  };
};

export default function RecentBookingsFeed({
  bookings: initialBookings,
  autoScroll = true,
  speed = 4000
}: RecentBookingsFeedProps) {
  // Generate initial bookings if none provided
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (initialBookings && initialBookings.length > 0) {
      return initialBookings;
    }
    return Array.from({ length: 5 }, generateMockBooking);
  });

  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoScroll || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % bookings.length;

        // Add new mock booking periodically to keep feed fresh
        if (next === 0 && Math.random() > 0.7) {
          setBookings(prevBookings => {
            const newBookings = [...prevBookings];
            newBookings.unshift(generateMockBooking());
            if (newBookings.length > 10) newBookings.pop();
            return newBookings;
          });
        }

        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoScroll, isPaused, speed, bookings.length]);

  const visibleBookings = [
    bookings[currentIndex],
    bookings[(currentIndex + 1) % bookings.length],
    bookings[(currentIndex + 2) % bookings.length]
  ].filter(Boolean);

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto border border-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
        <span className="text-xs text-gray-500 ml-auto">Live</span>
      </div>

      <div className="space-y-3 max-h-[240px] overflow-hidden">
        {visibleBookings.map((booking, index) => (
          <div
            key={`${booking.name}-${booking.destination}-${index}`}
            className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg animate-slide-up-fade"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {booking.name.charAt(0)}
            </div>

            {/* Booking info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">
                <span className="font-semibold">{booking.name}</span>
                {booking.location && (
                  <span className="text-gray-600"> from {booking.location}</span>
                )}
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                just booked <span className="font-semibold text-blue-600">{booking.destination}</span>
                {booking.amount && (
                  <span className="text-green-600 font-bold"> - ${booking.amount}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">{booking.timeAgo}</p>
            </div>

            {/* Success checkmark */}
            <div className="flex-shrink-0 text-green-500 text-xl">
              ✓
            </div>
          </div>
        ))}
      </div>

      {autoScroll && (
        <div className="mt-3 pt-2 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {isPaused ? 'Paused' : 'Auto-updating...'}
          </p>
        </div>
      )}
    </div>
  );
}
