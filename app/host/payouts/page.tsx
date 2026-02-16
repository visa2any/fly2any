'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  CreditCard, Building, Plus, AlertCircle,
  CheckCircle2, Clock, ArrowRight
} from 'lucide-react';

export default function PayoutsPage() {
  const [showBankForm, setShowBankForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        <div className="mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Payouts</h1>
          <p className="text-gray-500 text-sm">Manage how you receive your earnings from bookings.</p>
        </div>

        {/* Status Card */}
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

        {/* Payout Methods */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-8">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-bold text-gray-900 text-lg">Payout Methods</h2>
            <p className="text-sm text-gray-500 mt-1">Add your preferred payment method to receive earnings.</p>
          </div>

          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No payout methods added</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              We support bank transfers. Add your banking details to start receiving payments.
            </p>
            <button
              onClick={() => setShowBankForm(!showBankForm)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Payout Method
            </button>
          </div>

          {/* Placeholder form */}
          {showBankForm && (
            <div className="border-t border-neutral-100 p-6">
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Enter your bank name"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Full name on account"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number / IBAN</label>
                  <input
                    type="text"
                    placeholder="Account number or IBAN"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Routing / SWIFT Code</label>
                  <input
                    type="text"
                    placeholder="Routing or SWIFT/BIC code"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="pt-2">
                  <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
                    Save Payout Method
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Your banking details are encrypted and stored securely.
                  </p>
                </div>
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
