import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Mail, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press & Media Kit | Fly2Any',
  description: 'Fly2Any press resources, brand assets, company facts, and media contact information. Download logos, get company stats, and connect with our team.',
  alternates: { canonical: 'https://www.fly2any.com/press' },
};

const companyFacts = [
  { label: 'Founded', value: '2024' },
  { label: 'Headquarters', value: 'United States' },
  { label: 'Industry', value: 'Travel Technology' },
  { label: 'Airlines Compared', value: '500+' },
  { label: 'Hotel Properties', value: '2,000,000+' },
  { label: 'Countries Covered', value: '190+' },
];

const descriptions = {
  short: 'Fly2Any is an AI-powered travel search platform comparing 500+ airlines and 2M+ hotels worldwide.',
  medium: 'Fly2Any is an AI-powered travel search platform that helps travelers find the best flight and hotel deals. Comparing 500+ airlines and 2 million+ hotels across 190+ countries, Fly2Any uses machine learning to predict prices and alert users to the best booking times.',
  long: 'Fly2Any is a next-generation travel search platform powered by artificial intelligence. Founded in 2024, Fly2Any compares prices from over 500 airlines and 2 million hotel properties worldwide. The platform features AI-powered price predictions, flexible date search, multi-city planning, and real-time price alerts. With transparent pricing and no hidden fees, Fly2Any helps millions of travelers find the best deals on flights, hotels, car rentals, tours, and vacation packages across 190+ countries.',
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Press & Media</h1>
          <p className="text-xl opacity-90">Resources for journalists, partners, and media</p>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-16 border-b">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Brand Assets</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6">
              <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center">
                <Image src="/logo.png" alt="Fly2Any Logo" width={200} height={60} />
              </div>
              <h3 className="font-semibold mb-2">Primary Logo</h3>
              <p className="text-sm text-gray-600 mb-4">PNG format, transparent background</p>
              <a href="/logo.png" download className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                <Download className="w-4 h-4" /> Download PNG
              </a>
            </div>
            <div className="border rounded-xl p-6">
              <div className="bg-gray-900 rounded-lg p-8 mb-4 flex items-center justify-center">
                <Image src="/logo.png" alt="Fly2Any Logo White" width={200} height={60} className="brightness-0 invert" />
              </div>
              <h3 className="font-semibold mb-2">Logo on Dark</h3>
              <p className="text-sm text-gray-600 mb-4">For dark backgrounds</p>
              <a href="/logo.png" download className="inline-flex items-center gap-2 text-blue-600 hover:underline">
                <Download className="w-4 h-4" /> Download PNG
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="py-16 border-b bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Company Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {companyFacts.map((fact) => (
              <div key={fact.label} className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-500">{fact.label}</div>
                <div className="text-xl font-bold">{fact.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boilerplate */}
      <section className="py-16 border-b">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Company Descriptions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Short (1 sentence)</h3>
              <p className="text-gray-700">{descriptions.short}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Medium (2 sentences)</h3>
              <p className="text-gray-700">{descriptions.medium}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Full Boilerplate</h3>
              <p className="text-gray-700">{descriptions.long}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
          <p className="text-gray-600 mb-6">For press inquiries, interviews, or partnership opportunities:</p>
          <a href="mailto:support@fly2any.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Mail className="w-5 h-5" /> support@fly2any.com
          </a>
        </div>
      </section>
    </main>
  );
}
