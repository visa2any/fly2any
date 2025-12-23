'use client'

import Link from 'next/link'
import {
  Luggage, BookOpen, Star, Plane, HelpCircle,
  MapPin, Calendar, TrendingUp, Shield, Users
} from 'lucide-react'

type LinkCategory = 'flights' | 'hotels' | 'travel' | 'booking' | 'general'

interface RelatedLink {
  href: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
}

const LINK_COLLECTIONS: Record<string, RelatedLink[]> = {
  // For flight search/results pages
  flights: [
    { href: '/baggage-fees', label: 'Baggage Fees Guide', description: 'Compare airline baggage policies', icon: Luggage },
    { href: '/travel-guide', label: 'Travel Tips', description: 'Visa, currency & destination guides', icon: BookOpen },
    { href: '/reviews', label: 'Traveler Reviews', description: '4.7★ from 1,200+ travelers', icon: Star },
    { href: '/faq', label: 'FAQ', description: 'Common booking questions', icon: HelpCircle },
  ],

  // For hotel pages
  hotels: [
    { href: '/travel-guide', label: 'Destination Guide', description: 'Local tips & attractions', icon: MapPin },
    { href: '/reviews', label: 'Traveler Reviews', description: 'Real guest experiences', icon: Star },
    { href: '/faq', label: 'Booking FAQ', description: 'Questions answered', icon: HelpCircle },
  ],

  // For travel guide / informational pages
  travel: [
    { href: '/flights', label: 'Search Flights', description: 'Find the best deals', icon: Plane },
    { href: '/hotels', label: 'Book Hotels', description: 'Compare prices', icon: MapPin },
    { href: '/baggage-fees', label: 'Baggage Fees', description: 'Airline policies guide', icon: Luggage },
    { href: '/reviews', label: 'Our Reviews', description: '4.7★ rating', icon: Star },
  ],

  // For reviews page
  reviews: [
    { href: '/flights', label: 'Search Flights', description: 'Find your perfect flight', icon: Plane },
    { href: '/hotels', label: 'Book Hotels', description: 'Great hotel deals', icon: MapPin },
    { href: '/travel-guide', label: 'Travel Tips', description: 'Expert destination advice', icon: BookOpen },
    { href: '/faq', label: 'FAQ', description: 'Get answers', icon: HelpCircle },
  ],

  // For baggage fees page
  baggage: [
    { href: '/flights', label: 'Search Flights', description: 'Compare all airlines', icon: Plane },
    { href: '/reviews', label: 'Traveler Reviews', description: 'What travelers say', icon: Star },
    { href: '/travel-guide', label: 'Travel Tips', description: 'Packing & trip advice', icon: BookOpen },
    { href: '/faq', label: 'FAQ', description: 'Booking questions', icon: HelpCircle },
  ],

  // For FAQ page
  faq: [
    { href: '/flights', label: 'Search Flights', description: 'Start your search', icon: Plane },
    { href: '/baggage-fees', label: 'Baggage Guide', description: 'Airline policies', icon: Luggage },
    { href: '/reviews', label: 'Customer Reviews', description: 'See experiences', icon: Star },
    { href: '/travel-guide', label: 'Travel Guide', description: 'Destination tips', icon: BookOpen },
  ],

  // For flight route pages
  route: [
    { href: '/baggage-fees', label: 'Baggage Fees', description: 'What to expect', icon: Luggage },
    { href: '/travel-guide', label: 'Travel Tips', description: 'Prepare for your trip', icon: BookOpen },
    { href: '/reviews', label: 'Traveler Reviews', description: 'See what others say', icon: Star },
  ],
}

interface RelatedLinksProps {
  category: keyof typeof LINK_COLLECTIONS
  variant?: 'horizontal' | 'vertical' | 'compact' | 'card'
  title?: string
  className?: string
  maxLinks?: number
}

export function RelatedLinks({
  category,
  variant = 'horizontal',
  title,
  className = '',
  maxLinks
}: RelatedLinksProps) {
  const links = LINK_COLLECTIONS[category] || LINK_COLLECTIONS.flights
  const displayLinks = maxLinks ? links.slice(0, maxLinks) : links

  if (variant === 'compact') {
    return (
      <nav aria-label="Related pages" className={`${className}`}>
        {title && <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>}
        <div className="flex flex-wrap gap-2">
          {displayLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    )
  }

  if (variant === 'vertical') {
    return (
      <nav aria-label="Related pages" className={`${className}`}>
        {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="space-y-3">
          {displayLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <link.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {link.label}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-500">{link.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>
    )
  }

  if (variant === 'card') {
    return (
      <section aria-label="Related resources" className={`${className}`}>
        {title && (
          <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <div className="p-3 bg-blue-50 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                <link.icon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                {link.label}
              </p>
              {link.description && (
                <p className="text-xs text-gray-500 mt-1">{link.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  // Default: horizontal
  return (
    <nav aria-label="Related pages" className={`${className}`}>
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="flex flex-wrap gap-3">
        {displayLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

// Inline text links for use within content
export function InlineLink({
  href,
  children
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium"
    >
      {children}
    </Link>
  )
}

// Contextual CTA for end of content sections
export function RelatedCTA({
  title,
  description,
  href,
  buttonText,
  icon: Icon = Plane
}: {
  title: string
  description: string
  href: string
  buttonText: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {buttonText}
            <Plane className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
