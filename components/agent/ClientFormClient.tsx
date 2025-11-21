"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ClientFormClientProps {
  mode: "create" | "edit";
  client?: any;
  quickMode?: boolean;
  onSuccess?: (clientId: string) => void;
}

export default function ClientFormClient({
  mode,
  client,
  quickMode: initialQuickMode = false,
  onSuccess
}: ClientFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(initialQuickMode);
  const [activeSection, setActiveSection] = useState<"basic" | "travel" | "documents" | "preferences">("basic");

  const [formData, setFormData] = useState({
    // Basic Information (REQUIRED)
    firstName: client?.firstName || "",
    lastName: client?.lastName || "",
    email: client?.email || "",
    phone: client?.phone || "",

    // Basic Information (OPTIONAL)
    company: client?.company || "",
    dateOfBirth: client?.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : "",
    anniversary: client?.anniversary ? new Date(client.anniversary).toISOString().split('T')[0] : "",
    preferredLanguage: client?.preferredLanguage || "English",
    nationality: client?.nationality || "",

    // Address
    address: client?.address || "",
    city: client?.city || "",
    state: client?.state || "",
    country: client?.country || "",
    zipCode: client?.zipCode || "",

    // Travel Preferences
    cabinClass: client?.cabinClass || "ECONOMY",
    preferredAirlines: client?.preferredAirlines?.join(", ") || "",
    homeAirport: client?.homeAirport || "",
    seatPreference: client?.seatPreference || "",
    mealPreference: client?.mealPreference || "",
    dietaryRestrictions: client?.dietaryRestrictions?.join(", ") || "",
    specialNeeds: client?.specialNeeds || "",

    // Travel Documents
    passportNumber: client?.passportNumber || "",
    passportExpiry: client?.passportExpiry ? new Date(client.passportExpiry).toISOString().split('T')[0] : "",
    passportCountry: client?.passportCountry || "",
    tsaPrecheck: client?.tsaPrecheck || false,
    globalEntry: client?.globalEntry || false,

    // Trip Preferences
    budgetRange: client?.budgetRange || "MEDIUM",
    tripTypes: client?.tripTypes?.join(", ") || "",
    favoriteDestinations: client?.favoriteDestinations?.join(", ") || "",
    travelStyle: client?.travelStyle || "BALANCED",

    // Communication
    preferredChannel: client?.preferredChannel || "EMAIL",
    bestTimeToContact: client?.bestTimeToContact || "",

    // Classification
    segment: client?.segment || "STANDARD",
    tags: client?.tags?.join(", ") || "",
    isVip: client?.isVip || false,

    // Notes
    notes: client?.notes || "",
    internalNotes: client?.internalNotes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveType: "quick" | "full" = "full") => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error("Please fill in all required fields (First Name, Last Name, Email)");
      }

      // Prepare data for API
      const payload = {
        ...formData,
        preferredAirlines: formData.preferredAirlines
          .split(",")
          .map((a: string) => a.trim())
          .filter((a: string) => a),
        dietaryRestrictions: formData.dietaryRestrictions
          .split(",")
          .map((d: string) => d.trim())
          .filter((d: string) => d),
        tripTypes: formData.tripTypes
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t),
        favoriteDestinations: formData.favoriteDestinations
          .split(",")
          .map((f: string) => f.trim())
          .filter((f: string) => f),
        tags: formData.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter((t: string) => t),
      };

      const url = mode === "create"
        ? "/api/agents/clients"
        : `/api/agents/clients/${client.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${mode} client`);
      }

      const successMessage = saveType === "quick"
        ? "Client created! You can add more details anytime."
        : `Client ${mode === "create" ? "created" : "updated"} successfully!`;

      toast.success(successMessage);

      // Call onSuccess callback if provided (for inline creation)
      if (onSuccess) {
        onSuccess(data.client.id);
      } else {
        // Default behavior: navigate to client detail
        router.push(`/agent/clients/${data.client.id}`);
      }

      router.refresh();
    } catch (error: any) {
      console.error(`${mode} client error:`, error);
      toast.error(error.message || `Failed to ${mode} client`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const totalFields = 27; // Total meaningful fields
    let filledFields = 0;

    if (formData.firstName) filledFields++;
    if (formData.lastName) filledFields++;
    if (formData.email) filledFields++;
    if (formData.phone) filledFields++;
    if (formData.company) filledFields++;
    if (formData.dateOfBirth) filledFields++;
    if (formData.nationality) filledFields++;
    if (formData.address) filledFields++;
    if (formData.city) filledFields++;
    if (formData.country) filledFields++;
    if (formData.cabinClass !== "ECONOMY") filledFields++;
    if (formData.preferredAirlines) filledFields++;
    if (formData.homeAirport) filledFields++;
    if (formData.seatPreference) filledFields++;
    if (formData.mealPreference) filledFields++;
    if (formData.passportNumber) filledFields++;
    if (formData.passportExpiry) filledFields++;
    if (formData.passportCountry) filledFields++;
    if (formData.tsaPrecheck) filledFields++;
    if (formData.globalEntry) filledFields++;
    if (formData.budgetRange !== "MEDIUM") filledFields++;
    if (formData.tripTypes) filledFields++;
    if (formData.favoriteDestinations) filledFields++;
    if (formData.travelStyle !== "BALANCED") filledFields++;
    if (formData.preferredChannel !== "EMAIL") filledFields++;
    if (formData.bestTimeToContact) filledFields++;
    if (formData.notes) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  const completionPercent = calculateCompletion();
  const isReadyForQuotes = formData.firstName && formData.lastName && formData.email;

  const sections = [
    { id: "basic", name: "Basic Info", icon: "👤", description: "Essential details", fields: 9 },
    { id: "travel", name: "Travel", icon: "✈️", description: "Flight preferences", fields: 7 },
    { id: "documents", name: "Documents", icon: "🛂", description: "Passport & IDs", fields: 5 },
    { id: "preferences", name: "Preferences", icon: "⚙️", description: "Budget & style", fields: 6 },
  ];

  // QUICK MODE: Minimal fields only
  if (quickMode) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form - 2/3 width */}
        <div className="lg:col-span-2">
          <form onSubmit={(e) => handleSubmit(e, "quick")} className="space-y-6">
            {/* Quick Mode Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Quick Create Mode</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    Just the essentials to get started. Add more details anytime!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickMode(false)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                >
                  Switch to Full →
                </button>
              </div>
            </div>

            {/* Essential Fields Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Essential Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !isReadyForQuotes}
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {loading ? "Creating..." : "Create Client"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Quick Tips Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Quick Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Only 3 fields required to start</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Add more details anytime from client profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Ready to create quotes immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <span>Average completion time: 30 seconds</span>
                </li>
              </ul>
            </div>

            {/* Profile Strength Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Profile Strength</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-semibold text-gray-900">{completionPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>

                {isReadyForQuotes && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Ready to create quotes!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FULL MODE: Complete form with all sections
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form - 2/3 width */}
      <div className="lg:col-span-2">
        <form onSubmit={(e) => handleSubmit(e, "full")} className="space-y-6">
          {/* Mode Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">Creation Mode:</div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setQuickMode(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all rounded-md"
                  >
                    ⚡ Quick
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium bg-white text-primary-600 shadow-sm rounded-md"
                  >
                    📋 Full
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Profile: <span className="font-semibold text-gray-900">{completionPercent}%</span>
              </div>
            </div>
          </div>

          {/* Progress Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id as any)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{section.icon}</div>
                  <div className={`text-sm font-semibold ${activeSection === section.id ? "text-white" : "text-gray-900"}`}>
                    {section.name}
                  </div>
                  <div className={`text-xs ${activeSection === section.id ? "text-white/80" : "text-gray-500"}`}>
                    {section.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Sections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Basic Information Section */}
            {activeSection === "basic" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Basic Information
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Essential contact details for your client</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anniversary
                      </label>
                      <input
                        type="date"
                        name="anniversary"
                        value={formData.anniversary}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Language
                      </label>
                      <select
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Mandarin">Mandarin</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    Address
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Optional - Can be added later when booking</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">🏷️</span>
                    Client Classification
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Help organize and prioritize your clients</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Segment
                      </label>
                      <select
                        name="segment"
                        value={formData.segment}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="high-value, repeat-customer"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          name="isVip"
                          checked={formData.isVip}
                          onChange={handleChange}
                          className="mr-3 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          ⭐ Mark as VIP Client (Priority support & exclusive offers)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Travel Preferences Section */}
            {activeSection === "travel" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">✈️</span>
                    Flight Preferences
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Help us find the perfect flights for your client</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Cabin Class
                      </label>
                      <select
                        name="cabinClass"
                        value={formData.cabinClass}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="ECONOMY">Economy</option>
                        <option value="PREMIUM_ECONOMY">Premium Economy</option>
                        <option value="BUSINESS">Business</option>
                        <option value="FIRST">First Class</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Home Airport
                      </label>
                      <input
                        type="text"
                        name="homeAirport"
                        value={formData.homeAirport}
                        onChange={handleChange}
                        placeholder="e.g., JFK, LAX, ORD"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seat Preference
                      </label>
                      <select
                        name="seatPreference"
                        value={formData.seatPreference}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="">No preference</option>
                        <option value="WINDOW">Window</option>
                        <option value="AISLE">Aisle</option>
                        <option value="MIDDLE">Middle</option>
                        <option value="EXTRA_LEGROOM">Extra Legroom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meal Preference
                      </label>
                      <select
                        name="mealPreference"
                        value={formData.mealPreference}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="">No preference</option>
                        <option value="STANDARD">Standard</option>
                        <option value="VEGETARIAN">Vegetarian</option>
                        <option value="VEGAN">Vegan</option>
                        <option value="KOSHER">Kosher</option>
                        <option value="HALAL">Halal</option>
                        <option value="GLUTEN_FREE">Gluten Free</option>
                        <option value="DIABETIC">Diabetic</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Airlines (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="preferredAirlines"
                        value={formData.preferredAirlines}
                        onChange={handleChange}
                        placeholder="e.g., United, Delta, American"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dietary Restrictions (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="dietaryRestrictions"
                        value={formData.dietaryRestrictions}
                        onChange={handleChange}
                        placeholder="e.g., gluten-free, nut allergy, lactose intolerant"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Needs / Accessibility Requirements
                      </label>
                      <textarea
                        name="specialNeeds"
                        value={formData.specialNeeds}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g., wheelchair assistance, oxygen, medical equipment"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === "documents" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">🛂</span>
                    Passport Information
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Required for international bookings only</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport Country
                      </label>
                      <input
                        type="text"
                        name="passportCountry"
                        value={formData.passportCountry}
                        onChange={handleChange}
                        placeholder="e.g., United States"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport Expiry Date
                      </label>
                      <input
                        type="date"
                        name="passportExpiry"
                        value={formData.passportExpiry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      {formData.passportExpiry && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Passport should be valid for at least 6 months beyond travel dates
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Trusted Traveler Programs
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Expedited security screening</p>

                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        name="tsaPrecheck"
                        checked={formData.tsaPrecheck}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block">
                          TSA PreCheck ✓
                        </span>
                        <span className="text-xs text-gray-500">Expedited security screening in the US</span>
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer group p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        name="globalEntry"
                        checked={formData.globalEntry}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block">
                          Global Entry ✓
                        </span>
                        <span className="text-xs text-gray-500">Expedited customs/immigration when entering the US</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    Trip Preferences
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Help us recommend the perfect destinations and experiences</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range
                      </label>
                      <select
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="BUDGET">Budget ($)</option>
                        <option value="MEDIUM">Medium ($$)</option>
                        <option value="PREMIUM">Premium ($$$)</option>
                        <option value="LUXURY">Luxury ($$$$)</option>
                        <option value="ULTRA_LUXURY">Ultra Luxury ($$$$$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Style
                      </label>
                      <select
                        name="travelStyle"
                        value={formData.travelStyle}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="ADVENTUROUS">Adventurous</option>
                        <option value="RELAXED">Relaxed/Leisure</option>
                        <option value="CULTURAL">Cultural/Educational</option>
                        <option value="BALANCED">Balanced</option>
                        <option value="LUXURY">Luxury/Pampered</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Types (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tripTypes"
                        value={formData.tripTypes}
                        onChange={handleChange}
                        placeholder="e.g., beach, adventure, city, cruise"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favorite Destinations (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="favoriteDestinations"
                        value={formData.favoriteDestinations}
                        onChange={handleChange}
                        placeholder="e.g., Paris, Tokyo, Maldives, New York"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">📞</span>
                    Communication Preferences
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">How and when to contact your client</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Contact Method
                      </label>
                      <select
                        name="preferredChannel"
                        value={formData.preferredChannel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="PHONE">Phone</option>
                        <option value="SMS">SMS/Text</option>
                        <option value="WHATSAPP">WhatsApp</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Best Time to Contact
                      </label>
                      <input
                        type="text"
                        name="bestTimeToContact"
                        value={formData.bestTimeToContact}
                        onChange={handleChange}
                        placeholder="e.g., Weekdays 9am-5pm EST"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Notes
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Additional information about your client</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="General notes about the client, their preferences, or past conversations"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Internal Notes (Private)
                      </label>
                      <textarea
                        name="internalNotes"
                        value={formData.internalNotes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Private notes not visible to the client"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        These notes are only visible to you and will never be shared with the client
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !isReadyForQuotes}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {loading ? "Saving..." : mode === "create" ? "Create Client" : "Update Client"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sidebar - 1/3 width */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          {/* Profile Strength Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Profile Strength</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-semibold text-gray-900">{completionPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      completionPercent < 30
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : completionPercent < 70
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {isReadyForQuotes && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Ready to create quotes!</span>
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Basic Info</span>
                  <span className="text-gray-400">{activeSection === 'basic' ? '◀' : '✓'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Travel Prefs</span>
                  <span className="text-gray-400">{activeSection === 'travel' ? '◀' : '○'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Documents</span>
                  <span className="text-gray-400">{activeSection === 'documents' ? '◀' : '○'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Preferences</span>
                  <span className="text-gray-400">{activeSection === 'preferences' ? '◀' : '○'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Pro Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {activeSection === 'basic' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Only name & email required to start</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Address needed only when booking</span>
                  </li>
                </>
              )}
              {activeSection === 'travel' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Preferences help auto-fill future quotes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Dietary info can be added at booking time</span>
                  </li>
                </>
              )}
              {activeSection === 'documents' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Required for international flights only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>6 months validity recommended</span>
                  </li>
                </>
              )}
              {activeSection === 'preferences' && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Helps recommend personalized destinations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <span>Build over time based on bookings</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Quick Actions Card */}
          {mode === "create" && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">After Creating</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Create a quote for this client</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Search flights and hotels</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Add more details later</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
