"use client";

import { useState, useEffect } from "react";
import { QuoteData } from "../QuoteBuilder";

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

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        updateQuoteData({ duration: diffDays });
      }
    }
  }, [formData.startDate, formData.endDate]);

  // Update total travelers when counts change
  useEffect(() => {
    const total = formData.adults + formData.children + formData.infants;
    setFormData(prev => ({ ...prev, travelers: total }));
  }, [formData.adults, formData.children, formData.infants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseInt(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleNext = () => {
    // Validation
    if (!formData.tripName.trim()) {
      alert("Please enter a trip name");
      return;
    }
    if (!formData.destination.trim()) {
      alert("Please enter a destination");
      return;
    }
    if (!formData.startDate) {
      alert("Please select a start date");
      return;
    }
    if (!formData.endDate) {
      alert("Please select an end date");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date must be after start date");
      return;
    }
    if (formData.travelers < 1) {
      alert("Please add at least one traveler");
      return;
    }

    // Save data
    updateQuoteData(formData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Details</h2>
        <p className="text-gray-600">Provide the basic trip information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Name *
          </label>
          <input
            type="text"
            name="tripName"
            value={formData.tripName}
            onChange={handleChange}
            placeholder="e.g., European Adventure, Bali Getaway, Hawaii Family Vacation"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be displayed as the main title of the quote
          </p>
        </div>

        {/* Destination */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination *
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g., Paris, France | Bali, Indonesia | Multiple Cities"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departure Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Return Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Duration Display */}
      {formData.startDate && formData.endDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-900 font-medium">
              Trip Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) === 1 ? "Day" : "Days"}
            </span>
          </div>
        </div>
      )}

      {/* Travelers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Travelers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Adults */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adults (12+ years) *
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => formData.adults > 0 && setFormData(prev => ({ ...prev, adults: prev.adults - 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                disabled={formData.adults === 0}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                min="0"
                className="w-20 text-center text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Children (2-11 years)
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => formData.children > 0 && setFormData(prev => ({ ...prev, children: prev.children - 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                disabled={formData.children === 0}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                name="children"
                value={formData.children}
                onChange={handleChange}
                min="0"
                className="w-20 text-center text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, children: prev.children + 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infants (0-2 years)
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => formData.infants > 0 && setFormData(prev => ({ ...prev, infants: prev.infants - 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                disabled={formData.infants === 0}
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                name="infants"
                value={formData.infants}
                onChange={handleChange}
                min="0"
                className="w-20 text-center text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, infants: prev.infants + 1 }))}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Total Travelers Display */}
        <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Travelers:</span>
            <span className="text-2xl font-bold text-primary-600">{formData.travelers}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm"
        >
          Next: Add Products →
        </button>
      </div>
    </div>
  );
}
