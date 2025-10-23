# Inline Flex Controls - Quick Reference

## Visual Before/After

### BEFORE ❌
```
┌─────────────────────────────────┐
│ Depart: Nov 14, 2025            │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Flexible Dates:  [-] ±3  [+]    │  ← Separate row (cluttered)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Trip Duration: [7 nights ▼]     │  ← Dropdown (limited options)
└─────────────────────────────────┘
```

### AFTER ✅
```
┌─────────────────────────────────────────┐
│ Depart: Nov 14, 2025  [- ±3 +]         │  ← Inline on same line!
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Duration: [- 7 + nights]                │  ← Editable stepper!
└─────────────────────────────────────────┘
```

---

## Implementation Pattern

### Pattern 1: Inline Flex Controls

```tsx
<div className="flex items-center gap-2">
  {/* Main Field (flex-1 = takes remaining space) */}
  <button className="flex-1 ...">
    Main content here
  </button>

  {/* Inline Controls (fixed width) */}
  <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 border">
    <button>−</button>
    <span>±3</span>
    <button>+</button>
  </div>
</div>
```

**Key Classes:**
- `flex-1` on main field = takes remaining space
- Fixed size controls on the right
- `gap-2` between field and controls
- `gap-1` within control group

### Pattern 2: Editable Stepper

```tsx
<div className="flex items-center gap-1 bg-white border rounded-lg px-2 py-3">
  <button>−</button>

  <input
    type="number"
    value={7}
    min={1}
    max={30}
    className="w-10 text-center bg-transparent border-0 outline-none"
  />

  <button>+</button>
  <span className="text-xs ml-1">nights</span>
</div>
```

**Key Classes:**
- `w-10` on input = fixed width for numbers
- `text-center` = centered number
- `bg-transparent` = blends with parent
- `border-0 outline-none` = clean input field

---

## Responsive Variants

### Desktop (lg and up)

```tsx
{/* Desktop only */}
<div className="hidden lg:flex items-center gap-2">
  {/* Inline controls with more space */}
  <button className="w-6 h-6">−</button>
  <span className="min-w-[32px]">±3</span>
  <button className="w-6 h-6">+</button>
</div>
```

### Mobile (below lg)

```tsx
{/* Mobile only */}
<div className="lg:hidden flex items-center gap-2">
  {/* Slightly larger for touch */}
  <button className="w-7 h-7">−</button>
  <span className="min-w-[28px]">±3</span>
  <button className="w-7 h-7">+</button>
</div>
```

---

## State Management

### Flex Days State (0-5)

```tsx
const [departureFlex, setDepartureFlex] = useState(0);

// Decrease (with min limit)
onClick={() => setDepartureFlex(Math.max(0, departureFlex - 1))}

// Increase (with max limit)
onClick={() => setDepartureFlex(Math.min(5, departureFlex + 1))}

// Display text
{departureFlex === 0 ? 'Exact' : `±${departureFlex}`}
```

### Trip Duration State (1-30)

```tsx
const [tripDuration, setTripDuration] = useState(7);

// Decrease (with min limit)
onClick={() => setTripDuration(Math.max(1, tripDuration - 1))}

// Increase (with max limit)
onClick={() => setTripDuration(Math.min(30, tripDuration + 1))}

// Editable input
onChange={(e) => {
  const val = parseInt(e.target.value);
  if (!isNaN(val) && val >= 1 && val <= 30) {
    setTripDuration(val);
  }
}}
```

---

## Accessibility

### Required Attributes

```tsx
<button
  type="button"
  aria-label="Increase flex days"
  disabled={departureFlex === 5}
  className="... disabled:opacity-30 disabled:cursor-not-allowed"
>
  +
</button>

<input
  type="number"
  aria-label="Trip duration"
  min="1"
  max="30"
/>
```

### Disabled States

- **Visual**: `disabled:opacity-30`
- **Cursor**: `disabled:cursor-not-allowed`
- **Functionality**: `disabled={value === max}`

---

## Color & Hover States

### Default Colors

```css
bg-gray-50          /* Light gray background */
border-gray-200     /* Light gray border */
text-gray-700       /* Dark gray text */
```

### Hover States

```css
hover:bg-white           /* Brighten on hover */
hover:text-[#0087FF]     /* Blue accent on hover */
hover:border-[#0087FF]   /* Blue border on hover */
```

### Active/Selected

```css
bg-white                 /* White background */
text-[#0087FF]          /* Blue text */
border-[#0087FF]        /* Blue border */
```

---

## Common Pitfalls & Solutions

### ❌ Problem: Controls overflow on mobile
```tsx
// Wrong - fixed width too large
<div className="w-40">...</div>
```

✅ **Solution: Use flexible widths**
```tsx
<div className="flex-1">...</div>
```

### ❌ Problem: Number input too wide
```tsx
// Wrong - flex-1 makes it expand
<input className="flex-1" />
```

✅ **Solution: Fixed width**
```tsx
<input className="w-10 text-center" />
```

### ❌ Problem: Buttons don't align vertically
```tsx
// Wrong - no alignment
<div className="flex">
```

✅ **Solution: Center items**
```tsx
<div className="flex items-center">
```

---

## Testing Checklist

### Desktop
- [ ] Date field takes available space (flex-1)
- [ ] Controls stay on same line
- [ ] +/- buttons work
- [ ] Text updates correctly
- [ ] Min/max limits enforced

### Mobile
- [ ] Controls fit within viewport
- [ ] Touch targets adequate size (w-7 h-7)
- [ ] Abbreviations used ("Ex" vs "Exact")
- [ ] No horizontal scroll

### Edge Cases
- [ ] At minimum value (0 or 1)
- [ ] At maximum value (5 or 30)
- [ ] Typing invalid numbers
- [ ] Empty input field

---

## Browser Support

✅ **All modern browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

**Key features used:**
- Flexbox (universal support)
- CSS Grid (universal support)
- Number input (universal support)
- Hover states (desktop only, gracefully degrades)

---

## Performance Notes

**Optimizations:**
- No re-renders on hover (pure CSS)
- State updates are batched
- No external dependencies
- Minimal DOM nodes

**Bundle size impact:**
- Zero (no new dependencies)
- Reduced HTML (removed dropdown options)
- Net negative impact on bundle size ✅

---

## Quick Copy-Paste Snippets

### Inline Flex Controls (Copy-Ready)

```tsx
{/* Inline Flex Controls */}
<div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
  <button
    type="button"
    onClick={() => setValue(Math.max(0, value - 1))}
    disabled={value === 0}
    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:text-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
  >
    −
  </button>
  <span className="text-xs font-semibold text-gray-700 min-w-[32px] text-center">
    {value === 0 ? 'Exact' : `±${value}`}
  </span>
  <button
    type="button"
    onClick={() => setValue(Math.min(5, value + 1))}
    disabled={value === 5}
    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white hover:text-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
  >
    +
  </button>
</div>
```

### Editable Stepper (Copy-Ready)

```tsx
{/* Editable Stepper */}
<div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-3 hover:border-[#0087FF] transition-all">
  <button
    type="button"
    onClick={() => setValue(Math.max(1, value - 1))}
    disabled={value <= 1}
    className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50 hover:text-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
  >
    −
  </button>
  <input
    type="number"
    value={value}
    onChange={(e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val >= 1 && val <= 30) {
        setValue(val);
      }
    }}
    min="1"
    max="30"
    className="w-10 text-center text-sm font-semibold text-gray-900 border-0 outline-none bg-transparent"
  />
  <button
    type="button"
    onClick={() => setValue(Math.min(30, value + 1))}
    disabled={value >= 30}
    className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50 hover:text-[#0087FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
  >
    +
  </button>
  <span className="text-xs text-gray-600 ml-1">nights</span>
</div>
```

---

**Last Updated:** October 19, 2025
**Status:** Production Ready ✅
