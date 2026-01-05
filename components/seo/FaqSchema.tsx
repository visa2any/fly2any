/**
 * FAQ SCHEMA COMPONENT
 * 
 * Generates JSON-LD FAQ schema for featured snippets and rich results
 * 
 * @version 1.0.0
 */

import { StructuredData } from './StructuredData';
import { getFAQSchema } from '@/lib/seo/metadata';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  /**
   * Array of FAQ items
   */
  faqItems: FaqItem[];
  
  /**
   * Optional page URL for context
   */
  pageUrl?: string;
  
  /**
   * Optional page title for context
   */
  pageTitle?: string;
}

/**
 * FaqSchema Component
 * 
 * Generates FAQPage schema markup for Google's featured snippets
 * 
 * Usage:
 * <FaqSchema 
 *   faqItems={[
 *     { question: "What is the cheapest flight from NYC to LA?", answer: "Cheapest flights..." },
 *     { question: "How far in advance should I book?", answer: "For best prices..." }
 *   ]}
 * />
 */
export function FaqSchema({ faqItems, pageUrl, pageTitle }: FaqSchemaProps) {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  const schema = getFAQSchema(faqItems);
  
  // Enhance schema with page context if provided
  if (pageUrl || pageTitle) {
    Object.assign(schema, {
      ...(pageUrl && { url: pageUrl }),
      ...(pageTitle && { name: `${pageTitle} - FAQ` }),
    });
  }

  return <StructuredData schema={schema} />;
}

/**
 * Predefined FAQ sets for common pages
 */
export const FAQ_SETS = {
  HOMEPAGE: [
    {
      question: "How does Fly2Any find the cheapest flights?",
      answer: "Fly2Any searches 500+ airlines and compares prices across multiple travel sites using AI-powered algorithms. We show you the best deals in real-time, including hidden fares and special discounts."
    },
    {
      question: "Is Fly2Any free to use?",
      answer: "Yes, Fly2Any is completely free for users. We don't charge any booking fees, and you can search, compare, and track flights without any cost."
    },
    {
      question: "How accurate are the flight prices shown?",
      answer: "Prices are updated in real-time directly from airlines and travel providers. We verify prices before showing them and provide price history tracking to help you decide when to book."
    },
    {
      question: "Can I book hotels and car rentals through Fly2Any?",
      answer: "Yes, Fly2Any offers comprehensive travel services including hotel bookings, car rentals, vacation packages, and airport transfers, all in one platform."
    },
    {
      question: "How do I set up price alerts?",
      answer: "Simply search for your route, click the 'Track Price' button, and we'll notify you by email or mobile push when prices drop for your selected dates and destinations."
    }
  ],
  FLIGHT_RESULTS: [
    {
      question: "How do I find the best flight deals?",
      answer: "Use our flexible date search, compare nearby airports, and set up price alerts. Booking 2-3 weeks in advance and traveling on weekdays typically yields the best prices."
    },
    {
      question: "What's the difference between basic economy and regular economy?",
      answer: "Basic economy has restrictions like no seat selection, no flight changes, and limited carry-on baggage. Regular economy offers more flexibility and amenities. We clearly label each fare type."
    },
    {
      question: "Are the displayed prices inclusive of all fees?",
      answer: "Yes, we show the total price including taxes and fees. There are no hidden charges, and the price you see is what you'll pay (excluding optional extras like seat selection or baggage)."
    },
    {
      question: "How do I know if a flight has layovers?",
      answer: "Each flight result clearly shows the number of stops, layover duration, and layover airports. We highlight non-stop flights and provide detailed itinerary information."
    },
    {
      question: "Can I book multi-city or round-the-world trips?",
      answer: "Yes, use our multi-city search to build complex itineraries. Fly2Any supports up to 6 segments per trip, with intelligent routing suggestions to save you money."
    }
  ],
  BOOKING: [
    {
      question: "How do I change or cancel my booking?",
      answer: "Go to 'My Trips' in your account, select your booking, and follow the modification options. Change and cancellation policies vary by airline and fare type."
    },
    {
      question: "When will I receive my e-ticket?",
      answer: "E-tickets are typically emailed within 15 minutes of booking. If you don't receive it, check your spam folder or contact our customer support team."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers in select countries."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use bank-level 256-bit SSL encryption and are PCI DSS compliant. We never store your full credit card details on our servers."
    },
    {
      question: "Do you offer travel insurance?",
      answer: "Yes, we partner with leading insurance providers to offer comprehensive travel insurance options during the booking process. Coverage includes trip cancellation, medical emergencies, and baggage protection."
    }
  ],
  BAGGAGE: [
    {
      question: "How much baggage can I bring?",
      answer: "Baggage allowances vary by airline and fare type. We display the exact baggage policy for each flight, including carry-on and checked baggage limits."
    },
    {
      question: "Can I add extra baggage after booking?",
      answer: "Yes, you can add extra baggage through 'My Trips' or by contacting the airline directly. Adding baggage in advance is usually cheaper than at the airport."
    },
    {
      question: "What are the baggage fees for different airlines?",
      answer: "We provide detailed baggage fee comparisons for all major airlines on our baggage fees page. Fees depend on route, fare type, and frequent flyer status."
    },
    {
      question: "What items are prohibited in checked baggage?",
      answer: "Prohibited items include explosives, flammable substances, and certain batteries. Check our baggage guide or TSA website for a complete list of restricted items."
    },
    {
      question: "What happens if my baggage is lost or delayed?",
      answer: "Contact the airline immediately to file a report. Most airlines provide compensation for essential items if baggage is delayed. Travel insurance can provide additional coverage."
    }
  ]
};

export default FaqSchema;
