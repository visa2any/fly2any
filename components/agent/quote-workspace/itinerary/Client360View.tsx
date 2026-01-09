"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Calendar, DollarSign, TrendingUp, Clock, MessageSquare, Star, CreditCard, Plane, Hotel, Award, AlertCircle, TrendingDown, Send, Plus, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";
import type { QuoteClient } from "../types/quote-workspace.types";

interface ClientIntelligence {
  lifetimeValue: number;
  conversionRate: number;
  avgResponseTime: number;
  avgDealSize: number;
  lastBookingDate: string;
  outstandingBalance: number;
  totalQuotes: number;
  acceptedQuotes: number;
  preferredClass: string;
  leadTime: number;
  riskScore: number;
}

interface Activity {
  id: string;
  type: 'email' | 'call' | 'booking' | 'quote' | 'sms' | 'note';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

export default function Client360View() {
  const { state } = useQuoteWorkspace();
  const { client } = state;
  const [intelligence, setIntelligence] = useState<ClientIntelligence | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (client?.id) {
      fetchClientIntelligence();
    }
  }, [client?.id]);

  const fetchClientIntelligence = async () => {
    if (!client?.id) return;
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch(`/api/agents/clients/${client.id}/stats`),
        fetch(`/api/agents/clients/${client.id}/timeline`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setIntelligence(data.intelligence);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch intelligence:", error);
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
          <p className="text-sm text-gray-500">Select a client to view their complete profile</p>
        </div>
      </div>
    );
  }

  const getRatingStars = (rate: number) => {
    const stars = Math.round(rate * 5);
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'call': return <Phone className="w-4 h-4 text-green-500" />;
      case 'booking': return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'quote': return <DollarSign className="w-4 h-4 text-purple-500" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const displayIntelligence = intelligence || {
    lifetimeValue: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    avgDealSize: 0,
    lastBookingDate: new Date().toISOString(),
    outstandingBalance: 0,
    totalQuotes: 0,
    acceptedQuotes: 0,
    preferredClass: 'Not Set',
    leadTime: 0,
    riskScore: 0,
  };

  const isNewClient = !intelligence || intelligence.totalQuotes === 0;

  return (
    <div className="h-full overflow-y-auto">
      {/* Intelligence Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30">
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{client.firstName} {client.lastName}</h2>
              {isNewClient ? (
                <span className="px-3 py-1 bg-blue-400/20 border border-blue-400/30 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3" /> New Client
                </span>
              ) : displayIntelligence.conversionRate > 0.5 && (
                <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3" /> VIP Client
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-3">
              {getRatingStars(displayIntelligence.conversionRate)}
              {isNewClient && <span className="ml-2 text-xs text-white/70">Building history...</span>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-80" />
                <a href={`mailto:${client.email}`} className="hover:underline opacity-90">{client.email}</a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 opacity-80" />
                  <a href={`tel:${client.phone}`} className="hover:underline opacity-90">{client.phone}</a>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-6">
              <div>
                <div className="text-white/70 text-xs mb-1">Lifetime Value</div>
                <div className="text-2xl font-bold">${displayIntelligence.lifetimeValue.toLocaleString()}</div>
                {isNewClient && <div className="text-xs text-white/60 mt-1">First quote pending</div>}
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold">{Math.round(displayIntelligence.conversionRate * 100)}%</div>
                {isNewClient && <div className="text-xs text-white/60 mt-1">Building track record</div>}
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1">Response Time</div>
                <div className="text-2xl font-bold">{displayIntelligence.avgResponseTime || 0}h</div>
                {isNewClient && <div className="text-xs text-white/60 mt-1">Will track soon</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Intelligence Grid - ALWAYS SHOW */}
        <div className="grid grid-cols-3 gap-4">
            {/* Financial Intelligence */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                SPENDING PROFILE
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Deal:</span>
                  <span className="font-semibold">${displayIntelligence.avgDealSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Booking:</span>
                  <span className="font-semibold text-gray-500">{isNewClient ? 'No bookings yet' : new Date(displayIntelligence.lastBookingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding:</span>
                  <span className={`font-semibold ${displayIntelligence.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${displayIntelligence.outstandingBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Payment:</span>
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <CreditCard className="w-3 h-3" /> {isNewClient ? 'Will be captured' : 'Amex •••• 1234'}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Behavior */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                <Plane className="w-4 h-4 text-blue-600" />
                TRAVEL PATTERNS
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preferred Class:</span>
                  <span className="font-semibold text-gray-500">{displayIntelligence.preferredClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lead Time:</span>
                  <span className="font-semibold">{displayIntelligence.leadTime > 0 ? `${displayIntelligence.leadTime} days` : 'Learning...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quotes:</span>
                  <span className="font-semibold">{displayIntelligence.totalQuotes}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Accepted:</span>
                  <span className="font-semibold text-emerald-600">{displayIntelligence.acceptedQuotes}/{displayIntelligence.totalQuotes}</span>
                </div>
              </div>
            </div>

            {/* Communication Style */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                ENGAGEMENT
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Channel:</span>
                  <span className="font-semibold">Email</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Time:</span>
                  <span className="font-semibold">9am-11am EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-semibold text-emerald-600">95%</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Style:</span>
                  <span className="font-semibold">Professional</span>
                </div>
              </div>
            </div>
          </div>

        {/* Risk & Opportunity - ALWAYS SHOW */}
        <div className="grid grid-cols-2 gap-4">
            {/* Risk Signals */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                {displayIntelligence.riskScore === 0 ? (
                  <><Award className="w-4 h-4 text-emerald-600" /> RISK SIGNALS</>
                ) : (
                  <><AlertCircle className="w-4 h-4 text-amber-600" /> RISK SIGNALS</>
                )}
              </div>
              {isNewClient ? (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <Star className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">New Client - No History</div>
                    <div className="text-xs">Risk signals will appear as history builds</div>
                  </div>
                </div>
              ) : displayIntelligence.riskScore === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                  <Award className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">No Risks Detected</div>
                    <div className="text-xs">Perfect payment & booking history</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-amber-700">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>1 late payment (resolved)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Upsell Opportunities */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" /> UPSELL OPPORTUNITIES
              </div>
              {isNewClient ? (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium mb-1">AI Will Identify Opportunities</div>
                  <div className="text-xs">Based on booking patterns & preferences</div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-blue-700">
                    <TrendingUp className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="font-medium">Travel Insurance</div>
                      <div className="text-xs text-gray-600">Never purchased • +$200/trip</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-blue-700">
                    <TrendingUp className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="font-medium">Private Transfers</div>
                      <div className="text-xs text-gray-600">Books standard • +$150/trip</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Activity Timeline</h3>
          </div>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-sm text-gray-500">Loading timeline...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-900 mb-2">No Activity Yet</div>
                <div className="text-xs text-gray-500 max-w-xs mx-auto">
                  Client activity will appear here as you send quotes, log calls, and track bookings
                </div>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                        {activity.amount && (
                          <div className="text-sm font-semibold text-emerald-600 mt-1">
                            ${activity.amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" /> Send Email
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4" /> Log Call
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Plus className="w-4 h-4" /> Add Note
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" /> Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
