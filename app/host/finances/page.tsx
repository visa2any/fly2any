'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  DollarSign, Download, TrendingUp, Calendar, AlertCircle, Loader2,
  Sparkles, ArrowRight, Plus, Trash2, Receipt, Brain, X,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// ───────── Expense Types ─────────
interface Expense {
  id: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
}

const EXPENSE_CATEGORIES = [
  'Cleaning', 'Maintenance', 'Utilities', 'Repairs', 'Supplies',
  'Insurance', 'Mortgage', 'Property Tax', 'Marketing', 'Other',
];

const STORAGE_KEY = 'host-expenses';

function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// ───────── Occupancy Forecasting ─────────
function computeForecasts(monthlyData: { name: string; gross: number; net: number }[], totalBookings: number, avgBookingValue: number) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonthIdx = now.getMonth();

  // Seasonal weight coefficients (travel industry standard)
  const seasonalWeights = [0.7, 0.65, 0.8, 0.85, 0.9, 1.0, 1.15, 1.1, 0.95, 0.85, 0.75, 1.05];

  // Calculate booking velocity (bookings per month so far this year)
  const elapsedMonths = Math.max(1, currentMonthIdx + (now.getDate() / 30));
  const bookingVelocity = totalBookings / elapsedMonths;

  // Get actual monthly revenue for trend detection
  const actualRevByMonth = monthlyData.reduce((acc, m) => {
    acc[m.name] = m.net;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average monthly revenue from months with data
  const monthsWithRevenue = monthlyData.filter(m => m.net > 0);
  const avgMonthlyRev = monthsWithRevenue.length > 0
    ? monthsWithRevenue.reduce((s, m) => s + m.net, 0) / monthsWithRevenue.length
    : avgBookingValue * bookingVelocity * 0.85;

  // Build 12-month forecast
  const forecast = monthNames.map((name, idx) => {
    const isActual = idx <= currentMonthIdx && (actualRevByMonth[name] || 0) > 0;
    const actualValue = actualRevByMonth[name] || 0;

    // For future months: use avg revenue * seasonal weight * trend factor
    const trendFactor = monthsWithRevenue.length >= 2
      ? 1 + ((monthsWithRevenue[monthsWithRevenue.length - 1]?.net || 0) - (monthsWithRevenue[0]?.net || 0)) / Math.max(1, (monthsWithRevenue[0]?.net || 1)) * 0.1
      : 1.0;

    const projected = Math.round(avgMonthlyRev * seasonalWeights[idx] * Math.min(1.3, Math.max(0.7, trendFactor)));

    return {
      name,
      actual: isActual ? actualValue : 0,
      projected: isActual ? 0 : projected,
      isActual,
    };
  });

  // Total projected annual revenue
  const projectedAnnual = forecast.reduce((s, f) => s + (f.isActual ? f.actual : f.projected), 0);

  // 30/60/90-day occupancy estimate based on booking velocity
  const daysInMonth = 30;
  const avgStayDays = 3.2; // industry average
  const occupancy30 = Math.min(95, Math.round((bookingVelocity * avgStayDays / daysInMonth) * 100));
  const occupancy60 = Math.min(90, Math.round(occupancy30 * 0.92));
  const occupancy90 = Math.min(85, Math.round(occupancy30 * 0.85));

  return { forecast, projectedAnnual, occupancy30, occupancy60, occupancy90 };
}

export default function FinancesPage() {
  const [timeframe, setTimeframe] = useState<'ytd' | 'all'>('ytd');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Expense tracking state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'USD',
    category: 'Cleaning',
    description: '',
  });

  useEffect(() => {
    setExpenses(loadExpenses());
  }, []);

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

  // ─── Expense handlers ───
  const addExpense = useCallback(() => {
    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (!expenseForm.description.trim()) { toast.error('Enter a description'); return; }

    const newExpense: Expense = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: expenseForm.date,
      amount,
      currency: expenseForm.currency,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setShowAddExpense(false);
    setExpenseForm({ date: new Date().toISOString().split('T')[0], amount: '', currency: 'USD', category: 'Cleaning', description: '' });
    toast.success('Expense logged');
  }, [expenseForm, expenses]);

  const deleteExpense = useCallback((id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    toast.success('Expense removed');
  }, [expenses]);

  // ─── Computed values ───
  const totalExpensesYTD = useMemo(() => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    return expenses
      .filter(e => e.date >= startOfYear)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const ytdExpenses = expenses.filter(e => e.date >= startOfYear);
    const map: Record<string, number> = {};
    ytdExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const profitMargin = useMemo(() => {
    const netEarnings = data?.netYTD || 0;
    const grossRevenue = netEarnings + (data?.platformFees || 0);
    const profit = netEarnings - totalExpensesYTD;
    const margin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;
    return { profit: Math.round(profit), margin: Math.round(margin) };
  }, [data, totalExpensesYTD]);

  // ─── AI Forecasting ───
  const forecasts = useMemo(() => {
    if (!data?.monthlyData) return null;
    return computeForecasts(data.monthlyData, data.totalBookings || 0, data.avgBookingValue || 0);
  }, [data]);

  // ─── CSV Export ───
  const handleExport = useCallback(() => {
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency']];

    // Add booking revenue
    (data?.monthlyData || []).forEach((m: any) => {
      if (m.gross > 0) {
        rows.push([`2026-${String((data.monthlyData.indexOf(m) + 1)).padStart(2, '0')}-01`, 'Revenue', 'Bookings', `${m.name} Gross Revenue`, String(m.gross), 'USD']);
      }
    });

    // Add expenses
    expenses.forEach(e => {
      rows.push([e.date, 'Expense', e.category, e.description, String(-e.amount), e.currency]);
    });

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fly2any-finances-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  }, [data, expenses]);

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
                <h1 className="text-4xl font-black text-[#0A0A0A] mb-3 tracking-tighter">Wealth Management</h1>
                <p className="text-neutral-500 max-w-2xl font-medium leading-relaxed">
                    Ultra-premium property management analytics. Gain deep insights into your portfolio&apos;s financial health and optimize for maximum yield.
                </p>
            </header>
                <div className="flex items-center gap-3">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-neutral-100 text-neutral-700 text-xs font-black shadow-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="ytd">Year to Date ({currentYear})</option>
                        <option value="all">All Time</option>
                    </select>
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A0A0A] hover:scale-105 active:scale-95 text-white text-xs font-black shadow-soft transition-all">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

            {/* Top Stats — 4 cards including profit */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Net Earnings (YTD)</p>
                        <h2 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">${data?.netYTD?.toLocaleString() || '0'}</h2>
                    </div>
                </div>

                <div className="bg-[#1B243B] rounded-[2rem] p-8 shadow-soft-lg flex flex-col justify-between hover:-translate-y-1 transition-all group text-white">
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-secondary-400 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Upcoming Payouts</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter">${data?.upcomingPayouts?.toLocaleString() || '0'}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#102A3E] border border-[#163B54] text-[#2DD4BF] text-[10px] font-black uppercase tracking-widest mt-4 rounded-full">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                           Booked & Confirmed
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all group">
                    <div className="flex items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Platform Fees & Taxes</p>
                        <h2 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">${data?.platformFees?.toLocaleString() || '0'}</h2>
                    </div>
                </div>

                {/* Profit Card */}
                <div className={`rounded-[2rem] p-8 border shadow-soft flex flex-col justify-between hover:shadow-soft-lg transition-all group ${profitMargin.profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${profitMargin.profit >= 0 ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Net Profit (After Expenses)</p>
                        <h2 className={`text-4xl font-black tracking-tighter ${profitMargin.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            ${Math.abs(profitMargin.profit).toLocaleString()}
                        </h2>
                        <p className={`text-xs font-bold mt-2 ${profitMargin.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {profitMargin.margin}% margin
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-6 lg:p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#0A0A0A]">Revenue Analysis</h3>
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
                        <h3 className="text-lg font-bold text-[#0A0A0A]">YoY Pacing</h3>
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

            {/* AI Occupancy Forecasting & Revenue Projection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Revenue Projection — Data-driven */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-neutral-100 shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Brain className="w-4 h-4 text-violet-500" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">AI Revenue Forecast</p>
                           </div>
                           <h3 className="text-2xl font-black text-[#0A0A0A]">12-Month Predictive</h3>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-emerald-600 uppercase tracking-tighter font-mono">
                             ${(forecasts?.projectedAnnual || 0).toLocaleString()}
                           </p>
                           <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Projected Annual</p>
                        </div>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecasts?.forecast || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(val) => `$${val/1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', padding: '10px', fontSize: '12px' }}
                                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'actual' ? 'Actual' : 'Projected']}
                                />
                                <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="projected" name="Projected" fill="#8b5cf6" radius={[6, 6, 0, 0]} opacity={0.6} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Occupancy Forecast */}
                <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-violet-500/10 group-hover:scale-110 transition-transform">
                        <Brain className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                           <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                           AI Occupancy Intelligence
                        </div>
                        <h4 className="text-2xl font-black text-[#0A0A0A] mb-6 tracking-tight">Occupancy Forecast</h4>

                        {/* Forecast bars */}
                        <div className="space-y-4 mb-8">
                            {[
                              { label: '30-Day', value: forecasts?.occupancy30 || 0, color: 'bg-emerald-500' },
                              { label: '60-Day', value: forecasts?.occupancy60 || 0, color: 'bg-violet-500' },
                              { label: '90-Day', value: forecasts?.occupancy90 || 0, color: 'bg-amber-500' },
                            ].map(({ label, value, color }) => (
                              <div key={label}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-bold text-neutral-600">{label}</span>
                                  <span className="text-xs font-black text-[#0A0A0A]">{value}%</span>
                                </div>
                                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                                </div>
                              </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                              <span className="text-[#0A0A0A] font-bold">AI Insight:</span>{' '}
                              {(forecasts?.occupancy30 || 0) >= 70
                                ? 'Strong demand detected. Consider raising rates by 10-15% for the next 30 days to maximize RevPAR.'
                                : (forecasts?.occupancy30 || 0) >= 40
                                  ? 'Moderate demand. Consider promotional pricing or minimum-stay discounts to boost occupancy.'
                                  : 'Low occupancy projected. Activate smart pricing, reduce minimum stay, and enhance listing visibility.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ Expense Tracker Section ═══════ */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <Receipt className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#0A0A0A] tracking-tight">Expense Tracker</h3>
                            <p className="text-xs text-neutral-500 font-medium">Log property expenses to track profit margin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddExpense(!showAddExpense)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>

                {/* Add Expense Form */}
                {showAddExpense && (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-[#0A0A0A]">New Expense</h4>
                            <button onClick={() => setShowAddExpense(false)} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-neutral-400" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <input
                                type="date"
                                value={expenseForm.date}
                                onChange={e => setExpenseForm(p => ({ ...p, date: e.target.value }))}
                                className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={expenseForm.amount}
                                    onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                                    className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                    min="0"
                                    step="0.01"
                                />
                                <select
                                    value={expenseForm.currency}
                                    onChange={e => setExpenseForm(p => ({ ...p, currency: e.target.value }))}
                                    className="px-2 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none w-20"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="BRL">BRL</option>
                                    <option value="JPY">JPY</option>
                                </select>
                            </div>
                            <select
                                value={expenseForm.category}
                                onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))}
                                className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Description"
                                value={expenseForm.description}
                                onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))}
                                className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                onKeyDown={e => e.key === 'Enter' && addExpense()}
                            />
                            <button
                                onClick={addExpense}
                                className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Expense breakdown by category */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-[#0A0A0A] mb-4">YTD by Category</h4>
                        {expensesByCategory.length === 0 ? (
                            <p className="text-sm text-neutral-400 py-8 text-center">No expenses logged yet</p>
                        ) : (
                            <div className="space-y-3">
                                {expensesByCategory.map(([cat, amount]) => (
                                    <div key={cat} className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-neutral-600">{cat}</span>
                                        <span className="text-xs font-black text-[#0A0A0A]">${amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-neutral-800">Total Expenses</span>
                                    <span className="text-sm font-black text-red-600">${totalExpensesYTD.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent expenses list */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-[#0A0A0A] mb-4">Recent Expenses</h4>
                        {expenses.length === 0 ? (
                            <div className="text-center py-12">
                                <Receipt className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                                <p className="text-sm text-neutral-400">No expenses logged yet.</p>
                                <p className="text-xs text-neutral-400 mt-1">Click &quot;Add Expense&quot; to start tracking.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                {expenses.slice(0, 20).map(exp => (
                                    <div key={exp.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-neutral-50 transition-colors group">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-xs text-neutral-400 font-mono shrink-0">{exp.date}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg shrink-0">{exp.category}</span>
                                            <span className="text-sm text-neutral-700 truncate">{exp.description}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-sm font-black text-[#0A0A0A]">
                                                {exp.currency !== 'USD' && <span className="text-[10px] text-neutral-400 mr-1">{exp.currency}</span>}
                                                ${exp.amount.toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => deleteExpense(exp.id)}
                                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Insights Card */}
            <div className="mb-12">
                <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-neutral-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 text-primary-500/10 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                           <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
                           AI Concierge Insights
                        </div>
                        <h4 className="text-2xl font-black text-[#0A0A0A] mb-4 tracking-tight">Tax Optimization Strategy</h4>
                        <p className="text-sm text-neutral-500 font-medium mb-8 leading-relaxed max-w-lg">
                           {totalExpensesYTD === 0
                             ? 'You haven\'t logged any property expenses this year. Start tracking maintenance, cleaning, and utility costs to maximize your tax deductions and get accurate profit reporting.'
                             : `You've logged $${totalExpensesYTD.toLocaleString()} in expenses. ${profitMargin.margin > 60 ? 'Your margin is healthy — consider reinvesting in property upgrades for long-term value.' : profitMargin.margin > 30 ? 'Good expense management. Review utility costs for potential savings.' : 'Expenses are high relative to revenue. Audit your maintenance and supply costs.'}`}
                           <br /><br />
                           <span className="text-[#0A0A0A] font-bold">Pro Tip:</span> Categorize all repairs as capital improvements where applicable to lower your {currentYear} tax liability.
                        </p>
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] flex items-center gap-2 group/btn">
                           Explore Tax Center
                           <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

        </MaxWidthContainer>
    </div>
  );
}
