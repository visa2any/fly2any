'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Plus, X, Copy, Pencil, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TemplateCategory = 'Check-in' | 'Check-out' | 'Amenities' | 'Directions' | 'Emergency' | 'Welcome';

interface MessageTemplate {
  id: string;
  title: string;
  body: string;
  category: TemplateCategory;
  isCustom?: boolean;
}

interface MessageTemplatesProps {
  /** Called when the host clicks a template — parent should insert into message input */
  onSelect: (templateBody: string) => void;
}

// ---------------------------------------------------------------------------
// Default templates
// ---------------------------------------------------------------------------

const CATEGORIES: TemplateCategory[] = ['Welcome', 'Check-in', 'Check-out', 'Amenities', 'Directions', 'Emergency'];

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'default-welcome',
    title: 'Welcome Message',
    body: 'Hi {{guest_name}}! Welcome to {{property_name}}. We\'re thrilled to host you. If there\'s anything you need during your stay, don\'t hesitate to reach out. Enjoy!',
    category: 'Welcome',
  },
  {
    id: 'default-checkin-instructions',
    title: 'Check-in Instructions',
    body: 'Hi {{guest_name}}, check-in at {{property_name}} is from 3:00 PM. You\'ll find a lockbox on the front door — I\'ll send you the code on the morning of your arrival. Please let me know your estimated arrival time!',
    category: 'Check-in',
  },
  {
    id: 'default-wifi',
    title: 'WiFi Password Sharing',
    body: 'Hey {{guest_name}}! Here are the WiFi details for {{property_name}}:\n\nNetwork: [NETWORK_NAME]\nPassword: [PASSWORD]\n\nEnjoy your stay!',
    category: 'Amenities',
  },
  {
    id: 'default-checkout-reminder',
    title: 'Check-out Reminder',
    body: 'Hi {{guest_name}}, just a friendly reminder that check-out at {{property_name}} is at 11:00 AM tomorrow. Please leave the keys on the kitchen counter. We hope you had a wonderful stay!',
    category: 'Check-out',
  },
  {
    id: 'default-restaurant-recs',
    title: 'Local Restaurant Recommendations',
    body: 'Hi {{guest_name}}! Here are some of our favourite spots near {{property_name}}:\n\n1. [Restaurant 1] — great for brunch\n2. [Restaurant 2] — best local cuisine\n3. [Restaurant 3] — perfect for dinner\n\nLet me know if you\'d like more suggestions!',
    category: 'Directions',
  },
  {
    id: 'default-emergency',
    title: 'Emergency Contacts',
    body: 'Hi {{guest_name}}, here are important contacts for {{property_name}}:\n\nEmergency: 911\nProperty Manager: [PHONE]\nBuilding Maintenance: [PHONE]\nNearest Hospital: [NAME & ADDRESS]\n\nStay safe!',
    category: 'Emergency',
  },
  {
    id: 'default-early-checkin',
    title: 'Early Check-in Response',
    body: 'Hi {{guest_name}}, thanks for asking! I\'ll do my best to arrange early check-in at {{property_name}}. I\'ll confirm availability the day before and let you know. If it\'s not possible, you\'re welcome to drop off your luggage anytime after noon.',
    category: 'Check-in',
  },
  {
    id: 'default-late-checkout',
    title: 'Late Check-out Response',
    body: 'Hi {{guest_name}}, I\'d be happy to offer a late check-out at {{property_name}} until 1:00 PM at no extra charge, subject to availability. I\'ll confirm the evening before your departure!',
    category: 'Check-out',
  },
  {
    id: 'default-noise-policy',
    title: 'Noise Policy Reminder',
    body: 'Hi {{guest_name}}, just a gentle reminder that {{property_name}} has quiet hours from 10:00 PM to 8:00 AM out of respect for our neighbors. Thank you for your understanding!',
    category: 'Amenities',
  },
  {
    id: 'default-key-handoff',
    title: 'Key Handoff Instructions',
    body: 'Hi {{guest_name}}! For your arrival at {{property_name}}, you\'ll find the keys in the lockbox located [LOCATION]. The code is [CODE]. Please make sure to lock up and return the keys to the lockbox when you leave.',
    category: 'Check-in',
  },
  {
    id: 'default-thank-review',
    title: 'Thank You & Review Request',
    body: 'Hi {{guest_name}}, thank you so much for staying at {{property_name}}! We truly hope you enjoyed your visit. If you have a moment, we\'d really appreciate a review — it helps future guests and means the world to us. Safe travels!',
    category: 'Welcome',
  },
  {
    id: 'default-directions',
    title: 'Directions to Property',
    body: 'Hi {{guest_name}}! Here are directions to {{property_name}}:\n\nFrom the airport: [DIRECTIONS]\nParking: [PARKING_INFO]\n\nIf you get lost, feel free to call me at [PHONE]. See you soon!',
    category: 'Directions',
  },
];

const STORAGE_KEY = 'host-message-templates';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadTemplates(): MessageTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_TEMPLATES;
    const parsed: MessageTemplate[] = JSON.parse(stored);
    // Merge: keep defaults that haven't been deleted, plus custom ones
    const customIds = new Set(parsed.map((t) => t.id));
    const merged = [
      ...DEFAULT_TEMPLATES.filter((d) => !customIds.has(d.id)),
      ...parsed,
    ];
    return merged;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function saveCustomTemplates(templates: MessageTemplate[]) {
  // Only persist custom templates + any default that was modified
  const toSave = templates.filter((t) => t.isCustom);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function generateId() {
  return 'custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessageTemplates({ onSelect }: MessageTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState<TemplateCategory>('Welcome');
  const panelRef = useRef<HTMLDivElement>(null);

  // Load on mount
  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  // Close on outside click (desktop)
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Filtered templates
  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Select template
  const handleSelect = useCallback(
    (template: MessageTemplate) => {
      onSelect(template.body);
      setOpen(false);
      toast.success(`Template "${template.title}" inserted`);
    },
    [onSelect],
  );

  // Copy to clipboard
  const handleCopy = useCallback((body: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(body);
    toast.success('Copied to clipboard');
  }, []);

  // Delete custom template
  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const template = templates.find((t) => t.id === id);
      if (!template?.isCustom) return;
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      saveCustomTemplates(updated);
      toast.success(`Deleted "${template.title}"`);
    },
    [templates],
  );

  // Open edit form
  const handleEdit = useCallback(
    (template: MessageTemplate, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!template.isCustom) return;
      setEditingTemplate(template);
      setFormTitle(template.title);
      setFormBody(template.body);
      setFormCategory(template.category);
      setShowForm(true);
    },
    [],
  );

  // Save form (create or update)
  const handleSaveForm = useCallback(() => {
    if (!formTitle.trim() || !formBody.trim()) {
      toast.error('Title and body are required');
      return;
    }
    let updated: MessageTemplate[];
    if (editingTemplate) {
      updated = templates.map((t) =>
        t.id === editingTemplate.id
          ? { ...t, title: formTitle.trim(), body: formBody.trim(), category: formCategory }
          : t,
      );
      toast.success(`Updated "${formTitle.trim()}"`);
    } else {
      const newTemplate: MessageTemplate = {
        id: generateId(),
        title: formTitle.trim(),
        body: formBody.trim(),
        category: formCategory,
        isCustom: true,
      };
      updated = [...templates, newTemplate];
      toast.success(`Created "${formTitle.trim()}"`);
    }
    setTemplates(updated);
    saveCustomTemplates(updated);
    resetForm();
  }, [formTitle, formBody, formCategory, editingTemplate, templates]);

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormTitle('');
    setFormBody('');
    setFormCategory('Welcome');
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'p-3 rounded-2xl border transition-all',
          open
            ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-sm'
            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 shadow-sm',
        )}
        title="Message Templates"
      >
        <FileText className="w-5 h-5" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Panel — slide up on mobile, dropdown on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'z-50 bg-white rounded-[2rem] shadow-xl border border-neutral-100 overflow-hidden',
                // Mobile: fixed bottom sheet
                'fixed inset-x-0 bottom-0 max-h-[85vh] md:max-h-none',
                // Desktop: absolute dropdown above the button
                'md:absolute md:bottom-full md:right-0 md:mb-2 md:w-[420px]',
              )}
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-[#0A0A0A] tracking-tight text-base">Message Templates</h3>
                  <p className="text-xs text-neutral-400 font-medium mt-0.5">Quick replies for common scenarios</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Create Custom</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Create / Edit Form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 border-b border-neutral-100 bg-neutral-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">
                          {editingTemplate ? 'Edit Template' : 'New Template'}
                        </span>
                        <button type="button" onClick={resetForm} className="text-xs font-bold text-neutral-400 hover:text-neutral-600">
                          Cancel
                        </button>
                      </div>
                      <input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Template title"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-[#0A0A0A] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <textarea
                        value={formBody}
                        onChange={(e) => setFormBody(e.target.value)}
                        placeholder="Template body — use {{guest_name}} and {{property_name}} for placeholders"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-[#0A0A0A] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as TemplateCategory)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleSaveForm}
                          className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm"
                        >
                          {editingTemplate ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search */}
              <div className="px-5 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-medium text-[#0A0A0A] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {(['All', ...CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border',
                      activeCategory === cat
                        ? 'bg-[#0A0A0A] text-white border-transparent shadow-sm'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="px-5 pb-5 max-h-[45vh] md:max-h-[360px] overflow-y-auto space-y-2">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-400 font-medium">No templates found</p>
                  </div>
                ) : (
                  filtered.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelect(template)}
                      className="w-full text-left bg-neutral-50 hover:bg-primary-50 rounded-xl p-3 cursor-pointer border border-transparent hover:border-primary-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-[#0A0A0A] truncate">{template.title}</span>
                            {template.isCustom && (
                              <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-md">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{template.category}</span>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{template.body}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => handleCopy(template.body, e)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCopy(template.body, e as unknown as React.MouseEvent); }}
                            className="p-1.5 rounded-lg hover:bg-white text-neutral-400 hover:text-neutral-600 transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </span>
                          {template.isCustom && (
                            <>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleEdit(template, e)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(template, e as unknown as React.MouseEvent); }}
                                className="p-1.5 rounded-lg hover:bg-white text-neutral-400 hover:text-neutral-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => handleDelete(template.id, e)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(template.id, e as unknown as React.MouseEvent); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
