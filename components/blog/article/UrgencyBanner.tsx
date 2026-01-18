'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Flame, Users, Zap } from 'lucide-react';

interface UrgencyBannerProps {
    type?: 'countdown' | 'scarcity' | 'popularity';
    expiresAt?: Date;
    seatsLeft?: number;
    viewersCount?: number;
    message?: string;
    className?: string;
}

/**
 * Ultra-Premium Urgency Banner for Blog Articles
 * Level 6 - Apple-Class with glass morphism, shine effects, and premium animations
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

    // Countdown Timer Variant
    if (type === 'countdown') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`my-8 ${className}`}
            >
                <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(231,64,53,0.25),0_4px_16px_rgba(231,64,53,0.15)]">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E74035] via-[#FF6B5B] to-[#E74035] bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Shine sweep effect */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </div>

                    <div className="relative z-10 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-white">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse" />
                                    <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <Clock className="w-6 h-6 animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <span className="font-black text-lg tracking-tight">{message || 'Deal expires in:'}</span>
                                    <p className="text-white/80 text-sm">Book now to lock this price</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                {[
                                    { value: timeLeft.hours, label: 'HRS' },
                                    { value: timeLeft.minutes, label: 'MIN' },
                                    { value: timeLeft.seconds, label: 'SEC' },
                                ].map((unit, i) => (
                                    <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
                                        <motion.div
                                            key={`${unit.label}-${unit.value}`}
                                            initial={{ scale: 1.1 }}
                                            animate={{ scale: 1 }}
                                            className="bg-white/20 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white border border-white/20 shadow-lg min-w-[52px] sm:min-w-[60px]"
                                        >
                                            <span className="text-2xl sm:text-3xl font-black tabular-nums block text-center">
                                                {unit.value.toString().padStart(2, '0')}
                                            </span>
                                            <span className="text-[10px] sm:text-xs font-bold block text-center text-white/80 tracking-wider">
                                                {unit.label}
                                            </span>
                                        </motion.div>
                                        {i < 2 && <span className="text-white/60 text-2xl font-bold">:</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Scarcity Variant - "Only X seats left"
    if (type === 'scarcity') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`my-8 ${className}`}
            >
                <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.25),0_4px_16px_rgba(245,158,11,0.15)]">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />

                    {/* Shine sweep */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
                    </div>

                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: '50%',
                                }}
                                animate={{
                                    y: [-10, 10, -10],
                                    opacity: [0.3, 0.7, 0.3],
                                }}
                                transition={{
                                    duration: 2 + i * 0.3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 p-5 sm:p-6">
                        <div className="flex items-center justify-center gap-4">
                            {/* Pulsing icon */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/30 rounded-full blur-lg animate-ping" />
                                <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            <div className="text-white">
                                <span className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-yellow-200 animate-pulse" />
                                    {message || `Only ${seatsLeft} seats left at this price!`}
                                    <Flame className="w-5 h-5 text-yellow-200 animate-pulse" />
                                </span>
                                <p className="text-white/80 text-sm mt-1">Prices may increase - book now to save</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Popularity Variant - "X people viewing"
    if (type === 'popularity') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`my-8 ${className}`}
            >
                <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.25),0_4px_16px_rgba(139,92,246,0.15)]">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Shine sweep */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </div>

                    <div className="relative z-10 p-5 sm:p-6">
                        <div className="flex items-center justify-center gap-4">
                            {/* Live indicator */}
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                                </span>
                                <span className="text-white text-sm font-bold">LIVE</span>
                            </div>

                            <div className="flex items-center gap-3 text-white">
                                <div className="relative">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="font-black text-lg sm:text-xl">
                                    {message || `${viewersCount} people viewing this deal`}
                                </span>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Flame className="w-5 h-5 text-yellow-300" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return null;
}
