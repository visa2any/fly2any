# Pull-to-Refresh Testing Guide

## Quick Start Testing

### Mobile Device Testing (iOS/Android)

1. **Open Results Page on Mobile**
   - Navigate to: `https://your-domain.com/flights/results?from=NYC&to=LAX&departure=2025-12-01`
   - Or: `https://your-domain.com/hotels/results?destination=Paris&checkIn=2025-12-01&checkOut=2025-12-05`

2. **Perform Pull Gesture**
   - Scroll to top of page (if not already there)
   - Pull down from the very top
   - Watch for blue (flights) or orange (hotels) indicator

3. **Expected Behavior**
   ```
   Pull 0-79px:
   - Blue/orange circle appears
   - Arrow rotates gradually
   - Text: "Pull to refresh"

   Pull 80px+:
   - Haptic vibration (10ms pulse)
   - Arrow fully rotated
   - Text: "Release to refresh"
   - Indicator expands

   Release:
   - Double haptic pulse (10ms, 50ms, 10ms)
   - Arrow → Spinner transition
   - Text: "Refreshing..."
   - Results reload

   Complete:
   - Spinner fades out
   - Indicator slides up
   - Fresh results displayed
   ```

---

## Detailed Test Cases

### Test Case 1: Basic Pull Gesture
**Preconditions:** User at top of page
**Steps:**
1. Place finger at center top of screen
2. Pull down 100px
3. Release

**Expected:**
- ✅ Indicator appears smoothly
- ✅ Haptic feedback at 80px
- ✅ Success haptic on release
- ✅ Results refresh
- ✅ Indicator disappears

**Actual:** _______________

---

### Test Case 2: Insufficient Pull
**Preconditions:** User at top of page
**Steps:**
1. Pull down 50px (below 80px threshold)
2. Release

**Expected:**
- ✅ Indicator appears
- ✅ NO haptic feedback
- ✅ Indicator snaps back
- ✅ NO refresh occurs

**Actual:** _______________

---

### Test Case 3: Mid-Page Prevention
**Preconditions:** User scrolled down 100px
**Steps:**
1. Attempt pull gesture

**Expected:**
- ✅ NO indicator appears
- ✅ Normal scroll behavior
- ✅ No refresh

**Actual:** _______________

---

### Test Case 4: Pull + Scroll Conflict
**Preconditions:** User at top of page
**Steps:**
1. Start pull gesture (40px)
2. Scroll down page
3. Return to top

**Expected:**
- ✅ Initial indicator appears
- ✅ Indicator disappears when scrolling
- ✅ No refresh occurs
- ✅ Normal scroll resumes

**Actual:** _______________

---

### Test Case 5: Double-Refresh Prevention
**Preconditions:** User at top of page
**Steps:**
1. Pull and trigger refresh
2. Immediately pull again while refreshing

**Expected:**
- ✅ First refresh proceeds
- ✅ Second pull has NO effect
- ✅ Indicator doesn't appear during refresh

**Actual:** _______________

---

### Test Case 6: Theme Colors (Flights)
**Preconditions:** On flights results page
**Steps:**
1. Perform pull gesture

**Expected:**
- ✅ Blue indicator background
- ✅ Blue spinner
- ✅ Blue text

**Actual:** _______________

---

### Test Case 7: Theme Colors (Hotels)
**Preconditions:** On hotels results page
**Steps:**
1. Perform pull gesture

**Expected:**
- ✅ Orange indicator background
- ✅ Orange spinner
- ✅ Orange text

**Actual:** _______________

---

### Test Case 8: Refresh Button (Keyboard Access)
**Preconditions:** Mobile device with keyboard
**Steps:**
1. Tab to "Refresh" button (bottom-right)
2. Press Enter or Space

**Expected:**
- ✅ Button receives focus
- ✅ Press triggers refresh
- ✅ Button disables during refresh
- ✅ Same behavior as pull gesture

**Actual:** _______________

---

### Test Case 9: Screen Reader Announcement
**Preconditions:** VoiceOver (iOS) or TalkBack (Android) enabled
**Steps:**
1. Perform pull-to-refresh

**Expected:**
- ✅ "Refreshing results..." announced
- ✅ Polite interruption (doesn't cut off current reading)

**Actual:** _______________

---

### Test Case 10: Landscape Orientation
**Preconditions:** Device in landscape mode
**Steps:**
1. Perform pull gesture

**Expected:**
- ✅ Works identically to portrait
- ✅ Indicator centered
- ✅ Same threshold (80px)

**Actual:** _______________

---

### Test Case 11: Network Error Handling
**Preconditions:** Enable airplane mode or throttle network
**Steps:**
1. Perform pull gesture
2. Wait for fetch to fail

**Expected:**
- ✅ Indicator shows "Refreshing..."
- ✅ Error state appears (as per existing error handling)
- ✅ Indicator disappears
- ✅ No crash

**Actual:** _______________

---

### Test Case 12: Route Change During Pull
**Preconditions:** User at top of page
**Steps:**
1. Start pull gesture (50px)
2. Navigate to different page (back button)

**Expected:**
- ✅ Gesture cancels cleanly
- ✅ No memory leaks
- ✅ No errors in console

**Actual:** _______________

---

### Test Case 13: Desktop Browser (Should NOT Work)
**Preconditions:** Desktop Chrome/Firefox/Safari
**Steps:**
1. Attempt pull gesture (if possible)

**Expected:**
- ✅ NO indicator appears
- ✅ NO refresh button appears
- ✅ Normal mouse scroll behavior

**Actual:** _______________

---

## Performance Testing

### FPS Measurement
```javascript
// Paste in browser console during pull gesture
let frameCount = 0;
let lastTime = performance.now();
let fpsValues = [];

function measureFPS() {
  frameCount++;
  const currentTime = performance.now();
  const delta = currentTime - lastTime;

  if (delta >= 1000) {
    const fps = (frameCount / delta) * 1000;
    fpsValues.push(fps);
    console.log(`FPS: ${fps.toFixed(2)}`);

    if (fpsValues.length >= 5) {
      const avgFps = fpsValues.reduce((a, b) => a + b) / fpsValues.length;
      console.log(`Average FPS: ${avgFps.toFixed(2)}`);
      return; // Stop after 5 seconds
    }

    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(measureFPS);
}

measureFPS();
```

**Target:** 60 FPS average
**Acceptable:** 55+ FPS
**Failure:** <50 FPS

**Result:** _______________ FPS

---

### Memory Leak Test
```javascript
// 1. Open Chrome DevTools → Memory tab
// 2. Take heap snapshot
// 3. Perform 10 pull-to-refresh cycles
// 4. Take another heap snapshot
// 5. Compare

// Expected: <100KB increase
// Actual: _______________ KB
```

---

## Cross-Browser Testing Matrix

| Browser | Version | Pull Works | Haptics | Visual | Pass/Fail |
|---------|---------|------------|---------|--------|-----------|
| iOS Safari | 16+ | ⬜ | ⬜ | ⬜ | ⬜ |
| iOS Safari | 14-15 | ⬜ | ⬜ | ⬜ | ⬜ |
| Chrome Android | 120+ | ⬜ | ⬜ | ⬜ | ⬜ |
| Chrome Android | 100-119 | ⬜ | ⬜ | ⬜ | ⬜ |
| Firefox Android | 120+ | ⬜ | ⬜ | ⬜ | ⬜ |
| Samsung Internet | 20+ | ⬜ | ⬜ | ⬜ | ⬜ |
| Chrome Desktop | ANY | ⬜ N/A | ⬜ N/A | ⬜ N/A | ⬜ |
| Safari Desktop | ANY | ⬜ N/A | ⬜ N/A | ⬜ N/A | ⬜ |

---

## Device Testing Matrix

| Device | OS | Screen Size | Pull Works | Haptics | Pass/Fail |
|--------|-----|-------------|------------|---------|-----------|
| iPhone 15 Pro | iOS 17 | 6.1" | ⬜ | ⬜ | ⬜ |
| iPhone 13 | iOS 16 | 6.1" | ⬜ | ⬜ | ⬜ |
| iPhone SE | iOS 15 | 4.7" | ⬜ | ⬜ | ⬜ |
| Samsung S24 | Android 14 | 6.2" | ⬜ | ⬜ | ⬜ |
| Google Pixel 8 | Android 14 | 6.2" | ⬜ | ⬜ | ⬜ |
| OnePlus 11 | Android 13 | 6.7" | ⬜ | ⬜ | ⬜ |
| iPad Pro | iOS 17 | 12.9" | ⬜ | ⬜ | ⬜ |
| iPad Mini | iOS 16 | 8.3" | ⬜ | ⬜ | ⬜ |

---

## Accessibility Testing Checklist

### Screen Readers
- [ ] VoiceOver (iOS) announces "Refreshing results..."
- [ ] TalkBack (Android) announces refresh
- [ ] NVDA (Windows) announces via ARIA live region
- [ ] JAWS (Windows) announces via ARIA live region

### Keyboard Navigation
- [ ] Tab reaches refresh button
- [ ] Enter triggers refresh
- [ ] Space triggers refresh
- [ ] Button shows focus indicator
- [ ] Disabled state is keyboard-accessible

### Switch Control (iOS)
- [ ] Can navigate to refresh button
- [ ] Can activate button
- [ ] Visual feedback on activation

### Voice Control
- [ ] "Tap Refresh" command works
- [ ] "Show labels" reveals button name

---

## Visual Regression Testing

### Screenshots to Capture

1. **Indicator at 0px (Hidden)**
   - File: `pull-0px-hidden.png`
   - Status: ⬜

2. **Indicator at 40px (Arrow 90° rotated)**
   - File: `pull-40px-arrow.png`
   - Status: ⬜

3. **Indicator at 80px (Arrow 180° rotated, "Release" text)**
   - File: `pull-80px-ready.png`
   - Status: ⬜

4. **Refreshing State (Spinner visible)**
   - File: `refreshing-spinner.png`
   - Status: ⬜

5. **Refresh Button (Bottom-right)**
   - File: `refresh-button.png`
   - Status: ⬜

6. **Desktop View (No indicators)**
   - File: `desktop-no-refresh.png`
   - Status: ⬜

---

## Edge Case Testing

### Edge Case 1: Very Fast Pull
**Steps:**
1. Quick flick gesture (< 100ms)
2. Distance: 150px+

**Expected:**
- ✅ Indicator appears instantly
- ✅ Capped at maxDistance (150px)
- ✅ Triggers refresh

**Actual:** _______________

---

### Edge Case 2: Very Slow Pull
**Steps:**
1. Extremely slow pull (5 seconds to reach 80px)

**Expected:**
- ✅ Indicator follows smoothly
- ✅ Arrow rotates proportionally
- ✅ Triggers refresh at 80px

**Actual:** _______________

---

### Edge Case 3: Multi-Touch
**Steps:**
1. Start pull with one finger
2. Add second finger mid-gesture

**Expected:**
- ✅ Gesture continues with first touch
- ✅ OR gesture cancels gracefully
- ✅ No crash or UI glitch

**Actual:** _______________

---

### Edge Case 4: Bounce Scroll
**Steps (iOS Safari):**
1. Scroll to top
2. Pull harder to trigger bounce
3. Release in bounce zone

**Expected:**
- ✅ Pull-to-refresh triggers
- ✅ OR native refresh triggers
- ✅ NOT both simultaneously

**Actual:** _______________

---

### Edge Case 5: Offline → Online
**Steps:**
1. Enable airplane mode
2. Pull to refresh (fails)
3. Disable airplane mode
4. Pull to refresh again

**Expected:**
- ✅ First refresh shows error
- ✅ Second refresh succeeds
- ✅ No cached error state

**Actual:** _______________

---

## Automated Test Scenarios

### Unit Test: Resistance Calculation
```typescript
test('calculatePullDistance applies resistance', () => {
  const { result } = renderHook(() => usePullToRefresh(jest.fn()));
  expect(result.current.calculatePullDistance(250)).toBe(100); // 250 / 2.5
});
```

### Unit Test: Threshold Detection
```typescript
test('triggers haptic at threshold', () => {
  const mockVibrate = jest.fn();
  navigator.vibrate = mockVibrate;

  // Simulate pull to 80px
  act(() => {
    fireEvent.touchMove(screen.getByRole('main'), {
      touches: [{ clientY: 80 }]
    });
  });

  expect(mockVibrate).toHaveBeenCalledWith(10);
});
```

### Integration Test: Refresh Flow
```typescript
test('refetches data on pull-to-refresh', async () => {
  const mockFetch = jest.fn().mockResolvedValue({ flights: [] });
  global.fetch = mockFetch;

  render(<FlightResults />);

  // Simulate pull gesture
  const main = screen.getByRole('main');
  fireEvent.touchStart(main, { touches: [{ clientY: 0 }] });
  fireEvent.touchMove(main, { touches: [{ clientY: 100 }] });
  fireEvent.touchEnd(main);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('/api/flights/search', ...);
  });
});
```

---

## Sign-Off

### QA Approval

**Tester Name:** _______________
**Date:** _______________

**Overall Result:**
- [ ] Pass - All tests passed
- [ ] Pass with Notes - Minor issues documented
- [ ] Fail - Major issues blocking release

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

**Signature:** _______________

---

## Known Issues Log

| Issue | Severity | Device/Browser | Status | Notes |
|-------|----------|----------------|--------|-------|
| Example: Haptics not working | Low | iPhone 12, iOS 15 | Expected | iOS 15 lacks Vibration API |
| | | | | |
| | | | | |

---

## Test Coverage Summary

### Critical Path (Must Pass)
- [ ] Basic pull gesture works on iOS Safari
- [ ] Basic pull gesture works on Chrome Android
- [ ] Refresh button works for keyboard users
- [ ] No activation on desktop browsers
- [ ] No scroll conflicts

### Important (Should Pass)
- [ ] Haptic feedback works (where supported)
- [ ] Visual animations smooth (60fps)
- [ ] Screen reader announcements
- [ ] Theme colors correct
- [ ] Error handling works

### Nice to Have (May Defer)
- [ ] Works on iOS 14
- [ ] Works on older Android browsers
- [ ] Perfect on all tablet sizes

---

*Testing started: _______________*
*Testing completed: _______________*
*Total issues found: _______________*
*Critical issues: _______________*
*Status: _______________*
