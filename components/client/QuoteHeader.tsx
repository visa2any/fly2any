'use client';

// components/client/QuoteHeader.tsx
// Level 6 Ultra-Premium Client Quote Header
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

interface QuoteHeaderProps {
  quote: {
    tripName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    status: string;
    expiresAt: Date;
    quoteNumber: string;
  };
}

export default function QuoteHeader({ quote }: QuoteHeaderProps) {
  const isExpired = new Date() > new Date(quote.expiresAt);
  const status = isExpired ? 'EXPIRED' : quote.status;

  const getStatusConfig = () => {
    const configs = {
      SENT: { bg: 'bg-blue-500/20', text: 'text-blue-100', label: 'Quote Sent' },
      VIEWED: { bg: 'bg-purple-500/20', text: 'text-purple-100', label: 'Viewed' },
      ACCEPTED: { bg: 'bg-emerald-500/20', text: 'text-emerald-100', label: 'Accepted' },
      DECLINED: { bg: 'bg-red-500/20', text: 'text-red-100', label: 'Declined' },
      EXPIRED: { bg: 'bg-gray-500/20', text: 'text-gray-200', label: 'Expired' },
    };
    return configs[status as keyof typeof configs] || configs.SENT;
  };

  const statusConfig = getStatusConfig();

  return (
    <header className="relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-10 right-10 text-white/10"
        >
          <Sparkles className="w-32 h-32" />
        </motion.div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Quote Number & Status */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-sm text-white/70 font-medium">
              Quote #{quote.quoteNumber}
            </span>
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} backdrop-blur-sm`}
            >
              {statusConfig.label}
            </motion.span>
          </div>

          {/* Trip Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
          >
            {quote.tripName}
          </motion.h1>

          {/* Destination */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-lg text-white/90 mb-8"
          >
            <MapPin className="w-5 h-5" />
            <span className="font-medium">{quote.destination}</span>
          </motion.div>

          {/* Trip Info Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {/* Dates */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(quote.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                -{' '}
                {new Date(quote.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90">
              <Clock className="w-4 h-4" />
              <span>
                {quote.duration} {quote.duration === 1 ? 'Day' : 'Days'}
              </span>
            </div>

            {/* Expiry */}
            {!isExpired && status !== 'ACCEPTED' && status !== 'DECLINED' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full text-sm text-amber-100">
                <Clock className="w-4 h-4" />
                <span>
                  Expires{' '}
                  {new Date(quote.expiresAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-[60px]">
          <path
            d="M0 60V20C240 40 480 0 720 20C960 40 1200 0 1440 20V60H0Z"
            fill="rgb(249 250 251)"
          />
        </svg>
      </div>
    </header>
  );
}
