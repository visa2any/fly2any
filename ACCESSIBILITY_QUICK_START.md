# Accessibility Quick Start Guide

## TL;DR
This project is **WCAG AA compliant**. Follow these guidelines when adding new features.

---

## Quick Checklist

### Before Committing Code
- [ ] All buttons have aria-label or visible text
- [ ] Interactive elements are ≥44x44px
- [ ] Color contrast ratio ≥4.5:1 for text
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Modals use FocusTrap
- [ ] Screen reader announcements for dynamic content

---

## Common Patterns

### 1. Buttons

✅ **Good:**
```tsx
<button
  onClick={handleClick}
  aria-label="Close modal"
  className="min-w-[44px] min-h-[44px] p-2 focus:ring-2 focus:ring-primary-500"
>
  <X className="w-4 h-4" />
</button>
```

❌ **Bad:**
```tsx
<button onClick={handleClick}>
  <X />
</button>
```

**Why:** No aria-label, too small, no focus indicator

---

### 2. Modals

✅ **Good:**
```tsx
import FocusTrap from 'focus-trap-react';

<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <FocusTrap>
    <div>
      <h2 id="modal-title">Modal Title</h2>
      <button aria-label="Close">×</button>
    </div>
  </FocusTrap>
</div>
```

**Features:**
- Focus trap keeps keyboard users inside modal
- Escape key closes modal
- Background scroll locked
- Title linked via aria-labelledby

---

### 3. Forms

✅ **Good:**
```tsx
<label htmlFor="email">
  Email Address
  <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email
  </div>
)}
```

**Features:**
- Label linked to input via htmlFor
- Error announced by screen reader
- Required field indicated

---

### 4. Screen Reader Announcements

✅ **Good:**
```tsx
import { screenReader } from '@/lib/accessibility';

// Announce results
screenReader.announce(`${count} flights found`, 'polite');

// Or use live region directly
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {flights.length} flights found
</div>
```

**When to use:**
- Search results loaded
- Filters applied
- Items added/removed
- Success/error messages

---

### 5. Color Contrast

Use the pre-approved accessible colors:

```tsx
import { accessibleColors } from '@/lib/accessibility';

// Text on white background
<p className="text-[#374151]">Primary text</p> {/* 10.76:1 */}
<a className="text-[#0070DB]">Link text</a> {/* 4.53:1 */}

// Badges
<span className="bg-[#D1FAE5] text-[#065F46]">Success</span> {/* 9.25:1 */}
<span className="bg-[#FEF3C7] text-[#92400E]">Warning</span> {/* 9.73:1 */}
```

**Test your colors:**
```typescript
import { hasAccessibleContrast } from '@/lib/accessibility';

const isAccessible = hasAccessibleContrast('#FFFFFF', '#0070DB');
// Returns: true (ratio = 4.53:1)
```

---

### 6. Keyboard Navigation

```tsx
// Card with keyboard support
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleExpand();
    }
    if (e.key === 'Escape') {
      handleCollapse();
    }
  }}
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  Content
</div>
```

**Standard keys:**
- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons/links
- **Escape**: Close modals/dialogs
- **Arrow keys**: Navigate lists

---

### 7. Touch Targets

```tsx
import { touchTarget } from '@/lib/accessibility';

// Automatic sizing
<button className={touchTarget.getClasses('medium')}>
  Click me
</button>

// Or manual
<button className="min-w-[44px] min-h-[44px]">
  Click me
</button>
```

**Sizes:**
- `small`: 44x44px (minimum)
- `medium`: 48x48px (recommended)
- `large`: 56x56px (preferred)

---

## Testing Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox) - Automated testing
- **WAVE** (Chrome/Firefox) - Visual feedback
- **Lighthouse** (Chrome) - Overall audit

### Screen Readers
- **NVDA** (Windows) - Free
- **JAWS** (Windows) - Paid
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

### Quick Test Commands

**Run axe audit:**
```javascript
// In browser console
axe.run(document, (err, results) => {
  console.log(results.violations);
});
```

**Lighthouse:**
```bash
# Command line
lighthouse https://localhost:3000 --view

# Or use Chrome DevTools > Lighthouse
```

---

## Common Mistakes to Avoid

### ❌ Don't do this:

```tsx
// Missing alt text
<img src="/logo.png" />

// Div as button
<div onClick={handleClick}>Click</div>

// Poor contrast
<p className="text-gray-400 bg-gray-100">Text</p>

// No keyboard support
<div onClick={handleClick}>Clickable</div>

// Tiny touch targets
<button className="p-0.5">×</button>

// Generic link text
<a href="/more">Read more</a>
```

### ✅ Do this instead:

```tsx
// With alt text
<img src="/logo.png" alt="Fly2Any Logo" />

// Proper button
<button onClick={handleClick}>Click</button>

// Good contrast
<p className="text-gray-700 bg-white">Text</p>

// With keyboard
<button onClick={handleClick}>Clickable</button>

// Proper touch target
<button className="min-w-[44px] min-h-[44px] p-2">×</button>

// Descriptive link
<a href="/more" aria-label="Read more about flights to Paris">
  Read more
</a>
```

---

## Resources

### Documentation
- [Full Accessibility Compliance Report](./ACCESSIBILITY_COMPLIANCE.md)
- [lib/accessibility.ts](./lib/accessibility.ts) - Utility functions

### External Links
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project](https://www.a11yproject.com/)

---

## Getting Help

1. Check [ACCESSIBILITY_COMPLIANCE.md](./ACCESSIBILITY_COMPLIANCE.md) for detailed guidelines
2. Use accessibility utility functions in `lib/accessibility.ts`
3. Run automated tests before committing
4. Ask for accessibility review in PRs

**Remember:** Accessibility isn't optional—it's a legal requirement and the right thing to do.
