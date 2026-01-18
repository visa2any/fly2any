'use client';

import Link from 'next/link';
import { ExternalLink, TrendingDown, Calendar, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlightPrice {
  route: string;
  origin: string;
  destination: string;
  price: number;
  originalPrice?: number;
  airline: string;
  month?: string;
  discount?: number;
}

interface PriceTableProps {
  title: string;
  subtitle?: string;
  prices: FlightPrice[];
  currency?: string;
}

const AIRPORT_NAMES: Record<string, string> = {
  JFK: 'New York (JFK)',
  EWR: 'Newark (EWR)',
  LGA: 'New York LaGuardia (LGA)',
  BOS: 'Boston (BOS)',
  IAD: 'Washington Dulles (IAD)',
  MIA: 'Miami (MIA)',
  CDG: 'Paris Charles de Gaulle (CDG)',
  ORY: 'Paris Orly (ORY)',
};

const getAirportName = (code: string): string => AIRPORT_NAMES[code] || code;

export function PriceTable({ title, subtitle, prices, currency = 'USD' }: PriceTableProps) {
  const generateSearchLink = (origin: string, destination: string) => {
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      tripType: 'roundtrip',
      adults: '1',
    });
    return `/?${params.toString()}#search`;
  };

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 sm:py-16 md:py-20 my-10 sm:my-12 md:my-16">
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-5 md:mb-6 tracking-tight">{title}</h2>
          {subtitle && <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed">{subtitle}</p>}
        </motion.div>

        {/* Table Container - FULL WIDTH */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 max-w-[1400px] mx-auto"
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
                <tr>
                  <th className="px-8 py-6 text-left text-base font-bold">Route</th>
                  <th className="px-8 py-6 text-left text-base font-bold">Airline</th>
                  {prices.some(p => p.month) && (
                    <th className="px-8 py-6 text-left text-base font-bold">Best Month</th>
                  )}
                  <th className="px-8 py-6 text-left text-base font-bold">Price</th>
                  <th className="px-8 py-6 text-center text-base font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map((price, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Plane className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900">{price.route}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {getAirportName(price.origin)} → {getAirportName(price.destination)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-gray-800 font-medium text-base">{price.airline}</span>
                    </td>
                    {prices.some(p => p.month) && (
                      <td className="px-8 py-6">
                        {price.month && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-gray-800 font-medium text-base">{price.month}</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-8 py-6">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-blue-600">
                          ${price.price}
                        </span>
                        {price.originalPrice && (
                          <>
                            <span className="text-lg text-gray-400 line-through font-medium">
                              ${price.originalPrice}
                            </span>
                            {price.discount && (
                              <span className="text-sm font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                <TrendingDown className="w-4 h-4" />
                                {price.discount}%
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{currency} Roundtrip</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Link
                        href={generateSearchLink(price.origin, price.destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-lg"
                      >
                        <span className="text-white">Search Now</span>
                        <ExternalLink className="w-5 h-5 text-white" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {prices.map((price, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-5 active:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 mb-1">{price.route}</h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      {getAirportName(price.origin)} → {getAirportName(price.destination)}
                    </p>
                    {price.discount && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full mt-2 shadow-sm">
                        <TrendingDown className="w-3 h-3" />
                        {price.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Airline</span>
                    <span className="font-semibold text-gray-900">{price.airline}</span>
                  </div>
                  {price.month && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best Month</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{price.month}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-blue-600">${price.price}</span>
                      {price.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-medium">${price.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{currency} Roundtrip</p>
                  </div>
                  <Link
                    href={generateSearchLink(price.origin, price.destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-5 py-3 rounded-full transition-all duration-200 active:scale-95 shadow-lg min-h-[44px] flex-shrink-0"
                  >
                    <span className="text-white text-sm">Search</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs sm:text-sm md:text-base text-gray-600 mt-6 sm:mt-7 md:mt-8 max-w-3xl mx-auto leading-relaxed"
        >
          *Prices are based on recent searches and subject to availability. All prices shown are for roundtrip economy fares. Click "Search Now" for live prices and booking options.
        </motion.p>
      </div>
    </section>
  );
}
