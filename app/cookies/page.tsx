'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, Eye, BarChart3, Target, CheckCircle, X, ChevronRight } from 'lucide-react';

const COOKIE_TYPES = [
  {
    id: 'essential',
    title: 'Essential Cookies',
    icon: Shield,
    required: true,
    desc: 'Required for the website to function. Cannot be disabled.',
    examples: ['Session management', 'Security tokens', 'Login state', 'Shopping cart'],
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    icon: Settings,
    required: false,
    desc: 'Remember your preferences and settings.',
    examples: ['Language preference', 'Currency selection', 'Recent searches', 'Theme settings'],
  },
  {
    id: 'analytics',
    title: 'Analytics Cookies',
    icon: BarChart3,
    required: false,
    desc: 'Help us understand how visitors use our website.',
    examples: ['Page views', 'Traffic sources', 'User journeys', 'Performance metrics'],
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies',
    icon: Target,
    required: false,
    desc: 'Used to show relevant ads and measure campaign effectiveness.',
    examples: ['Ad personalization', 'Retargeting', 'Conversion tracking', 'Social media'],
  },
];

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6">
              <Cookie className="w-4 h-4" /> Cookie Policy
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cookie
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              We use cookies to enhance your experience. Manage your preferences below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cookie Manager */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {COOKIE_TYPES.map((cookie, i) => (
              <motion.div key={cookie.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <cookie.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {cookie.title}
                        {cookie.required && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Required</span>}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{cookie.desc}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cookie.examples.map((ex) => (
                          <span key={ex} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-500">{ex}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => !cookie.required && setPreferences({ ...preferences, [cookie.id]: !preferences[cookie.id as keyof typeof preferences] })}
                    disabled={cookie.required}
                    className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                      preferences[cookie.id as keyof typeof preferences]
                        ? 'bg-amber-500'
                        : 'bg-white/10'
                    } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      preferences[cookie.id as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold hover:opacity-90 transition-opacity">
              {saved ? <><CheckCircle className="w-5 h-5" /> Saved!</> : 'Save Preferences'}
            </button>
            <button onClick={() => setPreferences({ essential: true, functional: true, analytics: true, marketing: true })}
              className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-colors">
              Accept All
            </button>
            <button onClick={() => setPreferences({ essential: true, functional: false, analytics: false, marketing: false })}
              className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 font-semibold hover:bg-white/10 transition-colors">
              Essential Only
            </button>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-gray">
          <h2 className="text-2xl font-bold mb-6">About Our Cookies</h2>
          <div className="space-y-6 text-gray-400">
            <p>
              Fly2Any uses cookies and similar technologies to provide, protect, and improve our services.
              This policy explains what cookies are, how we use them, and your choices regarding their use.
            </p>
            <h3 className="text-xl font-semibold text-white">What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device when you visit websites. They help websites
              remember your preferences and improve your browsing experience.
            </p>
            <h3 className="text-xl font-semibold text-white">How We Use Cookies</h3>
            <p>
              We use cookies to: keep you signed in, remember your preferences, understand how you use our
              platform, and show you relevant content and ads.
            </p>
            <h3 className="text-xl font-semibold text-white">Your Rights</h3>
            <p>
              Under GDPR and CCPA, you have the right to access, modify, or delete your data. You can
              manage cookie preferences above or contact us for data requests.
            </p>
            <p className="text-sm">
              Last updated: December 2024. Contact: privacy@fly2any.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
