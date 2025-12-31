'use client';

// components/client/QuoteDetails.tsx
// Level 6 Ultra-Premium Trip Details
import { motion } from 'framer-motion';
import {
  Users, Baby, Calendar, ArrowRight, MessageSquare,
  Mail, Phone, User
} from 'lucide-react';

interface QuoteDetailsProps {
  quote: {
    travelers: number;
    adults: number;
    children: number;
    infants: number;
    destination: string;
    startDate: Date;
    endDate: Date;
    notes?: string | null;
    agent: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
}

export default function QuoteDetails({ quote }: QuoteDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden"
    >
      <div className="p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Travelers */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Travelers
            </h3>
            <div className="space-y-3">
              {quote.adults > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {quote.adults} {quote.adults === 1 ? 'Adult' : 'Adults'}
                  </span>
                </div>
              )}
              {quote.children > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {quote.children} {quote.children === 1 ? 'Child' : 'Children'}
                  </span>
                </div>
              )}
              {quote.infants > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Baby className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {quote.infants} {quote.infants === 1 ? 'Infant' : 'Infants'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-200">
              Total: {quote.travelers} travelers
            </p>
          </div>

          {/* Travel Dates */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Travel Dates
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Departure</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(quote.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Return</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(quote.endDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Notes */}
        {quote.notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-100"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Message from Your Travel Agent
            </h3>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {quote.notes}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Agent Contact Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Your Travel Agent
          </h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
              {quote.agent.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg">{quote.agent.name}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <a
                  href={`mailto:${quote.agent.email}`}
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{quote.agent.email}</span>
                </a>
                {quote.agent.phone && (
                  <a
                    href={`tel:${quote.agent.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{quote.agent.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
