"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteClient } from "../types/quote-workspace.types";

interface ClientQuote {
  id: string;
  tripName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function Client360View() {
  const { state } = useQuoteWorkspace();
  const { client } = state;
  const [clientQuotes, setClientQuotes] = useState<ClientQuote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client?.id) {
      fetchClientData();
    }
  }, [client?.id]);

  const fetchClientData = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/clients/${client.id}/quotes`);
      if (res.ok) {
        const data = await res.json();
        setClientQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error("Failed to fetch client quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Client Selected</h3>
          <p className="text-sm text-gray-500">Select a client to view their profile and history</p>
        </div>
      </div>
    );
  }

  const totalValue = clientQuotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedQuotes = clientQuotes.filter(q => q.status === 'accepted').length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Client Header */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{client.firstName} {client.lastName}</h2>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${client.email}`} className="hover:text-primary-600">{client.email}</a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${client.phone}`} className="hover:text-primary-600">{client.phone}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <Calendar className="w-3 h-3" />
            <span>Total Quotes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{clientQuotes.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <TrendingUp className="w-3 h-3" />
            <span>Accepted</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{acceptedQuotes}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <DollarSign className="w-3 h-3" />
            <span>Total Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">Recent Quotes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
          ) : clientQuotes.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No quotes yet</div>
          ) : (
            clientQuotes.slice(0, 5).map((quote) => (
              <div key={quote.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{quote.tripName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(quote.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${quote.total.toLocaleString()}</div>
                    <div className={`text-xs font-medium mt-1 ${
                      quote.status === 'accepted' ? 'text-emerald-600' :
                      quote.status === 'sent' ? 'text-blue-600' :
                      quote.status === 'declined' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {quote.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
