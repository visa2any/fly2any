# PHASE 3: PUBLIC QUOTE LINK & CLIENT EXPERIENCE HARDENING
## Technical Design Document

**Phase Name:** Public Quote Link & Client Experience Hardening  
**Version:** 2.0  
**Date:** January 23, 2026  
**Status:** DESIGN PHASE - AUDIT CORRECTED  
**Estimated Duration:** 2-3 weeks

---

## 📋 EXECUTIVE SUMMARY

**Objective:** Design a client-facing quote experience that provides rich, shareable quote viewing without requiring agent presence or authentication, while preserving all pricing and commission integrity from Phase 2.

**Key Outcomes:**
- Secure, tokenized public quote links
- Client view matching agent workspace richness
- Read-only pricing display (no recalculation)
- Conversion event tracking (non-blocking)
- No agent session dependency

**Business Value:**
- Enable agents to share quotes anytime
- Provide self-service quote review for clients
- Capture conversion funnel analytics
- Reduce agent time in follow-up

---

## 🎯 PHASE 3 SCOPE

### IN SCOPE

#### 1. Public Quote Link Architecture

**1.1 Token Generation & Storage**
- Generate secure random token on quote save
- Store token in `agentQuote.shareableLink` field
- Token format: `qt-{UUID-v4}` (e.g., `qt-550e8400-e29b-41d4-a716-446655440000`)
- Token length: 36 characters (standard UUID)
- Uniqueness guarantee: UUID collision probability ~0.00000000006%

**1.2 Public Quote Endpoint**
- Route: `GET /quote/{shareableLink}`
- No authentication required
- Public access controlled by token validity only
- Returns complete quote data (read-only)
- Serves as standalone client-facing page

**1.3 Link Sharing Mechanisms**
- Copy-to-clipboard button in Send Quote Modal
- Direct URL in Email template variable: `{{quoteUrl}}`
- Direct URL in WhatsApp message
- Share button on agent quote list page

#### 2. Security Model

**2.1 Tokenized Access**
- Token is only required credential
- No session or authentication needed for client
- Token validated on each page load
- Invalid tokens return 404 Not Found (security best practice)
- Never expose internal quote ID in URL

**2.2 Token Invalidation**
- Token invalidated when quote is deleted
- Token invalidated when client account is deactivated
- Optional: Revocation endpoint for agent (future Phase 3.1)
- Token rotation on quote re-save (configurable)

**2.3 Access Logging**
- Log every public quote view
- Track: Token, IP, timestamp, user-agent
- Identify suspicious access patterns (rate limiting)
- Store in separate `QuoteView` analytics table

#### 3. Expiration Logic

**3.1 Default Expiration**
- Default validity period: 30 days from sentAt
- Configurable via environment variable: `QUOTE_EXPIRY_DAYS`
- Expiration stored in `agentQuote.expiresAt` field
- Expired quotes return 410 Gone with clear message

**3.2 Extension Mechanism**
- Agent can extend expiration via workspace
- Max extension limit: 180 days total (6 months)
- Extension updates `expiresAt` field
- Token remains valid on extension

**3.3 Expiration Display**
- Show expiration date to agent in workspace
- Warning banner for quotes expiring in < 7 days
- Client sees expiration warning 3 days before expiry
- Call-to-action to contact agent for extension

#### 4. Read-Only vs Interactive Sections

**4.1 Read-Only Sections (Immutable)**
- **Pricing Breakdown (Display Format Specified in Section 4.3):**
  - Base price (read-only, display only)
  - Markup percentage (read-only, display only)
  - Agent markup amount (read-only, display only)
  - Taxes & fees (read-only, display only)
  - Total price (read-only, display only)
  - Per-person price (read-only, display only)
- **Flight Details:**
  - Route, times, aircraft (read-only)
  - Passenger counts (read-only)
- **Client Information:**
  - Name, email, phone (read-only)
- **Trip Details:**
  - Destination, dates (read-only)

**4.2 Interactive Sections (Client Actions) - CTA Hierarchy Defined**

**Primary CTA (Exactly One Per Screen):**
- **"I'm interested" (Accept Quote)**
  - Purpose: Start conversion, express interest
  - Placement: Above fold (mobile-first), center stage
  - Visual priority: High contrast, dominant size, primary color gradient
  - Action: Opens contact form → Logs ACCEPT event
  - Button size: Large (48px height, 60% width on mobile)
  - Visibility: Always visible without scrolling
  - Label: "I'm interested" (action-oriented, non-pushy)

**Secondary CTAs (Must Not Compete Visually):**
- **"I'd like to modify this quote"**
  - Purpose: Request changes to current quote
  - Placement: Below fold, footer, or overflow menu
  - Visual priority: Smaller, lower contrast, secondary action
  - Action: Opens modification request form → Logs REQUEST_CHANGE event
  - Button size: Medium (40px height, 20% width)
  
- **"Share quote"**
  - Purpose: Copy link for client to share with others
  - Placement: Below fold or in header action menu
  - Visual priority: Smaller, icon-only or minimal text
  - Action: Copy link to clipboard → Logs SHARE event
  - Button size: Small (36px height)

- **"Download PDF"**
  - Purpose: Download quote as PDF
  - Placement: Below fold or in header action menu
  - Visual priority: Smaller, icon-only or minimal text
  - Action: Generate PDF → Logs DOWNLOAD_PDF event
  - Button size: Small (36px height)

**CTA Rules:**
- Exactly ONE high-emphasis action per screen (primary CTA)
- Secondary CTAs MUST NOT visually compete with primary
- No more than one primary CTA visible at any time
- Primary CTA always above fold on mobile
- Secondary CTAs grouped together, clearly differentiated from primary
- No dark patterns or pressure tactics
- Action-oriented, clear language

**4.3 Pricing Display UX Specification**

**Above The Fold (Mobile & Desktop):**
- **Large Total Price:**
  - Format: "USD $12,345"
  - Size: 48px (desktop), 36px (mobile)
  - Weight: Bold
  - Position: Center stage, prominent
  - Currency: ISO code "USD" + symbol "$" explicit
  - Visibility: Always visible without scrolling on mobile

- **Per-Person Price:**
  - Format: "$6,172.50 per person"
  - Size: 18px (desktop), 16px (mobile)
  - Weight: Medium
  - Position: Directly below total price
  - Visibility: Immediately visible below total

**Below The Fold:**
- **Collapsible Breakdown Section:**
  - Default state: Collapsed (reduce cognitive load)
  - Trigger: "View Details" button
  - Content when expanded:
    * Base Price: "$10,000"
    * Agent Markup: "+$2,000 (16.7%)"
    * Taxes & Fees: "+$345"
  - Style: Clear visual hierarchy, easy to scan

- **Inclusions List:**
  - Position: Footer or below breakdown
  - Format: Bullet list with checkmark icons
  - Content: "Includes: All flights, hotels, ground transport, meals"
  - Clarity: Explicit, no ambiguity

- **Exclusions List:**
  - Position: Footer or below breakdown
  - Format: Bullet list with minus icons
  - Content: "Excludes: Personal expenses, travel insurance, optional activities"
  - Clarity: Explicit, no ambiguity

**Pricing Display Rules:**
- Total price MUST be visible without scrolling on mobile
- Per-person price directly below total
- Currency format: ISO code + symbol (e.g., "USD $12,345")
- Breakdown collapsed by default (mobile-first)
- Inclusions/exclusions clearly listed
- NO recalculation - display stored values only
- ZERO ambiguity about what is included or excluded

**4.4 Agent Attribution Component**

**Agent Attribution Header (ClientQuoteHeader.tsx):**

**Mobile Placement:**
- Position: Header section, always visible above fold
- Layout: Horizontal, compact
- Visibility: Persistent, no scrolling required

**Desktop Placement:**
- Position: Right sidebar or persistent header
- Layout: Vertical, expanded
- Visibility: Always visible

**Component Content:**
- **Agent Identity:**
  - Avatar: Agent photo (if available) or placeholder initials
  - Size: 48x48px (desktop), 32x32px (mobile)
  - Label: "Quote prepared by [Agent Name]"
  - Role: "[Title] at Fly2Any"
  - Badge: "Verified by Fly2Any" (trust signal)

- **Contact Information:**
  - Phone: [Agent phone] with click-to-call (tel: link)
  - Email: [Agent email] with mailto: link
  - Availability: "Typically responds within 2 hours"
  - Visibility: Always accessible

**Agent Attribution Rules:**
- Agent name always visible above fold on mobile
- Clear statement: "Quote prepared by [Agent Name]"
- Contact options always available (phone, email)
- Client ALWAYS knows who they are dealing with
- No anonymous or platform-only framing
- Contact path to agent is always available

**4.5 Trust & Reassurance Signals**

**Trust Signals in Header:**
- Badge: "Verified by Fly2Any"
- Copy: "Secure quote — accessible only via this link"
- Icon: Lock icon (security indicator)

**Trust Signals in Footer:**
- Copy: "Questions? Contact your agent directly"
- Link: Agent contact information (phone, email)

**Post-CTA Experience:**
- **After "I'm interested" click:**
  - Open contact form
  - Show confirmation: "Your agent will contact you within 24 hours"
  - No urgency, no scarcity

- **After "I'd like to modify" click:**
  - Open modification request form
  - Show confirmation: "Request sent to [Agent Name]"
  - Clear next steps

**Trust Signal Rules:**
- NO urgency language (e.g., "Limited time only!")
- NO scarcity tactics (e.g., "2 people viewing this quote")
- NO pressure language (e.g., "Book now!")
- Clear explanation of next steps after CTA
- Reassurance copy present throughout

#### 5. Conversion Events

**5.1 Event Types**
```typescript
enum QuoteConversionEvent {
  VIEW = "view",              // Page loaded
  SCROLL = "scroll",          // Scrolled past 50% of page
  ACCEPT = "accept",          // Clicked "I'm interested"
  REQUEST_CHANGE = "change",  // Clicked "I'd like to modify"
  SHARE = "share",           // Copied or shared link
  DOWNLOAD_PDF = "download"  // Downloaded PDF
}
```

**5.2 Event Payload**
```typescript
interface QuoteConversionEvent {
  id: string;
  quoteId: string;
  token: string;
  eventType: QuoteConversionEvent;
  timestamp: ISO8601;
  metadata?: {
    deviceType?: "mobile" | "desktop" | "tablet";
    browser?: string;
    referrer?: string;
    timeOnPage?: number; // seconds
  };
}
```

**5.3 Event Storage**
- Table: `QuoteConversionEvent`
- Indexes: quoteId, token, timestamp, eventType
- Partitioning: Monthly for performance
- Retention: 90 days (configurable)

**5.4 Real-Time Notification (Future)**
- WebSocket connection for agent on client actions
- Real-time dashboard update when client accepts
- Phase 3.1 feature (out of scope for initial Phase 3)

#### 6. Analytics Hooks

**6.1 Client-Side Analytics (Non-Blocking Implementation)**

**Event Queue Strategy:**
```typescript
// Client-side event batching
const events: QuoteConversionEvent[] = [];
const ANALYTICS_BATCH_DELAY = 5000; // 5 seconds

function trackEvent(event: QuoteConversionEvent) {
  events.push(event);
  
  // Immediate send on critical events
  if (event.eventType === 'ACCEPT' || event.eventType === 'REQUEST_CHANGE') {
    sendAnalytics([event]);
    events.splice(events.indexOf(event), 1);
  }
  // Batch send every 5 seconds
  else if (events.length >= 10) {
    sendAnalytics(events);
    events.length = 0;
  }
}

function sendAnalytics(batch: QuoteConversionEvent[]) {
  // Fire-and-forget: No await, no retry
  navigator.sendBeacon('/api/quotes/' + token + '/analytics', JSON.stringify(batch));
}

// Send on page unload
window.addEventListener('beforeunload', () => {
  if (events.length > 0) sendAnalytics(events);
});
```

**Analytics Rules:**
- Events queued in memory (client-side)
- Batch every 5 seconds OR on critical events
- Use `navigator.sendBeacon()` for guaranteed non-blocking
- Never await analytics requests
- Never block UI rendering or interaction
- Flush on page unload (beforeunload event)
- Client-side deduplication (reduce server load)

**6.2 Server-Side Analytics**
- API endpoint: `POST /api/quotes/{token}/analytics`
- Accepts batch of events
- Returns: 204 No Content (fast response)
- Rate limited: 10 req/min per token
- Async processing via queue (non-blocking)

**6.3 Dashboard Metrics**
- Total quote views per quote
- Conversion rate (views → accept)
- Average time on page
- Drop-off points (where clients leave)
- Channel effectiveness (email vs WhatsApp vs link)

---

## 🚫 OUT OF SCOPE

### Explicitly Excluded from Phase 3

**Feature-Level Exclusions:**
- ❌ **Quote Modifications by Client** - Clients cannot edit pricing, flights, or trip details
- ❌ **Booking Flow Integration** - No booking functionality on public quote page
- ❌ **Payment Collection** - No payment gateway integration
- ❌ **Quote Comparison** - No side-by-side quote comparison
- ❌ **Agent Chat Integration** - No real-time messaging on quote page
- ❌ **Document Upload** - No file uploads from client
- ❌ **Version History** - No quote versioning for clients

**Technical Exclusions:**
- ❌ **Pricing Recalculation** - Use stored values from Phase 2
- ❌ **Commission Changes** - Use stored markup from Phase 2
- ❌ **Agent Session Dependency** - Public link works without agent login
- ❌ **Caching Layer** - No Redis or external cache (direct DB reads)
- ❌ **CDN Integration** - No CDN for static assets (use Vercel default)
- ❌ **A/B Testing** - No variation testing framework
- ❌ **Personalization** - No user-specific content customization

**Analytics Exclusions:**
- ❌ **Heatmaps** - No click heatmap tracking
- ❌ **Session Recording** - No user session recording
- ❌ **Cross-Domain Tracking** - No Google Analytics integration
- ❌ **Custom Events** - Only predefined conversion events
- ❌ **Blocking Analytics** - No synchronous or blocking analytics calls

**Security Exclusions:**
- ❌ **Multi-Factor Auth** - Token-only access (sufficient for quotes)
- ❌ **IP Whitelisting** - No IP restrictions
- ❌ **Password Protection** - No password requirement on top of token
- ❌ **Watermarking** - No PDF watermarking

**Phase 3.1 Features (Future Phases):**
- ❌ Real-time notifications to agent
- ❌ Quote revision workflow
- ❌ Client self-serve booking
- ❌ Advanced analytics dashboards

---

## ⚠️ RISK MATRIX

### Technical Risks

| Risk | Probability | Impact | Mitigation | Owner |
|-------|------------|----------|------------|--------|
| **Token Collision** | < 0.00000001% | CRITICAL | Use UUID v4 with proper random seed | Backend |
| **Token Enumeration** | LOW | HIGH | Long tokens (36 chars), no sequential IDs, rate limiting | Backend |
| **Unauthorized Access** | LOW | HIGH | Validate token on every request, 404 on invalid | Backend |
| **Pricing Discrepancy** | LOW | MEDIUM | Use stored values from Phase 2, no recalculation | Backend |
| **Performance Issues** | MEDIUM | MEDIUM | Database indexing, query optimization, eventual consistency | Backend |
| **Race Conditions** | LOW | MEDIUM | Atomic operations, database constraints | Backend |

### UX Risks

| Risk | Probability | Impact | Mitigation | Owner |
|-------|------------|----------|------------|--------|
| **Client Confusion** | MEDIUM | LOW | Clear pricing display, single primary CTA, trust signals | UX |
| **Link Not Working** | LOW | MEDIUM | Test all sharing channels, clear error messages | QA |
| **Mobile Experience** | MEDIUM | LOW | Responsive design, CTA above fold, test all devices | UX |
| **Information Overload** | MEDIUM | LOW | Progressive disclosure, collapsed breakdown by default | UX |
| **Action Unclear** | LOW | MEDIUM | Single primary CTA, clear labels, action-oriented language | UX |

### Business Risks

| Risk | Probability | Impact | Mitigation | Owner |
|-------|------------|----------|------------|--------|
| **Low Conversion Rate** | MEDIUM | HIGH | Single primary CTA, clear pricing, trust signals | Product |
| **Quote Sharing Abuse** | LOW | MEDIUM | Rate limiting, IP tracking, abuse detection | Backend |
| **Client Data Privacy** | LOW | HIGH | GDPR-compliant logging, data retention policy | Legal |
| **Competitor Access** | LOW | MEDIUM | No sensitive business data shown, read-only | Product |

### Security Risks

| Risk | Probability | Impact | Mitigation | Owner |
|-------|------------|----------|------------|--------|
| **SQL Injection** | VERY LOW | CRITICAL | Parameterized queries, Prisma ORM | Backend |
| **XSS Attacks** | LOW | HIGH | React auto-escaping, content sanitization | Backend |
| **CSRF Attacks** | LOW | MEDIUM | SameSite cookies, CSRF tokens (future) | Backend |
| **Data Scraping** | MEDIUM | MEDIUM | Rate limiting, CAPTCHA (future) | Backend |
| **Token Leakage** | LOW | HIGH | HTTPS only, no token in referrer header | DevOps |

---

## 🏗️ TECHNICAL ARCHITECTURE

### Database Schema Changes

**New Tables:**

```sql
CREATE TABLE QuoteView (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quoteId UUID NOT NULL REFERENCES agentQuote(id) ON DELETE CASCADE,
  token VARCHAR(36) NOT NULL,
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  referrer TEXT,
  deviceType VARCHAR(20),
  
  INDEX idx_quote_view_quoteId (quoteId),
  INDEX idx_quote_view_token (token),
  INDEX idx_quote_view_viewedAt (viewedAt)
);

CREATE TABLE QuoteConversionEvent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quoteId UUID NOT NULL REFERENCES agentQuote(id) ON DELETE CASCADE,
  token VARCHAR(36) NOT NULL,
  eventType VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  INDEX idx_conversion_quoteId (quoteId),
  INDEX idx_conversion_token (token),
  INDEX idx_conversion_timestamp (timestamp),
  INDEX idx_conversion_eventType (eventType)
);
```

**Schema Updates:**

```sql
-- Add to agentQuote table
ALTER TABLE agentQuote ADD COLUMN shareableLink VARCHAR(36) UNIQUE;
ALTER TABLE agentQuote ADD COLUMN expiresAt TIMESTAMP;
ALTER TABLE agentQuote ADD COLUMN viewCount INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX idx_agentQuote_shareableLink ON agentQuote(shareableLink);
CREATE INDEX idx_agentQuote_expiresAt ON agentQuote(expiresAt);
```

### Database Performance Strategy

**Performance Optimization (Documentation Only - No Schema Changes):**

**Eventual Consistency:**
- Acceptable for quote view data (eventual consistency OK)
- Critical only for conversion events (atomic operations)

**Query Optimization:**
- Indexes on token + timestamp for fast lookups
- No blocking joins on quote view (single table queries)
- Use connection pooling (Prisma default: 10 connections)

**Analytics Writes:**
- Must not affect quote read performance
- Async processing via queue
- Separate tables for analytics (no impact on quote reads)

**Performance Targets:**
- Quote view query: < 50ms (p95)
- Analytics write: < 100ms (p95), async processing
- Page load time: < 2s (p95)

### API Endpoints

**Phase 3 New Endpoints:**

```
GET  /quote/{shareableLink}
     - Public quote view page (Next.js page)
     - Returns: HTML page with quote data

GET  /api/quotes/{shareableLink}
     - Fetch quote data by token
     - Returns: JSON with complete quote (read-only)
     - Auth: None (public)

POST /api/quotes/{shareableLink}/analytics
     - Log conversion event (batch supported)
     - Returns: 204 No Content
     - Non-blocking: sendBeacon, no await
     - Rate Limit: 10 req/min per token

POST /api/agents/quotes/{id}/extend-expiry
     - Extend quote expiration (agent only)
     - Returns: Updated quote with new expiresAt
     - Auth: Required
```

**Phase 2 Integration Points:**

```
POST /api/agents/quotes
POST /api/agents/quotes/{id}
     - Auto-generate shareableLink on save
     - Set expiresAt = sentAt + 30 days
     - Existing Phase 2 endpoints, no breaking changes
```

### Frontend Components

**New Pages:**
```
app/quote/[token]/page.tsx
     - Public quote view page
     - Responsive design
     - Read-only quote display
     - Single primary CTA above fold
     - Non-blocking analytics
```

**New Components:**
```
components/client-quote/
     - ClientQuoteHeader.tsx (with agent attribution)
     - ClientPricingBreakdown.tsx (with pricing UX spec)
     - ClientFlightDetails.tsx
     - ClientHotelDetails.tsx
     - ClientActionButtons.tsx (with CTA hierarchy)
     - ClientContactForm.tsx
     - ExpirationBanner.tsx
```

**Analytics Hook:**
```
hooks/useQuoteAnalytics.ts
     - Track page views (non-blocking)
     - Track scroll events (non-blocking)
     - Track button clicks (non-blocking)
     - Batch events (5-second delay)
     - Use sendBeacon (fire-and-forget)
```

---

## ✅ SUCCESS CRITERIA

### Technical Acceptance

**Functionality:**
- ✅ Public quote links generate on save
- ✅ Links work without authentication
- ✅ Links expire after configured period
- ✅ Expired quotes show clear 410 page
- ✅ Invalid tokens return 404

**Performance:**
- ✅ Page load time < 2s (p95)
- ✅ API response time < 200ms (p95)
- ✅ Database query time < 50ms (p95)
- ✅ Supports 100+ concurrent quote views
- ✅ Analytics never blocks UI (non-blocking implementation)

**Security:**
- ✅ No pricing recalculation
- ✅ No commission changes
- ✅ Token validation on every request
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ Rate limiting on analytics

### UX Acceptance

**Quote Comprehension:**
- ✅ Total price immediately clear (above fold)
- ✅ Per-person pricing understandable (below total)
- ✅ Currency explicit (ISO code + symbol)
- ✅ Inclusions/exclusions obvious (listed clearly)
- ✅ ZERO ambiguity (explicit breakdown, clear lists)

**Client Experience:**
- ✅ Page is fully responsive (mobile, tablet, desktop)
- ✅ Exactly ONE primary CTA per screen ("I'm interested")
- ✅ Secondary CTAs do not compete visually
- ✅ Clear CTAs with icons
- ✅ Expiration warning 3 days before expiry
- ✅ Contact form works without reload
- ✅ PDF download works offline

**Conversion CTAs:**
- ✅ Exactly ONE primary CTA per screen
- ✅ CTA language action-oriented and non-pushy
- ✅ CTA visible above-the-fold on mobile
- ✅ Secondary CTAs do not compete visually
- ✅ No dark patterns or pressure tactics

**Trust & Safety:**
- ✅ Agent identity clearly visible
- ✅ Reassurance copy present
- ✅ No misleading urgency
- ✅ No fake scarcity
- ✅ Clear explanation of next steps after CTA

**Agent Attribution:**
- ✅ Agent remains clearly associated with quote
- ✅ No anonymous or platform-only framing
- ✅ Client knows who they are dealing with
- ✅ Contact path to agent is always available

**Information Hierarchy:**
- ✅ Most important info visible above fold
- ✅ Clear trip summary
- ✅ Pricing breakdown collapsible sections
- ✅ Flight details easy to scan
- ✅ Agent contact info prominent

### Business Acceptance

**Analytics:**
- ✅ Every page view logged
- ✅ Conversion events captured
- ✅ Dashboard shows quote views
- ✅ Dashboard shows conversion rate
- ✅ Dashboard shows time on page

**Agent Workflow:**
- ✅ Agents can copy public link
- ✅ Agents can extend expiration
- ✅ Agents see expiration warnings
- ✅ No disruption to Phase 2 workflow
- ✅ Links work in Email & WhatsApp templates

### Integration Acceptance

**Phase 2 Compatibility:**
- ✅ No breaking changes to Phase 2 API
- ✅ Phase 2 send modal still works
- ✅ Phase 2 pricing preserved
- ✅ Phase 2 counters still accurate
- ✅ No regression in sending functionality

---

## 📅 IMPLEMENTATION PHASES

### Phase 3.0: Core Public Link (Week 1-2)

**Week 1: Backend Foundation**
- Database schema changes
- Token generation logic
- Public quote API endpoint
- Analytics API endpoint (non-blocking)
- Expiration logic

**Week 2: Frontend Implementation**
- Public quote page
- Quote display components
- Client action buttons (CTA hierarchy)
- Analytics tracking (non-blocking)
- Responsive design
- Pricing display UX
- Agent attribution component

### Phase 3.1: Analytics Dashboard (Week 3)

**Week 3: Agent Tools**
- Quote views dashboard
- Conversion metrics
- Expiration warnings
- Extend expiry functionality
- Analytics export

### Phase 3.2: Hardening & Polish (Week 4)

**Week 4: Production Readiness**
- Performance optimization
- Security audit
- E2E testing
- QA testing
- Documentation
- Deployment

---

## 📊 METRICS & KPIs

### Technical Metrics

**Performance:**
- Page load time: Target < 2s (p95)
- API response time: Target < 200ms (p95)
- Database query time: Target < 50ms (p95)
- Error rate: Target < 0.1%
- Analytics blocking rate: Target 0% (non-blocking)

**Reliability:**
- Uptime: Target 99.9%
- Token validation success rate: Target 100%
- Analytics event success rate: Target 99.9%

### Business Metrics

**Adoption:**
- Public link usage rate: % of quotes sent via link
- Link click-through rate: % of recipients opening link
- Average views per quote: Target 3-5

**Conversion:**
- Accept rate: % of viewed quotes with "I'm interested" click
- Request changes rate: % of viewed quotes requesting modifications
- Time to accept: Average time from first view to accept

**Engagement:**
- Average time on page: Target 2-5 minutes
- Scroll depth: Target 75% of page
- PDF download rate: % of viewed quotes downloading PDF

---

## 🔒 SECURITY CONSIDERATIONS

### Token Security
- Use cryptographically secure UUID v4
- No sequential patterns
- 36-character length sufficient for entropy
- Never expose internal quote IDs
- Validate token on every request

### Data Privacy
- GDPR-compliant logging
- No PII in analytics (except client-provided)
- Data retention policy: 90 days
- No cross-site tracking

### Access Control
- Public access token-based only
- No authentication required (by design)
- Rate limiting: 10 requests/minute per token
- IP-based abuse detection

### OWASP Top 10 Coverage
- ✅ Injection: Parameterized queries (Prisma)
- ✅ Broken Auth: Not applicable (public access)
- ✅ XSS: React auto-escaping
- ✅ Broken Access: Token validation
- ✅ Security Misconfiguration: Environment variables
- ✅ Sensitive Data: No secrets in client code
- ⏳ CSRF: Planned for Phase 3.1
- ✅ Using Known Vulnerabilities: Latest dependencies
- ⏳ Logging & Monitoring: Basic logging (Phase 3.1)
- ⏳ SSRF: Not applicable (no external API calls)

---

## 📝 DEPENDENCIES & ASSUMPTIONS

### Phase 2 Dependencies
- ✅ `agentQuote` table exists (from Phase 1)
- ✅ `sentAt` field exists (from Phase 2)
- ✅ `emailSentCount`, `smsSentCount` fields exist (from Phase 2)
- ✅ Send Quote Modal working (from Phase 2)
- ✅ Quote pricing stored correctly (from Phase 2)

### System Dependencies
- ✅ Prisma ORM for database access
- ✅ Next.js App Router for routing
- ✅ React for frontend components
- ✅ Zod for validation (reuse from Phase 2)
- ✅ Vercel for deployment

### External Dependencies
- ⏳ Email service (reuse Phase 2 integration)
- ⏳ PDF generation (reuse existing PDF service)

### Assumptions
- Database supports UUID generation
- Client timezone handling is acceptable
- No need for internationalization (Phase 3)
- Agent quote workflow remains unchanged
- Client has modern browser (ES6+ support)
- `navigator.sendBeacon()` API available (modern browsers)

---

## 🚧 TESTING STRATEGY

### Unit Testing
- Token generation logic
- Expiration calculation
- Token validation
- Event payload validation
- Analytics batching logic

### Integration Testing
- Public quote API endpoints
- Analytics event logging (non-blocking)
- Quote expiration flow
- Extend expiry functionality

### E2E Testing
- Agent creates quote → generates link
- Client opens link → views quote
- Client clicks primary CTA → contact form opens
- Client accepts quote → event logged
- Agent sees view count updated
- Quote expires → 410 page
- Analytics verify non-blocking behavior

### Performance Testing
- Load test: 100 concurrent quote views
- Stress test: 1000 requests/minute
- Database query performance
- API response times
- Analytics batching efficiency

### Security Testing
- Token enumeration attempts
- SQL injection attempts
- XSS payload testing
- Rate limiting verification
- sendBeacon non-blocking verification

---

## 📦 DELIVERABLES CHECKLIST

### Code Deliverables
- [ ] Public quote page (`app/quote/[token]/page.tsx`)
- [ ] Quote display components (flight, hotel, pricing with UX spec)
- [ ] Client action buttons (primary + secondary, CTA hierarchy)
- [ ] Agent attribution component (ClientQuoteHeader.tsx)
- [ ] Trust signals (badges, copy)
- [ ] Analytics tracking hook (non-blocking, batching)
- [ ] Public quote API endpoint
- [ ] Analytics API endpoint (non-blocking)
- [ ] Extend expiry API endpoint
- [ ] Database schema migrations

### Documentation Deliverables
- [ ] API documentation for public endpoints
- [ ] Analytics event documentation (non-blocking)
- [ ] Token security guidelines
- [ ] Expiration policy documentation
- [ ] Client-facing help documentation
- [ ] Pricing display UX specification
- [ ] CTA hierarchy specification
- [ ] Agent attribution guidelines

### Testing Deliverables
- [ ] Unit test suite (80%+ coverage)
- [ ] Integration test suite
- [ ] E2E test scenarios
- [ ] Performance test report
- [ ] Security test report
- [ ] Analytics non-blocking test report

### Deployment Deliverables
- [ ] Database migration scripts
- [ ] Environment variable documentation
- [ ] Deployment checklist
- [ ] Rollback procedure
- [ ] Monitoring setup

---

## 🔄 PHASE 3 CLOSURE

**Phase 3 will be considered COMPLETE when:**
- ✅ All success criteria met
- ✅ All deliverables completed
- ✅ Security audit passed
- ✅ Performance targets achieved
- ✅ E2E tests passing
- ✅ Documentation complete
- ✅ Production deployed successfully
- ✅ Monitoring active
- ✅ All audit checkpoints passed

**Phase 3 Eligibility:** January 30, 2026 (after Phase 2 7-day monitoring)

---

**Document Version:** 2.0 - AUDIT CORRECTED  
**Last Updated:** January 23, 2026  
**Next Review:** Post-Phase 3 Kickoff  
**Owner:** Engineering Lead
