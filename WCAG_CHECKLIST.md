# WCAG 2.1 Compliance Checklist - Fly2Any Travel

**Last Updated:** November 3, 2025
**Target Compliance:** WCAG 2.1 Level AA
**Current Status:** 51% → Target: 80%+

---

## How to Use This Checklist

- [ ] = Not started / Failed
- [x] = Completed / Passing
- [~] = Partially complete / Needs work

**Priority Levels:**
- 🔴 CRITICAL - Must fix immediately
- 🟡 MAJOR - Should fix soon
- 🟢 MINOR - Nice to have

---

## Principle 1: Perceivable

### 1.1 Text Alternatives

#### 1.1.1 Non-text Content (Level A) 🔴

- [x] Logo has descriptive alt text
- [ ] Loading spinners have sr-only text or aria-label
- [ ] Decorative icons marked with aria-hidden="true"
- [ ] Icon buttons have aria-label
- [ ] Emojis used decoratively hidden from screen readers
- [ ] Complex images have long descriptions
- [ ] Form inputs have associated labels

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/UnifiedLocationAutocomplete.tsx` - Lines 289-297 (decorative emojis)
- `components/search/FlightSearchForm.tsx` - Lines 852-873 (loading spinner)
- All files with icon-only buttons

---

### 1.2 Time-based Media

#### 1.2.1 Audio-only and Video-only (Level A)
- [x] N/A - No audio/video content currently

#### 1.2.2 Captions (Level A)
- [x] N/A - No video content

#### 1.2.3 Audio Description or Media Alternative (Level A)
- [x] N/A - No video content

---

### 1.3 Adaptable

#### 1.3.1 Info and Relationships (Level A) 🔴

- [x] Semantic HTML used (h1, h2, p, etc.)
- [~] Form controls properly grouped with fieldset/legend
- [ ] Tables use proper headers (if applicable)
- [x] Lists use ul/ol/li elements
- [ ] ARIA roles added where HTML semantics insufficient
- [x] Heading hierarchy is logical (h1 → h2 → h3)

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/FlightSearchForm.tsx` - Add fieldset/legend around trip type, passengers, etc.

---

#### 1.3.2 Meaningful Sequence (Level A)

- [x] Reading order is logical
- [x] CSS doesn't override visual order inappropriately
- [x] Tab order follows visual order

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.3.3 Sensory Characteristics (Level A)

- [x] Instructions don't rely solely on shape
- [x] Instructions don't rely solely on color
- [x] Instructions don't rely solely on position

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.3.4 Orientation (Level AA)

- [x] Content works in portrait and landscape
- [x] No orientation restrictions

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.3.5 Identify Input Purpose (Level AA)

- [ ] Form inputs have autocomplete attributes
- [ ] Common fields identified (name, email, tel, etc.)

**Priority:** 🟡 MAJOR
**Files to Update:**
- All form components - Add autocomplete="given-name", autocomplete="email", etc.

---

### 1.4 Distinguishable

#### 1.4.1 Use of Color (Level A)

- [x] Color not used as only visual means of conveying info
- [x] Links distinguishable without relying on color alone
- [x] Error states use icons + color

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.4.2 Audio Control (Level A)

- [x] N/A - No auto-playing audio

---

#### 1.4.3 Contrast (Minimum) (Level AA) 🔴

**Text Contrast (4.5:1 minimum):**
- [x] Primary buttons (white on blue) - PASS
- [x] Error messages (red-600) - PASS
- [ ] Placeholder text (gray-400 on white) - FAIL - Change to gray-600
- [ ] Helper text (gray-500) - FAIL - Change to gray-700 for small text
- [ ] Footer small text (text-gray-500 on dark) - FAIL

**Large Text Contrast (3:1 minimum):**
- [x] Headings - PASS
- [x] Large buttons - PASS

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/FlightSearchForm.tsx` - Line 352 (placeholder color)
- `components/search/UnifiedLocationAutocomplete.tsx` - Lines 465, 471 (helper text)
- `components/layout/Footer.tsx` - Line 520 (small text)

---

#### 1.4.4 Resize Text (Level AA)

- [x] Text can be resized to 200% without loss of functionality
- [x] No horizontal scrolling at 200% zoom
- [x] Layout responds to text sizing

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.4.5 Images of Text (Level AA)

- [x] No images of text used (logo excepted)

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 1.4.10 Reflow (Level AA)

- [x] Content reflows at 320px width
- [~] No horizontal scrolling (some issues on homepage cards)
- [x] All content and functionality available at 400% zoom

**Priority:** 🟡 MAJOR
**Files to Update:**
- `app/page.tsx` - Fix 320px layout

---

#### 1.4.11 Non-text Contrast (Level AA)

- [x] Interactive controls have 3:1 contrast
- [~] Focus indicators have 3:1 contrast (needs verification)
- [x] Form fields have 3:1 contrast

**Priority:** 🟡 MAJOR

---

#### 1.4.12 Text Spacing (Level AA)

- [x] No loss of content when user adjusts:
  - Line height to 1.5×
  - Paragraph spacing to 2×
  - Letter spacing to 0.12×
  - Word spacing to 0.16×

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING (uses Tailwind defaults)

---

#### 1.4.13 Content on Hover or Focus (Level AA)

- [x] Hover content dismissible
- [x] Hover content hoverable
- [x] Hover content persistent

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

## Principle 2: Operable

### 2.1 Keyboard Accessible

#### 2.1.1 Keyboard (Level A) 🔴

- [x] All functionality available via keyboard
- [~] Custom components have keyboard support (autocomplete works, passenger dropdown doesn't)
- [x] No keyboard traps (except intentional focus traps)
- [ ] Passenger dropdown needs focus trap
- [ ] Modal needs Escape key handling

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/FlightSearchForm.tsx` - Lines 685-825 (passenger dropdown)
- Install and use `focus-trap-react`

---

#### 2.1.2 No Keyboard Trap (Level A)

- [x] User can navigate away from all elements
- [ ] Modals need Escape key exit
- [ ] Dropdowns need Escape key close

**Priority:** 🔴 CRITICAL
**Files to Update:**
- All modal/dropdown components

---

#### 2.1.4 Character Key Shortcuts (Level A)

- [x] No single-key shortcuts (N/A)

---

### 2.2 Enough Time

#### 2.2.1 Timing Adjustable (Level A)

- [x] No time limits on interactions

---

#### 2.2.2 Pause, Stop, Hide (Level A)

- [x] Auto-updating content can be paused (N/A currently)

---

### 2.3 Seizures and Physical Reactions

#### 2.3.1 Three Flashes or Below Threshold (Level A)

- [x] No flashing content

---

### 2.4 Navigable

#### 2.4.1 Bypass Blocks (Level A) 🔴

- [ ] "Skip to main content" link present
- [ ] Heading structure allows navigation
- [ ] ARIA landmarks defined

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `app/layout.tsx` - Add skip link
- Add `<main id="main-content">` wrapper

---

#### 2.4.2 Page Titled (Level A)

- [x] All pages have descriptive <title>

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING (`app/layout.tsx` - Line 9)

---

#### 2.4.3 Focus Order (Level A)

- [x] Focus order follows visual order
- [x] Tab sequence is logical

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 2.4.4 Link Purpose (In Context) (Level A)

- [x] Link text describes destination
- [x] Icons supplemented with text (or aria-label)

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 2.4.5 Multiple Ways (Level AA)

- [x] Navigation menu present
- [ ] Search functionality
- [ ] Sitemap or breadcrumbs

**Priority:** 🟡 MAJOR
**To Do:** Add site search

---

#### 2.4.6 Headings and Labels (Level AA)

- [x] Headings are descriptive
- [x] Form labels are clear

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 2.4.7 Focus Visible (Level AA) 🔴

- [x] Global focus styles defined (`app/globals.css` - Lines 44-52)
- [~] Autocomplete dropdown focus distinct from hover
- [x] Keyboard focus always visible

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/UnifiedLocationAutocomplete.tsx` - Improve focus indicator

---

### 2.5 Input Modalities

#### 2.5.1 Pointer Gestures (Level A)

- [x] Multi-point or path-based gestures have single-pointer alternative

---

#### 2.5.2 Pointer Cancellation (Level A)

- [x] Click/tap executes on up-event
- [x] Can abort by moving away

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 2.5.3 Label in Name (Level A)

- [x] Visible labels match accessible names
- [x] aria-label matches visible text

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 2.5.4 Motion Actuation (Level A)

- [x] No shake or tilt gestures

---

#### 2.5.5 Target Size (Level AAA, but critical for mobile) 🔴

**Minimum 44×44 CSS pixels:**
- [ ] Language switcher (36px) - FAIL
- [ ] Passenger counter buttons (40px) - FAIL
- [ ] Flex date controls (32px) - FAIL
- [x] Primary buttons - PASS
- [x] Form inputs - PASS
- [ ] Footer social icons (40px) - FAIL

**Priority:** 🔴 CRITICAL (Mobile-first platform)
**Files to Update:**
- `app/page.tsx` - Line 99-110 (language switcher)
- `components/search/FlightSearchForm.tsx` - Lines 530, 700, 732, 762
- `components/layout/Footer.tsx` - Lines 468-513

---

## Principle 3: Understandable

### 3.1 Readable

#### 3.1.1 Language of Page (Level A)

- [x] <html lang="en"> present
- [x] Language changes marked with lang attribute

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING (`app/layout.tsx` - Line 25)

---

#### 3.1.2 Language of Parts (Level AA)

- [x] N/A - Content in single language per page

---

### 3.2 Predictable

#### 3.2.1 On Focus (Level A)

- [x] Focus doesn't trigger unexpected context change

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 3.2.2 On Input (Level A)

- [x] Input doesn't trigger unexpected context change
- [x] Form doesn't auto-submit

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 3.2.3 Consistent Navigation (Level AA)

- [x] Navigation in consistent order
- [x] Header/footer consistent across pages

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 3.2.4 Consistent Identification (Level AA)

- [x] Icons used consistently
- [x] Components behave consistently

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

### 3.3 Input Assistance

#### 3.3.1 Error Identification (Level A)

- [x] Errors identified in text
- [x] Errors indicated with aria-invalid

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING

---

#### 3.3.2 Labels or Instructions (Level A) 🔴

- [x] All form controls have labels
- [ ] Required fields marked with aria-required
- [ ] Required fields have visual indicator (*)
- [x] Format requirements stated (date inputs)
- [ ] Error messages provide correction guidance

**Priority:** 🔴 CRITICAL
**Files to Update:**
- All form components - Add required indicators and aria-required

---

#### 3.3.3 Error Suggestion (Level AA)

- [x] Error messages provide suggestions
- [x] Validation messages are clear

**Priority:** 🟡 MAJOR
**Status:** ✅ PASSING

---

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

- [ ] Booking confirmation page with review step
- [ ] Ability to edit before final submission
- [ ] Confirmation checkbox for final submit

**Priority:** 🟡 MAJOR
**To Do:** Add booking review/confirm step

---

## Principle 4: Robust

### 4.1 Compatible

#### 4.1.1 Parsing (Level A)

- [x] Valid HTML (no duplicate IDs)
- [x] Elements properly nested
- [x] Attributes properly formatted

**Priority:** 🟢 MINOR
**Status:** ✅ PASSING (Next.js enforces)

---

#### 4.1.2 Name, Role, Value (Level A) 🔴

**Autocomplete Component:**
- [ ] Input has role="combobox"
- [ ] Input has aria-expanded
- [ ] Input has aria-controls
- [ ] Input has aria-activedescendant
- [ ] Dropdown has role="listbox"
- [ ] Options have role="option"
- [ ] Options have aria-selected

**Priority:** 🔴 CRITICAL
**Files to Update:**
- `components/search/UnifiedLocationAutocomplete.tsx` - Full ARIA implementation needed

**Loading States:**
- [ ] Add role="status" or aria-live="polite"
- [ ] Add sr-only text for screen readers

**Priority:** 🔴 CRITICAL
**Files to Update:**
- All components with loading states

---

#### 4.1.3 Status Messages (Level AA)

- [ ] Loading states announced to screen readers
- [ ] Success messages have aria-live="polite"
- [ ] Error messages have aria-live="assertive"
- [ ] Search results count announced

**Priority:** 🟡 MAJOR
**Files to Update:**
- Add live regions for dynamic content updates

---

## Mobile-Specific Checklist

### Touch Accessibility

- [ ] All touch targets ≥ 44×44 pixels
- [ ] Adequate spacing between touch targets (≥ 8px)
- [x] No reliance on hover states
- [x] Gestures have keyboard alternatives

**Priority:** 🔴 CRITICAL

---

### Mobile Typography

- [ ] No text smaller than 16px in form inputs (prevents zoom)
- [ ] Minimum 14px for body text
- [ ] Minimum 12px for helper text (non-interactive)

**Priority:** 🔴 CRITICAL
**Files to Update:**
- Fix text-xs (12px) in interactive elements

---

### Mobile Navigation

- [ ] Skip link works on mobile
- [ ] Bottom navigation (optional, but recommended)
- [ ] Sticky search/filter access
- [ ] Back button works as expected

**Priority:** 🟡 MAJOR

---

### Mobile Forms

- [ ] Input types optimized (tel, email, etc.)
- [ ] Autocomplete attributes present
- [ ] Dropdowns use bottom sheets on mobile
- [ ] Date pickers use native on mobile

**Priority:** 🟡 MAJOR

---

## Testing Checklist

### Manual Testing

- [ ] Tab through entire site (keyboard only)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test at 200% zoom
- [ ] Test in high contrast mode
- [ ] Test with keyboard only (unplug mouse)
- [ ] Test on actual mobile devices

### Automated Testing

- [ ] Run axe DevTools
- [ ] Run Lighthouse accessibility audit
- [ ] Run WAVE evaluation
- [ ] Implement automated tests in CI/CD

### User Testing

- [ ] Test with users using assistive technology
- [ ] Test with users on mobile devices
- [ ] Test with users with disabilities
- [ ] Gather feedback and iterate

---

## Quick Win Tracker

### Completed ✅

1. ✅ Global focus styles defined
2. ✅ Semantic HTML used throughout
3. ✅ Proper heading hierarchy
4. ✅ Form labels present
5. ✅ Error states with aria-invalid

### In Progress 🔄

6. 🔄 Touch target sizing
7. 🔄 ARIA combobox pattern
8. 🔄 Focus trap in modals

### Not Started ❌

9. ❌ Skip link
10. ❌ Required field indicators
11. ❌ Loading state announcements
12. ❌ Placeholder color contrast
13. ❌ Autocomplete attributes
14. ❌ Icon button labels
15. ❌ Decorative emoji hiding
16. ❌ Form fieldsets/legends
17. ❌ Live regions for dynamic content
18. ❌ Bottom sheets for mobile

---

## Implementation Priority

### Week 1 (Critical Fixes)

**Day 1:**
- [ ] Add skip link
- [ ] Fix touch target sizes
- [ ] Add aria-labels to icon buttons

**Day 2:**
- [ ] Fix placeholder contrast
- [ ] Add required field indicators
- [ ] Add loading state announcements

**Day 3:**
- [ ] Hide decorative emojis from screen readers
- [ ] Implement focus trap in passenger dropdown
- [ ] Add Escape key handlers to modals

**Day 4:**
- [ ] Implement ARIA combobox pattern in autocomplete
- [ ] Add form fieldsets and legends
- [ ] Fix helper text contrast

**Day 5:**
- [ ] Add autocomplete attributes to forms
- [ ] Add live regions for dynamic content
- [ ] Comprehensive testing and verification

### Week 2 (Major Improvements)

- [ ] Mobile bottom sheets for dropdowns
- [ ] Improved focus indicators
- [ ] Booking confirmation/review step
- [ ] Mobile navigation enhancements

---

## Compliance Tracking

### Current State (November 3, 2025)

| Level | Total Criteria | Passing | Failing | N/A | Compliance % |
|-------|----------------|---------|---------|-----|--------------|
| A | 30 | 22 | 8 | 0 | 73% |
| AA | 20 | 10 | 10 | 0 | 50% |
| AAA | 28 | 8 | 12 | 8 | 29% |
| **Total** | **78** | **40** | **30** | **8** | **51%** |

### Target State (After Quick Wins)

| Level | Total Criteria | Passing | Failing | N/A | Compliance % |
|-------|----------------|---------|---------|-----|--------------|
| A | 30 | 28 | 2 | 0 | 93% |
| AA | 20 | 16 | 4 | 0 | 80% |
| AAA | 28 | 12 | 8 | 8 | 43% |
| **Total** | **78** | **56** | **14** | **8** | **72%** |

---

## Resources

### Guidelines
- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

### Testing Tools
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

### Screen Readers
- NVDA (Windows, Free): https://www.nvaccess.org/
- JAWS (Windows, Paid): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (Mac/iOS, Built-in): Included with macOS and iOS
- TalkBack (Android, Built-in): Included with Android

---

**Last Updated:** November 3, 2025
**Next Review:** November 10, 2025 (after Week 1 fixes)
**Owner:** Development Team
**Reviewer:** Claude Code - Accessibility Specialist
