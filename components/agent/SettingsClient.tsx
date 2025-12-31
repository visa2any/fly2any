"use client";

// components/agent/SettingsClient.tsx
// Level 6 Ultra-Premium Settings Page
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  User, Bell, Palette, CreditCard, Shield, Globe,
  Mail, Phone, Building2, Link2, FileText, Camera,
  Check, ChevronRight, RefreshCw, Save
} from "lucide-react";

interface Agent {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  status: string;
  tier: string;
  defaultCommission: number;
  emailNotifications: boolean;
  quoteAcceptedEmail: boolean;
  paymentReceivedEmail: boolean;
  clientMessageEmail: boolean;
  weeklyReports: boolean;
  brandColor: string | null;
  logo: string | null;
  stripeAccountId: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
];

export default function SettingsClient({ agent, user }: { agent: Agent; user: User }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: agent.firstName || "",
    lastName: agent.lastName || "",
    phone: agent.phone || "",
    company: agent.company || "",
    website: agent.website || "",
    emailNotifications: agent.emailNotifications,
    quoteAcceptedEmail: agent.quoteAcceptedEmail,
    paymentReceivedEmail: agent.paymentReceivedEmail,
    clientMessageEmail: agent.clientMessageEmail,
    weeklyReports: agent.weeklyReports,
    brandColor: agent.brandColor || "#6366f1",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/agents/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success("Settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Account Status */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-4 mb-4">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {(formData.firstName?.[0] || user.name?.[0] || 'A').toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {agent.tier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
              <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'All Email Notifications', desc: 'Receive email updates about your account' },
                  { key: 'quoteAcceptedEmail', label: 'Quote Accepted', desc: 'When a client accepts your quote' },
                  { key: 'paymentReceivedEmail', label: 'Payment Received', desc: 'When a payment is processed' },
                  { key: 'clientMessageEmail', label: 'Client Messages', desc: 'When a client sends you a message' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly summary of your performance' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        formData[item.key as keyof typeof formData] ? 'bg-indigo-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          formData[item.key as keyof typeof formData] ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <h3 className="font-semibold text-gray-900 mb-4">Brand Color</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-16 h-16 rounded-xl cursor-pointer border-2 border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Primary Color</p>
                    <p className="text-sm text-gray-500">{formData.brandColor}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <h3 className="font-semibold text-gray-900 mb-4">Logo</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Upload your logo</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <h3 className="font-semibold text-gray-900 mb-4">Payout Account</h3>
                {agent.stripeAccountId ? (
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-800">Stripe Connected</p>
                      <p className="text-sm text-emerald-600">Your payout account is active</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-1">No Payout Account</p>
                    <p className="text-sm text-gray-500 mb-4">Connect Stripe to receive payouts</p>
                    <a
                      href="/agent/payouts"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      Set Up Payouts
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]">
                <h3 className="font-semibold text-gray-900 mb-4">Commission Rate</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                    <span className="text-xl font-bold">{(agent.defaultCommission * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Default Commission</p>
                    <p className="text-sm text-gray-500">Your standard commission rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
