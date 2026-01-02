"use client";

// components/agent/AgentRegistrationForm.tsx
// Level 6 Ultra-Premium 6-Step Agent Registration Wizard
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  User, Building2, Award, FileText, CreditCard, CheckCircle,
  ChevronRight, ChevronLeft, Sparkles, Globe, Phone,
  Mail, MapPin, Upload, Shield, RefreshCw, AlertCircle,
  Briefcase, Hash, Lock
} from "lucide-react";

interface Props {
  user: { id?: string; name?: string | null; email?: string | null };
}

const steps = [
  { id: 1, title: "Personal", icon: User, desc: "Your details" },
  { id: 2, title: "Business", icon: Building2, desc: "Company info" },
  { id: 3, title: "Credentials", icon: Award, desc: "IATA / ARC" },
  { id: 4, title: "Tax & ID", icon: FileText, desc: "Documents" },
  { id: 5, title: "Payment", icon: CreditCard, desc: "Billing" },
  { id: 6, title: "Review", icon: CheckCircle, desc: "Confirm" },
];

const specializations = [
  "Luxury Travel", "Honeymoons", "Family Travel", "Adventure",
  "Business Travel", "Group Travel", "Cruises", "All-Inclusive",
  "European Travel", "Asian Travel", "Caribbean", "Weddings",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

export default function AgentRegistrationForm({ user }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Step 2: Business
    businessName: "",
    businessType: "INDIVIDUAL",
    website: "",
    yearsExperience: "",
    specializations: [] as string[],
    bio: "",

    // Step 3: Credentials
    credentialType: "none" as "none" | "iata" | "arc" | "both",
    iataNumber: "",
    arcNumber: "",

    // Step 4: Tax & Documents
    ssnOrItin: "",
    ein: "",
    idDocumentType: "drivers_license" as "drivers_license" | "passport" | "state_id",
    idDocumentUrl: "",
    idDocumentName: "",

    // Step 5: Payment
    hasPaymentMethod: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",

    // Step 6: Terms
    termsAccepted: false,
    privacyAccepted: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpec = (spec: string) => {
    updateField(
      "specializations",
      formData.specializations.includes(spec)
        ? formData.specializations.filter((s) => s !== spec)
        : [...formData.specializations, spec]
    );
  };

  // Format SSN/ITIN: XXX-XX-XXXX
  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  };

  // Format EIN: XX-XXXXXXX
  const formatEIN = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  };

  // Format credit card: XXXX XXXX XXXX XXXX
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  // Format expiry: MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingDoc(true);
    try {
      // Create FormData for upload
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("type", "agent_id_document");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      updateField("idDocumentUrl", url);
      updateField("idDocumentName", file.name);
      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone;
      case 2:
        return formData.businessName && formData.city;
      case 3:
        // If they have credentials, they need to provide numbers
        if (formData.credentialType === "iata" && !formData.iataNumber) return false;
        if (formData.credentialType === "arc" && !formData.arcNumber) return false;
        if (formData.credentialType === "both" && (!formData.iataNumber || !formData.arcNumber)) return false;
        return true;
      case 4:
        // SSN/ITIN is required, EIN optional, ID document required
        return formData.ssnOrItin.length >= 11 && formData.idDocumentUrl;
      case 5:
        // Payment info is optional but if provided, must be complete
        if (formData.hasPaymentMethod) {
          return formData.cardNumber.length >= 19 && formData.cardExpiry.length === 5 && formData.cardCvc.length >= 3 && formData.cardName;
        }
        return true;
      case 6:
        return formData.termsAccepted && formData.privacyAccepted;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data for API (mask sensitive info)
      const submitData = {
        ...formData,
        // Only send last 4 of card if provided
        cardLastFour: formData.cardNumber ? formData.cardNumber.slice(-4) : undefined,
        // Don't send full card details to our backend
        cardNumber: undefined,
        cardExpiry: undefined,
        cardCvc: undefined,
      };

      const res = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Application submitted! We'll review it within 24-48 hours.");
      router.push("/agent");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Become a Travel Agent
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Fly2Any</h1>
          <p className="text-gray-600 mt-2">Start earning commissions on every booking</p>
        </motion.div>

        {/* Progress Steps - Scrollable on mobile */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 px-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                      isComplete
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isComplete ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                  </motion.div>
                  <p className={`text-[10px] md:text-xs mt-1 font-medium whitespace-nowrap ${isActive ? "text-indigo-600" : "text-gray-500"}`}>
                    {s.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 md:w-12 h-1 mx-1 md:mx-2 rounded ${isComplete ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8"
            >
              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={user.email || ""} disabled className={`${inputClass} pl-11 bg-gray-50`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="123 Main Street"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className={labelClass}>City *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select</option>
                        {US_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>ZIP Code</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => updateField("zipCode", e.target.value)}
                        className={inputClass}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>
                  <div>
                    <label className={labelClass}>Business Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateField("businessName", e.target.value)}
                        placeholder="Your Travel Agency"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Business Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "INDIVIDUAL", label: "Independent Agent" },
                        { value: "AGENCY", label: "Travel Agency" },
                        { value: "TOUR_OPERATOR", label: "Tour Operator" },
                        { value: "OTHER", label: "Other" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("businessType", type.value)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            formData.businessType === type.value
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Website (Optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        placeholder="https://youragency.com"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Years of Experience</label>
                    <select
                      value={formData.yearsExperience}
                      onChange={(e) => updateField("yearsExperience", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="0-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Specializations</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specializations.map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpec(spec)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.specializations.includes(spec)
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Bio (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      rows={3}
                      placeholder="Tell clients about your experience..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Credentials (IATA/ARC) */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Industry Credentials</h2>
                  <p className="text-sm text-gray-600">
                    Select your accreditation status. This helps us verify your professional standing.
                  </p>

                  <div>
                    <label className={labelClass}>Accreditation Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "none", label: "None", desc: "No IATA/ARC credentials" },
                        { value: "iata", label: "IATA Only", desc: "International Air Transport Association" },
                        { value: "arc", label: "ARC Only", desc: "Airlines Reporting Corporation" },
                        { value: "both", label: "Both", desc: "IATA and ARC accredited" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField("credentialType", opt.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            formData.credentialType === opt.value
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <p className={`font-medium ${formData.credentialType === opt.value ? "text-indigo-700" : "text-gray-900"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(formData.credentialType === "iata" || formData.credentialType === "both") && (
                    <div>
                      <label className={labelClass}>IATA Number *</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.iataNumber}
                          onChange={(e) => updateField("iataNumber", e.target.value)}
                          placeholder="Enter your IATA number"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>
                  )}

                  {(formData.credentialType === "arc" || formData.credentialType === "both") && (
                    <div>
                      <label className={labelClass}>ARC Number *</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.arcNumber}
                          onChange={(e) => updateField("arcNumber", e.target.value)}
                          placeholder="Enter your ARC number"
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>
                  )}

                  {formData.credentialType === "none" && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">No credentials? No problem!</p>
                          <p className="text-xs text-amber-700 mt-1">
                            You can still join as an independent agent. We offer training and resources to help you get started.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Tax Info & Documents */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Tax Information & ID</h2>
                  <p className="text-sm text-gray-600">
                    This information is required for commission payments and tax reporting.
                  </p>

                  <div>
                    <label className={labelClass}>
                      SSN or ITIN * <span className="text-gray-400 font-normal">(Required for 1099)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.ssnOrItin}
                        onChange={(e) => updateField("ssnOrItin", formatSSN(e.target.value))}
                        placeholder="XXX-XX-XXXX"
                        className={`${inputClass} pl-11 font-mono`}
                        maxLength={11}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Encrypted and stored securely. Never shared.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      EIN <span className="text-gray-400 font-normal">(If applicable)</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.ein}
                        onChange={(e) => updateField("ein", formatEIN(e.target.value))}
                        placeholder="XX-XXXXXXX"
                        className={`${inputClass} pl-11 font-mono`}
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Required for LLCs and corporations</p>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <label className={labelClass}>Government-Issued ID *</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { value: "drivers_license", label: "Driver's License" },
                        { value: "passport", label: "Passport" },
                        { value: "state_id", label: "State ID" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("idDocumentType", type.value)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                            formData.idDocumentType === type.value
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-600"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDocumentUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />

                    {formData.idDocumentUrl ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-emerald-800">Document uploaded</p>
                          <p className="text-xs text-emerald-600">{formData.idDocumentName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-emerald-700 hover:underline"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingDoc}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                      >
                        {uploadingDoc ? (
                          <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400 mx-auto group-hover:text-indigo-500" />
                        )}
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          {uploadingDoc ? "Uploading..." : "Click to upload your ID"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP or PDF (max 5MB)</p>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {step === 5 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">
                    Add a credit card for platform fees and service charges.
                  </p>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="hasPayment"
                      checked={formData.hasPaymentMethod}
                      onChange={(e) => updateField("hasPaymentMethod", e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="hasPayment" className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Add payment method now</p>
                      <p className="text-xs text-gray-500">You can also add this later from your dashboard</p>
                    </label>
                  </div>

                  {formData.hasPaymentMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4"
                    >
                      <div>
                        <label className={labelClass}>Cardholder Name *</label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) => updateField("cardName", e.target.value)}
                          placeholder="Name on card"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Card Number *</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => updateField("cardNumber", formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className={`${inputClass} pl-11 font-mono`}
                            maxLength={19}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Expiry *</label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => updateField("cardExpiry", formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className={`${inputClass} font-mono`}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>CVC *</label>
                          <input
                            type="text"
                            value={formData.cardCvc}
                            onChange={(e) => updateField("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="123"
                            className={`${inputClass} font-mono`}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Your card details are encrypted and processed securely via Stripe.
                      </p>
                    </motion.div>
                  )}

                  {!formData.hasPaymentMethod && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        <strong>No payment required now.</strong> You can add a payment method later when you make your first booking.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Review */}
              {step === 6 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Review Your Application</h2>

                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Personal</p>
                      <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email} • {formData.phone}</p>
                      {formData.city && <p className="text-sm text-gray-600">{formData.city}, {formData.state}</p>}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business</p>
                      <p className="font-medium text-gray-900">{formData.businessName}</p>
                      <p className="text-sm text-gray-600">{formData.businessType} • {formData.yearsExperience || "New"} experience</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Credentials</p>
                      <p className="font-medium text-gray-900">
                        {formData.credentialType === "none"
                          ? "No IATA/ARC"
                          : formData.credentialType === "both"
                          ? "IATA & ARC"
                          : formData.credentialType.toUpperCase()}
                      </p>
                      {formData.iataNumber && <p className="text-sm text-gray-600">IATA: {formData.iataNumber}</p>}
                      {formData.arcNumber && <p className="text-sm text-gray-600">ARC: {formData.arcNumber}</p>}
                    </div>

                    {formData.specializations.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.specializations.map((s) => (
                            <span key={s} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => updateField("termsAccepted", e.target.checked)}
                        className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" className="text-indigo-600 hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/agent-agreement" target="_blank" className="text-indigo-600 hover:underline">
                          Agent Agreement
                        </a>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.privacyAccepted}
                        onChange={(e) => updateField("privacyAccepted", e.target.checked)}
                        className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">
                        I acknowledge the{" "}
                        <a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">
                          Privacy Policy
                        </a>{" "}
                        and consent to processing my data
                      </span>
                    </label>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm text-emerald-800">
                      <strong>What happens next?</strong> Our team will review your application within 24-48 hours.
                      You will receive an email notification once your account is approved.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {step < 6 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Submitting..." : "Submit Application"}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
