# Z-Index Design System - Quick Reference

**Status**: ✅ Complete & Production Ready

## Quick Start

### Using in Components

```tsx
import { zIndex } from '@/lib/design-system';

// Option 1: Tailwind (Recommended)
<header className="z-fixed">...</header>
<div className="z-dropdown">Dropdown</div>
<div className="z-modal-backdrop">Modal</div>
<div className="z-toast">Toast</div>

// Option 2: Inline styles
<div style={{ zIndex: zIndex.MODAL_CONTENT }}>...</div>
```

## Layer Reference

| Layer | Class | Value | Use |
|-------|-------|-------|-----|
| **BASE** | `z-base` | 0 | Default |
| **DROPDOWN** | `z-dropdown` | 1000 | Menus, autocomplete |
| **STICKY** | `z-sticky` | 1100 | Sticky headers |
| **FIXED** | `z-fixed` | 1200 | Fixed navigation |
| **MODAL_BACKDROP** | `z-modal-backdrop` | 1300 | Modal overlay |
| **MODAL_CONTENT** | `z-modal` | 1400 | Modal dialog |
| **POPOVER** | `z-popover` | 1500 | Tooltips |
| **TOAST** | `z-toast` | 1600 | Notifications |
| **MAXIMUM** | `z-maximum` | 9999 | Emergency only |

## Common Patterns

### Header + Dropdown
```tsx
<header className="z-fixed sticky top-0">
  <button>Menu</button>
  {isOpen && <div className="z-dropdown">Items</div>}
</header>
```

### Modal Dialog
```tsx
<>
  <div className="z-modal-backdrop">Backdrop</div>
  <dialog className="z-modal">Content</dialog>
</>
```

### Toast Notification
```tsx
<div className="fixed bottom-4 right-4 z-toast">
  Success message
</div>
```

## Files

- **System**: `/lib/design-system.ts` (lines 277-340)
- **Tailwind**: `/tailwind.config.ts` (lines 26-36)
- **Detailed Guide**: `/Z_INDEX_MIGRATION.md`
- **Full Report**: `/Z_INDEX_AUDIT_REPORT.md`

## Migration Status

✅ **Complete** - All 10 z-index values migrated across 8 components

### Migrated Components
- Header.tsx (z-fixed, z-dropdown)
- AirportAutocomplete.tsx (z-dropdown)
- InlineAirportAutocomplete.tsx (z-dropdown)
- EnhancedSearchBar.tsx (z-dropdown)
- MultiAirportSelector.tsx (z-dropdown)
- DealScoreBadge.tsx (z-maximum)
- ShareFlightModal.tsx (z-modal-backdrop)
- PhoneInput.tsx (z-dropdown)

## Key Rules

### ✅ DO
- Use semantic class names
- Pair backdrop with modal content
- Reference design system for new components
- Test z-index across responsive breakpoints

### ❌ DON'T
- Use arbitrary z-[N] values
- Mix different z-index systems
- Over-nest stacking contexts
- Use z-maximum for normal UI

## Support

Questions about z-index implementation? Reference:
- Semantic layer definitions in `/lib/design-system.ts`
- Troubleshooting guide in `/Z_INDEX_MIGRATION.md`
- Component examples in `/Z_INDEX_AUDIT_REPORT.md`

---

**Last Updated**: November 3, 2025
**Compatibility**: 100% backward compatible
**Production Ready**: Yes ✅
