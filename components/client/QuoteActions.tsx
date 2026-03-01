'use client';

// components/client/QuoteActions.tsx
// Level 6 Ultra-Premium Accept/Decline Actions
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, X, Loader2, Info, MessageSquare, Edit3
} from 'lucide-react';

interface QuoteActionsProps {
  quote: {
    id: string;
    shareableLink: string;
    status: string;
  };
  canAccept: boolean;
}

export default function QuoteActions({ quote, canAccept }: QuoteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesMessage, setChangesMessage] = useState('');
  const [changesSent, setChangesSent] = useState(false);

  const handleAccept = async () => {
    if (!canAccept) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/share/${quote.shareableLink}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept quote');
      }

      toast.success('Quote accepted! Your travel agent will contact you shortly.');
      router.refresh();
    } catch (error: any) {
      console.error('Accept error:', error);
      toast.error(error.message || 'Failed to accept quote');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!quote.shareableLink || !changesMessage.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/share/${quote.shareableLink}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: changesMessage.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send request');
      setChangesSent(true);
      setTimeout(() => {
        setChangesSent(false);
        setShowChangesModal(false);
        setChangesMessage('');
      }, 2500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {

    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/share/${quote.shareableLink}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: declineReason || 'No reason provided',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline quote');
      }

      toast.success('Quote declined. Your agent has been notified.');
      setShowDeclineModal(false);
      router.refresh();
    } catch (error: any) {
      console.error('Decline error:', error);
      toast.error(error.message || 'Failed to decline quote');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccept) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ready to Book?</h2>

          <div className="space-y-3">
            {/* Accept Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAccept}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept This Quote
                </>
              )}
            </motion.button>

            {/* Request Changes Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowChangesModal(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 border-2 border-blue-200 text-blue-700 py-3.5 px-6 rounded-xl font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Edit3 className="w-5 h-5" />
              Request Changes
            </motion.button>

            {/* Decline Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeclineModal(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <X className="w-5 h-5" />
              Decline Quote
            </motion.button>
          </div>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p>
                By accepting this quote, you're indicating your intent to book. Your travel agent
                will contact you to finalize payment and confirm all details.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Request Changes Modal */}
      <AnimatePresence>
        {showChangesModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !loading && setShowChangesModal(false)}
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-6">
                  {changesSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-6 gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Request Sent!</h3>
                      <p className="text-gray-500 text-center text-sm">
                        Your agent has been notified and will update the quote shortly.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Edit3 className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        Request Changes
                      </h3>
                      <p className="text-gray-600 text-center mb-6 text-sm">
                        Describe what you'd like adjusted. Your agent will revise the quote and notify you.
                      </p>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-1.5" />
                          What would you like changed?
                        </label>
                        <textarea
                          value={changesMessage}
                          onChange={e => setChangesMessage(e.target.value)}
                          placeholder="e.g. Can you upgrade the hotel to 5-star? Also, we'd prefer a direct flight..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowChangesModal(false)}
                          disabled={loading}
                          className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={handleRequestChanges}
                          disabled={loading || changesMessage.trim().length < 5}
                          className="py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                          ) : (
                            'Send Request'
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Decline Modal */}
      <AnimatePresence>
        {showDeclineModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !loading && setShowDeclineModal(false)}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <X className="w-7 h-7 text-red-600" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Decline This Quote?
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Your travel agent will be notified. You can optionally provide feedback below.
                  </p>

                  {/* Reason Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1.5" />
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={e => setDeclineReason(e.target.value)}
                      placeholder="Let your agent know why you're declining..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeclineModal(false)}
                      disabled={loading}
                      className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDecline}
                      disabled={loading}
                      className="py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Declining...
                        </>
                      ) : (
                        'Decline Quote'
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
