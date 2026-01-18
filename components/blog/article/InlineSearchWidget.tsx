'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plane, Calendar, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface InlineSearchWidgetProps {
    origin?: string;
    destination?: string;
    defaultMonth?: string;
    variant?: 'compact' | 'full';
    className?: string;
}

/**
 * Ultra-Premium Inline Flight Search Widget
 * Level 6 - Apple-Class with glass morphism, shine effects, and premium animations
 */
export function InlineSearchWidget({
    origin = 'NYC',
    destination = 'PAR',
    defaultMonth = 'February 2026',
    variant = 'compact',
    className = '',
}: InlineSearchWidgetProps) {
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    const months = [
        'January 2026',
        'February 2026',
        'March 2026',
        'April 2026',
        'May 2026',
        'June 2026',
        'July 2026',
        'August 2026',
        'September 2026',
        'October 2026',
        'November 2026',
        'December 2026',
    ];

    const getSearchUrl = () => {
        const monthIndex = months.indexOf(selectedMonth);
        const year = 2026;
        const month = (monthIndex + 1).toString().padStart(2, '0');
        const departureDate = `${year}-${month}-15`;
        return `/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=1`;
    };

    // Compact Variant
    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`my-10 ${className}`}
            >
                <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(37,99,235,0.2),0_4px_20px_rgba(37,99,235,0.1)]">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-[shimmer_4s_ease-in-out_infinite]" />

                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Shine sweep */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </div>

                    <div className="relative z-10 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Route display */}
                            <div className="flex items-center gap-4 text-white">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                                    <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                                        <Plane className="w-7 h-7" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100 font-medium">Check Live Prices</p>
                                    <p className="font-black text-xl tracking-tight">{origin} → {destination}</p>
                                </div>
                            </div>

                            {/* Month selector & CTA */}
                            <div className="flex-1 flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:max-w-[200px]">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none cursor-pointer transition-all hover:bg-white/20"
                                    >
                                        {months.map((month) => (
                                            <option key={month} value={month} className="text-gray-900 bg-white">
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Link
                                    href={getSearchUrl()}
                                    className="relative overflow-hidden px-6 py-3.5 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap group"
                                >
                                    {/* Button shine */}
                                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                                        <div className="absolute -inset-full group-hover:animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-blue-100 to-transparent skew-x-12" />
                                    </div>
                                    <Search className="w-5 h-5 relative z-10" />
                                    <span className="hidden sm:inline relative z-10">Search Flights</span>
                                    <span className="sm:hidden relative z-10">Search</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Full Variant - Premium booking card
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`my-12 ${className}`}
        >
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(37,99,235,0.25),0_8px_30px_rgba(37,99,235,0.15)]">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 bg-[length:200%_200%] animate-[shimmer_6s_ease-in-out_infinite]" />

                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />

                {/* Floating orbs */}
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-[60px]"
                    animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Shine sweep */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -inset-full animate-[shine_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                </div>

                <div className="relative z-10 p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/30"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-white text-sm font-bold">Best Price Guarantee</span>
                        </motion.div>

                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
                            Ready to Book Your Flight?
                        </h3>
                        <p className="text-blue-100 text-lg">
                            Compare prices from 500+ airlines for the best deals
                        </p>
                    </div>

                    {/* Search form */}
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
                        <div className="grid md:grid-cols-3 gap-5">
                            {/* From */}
                            <div className="space-y-2">
                                <label className="text-sm text-blue-100 font-semibold flex items-center gap-2">
                                    <Plane className="w-4 h-4" />
                                    From
                                </label>
                                <div className="px-5 py-4 bg-white rounded-xl flex items-center gap-3 shadow-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="font-black text-gray-900 text-lg">{origin}</span>
                                </div>
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                                <label className="text-sm text-blue-100 font-semibold flex items-center gap-2">
                                    <Plane className="w-4 h-4 rotate-90" />
                                    To
                                </label>
                                <div className="px-5 py-4 bg-white rounded-xl flex items-center gap-3 shadow-lg">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Plane className="w-5 h-5 text-indigo-600 rotate-90" />
                                    </div>
                                    <span className="font-black text-gray-900 text-lg">{destination}</span>
                                </div>
                            </div>

                            {/* When */}
                            <div className="space-y-2">
                                <label className="text-sm text-blue-100 font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    When
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-5 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 shadow-lg cursor-pointer"
                                >
                                    {months.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Link
                            href={getSearchUrl()}
                            className="relative overflow-hidden mt-8 w-full py-5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg group"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                <div className="absolute -inset-full group-hover:animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                            </div>
                            <span className="relative z-10">Search Flights</span>
                            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Trust badge */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-3 mt-6"
                    >
                        <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                            <TrendingDown className="w-4 h-4 text-green-300" />
                            <span className="text-green-100 text-sm font-semibold">
                                Average savings of 40% vs airline websites
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
