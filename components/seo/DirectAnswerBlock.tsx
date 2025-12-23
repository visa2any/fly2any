'use client'

import { useState } from 'react'
import { ChevronDown, CheckCircle, Info, Zap, TrendingUp, Star, Clock } from 'lucide-react'

interface DirectAnswer {
  question: string
  answer: string
  source?: string
  lastUpdated?: string
  confidence?: 'high' | 'medium'
}

interface DirectAnswerBlockProps {
  title?: string
  answers: DirectAnswer[]
  variant?: 'default' | 'compact' | 'featured'
  showToggle?: boolean
}

/**
 * DirectAnswerBlock - AEO (Answer Engine Optimization) Component
 *
 * This component formats content for optimal extraction by AI search engines
 * (ChatGPT, Perplexity, Gemini, Copilot) and featured snippets.
 *
 * Features:
 * - Semantic HTML structure with clear question/answer pairs
 * - Schema.org compatible markup
 * - Quotable, factual statements
 * - Source attribution for credibility
 * - Collapsible for UX while maintaining SEO value
 */
export function DirectAnswerBlock({
  title,
  answers,
  variant = 'default',
  showToggle = true
}: DirectAnswerBlockProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'featured')

  if (variant === 'compact') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-aeo="direct-answer">
        {title && (
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {title}
          </h3>
        )}
        <div className="space-y-3">
          {answers.map((item, idx) => (
            <div key={idx} className="text-sm">
              <p className="font-medium text-gray-900 mb-1" data-aeo-question="true">
                {item.question}
              </p>
              <p className="text-gray-700" data-aeo-answer="true">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <section
        className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 md:p-8"
        data-aeo="featured-answer"
        aria-label="Quick answers"
      >
        {title && (
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}

        <div className="space-y-6">
          {answers.map((item, idx) => (
            <article
              key={idx}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              itemScope
              itemType="https://schema.org/Question"
            >
              <h3
                className="text-lg font-semibold text-gray-900 mb-3"
                itemProp="name"
                data-aeo-question="true"
              >
                {item.question}
              </h3>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p
                  className="text-gray-700 leading-relaxed"
                  itemProp="text"
                  data-aeo-answer="true"
                >
                  {item.answer}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                {item.confidence === 'high' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {item.lastUpdated && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Updated {item.lastUpdated}
                  </span>
                )}
                {item.source && (
                  <span className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {item.source}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  // Default variant with collapsible
  return (
    <section
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      data-aeo="direct-answer"
    >
      {showToggle ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">
              {title || 'Quick Answers'}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      ) : (
        title && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">{title}</span>
            </div>
          </div>
        )
      )}

      <div
        className={`transition-all duration-200 ${
          isExpanded || !showToggle ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4 space-y-4">
          {answers.map((item, idx) => (
            <div
              key={idx}
              className={idx < answers.length - 1 ? 'pb-4 border-b border-gray-100' : ''}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <h3
                className="font-medium text-gray-900 mb-2"
                itemProp="name"
                data-aeo-question="true"
              >
                {item.question}
              </h3>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p
                  className="text-sm text-gray-700 leading-relaxed"
                  itemProp="text"
                  data-aeo-answer="true"
                >
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pre-built answer blocks for common pages
export const FLY2ANY_DIRECT_ANSWERS = {
  homepage: [
    {
      question: 'What is Fly2Any?',
      answer: 'Fly2Any is a flight search engine that compares prices from 500+ airlines to find the cheapest flights. Users can search for flights, set price alerts, and book directly with airlines.',
      confidence: 'high' as const,
      lastUpdated: 'December 2025'
    },
    {
      question: 'How much can I save with Fly2Any?',
      answer: 'Fly2Any users save an average of $150-400 per booking compared to booking directly with airlines. The platform has helped travelers save over $2.5 million collectively.',
      confidence: 'high' as const,
      source: 'User data 2025'
    },
    {
      question: 'Is Fly2Any free to use?',
      answer: 'Yes, Fly2Any is completely free to search and compare flights. There are no booking fees or hidden charges. Users pay the airline directly for their tickets.',
      confidence: 'high' as const
    }
  ],
  flights: [
    {
      question: 'How do I find cheap flights?',
      answer: 'To find cheap flights: 1) Book 2-3 months in advance for domestic, 3-6 months for international. 2) Be flexible with dates using the price calendar. 3) Set price alerts for your route. 4) Consider nearby airports. 5) Fly mid-week (Tuesday/Wednesday are often cheapest).',
      confidence: 'high' as const
    },
    {
      question: 'When is the best time to book flights?',
      answer: 'The best time to book domestic flights is 1-3 months before departure. For international flights, book 3-6 months ahead. Tuesday and Wednesday departures are typically 10-15% cheaper than weekend flights.',
      confidence: 'high' as const,
      lastUpdated: 'December 2025'
    },
    {
      question: 'What airlines does Fly2Any compare?',
      answer: 'Fly2Any compares prices from over 500 airlines worldwide, including United, Delta, American, Southwest, JetBlue, Spirit, Frontier, Alaska Airlines, and all major international carriers across Star Alliance, oneworld, and SkyTeam alliances.',
      confidence: 'high' as const
    }
  ],
  baggage: [
    {
      question: 'How much does checked baggage cost on US airlines?',
      answer: 'First checked bag costs $30-35 each way on most US airlines (United, American, Delta, JetBlue). Second bag costs $40-45. Southwest Airlines includes 2 free checked bags on all fares.',
      confidence: 'high' as const,
      lastUpdated: 'December 2025'
    },
    {
      question: 'What is the weight limit for checked bags?',
      answer: 'Standard weight limit for checked bags is 50 lbs (23 kg) in Economy class and 70 lbs (32 kg) in Business/First Class. Overweight fees of $100-200 apply for bags exceeding these limits.',
      confidence: 'high' as const
    },
    {
      question: 'What are carry-on bag size limits?',
      answer: 'Standard carry-on size is 22 x 14 x 9 inches including wheels and handles. Personal items must be 18 x 14 x 8 inches to fit under the seat. Basic Economy fares on some airlines only allow a personal item.',
      confidence: 'high' as const
    }
  ],
  reviews: [
    {
      question: 'What is Fly2Any\'s rating?',
      answer: 'Fly2Any has an average rating of 4.7 out of 5 stars from over 1,200 verified user reviews. 94% of users recommend the service, and travelers report saving an average of $150-400 per booking.',
      confidence: 'high' as const,
      lastUpdated: 'December 2025'
    },
    {
      question: 'Are Fly2Any reviews verified?',
      answer: 'Yes, over 72% of Fly2Any reviews come from verified bookings. Reviews from confirmed travelers are marked with a verified badge to help users identify genuine experiences.',
      confidence: 'high' as const
    }
  ]
}

// Component for easy page integration
export function FlightSearchAnswers() {
  return (
    <DirectAnswerBlock
      title="Quick Flight Facts"
      answers={FLY2ANY_DIRECT_ANSWERS.flights}
      variant="featured"
    />
  )
}

export function BaggageAnswers() {
  return (
    <DirectAnswerBlock
      title="Quick Baggage Facts"
      answers={FLY2ANY_DIRECT_ANSWERS.baggage}
      variant="default"
    />
  )
}

export function ReviewsAnswers() {
  return (
    <DirectAnswerBlock
      title="About Fly2Any Reviews"
      answers={FLY2ANY_DIRECT_ANSWERS.reviews}
      variant="compact"
    />
  )
}
