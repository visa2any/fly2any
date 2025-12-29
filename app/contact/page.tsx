'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle, Building, Headphones } from 'lucide-react';
import Link from 'next/link';

const METHODS = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Instant response', value: '24/7', color: 'bg-green-500', href: '#' },
  { icon: Phone, title: 'Phone', desc: 'Talk to expert', value: '+1 (305) 797-1087', color: 'bg-blue-500', href: 'tel:+13057971087' },
  { icon: Mail, title: 'Email', desc: '< 2 hour response', value: 'support@fly2any.com', color: 'bg-purple-500', href: 'mailto:support@fly2any.com' },
  { icon: MessageCircle, title: 'WhatsApp', desc: '< 5 min response', value: '+1 (305) 797-1087', color: 'bg-emerald-500', href: 'https://wa.me/13057971087' },
];

const OFFICES = [
  { city: 'Miami', country: 'USA', address: '1000 Brickell Ave, Suite 500', tz: 'EST' },
  { city: 'London', country: 'UK', address: '100 Liverpool St, EC2M 2RH', tz: 'GMT' },
  { city: 'Dubai', country: 'UAE', address: 'DIFC, Gate Village 4', tz: 'GST' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Headphones className="w-4 h-4" /> 24/7 Support
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our team is here to help you plan the perfect trip.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {METHODS.map((m, i) => (
            <motion.a key={m.title} href={m.href} target={m.href.startsWith('http') ? '_blank' : undefined}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="group p-5 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <m.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{m.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{m.desc}</p>
              <p className="text-sm text-gray-700 font-medium truncate">{m.value}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form & Offices */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send a Message</h2>
            {sent ? (
              <div className="p-8 rounded-2xl bg-green-50 border border-green-200 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We&apos;ll respond within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                  <input type="email" placeholder="Email Address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                </div>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-700">
                  <option value="">Select Subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="refund">Refund Request</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Your Message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none" />
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all disabled:opacity-50">
                  {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* Offices */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Offices</h2>
            <div className="space-y-4">
              {OFFICES.map((o) => (
                <div key={o.city} className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{o.city}, {o.country}</h3>
                      <p className="text-sm text-gray-500 mt-1">{o.address}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{o.tz}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-5 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Response Times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Live Chat</span><span className="text-green-600 font-medium">Instant</span></div>
                <div className="flex justify-between"><span className="text-gray-600">WhatsApp</span><span className="text-green-600 font-medium">&lt; 5 min</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="text-blue-600 font-medium">&lt; 2 hours</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
