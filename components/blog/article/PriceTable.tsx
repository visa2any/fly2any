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

export function PriceTable({ title, subtitle, prices, currency = 'USD' }: PriceTableProps) {
  const generateSearchLink = (origin: string, destination: string) => {
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      tripType: 'roundtrip',
      adults: '1',
    });
    return `https://www.fly2any.com/search?${params.toString()}`;
  };

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Route</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Airline</th>
                  {prices.some(p => p.month) && (
                    <th className="px-6 py-4 text-left text-sm font-bold">Best Month</th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prices.map((price, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{price.route}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {price.origin} → {price.destination}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{price.airline}</span>
                    </td>
                    {prices.some(p => p.month) && (
                      <td className="px-6 py-4">
                        {price.month && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{price.month}</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ${price.price}
                        </span>
                        {price.originalPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ${price.originalPrice}
                            </span>
                            {price.discount && (
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                {price.discount}%
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{currency}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={generateSearchLink(price.origin, price.destination)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        Search
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {prices.map((price, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Plane className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-gray-900">{price.route}</h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      {price.origin} → {price.destination}
                    </p>
                  </div>
                  {price.discount && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {price.discount}%
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Airline:</span>
                    <span className="font-medium text-gray-900">{price.airline}</span>
                  </div>
                  {price.month && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Best Month:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-gray-900">{price.month}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-600">${price.price}</span>
                      {price.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">${price.originalPrice}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{currency}</p>
                  </div>
                  <Link
                    href={generateSearchLink(price.origin, price.destination)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full transition-all duration-200 active:scale-95"
                  >
                    Search
                    <ExternalLink className="w-4 h-4" />
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
          className="text-center text-sm text-gray-500 mt-6"
        >
          *Prices are based on recent searches and subject to availability. Click "Search" for live prices.
        </motion.p>
      </div>
    </section>
  );
}
