'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  Gift,
  Percent,
  Hotel,
  Plane,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Share2,
  Mail,
  Zap,
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency: string;
  minBookingAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  perUserLimit?: number;
  applicableProducts: string[];
  newUsersOnly: boolean;
  requiresAccount: boolean;
  requiresPWAApp: boolean;
  description?: string;
  isActive: boolean;
  usageCount: number;
  totalDiscountGiven: number;
  isExpired: boolean;
  usageLimitReached: boolean;
}

interface LoyaltyConfig {
  global: {
    programName: string;
    programEnabled: boolean;
    signupBonusPoints: number;
    referralBonusPoints: number;
    pointsExpiryDays: number;
    minRedemptionPoints: number;
    pointsToValueRatio: number;
  };
  referral: {
    enabled: boolean;
    tierRates: { level1: number; level2: number; level3: number };
    productMultipliers: Record<string, number>;
    defaultCommissionRates: Record<string, number>;
    pointsLockDays: number;
    redemptionRate: number;
  };
  leadCapture: {
    newsletterSignupCredits: number;
    exitIntentDiscountPercent: number;
    exitIntentDiscountCode: string;
    priceAlertSignupCredits: number;
    appInstallCredits: number;
  };
  hotels: {
    enabled: boolean;
    pointsPerDollar: number;
    bonusMultiplier: number;
    welcomeDiscountPercent: number;
    maxWelcomeDiscount: number;
    cashbackEnabled: boolean;
    cashbackPercent: number;
    maxCashbackPerBooking: number;
  };
  flights: {
    enabled: boolean;
    pointsPerDollar: number;
    bonusMultiplier: number;
    welcomeDiscountPercent: number;
    maxWelcomeDiscount: number;
    cashbackEnabled: boolean;
    cashbackPercent: number;
    maxCashbackPerBooking: number;
  };
  liteApiIntegration: {
    enabled: boolean;
    syncEnabled: boolean;
    guestIdPrefix: string;
    loyaltyProgramId: string;
  };
}

interface Stats {
  users: { total: number; withRewards: number; engagementRate: string };
  points: { totalBalance: number; totalPending: number; totalIssued: number };
  promoCodes: { total: number; active: number; totalUsages: number };
}

type TabType = 'promo-codes' | 'referral' | 'lead-capture' | 'hotels' | 'flights' | 'global';

export default function RewardsAdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('promo-codes');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoStats, setPromoStats] = useState<any>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoFilter, setPromoFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Loyalty Config State
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // New promo form state
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 5,
    currency: 'USD',
    minSpend: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
    perUserLimit: '1',
    applicableProducts: ['hotel', 'flight'],
    newUsersOnly: false,
    requiresAccount: true,
    requiresPWAApp: false,
    description: '',
    isActive: true,
  });

  // Fetch data
  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/promo-codes?status=${promoFilter}`);
      const data = await res.json();
      if (res.ok) {
        setPromoCodes(data.promoCodes || []);
        setPromoStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  }, [promoFilter]);

  const fetchLoyaltyConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/loyalty-config');
      const data = await res.json();
      if (res.ok) {
        setLoyaltyConfig(data.config);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching loyalty config:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPromoCodes(), fetchLoyaltyConfig()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchPromoCodes, fetchLoyaltyConfig]);

  // Promo Code handlers
  const handleCreatePromo = async () => {
    if (!newPromo.code) {
      toast.error('Promo code is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromo),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Promo code ${newPromo.code} created!`);
        setShowPromoForm(false);
        setNewPromo({
          code: '',
          type: 'percentage',
          value: 5,
          currency: 'USD',
          minSpend: '',
          maxDiscount: '',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usageLimit: '',
          perUserLimit: '1',
          applicableProducts: ['hotel', 'flight'],
          newUsersOnly: false,
          requiresAccount: true,
          requiresPWAApp: false,
          description: '',
          isActive: true,
        });
        fetchPromoCodes();
      } else {
        toast.error(data.error || 'Failed to create promo code');
      }
    } catch (error) {
      toast.error('Failed to create promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePromo = async (id: string, updates: Partial<PromoCode>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Promo code updated!');
        setEditingPromo(null);
        fetchPromoCodes();
      } else {
        toast.error(data.error || 'Failed to update promo code');
      }
    } catch (error) {
      toast.error('Failed to update promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchPromoCodes();
      } else {
        toast.error(data.error || 'Failed to delete promo code');
      }
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  };

  const handleTogglePromoActive = async (promo: PromoCode) => {
    await handleUpdatePromo(promo.id, { isActive: !promo.isActive });
  };

  // Loyalty Config handlers
  const handleUpdateConfig = async (section: string, updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/loyalty-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, updates }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Configuration updated!');
        setLoyaltyConfig(data.config);
      } else {
        toast.error(data.error || 'Failed to update configuration');
      }
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfig = async () => {
    if (!confirm('Reset all loyalty settings to defaults? This cannot be undone.')) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/loyalty-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Configuration reset to defaults!');
        setLoyaltyConfig(data.config);
      } else {
        toast.error(data.error || 'Failed to reset configuration');
      }
    } catch (error) {
      toast.error('Failed to reset configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter promo codes
  const filteredPromoCodes = promoCodes.filter((promo) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        promo.code.toLowerCase().includes(query) ||
        promo.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'promo-codes', label: 'Promo Codes', icon: <Percent className="w-4 h-4" /> },
    { id: 'referral', label: 'Referral Network', icon: <Share2 className="w-4 h-4" /> },
    { id: 'lead-capture', label: 'Lead Capture', icon: <Mail className="w-4 h-4" /> },
    { id: 'hotels', label: 'Hotels Loyalty', icon: <Hotel className="w-4 h-4" /> },
    { id: 'flights', label: 'Flights Loyalty', icon: <Plane className="w-4 h-4" /> },
    { id: 'global', label: 'Global Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary-500" />
            Loyalty & Rewards Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage promo codes, loyalty points, and rewards for Hotels and Flights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchPromoCodes();
              fetchLoyaltyConfig();
            }}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rewards Members</p>
                <p className="text-xl font-bold text-gray-900">{stats.users.withRewards}</p>
                <p className="text-xs text-purple-600">{stats.users.engagementRate}% engagement</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Points Issued</p>
                <p className="text-xl font-bold text-gray-900">{stats.points.totalIssued.toLocaleString()}</p>
                <p className="text-xs text-amber-600">{stats.points.totalPending.toLocaleString()} pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Percent className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Promo Codes</p>
                <p className="text-xl font-bold text-gray-900">{stats.promoCodes.active}</p>
                <p className="text-xs text-green-600">{stats.promoCodes.total} total codes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Promo Redemptions</p>
                <p className="text-xl font-bold text-gray-900">{stats.promoCodes.totalUsages}</p>
                <p className="text-xs text-blue-600">All time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Promo Codes Tab */}
        {activeTab === 'promo-codes' && (
          <div className="p-6">
            {/* Promo Codes Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search promo codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select
                  value={promoFilter}
                  onChange={(e) => setPromoFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Codes</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button
                onClick={() => setShowPromoForm(!showPromoForm)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Promo Code
              </button>
            </div>

            {/* New Promo Form */}
            {showPromoForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Create New Promo Code</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                      placeholder="WELCOME10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newPromo.type}
                      onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value {newPromo.type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      value={newPromo.value}
                      onChange={(e) => setNewPromo({ ...newPromo, value: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max={newPromo.type === 'percentage' ? 100 : undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={newPromo.validFrom}
                      onChange={(e) => setNewPromo({ ...newPromo, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={newPromo.validUntil}
                      onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Spend ($)</label>
                    <input
                      type="number"
                      value={newPromo.minSpend}
                      onChange={(e) => setNewPromo({ ...newPromo, minSpend: e.target.value })}
                      placeholder="No minimum"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Cap ($)</label>
                    <input
                      type="number"
                      value={newPromo.maxDiscount}
                      onChange={(e) => setNewPromo({ ...newPromo, maxDiscount: e.target.value })}
                      placeholder="No limit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      value={newPromo.usageLimit}
                      onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                      placeholder="Unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                    <input
                      type="number"
                      value={newPromo.perUserLimit}
                      onChange={(e) => setNewPromo({ ...newPromo, perUserLimit: e.target.value })}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
                    <div className="flex flex-wrap gap-2">
                      {['hotel', 'flight'].map((product) => (
                        <label key={product} className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={newPromo.applicableProducts.includes(product)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewPromo({
                                  ...newPromo,
                                  applicableProducts: [...newPromo.applicableProducts, product],
                                });
                              } else {
                                setNewPromo({
                                  ...newPromo,
                                  applicableProducts: newPromo.applicableProducts.filter((p) => p !== product),
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                          />
                          <span className="text-sm capitalize">{product}s</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newPromo.description}
                      onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                      placeholder="e.g., 5% off your first booking"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPromo.newUsersOnly}
                        onChange={(e) => setNewPromo({ ...newPromo, newUsersOnly: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">New users only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPromo.requiresAccount}
                        onChange={(e) => setNewPromo({ ...newPromo, requiresAccount: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Requires Account</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPromo.requiresPWAApp}
                        onChange={(e) => setNewPromo({ ...newPromo, requiresPWAApp: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">PWA App Only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPromo.isActive}
                        onChange={(e) => setNewPromo({ ...newPromo, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleCreatePromo}
                    disabled={isSaving || !newPromo.code}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Create Promo Code
                  </button>
                  <button
                    onClick={() => setShowPromoForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Promo Codes List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPromoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(promo.code);
                              toast.success('Copied!');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {promo.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{promo.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">
                          {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                        </span>
                        {promo.maxDiscount && (
                          <span className="text-xs text-gray-500 ml-1">(max ${promo.maxDiscount})</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {promo.applicableProducts.map((p) => (
                            <span
                              key={p}
                              className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                p === 'hotel'
                                  ? 'bg-blue-100 text-blue-700'
                                  : p === 'flight'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(promo.validUntil).toLocaleDateString()}
                          </div>
                          {promo.isExpired && (
                            <span className="text-xs text-red-600">Expired</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{promo.usageCount}</span>
                          {promo.usageLimit && (
                            <span className="text-gray-500">/{promo.usageLimit}</span>
                          )}
                        </div>
                        {promo.totalDiscountGiven > 0 && (
                          <p className="text-xs text-green-600">${promo.totalDiscountGiven.toFixed(2)} saved</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePromoActive(promo)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            promo.isActive && !promo.isExpired
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {promo.isActive && !promo.isExpired ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPromo(promo)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id, promo.code)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPromoCodes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No promo codes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Referral Network Tab */}
        {activeTab === 'referral' && loyaltyConfig?.referral && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">3-Tier Referral Network</h3>
                <p className="text-sm text-gray-500">Commission-based rewards (sustainable profitability model)</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loyaltyConfig.referral.enabled}
                  onChange={(e) => handleUpdateConfig('referral', { enabled: e.target.checked })}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Referral Program</span>
              </label>
            </div>

            {/* Tier Rates */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary-500" />
                Points per $100 Commission
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    Level 1 (Direct Referral)
                  </label>
                  <input
                    type="number"
                    value={loyaltyConfig.referral.tierRates.level1}
                    onChange={(e) => handleUpdateConfig('referral', {
                      tierRates: { ...loyaltyConfig.referral.tierRates, level1: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-primary-600 mt-1">
                    = ${((loyaltyConfig.referral.tierRates.level1 || 0) * loyaltyConfig.referral.redemptionRate).toFixed(2)} reward (5% of commission)
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Level 2 (Referral's Referral)
                  </label>
                  <input
                    type="number"
                    value={loyaltyConfig.referral.tierRates.level2}
                    onChange={(e) => handleUpdateConfig('referral', {
                      tierRates: { ...loyaltyConfig.referral.tierRates, level2: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    = ${((loyaltyConfig.referral.tierRates.level2 || 0) * loyaltyConfig.referral.redemptionRate).toFixed(2)} reward (2% of commission)
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Level 3 (3rd Tier)
                  </label>
                  <input
                    type="number"
                    value={loyaltyConfig.referral.tierRates.level3}
                    onChange={(e) => handleUpdateConfig('referral', {
                      tierRates: { ...loyaltyConfig.referral.tierRates, level3: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    = ${((loyaltyConfig.referral.tierRates.level3 || 0) * loyaltyConfig.referral.redemptionRate).toFixed(2)} reward (1% of commission)
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Total:</strong> {(loyaltyConfig.referral.tierRates.level1 + loyaltyConfig.referral.tierRates.level2 + loyaltyConfig.referral.tierRates.level3) || 0} pts =
                  {' '}${(((loyaltyConfig.referral.tierRates.level1 + loyaltyConfig.referral.tierRates.level2 + loyaltyConfig.referral.tierRates.level3) || 0) * loyaltyConfig.referral.redemptionRate).toFixed(2)} per $100 commission (8% sustainable model)
                </p>
              </div>
            </div>

            {/* Product Multipliers */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Product Multipliers</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(loyaltyConfig.referral.productMultipliers || {}).map(([product, multiplier]) => (
                  <div key={product} className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                      {product.replace('_', ' ')}
                    </label>
                    <input
                      type="number"
                      value={multiplier}
                      onChange={(e) => handleUpdateConfig('referral', {
                        productMultipliers: {
                          ...loyaltyConfig.referral.productMultipliers,
                          [product]: parseFloat(e.target.value) || 1.0
                        }
                      })}
                      step="0.1"
                      min="0.1"
                      max="5"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Points Lock Period (Days)</label>
                <input
                  type="number"
                  value={loyaltyConfig.referral.pointsLockDays}
                  onChange={(e) => handleUpdateConfig('referral', { pointsLockDays: parseInt(e.target.value) || 14 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Points unlock after trip completion + this period</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-800 mb-2">Redemption Rate (Points to $)</label>
                <input
                  type="number"
                  value={loyaltyConfig.referral.redemptionRate}
                  onChange={(e) => handleUpdateConfig('referral', { redemptionRate: parseFloat(e.target.value) || 0.10 })}
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg"
                />
                <p className="text-xs text-green-700 mt-1">
                  {loyaltyConfig.referral.redemptionRate} means {Math.round(1 / loyaltyConfig.referral.redemptionRate)} points = $1
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lead Capture Tab */}
        {activeTab === 'lead-capture' && loyaltyConfig?.leadCapture && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lead Capture Incentives</h3>
              <p className="text-sm text-gray-500">Configure credits and discounts for lead capture touchpoints</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Newsletter Signup Credits */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Newsletter Signup</h4>
                </div>
                <label className="block text-sm text-blue-700 mb-2">Credits Awarded</label>
                <input
                  type="number"
                  value={loyaltyConfig.leadCapture.newsletterSignupCredits}
                  onChange={(e) => handleUpdateConfig('leadCapture', { newsletterSignupCredits: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-blue-600 mt-1">
                  = ${((loyaltyConfig.leadCapture.newsletterSignupCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)} value
                </p>
              </div>

              {/* Exit Intent Discount */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h4 className="font-medium text-amber-800">Exit Intent Popup</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-amber-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={loyaltyConfig.leadCapture.exitIntentDiscountPercent}
                      onChange={(e) => handleUpdateConfig('leadCapture', { exitIntentDiscountPercent: parseInt(e.target.value) || 5 })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-amber-700 mb-1">Discount Code</label>
                    <input
                      type="text"
                      value={loyaltyConfig.leadCapture.exitIntentDiscountCode}
                      onChange={(e) => handleUpdateConfig('leadCapture', { exitIntentDiscountCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Price Alert Credits */}
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Price Alert Signup</h4>
                </div>
                <label className="block text-sm text-green-700 mb-2">Credits Awarded</label>
                <input
                  type="number"
                  value={loyaltyConfig.leadCapture.priceAlertSignupCredits}
                  onChange={(e) => handleUpdateConfig('leadCapture', { priceAlertSignupCredits: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-green-600 mt-1">
                  = ${((loyaltyConfig.leadCapture.priceAlertSignupCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)} value
                </p>
              </div>

              {/* App Install Credits */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-purple-800">App Install Bonus</h4>
                </div>
                <label className="block text-sm text-purple-700 mb-2">Credits Awarded</label>
                <input
                  type="number"
                  value={loyaltyConfig.leadCapture.appInstallCredits}
                  onChange={(e) => handleUpdateConfig('leadCapture', { appInstallCredits: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-600 mt-1">
                  = ${((loyaltyConfig.leadCapture.appInstallCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)} value
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-100 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">Lead Capture Value Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Newsletter</p>
                  <p className="font-bold text-blue-600">${((loyaltyConfig.leadCapture.newsletterSignupCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Exit Intent</p>
                  <p className="font-bold text-amber-600">{loyaltyConfig.leadCapture.exitIntentDiscountPercent}% off</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">Price Alert</p>
                  <p className="font-bold text-green-600">${((loyaltyConfig.leadCapture.priceAlertSignupCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-gray-500">App Install</p>
                  <p className="font-bold text-purple-600">${((loyaltyConfig.leadCapture.appInstallCredits || 0) * (loyaltyConfig.global?.pointsToValueRatio || 0.01)).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hotels Loyalty Tab */}
        {activeTab === 'hotels' && loyaltyConfig && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hotels Loyalty Settings</h3>
                <p className="text-sm text-gray-500">Configure points, cashback, and welcome discounts for hotel bookings</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loyaltyConfig.hotels.enabled}
                  onChange={(e) => handleUpdateConfig('hotels', { enabled: e.target.checked })}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Hotels Loyalty</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Points Per Dollar */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Per Dollar Spent
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.pointsPerDollar}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { pointsPerDollar: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users earn this many points for each dollar spent on hotels
                </p>
              </div>

              {/* Welcome Discount */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Welcome Discount (%)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.welcomeDiscountPercent}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { welcomeDiscountPercent: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-xs text-amber-700 mt-1">
                  Discount for new users (WELCOME5 code)
                </p>
              </div>

              {/* Max Welcome Discount */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Welcome Discount ($)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.maxWelcomeDiscount}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { maxWelcomeDiscount: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum dollar amount for welcome discount</p>
              </div>

              {/* Cashback */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-green-800">Cashback (%)</label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={loyaltyConfig.hotels.cashbackEnabled}
                      onChange={(e) => handleUpdateConfig('hotels', { cashbackEnabled: e.target.checked })}
                      className="rounded border-green-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-xs text-green-700">Enable</span>
                  </label>
                </div>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.cashbackPercent}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { cashbackPercent: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="100"
                  disabled={!loyaltyConfig.hotels.cashbackEnabled}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
                <p className="text-xs text-green-700 mt-1">Cashback percentage for hotel bookings</p>
              </div>

              {/* Max Cashback */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Cashback Per Booking ($)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.maxCashbackPerBooking}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { maxCashbackPerBooking: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  disabled={!loyaltyConfig.hotels.cashbackEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                />
              </div>

              {/* Bonus Multiplier */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Multiplier
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.hotels.bonusMultiplier}
                  onChange={(e) =>
                    handleUpdateConfig('hotels', { bonusMultiplier: parseFloat(e.target.value) || 1.0 })
                  }
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.0 = normal, 2.0 = double points (promotions)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Flights Loyalty Tab */}
        {activeTab === 'flights' && loyaltyConfig && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Flights Loyalty Settings</h3>
                <p className="text-sm text-gray-500">Configure points, cashback, and welcome discounts for flight bookings</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={loyaltyConfig.flights.enabled}
                  onChange={(e) => handleUpdateConfig('flights', { enabled: e.target.checked })}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Flights Loyalty</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Points Per Dollar */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Per Dollar Spent
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.flights.pointsPerDollar}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { pointsPerDollar: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users earn this many points for each dollar spent on flights
                </p>
              </div>

              {/* Welcome Discount */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Welcome Discount (%)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.flights.welcomeDiscountPercent}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { welcomeDiscountPercent: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-purple-700 mt-1">
                  Discount for new users on flights
                </p>
              </div>

              {/* Max Welcome Discount */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Welcome Discount ($)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.flights.maxWelcomeDiscount}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { maxWelcomeDiscount: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Cashback */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-green-800">Cashback (%)</label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={loyaltyConfig.flights.cashbackEnabled}
                      onChange={(e) => handleUpdateConfig('flights', { cashbackEnabled: e.target.checked })}
                      className="rounded border-green-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-xs text-green-700">Enable</span>
                  </label>
                </div>
                <input
                  type="number"
                  value={loyaltyConfig.flights.cashbackPercent}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { cashbackPercent: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  max="100"
                  disabled={!loyaltyConfig.flights.cashbackEnabled}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                />
              </div>

              {/* Max Cashback */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Cashback Per Booking ($)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.flights.maxCashbackPerBooking}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { maxCashbackPerBooking: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  disabled={!loyaltyConfig.flights.cashbackEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                />
              </div>

              {/* Bonus Multiplier */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Multiplier
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.flights.bonusMultiplier}
                  onChange={(e) =>
                    handleUpdateConfig('flights', { bonusMultiplier: parseFloat(e.target.value) || 1.0 })
                  }
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1.0 = normal, 2.0 = double points
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Settings Tab */}
        {activeTab === 'global' && loyaltyConfig && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Global Loyalty Settings</h3>
                <p className="text-sm text-gray-500">Configure program-wide settings and bonuses</p>
              </div>
              <button
                onClick={handleResetConfig}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Program Name */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={loyaltyConfig.global.programName}
                  onChange={(e) => handleUpdateConfig('global', { programName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Program Enabled */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Status
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={loyaltyConfig.global.programEnabled}
                    onChange={(e) => handleUpdateConfig('global', { programEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Enable Loyalty Program</span>
                </label>
              </div>

              {/* Signup Bonus */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Signup Bonus Points
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.global.signupBonusPoints}
                  onChange={(e) =>
                    handleUpdateConfig('global', { signupBonusPoints: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-purple-700 mt-1">Points given when user creates account</p>
              </div>

              {/* Referral Bonus */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Referral Bonus Points
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.global.referralBonusPoints}
                  onChange={(e) =>
                    handleUpdateConfig('global', { referralBonusPoints: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-blue-700 mt-1">Points given for successful referrals</p>
              </div>

              {/* Points Expiry */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Expiry (Days)
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.global.pointsExpiryDays}
                  onChange={(e) =>
                    handleUpdateConfig('global', { pointsExpiryDays: parseInt(e.target.value) || 365 })
                  }
                  min="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Days until unused points expire</p>
              </div>

              {/* Min Redemption */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Redemption Points
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.global.minRedemptionPoints}
                  onChange={(e) =>
                    handleUpdateConfig('global', { minRedemptionPoints: parseInt(e.target.value) || 100 })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum points required to redeem</p>
              </div>

              {/* Points Value */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-800 mb-2">
                  Points to Dollar Ratio
                </label>
                <input
                  type="number"
                  value={loyaltyConfig.global.pointsToValueRatio}
                  onChange={(e) =>
                    handleUpdateConfig('global', { pointsToValueRatio: parseFloat(e.target.value) || 0.01 })
                  }
                  min="0.001"
                  max="1"
                  step="0.001"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-green-700 mt-1">
                  {loyaltyConfig.global.pointsToValueRatio} means 100 points = ${(100 * loyaltyConfig.global.pointsToValueRatio).toFixed(2)}
                </p>
              </div>

              {/* LiteAPI Integration */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-indigo-800">LiteAPI Integration</h4>
                    <p className="text-xs text-indigo-600">Hotel booking loyalty sync settings</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={loyaltyConfig.liteApiIntegration.enabled}
                      onChange={(e) =>
                        handleUpdateConfig('liteApiIntegration', { enabled: e.target.checked })
                      }
                      className="rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-indigo-700">Enable Integration</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Guest ID Prefix</label>
                    <input
                      type="text"
                      value={loyaltyConfig.liteApiIntegration.guestIdPrefix}
                      onChange={(e) =>
                        handleUpdateConfig('liteApiIntegration', { guestIdPrefix: e.target.value })
                      }
                      disabled={!loyaltyConfig.liteApiIntegration.enabled}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Loyalty Program ID</label>
                    <input
                      type="text"
                      value={loyaltyConfig.liteApiIntegration.loyaltyProgramId}
                      onChange={(e) =>
                        handleUpdateConfig('liteApiIntegration', { loyaltyProgramId: e.target.value })
                      }
                      disabled={!loyaltyConfig.liteApiIntegration.enabled}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Auto Sync</label>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={loyaltyConfig.liteApiIntegration.syncEnabled}
                        onChange={(e) =>
                          handleUpdateConfig('liteApiIntegration', { syncEnabled: e.target.checked })
                        }
                        disabled={!loyaltyConfig.liteApiIntegration.enabled}
                        className="rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-indigo-700">Enable auto sync</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Promo Modal */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Promo Code: {editingPromo.code}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingPromo.type}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, type: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value {editingPromo.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={editingPromo.value}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={editingPromo.validUntil.split('T')[0]}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, validUntil: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={editingPromo.usageLimit || ''}
                    onChange={(e) =>
                      setEditingPromo({
                        ...editingPromo,
                        usageLimit: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingPromo.description || ''}
                  onChange={(e) =>
                    setEditingPromo({ ...editingPromo, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPromo.isActive}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300 text-primary-500"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingPromo.newUsersOnly}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, newUsersOnly: e.target.checked })
                    }
                    className="rounded border-gray-300 text-primary-500"
                  />
                  <span className="text-sm">New users only</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingPromo(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePromo(editingPromo.id, editingPromo)}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
