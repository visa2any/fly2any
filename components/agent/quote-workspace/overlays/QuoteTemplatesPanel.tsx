"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, FolderOpen, Plus, Trash2, Star, Clock, MapPin,
  Loader2, ChevronRight, Search, Tag, Users, Check
} from "lucide-react";

interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isDefault: boolean;
  usageCount: number;
  destination?: string;
  duration?: number;
  travelers?: number;
  lastUsedAt?: string;
  createdAt: string;
}

interface QuoteTemplatesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: QuoteTemplate) => void;
  onSaveAsTemplate: () => void;
  currentQuoteData?: any;
}

const CATEGORIES = [
  { value: "", label: "All Templates" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "business", label: "Business" },
  { value: "family", label: "Family" },
  { value: "luxury", label: "Luxury" },
  { value: "budget", label: "Budget" },
  { value: "adventure", label: "Adventure" },
];

export default function QuoteTemplatesPanel({
  isOpen,
  onClose,
  onLoadTemplate,
  onSaveAsTemplate,
  currentQuoteData,
}: QuoteTemplatesPanelProps) {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("includePublic", "true");

      const res = await fetch(`/api/agents/quotes/templates?${params}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) return;

    setSavingTemplate(true);
    try {
      const res = await fetch("/api/agents/quotes/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName,
          description: newTemplateDescription,
          category: newTemplateCategory || undefined,
          ...currentQuoteData,
        }),
      });

      if (res.ok) {
        setShowSaveModal(false);
        setNewTemplateName("");
        setNewTemplateCategory("");
        setNewTemplateDescription("");
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    try {
      await fetch(`/api/agents/quotes/templates/${id}`, { method: "DELETE" });
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch(`/api/agents/quotes/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      fetchTemplates();
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quote Templates</h2>
                <p className="text-xs text-gray-500">{templates.length} templates available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Save Current
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Templates List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No templates found</p>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="mt-4 text-sm text-purple-600 hover:underline"
                >
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group px-6 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
                          {template.isDefault && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                              <Star className="w-3 h-3" /> Default
                            </span>
                          )}
                          {template.category && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              <Tag className="w-3 h-3" /> {template.category}
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-500 truncate mb-2">{template.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {template.destination && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {template.destination}
                            </span>
                          )}
                          {template.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {template.duration} days
                            </span>
                          )}
                          {template.travelers && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {template.travelers} travelers
                            </span>
                          )}
                          <span>Used {template.usageCount}x</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!template.isDefault && (
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Set as default"
                          >
                            <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                        <button
                          onClick={() => {
                            onLoadTemplate(template);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Use <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Save Template Modal */}
        <AnimatePresence>
          {showSaveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4"
              onClick={() => setShowSaveModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as Template</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                    <input
                      type="text"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="e.g., Luxury Europe Package"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newTemplateCategory}
                      onChange={(e) => setNewTemplateCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.filter((c) => c.value).map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Brief description of this template..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName.trim() || savingTemplate}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {savingTemplate ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Template
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
