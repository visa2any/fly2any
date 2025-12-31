"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Minus, Plus, Clock } from "lucide-react";
import { QuoteData } from "../QuoteBuilder";
import DestinationAutocomplete from "./DestinationAutocomplete";

interface Step2TripDetailsProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuoteBuilderStep2TripDetails({
  quoteData,
  updateQuoteData,
  onNext,
  onPrev,
}: Step2TripDetailsProps) {
  const [formData, setFormData] = useState({
    tripName: quoteData.tripName,
    destination: quoteData.destination,
    startDate: quoteData.startDate,
    endDate: quoteData.endDate,
    travelers: quoteData.travelers,
    adults: quoteData.adults,
    children: quoteData.children,
    infants: quoteData.infants,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate duration
  const duration =
    formData.startDate && formData.endDate
      ? Math.ceil(
          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Update total travelers
  useEffect(() => {
    const total = formData.adults + formData.children + formData.infants;
    setFormData((prev) => ({ ...prev, travelers: total }));
  }, [formData.adults, formData.children, formData.infants]);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tripName.trim()) newErrors.tripName = "Trip name is required";
    if (!formData.destination.trim()) newErrors.destination = "Destination is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (formData.travelers < 1) newErrors.travelers = "Add at least one traveler";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateQuoteData({ ...formData, duration });
    onNext();
  };

  // Traveler counter component
  const TravelerCounter = ({
    label,
    sublabel,
    value,
    onChange,
    gradient,
  }: {
    label: string;
    sublabel: string;
    value: number;
    onChange: (v: number) => void;
    gradient: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{sublabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => value > 0 && onChange(value - 1)}
            disabled={value === 0}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className={`text-2xl font-bold w-8 text-center bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </span>
          <button
            onClick={() => onChange(value + 1)}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MapPin className="w-7 h-7 text-blue-500" />
          Trip Details
        </h2>
        <p className="text-gray-600">Tell us about the trip you're planning</p>
      </div>

      {/* Trip Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Name *</label>
        <input
          type="text"
          value={formData.tripName}
          onChange={(e) => handleChange("tripName", e.target.value)}
          placeholder="e.g., European Adventure, Bali Getaway..."
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
            errors.tripName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.tripName && <p className="text-red-500 text-sm mt-1">{errors.tripName}</p>}
        <p className="text-xs text-gray-500 mt-1.5">Displayed as the quote headline to your client</p>
      </div>

      {/* Destination with Autocomplete */}
      <div>
        <DestinationAutocomplete
          value={formData.destination}
          onChange={(v) => handleChange("destination", v)}
          label="Destination *"
          placeholder="Where are they going?"
        />
        {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Departure Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.startDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Return Date *
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.endDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* Duration Badge */}
      {duration > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trip Duration</p>
              <p className="text-xl font-bold text-gray-900">
                {duration} {duration === 1 ? "Day" : "Days"} / {duration > 0 ? duration - 1 : 0} {duration === 2 ? "Night" : "Nights"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Travelers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Travelers</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TravelerCounter
            label="Adults"
            sublabel="12+ years"
            value={formData.adults}
            onChange={(v) => handleChange("adults", v)}
            gradient="from-blue-600 to-indigo-600"
          />
          <TravelerCounter
            label="Children"
            sublabel="2-11 years"
            value={formData.children}
            onChange={(v) => handleChange("children", v)}
            gradient="from-emerald-600 to-teal-600"
          />
          <TravelerCounter
            label="Infants"
            sublabel="Under 2"
            value={formData.infants}
            onChange={(v) => handleChange("infants", v)}
            gradient="from-amber-600 to-orange-600"
          />
        </div>

        {errors.travelers && <p className="text-red-500 text-sm mt-2">{errors.travelers}</p>}

        {/* Total */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 bg-gradient-to-r from-primary-50 to-rose-50 border border-primary-200 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Total Travelers</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-rose-600 bg-clip-text text-transparent">
              {formData.travelers}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2"
        >
          Next: Add Products
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
