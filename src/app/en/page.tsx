import type { Metadata } from "next";
import Link from "next/link";
import { 
  FlightIcon, 
  HotelIcon, 
  CarIcon, 
  TourIcon, 
  InsuranceIcon,
  CheckIcon,
  StarIcon,
  LocationIcon
} from '@/components/Icons';
import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';

export const metadata: Metadata = {
  title: "Fly2Any - Brazil Travel Specialists | Flights to Brazil from USA",
  description: "Expert travel agency specializing in trips to Brazil for Americans. Best flight deals, hotels, car rentals, tours and travel insurance. Free quote in 2 hours!",
  keywords: "flights to brazil, brazil travel, travel to brazil, flights to sao paulo, flights to rio de janeiro, brazil vacation, brazil travel agency",
  openGraph: {
    title: "Fly2Any - Brazil Travel Specialists | Expert Trips to Brazil",
    description: "Expert travel agency specializing in trips to Brazil for Americans. Best deals and personalized service.",
    url: "https://fly2any.com/en",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://fly2any.com/en",
    languages: {
      'en-US': 'https://fly2any.com/en',
      'pt-BR': 'https://fly2any.com/pt',
      'es-419': 'https://fly2any.com/es',
      'x-default': 'https://fly2any.com',
    },
  },
};

export default function EnglishHomePage() {
  return (
    <>
      <GlobalMobileStyles />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        
        {/* Header */}
        <header style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }} className="mobile-container">
            <Logo size="md" variant="logo-only" headingLevel="div" />
            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link href="/en" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Home
              </Link>
              <Link href="/en/about" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                About
              </Link>
              <Link href="/en/contact" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Contact
              </Link>
              <Link href="/pt" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇧🇷 PT
              </Link>
              <Link href="/es" style={{
                color: '#facc15',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                🇪🇸 ES
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 32px' }} className="mobile-container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '16px', 
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }} className="mobile-section">
              <LocationIcon style={{ width: '24px', height: '24px', color: '#facc15' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                Brazil Travel Specialists since 2014
              </span>
            </div>
            <h1 style={{ 
              fontSize: '56px', 
              fontWeight: '800', 
              color: 'white', 
              margin: '0 0 24px 0',
              fontFamily: 'Poppins, sans-serif',
              lineHeight: '1.1',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Your Gateway to
              <span style={{ 
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Beautiful Brazil
              </span>
            </h1>
            <p style={{ 
              fontSize: '20px', 
              color: 'rgb(219, 234, 254)', 
              marginBottom: '48px',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 48px auto'
            }}>
              Expert travel agency specializing in trips to Brazil for Americans. 
              <strong style={{ color: 'white' }}> Get personalized quotes in 2 hours!</strong>
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link 
                href="/cotacao/voos"
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="mobile-section"
              >
                <FlightIcon style={{ width: '20px', height: '20px' }} />
                Get Flight Quote
              </Link>
              
              <Link 
                href="/en/contact"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                className="mobile-section"
              >
                Talk to Expert
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} style={{ width: '16px', height: '16px', color: '#facc15' }} />
                  ))}
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  4.9/5 (1,247 reviews)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  10+ Years Experience
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon style={{ width: '16px', height: '16px', color: '#facc15' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                  15,000+ Happy Travelers
                </span>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '64px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: '48px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Complete Brazil Travel Services
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px'
            }}>
              {[
                {
                  icon: FlightIcon,
                  title: "Flights to Brazil",
                  description: "Best deals on flights from all US cities to Brazil. Direct flights and connections available.",
                  link: "/cotacao/voos"
                },
                {
                  icon: HotelIcon,
                  title: "Hotels in Brazil",
                  description: "Handpicked hotels from budget to luxury across Brazil. Rio, São Paulo, Salvador and more.",
                  link: "/cotacao/hoteis"
                },
                {
                  icon: CarIcon,
                  title: "Car Rentals",
                  description: "Reliable car rental services throughout Brazil. Perfect for exploring at your own pace.",
                  link: "/cotacao/carros"
                },
                {
                  icon: TourIcon,
                  title: "Tours & Experiences",
                  description: "Exclusive tours and cultural experiences. Discover the real Brazil with local guides.",
                  link: "/cotacao/passeios"
                },
                {
                  icon: InsuranceIcon,
                  title: "Travel Insurance",
                  description: "Comprehensive coverage for your Brazil trip. Medical, baggage and trip cancellation.",
                  link: "/cotacao/seguro"
                }
              ].map((service, index) => (
                <Link
                  key={index}
                  href={service.link}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    display: 'block'
                  }}
                  className="mobile-section"
                >
                  <service.icon style={{ width: '48px', height: '48px', color: '#facc15', marginBottom: '16px' }} />
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: 'white', 
                    marginBottom: '12px' 
                  }}>
                    {service.title}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '64px'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: '48px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Why Americans Choose Fly2Any
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '32px'
            }}>
              {[
                {
                  title: "Brazil Expertise",
                  description: "10+ years specializing exclusively in Brazil travel. We know the best routes, seasons, and hidden gems."
                },
                {
                  title: "US-Based Support",
                  description: "English-speaking team based in Miami. Available 7 days a week to help with your trip."
                },
                {
                  title: "Best Price Guarantee",
                  description: "We shop multiple airlines and suppliers to find you the best deals. Beat any competitor's price."
                },
                {
                  title: "Visa Assistance",
                  description: "Complete help with Brazil visa requirements and documentation for US citizens."
                },
                {
                  title: "24/7 Trip Support",
                  description: "Emergency assistance during your trip. We're here when you need us most."
                },
                {
                  title: "Cultural Insights",
                  description: "Get insider tips on Brazilian culture, customs, and must-visit destinations."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <CheckIcon style={{ width: '24px', height: '24px', color: '#1f2937' }} />
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white', 
                    marginBottom: '12px' 
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            background: 'rgba(250, 204, 21, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            textAlign: 'center'
          }} className="mobile-section">
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Ready to Discover Brazil?
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '32px',
              lineHeight: '1.5',
              maxWidth: '600px',
              margin: '0 auto 32px auto'
            }}>
              Join thousands of Americans who trusted us with their Brazil adventure. 
              Get your personalized quote in just 2 hours!
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                href="/cotacao/voos"
                style={{
                  background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                  color: '#1f2937',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                className="mobile-section"
              >
                Start Planning My Trip
              </Link>
              
              <Link 
                href="/en/contact"
                style={{
                  background: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s'
                }}
                className="mobile-section"
              >
                Call +1 (305) 555-0123
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Schema.org JSON-LD for English page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://fly2any.com/en",
            "url": "https://fly2any.com/en",
            "name": "Fly2Any - Brazil Travel Specialists for Americans",
            "description": "Expert travel agency specializing in trips to Brazil for Americans. Best flight deals, hotels, and travel services.",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://fly2any.com",
              "url": "https://fly2any.com",
              "name": "Fly2Any"
            },
            "about": {
              "@type": "TravelAgency",
              "name": "Fly2Any",
              "description": "Brazil travel specialists serving American travelers"
            },
            "mainEntity": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Brazil Travel Specialists",
              "description": "Expert travel agency specializing in trips to Brazil for Americans",
              "serviceArea": {
                "@type": "Country",
                "name": "Brazil"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "American travelers to Brazil"
              }
            }
          }),
        }}
      />
    </>
  );
}