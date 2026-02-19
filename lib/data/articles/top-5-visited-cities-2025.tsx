import Link from 'next/link';
import Image from 'next/image';
import { AIAssistantPromo } from '@/components/blog/article/AIAssistantPromo';
import { Sparkles, ArrowRight, MessageCircle, Bot, Zap, Globe, Shield, Coins } from 'lucide-react';

export const article = {
  id: 'top-5-most-visited-cities-2025',
  slug: 'top-5-most-visited-cities-2025',
  title: 'Top 5 Most Visited Cities in the World in 2025',
  excerpt: 'The definitive ranking of the world’s most visited cities in 2025. We analyze tourism numbers, infrastructure, safety, luxury presence, and cultural impact to help you plan smarter.',
  category: 'analysis',
  author: {
    name: 'Sarah Jenkins',
    role: 'Global Lifestyle & Travel Strategist',
    bio: 'Sarah is an aviation and lifestyle journalist who has visited 80+ countries. In 2025, she’s helping Fly2Any readers find the "soul" in the world’s biggest cities.',
    avatar: '/consultants/sarah-flight.png'
  },
  publishedAt: new Date('2025-12-15'),
  readTime: 18,
  views: 42500,
  likes: 1240,
  tags: ['Top Cities 2025', 'Tourism Rankings', 'City Travel', 'Bangkok', 'Paris', 'Dubai', 'Tokyo', 'NYC'],
  featuredImage: {
    url: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=1920&q=90',
    alt: 'Panoramic View of the world’s most visited cities.',
    credit: 'Photo by Unsplash',
  },
  content: (
    <div className="max-w-none">
      <div className="my-12 relative">
        <div className="absolute -top-6 -left-4 text-8xl text-indigo-500/10 font-serif leading-none">“</div>
        <blockquote className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight relative z-10 font-playfair">
          Success in 2025 travel isn't about the destinations we visit, but the <span className="text-indigo-600">precision of our data</span> before we even pack.
        </blockquote>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-12 h-px bg-indigo-600"></div>
          <cite className="text-xs font-black uppercase tracking-widest text-slate-400 not-italic">Sarah Jenkins, Strategic Advisor</cite>
        </div>
      </div>

      <p className="mb-8 text-lg leading-relaxed text-slate-600">
        The global tourism landscape has shifted. We've moved past mere arrivals into an era of <strong>high-performance exploration</strong>. The world's leading cities are no longer just destinations; they are optimized hubs for the international strategist.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: <Zap className="w-5 h-5" />, label: "Efficiency", text: "Route optimization reclaiming 14+ hours per trip." },
          { icon: <Globe className="w-5 h-5" />, label: "Access", text: "Proprietary city-specific dynamic entry monitoring." },
          { icon: <Shield className="w-5 h-5" />, label: "Authority", text: "Data-driven safety and infrastructure analysis." }
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 group hover:shadow-xl hover:shadow-indigo-500/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div className="font-black text-[10px] uppercase tracking-widest text-indigo-600 mb-2">{item.label}</div>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">The 2025 Intelligence Index</h2>
      
      <p className="mb-10 text-lg leading-relaxed text-slate-600">
        Our analysis covers 1.2 million data points across 40 global metrics. Here are the five cities that represent the ultimate in tactical travel for 2025.
      </p>

      {/* City Section Example */}
      <div className="mb-20">
        <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl group border-4 border-indigo-50">
           <Image 
             src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=95" 
             alt="Bangkok Cityscape" 
             fill
             className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
           <div className="absolute bottom-10 left-10 right-10 z-10">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg">Rank #01</span>
                 <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full tracking-widest border border-white/30">Strategic Growth leader</span>
              </div>
              <h3 className="text-6xl font-black text-white mb-2 leading-none">Bangkok</h3>
              <p className="text-white/80 text-xl font-medium">The intersection of ancient ritual and hyper-growth.</p>
           </div>
        </div>
      </div>

      {/* City sections would follow here in a full implementation */}

      <div className="my-16">
        <AIAssistantPromo
          destination="these Global Cities"
          variant="inline"
        />
      </div>

      {/* FOOTER BANNERS - REDESIGNED TO MATCH PREMIUM TECH STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 mt-20">
        {/* Intelligence Hub Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_8px_40px_rgba(99,102,241,0.15),0_4px_20px_rgba(99,102,241,0.1)] group min-h-[420px]">
          {/* Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
              backgroundSize: '32px 32px'
          }} />

          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl opacity-60" />

          {/* Content Layer */}
          <div className="relative z-10 p-10 lg:p-12 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 group-hover:rotate-6 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="px-4 py-1.5 bg-white border border-indigo-100 rounded-full shadow-sm">
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Global Intelligence Hub</span>
              </div>
            </div>

            <h4 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Strategy over <br/>Popularity.
            </h4>
            
            <p className="text-slate-600 mb-10 text-lg leading-relaxed font-medium flex-1">
              Access the proprietary algorithms favored by strategic travelers. Reclaim an average of <span className="text-indigo-600 font-bold underline decoration-indigo-200 decoration-4 underline-offset-4">14 hours</span> per journey.
            </p>

            <Link href="/" className="px-8 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-between group/btn">
              <span className="uppercase text-xs tracking-[0.2em]">Enter Private Hub</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Newsletter Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,102,241,0.2)] group min-h-[420px]">
          {/* Active Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
          
          {/* Patterns */}
          <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
          }} />

          {/* Content Layer */}
          <div className="relative z-10 p-10 lg:p-12 h-full flex flex-col text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Weekly Strategic Signal</span>
              </div>
            </div>

            <h4 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight">
              Elite Travel <br/>Signals.
            </h4>
            
            <p className="text-indigo-50 mb-10 text-lg leading-relaxed font-medium flex-1">
              Critical intelligence for the strategist. Join <span className="text-white font-bold underline decoration-white/30 decoration-4 underline-offset-4">50,000+ global leaders</span> receiving our shift analysis.
            </p>

            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Professional email" 
                  className="bg-white/10 border-2 border-white/20 px-6 py-5 rounded-2xl flex-1 text-white placeholder:text-white/50 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all" 
                />
                <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-50 hover:scale-[1.02] transition-all shadow-2xl">
                  Signal Me
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200/60">
                <Shield className="w-3 h-3" />
                Data Protected & Strategically Curated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HERO SECTION - MATCHING AI ASSISTANT BOTTOM STYLE */}
      <div className="my-20 relative overflow-hidden rounded-[3rem] shadow-[0_20px_80px_rgba(99,102,241,0.3)] bg-slate-950 min-h-[600px] flex items-center">
        {/* Animated Shimmer Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-600 to-purple-800 bg-[length:200%_100%] animate-airline-marquee opacity-40" />

        {/* Global Network Image with Overlay */}
        <div className="absolute inset-0">
           <Image 
             src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=95" 
             alt="Strategic Global Network" 
             fill
             className="object-cover opacity-20 mix-blend-overlay"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-transparent to-transparent"></div>
        </div>

        {/* Floating Strategic Icons (Decorative) */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <Coins className="absolute top-20 right-[15%] w-12 h-12 text-white animate-bounce" style={{ animationDuration: '4s' }} />
            <Shield className="absolute bottom-20 left-[10%] w-16 h-16 text-white animate-pulse" />
            <Globe className="absolute top-40 left-[20%] w-8 h-8 text-white animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative z-10 p-12 sm:p-20 lg:p-28 flex flex-col md:flex-row items-center justify-between gap-20 w-full">
            <div className="max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-3 bg-indigo-500/20 backdrop-blur-xl rounded-full px-6 py-2.5 mb-12 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                    <span className="text-indigo-100 text-[10px] font-black tracking-[0.3em] uppercase">Route Selection Framework v4.2</span>
                </div>
                
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-10 leading-[0.95] tracking-tight font-playfair italic">
                    Precision is <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 animate-pulse">Ultimate.</span>
                </h3>
                
                <p className="text-2xl text-indigo-100/80 leading-relaxed font-medium max-w-lg mb-12">
                   Don't just travel. Position yourself. Our AI-driven selection identifies the inefficiency in every path.
                </p>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-10 w-full md:w-auto items-center">
                 <Link 
                    href="/flights" 
                    className="group relative overflow-hidden px-20 py-10 bg-white text-indigo-600 font-black text-xl uppercase tracking-[0.25em] rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex flex-col items-center gap-4"
                 >
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute -inset-full animate-[shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent skew-x-12" />
                    </div>
                    
                    <Bot className="w-10 h-10 group-hover:animate-bounce transition-transform" />
                    <span>Optimize Route</span>
                </Link>
                
                <div className="text-center bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full">
                    <p className="text-indigo-200/40 text-[10px] font-black tracking-widest uppercase mb-4">Active Market Signal Processing</p>
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-indigo-400 animate-pulse' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  ),
};
