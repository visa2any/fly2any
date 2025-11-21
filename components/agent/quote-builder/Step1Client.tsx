"use client";

import { useState } from "react";
import Link from "next/link";

interface Step1ClientProps {
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }>;
  selectedClientId: string;
  onClientSelect: (clientId: string) => void;
  onNext: () => void;
}

export default function QuoteBuilderStep1Client({
  clients,
  selectedClientId,
  onClientSelect,
  onNext,
}: Step1ClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  });

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleNext = () => {
    if (!selectedClientId) {
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Client</h2>
        <p className="text-gray-600">Choose the client for this quote</p>
      </div>

      {/* Selected Client Display */}
      {selectedClient && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-300 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg mr-4">
                {selectedClient.firstName.charAt(0)}
                {selectedClient.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selected Client</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedClient.email}</p>
              </div>
            </div>
            <button
              onClick={() => onClientSelect("")}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Change Client
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!selectedClient && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Clients
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Client List */}
      {!selectedClient && (
        <div>
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
              <Link
                href="/agent/clients/create"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Add Your First Client
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onClientSelect(client.id)}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold mr-3">
                      {client.firstName.charAt(0)}
                      {client.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{client.email}</p>
                      {client.phone && (
                        <p className="text-xs text-gray-500">{client.phone}</p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
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

          {/* Add New Client Link */}
          {clients.length > 0 && (
            <div className="mt-4 text-center">
              <Link
                href="/agent/clients/create"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Client
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleNext}
          disabled={!selectedClientId}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next: Trip Details →
        </button>
      </div>
    </div>
  );
}
