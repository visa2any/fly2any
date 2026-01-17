'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-article' }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('✅ Check your email to confirm subscription!');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Try again.');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 py-12 sm:py-16 md:py-20 my-12 sm:my-16">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
            <Mail className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">Get Travel Tips in Your Inbox</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
            Join 50,000+ travelers receiving exclusive deals, destination guides, and money-saving tips weekly.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-5 sm:px-6 py-3.5 sm:py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder:text-white/60 focus:ring-4 focus:ring-white/30 focus:border-white transition-all disabled:opacity-50 text-base min-h-[48px]"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all active:scale-95 sm:hover:scale-105 shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap min-h-[48px]"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Done
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center mt-4 font-semibold ${
                  status === 'error' ? 'text-red-100' : 'text-white'
                }`}
              >
                {message}
              </motion.p>
            )}
          </form>

          <p className="text-sm text-white/70 mt-4">
            No spam. Unsubscribe anytime. GDPR compliant. 🔒
          </p>
        </motion.div>
      </div>
    </section>
  );
}
