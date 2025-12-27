import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Users, Shield, Award, Plane, Hotel, Car, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Fly2Any | AI-Powered Travel Search Platform',
  description: 'Fly2Any is an AI-powered travel platform comparing 500+ airlines and 2M+ hotels. Founded in 2024, we help travelers find the best deals with transparent pricing.',
  alternates: { canonical: 'https://www.fly2any.com/about' },
};

const stats = [
  { icon: Plane, value: '500+', label: 'Airlines' },
  { icon: Hotel, value: '2M+', label: 'Hotels' },
  { icon: Globe, value: '190+', label: 'Countries' },
  { icon: Users, value: '50K+', label: 'Monthly Users' },
];

const values = [
  { icon: Shield, title: 'Transparency', desc: 'No hidden fees. Price shown is price paid.' },
  { icon: Award, title: 'Best Prices', desc: 'AI-powered search finds the lowest fares.' },
  { icon: Users, title: 'User First', desc: 'Built for travelers, not advertisers.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Fly2Any</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            AI-powered travel search helping millions find the best flight and hotel deals worldwide.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Fly2Any was founded in 2024 with a simple mission: make travel search smarter and more transparent.
            We use AI and machine learning to compare prices across hundreds of airlines and millions of hotels,
            ensuring travelers always get the best deal.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Unlike traditional booking sites, we show you the real price upfront with no hidden fees.
            Our price prediction algorithms help you know when to book, and our alerts notify you when prices drop.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-white p-6 rounded-xl shadow-sm">
                <v.icon className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Your Next Adventure?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/flights" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Search Flights
            </Link>
            <Link href="/hotels" className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
              Find Hotels
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
