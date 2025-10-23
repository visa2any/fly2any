# 🎨 DETAILED VISUAL MOCKUP - INLINE FARE BADGES INTEGRATION

**Date:** October 22, 2025
**Status:** AWAITING USER AUTHORIZATION
**Purpose:** Show exact visual layout of fare policy badges merged into inline flight summaries

---

## 📊 COMPLETE VISUAL COMPARISON

### CURRENT STRUCTURE (Before Integration):

```
┌────────────────────────────────────────────────────────────────────────┐
│ EXPANDED FLIGHT CARD                                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ✈️ OUTBOUND: JFK → LAX                                                 │
│ 10:00 ────6h 19m Direct───→ 13:19                                      │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Flight Details (when expanded):                                  │   │
│ │                                                                   │   │
│ │ ✈️ Frontier Airlines 4817 • 32Q                                  │   │
│ │ Terminals: JFK → TN                                              │   │
│ │ 📶 WiFi  🔌 Power  🍽️ Meals                                     │   │
│ │                                                                   │   │
│ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │   │
│ │ ┃ 🔵 INLINE FLIGHT SUMMARY (Blue gradient bg)              ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 1: Airline Quality + Fare Type                        ┃   │   │
│ │ ┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 LIGHT                        ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 2: Baggage Allowances                                 ┃   │   │
│ │ ┃ 🎒 Personal only (10kg)  💼 Not included                 ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 3: Amenities                                          ┃   │   │
│ │ ┃ 📶 WiFi ❌  🔌 Power ❌  🍽️ None  💺 Seat: Extra fee    ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 4: Restrictions (if Basic/Light)                      ┃   │   │
│ │ ┃ ⚠️ RESTRICTIONS: No carry-on. No seat selection...       ┃   │   │
│ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│ 💰 PRICE BREAKDOWN                                                      │
│ Base fare: $434  Taxes & fees: $73                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━                                              │
│ TOTAL: $507                                                             │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│ ⚠️ FARE POLICIES: ✓ From Airline          ← SEPARATE SECTION (60px)   │
│ ┌───────────────────────────────────────────────────────────────┐     │
│ │ ❌ Non-refundable  ❌ No changes                              │     │
│ │ 💺 Seat fee applies  🛡️ 24hr DOT protection                  │     │
│ └───────────────────────────────────────────────────────────────┘     │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│ 📋 Refund & Change Policies (Click to load API)                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘

❌ PROBLEM: Fare policy badges in SEPARATE section adds 60px height
```

---

### PROPOSED STRUCTURE (After Integration):

```
┌────────────────────────────────────────────────────────────────────────┐
│ EXPANDED FLIGHT CARD                                                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ✈️ OUTBOUND: JFK → LAX                                                 │
│ 10:00 ────6h 19m Direct───→ 13:19                                      │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ Flight Details (when expanded):                                  │   │
│ │                                                                   │   │
│ │ ✈️ Frontier Airlines 4817 • 32Q                                  │   │
│ │ Terminals: JFK → TN                                              │   │
│ │ 📶 WiFi  🔌 Power  🍽️ Meals                                     │   │
│ │                                                                   │   │
│ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │   │
│ │ ┃ 🔵 INLINE FLIGHT SUMMARY (Blue gradient bg)              ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 1: Airline Quality + Fare Type                        ┃   │   │
│ │ ┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 LIGHT                        ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 2: Baggage Allowances                                 ┃   │   │
│ │ ┃ 🎒 Personal only (10kg)  💼 Not included                 ┃   │   │
│ │ ┠───────────────────────────────────────────────────────────┨   │   │
│ │ ┃ Row 3: Amenities                                          ┃   │   │
│ │ ┃ 📶 WiFi ❌  🔌 Power ❌  🍽️ None  💺 Seat: Extra fee    ┃   │   │
│ │ ┠═══════════════════════════════════════════════════════════┨   │   │
│ │ ┃ Row 4: FARE POLICIES (NEW - merged from API!) 🆕         ┃   │   │
│ │ ┃ [❌ Non-refundable] [❌ No changes] [🛡️ 24hr grace]     ┃   │   │
│ │ ┠═══════════════════════════════════════════════════════════┨   │   │
│ │ ┃ Row 5: Restrictions (if Basic/Light)                      ┃   │   │
│ │ ┃ ⚠️ RESTRICTIONS: No carry-on. No seat selection...       ┃   │   │
│ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│ 💰 PRICE BREAKDOWN                                                      │
│ Base fare: $434  Taxes & fees: $73                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━                                              │
│ TOTAL: $507                                                             │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════    │
│                                                                         │
│ 📋 Refund & Change Policies (Click to load API)                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘

✅ SOLUTION: Fare policy badges INSIDE inline summary (no added height!)
```

---

## 🔍 DETAILED ROW-BY-ROW BREAKDOWN

### ROW 1: AIRLINE QUALITY + FARE TYPE
```
┌─────────────────────────────────────────────────────────────┐
│ Font: 12px semibold  |  Gap: 12px (gap-x-3)                 │
├─────────────────────────────────────────────────────────────┤
│ ⭐ 3.5★  •  ⏰ On-time: 75%  •  🎫 LIGHT                     │
│ ↑       ↑   ↑              ↑   ↑                            │
│ Star    Rating  Clock    Perf  Fare Type (purple bold)      │
└─────────────────────────────────────────────────────────────┘
Style: text-xs font-semibold mb-1.5
Color: Default text-gray-700, purple-700 for fare type
```

### ROW 2: BAGGAGE ALLOWANCES
```
┌─────────────────────────────────────────────────────────────┐
│ Font: 12px  |  Gap: 12px (gap-x-3)                          │
├─────────────────────────────────────────────────────────────┤
│ 🎒 Personal only (10kg)  •  💼 Not included                 │
│ ↑                        ↑  ↑                               │
│ Backpack emoji           Briefcase  Status                  │
│ Green if included        Red if 0 bags                      │
└─────────────────────────────────────────────────────────────┘
Style: text-xs mb-1.5
Color: Green (text-green-700 font-semibold) if included
       Gray (text-gray-500) if not included
```

### ROW 3: AMENITIES
```
┌─────────────────────────────────────────────────────────────┐
│ Font: 11px  |  Gap: 10px (gap-x-2.5)                        │
├─────────────────────────────────────────────────────────────┤
│ 📶 WiFi ❌  •  🔌 Power ❌  •  🍽️ None  •  💺 Seat: Extra fee│
│ ↑       ↑      ↑        ↑      ↑            ↑               │
│ Icon    Status  Icon    Status  Meal type   Seat info       │
└─────────────────────────────────────────────────────────────┘
Style: text-[11px] (no mb, flows to next row)
Color: Green (text-green-600 font-semibold) if available
       Gray (text-gray-500) if not available
       Orange (text-orange-600 font-semibold) for seat fees
```

### ROW 4: FARE POLICIES (🆕 NEW - MERGED!)
```
┌─────────────────────────────────────────────────────────────┐
│ Border-top separator: border-t border-blue-200              │
│ Padding-top: pt-1.5  |  Margin-top: mt-1.5                  │
│ Font: 11px semibold  |  Gap: 6px (gap-1.5)                  │
├─────────────────────────────────────────────────────────────┤
│ ONLY SHOWN IF fareRules LOADED FROM API!                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [❌ Non-refundable]  [❌ No changes]  [🛡️ 24hr grace]      │
│  ↑                    ↑                ↑                     │
│  Red badge            Red badge        Blue badge           │
│  bg-red-100           bg-red-100       bg-blue-100          │
│  text-red-800         text-red-800     text-blue-800        │
│  border-red-300       border-red-300   border-blue-300      │
│                                                              │
│ OR (if refundable):                                          │
│                                                              │
│ [✅ Refundable ($50)]  [✅ Changes OK ($75)]  [🛡️ 24hr grace]│
│  ↑                      ↑                      ↑             │
│  Green badge            Green badge            Blue badge   │
│  bg-green-100           bg-green-100           bg-blue-100  │
│  text-green-800         text-green-800         text-blue-800│
│  border-green-300       border-green-300       border-blue-300│
│                                                              │
└─────────────────────────────────────────────────────────────┘
Style:
  Container: mt-1.5 pt-1.5 border-t border-blue-200
  Flex wrap: flex flex-wrap gap-1.5 text-[11px]
  Badge: inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold

Badge Types:
  ✅ Refundable: bg-green-100 text-green-800 border border-green-300
  ❌ Non-refundable: bg-red-100 text-red-800 border border-red-300
  ✅ Changes OK: bg-green-100 text-green-800 border border-green-300
  ❌ No changes: bg-red-100 text-red-800 border border-red-300
  💺 Seat fee: bg-orange-100 text-orange-800 border border-orange-300
  🛡️ 24hr grace: bg-blue-100 text-blue-800 border border-blue-300
```

### ROW 5: RESTRICTIONS (IF BASIC/LIGHT FARES)
```
┌─────────────────────────────────────────────────────────────┐
│ Border-top separator: border-t border-orange-200            │
│ Background: bg-orange-50/50                                 │
│ Negative margins: -mx-2.5 -mb-2.5 (bleeds to edges)        │
│ Padding: px-2.5 py-1.5                                      │
│ Rounded bottom: rounded-b-lg                                │
│ Font: 10px  |  Color: text-orange-900                       │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ RESTRICTIONS: No carry-on. No seat selection (assigned   │
│ at check-in). No changes/refunds.                           │
└─────────────────────────────────────────────────────────────┘
Style:
  mt-1.5 pt-1.5 border-t border-orange-200
  bg-orange-50/50 -mx-2.5 -mb-2.5 px-2.5 py-1.5
  rounded-b-lg text-[10px] text-orange-900
```

---

## 🎨 EXACT COLOR CODING SYSTEM

### Badge Color Matrix:

| Condition | Background | Text Color | Border | Icon |
|-----------|-----------|------------|--------|------|
| ✅ Refundable | `bg-green-100` | `text-green-800` | `border-green-300` | ✅ Check |
| ❌ Non-refundable | `bg-red-100` | `text-red-800` | `border-red-300` | ❌ X |
| ✅ Changes allowed | `bg-green-100` | `text-green-800` | `border-green-300` | ✅ Check |
| ❌ No changes | `bg-red-100` | `text-red-800` | `border-red-300` | ❌ X |
| 💺 Seat fee applies | `bg-orange-100` | `text-orange-800` | `border-orange-300` | 💺 Emoji |
| 🛡️ 24hr DOT protection | `bg-blue-100` | `text-blue-800` | `border-blue-300` | 🛡️ Shield |

### Container Backgrounds:

| Section | Background Gradient | Border |
|---------|-------------------|--------|
| Outbound Summary | `bg-gradient-to-r from-blue-50 to-indigo-50` | `border-2 border-blue-200` |
| Return Summary | `bg-gradient-to-r from-purple-50 to-pink-50` | `border-2 border-purple-200` |

---

## 📐 EXACT SPACING & SIZING

### Text Sizes:
```
Row 1 (Quality): 12px (text-xs)
Row 2 (Baggage): 12px (text-xs)
Row 3 (Amenities): 11px (text-[11px])
Row 4 (Fare Badges): 11px (text-[11px])
Row 5 (Restrictions): 10px (text-[10px])
```

### Gaps:
```
Row horizontal gaps: gap-x-3 (12px), gap-x-2.5 (10px)
Row vertical gaps: gap-y-1 (4px)
Badge gaps: gap-1.5 (6px)
Icon-text gaps: gap-0.5 (2px) or gap-1 (4px)
```

### Padding:
```
Container: p-2.5 (10px all sides)
Row 4 top: pt-1.5 (6px)
Row 5: px-2.5 py-1.5 (10px horizontal, 6px vertical)
Badge: px-1.5 py-0.5 (6px horizontal, 2px vertical)
```

### Margins:
```
Between rows: mb-1.5 (6px bottom)
Row 4 top: mt-1.5 pt-1.5 (6px margin + 6px padding)
Row 5 negative: -mx-2.5 -mb-2.5 (bleeds to container edges)
```

---

## 🔄 CONDITIONAL RENDERING LOGIC

### Row 4 (Fare Policies) - ONLY SHOWS IF:
```typescript
{fareRules && (
  <div className="mt-1.5 pt-1.5 border-t border-blue-200">
    {/* Fare policy badges */}
  </div>
)}
```

**Conditions:**
1. ✅ `fareRules` must exist (loaded from `/api/fare-rules`)
2. ✅ User must click "Refund & Change Policies" first
3. ✅ API must return successfully
4. ❌ If API fails, Row 4 doesn't appear

**Badge Logic:**
```typescript
// Refundable badge
{fareRules.refundable ? (
  <span className="bg-green-100 text-green-800">
    ✅ Refundable
    {fareRules.refundFee && fareRules.refundFee > 0 && (
      <span>({price.currency} {fareRules.refundFee})</span>
    )}
  </span>
) : (
  <span className="bg-red-100 text-red-800">
    ❌ Non-refundable
  </span>
)}
```

---

## 📏 COMPLETE INLINE SUMMARY HEIGHT CALCULATION

### Without Fare Policies (Current):
```
Row 1: 18px (12px text + 6px margin)
Row 2: 18px (12px text + 6px margin)
Row 3: 16px (11px text + 5px margin)
Row 4: 0px (doesn't exist)
Row 5: 28px (10px text + 12px padding + 6px margin)
────────────────────
Total: ~80px
```

### With Fare Policies (Proposed):
```
Row 1: 18px (12px text + 6px margin)
Row 2: 18px (12px text + 6px margin)
Row 3: 16px (11px text + 5px margin)
Row 4: 22px (11px badge + 6px padding-top + 5px margin) 🆕
Row 5: 28px (10px text + 12px padding + 6px margin)
────────────────────
Total: ~102px (+22px)
```

**Note:** +22px inside inline summary is BETTER than +60px in separate section!
**Net savings:** 60px - 22px = **38px saved!**

---

## 🎯 EXAMPLE SCENARIOS

### Scenario 1: Non-Refundable Light Fare (Most Common)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔵 INLINE FLIGHT SUMMARY - OUTBOUND                     ┃
┠──────────────────────────────────────────────────────────┨
┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 LIGHT                       ┃
┠──────────────────────────────────────────────────────────┨
┃ 🎒 Personal only (10kg)  💼 Not included                ┃
┠──────────────────────────────────────────────────────────┨
┃ 📶 WiFi ❌  🔌 Power ❌  🍽️ None  💺 Seat: Extra fee   ┃
┠══════════════════════════════════════════════════════════┨
┃ [❌ Non-refundable] [❌ No changes] [🛡️ 24hr grace]    ┃ ← NEW!
┠══════════════════════════════════════════════════════════┨
┃ ⚠️ RESTRICTIONS: No carry-on. No seat selection...      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Scenario 2: Refundable Standard Fare (Premium)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔵 INLINE FLIGHT SUMMARY - OUTBOUND                     ┃
┠──────────────────────────────────────────────────────────┨
┃ ⭐ 4.8★  ⏰ On-time: 83%  🎫 FLEX                        ┃
┠──────────────────────────────────────────────────────────┨
┃ 🎒 1 bag + personal (18kg)  💼 2 bags (32kg)            ┃
┠──────────────────────────────────────────────────────────┨
┃ 📶 WiFi ✅  🔌 Power ✅  🍽️ Meals  💺 Seat: Included   ┃
┠══════════════════════════════════════════════════════════┨
┃ [✅ Refundable] [✅ Changes OK ($75)] [🛡️ 24hr grace]  ┃ ← NEW!
┠══════════════════════════════════════════════════════════┨
┃ (No restrictions - premium fare)                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Scenario 3: Before Fare Rules Loaded (No Row 4)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔵 INLINE FLIGHT SUMMARY - OUTBOUND                     ┃
┠──────────────────────────────────────────────────────────┨
┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 LIGHT                       ┃
┠──────────────────────────────────────────────────────────┨
┃ 🎒 Personal only (10kg)  💼 Not included                ┃
┠──────────────────────────────────────────────────────────┨
┃ 📶 WiFi ❌  🔌 Power ❌  🍽️ None  💺 Seat: Extra fee   ┃
┠──────────────────────────────────────────────────────────┨
┃ ⚠️ RESTRICTIONS: No carry-on. No seat selection...      ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

(User must click "Refund & Change Policies" button below to load)
```

---

## 🔀 ROUNDTRIP FLIGHTS - BOTH LEGS

### Complete Roundtrip Display:

```
┌────────────────────────────────────────────────────────────┐
│ ✈️ OUTBOUND: JFK → LAX                                     │
│ 10:00 ────6h 19m Direct───→ 13:19                          │
│                                                             │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ 🔵 OUTBOUND SUMMARY (Blue gradient)                  ┃  │
│ ┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 LIGHT                    ┃  │
│ ┃ 🎒 Personal only (10kg)  💼 Not included             ┃  │
│ ┃ 📶 WiFi ❌  🔌 Power ❌  🍽️ None                     ┃  │
│ ┃ ──────────────────────────────────────────────────   ┃  │
│ ┃ [❌ Non-refundable] [❌ No changes] [🛡️ 24hr grace] ┃  │
│ ┃ ──────────────────────────────────────────────────   ┃  │
│ ┃ ⚠️ RESTRICTIONS: No carry-on...                      ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ ✈️ RETURN: LAX → JFK                                       │
│ 20:52 ────5h 38m Direct───→ 05:30+1                        │
│                                                             │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ 🟣 RETURN SUMMARY (Purple gradient)                  ┃  │
│ ┃ ⭐ 3.5★  ⏰ On-time: 75%  🎫 STANDARD                 ┃  │
│ ┃ 🎒 1 bag + personal (10kg)  💼 1 bag (23kg)          ┃  │
│ ┃ 📶 WiFi ✅  🔌 Power ✅  🍽️ Snack                    ┃  │
│ ┃ ──────────────────────────────────────────────────   ┃  │
│ ┃ [✅ Refundable ($50)] [✅ Changes OK] [🛡️ 24hr]     ┃  │
│ ┃ ──────────────────────────────────────────────────   ┃  │
│ ┃ (No restrictions - standard fare)                    ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└────────────────────────────────────────────────────────────┘
```

**Note:** Different colors (Blue vs Purple) help distinguish outbound vs return!

---

## 💻 EXACT CODE STRUCTURE

### Inline Summary Template (Lines 598-681 + New Row 4):

```tsx
{/* Inline Flight Summary - Outbound */}
<div className="mt-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
  {/* Row 1: Airline Quality + Fare Type */}
  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-semibold mb-1.5">
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
      <span>{airlineData.rating.toFixed(1)}★</span>
    </div>
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-green-600 flex-shrink-0" />
      <span>On-time: {airlineData.onTimePerformance}%</span>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-purple-700 font-bold">
        {outboundBaggage.brandedFareLabel || outboundBaggage.fareType}
      </span>
    </div>
  </div>

  {/* Row 2: Baggage Allowances */}
  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs mb-1.5">
    <div className="flex items-center gap-1">
      <span>🎒</span>
      <span className={outboundBaggage.carryOn ? 'font-semibold text-green-700' : 'text-gray-500'}>
        {outboundBaggage.carryOn
          ? outboundBaggage.carryOnQuantity === 2 ? '1 bag + personal' : 'Personal only'
          : 'Personal only'
        } ({outboundBaggage.carryOnWeight})
      </span>
    </div>
    <div className="flex items-center gap-1">
      <span>💼</span>
      <span className={outboundBaggage.checked > 0 ? 'font-semibold text-green-700' : 'text-gray-500'}>
        {outboundBaggage.checked > 0
          ? `${outboundBaggage.checked} bag${outboundBaggage.checked > 1 ? 's' : ''} (${outboundBaggage.checkedWeight})`
          : 'Not included'
        }
      </span>
    </div>
  </div>

  {/* Row 3: Amenities */}
  <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[11px]">
    <div className="flex items-center gap-0.5">
      <span className="text-xs">📶</span>
      <span className={outboundBaggage.amenities.wifi ? 'text-green-600 font-semibold' : 'text-gray-500'}>
        WiFi {outboundBaggage.amenities.wifi ? '✅' : '❌'}
      </span>
    </div>
    <div className="flex items-center gap-0.5">
      <span className="text-xs">🔌</span>
      <span className={outboundBaggage.amenities.power ? 'text-green-600 font-semibold' : 'text-gray-500'}>
        Power {outboundBaggage.amenities.power ? '✅' : '❌'}
      </span>
    </div>
    <div className="flex items-center gap-0.5">
      <span className="text-xs">🍽️</span>
      <span className={outboundBaggage.amenities.meal !== 'None' ? 'text-gray-700' : 'text-gray-500'}>
        {outboundBaggage.amenities.meal}
      </span>
    </div>
    <div className="flex items-center gap-0.5">
      <span className="text-xs">💺</span>
      <span className={!outboundBaggage.fareType.includes('BASIC') ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
        Seat: {!outboundBaggage.fareType.includes('BASIC') ? 'Included' : 'Extra fee'}
      </span>
    </div>
  </div>

  {/* 🆕 NEW ROW 4: FARE POLICIES (MERGED!) */}
  {fareRules && (
    <div className="mt-1.5 pt-1.5 border-t border-blue-200">
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {/* Refundable Status */}
        {fareRules.refundable ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded font-semibold">
            <Check className="w-3 h-3" /> Refundable
            {fareRules.refundFee && fareRules.refundFee > 0 && (
              <span className="text-[9px]">({price.currency} {fareRules.refundFee})</span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded font-semibold">
            <X className="w-3 h-3" /> Non-refundable
          </span>
        )}

        {/* Change Status */}
        {fareRules.changeable ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded font-semibold">
            <Check className="w-3 h-3" /> Changes OK
            {fareRules.changeFee && fareRules.changeFee > 0 && (
              <span className="text-[9px]">({price.currency} {fareRules.changeFee})</span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded font-semibold">
            <X className="w-3 h-3" /> No changes
          </span>
        )}

        {/* 24hr DOT Protection - Always shown */}
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded font-semibold">
          <Shield className="w-3 h-3" /> 24hr grace
        </span>
      </div>
    </div>
  )}

  {/* Row 5: Restrictions (if Basic Economy) */}
  {(outboundBaggage.fareType.includes('BASIC') || outboundBaggage.fareType.includes('LIGHT')) && (
    <div className="mt-1.5 pt-1.5 border-t border-orange-200 bg-orange-50/50 -mx-2.5 -mb-2.5 px-2.5 py-1.5 rounded-b-lg">
      <div className="flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="text-[10px] text-orange-900 leading-tight">
          <span className="font-bold">RESTRICTIONS:</span>
          <span className="ml-1">
            {!outboundBaggage.carryOn && 'No carry-on. '}
            No seat selection (assigned at check-in). No changes/refunds.
          </span>
        </div>
      </div>
    </div>
  )}
</div>
```

---

## ✅ IMPLEMENTATION CHECKLIST

**Changes Required:**

1. **Add Row 4 to Outbound Summary (Lines 598-681):**
   - Insert after Row 3 (amenities)
   - Before Row 5 (restrictions)
   - Conditional: `{fareRules && ...}`
   - Style: `mt-1.5 pt-1.5 border-t border-blue-200`

2. **Add Row 4 to Return Summary (Lines 754-840):**
   - Same structure as outbound
   - Style: `mt-1.5 pt-1.5 border-t border-purple-200` (purple theme!)

3. **Delete Separate Section (Lines 1081-1133):**
   - Remove entire FARE POLICY BADGES section
   - Save 53 lines of code
   - Save 60px vertical height

**Net Result:**
- Lines added: +86 (43 × 2 legs)
- Lines removed: -53 (separate section)
- **Net change:** +33 lines
- **Height saved:** -38px (60px section - 22px inline)

---

## 🎯 AWAITING YOUR AUTHORIZATION

**Ready to implement when you approve:**

✅ **Confirm Row 4 structure is correct?**
✅ **Confirm color coding matches your vision?**
✅ **Confirm spacing and sizing are appropriate?**
✅ **Confirm we should delete the separate section?**

**Please review this detailed mockup and authorize me to proceed!** 🚀
