'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Gift,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Share2,
  Zap,
  Award,
  Clock,
  Shield,
  Target,
  Network,
  Coins,
  Plane,
  Heart,
  Star
} from 'lucide-react'

export default function ReferAndEarnPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (session) {
      router.push('/account/referrals')
    } else {
      router.push('/auth/signin?callbackUrl=/account/referrals')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Gift className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Refer Friends,<br />
              <span className="text-yellow-300">Earn Rewards</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Share Fly2Any with friends and family. Earn points on their bookings forever with our 3-level rewards program!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2 group"
              >
                <span>{session ? 'View My Rewards' : 'Start Earning - Free'}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                How It Works
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">50</div>
                <div className="text-white/80 text-sm">Points per $100</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">3</div>
                <div className="text-white/80 text-sm">Levels Deep</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-white/80 text-sm">Lifetime Earnings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 3-step process to start earning rewards on every booking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <Share2 className="h-8 w-8" />,
                title: 'Share Your Link',
                description: 'Get your unique referral link and share it with friends via social media, email, or messaging.',
                color: 'blue',
              },
              {
                step: '2',
                icon: <Users className="h-8 w-8" />,
                title: 'Friends Sign Up',
                description: 'When they sign up using your link, they join your referral network automatically.',
                color: 'green',
              },
              {
                step: '3',
                icon: <Sparkles className="h-8 w-8" />,
                title: 'Earn Points Forever',
                description: 'Earn points every time anyone in your 3-level network books a trip. Points never expire!',
                color: 'purple',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <div className={`inline-flex p-3 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white rounded-lg mb-4 mt-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Level Network Explanation */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              3-Level Rewards Network
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Earn points not just from your direct referrals, but from their referrals too!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Level 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-green-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                BEST
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Level 1</h3>
                <p className="text-gray-600 mb-4">People You Refer</p>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="text-4xl font-bold text-green-600">50</div>
                  <div className="text-sm text-gray-600">Points per $100</div>
                </div>
                <p className="text-sm text-gray-500">
                  Your direct referrals. Earn the highest rate when they book!
                </p>
              </div>
            </div>

            {/* Level 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Network className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Level 2</h3>
                <p className="text-gray-600 mb-4">Friends of Friends</p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-4xl font-bold text-blue-600">20</div>
                  <div className="text-sm text-gray-600">Points per $100</div>
                </div>
                <p className="text-sm text-gray-500">
                  People referred by your Level 1. Still earning great rewards!
                </p>
              </div>
            </div>

            {/* Level 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Level 3</h3>
                <p className="text-gray-600 mb-4">Extended Network</p>
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="text-4xl font-bold text-purple-600">10</div>
                  <div className="text-sm text-gray-600">Points per $100</div>
                </div>
                <p className="text-sm text-gray-500">
                  People referred by Level 2. Passive income keeps growing!
                </p>
              </div>
            </div>
          </div>

          {/* Network Example */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Real Example</h3>
              <p className="text-gray-600">See how your network can grow your earnings</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Level 1: 5 Friends</div>
                    <div className="text-sm text-gray-600">Each books $1,000/year</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">2,500 pts</div>
                  <div className="text-xs text-gray-500">50 pts × $50</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    15
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Level 2: 15 People</div>
                    <div className="text-sm text-gray-600">Each books $800/year</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">2,400 pts</div>
                  <div className="text-xs text-gray-500">20 pts × $120</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    40
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Level 3: 40 People</div>
                    <div className="text-sm text-gray-600">Each books $600/year</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">2,400 pts</div>
                  <div className="text-xs text-gray-500">10 pts × $240</div>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 text-lg">Total Annual Earnings</div>
                  <div className="text-3xl font-bold text-primary-600">7,300 Points</div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-right">
                  Worth ~$146 in travel discounts per year!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Join Fly2Any Rewards?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The smartest way to earn rewards while sharing amazing travel deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Coins className="h-8 w-8" />,
                title: 'Points Never Expire',
                description: 'Your points stay in your account forever. No rushing to use them before expiration.',
                color: 'yellow',
              },
              {
                icon: <Plane className="h-8 w-8" />,
                title: 'Easy Redemption',
                description: 'Use points for instant discounts on flights, hotels, and vacation packages. $1 = 50 points.',
                color: 'blue',
              },
              {
                icon: <Network className="h-8 w-8" />,
                title: '3-Level Network',
                description: 'Earn from 3 levels deep. Your network keeps growing, your earnings keep increasing.',
                color: 'purple',
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Secure & Transparent',
                description: 'Track every point earned in real-time. Complete transparency with detailed analytics.',
                color: 'green',
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Instant Tracking',
                description: 'See your network grow and points accumulate in real-time. No delays or mysteries.',
                color: 'orange',
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: 'Help Friends Save',
                description: 'Share great travel deals and help your friends save money while you earn rewards.',
                color: 'pink',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 text-white rounded-lg mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Redeem Points */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Redeem Your Points
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Use your points for instant discounts on your next trip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Points Value</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-900">1,000 Points</span>
                  <span className="text-green-600 font-bold">= $20 Off</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-900">2,500 Points</span>
                  <span className="text-green-600 font-bold">= $50 Off</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-900">5,000 Points</span>
                  <span className="text-green-600 font-bold">= $100 Off</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-semibold text-gray-900">10,000 Points</span>
                  <span className="text-green-600 font-bold">= $200 Off</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Where to Use</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Plane className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Flight Bookings</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Hotel Stays</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Vacation Packages</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-900">Car Rentals & More</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Gift className="h-12 w-12 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who are earning rewards by sharing Fly2Any with friends and family
          </p>

          <button
            onClick={handleGetStarted}
            className="px-10 py-5 bg-white text-primary-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3 group"
          >
            <span>{session ? 'Go to My Dashboard' : 'Sign Up Free Now'}</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>No fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Instant setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Points never expire</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How do I get my referral link?',
                a: 'Once you sign up and verify your email, you\'ll get a unique referral link in your dashboard. Share it anywhere - social media, email, messaging apps.',
              },
              {
                q: 'When do I earn points?',
                a: 'You earn points when anyone in your 3-level network completes a trip (not just books). This protects against cancellations and ensures genuine earnings.',
              },
              {
                q: 'Do points expire?',
                a: 'No! Your points stay in your account forever. Use them whenever you want - no rush, no expiration dates.',
              },
              {
                q: 'How do I redeem points?',
                a: 'During checkout, simply apply your points for an instant discount. 50 points = $1 off. Minimum redemption is 500 points ($10).',
              },
              {
                q: 'Is there a limit to how much I can earn?',
                a: 'No limits! The more your network grows, the more you earn. Some users have built networks of 100+ people earning thousands of points monthly.',
              },
              {
                q: 'What if someone I referred books a trip?',
                a: 'You\'ll see it instantly in your dashboard! Points are added after the trip completes successfully (usually 1-3 days after return).',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
