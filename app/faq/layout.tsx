import type { Metadata } from 'next';

const SITE_URL = 'https://www.fly2any.com';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Fly2Any',
  description: 'Find answers to common questions about booking flights, payments, cancellations, and more. Get help with your Fly2Any travel bookings.',
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: 'Fly2Any FAQ - Get Answers to Your Travel Questions',
    description: 'Find answers about flight bookings, payments, cancellations, baggage, and more.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  // FAQ Schema with Speakable for voice search
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'Fly2Any Frequently Asked Questions',
    description: 'Common questions about booking flights, hotels, and travel on Fly2Any.',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I book a flight on Fly2Any?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Search for flights using our search tool, select your preferred option, fill in passenger details, and complete payment. You will receive a confirmation email with your booking details and e-ticket.',
        },
      },
      {
        '@type': 'Question',
        name: 'What payment methods does Fly2Any accept?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel or change my flight booking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, changes and cancellations depend on the airline fare rules. Check your booking confirmation for specific policies. Most bookings can be modified through your account dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I get a refund from Fly2Any?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Refunds depend on the airline fare rules. Refundable tickets are processed within 7-14 business days. Contact our support team for assistance with refund requests.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Fly2Any safe and legitimate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Fly2Any is a legitimate travel booking platform. We use industry-standard security, are PCI DSS compliant, and have served thousands of travelers with verified reviews.',
        },
      },
    ],
  };

  // Speakable Schema for voice search optimization
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fly2Any FAQ',
    url: `${SITE_URL}/faq`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.faq-question', '.faq-answer'],
    },
    mainEntity: {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/faq#faq`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      {children}
    </>
  );
}
