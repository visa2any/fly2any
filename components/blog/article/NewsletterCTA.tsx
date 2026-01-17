'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 py-20 my-16">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Mail className="w-10 h-10" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">Get Travel Tips in Your Inbox</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 50,000+ travelers receiving exclusive deals, destination guides, and money-saving tips weekly.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={subscribed}
                className="flex-1 px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder:text-white/60 focus:ring-4 focus:ring-white/30 focus:border-white transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {subscribed ? (
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
          </form>

          <p className="text-sm text-white/70 mt-4">
            No spam. Unsubscribe anytime. 🔒
          </p>
        </motion.div>
      </div>
    </section>
  );
}
