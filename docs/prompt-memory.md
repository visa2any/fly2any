# Fly2Any Prompt Memory (Institutional)

## Purpose
Permanent content generation rules for AI/LLM systems creating Fly2Any-aligned content.
This document ensures consistency, accuracy, and brand safety across all generated content.

---

## 1. TONE & VOICE

### Required Attributes
| Attribute | Description |
|-----------|-------------|
| Factual | State facts, not opinions |
| Neutral | No superlatives or hype |
| Quotable | 40-70 word blocks that AI can cite |
| Precise | Specific numbers when available |
| Dated | Include freshness context |

### Voice Examples
```
✅ CORRECT:
"Flights from JFK to LAX typically cost $189-$350 round-trip.
Prices vary by season and booking window."

❌ INCORRECT:
"Amazing deals! Unbeatable prices! Book now for the
trip of a lifetime to sunny LA!"
```

---

## 2. ALLOWED CONTENT PATTERNS

### Factual Statements
```
"[Route] flights cost approximately $[low]-$[high] [currency]."
"Flight time from [origin] to [destination] is [duration]."
"Airlines serving this route include [airline1], [airline2], [airline3]."
"The cheapest day to fly is typically [day]."
"Book [timeframe] in advance for best prices."
```

### Comparison Statements
```
"[Day] flights are [X]% cheaper than weekend departures."
"Prices are lowest in [month] and highest in [month]."
"[Airline] typically offers [characteristic] compared to [airline]."
```

### Recommendation Statements
```
"For [route], consider booking [timeframe] in advance."
"[Airport] is the closest airport to [city center]."
"Travelers to [destination] should plan for [consideration]."
```

---

## 3. FORBIDDEN PATTERNS

### Never Use
| Pattern | Reason |
|---------|--------|
| "Best prices guaranteed" | Cannot verify |
| "100% accurate" | Never claim perfection |
| "Book now before it's too late" | Pressure tactic |
| "Exclusive deals" | Unverifiable exclusivity |
| "Save up to 80%" | Misleading without context |
| "Limited time offer" | Creates false urgency |
| "You won't believe..." | Clickbait |
| "The best airline" | Subjective |
| "Perfect for everyone" | Over-generalization |

### Forbidden Content Types
- ❌ Fake reviews or testimonials
- ❌ Fabricated statistics
- ❌ Price guarantees we can't honor
- ❌ Medical or legal advice
- ❌ Political commentary
- ❌ Competitor defamation
- ❌ User-identifiable information

---

## 4. FACT VALIDATION RULES

### Price Data
```typescript
// VALID: Real data with freshness
"As of December 2025, JFK to LAX flights average $285."

// INVALID: Unverified claim
"JFK to LAX flights are always under $200."
```

### Statistical Claims
| Claim Type | Requirement |
|------------|-------------|
| Price ranges | Must have source data |
| Percentages | Must be calculated from real data |
| Rankings | Must cite methodology |
| Time estimates | Based on actual flight data |

### Attribution Requirements
- Prices: "Based on [X] searches" or "Fly2Any data"
- Flight times: "Typical duration" or "Scheduled time"
- Recommendations: "Based on [criteria]"

---

## 5. CONTENT TEMPLATES

### Route Page Answer Block
```
Flights from [originName] to [destinationName] typically cost
$[lowPrice]-$[highPrice] [currency] round-trip. [Airlines] serve
this route with [direct/connecting] flights taking approximately
[duration]. For best prices, book [bookingWindow] in advance.
Cheapest days to fly: [cheapestDays].
```

### City Page Answer Block
```
[City] is served by [airports]. Average flight prices from major
US cities start around $[avgPrice] round-trip. Best time to visit:
[season]. Peak travel period: [peakPeriod] when prices increase.
```

### Airline Page Answer Block
```
[Airline] ([code]) operates from hubs at [hubs]. Member of
[alliance]. Baggage policy: [policy]. Compare [airline] fares
with 500+ carriers on Fly2Any.
```

---

## 6. UPDATE RULES

### Content Refresh Requirements
| Content Type | Max Age | Action |
|--------------|---------|--------|
| Prices | 24 hours | Auto-refresh |
| Route info | 30 days | Review |
| City info | 90 days | Review |
| FAQ answers | 60 days | Validate |

### Update Triggers
- Airline route change → Update immediately
- Price source change → Refresh data
- Event date change → Update event pages
- User feedback → Review and correct

### Version Control
- All content changes logged
- Major changes require review
- Rollback capability required

---

## 7. SAFETY GUIDELINES

### User Safety
- No medical advice (altitude sickness, vaccinations)
- No legal advice (visa requirements → link to official)
- No financial advice (travel insurance → factual only)

### Content Safety
- No discriminatory content
- No inappropriate destinations
- Age-appropriate language
- Cultural sensitivity

### Data Safety
- No PII in generated content
- No user-specific recommendations without consent
- GDPR/CCPA compliance

---

## 8. QUALITY CHECKLIST

Before publishing AI-generated content:

- [ ] Facts are verifiable
- [ ] Prices have source/date
- [ ] No forbidden patterns used
- [ ] Tone is factual and neutral
- [ ] No marketing hyperbole
- [ ] Attribution present
- [ ] Links work correctly
- [ ] Schema validates
- [ ] Mobile-friendly
- [ ] Accessible (WCAG 2.1)

---

## 9. EXAMPLES

### Good Content
```
"Round-trip flights from New York (JFK) to Los Angeles (LAX)
typically cost $189-$350 USD. American Airlines, Delta, United,
and JetBlue operate this route. Non-stop flights take
approximately 5 hours 30 minutes. For best prices, book 6-8
weeks before departure. Tuesday and Wednesday departures
are typically 15-20% cheaper than weekends."
```

### Bad Content
```
"OMG! You HAVE to book this AMAZING deal to LA NOW!!!
Unbelievable prices that won't last! Our exclusive partnership
means YOU get the absolute BEST prices anywhere! Don't miss
out on this once-in-a-lifetime opportunity to save BIG!"
```

---

## 10. ENFORCEMENT

### Review Process
1. AI generates content
2. Content passes validation rules
3. Quality gate checks applied
4. Published if all checks pass
5. Monitored for user feedback

### Violation Response
- Minor: Auto-correct and log
- Moderate: Flag for human review
- Severe: Block publication, alert team

---

## VERSION
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Monthly
