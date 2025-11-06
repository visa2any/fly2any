# Phase 4: Implementation Code

This file contains all the code to add to `AITravelAssistant.tsx` for E2E booking flow integration.

---

## STEP 1: Add Handler Functions

**Add these functions inside the `AITravelAssistant` component (after the existing handlers around line 600):**

```typescript
// ============================================================================
// E2E BOOKING FLOW HANDLERS
// ============================================================================

/**
 * HANDLE FLIGHT SELECT
 * User clicks a flight → Load fares → Show fare selector widget
 */
const handleBookingFlightSelect = async (flightId: string) => {
  try {
    // Find the selected flight from messages
    let selectedFlight: FlightOption | null = null;

    for (const message of messages) {
      if (message.flightResults) {
        const flight = message.flightResults.find((f: any) => f.id === flightId);
        if (flight) {
          // Transform FlightSearchResult to FlightOption
          selectedFlight = {
            id: flight.id,
            offerId: flight.id, // Use ID as offerId for now
            airline: flight.airline,
            airlineLogo: '',
            flightNumber: flight.flightNumber,
            departure: {
              airport: flight.departure.airport,
              airportCode: flight.departure.airport.split(' ')[0] || 'JFK',
              time: flight.departure.time,
              terminal: flight.departure.terminal,
            },
            arrival: {
              airport: flight.arrival.airport,
              airportCode: flight.arrival.airport.split(' ')[0] || 'DXB',
              time: flight.arrival.time,
              terminal: flight.arrival.terminal,
            },
            duration: flight.duration,
            stops: flight.stops,
            stopDetails: flight.stopover || (flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`),
            price: parseFloat(flight.price.amount),
            currency: flight.price.currency,
            cabinClass: flight.cabinClass,
            availableSeats: flight.seatsAvailable,
          };
          break;
        }
      }
    }

    if (!selectedFlight) {
      console.error('Flight not found:', flightId);
      return;
    }

    console.log('✈️  User selected flight:', selectedFlight.airline, selectedFlight.flightNumber);

    // Create booking in state
    const bookingId = bookingFlow.createBooking(selectedFlight, {
      origin: selectedFlight.departure.airportCode,
      destination: selectedFlight.arrival.airportCode,
      departureDate: new Date().toISOString().split('T')[0],
      passengers: 1,
      class: 'economy',
    });

    // Show thinking/typing indicator
    const consultant = currentTypingConsultant || getConsultant('booking');
    setCurrentTypingConsultant(consultant);
    setIsTyping(true);
    setTypingState({
      message: 'Let me get you the best fare options...',
      type: 'thinking',
      stage: 'loading',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load fare options from API
    const fares = await bookingFlow.loadFareOptions(selectedFlight.offerId);

    if (fares.length === 0) {
      // Fallback: show error message
      const errorMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I couldn't load the fare options. Please try selecting another flight.",
        consultant,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
      return;
    }

    // Show progress indicator
    bookingFlow.advanceStage('fare_selection');

    // Send message with fare selector widget
    const fareMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Excellent choice! The ${selectedFlight.airline} ${selectedFlight.flightNumber} is a great flight. Now, let's choose your fare class. I recommend the Standard fare for the best balance of price and flexibility.`,
      consultant,
      widget: {
        type: 'fare_selector',
        data: { fares },
      },
      bookingRef: bookingId,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, fareMessage]);
    setIsTyping(false);

    // Track analytics
    analytics.trackFlightSelected(flightId, selectedFlight.price.toString());

  } catch (error) {
    console.error('Error in handleBookingFlightSelect:', error);
    setIsTyping(false);

    const errorMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: 'I apologize, but something went wrong. Please try again.',
      consultant: currentTypingConsultant,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMsg]);
  }
};

/**
 * HANDLE FARE SELECT
 * User selects fare → Load seats → Show seat map widget
 */
const handleFareSelect = async (fareId: string, bookingRef?: string) => {
  try {
    // Find the fare from the last widget message
    let selectedFare: FareOption | null = null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].widget?.type === 'fare_selector') {
        const fares = messages[i].widget?.data.fares;
        selectedFare = fares.find((f: FareOption) => f.id === fareId);
        break;
      }
    }

    if (!selectedFare || !bookingRef) {
      console.error('Fare not found or no booking ref');
      return;
    }

    console.log('💰 User selected fare:', selectedFare.name);

    // Update booking state
    bookingFlow.updateFare(bookingRef, selectedFare);

    // Show typing
    const consultant = currentTypingConsultant || getConsultant('booking');
    setIsTyping(true);
    setTypingState({
      message: 'Loading seat map...',
      type: 'thinking',
      stage: 'loading',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load seat map from API
    const offerId = bookingFlow.activeBooking?.selectedFlight?.offerId;
    if (!offerId) {
      console.error('No offer ID found');
      return;
    }

    const seats = await bookingFlow.loadSeatMap(offerId);

    bookingFlow.advanceStage('seat_selection');

    // Send seat map message
    const seatMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content:
        seats.length > 0
          ? `Perfect! You've selected ${selectedFare.name} class. Now let's pick your seat. I can help you find a great spot!`
          : `Great! ${selectedFare.name} class selected. Seat selection isn't available for this flight, but let's continue with baggage options.`,
      consultant,
      widget:
        seats.length > 0
          ? {
              type: 'seat_map',
              data: { seats },
            }
          : undefined,
      bookingRef,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, seatMessage]);
    setIsTyping(false);

    // If no seats available, skip to baggage
    if (seats.length === 0) {
      await handleSkipSeats(bookingRef);
    }
  } catch (error) {
    console.error('Error in handleFareSelect:', error);
    setIsTyping(false);
  }
};

/**
 * HANDLE SEAT SELECT
 * User selects seat → Load baggage → Show baggage widget
 */
const handleSeatSelect = async (seatNumber: string, bookingRef?: string) => {
  try {
    // Find seat details from last widget message
    let selectedSeat: SeatOption | null = null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].widget?.type === 'seat_map') {
        const seats = messages[i].widget?.data.seats;
        selectedSeat = seats.find((s: SeatOption) => s.number === seatNumber);
        break;
      }
    }

    if (!selectedSeat || !bookingRef) {
      console.error('Seat not found or no booking ref');
      return;
    }

    console.log('🪑 User selected seat:', seatNumber);

    // Update booking state
    bookingFlow.updateSeat(bookingRef, seatNumber, selectedSeat.price);

    // Show typing
    const consultant = currentTypingConsultant || getConsultant('booking');
    setIsTyping(true);
    setTypingState({
      message: 'Loading baggage options...',
      type: 'thinking',
      stage: 'loading',
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Load baggage options
    const offerId = bookingFlow.activeBooking?.selectedFlight?.offerId;
    if (!offerId) {
      console.error('No offer ID found');
      return;
    }

    const baggageOptions = await bookingFlow.loadBaggageOptions(offerId);

    bookingFlow.advanceStage('baggage_selection');

    // Send baggage message
    const baggageMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Excellent choice! Seat ${seatNumber} is confirmed${
        selectedSeat.features && selectedSeat.features.length > 0
          ? ` (${selectedSeat.features.join(', ')})`
          : ''
      }. Now, would you like to add checked baggage?`,
      consultant,
      widget: {
        type: 'baggage_selector',
        data: { baggage: baggageOptions },
      },
      bookingRef,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, baggageMessage]);
    setIsTyping(false);
  } catch (error) {
    console.error('Error in handleSeatSelect:', error);
    setIsTyping(false);
  }
};

/**
 * HANDLE SKIP SEATS
 * User skips seat selection → Load baggage
 */
const handleSkipSeats = async (bookingRef?: string) => {
  try {
    if (!bookingRef) return;

    console.log('⏭️  User skipped seat selection');

    // Show typing
    const consultant = currentTypingConsultant || getConsultant('booking');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Load baggage options
    const offerId = bookingFlow.activeBooking?.selectedFlight?.offerId;
    if (!offerId) return;

    const baggageOptions = await bookingFlow.loadBaggageOptions(offerId);

    bookingFlow.advanceStage('baggage_selection');

    // Send baggage message
    const baggageMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: 'No problem! Your seat will be assigned at check-in. Would you like to add checked baggage?',
      consultant,
      widget: {
        type: 'baggage_selector',
        data: { baggage: baggageOptions },
      },
      bookingRef,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, baggageMessage]);
    setIsTyping(false);
  } catch (error) {
    console.error('Error in handleSkipSeats:', error);
    setIsTyping(false);
  }
};

/**
 * HANDLE BAGGAGE SELECT
 * User selects baggage → Show booking summary
 */
const handleBaggageSelect = async (quantity: number, bookingRef?: string) => {
  try {
    // Find baggage option from last widget
    let selectedBaggage: BaggageOption | null = null;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].widget?.type === 'baggage_selector') {
        const options = messages[i].widget?.data.baggage;
        selectedBaggage = options.find((b: BaggageOption) => b.quantity === quantity);
        break;
      }
    }

    if (!selectedBaggage || !bookingRef) {
      console.error('Baggage not found or no booking ref');
      return;
    }

    console.log('🧳 User selected baggage:', quantity, 'bag(s)');

    // Update booking state
    bookingFlow.updateBaggage(bookingRef, quantity, selectedBaggage.price);

    // Show typing
    const consultant = currentTypingConsultant || getConsultant('booking');
    setIsTyping(true);
    setTypingState({
      message: 'Preparing your booking summary...',
      type: 'thinking',
      stage: 'loading',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    bookingFlow.advanceStage('review');

    // Send booking summary message
    const summaryMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Perfect! ${
        quantity > 0 ? `${quantity} checked bag(s) added.` : 'No checked baggage.'
      } Let me show you your complete booking summary. Please review everything before we proceed to payment.`,
      consultant,
      widget: {
        type: 'booking_summary',
        data: { booking: bookingFlow.activeBooking },
      },
      bookingRef,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, summaryMessage]);
    setIsTyping(false);
  } catch (error) {
    console.error('Error in handleBaggageSelect:', error);
    setIsTyping(false);
  }
};

/**
 * HANDLE CONFIRM BOOKING
 * User confirms → Proceed to payment (Phase 5)
 */
const handleConfirmBooking = async (bookingRef?: string) => {
  try {
    if (!bookingRef) return;

    console.log('✅ User confirmed booking');

    // Show typing
    const consultant = currentTypingConsultant || getConsultant('booking');
    setIsTyping(true);
    setTypingState({
      message: 'Processing your booking...',
      type: 'thinking',
      stage: 'loading',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Phase 5: Payment integration would go here
    // For now, show placeholder message
    const confirmMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Great! Your booking is ready. The next step is payment integration (Phase 5). Your booking details have been saved and you can complete the payment when ready.

Total Amount: $${bookingFlow.activeBooking?.pricing.total}

Booking Reference: ${bookingRef}`,
      consultant,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, confirmMessage]);
    setIsTyping(false);

    bookingFlow.advanceStage('payment');

    // TODO Phase 5: Integrate Stripe payment here
  } catch (error) {
    console.error('Error in handleConfirmBooking:', error);
    setIsTyping(false);
  }
};

/**
 * HANDLE EDIT BOOKING
 * User clicks edit from summary → Go back to that section
 */
const handleEditBooking = (section: 'flight' | 'fare' | 'seats' | 'baggage', bookingRef?: string) => {
  console.log('✏️  User wants to edit:', section);

  // TODO: Implement edit functionality
  // This would re-show the appropriate widget
  // For MVP, we can show a message
  const editMessage: Message = {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: `Edit functionality is coming soon! For now, you can start a new search to change your ${section} selection.`,
    consultant: currentTypingConsultant,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, editMessage]);
};
```

---

## STEP 2: Add Widget Rendering Function

**Add this function inside the component (before the return statement):**

```typescript
/**
 * RENDER WIDGET
 * Render booking flow widgets based on message data
 */
const renderWidget = (message: Message) => {
  if (!message.widget) return null;

  const { type, data } = message.widget;
  const bookingRef = message.bookingRef;

  switch (type) {
    case 'fare_selector':
      return (
        <div className="my-3">
          <InlineFareSelector
            fares={data.fares}
            onSelect={(fareId) => handleFareSelect(fareId, bookingRef)}
            compact={false}
          />
        </div>
      );

    case 'seat_map':
      return (
        <div className="my-3 flex justify-center">
          <CompactSeatMap
            seats={data.seats}
            onSelect={(seatNumber) => handleSeatSelect(seatNumber, bookingRef)}
            onSkip={() => handleSkipSeats(bookingRef)}
            passengerName="Passenger 1"
          />
        </div>
      );

    case 'baggage_selector':
      return (
        <div className="my-3 flex justify-center">
          <BaggageUpsellWidget
            options={data.baggage}
            onSelect={(quantity) => handleBaggageSelect(quantity, bookingRef)}
            maxBags={3}
          />
        </div>
      );

    case 'booking_summary':
      return (
        <div className="my-3 flex justify-center">
          <BookingSummaryCard
            booking={data.booking}
            onEdit={(section) => handleEditBooking(section, bookingRef)}
            onConfirm={() => handleConfirmBooking(bookingRef)}
            expanded={true}
          />
        </div>
      );

    case 'progress':
      return (
        <div className="my-2">
          <ProgressIndicator progress={data.progress} compact={true} />
        </div>
      );

    default:
      return null;
  }
};
```

---

## STEP 3: Update Flight Selection Handler

**Find the existing `handleFlightSelect` function (around line 500-600) and replace it with:**

```typescript
const handleFlightSelect = (flightId: string) => {
  // Call the booking flow handler
  handleBookingFlightSelect(flightId);
};
```

---

## STEP 4: Add Widget Rendering to Message Loop

**Find the message rendering section (around line 1063-1088) and add widget rendering:**

```typescript
{/* Flight Results */}
{messages.map((message) => {
  if (message.flightResults && message.flightResults.length > 0) {
    return (
      <div key={`flights-${message.id}`} className="space-y-2 mt-2">
        {message.flightResults.map((flight) => (
          <FlightResultCard
            key={flight.id}
            flight={flight}
            onSelect={handleFlightSelect}
            compact={true}
            onFlightSelected={(flightId, flightPrice) => {
              analytics.trackFlightSelected(flightId, flightPrice);
            }}
          />
        ))}
        <button
          onClick={handleSeeMoreFlights}
          className="w-full py-2 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-all text-sm"
        >
          See More Flights →
        </button>
      </div>
    );
  }
  return null;
})}

{/* NEW: Booking Flow Widgets */}
{messages.map((message) => {
  if (message.widget) {
    return (
      <div key={`widget-${message.id}`}>
        {renderWidget(message)}
      </div>
    );
  }
  return null;
})}
```

---

## STEP 5: Add Progress Indicator Display

**Add this before the message loop to show progress throughout booking:**

```typescript
{/* Booking Progress Indicator */}
{bookingFlow.bookingProgress && bookingFlow.activeBooking && (
  <div className="mb-4">
    <ProgressIndicator progress={bookingFlow.bookingProgress} compact={true} />
  </div>
)}
```

---

## Testing Instructions

After adding all the code:

1. **Compile TypeScript**:
```bash
cd C:\Users\Power\fly2any-fresh
npx tsc --noEmit
```

2. **Start Dev Server**:
```bash
npm run dev
```

3. **Test the Flow**:
- Open chat
- Search for flights: "Find flights from NYC to Dubai"
- Click a flight
- You should see the fare selector widget
- Select a fare
- Continue through seat selection → baggage → summary

4. **Check Console**:
- All steps should log with emojis (✈️ 💰 🪑 🧳 ✅)
- No errors should appear

---

## Next Steps

After verifying this works:
- Phase 5: Add Stripe payment integration
- Add edit functionality for booking summary
- Add error recovery flows
- Add analytics tracking for each widget interaction
- Mobile optimization testing
