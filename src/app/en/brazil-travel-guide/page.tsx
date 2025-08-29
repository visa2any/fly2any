import React from 'react';
import type { Metadata } from "next";
import Link from "next/link";
import { 
  FlightIcon, 
  HotelIcon, 
  LocationIcon,
  CalendarIcon,
  CheckIcon
} from '@/components/Icons';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: "Complete Brazil Travel Guide for Americans | Fly2Any",
  description: "Ultimate Brazil travel guide for Americans. Best destinations, travel tips, visa requirements, when to visit, and insider secrets from Brazil travel specialists.",
  keywords: "brazil travel guide, travel to brazil, brazil destinations, brazil travel tips, brazil for americans, brazil vacation guide",
  openGraph: {
    title: "Complete Brazil Travel Guide for Americans | Fly2Any",
    description: "Ultimate Brazil travel guide for Americans. Best destinations, travel tips, and insider secrets.",
    url: "https://fly2any.com/en/brazil-travel-guide",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://fly2any.com/en/brazil-travel-guide",
    languages: {
      'en-US': 'https://fly2any.com/en/brazil-travel-guide',
      'pt-BR': 'https://fly2any.com/pt/guia-brasil',
      'es-419': 'https://fly2any.com/es/guia-viaje-brasil',
      'x-default': 'https://fly2any.com/en/brazil-travel-guide',
    },
  },
};

export default function BrazilTravelGuide() {
  return (
    <>
      <GlobalMobileStyles />
      <ResponsiveHeader />
      
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)' }}>
        {/* Breadcrumbs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/en' },
                { label: 'Brazil Travel Guide' }
              ]} 
            />
          </div>
        </div>

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
                Complete Brazil Travel Guide
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
              Your Ultimate Guide to
              <span style={{ 
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Brazil Travel
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
              Everything Americans need to know about traveling to Brazil. From visa requirements to hidden gems, 
              <strong style={{ color: 'white' }}> your perfect Brazil adventure starts here.</strong>
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
            </div>
          </div>

          {/* Top Destinations */}
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
              Top Brazil Destinations for Americans
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px'
            }}>
              {[
                {
                  city: "Rio de Janeiro",
                  highlights: "Christ the Redeemer, Copacabana Beach, Sugarloaf Mountain",
                  bestFor: "Iconic landmarks, beaches, nightlife",
                  tip: "Visit during Carnival (Feb/Mar) for the ultimate experience"
                },
                {
                  city: "São Paulo",
                  highlights: "Museums, restaurants, shopping, business hub",
                  bestFor: "Culture, food scene, urban adventures",
                  tip: "Try the famous Brazilian barbecue in Vila Madalena"
                },
                {
                  city: "Salvador, Bahia",
                  highlights: "Historic center, Afro-Brazilian culture, beaches",
                  bestFor: "History, music, authentic Brazilian culture",
                  tip: "Don't miss the Pelourinho historic district"
                },
                {
                  city: "Amazon Rainforest",
                  highlights: "Wildlife, river cruises, indigenous communities",
                  bestFor: "Nature, adventure, eco-tourism",
                  tip: "Best visited April-October (dry season)"
                },
                {
                  city: "Iguazu Falls",
                  highlights: "Spectacular waterfalls, national park",
                  bestFor: "Natural wonders, photography, day trips",
                  tip: "Visit both Brazilian and Argentine sides"
                },
                {
                  city: "Florianópolis",
                  highlights: "Beautiful beaches, surfing, island life",
                  bestFor: "Beach lovers, water sports, relaxation",
                  tip: "Perfect for American expats living in the south"
                }
              ].map((destination, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  className="mobile-section"
                >
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    color: '#facc15', 
                    marginBottom: '12px' 
                  }}>
                    {destination.city}
                  </h3>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    <strong>Highlights:</strong> {destination.highlights}
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    <strong>Best for:</strong> {destination.bestFor}
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    💡 {destination.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* When to Visit */}
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
              marginBottom: '24px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              When to Visit Brazil
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Brazil is a year-round destination, but timing can make your trip even better
            </p>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '24px'
            }}>
              {[
                {
                  season: "Summer (Dec-Mar)",
                  weather: "Hot & humid, rainy season",
                  pros: "Beach season, Carnival, vibrant atmosphere",
                  cons: "Crowds, higher prices, more rain",
                  bestFor: "Rio, beaches, festivals"
                },
                {
                  season: "Autumn (Mar-Jun)",
                  weather: "Mild temperatures, less rain",
                  pros: "Fewer crowds, good weather, lower prices",
                  cons: "Some attractions may have reduced hours",
                  bestFor: "Sightseeing, cities, cultural tours"
                },
                {
                  season: "Winter (Jun-Sep)",
                  weather: "Cooler, dry season",
                  pros: "Best time for Amazon, clear skies",
                  cons: "Cooler beach weather in south",
                  bestFor: "Amazon, Pantanal, southern cities"
                },
                {
                  season: "Spring (Sep-Dec)",
                  weather: "Warming up, occasional rain",
                  pros: "Pleasant temperatures, spring blooms",
                  cons: "Tourism season starting",
                  bestFor: "All regions, ideal weather"
                }
              ].map((season, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  className="mobile-section"
                >
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#facc15', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CalendarIcon style={{ width: '16px', height: '16px' }} />
                    {season.season}
                  </h3>
                  <p style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    <strong>Weather:</strong> {season.weather}
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    <strong>Pros:</strong> {season.pros}
                  </p>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    <strong>Cons:</strong> {season.cons}
                  </p>
                  <p style={{ 
                    color: '#facc15', 
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <strong>Best for:</strong> {season.bestFor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Essential Tips */}
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
              Essential Tips for Americans
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '32px'
            }}>
              {[
                {
                  title: "Visa Requirements",
                  tips: [
                    "Americans need a visa to enter Brazil",
                    "Apply for e-visa online (faster process)",
                    "Passport must be valid for 6+ months",
                    "Keep visa documents with you always"
                  ]
                },
                {
                  title: "Money & Payments",
                  tips: [
                    "Currency: Brazilian Real (BRL)",
                    "Credit cards widely accepted in cities",
                    "Carry cash for small vendors, tips",
                    "Notify your bank before traveling"
                  ]
                },
                {
                  title: "Health & Safety",
                  tips: [
                    "No special vaccinations required for most areas",
                    "Yellow fever vaccine for Amazon region",
                    "Drink bottled water in some areas",
                    "Use insect repellent in tropical regions"
                  ]
                },
                {
                  title: "Language & Culture",
                  tips: [
                    "Portuguese is the official language",
                    "Spanish won't help much (different language!)",
                    "Learn basic phrases: obrigado, por favor",
                    "Brazilians are very friendly and helpful"
                  ]
                },
                {
                  title: "Transportation",
                  tips: [
                    "Domestic flights for long distances",
                    "Uber widely available in major cities",
                    "Rent a car for exploring beaches/countryside", 
                    "Buses are comfortable for medium distances"
                  ]
                },
                {
                  title: "Cultural Tips",
                  tips: [
                    "Brazilians are warm and physical (hugs, kisses)",
                    "Tipping 10% is standard at restaurants",
                    "Beach culture is huge - bring sunscreen!",
                    "Dinner is late (8-10pm), lunch is big meal"
                  ]
                }
              ].map((section, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  className="mobile-section"
                >
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#facc15', 
                    marginBottom: '16px' 
                  }}>
                    {section.title}
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <CheckIcon style={{ width: '14px', height: '14px', color: '#facc15', flexShrink: 0, marginTop: '2px' }} />
                        {tip}
                      </li>
                    ))}
                  </ul>
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
              Ready to Explore Brazil?
            </h2>
            <p style={{ 
              fontSize: '18px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Let our Brazil travel specialists create your perfect itinerary. 
              We handle flights, hotels, tours, and all the details so you can focus on having an amazing time!
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
                Get My Brazil Trip Quote
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
                Speak with Brazil Expert
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      {/* Schema.org JSON-LD for Brazil Travel Guide */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelGuide",
            "@id": "https://fly2any.com/en/brazil-travel-guide",
            "url": "https://fly2any.com/en/brazil-travel-guide",
            "name": "Complete Brazil Travel Guide for Americans",
            "description": "Ultimate Brazil travel guide for Americans. Best destinations, travel tips, visa requirements, when to visit, and insider secrets.",
            "inLanguage": "en-US",
            "about": {
              "@type": "Country",
              "name": "Brazil",
              "@id": "https://www.wikidata.org/wiki/Q155"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "American travelers to Brazil"
            },
            "publisher": {
              "@type": "TravelAgency",
              "@id": "https://fly2any.com",
              "name": "Fly2Any - Brazil Travel Specialists",
              "description": "Expert travel agency specializing in trips to Brazil"
            },
            "datePublished": "2025-07-27",
            "dateModified": "2025-07-27",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Top Brazil Destinations",
              "itemListElement": [
                {
                  "@type": "Place",
                  "name": "Rio de Janeiro",
                  "description": "Iconic landmarks, beaches, nightlife"
                },
                {
                  "@type": "Place", 
                  "name": "São Paulo",
                  "description": "Culture, food scene, urban adventures"
                },
                {
                  "@type": "Place",
                  "name": "Salvador, Bahia", 
                  "description": "History, music, authentic Brazilian culture"
                },
                {
                  "@type": "Place",
                  "name": "Amazon Rainforest",
                  "description": "Nature, adventure, eco-tourism"
                }
              ]
            }
          }),
        }}
      />
    </>
  );
}