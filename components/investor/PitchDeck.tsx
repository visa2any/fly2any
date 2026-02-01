'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, Shield, Globe, Cpu, Users, Zap, Target, DollarSign } from 'lucide-react';

interface SlideProps {
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
}

const slides = [
  {
    id: 'intro',
    title: 'FLY2ANY',
    subtitle: 'The First AI-Native Travel OS',
    content: (
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="p-6 bg-blue-600 rounded-full bg-opacity-10 animate-pulse">
          <Globe className="w-24 h-24 text-blue-600" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-slate-900">
          FLY<span className="text-blue-600">2</span>ANY
        </h1>
        <p className="text-2xl text-slate-600 max-w-2xl">
          Revolutionizing the $1T Travel Market with Proactive Autonomous Agents
        </p>
        <div className="mt-8 text-sm font-semibold tracking-widest text-slate-400 uppercase">
          Strictly Confidential • Series Seed
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-white to-blue-50'
  },
  {
    id: 'problem',
    title: 'The Problem',
    subtitle: 'The Travel Experience is Broken',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-slate-800">Fragmentation & Friction</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-white bg-red-500 rounded-full shrink-0">1</span>
              <p className="text-lg text-slate-600"><strong>15+ Tabs Open:</strong> Users struggle to align flights, hotels, and logistics manually.</p>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-white bg-red-500 rounded-full shrink-0">2</span>
              <p className="text-lg text-slate-600"><strong>Dumb Chatbots:</strong> Current "AI" supports are just glorified FAQs with zero autonomy.</p>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-8 h-8 mr-4 text-white bg-red-500 rounded-full shrink-0">3</span>
              <p className="text-lg text-slate-600"><strong>Zero Personalization:</strong> A business traveler gets the same results as a backpacker.</p>
            </li>
          </ul>
        </div>
        <div className="relative h-64 md:h-auto bg-slate-100 rounded-2xl p-8 flex items-center justify-center border-2 border-dashed border-slate-300">
           <div className="text-center space-y-2">
             <div className="text-5xl font-bold text-slate-300">85%</div>
             <div className="text-xl text-slate-400">Cart Abandonment Rate</div>
           </div>
        </div>
      </div>
    ),
    bg: 'bg-white'
  },
  {
    id: 'solution',
    title: 'The Solution',
    subtitle: 'AI-Assisted Travel Platform',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Users className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Emotional Intelligence</h3>
          <p className="text-slate-600">Detects anxiety vs. excitement. Adapts tone and suggestions proactively (e.g., flight delay reassurance).</p>
        </div>
        <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Zap className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">End-to-End Unification</h3>
          <p className="text-slate-600">Flights, Hotels, Cars, Insurance in one transaction. Auto-conflict resolution.</p>
        </div>
        <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <DollarSign className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Conversational Commerce</h3>
          <p className="text-slate-600">Not just chat. A sales terminal that can freeze prices, split payments, and issue tickets.</p>
        </div>
      </div>
    ),
    bg: 'bg-white'
  },
  {
    id: 'tech',
    title: 'Technology & Moat',
    subtitle: 'Why We Are Defensible',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl">
        <div className="space-y-8">
           <div className="flex items-start gap-4">
             <div className="p-3 bg-slate-100 rounded-lg"><Cpu className="w-6 h-6 text-slate-700"/></div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Hybrid Intelligence Arch</h3>
               <p className="text-slate-600">Next.js 14 Serverless Frontend + Python ML Backend. &lt;3s global load time.</p>
             </div>
           </div>
           <div className="flex items-start gap-4">
             <div className="p-3 bg-slate-100 rounded-lg"><Shield className="w-6 h-6 text-slate-700"/></div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Governance Guardrails</h3>
               <p className="text-slate-600">Verified facts only. No AI hallucinations on prices or availability.</p>
             </div>
           </div>
           <div className="flex items-start gap-4">
             <div className="p-3 bg-slate-100 rounded-lg"><TrendingUp className="w-6 h-6 text-slate-700"/></div>
             <div>
               <h3 className="text-xl font-bold text-slate-900">Proprietary ML Prediction</h3>
               <p className="text-slate-600">90% API cost reduction via smart caching and route demand prediction.</p>
             </div>
           </div>
        </div>
        <div className="bg-slate-900 text-white p-8 rounded-2xl font-mono text-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <Cpu size={120} />
          </div>
          <p className="text-green-400 mb-4">// Core Architecture</p>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-slate-700 pb-2">
               <span>Frontend</span>
               <span className="text-slate-400">Next.js / React Server Components</span>
            </div>
             <div className="flex justify-between border-b border-slate-700 pb-2">
               <span>AI Brain</span>
               <span className="text-slate-400">Llama 70B (Groq) + GPT-4o Wrapper</span>
            </div>
             <div className="flex justify-between border-b border-slate-700 pb-2">
               <span>Data Layer</span>
               <span className="text-slate-400">PostgreSQL + Redis (Smart Cache)</span>
            </div>
             <div className="flex justify-between border-b border-slate-700 pb-2">
               <span>Integrations</span>
               <span className="text-slate-400">Amadeus, Duffel, Stripe, LiteAPI</span>
            </div>
          </div>
        </div>
      </div>
    ),
    bg: 'bg-slate-50'
  },
  {
    id: 'business',
    title: 'Business Model',
    subtitle: 'Diversified Revenue Streams',
    content: (
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-2">Core</h3>
              <div className="text-3xl font-black text-slate-900 mb-1">Commissions</div>
              <p className="text-sm text-slate-500">Flights (3-5%), Hotels (10-15%), Cars (15%)</p>
           </div>
           <div className="bg-blue-600 p-6 rounded-xl shadow-lg shadow-blue-200 text-center transform scale-110 z-10">
              <h3 className="text-lg font-bold text-blue-200 uppercase tracking-widest mb-2">Growth</h3>
              <div className="text-3xl font-black text-white mb-1">Ancillaries</div>
              <p className="text-sm text-blue-100">Price Freeze ($15), Drop Guarantee, Seat Markup</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-2">Scale</h3>
              <div className="text-3xl font-black text-slate-900 mb-1">B2B / API</div>
              <p className="text-sm text-slate-500">Credit Card Affiliate & Agent Copilot</p>
           </div>
        </div>
        <div className="text-center">
            <p className="text-2xl font-medium text-slate-700">Projected Gross Margins: <span className="text-green-600 font-bold">&gt; 60%</span> at Scale</p>
        </div>
      </div>
    ),
    bg: 'bg-white'
  },
  {
    id: 'market',
    title: 'Market Opportunity',
    subtitle: 'Serving the Underserved',
    content: (
      <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-6xl">
         <div className="flex-1 space-y-6">
            <div className="space-y-2">
               <h3 className="text-5xl font-black text-slate-900">$1 Trillion</h3>
               <p className="text-xl text-slate-500">Global Online Travel Market (2030)</p>
            </div>
             <div className="space-y-2">
               <h3 className="text-5xl font-black text-blue-600">$300 Billion</h3>
               <p className="text-xl text-slate-500">Serviceable Addressable Market (US/EU/LATAM)</p>
            </div>
             <div className="space-y-2">
               <h3 className="text-5xl font-black text-emerald-500">$3 Billion</h3>
               <p className="text-xl text-slate-500">Initial Target: Budget Millennial/GenZ</p>
            </div>
         </div>
         <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-lg mb-4 text-slate-800">Why Budget GenZ/Millennials?</h4>
            <ul className="space-y-4 text-slate-600">
               <li className="flex items-center gap-3"><Target className="w-5 h-5 text-blue-500"/> High volume, low service expectation initially</li>
               <li className="flex items-center gap-3"><Target className="w-5 h-5 text-blue-500"/> Early adopters of AI behavior</li>
               <li className="flex items-center gap-3"><Target className="w-5 h-5 text-blue-500"/> Ignored by premium-focused OTAs</li>
            </ul>
         </div>
      </div>
    ),
    bg: 'bg-slate-50'
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(c => c + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  return (
    <div className="w-full h-screen overflow-hidden relative font-sans text-slate-900 bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`w-full h-full flex flex-col items-center justify-center p-12 md:p-24 ${slides[currentSlide].bg}`}
        >
          <div className="absolute top-8 left-8 flex items-center gap-2 opacity-50">
             <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
             <span className="font-bold tracking-tight">FLY2ANY</span>
          </div>

          <div className="absolute top-8 right-8 text-sm font-medium opacity-40">
            {currentSlide + 1} / {slides.length}
          </div>

          <div className="flex flex-col items-center w-full h-full justify-center">
            {slides[currentSlide].id !== 'intro' && (
               <div className="mb-12 text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">{slides[currentSlide].title}</h2>
                  <div className="text-xl text-blue-600 font-medium uppercase tracking-widest">{slides[currentSlide].subtitle}</div>
               </div>
            )}
            {slides[currentSlide].content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 flex gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 bg-white/10 hover:bg-black/5 rounded-full backdrop-blur-sm transition-all disabled:opacity-30 border border-black/10"
        >
          <ChevronLeft className="w-6 h-6 text-slate-900" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 bg-white/10 hover:bg-black/5 rounded-full backdrop-blur-sm transition-all disabled:opacity-30 border border-black/10"
        >
          <ChevronRight className="w-6 h-6 text-slate-900" />
        </button>
      </div>
    </div>
  );
}
