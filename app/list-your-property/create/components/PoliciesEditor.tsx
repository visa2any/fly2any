'use client';

import { useState } from 'react';
import { Clock, Shield, Plus, X, Cigarette, Dog, Music, Users, Leaf, Check } from 'lucide-react';
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
  'No parties',
  'Quiet hours 10PM',
  'No shoes',
  'No unregistered guests',
];

const ECO_FEATURES = [
  'Solar panels',
  'Recycling bins',
  'Composting',
  'LED lighting',
  'EV charger',
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <div className="grid lg:grid-cols-2 gap-6 h-full">
          
          {/* Left Column: Logistics & Core Policies */}
          <div className="space-y-5">
              
              {/* Check-in / Check-out */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-primary-500" /> Logistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Check-in After</label>
                          <select 
                             value={checkInTime}
                             onChange={(e) => handleUpdate({ checkInTime: e.target.value })}
                             className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                              {Array.from({ length: 48 }).map((_, i) => {
                                  const h = Math.floor(i / 2);
                                  const m = i % 2 === 0 ? '00' : '30';
                                  const time = `${h.toString().padStart(2, '0')}:${m}`;
                                  return <option key={time} value={time}>{time}</option>;
                              })}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Check-out Before</label>
                          <select 
                             value={checkOutTime}
                             onChange={(e) => handleUpdate({ checkOutTime: e.target.value })}
                             className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                              {Array.from({ length: 48 }).map((_, i) => {
                                  const h = Math.floor(i / 2);
                                  const m = i % 2 === 0 ? '00' : '30';
                                  const time = `${h.toString().padStart(2, '0')}:${m}`;
                                  return <option key={time} value={time}>{time}</option>;
                              })}
                          </select>
                      </div>
                  </div>
              </div>

              {/* Core Policies */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <Shield className="w-4 h-4 text-primary-500" /> Core Policies
                  </h3>
                  
                  {/* Cancellation */}
                  <div>
                      <label className="text-sm font-semibold text-gray-600 mb-1 block">Cancellation Policy</label>
                      <select 
                        value={cancellationPolicy}
                        onChange={(e) => handleUpdate({ cancellationPolicy: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 text-gray-900 text-sm outline-none focus:border-primary-500 hover:border-primary-300 transition-colors"
                      >
                        <option value="flexible">Flexible (Full refund 1 day prior)</option>
                        <option value="moderate">Moderate (Full refund 5 days prior)</option>
                        <option value="strict">Strict (Full refund 30 days prior)</option>
                      </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                       {/* Pet Policy */}
                       <div>
                          <label className="text-sm font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Dog className="w-3 h-3" /> Pets</label>
                          <select 
                            value={petPolicy}
                            onChange={(e) => handleUpdate({ petPolicy: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-medium text-gray-900 outline-none focus:border-primary-500"
                          >
                            <option value="not_allowed">No pets</option>
                            <option value="allowed">Allowed</option>
                            <option value="allowed_with_fee">Extra fee</option>
                          </select>
                       </div>

                       {/* Smoking Policy */}
                       <div>
                          <label className="text-sm font-semibold text-gray-600 mb-1 block flex items-center gap-1"><Cigarette className="w-3 h-3" /> Smoking</label>
                          <select 
                            value={smokingPolicy}
                            onChange={(e) => handleUpdate({ smokingPolicy: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-medium text-gray-900 outline-none focus:border-primary-500"
                          >
                            <option value="not_allowed">No smoking</option>
                            <option value="designated_areas">Outside only</option>
                            <option value="allowed">Allowed</option>
                          </select>
                       </div>
                  </div>
              </div>

          </div>

          {/* Right Column: House Rules & Eco */}
          <div className="space-y-5">
              
              {/* House Rules */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col h-[60%]">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
                      <Music className="w-4 h-4 text-primary-500" /> House Rules
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_RULES.map(rule => (
                      <button
                        key={rule}
                        onClick={() => toggleRule(rule)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          safeHouseRules.includes(rule) 
                            ? 'bg-primary-50 border-primary-200 text-primary-700' 
                            : 'bg-neutral-50 border-neutral-200 text-gray-500 hover:border-neutral-300'
                        }`}
                      >
                        {rule}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addRule()}
                      placeholder="Add custom rule..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button 
                      onClick={addRule}
                      className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar max-h-[150px]">
                      {safeHouseRules.map((rule: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-neutral-50 border border-neutral-100 group">
                              <span className="text-gray-700 text-sm font-medium">• {rule}</span>
                              <button onClick={() => handleUpdate({ houseRules: safeHouseRules.filter((r: string) => r !== rule) })} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <X className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                      {safeHouseRules.length === 0 && (
                          <p className="text-sm text-gray-400 italic text-center py-4">No specific rules set.</p>
                      )}
                  </div>
              </div>

              {/* Eco Features (Compact) */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-sm h-auto flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-3 uppercase tracking-wider">
                      <Leaf className="w-4 h-4 text-emerald-600" /> Eco-Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ECO_FEATURES.map(feature => (
                       <button
                         key={feature}
                         onClick={() => toggleEcoFeature(feature)}
                         className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                           safeEcoFeatures.includes(feature)
                             ? 'bg-white border-emerald-200 text-emerald-700 shadow-sm'
                             : 'bg-white/50 border-transparent text-emerald-800/60 hover:bg-white hover:text-emerald-800'
                         }`}
                       >
                         {safeEcoFeatures.includes(feature) && <Check className="w-3 h-3 text-emerald-500" />}
                         {feature}
                       </button>
                    ))}
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}
