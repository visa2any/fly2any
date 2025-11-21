'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Award,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Target,
  TrendingDown,
  Percent
} from 'lucide-react'

export default function AffiliateHomePage() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (session) {
      router.push('/affiliate/register')
    } else {
      router.push('/auth/signin?callbackUrl=/affiliate/register')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Earn Up To <span className="text-yellow-300">35%</span><br />
              Commission
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join the Fly2Any Affiliate Program and earn industry-leading commissions by promoting the world's best travel booking platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2 group"
              >
                <span>Join Now - It's Free</span>
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
                <div className="text-4xl font-bold text-white mb-2">35%</div>
                <div className="text-white/80 text-sm">Max Commission</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">$50</div>
                <div className="text-white/80 text-sm">Min Payout</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/80 text-sm">Support</div>
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
              Why Partner With Fly2Any?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer one of the most competitive affiliate programs in the travel industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: 'Industry-Leading Commissions',
                description: 'Earn 15-35% of our profit on every booking. The more you refer, the higher your commission rate.',
                color: 'blue',
              },
              {
                icon: <DollarSign className="h-8 w-8" />,
                title: 'Low Payout Threshold',
                description: 'Request payouts at just $50. No need to wait until you hit $100 or $500 like other programs.',
                color: 'green',
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: 'Real-Time Analytics',
                description: 'Track clicks, conversions, and earnings in real-time with our advanced affiliate dashboard.',
                color: 'purple',
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Instant Tracking',
                description: 'See clicks and conversions happen in real-time. No delays, no guessing - complete transparency.',
                color: 'yellow',
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Reliable Payments',
                description: 'Get paid on time, every time via PayPal, Stripe, or bank transfer. No payment delays.',
                color: 'indigo',
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Dedicated Support',
                description: '24/7 affiliate support team ready to help you succeed. We grow when you grow.',
                color: 'pink',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-${benefit.color}-50 to-${benefit.color}-100 border-2 border-${benefit.color}-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 bg-${benefit.color}-500 text-white rounded-lg mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              5-Tier Commission Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your commission grows as you succeed. Complete more bookings and unlock higher tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { tier: 'Starter', icon: '🥉', trips: '0-4', commission: '15%', color: 'from-gray-400 to-gray-500' },
              { tier: 'Bronze', icon: '🥉', trips: '5-14', commission: '20%', color: 'from-orange-400 to-orange-600' },
              { tier: 'Silver', icon: '🥈', trips: '15-29', commission: '25%', color: 'from-gray-300 to-gray-400' },
              { tier: 'Gold', icon: '🥇', trips: '30-49', commission: '30%', color: 'from-yellow-400 to-yellow-600' },
              { tier: 'Platinum', icon: '💎', trips: '50+', commission: '35%', color: 'from-purple-500 to-purple-700' },
            ].map((tier, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${tier.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2`}
              >
                <div className="text-5xl mb-3 text-center">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-center mb-2">{tier.tier}</h3>
                <div className="text-center text-white/90 text-sm mb-4">{tier.trips} trips/month</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{tier.commission}</div>
                  <div className="text-white/90 text-sm mt-1">Commission Rate</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border-2 border-blue-200 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <Percent className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Commission Based on Our Profit</h4>
                <p className="text-gray-600 text-sm">
                  Unlike other programs that pay a flat fee, we share <strong>15-35% of our actual profit</strong> with you.
                  On a $1,000 booking, if our profit is $200, you could earn $30-$70 depending on your tier!
                </p>
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
              Start earning in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up Free',
                description: 'Create your affiliate account in 2 minutes. No fees, no credit card required.',
                icon: <Users className="h-10 w-10" />,
              },
              {
                step: '2',
                title: 'Get Your Link',
                description: 'Receive your unique tracking URL and referral code instantly.',
                icon: <Globe className="h-10 w-10" />,
              },
              {
                step: '3',
                title: 'Promote & Share',
                description: 'Share your link on social media, your website, or with your network.',
                icon: <Sparkles className="h-10 w-10" />,
              },
              {
                step: '4',
                title: 'Earn Commission',
                description: 'Earn commission on every completed booking. Get paid monthly via PayPal or bank transfer.',
                icon: <DollarSign className="h-10 w-10" />,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition-all">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-blue-600 mb-4 mt-4">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You Get As An Affiliate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Unique tracking URL with your referral code',
              'Real-time analytics dashboard',
              'Weekly performance reports via email',
              'Marketing materials and banners',
              'Dedicated affiliate support',
              'Transparent commission tracking',
              'Multiple payout options (PayPal, Stripe, Bank)',
              'Monthly tier progression updates',
              'Access to exclusive promotions',
              'Partnership opportunities for top performers',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-purple-200">
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-800 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of affiliates already earning with Fly2Any
          </p>

          <button
            onClick={handleGetStarted}
            className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3 group"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-white/80 mt-6">
            No credit card required • Free forever • Start earning immediately
          </p>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">
            Have questions? Check out our <a href="#" className="text-blue-600 hover:underline font-medium">Affiliate FAQ</a> or
            contact us at <a href="mailto:affiliates@fly2any.com" className="text-blue-600 hover:underline font-medium">affiliates@fly2any.com</a>
          </p>
        </div>
      </section>
    </div>
  )
}
