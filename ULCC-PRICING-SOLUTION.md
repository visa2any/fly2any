# ULCC Pricing Solution - Analysis & Implementation Plan

## Problem Statement
Our site shows Frontier JFK→MIA at **$270** while Priceline shows **$60** for the identical flight (4.5x price difference).

**Root Cause:** Amadeus GDS only provides bundled "ECO" fares ($269.97). ULCC unbundled "Basic Fares" ($60) are NOT distributed through traditional GDS systems.

---

## Research Findings

### 1. Frontier Airlines Direct NDC API ⭐ **BEST OPTION**
- **Official Developer Portal:** https://developer.flyfrontier.com/
- **Access:** NDC Registration required
- **Pricing:** Unknown (likely partnership/volume-based)
- **Advantage:** Direct access to unbundled $60 basic fares
- **Status:** Live and actively used by Fareportal (CheapOair, OneTravel) since April 2025

**Key Pages:**
- Registration: https://developer.flyfrontier.com/ndc-registration
- API Docs: https://developer.flyfrontier.com/api-documentation
- Certification: https://developer.flyfrontier.com/certification

### 2. Duffel API - **IMMEDIATE BACKUP**
- **Signup:** https://app.duffel.com/join (< 1 minute)
- **Access:** 300+ airlines including Frontier and Spirit
- **Pricing:**
  - $3.00 per order
  - 1% of total order value (managed content)
  - $2.00 per paid ancillary
  - Search: 1500:1 ratio free, then $0.005/excess search
  - **Zero upfront costs**

**LIMITATION:** Duffel accesses Frontier via GDS (Travelport), so we'll get the SAME $270 bundled fares as Amadeus. However, it provides:
- 300+ airlines in one integration
- Better coverage for non-ULCC carriers
- Instant access while we wait for Frontier NDC approval

### 3. Skyscanner API
- **Barrier:** HIGH - need "established business with large audience"
- **Review:** 2-week approval process
- **Pricing:** Commission-based
- **Coverage:** 1,200+ airlines including LCCs
- **Verdict:** Apply later once business is established

### 4. Kiwi.com API
- **Coverage:** 750+ carriers including 250+ LCCs
- **Features:** Virtual interlining, 6 billion routes
- **Access:** Partnership model, details TBD
- **Verdict:** Good long-term option

---

## Recommended Implementation Strategy

### Phase 1: IMMEDIATE (This Week)
1. ✅ **Apply for Frontier NDC API Access**
   - Visit https://developer.flyfrontier.com/ndc-registration
   - Complete certification process
   - This will give us $60 basic fares

2. ✅ **Integrate Duffel API in Parallel**
   - Sign up at https://app.duffel.com/join
   - Implement as secondary data source
   - Merge results with Amadeus
   - Provides 300+ airlines while we wait for Frontier NDC

### Phase 2: EXPANSION (Next 2 Weeks)
3. **Apply for Spirit Airlines NDC** (if available)
   - Spirit uses same unbundled model as Frontier
   - Access likely through aggregators like Duffel

4. **Implement Multi-Source Aggregation**
   - Query: Amadeus + Duffel + Frontier NDC in parallel
   - Deduplicate flights by: carrier + flight number + departure time
   - Prioritize cheapest price for each unique flight
   - Display: "Best Price from Multiple Sources"

### Phase 3: OPTIMIZATION (Month 2)
5. **Add Allegiant Direct Connection**
6. **Apply for Skyscanner API** (once we have user traction)
7. **Implement Smart Source Selection**
   - ULCC carriers (F9, NK, G4) → Direct NDC
   - Legacy carriers (AA, DL, UA) → Amadeus GDS
   - International LCCs → Duffel/Kiwi.com

---

## Technical Implementation

### Architecture
```
┌─────────────────────────────────────────────────────┐
│         Flight Search API (/api/flights/search)      │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Amadeus  │    │  Duffel  │    │ Frontier │
  │   GDS    │    │   API    │    │   NDC    │
  └──────────┘    └──────────┘    └──────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
              ┌────────────────────┐
              │  Merge & Dedupe    │
              │  Keep Cheapest     │
              └────────────────────┘
                         │
                         ▼
              ┌────────────────────┐
              │   Return Results   │
              └────────────────────┘
```

### Cost Analysis (Per 1,000 Bookings)

**Current (Amadeus Only):**
- Amadeus: ~$0/search (included in test tier)
- Total: $0

**After Implementation:**
- Amadeus: $0
- Duffel: $3 × 1,000 = $3,000 (orders)
- Duffel: 1% × $270 × 1,000 = $2,700 (managed content)
- Duffel: $2 × 500 = $1,000 (ancillaries, estimated)
- Frontier NDC: TBD (likely flat monthly or %)
- **Total: ~$6,700 + Frontier NDC fees**

**Revenue Impact:**
- If we capture 10% more bookings due to competitive pricing
- Average commission: $15/booking
- Additional revenue: $15 × 100 = $1,500

**Net:** We need to evaluate if $60 vs $270 pricing drives enough conversion to justify $6,700 cost

---

## Pricing Comparison Example

### JFK → MIA (Nov 5-12, Economy, 1 Adult)

| Source | Price | Fare Type | Baggage | Our Site |
|--------|-------|-----------|---------|----------|
| Priceline | $60 | Basic | None | ❌ Not available |
| Our Site (Amadeus) | $270 | ECO Bundled | 1 checked | ✅ Current |
| Frontier Direct NDC | $60 | Basic | None | ✅ After Phase 1 |
| Duffel (via Travelport) | $270 | ECO Bundled | 1 checked | ✅ After Phase 1 |

After Phase 1, we'll show BOTH options:
- **$60** - Frontier Basic (via NDC) - No bags, basic seat
- **$270** - Frontier ECO (via Amadeus/Duffel) - 1 checked bag, seat selection

This gives users the CHOICE that Priceline offers.

---

## Next Steps

1. ✅ **START NOW:** Apply for Frontier NDC at developer.flyfrontier.com/ndc-registration
2. ✅ **START NOW:** Sign up for Duffel at app.duffel.com/join
3. ✅ Implement Duffel integration (lib/api/duffel.ts)
4. ✅ Update search route to query both Amadeus + Duffel
5. ✅ Implement deduplication logic
6. ✅ Test with JFK→MIA search
7. Wait for Frontier NDC approval (likely 1-2 weeks)
8. Implement Frontier NDC integration once approved
9. Deploy and monitor pricing competitiveness

---

## Expected Outcome

**Before:**
- Frontier JFK→MIA: $270 only
- Users leave to book on Priceline at $60

**After Phase 1 (Duffel):**
- Better coverage for non-ULCC carriers
- Still showing $270 for Frontier (via GDS)

**After Phase 1 (Frontier NDC Approved):**
- Frontier JFK→MIA: $60 AND $270 options
- Price-competitive with Priceline, Kayak, Google Flights
- Users can choose: cheap basic fare or bundled fare

---

## Risk Assessment

**Low Risk:**
- Duffel integration (instant signup, pay-as-you-go)
- Frontier NDC application (free to apply)

**Medium Risk:**
- Frontier NDC approval timeline (unknown)
- Frontier NDC pricing terms (unknown)

**High Risk:**
- Cost per booking ($6.70 avg with Duffel) may not justify conversion lift
- Need to monitor conversion rate improvement vs API costs

---

## Conclusion

**Immediate Action Required:**
1. Apply for Frontier NDC API (developer.flyfrontier.com)
2. Integrate Duffel API as backup/supplement
3. Implement multi-source aggregation

This will solve the $60 vs $270 pricing gap and make us competitive with Priceline, Kayak, and Google Flights.
