/**
 * SEO CONTENT GENERATOR AGENT
 * AI-powered programmatic content generation using Groq
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(prompt: string, maxTokens = 2000): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  h1: string;
  content: {
    priceOverview: string;
    bestTimeToBook: string;
    airlinesComparison: string;
    travelTips: string;
  };
  faqs: { question: string; answer: string }[];
  internalLinks: { text: string; href: string }[];
  schema: object;
}

export interface ContentInput {
  destination: string;
  month: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  airlines: string[];
  bookingWindow: string;
}

// Generate cheap flights page content
export async function generateCheapFlightsContent(
  input: ContentInput
): Promise<GeneratedContent> {
  const prompt = `You are an SEO content specialist for Fly2Any travel platform.

Generate content for: /cheap-flights/${input.destination}/${input.month}

DATA:
- Destination: ${input.destination}
- Month: ${input.month}
- Average Price: $${input.avgPrice}
- Lowest Price: $${input.minPrice}
- Highest Price: $${input.maxPrice}
- Price Trend: ${input.trend}
- Top Airlines: ${input.airlines.join(', ')}
- Best Booking Window: ${input.bookingWindow}

REQUIREMENTS:
1. Title: 60 chars max, include destination, month, price
2. Meta Description: 155 chars, include CTA
3. H1: Natural, include "cheap flights"
4. Content sections: 80-100 words each
5. 4 FAQs with data-backed answers
6. 3 internal links to related pages

CONSTRAINTS:
- Use ONLY provided data
- NO fictional statistics
- Prices must match exactly
- Year is 2025

Return valid JSON:
{
  "title": "...",
  "metaDescription": "...",
  "h1": "...",
  "content": {
    "priceOverview": "...",
    "bestTimeToBook": "...",
    "airlinesComparison": "...",
    "travelTips": "..."
  },
  "faqs": [{"question": "...", "answer": "..."}],
  "internalLinks": [{"text": "...", "href": "..."}]
}`;

  const text = await callGroq(prompt, 2000);
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse generated content');
  }

  const content = JSON.parse(jsonMatch[0]) as GeneratedContent;

  // Add schema
  content.schema = generateSchema(input, content);

  return content;
}

// Generate dynamic FAQs for route page
export async function generateRouteFAQs(
  origin: string,
  destination: string,
  data: {
    duration: string;
    airlines: string[];
    minPrice: number;
    avgPrice: number;
    dailyFlights: number;
  }
): Promise<{ question: string; answer: string }[]> {
  const prompt = `Generate 5 FAQs for flight route ${origin} to ${destination}.

DATA:
- Flight Duration: ${data.duration}
- Airlines: ${data.airlines.join(', ')}
- Price Range: $${data.minPrice} - $${data.avgPrice}
- Daily Flights: ${data.dailyFlights}

Rules:
- Use ONLY provided data
- Natural conversational tone
- Optimized for voice search
- Include specific numbers

Return JSON array:
[{"question": "...", "answer": "..."}]`;

  const text = await callGroq(prompt, 1000);
  const jsonMatch = text.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    return getDefaultFAQs(origin, destination, data);
  }

  return JSON.parse(jsonMatch[0]);
}

// Fallback FAQs
function getDefaultFAQs(
  origin: string,
  destination: string,
  data: { duration: string; airlines: string[]; minPrice: number; avgPrice: number }
) {
  return [
    {
      question: `How long is the flight from ${origin} to ${destination}?`,
      answer: `Direct flights take approximately ${data.duration}. Connecting flights may take longer.`,
    },
    {
      question: `How much do flights from ${origin} to ${destination} cost?`,
      answer: `Prices start from $${data.minPrice}. Average price is $${data.avgPrice}.`,
    },
    {
      question: `Which airlines fly from ${origin} to ${destination}?`,
      answer: `Airlines include ${data.airlines.slice(0, 3).join(', ')}.`,
    },
    {
      question: `When is the best time to book ${origin} to ${destination} flights?`,
      answer: `Book 2-3 months ahead for best prices. Tuesday departures are often cheapest.`,
    },
  ];
}

// Generate schema for page
function generateSchema(input: ContentInput, content: GeneratedContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Validate generated content
export function validateContent(content: GeneratedContent, input: ContentInput): {
  valid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];

  // Check title length
  if (content.title.length > 60) issues.push('Title too long');
  if (!content.title.toLowerCase().includes(input.destination.toLowerCase())) {
    issues.push('Title missing destination');
  }

  // Check meta description
  if (content.metaDescription.length > 160) issues.push('Meta description too long');

  // Check H1
  if (!content.h1) issues.push('Missing H1');

  // Check content sections
  const sections = Object.values(content.content);
  if (sections.some(s => !s || s.length < 50)) {
    issues.push('Content sections too short');
  }

  // Check FAQs
  if (content.faqs.length < 3) issues.push('Not enough FAQs');

  // Check price accuracy
  const priceRe = /\$(\d+)/g;
  const allText = JSON.stringify(content);
  const prices = Array.from(allText.matchAll(priceRe), m => parseInt(m[1]));
  const validPrices = [input.minPrice, input.avgPrice, input.maxPrice];
  const invalidPrices = prices.filter(p => !validPrices.includes(p) && p > 50);
  if (invalidPrices.length > 0) {
    issues.push(`Unverified prices: ${invalidPrices.join(', ')}`);
  }

  const score = Math.max(0, 100 - issues.length * 15);

  return {
    valid: issues.length === 0,
    score,
    issues,
  };
}
