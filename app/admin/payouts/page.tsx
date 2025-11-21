'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Payout {
  id: string
  invoiceNumber: string
  amount: number
  processingFee: number
  netAmount: number
  currency: string
  method: string
  status: string
  commissionCount: number
  payoutEmail: string
  periodStart: string
  periodEnd: string
  createdAt: string
  approvedAt?: string
  paidAt?: string
  rejectedAt?: string
  adminNotes?: string
  affiliate: {
    id: string
    referralCode: string
    businessName?: string
    user: {
      name: string
      email: string
    }
  }
}

interface Summary {
  pending: { count: number; amount: number }
  approved: { count: number; amount: number }
  paid: { count: number; amount: number }
  rejected: { count: number; amount: number }
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payouts')
      const data = await response.json()

      if (data.success) {
        setPayouts(data.data.payouts)
        setSummary(data.data.summary)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (payoutId: string, action: 'approve' | 'reject' | 'mark_paid') => {
    if (!confirm(`Are you sure you want to ${action.replace('_', ' ')} this payout?`)) {
      return
    }

    setActionLoading(true)

    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: actionNotes }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update payout')
        return
      }

      toast.success(data.message)
      setSelectedPayout(null)
      setActionNotes('')
      fetchPayouts()
    } catch (error) {
      console.error('Error updating payout:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'all') return true
    return p.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            Payout Management
          </h1>
          <p className="text-gray-600 mt-1">Manage affiliate payout requests</p>
        </div>
        <button
          onClick={fetchPayouts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{summary.pending.count}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600 opacity-50" />
            </div>
            <p className="text-sm text-orange-700 mt-2">${summary.pending.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-blue-900">{summary.approved.count}</p>
              </div>
              <ThumbsUp className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
            <p className="text-sm text-blue-700 mt-2">${summary.approved.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Paid</p>
                <p className="text-3xl font-bold text-green-900">{summary.paid.count}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600 opacity-50" />
            </div>
            <p className="text-sm text-green-700 mt-2">${summary.paid.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-900">{summary.rejected.count}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-600 opacity-50" />
            </div>
            <p className="text-sm text-red-700 mt-2">${summary.rejected.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'paid', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-blue-600">{payout.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payout.affiliate.user.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">{payout.affiliate.referralCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    ${payout.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                    ${payout.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm capitalize">{payout.method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payout.status === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : payout.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : payout.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      {payout.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(payout.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleAction(payout.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <ThumbsDown className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {payout.status === 'approved' && (
                        <button
                          onClick={() => handleAction(payout.id, 'mark_paid')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark as Paid"
                        >
                          <CreditCard className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayouts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Payout Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-mono">{selectedPayout.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      selectedPayout.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedPayout.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedPayout.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedPayout.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Affiliate</p>
                  <p>{selectedPayout.affiliate.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedPayout.affiliate.referralCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p>{selectedPayout.payoutEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold">${selectedPayout.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Fee</p>
                  <p className="text-lg font-bold text-red-600">-${selectedPayout.processingFee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Amount</p>
                  <p className="text-xl font-bold text-green-600">${selectedPayout.netAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Method</p>
                  <p className="capitalize">{selectedPayout.method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Commissions</p>
                  <p>{selectedPayout.commissionCount} transactions</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p>{new Date(selectedPayout.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedPayout.adminNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                  <p className="bg-gray-50 p-3 rounded">{selectedPayout.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedPayout(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
