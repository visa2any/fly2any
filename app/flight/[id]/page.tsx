import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Check, Shield, Clock, HeadphonesIcon } from 'lucide-react';

interface Props {
  params: { id: string };
  searchParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    sharedBy?: string;
    ref?: string;
  };
}

// Generate Open Graph metadata for rich previews
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In production, fetch flight data from database/API
  const flightId = params.id;

  // Mock flight data (replace with real API call)
  const flight = {
    route: 'JFK → LAX',
    price: 239,
    currency: 'USD',
    airline: 'JetBlue',
    date: 'Nov 14, 2025',
    savings: '20%',
  };

  const title = `Flight Deal: ${flight.route} - ${flight.currency} ${flight.price}`;
  const description = `Save ${flight.savings} on ${flight.airline} flights! ${flight.route} | ${flight.date} | Book now before prices go up!`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fly2any.com';
  const imageUrl = `${siteUrl}/api/og/flight/${flightId}`; // OG image API endpoint

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}/flight/${flightId}`,
      siteName: 'Fly2Any',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${flight.route} Flight Deal`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@fly2any',
    },
  };
}

export default function SharedFlightPage({ params, searchParams }: Props) {
  const flightId = params.id;

  // In production, fetch flight from API using flightId
  // For now, show a placeholder landing page

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Search</span>
            </Link>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Fly2Any
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shared Deal Banner */}
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="text-4xl">✈️</div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Someone shared an amazing flight deal with you!</h2>
            <p className="text-sm text-gray-600">Book now before prices change</p>
          </div>
        </div>

        {/* Flight Card Placeholder */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛫</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Flight Details...</h3>
            <p className="text-gray-600 mb-6">
              This shared flight link will load the full flight details.<br />
              For the best experience, we recommend opening this link from the share message.
            </p>

            {/* In production, show actual flight card here */}
            <Link
              href={`/?ref=${searchParams.ref || ''}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md"
            >
              <span>Search Flights</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-gray-900">Best Price</div>
            <div className="text-xs text-gray-600">Guaranteed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-gray-900">Secure</div>
            <div className="text-xs text-gray-600">Booking</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-gray-900">Free Cancel</div>
            <div className="text-xs text-gray-600">Within 24h</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <HeadphonesIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-gray-900">24/7</div>
            <div className="text-xs text-gray-600">Support</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-gray-600">
            Shared flights are time-sensitive. Prices and availability can change quickly.
            We recommend booking as soon as possible to secure this deal!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Fly2Any. All rights reserved.</p>
            <p className="mt-2">Finding you the best flight deals, worldwide. ✈️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
