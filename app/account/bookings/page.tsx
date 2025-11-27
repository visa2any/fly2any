'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, Hotel, Car, Calendar, Clock,
  CheckCircle2, XCircle, AlertCircle, Download, Eye,
  ChevronRight, Search, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type BookingType = 'all' | 'flight' | 'hotel' | 'car';
type BookingStatus = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'car';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  confirmationNumber: string;
  createdAt: string;
  totalPrice: number;
  currency: string;
  flightDetails?: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
  };
  hotelDetails?: {
    name: string;
    address: string;
    city: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    roomType: string;
    guests: number;
  };
  carDetails?: {
    company: string;
    carType: string;
    pickupLocation: string;
    pickupDate: string;
    dropoffDate: string;
  };
}

const statusConfig = {
  confirmed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Confirmed' },
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
  completed: { icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Completed' },
};

const typeConfig = {
  flight: { icon: Plane, color: 'text-sky-600', bgColor: 'bg-sky-100' },
  hotel: { icon: Hotel, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  car: { icon: Car, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusConfig[booking.status].icon;
  const TypeIcon = typeConfig[booking.type].icon;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);

  const getTitle = () => {
    if (booking.type === 'flight' && booking.flightDetails) return `${booking.flightDetails.origin} → ${booking.flightDetails.destination}`;
    if (booking.type === 'hotel' && booking.hotelDetails) return booking.hotelDetails.name;
    if (booking.type === 'car' && booking.carDetails) return `${booking.carDetails.carType} - ${booking.carDetails.company}`;
    return 'Booking';
  };

  const getSubtitle = () => {
    if (booking.type === 'flight' && booking.flightDetails) return `${booking.flightDetails.airline} ${booking.flightDetails.flightNumber}`;
    if (booking.type === 'hotel' && booking.hotelDetails) return `${booking.hotelDetails.city} • ${booking.hotelDetails.nights} nights`;
    if (booking.type === 'car' && booking.carDetails) return booking.carDetails.pickupLocation;
    return '';
  };

  const getDates = () => {
    if (booking.type === 'flight' && booking.flightDetails) {
      const dep = formatDate(booking.flightDetails.departureDate);
      return booking.flightDetails.returnDate ? `${dep} - ${formatDate(booking.flightDetails.returnDate)}` : dep;
    }
    if (booking.type === 'hotel' && booking.hotelDetails) return `${formatDate(booking.hotelDetails.checkIn)} - ${formatDate(booking.hotelDetails.checkOut)}`;
    if (booking.type === 'car' && booking.carDetails) return `${formatDate(booking.carDetails.pickupDate)} - ${formatDate(booking.carDetails.dropoffDate)}`;
    return '';
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${typeConfig[booking.type].bgColor}`}>
            <TypeIcon className={`w-6 h-6 ${typeConfig[booking.type].color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{getTitle()}</h3>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[booking.status].bgColor} ${statusConfig[booking.status].color}`}>
                <StatusIcon className="w-3 h-3" />{statusConfig[booking.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{getSubtitle()}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{getDates()}</span>
              <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice, booking.currency)}</span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <span className="text-xs text-gray-500">Confirmation Number</span>
                  <p className="font-mono font-bold text-gray-900">{booking.confirmationNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><Download className="w-4 h-4" />Download</button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><Printer className="w-4 h-4" />Print</button>
                </div>
              </div>

              {booking.type === 'hotel' && booking.hotelDetails && (
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-gray-500">Room Type</span><p className="text-sm font-medium">{booking.hotelDetails.roomType}</p></div>
                  <div><span className="text-xs text-gray-500">Guests</span><p className="text-sm font-medium">{booking.hotelDetails.guests} guests</p></div>
                  <div className="col-span-2"><span className="text-xs text-gray-500">Address</span><p className="text-sm font-medium">{booking.hotelDetails.address}</p></div>
                </div>
              )}

              {booking.type === 'flight' && booking.flightDetails && (
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-xs text-gray-500">Passengers</span><p className="text-sm font-medium">{booking.flightDetails.passengers}</p></div>
                  <div><span className="text-xs text-gray-500">Flight</span><p className="text-sm font-medium">{booking.flightDetails.airline} {booking.flightDetails.flightNumber}</p></div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"><Eye className="w-4 h-4" />View Details</button>
                {booking.status === 'confirmed' && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"><XCircle className="w-4 h-4" />Cancel</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<BookingType>('all');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin?callbackUrl=/account/bookings');
  }, [status, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user) { setLoading(false); return; }
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        setBookings(data.success ? (data.data || []) : getDemoBookings());
      } catch { setBookings(getDemoBookings()); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, [session]);

  const getDemoBookings = (): Booking[] => [
    { id: '1', type: 'hotel', status: 'confirmed', confirmationNumber: 'FLY2ANY-HT-001', createdAt: new Date().toISOString(), totalPrice: 599.99, currency: 'USD',
      hotelDetails: { name: 'Grand Hyatt Miami Beach', address: '4441 Collins Ave, Miami Beach, FL', city: 'Miami Beach', checkIn: new Date(Date.now() + 7*24*60*60*1000).toISOString(), checkOut: new Date(Date.now() + 10*24*60*60*1000).toISOString(), nights: 3, roomType: 'Ocean View King', guests: 2 }},
    { id: '2', type: 'flight', status: 'completed', confirmationNumber: 'FLY2ANY-FL-002', createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(), totalPrice: 456, currency: 'USD',
      flightDetails: { airline: 'American Airlines', flightNumber: 'AA 1234', origin: 'JFK', destination: 'LAX', departureDate: new Date(Date.now() - 20*24*60*60*1000).toISOString(), returnDate: new Date(Date.now() - 13*24*60*60*1000).toISOString(), passengers: 2 }},
  ];

  const filteredBookings = bookings.filter((b) => {
    if (typeFilter !== 'all' && b.type !== typeFilter) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!b.confirmationNumber.toLowerCase().includes(q) && !b.hotelDetails?.name?.toLowerCase().includes(q) && !b.flightDetails?.airline?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (status === 'loading' || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View and manage your travel bookings</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by confirmation number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as BookingType)} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All Types</option><option value="flight">Flights</option><option value="hotel">Hotels</option><option value="car">Cars</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus)} className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All Status</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">{filteredBookings.map((b) => <BookingCard key={b.id} booking={b} />)}</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">{searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your filters' : "You haven't made any bookings yet"}</p>
            <Link href="/flights" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700"><Plane className="w-5 h-5" />Book a Trip</Link>
          </div>
        )}
      </div>
    </div>
  );
}
