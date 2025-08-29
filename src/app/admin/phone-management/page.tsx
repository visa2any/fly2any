'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverallStats {
  totalContacts: number;
  validatedContacts: number;
  activeContacts: number;
  optedOutContacts: number;
  totalLists: number;
  activeCampaigns: number;
}

interface StateStats {
  state: string;
  total: number;
  validated: number;
  active: number;
  opted_out: number;
}

export default function PhoneManagementDashboard() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [stateStats, setStateStats] = useState<StateStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch overall stats
      const statsResponse = await fetch('/api/phone-management?action=stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('Failed to fetch stats:', statsResponse.status);
        // Set default stats to prevent undefined errors
        setStats({
          totalContacts: 0,
          validatedContacts: 0,
          activeContacts: 0,
          optedOutContacts: 0,
          totalLists: 0,
          activeCampaigns: 0
        });
      }

      // Fetch state stats
      const stateResponse = await fetch('/api/phone-management?action=state-stats');
      if (stateResponse.ok) {
        const stateData = await stateResponse.json();
        setStateStats(Array.isArray(stateData) ? stateData : []);
      } else {
        console.error('Failed to fetch state stats:', stateResponse.status);
        setStateStats([]);
      }

    } catch (error) {
      console.error('Error fetching phone management data:', error);
      // Set default values to prevent crashes
      setStats({
        totalContacts: 0,
        validatedContacts: 0,
        activeContacts: 0,
        optedOutContacts: 0,
        totalLists: 0,
        activeCampaigns: 0
      });
      setStateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    return (num || 0).toLocaleString();
  };

  const getStateFlag = (state: string) => {
    const flags: { [key: string]: string } = {
      'Connecticut': '🔵',
      'Florida': '🌴',
      'Massachusetts': '🦞',
      'New Jersey': '🏙️',
      'New York': '🗽',
      'California': '☀️',
      'Georgia': '🍑',
      'Pennsylvania': '🔔',
    };
    return flags[state] || '📍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75"></div>
            </div>
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-3xl text-white">📱</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Loading Phone Management</h2>
            <p className="text-lg text-slate-600">Preparing your contact database...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <span className="text-3xl">📱</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Phone Management
                </h1>
                <p className="text-lg text-slate-600 mt-1">
                  Managing {formatNumber(stats?.totalContacts)} premium contacts
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.location.href = '/admin/phone-management/contacts'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
              >
                <span className="mr-2">👥</span>
                View All Contacts
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin/phone-management/lists'}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
              >
                <span className="mr-2">📋</span>
                Manage Lists
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                      <span className="text-xl text-white">📱</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Contacts</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    {formatNumber(stats?.totalContacts || 0)}
                  </p>
                  <p className="text-sm text-blue-600">Active database</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                      <span className="text-xl text-white">✅</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Validated</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900 mb-1">
                    {formatNumber(stats?.validatedContacts || 0)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-200 rounded-full px-3 py-1">
                      <p className="text-sm font-semibold text-emerald-800">
                        {stats && stats.totalContacts > 0 ? ((stats.validatedContacts / stats.totalContacts) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-emerald-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md">
                      <span className="text-xl text-white">📋</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Lists Created</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-amber-900 mb-1">
                    {formatNumber(stats?.totalLists || 0)}
                  </p>
                  <p className="text-sm text-amber-600">Organized segments</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-amber-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📑</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                      <span className="text-xl text-white">🚀</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Active Campaigns</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 mb-1">
                    {formatNumber(stats?.activeCampaigns || 0)}
                  </p>
                  <p className="text-sm text-purple-600">Running now</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced State Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Numbers by State */}
          <Card className="bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                  <span className="text-xl text-white">📍</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Numbers by State</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
                {stateStats.slice(0, 15).map((state, index) => (
                  <div 
                    key={state.state} 
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => window.location.href = `/admin/phone-management/contacts?state=${state.state}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
                        {getStateFlag(state.state)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">
                          {state.state}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {state.active} active
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {state.validated} validated
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {formatNumber(state.total)}
                      </p>
                      <div className="bg-slate-100 group-hover:bg-blue-100 rounded-full px-3 py-1 mt-1 transition-colors">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                          {stats && stats.totalContacts > 0 ? ((state.total / stats.totalContacts) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {stateStats.length > 15 && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/admin/phone-management/states'}
                    className="border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 rounded-xl px-6 py-3 font-medium"
                  >
                    View All {stateStats.length} States →
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <span className="text-xl text-white">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Quick Actions</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start text-left h-auto p-5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-800 border-2 border-blue-200 hover:border-blue-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/phone-management/contacts'}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <span className="text-xl">🔍</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Search All Numbers</div>
                      <div className="text-sm text-blue-600 mt-1">Find contacts by name, phone, or state</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start text-left h-auto p-5 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-800 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/phone-management/lists/new'}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-emerald-200 rounded-lg">
                      <span className="text-xl">📋</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Create New List</div>
                      <div className="text-sm text-emerald-600 mt-1">Organize contacts for campaigns</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start text-left h-auto p-5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-800 border-2 border-purple-200 hover:border-purple-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/phone-management/import'}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <span className="text-xl">📤</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Import Numbers</div>
                      <div className="text-sm text-purple-600 mt-1">Bulk import from CSV/Excel</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start text-left h-auto p-5 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-800 border-2 border-amber-200 hover:border-amber-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/phone-management/export'}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-amber-200 rounded-lg">
                      <span className="text-xl">📥</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Export Data</div>
                      <div className="text-sm text-amber-600 mt-1">Export contacts and lists</div>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start text-left h-auto p-5 bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 text-rose-800 border-2 border-rose-200 hover:border-rose-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  variant="outline"
                  onClick={() => window.location.href = '/admin/phone-management/validate'}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-rose-200 rounded-lg">
                      <span className="text-xl">🔧</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg">Validate Numbers</div>
                      <div className="text-sm text-rose-600 mt-1">Check number validity and status</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Top Performing States */}
        <Card className="bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                <span className="text-xl text-white">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Top Performing States</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {stateStats.slice(0, 5).map((state, index) => (
                <div 
                  key={state.state}
                  className="group text-center p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-slate-50 hover:from-blue-50 hover:to-indigo-50 transform hover:-translate-y-2"
                  onClick={() => window.location.href = `/admin/phone-management/contacts?state=${state.state}`}
                >
                  <div className="relative">
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        #1
                      </div>
                    )}
                    <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                      {getStateFlag(state.state)}
                    </div>
                    <div className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                      {state.state}
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">
                      {formatNumber(state.total)}
                    </div>
                    <div className="bg-slate-100 group-hover:bg-blue-100 rounded-full px-3 py-1 transition-colors">
                      <div className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">
                        {((state.active / state.total) * 100).toFixed(0)}% active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Enhanced System Status */}
        <Card className="bg-white shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                <span className="text-xl text-white">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">System Status</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-3 bg-emerald-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🟢</span>
                </div>
                <div className="font-bold text-emerald-800 text-lg mb-2">Database</div>
                <div className="text-sm text-emerald-600 font-medium">All systems operational</div>
                <div className="mt-3 bg-emerald-200 rounded-full px-3 py-1 inline-block">
                  <span className="text-xs font-bold text-emerald-800">99.9% Uptime</span>
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-3 bg-blue-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">📡</span>
                </div>
                <div className="font-bold text-blue-800 text-lg mb-2">API Services</div>
                <div className="text-sm text-blue-600 font-medium">Ready for validation</div>
                <div className="mt-3 bg-blue-200 rounded-full px-3 py-1 inline-block">
                  <span className="text-xs font-bold text-blue-800">Online</span>
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-3 bg-amber-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">⚡</span>
                </div>
                <div className="font-bold text-amber-800 text-lg mb-2">Performance</div>
                <div className="text-sm text-amber-600 font-medium">Optimized for scale</div>
                <div className="mt-3 bg-amber-200 rounded-full px-3 py-1 inline-block">
                  <span className="text-xs font-bold text-amber-800">Fast</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}