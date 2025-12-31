"use client";

// components/agent/AgentRegistrationForm.tsx
// Level 6 Ultra-Premium Multi-Step Onboarding Wizard
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  User, Building2, Briefcase, MapPin, CheckCircle,
  ChevronRight, ChevronLeft, Sparkles, Globe, Phone,
  Mail, FileText, Award, RefreshCw
} from "lucide-react";

interface Props {
  user: { id?: string; name?: string | null; email?: string | null };
}

const steps = [
  { id: 1, title: "Personal", icon: User, desc: "Your details" },
  { id: 2, title: "Business", icon: Building2, desc: "Company info" },
  { id: 3, title: "Expertise", icon: Award, desc: "Specializations" },
  { id: 4, title: "Review", icon: CheckCircle, desc: "Confirm" },
];

const specializations = [
  "Luxury Travel", "Honeymoons", "Family Travel", "Adventure",
  "Business Travel", "Group Travel", "Cruises", "All-Inclusive",
  "European Travel", "Asian Travel", "Caribbean", "Weddings",
];

export default function AgentRegistrationForm({ user }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.name?.split(' ')[0] || "",
    lastName: user.name?.split(' ').slice(1).join(' ') || "",
    phone: "",
    businessName: "",
    businessType: "INDIVIDUAL",
    website: "",
    city: "",
    state: "",
    country: "United States",
    yearsExperience: "",
    specializations: [] as string[],
    bio: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpec = (spec: string) => {
    updateField('specializations',
      formData.specializations.includes(spec)
        ? formData.specializations.filter(s => s !== spec)
        : [...formData.specializations, spec]
    );
  };

  const canProceed = () => {
    if (step === 1) return formData.firstName && formData.lastName && formData.phone;
    if (step === 2) return formData.businessName && formData.city;
    if (step === 3) return formData.specializations.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Registration failed");

      toast.success("Welcome to Fly2Any!");
      router.push("/agent");
    } catch (err) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isComplete ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' :
                      'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <p className={`text-xs mt-2 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {s.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 rounded ${isComplete ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden"
        >
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
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={e => updateField('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={e => updateField('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={e => updateField('businessName', e.target.value)}
                        placeholder="Your Travel Agency"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'INDIVIDUAL', label: 'Independent Agent' },
                        { value: 'AGENCY', label: 'Travel Agency' },
                        { value: 'TOUR_OPERATOR', label: 'Tour Operator' },
                        { value: 'OTHER', label: 'Other' },
                      ].map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField('businessType', type.value)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            formData.businessType === type.value
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => updateField('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={e => updateField('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Website (Optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={e => updateField('website', e.target.value)}
                        placeholder="https://"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Expertise */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Your Expertise</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                    <select
                      value={formData.yearsExperience}
                      onChange={e => updateField('yearsExperience', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {specializations.map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpec(spec)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.specializations.includes(spec)
                              ? 'bg-indigo-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={e => updateField('bio', e.target.value)}
                      rows={3}
                      placeholder="Tell clients about your experience..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-gray-900">Review Your Application</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Personal</p>
                      <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email} • {formData.phone}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business</p>
                      <p className="font-medium text-gray-900">{formData.businessName}</p>
                      <p className="text-sm text-gray-600">{formData.city}, {formData.state}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Specializations</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.specializations.map(s => (
                          <span key={s} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm text-emerald-800">
                      <strong>What's next?</strong> After submitting, our team will review your application.
                      You'll receive an email within 24-48 hours.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {step < 4 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg disabled:opacity-50"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
