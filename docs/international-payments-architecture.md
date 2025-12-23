# Fly2Any International Payments Architecture

## Purpose
Enable international payment methods (starting with Brazil) while maintaining:
- US legal entity as sole settlement recipient
- USD as base accounting currency
- No local entity creation
- No tax/compliance exposure

---

## CURRENT STATE

### Payment Stack
```
Provider: Stripe
Currency: USD only
Methods: Card (Visa, MC, Amex)
Settlement: US bank account
Entity: US LLC
```

### Limitations
- No PIX (Brazil instant payment)
- No Boleto (Brazil bank slip)
- No OXXO (Mexico cash)
- FX handled by card networks (high spread)

---

## ARCHITECTURE OPTIONS

### Option A: Stripe Global (Gateway FX)

```
┌─────────────────────────────────────────────────────────┐
│                    BRAZIL USER                          │
│                   Pays BRL 950                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 STRIPE (GLOBAL)                         │
│   • Accepts BRL via card/PIX                            │
│   • Converts BRL → USD at Stripe rate                   │
│   • Settles USD to Fly2Any US account                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FLY2ANY US BANK (USD)                      │
│              Receives ~$189 USD                         │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Single integration
- No local entity needed
- Stripe handles compliance
- Fast settlement (2 days)

**Cons:**
- Stripe FX spread (2-3%)
- No PIX support currently
- Limited to Stripe-supported methods

---

### Option B: Local Gateway (Mercado Pago) + Remittance

```
┌─────────────────────────────────────────────────────────┐
│                    BRAZIL USER                          │
│              Pays BRL 950 via PIX                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MERCADO PAGO (BRAZIL)                      │
│   • Accepts PIX, Boleto, Cards                          │
│   • Holds BRL in MP account                             │
│   • Requires local entity OR partner                    │
└────────────────────────┬────────────────────────────────┘
                         │ Weekly remittance
                         ▼
┌─────────────────────────────────────────────────────────┐
│            FX PROVIDER (WISE/PAYONEER)                  │
│   • Converts BRL → USD                                  │
│   • Better rates than Stripe                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FLY2ANY US BANK (USD)                      │
│              Receives ~$192 USD                         │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- PIX, Boleto support
- Better FX rates
- Local payment UX
- Higher conversion rates

**Cons:**
- Complex setup
- May need local partner
- Settlement delay (5-7 days)
- Compliance overhead

---

### Option C: Hybrid (dLocal or Stripe + Connect)

```
┌─────────────────────────────────────────────────────────┐
│                    BRAZIL USER                          │
│              Chooses payment method                     │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
        Card    │                     │ PIX/Boleto
                ▼                     ▼
┌───────────────────────┐   ┌─────────────────────────────┐
│   STRIPE (CARDS)      │   │   dLOCAL (LOCAL METHODS)    │
│   FX at Stripe rate   │   │   Collects BRL              │
│   2-day settlement    │   │   Settles USD to US         │
└───────────┬───────────┘   └──────────────┬──────────────┘
            │                              │
            └──────────────┬───────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│              FLY2ANY US BANK (USD)                      │
│              Single USD settlement                      │
└─────────────────────────────────────────────────────────┘
```

**Pros:**
- Best of both worlds
- All local methods supported
- USD settlement (no local entity)
- dLocal handles compliance

**Cons:**
- Two integrations
- dLocal minimum volume
- Higher per-transaction for low volume

---

## COST COMPARISON

### Transaction: BRL 950 (~$189 USD)

| Model | Gateway Fee | FX Spread | Total Cost | Net to Fly2Any |
|-------|-------------|-----------|------------|----------------|
| **A: Stripe Global** | 2.9% + $0.30 | 2.5% | 5.7% | $178.22 |
| **B: Mercado Pago** | 3.5% | 1.0% (Wise) | 4.8% | $179.92 |
| **C: dLocal** | 4.5% | 0% (USD) | 4.5% | $180.50 |
| **Baseline: Card FX** | 2.9% + $0.30 | 3-5% | 6.2%+ | $177.29 |

### Annual Volume Projection (1000 BR transactions/month)

| Model | Monthly Volume | Monthly Cost | Annual Cost |
|-------|----------------|--------------|-------------|
| Stripe Global | $189,000 | $10,773 | $129,276 |
| Mercado Pago | $189,000 | $9,072 | $108,864 |
| dLocal | $189,000 | $8,505 | $102,060 |

**Winner**: dLocal at scale, Stripe for simplicity

---

## PROVIDER COMPARISON

### Stripe (Current)

| Feature | Status |
|---------|--------|
| Cards (BR) | ✅ Supported |
| PIX | ❌ Not supported |
| Boleto | ✅ Supported (limited) |
| Settlement currency | USD |
| Local entity required | No |
| FX handling | Stripe rate |
| Integration effort | Low (existing) |

### dLocal

| Feature | Status |
|---------|--------|
| Cards (BR) | ✅ Supported |
| PIX | ✅ Supported |
| Boleto | ✅ Supported |
| Settlement currency | USD |
| Local entity required | No |
| FX handling | Included |
| Integration effort | Medium |
| Minimum volume | ~$50K/month |

### Mercado Pago

| Feature | Status |
|---------|--------|
| Cards (BR) | ✅ Supported |
| PIX | ✅ Supported |
| Boleto | ✅ Supported |
| Settlement currency | BRL (need remittance) |
| Local entity required | Recommended |
| FX handling | External |
| Integration effort | High |

---

## RECOMMENDATION: MVP APPROACH

### Phase 1: Stripe Cards + Currency Display (Now)
```
• Keep Stripe for all payments
• Show prices in BRL (display only)
• Charge in USD (let card network convert)
• No new integration required
```

**Implementation:**
```typescript
// Display BRL, charge USD
const displayPrice = await convertCurrency(usdPrice, 'USD', 'BRL');
const chargePrice = usdPrice; // Always USD

// UI shows: "R$ 950 (charged as ~$189 USD)"
```

### Phase 2: dLocal for PIX (When volume justifies)
```
• Add dLocal for PIX/Boleto
• Route based on payment method
• Keep Stripe for US/EU cards
```

**Trigger criteria:**
- >500 BR transactions/month
- >$50K/month BR volume
- PIX demand validated

### Phase 3: Full Hybrid (Scale)
```
• Intelligent routing
• Best rate selection
• Multi-provider fallback
```

---

## IMPLEMENTATION ARCHITECTURE

### Payment Router
```typescript
// lib/payments/router.ts
interface PaymentRoute {
  provider: 'stripe' | 'dlocal';
  method: string;
  currency: string;
  settlementCurrency: 'USD';
}

function routePayment(
  country: string,
  method: string,
  amount: number
): PaymentRoute {
  // Phase 1: Everything through Stripe
  if (!DLOCAL_ENABLED) {
    return {
      provider: 'stripe',
      method: 'card',
      currency: 'USD',
      settlementCurrency: 'USD',
    };
  }

  // Phase 2+: Route PIX to dLocal
  if (country === 'BR' && method === 'pix') {
    return {
      provider: 'dlocal',
      method: 'pix',
      currency: 'BRL',
      settlementCurrency: 'USD',
    };
  }

  // Default: Stripe
  return {
    provider: 'stripe',
    method: 'card',
    currency: 'USD',
    settlementCurrency: 'USD',
  };
}
```

### Feature Flags
```typescript
// lib/config/feature-flags.ts
export const PAYMENT_FLAGS = {
  // Phase 1: Display only
  SHOW_LOCAL_CURRENCY: true,

  // Phase 2: dLocal integration
  DLOCAL_ENABLED: false,
  DLOCAL_PIX_ENABLED: false,
  DLOCAL_BOLETO_ENABLED: false,

  // Phase 3: Routing
  SMART_ROUTING_ENABLED: false,

  // Countries enabled for local methods
  LOCAL_METHODS_COUNTRIES: ['BR'],
};
```

---

## CURRENCY DISPLAY GOVERNANCE

### Rule: Schema Must Match Display

```typescript
// If showing BRL in UI, schema must show BRL
// If charging USD, add disclaimer

interface PriceDisplay {
  displayAmount: number;      // 950
  displayCurrency: string;    // BRL
  chargeAmount: number;       // 189
  chargeCurrency: string;     // USD
  schemaAmount: number;       // 950 (matches display)
  schemaCurrency: string;     // BRL (matches display)
  disclaimer: string;         // "Charged in USD at checkout"
}
```

### Checkout Flow
```
1. User sees: R$ 950
2. Schema shows: priceCurrency: BRL, lowPrice: 950
3. At checkout: "You'll be charged ~$189 USD"
4. Card statement: $189.XX USD
```

---

## RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FX rate fluctuation | HIGH | MEDIUM | Lock rate at checkout |
| dLocal downtime | LOW | HIGH | Stripe fallback |
| Compliance change | MEDIUM | HIGH | dLocal handles |
| Chargebacks (PIX) | LOW | LOW | PIX is instant/final |
| Tax exposure | MEDIUM | HIGH | No local entity |
| Currency mismatch | MEDIUM | MEDIUM | Governance rules |

---

## MONITORING

### Metrics to Track
```typescript
const PAYMENT_METRICS = {
  // Volume
  transactionsByCountry: 'payment.country',
  transactionsByMethod: 'payment.method',
  transactionsByProvider: 'payment.provider',

  // Cost
  fxSpreadActual: 'payment.fx_spread',
  gatewayFeesTotal: 'payment.gateway_fees',
  effectiveCost: 'payment.effective_cost',

  // Performance
  paymentSuccessRate: 'payment.success_rate',
  settlementDelay: 'payment.settlement_days',
  chargebackRate: 'payment.chargeback_rate',
};
```

### Alerts
| Metric | Threshold | Action |
|--------|-----------|--------|
| FX spread > 4% | Alert | Review provider |
| Success rate < 95% | Alert | Investigate |
| Settlement > 5 days | Warning | Contact provider |
| Chargebacks > 1% | Critical | Review fraud |

---

## ROLLOUT PLAN

### Week 1-2: Currency Display
- [ ] Enable BRL display for BR users
- [ ] Add USD disclaimer at checkout
- [ ] Verify schema compliance
- [ ] Monitor conversion rates

### Week 3-4: Baseline Metrics
- [ ] Track BR transaction volume
- [ ] Measure FX spread (card networks)
- [ ] Survey PIX demand
- [ ] Evaluate dLocal pricing

### Month 2+: dLocal Integration (If Justified)
- [ ] Sign dLocal agreement
- [ ] Implement PIX flow
- [ ] A/B test vs Stripe
- [ ] Full rollout

---

## VERSION
- Created: 2025-12-23
- Status: PLANNING
- Owner: Platform Engineering
- Review: Before any implementation
