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
  dateOfBirth: Date | null;
  anniversary: Date | null;
  preferredLanguage: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  cabinClass: string | null;
  preferredAirlines: string[];
  homeAirport: string | null;
  seatPreference: string | null;
  mealPreference: string | null;
  specialNeeds: string | null;
  dietaryRestrictions: string[];
  passportNumber: string | null;
  passportExpiry: Date | null;
  passportCountry: string | null;
  tsaPrecheck: boolean;
  globalEntry: boolean;
  budgetRange: string | null;
  tripTypes: string[];
  favoriteDestinations: string[];
  travelStyle: string | null;
  preferredChannel: string | null;
  bestTimeToContact: string | null;
  segment: string;
  tags: string[];
  isVip: boolean;
  notes: string | null;
  internalNotes: string | null;
  lastContactDate: Date | null;
  createdAt: Date;
  _count: {
    quotes: number;
    bookings: number;
    clientNotes: number;
    documents: number;
  };
  quotes: any[];
  bookings: any[];
  clientNotes: any[];
}

interface ClientDetailClientProps {
  client: Client;
}

export default function ClientDetailClient({ client }: ClientDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "quotes" | "bookings" | "notes">("overview");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({
    note: "",
    noteType: "general",
    isImportant: false,
    contactMethod: "",
    requiresFollowUp: false,
    followUpDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/agents/clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add note");
      }

      toast.success("Note added successfully!");
      setShowNoteForm(false);
      setNoteForm({
        note: "",
        noteType: "general",
        isImportant: false,
        contactMethod: "",
        requiresFollowUp: false,
        followUpDate: "",
      });
      router.refresh();
    } catch (error: any) {
      console.error("Add note error:", error);
      toast.error(error.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === "USD" ? "$" : currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "📋", count: null },
    { id: "quotes", name: "Quotes", icon: "💼", count: client._count.quotes },
    { id: "bookings", name: "Bookings", icon: "✈️", count: client._count.bookings },
    { id: "notes", name: "Notes", icon: "📝", count: client._count.clientNotes },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Quick Stats & Info */}
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Quotes</span>
              <span className="text-2xl font-bold text-gray-900">{client._count.quotes}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Bookings</span>
              <span className="text-2xl font-bold text-green-600">{client._count.bookings}</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-gray-600">Notes</span>
              <span className="text-2xl font-bold text-blue-600">{client._count.clientNotes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Documents</span>
              <span className="text-2xl font-bold text-purple-600">{client._count.documents}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{client.email}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{client.phone}</p>
              </div>
            )}
            {client.preferredChannel && (
              <div>
                <p className="text-xs text-gray-600">Preferred Channel</p>
                <p className="text-sm font-medium text-gray-900">{client.preferredChannel}</p>
              </div>
            )}
            {client.bestTimeToContact && (
              <div>
                <p className="text-xs text-gray-600">Best Time to Contact</p>
                <p className="text-sm font-medium text-gray-900">{client.bestTimeToContact}</p>
              </div>
            )}
            {client.preferredLanguage && (
              <div>
                <p className="text-xs text-gray-600">Language</p>
                <p className="text-sm font-medium text-gray-900">{client.preferredLanguage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        {(client.address || client.city || client.country) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
            <div className="text-sm text-gray-700">
              {client.address && <p>{client.address}</p>}
              {(client.city || client.state) && (
                <p>
                  {client.city}
                  {client.state && `, ${client.state}`} {client.zipCode}
                </p>
              )}
              {client.country && <p>{client.country}</p>}
            </div>
          </div>
        )}

        {/* Important Dates */}
        {(client.dateOfBirth || client.anniversary || client.lastContactDate) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
            <div className="space-y-3">
              {client.dateOfBirth && (
                <div>
                  <p className="text-xs text-gray-600">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(client.dateOfBirth)}</p>
                </div>
              )}
              {client.anniversary && (
                <div>
                  <p className="text-xs text-gray-600">Anniversary</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(client.anniversary)}</p>
                </div>
              )}
              {client.lastContactDate && (
                <div>
                  <p className="text-xs text-gray-600">Last Contact</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(client.lastContactDate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">Client Since</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(client.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Tabbed Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.count !== null && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Full Name" value={`${client.firstName} ${client.lastName}`} />
                    {client.company && <InfoField label="Company" value={client.company} />}
                    {client.nationality && <InfoField label="Nationality" value={client.nationality} />}
                    <InfoField label="Client Segment" value={client.segment} />
                  </div>
                </div>

                {/* Travel Preferences */}
                {(client.cabinClass || client.homeAirport || client.seatPreference || client.mealPreference) && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Travel Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {client.cabinClass && <InfoField label="Cabin Class" value={client.cabinClass} />}
                      {client.homeAirport && <InfoField label="Home Airport" value={client.homeAirport} />}
                      {client.seatPreference && <InfoField label="Seat Preference" value={client.seatPreference} />}
                      {client.mealPreference && <InfoField label="Meal Preference" value={client.mealPreference} />}
                      {client.preferredAirlines.length > 0 && (
                        <InfoField label="Preferred Airlines" value={client.preferredAirlines.join(", ")} />
                      )}
                      {client.dietaryRestrictions.length > 0 && (
                        <InfoField label="Dietary Restrictions" value={client.dietaryRestrictions.join(", ")} />
                      )}
                    </div>
                  </div>
                )}

                {/* Travel Documents */}
                {(client.passportNumber || client.tsaPrecheck || client.globalEntry) && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Travel Documents</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {client.passportNumber && (
                        <InfoField label="Passport Number" value={client.passportNumber} />
                      )}
                      {client.passportCountry && (
                        <InfoField label="Passport Country" value={client.passportCountry} />
                      )}
                      {client.passportExpiry && (
                        <InfoField label="Passport Expiry" value={formatDate(client.passportExpiry)} />
                      )}
                      {client.tsaPrecheck && <InfoField label="TSA PreCheck" value="Yes ✓" />}
                      {client.globalEntry && <InfoField label="Global Entry" value="Yes ✓" />}
                    </div>
                  </div>
                )}

                {/* Trip Preferences */}
                {(client.budgetRange || client.travelStyle || client.tripTypes.length > 0 || client.favoriteDestinations.length > 0) && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Trip Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {client.budgetRange && <InfoField label="Budget Range" value={client.budgetRange} />}
                      {client.travelStyle && <InfoField label="Travel Style" value={client.travelStyle} />}
                      {client.tripTypes.length > 0 && (
                        <InfoField label="Trip Types" value={client.tripTypes.join(", ")} />
                      )}
                      {client.favoriteDestinations.length > 0 && (
                        <InfoField label="Favorite Destinations" value={client.favoriteDestinations.join(", ")} />
                      )}
                      {client.specialNeeds && <InfoField label="Special Needs" value={client.specialNeeds} />}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {client.tags.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(client.notes || client.internalNotes) && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Stored Notes</h4>
                    {client.notes && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Client Notes</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{client.notes}</p>
                      </div>
                    )}
                    {client.internalNotes && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Internal Notes (Private)</p>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {client.internalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quotes Tab */}
            {activeTab === "quotes" && (
              <div className="space-y-4">
                {client.quotes.length === 0 ? (
                  <div className="text-center py-12">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600 mb-4">No quotes yet for this client</p>
                    <Link
                      href={`/agent/quotes/workspace?clientId=${client.id}`}
                      className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Create First Quote
                    </Link>
                  </div>
                ) : (
                  client.quotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} formatDate={formatDate} formatCurrency={formatCurrency} />
                  ))
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {client.bookings.length === 0 ? (
                  <div className="text-center py-12">
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-gray-600">No bookings yet for this client</p>
                  </div>
                ) : (
                  client.bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} formatDate={formatDate} formatCurrency={formatCurrency} />
                  ))
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                {/* Add Note Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {showNoteForm ? "Cancel" : "+ Add Note"}
                  </button>
                </div>

                {/* Add Note Form */}
                {showNoteForm && (
                  <form onSubmit={handleAddNote} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                        <textarea
                          value={noteForm.note}
                          onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                          rows={4}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter your note..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                          <select
                            value={noteForm.noteType}
                            onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="general">General</option>
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="follow_up">Follow Up</option>
                            <option value="issue">Issue</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
                          <select
                            value={noteForm.contactMethod}
                            onChange={(e) => setNoteForm({ ...noteForm, contactMethod: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Not applicable</option>
                            <option value="phone">Phone</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="in_person">In Person</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={noteForm.isImportant}
                            onChange={(e) => setNoteForm({ ...noteForm, isImportant: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Mark as important</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={noteForm.requiresFollowUp}
                            onChange={(e) => setNoteForm({ ...noteForm, requiresFollowUp: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Requires follow-up</span>
                        </label>
                      </div>

                      {noteForm.requiresFollowUp && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                          <input
                            type="datetime-local"
                            value={noteForm.followUpDate}
                            onChange={(e) => setNoteForm({ ...noteForm, followUpDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {loading ? "Adding..." : "Add Note"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Notes List */}
                <div className="space-y-3">
                  {client.clientNotes.length === 0 ? (
                    <div className="text-center py-12">
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <p className="text-gray-600">No notes yet for this client</p>
                    </div>
                  ) : (
                    client.clientNotes.map((note: any) => (
                      <NoteCard key={note.id} note={note} formatDateTime={formatDateTime} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function QuoteCard({ quote, formatDate, formatCurrency }: any) {
  const getStatusBadge = (status: string) => {
    const badges: any = {
      DRAFT: { bg: "bg-gray-100", text: "text-gray-800" },
      SENT: { bg: "bg-blue-100", text: "text-blue-800" },
      VIEWED: { bg: "bg-purple-100", text: "text-purple-800" },
      ACCEPTED: { bg: "bg-green-100", text: "text-green-800" },
      DECLINED: { bg: "bg-red-100", text: "text-red-800" },
      EXPIRED: { bg: "bg-orange-100", text: "text-orange-800" },
    };
    const badge = badges[status] || badges.DRAFT;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{quote.tripName}</h4>
          <p className="text-sm text-gray-600">{quote.destination}</p>
        </div>
        {getStatusBadge(quote.status)}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-600">Dates:</span>{" "}
          <span className="text-gray-900">{formatDate(quote.startDate)}</span>
        </div>
        <div>
          <span className="text-gray-600">Travelers:</span> <span className="text-gray-900">{quote.travelers}</span>
        </div>
        <div>
          <span className="text-gray-600">Total:</span>{" "}
          <span className="font-bold text-gray-900">{formatCurrency(quote.total, quote.currency)}</span>
        </div>
        <div>
          <span className="text-gray-600">Created:</span> <span className="text-gray-900">{formatDate(quote.createdAt)}</span>
        </div>
      </div>

      <Link
        href={`/agent/quotes/${quote.id}`}
        className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
      >
        View Quote
      </Link>
    </div>
  );
}

function BookingCard({ booking, formatDate, formatCurrency }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{booking.tripName}</h4>
          <p className="text-sm text-gray-600">{booking.destination}</p>
          <p className="text-xs text-gray-500 mt-1">Ref: {booking.referenceNumber}</p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-600">Dates:</span>{" "}
          <span className="text-gray-900">{formatDate(booking.startDate)}</span>
        </div>
        <div>
          <span className="text-gray-600">Travelers:</span> <span className="text-gray-900">{booking.travelers}</span>
        </div>
        <div>
          <span className="text-gray-600">Total:</span>{" "}
          <span className="font-bold text-green-600">{formatCurrency(booking.totalPrice, booking.currency)}</span>
        </div>
        <div>
          <span className="text-gray-600">Booked:</span> <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
        </div>
      </div>

      <Link
        href={`/agent/bookings/${booking.id}`}
        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
      >
        View Booking
      </Link>
    </div>
  );
}

function NoteCard({ note, formatDateTime }: any) {
  const getNoteIcon = (type: string) => {
    const icons: any = {
      general: "📝",
      call: "📞",
      email: "📧",
      meeting: "🤝",
      follow_up: "🔔",
      issue: "⚠️",
    };
    return icons[type] || "📝";
  };

  return (
    <div className={`border rounded-lg p-4 ${note.isImportant ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getNoteIcon(note.noteType)}</span>
          <span className="text-xs text-gray-600 capitalize">{note.noteType.replace("_", " ")}</span>
          {note.contactMethod && (
            <span className="text-xs text-gray-500">via {note.contactMethod}</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatDateTime(note.createdAt)}</span>
      </div>

      <p className="text-sm text-gray-900 mb-3">{note.note}</p>

      {note.requiresFollowUp && note.followUpDate && (
        <div className="bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-xs text-yellow-800">
          🔔 Follow-up required by: {formatDateTime(note.followUpDate)}
        </div>
      )}

      {note.isImportant && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ⚠️ Important
          </span>
        </div>
      )}
    </div>
  );
}
