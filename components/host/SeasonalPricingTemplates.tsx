'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Sun, Snowflake, Flower2, Moon, Percent, Sparkles, Undo2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeasonTemplate {
  id: string;
  name: string;
  description: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  /** e.g. 1.30 = +30%, 0.85 = -15% */
  priceMultiplier: number;
  weekendOnly?: boolean;
  icon: 'sun' | 'snowflake' | 'flower' | 'moon' | 'calendar' | 'sparkles';
  gradient: string;
  iconColor: string;
}

interface ActiveSeason {
  templateId: string;
  appliedAt: string; // ISO timestamp
}

interface SeasonalPricingTemplatesProps {
  /** Called when host applies a template */
  onApply: (startDate: Date, endDate: Date, priceMultiplier: number) => void;
  /** Base nightly price used for preview calculations */
  basePrice?: number;
  /** Control visibility */
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Pre-built season templates
// ---------------------------------------------------------------------------

const SEASON_TEMPLATES: SeasonTemplate[] = [
  {
    id: 'peak-summer',
    name: 'Peak Summer',
    description: 'High demand vacation months',
    startMonth: 6,
    startDay: 1,
    endMonth: 8,
    endDay: 31,
    priceMultiplier: 1.30,
    icon: 'sun',
    gradient: 'from-amber-400 via-orange-400 to-red-400',
    iconColor: 'text-amber-100',
  },
  {
    id: 'holiday-season',
    name: 'Holiday Season',
    description: 'Christmas & New Year peak',
    startMonth: 12,
    startDay: 20,
    endMonth: 1,
    endDay: 5,
    priceMultiplier: 1.50,
    icon: 'snowflake',
    gradient: 'from-red-500 via-rose-500 to-pink-500',
    iconColor: 'text-red-100',
  },
  {
    id: 'spring-break',
    name: 'Spring Break',
    description: 'Family & student travel surge',
    startMonth: 3,
    startDay: 15,
    endMonth: 4,
    endDay: 15,
    priceMultiplier: 1.25,
    icon: 'flower',
    gradient: 'from-emerald-400 via-green-400 to-teal-400',
    iconColor: 'text-emerald-100',
  },
  {
    id: 'low-season',
    name: 'Low Season',
    description: 'Post-holiday slowdown',
    startMonth: 1,
    startDay: 10,
    endMonth: 3,
    endDay: 14,
    priceMultiplier: 0.85,
    icon: 'moon',
    gradient: 'from-blue-400 via-indigo-400 to-blue-500',
    iconColor: 'text-blue-100',
  },
  {
    id: 'weekend-premium',
    name: 'Weekend Premium',
    description: 'Friday & Saturday nights',
    startMonth: 1,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    priceMultiplier: 1.20,
    weekendOnly: true,
    icon: 'sparkles',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    iconColor: 'text-violet-100',
  },
];

const STORAGE_KEY = 'host-seasonal-pricing';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIconComponent(icon: SeasonTemplate['icon']) {
  switch (icon) {
    case 'sun': return Sun;
    case 'snowflake': return Snowflake;
    case 'flower': return Flower2;
    case 'moon': return Moon;
    case 'sparkles': return Sparkles;
    default: return Calendar;
  }
}

function formatPercentage(multiplier: number): string {
  const pct = Math.round((multiplier - 1) * 100);
  if (pct >= 0) return `+${pct}%`;
  return `${pct}%`;
}

function getDateRange(template: SeasonTemplate, year?: number): { start: Date; end: Date } {
  const y = year || new Date().getFullYear();
  const start = new Date(y, template.startMonth - 1, template.startDay);
  let end: Date;
  // Handle cross-year ranges (e.g. Dec 20 - Jan 5)
  if (template.endMonth < template.startMonth) {
    end = new Date(y + 1, template.endMonth - 1, template.endDay);
  } else {
    end = new Date(y, template.endMonth - 1, template.endDay);
  }
  return { start, end };
}

function formatDateRange(template: SeasonTemplate): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (template.weekendOnly) return 'Year-round (Fri-Sat)';
  const s = `${months[template.startMonth - 1]} ${template.startDay}`;
  const e = `${months[template.endMonth - 1]} ${template.endDay}`;
  return `${s} — ${e}`;
}

function loadActiveSeasons(): ActiveSeason[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveActiveSeasons(active: ActiveSeason[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
}

// ---------------------------------------------------------------------------
// Custom Season Form
// ---------------------------------------------------------------------------

function CustomSeasonForm({
  basePrice,
  onApply,
}: {
  basePrice: number;
  onApply: (startDate: Date, endDate: Date, priceMultiplier: number) => void;
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [percentage, setPercentage] = useState(10);

  const multiplier = 1 + percentage / 100;
  const previewPrice = (basePrice * multiplier).toFixed(2);

  const handleApply = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      toast.error('End date must be after start date');
      return;
    }
    onApply(start, end, multiplier);
    toast.success('Custom pricing applied');
  };

  return (
    <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-neutral-500" />
        <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Custom Season</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 block">
          Adjustment: <span className={cn('font-black', percentage >= 0 ? 'text-emerald-600' : 'text-red-500')}>{percentage >= 0 ? '+' : ''}{percentage}%</span>
        </label>
        <input
          type="range"
          min={-50}
          max={100}
          step={5}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-[10px] font-bold text-neutral-400 mt-1">
          <span>-50%</span>
          <span>0%</span>
          <span>+100%</span>
        </div>
      </div>
      {basePrice > 0 && (
        <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-neutral-100">
          <span className="text-xs text-neutral-500 font-medium">Preview</span>
          <span className="text-sm font-black text-[#0A0A0A]">${previewPrice}<span className="text-neutral-400 font-medium">/night</span></span>
        </div>
      )}
      <button
        type="button"
        onClick={handleApply}
        className="w-full py-3 rounded-xl bg-[#0A0A0A] text-white text-sm font-bold hover:bg-neutral-800 transition-colors shadow-sm"
      >
        Apply Custom Pricing
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SeasonalPricingTemplates({ onApply, basePrice = 150, open, onClose }: SeasonalPricingTemplatesProps) {
  const [activeSeasons, setActiveSeasons] = useState<ActiveSeason[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const lastUndoRef = useRef<{ templateId: string; timeout: NodeJS.Timeout } | null>(null);

  useEffect(() => {
    setActiveSeasons(loadActiveSeasons());
  }, []);

  const isActive = useCallback(
    (templateId: string) => activeSeasons.some((a) => a.templateId === templateId),
    [activeSeasons],
  );

  const handleApply = useCallback(
    (template: SeasonTemplate) => {
      const { start, end } = getDateRange(template);

      // Mark as active
      const newActive: ActiveSeason = { templateId: template.id, appliedAt: new Date().toISOString() };
      const updated = [...activeSeasons.filter((a) => a.templateId !== template.id), newActive];
      setActiveSeasons(updated);
      saveActiveSeasons(updated);

      // Call parent
      onApply(start, end, template.priceMultiplier);

      // Undo toast
      if (lastUndoRef.current) clearTimeout(lastUndoRef.current.timeout);

      const toastId = toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              Applied <strong>{template.name}</strong> ({formatPercentage(template.priceMultiplier)})
            </span>
            <button
              onClick={() => {
                // Undo: remove from active
                const reverted = updated.filter((a) => a.templateId !== template.id);
                setActiveSeasons(reverted);
                saveActiveSeasons(reverted);
                toast.dismiss(t.id);
                toast.success(`Undid "${template.name}"`);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </button>
          </div>
        ),
        { duration: 4000 },
      );

      lastUndoRef.current = {
        templateId: template.id,
        timeout: setTimeout(() => {
          lastUndoRef.current = null;
        }, 4000),
      };
    },
    [activeSeasons, onApply],
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal / Drawer */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed z-50 bg-white rounded-[2rem] shadow-2xl overflow-hidden',
              // Mobile: bottom drawer
              'inset-x-2 bottom-2 max-h-[90vh]',
              // Desktop: centered modal
              'md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh]',
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight">Seasonal Pricing</h2>
                <p className="text-xs text-neutral-400 font-medium mt-1">Apply smart pricing across date ranges</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Seasons Badge Row */}
            {activeSeasons.length > 0 && (
              <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-700 shrink-0">Active:</span>
                {activeSeasons.map((a) => {
                  const tmpl = SEASON_TEMPLATES.find((t) => t.id === a.templateId);
                  if (!tmpl) return null;
                  return (
                    <span key={a.templateId} className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                      {tmpl.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Season Cards */}
            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {SEASON_TEMPLATES.map((template) => {
                const Icon = getIconComponent(template.icon);
                const pct = Math.round((template.priceMultiplier - 1) * 100);
                const isPositive = pct >= 0;
                const previewPrice = (basePrice * template.priceMultiplier).toFixed(0);
                const active = isActive(template.id);

                return (
                  <div
                    key={template.id}
                    className={cn(
                      'relative rounded-2xl overflow-hidden border transition-all',
                      active ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-neutral-100 hover:border-neutral-200',
                    )}
                  >
                    {/* Gradient top strip */}
                    <div className={cn('h-1.5 bg-gradient-to-r', template.gradient)} />

                    <div className="p-4 flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn('shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', template.gradient)}>
                        <Icon className={cn('w-6 h-6', template.iconColor)} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-black text-[#0A0A0A] text-sm tracking-tight">{template.name}</h3>
                          {active && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">{template.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{formatDateRange(template)}</span>
                          <span className={cn('text-sm font-black', isPositive ? 'text-emerald-600' : 'text-red-500')}>
                            {formatPercentage(template.priceMultiplier)}
                          </span>
                        </div>
                        {/* Price preview */}
                        {basePrice > 0 && (
                          <div className="mt-2 text-xs text-neutral-500">
                            <span className="font-medium">${basePrice}/night</span>
                            <span className="mx-1.5 text-neutral-300">&rarr;</span>
                            <span className="font-black text-[#0A0A0A]">${previewPrice}/night</span>
                          </div>
                        )}
                      </div>

                      {/* Apply Button */}
                      <button
                        type="button"
                        onClick={() => handleApply(template)}
                        className={cn(
                          'shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm',
                          active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-[#0A0A0A] text-white hover:bg-neutral-800',
                        )}
                      >
                        {active ? 'Reapply' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Custom Season */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-neutral-200 text-sm font-bold text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors"
                >
                  <Percent className="w-4 h-4" />
                  {showCustom ? 'Hide Custom Season' : 'Create Custom Season'}
                </button>

                <AnimatePresence>
                  {showCustom && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3">
                        <CustomSeasonForm basePrice={basePrice} onApply={onApply} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
