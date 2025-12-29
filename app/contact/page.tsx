'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, Send, CheckCircle, Headphones, Sparkles, Shield, Zap, Star, Users, Globe, ArrowRight, MessageSquare, HelpCircle, Plane, Hotel, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';

const METHODS = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Instant support', value: 'Start Chat Now', subtext: 'Avg. response: 30 seconds', color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', href: '#', online: true },
  { icon: Phone, title: 'Phone', desc: 'Talk to an expert', value: '+1 (332) 220-0838', subtext: 'Mon-Sun, 24/7', color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600', href: 'tel:+13322200838', online: true },
  { icon: Mail, title: 'Email', desc: 'Detailed inquiries', value: 'support@fly2any.com', subtext: 'Reply within 2 hours', color: 'from-violet-500 to-purple-600', bgLight: 'bg-violet-50', textColor: 'text-violet-600', href: 'mailto:support@fly2any.com', online: true },
];

const QUICK_TOPICS = [
  { icon: Plane, label: 'Flight Changes', color: 'bg-blue-100 text-blue-700' },
  { icon: Hotel, label: 'Hotel Booking', color: 'bg-purple-100 text-purple-700' },
  { icon: CreditCard, label: 'Refund Status', color: 'bg-emerald-100 text-emerald-700' },
  { icon: Calendar, label: 'Reschedule', color: 'bg-orange-100 text-orange-700' },
];

const STATS = [
  { value: '2M+', label: 'Happy Travelers', icon: Users },
  { value: '30s', label: 'Avg Response', icon: Zap },
  { value: '98%', label: 'Satisfaction', icon: Star },
  { value: '150+', label: 'Countries', icon: Globe },
];

const TESTIMONIALS = [
  { name: 'Jessica T.', text: 'Got my refund processed in under 24 hours. Amazing support!', rating: 5 },
  { name: 'Michael R.', text: 'The live chat helped me rebook instantly when my flight was cancelled.', rating: 5 },
  { name: 'Amanda K.', text: 'Best customer service I\'ve experienced from any travel site.', rating: 5 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [typingDots, setTypingDots] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation for live chat
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSent(true);
    setLoading(false);
  };

  const formProgress = () => {
    let filled = 0;
    if (form.name) filled++;
    if (form.email) filled++;
    if (form.subject) filled++;
    if (form.message) filled++;
    return (filled / 4) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Level-6 Hero with Stats */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent" />
          <motion.div
            className="absolute top-20 left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-[10%] w-80 h-80 bg-violet-500/15 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Live indicator */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90">12 agents online now</span>
              <span className="text-white/40">•</span>
              <span className="text-sm text-white/70">Avg wait: 30 seconds</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 tracking-tight">
              We're Here to <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Help</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Real people, real solutions. Our travel experts are standing by 24/7 to assist you.
            </p>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 36.7 960 43.3 1080 45C1200 46.7 1320 43.3 1380 41.7L1440 40V60H0Z" className="fill-slate-50"/>
          </svg>
        </div>
      </section>

      {/* Contact Methods - Enhanced */}
      <section className="py-8 md:py-12 px-4 relative z-20">
        <motion.div
          className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {METHODS.map((m, i) => (
            <motion.a
              key={m.title}
              href={m.href}
              target={m.href.startsWith('http') ? '_blank' : undefined}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-white shadow-lg border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <m.icon className="w-7 h-7 text-white" />
                  </div>
                  {m.online && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-emerald-700">Online</span>
                    </span>
                  )}
                </div>

                <h3 className={`text-xl font-bold text-gray-900 mb-1 group-hover:${m.textColor} transition-colors`}>{m.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{m.desc}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base text-gray-900 font-semibold">{m.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.subtext}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${m.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <ArrowRight className={`w-5 h-5 ${m.textColor} group-hover:translate-x-0.5 transition-transform`} />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* Quick Topics */}
        <motion.div
          className="max-w-3xl mx-auto mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-center text-sm text-gray-500 mb-4">Popular topics our team can help with:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_TOPICS.map((topic) => (
              <motion.button
                key={topic.label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${topic.color} text-sm font-medium hover:scale-105 transition-transform`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <topic.icon className="w-4 h-4" />
                {topic.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Contact Form - Enhanced */}
      <section className="py-10 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Testimonials & Info */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Live Chat Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Need Instant Help?</h3>
                      <p className="text-white/70 text-sm">Chat with us now</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">S</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Sarah from Support</div>
                        <div className="text-xs text-white/60">Typing{'.'.repeat(typingDots)}</div>
                      </div>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm text-white/80 pl-10">Hi! How can I help you today?</p>
                  </div>
                  <motion.button
                    className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Live Chat
                  </motion.button>
                </div>
              </div>

              {/* Rotating Testimonial */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">What customers say</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-600 mb-4 italic">"{TESTIMONIALS[activeTestimonial].text}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {TESTIMONIALS[activeTestimonial].name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{TESTIMONIALS[activeTestimonial].name}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                {/* Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-blue-600 w-6' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-800">Response Times</span>
                </div>
                <div className="space-y-2">
                  {[
                    { channel: 'Live Chat', time: 'Instant', color: 'bg-emerald-500' },
                    { channel: 'Phone', time: '< 1 min', color: 'bg-blue-500' },
                    { channel: 'Email', time: '< 2 hours', color: 'bg-violet-500' },
                  ].map((item) => (
                    <div key={item.channel} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 ${item.color} rounded-full`} />
                        <span className="text-slate-600">{item.channel}</span>
                      </div>
                      <span className="font-medium text-slate-800">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${formProgress()}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-12 text-center"
                    >
                      <motion.div
                        className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.4 }}
                        >
                          <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </motion.div>
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-2">Thank you for reaching out, {form.name.split(' ')[0] || 'friend'}!</p>
                      <p className="text-sm text-gray-500 mb-6">We typically respond within 2 hours.</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Send Another Message
                        </button>
                        <Link href="/faq" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                          View FAQs
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">Send Us a Message</h2>
                        <span className="text-xs text-gray-400">{Math.round(formProgress())}% complete</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'name' || form.name ? 'top-1 text-xs text-blue-600' : 'top-3.5 text-sm text-gray-400'}`}>Your Name *</label>
                          <input
                            type="text"
                            required
                            value={form.name}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={`w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border-2 transition-all ${focusedField === 'name' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} focus:outline-none`}
                          />
                        </div>
                        <div className="relative">
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'email' || form.email ? 'top-1 text-xs text-blue-600' : 'top-3.5 text-sm text-gray-400'}`}>Email Address *</label>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={`w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border-2 transition-all ${focusedField === 'email' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} focus:outline-none`}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'phone' || form.phone ? 'top-1 text-xs text-blue-600' : 'top-3.5 text-sm text-gray-400'}`}>Phone (Optional)</label>
                          <input
                            type="tel"
                            value={form.phone}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className={`w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border-2 transition-all ${focusedField === 'phone' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} focus:outline-none`}
                          />
                        </div>
                        <div className="relative">
                          <label className="absolute left-4 top-1 text-xs text-gray-500 pointer-events-none">Subject *</label>
                          <select
                            required
                            value={form.subject}
                            onFocus={() => setFocusedField('subject')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className={`w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border-2 transition-all ${focusedField === 'subject' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} focus:outline-none text-gray-700`}
                          >
                            <option value="">Select a topic</option>
                            <option value="booking">✈️ Booking Inquiry</option>
                            <option value="support">🛠️ Technical Support</option>
                            <option value="refund">💳 Refund Request</option>
                            <option value="change">📅 Change/Cancel Booking</option>
                            <option value="partnership">🤝 Partnership</option>
                            <option value="feedback">⭐ Feedback</option>
                            <option value="other">💬 Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="relative">
                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'message' || form.message ? 'top-1 text-xs text-blue-600' : 'top-3.5 text-sm text-gray-400'}`}>Your Message *</label>
                        <textarea
                          rows={4}
                          required
                          value={form.message}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className={`w-full px-4 pt-6 pb-2 rounded-xl bg-gray-50 border-2 transition-all resize-none ${focusedField === 'message' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} focus:outline-none`}
                        />
                        <span className="absolute right-3 bottom-2 text-xs text-gray-400">{form.message.length}/500</span>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: loading ? 1 : 0.99 }}
                      >
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending your message...
                          </span>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>

                      <p className="text-center text-xs text-gray-400">
                        By submitting, you agree to our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Access */}
      <section className="py-10 md:py-14 px-4">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Quick Answers</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Common Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { q: 'How do I cancel my booking?', icon: '❌' },
              { q: 'Where is my confirmation email?', icon: '📧' },
              { q: 'Can I change my flight date?', icon: '📅' },
              { q: 'How long do refunds take?', icon: '💰' },
              { q: 'Is travel insurance included?', icon: '🛡️' },
              { q: 'How do I add baggage?', icon: '🧳' },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
                whileHover={{ x: 4 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-2xl">{faq.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors flex-1">{faq.q}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/faq" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View all FAQs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Alternative Contact CTA */}
      <section className="py-10 md:py-14 px-4 pb-20">
        <motion.div
          className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
              <p className="text-slate-400">Our team is available around the clock to assist you.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.a
                href="tel:+13322200838"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-xl text-slate-900 font-semibold hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5 text-blue-600" />
                +1 (332) 220-0838
              </motion.a>
              <motion.a
                href="tel:+13153061646"
                className="inline-flex items-center gap-2 px-5 py-3 bg-slate-700 rounded-xl text-white font-semibold hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5" />
                +1 (315) 306-1646
              </motion.a>
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>4.9/5 Customer Rating</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
