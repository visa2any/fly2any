# AI Travel Assistant - Real Flight Search Upgrade

## Current Limitation
The AI assistant currently only provides guidance ("use the search bar") instead of actually searching for flights and showing real prices.

## Required Enhancements

### 1. Backend API ✅ CREATED
**File:** `app/api/ai/search-flights/route.ts`

**Features:**
- Natural language query parsing
- Extracts: origin, destination, dates, cabin class, passengers
- Smart city-to-IATA code mapping (40+ cities)
- Date extraction from natural language ("November 15")
- Returns real flight results

**Example Query:** "Need a ticket from New York to Dubai on November 15 and returning on November 25th, direct business class flight"

**Parsed Output:**
```json
{
  "origin": "NYC",
  "destination": "DXB",
  "departureDate": "2024-11-15",
  "returnDate": "2024-11-25",
  "passengers": 1,
  "cabinClass": "business"
}
```

### 2. Enhanced Message Types (TODO)
**Update:** `components/ai/AITravelAssistant.tsx`

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  flightResults?: FlightResult[];  // NEW
  messageType?: 'text' | 'flights' | 'booking';  // NEW
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string; terminal: string };
  arrival: { airport: string; time: string; terminal: string };
  duration: string;
  stops: number;
  stopover?: string;
  price: { amount: string; currency: string };
  cabinClass: string;
  seatsAvailable: number;
  baggage: { checked: string; cabin: string };
}
```

### 3. Flight Detection & Search (TODO)
**Update handleSendMessage:**

```typescript
const handleSendMessage = async () => {
  // ... existing code ...

  // Detect flight search queries
  const isFlightQuery = detectFlightQuery(inputMessage);

  if (isFlightQuery) {
    // Call flight search API
    const response = await fetch('/api/ai/search-flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: inputMessage, language })
    });

    const data = await response.json();

    if (data.success) {
      // Add AI message with flight results
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        flightResults: data.flights,
        messageType: 'flights'
      };
      setMessages(prev => [...prev, aiResponse]);
    }
  } else {
    // Regular AI response
    // ... existing code ...
  }
};
```

### 4. Flight Cards Component (TODO)
**Create:** `components/ai/FlightCard.tsx`

**Features:**
- Beautiful flight result cards
- Airline logo
- Departure → Arrival timeline
- Duration, stops, baggage info
- Price display
- "Select Flight" button
- Direct/1-stop badges
- Seats available indicator

**Design:**
```
┌─────────────────────────────────────────────┐
│ 🛫 Emirates EK 201                          │
│                                             │
│ NYC          ✈️          DXB                │
│ 08:00       13h 30m      19:30              │
│ Terminal 4              Terminal 3          │
│                                             │
│ ✅ Direct   🧳 2x32kg   💺 9 seats left     │
│                                             │
│ Business Class                   $5,499 USD │
│                                             │
│ [          Select This Flight          ]   │
└─────────────────────────────────────────────┘
```

### 5. Message Rendering Enhancement (TODO)
**Update Messages Area:**

```typescript
{messages.map((message) => (
  <div key={message.id}>
    {/* Text content */}
    {message.content && (
      <div className="message-bubble">
        {message.content}
      </div>
    )}

    {/* Flight results */}
    {message.flightResults && (
      <div className="mt-3 space-y-2">
        {message.flightResults.map(flight => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={() => handleFlightSelect(flight)}
            language={language}
          />
        ))}
      </div>
    )}
  </div>
))}
```

### 6. Booking Initiation (TODO)
**Handle flight selection:**

```typescript
const handleFlightSelect = (flight: FlightResult) => {
  // Show booking form in chat
  const bookingMessage: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content: `Great choice! Let's complete your booking for ${flight.airline} ${flight.flightNumber}.`,
    timestamp: new Date(),
    messageType: 'booking',
    selectedFlight: flight
  };
  setMessages(prev => [...prev, bookingMessage]);

  // Or redirect to booking page with pre-filled data
  // window.location.href = `/flights/booking?flightId=${flight.id}`;
};
```

### 7. Natural Language Detection
**Keywords that trigger flight search:**
- "ticket", "flight", "fly"
- "from [city] to [city]"
- "traveling to", "going to"
- "need", "want", "looking for"
- Month names + dates
- "business class", "economy", "first class"
- "direct", "nonstop"

### 8. Integration with Existing Systems
**Connect to:**
- ✅ Duffel API (for real flight data)
- ✅ Amadeus API (backup)
- ✅ Existing booking flow (`/flights/booking`)
- ✅ Payment system (Stripe)
- ✅ User authentication

## Implementation Priority

### Phase 1: Core Search (CURRENT)
1. ✅ Create API endpoint
2. ⏳ Update AITravelAssistant component
3. ⏳ Add flight detection logic
4. ⏳ Integrate API call

### Phase 2: Display Results
5. ⏳ Create FlightCard component
6. ⏳ Update message rendering
7. ⏳ Add loading states
8. ⏳ Error handling

### Phase 3: Booking Flow
9. ⏳ Flight selection handler
10. ⏳ Passenger info collection
11. ⏳ Payment integration
12. ⏳ Booking confirmation

### Phase 4: Enhancements
13. ⏳ Compare flights feature
14. ⏳ Save search feature
15. ⏳ Price alerts
16. ⏳ Share results

## Testing Plan

1. **Natural Language Queries:**
   - "I need a flight from New York to Dubai"
   - "Business class ticket to London next week"
   - "Cheapest flight to Paris in December"

2. **Date Parsing:**
   - "November 15"
   - "Nov 15th"
   - "15th of November"
   - "next Friday"

3. **City Recognition:**
   - Full names: "New York", "Los Angeles"
   - IATA codes: "NYC", "LAX"
   - Nicknames: "LA", "SF", "NY"

4. **Cabin Classes:**
   - "business class"
   - "first class"
   - "economy"
   - "premium economy"

5. **Edge Cases:**
   - Ambiguous dates
   - Unknown cities
   - Invalid routes
   - No results

## Success Metrics

- **User Engagement:** 80% of users interact with AI assistant
- **Completion Rate:** 60% complete booking through chat
- **Response Time:** < 3 seconds for flight search
- **Accuracy:** 95% correct query parsing
- **Satisfaction:** 4.5+ star rating

## Next Steps

1. Complete Phase 1 implementation
2. Test with real user queries
3. Integrate with Duffel API for real data
4. Add error handling and edge cases
5. Deploy to production
6. Monitor usage analytics
7. Iterate based on feedback

---

**Status:** Phase 1 - API Created ✅
**Next:** Update AITravelAssistant component with search integration
**ETA:** 30-60 minutes for full implementation
