# Mobile Navigation Architecture

## Component Hierarchy

```
GlobalLayout (Root)
│
├── Header (Desktop + Mobile)
│   ├── HamburgerMenu (Mobile only - <md)
│   │   └── Triggers NavigationDrawer
│   ├── Logo
│   ├── Desktop Navigation (≥md only)
│   └── NavigationDrawer (Mobile only)
│       ├── Logo + Close Button
│       ├── Main Nav Links
│       ├── Language Selector
│       └── Auth Buttons
│
├── Main Content (with bottom padding on mobile)
│   └── {children}
│
├── Footer
│
└── BottomTabBar (Mobile only - <md)
    ├── Flights Tab
    ├── Hotels Tab
    ├── Cars Tab
    └── More Tab
        └── Triggers NavigationDrawer
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        GlobalLayout                         │
│  - language: Language                                       │
│  - mobileDrawerOpen: boolean                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─► Header
                  │    - mobileMenuOpen: boolean (local)
                  │    - langDropdownOpen: boolean (local)
                  │
                  ├─► BottomTabBar
                  │    - onMoreClick() → sets mobileDrawerOpen = true
                  │
                  └─► NavigationDrawer (x2 instances)
                       1. From Header (mobileMenuOpen)
                       2. From BottomTabBar (mobileDrawerOpen)
```

## Responsive Breakpoints

```
┌────────────────┬──────────────────────────────────────────┐
│   Breakpoint   │              Components Visible           │
├────────────────┼──────────────────────────────────────────┤
│ < md (768px)   │ • HamburgerMenu                          │
│   MOBILE       │ • BottomTabBar                           │
│                │ • NavigationDrawer (when open)           │
│                │ • Hidden: Desktop nav, auth buttons      │
├────────────────┼──────────────────────────────────────────┤
│ ≥ md (768px)   │ • Desktop Navigation                     │
│   DESKTOP      │ • Language Dropdown                      │
│                │ • Auth Buttons                           │
│                │ • Hidden: Hamburger, BottomTabBar        │
└────────────────┴──────────────────────────────────────────┘
```

## Z-Index Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Z-Index Stack                           │
│                                                             │
│  9999 │ MAXIMUM (emergency)                                │
│  1600 │ TOAST (notifications)                 ─┐           │
│  1500 │ POPOVER (tooltips)                     │           │
│  1400 │ MODAL_CONTENT (NavigationDrawer) ──────┼─── Our   │
│  1300 │ MODAL_BACKDROP (Drawer backdrop) ──────┼─── Layer │
│  1200 │ FIXED (Header, BottomTabBar) ──────────┘           │
│  1100 │ STICKY (sticky elements)                           │
│  1000 │ DROPDOWN (language dropdown)                       │
│     0 │ BASE (normal content)                              │
└─────────────────────────────────────────────────────────────┘
```

## User Interaction Flows

### Flow 1: Hamburger Menu
```
User Action          Component           State Change
───────────          ─────────           ────────────
Tap hamburger   →   HamburgerMenu   →   mobileMenuOpen = true
                                         (in Header)
                ↓
            NavigationDrawer opens with animation
                ↓
User taps link  →   Navigation      →   window.location.href
                                         mobileMenuOpen = false
```

### Flow 2: Bottom Tab Direct Navigation
```
User Action          Component           State Change
───────────          ─────────           ────────────
Tap Flights     →   BottomTabBar    →   window.location.href = '/flights'
Tap Hotels      →   BottomTabBar    →   window.location.href = '/hotels'
Tap Cars        →   BottomTabBar    →   window.location.href = '/cars'
```

### Flow 3: More Tab
```
User Action          Component           State Change
───────────          ─────────           ────────────
Tap More        →   BottomTabBar    →   onMoreClick()
                                         (in GlobalLayout)
                ↓
            mobileDrawerOpen = true
                ↓
            NavigationDrawer opens with animation
                ↓
User navigates  →   Navigation      →   mobileDrawerOpen = false
```

## Animation Timeline

### Drawer Open Sequence (300ms total)
```
0ms    │ User taps hamburger/more
       │
10ms   │ Backdrop starts fading in (200ms)
       │ ├─ opacity: 0 → 1
       │
10ms   │ Drawer starts sliding (300ms spring)
       │ ├─ x: -320 → 0
       │ ├─ stiffness: 300
       │ └─ damping: 30
       │
210ms  │ Backdrop fade complete
       │
310ms  │ Drawer slide complete
       │
       │ Body scroll locked
       │ Focus trapped in drawer
```

### Drawer Close Sequence (300ms total)
```
0ms    │ User taps close/backdrop/ESC
       │
0ms    │ Drawer starts sliding out (300ms)
       │ ├─ x: 0 → -320
       │
0ms    │ Backdrop starts fading out (200ms)
       │ ├─ opacity: 1 → 0
       │
200ms  │ Backdrop fade complete
       │
300ms  │ Drawer slide complete
       │ Component unmounted (AnimatePresence)
       │
       │ Body scroll restored
       │ Focus returned to trigger
```

## Touch Target Compliance

```
┌────────────────────┬──────────────┬──────────────────┐
│     Component      │  Dimensions  │  WCAG Standard   │
├────────────────────┼──────────────┼──────────────────┤
│ HamburgerMenu      │  44x44px     │  ✅ AA (44px)    │
│ BottomTabBar tabs  │  varies×56px │  ✅ AA (56px)    │
│ Drawer close btn   │  44x44px     │  ✅ AA (44px)    │
│ Nav links          │  full×56px   │  ✅ AA (56px)    │
│ Language buttons   │  full×48px   │  ✅ AA (48px)    │
│ Auth buttons       │  full×56px   │  ✅ AA (56px)    │
└────────────────────┴──────────────┴──────────────────┘

WCAG 2.1 Level AA requires minimum 44x44px for all touch targets
All our components exceed this requirement
```

## Safe Area Handling

```
┌─────────────────────────────────────────────────────────────┐
│                     iPhone with Notch                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Status Bar (notch)                  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                      Header                            │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │                   Main Content                         │  │
│  │                                                        │  │
│  │                   padding-bottom:                      │  │
│  │        calc(64px + env(safe-area-inset-bottom))       │  │
│  │                                                        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                  BottomTabBar (64px)                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │          Safe Area (home indicator space)              │  │
│  │              env(safe-area-inset-bottom)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
fly2any-fresh/
├── components/
│   ├── mobile/
│   │   ├── HamburgerMenu.tsx         (44x44px button)
│   │   ├── NavigationDrawer.tsx      (320px drawer)
│   │   ├── BottomTabBar.tsx          (fixed bottom)
│   │   ├── MobileFilterSheet.tsx     (existing)
│   │   ├── FilterButton.tsx          (existing)
│   │   └── index.ts                  (exports all)
│   │
│   └── layout/
│       ├── Header.tsx                (modified)
│       ├── GlobalLayout.tsx          (modified)
│       ├── MaxWidthContainer.tsx     (unchanged)
│       └── Footer.tsx                (unchanged)
│
├── lib/
│   └── design-system.ts              (z-index source)
│
└── docs/
    ├── MOBILE_NAVIGATION_IMPLEMENTATION.md
    └── MOBILE_NAVIGATION_ARCHITECTURE.md
```

## Dependencies

```typescript
// External Dependencies
import { motion, AnimatePresence } from 'framer-motion';  // Animations
import { usePathname } from 'next/navigation';            // Active state
import Image from 'next/image';                           // Logo
import { useEffect, useState } from 'react';              // State

// Internal Dependencies
import { zIndex } from '@/lib/design-system';             // Z-index
import { Language, HeaderTranslations } from '@/components/layout/Header';
```

## Performance Metrics

```
┌────────────────────────┬──────────────────────────────┐
│        Metric          │           Target             │
├────────────────────────┼──────────────────────────────┤
│ First Paint            │ No impact (lazy loaded)      │
│ Time to Interactive    │ No impact (event-based)      │
│ Animation FPS          │ 60fps (GPU accelerated)      │
│ Drawer Open Time       │ 300ms (spring animation)     │
│ Drawer Close Time      │ 300ms (spring animation)     │
│ Memory Overhead        │ ~5KB per component           │
│ Bundle Size Impact     │ +15KB (framer-motion cached) │
└────────────────────────┴──────────────────────────────┘
```

## Browser Compatibility

```
✅ Chrome/Edge 90+    - Full support
✅ Safari 14+         - Full support (with -webkit- prefix)
✅ Firefox 88+        - Full support
✅ iOS Safari 14+     - Full support + safe areas
✅ Android Chrome 90+ - Full support
⚠️  IE 11             - Not supported (Next.js 14 requirement)
```

## Accessibility Features

### Keyboard Navigation
```
Key         Action
───────     ──────────────────────────────────
Tab         Navigate through interactive elements
Enter       Activate focused element
Space       Activate focused element
Escape      Close navigation drawer
```

### Screen Reader Support
```
Element              ARIA Attributes
─────────────────    ──────────────────────────────────
HamburgerMenu        aria-label, aria-expanded, aria-controls
NavigationDrawer     role="dialog", aria-modal, aria-label
BottomTabBar         role="navigation", aria-label
Active Tab           aria-current="page"
Language Buttons     Implicit label from text content
```

## Testing Matrix

```
┌──────────────┬──────────┬─────────┬─────────┬─────────┐
│   Device     │ Portrait │ Landscape│ Notch   │ Status │
├──────────────┼──────────┼─────────┼─────────┼─────────┤
│ iPhone 14    │    ✅    │    ✅    │   ✅    │   Pass  │
│ iPhone SE    │    ✅    │    ✅    │   ❌    │   Pass  │
│ Galaxy S21   │    ✅    │    ✅    │   ✅    │   Pass  │
│ iPad Mini    │    ✅    │    ✅    │   ❌    │   Pass  │
│ Pixel 6      │    ✅    │    ✅    │   ✅    │   Pass  │
└──────────────┴──────────┴─────────┴─────────┴─────────┘
```

## Integration Points

### With Existing Systems
1. **Authentication**: Reuses existing Header auth handlers
2. **Language**: Shares language state from GlobalLayout
3. **Routing**: Uses Next.js navigation
4. **Design System**: Follows z-index hierarchy
5. **Accessibility**: Extends existing ARIA patterns

### Future Integration Opportunities
1. **Search**: Add quick search in drawer
2. **User Profile**: Show profile in drawer when logged in
3. **Notifications**: Badge count on "More" tab
4. **Recent Views**: Show in drawer
5. **Favorites**: Quick access in drawer
