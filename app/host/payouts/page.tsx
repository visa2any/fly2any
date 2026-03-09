'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  CreditCard, Plus, AlertCircle, CheckCircle2, Clock, Loader2,
  ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PayoutTransaction {
  id: string;
  propertyName: string;
  guestName: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  status: string;
  date: string;
  checkIn: string;
  checkOut: string;
}

export default function PayoutsPage() {
  const [showBankForm, setShowBankForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [txFilter, setTxFilter] = useState<'all' | 'paid' | 'pending' | 'upcoming'>('all');

  const [payoutData, setPayoutData] = useState<{
    payoutMethod: string;
    bankName?: string;
    accountHolder?: string;
    accountNumberLast4?: string;
  } | null>(null);

  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingCode, setRoutingCode] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [payoutRes, bookingsRes] = await Promise.all([
          fetch('/api/host/payouts'),
          fetch('/api/properties/bookings'),
        ]);

        if (payoutRes.ok) {
          const json = await payoutRes.json();
          if (json.data) {
            setPayoutData(json.data);
            setBankName(json.data.bankName || '');
            setAccountHolder(json.data.accountHolder || '');
          }
        }

        if (bookingsRes.ok) {
          const json = await bookingsRes.json();
          const bookings = json.data || [];
          const txs: PayoutTransaction[] = bookings
            .filter((b: any) => b.totalPrice && b.totalPrice > 0)
            .map((b: any) => {
              const gross = b.totalPrice || 0;
              const fee = Math.round(gross * 0.15 * 100) / 100;
              const net = Math.round((gross - fee) * 100) / 100;
              const now = new Date();
              const checkOut = new Date(b.endDate);
              const isPast = checkOut < now;

              let txStatus = 'pending';
              if (b.status === 'cancelled') txStatus = 'cancelled';
              else if (b.status === 'completed' || (b.status === 'confirmed' && isPast)) txStatus = 'paid';
              else if (b.status === 'confirmed' && !isPast) txStatus = 'upcoming';
              else txStatus = 'pending';

              return {
                id: b.id,
                propertyName: b.property?.name || 'Property',
                guestName: b.guestFirstName
                  ? `${b.guestFirstName} ${b.guestLastName || ''}`.trim()
                  : b.user?.name || b.user?.email || 'Guest',
                amount: gross,
                fee,
                net,
                currency: b.currency || 'USD',
                status: txStatus,
                date: b.createdAt,
                checkIn: b.startDate,
                checkOut: b.endDate,
              };
            })
            .sort((a: PayoutTransaction, b: PayoutTransaction) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setTransactions(txs);
        }
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/host/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountHolder: accountHolder.trim(),
          accountNumber: accountNumber.trim(),
          routingCode: routingCode.trim() || null,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setPayoutData(json.data);
        setShowBankForm(false);
        setAccountNumber('');
        setRoutingCode('');
        toast.success('Payout method saved!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const header = 'Date,Guest,Property,Gross,Fee,Net,Currency,Status\n';
    const rows = filteredTx.map(tx =>
      `${new Date(tx.date).toLocaleDateString()},${tx.guestName},${tx.propertyName},${tx.amount},${tx.fee},${tx.net},${tx.currency},${tx.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const filteredTx = transactions.filter(tx => {
    if (txFilter === 'all') return tx.status !== 'cancelled';
    return tx.status === txFilter;
  });

  const totalPaid = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.net, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.net, 0);
  const totalUpcoming = transactions.filter(t => t.status === 'upcoming').reduce((s, t) => s + t.net, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="mb-8 mt-2">
          <h1 className="text-3xl font-black text-[#0A0A0A] mb-1 tracking-tight">Payout Management</h1>
          <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Manage how you receive your earnings from bookings.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Paid</span>
            </div>
            <p className="text-3xl font-black text-[#0A0A0A]">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Pending</span>
            </div>
            <p className="text-3xl font-black text-[#0A0A0A]">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Upcoming</span>
            </div>
            <p className="text-3xl font-black text-[#0A0A0A]">${totalUpcoming.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Payout Method Status */}
        {!payoutData ? (
          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-amber-900 mb-1 text-lg">Payout Required</h3>
                <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
                  Add a payout method to start receiving earnings from your bookings.
                </p>
              </div>
              <button onClick={() => setShowBankForm(true)} className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black shadow-sm hover:bg-amber-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-1" /> Add Method
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-emerald-900">
                  {payoutData.bankName} <span className="font-medium text-emerald-700">• {payoutData.accountHolder} (****{payoutData.accountNumberLast4})</span>
                </p>
              </div>
              <button onClick={() => setShowBankForm(!showBankForm)} className="px-4 py-2 rounded-xl bg-white text-xs font-black text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors">
                Update
              </button>
            </div>
          </div>
        )}

        {/* Bank form */}
        {showBankForm && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
            <h3 className="font-black text-[#0A0A0A] mb-4">Bank Transfer Details</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Bank Name *</label>
                <input type="text" placeholder="Enter your bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Account Holder Name *</label>
                <input type="text" placeholder="Full name on account" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Account Number / IBAN *</label>
                <input type="text" placeholder="Account number or IBAN" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Routing / SWIFT Code</label>
                <input type="text" placeholder="Routing or SWIFT/BIC code" value={routingCode} onChange={(e) => setRoutingCode(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl bg-[#0A0A0A] text-white font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Payout Method'}
                </button>
                <button onClick={() => setShowBankForm(false)} className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-colors">Cancel</button>
              </div>
              <p className="text-xs text-neutral-400 text-center mt-2">Your banking details are encrypted and stored securely.</p>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-[#0A0A0A] text-lg">Transaction History</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{transactions.length} total transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-neutral-100/50 rounded-xl p-1 gap-0.5">
                {(['all', 'paid', 'pending', 'upcoming'] as const).map((f) => (
                  <button key={f} onClick={() => setTxFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${txFilter === f ? 'bg-[#0A0A0A] text-white shadow-sm' : 'text-neutral-500 hover:text-[#0A0A0A]'}`}>
                    {f}
                  </button>
                ))}
              </div>
              {transactions.length > 0 && (
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              )}
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-7 h-7 text-neutral-300" />
              </div>
              <h3 className="font-bold text-[#0A0A0A] mb-1">No transactions</h3>
              <p className="text-neutral-500 text-sm">Transactions will appear here as bookings are confirmed.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {filteredTx.map((tx) => {
                const statusColors: Record<string, string> = {
                  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
                  cancelled: 'bg-red-50 text-red-600 border-red-200',
                };
                return (
                  <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#0A0A0A] text-sm truncate">{tx.guestName}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColors[tx.status] || statusColors.pending}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                        <span className="text-neutral-600">{tx.propertyName}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(tx.checkIn).toLocaleDateString()} - {new Date(tx.checkOut).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 sm:text-right">
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Gross</p>
                        <p className="font-bold text-neutral-600 text-sm">${tx.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Fee (15%)</p>
                        <p className="font-bold text-red-500 text-sm">-${tx.fee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Net</p>
                        <p className="font-black text-[#0A0A0A] text-base">${tx.net.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );
}
