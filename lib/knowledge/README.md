# Travel Knowledge Base System

A comprehensive knowledge base system for AI travel consultants, providing accurate, fact-based information about flights, hotels, legal regulations, visas, and travel tips.

## Overview

This knowledge base contains structured information about:

- **Flights**: Baggage policies, fare classes, airline alliances, cancellation rules
- **Hotels**: Check-in/out policies, star ratings, amenities, loyalty programs
- **Legal**: EU261, DOT regulations, passenger rights, compensation rules
- **Visa**: Requirements by country, passport rules, visa waiver programs
- **Travel Tips**: Packing, security, booking timing, jet lag, insurance

## Structure

```
lib/knowledge/
├── flights.ts         # Flight-related knowledge
├── hotels.ts          # Hotel policies and information
├── legal.ts           # Travel regulations and passenger rights
├── visa.ts            # Visa requirements and passport rules
├── travel-tips.ts     # Practical travel advice
├── query.ts           # Smart query system
├── index.ts           # Central exports
└── README.md          # This file
```

## Usage

### Basic Query

```typescript
import { queryKnowledge } from '@/lib/knowledge';

// Query the knowledge base
const result = queryKnowledge(
  'flights',
  'What is EU261 compensation?'
);

if (result) {
  console.log(result.answer);
  console.log('Sources:', result.sources);
  console.log('Confidence:', result.confidence);
}
```

### Specific Knowledge Lookup

```typescript
import {
  getBaggagePolicy,
  getFareClass,
  getCompensationAmount,
  getPassportValidityRequirement
} from '@/lib/knowledge';

// Get baggage policy for specific airline
const policy = getBaggagePolicy('United Airlines');

// Get fare class details
const fareClass = getFareClass('J'); // Business class

// Calculate compensation
const amount = getCompensationAmount('EU261', 2000, 4);

// Check passport validity requirements
const validity = getPassportValidityRequirement('Thailand');
```

### Integration with AI Consultant

```typescript
import { queryKnowledge } from '@/lib/knowledge';

async function handleConsultantQuery(userMessage: string) {
  // First, check knowledge base
  const knowledgeResult = queryKnowledge('general', userMessage);

  if (knowledgeResult && knowledgeResult.confidence === 'high') {
    // Use knowledge base answer
    return {
      message: knowledgeResult.answer,
      sources: knowledgeResult.sources,
      relatedTopics: knowledgeResult.relatedTopics
    };
  }

  // Fall back to AI generation if no high-confidence answer
  const aiResponse = await generateAIResponse(userMessage);
  return aiResponse;
}
```

## Query Types Supported

The query system automatically detects and handles:

### Flight Queries
- Baggage allowances and fees
- Fare class explanations
- Cancellation policies
- Change fees
- Airline alliances

### Compensation Queries
- EU Regulation 261/2004
- US DOT regulations
- Montreal Convention
- Passenger rights
- Claim procedures

### Visa Queries
- Visa requirements by country
- Passport validity rules
- Visa waiver programs
- Processing times
- Application tips

### Hotel Queries
- Check-in/check-out times
- Cancellation policies
- Star rating meanings
- Amenities and fees
- Loyalty programs

### Travel Tips Queries
- Packing advice
- Airport security
- Booking timing
- Jet lag management
- Travel insurance

## Query Result Format

```typescript
interface QueryResult {
  answer: string;              // Formatted markdown answer
  sources: string[];           // Knowledge base sources used
  confidence: 'high' | 'medium' | 'low';
  relatedTopics?: string[];    // Suggested related topics
}
```

## Examples

### Example 1: Baggage Query

```typescript
const result = queryKnowledge(
  'flights',
  'How much baggage can I bring on United Airlines?'
);

// Returns detailed baggage policy with:
// - Carry-on allowance
// - Checked bag allowance by cabin
// - Weight limits
// - Additional fees
```

### Example 2: Compensation Query

```typescript
const result = queryKnowledge(
  'legal',
  'My flight from Paris to New York was delayed 4 hours. Can I get compensation?'
);

// Returns EU261 compensation information:
// - Eligibility criteria
// - Compensation amount (€600 for 3,500km+ with 4+ hour delay)
// - How to claim
// - Additional rights
```

### Example 3: Visa Query

```typescript
const result = queryKnowledge(
  'visa',
  'Do I need a visa for Thailand?',
  { nationality: 'US' }
);

// Returns visa requirements:
// - Visa-free for US citizens (60 days)
// - Passport validity (6 months)
// - Extension options
// - Entry requirements
```

## Adding New Knowledge

### Add New Airlines

```typescript
// In flights.ts
export const BAGGAGE_POLICIES: BaggagePolicy[] = [
  // Add new airline policy
  {
    airline: "New Airline",
    cabinBaggage: "1 personal item + 1 carry-on",
    checkedBaggage: {
      economy: "1 bag included",
      business: "2 bags included"
    },
    weight: {
      cabin: "10 kg",
      checked: "23 kg"
    }
  }
];
```

### Add New Countries

```typescript
// In visa.ts
export const VISA_REQUIREMENTS_COMMON: VisaRequirement[] = [
  // Add new country
  {
    country: "New Country",
    visaRequired: {
      "US": "visa-free",
      "Most countries": "visa-required"
    },
    maxStay: "90 days",
    passportValidity: "6 months"
  }
];
```

## Best Practices

1. **Always Check Knowledge Base First**: Before generating AI responses, query the knowledge base
2. **Use High Confidence Results**: Only use results with 'high' confidence directly
3. **Combine with Context**: Pass relevant context (airline, destination) for better results
4. **Cite Sources**: Always include sources in responses to users
5. **Keep Updated**: Travel regulations change - update knowledge base regularly
6. **Handle "I Don't Know"**: If no high-confidence answer, be honest with users

## Integration Examples

### With Chat Component

```typescript
// In your chat handler
const handleMessage = async (message: string) => {
  // Check knowledge base
  const knowledge = queryKnowledge('general', message);

  if (knowledge && knowledge.confidence === 'high') {
    return {
      type: 'knowledge',
      content: knowledge.answer,
      sources: knowledge.sources,
      relatedTopics: knowledge.relatedTopics
    };
  }

  // Generate AI response with knowledge context
  const context = knowledge ? `Background info: ${knowledge.answer}` : '';
  return generateAIResponse(message, context);
};
```

### With API Route

```typescript
// app/api/consultant/route.ts
import { queryKnowledge } from '@/lib/knowledge';

export async function POST(req: Request) {
  const { message } = await req.json();

  // Query knowledge base
  const result = queryKnowledge('general', message);

  if (result && result.confidence === 'high') {
    return Response.json({
      answer: result.answer,
      type: 'knowledge-based',
      sources: result.sources
    });
  }

  // Fall back to AI
  const aiResponse = await generateAIResponse(message);
  return Response.json({
    answer: aiResponse,
    type: 'ai-generated'
  });
}
```

## Maintenance

### Regular Updates Needed For:

1. **Baggage Policies**: Airlines change policies 1-2 times per year
2. **Compensation Amounts**: EU261 amounts adjusted for inflation
3. **Visa Requirements**: Change frequently, check quarterly
4. **Hotel Policies**: Major chains update occasionally
5. **Booking Tips**: Seasonal patterns and best practices evolve

### Update Checklist:

- [ ] Review airline baggage policies quarterly
- [ ] Check EU261 compensation amounts annually
- [ ] Update visa requirements monthly (critical!)
- [ ] Review hotel chain loyalty programs annually
- [ ] Update travel tips based on user feedback
- [ ] Add new airlines/hotels as they become relevant

## Testing

```typescript
// Test knowledge queries
describe('Knowledge Base', () => {
  it('should return baggage policy for United', () => {
    const result = queryKnowledge('flights', 'United baggage policy');
    expect(result).toBeTruthy();
    expect(result?.confidence).toBe('high');
  });

  it('should return EU261 compensation info', () => {
    const result = queryKnowledge('legal', 'EU261 compensation');
    expect(result).toBeTruthy();
    expect(result?.answer).toContain('€250');
  });

  it('should handle unknown queries gracefully', () => {
    const result = queryKnowledge('general', 'asdfghjkl');
    expect(result).toBeNull();
  });
});
```

## Contributing

When adding new knowledge:

1. Follow existing data structure formats
2. Include all required fields
3. Add sources and references
4. Test queries work correctly
5. Update this README if adding new categories
6. Keep information accurate and up-to-date

## License

This knowledge base is part of the Fly2Any project.

## Support

For questions or issues with the knowledge base:
1. Check this README first
2. Review the query.ts implementation
3. Test your query with different phrasings
4. Check confidence levels
5. Fall back to AI generation if needed

---

**Note**: This knowledge base provides general information. Always advise users to verify critical information (visa requirements, compensation eligibility) with official sources before making decisions.
