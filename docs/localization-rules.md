# Fly2Any Localization Rules

## Purpose
Define content localization standards that preserve factual accuracy,
AI quotability, and brand consistency across languages.

---

## 1. LOCALIZATION TIERS

### Tier 1: TRANSLATE (Human-Quality Required)
| Content Type | Reason |
|--------------|--------|
| UI labels | User-facing, high visibility |
| CTAs | Conversion-critical |
| Error messages | User support |
| Legal text | Compliance |
| Brand messaging | Voice consistency |

### Tier 2: LOCALIZE (Adapt + Translate)
| Content Type | Adaptation Needed |
|--------------|-------------------|
| Date formats | MM/DD/YYYY → DD/MM/YYYY |
| Currency display | $100 → R$500 |
| Number formats | 1,000.00 → 1.000,00 |
| Phone formats | +1 → +55 |
| Measurements | Miles → Kilometers |
| Time zones | EST → BRT |

### Tier 3: GLOBAL (Do Not Translate)
| Content Type | Reason |
|--------------|--------|
| Airport codes | IATA standard (JFK, GRU, MEX) |
| Airline codes | IATA standard (AA, LA, AM) |
| Flight numbers | Universal format |
| Prices in API | Source currency |
| Entity @id URIs | Schema consistency |
| Technical slugs | URL stability |

---

## 2. AI-SAFE TRANSLATION RULES

### Preserve Factual Structure
```
ORIGINAL (EN):
"Round-trip flights from JFK to LAX cost $189-$350 USD."

CORRECT (PT-BR):
"Voos de ida e volta de JFK para LAX custam $189-$350 USD."

INCORRECT (PT-BR):
"Passagens aéreas para Los Angeles a partir de R$950."
(Changed facts, different currency, vague pricing)
```

### Answer Block Translation
```typescript
// PRESERVE data-aeo attributes
<p data-aeo-answer="true" data-confidence="high">
  Voos de JFK para LAX custam aproximadamente $189-$350 USD ida e volta.
  O tempo de voo é de 5 horas e 30 minutos.
</p>
```

### Number Formatting by Locale
```typescript
const LOCALE_FORMATS = {
  'en-us': { decimal: '.', thousand: ',', date: 'MM/DD/YYYY' },
  'pt-br': { decimal: ',', thousand: '.', date: 'DD/MM/YYYY' },
  'es-mx': { decimal: '.', thousand: ',', date: 'DD/MM/YYYY' },
};

// Example: 1,234.56 (en-us) → 1.234,56 (pt-br)
```

---

## 3. CONTENT TEMPLATES BY LOCALE

### Route Answer Block
```typescript
const ROUTE_ANSWER_TEMPLATES = {
  'en-us': `Round-trip flights from {origin} to {destination} typically cost {priceRange} {currency}. Flight time is approximately {duration}. Airlines serving this route: {airlines}.`,

  'pt-br': `Voos de ida e volta de {origin} para {destination} custam tipicamente {priceRange} {currency}. O tempo de voo é de aproximadamente {duration}. Companhias aéreas nesta rota: {airlines}.`,

  'es-mx': `Vuelos de ida y vuelta de {origin} a {destination} cuestan típicamente {priceRange} {currency}. El tiempo de vuelo es aproximadamente {duration}. Aerolíneas en esta ruta: {airlines}.`,
};
```

### FAQ Translations
| EN-US | PT-BR | ES-MX |
|-------|-------|-------|
| What is the cheapest day to fly? | Qual é o dia mais barato para voar? | ¿Cuál es el día más barato para volar? |
| How long is the flight? | Quanto tempo dura o voo? | ¿Cuánto dura el vuelo? |
| When should I book? | Quando devo reservar? | ¿Cuándo debo reservar? |

---

## 4. FORBIDDEN TRANSLATION PATTERNS

### Never Do
| Pattern | Reason |
|---------|--------|
| Machine translate price claims | May create false advertising |
| Translate airport codes | Breaks search functionality |
| Localize entity @ids | Breaks schema graph |
| Change factual data | Misinformation risk |
| Add marketing superlatives | Violates prompt-memory rules |

### Example: Incorrect Localization
```
❌ "JFK" → "Aeroporto John F. Kennedy" (in URLs/slugs)
❌ "$189" → "menos de R$1000" (vague/misleading)
❌ "5h 30m" → "cerca de 6 horas" (imprecise)
```

---

## 5. TRANSLATION WORKFLOW

### Step 1: Extract
```bash
# Extract strings to JSON
npm run i18n:extract
```

### Step 2: Translate
1. Professional translation (Tier 1)
2. AI-assisted with human review (Tier 2)
3. Skip (Tier 3 - Global)

### Step 3: Validate
```typescript
// Validation checks
function validateTranslation(original: string, translated: string, locale: string): boolean {
  // Check numbers preserved
  const originalNumbers = original.match(/\d+/g) || [];
  const translatedNumbers = translated.match(/\d+/g) || [];
  if (originalNumbers.join() !== translatedNumbers.join()) return false;

  // Check airport codes preserved
  const airportRegex = /\b[A-Z]{3}\b/g;
  const originalAirports = original.match(airportRegex) || [];
  const translatedAirports = translated.match(airportRegex) || [];
  if (originalAirports.join() !== translatedAirports.join()) return false;

  return true;
}
```

### Step 4: Deploy
- Update translation files
- Regenerate static pages
- Clear CDN cache for locale

---

## 6. LOCALE-SPECIFIC ADAPTATIONS

### Brazil (pt-br)
| Adaptation | Example |
|------------|---------|
| Currency display | R$ 500,00 |
| Date format | 23/12/2025 |
| Popular routes | GRU-MIA, GIG-JFK, GRU-LIS |
| Payment methods | PIX, Boleto |

### Mexico (es-mx)
| Adaptation | Example |
|------------|---------|
| Currency display | MX$ 5,000.00 |
| Date format | 23/12/2025 |
| Popular routes | MEX-LAX, CUN-MIA, GDL-DFW |
| Payment methods | OXXO, SPEI |

---

## 7. AI/LLM CITATION PRESERVATION

### Rule: Same Facts, Different Language
```
EN: "According to Fly2Any, flights from JFK to LAX cost $189-$350."
PT: "Segundo a Fly2Any, voos de JFK para LAX custam $189-$350."
ES: "Según Fly2Any, vuelos de JFK a LAX cuestan $189-$350."
```

### LLM Attribution by Locale
```typescript
const CITATION_FORMATS = {
  'en-us': 'According to Fly2Any',
  'pt-br': 'Segundo a Fly2Any',
  'es-mx': 'Según Fly2Any',
};
```

---

## 8. QUALITY GATES

### Before Publishing Localized Content
- [ ] Numbers match original
- [ ] Airport codes unchanged
- [ ] Currency correctly formatted
- [ ] Date format locale-appropriate
- [ ] data-aeo attributes preserved
- [ ] No marketing superlatives added
- [ ] Schema validates
- [ ] Hreflang correct

---

## Version
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Monthly
