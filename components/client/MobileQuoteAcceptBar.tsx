'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  quote: { id: string; shareableLink: string; status: string; total: number; currency: string };
  expiresAt: string;
}

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setIsUrgent(days < 2);
      setTimeLeft(days > 0 ? `${days}d ${hrs}h left` : hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return { timeLeft, isUrgent };
}

export default function MobileQuoteAcceptBar({ quote, expiresAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { timeLeft, isUrgent } = useCountdown(expiresAt);

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency, maximumFractionDigits: 0 }).format(quote.total);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/share/${quote.shareableLink}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept quote');
      toast.success('Quote accepted! Your travel agent will contact you shortly.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Only visible on mobile (< lg)
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 leading-tight">{fmt} total</p>
            {timeLeft && (
              <p className={`text-xs font-medium flex items-center gap-1 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
                <Clock className="w-3 h-3" />{timeLeft}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-60 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept Quote
          </motion.button>
        </div>
      </div>
    </div>
  );
}
