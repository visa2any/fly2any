'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Users, Mail, Calendar, DollarSign, Activity, Eye, Edit, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  bookingsCount: number;
  totalSpent: number;
  lastLogin: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const response = await fetch(`/api/admin/users?limit=${pageSize}&offset=${offset}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewUser = (userId: string) => {
    console.log('View user:', userId);
    // Navigate to user details page
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // Open edit modal
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId);
      // Call delete API
    }
  };

  const exportData = () => {
    // Convert users to CSV
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Bookings', 'Total Spent', 'Last Login', 'Created At'].join(','),
      ...users.map((user) =>
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.bookingsCount,
          user.totalSpent,
          user.lastLogin,
          user.createdAt,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'bookingsCount',
      label: 'Bookings',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">${value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  const stats = {
    total: total,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => u.role === 'admin').length,
    totalSpent: users.reduce((sum, u) => sum + u.totalSpent, 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-600">Total Users</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-gray-600">Active Users</p>
            </div>
            <p className="text-3xl font-bold text-green-700">{stats.active}</p>
          </div>

          <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-gray-600">Admins</p>
            </div>
            <p className="text-3xl font-bold text-purple-700">{stats.admins}</p>
          </div>

          <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <p className="text-sm font-semibold text-gray-600">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-orange-700">
              ${stats.totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchable
          searchPlaceholder="Search users by name or email..."
          exportable
          onExport={exportData}
          pagination={{
            total,
            currentPage,
            pageSize,
            onPageChange: handlePageChange,
          }}
          rowActions={(user) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewUser(user.id)}
                className="p-2 rounded hover:bg-gray-100 text-blue-600"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditUser(user.id)}
                className="p-2 rounded hover:bg-gray-100 text-green-600"
                title="Edit User"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="p-2 rounded hover:bg-gray-100 text-red-600"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>
    </AdminLayout>
  );
}
