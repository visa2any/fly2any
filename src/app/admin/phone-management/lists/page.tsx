'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PhoneList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  total_contacts: number;
  created_by: string;
  is_smart: boolean;
  smart_criteria?: any;
  created_at: string;
  updated_at: string;
}

export default function PhoneListsPage() {
  const [lists, setLists] = useState<PhoneList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/phone-management?action=lists');
      const data = await response.json();
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (): Promise<void> => {
    if (!newList.name.trim()) return;

    try {
      await fetch('/api/phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_list',
          name: newList.name,
          description: newList.description,
          color: newList.color,
          total_contacts: 0,
          created_by: 'admin',
          is_smart: false
        })
      });

      setNewList({ name: '', description: '', color: '#3B82F6' });
      setShowCreateModal(false);
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const getListIcon = (list: PhoneList) => {
    if (list.is_smart) return '🔮';
    if (list.total_contacts > 1000) return '🎯';
    if (list.total_contacts > 500) return '📋';
    return '📝';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const presetColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Phone Lists</h1>
          <p className="text-gray-600">
            Organize your contacts into targeted lists for campaigns
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => window.location.href = '/admin/phone-management'}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            ➕ Create New List
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lists</p>
              <p className="text-2xl font-bold text-gray-900">{lists.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">
                {lists.reduce((sum, list) => sum + list.total_contacts, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🔮</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Smart Lists</p>
              <p className="text-2xl font-bold text-gray-900">
                {lists.filter(list => list.is_smart).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg List Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {lists.length > 0 ? Math.round(lists.reduce((sum, list) => sum + list.total_contacts, 0) / lists.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lists Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lists...</p>
          </div>
        </div>
      ) : lists.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lists Created Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first list to organize contacts for targeted campaigns
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ➕ Create Your First List
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card 
              key={list.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
              style={{ borderLeftColor: list.color || '#3B82F6' }}
              onClick={() => window.location.href = `/admin/phone-management/lists/${list.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getListIcon(list)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{list.name}</h3>
                    {list.description && (
                      <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" className="text-xs p-2">
                    ✏️
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs p-2 text-red-600">
                    🗑️
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contacts</span>
                  <span className="font-semibold text-gray-900">
                    {list.total_contacts.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    list.is_smart 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {list.is_smart ? '🔮 Smart' : '📋 Manual'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(list.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(list.updated_at)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    window.location.href = `/admin/phone-management/lists/${list.id}`;
                  }}
                >
                  👁️ View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // Export list logic here
                  }}
                >
                  📤 Export
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New List</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <Input
                  value={newList.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewList((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newList.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewList((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2 mb-2">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewList((prev: any) => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newList.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={newList.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewList((prev: any) => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border rounded"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCreateList}
                  disabled={!newList.name.trim()}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  Create List
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
}