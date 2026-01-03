// lib/demo/agent-demo-data.ts
// Demo data for agent dashboard preview

export const DEMO_STATS = {
  quotesCount: 47,
  bookingsCount: 23,
  clientsCount: 156,
  totalEarnings: 12450.00,
  pendingCommissions: 2340.00,
  thisMonthBookings: 8,
  conversionRate: 48.9,
};

export const DEMO_RECENT_QUOTES = [
  { id: 'dq1', tripName: 'Paris Honeymoon Package', status: 'ACCEPTED', total: 4250, destination: 'Paris, France', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Sarah', lastName: 'Johnson' } },
  { id: 'dq2', tripName: 'Caribbean Family Vacation', status: 'SENT', total: 8900, destination: 'Cancun, Mexico', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Michael', lastName: 'Chen' } },
  { id: 'dq3', tripName: 'Tokyo Business Trip', status: 'VIEWED', total: 3200, destination: 'Tokyo, Japan', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'David', lastName: 'Smith' } },
  { id: 'dq4', tripName: 'Greek Islands Adventure', status: 'DRAFT', total: 6750, destination: 'Santorini, Greece', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Emma', lastName: 'Wilson' } },
  { id: 'dq5', tripName: 'Dubai Luxury Getaway', status: 'ACCEPTED', total: 12500, destination: 'Dubai, UAE', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Robert', lastName: 'Brown' } },
];

export const DEMO_RECENT_BOOKINGS = [
  { id: 'db1', bookingNumber: 'BK-2024-001', status: 'CONFIRMED', total: 4250, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Sarah', lastName: 'Johnson' } },
  { id: 'db2', bookingNumber: 'BK-2024-002', status: 'CONFIRMED', total: 12500, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Robert', lastName: 'Brown' } },
  { id: 'db3', bookingNumber: 'BK-2024-003', status: 'PENDING', total: 5600, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), client: { firstName: 'Lisa', lastName: 'Taylor' } },
];

export const DEMO_UPCOMING_TRIPS = [
  { id: 'ut1', tripName: 'Paris Honeymoon', destination: 'Paris, France', startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), total: 4250, status: 'CONFIRMED', client: { firstName: 'Sarah', lastName: 'Johnson' } },
  { id: 'ut2', tripName: 'Dubai Getaway', destination: 'Dubai, UAE', startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), total: 12500, status: 'CONFIRMED', client: { firstName: 'Robert', lastName: 'Brown' } },
  { id: 'ut3', tripName: 'Maldives Retreat', destination: 'Maldives', startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), total: 18900, status: 'PENDING', client: { firstName: 'Jennifer', lastName: 'Lee' } },
];

export const DEMO_CLIENTS = [
  { id: 'dc1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', phone: '+1 555-0101', totalSpent: 8500, tripCount: 2 },
  { id: 'dc2', firstName: 'Michael', lastName: 'Chen', email: 'mchen@example.com', phone: '+1 555-0102', totalSpent: 15200, tripCount: 4 },
  { id: 'dc3', firstName: 'Emma', lastName: 'Wilson', email: 'emma.w@example.com', phone: '+1 555-0103', totalSpent: 6750, tripCount: 1 },
  { id: 'dc4', firstName: 'Robert', lastName: 'Brown', email: 'rbrown@example.com', phone: '+1 555-0104', totalSpent: 25000, tripCount: 3 },
  { id: 'dc5', firstName: 'Lisa', lastName: 'Taylor', email: 'lisa.t@example.com', phone: '+1 555-0105', totalSpent: 11200, tripCount: 2 },
];

export function isDemoSession(session: any): boolean {
  return session?.user?.id === 'demo-agent-001' || session?.user?.email === 'demo@fly2any.com';
}
