'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { DollarSign, Download, TrendingUp, Calendar, AlertCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function FinancesPage() {
  const [timeframe, setTimeframe] = useState<'ytd' | 'all'>('ytd');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadFinances() {
      try {
        const res = await fetch('/api/host/finances');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load finances:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinances();
  }, []);

  const handleExport = () => {
    alert("Downloading CSV report for tax filing...");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;
  }

  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
        <MaxWidthContainer>
            {/* Header */}
            <header className="mb-12 mt-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                       <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Wealth Portfolio</span>
                </div>
                <h1 className="text-4xl font-black text-midnight-navy mb-3 tracking-tighter">Wealth Management</h1>
                <p className="text-neutral-500 max-w-2xl font-medium leading-relaxed">
                    Ultra-premium property management analytics. Gain deep insights into your portfolio's financial health and optimize for maximum yield.
                </p>
            </header>
                <div className="flex items-center gap-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-neutral-100 text-neutral-700 text-xs font-black shadow-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="ytd">Year to Date (2026)</option>
                        <option value="all">All Time</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-midnight-navy hover:scale-105 active:scale-95 text-white text-xs font-black shadow-soft transition-all">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all group">
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-7 h-7" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Net Earnings (YTD)</p>
                        <h2 className="text-5xl font-black text-midnight-navy tracking-tighter">${data?.netYTD?.toLocaleString() || '0'}</h2>
                    </div>
                </div>

                <div className="bg-[#1B243B] rounded-[2.5rem] p-10 shadow-soft-lg flex flex-col justify-between hover:-translate-y-1 transition-all group text-white">
                    <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 text-secondary-400 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            <Calendar className="w-7 h-7" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Upcoming Payouts</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">${data?.upcomingPayouts?.toLocaleString() || '0'}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#102A3E] border border-[#163B54] text-[#2DD4BF] text-[10px] font-black uppercase tracking-widest mt-6 rounded-full">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                           Booked & Confirmed
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all group">
                    <div className="flex items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Platform Fees & Taxes</p>
                        <h2 className="text-5xl font-black text-midnight-navy tracking-tighter">${data?.platformFees?.toLocaleString() || '0'}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-midnight-navy">Revenue Analysis</h3>
                        <p className="text-sm text-neutral-500">Gross vs Net earnings per month</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.monthlyData || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', padding: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                                <Bar dataKey="gross" name="Gross Revenue" fill="#CBD5E1" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="net" name="Net Earnings" fill="#E74035" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* YoY Pacing */}
                <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-midnight-navy">YoY Pacing</h3>
                        <p className="text-sm text-neutral-500">Current month vs last year</p>
                    </div>
                    <div className="flex-1 min-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.pacingData || []} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Line type="monotone" dataKey={lastYear} stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey={currentYear} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pacing Status</span>
                            <span className={data?.pacingStatus === 'Ahead' ? "text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl" : "text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl"}>
                                {data?.pacingStatus === 'Ahead' ? 'Ahead' : 'Adjust Needed'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
            {/* Revenue Projection & Portfolio Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Revenue Projection</p>
                           <h3 className="text-2xl font-black text-midnight-navy">12-Month Predictive</h3>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-emerald-600 uppercase tracking-tighter font-mono">$124,500</p>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+18% YOY</p>
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-2 px-2">
                        {[40, 65, 45, 90, 75, 55, 80, 70, 95, 85, 60, 75].map((h, i) => (
                           <div key={i} className="flex-1 bg-neutral-50 rounded-t-lg relative group transition-all hover:bg-neutral-100">
                              <div 
                                style={{ height: `${h}%` }} 
                                className="absolute bottom-0 left-0 right-0 bg-primary-500/10 group-hover:bg-primary-500/30 rounded-t-lg transition-all"
                              />
                           </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-primary-500/10 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                           <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
                           AI Concierge Insights
                        </div>
                        <h4 className="text-2xl font-black text-midnight-navy mb-4 tracking-tight">Tax Optimization Strategy</h4>
                        <p className="text-sm text-neutral-500 font-medium mb-8 leading-relaxed max-w-sm">
                           You haven't logged any maintenance expenses for the Knightsbridge property this quarter.
                           <br /><br />
                           <span className="text-midnight-navy font-bold">Pro Tip:</span> Expense your recent HVAC repair as a capital improvement to lower your 2026 liability.
                        </p>
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] flex items-center gap-2 group/btn">
                           Explore Tax Center 
                           <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </MaxWidthContainer>
    </div>
  );
}
