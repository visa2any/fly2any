'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { DollarSign, Download, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-black text-midnight-navy mb-2">Financials & Taxes</h1>
                     <p className="text-neutral-500 text-sm">Track your earnings, pacing, and export reports for tax season.</p>
                </div>
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
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Net Earnings (YTD)</p>
                        <h2 className="text-4xl font-black text-midnight-navy tracking-tight">${data?.netYTD?.toLocaleString() || '0'}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center border border-secondary-100">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Upcoming Payouts</p>
                        <h2 className="text-4xl font-black text-midnight-navy tracking-tight">${data?.upcomingPayouts?.toLocaleString() || '0'}</h2>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-50 text-secondary-700 rounded-lg text-[10px] font-black uppercase tracking-wide mt-3">
                           Booked & Confirmed
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all">
                    <div className="flex items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Platform Fees & Taxes</p>
                        <h2 className="text-4xl font-black text-midnight-navy tracking-tight">${data?.platformFees?.toLocaleString() || '0'}</h2>
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

        </MaxWidthContainer>
    </div>
  );
}
