import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Plane, DollarSign, Info, CheckCircle, XCircle, Luggage, Scale, Ruler, AlertTriangle, HelpCircle, CreditCard, Trophy, Package, Briefcase } from 'lucide-react';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { BaggageAnswers } from '@/components/seo/DirectAnswerBlock';

export const metadata: Metadata = {
  title: 'Baggage Fees & Policies Guide | Fly2Any',
  description: 'Comprehensive guide to airline baggage fees, policies, weight limits, and how to save on checked and carry-on luggage for US travelers.',
  keywords: 'baggage fees, airline baggage policy, checked bag fees, carry-on rules, luggage fees, US airlines',
};

export default function BaggageFeesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/flights/results" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Back to Flight Search
          </Link>
          <h1 className="text-4xl font-bold mb-3">Baggage Fees & Policies</h1>
          <p className="text-xl text-white/90">
            Everything you need to know about airline baggage allowances and fees
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Overview Section */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Info size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Understanding Baggage Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Most US airlines charge fees for checked baggage, especially on Basic Economy fares.
                Fees vary by airline, route, fare class, and frequent flyer status. This guide helps you
                understand what to expect and how to avoid unexpected charges at the airport.
              </p>
              <p className="text-sm text-gray-600 italic">
                <strong>US DOT Requirement:</strong> Airlines must clearly disclose baggage fees before purchase.
                Always check your specific flight's baggage policy before booking.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">First Bag Fee (Average)</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">$30-$35</p>
              <p className="text-xs text-gray-500 mt-1">Each way on major carriers</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={20} className="text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Second Bag Fee (Average)</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">$40-$45</p>
              <p className="text-xs text-gray-500 mt-1">Each way on major carriers</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale size={20} className="text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Weight Limit (Economy)</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">50 lbs</p>
              <p className="text-xs text-gray-500 mt-1">23 kg standard limit</p>
            </div>
          </div>
        </section>

        {/* US Carrier Comparison Table */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Plane size={28} className="text-blue-600" />
            Major US Airlines Baggage Fees Comparison
          </h2>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-700">Airline</th>
                  <th className="p-4 text-sm font-semibold text-gray-700">Basic Economy</th>
                  <th className="p-4 text-sm font-semibold text-gray-700">Standard Economy</th>
                  <th className="p-4 text-sm font-semibold text-gray-700">Carry-On Included</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">United Airlines</td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="text-sm">Personal item only*</p>
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Yes (Standard only)</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">American Airlines</td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="text-sm">Personal item only</p>
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Yes (Standard only)</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">Delta Air Lines</td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="text-sm">Carry-on allowed</p>
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Yes</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">JetBlue Airways</td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="text-sm">Personal item only</p>
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-600">$35 first bag | $45 second bag</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Yes (Standard only)</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">Southwest Airlines</td>
                  <td className="p-4 text-green-700 font-semibold" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="text-base">2 FREE checked bags (up to 50 lbs each)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={18} />
                      <span className="text-sm font-medium">Yes</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {/* United */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">United Airlines</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Basic Economy:</p>
                  <p className="text-gray-700">Personal item only* | $35/45 bags</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Standard:</p>
                  <p className="text-gray-700">$35 first | $45 second | Carry-on ✓</p>
                </div>
              </div>
            </div>

            {/* American */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">American Airlines</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Basic Economy:</p>
                  <p className="text-gray-700">Personal item only | $35/45 bags</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Standard:</p>
                  <p className="text-gray-700">$35 first | $45 second | Carry-on ✓</p>
                </div>
              </div>
            </div>

            {/* Delta */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Delta Air Lines</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Basic Economy:</p>
                  <p className="text-gray-700">Carry-on allowed | $35/45 bags</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Standard:</p>
                  <p className="text-gray-700">$35 first | $45 second | Carry-on ✓</p>
                </div>
              </div>
            </div>

            {/* JetBlue */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">JetBlue Airways</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Basic Economy:</p>
                  <p className="text-gray-700">Personal item only | $35/45 bags</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Standard:</p>
                  <p className="text-gray-700">$35 first | $45 second | Carry-on ✓</p>
                </div>
              </div>
            </div>

            {/* Southwest */}
            <div className="border border-green-300 bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Southwest Airlines</h3>
              <div className="text-sm">
                <p className="text-green-700 font-semibold">2 FREE checked bags + carry-on!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>*Important:</strong> For United and American Basic Economy on domestic flights, carry-on bags are NOT allowed (personal item only).
              International Basic Economy typically includes carry-on. Fees shown are for domestic flights and may vary for international routes.
              All fees are accurate as of October 2025 and subject to change. Always verify with the airline before booking.
            </p>
          </div>
        </section>

        {/* Size and Weight Limits */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Package size={28} className="text-blue-600" />
            Baggage Size & Weight Limits
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Weight Limits */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Scale size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Weight Limits</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Economy Class</span>
                  <span className="font-bold text-blue-600">50 lbs (23 kg)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Premium Economy</span>
                  <span className="font-bold text-blue-600">50 lbs (23 kg)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Business/First Class</span>
                  <span className="font-bold text-blue-600">70 lbs (32 kg)</span>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Overweight Fee:</strong> $100-$200 for bags 51-70 lbs in Economy
                  </p>
                </div>
              </div>
            </div>

            {/* Size Limits */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ruler size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Size Limits</h3>
              </div>
              <div className="space-y-3">
                <div className="py-2 border-b border-gray-100">
                  <p className="text-gray-700 font-medium mb-1">Checked Bags</p>
                  <p className="font-bold text-blue-600">62 linear inches</p>
                  <p className="text-sm text-gray-600">(Length + Width + Height)</p>
                </div>
                <div className="py-2 border-b border-gray-100">
                  <p className="text-gray-700 font-medium mb-1">Carry-On Bags</p>
                  <p className="font-bold text-blue-600">22 x 14 x 9 inches</p>
                  <p className="text-sm text-gray-600">(Includes wheels and handles)</p>
                </div>
                <div className="py-2 border-b border-gray-100">
                  <p className="text-gray-700 font-medium mb-1">Personal Items</p>
                  <p className="font-bold text-blue-600">18 x 14 x 8 inches</p>
                  <p className="text-sm text-gray-600">(Must fit under seat)</p>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Oversize Fee:</strong> $200+ for bags over 62 inches
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Items */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Special Items & Equipment
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Often Free or Reduced Fee:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Medical equipment (wheelchairs, CPAP machines)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Strollers and car seats (when traveling with children)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Military bags (active duty with orders)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Standard Checked Bag Fee Applies:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <DollarSign size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Sports equipment (golf clubs, skis, surfboards)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Musical instruments (if checked; some fit as carry-on)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Bicycles (must be in approved case/box)</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 italic">
              Policies vary by airline. Contact your airline directly for specific special item policies.
            </p>
          </div>
        </section>

        {/* How to Find Your Flight's Policy */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <HelpCircle size={28} className="text-blue-600" />
            How to Find Your Flight's Baggage Policy
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Check Your Booking Confirmation</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your booking confirmation email includes baggage allowance details. Look for sections labeled
                  "Baggage Allowance" or "Included Services."
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Visit the Airline's Website</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Go to the airline's official website and look for "Baggage" or "Travel Information" sections.
                  Most airlines have baggage fee calculators where you can enter your route and fare class.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Use Fly2Any's Flight Search</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  When you search for flights on Fly2Any, we display baggage information alongside fare prices.
                  Expand flight details to see specific baggage policies for each fare option.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                  <Plane size={16} />
                  Search Flights Now
                </Link>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Contact the Airline Directly</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  If you're unsure, call the airline's customer service or use their online chat. Have your
                  booking reference number ready.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Pro Tip:</strong> Baggage policies can differ for codeshare flights. Always check the
              operating airline's policy (the airline actually flying the plane), not just the marketing carrier.
            </p>
          </div>
        </section>

        {/* Tips to Save */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CreditCard size={28} className="text-blue-600" />
            Tips to Save on Baggage Fees
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tip 1 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <Luggage size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Pack Light - Carry-On Only</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    For trips under a week, try to fit everything in a carry-on and personal item.
                    Use packing cubes and wear bulky items on the plane.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Get an Airline Credit Card</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Many airline credit cards include free checked bags as a cardholder benefit.
                    This can pay for the annual fee after just 2-3 trips.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Trophy size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Earn Elite Status</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Frequent flyer elite status typically includes free checked bags. Even basic status
                    levels often include 1-2 free bags.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip 4 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <DollarSign size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Pre-Pay for Bags Online</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Some airlines offer discounts when you pay for checked bags online before arriving
                    at the airport. Can save $5-10 per bag.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip 5 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <Plane size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Consider Southwest for Checked Bags</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    If you need to check bags, Southwest's 2 free checked bags can save $140-160 on a
                    round-trip compared to other carriers.
                  </p>
                </div>
              </div>
            </div>

            {/* Tip 6 */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                  <Package size={20} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Ship Heavy Items</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    For very heavy items or long trips, consider shipping luggage ahead via USPS, UPS,
                    or services like LugLess. Can be cheaper than overweight fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <HelpCircle size={28} className="text-blue-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-5">
            {/* FAQ 1 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Do I pay baggage fees for both outbound and return flights?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes. Baggage fees are charged per direction, not per round-trip. If the fee is $35 for the first
                checked bag, you'll pay $35 on your outbound flight and another $35 on your return flight, for
                a total of $70 round-trip.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                What if my outbound and return flights have different baggage policies?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Each flight segment follows its own airline's baggage policy. For example, if you fly United
                outbound and Delta return, you'll pay United's baggage fees on the way there and Delta's fees
                on the way back. This is common with codeshare or multi-airline itineraries.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Can I add checked bags after booking my flight?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes. You can add checked bags at any time through the airline's website, mobile app, airport
                kiosk, or check-in counter. However, some airlines offer discounts for pre-purchasing bags online
                at least 24 hours before departure, so it's often cheaper to add them in advance.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                What happens with baggage fees on connecting flights?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                If your connecting flights are on the same ticket/reservation, your bags are typically checked
                through to your final destination, and you only pay baggage fees once (at your origin). However,
                if you booked separate tickets, you may need to claim and re-check bags, paying fees again.
                The operating airline's policy applies for the entire journey.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Are baggage fees refundable if I cancel my flight?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                It depends on the airline and fare type. If you cancel a refundable ticket, baggage fees are
                typically refunded. For non-refundable tickets, baggage fees may not be refunded even if you
                get a flight credit. If your flight is cancelled by the airline, baggage fees should be fully refunded.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="border-b border-gray-200 pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                What's the difference between a "personal item" and a "carry-on bag"?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                A <strong>personal item</strong> is smaller (like a purse, laptop bag, or small backpack) and must
                fit under the seat in front of you. A <strong>carry-on bag</strong> is larger (like a rolling suitcase)
                and goes in the overhead bin. Most fares include both, but Basic Economy on some airlines only
                allows a personal item.
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="pb-5">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                Do children get free baggage allowance?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Children with their own paid seat typically have the same baggage allowance as adults. Infants
                (lap children under 2 years old without a seat) may have reduced allowances - often 1 checked bag
                and 1 collapsible stroller free. Strollers and car seats are usually free when traveling with children,
                regardless of checked bag allowances.
              </p>
            </div>
          </div>
        </section>

        {/* Important Disclaimers */}
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Important Disclaimers</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>
                    All baggage fees and policies listed are accurate as of <strong>October 2025</strong> and are
                    subject to change without notice.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>
                    International flights may have different baggage allowances and fees than domestic flights.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>
                    Premium cabin passengers (Business, First Class) typically receive increased baggage allowances.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>
                    Elite status members and airline credit cardholders may receive free checked bags regardless
                    of fare class.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>
                    Always verify baggage policies with your specific airline before your flight. Policies can
                    vary by route, season, and fare type.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-center text-white shadow-lg">
          <Plane size={48} className="mx-auto mb-4 text-white" />
          <h3 className="text-3xl font-bold mb-3">Ready to Search Flights?</h3>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Find flights with transparent pricing and clear baggage information upfront.
            Compare fares across airlines and choose the best option for your trip.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-xl transform hover:scale-105"
            >
              <Plane size={20} />
              Search Flights
            </Link>
            <Link
              href="/flights/results"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              <ArrowLeft size={20} />
              Back to Results
            </Link>
          </div>
        </div>

        {/* AEO Direct Answer Block */}
        <section className="mt-8">
          <BaggageAnswers />
        </section>

        {/* Related Resources */}
        <section className="mt-8">
          <RelatedLinks
            category="baggage"
            variant="card"
            title="More Travel Resources"
          />
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: December 2025</p>
          <p className="mt-2">
            This guide is provided for informational purposes only. Fly2Any is not responsible for changes
            to airline policies or fees.
          </p>
        </div>
      </div>
    </div>
  );
}
