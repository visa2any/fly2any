'use client';

import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { 
  ShieldCheck, 
  Fingerprint, 
  Globe, 
  Award, 
  BadgeCheck, 
  Activity,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrustCenterPage() {
  const activity = [
    { type: 'login', text: 'Biometric Login Successful', status: 'Authenticated • London, UK', time: '2m ago' },
    { type: 'verify', text: 'Identity Re-verified', status: 'Automated Ledger Check', time: '1h ago' },
    { type: 'device', text: 'New Device Pairing', status: 'iPhone 15 Pro • Pending MFA', time: '4h ago' },
    { type: 'policy', text: 'Policy Update Synced', status: 'Global Coverage v2.4', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-24">
      <MaxWidthContainer>
        <header className="mb-12 mt-4 px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-50 p-2 rounded-xl border border-primary-100">
               <ShieldCheck className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">Protocol Security</span>
          </div>
          <h1 className="text-4xl font-black text-midnight-navy mb-3 tracking-tighter">Trust & Protocol Center</h1>
          <p className="text-neutral-500 max-w-2xl font-medium leading-relaxed">
            Maintain your ultra-premium reputation across the global short-term rental ecosystem. 
            Your score dictates platform priority and insurance premium reductions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
          {/* Main Content: Sovereign Credentials */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Biometric ID */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-neutral-100 group hover:shadow-soft-lg transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 mb-8 group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-midnight-navy mb-2">Biometric ID</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-6">
                  Secured biometric hash anchored to sovereign identity ledger.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Active
                </div>
              </motion.div>

              {/* Global History */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-neutral-100 group hover:shadow-soft-lg transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-8 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-midnight-navy mb-2">Global History</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-6">
                  Multijurisdictional background screening via Fly2Any API.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clean Record
                </div>
              </motion.div>
            </div>

            {/* Elite Host Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1B243B] rounded-[2.5rem] p-12 text-white shadow-soft-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10">
                  <BadgeCheck className="w-4 h-4 text-primary-400" />
                  Elite Host Tier
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter">You are in the top 1% of hosts.</h2>
                <p className="text-neutral-400 font-medium text-lg max-w-xl mb-8 leading-relaxed">
                  Priority resolution unlocked. Your sovereign reputation has earned you reduced platform fees and instant support access.
                </p>
                <button className="flex items-center gap-3 px-8 py-4 bg-primary-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                  View Privileges
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area: Activity & Trust */}
          <div className="lg:col-span-4 space-y-8">
            {/* Protocol Activity */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-soft">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-lg font-black text-midnight-navy tracking-tight">Protocol Activity</h3>
                </div>
                <Activity className="w-5 h-5 text-neutral-300" />
              </div>

              <div className="space-y-6">
                {activity.map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                    <div className="w-1 bg-neutral-100 rounded-full group-hover:bg-primary-500 transition-colors" />
                    <div>
                      <p className="text-sm font-black text-midnight-navy mb-0.5">{item.text}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.status}</p>
                      <p className="text-[10px] font-bold text-neutral-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Trust */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-soft">
               <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 mb-6">
                  <Lock className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-midnight-navy mb-2 tracking-tight">Financial Trust</h3>
               <p className="text-sm text-neutral-500 font-medium mb-6 leading-relaxed">
                  Open banking liquidity verification completed for Q3. Higher limits approved.
               </p>
               <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Liability Policy</p>
                    <p className="text-sm font-black text-midnight-navy">$5M Policy Active</p>
                  </div>
                  <Smartphone className="w-5 h-5 text-neutral-300" />
               </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
