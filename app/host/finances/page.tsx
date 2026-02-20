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
    return <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
        <MaxWidthContainer>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-black text-gray-900 mb-2">Financials & Taxes</h1>
                     <p className="text-gray-500 text-sm">Track your earnings, pacing, and export reports for tax season.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-gray-700 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="ytd">Year to Date (2026)</option>
                        <option value="all">All Time</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold transition-colors">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Net Earnings (YTD)</p>
                        <h2 className="text-3xl font-black text-gray-900">${data?.netYTD?.toLocaleString() || '0'}</h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Upcoming Payouts</p>
                        <h2 className="text-3xl font-black text-gray-900">${data?.upcomingPayouts?.toLocaleString() || '0'}</h2>
                        <p className="text-xs text-gray-400 mt-2">Booked & Confirmed</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Platform Fees & Taxes</p>
                        <h2 className="text-3xl font-black text-gray-900">${data?.platformFees?.toLocaleString() || '0'}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
                        <p className="text-sm text-gray-500">Gross vs Net earnings per month</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.monthlyData || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip 
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                <Bar dataKey="gross" name="Gross Revenue" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="net" name="Net Earnings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* YoY Pacing */}
                <div className="bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">YoY Pacing</h3>
                        <p className="text-sm text-gray-500">Current month vs last year</p>
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
                            <span className="text-sm font-medium text-gray-600">Pacing Status</span>
                            <span className={data?.pacingStatus === 'Ahead' ? "text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full" : "text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full"}>
                                {data?.pacingStatus === 'Ahead' ? 'Ahead of Last Year' : 'Behind Last Year'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </MaxWidthContainer>
    </div>
  );
}
