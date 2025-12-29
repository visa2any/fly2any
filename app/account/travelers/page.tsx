'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Star,
  Plane,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FrequentTraveler {
  id: string;
  relationship: string;
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
  knownTravelerNumber?: string;
  redressNumber?: string;
  frequentFlyerNumbers?: any;
  hotelLoyaltyNumbers?: any;
  email?: string;
  phone?: string;
  seatPreference?: string;
  mealPreference?: string;
  specialNeeds?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function TravelersPage() {
  const { data: session, status } = useSession();
  const [travelers, setTravelers] = useState<FrequentTraveler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<FrequentTraveler | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    relationship: 'self',
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    passportCountry: '',
    knownTravelerNumber: '',
    redressNumber: '',
    email: '',
    phone: '',
    seatPreference: 'window',
    mealPreference: 'regular',
    specialNeeds: '',
    isDefault: false,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTravelers();
    }
  }, [status]);

  const fetchTravelers = async () => {
    try {
      const response = await fetch('/api/travelers');
      if (response.ok) {
        const data = await response.json();
        setTravelers(data.travelers || []);
      }
    } catch (error) {
      toast.error('Failed to load travelers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (traveler?: FrequentTraveler) => {
    if (traveler) {
      setEditingTraveler(traveler);
      setFormData({
        relationship: traveler.relationship || 'self',
        title: traveler.title || 'Mr',
        firstName: traveler.firstName,
        middleName: traveler.middleName || '',
        lastName: traveler.lastName,
        dateOfBirth: traveler.dateOfBirth.split('T')[0],
        gender: traveler.gender,
        nationality: traveler.nationality || '',
        passportNumber: traveler.passportNumber || '',
        passportExpiry: traveler.passportExpiry ? traveler.passportExpiry.split('T')[0] : '',
        passportCountry: traveler.passportCountry || '',
        knownTravelerNumber: traveler.knownTravelerNumber || '',
        redressNumber: traveler.redressNumber || '',
        email: traveler.email || '',
        phone: traveler.phone || '',
        seatPreference: traveler.seatPreference || 'window',
        mealPreference: traveler.mealPreference || 'regular',
        specialNeeds: traveler.specialNeeds || '',
        isDefault: traveler.isDefault,
      });
    } else {
      setEditingTraveler(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      relationship: 'self',
      title: 'Mr',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      passportCountry: '',
      knownTravelerNumber: '',
      redressNumber: '',
      email: '',
      phone: '',
      seatPreference: 'window',
      mealPreference: 'regular',
      specialNeeds: '',
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingTraveler
        ? `/api/travelers/${editingTraveler.id}`
        : '/api/travelers';

      const method = editingTraveler ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save traveler');
      }

      toast.success(editingTraveler ? 'Traveler updated!' : 'Traveler added!');
      setShowModal(false);
      fetchTravelers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save traveler');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this traveler?')) return;

    try {
      const response = await fetch(`/api/travelers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Traveler deleted');
      fetchTravelers();
    } catch (error) {
      toast.error('Failed to delete traveler');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/travelers/${id}/set-default`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to set default');

      toast.success('Default traveler updated');
      fetchTravelers();
    } catch (error) {
      toast.error('Failed to update default traveler');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header - Level 6 Mobile */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 md:w-7 md:h-7" />
              Frequent Travelers
            </h1>
            <p className="text-white/80 text-sm mt-1">Save info for faster booking</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Traveler</span>
          </button>
        </div>
      </div>

      {/* Stats - Horizontal scroll mobile */}
      <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto scrollbar-hide px-3 md:px-0 pb-1">
        <div className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border p-4 border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Users className="w-5 h-5 text-primary-500" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">{travelers.length}</span>
          </div>
          <p className="text-sm font-medium text-neutral-800">Travelers</p>
          <p className="text-xs text-neutral-500">Total saved</p>
        </div>

        <div className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border p-4 border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">{travelers.filter(t => t.passportNumber).length}</span>
          </div>
          <p className="text-sm font-medium text-neutral-800">Passports</p>
          <p className="text-xs text-neutral-500">Documented</p>
        </div>

        <div className="flex-shrink-0 w-[140px] md:w-auto bg-white md:rounded-xl border-y md:border p-4 border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Plane className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">{travelers.filter(t => t.knownTravelerNumber).length}</span>
          </div>
          <p className="text-sm font-medium text-neutral-800">PreCheck</p>
          <p className="text-xs text-neutral-500">TSA/Global Entry</p>
        </div>
      </div>

      {/* Travelers List */}
      {travelers.length === 0 ? (
        <div className="bg-white md:rounded-xl border-y md:border-2 border-dashed border-neutral-300 p-8 md:p-12 text-center mx-0">
          <Users className="w-12 h-12 md:w-16 md:h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No travelers yet</h3>
          <p className="text-sm text-neutral-600 mb-6">Add your first traveler for faster bookings</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg active:scale-[0.98]"
          >
            Add Your First Traveler
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 md:gap-4 px-0">
          {travelers.map((traveler) => (
            <div
              key={traveler.id}
              className="bg-white md:rounded-xl border-y md:border-2 border-neutral-200 hover:border-primary-300 p-4 md:p-5 transition-all relative"
            >
              {/* Default Badge */}
              {traveler.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-warning-100 text-warning-700 text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" />
                    DEFAULT
                  </span>
                </div>
              )}

              {/* Name */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {traveler.title} {traveler.firstName} {traveler.lastName}
                </h3>
                <p className="text-sm text-gray-600 capitalize">{traveler.relationship}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(traveler.dateOfBirth).toLocaleDateString()}
                </div>
                {traveler.nationality && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {traveler.nationality}
                  </div>
                )}
                {traveler.passportNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    Passport: •••• {traveler.passportNumber.slice(-4)}
                  </div>
                )}
                {traveler.knownTravelerNumber && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    TSA PreCheck
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                {!traveler.isDefault && (
                  <button
                    onClick={() => handleSetDefault(traveler.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(traveler)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(traveler.id)}
                  className="flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingTraveler ? 'Edit Traveler' : 'Add New Traveler'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Relationship *
                    </label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="self">Self</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="parent">Parent</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Colleague</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                    <select
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="US, GB, BR, etc."
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Passport Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Passport Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.passportExpiry}
                      onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Issuing Country
                    </label>
                    <input
                      type="text"
                      value={formData.passportCountry}
                      onChange={(e) => setFormData({ ...formData, passportCountry: e.target.value })}
                      placeholder="US, GB, BR, etc."
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      TSA PreCheck / Global Entry
                    </label>
                    <input
                      type="text"
                      value={formData.knownTravelerNumber}
                      onChange={(e) => setFormData({ ...formData, knownTravelerNumber: e.target.value })}
                      placeholder="Known Traveler Number"
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Seat Preference
                    </label>
                    <select
                      value={formData.seatPreference}
                      onChange={(e) => setFormData({ ...formData, seatPreference: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="window">Window</option>
                      <option value="aisle">Aisle</option>
                      <option value="middle">Middle</option>
                      <option value="any">No Preference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Meal Preference
                    </label>
                    <select
                      value={formData.mealPreference}
                      onChange={(e) => setFormData({ ...formData, mealPreference: e.target.value })}
                      className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="regular">Regular</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="kosher">Kosher</option>
                      <option value="halal">Halal</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Default Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-warning-50 rounded-lg border border-warning-200">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">
                  <Star className="w-4 h-4 inline mr-1 text-warning-600" />
                  Set as default traveler (auto-fill in bookings)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingTraveler ? 'Update Traveler' : 'Add Traveler'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
