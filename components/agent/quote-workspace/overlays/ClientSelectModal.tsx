"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Search, User, UserPlus, Zap, Loader2, Mail, Phone, Check } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteClient } from "../types/quote-workspace.types";

export default function ClientSelectModal() {
  const { state, setClient, closeClientModal } = useQuoteWorkspace();
  const isOpen = state.ui.clientModalOpen;

  const [clients, setClients] = useState<QuoteClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch clients
  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients by search
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Handle client selection
  const handleSelect = (client: QuoteClient) => {
    setClient(client);
    closeClientModal();
  };

  // Handle quick create
  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCreateLoading(true);

    try {
      const res = await fetch("/api/agents/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickCreateData),
      });

      if (res.ok) {
        const data = await res.json();
        const newClient: QuoteClient = {
          id: data.id,
          ...quickCreateData,
        };
        setClient(newClient);
        closeClientModal();
      }
    } catch (error) {
      console.error("Failed to create client:", error);
    } finally {
      setQuickCreateLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeClientModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Select Client
                  </Dialog.Title>
                  <button
                    onClick={closeClientModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setShowQuickCreate(false)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      !showQuickCreate
                        ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Existing ({clients.length})
                  </button>
                  <button
                    onClick={() => setShowQuickCreate(true)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      showQuickCreate
                        ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Quick Create
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <AnimatePresence mode="wait">
                    {!showQuickCreate ? (
                      <motion.div
                        key="select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        {/* Search */}
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        {/* Client List */}
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {loading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                          ) : filteredClients.length === 0 ? (
                            <div className="text-center py-8">
                              <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                {searchQuery ? "No clients found" : "No clients yet"}
                              </p>
                              <button
                                onClick={() => setShowQuickCreate(true)}
                                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Create first client
                              </button>
                            </div>
                          ) : (
                            filteredClients.map((client) => (
                              <button
                                key={client.id}
                                onClick={() => handleSelect(client)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                  state.client?.id === client.id
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {client.firstName[0]}{client.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {client.firstName} {client.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                </div>
                                {state.client?.id === client.id && (
                                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleQuickCreate}
                        className="space-y-4"
                      >
                        {/* Info Banner */}
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-emerald-900 text-sm">Quick Create</p>
                            <p className="text-xs text-emerald-700">Just 3 required fields</p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={quickCreateData.firstName}
                              onChange={(e) => setQuickCreateData({ ...quickCreateData, firstName: e.target.value })}
                              required
                              placeholder="John"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={quickCreateData.lastName}
                              onChange={(e) => setQuickCreateData({ ...quickCreateData, lastName: e.target.value })}
                              required
                              placeholder="Doe"
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              value={quickCreateData.email}
                              onChange={(e) => setQuickCreateData({ ...quickCreateData, email: e.target.value })}
                              required
                              placeholder="john@example.com"
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={quickCreateData.phone}
                              onChange={(e) => setQuickCreateData({ ...quickCreateData, phone: e.target.value })}
                              placeholder="+1 (555) 123-4567"
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowQuickCreate(false)}
                            className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={quickCreateLoading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                          >
                            {quickCreateLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                            {quickCreateLoading ? "Creating..." : "Create & Select"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
