'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  Globe,
  Headphones,
  Building,
  ChevronRight,
} from 'lucide-react';

const CONTACT_METHODS = [
  { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our team instantly', value: 'Available 24/7', color: 'from-green-500 to-emerald-500', action: '#' },
  { icon: Phone, title: 'Phone', desc: 'Speak with a travel expert', value: '+1 (305) 797-1087', color: 'from-blue-500 to-cyan-500', action: 'tel:+13057971087' },
  { icon: Mail, title: 'Email', desc: 'We respond within 2 hours', value: 'support@fly2any.com', color: 'from-purple-500 to-pink-500', action: 'mailto:support@fly2any.com' },
  { icon: MessageCircle, title: 'WhatsApp', desc: 'Message us anytime', value: '+1 (305) 797-1087', color: 'from-green-500 to-lime-500', action: 'https://wa.me/13057971087' },
];

const OFFICES = [
  { city: 'Miami', country: 'USA', address: '1000 Brickell Ave, Suite 500', timezone: 'EST (UTC-5)' },
  { city: 'London', country: 'UK', address: '100 Liverpool St, EC2M 2RH', timezone: 'GMT (UTC+0)' },
  { city: 'Dubai', country: 'UAE', address: 'DIFC, Gate Village 4', timezone: 'GST (UTC+4)' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Headphones className="w-4 h-4" /> 24/7 Support
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get in
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Touch</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Have questions? Our team is here to help you plan the perfect trip.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CONTACT_METHODS.map((method, i) => (
              <motion.a key={method.title} href={method.action} target={method.action.startsWith('http') ? '_blank' : undefined}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-3`}>
                  <method.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{method.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{method.desc}</p>
                <p className="text-sm text-gray-300">{method.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Info */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-gray-400">We&apos;ll get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none" />
                  <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none" />
                </div>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none">
                  <option value="">Select Subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="refund">Refund Request</option>
                  <option value="partnership">Business Partnership</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Your Message" rows={5} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none resize-none" />
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* Offices */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Offices</h2>
            <div className="space-y-4">
              {OFFICES.map((office) => (
                <div key={office.city} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{office.city}, {office.country}</h3>
                      <p className="text-sm text-gray-400 mt-1">{office.address}</p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{office.timezone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Response Time */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Response Times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Live Chat</span><span className="text-green-400">Instant</span></div>
                <div className="flex justify-between"><span className="text-gray-400">WhatsApp</span><span className="text-green-400">&lt; 5 min</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-blue-400">&lt; 2 hours</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-green-400">No wait</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
