# Fly2Any Design System
## Level 6 - Ultra-Premium / Apple-Class

---

## Brand Colors

### Primary (Brand Red)
```
primary-50:  #FEF2F2  - Backgrounds, hover states
primary-100: #FDE8E7  - Light backgrounds
primary-200: #FACCCA  - Borders, dividers
primary-300: #F5A5A2  - Disabled states
primary-400: #EF6B65  - Secondary actions
primary-500: #EF4136  - MAIN BRAND COLOR (CTAs, active states)
primary-600: #DC3A30  - Hover state
primary-700: #C4332A  - Pressed state
primary-800: #9C2921  - Dark accent
primary-900: #74201A  - Darkest
```

### Secondary (Brand Yellow)
```
secondary-500: #F9C900  - Accent highlights, badges
secondary-600: #E0B500  - Hover
```

### Neutral (Anti-Fatigue Palette)
```
neutral-50:  #F6F7F9  - Page backgrounds
neutral-100: #F0F2F5  - Card backgrounds
neutral-200: #E3E5E8  - Borders, dividers
neutral-300: #D1D4D9  - Disabled borders
neutral-400: #9CA0A7  - Placeholder text, icons
neutral-500: #5F6368  - Secondary text
neutral-600: #4A4D52  - Body text
neutral-700: #35373B  - Headings
neutral-800: #1B1C20  - Primary text
```

### Semantic Colors
```
success-500: #00A699  - Success, prices, deals
warning-500: #FFAD1F  - Warnings, alerts
error-500:   #E63946  - Errors, destructive
info-500:    #4CC3D9  - Informational
```

---

## Typography

### Font Families
- **Display**: `Poppins` - Headlines, brand elements
- **Body**: `Inter` - UI text, paragraphs

### Mobile Text Sizes
```
text-[9px]   - Micro labels, badges
text-[10px]  - Chip labels, counters
text-[11px]  - Secondary labels
text-xs      - Labels, captions (12px)
text-sm      - Body text (14px)
text-[15px]  - Button text
text-base    - Large body (16px)
```

### Font Weights
```
font-medium   - Regular UI text
font-semibold - Labels, buttons
font-bold     - Headings, CTAs, emphasis
```

---

## Mobile Components (Apple-Class)

### Input Fields
```css
/* Standard Input */
.mobile-input {
  @apply w-full px-3 py-3 min-h-[48px]
         border-2 border-neutral-200
         hover:border-primary-400 focus:border-primary-500
         rounded-xl text-sm font-semibold text-neutral-800
         transition-all duration-200
         touch-manipulation;
}

/* Select/Dropdown Trigger */
.mobile-select {
  @apply relative w-full min-h-[48px]
         border-2 border-neutral-200 rounded-xl
         bg-white text-left
         active:scale-[0.98] touch-manipulation;
}
```

### Buttons
```css
/* Primary CTA */
.mobile-btn-primary {
  @apply w-full py-3.5 min-h-[48px]
         bg-gradient-to-r from-primary-500 to-primary-600
         hover:from-primary-600 hover:to-primary-700
         text-white font-bold text-[15px]
         rounded-xl shadow-lg shadow-primary-500/30
         transition-all duration-200
         touch-manipulation active:scale-[0.98];
}

/* Ghost Button */
.mobile-btn-ghost {
  @apply flex items-center justify-center gap-1
         px-4 py-1.5
         bg-neutral-100 hover:bg-neutral-200
         text-neutral-500 text-[10px] font-semibold
         rounded-full transition-all
         touch-manipulation active:scale-95;
}

/* Secondary Button */
.mobile-btn-secondary {
  @apply py-2.5 px-4
         bg-neutral-100 hover:bg-neutral-200
         text-neutral-700 font-semibold
         rounded-xl transition-all
         touch-manipulation active:scale-[0.98];
}
```

### Dropdowns & Bottom Sheets
```css
/* Dropdown Panel */
.mobile-dropdown {
  @apply bg-white/95 backdrop-blur-xl
         border border-neutral-200
         rounded-2xl shadow-2xl
         animate-in slide-in-from-top-2 duration-200;
}

/* Bottom Sheet (Mobile) */
.mobile-bottom-sheet {
  @apply fixed inset-x-0 bottom-0
         bg-white/95 backdrop-blur-xl
         border-t border-neutral-200
         rounded-t-3xl shadow-2xl
         z-modal safe-area-bottom
         animate-in slide-in-from-bottom-4 duration-300;
}

/* Backdrop Overlay */
.mobile-backdrop {
  @apply fixed inset-0
         bg-black/30 backdrop-blur-sm
         z-modal-backdrop
         animate-in fade-in duration-200;
}
```

### Cards
```css
.mobile-card {
  @apply bg-white border-2 border-neutral-100
         rounded-2xl shadow-soft
         overflow-hidden;
}
```

---

## Touch & Interaction

### Touch Targets
- Minimum: `44px` (iOS HIG)
- Recommended: `48px` (Material Design)
- All interactive elements: `min-h-[48px]`

### Feedback
```css
/* Scale feedback on press */
active:scale-[0.98]    /* Buttons, cards */
active:scale-95        /* Small elements, chips */

/* Touch manipulation */
touch-manipulation     /* Disable 300ms delay */
```

### Gestures
- **Tap**: Primary action
- **Long press**: Secondary actions (context menus)
- **Swipe down**: Pull to refresh
- **Drag handle**: Bottom sheet dismiss

---

## Animations

### Transitions
```css
transition-all duration-200  /* Standard */
transition-all duration-150  /* Quick */
transition-all duration-300  /* Slow/emphasis */
```

### Motion (Framer Motion)
```javascript
// Spring config
{ type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }

// Fade in
{ initial: { opacity: 0 }, animate: { opacity: 1 } }

// Slide up
{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }
```

---

## Z-Index Scale

```
z-base:           0
z-dropdown:    1000
z-sticky:      1100
z-fixed:       1200
z-modal-backdrop: 1300
z-modal:       1400
z-popover:     1500
z-toast:       1600
z-maximum:     9999
```

---

## Shadows

```css
shadow-soft-sm: 0 2px 8px rgba(27,28,32,0.06)
shadow-soft:    0 4px 20px rgba(27,28,32,0.10)
shadow-soft-md: 0 8px 24px rgba(27,28,32,0.12)
shadow-soft-lg: 0 12px 28px rgba(27,28,32,0.14)
shadow-primary: 0 8px 24px rgba(214,58,53,0.18)

/* Button shadows */
shadow-lg shadow-primary-500/25  /* Primary buttons */
shadow-lg shadow-primary-500/30  /* Large CTAs */
```

---

## Spacing

### Component Spacing
```
gap-1    (4px)   - Tight: icons + text
gap-1.5  (6px)   - Compact: chips, badges
gap-2    (8px)   - Standard: form elements
gap-3    (12px)  - Section spacing
gap-4    (16px)  - Card padding
```

### Padding
```
p-2      - Compact containers
p-3      - Standard cards
p-4      - Large sections
px-3 py-3 - Input fields
px-4 py-2.5 - Buttons
```

---

## Border Radius

```
rounded-lg   (8px)   - Small elements
rounded-xl   (12px)  - Inputs, buttons
rounded-2xl  (16px)  - Cards, dropdowns
rounded-3xl  (24px)  - Bottom sheets
rounded-full         - Pills, avatars
```

---

## Accessibility

### Focus States
```css
focus:ring-2 focus:ring-primary-400 focus:ring-offset-0
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

### Safe Areas (iPhone Notch)
```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Quick Reference

| Element | Height | Border | Radius | Shadow |
|---------|--------|--------|--------|--------|
| Input | 48px | 2px neutral-200 | xl | none |
| Button | 48px | none | xl | lg primary/25 |
| Card | auto | 2px neutral-100 | 2xl | soft |
| Dropdown | auto | 1px neutral-200 | 2xl | 2xl |
| Bottom Sheet | auto | top 1px | t-3xl | 2xl |

---

*Last updated: December 2024*
