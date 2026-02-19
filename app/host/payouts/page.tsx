'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  CreditCard, Plus, AlertCircle,
  CheckCircle2, Clock, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PayoutsPage() {
  const [showBankForm, setShowBankForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Payout method state
  const [payoutData, setPayoutData] = useState<{
    payoutMethod: string;
    bankName?: string;
    accountHolder?: string;
    accountNumberLast4?: string;
  } | null>(null);

  // Form fields
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingCode, setRoutingCode] = useState('');

  // Fetch existing payout method
  useEffect(() => {
    async function fetchPayout() {
      try {
        const res = await fetch('/api/host/payouts');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPayoutData(json.data);
            setBankName(json.data.bankName || '');
            setAccountHolder(json.data.accountHolder || '');
          }
        }
      } catch (e) {
        console.error('Failed to fetch payout info', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayout();
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
        toast.success('Payout method saved successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save payout method');
      }
    } catch (e) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Payouts</h1>
          <p className="text-gray-500 text-sm">Manage how you receive your earnings from bookings.</p>
        </div>

        {/* Status Card */}
        {!payoutData ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-1">No payout method configured</h3>
                <p className="text-sm text-amber-700">
                  Add a payout method to start receiving earnings from your bookings. You won&apos;t receive any payments until this is set up.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-emerald-900 mb-1">Payout method configured</h3>
                <p className="text-sm text-emerald-700">
                  <span className="font-semibold">{payoutData.bankName}</span> — {payoutData.accountHolder} (****{payoutData.accountNumberLast4})
                </p>
              </div>
              <button
                onClick={() => setShowBankForm(!showBankForm)}
                className="text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        )}

        {/* Payout Methods */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-bold text-gray-900 text-lg">Payout Methods</h2>
            <p className="text-sm text-gray-500 mt-1">Add your preferred payment method to receive earnings.</p>
          </div>

          {!payoutData && !showBankForm && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-neutral-300" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">No payout methods added</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                We support bank transfers. Add your banking details to start receiving payments.
              </p>
              <button
                onClick={() => setShowBankForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
              >
                <Plus className="w-4 h-4" />
                Add Payout Method
              </button>
            </div>
          )}

          {/* Bank form */}
          {showBankForm && (
            <div className="border-t border-neutral-100 p-6">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    placeholder="Full name on account"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number / IBAN *</label>
                  <input
                    type="text"
                    placeholder="Account number or IBAN"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Routing / SWIFT Code</label>
                  <input
                    type="text"
                    placeholder="Routing or SWIFT/BIC code"
                    value={routingCode}
                    onChange={(e) => setRoutingCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Payout Method'
                    )}
                  </button>
                  <button
                    onClick={() => setShowBankForm(false)}
                    className="px-6 py-3 rounded-xl border border-neutral-200 text-gray-600 font-bold hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Your banking details are encrypted and stored securely.
                </p>
              </div>
            </div>
          )}

          {/* Show saved method card */}
          {payoutData && !showBankForm && (
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{payoutData.bankName}</p>
                  <p className="text-sm text-gray-500">{payoutData.accountHolder} — ****{payoutData.accountNumberLast4}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-bold text-gray-900 text-lg">Payout History</h2>
          </div>
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No payouts yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Payouts will appear here once you receive bookings and have a payout method configured.
            </p>
          </div>
        </div>

      </MaxWidthContainer>
    </div>
  );
}
