# Loading Components - Visual Guide

A visual reference for all loading components and their use cases.

---

## Skeleton Screens

### FlightCardSkeleton

```
┌─────────────────────────────────────────────┐
│  ▓▓▓▓▓▓    ━━━━━━━━━━━    ▓▓▓▓▓▓          │
│  ▓▓▓▓▓▓                    ▓▓▓▓▓▓          │
│  ▂▂▂▂▂▂    ▂▂▂▂▂▂▂▂▂▂▂    ▂▂▂▂▂▂          │
│                                             │
│  ▂▂▂▂▂▂  ▂▂▂▂▂▂▂▂                          │
│                                             │
│                          ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂  │
│                          ▂▂▂▂▂▂             │
│                          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────────┘

Usage: Flight search results loading
Components: Time, Airport, Duration, Price, Button
Animation: Shimmer effect (→)
```

### HotelCardSkeleton

```
┌─────────────────────────────────────────────┐
│ ████████  │ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂   ▂▂▂▂         │
│ ████████  │ ▂▂▂▂▂▂▂▂                       │
│ ████████  │                                 │
│ ████████  │ ▂▂▂▂  ▂▂▂▂▂▂  ▂▂▂▂            │
│ [Image]   │                                 │
│ ████████  │ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂  │
│ ████████  │ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂            │
│ ████████  │                                 │
│           │ ▂▂▂▂▂▂▂▂    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────────┘

Usage: Hotel search results loading
Components: Image, Title, Rating, Amenities, Price, Button
Animation: Shimmer effect (→)
```

### BookingFormSkeleton

```
┌─────────────────────────────────────────────┐
│  ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂                       │
│  ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂        │
│                                             │
│  ▂▂▂▂▂▂▂▂             ▂▂▂▂▂▂▂▂            │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                             │
│  ▂▂▂▂▂▂▂▂▂▂▂▂                              │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│                                             │
│  ▂▂▂▂▂   ▂▂▂▂▂   ▂▂▂▂▂                    │
│  ▓▓▓▓▓   ▓▓▓▓▓   ▓▓▓▓▓                    │
│                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────────┘

Usage: Booking form loading
Components: Header, 2-column fields, Full-width field, 3-column fields, Button
Animation: Shimmer effect (→)
```

### SearchBarSkeleton

```
┌─────────────────────────────────────────────┐
│  ▂▂▂▂  ▂▂▂▂  ▂▂▂▂▂▂▂  ▂▂▂▂▂▂  ▓▓▓▓▓▓▓▓   │
│  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓   │
└─────────────────────────────────────────────┘

Usage: Search bar loading
Components: From, To, Departure, Return, Search Button
Animation: Shimmer effect (→)
```

---

## Loading Spinners

### Small Spinner

```
     ⟲
   (spinning)

Size: 16×16px
Usage: Buttons, inline text
Color: Matches context
```

### Medium Spinner

```
      ⟲
   (spinning)

Size: 32×32px
Usage: Cards, sections
Color: Primary/Orange
```

### Large Spinner

```
       ⟲
    (spinning)

Size: 48×48px
Usage: Full page, overlays
Color: Primary/Orange
```

---

## Loading Overlay

### Full Screen Overlay

```
╔═══════════════════════════════════════════╗
║                                           ║
║           [Backdrop blur effect]          ║
║                                           ║
║              ┌───────────┐                ║
║              │           │                ║
║              │     ⟲     │                ║
║              │ (spinning)│                ║
║              │           │                ║
║              │ Loading...│                ║
║              │           │                ║
║              └───────────┘                ║
║                                           ║
║                                           ║
╚═══════════════════════════════════════════╝

Features:
- Backdrop blur
- Centered content
- Prevents body scroll
- Auto z-index: 9999
```

### Payment Loading Overlay

```
╔═══════════════════════════════════════════╗
║                                           ║
║              ┌───────────────┐            ║
║              │       ⟲       │            ║
║              │               │            ║
║              │ Processing    │            ║
║              │ your payment..│            ║
║              │               │            ║
║              │ This may take │            ║
║              │ a few moments │            ║
║              │               │            ║
║              │ ✓ Secure      │            ║
║              │   payment     │            ║
║              └───────────────┘            ║
║                                           ║
╚═══════════════════════════════════════════╝

Features:
- Payment-specific messaging
- Security indicator
- Timeout protection
```

---

## Loading Bar

### Top Progress Bar (NProgress style)

```
████████████████████░░░░░░░░░░░░░░░░░░░░░░
```

States:
1. Start: `0%` (invisible)
2. Progress: `0% → 90%` (auto-animate)
3. Complete: `90% → 100%` (smooth)
4. Hide: Fade out after 400ms

Colors:
- Primary (flights): Blue gradient
- Orange (hotels): Orange gradient
- Green (success): Green gradient

---

## Pulse Loader

### 3 Dots (Default)

```
●  ●  ●
   ⬆️  ⬇️  ⬆️
(bouncing animation)
```

### 5 Dots

```
●  ●  ●  ●  ●
   ⬆️  ⬇️  ⬆️  ⬇️  ⬆️
(bouncing animation)
```

### Wave Animation

```
|  ||  |||  ||  |
(wave effect)
```

Timing:
- Delay between dots: 150ms
- Animation duration: 600ms
- Infinite loop

---

## Button Loading

### Primary Button - Normal

```
┌────────────────┐
│  Book Flight   │
└────────────────┘
```

### Primary Button - Loading

```
┌────────────────┐
│ ⟲ Booking...  │
└────────────────┘
```

### Secondary Button - Loading

```
┌────────────────┐
│ ⟲ Submitting..│
└────────────────┘
```

Features:
- Spinner appears on left
- Text changes to loadingText
- Button auto-disabled
- Opacity reduced during loading

---

## Size Comparison

### Spinners

```
Small:     ⟲ (16px)
Medium:    ⟲  (32px)
Large:     ⟲   (48px)
```

### Buttons

```
Small:   ┌────────┐
         │ Click  │
         └────────┘

Medium:  ┌──────────┐
         │  Click   │
         └──────────┘

Large:   ┌────────────┐
         │   Click    │
         └────────────┘
```

---

## Color Variants

### Primary (Blue - Flights)

```
Spinner:  ⟲ (blue)
Bar:      ████████ (blue gradient)
Button:   [████ Blue Gradient ████]
```

### Orange (Hotels)

```
Spinner:  ⟲ (orange)
Bar:      ████████ (orange gradient)
Button:   [████ Orange Gradient ████]
```

### Success (Green)

```
Bar:      ████████ (green gradient)
```

### Gray (Neutral)

```
Spinner:  ⟲ (gray)
```

### White (On Dark)

```
Spinner:  ⟲ (white)
```

---

## Animation States

### Shimmer Effect

```
Frame 1:  ▓░░░░░░░░░
Frame 2:  ░▓░░░░░░░░
Frame 3:  ░░▓░░░░░░░
Frame 4:  ░░░▓░░░░░░
Frame 5:  ░░░░▓░░░░░
...       (continues)
```

Direction: Left to right →
Duration: 2 seconds
Loop: Infinite

### Spin Animation

```
Frame 1:  ⬆️
Frame 2:  ↗️
Frame 3:  ➡️
Frame 4:  ↘️
Frame 5:  ⬇️
Frame 6:  ↙️
Frame 7:  ⬅️
Frame 8:  ↖️
```

Direction: Clockwise ↻
Duration: 1 second
Loop: Infinite

### Bounce Animation

```
Frame 1:  ●────  (top)
Frame 2:  ──●──  (middle)
Frame 3:  ────●  (bottom)
Frame 4:  ──●──  (middle)
Frame 5:  ●────  (top)
```

Direction: Up and down ↕️
Duration: 600ms
Loop: Infinite
Stagger: 150ms per dot

---

## Layout Examples

### Flight Results Page

```
┌──────────────────────────────────────────┐
│ ████ (Loading Bar)                       │ ← Top progress
├──────────────────────────────────────────┤
│                                           │
│  [Filters]  │  [Flight Skeletons]  │ [—] │ ← 3-column
│             │                       │     │
│  ▓▓▓▓▓▓▓   │  ┌──────────────────┐ │ ▓▓▓ │
│  ▂▂▂▂▂▂▂   │  │ ▓▓▓▓  ━━  ▓▓▓▓  │ │ ▂▂▂ │
│             │  │ ▂▂▂▂      ▂▂▂▂  │ │     │
│  ▓▓▓▓▓▓▓   │  └──────────────────┘ │ ▓▓▓ │
│  ▂▂▂▂▂▂▂   │                       │ ▂▂▂ │
│             │  ┌──────────────────┐ │     │
│             │  │ ▓▓▓▓  ━━  ▓▓▓▓  │ │     │
│             │  │ ▂▂▂▂      ▂▂▂▂  │ │     │
│             │  └──────────────────┘ │     │
│             │                       │     │
└──────────────────────────────────────────┘
```

### Booking Page

```
┌──────────────────────────────────────────┐
│  Passenger Details                        │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ ▂▂▂▂▂▂▂▂▂▂▂▂▂▂                   │  │ ← Form skeleton
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  │
│  │                                   │  │
│  │ ▂▂▂▂▂▂▂▂        ▂▂▂▂▂▂▂▂         │  │
│  │ ▓▓▓▓▓▓▓▓        ▓▓▓▓▓▓▓▓         │  │
│  └────────────────────────────────────┘  │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ ⟲ Submitting passenger details... │  │ ← Loading button
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Payment Processing

```
╔═══════════════════════════════════════════╗
║        [Full Screen Overlay]              ║
║                                           ║
║              ┌─────────┐                  ║
║              │    ⟲    │                  ║ ← Overlay
║              │         │                  ║
║              │Processing│                  ║
║              │payment...│                  ║
║              └─────────┘                  ║
║                                           ║
╚═══════════════════════════════════════════╝
```

---

## Responsive Behavior

### Mobile (< 768px)

```
┌──────────────┐
│ ████ (Bar)   │ ← Thinner bar
├──────────────┤
│              │
│ [Skeleton 1] │ ← Stacked
│              │
│ [Skeleton 2] │
│              │
│ [Skeleton 3] │
│              │
└──────────────┘
```

### Tablet (768px - 1024px)

```
┌────────────────────────┐
│ ████ (Bar)             │
├────────────────────────┤
│                        │
│ [Skel]  [Skel]  [Info] │ ← 2-3 columns
│                        │
│ [Skel]  [Skel]  [Info] │
│                        │
└────────────────────────┘
```

### Desktop (> 1024px)

```
┌──────────────────────────────────┐
│ ████ (Bar)                       │
├──────────────────────────────────┤
│                                   │
│ [F] │ [Skeleton 1] │ [Insights]  │ ← 3 columns
│ [i] │ [Skeleton 2] │             │
│ [l] │ [Skeleton 3] │ [Stats]     │
│ [t] │ [Skeleton 4] │             │
│     │              │             │
└──────────────────────────────────┘
```

---

## Accessibility Indicators

### Screen Reader Text

```
<LoadingSpinner />
  ↓
[Visual Spinner] + "Loading..." (sr-only)
```

### ARIA Attributes

```
Spinner:
  role="status"
  aria-label="Loading"

Progress Bar:
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="45"

Overlay:
  role="dialog"
  aria-modal="true"
  aria-label="Processing"
```

---

## Animation Performance

### GPU Acceleration

```css
/* Optimized */
.spinner {
  transform: rotate(360deg);     ✅ GPU
  will-change: transform;        ✅ Hint
  transform: translateZ(0);      ✅ Force GPU
}

/* Not Optimized */
.spinner-bad {
  margin-left: 100px;            ❌ CPU
  position: relative;            ❌ Layout
}
```

### Performance Metrics

```
FPS:           60fps
Paint time:    < 16ms
Jank score:    0
Memory:        Minimal
CPU usage:     < 5%
```

---

## Quick Decision Tree

```
Need loading state?
│
├─ Page/Component loading (> 1s)?
│  └─ Use: Skeleton screens
│
├─ Quick action (< 2s)?
│  └─ Use: Spinner or Pulse loader
│
├─ Critical operation (payment)?
│  └─ Use: Loading overlay
│
├─ Button action?
│  └─ Use: ButtonLoading
│
└─ Page transition?
   └─ Use: LoadingBar
```

---

## Summary

**9 Components** ready to use:
- 4 Skeleton screens (Flight, Hotel, Booking, SearchBar)
- 5 Loading indicators (Spinner, Overlay, Bar, Pulse, Button)

**All with:**
- 60fps animations
- Accessibility features
- Responsive design
- Brand consistency
- TypeScript support

**Start using:**
```tsx
import { LoadingSpinner, FlightCardSkeleton } from '@/components/loading';
```

---

For detailed documentation, see:
- `components/loading/README.md` - Complete API reference
- `LOADING_QUICK_REFERENCE.md` - Copy-paste examples
- `LOADING_STATES_IMPLEMENTATION.md` - Implementation guide
