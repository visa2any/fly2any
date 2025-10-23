# PerSegmentBaggage Component - Visual Guide

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│ PerSegmentBaggage Container                                     │
│ (Gradient: blue-50 → cyan-50, Border: blue-200, Rounded: lg)   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Header Section                                          │    │
│  │ 🧳 Baggage Allowance by Flight Leg                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Outbound Segment Card (White bg, Shadow)               │    │
│  │ ┌──────────────────────────────────────────────────┐   │    │
│  │ │ ✈️ Outbound: JFK → LAX                           │   │    │
│  │ │ Fri, Jan 15 • 08:30                              │   │    │
│  │ │ ─────────────────────────────────────────────    │   │    │
│  │ │ ✅ 1 checked bag included (23 kg / 51 lbs)       │   │    │
│  │ │ ✅ 1 carry-on + 1 personal item                  │   │    │
│  │ │ 💼 Fare: ECONOMY (Standard)                      │   │    │
│  │ └──────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ────────────────────────────────────────────────────────      │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Return Segment Card (White bg, Shadow)                 │    │
│  │ ┌──────────────────────────────────────────────────┐   │    │
│  │ │ ✈️ Return: LAX → JFK                             │   │    │
│  │ │ Fri, Jan 22 • 16:45                              │   │    │
│  │ │ ─────────────────────────────────────────────    │   │    │
│  │ │ ❌ 0 checked bags (Basic Economy)                │   │    │
│  │ │ ⚠️ Carry-on not included (personal item only)   │   │    │
│  │ │ 💼 Fare: ECONOMY (Basic)                         │   │    │
│  │ │ ─────────────────────────────────────────────    │   │    │
│  │ │ 💵 Add checked bag: +$35                         │   │    │
│  │ └──────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ℹ️ Footer Disclaimer                                    │    │
│  │ Baggage rules determined by operating carrier...       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Color Palette

### Container
- Background: `bg-gradient-to-br from-blue-50 to-cyan-50` (#eff6ff → #ecfeff)
- Border: `border-blue-200` (#bfdbfe)
- Padding: `p-5` (20px)
- Rounded: `rounded-lg` (8px)

### Segment Cards
- Background: `bg-white` (#ffffff)
- Shadow: `shadow-sm` (0 1px 2px 0 rgb(0 0 0 / 0.05))
- Padding: `p-4` (16px)
- Rounded: `rounded-lg` (8px)

### Icons
- ✅ Green Check: `text-green-600` (#16a34a)
- ❌ Red X: `text-red-500` (#ef4444)
- ⚠️ Amber Warning: `text-amber-500` (#f59e0b)
- ✈️ Blue Plane: `text-blue-600` (#2563eb)
- ℹ️ Gray Info: `text-gray-600` (#4b5563)

### Typography
- Header: `text-base font-semibold text-gray-900` (16px/600/#111827)
- Segment Title: `font-semibold text-gray-900` (14px/600/#111827)
- Date/Time: `text-xs text-gray-600` (12px/#4b5563)
- Body: `text-sm text-gray-900` (14px/#111827)
- Meta: `text-sm text-gray-600` (14px/#4b5563)
- Footer: `text-xs text-gray-600` (12px/#4b5563)

## Component States

### State 1: Standard Fare (Full Baggage Included)
```
✈️ Outbound: JFK → LAX
Fri, Jan 15 • 08:30
─────────────────────────
✅ 1 checked bag included (23 kg / 51 lbs)
✅ 1 carry-on + 1 personal item
💼 Fare: ECONOMY (Standard)
```

### State 2: Basic Fare (No Baggage Included)
```
✈️ Return: LAX → JFK
Fri, Jan 22 • 16:45
─────────────────────────
❌ 0 checked bags (Basic Economy)
⚠️ Carry-on not included (personal item only)
💼 Fare: ECONOMY (Basic)
─────────────────────────
💵 Add checked bag: +$35
```

### State 3: Premium Fare (Multiple Bags)
```
✈️ Outbound: JFK → LHR
Mon, Feb 1 • 19:30
─────────────────────────
✅ 2 checked bags included (32 kg / 71 lbs each)
✅ 1 carry-on + 1 personal item
💼 Fare: BUSINESS (Flex)
```

### State 4: Multi-Segment with Layover
```
✈️ Leg 1: JFK → CDG
Wed, Mar 10 • 20:00
─────────────────────────
✅ 1 checked bag included (23 kg / 51 lbs)
✅ 1 carry-on + 1 personal item
💼 Fare: ECONOMY (Standard)

────────────────────────── (Connector)

✈️ Leg 2: CDG → DXB
Thu, Mar 11 • 14:30
─────────────────────────
✅ 1 checked bag included (23 kg / 51 lbs)
✅ 1 carry-on + 1 personal item
💼 Fare: ECONOMY (Standard)
```

## Responsive Breakpoints

### Desktop (≥768px)
- Cards: Full width with max-width constraint
- Spacing: 16px gaps between segments
- Icon size: 18px for plane, 16px for status
- Font sizes: As specified

### Mobile (<768px)
- Cards: Stack vertically, full width
- Spacing: 12px gaps between segments
- Icon size: 16px for plane, 14px for status
- Font sizes: Same (minimum 14px maintained)
- Touch targets: Minimum 44px height

## Integration Context

The PerSegmentBaggage component appears in FlightCardEnhanced's expanded view:

```
FlightCardEnhanced (Expanded)
├── Header (Airline info, rating, badges)
├── Flight Route (Times, airports, duration)
├── Conversion Features (Deal score, CO2, viewers)
├── Footer (Price, actions)
└── Expanded Details ⬇️
    ├── Section 1: Key Insights (Deal score breakdown)
    ├── Section 2: Fare & Pricing (What's included, TruePrice)
    ├── ⭐ Section 3: PerSegmentBaggage ⭐ [NEW]
    ├── Section 4: Interactive Tools (Accordions)
    │   ├── Baggage Fee Calculator
    │   ├── Branded Fares
    │   ├── Seat Map Preview
    │   └── Fare Rules
    └── Basic Economy Warning (if applicable)
```

## Data Flow Diagram

```
Amadeus API Response
        │
        ├── travelerPricings[0].fareDetailsBySegment[]
        │   ├── cabin: "ECONOMY"
        │   ├── brandedFare: "BASIC" | "STANDARD" | "FLEX"
        │   └── includedCheckedBags
        │       ├── quantity: 0 | 1 | 2
        │       ├── weight: 23 | 32
        │       └── weightUnit: "KG" | "LBS"
        │
        ▼
getPerSegmentBaggage()
        │
        ├── Maps over itineraries
        ├── Maps over segments
        └── Returns BaggageSegment[]
            ├── itineraryIndex: 0 | 1
            ├── segmentIndex: 0 | 1 | 2...
            ├── route: "JFK → LAX"
            ├── departureTime: ISO 8601
            ├── cabin: string
            ├── brandedFare: string
            ├── includedCheckedBags: number
            ├── baggageWeight: number
            ├── baggageWeightUnit: "KG" | "LBS"
            └── carryOnAllowed: boolean
        │
        ▼
PerSegmentBaggage Component
        │
        ├── Groups by itineraryIndex
        ├── Formats date/time
        ├── Converts weights (kg ↔ lbs)
        ├── Determines icons (✅/❌/⚠️)
        └── Renders cards
```

## Usage Example

```typescript
// In FlightCardEnhanced.tsx
<PerSegmentBaggage
  segments={getPerSegmentBaggage()}
  itineraries={itineraries}
  className="mt-2"
/>
```

## Competitive Comparison

| Feature | Fly2Any | Google Flights | Kayak | Skyscanner |
|---------|---------|----------------|-------|------------|
| Per-segment baggage | ✅ YES | ❌ No | ❌ No | ❌ No |
| Weight in dual units | ✅ kg + lbs | ❌ Single | ❌ Single | ❌ Single |
| Visual indicators | ✅ Icons | 📝 Text | 📝 Text | 📝 Text |
| Fare correlation | ✅ YES | ❌ No | ❌ No | ❌ No |
| Add bag pricing | ✅ YES | ❌ No | ❌ No | ❌ No |

## Why This Matters

### Problem
Most OTAs show only AGGREGATE baggage allowance:
- "1 checked bag per person"
- Doesn't specify which flight legs
- Travelers discover restrictions at airport
- Surprise fees = bad UX

### Solution
Fly2Any shows PER-LEG baggage:
- "Outbound: 1 bag | Return: 0 bags"
- Crystal clear expectations
- No surprises
- Builds trust

### Business Impact
1. **Differentiation**: First OTA with this feature
2. **Transparency**: Reduces support queries about baggage
3. **Conversion**: Users trust detailed information
4. **Retention**: No nasty surprises = happy customers

## Testing Checklist

- [ ] One-way flight (1 segment) renders correctly
- [ ] Round-trip (2 segments) shows both legs
- [ ] Mixed baggage allowance displays clearly
- [ ] Weight conversion (kg ↔ lbs) is accurate
- [ ] Icons match baggage status (✅/❌/⚠️)
- [ ] Date/time formatting is localized
- [ ] Mobile: Cards stack vertically
- [ ] Mobile: Touch targets are 44px+
- [ ] Accessibility: Color contrast passes WCAG AA
- [ ] Performance: No lag when expanding card
- [ ] Edge case: Missing baggage data handled gracefully
- [ ] Edge case: Zero weight defaults to 23kg

## Future Enhancements

1. **Animation**: Slide-in effect when expanding
2. **Timeline**: Visual connection between segments
3. **Links**: Deep link to airline baggage policy
4. **Calculator**: Quick "add bag" button inline
5. **History**: Show if baggage allowance changed
6. **Recommendations**: "Upgrade to get 2 bags for $60"
