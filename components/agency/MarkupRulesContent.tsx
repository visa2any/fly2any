'use client';

// components/agency/MarkupRulesContent.tsx
// Level 6 Ultra-Premium Markup Rules Management
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent, Plus, MoreVertical, Edit, Trash2, X,
  Plane, Building2, Compass, Car, Package, Check,
  ChevronDown, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MarkupRule {
  id: string;
  name: string;
  description: string | null;
  productType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minMarkup: number;
  maxMarkup: number;
  suggestedMarkup: number;
  appliesToAll: boolean;
  agentIds: string[];
  priority: number;
  active: boolean;
  createdAt: Date;
}

interface TeamMember {
  id: string;
  agent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface Props {
  markupRules: MarkupRule[];
  teamMembers: TeamMember[];
}

const productTypes = [
  { value: 'ALL', label: 'All Products', icon: Package, gradient: 'from-violet-500 to-purple-600' },
  { value: 'FLIGHT', label: 'Flights', icon: Plane, gradient: 'from-blue-500 to-indigo-600' },
  { value: 'HOTEL', label: 'Hotels', icon: Building2, gradient: 'from-emerald-500 to-teal-600' },
  { value: 'ACTIVITY', label: 'Activities', icon: Compass, gradient: 'from-amber-500 to-orange-600' },
  { value: 'TRANSFER', label: 'Transfers', icon: Car, gradient: 'from-rose-500 to-pink-600' },
];

export default function MarkupRulesContent({ markupRules: initialRules, teamMembers }: Props) {
  const [rules, setRules] = useState(initialRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<MarkupRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productType: 'ALL',
    minPrice: '',
    maxPrice: '',
    minMarkup: 5,
    maxMarkup: 50,
    suggestedMarkup: 15,
    appliesToAll: true,
    agentIds: [] as string[],
    priority: 0,
    active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      productType: 'ALL',
      minPrice: '',
      maxPrice: '',
      minMarkup: 5,
      maxMarkup: 50,
      suggestedMarkup: 15,
      appliesToAll: true,
      agentIds: [],
      priority: 0,
      active: true,
    });
    setEditingRule(null);
  };

  const openEditModal = (rule: MarkupRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      productType: rule.productType || 'ALL',
      minPrice: rule.minPrice?.toString() || '',
      maxPrice: rule.maxPrice?.toString() || '',
      minMarkup: rule.minMarkup,
      maxMarkup: rule.maxMarkup,
      suggestedMarkup: rule.suggestedMarkup,
      appliesToAll: rule.appliesToAll,
      agentIds: rule.agentIds,
      priority: rule.priority,
      active: rule.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      };

      const method = editingRule ? 'PUT' : 'POST';
      const body = editingRule ? { id: editingRule.id, ...payload } : payload;

      const res = await fetch('/api/agency/markup-rules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingRule ? 'Rule updated!' : 'Rule created!');
      setShowModal(false);
      resetForm();

      // Update local state
      if (editingRule) {
        setRules(rules.map(r => r.id === editingRule.id ? data.rule : r));
      } else {
        setRules([data.rule, ...rules]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/agency/markup-rules?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Rule deleted!');
      setRules(rules.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rule');
    } finally {
      setDeleting(null);
    }
  };

  const toggleRuleActive = async (rule: MarkupRule) => {
    try {
      const res = await fetch('/api/agency/markup-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, active: !rule.active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRules(rules.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
      toast.success(`Rule ${rule.active ? 'disabled' : 'enabled'}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update rule');
    }
  };

  const getProductIcon = (type: string | null) => {
    const product = productTypes.find(p => p.value === (type || 'ALL'));
    return product || productTypes[0];
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Markup Rules</h1>
          <p className="text-gray-600 mt-1">
            Configure pricing rules for your team
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </motion.button>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">How Markup Rules Work</p>
          <p className="text-amber-700 mt-1">
            Markup rules define the pricing flexibility for your team. Set minimum and maximum
            markup percentages, and a suggested default. Higher priority rules override lower ones.
          </p>
        </div>
      </motion.div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center border border-gray-100"
        >
          <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Markup Rules Yet</h3>
          <p className="text-gray-500 mb-6">Create rules to control how your team prices bookings</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
          >
            Create Your First Rule
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule, idx) => {
            const product = getProductIcon(rule.productType);
            const ProductIcon = product.icon;

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  rule.active
                    ? 'border-gray-100 shadow-sm hover:shadow-md'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shadow-lg`}>
                      <ProductIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{rule.name}</p>
                      <p className="text-xs text-gray-500">{product.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRuleActive(rule)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        rule.active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => openEditModal(rule)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      disabled={deleting === rule.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className={`w-4 h-4 ${deleting === rule.id ? 'text-gray-300' : 'text-red-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {rule.description && (
                  <p className="text-sm text-gray-600 mb-4">{rule.description}</p>
                )}

                {/* Markup Range */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Markup Range</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {rule.minMarkup}% - {rule.maxMarkup}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{
                        left: `${rule.minMarkup}%`,
                        width: `${rule.maxMarkup - rule.minMarkup}%`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow"
                      style={{ left: `calc(${rule.suggestedMarkup}% - 6px)` }}
                    />
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-xs text-gray-500">
                      Suggested: <span className="font-semibold text-gray-700">{rule.suggestedMarkup}%</span>
                    </span>
                  </div>
                </div>

                {/* Price Range */}
                {(rule.minPrice || rule.maxPrice) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400">Price range:</span>
                    <span className="font-medium">
                      ${rule.minPrice?.toLocaleString() || '0'} - ${rule.maxPrice?.toLocaleString() || '∞'}
                    </span>
                  </div>
                )}

                {/* Applies To */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>Applies to:</span>
                  {rule.appliesToAll ? (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                      All Agents
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {rule.agentIds.length} agent{rule.agentIds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => { setShowModal(false); resetForm(); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRule ? 'Edit Markup Rule' : 'Create Markup Rule'}
                </h3>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Flight Markup"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                  <div className="grid grid-cols-5 gap-2">
                    {productTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.productType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, productType: type.value })}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                            {type.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Markup Range */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Markup Range (%)</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={formData.minMarkup}
                        onChange={(e) => setFormData({ ...formData, minMarkup: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Suggested</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={formData.suggestedMarkup}
                        onChange={(e) => setFormData({ ...formData, suggestedMarkup: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center font-semibold text-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={formData.maxMarkup}
                        onChange={(e) => setFormData({ ...formData, maxMarkup: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Applies To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Applies To</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, appliesToAll: true, agentIds: [] })}
                      className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-medium transition-all ${
                        formData.appliesToAll
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      All Agents
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, appliesToAll: false })}
                      className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-medium transition-all ${
                        !formData.appliesToAll
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Select Agents
                    </button>
                  </div>

                  {/* Agent Selection */}
                  {!formData.appliesToAll && teamMembers.length > 0 && (
                    <div className="mt-3 border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                      {teamMembers.map((member) => {
                        const isSelected = formData.agentIds.includes(member.agent.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              const newIds = isSelected
                                ? formData.agentIds.filter(id => id !== member.agent.id)
                                : [...formData.agentIds, member.agent.id];
                              setFormData({ ...formData, agentIds: newIds });
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                              isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm text-gray-700">
                              {member.agent.firstName} {member.agent.lastName}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-gray-400 font-normal">(higher = applied first)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Active</p>
                    <p className="text-sm text-gray-500">Enable this rule</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      formData.active ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.active ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
