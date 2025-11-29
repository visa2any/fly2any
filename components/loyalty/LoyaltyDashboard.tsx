'use client';

import { useEffect, useState } from 'react';
import { LoyaltyConfig, GuestLoyaltyPoints, PointsTransaction } from '@/lib/api/liteapi-types';
import LoyaltyPointsDisplay from './LoyaltyPointsDisplay';

export default function LoyaltyDashboard({ guestId }: { guestId: string }) {
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, historyRes] = await Promise.all([
          fetch('/api/loyalty'),
          fetch('/api/guests/' + guestId + '/loyalty-points/history'),
        ]);

        const configData = await configRes.json();
        const historyData = await historyRes.json();

        if (configData.success) setConfig(configData.data);
        if (historyData.success) setHistory(historyData.data || []);
      } catch (err) {
        console.error('Failed to load loyalty data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guestId]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Loyalty Rewards</h1>

      <LoyaltyPointsDisplay guestId={guestId} showDetails={true} />

      {config && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{config.programName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {config.tiers.map((tier, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{tier.minPoints.toLocaleString()} points</p>
                <ul className="space-y-1 text-sm">
                  {tier.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4">Redemption Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.redemptionOptions.map((option, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{option.description}</h4>
                    <span className="text-blue-600 font-bold">{option.pointsCost} pts</span>
                  </div>
                  <p className="text-sm text-gray-600">Value: ${option.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Points History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transaction history yet</p>
        ) : (
          <div className="space-y-2">
            {history.map((txn) => (
              <div key={txn.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium">{txn.description}</p>
                  <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={txn.type === 'earn' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {txn.type === 'earn' ? '+' : '-'}{Math.abs(txn.points)} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
