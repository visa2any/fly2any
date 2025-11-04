# Mobile Navigation - Quick Reference Guide

## At a Glance

### What Was Built
- ✅ **HamburgerMenu**: Animated button (44x44px) that opens navigation drawer
- ✅ **NavigationDrawer**: Slide-out menu with full navigation (320px wide)
- ✅ **BottomTabBar**: Fixed bottom navigation with 4 tabs (Flights, Hotels, Cars, More)

### Where to Find Components
```
components/mobile/
├── HamburgerMenu.tsx      ← Animated hamburger button
├── NavigationDrawer.tsx   ← Slide-out drawer
├── BottomTabBar.tsx       ← Fixed bottom tabs
└── index.ts               ← Exports all mobile components
```

---

## Usage Examples

### 1. HamburgerMenu Component

**Basic Usage**:
```tsx
import { HamburgerMenu } from '@/components/mobile/HamburgerMenu';

function MyHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HamburgerMenu
      isOpen={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    />
  );
}
```

**Props**:
```typescript
interface HamburgerMenuProps {
  isOpen: boolean;        // Controls animation state
  onClick: () => void;    // Click handler
  className?: string;     // Optional additional classes
}
```

**Features**:
- Automatically hidden on desktop (≥md)
- 44x44px touch target (WCAG compliant)
- Smooth animation: `─ ─ ─` → `✕`
- Accessible ARIA labels

---

### 2. NavigationDrawer Component

**Basic Usage**:
```tsx
import { NavigationDrawer } from '@/components/mobile/NavigationDrawer';

function MyLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  return (
    <NavigationDrawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      language={language}
      onLanguageChange={setLanguage}
      translations={headerTranslations[language]}
    />
  );
}
```

**Props**:
```typescript
interface NavigationDrawerProps {
  isOpen: boolean;                      // Controls visibility
  onClose: () => void;                  // Close handler
  language: Language;                   // Current language
  onLanguageChange: (lang: Language) => void;
  translations: HeaderTranslations;     // Nav link labels
  onSignIn?: () => void;                // Optional sign in handler
  onSignUp?: () => void;                // Optional sign up handler
  logoUrl?: string;                     // Optional logo path
}
```

**Features**:
- Slides from left with spring animation
- 320px wide (max 85vw)
- Backdrop overlay (50% black)
- Closes on: backdrop click, ESC key, close button
- Prevents body scroll when open
- Focus trap for accessibility

---

### 3. BottomTabBar Component

**Basic Usage**:
```tsx
import { BottomTabBar } from '@/components/mobile/BottomTabBar';

function MyLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <BottomTabBar
      translations={headerTranslations['en']}
      onMoreClick={() => setDrawerOpen(true)}
    />
  );
}
```

**Props**:
```typescript
interface BottomTabBarProps {
  translations: HeaderTranslations;  // Tab labels
  onMoreClick: () => void;           // "More" tab handler
}
```

**Features**:
- Fixed at bottom of screen
- 4 tabs: Flights, Hotels, Cars, More
- Active state indication
- Safe area padding for notched devices
- Backdrop blur glass effect
- 56px minimum height (WCAG compliant)

---

## Complete Integration Example

### Step 1: Update Your Layout Component

```tsx
'use client';

import { useState } from 'react';
import { Header, type Language } from './Header';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { NavigationDrawer } from '@/components/mobile/NavigationDrawer';
import { headerTranslations } from './Header';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Header with hamburger menu */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main content with bottom padding */}
      <main
        className="min-h-screen pb-20 md:pb-0"
        style={{
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>

      {/* Bottom tab bar (mobile only) */}
      <BottomTabBar
        translations={headerTranslations[language]}
        onMoreClick={() => setMobileDrawerOpen(true)}
      />

      {/* Navigation drawer for "More" tab */}
      <NavigationDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        translations={headerTranslations[language]}
      />
    </>
  );
}
```

### Step 2: Update Your Header Component

```tsx
'use client';

import { useState } from 'react';
import { HamburgerMenu } from '@/components/mobile/HamburgerMenu';
import { NavigationDrawer } from '@/components/mobile/NavigationDrawer';

export function Header({
  language,
  onLanguageChange,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-fixed">
        <div className="flex items-center justify-between">
          {/* Hamburger menu (mobile only) */}
          <HamburgerMenu
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {/* Logo */}
          <Logo />

          {/* Desktop navigation (desktop only) */}
          <nav className="hidden md:flex">
            {/* Your desktop nav links */}
          </nav>
        </div>
      </header>

      {/* Navigation drawer for hamburger */}
      <NavigationDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        language={language}
        onLanguageChange={onLanguageChange}
        translations={headerTranslations[language]}
      />
    </>
  );
}
```

---

## Styling Reference

### Responsive Breakpoints

```css
/* Mobile: Components visible */
@media (max-width: 767px) {
  .hamburger-menu { display: flex; }
  .bottom-tab-bar { display: flex; }
  .desktop-nav { display: none; }
}

/* Desktop: Components hidden */
@media (min-width: 768px) {
  .hamburger-menu { display: none; }
  .bottom-tab-bar { display: none; }
  .desktop-nav { display: flex; }
}
```

### Tailwind Classes Used

```tsx
// Hamburger Menu
<button className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100">

// Bottom Tab Bar
<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200">

// Navigation Drawer
<div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl md:hidden">

// Backdrop
<div className="fixed inset-0 bg-black/50 md:hidden">
```

---

## Animation Configuration

### Framer Motion Settings

```typescript
// Drawer slide animation
<motion.div
  initial={{ x: -320 }}
  animate={{ x: 0 }}
  exit={{ x: -320 }}
  transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
  }}
>

// Backdrop fade
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>

// Hamburger icon rotation
<motion.span
  animate={{
    rotate: isOpen ? 45 : 0,
    y: isOpen ? 8 : 0,
  }}
  transition={{
    duration: 0.2,
    ease: 'easeInOut',
  }}
>
```

---

## Z-Index Reference

```typescript
import { zIndex } from '@/lib/design-system';

// Apply z-index values
style={{ zIndex: zIndex.FIXED }}          // 1200 (Header, Bottom Bar)
style={{ zIndex: zIndex.MODAL_BACKDROP }} // 1300 (Drawer backdrop)
style={{ zIndex: zIndex.MODAL_CONTENT }}  // 1400 (Drawer content)
```

**Layer Stack** (bottom to top):
```
0    │ Base content
1000 │ Dropdowns
1100 │ Sticky elements
1200 │ Header + Bottom Bar  ← Your navigation
1300 │ Drawer backdrop      ← Your overlay
1400 │ Drawer content       ← Your menu
1500 │ Popovers
1600 │ Toasts
```

---

## Accessibility Checklist

### WCAG 2.1 Level AA Requirements

- ✅ **Touch Targets**: All interactive elements ≥44px
  - Hamburger: 44x44px ✓
  - Bottom tabs: 56px height ✓
  - Nav links: 56px height ✓

- ✅ **Keyboard Navigation**:
  - Tab: Navigate elements ✓
  - Enter/Space: Activate ✓
  - Escape: Close drawer ✓

- ✅ **ARIA Attributes**:
  ```html
  <button aria-label="Open menu" aria-expanded="false">
  <nav role="navigation" aria-label="Mobile navigation">
  <div role="dialog" aria-modal="true">
  <a aria-current="page">
  ```

- ✅ **Focus Management**:
  - Focus trap in open drawer ✓
  - Focus returns on close ✓
  - Visible focus indicators ✓

- ✅ **Screen Reader Support**:
  - Semantic HTML ✓
  - Descriptive labels ✓
  - State announcements ✓

---

## Common Customizations

### Change Drawer Width
```tsx
// In NavigationDrawer.tsx
<motion.div
  className="fixed top-0 left-0 h-full w-96 max-w-[85vw]"  // Changed from w-80
>
```

### Change Bottom Bar Height
```tsx
// In BottomTabBar.tsx
<button className="min-h-[64px]">  // Changed from 56px
```

### Add More Tabs
```tsx
// In BottomTabBar.tsx
const tabs: Tab[] = [
  { id: 'flights', icon: '✈️', label: 'Flights', href: '/flights' },
  { id: 'hotels', icon: '🏨', label: 'Hotels', href: '/hotels' },
  { id: 'cars', icon: '🚗', label: 'Cars', href: '/cars' },
  { id: 'trips', icon: '🎒', label: 'Trips', href: '/trips' },  // New tab
  { id: 'more', icon: '☰', label: 'More', onClick: onMoreClick },
];
```

### Change Animation Speed
```tsx
// In NavigationDrawer.tsx
transition={{
  type: 'spring',
  stiffness: 400,  // Faster (was 300)
  damping: 35,     // More bounce (was 30)
}}
```

### Customize Colors
```tsx
// Active state (BottomTabBar)
className={`${isActive ? 'text-blue-600' : 'text-gray-600'}`}  // Custom blue

// Backdrop opacity (NavigationDrawer)
className="fixed inset-0 bg-black/60"  // Darker (was 50%)
```

---

## Troubleshooting

### Issue: Drawer doesn't slide smoothly
**Solution**: Ensure Framer Motion is installed
```bash
npm install framer-motion
```

### Issue: Bottom bar overlaps content
**Solution**: Check main content padding
```tsx
<main style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
```

### Issue: Body still scrolls with drawer open
**Solution**: Check useEffect in NavigationDrawer
```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);
```

### Issue: Hamburger visible on desktop
**Solution**: Ensure `md:hidden` class is applied
```tsx
<HamburgerMenu className="md:hidden" />
```

### Issue: Active tab not highlighting
**Solution**: Check pathname matching
```tsx
import { usePathname } from 'next/navigation';
const pathname = usePathname();
const isActive = pathname.startsWith(tab.href);
```

---

## Performance Tips

1. **Use AnimatePresence** for mount/unmount animations
2. **Cleanup event listeners** in useEffect
3. **Memoize expensive calculations** with useMemo
4. **Lazy load drawer content** if complex
5. **Use CSS transforms** instead of position changes
6. **Enable GPU acceleration** with `transform: translateZ(0)`

---

## Browser Support

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Best performance |
| Safari | 14+ | ✅ Full | Needs -webkit- prefixes |
| Firefox | 88+ | ✅ Full | Full support |
| Edge | 90+ | ✅ Full | Chromium-based |
| iOS Safari | 14+ | ✅ Full | Safe areas supported |
| Android Chrome | 90+ | ✅ Full | Full support |
| IE 11 | - | ❌ None | Not supported (Next.js 14) |

---

## File Locations Summary

```
C:\Users\Power\fly2any-fresh\
│
├── components/
│   ├── mobile/
│   │   ├── HamburgerMenu.tsx          ← NEW
│   │   ├── NavigationDrawer.tsx       ← NEW
│   │   ├── BottomTabBar.tsx           ← NEW
│   │   └── index.ts                   ← UPDATED
│   │
│   └── layout/
│       ├── Header.tsx                 ← UPDATED
│       └── GlobalLayout.tsx           ← UPDATED
│
└── docs/ (or root)
    ├── MOBILE_NAVIGATION_IMPLEMENTATION.md  ← NEW
    ├── MOBILE_NAVIGATION_ARCHITECTURE.md    ← NEW
    ├── MOBILE_NAVIGATION_SUMMARY.md         ← NEW
    └── MOBILE_NAVIGATION_QUICK_REFERENCE.md ← NEW (this file)
```

---

## Quick Commands

```bash
# Check build
npm run build

# Run dev server
npm run dev

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## Support

For questions or issues:
1. Check troubleshooting section above
2. Review implementation docs
3. Check design system: `lib/design-system.ts`
4. Test on real mobile device

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Status**: ✅ Production Ready
