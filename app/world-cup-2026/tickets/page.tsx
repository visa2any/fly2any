import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Tickets | Official Ticket Sales & Information',
  description: 'Complete guide to FIFA World Cup 2026 tickets. Find ticket prices, seating categories, sales phases, and how to buy official match tickets.',
  keywords: 'world cup tickets, fifa 2026 tickets, match tickets, world cup ticket prices',
};

export default function TicketsPage() {
  const ticketCategories = [
    {
      id: 'category-1',
      name: 'Category 1',
      icon: '💎',
      color: 'from-purple-600 to-indigo-700',
      description: 'Premium seats with the best views',
      priceRange: '$800-2,500',
      features: [
        'Best seats in the stadium',
        'Close to the pitch',
        'VIP entrance access',
        'Premium food & beverage',
        'Commemorative gift',
      ],
      availability: 'Limited',
    },
    {
      id: 'category-2',
      name: 'Category 2',
      icon: '⭐',
      color: 'from-blue-600 to-blue-700',
      description: 'Great views at mid-range prices',
      priceRange: '$400-1,200',
      features: [
        'Excellent viewing angle',
        'Mid-tier seating',
        'Access to concessions',
        'Souvenir included',
        'Comfortable seating',
      ],
      availability: 'Moderate',
    },
    {
      id: 'category-3',
      name: 'Category 3',
      icon: '🎫',
      color: 'from-green-600 to-green-700',
      description: 'Standard seating with good views',
      priceRange: '$200-600',
      features: [
        'Good stadium views',
        'Standard seating',
        'General concessions',
        'Official program',
        'Great atmosphere',
      ],
      availability: 'Good',
    },
    {
      id: 'category-4',
      name: 'Category 4',
      icon: '🎟️',
      color: 'from-orange-600 to-orange-700',
      description: 'Budget-friendly options',
      priceRange: '$80-300',
      features: [
        'Upper tier seating',
        'Full stadium view',
        'Basic amenities',
        'Fan zone atmosphere',
        'Affordable pricing',
      ],
      availability: 'High',
    },
  ];

  const matchTypes = [
    {
      stage: 'Group Stage',
      icon: '🏟️',
      matches: '48 matches',
      dates: 'June 11-27, 2026',
      price: '$80-800',
      description: '16 groups compete in the opening phase',
    },
    {
      stage: 'Round of 32',
      icon: '⚡',
      matches: '16 matches',
      dates: 'June 29 - July 3',
      price: '$150-1,200',
      description: 'First knockout stage begins',
    },
    {
      stage: 'Round of 16',
      icon: '🔥',
      matches: '8 matches',
      dates: 'July 4-6',
      price: '$200-1,500',
      description: 'Top teams battle for quarter-final spots',
    },
    {
      stage: 'Quarter-Finals',
      icon: '💪',
      matches: '4 matches',
      dates: 'July 9-10',
      price: '$300-2,000',
      description: 'Elite 8 teams compete',
    },
    {
      stage: 'Semi-Finals',
      icon: '🌟',
      matches: '2 matches',
      dates: 'July 14-15',
      price: '$500-2,500',
      description: 'Final 4 teams fight for the championship',
    },
    {
      stage: 'Final',
      icon: '🏆',
      matches: '1 match',
      dates: 'July 19, 2026',
      price: '$800-3,000',
      description: 'The ultimate showdown at MetLife Stadium',
    },
  ];

  const salesPhases = [
    {
      phase: 'Phase 1',
      name: 'Random Selection Draw',
      status: 'Coming 2025',
      icon: '🎲',
      description: 'Apply for tickets in a lottery system',
      details: [
        'Open to all fans worldwide',
        'Apply for multiple matches',
        'Results announced within 2 weeks',
        'Payment due after selection',
      ],
    },
    {
      phase: 'Phase 2',
      name: 'First-Come First-Served',
      status: 'Coming 2025',
      icon: '⚡',
      description: 'Remaining tickets sold on demand',
      details: [
        'Online purchase available',
        'Limited inventory',
        'Instant confirmation',
        'Higher demand matches',
      ],
    },
    {
      phase: 'Phase 3',
      name: 'Last-Minute Sales',
      status: 'Coming 2026',
      icon: '🔥',
      description: 'Final ticket release before matches',
      details: [
        'Released 2-4 weeks before matches',
        'Very limited availability',
        'Mobile app required',
        'Digital tickets only',
      ],
    },
  ];

  const faqItems = [
    {
      question: 'When do tickets go on sale?',
      answer: 'Official FIFA ticket sales are expected to begin in early 2025, following the group stage draw. Stay updated by subscribing to our alerts.',
    },
    {
      question: 'How much do tickets cost?',
      answer: 'Ticket prices range from $80 for group stage Category 4 seats to over $3,000 for Category 1 Final tickets. Prices vary by match stage and seating category.',
    },
    {
      question: 'Can I resell my tickets?',
      answer: 'Only through the official FIFA ticket resale platform. Unauthorized resale may result in ticket cancellation. All sales must go through FIFA channels.',
    },
    {
      question: 'Are tickets digital or physical?',
      answer: 'All World Cup 2026 tickets will be digital and accessible through the official FIFA mobile app. Physical tickets will not be issued.',
    },
    {
      question: 'What ID do I need at the stadium?',
      answer: 'You must present a valid government-issued photo ID matching the name on your ticket. Passport recommended for international visitors.',
    },
    {
      question: 'Can I buy tickets for multiple matches?',
      answer: 'Yes! You can apply for tickets to multiple matches during each sales phase. However, there are limits on how many tickets per match you can purchase.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 overflow-hidden">
        {/* Animated ticket pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='30' width='60' height='20' rx='5' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6">
              <span className="text-yellow-400 text-xl">🎫</span>
              <span className="text-sm font-semibold">Official FIFA Tickets</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
                WORLD CUP TICKETS
              </span>
            </h1>

            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Complete Guide to Buying Official FIFA World Cup 2026 Tickets
            </p>

            <div className="inline-flex items-center gap-4 bg-red-600 backdrop-blur-sm border border-red-400 rounded-full px-8 py-4">
              <span className="text-3xl">⚠️</span>
              <div className="text-left">
                <div className="text-sm text-white/90">Official Sales Status</div>
                <div className="text-xl font-bold">Coming in 2025</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Ticket Categories
            </h2>
            <p className="text-xl text-gray-600">
              Choose your seating category based on budget and preference
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ticketCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-br ${category.color} p-8 text-white text-center`}>
                  <div className="text-6xl mb-3">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{category.description}</p>
                  <div className="text-3xl font-black">{category.priceRange}</div>
                  <div className="text-xs opacity-80 mt-2">Price range per match</div>
                </div>

                <div className="bg-white p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Availability</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        category.availability === 'Limited' ? 'bg-red-100 text-red-700' :
                        category.availability === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {category.availability}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {category.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled
                    className="w-full py-3 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed"
                  >
                    Sales Open 2025
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Match Types & Prices */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Tickets by Tournament Stage
            </h2>
            <p className="text-xl text-gray-600">
              Pricing increases as the tournament progresses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchTypes.map((match, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="text-6xl mb-4 text-center">{match.icon}</div>
                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">{match.stage}</h3>
                <div className="text-center text-gray-600 mb-4">
                  <div className="font-semibold">{match.matches}</div>
                  <div className="text-sm">{match.dates}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Price Range</div>
                    <div className="text-3xl font-black text-blue-600">{match.price}</div>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-600">{match.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sales Phases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Ticket Sales Phases
            </h2>
            <p className="text-xl text-gray-600">
              Multiple opportunities to secure your tickets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {salesPhases.map((phase, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-semibold text-gray-600">{phase.phase}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{phase.name}</h3>
                  </div>
                  <div className="text-5xl">{phase.icon}</div>
                </div>

                <div className="inline-block px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-full text-yellow-700 font-bold text-sm mb-4">
                  {phase.status}
                </div>

                <p className="text-gray-700 mb-6">{phase.description}</p>

                <ul className="space-y-3">
                  {phase.details.map((detail, detailIdx) => (
                    <li key={detailIdx} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-blue-500">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              ⚠️ Important Information
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-red-200">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Beware of Scams</h3>
              <p className="text-gray-700 mb-4">
                Only buy tickets through official FIFA channels. Unofficial sources may sell fake tickets resulting in denied entry.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Third-party resale sites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Social media marketplaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Unauthorized ticket brokers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-green-200">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Official Channels Only</h3>
              <p className="text-gray-700 mb-4">
                Purchase tickets exclusively through FIFA's official ticket portal and authorized partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>FIFA.com/tickets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Official FIFA mobile app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>FIFA-authorized hospitality partners</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-start gap-3">
                  <span className="text-blue-600">Q:</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-gray-700 ml-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🔔</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get Notified When Tickets Go On Sale
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Be the first to know when official FIFA ticket sales open
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 font-semibold focus:outline-none focus:ring-4 focus:ring-yellow-400"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg">
              Notify Me
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Instant email alerts
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Exclusive presale access
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              Price drop notifications
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
