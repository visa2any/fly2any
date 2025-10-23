# Alternative Airports Widget - Visual Guide

## 🎨 Component States

### State 1: Collapsed (Default View)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ 💡 Save More with Nearby Airports                      [View more ▼]     ║
║ Consider these alternative airports for better deals                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ [BEST DEAL]  Origin                                                 │ ║
║  │                                                                     │ ║
║  │ EWR - Newark Liberty International Airport                         │ ║
║  │ Newark, USA                                                         │ ║
║  │                                                                     │ ║
║  │ 📍 28 miles away    ⏱️ 35 min transport                            │ ║
║  │                                                                     │ ║
║  │ 📉 Save $124                (28% compared to JFK-LAX)              │ ║
║  │                                                                     │ ║
║  │ ┌───────────────────────────────────────────────┐                  │ ║
║  │ │ Flight Price:              $326               │                  │ ║
║  │ │ Transport (round-trip):    $36                │                  │ ║
║  │ │ ─────────────────────────────────────────────  │                  │ ║
║  │ │ Total Cost:                $362               │                  │ ║
║  │ └───────────────────────────────────────────────┘                  │ ║
║  │                                                                     │ ║
║  │                          [Switch to this airport]                  │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ℹ️ Including transport costs. Prices and times are estimates.           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### State 2: Expanded (Shows All Alternatives)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ 💡 Save More with Nearby Airports                      [Hide less ▲]     ║
║ Consider these alternative airports for better deals                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ [BEST DEAL]  Origin                                                 │ ║
║  │                                                                     │ ║
║  │ EWR - Newark Liberty International Airport           💰 Save $124  │ ║
║  │ Newark, USA                                           28% save     │ ║
║  │                                                                     │ ║
║  │ 📍 28 miles away    ⏱️ 35 min transport                            │ ║
║  │                                                                     │ ║
║  │ TRANSPORT OPTIONS:                                                 │ ║
║  │ ┌─────────────────────────┐  ┌──────────────────────────┐         │ ║
║  │ │ 💵 Cheapest             │  │ ⏱️ Fastest                │         │ ║
║  │ │ 🚆 Train                │  │ 🚗 Uber                  │         │ ║
║  │ │ NJ Transit              │  │ 35 min                   │         │ ║
║  │ │ 45 min | $18            │  │ $65                      │         │ ║
║  │ └─────────────────────────┘  └──────────────────────────┘         │ ║
║  │                                                                     │ ║
║  │ COST BREAKDOWN:                                                    │ ║
║  │ Flight Price:    $326                                              │ ║
║  │ Transport:       $36 (round-trip)                                  │ ║
║  │ ─────────────────────────────────────────────────────────────────   │ ║
║  │ Total Cost:      $362                                              │ ║
║  │                  per person                                        │ ║
║  │                                                                     │ ║
║  │ PRICE COMPARISON:                                                  │ ║
║  │ [████████████░░░░░░░░░░░░░] 72% of original price                 │ ║
║  │                                                                     │ ║
║  │                          [Switch to this airport]                  │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Origin                                                              │ ║
║  │                                                                     │ ║
║  │ LGA - LaGuardia Airport                              💰 Save $87   │ ║
║  │ New York, USA                                         19% save     │ ║
║  │                                                                     │ ║
║  │ 📍 11 miles away    ⏱️ 25 min transport                            │ ║
║  │                                                                     │ ║
║  │ TRANSPORT OPTIONS:                                                 │ ║
║  │ ┌─────────────────────────┐  ┌──────────────────────────┐         │ ║
║  │ │ 💵 Cheapest             │  │ ⏱️ Fastest                │         │ ║
║  │ │ 🚌 Bus                  │  │ 🚗 Uber                  │         │ ║
║  │ │ NYC Airporter           │  │ 25 min                   │         │ ║
║  │ │ 50 min | $15            │  │ $45                      │         │ ║
║  │ └─────────────────────────┘  └──────────────────────────┘         │ ║
║  │                                                                     │ ║
║  │ Total Cost: $393 per person                                        │ ║
║  │ [███████████████░░░░░░░░] 81% of original price                    │ ║
║  │                                                                     │ ║
║  │                          [Switch to this airport]                  │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Destination                                                         │ ║
║  │                                                                     │ ║
║  │ BUR - Hollywood Burbank Airport                      💰 Save $72   │ ║
║  │ Burbank, USA                                          16% save     │ ║
║  │                                                                     │ ║
║  │ 📍 28 miles away    ⏱️ 35 min transport                            │ ║
║  │                                                                     │ ║
║  │ Total Cost: $408 per person                                        │ ║
║  │ [████████████████░░░░░░] 84% of original price                     │ ║
║  │                                                                     │ ║
║  │                          [Switch to this airport]                  │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  ℹ️ Including transport costs. Prices and times are estimates.           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎨 Color Scheme

### Light Mode
- **Background Gradient**: Green-50 to Emerald-50
- **Border**: Green-200
- **Best Deal Badge**: Green-600 (white text)
- **Savings Text**: Green-600
- **Cards**: White background
- **Text**: Gray-900 (primary), Gray-600 (secondary)

### Dark Mode
- **Background Gradient**: Green-900/20 to Emerald-900/20
- **Border**: Green-800
- **Best Deal Badge**: Green-600 (white text)
- **Savings Text**: Green-400
- **Cards**: Gray-800 background
- **Text**: White (primary), Gray-300 (secondary)

---

## 📱 Mobile View (Collapsed)

```
╔════════════════════════════════════════╗
║ 💡 Save More with Nearby Airports     ║
║                         [View more ▼] ║
╠════════════════════════════════════════╣
║                                        ║
║  ┌──────────────────────────────────┐  ║
║  │ [BEST DEAL]  Origin              │  ║
║  │                                  │  ║
║  │ EWR - Newark Liberty             │  ║
║  │ International Airport            │  ║
║  │                                  │  ║
║  │ 📍 28 miles  ⏱️ 35 min           │  ║
║  │                                  │  ║
║  │ 📉 Save $124                     │  ║
║  │    (28% savings)                 │  ║
║  │                                  │  ║
║  │ Flight:        $326              │  ║
║  │ Transport:     $36               │  ║
║  │ ─────────────────────             │  ║
║  │ Total:         $362              │  ║
║  │                                  │  ║
║  │    [Switch to this airport]      │  ║
║  └──────────────────────────────────┘  ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 🎯 Badge Types

### Best Deal Badge
```
┌──────────────┐
│ BEST DEAL    │  Green background, white text, bold
└──────────────┘
```

### Origin/Destination Badge
```
┌──────────────┐
│ Origin       │  Gray background, gray text, medium weight
└──────────────┘
```

### Savings Badge
```
💰 Save $124
28% save
```

---

## 🚦 Visual States

### No Alternatives Available
```
(Widget does not render - returns null)
```

### Loading State (Optional Enhancement)
```
╔═══════════════════════════════════════╗
║ 💡 Finding better deals...           ║
║ ┌───────────────────────────────────┐ ║
║ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ║
║ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ║
║ └───────────────────────────────────┘ ║
╚═══════════════════════════════════════╝
```

### Error State (Optional Enhancement)
```
╔═══════════════════════════════════════╗
║ ⚠️ Unable to load alternatives        ║
║ Please try again later                ║
╚═══════════════════════════════════════╝
```

---

## 🔤 Typography

### Heading (Widget Title)
- **Font Size**: text-lg (18px)
- **Font Weight**: font-bold (700)
- **Color**: Gray-900 (light) / White (dark)

### Airport Name
- **Font Size**: text-lg (18px)
- **Font Weight**: font-bold (700)
- **Color**: Gray-900 (light) / White (dark)

### Airport City/Country
- **Font Size**: text-sm (14px)
- **Font Weight**: normal (400)
- **Color**: Gray-600 (light) / Gray-400 (dark)

### Savings Amount
- **Font Size**: text-2xl (24px)
- **Font Weight**: font-bold (700)
- **Color**: Green-600 (light) / Green-400 (dark)

### Body Text
- **Font Size**: text-sm (14px)
- **Font Weight**: normal (400)
- **Color**: Gray-600 (light) / Gray-300 (dark)

### Button Text
- **Font Size**: text-base (16px)
- **Font Weight**: font-semibold (600)
- **Color**: White

---

## 🎬 Animations (Optional Enhancements)

### Expand/Collapse
```typescript
// Smooth height transition
className="transition-all duration-300 ease-in-out"
```

### Hover Effects
```typescript
// Button hover
className="hover:bg-green-700 transition-colors"

// Card hover
className="hover:border-green-200 transition-all"
```

### Savings Badge Pulse (Draw Attention)
```typescript
className="animate-pulse"
```

---

## 📐 Spacing & Layout

### Container
- **Padding**: p-6 (24px)
- **Margin Bottom**: mb-6 (24px)
- **Border Radius**: rounded-xl (12px)
- **Border Width**: border-2 (2px)

### Cards (Alternatives)
- **Padding**: p-5 (20px)
- **Margin**: mb-4 (16px between cards)
- **Border Radius**: rounded-lg (8px)
- **Border Width**: border-2 (2px)

### Buttons
- **Padding**: px-4 py-3 (16px horizontal, 12px vertical)
- **Border Radius**: rounded-lg (8px)
- **Font Weight**: font-semibold (600)

---

## 🖼️ Icons Used

| Icon | Usage | Library |
|------|-------|---------|
| ✨ Sparkles | Widget title | lucide-react |
| 📍 MapPin | Distance indicator | lucide-react |
| 📉 TrendingDown | Savings indicator | lucide-react |
| ⏱️ Clock | Time/duration | lucide-react |
| 💵 DollarSign | Price/cost | lucide-react |
| 🚆 Train | Train transport | lucide-react |
| 🚌 Bus | Bus transport | lucide-react |
| 🚗 Car | Uber/taxi/shuttle | lucide-react |
| 🧭 Navigation | Shuttle transport | lucide-react |
| ⚠️ AlertCircle | Info/warning | lucide-react |
| ▼ ChevronDown | Expand button | lucide-react |
| ▲ ChevronUp | Collapse button | lucide-react |

---

## 📊 Visual Comparison Example

### Original Flight (JFK → LAX)
```
┌────────────────────────────────────┐
│ JFK → LAX                          │
│ Flight Price: $450                 │
│ Transport: $0 (using main airport) │
│ ────────────────────────────────   │
│ Total: $450                        │
└────────────────────────────────────┘
```

### Alternative 1 (EWR → LAX)
```
┌────────────────────────────────────┐
│ EWR → LAX          [BEST DEAL]     │
│ Flight Price: $326  (-28% ✓)      │
│ Transport: $36 (train round-trip)  │
│ ────────────────────────────────   │
│ Total: $362        (Save $88!)     │
│ [████████████░░░░░░░] 72%          │
└────────────────────────────────────┘
```

---

## 🎨 Design Principles

1. **Green = Savings**: All savings indicators use green
2. **Progressive Disclosure**: Show best deal first, expand for more
3. **Clear CTAs**: "Switch to this airport" is always visible
4. **Transport Clarity**: Show both cheapest and fastest options
5. **Total Cost Focus**: Always show total including transport
6. **Visual Hierarchy**: Best deal stands out with badge and border
7. **Mobile First**: Compact design works on all screens

---

## 🔄 User Flow

```
User sees flight results
         ↓
Widget shows "Save $124 with nearby airports"
         ↓
User clicks "View more" (expands)
         ↓
User sees 3 alternatives with details
         ↓
User compares transport options
         ↓
User clicks "Switch to this airport"
         ↓
New search triggered with alternative airport
         ↓
Results update with new flights
```

---

## 💡 Best Practices

### Placement
- **Above Results**: Shows before user scrolls through flights
- **Between Filters and Results**: Natural decision point
- **After First 3 Results**: If user is scrolling, remind them

### Timing
- **Show Immediately**: Don't hide behind tabs or modals
- **Persistent**: Keep visible while scrolling
- **Sticky on Mobile**: Consider fixed position on mobile

### Messaging
- **Lead with Savings**: "$124" is more compelling than "28%"
- **Show Total Cost**: Transparency builds trust
- **Multiple Options**: Let users choose their priority (cheap vs fast)

---

**Visual Guide Complete** ✅

For interactive examples, visit: `http://localhost:3000/demo/alternative-airports`
