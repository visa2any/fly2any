# Fly2Any Safe Implementation List

## Purpose
Explicit classification of what CAN and CANNOT be implemented now.
Prevents accidental activation of blocked features.

---

## SAFE TO IMPLEMENT NOW

### Category: US Conversion Optimization

| Feature | Risk | Dependencies | Notes |
|---------|------|--------------|-------|
| Trust badges on checkout | NONE | UI only | Do it |
| Price confidence indicator | NONE | Existing data | Do it |
| Apple Pay | LOW | Stripe config | US cards only |
| Google Pay | LOW | Stripe config | US cards only |
| Save card for future | LOW | Stripe + DB | US only |
| Payment error recovery | NONE | Error handling | Do it |
| Mobile checkout simplification | LOW | UI refactor | A/B test |
| Email confirmation improvement | NONE | Template only | Do it |
| Search result caching | LOW | Redis/Edge | Performance |
| Skeleton loaders | NONE | UI only | Do it |

### Category: Analytics & Monitoring

| Feature | Risk | Dependencies | Notes |
|---------|------|--------------|-------|
| Funnel tracking | NONE | Analytics | Do it |
| Payment success metrics | NONE | Stripe webhook | Do it |
| Error tracking by step | NONE | Sentry | Do it |
| A/B test framework | LOW | Analytics | Do it |
| Search-to-booking correlation | NONE | Analytics | Do it |

### Category: SEO (US Only)

| Feature | Risk | Dependencies | Notes |
|---------|------|--------------|-------|
| New route pages (US routes) | NONE | Existing system | Do it |
| Schema improvements | LOW | Governance compliant | Review first |
| Internal linking optimization | NONE | Existing system | Do it |
| Answer block refinements | NONE | Existing system | Do it |
| Sitemap optimization | LOW | Existing system | Do it |

### Category: Currency Display

| Feature | Risk | Dependencies | Notes |
|---------|------|--------------|-------|
| Show local currency | NONE | Existing system | Already works |
| Currency selector | NONE | UI only | Already exists |
| Exchange rate refresh | NONE | API only | Already works |
| Price disclaimer | NONE | UI text | Add if missing |

---

## BLOCKED UNTIL ACTIVATION

### Category: International SEO

| Feature | Status | Blocker | Activation Condition |
|---------|--------|---------|---------------------|
| Hreflang tags | BLOCKED | Governance | Executive approval |
| Locale URLs (`/pt-br/`) | BLOCKED | Governance | Readiness checklist |
| Translated route pages | BLOCKED | Content | Translation QA |
| Non-US sitemaps | BLOCKED | SEO | Locale activation |
| Locale-specific schema | BLOCKED | Governance | Locale activation |

### Category: International Payments

| Feature | Status | Blocker | Activation Condition |
|---------|--------|---------|---------------------|
| PIX (Brazil) | BLOCKED | No provider | dLocal contract |
| Boleto (Brazil) | BLOCKED | No provider | dLocal contract |
| OXXO (Mexico) | BLOCKED | No provider | dLocal contract |
| BRL charging | BLOCKED | No settlement | Local entity OR dLocal |
| MXN charging | BLOCKED | No settlement | Local entity OR dLocal |
| EUR charging | BLOCKED | Business decision | When EU market opens |

### Category: Multi-PSP

| Feature | Status | Blocker | Activation Condition |
|---------|--------|---------|---------------------|
| dLocal integration | BLOCKED | Contract | Volume commitment |
| Mercado Pago | BLOCKED | Entity | Local partner OR entity |
| Payment routing | BLOCKED | No PSPs | At least 2 PSPs |
| Smart retry across PSPs | BLOCKED | No PSPs | Multi-PSP live |

### Category: Local Entities

| Feature | Status | Blocker | Activation Condition |
|---------|--------|---------|---------------------|
| Brazil entity | NOT PLANNED | Business | Never (use dLocal) |
| Mexico entity | NOT PLANNED | Business | Never (use dLocal) |
| UK entity | NOT PLANNED | Business | If EU volume justifies |

---

## REQUIRES APPROVAL

### Before Implementation
| Feature | Approver | Reason |
|---------|----------|--------|
| New payment method | Finance | Revenue impact |
| Schema changes | SEO Lead | Authority risk |
| New page types | Product | Content strategy |
| Third-party integration | Security | Data exposure |

### Before Activation (International)
| Feature | Approvers | Checklist |
|---------|-----------|-----------|
| Any locale | Exec + SEO + Eng | `locale-readiness-matrix.md` |
| Any local payment | Finance + Legal | Contract + compliance |
| Any local entity | CEO + Legal | Full assessment |

---

## FEATURE FLAGS REQUIRED

### Existing Flags
```typescript
// lib/config/feature-flags.ts
export const FLAGS = {
  // SAFE - can enable
  APPLE_PAY: false,         // Ready to enable
  GOOGLE_PAY: false,        // Ready to enable
  SAVE_CARD: false,         // Ready to enable
  TRUST_BADGES: true,       // Already enabled
  PRICE_CONFIDENCE: true,   // Already enabled

  // BLOCKED - do not enable
  HREFLANG_ACTIVE: false,   // GOVERNANCE BLOCKED
  LOCALE_ROUTING: false,    // GOVERNANCE BLOCKED
  PIX_ENABLED: false,       // PROVIDER BLOCKED
  DLOCAL_ENABLED: false,    // CONTRACT BLOCKED
  BRL_CHARGING: false,      // SETTLEMENT BLOCKED
};
```

### Flag Governance
```typescript
// Flags that require approval to change
const PROTECTED_FLAGS = [
  'HREFLANG_ACTIVE',
  'LOCALE_ROUTING',
  'PIX_ENABLED',
  'DLOCAL_ENABLED',
  'BRL_CHARGING',
];

// Runtime protection
function setFlag(name: string, value: boolean) {
  if (PROTECTED_FLAGS.includes(name) && value === true) {
    throw new Error(`Flag ${name} requires executive approval`);
  }
  // ... set flag
}
```

---

## CHECKLIST BEFORE ANY CHANGE

### Safe Changes
- [ ] Does NOT affect international SEO
- [ ] Does NOT enable blocked payments
- [ ] Does NOT activate locales
- [ ] Does NOT modify locked governance
- [ ] Has feature flag if reversible
- [ ] Has monitoring/alerting
- [ ] Has rollback plan

### Blocked Changes
If ANY of these are true, STOP:
- [ ] Modifies hreflang output
- [ ] Adds locale URL routing
- [ ] Enables non-USD charging
- [ ] Integrates blocked PSP
- [ ] Creates international content
- [ ] Modifies locked governance docs

---

## ROLLBACK PROCEDURES

### For Safe Features
```bash
# Feature flag rollback
fly2any-cli flags set FEATURE_NAME false

# Code rollback
git revert <commit>
vercel rollback
```

### For Accidental Activation
```bash
# EMERGENCY: If international SEO activated
1. Set HREFLANG_ACTIVE=false immediately
2. Set LOCALE_ROUTING=false
3. Deploy hotfix
4. Verify in GSC no hreflang errors
5. Post-mortem required

# EMERGENCY: If non-USD charging enabled
1. Set BRL_CHARGING=false immediately
2. Refund any non-USD charges
3. Contact affected customers
4. Post-mortem required
```

---

## VERSION
- Created: 2025-12-23
- Status: ACTIVE
- Owner: Platform Engineering
- Review: Before any feature work
