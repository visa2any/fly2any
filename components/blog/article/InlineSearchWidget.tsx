'use client';

import { useState } from 'react';
import { Search, Plane, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InlineSearchWidgetProps {
    origin?: string;
    destination?: string;
    defaultMonth?: string;
    variant?: 'compact' | 'full';
    className?: string;
}

/**
 * Inline Flight Search Widget for Blog Articles
 * 
 * Embeds a pre-filled flight search form directly within article content
 * to capture readers who are ready to book after reading pricing info.
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

    // Build search URL with pre-filled parameters
    const getSearchUrl = () => {
        const monthIndex = months.indexOf(selectedMonth);
        const year = 2026;
        const month = (monthIndex + 1).toString().padStart(2, '0');
        const departureDate = `${year}-${month}-15`; // Mid-month

        return `/flights?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=1`;
    };

    if (variant === 'compact') {
        return (
            <div className={`my-8 ${className}`}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Plane className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Check Live Prices</p>
                                <p className="font-bold text-lg">{origin} → {destination}</p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="flex-1 sm:max-w-[180px] px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                {months.map((month) => (
                                    <option key={month} value={month} className="text-gray-900">
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <Link
                                href={getSearchUrl()}
                                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden sm:inline">Search Flights</span>
                                <span className="sm:hidden">Search</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full variant with more details
    return (
        <div className={`my-10 ${className}`}>
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Ready to Book Your Flight?
                    </h3>
                    <p className="text-blue-100">
                        Compare prices from 500+ airlines for the best deals
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-blue-100 font-medium">From</label>
                            <div className="px-4 py-3 bg-white rounded-xl flex items-center gap-3">
                                <Plane className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-gray-900">{origin}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-blue-100 font-medium">To</label>
                            <div className="px-4 py-3 bg-white rounded-xl flex items-center gap-3">
                                <Plane className="w-5 h-5 text-blue-600 rotate-90" />
                                <span className="font-bold text-gray-900">{destination}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-blue-100 font-medium">When</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Link
                        href={getSearchUrl()}
                        className="mt-6 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                    >
                        Search Flights
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <p className="text-center text-blue-200 text-sm mt-4">
                    💰 Average savings of 40% compared to airline websites
                </p>
            </div>
        </div>
    );
}
