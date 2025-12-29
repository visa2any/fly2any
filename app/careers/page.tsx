'use client';

import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Heart, Globe, Users, Plane, Coffee, Laptop, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';

const BENEFITS = [
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere', color: 'bg-blue-100 text-blue-600' },
  { icon: Plane, title: 'Travel Perks', desc: 'Free flights & credits', color: 'bg-rose-100 text-rose-600' },
  { icon: Heart, title: 'Full Benefits', desc: 'Health, dental, 401k', color: 'bg-pink-100 text-pink-600' },
  { icon: Coffee, title: 'Unlimited PTO', desc: 'Take time when needed', color: 'bg-amber-100 text-amber-600' },
  { icon: Laptop, title: 'Equipment', desc: '$3,000 setup budget', color: 'bg-purple-100 text-purple-600' },
  { icon: TrendingUp, title: 'Growth', desc: 'Learning stipend', color: 'bg-green-100 text-green-600' },
];

const JOBS = [
  { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$150K-$200K' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time', salary: '$120K-$160K' },
  { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', salary: '$100K-$140K' },
  { title: 'Customer Success Lead', dept: 'Support', location: 'Remote', type: 'Full-time', salary: '$80K-$110K' },
  { title: 'Data Scientist', dept: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$140K-$180K' },
];

const VALUES = [
  { emoji: '🚀', title: 'Move Fast', desc: 'Ship early, iterate often' },
  { emoji: '🌍', title: 'Think Global', desc: 'Build for travelers worldwide' },
  { emoji: '💡', title: 'Stay Curious', desc: 'Always learn, always grow' },
  { emoji: '🤝', title: 'Win Together', desc: 'Collaboration over competition' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> We&apos;re Hiring
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Build the Future of
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Travel Technology</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join our remote-first team and help millions discover the world.
            </p>
            <a href="#positions" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
              View Open Positions <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-white/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50+', label: 'Team Members' },
            { value: '15+', label: 'Countries' },
            { value: '10M+', label: 'Users Served' },
            { value: '4.9★', label: 'Glassdoor' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">Why You&apos;ll Love It Here</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Amazing perks designed for modern professionals</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <b.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <span className="text-4xl block mb-4">{v.emoji}</span>
                <h3 className="font-semibold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-white/70">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Open Positions</h2>
          <div className="space-y-4">
            {JOBS.map((job, i) => (
              <motion.div key={job.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-5 md:p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.dept}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 font-semibold">{job.salary}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Don&apos;t See Your Role?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">We&apos;re always looking for talented people.</p>
            <a href="mailto:careers@fly2any.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
              Send Your Resume <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
