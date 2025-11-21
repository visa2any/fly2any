"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  segment: string;
  isVip: boolean;
  homeAirport: string | null;
  preferredLanguage: string | null;
  tags: string[];
  _count: {
    quotes: number;
    bookings: number;
  };
  createdAt: Date;
  lastContactDate: Date | null;
}

interface ClientListClientProps {
  clients: Client[];
}

export default function ClientListClient({ clients }: ClientListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [loading, setLoading] = useState<string | null>(null);

  // Filter clients
  const filteredClients = clients
    .filter((client) => {
      // Segment filter
      if (segmentFilter !== "ALL" && client.segment !== segmentFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          client.firstName.toLowerCase().includes(query) ||
          client.lastName.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone?.toLowerCase().includes(query) ||
          client.company?.toLowerCase().includes(query) ||
          client.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "lastContact":
          const aDate = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
          const bDate = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
          return bDate - aDate;
        case "quotes":
          return b._count.quotes - a._count.quotes;
        case "bookings":
          return b._count.bookings - a._count.bookings;
        default:
          return 0;
      }
    });

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Archive client "${clientName}"? They will be moved to archived clients.`)) {
      return;
    }

    setLoading(clientId);
    try {
      const response = await fetch(`/api/agents/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to archive client");
      }

      toast.success("Client archived successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Archive client error:", error);
      toast.error(error.message || "Failed to archive client");
    } finally {
      setLoading(null);
    }
  };

  const getSegmentBadge = (segment: string) => {
    const badges = {
      STANDARD: { bg: "bg-gray-100", text: "text-gray-800", label: "Standard" },
      VIP: { bg: "bg-purple-100", text: "text-purple-800", label: "VIP" },
      HONEYMOON: { bg: "bg-pink-100", text: "text-pink-800", label: "Honeymoon" },
      FAMILY: { bg: "bg-blue-100", text: "text-blue-800", label: "Family" },
      BUSINESS: { bg: "bg-teal-100", text: "text-teal-800", label: "Business" },
      GROUP_ORGANIZER: { bg: "bg-orange-100", text: "text-orange-800", label: "Group" },
      CORPORATE: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Corporate" },
      LUXURY: { bg: "bg-amber-100", text: "text-amber-800", label: "Luxury" },
    };

    const badge = badges[segment as keyof typeof badges] || badges.STANDARD;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, company, or tags..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Segment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Segments</option>
              <option value="STANDARD">Standard</option>
              <option value="VIP">VIP</option>
              <option value="HONEYMOON">Honeymoon</option>
              <option value="FAMILY">Family</option>
              <option value="BUSINESS">Business</option>
              <option value="GROUP_ORGANIZER">Group Organizer</option>
              <option value="CORPORATE">Corporate</option>
              <option value="LUXURY">Luxury</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
              <option value="lastContact">Last Contact</option>
              <option value="quotes">Most Quotes</option>
              <option value="bookings">Most Bookings</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle & Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredClients.length}</strong> of <strong>{clients.length}</strong>{" "}
            clients
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg ${
                viewMode === "table"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
          {searchQuery || segmentFilter !== "ALL" ? (
            <>
              <p className="text-gray-600 mb-4">No clients match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSegmentFilter("ALL");
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">You haven't added any clients yet</p>
              <Link
                href="/agent/clients/create"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Add Your First Client
              </Link>
            </>
          )}
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg mr-3">
                    {client.firstName.charAt(0)}
                    {client.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {client.firstName} {client.lastName}
                    </h3>
                    {client.isVip && <span className="text-xs text-purple-600">⭐ VIP</span>}
                  </div>
                </div>
                {getSegmentBadge(client.segment)}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {client.email}
                </p>
                {client.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {client.phone}
                  </p>
                )}
                {client.company && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {client.company}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{client._count.quotes}</p>
                  <p className="text-xs text-gray-600">Quotes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{client._count.bookings}</p>
                  <p className="text-xs text-gray-600">Bookings</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-600">Last Contact</p>
                  <p className="text-xs font-medium text-gray-900">{formatDate(client.lastContactDate)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/agent/clients/${client.id}`}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium text-center"
                >
                  View Profile
                </Link>
                <Link
                  href={`/agent/quotes/create?clientId=${client.id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  title="Create Quote"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold mr-3">
                        {client.firstName.charAt(0)}
                        {client.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                          {client.isVip && <span className="ml-1 text-xs text-purple-600">⭐</span>}
                        </div>
                        {client.company && (
                          <div className="text-xs text-gray-500">{client.company}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    {client.phone && <div className="text-xs text-gray-500">{client.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getSegmentBadge(client.segment)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client._count.quotes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {client._count.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(client.lastContactDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/agent/clients/${client.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/agent/quotes/create?clientId=${client.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Quote
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
