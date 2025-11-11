# Booking History & Management System - User Guide

## Overview

The Booking History and Management System is a comprehensive feature that allows users to view, track, and manage all their flight bookings in one centralized location. This system provides complete visibility into past, current, and upcoming bookings with powerful filtering, search, and management capabilities.

---

## Features

### 1. Booking History Page (`/account/bookings`)

The main booking history page displays all user bookings with the following features:

#### Stats Dashboard
- **Total Bookings**: Overall count of all bookings
- **Upcoming Flights**: Active bookings with future departure dates
- **Completed Trips**: Successfully completed travel
- **Cancelled Bookings**: Cancelled or refunded bookings

#### Search & Filter Capabilities
- **Text Search**: Search by booking reference, email, or airport codes
- **Status Filter**: Filter by booking status (All, Confirmed, Pending, Cancelled, Completed)
- **Date Range Filter**: Filter bookings by departure date range
- **Sort Options**: Sort by newest or oldest bookings

#### Booking List Display
Each booking card shows:
- Booking reference number (FLY2A-XXXXXX)
- Status badge with color coding
- Flight route (origin → destination)
- Departure date and time
- Number of passengers
- Total amount paid
- Flight type and stops
- Quick action buttons (hover to reveal)

#### Pagination
- 10 bookings per page
- Page navigation with first, last, and nearby pages
- Total count display

### 2. Booking Detail Page (`/account/bookings/[id]`)

Comprehensive view of a single booking with the following sections:

#### Flight Information
- Complete flight itinerary
- All segments with departure/arrival details
- Airline codes, flight numbers
- Aircraft information
- Cabin class for each segment
- Layover information between segments
- Duration calculation

#### Passenger Information
- Full passenger details for each traveler
- Name, date of birth, nationality
- Passport details (if provided)
- Seat assignments
- Special requests

#### Payment Information
- Total amount breakdown
  - Base fare
  - Taxes and fees
  - Total amount
- Payment method details
- Card information (last 4 digits)
- Payment status
- Transaction ID

#### Contact Information
- Email address
- Phone number
- Alternative contact (if provided)

#### Refund Policy
- Refundability status
- Cancellation deadlines
- Cancellation fees
- Terms and conditions

#### Booking Actions
Available actions on the detail page:
- Download confirmation (text file)
- Email confirmation
- Print booking
- Add to calendar (iCal format)
- Share booking
- Modify booking (if allowed)
- Cancel booking (if allowed)

### 3. Cancel Booking Flow

Multi-step cancellation process with safeguards:

#### Step 1: Confirmation
- Booking summary display
- Refund calculation preview
- Cancellation policy display
- Warning messages
- Option to keep or continue cancellation

#### Step 2: Reason Selection
User selects from predefined reasons:
- Change of plans
- Found better price
- Travel restrictions
- Personal emergency
- Duplicate booking
- Other (with custom text input)

#### Step 3: Processing
- Loading state during API call
- Error handling with retry option

#### Step 4: Success
- Confirmation message
- Refund amount display
- Processing timeline information

---

## Component Documentation

### BookingCard Component

**Location**: `components/account/BookingCard.tsx`

**Purpose**: Compact card component for displaying booking information in list view.

**Props**:
- `booking: Booking` - The booking object to display

**Features**:
- Status color coding
- Route visualization
- Hover effects
- Quick actions on hover
- Responsive design

**Status Colors**:
- Green: Confirmed
- Yellow: Pending
- Red: Cancelled
- Gray: Completed

### BookingFilters Component

**Location**: `components/account/BookingFilters.tsx`

**Purpose**: Advanced filtering interface for booking list.

**Props**:
- `filters: FilterState` - Current filter state
- `onFilterChange: (filters: Partial<FilterState>) => void` - Filter change handler

**Features**:
- Date range picker
- Active filter display
- Clear filters button
- Filter tips

### BookingActions Component

**Location**: `components/account/BookingActions.tsx`

**Purpose**: Action buttons for booking management.

**Props**:
- `booking: Booking` - The booking object
- `onCancelClick: () => void` - Cancel action handler

**Available Actions**:
- Download (generates text file)
- Email (simulated email sending)
- Print (uses browser print)
- Add to Calendar (generates .ics file)
- Share (uses Web Share API or clipboard)
- Modify (coming soon)
- Cancel (opens cancel modal)

### CancelBookingModal Component

**Location**: `components/account/CancelBookingModal.tsx`

**Purpose**: Multi-step modal for booking cancellation.

**Props**:
- `booking: Booking` - The booking to cancel
- `onClose: () => void` - Close modal handler
- `onSuccess: () => void` - Success callback

**Features**:
- Refund calculation
- Cancellation policy display
- Reason selection
- Error handling
- Success confirmation

### BookingStats Component

**Location**: `components/account/BookingStats.tsx`

**Purpose**: Display booking statistics in a dashboard format.

**Props**:
- `stats: { total, upcoming, completed, cancelled }` - Statistics object

**Features**:
- Visual stat cards
- Color-coded categories
- Highlight for upcoming flights
- Responsive grid layout

---

## API Integration

### Endpoints Used

#### GET `/api/bookings`
Retrieve list of bookings with filters.

**Query Parameters**:
- `email` - Filter by user email
- `userId` - Filter by user ID
- `status` - Filter by booking status
- `search` - Search query (reference or email)
- `dateFrom` - Start date filter
- `dateTo` - End date filter
- `limit` - Items per page
- `offset` - Pagination offset

**Response**:
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "total": 25
  }
}
```

#### GET `/api/bookings/[id]`
Retrieve single booking details.

**Response**:
```json
{
  "success": true,
  "data": {
    "booking": {...}
  }
}
```

#### DELETE `/api/bookings/[id]`
Cancel a booking.

**Query Parameters**:
- `reason` - Cancellation reason

**Response**:
```json
{
  "success": true,
  "data": {
    "bookingReference": "FLY2A-ABC123",
    "refundAmount": 450.00,
    "refundStatus": "pending",
    "message": "Booking cancelled successfully..."
  }
}
```

#### PUT `/api/bookings/[id]`
Update booking details (future feature).

---

## User Experience Features

### Loading States
- Full-page loading spinner on initial load
- Skeleton cards while fetching data
- Button loading states during actions
- Inline spinners for quick actions

### Empty States
- Clear messaging when no bookings found
- Call-to-action to search flights
- Different messages for filtered vs. no bookings

### Error Handling
- Error messages with retry buttons
- Form validation errors
- API error display
- Graceful degradation

### Responsive Design
- Mobile-first approach
- Collapsible filters on mobile
- Touch-friendly buttons
- Readable text sizes

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

---

## State Management

### Local State
- Bookings list
- Filtered bookings
- Current page
- Filter state
- Loading states
- Error states

### Session State
- User authentication (via NextAuth)
- User preferences

### URL State
- Query parameters for filters
- Bookmark-friendly URLs

---

## Performance Optimizations

### Client-Side Filtering
- Search queries filtered locally
- Reduces API calls
- Instant feedback

### Pagination
- 10 items per page
- Server-side pagination
- Efficient data loading

### Caching Strategy
- Consider implementing localStorage cache
- Reduce API calls on page refresh
- Offline support (future feature)

### Auto-Refresh
- Optional 30-second auto-refresh on detail page
- Real-time status updates
- Toggle on/off capability

---

## Testing Guide

### Manual Testing Checklist

#### Booking List Page
- [ ] Page loads without errors
- [ ] Stats dashboard displays correct counts
- [ ] Empty state shows when no bookings
- [ ] Search filters bookings correctly
- [ ] Status filter works for all statuses
- [ ] Date range filter applies correctly
- [ ] Sort options work (newest/oldest)
- [ ] Pagination navigates correctly
- [ ] Booking cards display all information
- [ ] Hover effects work
- [ ] Mobile responsive layout

#### Booking Detail Page
- [ ] Detail page loads for valid booking ID
- [ ] 404 page shows for invalid ID
- [ ] All booking information displays
- [ ] Flight segments show correctly
- [ ] Passenger information complete
- [ ] Payment details accurate
- [ ] Status badge shows correct status
- [ ] Action buttons all function
- [ ] Print functionality works
- [ ] Mobile responsive layout

#### Cancel Booking Flow
- [ ] Cancel button appears for valid bookings
- [ ] Modal opens correctly
- [ ] Refund calculation accurate
- [ ] Cancellation policy displays
- [ ] Reason selection required
- [ ] Custom reason validates
- [ ] API call processes correctly
- [ ] Success message shows
- [ ] Booking status updates
- [ ] Can't cancel non-cancellable bookings

#### Actions
- [ ] Download generates file
- [ ] Email simulates sending
- [ ] Print opens print dialog
- [ ] Calendar file downloads
- [ ] Share API works or falls back to clipboard
- [ ] All actions show loading states
- [ ] Error messages appear on failure

### Error Scenarios to Test
- Network failure during fetch
- Invalid booking ID
- Expired session
- Cancellation of non-refundable booking
- Cancellation past deadline
- Server errors

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live status updates
2. **Bulk Actions**: Select multiple bookings for bulk operations
3. **Export Options**: CSV/PDF export of all bookings
4. **Advanced Search**: Full-text search with filters
5. **Booking Modification**: Edit passenger details, change dates
6. **Check-in Integration**: Online check-in from booking details
7. **Boarding Pass**: Digital boarding pass generation
8. **Travel Insurance**: Add insurance to existing bookings
9. **Price Tracking**: Track price changes post-booking
10. **Trip Planning**: Combine multiple bookings into trips

### Technical Improvements
1. **Offline Support**: Service worker for offline access
2. **Push Notifications**: Reminders for upcoming flights
3. **Email Integration**: Direct email sending via SendGrid
4. **PDF Generation**: Professional PDF confirmations
5. **Analytics**: Track user behavior and popular features

---

## Troubleshooting

### Common Issues

#### "No bookings found"
- Check if user is authenticated
- Verify email address matches booking
- Clear filters and try again
- Check database connection

#### "Failed to load bookings"
- Check network connection
- Verify API endpoint is accessible
- Check server logs for errors
- Try refreshing the page

#### "Booking not found"
- Verify booking ID is correct
- Check if booking was deleted
- Ensure user has access to booking

#### Cancellation fails
- Check if cancellation deadline passed
- Verify booking is in cancellable status
- Check refund policy
- Review server logs

---

## Support & Maintenance

### Monitoring
- Track API response times
- Monitor error rates
- Watch for failed cancellations
- Review user feedback

### Updates
- Regular security patches
- Feature enhancements based on feedback
- Performance optimizations
- Bug fixes

### Documentation
- Keep this guide updated
- Document API changes
- Update component documentation
- Maintain changelog

---

## Contact & Support

For technical issues or questions about the booking system:
- Email: support@fly2any.com
- Documentation: /docs
- GitHub Issues: [Project Repository]

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Author**: Fly2Any Development Team
