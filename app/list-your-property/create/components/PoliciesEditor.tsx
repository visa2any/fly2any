'use client';

import { useState } from 'react';
import {
  Clock, Shield, Plus, X, Cigarette, Dog, Music, Users, Leaf, Check,
  Baby, AlertTriangle, KeyRound, DollarSign, BadgeCheck, Volume2,
  Home, Flame, ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { CancellationPolicyType, PetPolicy, SmokingPolicy, ChildPolicy, CancellationDetails } from '@/lib/properties/types';

interface PoliciesEditorProps {
  data: {
    checkInTime: string;
    checkOutTime: string;
    checkInInstructions?: string;
    cancellationPolicy: string;
    cancellationDetails?: CancellationDetails;
    petPolicy?: string;
    smokingPolicy?: string;
    childPolicy?: string;
    minAge?: number;
    securityDeposit?: number;
    houseRules: string[];
    ecoFeatures?: string[];
    ecoCertifications?: string[];
  };
  onChange: (updates: any) => void;
}

// ─────────── House Rules: 5 categories, 20+ presets ───────────

interface RuleCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  rules: string[];
}

const RULE_CATEGORIES: RuleCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    rules: [
      'No parties or events',
      'No unregistered guests',
      'No shoes indoors',
      'ID required at check-in',
      'Respect neighbors',
      'No commercial use',
    ],
  },
  {
    id: 'noise',
    label: 'Noise & Quiet Hours',
    icon: Volume2,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    rules: [
      'Quiet hours 10PM–8AM',
      'No loud music after 10PM',
      'No fireworks or firecrackers',
      'Keep TV volume low at night',
    ],
  },
  {
    id: 'spaces',
    label: 'Spaces & Property',
    icon: KeyRound,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    rules: [
      'No rearranging furniture',
      'Keep common areas clean',
      'No items on balcony railing',
      'Lock doors when leaving',
      'Return keys at checkout',
      'Take out trash before checkout',
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: Flame,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    rules: [
      'No candles or incense',
      'No portable heaters',
      'No cooking in bedrooms',
      'Pool rules must be followed',
    ],
  },
  {
    id: 'eco',
    label: 'Eco & Sustainability',
    icon: Leaf,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    rules: [
      'Recycle properly',
      'Conserve water',
      'Turn off lights when away',
      'Use reusable bags provided',
    ],
  },
];

const ECO_CERTIFICATIONS = [
  'Green Key',
  'LEED Certified',
  'EarthCheck',
  'Green Globe',
  'EU Ecolabel',
  'Travelife',
];

const ECO_FEATURES = [
  'Solar panels',
  'Recycling bins',
  'Composting',
  'LED lighting',
  'EV charger',
  'Rainwater harvesting',
  'Organic toiletries',
  'Energy efficient appliances',
];

const CANCELLATION_OPTIONS: { value: CancellationPolicyType; label: string; desc: string }[] = [
  { value: 'flexible', label: 'Flexible', desc: 'Full refund 1 day before check-in' },
  { value: 'moderate', label: 'Moderate', desc: 'Full refund 5 days before check-in' },
  { value: 'strict', label: 'Strict', desc: 'Full refund 30 days before check-in' },
  { value: 'super_strict', label: 'Super Strict', desc: 'No refund after booking' },
];

export function PoliciesEditor({ data, onChange }: PoliciesEditorProps) {
  const [newRule, setNewRule] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('general');

  const {
    checkInTime = '15:00',
    checkOutTime = '11:00',
    checkInInstructions = '',
    cancellationPolicy = 'flexible',
    cancellationDetails,
    petPolicy = 'not_allowed',
    smokingPolicy = 'not_allowed',
    childPolicy = 'all_ages',
    minAge,
    securityDeposit,
  } = data || {};

  const safeHouseRules = data?.houseRules || [];
  const safeEcoFeatures = data?.ecoFeatures || [];
  const safeEcoCerts = data?.ecoCertifications || [];

  const handleUpdate = (updates: any) => {
    onChange({ ...data, ...updates });
  };

  const addRule = () => {
    if (newRule.trim() && !safeHouseRules.includes(newRule.trim())) {
      handleUpdate({ houseRules: [...safeHouseRules, newRule.trim()] });
      setNewRule('');
    }
  };

  const toggleRule = (rule: string) => {
    if (safeHouseRules.includes(rule)) {
      handleUpdate({ houseRules: safeHouseRules.filter((r: string) => r !== rule) });
    } else {
      handleUpdate({ houseRules: [...safeHouseRules, rule] });
    }
  };

  const toggleEcoFeature = (feature: string) => {
    if (safeEcoFeatures.includes(feature)) {
      handleUpdate({ ecoFeatures: safeEcoFeatures.filter((f: string) => f !== feature) });
    } else {
      handleUpdate({ ecoFeatures: [...safeEcoFeatures, feature] });
    }
  };

  const toggleEcoCert = (cert: string) => {
    if (safeEcoCerts.includes(cert)) {
      handleUpdate({ ecoCertifications: safeEcoCerts.filter((c: string) => c !== cert) });
    } else {
      handleUpdate({ ecoCertifications: [...safeEcoCerts, cert] });
    }
  };

  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  });

  const selectClass = 'w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 appearance-none cursor-pointer';
  const labelClass = 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

      {/* ━━━━━━━━━━ SECTION 1: LOGISTICS ━━━━━━━━━━ */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5 uppercase tracking-wider">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          Logistics
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Check-in */}
          <div>
            <label className={labelClass}>Check-in After</label>
            <select
              value={checkInTime}
              onChange={(e) => handleUpdate({ checkInTime: e.target.value })}
              className={selectClass}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Check-out */}
          <div>
            <label className={labelClass}>Check-out Before</label>
            <select
              value={checkOutTime}
              onChange={(e) => handleUpdate({ checkOutTime: e.target.value })}
              className={selectClass}
            >
              {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Check-in Instructions */}
          <div className="col-span-2">
            <label className={labelClass}>Check-in Instructions</label>
            <textarea
              value={checkInInstructions}
              onChange={(e) => handleUpdate({ checkInInstructions: e.target.value })}
              placeholder="e.g. Use lockbox code 1234, key is under the mat, front desk is 24h..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all hover:border-neutral-300 resize-none placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━ SECTION 2: POLICIES ━━━━━━━━━━ */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5 uppercase tracking-wider">
          <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-600" />
          </div>
          Guest Policies
        </h3>

        {/* Cancellation — card-style selector */}
        <div className="mb-5">
          <label className={labelClass}>Cancellation Policy</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {CANCELLATION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleUpdate({ cancellationPolicy: opt.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  cancellationPolicy === opt.value
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <p className={`text-sm font-bold ${cancellationPolicy === opt.value ? 'text-primary-700' : 'text-gray-900'}`}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cancellation Details for strict tiers */}
        {(cancellationPolicy === 'strict' || cancellationPolicy === 'super_strict') && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <p className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Custom penalty details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Free cancel within (days)</label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={cancellationDetails?.freeCancelDays ?? (cancellationPolicy === 'strict' ? 30 : 0)}
                  onChange={(e) => handleUpdate({
                    cancellationDetails: {
                      ...cancellationDetails,
                      freeCancelDays: parseInt(e.target.value) || 0,
                    }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Late cancellation penalty (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={cancellationDetails?.penaltyPercent ?? (cancellationPolicy === 'super_strict' ? 100 : 50)}
                  onChange={(e) => handleUpdate({
                    cancellationDetails: {
                      ...cancellationDetails,
                      penaltyPercent: parseInt(e.target.value) || 0,
                    }
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Policy grid: Pets, Smoking, Children, Security Deposit */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pets */}
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Dog className="w-3 h-3" /> Pets
            </label>
            <select
              value={petPolicy}
              onChange={(e) => handleUpdate({ petPolicy: e.target.value })}
              className={selectClass}
            >
              <option value="not_allowed">No pets</option>
              <option value="allowed">Pets welcome</option>
              <option value="allowed_with_fee">Allowed (extra fee)</option>
            </select>
          </div>

          {/* Smoking */}
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Cigarette className="w-3 h-3" /> Smoking
            </label>
            <select
              value={smokingPolicy}
              onChange={(e) => handleUpdate({ smokingPolicy: e.target.value })}
              className={selectClass}
            >
              <option value="not_allowed">No smoking</option>
              <option value="designated_areas">Outside only</option>
              <option value="allowed">Allowed</option>
            </select>
          </div>

          {/* Children */}
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Baby className="w-3 h-3" /> Children
            </label>
            <select
              value={childPolicy}
              onChange={(e) => handleUpdate({ childPolicy: e.target.value })}
              className={selectClass}
            >
              <option value="all_ages">All ages welcome</option>
              <option value="children_5_plus">Children 5+</option>
              <option value="children_12_plus">Children 12+</option>
              <option value="adults_only">Adults only (18+)</option>
            </select>
          </div>

          {/* Security Deposit */}
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <DollarSign className="w-3 h-3" /> Security Deposit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                min={0}
                step={50}
                value={securityDeposit ?? ''}
                onChange={(e) => handleUpdate({ securityDeposit: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all hover:border-neutral-300"
              />
            </div>
          </div>
        </div>

        {/* Min Age — shown when child policy restricts */}
        {childPolicy !== 'all_ages' && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Minimum guest age</span>
            </div>
            <input
              type="number"
              min={0}
              max={99}
              value={minAge ?? (childPolicy === 'adults_only' ? 18 : childPolicy === 'children_12_plus' ? 12 : 5)}
              onChange={(e) => handleUpdate({ minAge: parseInt(e.target.value) || undefined })}
              className="w-20 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-gray-500">years old</span>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━ SECTION 3: HOUSE RULES ━━━━━━━━━━ */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Music className="w-4 h-4 text-violet-600" />
            </div>
            House Rules
          </h3>
          {safeHouseRules.length > 0 && (
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              {safeHouseRules.length} active
            </span>
          )}
        </div>

        {/* Category tabs — horizontal row */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {RULE_CATEGORIES.map(cat => {
            const CatIcon = cat.icon;
            const isActive = expandedCategory === cat.id;
            const activeCount = cat.rules.filter(r => safeHouseRules.includes(r)).length;

            return (
              <button
                key={cat.id}
                onClick={() => setExpandedCategory(isActive ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? `${cat.bgColor} border-current ${cat.color} shadow-sm`
                    : 'bg-neutral-50 border-neutral-200 text-gray-500 hover:border-neutral-300 hover:text-gray-700'
                }`}
              >
                <CatIcon className={`w-3.5 h-3.5 ${isActive ? cat.color : 'text-gray-400'}`} />
                {cat.label}
                {activeCount > 0 && (
                  <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cat.bgColor} ${cat.color}`}>
                    {activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected category rules */}
        {expandedCategory && (() => {
          const cat = RULE_CATEGORIES.find(c => c.id === expandedCategory);
          if (!cat) return null;
          return (
            <div className="flex flex-wrap gap-2 mb-5 p-4 rounded-xl bg-neutral-50/50 border border-neutral-100">
              {cat.rules.map(rule => {
                const isActive = safeHouseRules.includes(rule);
                return (
                  <button
                    key={rule}
                    onClick={() => toggleRule(rule)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      isActive
                        ? `${cat.bgColor} border-current ${cat.color}`
                        : 'bg-white border-neutral-200 text-gray-500 hover:border-neutral-300 hover:text-gray-700'
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 inline mr-1" />}
                    {rule}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Custom rule input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="Add a custom rule..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all hover:border-neutral-300 placeholder-gray-400"
          />
          <button
            onClick={addRule}
            disabled={!newRule.trim()}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Active rules list */}
        {safeHouseRules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {safeHouseRules.map((rule: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-bold group"
              >
                <Check className="w-3 h-3" />
                {rule}
                <button
                  onClick={() => handleUpdate({ houseRules: safeHouseRules.filter((_: string, i: number) => i !== idx) })}
                  className="ml-0.5 text-primary-300 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {safeHouseRules.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-3">
            Select rules from the categories above or add your own.
          </p>
        )}
      </div>

      {/* ━━━━━━━━━━ SECTION 4: AI CO-HOST SETTINGS ━━━━━━━━━━ */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 rounded-2xl border border-indigo-100 shadow-sm p-5 relative overflow-hidden group">
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 uppercase tracking-wider">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  AI Co-Host Assistant
                </h3>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Beta
                </span>
            </div>
            
            <p className="text-xs text-indigo-800/80 mb-4 max-w-xl pr-8">
                Your AI Co-Host automatically answers guest messages 24/7 based on your House Rules. Add custom instructions below to teach your AI exactly how to handle specific scenarios.
            </p>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 shadow-sm">
                <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 block">
                    Custom AI Directives (Optional)
                </label>
                <textarea
                  placeholder="e.g. 'If guests ask about parking, tell them street parking is free but watch out for street cleaning on Tuesdays. Always be enthusiastic and use emojis!'"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/50 border border-indigo-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-indigo-300 resize-none placeholder-indigo-300/70"
                />
            </div>
        </div>
        
        {/* Decorative */}
        <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 text-indigo-500/10 rotate-12 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
      </div>

      {/* ━━━━━━━━━━ SECTION 5: ECO & SUSTAINABILITY ━━━━━━━━━━ */}
      <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-5 uppercase tracking-wider">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          Eco & Sustainability
        </h3>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Eco Features */}
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 block">Features</label>
            <div className="flex flex-wrap gap-2">
              {ECO_FEATURES.map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleEcoFeature(feature)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                    safeEcoFeatures.includes(feature)
                      ? 'bg-white border-emerald-200 text-emerald-700 shadow-sm'
                      : 'bg-white/50 border-transparent text-emerald-800/50 hover:bg-white hover:text-emerald-800'
                  }`}
                >
                  {safeEcoFeatures.includes(feature) && <Check className="w-3 h-3 text-emerald-500" />}
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Eco Certifications */}
          <div>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1 block">
              <Award className="w-3 h-3" /> Certifications
            </label>
            <div className="flex flex-wrap gap-2">
              {ECO_CERTIFICATIONS.map(cert => (
                <button
                  key={cert}
                  onClick={() => toggleEcoCert(cert)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                    safeEcoCerts.includes(cert)
                      ? 'bg-white border-emerald-300 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                      : 'bg-white/50 border-transparent text-emerald-800/50 hover:bg-white hover:text-emerald-800'
                  }`}
                >
                  {safeEcoCerts.includes(cert) && <BadgeCheck className="w-3 h-3 text-emerald-500" />}
                  {cert}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
