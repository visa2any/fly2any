'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PhoneContact {
  id: string;
  phone: string;
  formatted_phone: string;
  name: string;
  state: string;
  area_code: string;
  city?: string;
  is_validated: boolean;
  is_active: boolean;
  segment: string;
  tags: string[];
  notes?: string;
  opted_out: boolean;
  lead_score: number;
  created_at: string;
}

interface PhoneList {
  id: string;
  name: string;
  description?: string;
  total_contacts: number;
}

export default function PhoneContactsPage() {
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [lists, setLists] = useState<PhoneList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    segment: '',
    is_active: '',
    opted_out: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchLists();
  }, [filters, pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContacts = async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        action: 'contacts',
        limit: pagination.limit.toString(),
        offset: ((pagination.page - 1) * pagination.limit).toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`/api/phone-management?${params}`);
      const data = await response.json();
      
      setContacts(data.contacts || []);
      setPagination((prev: any) => ({ ...prev, total: data.total || 0 }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async (): Promise<void> => {
    try {
      const response = await fetch('/api/phone-management?action=lists');
      const data = await response.json();
      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedContacts.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.size} contacts?`)) return;

    try {
      await fetch('/api/phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_multiple_contacts',
          ids: Array.from(selectedContacts)
        })
      });

      setSelectedContacts(new Set());
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contacts:', error);
    }
  };

  const handleCreateList = async (): Promise<void> => {
    if (!newListName.trim() || selectedContacts.size === 0) return;

    try {
      // Create new list
      const listResponse = await fetch('/api/phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_list',
          name: newListName,
          description: `Created with ${selectedContacts.size} contacts`,
          total_contacts: selectedContacts.size,
          created_by: 'admin',
          is_smart: false
        })
      });

      const newList = await listResponse.json();

      // Add selected contacts to the list
      await fetch('/api/phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_list',
          listId: newList.id,
          contactIds: Array.from(selectedContacts)
        })
      });

      setNewListName('');
      setShowListModal(false);
      setSelectedContacts(new Set());
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleAddToExistingList = async (listId: string) => {
    if (selectedContacts.size === 0) return;

    try {
      await fetch('/api/phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_list',
          listId: listId,
          contactIds: Array.from(selectedContacts)
        })
      });

      setSelectedContacts(new Set());
      fetchLists();
    } catch (error) {
      console.error('Error adding to list:', error);
    }
  };

  const getStateFlag = (state: string) => {
    const flags: { [key: string]: string } = {
      'Connecticut': '🔵',
      'Florida': '🌴',
      'Massachusetts': '🦞',
      'New Jersey': '🏙️',
      'New York': '🗽',
      'California': '☀️',
    };
    return flags[state] || '📍';
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📞 Phone Contacts</h1>
              <p className="text-gray-600">
                Showing {contacts.length} of {pagination.total.toLocaleString()} contacts
                {selectedContacts.size > 0 && ` • ${selectedContacts.size} selected`}
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
                onClick={() => window.location.href = '/admin/phone-management/import'}
                className="bg-green-600 hover:bg-green-700"
              >
                📤 Import
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="🔍 Search name or phone..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters((prev: any) => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filters.state}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters((prev: any) => ({ ...prev, state: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All States</option>
                <option value="Connecticut">🔵 Connecticut</option>
                <option value="Florida">🌴 Florida</option>
                <option value="Massachusetts">🦞 Massachusetts</option>
                <option value="New Jersey">🏙️ New Jersey</option>
                <option value="New York">🗽 New York</option>
                <option value="California">☀️ California</option>
              </select>
            </div>
            <div>
              <select
                value={filters.segment}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters((prev: any) => ({ ...prev, segment: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Segments</option>
                <option value="brasileiros-eua">🇧🇷 Brasileiros EUA</option>
                <option value="familias">👨‍👩‍👧‍👦 Famílias</option>
                <option value="executivos">💼 Executivos</option>
                <option value="geral">📱 Geral</option>
              </select>
            </div>
            <div>
              <select
                value={filters.is_active}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters((prev: any) => ({ ...prev, is_active: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="true">✅ Active</option>
                <option value="false">❌ Inactive</option>
              </select>
            </div>
            <div>
              <Button 
                onClick={() => setFilters({ search: '', state: '', segment: '', is_active: '', opted_out: '' })}
                variant="outline"
                className="w-full"
              >
                🔄 Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedContacts.size > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800">
                {selectedContacts.size} contacts selected
              </span>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowListModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  📋 Create List
                </Button>
                <div className="relative group">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-white"
                  >
                    ➕ Add to List ▼
                  </Button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg hidden group-hover:block z-10">
                    {lists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToExistingList(list.id)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                      >
                        {list.name} ({list.total_contacts})
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleDeleteSelected}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Contacts Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedContacts.size === contacts.length && contacts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-gray-900">Name</th>
                  <th className="p-3 text-left font-medium text-gray-900">Phone</th>
                  <th className="p-3 text-left font-medium text-gray-900">State</th>
                  <th className="p-3 text-left font-medium text-gray-900">Status</th>
                  <th className="p-3 text-left font-medium text-gray-900">Segment</th>
                  <th className="p-3 text-left font-medium text-gray-900">Score</th>
                  <th className="p-3 text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-16 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 animate-ping">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-75 mx-auto"></div>
                      </div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl animate-pulse mx-auto">
                          <span className="text-2xl text-white">👥</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-semibold text-slate-800">Loading contacts...</p>
                      <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center">
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">🔍</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No contacts found</h3>
                        <p className="text-slate-600">Try adjusting your filters or search criteria.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      {contact.notes && (
                        <div className="text-sm text-gray-500">{contact.notes}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-sm">{contact.formatted_phone}</div>
                      <div className="text-xs text-gray-500">Area: {contact.area_code}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="mr-2">{getStateFlag(contact.state)}</span>
                        <span className="text-sm">{contact.state}</span>
                      </div>
                      {contact.city && (
                        <div className="text-xs text-gray-500">{contact.city}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contact.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contact.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                        {contact.is_validated && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔍 Validated
                          </span>
                        )}
                        {contact.opted_out && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            🚫 Opted Out
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-900">{contact.segment}</span>
                      {contact.tags.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {contact.tags.slice(0, 2).join(', ')}
                          {contact.tags.length > 2 && ` +${contact.tags.length - 2}`}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className={`text-sm font-medium ${
                        contact.lead_score >= 80 ? 'text-green-600' :
                        contact.lead_score >= 60 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {contact.lead_score}/100
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="text-xs">
                          ✏️
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          📋
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600">
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} contacts
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              ← Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              onClick={() => setPagination((prev: any) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === totalPages}
              variant="outline"
              size="sm"
            >
              Next →
            </Button>
          </div>
        </div>

        {/* Create List Modal */}
        {showListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Create New List</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name
                  </label>
                  <Input
                    value={newListName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
                    placeholder="Enter list name..."
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  This list will contain {selectedContacts.size} selected contacts.
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCreateList}
                    disabled={!newListName.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create List
                  </Button>
                  <Button
                    onClick={() => setShowListModal(false)}
                    variant="outline"
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
  );
}