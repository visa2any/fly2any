/**
 * Aviation Intelligence Admin Dashboard
 *
 * Comprehensive management of aviation data:
 * - Aircraft database
 * - Airports database
 * - Route statistics
 * - Fare classes
 * - Price trends
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plane,
  Building2,
  Route,
  Ticket,
  TrendingUp,
  Database,
  RefreshCw,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  X,
} from 'lucide-react';

type TabType = 'overview' | 'aircraft' | 'airports' | 'routes' | 'fares';

interface AviationStats {
  airlines: number;
  aircraft: number;
  airports: number;
  routes: number;
  flights: number;
  fares: number;
  prices: number;
}

interface SyncLog {
  id: string;
  entityType: string;
  source: string;
  status: string;
  recordsProcessed: number;
  recordsCreated: number;
  durationMs: number;
  createdAt: string;
}

export default function AviationAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AviationStats | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data for each tab
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [fares, setFares] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/aviation');
      if (!res.ok) throw new Error('Failed to fetch aviation data');
      const data = await res.json();
      setStats(data.stats);
      setSyncLogs(data.syncLogs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTabData = useCallback(async (tab: TabType) => {
    if (tab === 'overview') return;

    try {
      setLoading(true);
      const endpoint = `/api/admin/aviation/${tab}?limit=${pagination.limit}&offset=${pagination.offset}&search=${searchQuery}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${tab}`);
      const data = await res.json();

      switch (tab) {
        case 'aircraft':
          setAircraft(data.aircraft || []);
          break;
        case 'airports':
          setAirports(data.airports || []);
          break;
        case 'routes':
          setRoutes(data.routes || []);
          break;
        case 'fares':
          setFares(data.fares || []);
          break;
      }
      if (data.pagination) setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.offset, searchQuery]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchTabData(activeTab);
    }
  }, [activeTab, fetchTabData]);

  const handleDelete = async (tab: TabType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/admin/aviation/${tab}?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchTabData(tab);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExport = async (entityType: string) => {
    try {
      const res = await fetch('/api/admin/aviation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', entityType }),
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}-export.json`;
      a.click();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'aircraft', label: 'Aircraft', icon: Plane },
    { id: 'airports', label: 'Airports', icon: Building2 },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'fares', label: 'Fare Classes', icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">Aviation Intelligence</h1>
                <p className="text-sm text-neutral-500">Manage aviation data & knowledge base</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOverview()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'Airlines', value: stats?.airlines || 0, icon: Plane, color: 'primary' },
                { label: 'Aircraft', value: stats?.aircraft || 0, icon: Plane, color: 'info' },
                { label: 'Airports', value: stats?.airports || 0, icon: Building2, color: 'success' },
                { label: 'Routes', value: stats?.routes || 0, icon: Route, color: 'warning' },
                { label: 'Flights', value: stats?.flights || 0, icon: Globe, color: 'secondary' },
                { label: 'Fare Classes', value: stats?.fares || 0, icon: Ticket, color: 'accent' },
                { label: 'Price Points', value: stats?.prices || 0, icon: TrendingUp, color: 'neutral' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                  <div className={`inline-flex p-2 rounded-lg bg-${stat.color}-50 mb-3`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                  </div>
                  <div className="text-2xl font-bold text-neutral-900">{stat.value.toLocaleString()}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Sync Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h2 className="text-lg font-semibold text-neutral-900">Recent Data Syncs</h2>
              </div>
              <div className="divide-y divide-neutral-100">
                {syncLogs.length === 0 ? (
                  <div className="px-6 py-8 text-center text-neutral-500">
                    No sync logs yet. Data will be captured automatically from flight searches.
                  </div>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-success-50' : 'bg-warning-50'}`}>
                          {log.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-success-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 capitalize">{log.entityType} sync</div>
                          <div className="text-sm text-neutral-500">Source: {log.source}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          +{log.recordsCreated} / {log.recordsProcessed} processed
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {log.durationMs}ms
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleExport('aircraft')}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="p-3 bg-primary-50 rounded-xl">
                  <Download className="w-5 h-5 text-primary-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-neutral-900">Export Aircraft</div>
                  <div className="text-sm text-neutral-500">Download aircraft database</div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto" />
              </button>

              <button
                onClick={() => handleExport('airports')}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="p-3 bg-success-50 rounded-xl">
                  <Download className="w-5 h-5 text-success-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-neutral-900">Export Airports</div>
                  <div className="text-sm text-neutral-500">Download airports database</div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto" />
              </button>

              <button
                onClick={() => handleExport('routes')}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-100 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="p-3 bg-info-50 rounded-xl">
                  <Download className="w-5 h-5 text-info-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-neutral-900">Export Routes</div>
                  <div className="text-sm text-neutral-500">Download route statistics</div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 ml-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Aircraft Tab */}
        {activeTab === 'aircraft' && (
          <DataTable
            title="Aircraft Database"
            data={aircraft}
            columns={[
              { key: 'iataCode', label: 'IATA' },
              { key: 'manufacturer', label: 'Manufacturer' },
              { key: 'model', label: 'Model' },
              { key: 'category', label: 'Category' },
              { key: 'typicalSeats', label: 'Seats' },
            ]}
            onAdd={() => { setModalMode('create'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalMode('edit'); setEditingItem(item); setShowModal(true); }}
            onDelete={(id) => handleDelete('aircraft', id)}
            onExport={() => handleExport('aircraft')}
            loading={loading}
            pagination={pagination}
            onPageChange={(offset) => setPagination({ ...pagination, offset })}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        )}

        {/* Airports Tab */}
        {activeTab === 'airports' && (
          <DataTable
            title="Airports Database"
            data={airports}
            columns={[
              { key: 'iataCode', label: 'IATA' },
              { key: 'name', label: 'Name' },
              { key: 'city', label: 'City' },
              { key: 'country', label: 'Country' },
              { key: 'airportType', label: 'Type' },
            ]}
            onAdd={() => { setModalMode('create'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalMode('edit'); setEditingItem(item); setShowModal(true); }}
            onDelete={(id) => handleDelete('airports', id)}
            onExport={() => handleExport('airports')}
            loading={loading}
            pagination={pagination}
            onPageChange={(offset) => setPagination({ ...pagination, offset })}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <DataTable
            title="Route Statistics"
            data={routes}
            columns={[
              { key: 'routeKey', label: 'Route' },
              { key: 'carrierCount', label: 'Airlines' },
              { key: 'flightTimeMin', label: 'Duration (min)' },
              { key: 'avgEconomyPrice', label: 'Avg Price' },
              { key: 'dataPoints', label: 'Data Points' },
            ]}
            onAdd={() => { setModalMode('create'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalMode('edit'); setEditingItem(item); setShowModal(true); }}
            onDelete={(id) => handleDelete('routes', id)}
            onExport={() => handleExport('routes')}
            loading={loading}
            pagination={pagination}
            onPageChange={(offset) => setPagination({ ...pagination, offset })}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        )}

        {/* Fares Tab */}
        {activeTab === 'fares' && (
          <DataTable
            title="Fare Classes"
            data={fares}
            columns={[
              { key: 'code', label: 'Code' },
              { key: 'airlineCode', label: 'Airline' },
              { key: 'name', label: 'Name' },
              { key: 'cabinClass', label: 'Cabin' },
              { key: 'refundable', label: 'Refundable', render: (v) => v ? 'Yes' : 'No' },
            ]}
            onAdd={() => { setModalMode('create'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalMode('edit'); setEditingItem(item); setShowModal(true); }}
            onDelete={(id) => handleDelete('fares', id)}
            onExport={() => handleExport('fares')}
            loading={loading}
            pagination={pagination}
            onPageChange={(offset) => setPagination({ ...pagination, offset })}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
}

// Reusable DataTable component
function DataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  loading,
  pagination,
  onPageChange,
  searchQuery,
  onSearch,
}: {
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (value: any) => string }[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  loading: boolean;
  pagination: { limit: number; offset: number; total: number };
  onPageChange: (offset: number) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onExport}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Export"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-neutral-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-neutral-500">
                  No data found. Click "Add New" to create one.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-sm text-neutral-900">
                      {col.render ? col.render(item[col.key]) : item[col.key] ?? '-'}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, pagination.offset - pagination.limit))}
            disabled={pagination.offset === 0}
            className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.offset + pagination.limit)}
            disabled={pagination.offset + pagination.limit >= pagination.total}
            className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
