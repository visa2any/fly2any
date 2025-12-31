'use client';

// components/client/ClientQuoteStatusBanner.tsx
// Level 6 Ultra-Premium Status Banners
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

interface ClientQuoteStatusBannerProps {
  status: string;
  isExpired: boolean;
  acceptedAt: Date | null;
}

export default function ClientQuoteStatusBanner({
  status,
  isExpired,
  acceptedAt,
}: ClientQuoteStatusBannerProps) {
  // Expired banner takes priority
  if (isExpired && status !== 'ACCEPTED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800">This quote has expired</p>
            <p className="text-sm text-red-700 mt-1">
              Please contact your travel agent to request a new quote with updated pricing.
            </p>
            <a
              href="#agent-contact"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <Mail className="w-4 h-4" />
              Contact Your Agent
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // Accepted banner
  if (status === 'ACCEPTED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Quote Accepted!</p>
            <p className="text-sm text-emerald-700 mt-1">
              You accepted this quote
              {acceptedAt && (
                <>
                  {' '}
                  on{' '}
                  {new Date(acceptedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </>
              )}
              . Your travel agent will contact you shortly to finalize the booking.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Declined banner
  if (status === 'DECLINED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Quote Declined</p>
            <p className="text-sm text-gray-700 mt-1">
              You declined this quote. If you'd like to discuss alternative options, please reach
              out to your travel agent.
            </p>
            <a
              href="#agent-contact"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              <Mail className="w-4 h-4" />
              Contact Your Agent
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  // Viewed banner (optional, subtle)
  if (status === 'VIEWED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-indigo-800">Review Your Quote</p>
            <p className="text-sm text-indigo-700 mt-1">
              Take your time reviewing the details below. When you're ready, click "Accept This
              Quote" to proceed with your booking.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // No banner for SENT status (first view)
  return null;
}
