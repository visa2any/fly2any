'use client';

import { useState } from 'react';
import { Clock, Shield, Plus, X, Cigarette, Dog, Music, Users, Leaf } from 'lucide-react';
import { CancellationPolicyType, PetPolicy, SmokingPolicy } from '@/lib/properties/types';

interface PoliciesEditorProps {
  data: {
      checkInTime: string;
      checkOutTime: string;
      cancellationPolicy: CancellationPolicyType;
      petPolicy?: PetPolicy;
      smokingPolicy?: SmokingPolicy;
      houseRules: string[];
      ecoFeatures?: string[];
  };
  onChange: (updates: any) => void;
}

const COMMON_RULES = [
  'No parties or events',
  'Quiet hours after 10:00 PM',
  'No shoes inside',
  'Turn off lights when leaving',
  'No unregistered guests',
];

const ECO_FEATURES = [
  'Solar panels',
  'Recycling bins available',
  'Composting',
  'LED lighting',
  'Rainwater harvesting',
  'Electric vehicle charger',
];

export function PoliciesEditor({ data, onChange }: PoliciesEditorProps) {
  const [newRule, setNewRule] = useState('');

  const {
      checkInTime = '15:00',
      checkOutTime = '11:00',
      cancellationPolicy = 'flexible',
      petPolicy = 'not_allowed',
      smokingPolicy = 'not_allowed'
  } = data || {};

  // Safe arrays ensuring they are never null/undefined
  const safeHouseRules = data?.houseRules || [];
  const safeEcoFeatures = data?.ecoFeatures || [];

  const handleUpdate = (updates: any) => {
      onChange({ ...data, ...updates });
  };

  const addRule = () => {
    if (newRule && !safeHouseRules.includes(newRule)) {
      handleUpdate({ houseRules: [...safeHouseRules, newRule] });
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Time Settings */}
      <section className="space-y-4">
        <h3 className="text-gray-900 font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" /> Check-in & Check-out
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Check-in After</label>
            <div className="relative">
                <select 
                  value={checkInTime}
                  onChange={(e) => handleUpdate({ checkInTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-200 text-gray-900 focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                >
                    {Array.from({ length: 24 * 2 }).map((_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        const time = `${h.toString().padStart(2, '0')}:${m}`;
                        return <option key={time} value={time}>{time}</option>;
                    })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4" />
                </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Check-out Before</label>
            <div className="relative">
                <select 
                  value={checkOutTime}
                  onChange={(e) => handleUpdate({ checkOutTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-200 text-gray-900 focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                >
                    {Array.from({ length: 24 * 2 }).map((_, i) => {
                        const h = Math.floor(i / 2);
                        const m = i % 2 === 0 ? '00' : '30';
                        const time = `${h.toString().padStart(2, '0')}:${m}`;
                        return <option key={time} value={time}>{time}</option>;
                    })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="space-y-4">
        <h3 className="text-gray-900 font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> Core Policies
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
              <Dog className="w-4 h-4 text-gray-500" /> Pet Policy
            </div>
            <select 
              value={petPolicy}
              onChange={(e) => handleUpdate({ petPolicy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-900 outline-none focus:border-primary-500"
            >
              <option value="not_allowed">No pets allowed</option>
              <option value="allowed">Pets allowed</option>
              <option value="allowed_with_fee">Allowed (Extra fee)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
              <Cigarette className="w-4 h-4 text-gray-500" /> Smoking Policy
            </div>
            <select 
              value={smokingPolicy}
              onChange={(e) => handleUpdate({ smokingPolicy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-900 outline-none focus:border-primary-500"
            >
              <option value="not_allowed">No, entirely smoke-free</option>
              <option value="designated_areas">Designated areas only</option>
              <option value="allowed">Allowed</option>
            </select>
          </div>
           
           <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
              <Shield className="w-4 h-4 text-gray-500" /> Cancellation Policy
            </div>
            <select 
              value={cancellationPolicy}
              onChange={(e) => handleUpdate({ cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-900 outline-none focus:border-primary-500"
            >
              <option value="flexible">Flexible (Full refund 1 day prior)</option>
              <option value="moderate">Moderate (Full refund 5 days prior)</option>
              <option value="strict">Strict (Full refund 30 days prior)</option>
              <option value="super_strict">Super Strict (No refunds)</option>
            </select>
          </div>
        </div>
      </section>

      {/* House Rules */}
      <section className="space-y-4">
        <h3 className="text-gray-900 font-bold flex items-center gap-2">
          <Music className="w-5 h-5 text-primary-500" /> House Rules
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {COMMON_RULES.map(rule => (
            <button
              key={rule}
              onClick={() => toggleRule(rule)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                safeHouseRules.includes(rule) 
                  ? 'bg-primary-50 border-primary-200 text-primary-700' 
                  : 'bg-white border-neutral-200 text-gray-500 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {rule}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            placeholder="Add a custom rule..."
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none shadow-sm placeholder-gray-400"
          />
          <button 
            onClick={addRule}
            className="px-6 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold transition-all"
          >
            Add
          </button>
        </div>

        {safeHouseRules.length > 0 && (
            <ul className="space-y-2">
            {safeHouseRules.map((rule: string, idx: number) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    <span className="text-gray-700 text-sm font-medium">• {rule}</span>
                    <button onClick={() => handleUpdate({ houseRules: safeHouseRules.filter((r: string) => r !== rule) })} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                    </button>
                </li>
            ))}
            </ul>
        )}
      </section>

      {/* Eco Features */}
      <section className="space-y-4">
        <h3 className="text-gray-900 font-bold flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-500" /> Sustainability
        </h3>
        <p className="text-gray-500 text-sm">Tell guests about your eco-friendly features.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ECO_FEATURES.map(feature => (
             <button
               key={feature}
               onClick={() => toggleEcoFeature(feature)}
               className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between shadow-sm ${
                 ecoFeatures.includes(feature)
                   ? 'bg-emerald-50 border-emerald-200 text-emerald-800 ring-1 ring-emerald-200'
                   : 'bg-white border-neutral-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-700'
               }`}
             >
               <span className="text-sm font-medium">{feature}</span>
               {ecoFeatures.includes(feature) && <Leaf className="w-3 h-3 text-emerald-500" />}
             </button>
          ))}
        </div>
      </section>
    </div>
  );
}
