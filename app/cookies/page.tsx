'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cookie, Shield, Settings, BarChart3, Target, CheckCircle } from 'lucide-react';

const COOKIES = [
  { id: 'essential', title: 'Essential', icon: Shield, required: true, desc: 'Required for website to function', color: 'bg-gray-500' },
  { id: 'functional', title: 'Functional', icon: Settings, required: false, desc: 'Remember your preferences', color: 'bg-blue-500' },
  { id: 'analytics', title: 'Analytics', icon: BarChart3, required: false, desc: 'Help us improve the site', color: 'bg-purple-500' },
  { id: 'marketing', title: 'Marketing', icon: Target, required: false, desc: 'Show relevant ads', color: 'bg-orange-500' },
];

export default function CookiesPage() {
  const [prefs, setPrefs] = useState({ essential: true, functional: true, analytics: true, marketing: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('cookie_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6">
              <Cookie className="w-4 h-4" /> Cookie Settings
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Cookie <span className="text-amber-600">Preferences</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Manage how we use cookies to enhance your experience.</p>
          </motion.div>
        </div>
      </section>

      {/* Cookie Manager */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {COOKIES.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {c.title}
                      {c.required && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Required</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{c.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => !c.required && setPrefs({ ...prefs, [c.id]: !prefs[c.id as keyof typeof prefs] })}
                  disabled={c.required}
                  className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                    prefs[c.id as keyof typeof prefs] ? 'bg-amber-500' : 'bg-gray-200'
                  } ${c.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ml-1 ${
                    prefs[c.id as keyof typeof prefs] ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button onClick={handleSave}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all">
              {saved ? <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Saved!</span> : 'Save Preferences'}
            </button>
            <button onClick={() => setPrefs({ essential: true, functional: true, analytics: true, marketing: true })}
              className="flex-1 py-4 rounded-xl bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
              Accept All
            </button>
            <button onClick={() => setPrefs({ essential: true, functional: false, analytics: false, marketing: false })}
              className="flex-1 py-4 rounded-xl bg-white border border-gray-200 font-semibold hover:bg-gray-50 transition-colors">
              Essential Only
            </button>
          </div>
        </div>
      </section>

      {/* Policy */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-3xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Cookies</h2>
            <div className="space-y-4 text-gray-600">
              <p>Cookies are small text files stored on your device. They help us provide a better experience by remembering your preferences and understanding how you use our platform.</p>
              <h3 className="text-lg font-semibold text-gray-900 pt-2">Your Rights</h3>
              <p>Under GDPR and CCPA, you have the right to access, modify, or delete your data. You can manage cookie preferences above or contact us at privacy@fly2any.com.</p>
              <p className="text-sm text-gray-500 pt-4">Last updated: December 2024</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
