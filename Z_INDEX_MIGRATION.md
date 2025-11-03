# Z-Index Design System Migration Guide

**Last Updated**: November 3, 2025

---

## Overview

This guide explains the new Z-Index Design System and how to migrate existing components from arbitrary z-index values to the standardized semantic layers.

## Audit Results

### Current Z-Index Usage

**Total Occurrences**: 10
**Unique Values Found**: 5 (60, 70, 80, 90, 100, 9999)
**Files Affected**: 8 components + 3 documentation files

| Value | Count | Current Use | Recommended Layer |
|-------|-------|-------------|-------------------|
| **9999** | 3 | Tooltips, modals | MAXIMUM (emergency only) |
| **100** | 2 | Headers, autocompletes | DROPDOWN or FIXED |
| **90** | 1 | Airport selector dropdown | DROPDOWN |
| **80** | 1 | Search bar dropdown | DROPDOWN |
| **70** | 2 | Autocomplete lists | DROPDOWN |
| **60** | 1 | Modal backdrop | MODAL_BACKDROP |

---

## New Z-Index System

### Layer Hierarchy

```
0         ├─ BASE
          │
1000      ├─ DROPDOWN
          │  ├─ Autocomplete lists
          │  ├─ Select dropdowns
          │  └─ Navigation menus
          │
1100      ├─ STICKY
          │  ├─ Sticky headers
          │  └─ Sticky sidebars
          │
1200      ├─ FIXED
          │  ├─ Fixed navigation
          │  └─ Fixed positioning
          │
1300      ├─ MODAL_BACKDROP
          │  └─ Modal semi-transparent overlay
          │
1400      ├─ MODAL_CONTENT
          │  ├─ Dialog boxes
          │  ├─ Modal windows
          │  └─ Overlays
          │
1500      ├─ POPOVER
          │  ├─ Tooltips
          │  ├─ Popovers
          │  └─ Floating content
          │
1600      ├─ TOAST
          │  ├─ Toast notifications
          │  └─ Temporary alerts
          │
9999      └─ MAXIMUM (avoid using)
```

### Implementation

#### Option 1: TypeScript (Recommended)

```typescript
import { zIndex } from '@/lib/design-system';

// Use in inline styles
<div style={{ zIndex: zIndex.DROPDOWN }}>...</div>

// Or with className if using Tailwind
<div className={`z-dropdown`}>...</div>
```

#### Option 2: Tailwind CSS

```jsx
// Dropdown
<div className="z-dropdown">Dropdown content</div>

// Modal
<div className="z-modal-backdrop">Modal backdrop</div>
<div className="z-modal">Modal content</div>

// Toast
<div className="z-toast">Notification</div>
```

---

## Migration Mapping

### Current → New Z-Index Mapping

| Component | File | Line | Old Value | New Layer | New Value | Tailwind Class |
|-----------|------|------|-----------|-----------|-----------|-----------------|
| MultiAirportSelector | components/common/MultiAirportSelector.tsx | 222 | z-[90] | DROPDOWN | 1000 | z-dropdown |
| DealScoreBadge | components/flights/DealScoreBadge.tsx | 192 | z-[9999] | MAXIMUM | 9999 | z-maximum |
| EnhancedSearchBar | components/flights/EnhancedSearchBar.tsx | 1272 | z-[80] | DROPDOWN | 1000 | z-dropdown |
| InlineAirportAutocomplete | components/flights/InlineAirportAutocomplete.tsx | 134 | z-[100] | DROPDOWN | 1000 | z-dropdown |
| ShareFlightModal | components/flights/ShareFlightModal.tsx | 486 | z-[60] | MODAL_BACKDROP | 1300 | z-modal-backdrop |
| Header | components/layout/Header.tsx | 159 | z-[100] | FIXED | 1200 | z-fixed |
| Header Dropdown | components/layout/Header.tsx | 285 | z-[9999] | DROPDOWN | 1000 | z-dropdown |
| AirportAutocomplete | components/search/AirportAutocomplete.tsx | 392 | z-[70] | DROPDOWN | 1000 | z-dropdown |
| AirportAutocompleteCompact | components/search/AirportAutocompleteCompact.backup.tsx | 132 | z-[70] | DROPDOWN | 1000 | z-dropdown |
| PhoneInput | components/ui/PhoneInput.tsx | 107 | z-[9999] | DROPDOWN | 1000 | z-dropdown |

---

## Migration Examples

### Example 1: Dropdown Component

**Before** (arbitrary z-index):
```tsx
<div className="absolute z-[90] mt-2 w-full bg-white rounded-xl shadow-2xl">
  {/* dropdown content */}
</div>
```

**After** (using design system):
```tsx
import { zIndex } from '@/lib/design-system';

<div className="absolute z-dropdown mt-2 w-full bg-white rounded-xl shadow-2xl">
  {/* dropdown content */}
</div>
```

---

### Example 2: Modal Component

**Before** (mixed z-index values):
```tsx
<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
  <div className="bg-white rounded-lg p-6">
    {/* modal content */}
  </div>
</div>
```

**After** (using design system):
```tsx
import { zIndex } from '@/lib/design-system';

<div className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/70">
  <div className="bg-white rounded-lg p-6 z-modal">
    {/* modal content */}
  </div>
</div>
```

---

### Example 3: Header with Dropdown

**Before**:
```tsx
<header className="sticky top-0 z-[100]">
  <nav>
    <button>Menu</button>
    <div className="absolute z-[9999]">
      {/* dropdown menu */}
    </div>
  </nav>
</header>
```

**After**:
```tsx
import { zIndex } from '@/lib/design-system';

<header className="sticky top-0 z-fixed">
  <nav>
    <button>Menu</button>
    <div className="absolute z-dropdown">
      {/* dropdown menu */}
    </div>
  </nav>
</header>
```

---

### Example 4: Toast Notification

**Before**:
```tsx
<div className="fixed bottom-4 right-4 z-[9999] bg-green-500 text-white p-4">
  Success message
</div>
```

**After**:
```tsx
import { zIndex } from '@/lib/design-system';

<div className="fixed bottom-4 right-4 z-toast bg-green-500 text-white p-4">
  Success message
</div>
```

---

## Migration Checklist

### Phase 1: Setup (COMPLETED)
- [x] Add z-index constants to design-system.ts
- [x] Add Tailwind z-index utilities to tailwind.config.ts
- [x] Create migration documentation

### Phase 2: Critical Components (PRIORITY)
- [ ] Migrate Header.tsx (sticky + dropdown)
- [ ] Migrate modal components (ShareFlightModal.tsx)
- [ ] Migrate autocomplete components (AirportAutocomplete.tsx, etc.)

### Phase 3: Secondary Components
- [ ] Migrate search bar dropdowns (EnhancedSearchBar.tsx)
- [ ] Migrate airport selector (MultiAirportSelector.tsx)
- [ ] Migrate phone input dropdown (PhoneInput.tsx)

### Phase 4: Cleanup
- [ ] Remove old z-index comments from components
- [ ] Audit for any remaining arbitrary z-index values
- [ ] Update component documentation

---

## Best Practices

### DO

✅ **Use Tailwind classes first**
```tsx
<div className="z-dropdown">...</div>
```

✅ **Use TypeScript constants for dynamic styling**
```tsx
<div style={{ zIndex: zIndex.MODAL_CONTENT }}>...</div>
```

✅ **Combine backdrop with modal content**
```tsx
{showModal && (
  <>
    <div className="z-modal-backdrop">Backdrop</div>
    <div className="z-modal">Content</div>
  </>
)}
```

✅ **Document non-standard layering**
```tsx
// Using MAXIMUM only as fallback for external library integration
<div style={{ zIndex: zIndex.MAXIMUM }}>Third-party widget</div>
```

### DON'T

❌ **Avoid arbitrary z-index values**
```tsx
// ❌ BAD
<div className="z-[500]">...</div>
```

❌ **Avoid mixing systems**
```tsx
// ❌ BAD
<div className="z-dropdown" style={{ zIndex: 9999 }}>...</div>
```

❌ **Avoid over-nesting layers**
```tsx
// ❌ BAD (multiple z-index changes in nested elements)
<div className="z-modal-backdrop">
  <div className="z-modal">
    <div className="z-popover">
      <div className="z-toast">Too many layers!</div>
    </div>
  </div>
</div>
```

---

## Semantic Layer Selection Guide

### Which layer should I use?

**DROPDOWN (1000)**
- Dropdowns that appear below/above inputs
- Select menus
- Autocomplete lists
- Context menus
- Navigation sub-menus

**STICKY (1100)**
- Headers that stick on scroll
- Sticky table headers
- Sticky sidebars
- Floating action buttons

**FIXED (1200)**
- Fixed navigation bars
- Fixed positioning elements
- Persistent UI elements

**MODAL_BACKDROP (1300)**
- Semi-transparent overlay behind modals
- Always paired with MODAL_CONTENT

**MODAL_CONTENT (1400)**
- Dialog boxes
- Modal windows
- Overlay panels
- Slide-out menus

**POPOVER (1500)**
- Tooltips
- Info popvers
- Floating labels
- Help text overlays

**TOAST (1600)**
- Notification toasts
- Alert messages
- Temporary notifications
- Snackbars

**MAXIMUM (9999)**
- Emergency fallback only
- Third-party library integrations
- Rare edge cases
- **Avoid using in normal circumstances**

---

## Troubleshooting

### Issue: Dropdown appears behind modal

**Cause**: DROPDOWN (1000) < MODAL_CONTENT (1400)

**Solution**: If dropdown is inside a modal, use MODAL_CONTENT + 1 or consider changing interaction pattern.

```tsx
// Option 1: Use higher z-index for dropdown inside modal
<div className="z-modal">
  <div className="relative">
    <div style={{ zIndex: zIndex.MODAL_CONTENT + 1 }}>
      Dropdown inside modal
    </div>
  </div>
</div>

// Option 2: Better UX - move dropdown outside stacking context
<div className="z-modal">Modal content</div>
<Portal>
  <div className="z-popover">Dropdown</div>
</Portal>
```

### Issue: Tooltip appears behind dropdown

**Cause**: TOOLTIP/POPOVER (1500) is higher - should work correctly

**Solution**: Check if parent has `position: relative` with lower z-index context.

```tsx
// ❌ WRONG - tooltip higher but parent context is limited
<div style={{ position: 'relative', zIndex: 1 }}>
  <div className="z-dropdown">Dropdown</div>
  <div className="z-tooltip">Tooltip</div>
</div>

// ✅ CORRECT
<div>
  <div className="z-dropdown">Dropdown</div>
  <Portal>
    <div className="z-tooltip">Tooltip</div>
  </Portal>
</div>
```

---

## Testing Z-Index Stacking

### Visual Testing Checklist

- [ ] Dropdowns appear above content
- [ ] Modals appear above everything except toasts
- [ ] Toasts appear on top
- [ ] No overlapping issues on responsive breakpoints
- [ ] Dropdown doesn't hide modal content
- [ ] Tooltip visible above dropdown
- [ ] Fixed header above scrolling content

---

## References

- Design System: `/lib/design-system.ts`
- Tailwind Config: `/tailwind.config.ts`
- MDN z-index Guide: https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
- Stacking Context: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioned_Layout/Understanding_z-index/The_stacking_context

---

## Migration Timeline

| Phase | Target Date | Status |
|-------|-------------|--------|
| Setup & Documentation | Nov 3, 2025 | ✅ Complete |
| Critical Components | Nov 5, 2025 | ⏳ Pending |
| Secondary Components | Nov 10, 2025 | ⏳ Pending |
| Final Audit & Cleanup | Nov 15, 2025 | ⏳ Pending |

---

## Questions or Issues?

Refer to the design system documentation or contact the design team for clarification on which layer to use for your component.
