'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Flame, Users } from 'lucide-react';

interface UrgencyBannerProps {
    type?: 'countdown' | 'scarcity' | 'popularity';
    expiresAt?: Date;
    seatsLeft?: number;
    viewersCount?: number;
    message?: string;
    className?: string;
}

/**
 * Urgency Banner for Blog Articles
 * 
 * Creates FOMO (fear of missing out) to encourage immediate action:
 * - Countdown timers for deal expiration
 * - Scarcity messaging ("Only 5 seats left!")
 * - Social proof ("23 people viewing this deal")
 */
export function UrgencyBanner({
    type = 'scarcity',
    expiresAt,
    seatsLeft = 5,
    viewersCount = 23,
    message,
    className = '',
}: UrgencyBannerProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (type !== 'countdown' || !expiresAt) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(expiresAt).getTime();
            const difference = target - now;

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [type, expiresAt]);

    if (type === 'countdown') {
        return (
            <div className={`my-6 ${className}`}>
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <Clock className="w-6 h-6 animate-pulse" />
                            <span className="font-bold">{message || 'Deal expires in:'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 rounded-lg px-3 py-2 text-white">
                                <span className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                                <span className="text-xs block">HRS</span>
                            </div>
                            <span className="text-white text-2xl">:</span>
                            <div className="bg-white/20 rounded-lg px-3 py-2 text-white">
                                <span className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                                <span className="text-xs block">MIN</span>
                            </div>
                            <span className="text-white text-2xl">:</span>
                            <div className="bg-white/20 rounded-lg px-3 py-2 text-white">
                                <span className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                                <span className="text-xs block">SEC</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'scarcity') {
        return (
            <div className={`my-6 ${className}`}>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-3 text-white">
                        <AlertTriangle className="w-6 h-6 animate-bounce" />
                        <span className="font-bold text-lg">
                            {message || `🔥 Only ${seatsLeft} seats left at this price!`}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'popularity') {
        return (
            <div className={`my-6 ${className}`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-center gap-3 text-white">
                        <Users className="w-6 h-6" />
                        <span className="font-bold">
                            {message || `👀 ${viewersCount} people are viewing this deal right now`}
                        </span>
                        <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
