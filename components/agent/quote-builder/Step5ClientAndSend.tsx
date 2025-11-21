"use client";

import { useState } from "react";
import { QuoteData } from "../QuoteBuilder";

interface Step5ClientAndSendProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }>;
  onSave: (sendNow: boolean) => Promise<void>;
  onPrev: () => void;
  onQuickCreate?: (clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) => Promise<string>;
  loading: boolean;
}

export default function QuoteBuilderStep5ClientAndSend({
  quoteData,
  updateQuoteData,
  clients,
  onSave,
  onPrev,
  onQuickCreate,
  loading,
}: Step5ClientAndSendProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  const selectedClient = clients.find((c) => c.id === quoteData.clientId);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onQuickCreate) return;

    setQuickCreateLoading(true);
    try {
      const newClientId = await onQuickCreate(quickCreateData);
      updateQuoteData({ clientId: newClientId });
      setShowQuickCreate(false);
      setQuickCreateData({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (error) {
      console.error("Quick create error:", error);
    } finally {
      setQuickCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-4xl">📧</span>
          Almost Done! Who's This Quote For?
        </h2>
        <p className="text-lg text-gray-600">
          Select an existing client or create a new one in 30 seconds. Then send or save your quote!
        </p>
      </div>

      {/* Quote Summary Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quote Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {quoteData.destination && (
            <div>
              <p className="text-gray-600">Destination</p>
              <p className="font-semibold text-gray-900">{quoteData.destination}</p>
            </div>
          )}
          {quoteData.travelers > 0 && (
            <div>
              <p className="text-gray-600">Travelers</p>
              <p className="font-semibold text-gray-900">{quoteData.travelers}</p>
            </div>
          )}
          {quoteData.total > 0 && (
            <div>
              <p className="text-gray-600">Total</p>
              <p className="font-semibold text-gray-900">${quoteData.total.toFixed(2)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Products</p>
            <p className="font-semibold text-gray-900">
              {quoteData.flights.length + quoteData.hotels.length + quoteData.activities.length + quoteData.customItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* Client Selection */}
      {selectedClient ? (
        /* Selected Client Display */
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-300 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xl mr-4 shadow-lg">
                {selectedClient.firstName.charAt(0)}
                {selectedClient.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sending Quote To</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedClient.email}</p>
                {selectedClient.phone && (
                  <p className="text-sm text-gray-500">{selectedClient.phone}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => updateQuoteData({ clientId: "" })}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change Client
            </button>
          </div>
        </div>
      ) : (
        /* Client Selection Interface */
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          {/* Toggle Buttons */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setShowQuickCreate(false)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                !showQuickCreate
                  ? "bg-primary-50 text-primary-700 border-b-2 border-primary-600"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Select Existing ({clients.length})
              </div>
            </button>
            <button
              onClick={() => setShowQuickCreate(true)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                showQuickCreate
                  ? "bg-green-50 text-green-700 border-b-2 border-green-600"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Create (30s)
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!showQuickCreate ? (
              <>
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Clients
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <svg
                      className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Client List */}
                {filteredClients.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {searchQuery ? (
                      <p className="text-gray-600 mb-4">No clients found matching "{searchQuery}"</p>
                    ) : (
                      <p className="text-gray-600 mb-4">No clients found</p>
                    )}
                    <button
                      onClick={() => setShowQuickCreate(true)}
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Your First Client
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => updateQuoteData({ clientId: client.id })}
                        className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                      >
                        <div className="flex items-center">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold mr-3 group-hover:scale-110 transition-transform">
                            {client.firstName.charAt(0)}
                            {client.lastName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate group-hover:text-primary-700">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{client.email}</p>
                            {client.phone && (
                              <p className="text-xs text-gray-500">{client.phone}</p>
                            )}
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Quick Create Form */
              <form onSubmit={handleQuickCreate} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 mb-1">Lightning Fast Client Creation</p>
                      <p className="text-sm text-green-700">
                        Just 3 required fields. Add more details later from the client profile.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickCreateData.firstName}
                      onChange={(e) => setQuickCreateData({ ...quickCreateData, firstName: e.target.value })}
                      required
                      placeholder="John"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quickCreateData.lastName}
                      onChange={(e) => setQuickCreateData({ ...quickCreateData, lastName: e.target.value })}
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={quickCreateData.email}
                      onChange={(e) => setQuickCreateData({ ...quickCreateData, email: e.target.value })}
                      required
                      placeholder="john.doe@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={quickCreateData.phone}
                      onChange={(e) => setQuickCreateData({ ...quickCreateData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickCreate(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quickCreateLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {quickCreateLoading ? "Creating..." : "Create & Select"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pricing
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onSave(false)}
            disabled={loading || !selectedClient}
            className="px-8 py-3 border-2 border-primary-600 text-primary-700 rounded-lg font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            💾 Save as Draft
          </button>

          <button
            onClick={() => onSave(true)}
            disabled={loading || !selectedClient}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Quote Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      {!selectedClient && (
        <div className="text-center text-sm text-gray-500 italic">
          Select or create a client to enable Save & Send buttons
        </div>
      )}
    </div>
  );
}
