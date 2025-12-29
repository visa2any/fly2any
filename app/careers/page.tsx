'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Zap,
  Globe,
  Users,
  Plane,
  Coffee,
  Laptop,
  Shield,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world' },
  { icon: Plane, title: 'Travel Perks', desc: 'Free flights & hotel credits annually' },
  { icon: Heart, title: 'Full Benefits', desc: 'Health, dental, vision & 401k' },
  { icon: Coffee, title: 'Unlimited PTO', desc: 'Take time when you need it' },
  { icon: Laptop, title: 'Equipment', desc: '$3,000 setup budget' },
  { icon: TrendingUp, title: 'Growth', desc: 'Learning & development stipend' },
];

const OPEN_POSITIONS = [
  { title: 'Senior Full-Stack Engineer', dept: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$150K-$200K' },
  { title: 'Product Designer', dept: 'Design', location: 'Remote', type: 'Full-time', salary: '$120K-$160K' },
  { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time', salary: '$100K-$140K' },
  { title: 'Customer Success Lead', dept: 'Support', location: 'Remote', type: 'Full-time', salary: '$80K-$110K' },
  { title: 'Data Scientist', dept: 'Engineering', location: 'Remote', type: 'Full-time', salary: '$140K-$180K' },
  { title: 'Content Strategist', dept: 'Marketing', location: 'Remote', type: 'Contract', salary: '$70K-$90K' },
];

const VALUES = [
  { emoji: '🚀', title: 'Move Fast', desc: 'Ship early, iterate often' },
  { emoji: '🌍', title: 'Think Global', desc: 'Build for travelers worldwide' },
  { emoji: '💡', title: 'Stay Curious', desc: 'Always learn, always grow' },
  { emoji: '🤝', title: 'Win Together', desc: 'Collaboration over competition' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero */}
      <section className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" /> We&apos;re Hiring
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Build the Future of
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Travel Technology
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Join our remote-first team and help millions of travelers discover the world. Great pay, amazing perks, meaningful work.
            </p>
            <a href="#positions" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity">
              View Open Positions <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '50+', label: 'Team Members' },
              { value: '15+', label: 'Countries' },
              { value: '10M+', label: 'Users Served' },
              { value: '4.9★', label: 'Glassdoor' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why You&apos;ll Love It Here</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">We believe in taking care of our people so they can do their best work.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
                <b.icon className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-semibold text-lg mb-1">{b.title}</h3>
                <p className="text-sm text-gray-400">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6">
                <span className="text-4xl md:text-5xl block mb-4">{v.emoji}</span>
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-gray-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Open Positions</h2>
          <p className="text-gray-400 text-center mb-12">Find your next adventure with us</p>
          <div className="space-y-4">
            {OPEN_POSITIONS.map((job, i) => (
              <motion.div key={job.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.dept}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 font-semibold">{job.salary}</span>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Don&apos;t See Your Role?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">We&apos;re always looking for talented people. Send us your resume and we&apos;ll reach out when something opens up.</p>
            <a href="mailto:careers@fly2any.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-colors">
              Send Your Resume <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
