'use client';

import { useState } from 'react';
import {
  Calendar,
  User,
  Briefcase,
  CreditCard,
  AlertCircle,
  Check,
  X,
  Edit,
  ChevronRight,
  Info,
  Plane,
  MapPin,
} from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';

export interface BookingModificationData {
  bookingReference: string;
  pnr?: string;
  currentFlight: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    cabin: string;
  };
  passengers: {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  currentBaggage: {
    checked: number;
    carryon: number;
  };
  currentSeats?: {
    passengerId: string;
    seatNumber: string;
  }[];
}

interface ModificationWidgetProps {
  bookingData: BookingModificationData;
  onSubmitModification: (modification: ModificationRequest) => Promise<void>;
  onCancel: () => void;
}

export interface ModificationRequest {
  type: 'date_change' | 'passenger_details' | 'baggage' | 'seats';
  changes: Record<string, any>;
  acknowledgedFees: boolean;
}

type ModificationTab = 'dates' | 'passengers' | 'baggage' | 'seats';

export function ModificationWidget({
  bookingData,
  onSubmitModification,
  onCancel,
}: ModificationWidgetProps) {
  const [activeTab, setActiveTab] = useState<ModificationTab>('dates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Date modification state
  const [newDepartureDate, setNewDepartureDate] = useState(bookingData.currentFlight.departureDate);
  const [dateChangeFee, setDateChangeFee] = useState(75); // Example fee

  // Passenger modification state
  const [editingPassenger, setEditingPassenger] = useState<string | null>(null);
  const [passengerChanges, setPassengerChanges] = useState<Record<string, any>>({});

  // Baggage modification state
  const [checkedBags, setCheckedBags] = useState(bookingData.currentBaggage.checked);
  const [baggageFee, setBaggageFee] = useState(0);

  // Seat modification state
  const [seatChanges, setSeatChanges] = useState<Record<string, string>>({});
  const [seatChangeFee, setSeatChangeFee] = useState(0);

  // Fee acknowledgment
  const [acknowledgedFees, setAcknowledgedFees] = useState(false);

  const handleSubmit = async () => {
    if (!acknowledgedFees && getTotalFees() > 0) {
      setError('Please acknowledge the modification fees before proceeding.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let modification: ModificationRequest;

      switch (activeTab) {
        case 'dates':
          modification = {
            type: 'date_change',
            changes: { newDepartureDate },
            acknowledgedFees,
          };
          break;
        case 'passengers':
          modification = {
            type: 'passenger_details',
            changes: passengerChanges,
            acknowledgedFees,
          };
          break;
        case 'baggage':
          modification = {
            type: 'baggage',
            changes: { checkedBags },
            acknowledgedFees,
          };
          break;
        case 'seats':
          modification = {
            type: 'seats',
            changes: seatChanges,
            acknowledgedFees,
          };
          break;
      }

      await onSubmitModification(modification);
      setSuccess(true);

      // Reset after success
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit modification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalFees = () => {
    switch (activeTab) {
      case 'dates':
        return newDepartureDate !== bookingData.currentFlight.departureDate ? dateChangeFee : 0;
      case 'baggage':
        const additionalBags = Math.max(0, checkedBags - bookingData.currentBaggage.checked);
        return additionalBags * 35; // $35 per additional bag
      case 'seats':
        return Object.keys(seatChanges).length * 25; // $25 per seat change
      default:
        return 0;
    }
  };

  const tabs = [
    { id: 'dates', label: 'Change Dates', icon: Calendar },
    { id: 'passengers', label: 'Passenger Details', icon: User },
    { id: 'baggage', label: 'Add Baggage', icon: Briefcase },
    { id: 'seats', label: 'Change Seats', icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Modify Your Booking</h2>
            <p className="text-primary-100 text-sm mt-1">
              Booking Reference: <span className="font-semibold">{bookingData.bookingReference}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">
                {bookingData.currentFlight.airline} {bookingData.currentFlight.flightNumber}
              </div>
              <div className="font-bold text-lg text-gray-900">
                {bookingData.currentFlight.origin} → {bookingData.currentFlight.destination}
              </div>
              <div className="text-xs text-gray-500">
                {format(parseISO(bookingData.currentFlight.departureDate), 'EEE, MMM d, yyyy')} at{' '}
                {bookingData.currentFlight.departureTime}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Cabin</div>
            <div className="font-semibold text-gray-900">{bookingData.currentFlight.cabin}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ModificationTab)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Modification Submitted Successfully!</h4>
              <p className="text-sm text-green-700 mt-1">
                Your booking has been updated. Check your email for confirmation.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Date Change Tab */}
        {activeTab === 'dates' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Date change policy:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Changes must be made at least 24 hours before departure</li>
                  <li>Subject to seat availability on new flight</li>
                  <li>Fare difference may apply if new flight is more expensive</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Departure Date
              </label>
              <input
                type="date"
                value={newDepartureDate}
                onChange={(e) => setNewDepartureDate(e.target.value)}
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {newDepartureDate !== bookingData.currentFlight.departureDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900">Date Change Fee</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Per passenger, per direction
                    </p>
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    ${dateChangeFee.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passenger Details Tab */}
        {activeTab === 'passengers' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                Minor corrections to passenger names are typically free. Major changes may require
                canceling and rebooking.
              </div>
            </div>

            {bookingData.passengers.map((passenger) => (
              <div
                key={passenger.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {passenger.title}. {passenger.firstName} {passenger.lastName}
                  </h4>
                  <button
                    onClick={() =>
                      setEditingPassenger(editingPassenger === passenger.id ? null : passenger.id)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                {editingPassenger === passenger.id && (
                  <div className="mt-3 pt-3 border-t border-gray-300 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={passenger.firstName}
                          onChange={(e) =>
                            setPassengerChanges({
                              ...passengerChanges,
                              [passenger.id]: {
                                ...passengerChanges[passenger.id],
                                firstName: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={passenger.lastName}
                          onChange={(e) =>
                            setPassengerChanges({
                              ...passengerChanges,
                              [passenger.id]: {
                                ...passengerChanges[passenger.id],
                                lastName: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={passenger.email}
                        onChange={(e) =>
                          setPassengerChanges({
                            ...passengerChanges,
                            [passenger.id]: {
                              ...passengerChanges[passenger.id],
                              email: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Baggage Tab */}
        {activeTab === 'baggage' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Baggage allowance:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Carry-on: 1 bag up to 7kg (included)</li>
                  <li>Checked bag: Up to 23kg each</li>
                  <li>Additional bags: $35 per bag</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Number of Checked Bags
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCheckedBags(Math.max(0, checkedBags - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
                  disabled={checkedBags === 0}
                >
                  -
                </button>
                <div className="text-center">
                  <div className="text-4xl font-black text-primary-600">{checkedBags}</div>
                  <div className="text-sm text-gray-600 mt-1">bags</div>
                </div>
                <button
                  onClick={() => setCheckedBags(checkedBags + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 rounded-lg font-bold text-white transition-colors"
                  disabled={checkedBags >= 5}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Currently included: {bookingData.currentBaggage.checked} bag(s)
              </p>
            </div>

            {checkedBags > bookingData.currentBaggage.checked && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900">Additional Baggage Fee</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {checkedBags - bookingData.currentBaggage.checked} additional bag(s) × $35
                    </p>
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    ${((checkedBags - bookingData.currentBaggage.checked) * 35).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seats Tab */}
        {activeTab === 'seats' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Seat selection:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Standard seats: $25 per seat</li>
                  <li>Extra legroom: $45 per seat</li>
                  <li>Changes are subject to availability</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              {bookingData.passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Current seat:{' '}
                        {bookingData.currentSeats?.find((s) => s.passengerId === passenger.id)
                          ?.seatNumber || 'Not assigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="New seat (e.g., 12A)"
                        onChange={(e) =>
                          setSeatChanges({
                            ...seatChanges,
                            [passenger.id]: e.target.value,
                          })
                        }
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(seatChanges).length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900">Seat Change Fee</p>
                    <p className="text-sm text-amber-700 mt-1">
                      {Object.keys(seatChanges).length} seat change(s) × $25
                    </p>
                  </div>
                  <div className="text-2xl font-black text-amber-700">
                    ${(Object.keys(seatChanges).length * 25).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        {getTotalFees() > 0 && (
          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedFees}
                onChange={(e) => setAcknowledgedFees(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                I understand and agree to pay the modification fee of{' '}
                <strong className="text-gray-900">${getTotalFees().toFixed(2)}</strong>. This fee
                is non-refundable and will be charged to my original payment method.
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-4">
            {getTotalFees() > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Modification Fee</div>
                <div className="text-2xl font-black text-gray-900">
                  ${getTotalFees().toFixed(2)}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || (getTotalFees() > 0 && !acknowledgedFees)}
              className="flex items-center gap-2 px-8 py-3 font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Changes
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
