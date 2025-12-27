import type { Metadata } from 'next'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateBreadcrumbSchema } from '@/lib/seo/schema-generators'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com'

export const metadata: Metadata = {
  title: 'Reviews & Ratings | Fly2Any - See What Travelers Say',
  description: 'Read genuine reviews from travelers who saved on flights with Fly2Any. 4.7/5 average rating from 1,200+ verified reviews. See real experiences and savings.',
  openGraph: {
    title: 'Fly2Any Reviews - Trusted by Thousands of Travelers',
    description: 'Read verified reviews from travelers who saved hundreds on flights. 94% recommendation rate.',
    images: ['/og-reviews.png'],
  },
  alternates: {
    canonical: 'https://www.fly2any.com/reviews',
  },
}

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Generate Review aggregate schema
  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Fly2Any Flight Search',
    description: 'AI-powered flight search engine that finds the best deals across all airlines.',
    brand: {
      '@type': 'Brand',
      name: 'Fly2Any',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Sarah M.' },
        datePublished: '2025-12-10',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'Found an incredible deal through Fly2Any. The price was $400 less than other sites. Booking was seamless and customer support was helpful.',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Michael R.' },
        datePublished: '2025-11-28',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        reviewBody: 'The AI search is incredible. It found options I couldn\'t find anywhere else. Price alerts saved me $600 on my trip to Japan!',
      },
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Emily K.' },
        datePublished: '2025-11-15',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '4',
          bestRating: '5',
        },
        reviewBody: 'Used Fly2Any for our family vacation. The trip boards feature helped us plan everything together. Great for family travel planning.',
      },
    ],
  }

  // Organization schema for trust
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fly2Any',
    url: 'https://www.fly2any.com',
    logo: 'https://www.fly2any.com/logo.png',
    sameAs: [
      'https://twitter.com/fly2any',
      'https://facebook.com/fly2any',
      'https://instagram.com/fly2any',
    ],
  }

  // FAQ schema for reviews page
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are Fly2Any reviews verified?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, over 72% of our reviews are from verified bookings. We verify purchases and mark reviews from confirmed travelers with a verified badge.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much do travelers save with Fly2Any?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'On average, travelers save $150-400 per booking compared to booking directly with airlines. Our users have collectively saved over $2.5 million.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Fly2Any\'s average rating?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fly2Any has an average rating of 4.7 out of 5 stars from over 1,200 verified reviews. 94% of users recommend our service.',
        },
      },
    ],
  }

  // Breadcrumbs
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Reviews', url: `${SITE_URL}/reviews` },
  ]

  // Speakable for voice search
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fly2Any Reviews',
    url: `${SITE_URL}/reviews`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.review-summary', '.review-text', '.rating-value'],
    },
  }

  return (
    <>
      <StructuredData schema={[
        reviewSchema,
        organizationSchema,
        faqSchema,
        generateBreadcrumbSchema(breadcrumbs),
        speakableSchema,
      ]} />
      {children}
    </>
  )
}
