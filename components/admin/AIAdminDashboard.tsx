'use client';

/**
 * AI Admin Dashboard — Fly2Any Intelligence Hub
 *
 * Apple-Class Level 6 admin interface for full AI visibility.
 */

import { useState, useEffect } from 'react';
import {
  Brain,
  MessageSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Eye,
} from 'lucide-react';
import ConversationTranscriptDrawer from './ConversationTranscriptDrawer';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface DashboardStats {
  total_conversations: number;
  active_now: number;
  conversion_rate: number;
  avg_resolution_time: string;
  total_cost: string;
  by_outcome: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function AIAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'agents' | 'decisions' | 'geospatial'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time State
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Drawer State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // SSE Effect
  useEffect(() => {
    // Initial fetch for static stats
    const fetchInitial = async () => {
      try {
        const response = await fetch('/api/admin/ai-hub?action=dashboard');
        if (response.ok) {
          const data = await response.json();
          setStats({
            total_conversations: data.stats.total,
            active_now: data.health.active_conversations,
            conversion_rate: data.stats.conversion_rate,
            avg_resolution_time: `${Math.round(data.stats.avg_duration_ms / 1000)}s`,
            total_cost: `$${data.stats.total_cost}`,
            by_outcome: data.stats.by_outcome,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();

    // Setup SSE Stream
    const eventSource = new EventSource('/api/admin/ai-hub/stream');
    
    eventSource.onopen = () => setIsConnected(true);
    
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'update') {
        setLiveActivity(payload.data.live_activity || []);
        if (payload.data.metrics) {
           // Optional: Update stats in real-time here too
           // setStats(prev => ({ ...prev, active_now: payload.data.active_now }));
        }
      }
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  const openTranscript = (id: string) => {
    setSelectedConversationId(id);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transcript Drawer */}
      <ConversationTranscriptDrawer 
        conversationId={selectedConversationId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Intelligence Hub</h1>
          <p className="text-gray-500 flex items-center gap-2">
            Real-time visibility into AI operations
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Activity className="w-3 h-3" /> Live Stream
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {liveActivity.length} Active / {stats?.active_now} Total
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

// ... (KPICard logic remains same) ...

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['overview', 'conversations', 'agents', 'decisions', 'geospatial'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} liveActivity={liveActivity} />}
      {activeTab === 'conversations' && <ConversationsTab onOpen={openTranscript} />}
      {activeTab === 'agents' && <AgentsTab />}
      {activeTab === 'decisions' && <DecisionsTab />}
      {activeTab === 'geospatial' && <GeospatialTab liveActivity={liveActivity} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GEOSPATIAL MAP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const COUNTRY_COORDINATES: Record<string, { x: number; y: number }> = {
  US: { x: 25, y: 35 }, // United States
  GB: { x: 48, y: 25 }, // United Kingdom
  FR: { x: 50, y: 30 }, // France
  DE: { x: 52, y: 28 }, // Germany
  ES: { x: 48, y: 33 }, // Spain
  IT: { x: 53, y: 32 }, // Italy
  BR: { x: 35, y: 70 }, // Brazil
  MX: { x: 20, y: 45 }, // Mexico
  CA: { x: 25, y: 20 }, // Canada
  JP: { x: 88, y: 35 }, // Japan
  CN: { x: 75, y: 35 }, // China
  IN: { x: 70, y: 45 }, // India
  AU: { x: 85, y: 75 }, // Australia
  AE: { x: 60, y: 40 }, // UAE
  ZA: { x: 55, y: 80 }, // South Africa
};

function GeospatialTab({ liveActivity }: { liveActivity: any[] }) {
  // Mock fallback locations if live activity doesn't have country data yet
  const displayData = liveActivity.length > 0 ? liveActivity : [
    { country: 'US', emotion: 'FRUSTRATED', intent: 'Flight Cancelled' },
    { country: 'GB', emotion: 'CALM', intent: 'Booking' },
    { country: 'JP', emotion: 'ANXIOUS', intent: 'Visa Issue' },
    { country: 'BR', emotion: 'HAPPY', intent: 'Honeymoon' },
    { country: 'AU', emotion: 'CALM', intent: 'Inquiry' },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Map Container */}
      <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6 relative overflow-hidden">
        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Global Sentiment Heatmap
        </h3>
        
        {/* World Map SVG (Simplified Dotted Representation) */}
        <div className="relative w-full aspect-[1.8] bg-gray-800/50 rounded-lg border border-gray-700/50">
          {/* Abstract World Grid Background */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          {/* Render Active Pulses */}
          {displayData.map((session, i) => {
            const coords = COUNTRY_COORDINATES[session.country || 'US'];
            if (!coords) return null;

            const isNegative = ['FRUSTRATED', 'PANICKED', 'ANGRY'].includes(session.emotion);
            const isPositive = ['HAPPY', 'EXCIITED', 'CALM'].includes(session.emotion);
            const color = isNegative ? 'bg-red-500' : isPositive ? 'bg-green-500' : 'bg-blue-500';
            const shadow = isNegative ? 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'shadow-[0_0_10px_rgba(34,197,94,0.4)]';

            return (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              >
                {/* Ping Animation */}
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${color}`}></span>
                
                {/* Dot */}
                <div className={`relative inline-flex rounded-full h-3 w-3 ${color} ${shadow} transition-transform hover:scale-150`}></div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block z-20">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 border border-gray-700 shadow-xl">
                    <div className="font-bold">{session.country}</div>
                    <div className={isNegative ? 'text-red-400' : 'text-gray-300'}>{session.emotion}</div>
                    <div className="opacity-75 text-[10px]">{session.intent}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="absolute bottom-4 left-6 text-xs text-gray-500 flex gap-4">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div> Positive</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Neutral</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div> Frustrated (Risk)</div>
        </div>
      </div>

      {/* Regional Alerts Sidebar */}
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Regional Disruptions
          </h3>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Simulated Weather/Event Alerts */}
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">JFK / NYC</span>
              <span className="text-[10px] text-red-500">Now</span>
            </div>
            <p className="text-sm text-gray-800 font-medium">Bizzard Warning</p>
            <p className="text-xs text-gray-600 mt-1">High volume of cancellations detected (intent: FLIGHT_CANCEL). Sentiment dropping.</p>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">DXB / Dubai</span>
              <span className="text-[10px] text-orange-500">15m ago</span>
            </div>
            <p className="text-sm text-gray-800 font-medium">Connection Risks</p>
            <p className="text-xs text-gray-600 mt-1">Multiple users reporting short connections. Agents alerting passengers.</p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">HND / Tokyo</span>
              <span className="text-[10px] text-blue-500">1h ago</span>
            </div>
            <p className="text-sm text-gray-800 font-medium">Visa Waiver Updates</p>
            <p className="text-xs text-gray-600 mt-1">Spike in 'VISA_DOCUMENTATION' intents. Sophia Nguyen handling efficiently.</p>
          </div>
        </div>
      </div>


// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function KPICard({ label, value, icon, trend, color }: { label: string; value: string; icon: React.ReactNode; trend?: string; color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{label}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ stats, liveActivity }: { stats: DashboardStats | null, liveActivity: any[] }) {
  // Internal fetching removed, using prop
  
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Outcome Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
        <div className="space-y-3 flex-1">
          {stats && Object.entries(stats.by_outcome).map(([outcome, count]) => (
            <div key={outcome} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 capitalize">{outcome}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    outcome === 'resolved' ? 'bg-green-500' :
                    outcome === 'converted' ? 'bg-blue-500' :
                    outcome === 'escalated' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${stats.total_conversations > 0 ? (count / stats.total_conversations) * 100 : 0}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
            </div>
          ))}
          {(!stats || stats.total_conversations === 0) && (
            <div className="text-sm text-gray-400 text-center py-4">No outcomes recorded yet</div>
          )}
        </div>
      </div>

       {/* Cost Efficiency (New) */}
       <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-yellow-600" /> Token & Cost Efficiency
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase">
            <span>High Volume Sessions</span>
            <span>Est. Cost</span>
          </div>
          {[
            { id: 'usr_premium_92', tokens: '14.2k', cost: '$0.42', status: 'high' },
            { id: 'usr_anon_88b1', tokens: '8.1k', cost: '$0.24', status: 'warn' },
            { id: 'usr_vip_travel', tokens: '6.4k', cost: '$0.19', status: 'warn' },
          ].map((item, i) => (
             <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 -mx-1">
               <div className="flex items-center gap-3">
                 <div className={`p-1.5 rounded-md ${item.status === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                   <Zap className="w-3 h-3" />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-900">{item.id}</div>
                   <div className="text-xs text-gray-500">{item.tokens} tokens</div>
                 </div>
               </div>
               <span className={`text-sm font-mono font-medium ${item.status === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                 {item.cost}
               </span>
             </div>
          ))}
          <div className="pt-2">
            <div className="text-xs text-center text-gray-400">
               Average Cost per Turn: <span className="text-gray-900 font-medium">$0.008</span>
            </div>
          </div>
        </div>
       </div>

      {/* Live Activity (Using Prop) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Live Activity</h3>
        <div className="space-y-3">
          {liveActivity && liveActivity.length > 0 ? (
            liveActivity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${item.is_escalated ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.intent || 'Unknown Intent'}</div>
                    <div className="text-xs text-gray-500">{item.current_agent}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Active</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-gray-400 py-8">No live conversations right now</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/admin/ai-hub?action=conversations&limit=20');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading conversations...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Agents</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Intent</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Emotion</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Outcome</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Duration</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Cost</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {conversations.length > 0 ? (
            conversations.map((conv, i) => (
              <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOpen(conv.id)}>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">{conv.id.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-sm text-gray-600">{conv.agents_involved?.join(' → ') || '-'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {conv.intents?.[0] || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    (conv.emotions || []).includes('FRUSTRATED') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {(conv.emotions || [])[0] || 'Neutral'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-sm ${
                    conv.outcome === 'converted' ? 'text-green-600' :
                    conv.outcome === 'escalated' ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {conv.outcome}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{Math.round(conv.duration_ms / 1000)}s</td>
                <td className="px-4 py-3 text-sm text-gray-600">${conv.cost?.toFixed(4)}</td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => { e.stopPropagation(); onOpen(conv.id); }}>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No conversations found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AgentsTab() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/admin/ai-hub?action=agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.performances || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading agent stats...</div>;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.length > 0 ? (
        agents.map((agent, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 capitalize">{agent.agent_id.replace('-', ' ')}</h4>
                <p className="text-sm text-gray-500">Specialist</p>
              </div>
              <div className={`px-2 py-1 rounded text-sm font-bold ${
                (agent.resolution_rate * 100) >= 90 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {(agent.resolution_rate * 100).toFixed(0)}% Res
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">{agent.total_interactions}</div>
                <div className="text-xs text-gray-500">Interactions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{agent.satisfaction_score || '-'}</div>
                <div className="text-xs text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-3 p-8 text-center text-gray-500">
          No agent performance data available yet. Start some conversations!
        </div>
      )}
    </div>
  );
}

function DecisionsTab() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll use alerts/events as "decisions" for now, or fallback to mock if API misses specific decision endpoint
    // In a real scenario, we'd add 'action=decisions' to the API.
    // For now, let's fetch 'alerts' which show critical system decisions/events
    const fetchDecisions = async () => {
      try {
        const res = await fetch('/api/admin/ai-hub?action=alerts&limit=20');
        if (res.ok) {
          const data = await res.json();
          setDecisions(data.alerts || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDecisions();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading system decisions...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Recent AI Events & Decisions</h3>
      <div className="space-y-4">
        {decisions.length > 0 ? (
          decisions.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${item.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{item.message}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No critical decisions or alerts logged recently.</div>
        )}
      </div>
    </div>
  );
}
